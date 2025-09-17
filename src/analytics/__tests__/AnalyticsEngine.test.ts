/**
 * Unit Tests for Analytics Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AnalyticsEngine } from '../AnalyticsEngine.js';
import { SQLiteTraceStorage } from '../storage/SQLiteTraceStorage.js';
import { StoredTrace } from '../types/AnalyticsTypes.js';

describe('AnalyticsEngine', () => {
  let analyticsEngine: AnalyticsEngine;
  let storageBackend: SQLiteTraceStorage;

  beforeEach(async () => {
    // Create in-memory SQLite database for testing
    storageBackend = new SQLiteTraceStorage({
      backend: 'sqlite',
      connectionString: ':memory:',
      retentionDays: 1,
      compression: false,
      encryption: false,
      batchSize: 10
    });

    await storageBackend.initialize();

    analyticsEngine = new AnalyticsEngine({
      enableRealTime: true,
      enableMLInsights: false,
      performanceThresholds: {
        responseTime: 1000,
        errorRate: 0.05,
        memoryUsage: 0.8
      }
    }, storageBackend);
  });

  afterEach(async () => {
    if (storageBackend) {
      await storageBackend.close();
    }
  });

  describe('Trace Processing', () => {
    it('should process a single trace and generate analytics', async () => {
      const mockTrace: StoredTrace = {
        id: 'trace_123',
        command: 'create a todo app',
        options: { role: 'developer' },
        context: { projectId: 'todo-app' },
        executionFlow: {
          rootNode: {
            id: 'root',
            tool: 'smart_vibe',
            phase: 'planning',
            startTime: Date.now(),
            children: [],
            dependencies: [],
            level: 0,
            parameters: { command: 'create a todo app' }
          },
          toolCalls: [
            {
              tool: 'smart_begin',
              parameters: { projectName: 'todo-app' },
              executionTime: 100,
              success: true,
              memoryUsage: 1024,
              cpuUsage: 0.1
            },
            {
              tool: 'smart_write',
              parameters: { feature: 'component' },
              executionTime: 200,
              success: true,
              memoryUsage: 2048,
              cpuUsage: 0.2
            }
          ],
          context7Calls: [],
          cacheOperations: [],
          performanceMetrics: [],
          errors: [],
          resourceUsage: [],
          userPatterns: []
        },
        analytics: {
          id: 'analytics_123',
          timestamp: Date.now(),
          executionMetrics: {
            totalCalls: 2,
            averageExecutionTime: 150,
            successRate: 1.0,
            errorRate: 0,
            toolUsageDistribution: { 'smart_begin': 1, 'smart_write': 1 },
            context7HitRate: 0,
            cacheEfficiency: 0,
            memoryUsage: { peakUsage: 2048, averageUsage: 1536, trend: 'stable', leaksDetected: false, gcFrequency: 0 },
            cpuUsage: { peakUsage: 0.2, averageUsage: 0.15, trend: 'stable', intensiveOperations: [] },
            responseSize: { averageSize: 0, peakSize: 0, sizeDistribution: {}, compressionRatio: 0 }
          },
          performanceInsights: {
            bottlenecks: [],
            slowestOperations: [],
            resourceUtilization: { cpu: 0, memory: 0, io: 0, network: 0, efficiency: 0 },
            scalabilityMetrics: { rpsCapacity: 0, concurrentUsers: 0, responseTimeUnderLoad: 0, scalingEfficiency: 0 },
            optimizationScore: 100,
            recommendations: []
          },
          optimizationOpportunities: [],
          usagePatterns: [],
          qualityMetrics: {
            responseQuality: 100,
            codeQualityImpact: 100,
            userSatisfaction: { overallScore: 100, responseTimeSatisfaction: 0, qualitySatisfaction: 0, usabilitySatisfaction: 0, feedbackPatterns: [] },
            errorAnalysis: { totalErrors: 0, errorRate: 0, categories: [], commonErrors: [], trends: [] },
            completeness: 100,
            accuracy: 100
          },
          trends: {
            performanceTrends: [],
            usageTrends: [],
            qualityTrends: [],
            seasonalPatterns: []
          },
          benchmarks: {
            name: 'smart_vibe_execution',
            type: 'performance',
            currentValue: 150,
            baselineValue: 1000,
            improvement: 85,
            status: 'pass',
            description: 'Smart vibe execution performance benchmark'
          }
        },
        storedAt: Date.now(),
        duration: 300,
        success: true
      };

      const analytics = await analyticsEngine.processTrace(mockTrace);

      expect(analytics).toBeDefined();
      expect(analytics.executionMetrics.totalCalls).toBe(2);
      expect(analytics.executionMetrics.averageExecutionTime).toBe(150);
      expect(analytics.executionMetrics.successRate).toBe(1.0);
    });

    it('should handle empty traces gracefully', async () => {
      const emptyTrace: StoredTrace = {
        id: 'empty_trace',
        command: 'empty command',
        options: {},
        context: {},
        executionFlow: {
          rootNode: {
            id: 'root',
            tool: 'smart_vibe',
            phase: 'planning',
            startTime: Date.now(),
            children: [],
            dependencies: [],
            level: 0
          },
          toolCalls: [],
          context7Calls: [],
          cacheOperations: [],
          performanceMetrics: [],
          errors: [],
          resourceUsage: [],
          userPatterns: []
        },
        analytics: {
          id: 'empty_analytics',
          timestamp: Date.now(),
          executionMetrics: {
            totalCalls: 0,
            averageExecutionTime: 0,
            successRate: 0,
            errorRate: 0,
            toolUsageDistribution: {},
            context7HitRate: 0,
            cacheEfficiency: 0,
            memoryUsage: { peakUsage: 0, averageUsage: 0, trend: 'stable', leaksDetected: false, gcFrequency: 0 },
            cpuUsage: { peakUsage: 0, averageUsage: 0, trend: 'stable', intensiveOperations: [] },
            responseSize: { averageSize: 0, peakSize: 0, sizeDistribution: {}, compressionRatio: 0 }
          },
          performanceInsights: {
            bottlenecks: [],
            slowestOperations: [],
            resourceUtilization: { cpu: 0, memory: 0, io: 0, network: 0, efficiency: 0 },
            scalabilityMetrics: { rpsCapacity: 0, concurrentUsers: 0, responseTimeUnderLoad: 0, scalingEfficiency: 0 },
            optimizationScore: 0,
            recommendations: []
          },
          optimizationOpportunities: [],
          usagePatterns: [],
          qualityMetrics: {
            responseQuality: 0,
            codeQualityImpact: 0,
            userSatisfaction: { overallScore: 0, responseTimeSatisfaction: 0, qualitySatisfaction: 0, usabilitySatisfaction: 0, feedbackPatterns: [] },
            errorAnalysis: { totalErrors: 0, errorRate: 0, categories: [], commonErrors: [], trends: [] },
            completeness: 0,
            accuracy: 0
          },
          trends: {
            performanceTrends: [],
            usageTrends: [],
            qualityTrends: [],
            seasonalPatterns: []
          },
          benchmarks: {
            name: 'smart_vibe_execution',
            type: 'performance',
            currentValue: 0,
            baselineValue: 1000,
            improvement: 0,
            status: 'fail',
            description: 'Smart vibe execution performance benchmark'
          }
        },
        storedAt: Date.now(),
        duration: 0,
        success: true
      };

      const analytics = await analyticsEngine.processTrace(emptyTrace);

      expect(analytics).toBeDefined();
      expect(analytics.executionMetrics.totalCalls).toBe(0);
      expect(analytics.executionMetrics.averageExecutionTime).toBe(0);
    });
  });

  describe('Multiple Trace Processing', () => {
    it('should process multiple traces and generate aggregated analytics', async () => {
      const traces: StoredTrace[] = [
        {
          id: 'trace_1',
          command: 'create app',
          options: {},
          context: {},
          executionFlow: {
            rootNode: { id: 'root1', tool: 'smart_vibe', phase: 'planning', startTime: Date.now(), children: [], dependencies: [], level: 0 },
            toolCalls: [{ tool: 'smart_begin', parameters: {}, executionTime: 100, success: true, memoryUsage: 1024, cpuUsage: 0.1 }],
            context7Calls: [],
            cacheOperations: [],
            performanceMetrics: [],
            errors: [],
            resourceUsage: [],
            userPatterns: []
          },
          analytics: {
            id: 'analytics_1',
            timestamp: Date.now(),
            executionMetrics: {
              totalCalls: 1,
              averageExecutionTime: 100,
              successRate: 1.0,
              errorRate: 0,
              toolUsageDistribution: { 'smart_begin': 1 },
              context7HitRate: 0,
              cacheEfficiency: 0,
              memoryUsage: { peakUsage: 1024, averageUsage: 1024, trend: 'stable', leaksDetected: false, gcFrequency: 0 },
              cpuUsage: { peakUsage: 0.1, averageUsage: 0.1, trend: 'stable', intensiveOperations: [] },
              responseSize: { averageSize: 0, peakSize: 0, sizeDistribution: {}, compressionRatio: 0 }
            },
            performanceInsights: { bottlenecks: [], slowestOperations: [], resourceUtilization: { cpu: 0, memory: 0, io: 0, network: 0, efficiency: 0 }, scalabilityMetrics: { rpsCapacity: 0, concurrentUsers: 0, responseTimeUnderLoad: 0, scalingEfficiency: 0 }, optimizationScore: 100, recommendations: [] },
            optimizationOpportunities: [],
            usagePatterns: [],
            qualityMetrics: { responseQuality: 100, codeQualityImpact: 100, userSatisfaction: { overallScore: 100, responseTimeSatisfaction: 0, qualitySatisfaction: 0, usabilitySatisfaction: 0, feedbackPatterns: [] }, errorAnalysis: { totalErrors: 0, errorRate: 0, categories: [], commonErrors: [], trends: [] }, completeness: 100, accuracy: 100 },
            trends: { performanceTrends: [], usageTrends: [], qualityTrends: [], seasonalPatterns: [] },
            benchmarks: { name: 'smart_vibe_execution', type: 'performance', currentValue: 100, baselineValue: 1000, improvement: 90, status: 'pass', description: 'Smart vibe execution performance benchmark' }
          },
          storedAt: Date.now(),
          duration: 100,
          success: true
        },
        {
          id: 'trace_2',
          command: 'create app',
          options: {},
          context: {},
          executionFlow: {
            rootNode: { id: 'root2', tool: 'smart_vibe', phase: 'planning', startTime: Date.now(), children: [], dependencies: [], level: 0 },
            toolCalls: [{ tool: 'smart_write', parameters: {}, executionTime: 200, success: true, memoryUsage: 2048, cpuUsage: 0.2 }],
            context7Calls: [],
            cacheOperations: [],
            performanceMetrics: [],
            errors: [],
            resourceUsage: [],
            userPatterns: []
          },
          analytics: {
            id: 'analytics_2',
            timestamp: Date.now(),
            executionMetrics: {
              totalCalls: 1,
              averageExecutionTime: 200,
              successRate: 1.0,
              errorRate: 0,
              toolUsageDistribution: { 'smart_write': 1 },
              context7HitRate: 0,
              cacheEfficiency: 0,
              memoryUsage: { peakUsage: 2048, averageUsage: 2048, trend: 'stable', leaksDetected: false, gcFrequency: 0 },
              cpuUsage: { peakUsage: 0.2, averageUsage: 0.2, trend: 'stable', intensiveOperations: [] },
              responseSize: { averageSize: 0, peakSize: 0, sizeDistribution: {}, compressionRatio: 0 }
            },
            performanceInsights: { bottlenecks: [], slowestOperations: [], resourceUtilization: { cpu: 0, memory: 0, io: 0, network: 0, efficiency: 0 }, scalabilityMetrics: { rpsCapacity: 0, concurrentUsers: 0, responseTimeUnderLoad: 0, scalingEfficiency: 0 }, optimizationScore: 100, recommendations: [] },
            optimizationOpportunities: [],
            usagePatterns: [],
            qualityMetrics: { responseQuality: 100, codeQualityImpact: 100, userSatisfaction: { overallScore: 100, responseTimeSatisfaction: 0, qualitySatisfaction: 0, usabilitySatisfaction: 0, feedbackPatterns: [] }, errorAnalysis: { totalErrors: 0, errorRate: 0, categories: [], commonErrors: [], trends: [] }, completeness: 100, accuracy: 100 },
            trends: { performanceTrends: [], usageTrends: [], qualityTrends: [], seasonalPatterns: [] },
            benchmarks: { name: 'smart_vibe_execution', type: 'performance', currentValue: 200, baselineValue: 1000, improvement: 80, status: 'pass', description: 'Smart vibe execution performance benchmark' }
          },
          storedAt: Date.now(),
          duration: 200,
          success: true
        }
      ];

      const aggregatedAnalytics = await analyticsEngine.processTraces(traces);

      expect(aggregatedAnalytics).toBeDefined();
      expect(aggregatedAnalytics.metrics.totalCalls).toBe(2);
      expect(aggregatedAnalytics.metrics.averageExecutionTime).toBe(150);
      expect(aggregatedAnalytics.metrics.successRate).toBe(1.0);
      expect(aggregatedAnalytics.metrics.toolUsageDistribution).toHaveProperty('smart_begin');
      expect(aggregatedAnalytics.metrics.toolUsageDistribution).toHaveProperty('smart_write');
    });

    it('should handle empty trace array', async () => {
      const aggregatedAnalytics = await analyticsEngine.processTraces([]);

      expect(aggregatedAnalytics).toBeDefined();
      expect(aggregatedAnalytics.metrics.totalCalls).toBe(0);
      expect(aggregatedAnalytics.metrics.averageExecutionTime).toBe(0);
    });
  });

  describe('Time Range Analytics', () => {
    it('should get analytics for a specific time range', async () => {
      const endTime = Date.now();
      const startTime = endTime - (60 * 60 * 1000); // 1 hour ago

      const analytics = await analyticsEngine.getAnalyticsForTimeRange(startTime, endTime);

      expect(analytics).toBeDefined();
      expect(analytics.timeRange.start).toBe(startTime);
      expect(analytics.timeRange.end).toBe(endTime);
    });
  });

  describe('Optimization Recommendations', () => {
    it('should get optimization recommendations', async () => {
      const recommendations = await analyticsEngine.getOptimizationRecommendations();

      expect(Array.isArray(recommendations)).toBe(true);
    });
  });
});
