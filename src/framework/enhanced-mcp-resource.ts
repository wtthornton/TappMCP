/**
 * Enhanced MCP Resource Base Class
 *
 * Extends the base MCPResource with advanced lifecycle management features:
 * - Memory leak prevention
 * - Automated cleanup
 * - Resource monitoring
 * - Health tracking
 */

import {
  MCPResource,
  MCPResourceConfig,
  MCPResourceResult,
  MCPResourceContext,
} from './mcp-resource.js';
import { ResourceLifecycleManager } from './resource-lifecycle-manager.js';

export interface EnhancedMCPResourceConfig extends MCPResourceConfig {
  lifecycleManagement?: {
    enabled: boolean;
    maxIdleTime?: number;
    maxMemoryUsage?: number;
    healthCheckInterval?: number;
  };
}

export abstract class EnhancedMCPResource<TConnection = any, TData = any> extends MCPResource<
  TConnection,
  TData
> {
  protected lifecycleManager?: ResourceLifecycleManager;
  protected operationCount: number = 0;
  protected errorCount: number = 0;
  protected totalExecutionTime: number = 0;
  protected lastOperationTime: Date = new Date();
  protected memoryUsage: number = 0;

  constructor(config: EnhancedMCPResourceConfig, logger?: any) {
    super(config, logger);

    // Initialize lifecycle management if enabled
    if (config.lifecycleManagement?.enabled !== false) {
      this.initializeLifecycleManagement(config.lifecycleManagement);
    }
  }

  /**
   * Initialize lifecycle management
   */
  private initializeLifecycleManagement(
    config?: EnhancedMCPResourceConfig['lifecycleManagement']
  ): void {
    this.lifecycleManager = new ResourceLifecycleManager(
      {
        maxIdleTime: config?.maxIdleTime || 300000, // 5 minutes
        maxMemoryUsage: config?.maxMemoryUsage || 100 * 1024 * 1024, // 100MB
        cleanupInterval: 60000, // 1 minute
        forceCleanupThreshold: 600000, // 10 minutes
      },
      {
        healthCheckInterval: config?.healthCheckInterval || 30000, // 30 seconds
        metricsCollectionInterval: 10000, // 10 seconds
        alertThresholds: {
          memoryUsage: 80,
          errorRate: 10,
          responseTime: 1000,
        },
      },
      this.logger
    );

    // Register this resource with the lifecycle manager
    this.lifecycleManager.registerResource(this);
    this.lifecycleManager.start();
  }

  /**
   * Enhanced execute method with lifecycle management
   */
  async execute<TResult = TData>(
    operation: (connection: TConnection) => Promise<TResult>,
    context?: MCPResourceContext
  ): Promise<MCPResourceResult<TResult>> {
    const startTime = performance.now();
    // const _requestId = context?.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Execute the base operation
      const result = await super.execute(operation, context);

      const executionTime = performance.now() - startTime;

      // Update internal metrics
      this.updateMetrics(executionTime, result.success);

      // Update lifecycle manager metrics
      if (this.lifecycleManager) {
        this.lifecycleManager.updateOperationMetrics(
          this.config.name,
          executionTime,
          result.success
        );
      }

      return result;
    } catch (error) {
      const executionTime = performance.now() - startTime;

      // Update internal metrics
      this.updateMetrics(executionTime, false);

      // Update lifecycle manager metrics
      if (this.lifecycleManager) {
        this.lifecycleManager.updateOperationMetrics(this.config.name, executionTime, false);
      }

      throw error;
    }
  }

  /**
   * Update internal metrics
   */
  private updateMetrics(executionTime: number, success: boolean): void {
    this.operationCount++;
    this.lastOperationTime = new Date();
    this.totalExecutionTime += executionTime;

    if (!success) {
      this.errorCount++;
    }

    // Update memory usage estimation
    this.memoryUsage = this.estimateCurrentMemoryUsage();
  }

  /**
   * Estimate current memory usage
   */
  private estimateCurrentMemoryUsage(): number {
    const baseMemory = 1024 * 1024; // 1MB base
    const connectionMemory = 64 * 1024; // 64KB per connection
    const operationMemory = 1024; // 1KB per operation

    return (
      baseMemory + this.connections.size * connectionMemory + this.operationCount * operationMemory
    );
  }

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
  } {
    return {
      operationCount: this.operationCount,
      errorCount: this.errorCount,
      errorRate: this.operationCount > 0 ? (this.errorCount / this.operationCount) * 100 : 0,
      averageExecutionTime:
        this.operationCount > 0 ? this.totalExecutionTime / this.operationCount : 0,
      lastOperationTime: this.lastOperationTime,
      memoryUsage: this.memoryUsage,
      connectionCount: this.connections.size,
      poolSize: this.connectionPool.length,
    };
  }

  /**
   * Get health status
   */
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    issues: string[];
    recommendations: string[];
  } {
    const stats = this.getStatistics();
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check error rate
    if (stats.errorRate > 10) {
      issues.push(`High error rate: ${stats.errorRate.toFixed(2)}%`);
      recommendations.push('Investigate and fix error sources');
    }

    // Check memory usage
    const maxMemory =
      (this.config as EnhancedMCPResourceConfig).lifecycleManagement?.maxMemoryUsage ||
      100 * 1024 * 1024;
    const memoryUsagePercent = (stats.memoryUsage / maxMemory) * 100;

    if (memoryUsagePercent > 80) {
      issues.push(`High memory usage: ${memoryUsagePercent.toFixed(2)}%`);
      recommendations.push('Consider cleanup or resource optimization');
    }

    // Check average execution time
    if (stats.averageExecutionTime > 1000) {
      issues.push(`Slow execution: ${stats.averageExecutionTime.toFixed(2)}ms average`);
      recommendations.push('Optimize operations or increase resources');
    }

    // Check idle time
    const idleTime = Date.now() - stats.lastOperationTime.getTime();
    if (idleTime > 300000) {
      // 5 minutes
      issues.push(`Resource idle for ${Math.round(idleTime / 1000)}s`);
      recommendations.push('Consider cleanup if not needed');
    }

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (issues.length > 0) {
      status = issues.some(
        issue => issue.includes('High error rate') || issue.includes('High memory usage')
      )
        ? 'unhealthy'
        : 'degraded';
    }

    return {
      status,
      issues,
      recommendations,
    };
  }

  /**
   * Perform health check with enhanced diagnostics
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Perform base health check
      const baseHealth = await super.healthCheck();

      if (!baseHealth) {
        return false;
      }

      // Check additional health indicators
      const healthStatus = this.getHealthStatus();

      // Log health status if not healthy
      if (healthStatus.status !== 'healthy') {
        this.logger.warn('Resource health check detected issues', {
          resourceName: this.config.name,
          status: healthStatus.status,
          issues: healthStatus.issues,
          recommendations: healthStatus.recommendations,
        });
      }

      return healthStatus.status !== 'unhealthy';
    } catch (error) {
      this.logger.error('Health check failed', {
        resourceName: this.config.name,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Enhanced cleanup with lifecycle management
   */
  async cleanup(): Promise<void> {
    try {
      // Perform base cleanup
      await super.cleanup();

      // Reset metrics
      this.operationCount = 0;
      this.errorCount = 0;
      this.totalExecutionTime = 0;
      this.memoryUsage = 0;

      this.logger.info('Enhanced resource cleanup completed', {
        resourceName: this.config.name,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('Enhanced resource cleanup failed', {
        resourceName: this.config.name,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  /**
   * Get lifecycle manager instance
   */
  getLifecycleManager(): ResourceLifecycleManager | undefined {
    return this.lifecycleManager;
  }

  /**
   * Get lifecycle metrics
   */
  getLifecycleMetrics(): any {
    if (!this.lifecycleManager) {
      return null;
    }

    return this.lifecycleManager.getResourceMetrics(this.config.name);
  }

  /**
   * Get all lifecycle metrics
   */
  getAllLifecycleMetrics(): any[] {
    if (!this.lifecycleManager) {
      return [];
    }

    return this.lifecycleManager.getAllMetrics();
  }

  /**
   * Get health summary
   */
  getHealthSummary(): any {
    if (!this.lifecycleManager) {
      return null;
    }

    return this.lifecycleManager.getHealthSummary();
  }

  /**
   * Destroy the enhanced resource
   */
  async destroy(): Promise<void> {
    try {
      // Stop lifecycle management
      if (this.lifecycleManager) {
        await this.lifecycleManager.destroy();
        this.lifecycleManager = undefined as any;
      }

      // Perform base cleanup
      await this.cleanup();

      this.logger.info('Enhanced resource destroyed', {
        resourceName: this.config.name,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('Enhanced resource destruction failed', {
        resourceName: this.config.name,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }
}
