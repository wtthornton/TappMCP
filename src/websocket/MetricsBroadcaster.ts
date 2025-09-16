/**
 * Metrics Broadcaster for Real-Time Performance Data
 *
 * Broadcasts real-time performance metrics, workflow status updates,
 * and system health data via WebSocket connections.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import { WebSocketServer } from './WebSocketServer.js';
import { PerformanceMetrics, WorkflowStatusUpdate } from './types.js';

/**
 * Performance metrics data structure
 */
export interface PerformanceData {
  timestamp: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  responseTime: {
    average: number;
    p95: number;
    p99: number;
  };
  cache: {
    hitRate: number;
    missRate: number;
    size: number;
  };
  errors: {
    count: number;
    rate: number;
    lastError?: string;
  };
  throughput: {
    requestsPerSecond: number;
    bytesPerSecond: number;
  };
}

/**
 * Workflow status data structure
 */
export interface WorkflowStatusData {
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  currentPhase: string;
  startTime: number;
  estimatedCompletion?: number;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * System health data structure
 */
export interface SystemHealthData {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  version: string;
  lastRestart: number;
  activeConnections: number;
  queueSize: number;
  alerts: Array<{
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: number;
  }>;
}

/**
 * Metrics Broadcaster class
 */
export class MetricsBroadcaster {
  private wsServer: WebSocketServer;
  private performanceInterval: NodeJS.Timeout | null = null;
  private workflowStatusInterval: NodeJS.Timeout | null = null;
  private systemHealthInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private performanceData: PerformanceData | null = null;
  private workflowStatuses: Map<string, WorkflowStatusData> = new Map();
  private systemHealth: SystemHealthData | null = null;

  constructor(wsServer: WebSocketServer) {
    this.wsServer = wsServer;
  }

  /**
   * Starts broadcasting metrics
   */
  start(): void {
    if (this.isRunning) {
      console.warn('MetricsBroadcaster is already running');
      return;
    }

    console.log('Starting MetricsBroadcaster...');
    this.isRunning = true;

    // Start performance metrics broadcasting (every 5 seconds)
    this.performanceInterval = setInterval(() => {
      this.broadcastPerformanceMetrics();
    }, 5000);

    // Start workflow status broadcasting (every 2 seconds)
    this.workflowStatusInterval = setInterval(() => {
      this.broadcastWorkflowStatuses();
    }, 2000);

    // Start system health broadcasting (every 10 seconds)
    this.systemHealthInterval = setInterval(() => {
      this.broadcastSystemHealth();
    }, 10000);

    console.log('MetricsBroadcaster started successfully');
  }

  /**
   * Stops broadcasting metrics
   */
  stop(): void {
    if (!this.isRunning) {
      console.warn('MetricsBroadcaster is not running');
      return;
    }

    console.log('Stopping MetricsBroadcaster...');
    this.isRunning = false;

    if (this.performanceInterval) {
      clearInterval(this.performanceInterval);
      this.performanceInterval = null;
    }

    if (this.workflowStatusInterval) {
      clearInterval(this.workflowStatusInterval);
      this.workflowStatusInterval = null;
    }

    if (this.systemHealthInterval) {
      clearInterval(this.systemHealthInterval);
      this.systemHealthInterval = null;
    }

    console.log('MetricsBroadcaster stopped');
  }

  /**
   * Updates workflow status
   */
  updateWorkflowStatus(workflowId: string, status: WorkflowStatusData): void {
    this.workflowStatuses.set(workflowId, status);

    // Immediately broadcast status change
    this.broadcastWorkflowStatusUpdate(workflowId, status);
  }

  /**
   * Removes workflow status
   */
  removeWorkflowStatus(workflowId: string): void {
    this.workflowStatuses.delete(workflowId);
  }

  /**
   * Gets current performance data
   */
  getPerformanceData(): PerformanceData | null {
    return this.performanceData;
  }

  /**
   * Gets current workflow statuses
   */
  getWorkflowStatuses(): Map<string, WorkflowStatusData> {
    return new Map(this.workflowStatuses);
  }

  /**
   * Gets current system health
   */
  getSystemHealth(): SystemHealthData | null {
    return this.systemHealth;
  }

  /**
   * Broadcasts performance metrics
   */
  private broadcastPerformanceMetrics(): void {
    try {
      const performanceData = this.collectPerformanceData();
      this.performanceData = performanceData;

      const metrics: PerformanceMetrics = {
        memoryUsage: {
          rss: performanceData.memory.used,
          heapUsed: performanceData.memory.used,
          heapTotal: performanceData.memory.total,
          external: 0,
        },
        responseTime: performanceData.responseTime.average,
        cacheHitRate: performanceData.cache.hitRate,
        errorRate: performanceData.errors.rate,
        activeConnections: this.wsServer.getConnectionCount(),
        timestamp: Date.now(),
      };

      this.wsServer.broadcast('performance:metrics', metrics);
    } catch (error) {
      console.error('Error broadcasting performance metrics:', error);
    }
  }

  /**
   * Broadcasts workflow statuses
   */
  private broadcastWorkflowStatuses(): void {
    try {
      if (this.workflowStatuses.size === 0) return;

      const statuses = Array.from(this.workflowStatuses.values());

      statuses.forEach(status => {
        const update: WorkflowStatusUpdate = {
          workflowId: status.workflowId,
          status: status.status as 'pending' | 'running' | 'completed' | 'failed' | 'paused',
          progress: status.progress,
          currentPhase: status.currentPhase,
          message: status.error || `Workflow ${status.status}`,
          timestamp: Date.now(),
        };

        this.wsServer.broadcast('workflow:status:update', update);
      });
    } catch (error) {
      console.error('Error broadcasting workflow statuses:', error);
    }
  }

  /**
   * Broadcasts individual workflow status update
   */
  private broadcastWorkflowStatusUpdate(workflowId: string, status: WorkflowStatusData): void {
    try {
      const update: WorkflowStatusUpdate = {
        workflowId: status.workflowId,
        status: status.status as 'pending' | 'running' | 'completed' | 'failed' | 'paused',
        progress: status.progress,
        currentPhase: status.currentPhase,
        message: status.error || `Workflow ${status.status}`,
        timestamp: Date.now(),
      };

      this.wsServer.broadcast('workflow:status:update', update);
    } catch (error) {
      console.error('Error broadcasting workflow status update:', error);
    }
  }

  /**
   * Broadcasts system health
   */
  private broadcastSystemHealth(): void {
    try {
      const healthData = this.collectSystemHealth();
      this.systemHealth = healthData;

      this.wsServer.broadcast('system_health', {
        type: 'system_health',
        data: healthData,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error broadcasting system health:', error);
    }
  }

  /**
   * Collects current performance data
   */
  private collectPerformanceData(): PerformanceData {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      timestamp: Date.now(),
      memory: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100,
      },
      cpu: {
        usage: (cpuUsage.user + cpuUsage.system) / 1000000, // Convert to seconds
        loadAverage: process.platform === 'win32' ? [0, 0, 0] : require('os').loadavg(),
      },
      responseTime: {
        average: this.calculateAverageResponseTime(),
        p95: this.calculateP95ResponseTime(),
        p99: this.calculateP99ResponseTime(),
      },
      cache: {
        hitRate: this.calculateCacheHitRate(),
        missRate: this.calculateCacheMissRate(),
        size: this.calculateCacheSize(),
      },
      errors: {
        count: this.getErrorCount(),
        rate: this.getErrorRate(),
        lastError: this.getLastError() || '',
      },
      throughput: {
        requestsPerSecond: this.calculateRequestsPerSecond(),
        bytesPerSecond: this.calculateBytesPerSecond(),
      },
    };
  }

  /**
   * Collects current system health data
   */
  private collectSystemHealth(): SystemHealthData {
    const uptime = process.uptime();
    const activeConnections = this.wsServer.getConnectionCount();

    return {
      status: this.determineSystemStatus(),
      uptime: uptime,
      version: process.env.npm_package_version || '2.0.0',
      lastRestart: Date.now() - uptime * 1000,
      activeConnections: activeConnections,
      queueSize: this.getQueueSize(),
      alerts: this.getActiveAlerts(),
    };
  }

  /**
   * Calculates average response time
   */
  private calculateAverageResponseTime(): number {
    // This would integrate with actual request tracking
    return Math.random() * 100 + 50; // Mock data for now
  }

  /**
   * Calculates P95 response time
   */
  private calculateP95ResponseTime(): number {
    // This would integrate with actual request tracking
    return Math.random() * 200 + 100; // Mock data for now
  }

  /**
   * Calculates P99 response time
   */
  private calculateP99ResponseTime(): number {
    // This would integrate with actual request tracking
    return Math.random() * 500 + 200; // Mock data for now
  }

  /**
   * Calculates cache hit rate
   */
  private calculateCacheHitRate(): number {
    // This would integrate with actual cache tracking
    return Math.random() * 0.3 + 0.7; // Mock data for now
  }

  /**
   * Calculates cache miss rate
   */
  private calculateCacheMissRate(): number {
    return 1 - this.calculateCacheHitRate();
  }

  /**
   * Calculates cache size
   */
  private calculateCacheSize(): number {
    // This would integrate with actual cache tracking
    return Math.floor(Math.random() * 1000000); // Mock data for now
  }

  /**
   * Gets error count
   */
  private getErrorCount(): number {
    // This would integrate with actual error tracking
    return Math.floor(Math.random() * 10); // Mock data for now
  }

  /**
   * Gets error rate
   */
  private getErrorRate(): number {
    // This would integrate with actual error tracking
    return Math.random() * 0.01; // Mock data for now
  }

  /**
   * Gets last error message
   */
  private getLastError(): string | undefined {
    // This would integrate with actual error tracking
    return Math.random() > 0.8 ? 'Sample error message' : undefined;
  }

  /**
   * Calculates requests per second
   */
  private calculateRequestsPerSecond(): number {
    // This would integrate with actual request tracking
    return Math.random() * 100 + 50; // Mock data for now
  }

  /**
   * Calculates bytes per second
   */
  private calculateBytesPerSecond(): number {
    // This would integrate with actual request tracking
    return Math.random() * 1000000 + 500000; // Mock data for now
  }

  /**
   * Determines system status
   */
  private determineSystemStatus(): 'healthy' | 'warning' | 'critical' {
    const memUsage = process.memoryUsage();
    const memoryPercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;

    if (memoryPercentage > 90) return 'critical';
    if (memoryPercentage > 75) return 'warning';
    return 'healthy';
  }

  /**
   * Gets queue size
   */
  private getQueueSize(): number {
    // This would integrate with actual queue tracking
    return Math.floor(Math.random() * 100); // Mock data for now
  }

  /**
   * Gets active alerts
   */
  private getActiveAlerts(): Array<{
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: number;
  }> {
    // This would integrate with actual alert system
    return []; // Mock data for now
  }

  /**
   * Broadcast workflow event
   */
  broadcastWorkflowEvent(event: {
    workflowId: string;
    eventType: string;
    data: any;
    timestamp: number;
  }): void {
    if (!this.isRunning) return;

    const message = {
      type: 'workflow-event',
      data: event,
      timestamp: Date.now(),
    };

    this.wsServer.broadcast('workflow:status:update', message);
  }
}
