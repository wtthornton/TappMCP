/**
 * MCP Resource Tests
 *
 * Comprehensive test suite for MCP Resource base class and factory
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  MCPResource,
  MCPResourceFactory,
  type MCPResourceConfig,
  type MCPResourceContext,
} from './mcp-resource';

// Test resource implementation
class TestMCPResource extends MCPResource<string, any> {
  constructor(config: MCPResourceConfig) {
    super(config);
  }

  protected async initializeInternal(): Promise<void> {
    // Test implementation
  }

  protected async createConnection(): Promise<string> {
    return `connection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  protected async closeConnection(_connection: string): Promise<void> {
    // Mock connection cleanup
  }

  protected getConnectionId(connection: string): string {
    return connection;
  }

  protected async testConnection(connection: string): Promise<boolean> {
    return connection.startsWith('connection_');
  }

  // Public methods for testing protected functionality
  async testGetConnection(): Promise<string> {
    return this.getConnection();
  }

  async testReturnConnection(connection: string): Promise<void> {
    return this.returnConnection(connection);
  }
}

describe('MCPResource', () => {
  let testResource: TestMCPResource;
  beforeEach(() => {
    const config: MCPResourceConfig = {
      name: 'test-resource',
      type: 'memory',
      description: 'Test resource for unit testing',
      version: '1.0.0',
      connectionConfig: { maxConnections: 5 },
      maxConnections: 5,
      timeout: 5000,
      retries: 3,
      securityConfig: {
        authentication: true,
        authorization: true,
        encryption: false,
      },
    };

    testResource = new TestMCPResource(config);
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await testResource.cleanup();
  });

  describe('Resource Configuration', () => {
    it('should return correct configuration', () => {
      const config = testResource.getConfig();
      expect(config.name).toBe('test-resource');
      expect(config.type).toBe('memory');
      expect(config.description).toBe('Test resource for unit testing');
      expect(config.version).toBe('1.0.0');
    });

    it('should return correct name', () => {
      expect(testResource.getName()).toBe('test-resource');
    });

    it('should return correct type', () => {
      expect(testResource.getType()).toBe('memory');
    });

    it('should return correct description', () => {
      expect(testResource.getDescription()).toBe('Test resource for unit testing');
    });

    it('should return correct version', () => {
      expect(testResource.getVersion()).toBe('1.0.0');
    });
  });

  describe('Resource Initialization', () => {
    it('should initialize successfully', async () => {
      await testResource.initialize();
      expect(true).toBe(true); // Initialization completed without error
    });

    it('should not initialize twice', async () => {
      await testResource.initialize();
      await testResource.initialize(); // Should not throw error
      expect(true).toBe(true);
    });
  });

  describe('Connection Management', () => {
    beforeEach(async () => {
      await testResource.initialize();
    });

    it('should get and return connection', async () => {
      const connection = await testResource.testGetConnection();
      expect(connection).toMatch(/^connection_/);

      await testResource.testReturnConnection(connection);
      expect(true).toBe(true); // No error on return
    });

    it('should execute operation with connection', async () => {
      const operation = async (conn: string) => {
        expect(conn).toMatch(/^connection_/);
        return { result: 'success', connection: conn };
      };

      const result = await testResource.execute(operation);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        result: 'success',
        connection: expect.stringMatching(/^connection_/),
      });
      expect(result.metadata.resourceName).toBe('test-resource');
      expect(result.metadata.executionTime).toBeGreaterThan(0);
    });

    it('should handle operation errors gracefully', async () => {
      const errorOperation = async () => {
        throw new Error('Test operation error');
      };

      const result = await testResource.execute(errorOperation);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Test operation error');
      expect(result.data).toBeUndefined();
    });

    it('should handle operation with context', async () => {
      const context: MCPResourceContext = {
        requestId: 'test-request-123',
        userId: 'test-user',
        sessionId: 'test-session',
        businessContext: { project: 'test-project' },
        role: 'developer',
        permissions: ['read', 'write'],
      };

      const operation = async (_conn: string) => {
        return { result: 'success', context: context.requestId };
      };

      const result = await testResource.execute(operation, context);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ result: 'success', context: 'test-request-123' });
    });
  });

  describe('Health Check', () => {
    beforeEach(async () => {
      await testResource.initialize();
    });

    it('should pass health check', async () => {
      const isHealthy = await testResource.healthCheck();
      expect(isHealthy).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup successfully', async () => {
      await testResource.initialize();
      await testResource.cleanup();
      expect(true).toBe(true); // Cleanup completed without error
    });
  });

  describe('Performance', () => {
    beforeEach(async () => {
      await testResource.initialize();
    });

    it('should execute operations within acceptable time limits', async () => {
      const operation = async (_conn: string) => {
        return { result: 'success' };
      };

      const startTime = Date.now();
      const result = await testResource.execute(operation);
      const executionTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(executionTime).toBeLessThan(100); // Should be much faster than 100ms
    });
  });
});

describe('MCPResourceFactory', () => {
  beforeEach(() => {
    MCPResourceFactory.clearResources();
  });

  afterEach(async () => {
    await MCPResourceFactory.cleanupAllResources();
  });

  describe('Resource Registration', () => {
    it('should register and retrieve resources', () => {
      const config: MCPResourceConfig = {
        name: 'factory-test-resource',
        type: 'memory',
        description: 'Resource for factory testing',
        version: '1.0.0',
        connectionConfig: {},
      };

      const resource = new TestMCPResource(config);
      MCPResourceFactory.registerResource(resource);

      const retrievedResource = MCPResourceFactory.getResource('factory-test-resource');
      expect(retrievedResource).toBe(resource);
      expect(retrievedResource?.getName()).toBe('factory-test-resource');
    });

    it('should return undefined for non-existent resource', () => {
      const resource = MCPResourceFactory.getResource('non-existent-resource');
      expect(resource).toBeUndefined();
    });

    it('should return all registered resources', () => {
      const resource1 = new TestMCPResource({
        name: 'resource1',
        type: 'memory',
        description: 'Resource 1',
        version: '1.0.0',
        connectionConfig: {},
      });

      const resource2 = new TestMCPResource({
        name: 'resource2',
        type: 'database',
        description: 'Resource 2',
        version: '1.0.0',
        connectionConfig: {},
      });

      MCPResourceFactory.registerResource(resource1);
      MCPResourceFactory.registerResource(resource2);

      const allResources = MCPResourceFactory.getAllResources();
      expect(allResources).toHaveLength(2);
      expect(allResources).toContain(resource1);
      expect(allResources).toContain(resource2);
    });

    it('should return resource names', () => {
      const resource = new TestMCPResource({
        name: 'name-test-resource',
        type: 'memory',
        description: 'Resource for name testing',
        version: '1.0.0',
        connectionConfig: {},
      });

      MCPResourceFactory.registerResource(resource);

      const names = MCPResourceFactory.getResourceNames();
      expect(names).toContain('name-test-resource');
    });

    it('should clear all resources', () => {
      const resource = new TestMCPResource({
        name: 'clear-test-resource',
        type: 'memory',
        description: 'Resource for clear testing',
        version: '1.0.0',
        connectionConfig: {},
      });

      MCPResourceFactory.registerResource(resource);
      expect(MCPResourceFactory.getAllResources()).toHaveLength(1);

      MCPResourceFactory.clearResources();
      expect(MCPResourceFactory.getAllResources()).toHaveLength(0);
    });
  });

  describe('Resource Lifecycle Management', () => {
    it('should initialize all resources', async () => {
      const resource1 = new TestMCPResource({
        name: 'init-resource1',
        type: 'memory',
        description: 'Resource 1 for init testing',
        version: '1.0.0',
        connectionConfig: {},
      });

      const resource2 = new TestMCPResource({
        name: 'init-resource2',
        type: 'database',
        description: 'Resource 2 for init testing',
        version: '1.0.0',
        connectionConfig: {},
      });

      MCPResourceFactory.registerResource(resource1);
      MCPResourceFactory.registerResource(resource2);

      await MCPResourceFactory.initializeAllResources();
      expect(true).toBe(true); // Initialization completed without error
    });

    it('should cleanup all resources', async () => {
      const resource = new TestMCPResource({
        name: 'cleanup-test-resource',
        type: 'memory',
        description: 'Resource for cleanup testing',
        version: '1.0.0',
        connectionConfig: {},
      });

      MCPResourceFactory.registerResource(resource);
      await MCPResourceFactory.initializeAllResources();

      await MCPResourceFactory.cleanupAllResources();
      expect(true).toBe(true); // Cleanup completed without error
    });
  });
});
