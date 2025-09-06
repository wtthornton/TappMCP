/**
 * Enhanced MCP Resource Base Class
 *
 * Extends the base MCPResource with advanced lifecycle management features:
 * - Memory leak prevention
 * - Automated cleanup
 * - Resource monitoring
 * - Health tracking
 */
import { MCPResource, MCPResourceConfig, MCPResourceResult, MCPResourceContext } from './mcp-resource.js';
import { ResourceLifecycleManager } from './resource-lifecycle-manager.js';
export interface EnhancedMCPResourceConfig extends MCPResourceConfig {
    lifecycleManagement?: {
        enabled: boolean;
        maxIdleTime?: number;
        maxMemoryUsage?: number;
        healthCheckInterval?: number;
    };
}
export declare abstract class EnhancedMCPResource<TConnection = any, TData = any> extends MCPResource<TConnection, TData> {
    protected lifecycleManager?: ResourceLifecycleManager;
    protected operationCount: number;
    protected errorCount: number;
    protected totalExecutionTime: number;
    protected lastOperationTime: Date;
    protected memoryUsage: number;
    constructor(config: EnhancedMCPResourceConfig, logger?: any);
    /**
     * Initialize lifecycle management
     */
    private initializeLifecycleManagement;
    /**
     * Enhanced execute method with lifecycle management
     */
    execute<TResult = TData>(operation: (connection: TConnection) => Promise<TResult>, context?: MCPResourceContext): Promise<MCPResourceResult<TResult>>;
    /**
     * Update internal metrics
     */
    private updateMetrics;
    /**
     * Estimate current memory usage
     */
    private estimateCurrentMemoryUsage;
    /**
     * Get resource statistics
     */
    getStatistics(): {
        operationCount: number;
        errorCount: number;
        errorRate: number;
        averageExecutionTime: number;
        lastOperationTime: Date;
        memoryUsage: number;
        connectionCount: number;
        poolSize: number;
    };
    /**
     * Get health status
     */
    getHealthStatus(): {
        status: 'healthy' | 'degraded' | 'unhealthy';
        issues: string[];
        recommendations: string[];
    };
    /**
     * Perform health check with enhanced diagnostics
     */
    healthCheck(): Promise<boolean>;
    /**
     * Enhanced cleanup with lifecycle management
     */
    cleanup(): Promise<void>;
    /**
     * Get lifecycle manager instance
     */
    getLifecycleManager(): ResourceLifecycleManager | undefined;
    /**
     * Get lifecycle metrics
     */
    getLifecycleMetrics(): any;
    /**
     * Get all lifecycle metrics
     */
    getAllLifecycleMetrics(): any[];
    /**
     * Get health summary
     */
    getHealthSummary(): any;
    /**
     * Destroy the enhanced resource
     */
    destroy(): Promise<void>;
}
//# sourceMappingURL=enhanced-mcp-resource.d.ts.map