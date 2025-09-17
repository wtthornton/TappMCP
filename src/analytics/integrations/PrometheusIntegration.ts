/**
 * Prometheus Integration
 *
 * Prometheus metrics export for monitoring and alerting
 * with custom metrics and standard monitoring patterns.
 */

import {
  LiveMetrics,
  PerformanceTrends,
  StoredTrace,
  ExecutionMetrics
} from '../types/AnalyticsTypes.js';
import { RealTimeProcessor } from '../RealTimeProcessor.js';
import { AnalyticsEngine } from '../AnalyticsEngine.js';

export interface PrometheusConfig {
  /** Metrics collection interval */
  collectionInterval: number;

  /** Enable custom metrics */
  enableCustomMetrics: boolean;

  /** Enable histogram metrics */
  enableHistograms: boolean;

  /** Enable summary metrics */
  enableSummaries: boolean;

  /** Metrics prefix */
  metricsPrefix: string;

  /** Custom labels */
  customLabels: Record<string, string>;
}

export interface PrometheusMetric {
  name: string;
  help: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  labels?: Record<string, string>;
  value?: number;
  buckets?: number[];
  quantiles?: { [quantile: string]: number };
}

export class PrometheusIntegration {
  private config: PrometheusConfig;
  private realTimeProcessor: RealTimeProcessor;
  private analyticsEngine: AnalyticsEngine;
  private metrics: Map<string, PrometheusMetric> = new Map();

  constructor(
    config: Partial<PrometheusConfig> = {},
    realTimeProcessor: RealTimeProcessor,
    analyticsEngine: AnalyticsEngine
  ) {
    this.config = {
      collectionInterval: 1000,
      enableCustomMetrics: true,
      enableHistograms: true,
      enableSummaries: true,
      metricsPrefix: 'smart_vibe_',
      customLabels: {},
      ...config
    };

    this.realTimeProcessor = realTimeProcessor;
    this.analyticsEngine = analyticsEngine;
    this.initializeMetrics();
  }

  /**
   * Get Prometheus metrics in text format
   */
  async getMetrics(): Promise<string> {
    try {
      const liveMetrics = this.realTimeProcessor.getLiveMetrics();
      const trends = this.realTimeProcessor.getPerformanceTrends();

      // Update metrics with current data
      this.updateMetrics(liveMetrics, trends);

      // Generate Prometheus format
      return this.generatePrometheusFormat();
    } catch (error) {
      console.error('Failed to get Prometheus metrics:', error);
      return '';
    }
  }

  /**
   * Initialize default metrics
   */
  private initializeMetrics(): void {
    // Response time metrics
    this.addMetric({
      name: 'response_time_seconds',
      help: 'Average response time in seconds',
      type: 'gauge',
      value: 0
    });

    this.addMetric({
      name: 'response_time_seconds_histogram',
      help: 'Response time distribution in seconds',
      type: 'histogram',
      buckets: [0.1, 0.5, 1.0, 2.0, 5.0, 10.0]
    });

    // Error rate metrics
    this.addMetric({
      name: 'error_rate',
      help: 'Error rate (0.0 to 1.0)',
      type: 'gauge',
      value: 0
    });

    this.addMetric({
      name: 'errors_total',
      help: 'Total number of errors',
      type: 'counter',
      value: 0
    });

    // Success rate metrics
    this.addMetric({
      name: 'success_rate',
      help: 'Success rate (0.0 to 1.0)',
      type: 'gauge',
      value: 0
    });

    this.addMetric({
      name: 'requests_total',
      help: 'Total number of requests',
      type: 'counter',
      value: 0
    });

    this.addMetric({
      name: 'successful_requests_total',
      help: 'Total number of successful requests',
      type: 'counter',
      value: 0
    });

    // Resource usage metrics
    this.addMetric({
      name: 'memory_usage_ratio',
      help: 'Memory usage ratio (0.0 to 1.0)',
      type: 'gauge',
      value: 0
    });

    this.addMetric({
      name: 'cpu_usage_ratio',
      help: 'CPU usage ratio (0.0 to 1.0)',
      type: 'gauge',
      value: 0
    });

    // Throughput metrics
    this.addMetric({
      name: 'request_rate',
      help: 'Requests per second',
      type: 'gauge',
      value: 0
    });

    this.addMetric({
      name: 'requests_per_second',
      help: 'Requests per second (summary)',
      type: 'summary',
      quantiles: { '0.5': 0, '0.9': 0, '0.95': 0, '0.99': 0 }
    });

    // Health metrics
    this.addMetric({
      name: 'health_score',
      help: 'System health score (0-100)',
      type: 'gauge',
      value: 0
    });

    this.addMetric({
      name: 'active_alerts',
      help: 'Number of active alerts',
      type: 'gauge',
      value: 0
    });

    // Tool usage metrics
    this.addMetric({
      name: 'tool_usage_total',
      help: 'Total tool usage count',
      type: 'counter',
      labels: { tool: 'unknown' },
      value: 0
    });

    // Cache metrics
    this.addMetric({
      name: 'cache_hit_rate',
      help: 'Cache hit rate (0.0 to 1.0)',
      type: 'gauge',
      value: 0
    });

    this.addMetric({
      name: 'cache_hits_total',
      help: 'Total cache hits',
      type: 'counter',
      value: 0
    });

    this.addMetric({
      name: 'cache_misses_total',
      help: 'Total cache misses',
      type: 'counter',
      value: 0
    });

    // Context7 metrics
    this.addMetric({
      name: 'context7_hit_rate',
      help: 'Context7 API hit rate (0.0 to 1.0)',
      type: 'gauge',
      value: 0
    });

    this.addMetric({
      name: 'context7_requests_total',
      help: 'Total Context7 API requests',
      type: 'counter',
      value: 0
    });

    this.addMetric({
      name: 'context7_response_time_seconds',
      help: 'Context7 API response time in seconds',
      type: 'histogram',
      buckets: [0.1, 0.5, 1.0, 2.0, 5.0]
    });

    // Performance metrics
    this.addMetric({
      name: 'optimization_score',
      help: 'System optimization score (0-100)',
      type: 'gauge',
      value: 0
    });

    this.addMetric({
      name: 'bottlenecks_total',
      help: 'Total number of performance bottlenecks',
      type: 'gauge',
      value: 0
    });

    // Custom metrics
    if (this.config.enableCustomMetrics) {
      this.addMetric({
        name: 'custom_metric_value',
        help: 'Custom metric value',
        type: 'gauge',
        value: 0
      });
    }
  }

  /**
   * Add metric to collection
   */
  private addMetric(metric: PrometheusMetric): void {
    const fullName = `${this.config.metricsPrefix}${metric.name}`;
    this.metrics.set(fullName, {
      ...metric,
      name: fullName,
      labels: { ...this.config.customLabels, ...metric.labels }
    });
  }

  /**
   * Update metrics with current data
   */
  private updateMetrics(liveMetrics: LiveMetrics, trends?: PerformanceTrends | null): void {
    // Update response time metrics
    this.updateMetric('response_time_seconds', liveMetrics.averageResponseTime / 1000);
    this.updateMetric('response_time_seconds_histogram', liveMetrics.averageResponseTime / 1000);

    // Update error rate metrics
    this.updateMetric('error_rate', liveMetrics.errorRate);
    this.updateMetric('errors_total', liveMetrics.errorRate * liveMetrics.requestRate);

    // Update success rate metrics
    const successRate = 1 - liveMetrics.errorRate;
    this.updateMetric('success_rate', successRate);
    this.updateMetric('requests_total', liveMetrics.requestRate);
    this.updateMetric('successful_requests_total', successRate * liveMetrics.requestRate);

    // Update resource usage metrics
    this.updateMetric('memory_usage_ratio', liveMetrics.memoryUsage);
    this.updateMetric('cpu_usage_ratio', liveMetrics.cpuUsage);

    // Update throughput metrics
    this.updateMetric('request_rate', liveMetrics.requestRate);
    this.updateMetric('requests_per_second', liveMetrics.requestRate);

    // Update health metrics
    this.updateMetric('health_score', liveMetrics.healthScore);
    this.updateMetric('active_alerts', liveMetrics.activeAlerts);

    // Update cache metrics (placeholder values)
    this.updateMetric('cache_hit_rate', 0.8);
    this.updateMetric('cache_hits_total', liveMetrics.requestRate * 0.8);
    this.updateMetric('cache_misses_total', liveMetrics.requestRate * 0.2);

    // Update Context7 metrics (placeholder values)
    this.updateMetric('context7_hit_rate', 0.9);
    this.updateMetric('context7_requests_total', liveMetrics.requestRate * 0.5);
    this.updateMetric('context7_response_time_seconds', 0.5);

    // Update performance metrics
    this.updateMetric('optimization_score', liveMetrics.healthScore);
    this.updateMetric('bottlenecks_total', liveMetrics.activeAlerts);

    // Update custom metrics
    if (this.config.enableCustomMetrics) {
      this.updateMetric('custom_metric_value', Math.random() * 100);
    }
  }

  /**
   * Update specific metric value
   */
  private updateMetric(metricName: string, value: number): void {
    const fullName = `${this.config.metricsPrefix}${metricName}`;
    const metric = this.metrics.get(fullName);
    if (metric) {
      metric.value = value;
    }
  }

  /**
   * Generate Prometheus format string
   */
  private generatePrometheusFormat(): string {
    const lines: string[] = [];

    // Add header comment
    lines.push('# HELP smart_vibe_metrics Smart Vibe Analytics Metrics');
    lines.push('# TYPE smart_vibe_metrics untyped');
    lines.push('');

    // Generate metrics
    for (const [name, metric] of this.metrics) {
      // Add help text
      lines.push(`# HELP ${name} ${metric.help}`);

      // Add type
      lines.push(`# TYPE ${name} ${metric.type}`);

      // Add metric value
      if (metric.value !== undefined) {
        const labels = this.formatLabels(metric.labels);
        const labelStr = labels ? `{${labels}}` : '';
        lines.push(`${name}${labelStr} ${metric.value}`);
      }

      // Add buckets for histograms
      if (metric.type === 'histogram' && metric.buckets) {
        for (const bucket of metric.buckets) {
          const labels = this.formatLabels({ ...metric.labels, le: bucket.toString() });
          const labelStr = labels ? `{${labels}}` : '';
          lines.push(`${name}_bucket${labelStr} ${Math.floor(metric.value! * 100)}`);
        }
        const labels = this.formatLabels({ ...metric.labels, le: '+Inf' });
        const labelStr = labels ? `{${labels}}` : '';
        lines.push(`${name}_bucket${labelStr} ${Math.floor(metric.value! * 100)}`);
        lines.push(`${name}_count${labelStr} ${Math.floor(metric.value! * 100)}`);
        lines.push(`${name}_sum${labelStr} ${metric.value!}`);
      }

      // Add quantiles for summaries
      if (metric.type === 'summary' && metric.quantiles) {
        for (const [quantile, value] of Object.entries(metric.quantiles)) {
          const labels = this.formatLabels({ ...metric.labels, quantile });
          const labelStr = labels ? `{${labels}}` : '';
          lines.push(`${name}${labelStr} ${value}`);
        }
        const labels = this.formatLabels(metric.labels);
        const labelStr = labels ? `{${labels}}` : '';
        lines.push(`${name}_count${labelStr} ${Math.floor(metric.value! * 100)}`);
        lines.push(`${name}_sum${labelStr} ${metric.value!}`);
      }

      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Format labels for Prometheus
   */
  private formatLabels(labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return '';
    }

    return Object.entries(labels)
      .map(([key, value]) => `${key}="${value}"`)
      .join(',');
  }

  /**
   * Get metrics as JSON for API endpoints
   */
  async getMetricsJSON(): Promise<Record<string, any>> {
    try {
      const liveMetrics = this.realTimeProcessor.getLiveMetrics();
      const trends = this.realTimeProcessor.getPerformanceTrends();

      this.updateMetrics(liveMetrics, trends);

      const metrics: Record<string, any> = {};

      for (const [name, metric] of this.metrics) {
        metrics[name] = {
          value: metric.value,
          labels: metric.labels,
          type: metric.type,
          help: metric.help
        };
      }

      return metrics;
    } catch (error) {
      console.error('Failed to get metrics JSON:', error);
      return {};
    }
  }

  /**
   * Get specific metric value
   */
  getMetricValue(metricName: string): number | undefined {
    const fullName = `${this.config.metricsPrefix}${metricName}`;
    const metric = this.metrics.get(fullName);
    return metric?.value;
  }

  /**
   * Set custom metric value
   */
  setCustomMetric(name: string, value: number, labels?: Record<string, string>): void {
    const fullName = `${this.config.metricsPrefix}${name}`;
    this.metrics.set(fullName, {
      name: fullName,
      help: `Custom metric: ${name}`,
      type: 'gauge',
      value,
      labels: { ...this.config.customLabels, ...labels }
    });
  }

  /**
   * Increment counter metric
   */
  incrementCounter(metricName: string, labels?: Record<string, string>): void {
    const fullName = `${this.config.metricsPrefix}${metricName}`;
    const metric = this.metrics.get(fullName);
    if (metric && metric.type === 'counter') {
      metric.value = (metric.value || 0) + 1;
    } else {
      this.addMetric({
        name: metricName,
        help: `Counter metric: ${metricName}`,
        type: 'counter',
        value: 1,
        labels: { ...this.config.customLabels, ...labels }
      });
    }
  }

  /**
   * Record histogram value
   */
  recordHistogram(metricName: string, value: number, labels?: Record<string, string>): void {
    const fullName = `${this.config.metricsPrefix}${metricName}`;
    const metric = this.metrics.get(fullName);
    if (metric && metric.type === 'histogram') {
      metric.value = value;
    } else {
      this.addMetric({
        name: metricName,
        help: `Histogram metric: ${metricName}`,
        type: 'histogram',
        value,
        buckets: [0.1, 0.5, 1.0, 2.0, 5.0, 10.0],
        labels: { ...this.config.customLabels, ...labels }
      });
    }
  }

  /**
   * Get metrics configuration
   */
  getConfig(): PrometheusConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<PrometheusConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

export default PrometheusIntegration;
