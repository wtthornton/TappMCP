#!/usr/bin/env node

/**
 * Context7 HTTP Client
 *
 * Handles HTTP communication with Context7 API including:
 * - Rate limiting
 * - Retry logic with exponential backoff
 * - Error handling
 * - Request/response logging
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

export interface RateLimiter {
  requestsPerMinute: number;
  burstLimit: number;
  currentRequests: number;
  lastResetTime: number;
}

export interface RetryPolicy {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export interface Context7HttpClientConfig {
  baseURL: string;
  apiKey?: string | undefined;
  timeout: number;
  rateLimit: RateLimiter;
  retryPolicy: RetryPolicy;
}

export interface Context7ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  requestId: string;
}

export class Context7HttpClient {
  private client: AxiosInstance;
  private config: Context7HttpClientConfig;
  private rateLimiter: RateLimiter;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;

  constructor(config: Context7HttpClientConfig) {
    this.config = config;
    this.rateLimiter = { ...config.rateLimit };

    // Create axios instance
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TappMCP-Context7Client/1.0.0',
        ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
      },
    });

    // Add request interceptor for rate limiting
    this.client.interceptors.request.use(
      async (config: any) => {
        await this.handleRateLimit();
        return config;
      },
      (error: any) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response: any) => response,
      async (error: any) => {
        return this.handleRetry(error);
      }
    );
  }

  /**
   * Make a GET request to Context7 API
   */
  async get<T = any>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<Context7ApiResponse<T>> {
    const requestId = this.generateRequestId();

    try {
      const response = await this.client.get(endpoint, { params });
      return this.formatResponse<T>(response, requestId);
    } catch (error) {
      return this.formatErrorResponse<T>(error as AxiosError, requestId);
    }
  }

  /**
   * Make a POST request to Context7 API
   */
  async post<T = any>(endpoint: string, data?: any): Promise<Context7ApiResponse<T>> {
    const requestId = this.generateRequestId();

    try {
      const response = await this.client.post(endpoint, data);
      return this.formatResponse<T>(response, requestId);
    } catch (error) {
      return this.formatErrorResponse<T>(error as AxiosError, requestId);
    }
  }

  /**
   * Make a generic request to Context7 API
   */
  async request<T = any>(config: AxiosRequestConfig): Promise<Context7ApiResponse<T>> {
    const requestId = this.generateRequestId();

    try {
      const response = await this.client.request(config);
      return this.formatResponse<T>(response, requestId);
    } catch (error) {
      return this.formatErrorResponse<T>(error as AxiosError, requestId);
    }
  }

  /**
   * Handle rate limiting
   */
  private async handleRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceReset = now - this.rateLimiter.lastResetTime;

    // Reset counter if a minute has passed
    if (timeSinceReset >= 60000) {
      this.rateLimiter.currentRequests = 0;
      this.rateLimiter.lastResetTime = now;
    }

    // Check if we've exceeded the rate limit
    if (this.rateLimiter.currentRequests >= this.rateLimiter.requestsPerMinute) {
      const waitTime = 60000 - timeSinceReset;
      console.log(`Rate limit exceeded. Waiting ${waitTime}ms before next request.`);
      await this.sleep(waitTime);
      return this.handleRateLimit();
    }

    // Check burst limit
    if (this.rateLimiter.currentRequests >= this.rateLimiter.burstLimit) {
      const waitTime = 1000; // Wait 1 second for burst limit
      console.log(`Burst limit exceeded. Waiting ${waitTime}ms before next request.`);
      await this.sleep(waitTime);
    }

    this.rateLimiter.currentRequests++;
  }

  /**
   * Handle retry logic with exponential backoff
   */
  private async handleRetry(error: AxiosError): Promise<any> {
    const config = error.config as any;

    if (!config) {
      return Promise.reject(error);
    }

    if (!config.retryCount) {
      config.retryCount = 0;
    }

    // Don't retry if we've exceeded max retries
    if (config.retryCount >= this.config.retryPolicy.maxRetries) {
      return Promise.reject(error);
    }

    // Only retry on specific error types
    if (!this.shouldRetry(error)) {
      return Promise.reject(error);
    }

    config.retryCount++;

    // Calculate delay with exponential backoff
    const delay = Math.min(
      this.config.retryPolicy.baseDelay *
        Math.pow(this.config.retryPolicy.backoffMultiplier, config.retryCount - 1),
      this.config.retryPolicy.maxDelay
    );

    console.log(
      `Retrying request in ${delay}ms (attempt ${config.retryCount}/${this.config.retryPolicy.maxRetries})`
    );

    await this.sleep(delay);

    return this.client.request(config);
  }

  /**
   * Determine if an error should trigger a retry
   */
  private shouldRetry(error: AxiosError): boolean {
    // Retry on network errors
    if (!error.response) {
      return true;
    }

    // Retry on specific HTTP status codes
    const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
    return retryableStatusCodes.includes(error.response.status);
  }

  /**
   * Format successful response
   */
  private formatResponse<T>(response: AxiosResponse, requestId: string): Context7ApiResponse<T> {
    return {
      success: true,
      data: response.data,
      timestamp: new Date().toISOString(),
      requestId,
    };
  }

  /**
   * Format error response
   */
  private formatErrorResponse<T>(error: AxiosError, requestId: string): Context7ApiResponse<T> {
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString(),
      requestId,
    };
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current rate limit status
   */
  getRateLimitStatus(): { current: number; limit: number; resetTime: number } {
    return {
      current: this.rateLimiter.currentRequests,
      limit: this.rateLimiter.requestsPerMinute,
      resetTime: this.rateLimiter.lastResetTime + 60000,
    };
  }

  /**
   * Check if the client is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Test with a simple search query
      const response = await this.client.get('/search', {
        params: {
          query: 'test',
        },
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      console.error('Context7 health check failed:', error);
      return false;
    }
  }
}
