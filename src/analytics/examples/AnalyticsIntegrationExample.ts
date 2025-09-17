/**
 * Analytics Integration Example
 *
 * Demonstrates how to integrate the analytics system with VibeTapp
 * for comprehensive call tree capture and analysis.
 */

import { EnhancedCallTreeTracer } from '../EnhancedCallTreeTracer.js';
import { AnalyticsEngine } from '../AnalyticsEngine.js';
import { RealTimeProcessor } from '../RealTimeProcessor.js';
import { SQLiteTraceStorage } from '../storage/SQLiteTraceStorage.js';
import { StorageBackendFactory } from '../storage/StorageBackend.js';

/**
 * Example: Setting up analytics for VibeTapp
 */
export async function setupAnalyticsForVibeTapp() {
  console.log('🔍 Setting up analytics for VibeTapp...');

  // 1. Create storage backend
  const storageConfig = StorageBackendFactory.getDefaultConfig('sqlite');
  const storageBackend = new SQLiteTraceStorage(storageConfig);
  await storageBackend.initialize();

  // 2. Create analytics engine
  const analyticsEngine = new AnalyticsEngine({
    enableRealTime: true,
    enableMLInsights: false,
    performanceThresholds: {
      responseTime: 1000,
      errorRate: 0.05,
      memoryUsage: 0.8
    }
  }, storageBackend);

  // 3. Create real-time processor
  const realTimeProcessor = new RealTimeProcessor({
    processingInterval: 1000,
    enableAlerts: true,
    performanceThresholds: {
      responseTime: 1000,
      errorRate: 0.05,
      memoryUsage: 0.8,
      cpuUsage: 0.8
    }
  }, storageBackend);

  // 4. Create enhanced tracer
  const enhancedTracer = new EnhancedCallTreeTracer({
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

  // 5. Start real-time processing
  realTimeProcessor.start();

  // 6. Set up event listeners
  realTimeProcessor.on('alert:created', (alert) => {
    console.log('🚨 Analytics Alert:', alert.title, '-', alert.message);
  });

  realTimeProcessor.on('metrics:updated', (metrics) => {
    console.log('📊 Live Metrics:', {
      requestRate: metrics.requestRate.toFixed(2),
      avgResponseTime: metrics.averageResponseTime.toFixed(0) + 'ms',
      errorRate: (metrics.errorRate * 100).toFixed(1) + '%',
      healthScore: metrics.healthScore
    });
  });

  return {
    enhancedTracer,
    analyticsEngine,
    realTimeProcessor,
    storageBackend
  };
}

/**
 * Example: Using analytics in VibeTapp execution
 */
export async function exampleVibeTappExecutionWithAnalytics() {
  const { enhancedTracer, analyticsEngine, realTimeProcessor } = await setupAnalyticsForVibeTapp();

  try {
    // Start enhanced trace
    await enhancedTracer.startEnhancedTrace(
      'create a React todo app',
      { role: 'developer', quality: 'enterprise' },
      { projectId: 'todo-app', domain: 'frontend' }
    );

    // Simulate tool calls with analytics
    enhancedTracer.addToolCall(
      'smart_begin',
      { projectName: 'todo-app', techStack: ['React', 'TypeScript'] },
      150,
      true,
      { projectId: 'proj_123', status: 'created' }
    );

    enhancedTracer.addToolCall(
      'smart_write',
      { feature: 'todo-component', type: 'component' },
      800,
      true,
      { code: 'export const TodoApp = () => { ... }' }
    );

    // Simulate Context7 calls
    enhancedTracer.addContext7Call(
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

    // Simulate cache operations
    enhancedTracer.addCacheOperation(
      'get',
      'react-patterns-cache',
      5,
      true,
      512,
      true
    );

    // Record performance metrics
    enhancedTracer.recordPerformanceMetric('total_execution_time', 1000, 'ms');
    enhancedTracer.recordPerformanceMetric('memory_usage', 45, 'MB');

    // End trace and get analytics
    const analytics = await enhancedTracer.endEnhancedTrace();

    if (analytics) {
      console.log('📈 Generated Analytics:');
      console.log('- Execution Time:', analytics.executionMetrics.averageExecutionTime + 'ms');
      console.log('- Success Rate:', (analytics.executionMetrics.successRate * 100).toFixed(1) + '%');
      console.log('- Tool Usage:', Object.keys(analytics.executionMetrics.toolUsageDistribution));
      console.log('- Optimization Score:', analytics.performanceInsights.optimizationScore);
      console.log('- Opportunities:', analytics.optimizationOpportunities.length);

      // Process trace in real-time
      await realTimeProcessor.processTrace({
        id: 'trace_123',
        command: 'create a React todo app',
        options: { role: 'developer', quality: 'enterprise' },
        context: { projectId: 'todo-app', domain: 'frontend' },
        executionFlow: enhancedTracer.executionFlow!,
        analytics,
        storedAt: Date.now(),
        duration: 1000,
        success: true
      });

      // Get live metrics
      const liveMetrics = realTimeProcessor.getLiveMetrics();
      console.log('📊 Live Metrics:', liveMetrics);

      // Get optimization opportunities
      const opportunities = realTimeProcessor.getOptimizationOpportunities();
      console.log('💡 Optimization Opportunities:', opportunities.length);
    }

  } catch (error) {
    console.error('❌ Analytics execution failed:', error);
  }
}

/**
 * Example: Getting historical analytics
 */
export async function exampleHistoricalAnalytics() {
  const { analyticsEngine, storageBackend } = await setupAnalyticsForVibeTapp();

  try {
    // Get analytics for last 24 hours
    const endTime = Date.now();
    const startTime = endTime - (24 * 60 * 60 * 1000);

    const aggregatedAnalytics = await analyticsEngine.getAnalyticsForTimeRange(startTime, endTime);

    console.log('📊 Historical Analytics (24h):');
    console.log('- Total Calls:', aggregatedAnalytics.metrics.totalCalls);
    console.log('- Average Response Time:', aggregatedAnalytics.metrics.averageExecutionTime.toFixed(0) + 'ms');
    console.log('- Success Rate:', (aggregatedAnalytics.metrics.successRate * 100).toFixed(1) + '%');
    console.log('- Tool Distribution:', aggregatedAnalytics.metrics.toolUsageDistribution);
    console.log('- Health Score:', aggregatedAnalytics.insights.optimizationScore);

    // Get optimization recommendations
    const recommendations = await analyticsEngine.getOptimizationRecommendations();
    console.log('💡 Recommendations:', recommendations.length);

  } catch (error) {
    console.error('❌ Historical analytics failed:', error);
  }
}

/**
 * Example: Dashboard data
 */
export async function exampleDashboardData() {
  const { realTimeProcessor } = await setupAnalyticsForVibeTapp();

  try {
    // Get performance trends
    const trends = realTimeProcessor.getPerformanceTrends();
    console.log('📈 Performance Trends:', {
      dataPoints: trends.timestamps.length,
      avgResponseTime: trends.responseTime.reduce((a, b) => a + b, 0) / trends.responseTime.length,
      errorRate: trends.errorRate.reduce((a, b) => a + b, 0) / trends.errorRate.length
    });

    // Get usage patterns
    const patterns = realTimeProcessor.getUsagePatterns();
    console.log('🔍 Usage Patterns:', patterns.map(p => ({
      type: p.type,
      description: p.description,
      confidence: p.confidence
    })));

    // Get active alerts
    const alerts = realTimeProcessor.getActiveAlerts();
    console.log('🚨 Active Alerts:', alerts.length);

  } catch (error) {
    console.error('❌ Dashboard data failed:', error);
  }
}

// Export for use in other modules
export {
  setupAnalyticsForVibeTapp,
  exampleVibeTappExecutionWithAnalytics,
  exampleHistoricalAnalytics,
  exampleDashboardData
};
