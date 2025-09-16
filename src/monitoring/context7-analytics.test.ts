#!/usr/bin/env node

/**
 * Context7 Analytics Monitor Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Context7AnalyticsMonitor, createContext7AnalyticsMonitor } from './context7-analytics.js';

describe('Context7AnalyticsMonitor', () => {
  let monitor: Context7AnalyticsMonitor;

  beforeEach(() => {
    monitor = new Context7AnalyticsMonitor();
  });

  describe('Basic Functionality', () => {
    it('should create monitor with factory function', () => {
      const factoryMonitor = createContext7AnalyticsMonitor();
      expect(factoryMonitor).toBeInstanceOf(Context7AnalyticsMonitor);
    });

    it('should start and stop monitoring', () => {
      expect(monitor['isMonitoring']).toBe(true);

      monitor.stopMonitoring();
      expect(monitor['isMonitoring']).toBe(false);

      monitor.startMonitoring();
      expect(monitor['isMonitoring']).toBe(true);
    });

    it('should reset data', () => {
      monitor.recordEvent({
        eventType: 'api_call',
        query: 'test query',
        queryType: 'documentation',
        responseTime: 100,
        success: true,
      });

      expect(monitor['events'].length).toBe(1);

      monitor.reset();
      expect(monitor['events'].length).toBe(0);
      expect(monitor['alerts'].length).toBe(0);
    });
  });

  describe('Event Recording', () => {
    it('should record API call events', () => {
      monitor.recordEvent({
        eventType: 'api_call',
        query: 'react hooks',
        queryType: 'code_examples',
        responseTime: 150,
        success: true,
        optimizationApplied: true,
        confidenceScore: 0.8,
      });

      const events = monitor['events'];
      expect(events.length).toBe(1);
      expect(events[0].eventType).toBe('api_call');
      expect(events[0].query).toBe('react hooks');
      expect(events[0].success).toBe(true);
      expect(events[0].optimizationApplied).toBe(true);
      expect(events[0].confidenceScore).toBe(0.8);
    });

    it('should record cache hit events', () => {
      monitor.recordEvent({
        eventType: 'cache_hit',
        query: 'javascript arrays',
        queryType: 'documentation',
        responseTime: 50,
        success: true,
        cacheKey: 'js_arrays_docs',
      });

      const events = monitor['events'];
      expect(events.length).toBe(1);
      expect(events[0].eventType).toBe('cache_hit');
      expect(events[0].cacheKey).toBe('js_arrays_docs');
    });

    it('should record error events', () => {
      monitor.recordEvent({
        eventType: 'error',
        query: 'invalid query',
        queryType: 'code_examples',
        responseTime: 5000,
        success: false,
        errorMessage: 'API timeout',
      });

      const events = monitor['events'];
      expect(events.length).toBe(1);
      expect(events[0].eventType).toBe('error');
      expect(events[0].success).toBe(false);
      expect(events[0].errorMessage).toBe('API timeout');
    });

    it('should record fallback events', () => {
      monitor.recordEvent({
        eventType: 'fallback_used',
        query: 'python pandas',
        queryType: 'best_practices',
        responseTime: 200,
        success: true,
        fallbackReason: 'API unavailable',
      });

      const events = monitor['events'];
      expect(events.length).toBe(1);
      expect(events[0].eventType).toBe('fallback_used');
      expect(events[0].fallbackReason).toBe('API unavailable');
    });
  });

  describe('Analytics Generation', () => {
    beforeEach(() => {
      // Record some test events
      monitor.recordEvent({
        eventType: 'api_call',
        query: 'react hooks',
        queryType: 'code_examples',
        responseTime: 150,
        success: true,
        optimizationApplied: true,
        confidenceScore: 0.8,
      });

      monitor.recordEvent({
        eventType: 'cache_hit',
        query: 'javascript arrays',
        queryType: 'documentation',
        responseTime: 50,
        success: true,
        cacheKey: 'js_arrays_docs',
      });

      monitor.recordEvent({
        eventType: 'api_call',
        query: 'python pandas',
        queryType: 'best_practices',
        responseTime: 200,
        success: false,
        errorMessage: 'API error',
      });

      monitor.recordEvent({
        eventType: 'fallback_used',
        query: 'vue components',
        queryType: 'troubleshooting',
        responseTime: 100,
        success: true,
        fallbackReason: 'API timeout',
      });
    });

    it('should generate correct analytics', () => {
      const analytics = monitor.getAnalytics();

      expect(analytics.totalRequests).toBe(4);
      expect(analytics.successfulRequests).toBe(3);
      expect(analytics.failedRequests).toBe(1);
      expect(analytics.cacheHits).toBe(1);
      expect(analytics.cacheMisses).toBe(0); // No explicit cache miss events
      expect(analytics.fallbackUsed).toBe(1);
      expect(analytics.errorRate).toBe(0.25); // 1 out of 4 requests failed
      expect(analytics.optimizationRate).toBe(0.25); // 1 out of 4 requests optimized
    });

    it('should calculate query type distribution', () => {
      const analytics = monitor.getAnalytics();

      expect(analytics.queryTypeDistribution).toEqual({
        'code_examples': 1,
        'documentation': 1,
        'best_practices': 1,
        'troubleshooting': 1,
      });
    });

    it('should identify top queries', () => {
      // Add more events with the same query
      monitor.recordEvent({
        eventType: 'api_call',
        query: 'react hooks',
        queryType: 'code_examples',
        responseTime: 120,
        success: true,
      });

      const analytics = monitor.getAnalytics();
      expect(analytics.topQueries.length).toBeGreaterThan(0);
      expect(analytics.topQueries[0].query).toBe('react hooks');
      expect(analytics.topQueries[0].count).toBe(2);
    });

    it('should calculate average response time', () => {
      const analytics = monitor.getAnalytics();
      const expectedAvg = (150 + 50 + 200 + 100) / 4;
      expect(analytics.averageResponseTime).toBeCloseTo(expectedAvg, 1);
    });

    it('should calculate average confidence score', () => {
      const analytics = monitor.getAnalytics();
      expect(analytics.averageConfidenceScore).toBe(0.8); // Only one event had confidence score
    });
  });

  describe('Performance Metrics', () => {
    it('should track performance metrics', () => {
      // Record events to update metrics
      monitor.recordEvent({
        eventType: 'api_call',
        query: 'test',
        queryType: 'documentation',
        responseTime: 100,
        success: true,
      });

      const metrics = monitor.getPerformanceMetrics();
      expect(metrics.apiCallsPerMinute).toBeGreaterThanOrEqual(0);
      expect(metrics.averageResponseTime).toBeGreaterThanOrEqual(0);
      expect(metrics.errorRate).toBeGreaterThanOrEqual(0);
      expect(metrics.memoryUsage).toBeGreaterThan(0);
    });
  });

  describe('Alert System', () => {
    it('should create alerts for high error rate', () => {
      // Record multiple failed events to trigger error rate alert
      for (let i = 0; i < 5; i++) {
        monitor.recordEvent({
          eventType: 'error',
          query: `test ${i}`,
          queryType: 'documentation',
          responseTime: 100,
          success: false,
          errorMessage: 'Test error',
        });
      }

      const alerts = monitor.getAlerts();
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts.some(alert => alert.type === 'error')).toBe(true);
    });

    it('should create alerts for high response time', () => {
      monitor.recordEvent({
        eventType: 'api_call',
        query: 'slow query',
        queryType: 'documentation',
        responseTime: 3000, // Above threshold
        success: true,
      });

      const alerts = monitor.getAlerts();
      expect(alerts.some(alert => alert.type === 'performance')).toBe(true);
    });

    it('should filter resolved alerts', () => {
      // Create an alert
      monitor['alerts'].push({
        id: 'test-alert',
        type: 'error',
        severity: 'high',
        message: 'Test alert',
        timestamp: Date.now(),
        resolved: false,
        metrics: {},
      });

      // Create a resolved alert
      monitor['alerts'].push({
        id: 'resolved-alert',
        type: 'performance',
        severity: 'medium',
        message: 'Resolved alert',
        timestamp: Date.now(),
        resolved: true,
        metrics: {},
      });

      const activeAlerts = monitor.getAlerts(false);
      const allAlerts = monitor.getAlerts(true);

      expect(activeAlerts.length).toBe(1);
      expect(allAlerts.length).toBe(2);
    });
  });

  describe('Dashboard Data', () => {
    it('should provide comprehensive dashboard data', () => {
      monitor.recordEvent({
        eventType: 'api_call',
        query: 'dashboard test',
        queryType: 'documentation',
        responseTime: 100,
        success: true,
      });

      const dashboardData = monitor.getDashboardData();

      expect(dashboardData).toHaveProperty('analytics');
      expect(dashboardData).toHaveProperty('metrics');
      expect(dashboardData).toHaveProperty('alerts');
      expect(dashboardData).toHaveProperty('health');

      expect(dashboardData.analytics.totalRequests).toBe(1);
      expect(['excellent', 'good', 'fair', 'poor', 'critical']).toContain(dashboardData.health);
    });
  });

  describe('Data Export', () => {
    it('should export all data', () => {
      monitor.recordEvent({
        eventType: 'api_call',
        query: 'export test',
        queryType: 'documentation',
        responseTime: 100,
        success: true,
      });

      const exportedData = monitor.exportData();

      expect(exportedData).toHaveProperty('events');
      expect(exportedData).toHaveProperty('analytics');
      expect(exportedData).toHaveProperty('metrics');
      expect(exportedData).toHaveProperty('alerts');
      expect(exportedData).toHaveProperty('exportedAt');

      expect(exportedData.events.length).toBe(1);
      expect(exportedData.exportedAt).toBeGreaterThan(0);
    });
  });

  describe('Event Cleanup', () => {
    it('should cleanup old events', () => {
      // Mock old timestamp
      const oldEvent = {
        id: 'old-event',
        timestamp: Date.now() - 7200000, // 2 hours ago
        eventType: 'api_call' as const,
        query: 'old query',
        queryType: 'documentation' as const,
        responseTime: 100,
        success: true,
      };

      monitor['events'].push(oldEvent);

      // Add a recent event
      monitor.recordEvent({
        eventType: 'api_call',
        query: 'recent query',
        queryType: 'documentation',
        responseTime: 100,
        success: true,
      });

      // Trigger cleanup
      monitor['cleanupOldEvents']();

      const events = monitor['events'];
      expect(events.length).toBe(1);
      expect(events[0].query).toBe('recent query');
    });
  });

  describe('Event Emission', () => {
    it('should emit events for real-time monitoring', async () => {
      return new Promise<void>((resolve) => {
        monitor.on('context7_event', (event) => {
          expect(event.query).toBe('event test');
          resolve();
        });

        monitor.recordEvent({
          eventType: 'api_call',
          query: 'event test',
          queryType: 'documentation',
          responseTime: 100,
          success: true,
        });
      });
    });

    it('should emit alerts', async () => {
      return new Promise<void>((resolve) => {
        monitor.on('context7_alert', (alert) => {
          expect(alert.type).toBe('error');
          resolve();
        });

        // Trigger error rate alert
        for (let i = 0; i < 5; i++) {
          monitor.recordEvent({
            eventType: 'error',
            query: `error ${i}`,
            queryType: 'documentation',
            responseTime: 100,
            success: false,
            errorMessage: 'Test error',
          });
        }
      });
    });
  });
});
