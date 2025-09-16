#!/usr/bin/env node

/**
 * Context7 Analytics and Monitoring System
 *
 * Tracks Context7 usage patterns, performance metrics, and provides
 * real-time analytics for optimization and monitoring.
 */

import { EventEmitter } from 'events';
import { PerformanceMonitor } from './performance-monitor.js';

export interface Context7UsageEvent {
  id: string;
  timestamp: number;
  eventType: 'api_call' | 'cache_hit' | 'cache_miss' | 'fallback_used' | 'error' | 'query_optimized';
  query: string;
  queryType: 'documentation' | 'code_examples' | 'best_practices' | 'troubleshooting';
  responseTime: number;
  success: boolean;
  errorMessage?: string;
  cacheKey?: string;
  optimizationApplied?: boolean;
  confidenceScore?: number;
  fallbackReason?: string;
  metadata?: Record<string, any>;
}

export interface Context7Analytics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  cacheHits: number;
  cacheMisses: number;
  fallbackUsed: number;
  averageResponseTime: number;
  averageConfidenceScore: number;
  queryTypeDistribution: Record<string, number>;
  topQueries: Array<{ query: string; count: number; avgResponseTime: number }>;
  errorRate: number;
  optimizationRate: number;
  deduplicationRate: number;
  fallbackRate: number;
  timeRange: {
    start: number;
    end: number;
  };
}

export interface Context7PerformanceMetrics {
  apiCallsPerMinute: number;
  averageResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  fallbackRate: number;
  optimizationRate: number;
  deduplicationRate: number;
  memoryUsage: number;
  activeConnections: number;
}

export interface Context7Alert {
  id: string;
  type: 'performance' | 'error' | 'usage' | 'cache';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  resolved: boolean;
  metrics: Record<string, any>;
}

export class Context7AnalyticsMonitor extends EventEmitter {
  private events: Context7UsageEvent[] = [];
  private performanceMonitor: PerformanceMonitor;
  private alerts: Context7Alert[] = [];
  private metrics: Context7PerformanceMetrics;
  private isMonitoring: boolean = false;
  private cleanupInterval: NodeJS.Timeout | null = null;

  // Configuration
  private config = {
    maxEvents: 10000,
    alertThresholds: {
      errorRate: 0.1,           // 10% error rate
      responseTime: 2000,       // 2 seconds
      cacheHitRate: 0.3,        // 30% minimum hit rate
      fallbackRate: 0.5,        // 50% fallback rate
    },
    cleanupInterval: 300000,    // 5 minutes
    retentionPeriod: 3600000,   // 1 hour
  };

  constructor(performanceMonitor?: PerformanceMonitor) {
    super();
    this.performanceMonitor = performanceMonitor || new PerformanceMonitor();
    this.metrics = this.initializeMetrics();
    this.startMonitoring();
  }

  /**
   * Record a Context7 usage event
   */
  recordEvent(event: Omit<Context7UsageEvent, 'id' | 'timestamp'>): void {
    const fullEvent: Context7UsageEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: Date.now(),
    };

    this.events.push(fullEvent);
    this.updateMetrics();
    this.checkAlerts(fullEvent);

    // Emit event for real-time monitoring
    this.emit('context7_event', fullEvent);

    // Cleanup old events if needed
    if (this.events.length > this.config.maxEvents) {
      this.events = this.events.slice(-this.config.maxEvents);
    }
  }

  /**
   * Get current analytics
   */
  getAnalytics(timeRange?: { start: number; end: number }): Context7Analytics {
    const now = Date.now();
    const start = timeRange?.start || now - 3600000; // Default to last hour
    const end = timeRange?.end || now;

    const filteredEvents = this.events.filter(
      event => event.timestamp >= start && event.timestamp <= end
    );

    const totalRequests = filteredEvents.length;
    const successfulRequests = filteredEvents.filter(e => e.success).length;
    const failedRequests = totalRequests - successfulRequests;
    const cacheHits = filteredEvents.filter(e => e.eventType === 'cache_hit').length;
    const cacheMisses = filteredEvents.filter(e => e.eventType === 'cache_miss').length;
    const fallbackUsed = filteredEvents.filter(e => e.eventType === 'fallback_used').length;
    const optimizedQueries = filteredEvents.filter(e => e.optimizationApplied).length;

    const averageResponseTime = filteredEvents.length > 0
      ? filteredEvents.reduce((sum, e) => sum + e.responseTime, 0) / filteredEvents.length
      : 0;

    const averageConfidenceScore = filteredEvents
      .filter(e => e.confidenceScore !== undefined)
      .reduce((sum, e) => sum + (e.confidenceScore || 0), 0) /
      Math.max(1, filteredEvents.filter(e => e.confidenceScore !== undefined).length);

    // Query type distribution
    const queryTypeDistribution: Record<string, number> = {};
    filteredEvents.forEach(event => {
      queryTypeDistribution[event.queryType] = (queryTypeDistribution[event.queryType] || 0) + 1;
    });

    // Top queries
    const queryCounts: Record<string, { count: number; totalResponseTime: number }> = {};
    filteredEvents.forEach(event => {
      if (!queryCounts[event.query]) {
        queryCounts[event.query] = { count: 0, totalResponseTime: 0 };
      }
      queryCounts[event.query].count++;
      queryCounts[event.query].totalResponseTime += event.responseTime;
    });

    const topQueries = Object.entries(queryCounts)
      .map(([query, data]) => ({
        query,
        count: data.count,
        avgResponseTime: data.totalResponseTime / data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      cacheHits,
      cacheMisses,
      fallbackUsed,
      averageResponseTime,
      averageConfidenceScore,
      queryTypeDistribution,
      topQueries,
      errorRate: totalRequests > 0 ? failedRequests / totalRequests : 0,
      optimizationRate: totalRequests > 0 ? optimizedQueries / totalRequests : 0,
      deduplicationRate: this.calculateDeduplicationRate(filteredEvents),
      fallbackRate: totalRequests > 0 ? fallbackUsed / totalRequests : 0,
      timeRange: { start, end },
    };
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): Context7PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get active alerts
   */
  getAlerts(includeResolved: boolean = false): Context7Alert[] {
    return includeResolved
      ? [...this.alerts]
      : this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Get real-time dashboard data
   */
  getDashboardData(): {
    analytics: Context7Analytics;
    metrics: Context7PerformanceMetrics;
    alerts: Context7Alert[];
    health: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  } {
    const analytics = this.getAnalytics();
    const metrics = this.getPerformanceMetrics();
    const alerts = this.getAlerts();
    const health = this.calculateHealth(analytics, metrics);

    return {
      analytics,
      metrics,
      alerts,
      health,
    };
  }

  /**
   * Start monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldEvents();
    }, this.config.cleanupInterval);

    console.log('📊 Context7 Analytics Monitor started');
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    console.log('📊 Context7 Analytics Monitor stopped');
  }

  /**
   * Reset all data
   */
  reset(): void {
    this.events = [];
    this.alerts = [];
    this.metrics = this.initializeMetrics();
    console.log('📊 Context7 Analytics data reset');
  }

  /**
   * Export analytics data
   */
  exportData(): {
    events: Context7UsageEvent[];
    analytics: Context7Analytics;
    metrics: Context7PerformanceMetrics;
    alerts: Context7Alert[];
    exportedAt: number;
  } {
    return {
      events: [...this.events],
      analytics: this.getAnalytics(),
      metrics: this.getPerformanceMetrics(),
      alerts: this.getAlerts(true),
      exportedAt: Date.now(),
    };
  }

  private initializeMetrics(): Context7PerformanceMetrics {
    return {
      apiCallsPerMinute: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      errorRate: 0,
      fallbackRate: 0,
      optimizationRate: 0,
      deduplicationRate: 0,
      memoryUsage: 0,
      activeConnections: 0,
    };
  }

  private updateMetrics(): void {
    const now = Date.now();
    const lastMinute = now - 60000;
    const recentEvents = this.events.filter(e => e.timestamp >= lastMinute);

    this.metrics.apiCallsPerMinute = recentEvents.length;
    this.metrics.averageResponseTime = recentEvents.length > 0
      ? recentEvents.reduce((sum, e) => sum + e.responseTime, 0) / recentEvents.length
      : 0;

    const totalRequests = this.events.length;
    if (totalRequests > 0) {
      this.metrics.cacheHitRate = this.events.filter(e => e.eventType === 'cache_hit').length / totalRequests;
      this.metrics.errorRate = this.events.filter(e => !e.success).length / totalRequests;
      this.metrics.fallbackRate = this.events.filter(e => e.eventType === 'fallback_used').length / totalRequests;
      this.metrics.optimizationRate = this.events.filter(e => e.optimizationApplied).length / totalRequests;
      this.metrics.deduplicationRate = this.calculateDeduplicationRate(this.events);
    }

    // Update memory usage
    this.metrics.memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB
  }

  private calculateDeduplicationRate(events: Context7UsageEvent[]): number {
    const apiCalls = events.filter(e => e.eventType === 'api_call');
    const deduplicated = events.filter(e => e.metadata?.deduplicated === true);
    return apiCalls.length > 0 ? deduplicated.length / apiCalls.length : 0;
  }

  private checkAlerts(event: Context7UsageEvent): void {
    const analytics = this.getAnalytics();

    // Check error rate alert
    if (analytics.errorRate > this.config.alertThresholds.errorRate) {
      this.createAlert('error', 'high',
        `High error rate detected: ${(analytics.errorRate * 100).toFixed(1)}%`,
        { errorRate: analytics.errorRate });
    }

    // Check response time alert
    if (analytics.averageResponseTime > this.config.alertThresholds.responseTime) {
      this.createAlert('performance', 'medium',
        `High response time: ${analytics.averageResponseTime.toFixed(0)}ms`,
        { responseTime: analytics.averageResponseTime });
    }

    // Check cache hit rate alert
    if (analytics.cacheHits + analytics.cacheMisses > 0) {
      const hitRate = analytics.cacheHits / (analytics.cacheHits + analytics.cacheMisses);
      if (hitRate < this.config.alertThresholds.cacheHitRate) {
        this.createAlert('cache', 'medium',
          `Low cache hit rate: ${(hitRate * 100).toFixed(1)}%`,
          { hitRate });
      }
    }

    // Check fallback rate alert
    if (analytics.fallbackRate > this.config.alertThresholds.fallbackRate) {
      this.createAlert('usage', 'high',
        `High fallback usage: ${(analytics.fallbackRate * 100).toFixed(1)}%`,
        { fallbackRate: analytics.fallbackRate });
    }
  }

  private createAlert(
    type: Context7Alert['type'],
    severity: Context7Alert['severity'],
    message: string,
    metrics: Record<string, any>
  ): void {
    const alert: Context7Alert = {
      id: this.generateEventId(),
      type,
      severity,
      message,
      timestamp: Date.now(),
      resolved: false,
      metrics,
    };

    this.alerts.push(alert);
    this.emit('context7_alert', alert);
  }

  private calculateHealth(
    analytics: Context7Analytics,
    metrics: Context7PerformanceMetrics
  ): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    let score = 100;

    // Deduct points for high error rate
    if (analytics.errorRate > 0.1) score -= 30;
    else if (analytics.errorRate > 0.05) score -= 15;

    // Deduct points for slow response time
    if (analytics.averageResponseTime > 2000) score -= 25;
    else if (analytics.averageResponseTime > 1000) score -= 10;

    // Deduct points for low cache hit rate
    const hitRate = analytics.cacheHits / Math.max(1, analytics.cacheHits + analytics.cacheMisses);
    if (hitRate < 0.3) score -= 20;
    else if (hitRate < 0.5) score -= 10;

    // Deduct points for high fallback rate
    if (analytics.fallbackUsed / Math.max(1, analytics.totalRequests) > 0.5) score -= 15;

    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    if (score >= 40) return 'poor';
    return 'critical';
  }

  private cleanupOldEvents(): void {
    const cutoff = Date.now() - this.config.retentionPeriod;
    const initialLength = this.events.length;
    this.events = this.events.filter(event => event.timestamp >= cutoff);

    if (this.events.length < initialLength) {
      console.log(`🧹 Cleaned up ${initialLength - this.events.length} old Context7 events`);
    }
  }

  private generateEventId(): string {
    return `ctx7_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export factory function
export function createContext7AnalyticsMonitor(performanceMonitor?: PerformanceMonitor): Context7AnalyticsMonitor {
  return new Context7AnalyticsMonitor(performanceMonitor);
}
