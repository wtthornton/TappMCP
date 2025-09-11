/**
 * Robust Error Handling and Reliability System
 *
 * Implements circuit breakers, retry mechanisms, graceful degradation,
 * and comprehensive error reporting for the intelligence system.
 */

export enum ErrorType {
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  PARSING = 'parsing',
  VALIDATION = 'validation',
  ANALYSIS = 'analysis',
  GENERATION = 'generation',
  CONTEXT7 = 'context7',
  CACHE = 'cache',
  UNKNOWN = 'unknown',
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface ErrorDetails {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  component: string;
  timestamp: number;
  stackTrace?: string;
  context?: any;
  retryable: boolean;
  fallbackUsed?: boolean;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // milliseconds
  maxDelay: number;
  exponentialBase: number;
  jitter: boolean;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number; // milliseconds
  monitoringPeriod: number; // milliseconds
}

export interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailureTime: number;
  nextAttemptTime: number;
}

/**
 * Circuit Breaker pattern implementation
 */
export class CircuitBreaker {
  private config: CircuitBreakerConfig;
  private state: CircuitBreakerState;
  private component: string;

  constructor(component: string, config: Partial<CircuitBreakerConfig> = {}) {
    this.component = component;
    this.config = {
      failureThreshold: config.failureThreshold || 5,
      recoveryTimeout: config.recoveryTimeout || 60000, // 1 minute
      monitoringPeriod: config.monitoringPeriod || 10000, // 10 seconds
    };

    this.state = {
      state: 'CLOSED',
      failureCount: 0,
      lastFailureTime: 0,
      nextAttemptTime: 0,
    };
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // Check circuit breaker state
    if (this.state.state === 'OPEN') {
      if (Date.now() < this.state.nextAttemptTime) {
        throw new Error(`Circuit breaker OPEN for ${this.component}`);
      } else {
        this.state.state = 'HALF_OPEN';
      }
    }

    try {
      const result = await operation();

      // Success - reset failure count
      if (this.state.state === 'HALF_OPEN') {
        this.state.state = 'CLOSED';
      }
      this.state.failureCount = 0;

      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure(): void {
    this.state.failureCount++;
    this.state.lastFailureTime = Date.now();

    if (this.state.failureCount >= this.config.failureThreshold) {
      this.state.state = 'OPEN';
      this.state.nextAttemptTime = Date.now() + this.config.recoveryTimeout;
      console.warn(
        `[CircuitBreaker] ${this.component} circuit opened after ${this.state.failureCount} failures`
      );
    }
  }

  getState(): CircuitBreakerState {
    return { ...this.state };
  }

  reset(): void {
    this.state = {
      state: 'CLOSED',
      failureCount: 0,
      lastFailureTime: 0,
      nextAttemptTime: 0,
    };
    console.log(`[CircuitBreaker] ${this.component} circuit manually reset`);
  }
}

/**
 * Retry mechanism with exponential backoff and jitter
 */
export class RetryHandler {
  private config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = {
      maxAttempts: config.maxAttempts || 3,
      baseDelay: config.baseDelay || 1000,
      maxDelay: config.maxDelay || 30000,
      exponentialBase: config.exponentialBase || 2,
      jitter: config.jitter ?? true,
    };
  }

  async execute<T>(
    operation: () => Promise<T>,
    isRetryable: (error: any) => boolean = () => true
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === this.config.maxAttempts || !isRetryable(error)) {
          throw error;
        }

        const delay = this.calculateDelay(attempt);
        console.warn(
          `[RetryHandler] Attempt ${attempt} failed, retrying in ${delay}ms:`,
          error instanceof Error ? error.message : String(error)
        );
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  private calculateDelay(attempt: number): number {
    let delay = this.config.baseDelay * Math.pow(this.config.exponentialBase, attempt - 1);
    delay = Math.min(delay, this.config.maxDelay);

    if (this.config.jitter) {
      // Add ±25% jitter
      const jitterRange = delay * 0.25;
      delay += (Math.random() - 0.5) * 2 * jitterRange;
    }

    return Math.max(delay, 0);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Comprehensive error handling and reliability system
 */
export class ErrorHandler {
  private circuitBreakers: Map<string, CircuitBreaker>;
  private retryHandler: RetryHandler;
  private errorLog: ErrorDetails[];
  private maxLogSize: number;

  constructor() {
    this.circuitBreakers = new Map();
    this.retryHandler = new RetryHandler();
    this.errorLog = [];
    this.maxLogSize = 1000;
  }

  /**
   * Execute operation with comprehensive error handling
   */
  async executeWithProtection<T>(
    component: string,
    operation: () => Promise<T>,
    fallback?: () => Promise<T> | T,
    retryConfig?: Partial<RetryConfig>
  ): Promise<T> {
    const circuitBreaker = this.getOrCreateCircuitBreaker(component);
    const retryHandler = retryConfig ? new RetryHandler(retryConfig) : this.retryHandler;

    try {
      return await circuitBreaker.execute(async () => {
        return await retryHandler.execute(operation, error => this.isRetryable(error));
      });
    } catch (error) {
      const errorDetails = this.createErrorDetails(error, component);
      this.logError(errorDetails);

      if (fallback) {
        console.warn(
          `[ErrorHandler] Using fallback for ${component}:`,
          error instanceof Error ? error.message : String(error)
        );
        errorDetails.fallbackUsed = true;

        try {
          return typeof fallback === 'function' ? await fallback() : fallback;
        } catch (fallbackError) {
          this.logError(this.createErrorDetails(fallbackError, `${component}-fallback`));
          throw fallbackError;
        }
      }

      throw error;
    }
  }

  /**
   * Handle Context7 operations with specific retry logic
   */
  async executeContext7Operation<T>(
    operation: () => Promise<T>,
    fallback?: () => Promise<T> | T
  ): Promise<T> {
    return this.executeWithProtection('context7', operation, fallback, {
      maxAttempts: 2, // Context7 failures should fail fast
      baseDelay: 500,
      maxDelay: 2000,
    });
  }

  /**
   * Handle analysis operations with longer retry tolerance
   */
  async executeAnalysisOperation<T>(
    component: string,
    operation: () => Promise<T>,
    fallback?: () => Promise<T> | T
  ): Promise<T> {
    return this.executeWithProtection(`analysis-${component}`, operation, fallback, {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 5000,
    });
  }

  /**
   * Handle code generation with conservative retry
   */
  async executeGenerationOperation<T>(
    operation: () => Promise<T>,
    fallback?: () => Promise<T> | T
  ): Promise<T> {
    return this.executeWithProtection('generation', operation, fallback, {
      maxAttempts: 2, // Generation should be fast and reliable
      baseDelay: 2000,
      maxDelay: 8000,
    });
  }

  /**
   * Create standardized error details
   */
  private createErrorDetails(error: any, component: string): ErrorDetails {
    const errorType = this.categorizeError(error);
    const severity = this.determineSeverity(errorType, component);

    return {
      type: errorType,
      severity,
      message: error.message || 'Unknown error',
      component,
      timestamp: Date.now(),
      stackTrace: error.stack,
      context: error.context || {},
      retryable: this.isRetryable(error),
    };
  }

  /**
   * Categorize error by type
   */
  private categorizeError(error: any): ErrorType {
    const message = error.message?.toLowerCase() || '';

    if (message.includes('network') || message.includes('fetch') || error.code === 'ECONNREFUSED') {
      return ErrorType.NETWORK;
    }
    if (message.includes('timeout') || error.code === 'ETIMEDOUT') {
      return ErrorType.TIMEOUT;
    }
    if (message.includes('parse') || message.includes('json') || message.includes('syntax')) {
      return ErrorType.PARSING;
    }
    if (
      message.includes('validation') ||
      message.includes('schema') ||
      message.includes('invalid')
    ) {
      return ErrorType.VALIDATION;
    }
    if (message.includes('context7') || message.includes('mcp')) {
      return ErrorType.CONTEXT7;
    }
    if (message.includes('cache')) {
      return ErrorType.CACHE;
    }
    if (message.includes('analysis') || message.includes('analyze')) {
      return ErrorType.ANALYSIS;
    }
    if (message.includes('generation') || message.includes('generate')) {
      return ErrorType.GENERATION;
    }

    return ErrorType.UNKNOWN;
  }

  /**
   * Determine error severity
   */
  private determineSeverity(errorType: ErrorType, component: string): ErrorSeverity {
    // Critical errors that break core functionality
    if (component.includes('generation') || component === 'unified-engine') {
      return ErrorSeverity.CRITICAL;
    }

    // High severity for analysis failures
    if (errorType === ErrorType.ANALYSIS || component.includes('analysis')) {
      return ErrorSeverity.HIGH;
    }

    // Medium severity for context and validation
    if (errorType === ErrorType.CONTEXT7 || errorType === ErrorType.VALIDATION) {
      return ErrorSeverity.MEDIUM;
    }

    // Low severity for cache and parsing
    if (errorType === ErrorType.CACHE || errorType === ErrorType.PARSING) {
      return ErrorSeverity.LOW;
    }

    return ErrorSeverity.MEDIUM;
  }

  /**
   * Determine if error is retryable
   */
  private isRetryable(error: any): boolean {
    const nonRetryablePatterns = [
      'validation',
      'schema',
      'parse',
      'syntax',
      'unauthorized',
      'forbidden',
      'not found',
      'invalid',
    ];

    const message = error.message?.toLowerCase() || '';
    return !nonRetryablePatterns.some(pattern => message.includes(pattern));
  }

  /**
   * Get or create circuit breaker for component
   */
  private getOrCreateCircuitBreaker(component: string): CircuitBreaker {
    if (!this.circuitBreakers.has(component)) {
      this.circuitBreakers.set(component, new CircuitBreaker(component));
    }
    return this.circuitBreakers.get(component)!;
  }

  /**
   * Log error with rotation
   */
  private logError(errorDetails: ErrorDetails): void {
    this.errorLog.push(errorDetails);

    // Rotate log if too large
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize * 0.8); // Keep 80% of max
    }

    // Log to console based on severity
    const logMessage = `[${errorDetails.severity.toUpperCase()}] ${errorDetails.component}: ${errorDetails.message}`;

    switch (errorDetails.severity) {
      case ErrorSeverity.CRITICAL:
        console.error(logMessage);
        break;
      case ErrorSeverity.HIGH:
        console.error(logMessage);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn(logMessage);
        break;
      case ErrorSeverity.LOW:
        console.info(logMessage);
        break;
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    errorsByType: Record<ErrorType, number>;
    errorsBySeverity: Record<ErrorSeverity, number>;
    errorsByComponent: Record<string, number>;
    circuitBreakerStates: Record<string, CircuitBreakerState>;
    recentErrors: ErrorDetails[];
  } {
    const errorsByType = {} as Record<ErrorType, number>;
    const errorsBySeverity = {} as Record<ErrorSeverity, number>;
    const errorsByComponent = {} as Record<string, number>;

    // Initialize counters
    Object.values(ErrorType).forEach(type => (errorsByType[type] = 0));
    Object.values(ErrorSeverity).forEach(severity => (errorsBySeverity[severity] = 0));

    // Count errors
    this.errorLog.forEach(error => {
      errorsByType[error.type]++;
      errorsBySeverity[error.severity]++;
      errorsByComponent[error.component] = (errorsByComponent[error.component] || 0) + 1;
    });

    // Get circuit breaker states
    const circuitBreakerStates = {} as Record<string, CircuitBreakerState>;
    this.circuitBreakers.forEach((breaker, component) => {
      circuitBreakerStates[component] = breaker.getState();
    });

    return {
      totalErrors: this.errorLog.length,
      errorsByType,
      errorsBySeverity,
      errorsByComponent,
      circuitBreakerStates,
      recentErrors: this.errorLog.slice(-10), // Last 10 errors
    };
  }

  /**
   * Reset circuit breaker for component
   */
  resetCircuitBreaker(component: string): void {
    const breaker = this.circuitBreakers.get(component);
    if (breaker) {
      breaker.reset();
    }
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
    console.log('[ErrorHandler] Error log cleared');
  }
}

// Global error handler instance
export const globalErrorHandler = new ErrorHandler();
