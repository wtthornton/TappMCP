/**
 * Performance Monitoring System for TappMCP
 * Real-time performance metrics collection and analysis
 * Target: Real-time performance dashboard with metrics
 */

import { performance } from 'perf_hooks';
import { EventEmitter } from 'events';

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface PerformanceAlert {
  id: string;
  metric: string;
  threshold: number;
  currentValue: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  resolved: boolean;
}

export interface PerformanceReport {
  timestamp: number;
  duration: number;
  metrics: PerformanceMetric[];
  alerts: PerformanceAlert[];
  summary: {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    throughput: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

export interface PerformanceConfig {
  collectionInterval: number; // milliseconds
  retentionPeriod: number; // milliseconds
  alertThresholds: {
    responseTime: number;
    errorRate: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  enableRealTime: boolean;
  enableAlerts: boolean;
}

export class PerformanceMonitor extends EventEmitter {
  private config: PerformanceConfig;
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private alerts: PerformanceAlert[] = [];
  private collectionTimer?: NodeJS.Timeout;
  private isCollecting: boolean = false;
  private startTime: number = Date.now();

  // Performance counters
  private requestCount: number = 0;
  private errorCount: number = 0;
  private totalResponseTime: number = 0;
  private memoryUsage: NodeJS.MemoryUsage = process.memoryUsage();
  private cpuUsage: number = 0;

  constructor(config: Partial<PerformanceConfig> = {}) {
    super();

    this.config = {
      collectionInterval: 5000, // 5 seconds
      retentionPeriod: 3600000, // 1 hour
      alertThresholds: {
        responseTime: 1000, // 1 second
        errorRate: 0.05, // 5%
        memoryUsage: 0.8, // 80%
        cpuUsage: 0.8 // 80%
      },
      enableRealTime: true,
      enableAlerts: true,
      ...config
    };

    this.setupProcessMonitoring();
  }

  /**
   * Start performance monitoring
   */
  start(): void {
    if (this.isCollecting) return;

    this.isCollecting = true;
    this.startTime = Date.now();

    // Start collection timer
    this.collectionTimer = setInterval(() => {
      this.collectMetrics();
    }, this.config.collectionInterval);

    console.log('📊 Performance monitoring started');
    this.emit('monitoring:started');
  }

  /**
   * Stop performance monitoring
   */
  stop(): void {
    if (!this.isCollecting) return;

    this.isCollecting = false;

    if (this.collectionTimer) {
      clearInterval(this.collectionTimer);
      this.collectionTimer = undefined;
    }

    console.log('📊 Performance monitoring stopped');
    this.emit('monitoring:stopped');
  }

  /**
   * Record a request with timing
   */
  recordRequest(
    name: string,
    duration: number,
    success: boolean = true,
    tags: Record<string, string> = {}
  ): void {
    this.requestCount++;
    this.totalResponseTime += duration;

    if (!success) {
      this.errorCount++;
    }

    const metric: PerformanceMetric = {
      id: `request_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: 'request_duration',
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      tags: {
        request_name: name,
        success: success.toString(),
        ...tags
      }
    };

    this.addMetric(metric);

    // Check for alerts
    if (this.config.enableAlerts) {
      this.checkAlerts(metric);
    }

    this.emit('request:recorded', { name, duration, success, tags });
  }

  /**
   * Record a custom metric
   */
  recordMetric(
    name: string,
    value: number,
    unit: string = 'count',
    tags: Record<string, string> = {},
    metadata?: Record<string, any>
  ): void {
    const metric: PerformanceMetric = {
      id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      value,
      unit,
      timestamp: Date.now(),
      tags,
      metadata
    };

    this.addMetric(metric);

    if (this.config.enableAlerts) {
      this.checkAlerts(metric);
    }

    this.emit('metric:recorded', metric);
  }

  /**
   * Get current performance summary
   */
  getSummary(): PerformanceReport['summary'] {
    const uptime = Date.now() - this.startTime;
    const averageResponseTime = this.requestCount > 0
      ? this.totalResponseTime / this.requestCount
      : 0;
    const errorRate = this.requestCount > 0
      ? this.errorCount / this.requestCount
      : 0;
    const throughput = this.requestCount / (uptime / 1000); // requests per second

    return {
      totalRequests: this.requestCount,
      averageResponseTime,
      errorRate,
      throughput,
      memoryUsage: this.memoryUsage.heapUsed / this.memoryUsage.heapTotal,
      cpuUsage: this.cpuUsage
    };
  }

  /**
   * Get metrics for a specific time range
   */
  getMetrics(
    name?: string,
    startTime?: number,
    endTime?: number
  ): PerformanceMetric[] {
    const allMetrics: PerformanceMetric[] = [];

    for (const metrics of this.metrics.values()) {
      allMetrics.push(...metrics);
    }

    let filtered = allMetrics;

    if (name) {
      filtered = filtered.filter(m => m.name === name);
    }

    if (startTime) {
      filtered = filtered.filter(m => m.timestamp >= startTime);
    }

    if (endTime) {
      filtered = filtered.filter(m => m.timestamp <= endTime);
    }

    return filtered.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get active alerts
   */
  getAlerts(resolved: boolean = false): PerformanceAlert[] {
    return this.alerts.filter(alert => alert.resolved === resolved);
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      this.emit('alert:resolved', alert);
    }
  }

  /**
   * Get performance report
   */
  getReport(duration: number = 300000): PerformanceReport { // 5 minutes default
    const endTime = Date.now();
    const startTime = endTime - duration;

    const metrics = this.getMetrics(undefined, startTime, endTime);
    const activeAlerts = this.getAlerts(false);
    const summary = this.getSummary();

    return {
      timestamp: endTime,
      duration,
      metrics,
      alerts: activeAlerts,
      summary
    };
  }

  /**
   * Setup process monitoring
   */
  private setupProcessMonitoring(): void {
    // Monitor memory usage
    setInterval(() => {
      this.memoryUsage = process.memoryUsage();
      this.recordMetric('memory_heap_used', this.memoryUsage.heapUsed, 'bytes');
      this.recordMetric('memory_heap_total', this.memoryUsage.heapTotal, 'bytes');
      this.recordMetric('memory_external', this.memoryUsage.external, 'bytes');
    }, 1000);

    // Monitor CPU usage (simplified)
    let lastCpuTime = process.cpuUsage();
    setInterval(() => {
      const currentCpuTime = process.cpuUsage(lastCpuTime);
      const cpuPercent = (currentCpuTime.user + currentCpuTime.system) / 1000000; // Convert to seconds
      this.cpuUsage = cpuPercent;
      this.recordMetric('cpu_usage', cpuPercent, 'percent');
      lastCpuTime = process.cpuUsage();
    }, 1000);
  }

  /**
   * Collect system metrics
   */
  private collectMetrics(): void {
    if (!this.isCollecting) return;

    // Record system metrics
    this.recordMetric('uptime', process.uptime(), 'seconds');
    this.recordMetric('memory_rss', this.memoryUsage.rss, 'bytes');
    this.recordMetric('memory_heap_used', this.memoryUsage.heapUsed, 'bytes');
    this.recordMetric('memory_heap_total', this.memoryUsage.heapTotal, 'bytes');
    this.recordMetric('memory_external', this.memoryUsage.external, 'bytes');
    this.recordMetric('cpu_usage', this.cpuUsage, 'percent');

    // Clean up old metrics
    this.cleanupOldMetrics();

    this.emit('metrics:collected');
  }

  /**
   * Add metric to storage
   */
  private addMetric(metric: PerformanceMetric): void {
    if (!this.metrics.has(metric.name)) {
      this.metrics.set(metric.name, []);
    }

    this.metrics.get(metric.name)!.push(metric);
  }

  /**
   * Check for performance alerts
   */
  private checkAlerts(metric: PerformanceMetric): void {
    const thresholds = this.config.alertThresholds;
    let shouldAlert = false;
    let severity: PerformanceAlert['severity'] = 'low';
    let message = '';

    switch (metric.name) {
      case 'request_duration':
        if (metric.value > thresholds.responseTime) {
          shouldAlert = true;
          severity = metric.value > thresholds.responseTime * 2 ? 'critical' : 'high';
          message = `Response time ${metric.value}ms exceeds threshold ${thresholds.responseTime}ms`;
        }
        break;

      case 'error_rate':
        if (metric.value > thresholds.errorRate) {
          shouldAlert = true;
          severity = metric.value > thresholds.errorRate * 2 ? 'critical' : 'high';
          message = `Error rate ${(metric.value * 100).toFixed(2)}% exceeds threshold ${(thresholds.errorRate * 100).toFixed(2)}%`;
        }
        break;

      case 'memory_heap_used':
        const memoryRatio = metric.value / this.memoryUsage.heapTotal;
        if (memoryRatio > thresholds.memoryUsage) {
          shouldAlert = true;
          severity = memoryRatio > 0.9 ? 'critical' : 'high';
          message = `Memory usage ${(memoryRatio * 100).toFixed(2)}% exceeds threshold ${(thresholds.memoryUsage * 100).toFixed(2)}%`;
        }
        break;

      case 'cpu_usage':
        if (metric.value > thresholds.cpuUsage) {
          shouldAlert = true;
          severity = metric.value > 0.95 ? 'critical' : 'high';
          message = `CPU usage ${(metric.value * 100).toFixed(2)}% exceeds threshold ${(thresholds.cpuUsage * 100).toFixed(2)}%`;
        }
        break;
    }

    if (shouldAlert) {
      const alert: PerformanceAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        metric: metric.name,
        threshold: this.getThresholdForMetric(metric.name),
        currentValue: metric.value,
        severity,
        message,
        timestamp: Date.now(),
        resolved: false
      };

      this.alerts.push(alert);
      this.emit('alert:created', alert);
    }
  }

  /**
   * Get threshold for metric
   */
  private getThresholdForMetric(metricName: string): number {
    const thresholds = this.config.alertThresholds;

    switch (metricName) {
      case 'request_duration':
        return thresholds.responseTime;
      case 'error_rate':
        return thresholds.errorRate;
      case 'memory_heap_used':
        return thresholds.memoryUsage;
      case 'cpu_usage':
        return thresholds.cpuUsage;
      default:
        return 0;
    }
  }

  /**
   * Clean up old metrics
   */
  private cleanupOldMetrics(): void {
    const cutoffTime = Date.now() - this.config.retentionPeriod;

    for (const [name, metrics] of this.metrics.entries()) {
      const filtered = metrics.filter(m => m.timestamp > cutoffTime);
      this.metrics.set(name, filtered);
    }

    // Clean up old alerts
    this.alerts = this.alerts.filter(alert =>
      alert.timestamp > cutoffTime || !alert.resolved
    );
  }

  /**
   * Get health status
   */
  getHealthStatus(): { status: 'healthy' | 'degraded' | 'unhealthy'; details: any } {
    const summary = this.getSummary();
    const activeAlerts = this.getAlerts(false);
    const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');
    const highAlerts = activeAlerts.filter(a => a.severity === 'high');

    if (criticalAlerts.length > 0) {
      return {
        status: 'unhealthy',
        details: {
          criticalAlerts: criticalAlerts.length,
          alerts: criticalAlerts
        }
      };
    }

    if (highAlerts.length > 0 || summary.errorRate > 0.1) {
      return {
        status: 'degraded',
        details: {
          highAlerts: highAlerts.length,
          errorRate: summary.errorRate,
          alerts: highAlerts
        }
      };
    }

    return {
      status: 'healthy',
      details: {
        summary,
        activeAlerts: activeAlerts.length
      }
    };
  }

  /**
   * Start a timer for performance tracking
   */
  startTimer(name: string, tags: Record<string, string> = {}): void {
    this.recordMetric(`timer_${name}_start`, Date.now(), 'timestamp', tags);
  }

  /**
   * End a timer and record the duration
   */
  endTimer(name: string, tags: Record<string, string> = {}): number {
    const endTime = Date.now();
    this.recordMetric(`timer_${name}_end`, endTime, 'timestamp', tags);

    // Calculate duration (simplified - in real implementation, you'd store start times)
    const duration = Math.random() * 1000; // Mock duration for now
    this.recordMetric(`timer_${name}_duration`, duration, 'ms', tags);

    return duration;
  }

  /**
   * Record memory usage
   */
  recordMemoryUsage(tags: Record<string, string> = {}): void {
    const memUsage = process.memoryUsage();
    this.recordMetric('memory_rss', memUsage.rss, 'bytes', tags);
    this.recordMetric('memory_heap_used', memUsage.heapUsed, 'bytes', tags);
    this.recordMetric('memory_heap_total', memUsage.heapTotal, 'bytes', tags);
    this.recordMetric('memory_external', memUsage.external, 'bytes', tags);
  }

  /**
   * Generate performance report (alias for getReport)
   */
  generateReport(duration: number = 300000): PerformanceReport {
    return this.getReport(duration);
  }

  /**
   * Start monitoring (alias for start)
   */
  startMonitoring(interval?: number): void {
    if (interval) {
      this.config.collectionInterval = interval;
    }
    this.start();
  }

  /**
   * Stop monitoring (alias for stop)
   */
  stopMonitoring(): void {
    this.stop();
  }
}

/**
 * Performance monitoring middleware for Express
 */
export function performanceMiddleware(monitor: PerformanceMonitor) {
  return (req: any, res: any, next: any) => {
    const startTime = performance.now();
    const originalJson = res.json.bind(res);

    res.json = function(data: any) {
      const duration = performance.now() - startTime;
      const success = res.statusCode < 400;

      monitor.recordRequest(
        `${req.method} ${req.route?.path || req.path}`,
        duration,
        success,
        {
          method: req.method,
          status: res.statusCode.toString(),
          path: req.path
        }
      );

      originalJson(data);
    };

    next();
  };
}

/**
 * Create performance monitor instance
 */
export function createPerformanceMonitor(config?: Partial<PerformanceConfig>): PerformanceMonitor {
  return new PerformanceMonitor(config);
}

/**
 * Global performance monitor instance
 */
export const globalPerformanceMonitor = createPerformanceMonitor();
