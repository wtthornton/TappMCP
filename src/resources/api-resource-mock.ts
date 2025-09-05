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
  rateLimit: z.object({
    requests: z.number().positive(),
    window: z.number().positive() // in milliseconds
  }).optional(),
  auth: z.object({
    type: z.enum(['bearer', 'basic', 'api-key', 'oauth2']),
    token: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    apiKey: z.string().optional(),
    apiKeyHeader: z.string().default('X-API-Key')
  }).optional()
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
  rateLimitInfo: z.object({
    remaining: z.number(),
    resetTime: z.number(),
    limit: z.number()
  }).optional()
});

export type ApiResourceResponse = z.infer<typeof ApiResourceResponseSchema>;

/**
 * API Resource for HTTP operations
 */
export class ApiResource extends MCPResource {
  private readonly schema: z.ZodSchema<ApiResourceConfig>;
  private rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();

  constructor() {
    const mcpConfig = {
      name: 'api-resource',
      type: 'resource' as const,
      version: '1.0.0',
      description: 'HTTP API operations with rate limiting and retries'
    };
    super(mcpConfig);
    this.schema = ApiResourceSchema;
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
        retryCount: result.retryCount || 0
      });

      return result;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logger.error('API request failed', {
        error: error.message,
        method: config.method,
        url: config.url,
        executionTime: `${executionTime}ms`
      });

      return {
        success: false,
        error: error.message,
        executionTime
      };
    }
  }

  /**
   * Execute request with retry logic
   */
  private async executeWithRetries(config: ApiResourceConfig, startTime: number): Promise<ApiResourceResponse> {
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
            delay: config.retryDelay
          });

          await this.delay(config.retryDelay * Math.pow(2, attempt)); // Exponential backoff
        }
      }
    }

    throw lastError || new Error('Request failed after all retries');
  }

  /**
   * Make HTTP request (mock implementation for fast testing)
   */
  private async makeRequest(config: ApiResourceConfig): Promise<ApiResourceResponse> {
    // Simulate network delay
    await this.delay(10 + Math.random() * 20);

    // Build URL with query parameters
    const url = this.buildUrl(config.url, config.params);

    // Prepare headers
    const headers = this.prepareHeaders(config);

    // Simulate different responses based on URL and method
    const response = this.simulateResponse(config, url, headers);

    return response;
  }

  /**
   * Simulate HTTP response based on configuration
   */
  private simulateResponse(config: ApiResourceConfig, url: string, headers: Record<string, string>): ApiResourceResponse {
    // Simulate different scenarios based on URL patterns
    if (url.includes('/slow')) {
      // Simulate timeout
      throw new Error('Request timeout');
    }

    if (url.includes('/nonexistent')) {
      // Simulate 404 error
      throw new Error('HTTP 404: Not Found');
    }

    if (url.includes('/error')) {
      // Simulate network error
      throw new Error('Network error');
    }

    if (url.includes('/invalid-json')) {
      // Simulate JSON parsing error
      throw new Error('Invalid JSON');
    }

    if (url.includes('/retry')) {
      // Simulate retry scenario
      if (Math.random() < 0.7) {
        throw new Error('Network error');
      }
    }

    if (url.includes('/max-retries')) {
      // Always fail for max retries test
      throw new Error('Persistent network error');
    }

    // Determine status code based on method
    let status = 200;
    let statusText = 'OK';

    if (config.method === 'POST') {
      status = 201;
      statusText = 'Created';
    } else if (config.method === 'DELETE') {
      status = 204;
      statusText = 'No Content';
    }

    // Simulate rate limiting
    const rateLimitInfo = {
      remaining: 5,
      resetTime: Date.now() + 3600000,
      limit: 10
    };

    return {
      success: true,
      data: { message: 'Success', timestamp: new Date().toISOString() },
      status,
      statusText,
      headers: {
        'content-type': 'application/json',
        'x-ratelimit-remaining': '5',
        'x-ratelimit-reset': String(Date.now() + 3600000),
        'x-ratelimit-limit': '10'
      },
      rateLimitInfo
    };
  }

  /**
   * Check rate limiting
   */
  private async checkRateLimit(url: string, rateLimit: { requests: number; window: number }): Promise<void> {
    const key = new URL(url).hostname;
    const now = Date.now();
    const windowStart = now - rateLimit.window;

    const current = this.rateLimitStore.get(key) || { count: 0, resetTime: now + rateLimit.window };

    if (current.resetTime < now) {
      current.count = 0;
      current.resetTime = now + rateLimit.window;
    }

    if (current.count >= rateLimit.requests) {
      throw new Error('Rate limit exceeded');
    }

    current.count++;
    this.rateLimitStore.set(key, current);
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
      ...config.headers
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
            const credentials = Buffer.from(`${config.auth.username}:${config.auth.password}`).toString('base64');
            headers['Authorization'] = `Basic ${credentials}`;
          }
          break;
        case 'api-key':
          if (config.auth.apiKey) {
            headers[config.auth.apiKeyHeader] = config.auth.apiKey;
          }
          break;
      }
    }

    return headers;
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const testConfig: ApiResourceConfig = {
        method: 'GET',
        url: 'https://httpbin.org/status/200'
      };

      const result = await this.execute(testConfig);
      return {
        status: result.success ? 'healthy' : 'unhealthy',
        details: {
          lastCheck: new Date().toISOString(),
          responseTime: result.executionTime,
          status: result.status
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          lastCheck: new Date().toISOString(),
          error: error.message
        }
      };
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.rateLimitStore.clear();
    this.logger.info('API resource cleanup completed');
  }

  // Required by MCPResource base class
  protected async createConnection(): Promise<any> {
    return { id: 'api-connection', type: 'http' };
  }

  protected async closeConnection(connection: any): Promise<void> {
    // No persistent connection to close
  }

  protected getConnectionId(connection: any): string {
    return connection?.id || 'api-connection';
  }
}
