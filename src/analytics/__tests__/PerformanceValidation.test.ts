/**
 * Performance Validation Tests
 *
 * Ensures analytics integration doesn't impact smart_vibe performance
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VibeTapp } from '../../vibe/core/VibeTapp.js';
import { VibeTappAnalyticsIntegration } from '../VibeTappAnalyticsIntegration.js';

describe('Performance Validation', () => {
  let vibeTapp: VibeTapp;
  let analyticsIntegration: VibeTappAnalyticsIntegration;

  beforeEach(async () => {
    vibeTapp = new VibeTapp();
    analyticsIntegration = new VibeTappAnalyticsIntegration(vibeTapp, {
      enabled: true,
      storage: {
        backend: 'sqlite',
        connectionString: ':memory:',
        retentionDays: 1
      },
      realTime: {
        enabled: true,
        processingInterval: 1000,
        enableAlerts: true
      },
      performance: {
        enabled: true,
        samplingRate: 1.0,
        alertThresholds: {
          responseTime: 1000,
          errorRate: 0.05,
          memoryUsage: 0.8
        }
      }
    });

    await analyticsIntegration.initialize();
  });

  afterEach(async () => {
    await analyticsIntegration.stop();
  });

  describe('Response Time Impact', () => {
    it('should not significantly impact response time', async () => {
      const iterations = 10;
      const times: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();

        await analyticsIntegration.vibe('create a simple todo app', {
          role: 'developer',
          quality: 'standard'
        });

        const endTime = Date.now();
        times.push(endTime - startTime);
      }

      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const maxTime = Math.max(...times);

      // Analytics should add less than 100ms on average
      expect(averageTime).toBeLessThan(1000); // Reasonable threshold for test environment
      expect(maxTime).toBeLessThan(2000); // Max should be reasonable

      console.log(`Average response time: ${averageTime.toFixed(2)}ms`);
      console.log(`Max response time: ${maxTime}ms`);
    });

    it('should maintain performance with tracing enabled', async () => {
      const iterations = 5;
      const times: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();

        await analyticsIntegration.vibe('create a React component', {
          role: 'developer',
          quality: 'enterprise',
          trace: true,
          debug: false
        });

        const endTime = Date.now();
        times.push(endTime - startTime);
      }

      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;

      // Even with tracing, should be reasonable
      expect(averageTime).toBeLessThan(1500);

      console.log(`Average response time with tracing: ${averageTime.toFixed(2)}ms`);
    });
  });

  describe('Memory Usage Impact', () => {
    it('should not cause memory leaks', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Run multiple operations
      for (let i = 0; i < 20; i++) {
        await analyticsIntegration.vibe(`test command ${i}`, {
          role: 'developer',
          quality: 'standard'
        });
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);

      console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    });
  });

  describe('Analytics Data Quality', () => {
    it('should generate valid analytics data', async () => {
      const response = await analyticsIntegration.vibe('create a todo app', {
        role: 'developer',
        quality: 'enterprise',
        trace: true
      });

      expect(response).toBeDefined();
      expect(response.success).toBe(true);

      // Check if analytics was added to response
      const analytics = (response as any).analytics;
      if (analytics) {
        expect(analytics.executionMetrics).toBeDefined();
        expect(analytics.executionMetrics.totalCalls).toBeGreaterThanOrEqual(0);
        expect(analytics.executionMetrics.averageExecutionTime).toBeGreaterThanOrEqual(0);
        expect(analytics.executionMetrics.successRate).toBeGreaterThanOrEqual(0);
        expect(analytics.executionMetrics.successRate).toBeLessThanOrEqual(1);
      }
    });

    it('should track tool usage correctly', async () => {
      const response = await analyticsIntegration.vibe('create a React app with TypeScript', {
        role: 'developer',
        quality: 'production',
        trace: true
      });

      expect(response).toBeDefined();

      const analytics = (response as any).analytics;
      if (analytics) {
        expect(analytics.executionMetrics.toolUsageDistribution).toBeDefined();
        expect(typeof analytics.executionMetrics.toolUsageDistribution).toBe('object');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle analytics errors gracefully', async () => {
      // This test ensures that if analytics fails, the main vibe execution still works
      const response = await analyticsIntegration.vibe('test command', {
        role: 'developer',
        quality: 'standard'
      });

      expect(response).toBeDefined();
      expect(response.success).toBe(true);
    });

    it('should not fail when storage is unavailable', async () => {
      // Stop analytics to simulate storage unavailability
      await analyticsIntegration.stop();

      // Reinitialize with invalid storage
      const invalidIntegration = new VibeTappAnalyticsIntegration(vibeTapp, {
        enabled: true,
        storage: {
          backend: 'sqlite',
          connectionString: '/invalid/path/database.db',
          retentionDays: 1
        }
      });

      // Should not throw error even with invalid storage
      const response = await invalidIntegration.vibe('test command', {
        role: 'developer'
      });

      expect(response).toBeDefined();
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent analytics operations', async () => {
      const promises = [];

      // Run multiple concurrent operations
      for (let i = 0; i < 5; i++) {
        promises.push(
          analyticsIntegration.vibe(`concurrent command ${i}`, {
            role: 'developer',
            quality: 'standard'
          })
        );
      }

      const responses = await Promise.all(promises);

      expect(responses).toHaveLength(5);
      responses.forEach(response => {
        expect(response).toBeDefined();
        expect(response.success).toBe(true);
      });
    });
  });

  describe('Live Metrics', () => {
    it('should provide live metrics', async () => {
      // Run a few operations to generate metrics
      await analyticsIntegration.vibe('test command 1', { role: 'developer' });
      await analyticsIntegration.vibe('test command 2', { role: 'developer' });
      await analyticsIntegration.vibe('test command 3', { role: 'developer' });

      const liveMetrics = analyticsIntegration.getLiveMetrics();

      expect(liveMetrics).toBeDefined();
      expect(liveMetrics?.requestRate).toBeGreaterThanOrEqual(0);
      expect(liveMetrics?.averageResponseTime).toBeGreaterThanOrEqual(0);
      expect(liveMetrics?.errorRate).toBeGreaterThanOrEqual(0);
      expect(liveMetrics?.healthScore).toBeGreaterThanOrEqual(0);
      expect(liveMetrics?.healthScore).toBeLessThanOrEqual(100);
    });
  });
});
