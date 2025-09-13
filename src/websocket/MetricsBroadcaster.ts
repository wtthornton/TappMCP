/**
 * Metrics Broadcaster Service
 *
 * Provides real-time broadcasting of performance metrics, workflow status,
 * and system monitoring data to connected WebSocket clients.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import { EventEmitter } from 'events';
import { WebSocketServer } from './WebSocketServer.js';
import { WorkflowEvents } from './events/WorkflowEvents.js';
import { PerformanceEvents } from './events/PerformanceEvents.js';
import { globalPerformanceMonitor } from '../monitoring/performance-monitor.js';
import {
  PerformanceMetrics,
  WorkflowStatusUpdate,
  WEBSOCKET_EVENTS
} from './types.js';

/**
 * Metrics Broadcaster for real-time data streaming
 *
 * @example
 * ```typescript
 * const broadcaster = new MetricsBroadcaster(wsServer);
 * broadcaster.startBroadcasting();
 * broadcaster.broadcastWorkflowStatus('workflow-123', 'running', 50);
 * ```
 *
 * @since 2.0.0
 */
export class MetricsBroadcaster extends EventEmitter {
  private workflowEvents: WorkflowEvents;
  private performanceEvents: PerformanceEvents;
  private isBroadcasting = false;
  private broadcastInterval: NodeJS.Timeout | null = null;
  private lastMetrics: PerformanceMetrics | null = null;

  constructor(private wsServer: WebSocketServer) {
    super();
    this.workflowEvents = new WorkflowEvents(wsServer);
    this.performanceEvents = new PerformanceEvents(wsServer);

    this.setupEventHandlers();
  }

  /**
   * Starts broadcasting metrics at regular intervals
   *
   * @param intervalMs - Broadcasting interval in milliseconds (default: 5000)
   *
   * @example
   * ```typescript
   * broadcaster.startBroadcasting(10000); // Broadcast every 10 seconds
   * ```
   */
  startBroadcasting(intervalMs: number = 5000): void {
    if (this.isBroadcasting) {
      return;
    }

    this.isBroadcasting = true;
    this.broadcastInterval = setInterval(() => {
      this.broadcastCurrentMetrics();
    }, intervalMs);

    this.emit('broadcasting:started', { intervalMs });
    console.log(`Metrics broadcasting started with ${intervalMs}ms interval`);
  }

  /**
   * Stops broadcasting metrics
   *
   * @example
   * ```typescript
   * broadcaster.stopBroadcasting();
   * ```
   */
  stopBroadcasting(): void {
    if (!this.isBroadcasting) {
      return;
    }

    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval);
      this.broadcastInterval = null;
    }

    this.isBroadcasting = false;
    this.emit('broadcasting:stopped');
    console.log('Metrics broadcasting stopped');
  }

  /**
   * Broadcasts current performance metrics
   *
   * @example
   * ```typescript
   * broadcaster.broadcastCurrentMetrics();
   * ```
   */
  broadcastCurrentMetrics(): void {
    const memUsage = process.memoryUsage();
    const report = globalPerformanceMonitor.generateReport(60000); // Last minute

    const metrics: PerformanceMetrics = {
      memoryUsage: {
        rss: memUsage.rss / (1024 * 1024), // Convert to MB
        heapUsed: memUsage.heapUsed / (1024 * 1024),
        heapTotal: memUsage.heapTotal / (1024 * 1024),
        external: memUsage.external / (1024 * 1024)
      },
      responseTime: report.summary.averageResponseTime,
      cacheHitRate: report.summary.cacheHitRate,
      errorRate: report.summary.errorRate,
      activeConnections: this.wsServer.getConnectionCount(),
      timestamp: Date.now()
    };

    this.lastMetrics = metrics;
    this.performanceEvents.broadcastMetrics(metrics);
    this.emit('metrics:broadcast', metrics);
  }

  /**
   * Broadcasts workflow status update
   *
   * @param workflowId - Unique workflow identifier
   * @param status - Workflow status
   * @param progress - Progress percentage (0-100)
   * @param currentPhase - Current execution phase
   * @param message - Optional status message
   *
   * @example
   * ```typescript
   * broadcaster.broadcastWorkflowStatus('workflow-123', 'running', 50, 'Processing data');
   * ```
   */
  broadcastWorkflowStatus(
    workflowId: string,
    status: 'pending' | 'running' | 'completed' | 'failed' | 'paused',
    progress: number,
    currentPhase: string,
    message?: string
  ): void {
    this.workflowEvents.broadcastWorkflowUpdate(
      workflowId,
      status,
      progress,
      currentPhase,
      message
    );
    this.emit('workflow:status:broadcast', { workflowId, status, progress });
  }

  /**
   * Broadcasts workflow progress update
   *
   * @param workflowId - Unique workflow identifier
   * @param progress - Progress percentage (0-100)
   * @param message - Progress message
   *
   * @example
   * ```typescript
   * broadcaster.broadcastWorkflowProgress('workflow-123', 75, 'Almost done');
   * ```
   */
  broadcastWorkflowProgress(
    workflowId: string,
    progress: number,
    message: string
  ): void {
    this.workflowEvents.broadcastWorkflowProgress(workflowId, progress, message);
    this.emit('workflow:progress:broadcast', { workflowId, progress });
  }

  /**
   * Broadcasts workflow completion
   *
   * @param workflowId - Unique workflow identifier
   * @param success - Whether workflow completed successfully
   * @param message - Completion message
   * @param results - Optional workflow results
   *
   * @example
   * ```typescript
   * broadcaster.broadcastWorkflowCompletion('workflow-123', true, 'Success!', results);
   * ```
   */
  broadcastWorkflowCompletion(
    workflowId: string,
    success: boolean,
    message: string,
    results?: any
  ): void {
    this.workflowEvents.broadcastWorkflowCompletion(workflowId, success, message, results);
    this.emit('workflow:completion:broadcast', { workflowId, success });
  }

  /**
   * Broadcasts performance alert
   *
   * @param alertType - Type of alert
   * @param severity - Alert severity
   * @param message - Alert message
   * @param metrics - Related metrics
   *
   * @example
   * ```typescript
   * broadcaster.broadcastPerformanceAlert('memory_usage', 'high', 'Memory usage high');
   * ```
   */
  broadcastPerformanceAlert(
    alertType: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    message: string,
    metrics?: Partial<PerformanceMetrics>
  ): void {
    this.performanceEvents.broadcastPerformanceAlert(alertType, severity, message, metrics);
    this.emit('performance:alert:broadcast', { alertType, severity });
  }

  /**
   * Broadcasts system status update
   *
   * @param status - System status
   * @param message - Status message
   * @param details - Additional details
   *
   * @example
   * ```typescript
   * broadcaster.broadcastSystemStatus('healthy', 'All systems operational');
   * ```
   */
  broadcastSystemStatus(
    status: 'healthy' | 'degraded' | 'unhealthy' | 'maintenance',
    message: string,
    details?: Record<string, any>
  ): void {
    this.performanceEvents.broadcastSystemStatus(status, message, details);
    this.emit('system:status:broadcast', { status, message });
  }

  /**
   * Gets the last broadcasted metrics
   *
   * @returns Last metrics or null if none broadcasted
   *
   * @example
   * ```typescript
   * const lastMetrics = broadcaster.getLastMetrics();
   * console.log('Last memory usage:', lastMetrics?.memoryUsage.rss);
   * ```
   */
  getLastMetrics(): PerformanceMetrics | null {
    return this.lastMetrics;
  }

  /**
   * Checks if broadcasting is active
   *
   * @returns True if broadcasting is active
   */
  isBroadcastingActive(): boolean {
    return this.isBroadcasting;
  }

  /**
   * Gets broadcasting statistics
   *
   * @returns Broadcasting statistics
   */
  getBroadcastingStats(): {
    isActive: boolean;
    intervalMs: number;
    lastBroadcast: number | null;
    totalClients: number;
  } {
    return {
      isActive: this.isBroadcasting,
      intervalMs: this.broadcastInterval ? 5000 : 0, // Default interval
      lastBroadcast: this.lastMetrics?.timestamp || null,
      totalClients: this.wsServer.getConnectionCount()
    };
  }

  private setupEventHandlers(): void {
    // Listen to performance monitor events
    globalPerformanceMonitor.on('alert-triggered', (alert) => {
      this.broadcastPerformanceAlert(
        alert.metric,
        alert.severity,
        alert.message,
        { responseTime: alert.threshold }
      );
    });

    // Listen to workflow events
    this.workflowEvents.on('workflow:status:update', (update) => {
      this.emit('workflow:status:update', update);
    });

    this.workflowEvents.on('workflow:completed', (update) => {
      this.emit('workflow:completed', update);
    });

    this.workflowEvents.on('workflow:failed', (update) => {
      this.emit('workflow:failed', update);
    });

    // Listen to performance events
    this.performanceEvents.on('performance:metrics', (metrics) => {
      this.emit('performance:metrics', metrics);
    });

    this.performanceEvents.on('performance:alert', (alert) => {
      this.emit('performance:alert', alert);
    });
  }
}
