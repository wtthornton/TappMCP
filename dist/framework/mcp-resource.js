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
export class MCPResource {
    config;
    logger;
    connections = new Map();
    connectionPool = [];
    isInitialized = false;
    constructor(config, logger) {
        this.config = config;
        this.logger = logger || console;
    }
    /**
     * Initialize the resource
     */
    async initialize() {
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
        }
        catch (error) {
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
    async getConnection() {
        if (!this.isInitialized) {
            await this.initialize();
        }
        // Try to get from pool first
        if (this.connectionPool.length > 0) {
            return this.connectionPool.pop();
        }
        // Create new connection if pool is empty and under limit
        if (this.connections.size < (this.config.maxConnections || 10)) {
            return await this.createConnection();
        }
        // Wait for connection to become available
        return await this.waitForConnection();
    }
    /**
     * Return a connection to the pool
     */
    async returnConnection(connection) {
        if (this.connectionPool.length < (this.config.maxConnections || 10)) {
            this.connectionPool.push(connection);
        }
        else {
            await this.closeConnection(connection);
        }
    }
    /**
     * Execute operation with automatic connection management
     */
    async execute(operation, context) {
        const startTime = performance.now();
        const requestId = context?.requestId || this.generateRequestId();
        let connection;
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
        }
        catch (error) {
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
        }
        finally {
            // Return connection to pool
            if (connection) {
                await this.returnConnection(connection);
            }
        }
    }
    /**
     * Wait for connection to become available
     */
    async waitForConnection() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Connection timeout - no available connections'));
            }, this.config.timeout || 30000);
            const checkConnection = () => {
                if (this.connectionPool.length > 0) {
                    clearTimeout(timeout);
                    resolve(this.connectionPool.pop());
                }
                else {
                    setTimeout(checkConnection, 100);
                }
            };
            checkConnection();
        });
    }
    /**
     * Get resource configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Get resource name
     */
    getName() {
        return this.config.name;
    }
    /**
     * Get resource type
     */
    getType() {
        return this.config.type;
    }
    /**
     * Get resource description
     */
    getDescription() {
        return this.config.description;
    }
    /**
     * Get resource version
     */
    getVersion() {
        return this.config.version;
    }
    /**
     * Check if resource is healthy
     */
    async healthCheck() {
        try {
            if (!this.isInitialized) {
                return false;
            }
            // Test connection
            const connection = await this.getConnection();
            const isHealthy = await this.testConnection(connection);
            await this.returnConnection(connection);
            return isHealthy;
        }
        catch (error) {
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
    async testConnection(_connection) {
        // Basic health check - can be overridden by subclasses
        return true;
    }
    /**
     * Cleanup and close all connections
     */
    async cleanup() {
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
        }
        catch (error) {
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
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
/**
 * MCP Resource Factory
 *
 * Creates and manages MCP resource instances
 */
export class MCPResourceFactory {
    static resources = new Map();
    static registerResource(resource) {
        MCPResourceFactory.resources.set(resource.getName(), resource);
    }
    static getResource(name) {
        return MCPResourceFactory.resources.get(name);
    }
    static getAllResources() {
        return Array.from(MCPResourceFactory.resources.values());
    }
    static getResourceNames() {
        return Array.from(MCPResourceFactory.resources.keys());
    }
    static async initializeAllResources() {
        for (const resource of MCPResourceFactory.resources.values()) {
            await resource.initialize();
        }
    }
    static async cleanupAllResources() {
        for (const resource of MCPResourceFactory.resources.values()) {
            await resource.cleanup();
        }
    }
    static clearResources() {
        MCPResourceFactory.resources.clear();
    }
}
//# sourceMappingURL=mcp-resource.js.map