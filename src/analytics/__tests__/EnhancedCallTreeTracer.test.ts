/**
 * Unit Tests for Enhanced CallTreeTracer
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EnhancedCallTreeTracer } from '../EnhancedCallTreeTracer.js';
import { SQLiteTraceStorage } from '../storage/SQLiteTraceStorage.js';
import { StorageBackendFactory } from '../storage/StorageBackend.js';

describe('EnhancedCallTreeTracer', () => {
  let tracer: EnhancedCallTreeTracer;
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

    tracer = new EnhancedCallTreeTracer({
      enabled: true,
      level: 'detailed',
      includeParameters: true,
      includeResults: true,
      includeTiming: true,
      includeContext7: true,
      includeCache: true,
      enableAnalytics: true,
      enableRealTime: true,
      storageBackend,
      samplingRate: 1.0,
      enablePerformanceMonitoring: true,
      enableUsagePatterns: true
    });
  });

  afterEach(async () => {
    if (storageBackend) {
      await storageBackend.close();
    }
  });

  describe('Enhanced Trace Lifecycle', () => {
    it('should start enhanced trace with analytics', async () => {
      await tracer.startEnhancedTrace(
        'create a todo app',
        { role: 'developer', quality: 'enterprise' },
        { projectId: 'test-project' }
      );

      expect(tracer.executionFlow).toBeDefined();
      expect(tracer.executionFlow?.rootNode).toBeDefined();
    });

    it('should end enhanced trace and generate analytics', async () => {
      await tracer.startEnhancedTrace(
        'create a todo app',
        { role: 'developer', quality: 'enterprise' },
        { projectId: 'test-project' }
      );

      // Add some tool calls
      tracer.addToolCall('smart_begin', { projectName: 'test' }, 100, true);
      tracer.addToolCall('smart_write', { feature: 'component' }, 200, true);

      const analytics = await tracer.endEnhancedTrace();

      expect(analytics).toBeDefined();
      expect(analytics?.executionMetrics).toBeDefined();
      expect(analytics?.executionMetrics.totalCalls).toBe(2);
      expect(analytics?.executionMetrics.averageExecutionTime).toBe(150);
      expect(analytics?.executionMetrics.successRate).toBe(1.0);
    });
  });

  describe('Tool Call Tracking', () => {
    beforeEach(async () => {
      await tracer.startEnhancedTrace(
        'test command',
        {},
        {}
      );
    });

    it('should track tool calls with analytics', () => {
      tracer.addToolCall(
        'smart_begin',
        { projectName: 'test-project' },
        150,
        true,
        { projectId: 'proj_123' }
      );

      expect(tracer.toolCalls).toHaveLength(1);
      expect(tracer.toolCalls[0].tool).toBe('smart_begin');
      expect(tracer.toolCalls[0].executionTime).toBe(150);
      expect(tracer.toolCalls[0].success).toBe(true);
    });

    it('should track failed tool calls', () => {
      tracer.addToolCall(
        'smart_write',
        { feature: 'component' },
        100,
        false,
        undefined,
        'Tool execution failed'
      );

      expect(tracer.toolCalls).toHaveLength(1);
      expect(tracer.toolCalls[0].success).toBe(false);
      expect(tracer.toolCalls[0].error).toBe('Tool execution failed');
    });
  });

  describe('Context7 Call Tracking', () => {
    beforeEach(async () => {
      await tracer.startEnhancedTrace('test command', {}, {});
    });

    it('should track Context7 calls with analytics', () => {
      tracer.addContext7Call(
        'library-resolution',
        '/api/libraries/react',
        { query: 'React best practices' },
        200,
        true,
        1024,
        true,
        150,
        0.05
      );

      expect(tracer.context7Calls).toHaveLength(1);
      expect(tracer.context7Calls[0].endpoint).toBe('/api/libraries/react');
      expect(tracer.context7Calls[0].responseTime).toBe(200);
      expect(tracer.context7Calls[0].cacheHit).toBe(true);
    });
  });

  describe('Cache Operation Tracking', () => {
    beforeEach(async () => {
      await tracer.startEnhancedTrace('test command', {}, {});
    });

    it('should track cache operations', () => {
      tracer.addCacheOperation(
        'get',
        'react-patterns-cache',
        5,
        true,
        512,
        true
      );

      expect(tracer.cacheOperations).toHaveLength(1);
      expect(tracer.cacheOperations[0].operation).toBe('get');
      expect(tracer.cacheOperations[0].hit).toBe(true);
    });
  });

  describe('Performance Metrics', () => {
    beforeEach(async () => {
      await tracer.startEnhancedTrace('test command', {}, {});
    });

    it('should record performance metrics', () => {
      tracer.recordPerformanceMetric('execution_time', 1000, 'ms', {
        operation: 'test'
      });

      expect(tracer.performanceMetrics).toHaveLength(1);
      expect(tracer.performanceMetrics[0].name).toBe('execution_time');
      expect(tracer.performanceMetrics[0].value).toBe(1000);
      expect(tracer.performanceMetrics[0].unit).toBe('ms');
    });
  });

  describe('Error Tracking', () => {
    beforeEach(async () => {
      await tracer.startEnhancedTrace('test command', {}, {});
    });

    it('should record errors with context', () => {
      tracer.recordError(
        'Tool execution failed',
        'ToolError',
        'Error stack trace...',
        { tool: 'smart_write', parameters: { feature: 'component' } }
      );

      expect(tracer.errors).toHaveLength(1);
      expect(tracer.errors[0].message).toBe('Tool execution failed');
      expect(tracer.errors[0].type).toBe('ToolError');
      expect(tracer.errors[0].context.tool).toBe('smart_write');
    });
  });

  describe('Usage Pattern Detection', () => {
    beforeEach(async () => {
      await tracer.startEnhancedTrace('test command', {}, {});
    });

    it('should record user patterns', () => {
      tracer.recordUserPattern('tool_usage', {
        tool: 'smart_begin',
        frequency: 5
      }, 0.8);

      expect(tracer.userPatterns).toHaveLength(1);
      expect(tracer.userPatterns[0].type).toBe('tool_usage');
      expect(tracer.userPatterns[0].confidence).toBe(0.8);
    });
  });

  describe('Analytics Generation', () => {
    it('should generate comprehensive analytics', async () => {
      await tracer.startEnhancedTrace(
        'create a React app',
        { role: 'developer' },
        { projectId: 'react-app' }
      );

      // Add various operations
      tracer.addToolCall('smart_begin', { projectName: 'react-app' }, 100, true);
      tracer.addToolCall('smart_write', { feature: 'component' }, 200, true);
      tracer.addContext7Call('library-resolution', '/api/react', {}, 150, true, 512, true, 100, 0.03);
      tracer.addCacheOperation('get', 'react-cache', 5, true, 256, true);
      tracer.recordPerformanceMetric('total_time', 300, 'ms');
      tracer.recordUserPattern('frequent_tool', { tool: 'smart_begin' }, 0.9);

      const analytics = await tracer.endEnhancedTrace();

      expect(analytics).toBeDefined();
      expect(analytics?.executionMetrics.totalCalls).toBe(2);
      expect(analytics?.executionMetrics.successRate).toBe(1.0);
      expect(analytics?.executionMetrics.toolUsageDistribution).toHaveProperty('smart_begin');
      expect(analytics?.executionMetrics.toolUsageDistribution).toHaveProperty('smart_write');
      expect(analytics?.usagePatterns).toHaveLength(1);
      expect(analytics?.performanceInsights.optimizationScore).toBeGreaterThan(0);
    });
  });
});
