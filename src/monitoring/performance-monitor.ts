/**
 * Performance Monitoring System
 *
 * Provides comprehensive performance monitoring capabilities including
 * timing, memory usage, cache performance, and system metrics.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import { EventEmitter } from 'events';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  category: 'timing' | 'memory' | 'cache' | 'system' | 'custom';
  tags?: Record<string, string> | undefined;
}

export interface PerformanceAlert {
  id: string;
  metric: string;
  threshold: number;
  currentValue: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  resolved?: boolean;
}

export interface PerformanceReport {
  timestamp: number;
  duration: number;
  metrics: PerformanceMetric[];
  alerts: PerformanceAlert[];
  summary: {
    totalOperations: number;
    averageResponseTime: number;
    memoryUsage: number;
    cacheHitRate: number;
    errorRate: number;
  };
}

/**
 * Performance Monitor for tracking system performance metrics
 *
 * @example
 * ```typescript
 * const monitor = new PerformanceMonitor();
 * monitor.startTimer('workflow-execution');
 * // ... perform operation
 * monitor.endTimer('workflow-execution');
 * ```
 *
 * @since 2.0.0
 */
export class PerformanceMonitor extends EventEmitter {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private timers: Map<string, number> = new Map();
  private alerts: Map<string, PerformanceAlert> = new Map();
  private thresholds: Map<string, { min?: number; max?: number }> = new Map();
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | undefined;

  constructor() {
    super();
    this.setupDefaultThresholds();
  }

  /**
   * Starts monitoring performance metrics
   *
   * @param intervalMs - Monitoring interval in milliseconds (default: 30000)
   *
   * @example
   * ```typescript
   * monitor.startMonitoring(30000); // Monitor every 30 seconds
   * ```
   */
  startMonitoring(intervalMs: number = 30000): void {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.collectSystemMetrics();
      this.checkThresholds();
    }, intervalMs);

    this.emit('monitoring-started', { interval: intervalMs });
  }

  /**
   * Stops monitoring performance metrics
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    this.emit('monitoring-stopped');
  }

  /**
   * Starts a timer for measuring operation duration
   *
   * @param name - Timer name/identifier
   *
   * @example
   * ```typescript
   * monitor.startTimer('workflow-execution');
   * ```
   */
  startTimer(name: string): void {
    this.timers.set(name, Date.now());
  }

  /**
   * Ends a timer and records the duration
   *
   * @param name - Timer name/identifier
   * @param tags - Optional tags for the metric
   * @returns Duration in milliseconds
   *
   * @example
   * ```typescript
   * const duration = monitor.endTimer('workflow-execution', { workflow: 'sdlc' });
   * ```
   */
  endTimer(name: string, tags?: Record<string, string>): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      throw new Error(`Timer '${name}' was not started`);
    }

    const duration = Date.now() - startTime;
    this.timers.delete(name);

    this.recordMetric({
      name: `${name}-duration`,
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      category: 'timing',
      tags,
    });

    return duration;
  }

  /**
   * Records a custom performance metric
   *
   * @param metric - Performance metric to record
   *
   * @example
   * ```typescript
   * monitor.recordMetric({
   *   name: 'cache-hit-rate',
   *   value: 0.85,
   *   unit: 'ratio',
   *   timestamp: Date.now(),
   *   category: 'cache'
   * });
   * ```
   */
  recordMetric(metric: PerformanceMetric): void {
    const categoryMetrics = this.metrics.get(metric.category) || [];
    categoryMetrics.push(metric);

    // Keep only last 1000 metrics per category
    if (categoryMetrics.length > 1000) {
      categoryMetrics.splice(0, categoryMetrics.length - 1000);
    }

    this.metrics.set(metric.category, categoryMetrics);
    this.emit('metric-recorded', metric);
  }

  /**
   * Records memory usage metrics
   *
   * @param tags - Optional tags for the metric
   */
  recordMemoryUsage(tags?: Record<string, string>): void {
    const memUsage = process.memoryUsage();

    this.recordMetric({
      name: 'memory-rss',
      value: memUsage.rss,
      unit: 'bytes',
      timestamp: Date.now(),
      category: 'memory',
      tags,
    });

    this.recordMetric({
      name: 'memory-heap-used',
      value: memUsage.heapUsed,
      unit: 'bytes',
      timestamp: Date.now(),
      category: 'memory',
      tags,
    });

    this.recordMetric({
      name: 'memory-heap-total',
      value: memUsage.heapTotal,
      unit: 'bytes',
      timestamp: Date.now(),
      category: 'memory',
      tags,
    });

    this.recordMetric({
      name: 'memory-external',
      value: memUsage.external,
      unit: 'bytes',
      timestamp: Date.now(),
      category: 'memory',
      tags,
    });
  }

  /**
   * Records cache performance metrics
   *
   * @param cacheName - Name of the cache
   * @param hits - Number of cache hits
   * @param misses - Number of cache misses
   * @param size - Current cache size
   * @param tags - Optional tags for the metric
   */
  recordCacheMetrics(
    cacheName: string,
    hits: number,
    misses: number,
    size: number,
    tags?: Record<string, string>
  ): void {
    const total = hits + misses;
    const hitRate = total > 0 ? hits / total : 0;

    this.recordMetric({
      name: `${cacheName}-hit-rate`,
      value: hitRate,
      unit: 'ratio',
      timestamp: Date.now(),
      category: 'cache',
      tags: { ...tags, cache: cacheName },
    });

    this.recordMetric({
      name: `${cacheName}-size`,
      value: size,
      unit: 'count',
      timestamp: Date.now(),
      category: 'cache',
      tags: { ...tags, cache: cacheName },
    });
  }

  /**
   * Sets performance thresholds for alerting
   *
   * @param metricName - Name of the metric
   * @param thresholds - Min/max thresholds
   *
   * @example
   * ```typescript
   * monitor.setThreshold('workflow-execution-duration', { max: 5000 }); // 5 seconds
   * ```
   */
  setThreshold(metricName: string, thresholds: { min?: number; max?: number }): void {
    this.thresholds.set(metricName, thresholds);
  }

  /**
   * Gets current performance metrics
   *
   * @param category - Optional category filter
   * @returns Array of performance metrics
   */
  getMetrics(category?: string): PerformanceMetric[] {
    if (category) {
      return this.metrics.get(category) || [];
    }

    const allMetrics: PerformanceMetric[] = [];
    for (const metrics of this.metrics.values()) {
      allMetrics.push(...metrics);
    }
    return allMetrics;
  }

  /**
   * Gets active performance alerts
   *
   * @returns Array of active alerts
   */
  getAlerts(): PerformanceAlert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.resolved);
  }

  /**
   * Generates a comprehensive performance report
   *
   * @param duration - Report duration in milliseconds (default: 300000 = 5 minutes)
   * @returns Performance report
   */
  generateReport(duration: number = 300000): PerformanceReport {
    const now = Date.now();
    const startTime = now - duration;

    const allMetrics = this.getMetrics().filter(m => m.timestamp >= startTime);
    const alerts = this.getAlerts();

    const timingMetrics = allMetrics.filter(m => m.category === 'timing');
    const memoryMetrics = allMetrics.filter(m => m.category === 'memory');
    const cacheMetrics = allMetrics.filter(m => m.category === 'cache');

    const averageResponseTime =
      timingMetrics.length > 0
        ? timingMetrics.reduce((sum, m) => sum + m.value, 0) / timingMetrics.length
        : 0;

    const memoryUsage =
      memoryMetrics.length > 0
        ? memoryMetrics.filter(m => m.name === 'memory-rss').reduce((sum, m) => sum + m.value, 0) /
          memoryMetrics.filter(m => m.name === 'memory-rss').length
        : 0;

    const cacheHitRate =
      cacheMetrics.length > 0
        ? cacheMetrics
            .filter(m => m.name.includes('hit-rate'))
            .reduce((sum, m) => sum + m.value, 0) /
          cacheMetrics.filter(m => m.name.includes('hit-rate')).length
        : 0;

    return {
      timestamp: now,
      duration,
      metrics: allMetrics,
      alerts,
      summary: {
        totalOperations: timingMetrics.length,
        averageResponseTime,
        memoryUsage,
        cacheHitRate,
        errorRate: alerts.length / Math.max(timingMetrics.length, 1),
      },
    };
  }

  /**
   * Clears all metrics and alerts
   */
  clear(): void {
    this.metrics.clear();
    this.alerts.clear();
    this.timers.clear();
    this.emit('metrics-cleared');
  }

  private setupDefaultThresholds(): void {
    this.setThreshold('workflow-execution-duration', { max: 30000 }); // 30 seconds
    this.setThreshold('memory-rss', { max: 500 * 1024 * 1024 }); // 500MB
    this.setThreshold('cache-hit-rate', { min: 0.7 }); // 70%
  }

  private collectSystemMetrics(): void {
    this.recordMemoryUsage();

    // Collect CPU usage if available
    const cpuUsage = process.cpuUsage();
    this.recordMetric({
      name: 'cpu-user',
      value: cpuUsage.user,
      unit: 'microseconds',
      timestamp: Date.now(),
      category: 'system',
    });

    this.recordMetric({
      name: 'cpu-system',
      value: cpuUsage.system,
      unit: 'microseconds',
      timestamp: Date.now(),
      category: 'system',
    });
  }

  private checkThresholds(): void {
    const allMetrics = this.getMetrics();
    const now = Date.now();
    const recentMetrics = allMetrics.filter(m => now - m.timestamp < 60000); // Last minute

    for (const metric of recentMetrics) {
      const threshold = this.thresholds.get(metric.name);
      if (!threshold) {continue;}

      const alertId = `${metric.name}-${Math.floor(metric.timestamp / 60000)}`;

      if (threshold.max && metric.value > threshold.max) {
        this.createAlert(alertId, metric, threshold.max, 'high');
      } else if (threshold.min && metric.value < threshold.min) {
        this.createAlert(alertId, metric, threshold.min, 'medium');
      }
    }
  }

  private createAlert(
    alertId: string,
    metric: PerformanceMetric,
    threshold: number,
    severity: PerformanceAlert['severity']
  ): void {
    if (this.alerts.has(alertId)) {return;}

    const alert: PerformanceAlert = {
      id: alertId,
      metric: metric.name,
      threshold,
      currentValue: metric.value,
      severity,
      message: `${metric.name} ${severity === 'high' ? 'exceeded' : 'below'} threshold: ${metric.value} ${metric.unit} (threshold: ${threshold} ${metric.unit})`,
      timestamp: Date.now(),
    };

    this.alerts.set(alertId, alert);
    this.emit('alert-created', alert);
  }
}

// Global performance monitor instance
export const globalPerformanceMonitor = new PerformanceMonitor();
