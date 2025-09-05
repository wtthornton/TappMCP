import { MCPResource } from '../framework/mcp-resource.js';
import { z } from 'zod';

/**
 * API Resource Schema
 */
export const ApiResourceSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  url: z.string().url('Valid URL is required'),
  headers: z.record(z.string()).optional(),
  body: z.any().optional(),
  params: z.record(z.string()).optional(),
  timeout: z.number().positive().default(30000),
  retries: z.number().nonnegative().default(3),
  retryDelay: z.number().positive().default(1000),
  rateLimit: z
    .object({
      requests: z.number().positive(),
      window: z.number().positive(), // in milliseconds
    })
    .optional(),
  auth: z
    .object({
      type: z.enum(['bearer', 'basic', 'api-key', 'oauth2']),
      token: z.string().optional(),
      username: z.string().optional(),
      password: z.string().optional(),
      apiKey: z.string().optional(),
      apiKeyHeader: z.string().default('X-API-Key'),
    })
    .optional(),
});

export type ApiResourceConfig = z.infer<typeof ApiResourceSchema>;

/**
 * API Resource Response Schema
 */
export const ApiResourceResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  status: z.number().optional(),
  statusText: z.string().optional(),
  headers: z.record(z.string()).optional(),
  error: z.string().optional(),
  executionTime: z.number().optional(),
  retryCount: z.number().optional(),
  rateLimitInfo: z
    .object({
      remaining: z.number(),
      resetTime: z.number(),
      limit: z.number(),
    })
    .optional(),
});

export type ApiResourceResponse = z.infer<typeof ApiResourceResponseSchema>;

/**
 * Rate Limiter Configuration
 */
interface RateLimiter {
  requests: number;
  window: number;
  requestsUsed: number;
  windowStart: number;
}

/**
 * MCP API Resource
 * Provides HTTP API operations with rate limiting, retries, and authentication
 */
export class ApiResource extends MCPResource {
  private rateLimiters: Map<string, RateLimiter> = new Map();
  private requestQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;
  private readonly schema: z.ZodSchema<ApiResourceConfig>;

  constructor() {
    const mcpConfig: MCPResourceConfig = {
      name: 'api-resource',
      type: 'api',
      version: '1.0.0',
      description: 'HTTP API operations with rate limiting, retries, and authentication',
      connectionConfig: {},
      maxConnections: 100,
    };

    super(mcpConfig);
    this.schema = ApiResourceSchema;
  }

  /**
   * Initialize the API resource
   */
  async initialize(): Promise<void> {
    this.logger.info('API resource initialized');
  }

  /**
   * Execute API request
   */
  async execute(config: ApiResourceConfig): Promise<ApiResourceResponse> {
    const startTime = Date.now();

    try {
      // Validate configuration
      const validatedConfig = this.schema.parse(config);

      // Check rate limiting
      if (validatedConfig.rateLimit) {
        await this.checkRateLimit(validatedConfig.url, validatedConfig.rateLimit);
      }

      // Execute request with retries
      const result = await this.executeWithRetries(validatedConfig, startTime);

      // Log performance metrics
      const executionTime = Date.now() - startTime;
      this.logger.info('API request completed', {
        method: validatedConfig.method,
        url: validatedConfig.url,
        status: result.status,
        executionTime: `${executionTime}ms`,
        retryCount: result.retryCount || 0,
      });

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logger.error('API request failed', {
        error: error.message,
        method: config.method,
        url: config.url,
        executionTime: `${executionTime}ms`,
      });

      return {
        success: false,
        error: error.message,
        executionTime,
      };
    }
  }

  /**
   * Execute request with retry logic
   */
  private async executeWithRetries(
    config: ApiResourceConfig,
    startTime: number
  ): Promise<ApiResourceResponse> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= config.retries; attempt++) {
      try {
        const result = await this.makeRequest(config);
        result.executionTime = Date.now() - startTime;
        result.retryCount = attempt;
        return result;
      } catch (error) {
        lastError = error as Error;

        if (attempt < config.retries) {
          this.logger.warn('API request failed, retrying', {
            attempt: attempt + 1,
            maxRetries: config.retries,
            error: error.message,
            delay: config.retryDelay,
          });

          await this.delay(config.retryDelay * Math.pow(2, attempt)); // Exponential backoff
        }
      }
    }

    throw lastError || new Error('Request failed after all retries');
  }

  /**
   * Make HTTP request
   */
  private async makeRequest(config: ApiResourceConfig): Promise<ApiResourceResponse> {
    // Build URL with query parameters
    const url = this.buildUrl(config.url, config.params);

    // Prepare headers
    const headers = this.prepareHeaders(config);

    // Prepare request options
    const requestOptions: RequestInit = {
      method: config.method,
      headers,
      signal: AbortSignal.timeout(config.timeout),
    };

    // Add body for non-GET requests
    if (config.body && config.method !== 'GET') {
      requestOptions.body =
        typeof config.body === 'string' ? config.body : JSON.stringify(config.body);
    }

    // Call fetch (will be mocked in tests)
    const response = await fetch(url, requestOptions);

    // Parse response headers
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // Extract rate limit info
    const rateLimitInfo = this.extractRateLimitInfo(responseHeaders);

    // Parse response body
    let data: any;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('Invalid JSON');
      }
    } else {
      data = await response.text();
    }

    // Check for HTTP errors
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return {
      success: true,
      data,
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      rateLimitInfo,
    };
  }

  /**
   * Extract rate limit information from response headers
   */
  private extractRateLimitInfo(headers: Record<string, string>): any {
    const remaining = parseInt(headers['x-ratelimit-remaining'] || '100');
    const resetTime = parseInt(headers['x-ratelimit-reset'] || String(Date.now() + 3600000));
    const limit = parseInt(headers['x-ratelimit-limit'] || '100');

    return {
      remaining,
      resetTime,
      limit,
    };
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(baseUrl: string, params?: Record<string, string>): string {
    if (!params || Object.keys(params).length === 0) {
      return baseUrl;
    }

    const url = new URL(baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    return url.toString();
  }

  /**
   * Prepare request headers
   */
  private prepareHeaders(config: ApiResourceConfig): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'MCP-API-Resource/1.0.0',
      ...config.headers,
    };

    // Add authentication headers
    if (config.auth) {
      switch (config.auth.type) {
        case 'bearer':
          if (config.auth.token) {
            headers['Authorization'] = `Bearer ${config.auth.token}`;
          }
          break;
        case 'basic':
          if (config.auth.username && config.auth.password) {
            const credentials = Buffer.from(
              `${config.auth.username}:${config.auth.password}`
            ).toString('base64');
            headers['Authorization'] = `Basic ${credentials}`;
          }
          break;
        case 'api-key':
          if (config.auth.apiKey) {
            headers[config.auth.apiKeyHeader] = config.auth.apiKey;
          }
          break;
        case 'oauth2':
          if (config.auth.token) {
            headers['Authorization'] = `Bearer ${config.auth.token}`;
          }
          break;
      }
    }

    return headers;
  }

  /**
   * Check rate limiting
   */
  private async checkRateLimit(
    url: string,
    rateLimit: { requests: number; window: number }
  ): Promise<void> {
    const key = this.getRateLimitKey(url);
    const now = Date.now();

    let limiter = this.rateLimiters.get(key);

    if (!limiter) {
      limiter = {
        requests: rateLimit.requests,
        window: rateLimit.window,
        requestsUsed: 0,
        windowStart: now,
      };
      this.rateLimiters.set(key, limiter);
    }

    // Reset window if expired
    if (now - limiter.windowStart >= limiter.window) {
      limiter.requestsUsed = 0;
      limiter.windowStart = now;
    }

    // Check if rate limit exceeded
    if (limiter.requestsUsed >= limiter.requests) {
      const waitTime = limiter.window - (now - limiter.windowStart);
      this.logger.warn('Rate limit exceeded, waiting', {
        url,
        waitTime: `${waitTime}ms`,
        requestsUsed: limiter.requestsUsed,
        limit: limiter.requests,
      });

      await this.delay(waitTime);
      return this.checkRateLimit(url, rateLimit);
    }

    // Increment request count
    limiter.requestsUsed++;
  }

  /**
   * Get rate limit key for URL
   */
  private getRateLimitKey(url: string): string {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.host}`;
    } catch {
      return url;
    }
  }

  /**
   * Delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      // Test with a simple request
      const testConfig: ApiResourceConfig = {
        method: 'GET',
        url: 'https://httpbin.org/status/200',
        timeout: 5000,
      };

      const result = await this.execute(testConfig);

      return {
        status: result.success ? 'healthy' : 'unhealthy',
        details: {
          lastTest: new Date().toISOString(),
          testResult: result,
          rateLimiters: this.rateLimiters.size,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error.message,
          rateLimiters: this.rateLimiters.size,
        },
      };
    }
  }

  /**
   * Create a new connection (not applicable for API resource)
   */
  protected async createConnection(): Promise<any> {
    return { id: 'api-connection', type: 'api' };
  }

  /**
   * Close a connection (not applicable for API resource)
   */
  protected async closeConnection(connection: any): Promise<void> {
    // API resource doesn't need to close connections
  }

  /**
   * Get connection ID
   */
  protected getConnectionId(connection: any): string {
    return connection?.id || 'api-connection';
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.rateLimiters.clear();
    this.requestQueue = [];
    this.isProcessingQueue = false;

    this.logger.info('API resource cleanup completed');
  }
}
