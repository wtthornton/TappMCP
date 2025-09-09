import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createServer } from 'http';
import type { Server } from 'http';

// Mock http module
vi.mock('http');

describe('Health Server', () => {
  let mockServer: any;
  let mockRequest: any;
  let mockResponse: any;
  let requestHandler: any;

  beforeEach(() => {
    mockResponse = {
      writeHead: vi.fn(),
      end: vi.fn(),
    };

    mockRequest = {
      url: '/',
    };

    mockServer = {
      listen: vi.fn(
        (_port: number, _host: string, callback?: () => void) => callback && callback()
      ),
      close: vi.fn(callback => callback && callback()),
    };

    (createServer as any).mockImplementation((handler: any) => {
      requestHandler = handler;
      return mockServer;
    });

    // Reset environment
    delete process.env.NODE_ENV;
    delete process.env.VITEST;
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('Health Endpoint', () => {
    beforeEach(async () => {
      // Import the health server to trigger initialization
      await import('./health-server.js');
    });

    it('should respond to /health endpoint with healthy status', () => {
      mockRequest.url = '/health';

      requestHandler(mockRequest, mockResponse);

      expect(mockResponse.writeHead).toHaveBeenCalledWith(200, {
        'Content-Type': 'application/json',
      });
      const responseCall = mockResponse.end.mock.calls[0][0];
      const responseData = JSON.parse(responseCall);
      expect(responseData.status).toBe('healthy');
    });

    it('should include system information in health response', () => {
      mockRequest.url = '/health';

      requestHandler(mockRequest, mockResponse);

      const responseCall = mockResponse.end.mock.calls[0][0];
      const responseData = JSON.parse(responseCall);

      expect(responseData).toHaveProperty('status', 'healthy');
      expect(responseData).toHaveProperty('timestamp');
      expect(responseData).toHaveProperty('uptime');
      expect(responseData).toHaveProperty('memory');
      expect(responseData).toHaveProperty('version');
    });

    it('should respond to /ready endpoint', () => {
      mockRequest.url = '/ready';

      requestHandler(mockRequest, mockResponse);

      expect(mockResponse.writeHead).toHaveBeenCalledWith(200, {
        'Content-Type': 'application/json',
      });
      const responseCall = mockResponse.end.mock.calls[0][0];
      const responseData = JSON.parse(responseCall);
      expect(responseData.status).toBe('ready');
    });

    it('should include timestamp in ready response', () => {
      mockRequest.url = '/ready';

      requestHandler(mockRequest, mockResponse);

      const responseCall = mockResponse.end.mock.calls[0][0];
      const responseData = JSON.parse(responseCall);

      expect(responseData).toHaveProperty('status', 'ready');
      expect(responseData).toHaveProperty('timestamp');
    });

    it('should return 404 for unknown endpoints', () => {
      mockRequest.url = '/unknown';

      requestHandler(mockRequest, mockResponse);

      expect(mockResponse.writeHead).toHaveBeenCalledWith(404, {
        'Content-Type': 'application/json',
      });
      const responseCall = mockResponse.end.mock.calls[0][0];
      const responseData = JSON.parse(responseCall);
      expect(responseData.status).toBe('not found');
    });

    it('should handle root path with 404', () => {
      mockRequest.url = '/';

      requestHandler(mockRequest, mockResponse);

      expect(mockResponse.writeHead).toHaveBeenCalledWith(404, {
        'Content-Type': 'application/json',
      });
      const responseCall = mockResponse.end.mock.calls[0][0];
      const responseData = JSON.parse(responseCall);
      expect(responseData.message).toBe('Endpoint not found');
    });
  });

  describe('Server Startup', () => {
    it('should start server on specified port in production', async () => {
      process.env.NODE_ENV = 'production';
      process.env.HEALTH_PORT = '3001';

      // Re-import to test startup behavior
      await import('./health-server.js');

      expect(createServer).toHaveBeenCalled();
      expect(mockServer.listen).toHaveBeenCalledWith(3001, '0.0.0.0', expect.any(Function));
    });

    it('should use default port when HEALTH_PORT not set', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.HEALTH_PORT;

      await import('./health-server.js');

      expect(mockServer.listen).toHaveBeenCalledWith(3001, '0.0.0.0', expect.any(Function));
    });

    it('should not start server in test environment', async () => {
      process.env.NODE_ENV = 'test';

      await import('./health-server.js');

      expect(createServer).toHaveBeenCalled();
      expect(mockServer.listen).not.toHaveBeenCalled();
    });

    it('should not start server when VITEST is set', async () => {
      process.env.VITEST = 'true';

      await import('./health-server.js');

      expect(createServer).toHaveBeenCalled();
      expect(mockServer.listen).not.toHaveBeenCalled();
    });

    it('should use custom port from environment', async () => {
      process.env.NODE_ENV = 'production';
      process.env.HEALTH_PORT = '9000';

      await import('./health-server.js');

      expect(mockServer.listen).toHaveBeenCalledWith(9000, '0.0.0.0', expect.any(Function));
    });
  });

  describe('Graceful Shutdown', () => {
    beforeEach(async () => {
      await import('./health-server.js');
    });

    it('should handle SIGTERM signal', () => {
      const mockExit = vi.spyOn(process, 'exit').mockImplementation((() => {}) as any);

      // Emit SIGTERM
      process.emit('SIGTERM' as any);

      expect(mockServer.close).toHaveBeenCalledWith(expect.any(Function));

      // Trigger the callback
      const closeCallback = mockServer.close.mock.calls[0][0];
      closeCallback();
      expect(mockExit).toHaveBeenCalledWith(0);

      mockExit.mockRestore();
    });

    it('should handle SIGINT signal', () => {
      const mockExit = vi.spyOn(process, 'exit').mockImplementation((() => {}) as any);

      // Emit SIGINT
      process.emit('SIGINT' as any);

      expect(mockServer.close).toHaveBeenCalledWith(expect.any(Function));

      // Trigger the callback
      const closeCallback = mockServer.close.mock.calls[0][0];
      closeCallback();
      expect(mockExit).toHaveBeenCalledWith(0);

      mockExit.mockRestore();
    });
  });

  describe('Response Format', () => {
    beforeEach(async () => {
      await import('./health-server.js');
    });

    it('should return valid JSON for health endpoint', () => {
      mockRequest.url = '/health';

      requestHandler(mockRequest, mockResponse);

      const responseCall = mockResponse.end.mock.calls[0][0];
      expect(() => JSON.parse(responseCall)).not.toThrow();
    });

    it('should return valid JSON for ready endpoint', () => {
      mockRequest.url = '/ready';

      requestHandler(mockRequest, mockResponse);

      const responseCall = mockResponse.end.mock.calls[0][0];
      expect(() => JSON.parse(responseCall)).not.toThrow();
    });

    it('should return valid JSON for 404 responses', () => {
      mockRequest.url = '/unknown';

      requestHandler(mockRequest, mockResponse);

      const responseCall = mockResponse.end.mock.calls[0][0];
      expect(() => JSON.parse(responseCall)).not.toThrow();
    });

    it('should include version from environment', () => {
      process.env.npm_package_version = '1.2.3';
      mockRequest.url = '/health';

      requestHandler(mockRequest, mockResponse);

      const responseCall = mockResponse.end.mock.calls[0][0];
      const responseData = JSON.parse(responseCall);

      expect(responseData.version).toBe('1.2.3');
    });

    it('should use default version when env not set', () => {
      delete process.env.npm_package_version;
      mockRequest.url = '/health';

      requestHandler(mockRequest, mockResponse);

      const responseCall = mockResponse.end.mock.calls[0][0];
      const responseData = JSON.parse(responseCall);

      expect(responseData.version).toBe('0.1.0');
    });
  });
});
