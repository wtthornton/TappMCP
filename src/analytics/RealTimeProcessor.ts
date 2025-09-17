/**
 * Real-Time Analytics Processor
 *
 * Processes analytics data in real-time and provides live insights,
 * performance monitoring, and alerting capabilities.
 */

import { EventEmitter } from 'events';
import {
  CallTreeAnalytics,
  ExecutionMetrics,
  PerformanceInsights,
  OptimizationOpportunity,
  UsagePattern,
  StoredTrace
} from './types/AnalyticsTypes.js';
import { StorageBackend } from './storage/StorageBackend.js';

export interface RealTimeProcessorConfig {
  /** Processing interval in milliseconds */
  processingInterval: number;

  /** Enable real-time alerts */
  enableAlerts: boolean;

  /** Performance thresholds for alerts */
  performanceThresholds: {
    responseTime: number;
    errorRate: number;
    memoryUsage: number;
    cpuUsage: number;
  };

  /** Alert cooldown period in milliseconds */
  alertCooldown: number;

  /** Maximum number of recent traces to keep in memory */
  maxRecentTraces: number;
}

export interface RealTimeAlert {
  id: string;
  type: 'performance' | 'error' | 'optimization' | 'usage';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: number;
  data: Record<string, any>;
  resolved: boolean;
}

export interface LiveMetrics {
  /** Current request rate (requests per second) */
  requestRate: number;

  /** Average response time in milliseconds */
  averageResponseTime: number;

  /** Current error rate (0.0 to 1.0) */
  errorRate: number;

  /** Current memory usage percentage */
  memoryUsage: number;

  /** Current CPU usage percentage */
  cpuUsage: number;

  /** Active alerts count */
  activeAlerts: number;

  /** System health score (0-100) */
  healthScore: number;

  /** Last updated timestamp */
  lastUpdated: number;
}

export class RealTimeProcessor extends EventEmitter {
  private config: RealTimeProcessorConfig;
  private storageBackend?: StorageBackend;
  private isProcessing: boolean = false;
  private processingTimer?: NodeJS.Timeout;

  // Real-time data
  private recentTraces: StoredTrace[] = [];
  private liveMetrics: LiveMetrics;
  private activeAlerts: Map<string, RealTimeAlert> = new Map();
  private lastAlertTimes: Map<string, number> = new Map();

  // Performance tracking
  private requestCount: number = 0;
  private errorCount: number = 0;
  private totalResponseTime: number = 0;
  private startTime: number = Date.now();

  constructor(config: Partial<RealTimeProcessorConfig> = {}, storageBackend?: StorageBackend) {
    super();

    this.config = {
      processingInterval: 1000, // 1 second
      enableAlerts: true,
      performanceThresholds: {
        responseTime: 1000,
        errorRate: 0.05,
        memoryUsage: 0.8,
        cpuUsage: 0.8
      },
      alertCooldown: 60000, // 1 minute
      maxRecentTraces: 1000,
      ...config
    };

    this.storageBackend = storageBackend;
    this.liveMetrics = this.initializeLiveMetrics();
  }

  /**
   * Start real-time processing
   */
  start(): void {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    this.startTime = Date.now();

    // Start processing timer
    this.processingTimer = setInterval(() => {
      this.processRealTimeData();
    }, this.config.processingInterval);

    console.log('🔄 Real-time analytics processing started');
    this.emit('processing:started');
  }

  /**
   * Stop real-time processing
   */
  stop(): void {
    if (!this.isProcessing) {
      return;
    }

    this.isProcessing = false;

    if (this.processingTimer) {
      clearInterval(this.processingTimer);
      this.processingTimer = undefined;
    }

    console.log('⏹️ Real-time analytics processing stopped');
    this.emit('processing:stopped');
  }

  /**
   * Process a new trace in real-time
   */
  async processTrace(trace: StoredTrace): Promise<void> {
    try {
      // Add to recent traces
      this.addRecentTrace(trace);

      // Update live metrics
      this.updateLiveMetrics(trace);

      // Check for alerts
      if (this.config.enableAlerts) {
        await this.checkAlerts(trace);
      }

      // Emit real-time events
      this.emit('trace:processed', trace);
      this.emit('metrics:updated', this.liveMetrics);

    } catch (error) {
      console.error('Failed to process trace in real-time:', error);
      this.emit('error', error);
    }
  }

  /**
   * Get current live metrics
   */
  getLiveMetrics(): LiveMetrics {
    return { ...this.liveMetrics };
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): RealTimeAlert[] {
    return Array.from(this.activeAlerts.values()).filter(alert => !alert.resolved);
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): void {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      alert.resolved = true;
      this.emit('alert:resolved', alert);
    }
  }

  /**
   * Get recent traces
   */
  getRecentTraces(count: number = 50): StoredTrace[] {
    return this.recentTraces
      .sort((a, b) => b.storedAt - a.storedAt)
      .slice(0, count);
  }

  /**
   * Get performance trends
   */
  getPerformanceTrends(): {
    responseTime: number[];
    errorRate: number[];
    memoryUsage: number[];
    timestamps: number[];
  } {
    const traces = this.getRecentTraces(100);
    const responseTime: number[] = [];
    const errorRate: number[] = [];
    const memoryUsage: number[] = [];
    const timestamps: number[] = [];

    traces.forEach(trace => {
      responseTime.push(trace.duration);
      errorRate.push(trace.success ? 0 : 1);
      memoryUsage.push(0); // TODO: Extract from trace data
      timestamps.push(trace.storedAt);
    });

    return { responseTime, errorRate, memoryUsage, timestamps };
  }

  /**
   * Get usage patterns
   */
  getUsagePatterns(): UsagePattern[] {
    const traces = this.getRecentTraces(100);
    const patterns: UsagePattern[] = [];

    // Analyze tool usage patterns
    const toolUsage: Record<string, number> = {};
    traces.forEach(trace => {
      if (trace.analytics?.executionMetrics?.toolUsageDistribution) {
        Object.entries(trace.analytics.executionMetrics.toolUsageDistribution).forEach(([tool, count]) => {
          toolUsage[tool] = (toolUsage[tool] || 0) + count;
        });
      }
    });

    // Create patterns for frequently used tools
    Object.entries(toolUsage).forEach(([tool, count]) => {
      if (count > 5) { // Threshold for pattern detection
        patterns.push({
          id: `realtime_tool_${tool}`,
          type: 'tool_combination',
          confidence: Math.min(1.0, count / 20), // Confidence based on frequency
          description: `Frequent use of ${tool} tool`,
          frequency: count,
          data: { tool, count, period: 'recent' },
          insights: [
            `${tool} is being used frequently in recent executions`,
            'Consider optimizing this tool for better performance'
          ]
        });
      }
    });

    return patterns;
  }

  /**
   * Get optimization opportunities
   */
  getOptimizationOpportunities(): OptimizationOpportunity[] {
    const traces = this.getRecentTraces(50);
    const opportunities: OptimizationOpportunity[] = [];

    // Analyze recent performance
    const avgResponseTime = traces.reduce((sum, t) => sum + t.duration, 0) / traces.length;
    const errorRate = traces.filter(t => !t.success).length / traces.length;

    // Response time optimization
    if (avgResponseTime > this.config.performanceThresholds.responseTime) {
      opportunities.push({
        id: `realtime_response_time_${Date.now()}`,
        type: 'algorithm',
        priority: avgResponseTime > this.config.performanceThresholds.responseTime * 2 ? 'high' : 'medium',
        description: `Average response time is ${avgResponseTime.toFixed(0)}ms, above threshold`,
        expectedImprovement: Math.min(50, (avgResponseTime - this.config.performanceThresholds.responseTime) / 10),
        effort: 'medium',
        affectedMetrics: ['response_time', 'user_satisfaction'],
        suggestions: [
          'Optimize slow operations',
          'Implement caching strategies',
          'Consider parallel processing'
        ]
      });
    }

    // Error rate optimization
    if (errorRate > this.config.performanceThresholds.errorRate) {
      opportunities.push({
        id: `realtime_error_rate_${Date.now()}`,
        type: 'algorithm',
        priority: errorRate > this.config.performanceThresholds.errorRate * 2 ? 'critical' : 'high',
        description: `Error rate is ${(errorRate * 100).toFixed(1)}%, above threshold`,
        expectedImprovement: Math.min(80, (errorRate - this.config.performanceThresholds.errorRate) * 100),
        effort: 'high',
        affectedMetrics: ['error_rate', 'success_rate', 'user_satisfaction'],
        suggestions: [
          'Investigate error causes',
          'Improve error handling',
          'Add input validation'
        ]
      });
    }

    return opportunities;
  }

  /**
   * Process real-time data
   */
  private async processRealTimeData(): Promise<void> {
    try {
      // Update live metrics
      this.updateLiveMetricsFromSystem();

      // Clean up old traces
      this.cleanupOldTraces();

      // Emit metrics update
      this.emit('metrics:updated', this.liveMetrics);

    } catch (error) {
      console.error('Error processing real-time data:', error);
      this.emit('error', error);
    }
  }

  /**
   * Add recent trace
   */
  private addRecentTrace(trace: StoredTrace): void {
    this.recentTraces.push(trace);

    // Keep only recent traces
    if (this.recentTraces.length > this.config.maxRecentTraces) {
      this.recentTraces = this.recentTraces.slice(-this.config.maxRecentTraces);
    }
  }

  /**
   * Update live metrics from trace
   */
  private updateLiveMetrics(trace: StoredTrace): void {
    this.requestCount++;
    this.totalResponseTime += trace.duration;

    if (!trace.success) {
      this.errorCount++;
    }

    // Update metrics
    this.liveMetrics.requestRate = this.calculateRequestRate();
    this.liveMetrics.averageResponseTime = this.calculateAverageResponseTime();
    this.liveMetrics.errorRate = this.calculateErrorRate();
    this.liveMetrics.lastUpdated = Date.now();
    this.liveMetrics.healthScore = this.calculateHealthScore();
  }

  /**
   * Update live metrics from system
   */
  private updateLiveMetricsFromSystem(): void {
    const memUsage = process.memoryUsage();
    const totalMem = memUsage.heapTotal;
    const usedMem = memUsage.heapUsed;

    this.liveMetrics.memoryUsage = usedMem / totalMem;
    this.liveMetrics.cpuUsage = 0; // TODO: Implement CPU monitoring
    this.liveMetrics.activeAlerts = this.getActiveAlerts().length;
    this.liveMetrics.lastUpdated = Date.now();
  }

  /**
   * Check for alerts
   */
  private async checkAlerts(trace: StoredTrace): Promise<void> {
    const alerts: RealTimeAlert[] = [];

    // Response time alert
    if (trace.duration > this.config.performanceThresholds.responseTime) {
      const alertId = 'response_time_high';
      if (this.shouldCreateAlert(alertId)) {
        alerts.push({
          id: alertId,
          type: 'performance',
          severity: trace.duration > this.config.performanceThresholds.responseTime * 2 ? 'critical' : 'high',
          title: 'High Response Time',
          message: `Response time ${trace.duration}ms exceeds threshold ${this.config.performanceThresholds.responseTime}ms`,
          timestamp: Date.now(),
          data: { responseTime: trace.duration, threshold: this.config.performanceThresholds.responseTime },
          resolved: false
        });
      }
    }

    // Error alert
    if (!trace.success) {
      const alertId = 'error_occurred';
      if (this.shouldCreateAlert(alertId)) {
        alerts.push({
          id: alertId,
          type: 'error',
          severity: 'high',
          title: 'Execution Error',
          message: `Smart vibe execution failed: ${trace.errorMessage || 'Unknown error'}`,
          timestamp: Date.now(),
          data: { errorMessage: trace.errorMessage, command: trace.command },
          resolved: false
        });
      }
    }

    // Memory usage alert
    if (this.liveMetrics.memoryUsage > this.config.performanceThresholds.memoryUsage) {
      const alertId = 'memory_usage_high';
      if (this.shouldCreateAlert(alertId)) {
        alerts.push({
          id: alertId,
          type: 'performance',
          severity: this.liveMetrics.memoryUsage > 0.9 ? 'critical' : 'medium',
          title: 'High Memory Usage',
          message: `Memory usage ${(this.liveMetrics.memoryUsage * 100).toFixed(1)}% exceeds threshold`,
          timestamp: Date.now(),
          data: { memoryUsage: this.liveMetrics.memoryUsage, threshold: this.config.performanceThresholds.memoryUsage },
          resolved: false
        });
      }
    }

    // Create alerts
    for (const alert of alerts) {
      this.activeAlerts.set(alert.id, alert);
      this.lastAlertTimes.set(alert.id, Date.now());
      this.emit('alert:created', alert);
    }
  }

  /**
   * Check if alert should be created (cooldown check)
   */
  private shouldCreateAlert(alertId: string): boolean {
    const lastAlertTime = this.lastAlertTimes.get(alertId);
    if (!lastAlertTime) {
      return true;
    }

    return Date.now() - lastAlertTime > this.config.alertCooldown;
  }

  /**
   * Clean up old traces
   */
  private cleanupOldTraces(): void {
    const cutoffTime = Date.now() - (60 * 60 * 1000); // 1 hour
    this.recentTraces = this.recentTraces.filter(trace => trace.storedAt > cutoffTime);
  }

  /**
   * Initialize live metrics
   */
  private initializeLiveMetrics(): LiveMetrics {
    return {
      requestRate: 0,
      averageResponseTime: 0,
      errorRate: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      activeAlerts: 0,
      healthScore: 100,
      lastUpdated: Date.now()
    };
  }

  /**
   * Calculate request rate
   */
  private calculateRequestRate(): number {
    const uptime = (Date.now() - this.startTime) / 1000;
    return uptime > 0 ? this.requestCount / uptime : 0;
  }

  /**
   * Calculate average response time
   */
  private calculateAverageResponseTime(): number {
    return this.requestCount > 0 ? this.totalResponseTime / this.requestCount : 0;
  }

  /**
   * Calculate error rate
   */
  private calculateErrorRate(): number {
    return this.requestCount > 0 ? this.errorCount / this.requestCount : 0;
  }

  /**
   * Calculate health score
   */
  private calculateHealthScore(): number {
    let score = 100;

    // Deduct points for high response time
    if (this.liveMetrics.averageResponseTime > this.config.performanceThresholds.responseTime) {
      score -= 20;
    }

    // Deduct points for high error rate
    if (this.liveMetrics.errorRate > this.config.performanceThresholds.errorRate) {
      score -= 30;
    }

    // Deduct points for high memory usage
    if (this.liveMetrics.memoryUsage > this.config.performanceThresholds.memoryUsage) {
      score -= 15;
    }

    // Deduct points for active alerts
    score -= this.liveMetrics.activeAlerts * 5;

    return Math.max(0, score);
  }
}
