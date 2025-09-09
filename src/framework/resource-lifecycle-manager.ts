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
  maxIdleTime: number; // milliseconds
  maxMemoryUsage: number; // bytes
  cleanupInterval: number; // milliseconds
  forceCleanupThreshold: number; // milliseconds
}

export interface MonitoringConfig {
  healthCheckInterval: number; // milliseconds
  metricsCollectionInterval: number; // milliseconds
  alertThresholds: {
    memoryUsage: number; // percentage
    errorRate: number; // percentage
    responseTime: number; // milliseconds
  };
}

/**
 * Resource Lifecycle Manager
 *
 * Manages resource lifecycle, prevents memory leaks, and provides monitoring
 */
export class ResourceLifecycleManager {
  private resources: Map<string, MCPResource> = new Map();
  private metrics: Map<string, ResourceMetrics> = new Map();
  private cleanupConfig: CleanupConfig;
  private monitoringConfig: MonitoringConfig;
  private logger: Console;
  private cleanupInterval?: NodeJS.Timeout;
  private monitoringInterval?: NodeJS.Timeout;
  private isRunning: boolean = false;

  constructor(
    cleanupConfig: CleanupConfig = {
      maxIdleTime: 300000, // 5 minutes
      maxMemoryUsage: 100 * 1024 * 1024, // 100MB
      cleanupInterval: 60000, // 1 minute
      forceCleanupThreshold: 600000, // 10 minutes
    },
    monitoringConfig: MonitoringConfig = {
      healthCheckInterval: 30000, // 30 seconds
      metricsCollectionInterval: 10000, // 10 seconds
      alertThresholds: {
        memoryUsage: 80, // 80%
        errorRate: 10, // 10%
        responseTime: 1000, // 1 second
      },
    },
    logger?: Console
  ) {
    this.cleanupConfig = cleanupConfig;
    this.monitoringConfig = monitoringConfig;
    this.logger = logger ?? console;
  }

  /**
   * Register a resource for lifecycle management
   */
  registerResource(resource: MCPResource): void {
    const name = resource.getName();
    this.resources.set(name, resource);

    // Initialize metrics
    this.metrics.set(name, {
      resourceName: name,
      resourceType: resource.getType(),
      activeConnections: 0,
      poolSize: 0,
      maxConnections: 10, // Default, will be updated from config
      memoryUsage: 0,
      lastUsed: new Date(),
      totalOperations: 0,
      errorCount: 0,
      averageResponseTime: 0,
      healthStatus: 'healthy',
    });

    this.logger.info('Resource registered for lifecycle management', {
      resourceName: name,
      resourceType: resource.getType(),
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Start lifecycle management
   */
  start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    // Start cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, this.cleanupConfig.cleanupInterval);

    // Start monitoring interval
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
      this.performHealthChecks();
    }, this.monitoringConfig.metricsCollectionInterval);

    this.logger.info('Resource lifecycle management started', {
      cleanupInterval: this.cleanupConfig.cleanupInterval,
      monitoringInterval: this.monitoringConfig.metricsCollectionInterval,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Stop lifecycle management
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    // Clear intervals
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null as any;
    }

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null as any;
    }

    this.logger.info('Resource lifecycle management stopped', {
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Perform automated cleanup
   */
  private async performCleanup(): Promise<void> {
    const now = new Date();
    const cleanupPromises: Promise<void>[] = [];

    for (const [name, resource] of this.resources) {
      const metrics = this.metrics.get(name);
      if (!metrics) continue;

      // Check if resource needs cleanup
      const idleTime = now.getTime() - metrics.lastUsed.getTime();
      const needsCleanup =
        idleTime > this.cleanupConfig.maxIdleTime ||
        metrics.memoryUsage > this.cleanupConfig.maxMemoryUsage ||
        idleTime > this.cleanupConfig.forceCleanupThreshold;

      if (needsCleanup) {
        this.logger.info('Performing cleanup for resource', {
          resourceName: name,
          idleTime,
          memoryUsage: metrics.memoryUsage,
          reason:
            idleTime > this.cleanupConfig.forceCleanupThreshold
              ? 'force'
              : idleTime > this.cleanupConfig.maxIdleTime
                ? 'idle'
                : 'memory',
        });

        cleanupPromises.push(this.cleanupResource(resource, name));
      }
    }

    // Execute cleanup in parallel
    await Promise.allSettled(cleanupPromises);
  }

  /**
   * Cleanup a specific resource
   */
  private async cleanupResource(resource: MCPResource, name: string): Promise<void> {
    try {
      await resource.cleanup();

      // Reset metrics
      const metrics = this.metrics.get(name);
      if (metrics) {
        metrics.activeConnections = 0;
        metrics.poolSize = 0;
        metrics.memoryUsage = 0;
        metrics.lastUsed = new Date();
        metrics.healthStatus = 'healthy';
      }

      this.logger.info('Resource cleanup completed', {
        resourceName: name,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('Resource cleanup failed', {
        resourceName: name,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Collect resource metrics
   */
  private async collectMetrics(): Promise<void> {
    for (const [name, resource] of this.resources) {
      try {
        const metrics = this.metrics.get(name);
        if (!metrics) continue;

        // Update basic metrics
        metrics.lastUsed = new Date();

        // Get memory usage (simplified - in real implementation, use process.memoryUsage())
        metrics.memoryUsage = this.estimateMemoryUsage(resource);

        // Update health status based on metrics
        this.updateHealthStatus(metrics);

        this.metrics.set(name, metrics);
      } catch (error) {
        this.logger.error('Failed to collect metrics for resource', {
          resourceName: name,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  /**
   * Perform health checks on all resources
   */
  private async performHealthChecks(): Promise<void> {
    const healthCheckPromises: Promise<void>[] = [];

    for (const [name, resource] of this.resources) {
      healthCheckPromises.push(this.checkResourceHealth(resource, name));
    }

    // Execute health checks in parallel
    await Promise.allSettled(healthCheckPromises);
  }

  /**
   * Check health of a specific resource
   */
  private async checkResourceHealth(resource: MCPResource, name: string): Promise<void> {
    try {
      const isHealthy = await resource.healthCheck();
      const metrics = this.metrics.get(name);

      if (metrics) {
        metrics.healthStatus = isHealthy ? 'healthy' : 'unhealthy';

        if (!isHealthy) {
          this.logger.warn('Resource health check failed', {
            resourceName: name,
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      const metrics = this.metrics.get(name);
      if (metrics) {
        metrics.healthStatus = 'unhealthy';
        metrics.errorCount++;
      }

      this.logger.error('Resource health check error', {
        resourceName: name,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Estimate memory usage for a resource
   */
  private estimateMemoryUsage(_resource: MCPResource): number {
    // Simplified memory estimation
    // In a real implementation, this would use process.memoryUsage() and track actual usage
    const baseMemory = 1024 * 1024; // 1MB base
    const connectionMemory = 64 * 1024; // 64KB per connection

    // This is a simplified estimation - real implementation would track actual memory usage
    return baseMemory + connectionMemory * 2; // Assume 2 connections
  }

  /**
   * Update health status based on metrics
   */
  private updateHealthStatus(metrics: ResourceMetrics): void {
    const { alertThresholds } = this.monitoringConfig;

    // Check memory usage
    const memoryUsagePercent = (metrics.memoryUsage / this.cleanupConfig.maxMemoryUsage) * 100;

    // Check error rate
    const errorRate =
      metrics.totalOperations > 0 ? (metrics.errorCount / metrics.totalOperations) * 100 : 0;

    // Determine health status
    if (
      memoryUsagePercent > alertThresholds.memoryUsage ||
      errorRate > alertThresholds.errorRate ||
      metrics.averageResponseTime > alertThresholds.responseTime
    ) {
      metrics.healthStatus = 'degraded';
    } else if (metrics.errorCount > 0 && errorRate > alertThresholds.errorRate * 2) {
      metrics.healthStatus = 'unhealthy';
    } else {
      metrics.healthStatus = 'healthy';
    }
  }

  /**
   * Get metrics for all resources
   */
  getAllMetrics(): ResourceMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get metrics for a specific resource
   */
  getResourceMetrics(resourceName: string): ResourceMetrics | undefined {
    return this.metrics.get(resourceName);
  }

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
  } {
    const allMetrics = this.getAllMetrics();

    return {
      totalResources: allMetrics.length,
      healthy: allMetrics.filter(m => m.healthStatus === 'healthy').length,
      degraded: allMetrics.filter(m => m.healthStatus === 'degraded').length,
      unhealthy: allMetrics.filter(m => m.healthStatus === 'unhealthy').length,
      totalMemoryUsage: allMetrics.reduce((sum, m) => sum + m.memoryUsage, 0),
      averageResponseTime:
        allMetrics.reduce((sum, m) => sum + m.averageResponseTime, 0) / allMetrics.length || 0,
    };
  }

  /**
   * Force cleanup of all resources
   */
  async forceCleanupAll(): Promise<void> {
    this.logger.info('Force cleanup of all resources initiated', {
      timestamp: new Date().toISOString(),
    });

    const cleanupPromises: Promise<void>[] = [];

    for (const [name, resource] of this.resources) {
      cleanupPromises.push(this.cleanupResource(resource, name));
    }

    await Promise.allSettled(cleanupPromises);

    this.logger.info('Force cleanup of all resources completed', {
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Update operation metrics
   */
  updateOperationMetrics(resourceName: string, executionTime: number, success: boolean): void {
    const metrics = this.metrics.get(resourceName);
    if (!metrics) return;

    metrics.totalOperations++;
    metrics.lastUsed = new Date();

    if (!success) {
      metrics.errorCount++;
    }

    // Update average response time
    metrics.averageResponseTime =
      (metrics.averageResponseTime * (metrics.totalOperations - 1) + executionTime) /
      metrics.totalOperations;
  }

  /**
   * Get cleanup configuration
   */
  getCleanupConfig(): CleanupConfig {
    return { ...this.cleanupConfig };
  }

  /**
   * Update cleanup configuration
   */
  updateCleanupConfig(config: Partial<CleanupConfig>): void {
    this.cleanupConfig = { ...this.cleanupConfig, ...config };

    this.logger.info('Cleanup configuration updated', {
      config: this.cleanupConfig,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get monitoring configuration
   */
  getMonitoringConfig(): MonitoringConfig {
    return { ...this.monitoringConfig };
  }

  /**
   * Update monitoring configuration
   */
  updateMonitoringConfig(config: Partial<MonitoringConfig>): void {
    this.monitoringConfig = { ...this.monitoringConfig, ...config };

    this.logger.info('Monitoring configuration updated', {
      config: this.monitoringConfig,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Cleanup and destroy the manager
   */
  async destroy(): Promise<void> {
    this.stop();
    await this.forceCleanupAll();
    this.resources.clear();
    this.metrics.clear();

    this.logger.info('Resource lifecycle manager destroyed', {
      timestamp: new Date().toISOString(),
    });
  }
}
