/**
 * Performance WebSocket Events
 *
 * Handles real-time performance metrics broadcasting, alerts, and
 * system monitoring via WebSocket connections.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import { EventEmitter } from 'events';
import { WebSocketServer } from '../WebSocketServer.js';
import {
  PerformanceMetrics,
  WEBSOCKET_EVENTS
} from '../types.js';

/**
 * Performance Events Manager for WebSocket communication
 *
 * @example
 * ```typescript
 * const performanceEvents = new PerformanceEvents(wsServer);
 * performanceEvents.broadcastMetrics({ memoryUsage: {...}, responseTime: 150 });
 * ```
 *
 * @since 2.0.0
 */
export class PerformanceEvents extends EventEmitter {
  constructor(private wsServer: WebSocketServer) {
    super();
  }

  /**
   * Broadcasts performance metrics to all subscribed clients
   *
   * @param metrics - Performance metrics data
   *
   * @example
   * ```typescript
   * performanceEvents.broadcastMetrics({
   *   memoryUsage: { rss: 100, heapUsed: 50, heapTotal: 200, external: 10 },
   *   responseTime: 150,
   *   cacheHitRate: 85,
   *   errorRate: 0.5,
   *   activeConnections: 25
   * });
   * ```
   */
  broadcastMetrics(metrics: Omit<PerformanceMetrics, 'timestamp'>): void {
    const performanceData: PerformanceMetrics = {
      ...metrics,
      timestamp: Date.now()
    };

    this.wsServer.broadcast(WEBSOCKET_EVENTS.PERFORMANCE_METRICS, performanceData);
    this.emit('performance:metrics', performanceData);
  }

  /**
   * Broadcasts performance alert
   *
   * @param alertType - Type of performance alert
   * @param severity - Alert severity level
   * @param message - Alert message
   * @param metrics - Related performance metrics
   */
  broadcastPerformanceAlert(
    alertType: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    message: string,
    metrics?: Partial<PerformanceMetrics>
  ): void {
    const alert = {
      id: this.generateAlertId(),
      type: alertType,
      severity,
      message,
      metrics,
      timestamp: Date.now()
    };

    this.wsServer.broadcast(WEBSOCKET_EVENTS.PERFORMANCE_ALERT, alert);
    this.emit('performance:alert', alert);
  }

  /**
   * Broadcasts memory usage alert
   *
   * @param memoryUsage - Current memory usage
   * @param threshold - Memory threshold that was exceeded
   */
  broadcastMemoryAlert(memoryUsage: number, threshold: number): void {
    this.broadcastPerformanceAlert(
      'memory_usage',
      memoryUsage > threshold * 1.5 ? 'critical' : 'high',
      `Memory usage is ${memoryUsage.toFixed(1)}MB, exceeding threshold of ${threshold}MB`,
      { memoryUsage: { rss: memoryUsage, heapUsed: 0, heapTotal: 0, external: 0 } }
    );
  }

  /**
   * Broadcasts response time alert
   *
   * @param responseTime - Current response time in milliseconds
   * @param threshold - Response time threshold that was exceeded
   */
  broadcastResponseTimeAlert(responseTime: number, threshold: number): void {
    this.broadcastPerformanceAlert(
      'response_time',
      responseTime > threshold * 2 ? 'critical' : 'high',
      `Response time is ${responseTime}ms, exceeding threshold of ${threshold}ms`,
      { responseTime }
    );
  }

  /**
   * Broadcasts cache performance alert
   *
   * @param hitRate - Current cache hit rate percentage
   * @param threshold - Minimum hit rate threshold
   */
  broadcastCacheAlert(hitRate: number, threshold: number): void {
    this.broadcastPerformanceAlert(
      'cache_performance',
      hitRate < threshold * 0.5 ? 'critical' : 'medium',
      `Cache hit rate is ${hitRate.toFixed(1)}%, below threshold of ${threshold}%`,
      { cacheHitRate: hitRate }
    );
  }

  /**
   * Broadcasts error rate alert
   *
   * @param errorRate - Current error rate percentage
   * @param threshold - Maximum error rate threshold
   */
  broadcastErrorRateAlert(errorRate: number, threshold: number): void {
    this.broadcastPerformanceAlert(
      'error_rate',
      errorRate > threshold * 2 ? 'critical' : 'high',
      `Error rate is ${errorRate.toFixed(2)}%, exceeding threshold of ${threshold}%`,
      { errorRate }
    );
  }

  /**
   * Broadcasts system status update
   *
   * @param status - System status
   * @param message - Status message
   * @param details - Additional status details
   */
  broadcastSystemStatus(
    status: 'healthy' | 'degraded' | 'unhealthy' | 'maintenance',
    message: string,
    details?: Record<string, any>
  ): void {
    const systemStatus = {
      status,
      message,
      details,
      timestamp: Date.now()
    };

    this.wsServer.broadcast(WEBSOCKET_EVENTS.SYSTEM_STATUS, systemStatus);
    this.emit('system:status', systemStatus);
  }

  /**
   * Broadcasts maintenance notification
   *
   * @param startTime - Maintenance start time
   * @param endTime - Expected maintenance end time
   * @param message - Maintenance message
   * @param affectedServices - List of affected services
   */
  broadcastMaintenanceNotification(
    startTime: number,
    endTime: number,
    message: string,
    affectedServices?: string[]
  ): void {
    const maintenance = {
      startTime,
      endTime,
      message,
      affectedServices: affectedServices || [],
      timestamp: Date.now()
    };

    this.wsServer.broadcast(WEBSOCKET_EVENTS.SYSTEM_MAINTENANCE, maintenance);
    this.emit('system:maintenance', maintenance);
  }

  /**
   * Broadcasts system error
   *
   * @param errorType - Type of system error
   * @param message - Error message
   * @param details - Error details
   * @param severity - Error severity
   */
  broadcastSystemError(
    errorType: string,
    message: string,
    details?: Record<string, any>,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'high'
  ): void {
    const systemError = {
      type: errorType,
      message,
      details,
      severity,
      timestamp: Date.now()
    };

    this.wsServer.broadcast(WEBSOCKET_EVENTS.SYSTEM_ERROR, systemError);
    this.emit('system:error', systemError);
  }

  /**
   * Generates unique alert ID
   *
   * @returns Unique alert identifier
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
