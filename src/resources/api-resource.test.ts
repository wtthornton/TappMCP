import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ApiResource, ApiResourceConfig, ApiResourceResponse } from './api-resource.js';

// Mock fetch for API requests
global.fetch = vi.fn();

describe('ApiResource', () => {
  let apiResource: ApiResource;

  beforeEach(async () => {
    apiResource = new ApiResource();

    // Initialize the API resource
    await apiResource.initialize();

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      await expect(apiResource.initialize()).resolves.not.toThrow();
    });
  });

  describe('GET Requests', () => {
    it('should execute GET request successfully', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({ message: 'Success', data: [] })
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const config: ApiResourceConfig = {
        method: 'GET',
        url: 'https://api.example.com/users',
        headers: { 'Authorization': 'Bearer token123' }
      };

      const result = await apiResource.execute(config);

      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
      expect(result.statusText).toBe('OK');
      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer token123',
            'Content-Type': 'application/json',
            'User-Agent': 'MCP-API-Resource/1.0.0'
          })
        })
      );
    });

    it('should handle GET request with query parameters', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Map(),
        json: () => Promise.resolve({ data: [] })
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const config: ApiResourceConfig = {
        method: 'GET',
        url: 'https://api.example.com/users',
        params: { page: '1', limit: '10', status: 'active' }
      };

      await apiResource.execute(config);

      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/users?page=1&limit=10&status=active',
        expect.any(Object)
      );
    });
  });

  describe('POST Requests', () => {
    it('should execute POST request with JSON body', async () => {
      const mockResponse = {
        ok: true,
        status: 201,
        statusText: 'Created',
        headers: new Map(),
        json: () => Promise.resolve({ id: 1, message: 'Created' })
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const config: ApiResourceConfig = {
        method: 'POST',
        url: 'https://api.example.com/users',
        body: { name: 'John Doe', email: 'john@example.com' },
        headers: { 'Content-Type': 'application/json' }
      };

      const result = await apiResource.execute(config);

      expect(result.success).toBe(true);
      expect(result.status).toBe(201);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'John Doe', email: 'john@example.com' })
        })
      );
    });

    it('should execute POST request with string body', async () => {
      const mockResponse = {
        ok: true,
        status: 201,
        statusText: 'Created',
        headers: new Map(),
        json: () => Promise.resolve({ id: 1 })
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const config: ApiResourceConfig = {
        method: 'POST',
        url: 'https://api.example.com/data',
        body: 'raw string data',
        headers: { 'Content-Type': 'text/plain' }
      };

      const result = await apiResource.execute(config);

      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/data',
        expect.objectContaining({
          method: 'POST',
          body: 'raw string data'
        })
      );
    });
  });

  describe('PUT and PATCH Requests', () => {
    it('should execute PUT request successfully', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Map(),
        json: () => Promise.resolve({ message: 'Updated' })
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const config: ApiResourceConfig = {
        method: 'PUT',
        url: 'https://api.example.com/users/1',
        body: { name: 'Updated Name' }
      };

      const result = await apiResource.execute(config);

      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ name: 'Updated Name' })
        })
      );
    });

    it('should execute PATCH request successfully', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Map(),
        json: () => Promise.resolve({ message: 'Patched' })
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const config: ApiResourceConfig = {
        method: 'PATCH',
        url: 'https://api.example.com/users/1',
        body: { status: 'inactive' }
      };

      const result = await apiResource.execute(config);

      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status: 'inactive' })
        })
      );
    });
  });

  describe('DELETE Requests', () => {
    it('should execute DELETE request successfully', async () => {
      const mockResponse = {
        ok: true,
        status: 204,
        statusText: 'No Content',
        headers: new Map(),
        json: () => Promise.resolve({})
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const config: ApiResourceConfig = {
        method: 'DELETE',
        url: 'https://api.example.com/users/1'
      };

      const result = await apiResource.execute(config);

      expect(result.success).toBe(true);
      expect(result.status).toBe(204);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });
  });

  describe('Authentication', () => {
    it('should handle Bearer token authentication', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Map(),
        json: () => Promise.resolve({ data: [] })
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const config: ApiResourceConfig = {
        method: 'GET',
        url: 'https://api.example.com/protected',
        auth: {
          type: 'bearer',
          token: 'abc123'
        }
      };

      await apiResource.execute(config);

      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/protected',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer abc123'
          })
        })
      );
    });

    it('should handle Basic authentication', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Map(),
        json: () => Promise.resolve({ data: [] })
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const config: ApiResourceConfig = {
        method: 'GET',
        url: 'https://api.example.com/protected',
        auth: {
          type: 'basic',
          username: 'user',
          password: 'pass'
        }
      };

      await apiResource.execute(config);

      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/protected',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Basic dXNlcjpwYXNz' // base64 encoded 'user:pass'
          })
        })
      );
    });

    it('should handle API key authentication', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Map(),
        json: () => Promise.resolve({ data: [] })
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const config: ApiResourceConfig = {
        method: 'GET',
        url: 'https://api.example.com/protected',
        auth: {
          type: 'api-key',
          apiKey: 'secret-key',
          apiKeyHeader: 'X-API-Key'
        }
      };

      await apiResource.execute(config);

      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/protected',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-API-Key': 'secret-key'
          })
        })
      );
    });
  });

  describe('Retry Logic', () => {
    it('should retry failed requests', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Map(),
        json: () => Promise.resolve({ data: [] })
      };

      // Mock first two calls to fail, third to succeed
      vi.mocked(fetch)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockResponse as any);

      const config: ApiResourceConfig = {
        method: 'GET',
        url: 'https://api.example.com/users',
        retries: 3,
        retryDelay: 100
      };

      const result = await apiResource.execute(config);

      expect(result.success).toBe(true);
      expect(result.retryCount).toBe(2);
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Persistent network error'));

      const config: ApiResourceConfig = {
        method: 'GET',
        url: 'https://api.example.com/users',
        retries: 2,
        retryDelay: 10
      };

      const result = await apiResource.execute(config);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Persistent network error');
      expect(result.retryCount).toBe(2);
      expect(fetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });

  describe('Rate Limiting', () => {
    it('should respect rate limits', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Map([
          ['x-ratelimit-remaining', '5'],
          ['x-ratelimit-reset', String(Date.now() + 3600000)]
        ]),
        json: () => Promise.resolve({ data: [] })
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const config: ApiResourceConfig = {
        method: 'GET',
        url: 'https://api.example.com/users',
        rateLimit: {
          requests: 10,
          window: 60000 // 1 minute
        }
      };

      const result = await apiResource.execute(config);

      expect(result.success).toBe(true);
      expect(result.rateLimitInfo).toEqual({
        remaining: 5,
        resetTime: expect.any(Number),
        limit: 10
      });
    });
  });

  describe('Timeout Handling', () => {
    it('should handle request timeouts', async () => {
      vi.mocked(fetch).mockImplementation(() =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      );

      const config: ApiResourceConfig = {
        method: 'GET',
        url: 'https://api.example.com/slow',
        timeout: 50
      };

      const result = await apiResource.execute(config);

      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP error responses', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Map(),
        json: () => Promise.resolve({ error: 'Resource not found' })
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const config: ApiResourceConfig = {
        method: 'GET',
        url: 'https://api.example.com/nonexistent'
      };

      const result = await apiResource.execute(config);

      expect(result.success).toBe(false);
      expect(result.status).toBe(404);
      expect(result.statusText).toBe('Not Found');
    });

    it('should handle network errors', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      const config: ApiResourceConfig = {
        method: 'GET',
        url: 'https://api.example.com/users'
      };

      const result = await apiResource.execute(config);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should handle JSON parsing errors', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Map(),
        json: () => Promise.reject(new Error('Invalid JSON'))
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const config: ApiResourceConfig = {
        method: 'GET',
        url: 'https://api.example.com/users'
      };

      const result = await apiResource.execute(config);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid JSON');
    });
  });

  describe('Configuration Validation', () => {
    it('should validate required fields', async () => {
      const invalidConfig = {} as ApiResourceConfig;

      const result = await apiResource.execute(invalidConfig);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Valid URL is required');
    });

    it('should validate URL format', async () => {
      const config: ApiResourceConfig = {
        method: 'GET',
        url: 'invalid-url'
      };

      const result = await apiResource.execute(config);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Valid URL is required');
    });

    it('should validate method enum', async () => {
      const config = {
        method: 'INVALID' as any,
        url: 'https://api.example.com/users'
      };

      const result = await apiResource.execute(config);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid enum value');
    });

    it('should use default values', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Map(),
        json: () => Promise.resolve({ data: [] })
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const config = {
        method: 'GET' as const,
        url: 'https://api.example.com/users'
      };

      const result = await apiResource.execute(config);

      expect(result.success).toBe(true);
      expect(result.executionTime).toBeGreaterThan(0);
    });
  });

  describe('Health Check', () => {
    it('should return healthy status when test request succeeds', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Map(),
        json: () => Promise.resolve({ status: 'ok' })
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const health = await apiResource.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.details).toHaveProperty('lastTest');
      expect(health.details).toHaveProperty('testResult');
    });

    it('should return unhealthy status when test request fails', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Connection failed'));

      const health = await apiResource.healthCheck();

      expect(health.status).toBe('unhealthy');
      expect(health.details.error).toBe('Connection failed');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup successfully', async () => {
      await expect(apiResource.cleanup()).resolves.not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should track execution time', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Map(),
        json: () => Promise.resolve({ data: [] })
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const config: ApiResourceConfig = {
        method: 'GET',
        url: 'https://api.example.com/users'
      };

      const result = await apiResource.execute(config);

      expect(result.success).toBe(true);
      expect(result.executionTime).toBeGreaterThan(0);
    });
  });
});
