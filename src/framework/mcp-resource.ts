/**
 * MCP Resource Base Class
 *
 * Provides the foundation for all MCP resources with standardized patterns for:
 * - Resource lifecycle management
 * - Connection pooling and management
 * - Security and access control
 * - Performance monitoring
 * - Error handling and recovery
 */

import { performance } from 'perf_hooks';

export interface MCPResourceConfig {
  name: string;
  type: 'file' | 'database' | 'api' | 'memory' | 'cache';
  description: string;
  version: string;
  connectionConfig: Record<string, unknown>;
  maxConnections?: number;
  timeout?: number;
  retries?: number;
  securityConfig?: {
    authentication?: boolean;
    authorization?: boolean;
    encryption?: boolean;
    accessControl?: Record<string, unknown>;
  };
}

export interface MCPResourceResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  metadata: {
    executionTime: number;
    timestamp: string;
    resourceName: string;
    version: string;
    connectionId?: string;
  };
}

export interface MCPResourceContext {
  requestId: string;
  userId?: string;
  sessionId?: string;
  businessContext?: Record<string, unknown>;
  role?: string;
  permissions?: string[];
}

export abstract class MCPResource<TConnection = unknown, TData = unknown> {
  protected config: MCPResourceConfig;
  protected logger: Console;
  protected connections: Map<string, TConnection> = new Map();
  protected connectionPool: TConnection[] = [];
  protected isInitialized: boolean = false;

  constructor(config: MCPResourceConfig, logger?: Console) {
    this.config = config;
    this.logger = logger ?? console;
  }

  /**
   * Initialize the resource
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      await this.initializeInternal();
      this.isInitialized = true;

      this.logger.info('Resource initialized successfully', {
        resourceName: this.config.name,
        type: this.config.type,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('Resource initialization failed', {
        resourceName: this.config.name,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  /**
   * Get a connection from the pool
   */
  protected async getConnection(): Promise<TConnection> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Try to get from pool first
    if (this.connectionPool.length > 0) {
      const connection = this.connectionPool.pop();
      if (connection) {return connection;}
    }

    // Create new connection if pool is empty and under limit
    if (this.connections.size < (this.config.maxConnections ?? 10)) {
      return await this.createConnection();
    }

    // Wait for connection to become available
    return await this.waitForConnection();
  }

  /**
   * Return a connection to the pool
   */
  async returnConnection(connection: TConnection): Promise<void> {
    if (this.connectionPool.length < (this.config.maxConnections ?? 10)) {
      this.connectionPool.push(connection);
    } else {
      await this.closeConnection(connection);
    }
  }

  /**
   * Execute operation with automatic connection management
   */
  async execute<TResult = TData>(
    operation: (connection: TConnection) => Promise<TResult>,
    context?: MCPResourceContext
  ): Promise<MCPResourceResult<TResult>> {
    const startTime = performance.now();
    const requestId = context?.requestId ?? this.generateRequestId();
    let connection: TConnection | undefined;

    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Get connection
      connection = await this.getConnection();
      const connectionId = this.getConnectionId(connection);

      // Execute operation
      const result = await operation(connection);

      const executionTime = performance.now() - startTime;

      // Log successful execution
      this.logger.info('Resource operation successful', {
        resourceName: this.config.name,
        requestId,
        connectionId,
        executionTime,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        data: result,
        metadata: {
          executionTime,
          timestamp: new Date().toISOString(),
          resourceName: this.config.name,
          version: this.config.version,
          connectionId,
        },
      };
    } catch (error) {
      const executionTime = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Log error
      this.logger.error('Resource operation failed', {
        resourceName: this.config.name,
        requestId,
        error: errorMessage,
        executionTime,
        timestamp: new Date().toISOString(),
      });

      return {
        success: false,
        error: errorMessage,
        metadata: {
          executionTime,
          timestamp: new Date().toISOString(),
          resourceName: this.config.name,
          version: this.config.version,
        },
      };
    } finally {
      // Return connection to pool
      if (connection) {
        await this.returnConnection(connection);
      }
    }
  }

  /**
   * Abstract method to be implemented by concrete resources
   */
  protected abstract initializeInternal(): Promise<void>;
  protected abstract createConnection(): Promise<TConnection>;
  protected abstract closeConnection(connection: TConnection): Promise<void>;
  protected abstract getConnectionId(connection: TConnection): string;

  /**
   * Wait for connection to become available
   */
  private async waitForConnection(): Promise<TConnection> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout - no available connections'));
      }, this.config.timeout ?? 30000);

      const checkConnection = () => {
        if (this.connectionPool.length > 0) {
          clearTimeout(timeout);
          const connection = this.connectionPool.pop();
          if (connection) {resolve(connection);}
        } else {
          setTimeout(checkConnection, 100);
        }
      };

      checkConnection();
    });
  }

  /**
   * Get resource configuration
   */
  getConfig(): MCPResourceConfig {
    return { ...this.config };
  }

  /**
   * Get resource name
   */
  getName(): string {
    return this.config.name;
  }

  /**
   * Get resource type
   */
  getType(): string {
    return this.config.type;
  }

  /**
   * Get resource description
   */
  getDescription(): string {
    return this.config.description;
  }

  /**
   * Get resource version
   */
  getVersion(): string {
    return this.config.version;
  }

  /**
   * Check if resource is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        return false;
      }

      // Test connection
      const connection = await this.getConnection();
      const isHealthy = await this.testConnection(connection);
      await this.returnConnection(connection);

      return isHealthy;
    } catch (error) {
      this.logger.error('Health check failed', {
        resourceName: this.config.name,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Test connection health
   */
  protected async testConnection(_connection: TConnection): Promise<boolean> {
    // Basic health check - can be overridden by subclasses
    return true;
  }

  /**
   * Cleanup and close all connections
   */
  async cleanup(): Promise<void> {
    try {
      // Close all connections in pool
      for (const connection of this.connectionPool) {
        await this.closeConnection(connection);
      }
      this.connectionPool = [];

      // Close all active connections
      for (const [_id, connection] of this.connections) {
        await this.closeConnection(connection);
      }
      this.connections.clear();

      this.isInitialized = false;

      this.logger.info('Resource cleanup completed', {
        resourceName: this.config.name,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('Resource cleanup failed', {
        resourceName: this.config.name,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * MCP Resource Factory
 *
 * Creates and manages MCP resource instances
 */
export class MCPResourceFactory {
  private static resources = new Map<string, MCPResource>();

  static registerResource<T extends MCPResource>(resource: T): void {
    MCPResourceFactory.resources.set(resource.getName(), resource);
  }

  static getResource(name: string): MCPResource | undefined {
    return MCPResourceFactory.resources.get(name);
  }

  static getAllResources(): MCPResource[] {
    return Array.from(MCPResourceFactory.resources.values());
  }

  static getResourceNames(): string[] {
    return Array.from(MCPResourceFactory.resources.keys());
  }

  static async initializeAllResources(): Promise<void> {
    for (const resource of MCPResourceFactory.resources.values()) {
      await resource.initialize();
    }
  }

  static async cleanupAllResources(): Promise<void> {
    for (const resource of MCPResourceFactory.resources.values()) {
      await resource.cleanup();
    }
  }

  static clearResources(): void {
    MCPResourceFactory.resources.clear();
  }
}
