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
export interface MCPResourceConfig {
    name: string;
    type: 'file' | 'database' | 'api' | 'memory' | 'cache';
    description: string;
    version: string;
    connectionConfig: Record<string, any>;
    maxConnections?: number;
    timeout?: number;
    retries?: number;
    securityConfig?: {
        authentication?: boolean;
        authorization?: boolean;
        encryption?: boolean;
        accessControl?: Record<string, any>;
    };
}
export interface MCPResourceResult<T = any> {
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
    businessContext?: Record<string, any>;
    role?: string;
    permissions?: string[];
}
export declare abstract class MCPResource<TConnection = any, TData = any> {
    protected config: MCPResourceConfig;
    protected logger: any;
    protected connections: Map<string, TConnection>;
    protected connectionPool: TConnection[];
    protected isInitialized: boolean;
    constructor(config: MCPResourceConfig, logger?: any);
    /**
     * Initialize the resource
     */
    initialize(): Promise<void>;
    /**
     * Get a connection from the pool
     */
    protected getConnection(): Promise<TConnection>;
    /**
     * Return a connection to the pool
     */
    returnConnection(connection: TConnection): Promise<void>;
    /**
     * Execute operation with automatic connection management
     */
    execute<TResult = TData>(operation: (connection: TConnection) => Promise<TResult>, context?: MCPResourceContext): Promise<MCPResourceResult<TResult>>;
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
    private waitForConnection;
    /**
     * Get resource configuration
     */
    getConfig(): MCPResourceConfig;
    /**
     * Get resource name
     */
    getName(): string;
    /**
     * Get resource type
     */
    getType(): string;
    /**
     * Get resource description
     */
    getDescription(): string;
    /**
     * Get resource version
     */
    getVersion(): string;
    /**
     * Check if resource is healthy
     */
    healthCheck(): Promise<boolean>;
    /**
     * Test connection health
     */
    protected testConnection(_connection: TConnection): Promise<boolean>;
    /**
     * Cleanup and close all connections
     */
    cleanup(): Promise<void>;
    /**
     * Generate unique request ID
     */
    private generateRequestId;
}
/**
 * MCP Resource Factory
 *
 * Creates and manages MCP resource instances
 */
export declare class MCPResourceFactory {
    private static resources;
    static registerResource<T extends MCPResource>(resource: T): void;
    static getResource(name: string): MCPResource | undefined;
    static getAllResources(): MCPResource[];
    static getResourceNames(): string[];
    static initializeAllResources(): Promise<void>;
    static cleanupAllResources(): Promise<void>;
    static clearResources(): void;
}
//# sourceMappingURL=mcp-resource.d.ts.map