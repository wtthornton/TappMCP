/**
 * Phase 3 Integration Example
 *
 * Comprehensive example demonstrating all Phase 3 features:
 * - Machine Learning Insights
 * - Automated Optimization
 * - API Endpoints
 * - Grafana Integration
 * - Prometheus Metrics
 */

import {
  MLInsightsEngine,
  OptimizationEngine,
  AnalyticsAPI,
  GrafanaIntegration,
  PrometheusIntegration,
  createGrafanaConfig,
  createPrometheusConfig
} from '../index.js';
import { AnalyticsEngine } from '../AnalyticsEngine.js';
import { RealTimeProcessor } from '../RealTimeProcessor.js';
import { SQLiteTraceStorage } from '../storage/SQLiteTraceStorage.js';
import { StoredTrace } from '../types/AnalyticsTypes.js';

/**
 * Complete Phase 3 Analytics System
 */
export class Phase3AnalyticsSystem {
  private mlInsightsEngine: MLInsightsEngine;
  private optimizationEngine: OptimizationEngine;
  private analyticsAPI: AnalyticsAPI;
  private grafanaIntegration: GrafanaIntegration;
  private prometheusIntegration: PrometheusIntegration;
  private analyticsEngine: AnalyticsEngine;
  private realTimeProcessor: RealTimeProcessor;
  private storageBackend: SQLiteTraceStorage;

  constructor() {
    // Initialize storage backend
    this.storageBackend = new SQLiteTraceStorage({
      databasePath: './analytics.db',
      enableCompression: true,
      retentionDays: 30
    });

    // Initialize analytics engine
    this.analyticsEngine = new AnalyticsEngine({
      enablePerformanceInsights: true,
      enableUsagePatterns: true,
      enableQualityMetrics: true,
      batchSize: 100
    });

    // Initialize real-time processor
    this.realTimeProcessor = new RealTimeProcessor({
      enableLiveMetrics: true,
      enableAlerts: true,
      enablePatterns: true,
      refreshInterval: 1000
    });

    // Initialize ML insights engine
    this.mlInsightsEngine = new MLInsightsEngine({
      enablePatternDetection: true,
      enablePredictiveAnalytics: true,
      enableAnomalyDetection: true,
      enableTrendAnalysis: true,
      patternSensitivity: 0.7,
      anomalyThreshold: 0.8,
      trendWindow: 24,
      minDataPoints: 10
    });

    // Initialize optimization engine
    this.optimizationEngine = new OptimizationEngine({
      enableSuggestions: true,
      enableRegressionDetection: true,
      enableAutomatedTuning: true,
      enableABTesting: true,
      regressionThreshold: 0.2,
      confidenceThreshold: 0.7,
      abTestDuration: 24,
      minSampleSize: 10
    });

    // Initialize API
    this.analyticsAPI = new AnalyticsAPI(
      this.analyticsEngine,
      this.realTimeProcessor,
      this.mlInsightsEngine,
      this.optimizationEngine,
      this.storageBackend,
      {
        basePath: '/api/analytics',
        enableCORS: true,
        rateLimit: {
          windowMs: 15 * 60 * 1000,
          max: 100
        },
        auth: {
          enabled: false
        }
      }
    );

    // Initialize Grafana integration
    const grafanaConfig = createGrafanaConfig({
      serverUrl: 'http://localhost:3000',
      apiKey: process.env.GRAFANA_API_KEY || 'your-api-key',
      dashboard: {
        title: 'Smart Vibe Analytics Dashboard',
        uid: 'smart-vibe-dashboard',
        refresh: '5s',
        timezone: 'browser'
      }
    });

    this.grafanaIntegration = new GrafanaIntegration(
      grafanaConfig,
      this.realTimeProcessor,
      this.analyticsEngine
    );

    // Initialize Prometheus integration
    const prometheusConfig = createPrometheusConfig({
      collectionInterval: 1000,
      enableCustomMetrics: true,
      enableHistograms: true,
      enableSummaries: true,
      metricsPrefix: 'smart_vibe_',
      customLabels: {
        service: 'smart-vibe',
        version: '1.0.0',
        environment: 'production'
      }
    });

    this.prometheusIntegration = new PrometheusIntegration(
      prometheusConfig,
      this.realTimeProcessor,
      this.analyticsEngine
    );
  }

  /**
   * Initialize the complete system
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing Phase 3 Analytics System...');

    try {
      // Initialize storage
      await this.storageBackend.initialize();
      console.log('✅ Storage backend initialized');

      // Initialize analytics engine
      await this.analyticsEngine.initialize();
      console.log('✅ Analytics engine initialized');

      // Initialize real-time processor
      await this.realTimeProcessor.initialize();
      console.log('✅ Real-time processor initialized');

      // Initialize ML insights engine
      console.log('✅ ML insights engine initialized');

      // Initialize optimization engine
      console.log('✅ Optimization engine initialized');

      // Initialize API
      console.log('✅ Analytics API initialized');

      // Initialize integrations
      console.log('✅ Grafana integration initialized');
      console.log('✅ Prometheus integration initialized');

      console.log('🎉 Phase 3 Analytics System fully initialized!');
    } catch (error) {
      console.error('❌ Failed to initialize Phase 3 system:', error);
      throw error;
    }
  }

  /**
   * Process traces and generate insights
   */
  async processTraces(traces: StoredTrace[]): Promise<{
    mlInsights: any;
    optimizations: any;
    regressions: any;
    metrics: any;
  }> {
    console.log(`📊 Processing ${traces.length} traces...`);

    try {
      // Generate ML insights
      const mlInsights = await this.mlInsightsEngine.processTraces(traces);
      console.log('✅ ML insights generated');

      // Generate optimization suggestions
      const optimizations = await this.optimizationEngine.analyzeForOptimizations(traces);
      console.log(`✅ Generated ${optimizations.length} optimization suggestions`);

      // Detect regressions
      const regressions = await this.optimizationEngine.detectRegressions(traces);
      console.log(`✅ Regression detection completed: ${regressions.detected ? 'Issues found' : 'No issues'}`);

      // Get Prometheus metrics
      const metrics = await this.prometheusIntegration.getMetrics();
      console.log('✅ Prometheus metrics generated');

      return {
        mlInsights,
        optimizations,
        regressions,
        metrics
      };
    } catch (error) {
      console.error('❌ Failed to process traces:', error);
      throw error;
    }
  }

  /**
   * Get Grafana dashboard configuration
   */
  getGrafanaDashboard(): string {
    return this.grafanaIntegration.exportDashboardConfig();
  }

  /**
   * Get Grafana data source configuration
   */
  getGrafanaDataSource(): string {
    return this.grafanaIntegration.exportDataSourceConfig();
  }

  /**
   * Get Grafana alert rules
   */
  getGrafanaAlerts(): string {
    return this.grafanaIntegration.exportAlertRules();
  }

  /**
   * Get Prometheus metrics
   */
  async getPrometheusMetrics(): Promise<string> {
    return await this.prometheusIntegration.getMetrics();
  }

  /**
   * Get API router for Express integration
   */
  getAPIRouter() {
    return this.analyticsAPI.getRouter();
  }

  /**
   * Start A/B test
   */
  async startABTest(testId: string, variantA: any, variantB: any): Promise<any> {
    return await this.optimizationEngine.startABTest(testId, variantA, variantB);
  }

  /**
   * Update A/B test
   */
  async updateABTest(testId: string, variant: 'A' | 'B', metrics: Record<string, number>): Promise<void> {
    await this.optimizationEngine.updateABTest(testId, variant, metrics);
  }

  /**
   * Get live metrics
   */
  getLiveMetrics() {
    return this.realTimeProcessor.getLiveMetrics();
  }

  /**
   * Get performance trends
   */
  getPerformanceTrends() {
    return this.realTimeProcessor.getPerformanceTrends();
  }

  /**
   * Get usage patterns
   */
  getUsagePatterns() {
    return this.realTimeProcessor.getUsagePatterns();
  }

  /**
   * Get optimization opportunities
   */
  getOptimizationOpportunities() {
    return this.realTimeProcessor.getOptimizationOpportunities();
  }

  /**
   * Get active alerts
   */
  getActiveAlerts() {
    return this.realTimeProcessor.getActiveAlerts();
  }

  /**
   * Shutdown the system
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Phase 3 Analytics System...');

    try {
      await this.realTimeProcessor.shutdown();
      await this.analyticsEngine.shutdown();
      await this.storageBackend.close();
      console.log('✅ Phase 3 system shutdown complete');
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
    }
  }
}

/**
 * Example usage
 */
export async function runPhase3Example(): Promise<void> {
  console.log('🎯 Phase 3 Analytics System Example');
  console.log('=====================================');

  // Create system instance
  const system = new Phase3AnalyticsSystem();

  try {
    // Initialize system
    await system.initialize();

    // Simulate some traces
    const mockTraces: StoredTrace[] = [
      {
        id: 'trace-1',
        command: 'smart_vibe "analyze code quality"',
        options: { role: 'developer', quality: 'enterprise' },
        context: { userId: 'user1', sessionId: 'session1' },
        executionFlow: {
          rootNode: {
            id: 'root',
            name: 'smart_vibe',
            startTime: Date.now() - 1000,
            endTime: Date.now(),
            duration: 1000,
            children: []
          }
        },
        analytics: {
          executionMetrics: {
            totalCalls: 1,
            averageExecutionTime: 1000,
            errorRate: 0.0,
            successRate: 1.0,
            toolUsageDistribution: { 'smart_vibe': 1 },
            cacheEfficiency: 0.8,
            memoryUsage: 0.5,
            cpuUsage: 0.3
          },
          performanceInsights: {
            slowestOperations: [],
            bottlenecks: [],
            optimizationOpportunities: []
          },
          usagePatterns: [],
          qualityMetrics: {
            codeQuality: 85,
            testCoverage: 90,
            maintainability: 80
          }
        },
        storedAt: Date.now() - 1000,
        duration: 1000,
        success: true
      }
    ];

    // Process traces
    const results = await system.processTraces(mockTraces);
    console.log('📊 Processing Results:');
    console.log('- ML Insights:', results.mlInsights.patterns?.length || 0, 'patterns detected');
    console.log('- Optimizations:', results.optimizations.length, 'suggestions generated');
    console.log('- Regressions:', results.regressions.detected ? 'Detected' : 'None');
    console.log('- Metrics:', results.metrics.length, 'characters of Prometheus metrics');

    // Get Grafana configurations
    console.log('\n📈 Grafana Integration:');
    console.log('- Dashboard config available');
    console.log('- Data source config available');
    console.log('- Alert rules available');

    // Get Prometheus metrics
    const prometheusMetrics = await system.getPrometheusMetrics();
    console.log('\n📊 Prometheus Metrics:');
    console.log('- Response time metrics');
    console.log('- Error rate metrics');
    console.log('- Resource usage metrics');
    console.log('- Health score metrics');

    // Get live metrics
    const liveMetrics = system.getLiveMetrics();
    console.log('\n⚡ Live Metrics:');
    console.log('- Response time:', liveMetrics.averageResponseTime, 'ms');
    console.log('- Error rate:', (liveMetrics.errorRate * 100).toFixed(1), '%');
    console.log('- Health score:', liveMetrics.healthScore);
    console.log('- Active alerts:', liveMetrics.activeAlerts);

    // Start A/B test example
    console.log('\n🧪 A/B Testing:');
    const abTest = await system.startABTest('test-1',
      { name: 'Variant A', config: { timeout: 5000 } },
      { name: 'Variant B', config: { timeout: 10000 } }
    );
    console.log('- A/B test started:', abTest.testId);

    // Update A/B test
    await system.updateABTest('test-1', 'A', { responseTime: 800, errorRate: 0.02 });
    await system.updateABTest('test-1', 'B', { responseTime: 1200, errorRate: 0.01 });
    console.log('- A/B test updated with sample data');

    console.log('\n🎉 Phase 3 example completed successfully!');

  } catch (error) {
    console.error('❌ Phase 3 example failed:', error);
  } finally {
    // Shutdown system
    await system.shutdown();
  }
}

// Export for use in other modules
export default Phase3AnalyticsSystem;
