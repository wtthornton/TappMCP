/**
 * Resource Lifecycle Manager
 *
 * Provides advanced resource management including:
 * - Memory leak prevention
 * - Automated cleanup
 * - Resource monitoring
 * - Connection pool management
 */
import { MCPResource } from './mcp-resource.js';
export interface ResourceMetrics {
    resourceName: string;
    resourceType: string;
    activeConnections: number;
    poolSize: number;
    maxConnections: number;
    memoryUsage: number;
    lastUsed: Date;
    totalOperations: number;
    errorCount: number;
    averageResponseTime: number;
    healthStatus: 'healthy' | 'degraded' | 'unhealthy';
}
export interface CleanupConfig {
    maxIdleTime: number;
    maxMemoryUsage: number;
    cleanupInterval: number;
    forceCleanupThreshold: number;
}
export interface MonitoringConfig {
    healthCheckInterval: number;
    metricsCollectionInterval: number;
    alertThresholds: {
        memoryUsage: number;
        errorRate: number;
        responseTime: number;
    };
}
/**
 * Resource Lifecycle Manager
 *
 * Manages resource lifecycle, prevents memory leaks, and provides monitoring
 */
export declare class ResourceLifecycleManager {
    private resources;
    private metrics;
    private cleanupConfig;
    private monitoringConfig;
    private logger;
    private cleanupInterval?;
    private monitoringInterval?;
    private isRunning;
    constructor(cleanupConfig?: CleanupConfig, monitoringConfig?: MonitoringConfig, logger?: any);
    /**
     * Register a resource for lifecycle management
     */
    registerResource(resource: MCPResource): void;
    /**
     * Start lifecycle management
     */
    start(): void;
    /**
     * Stop lifecycle management
     */
    stop(): void;
    /**
     * Perform automated cleanup
     */
    private performCleanup;
    /**
     * Cleanup a specific resource
     */
    private cleanupResource;
    /**
     * Collect resource metrics
     */
    private collectMetrics;
    /**
     * Perform health checks on all resources
     */
    private performHealthChecks;
    /**
     * Check health of a specific resource
     */
    private checkResourceHealth;
    /**
     * Estimate memory usage for a resource
     */
    private estimateMemoryUsage;
    /**
     * Update health status based on metrics
     */
    private updateHealthStatus;
    /**
     * Get metrics for all resources
     */
    getAllMetrics(): ResourceMetrics[];
    /**
     * Get metrics for a specific resource
     */
    getResourceMetrics(resourceName: string): ResourceMetrics | undefined;
    /**
     * Get health status summary
     */
    getHealthSummary(): {
        totalResources: number;
        healthy: number;
        degraded: number;
        unhealthy: number;
        totalMemoryUsage: number;
        averageResponseTime: number;
    };
    /**
     * Force cleanup of all resources
     */
    forceCleanupAll(): Promise<void>;
    /**
     * Update operation metrics
     */
    updateOperationMetrics(resourceName: string, executionTime: number, success: boolean): void;
    /**
     * Get cleanup configuration
     */
    getCleanupConfig(): CleanupConfig;
    /**
     * Update cleanup configuration
     */
    updateCleanupConfig(config: Partial<CleanupConfig>): void;
    /**
     * Get monitoring configuration
     */
    getMonitoringConfig(): MonitoringConfig;
    /**
     * Update monitoring configuration
     */
    updateMonitoringConfig(config: Partial<MonitoringConfig>): void;
    /**
     * Cleanup and destroy the manager
     */
    destroy(): Promise<void>;
}
//# sourceMappingURL=resource-lifecycle-manager.d.ts.map