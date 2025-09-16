/**
 * Tests for Performance Monitor system
 * Tests metrics collection, alerting, and real-time monitoring
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PerformanceMonitor, createPerformanceMonitor, performanceMiddleware } from './performance-monitor';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor({
      collectionInterval: 100, // Fast for testing
      retentionPeriod: 1000, // 1 second for testing
      alertThresholds: {
        responseTime: 1000,
        errorRate: 0.05,
        memoryUsage: 0.8,
        cpuUsage: 0.8
      },
      enableRealTime: true,
      enableAlerts: true
    });
  });

  afterEach(() => {
    monitor.stop();
  });

  describe('Basic Functionality', () => {
    it('should start and stop monitoring', () => {
      expect(monitor['isCollecting']).toBe(false);

      monitor.start();
      expect(monitor['isCollecting']).toBe(true);

      monitor.stop();
      expect(monitor['isCollecting']).toBe(false);
    });

    it('should not start monitoring twice', () => {
      monitor.start();
      const timer1 = monitor['collectionTimer'];

      monitor.start();
      const timer2 = monitor['collectionTimer'];

      expect(timer1).toBe(timer2);

      monitor.stop();
    });

    it('should emit events when starting and stopping', () => {
      const startSpy = vi.fn();
      const stopSpy = vi.fn();

      monitor.on('monitoring:started', startSpy);
      monitor.on('monitoring:stopped', stopSpy);

      monitor.start();
      expect(startSpy).toHaveBeenCalled();

      monitor.stop();
      expect(stopSpy).toHaveBeenCalled();
    });
  });

  describe('Request Recording', () => {
    beforeEach(() => {
      monitor.start();
    });

    it('should record successful requests', () => {
      const requestSpy = vi.fn();
      monitor.on('request:recorded', requestSpy);

      monitor.recordRequest('test-request', 150, true, { tag: 'test' });

      expect(requestSpy).toHaveBeenCalledWith({
        name: 'test-request',
        duration: 150,
        success: true,
        tags: { tag: 'test' }
      });

      const summary = monitor.getSummary();
      expect(summary.totalRequests).toBe(1);
      expect(summary.averageResponseTime).toBe(150);
      expect(summary.errorRate).toBe(0);
    });

    it('should record failed requests', () => {
      monitor.recordRequest('failed-request', 200, false);

      const summary = monitor.getSummary();
      expect(summary.totalRequests).toBe(1);
      expect(summary.errorRate).toBe(1);
    });

    it('should calculate average response time correctly', () => {
      monitor.recordRequest('request1', 100, true);
      monitor.recordRequest('request2', 200, true);
      monitor.recordRequest('request3', 300, true);

      const summary = monitor.getSummary();
      expect(summary.averageResponseTime).toBe(200);
    });

    it('should calculate error rate correctly', () => {
      monitor.recordRequest('request1', 100, true);
      monitor.recordRequest('request2', 200, false);
      monitor.recordRequest('request3', 300, true);
      monitor.recordRequest('request4', 400, false);

      const summary = monitor.getSummary();
      expect(summary.errorRate).toBe(0.5);
    });
  });

  describe('Custom Metrics', () => {
    beforeEach(() => {
      monitor.start();
    });

    it('should record custom metrics', () => {
      const metricSpy = vi.fn();
      monitor.on('metric:recorded', metricSpy);

      monitor.recordMetric('custom_metric', 42, 'count', { service: 'test' });

      expect(metricSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'custom_metric',
          value: 42,
          unit: 'count',
          tags: { service: 'test' }
        })
      );
    });

    it('should retrieve metrics by name', () => {
      monitor.recordMetric('metric1', 10, 'count');
      monitor.recordMetric('metric2', 20, 'count');
      monitor.recordMetric('metric1', 30, 'count');

      const metrics = monitor.getMetrics('metric1');
      expect(metrics).toHaveLength(2);
      expect(metrics.every(m => m.name === 'metric1')).toBe(true);
    });

    it('should retrieve metrics by time range', () => {
      const now = Date.now();

      // Record metrics at different times
      monitor.recordMetric('time_metric', 1, 'count');

      // Wait a bit and record another
      setTimeout(() => {
        monitor.recordMetric('time_metric', 2, 'count');
      }, 50);

      // Wait for the second metric to be recorded
      setTimeout(() => {
        const recentMetrics = monitor.getMetrics('time_metric', now + 25);
        expect(recentMetrics).toHaveLength(1);
        expect(recentMetrics[0].value).toBe(2);
      }, 100);
    });
  });

  describe('Alerting System', () => {
    beforeEach(() => {
      monitor.start();
    });

    it('should create alerts for high response times', () => {
      const alertSpy = vi.fn();
      monitor.on('alert:created', alertSpy);

      monitor.recordRequest('slow-request', 1500, true); // Above 1000ms threshold

      expect(alertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          metric: 'request_duration',
          severity: 'high',
          message: expect.stringContaining('Response time 1500ms exceeds threshold 1000ms')
        })
      );
    });

    it('should create critical alerts for very high response times', () => {
      const alertSpy = vi.fn();
      monitor.on('alert:created', alertSpy);

      monitor.recordRequest('very-slow-request', 2500, true); // Above 2000ms (2x threshold)

      expect(alertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'critical'
        })
      );
    });

    it('should track active alerts', () => {
      monitor.recordRequest('slow-request', 1500, true);

      const alerts = monitor.getAlerts(false);
      expect(alerts).toHaveLength(1);
      expect(alerts[0].resolved).toBe(false);
    });

    it('should resolve alerts', () => {
      monitor.recordRequest('slow-request', 1500, true);

      const alerts = monitor.getAlerts(false);
      expect(alerts).toHaveLength(1);

      monitor.resolveAlert(alerts[0].id);

      const resolvedAlerts = monitor.getAlerts(true);
      expect(resolvedAlerts).toHaveLength(1);

      const activeAlerts = monitor.getAlerts(false);
      expect(activeAlerts).toHaveLength(0);
    });

    it('should emit alert resolved event', () => {
      const resolvedSpy = vi.fn();
      monitor.on('alert:resolved', resolvedSpy);

      monitor.recordRequest('slow-request', 1500, true);
      const alerts = monitor.getAlerts(false);

      monitor.resolveAlert(alerts[0].id);

      expect(resolvedSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: alerts[0].id,
          resolved: true
        })
      );
    });
  });

  describe('Performance Summary', () => {
    beforeEach(() => {
      monitor.start();
    });

    it('should calculate throughput correctly', (done) => {
      // Record multiple requests over time
      monitor.recordRequest('request1', 100, true);

      setTimeout(() => {
        monitor.recordRequest('request2', 200, true);

        setTimeout(() => {
          const summary = monitor.getSummary();
          expect(summary.throughput).toBeGreaterThan(0);
          done();
        }, 50);
      }, 50);
    });

    it('should track memory usage', () => {
      const summary = monitor.getSummary();
      expect(summary.memoryUsage).toBeGreaterThanOrEqual(0);
      expect(summary.memoryUsage).toBeLessThanOrEqual(1);
    });

    it('should track CPU usage', () => {
      const summary = monitor.getSummary();
      expect(summary.cpuUsage).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Health Status', () => {
    beforeEach(() => {
      monitor.start();
    });

    it('should return healthy status by default', () => {
      const health = monitor.getHealthStatus();
      expect(health.status).toBe('healthy');
    });

    it('should return degraded status with high alerts', () => {
      monitor.recordRequest('slow-request', 1500, true);

      const health = monitor.getHealthStatus();
      expect(health.status).toBe('degraded');
    });

    it('should return unhealthy status with critical alerts', () => {
      monitor.recordRequest('very-slow-request', 2500, true);

      const health = monitor.getHealthStatus();
      expect(health.status).toBe('unhealthy');
    });

    it('should return degraded status with high error rate', () => {
      // Record many failed requests
      for (let i = 0; i < 10; i++) {
        monitor.recordRequest('failed-request', 100, false);
      }

      const health = monitor.getHealthStatus();
      expect(health.status).toBe('degraded');
    });
  });

  describe('Performance Report', () => {
    beforeEach(() => {
      monitor.start();
    });

    it('should generate performance report', () => {
      monitor.recordRequest('test-request', 150, true);
      monitor.recordMetric('custom-metric', 42, 'count');

      const report = monitor.getReport();

      expect(report.timestamp).toBeGreaterThan(0);
      expect(report.duration).toBeGreaterThan(0);
      expect(report.metrics.length).toBeGreaterThan(0);
      expect(report.summary.totalRequests).toBe(1);
    });

    it('should filter metrics by time range in report', (done) => {
      const startTime = Date.now();

      monitor.recordMetric('time-filtered', 1, 'count');

      setTimeout(() => {
        monitor.recordMetric('time-filtered', 2, 'count');

        setTimeout(() => {
          const report = monitor.getReport(50); // 50ms window
          const filteredMetrics = report.metrics.filter(m => m.name === 'time-filtered');

          // Should only include the second metric (within 50ms window)
          expect(filteredMetrics.length).toBe(1);
          expect(filteredMetrics[0].value).toBe(2);
          done();
        }, 25);
      }, 25);
    });
  });

  describe('Cleanup', () => {
    it('should clean up old metrics', (done) => {
      const shortRetentionMonitor = new PerformanceMonitor({
        retentionPeriod: 50, // 50ms
        collectionInterval: 10
      });

      shortRetentionMonitor.start();
      shortRetentionMonitor.recordMetric('old-metric', 1, 'count');

      setTimeout(() => {
        shortRetentionMonitor.recordMetric('new-metric', 2, 'count');

        setTimeout(() => {
          const metrics = shortRetentionMonitor.getMetrics();
          const oldMetrics = metrics.filter(m => m.value === 1);
          const newMetrics = metrics.filter(m => m.value === 2);

          expect(oldMetrics).toHaveLength(0); // Should be cleaned up
          expect(newMetrics).toHaveLength(1); // Should still exist

          shortRetentionMonitor.stop();
          done();
        }, 100);
      }, 100);
    });
  });

  describe('Express Middleware', () => {
    it('should create performance middleware', () => {
      const middleware = performanceMiddleware(monitor);
      expect(typeof middleware).toBe('function');
    });

    it('should record requests through middleware', () => {
      const middleware = performanceMiddleware(monitor);
      const mockReq = { method: 'GET', path: '/test', route: { path: '/test' } };
      const mockRes = { statusCode: 200, json: vi.fn() };
      const mockNext = vi.fn();

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();

      // Simulate response
      mockRes.json({ data: 'test' });

      const summary = monitor.getSummary();
      expect(summary.totalRequests).toBe(1);
    });
  });

  describe('createPerformanceMonitor', () => {
    it('should create monitor with default config', () => {
      const monitor = createPerformanceMonitor();
      expect(monitor).toBeInstanceOf(PerformanceMonitor);
    });

    it('should create monitor with custom config', () => {
      const customConfig = {
        collectionInterval: 2000,
        alertThresholds: {
          responseTime: 500,
          errorRate: 0.1,
          memoryUsage: 0.9,
          cpuUsage: 0.9
        }
      };

      const monitor = createPerformanceMonitor(customConfig);
      expect(monitor).toBeInstanceOf(PerformanceMonitor);
    });
  });
});
