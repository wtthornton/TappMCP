/**
 * VibeTapp Analytics Integration
 *
 * Integrates the analytics system with VibeTapp for comprehensive
 * call tree capture and performance analysis.
 */

import { VibeTapp } from '../vibe/core/VibeTapp.js';
import { VibeOptions, VibeResponse } from '../vibe/types/VibeTypes.js';
import { EnhancedCallTreeTracer } from './EnhancedCallTreeTracer.js';
import { AnalyticsEngine } from './AnalyticsEngine.js';
import { RealTimeProcessor } from './RealTimeProcessor.js';
import { SQLiteTraceStorage } from './storage/SQLiteTraceStorage.js';
import { StorageBackendFactory } from './storage/StorageBackend.js';
import { CallTreeAnalytics } from './types/AnalyticsTypes.js';

export interface VibeTappAnalyticsConfig {
  /** Enable analytics collection */
  enabled: boolean;

  /** Storage backend configuration */
  storage: {
    backend: 'sqlite' | 'postgresql' | 'json';
    connectionString?: string;
    retentionDays: number;
  };

  /** Real-time processing configuration */
  realTime: {
    enabled: boolean;
    processingInterval: number;
    enableAlerts: boolean;
  };

  /** Performance monitoring configuration */
  performance: {
    enabled: boolean;
    samplingRate: number;
    alertThresholds: {
      responseTime: number;
      errorRate: number;
      memoryUsage: number;
    };
  };
}

export class VibeTappAnalyticsIntegration {
  private vibeTapp: VibeTapp;
  private enhancedTracer: EnhancedCallTreeTracer | null = null;
  private analyticsEngine: AnalyticsEngine | null = null;
  private realTimeProcessor: RealTimeProcessor | null = null;
  private storageBackend: any = null;
  private config: VibeTappAnalyticsConfig;
  private initialized: boolean = false;

  constructor(vibeTapp: VibeTapp, config?: Partial<VibeTappAnalyticsConfig>) {
    this.vibeTapp = vibeTapp;
    this.config = {
      enabled: true,
      storage: {
        backend: 'sqlite',
        retentionDays: 30
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
      },
      ...config
    };
  }

  /**
   * Initialize analytics integration
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      console.log('🔍 Initializing VibeTapp Analytics Integration...');

      // Initialize storage backend
      const storageConfig = StorageBackendFactory.getDefaultConfig(this.config.storage.backend);
      if (this.config.storage.connectionString) {
        storageConfig.connectionString = this.config.storage.connectionString;
      }
      this.storageBackend = new SQLiteTraceStorage(storageConfig);
      await this.storageBackend.initialize();

      // Initialize analytics engine
      this.analyticsEngine = new AnalyticsEngine({
        enableRealTime: this.config.realTime.enabled,
        enableMLInsights: false,
        performanceThresholds: this.config.performance.alertThresholds
      }, this.storageBackend);

      // Initialize real-time processor
      this.realTimeProcessor = new RealTimeProcessor({
        processingInterval: this.config.realTime.processingInterval,
        enableAlerts: this.config.realTime.enableAlerts,
        performanceThresholds: this.config.performance.alertThresholds
      }, this.storageBackend);

      // Start real-time processing
      if (this.config.realTime.enabled) {
        this.realTimeProcessor.start();
      }

      this.initialized = true;
      console.log('✅ VibeTapp Analytics Integration initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize analytics integration:', error);
      throw error;
    }
  }

  /**
   * Enhanced vibe method with analytics
   */
  async vibe(input: string, options?: VibeOptions): Promise<VibeResponse> {
    if (!this.initialized) {
      await this.initialize();
    }

    const startTime = Date.now();
    const requestId = `analytics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Initialize enhanced tracer if analytics is enabled
      if (this.config.enabled && (options?.trace || options?.debug)) {
        this.enhancedTracer = new EnhancedCallTreeTracer({
          enabled: true,
          level: options.traceLevel || (options.debug ? 'comprehensive' : 'basic'),
          includeParameters: true,
          includeResults: true,
          includeTiming: true,
          includeContext7: true,
          includeCache: true,
          enableAnalytics: true,
          enableRealTime: this.config.realTime.enabled,
          storageBackend: this.storageBackend,
          samplingRate: this.config.performance.samplingRate,
          enablePerformanceMonitoring: this.config.performance.enabled,
          enableUsagePatterns: true
        });

        // Start enhanced trace
        await this.enhancedTracer.startEnhancedTrace(
          input,
          options,
          this.vibeTapp.getContext()
        );
      }

      // Execute original vibe method
      const response = await this.vibeTapp.vibe(input, options);

      // Process analytics if enabled
      if (this.config.enabled && this.enhancedTracer) {
        try {
          // End enhanced trace and get analytics
          const analytics = await this.enhancedTracer.endEnhancedTrace();

          if (analytics) {
            // Add analytics to response
            (response as any).analytics = analytics;

            // Process in real-time
            if (this.realTimeProcessor) {
              await this.realTimeProcessor.processTrace({
                id: requestId,
                command: input,
                options: options || {},
                context: this.vibeTapp.getContext(),
                executionFlow: this.enhancedTracer.executionFlow!,
                analytics,
                storedAt: Date.now(),
                duration: Date.now() - startTime,
                success: response.success !== false,
                errorMessage: response.success === false ? 'Execution failed' : undefined
              });
            }

            // Add analytics summary to response
            if (options?.trace || options?.debug) {
              response.message += `\n\n**📊 Analytics Summary:**\n`;
              response.message += `- Execution Time: ${analytics.executionMetrics.averageExecutionTime.toFixed(0)}ms\n`;
              response.message += `- Success Rate: ${(analytics.executionMetrics.successRate * 100).toFixed(1)}%\n`;
              response.message += `- Tools Used: ${Object.keys(analytics.executionMetrics.toolUsageDistribution).length}\n`;
              response.message += `- Optimization Score: ${analytics.performanceInsights.optimizationScore}/100\n`;

              if (analytics.optimizationOpportunities.length > 0) {
                response.message += `- Optimization Opportunities: ${analytics.optimizationOpportunities.length}\n`;
              }
            }
          }
        } catch (analyticsError) {
          console.warn('Analytics processing failed:', analyticsError);
          // Don't fail the main request if analytics fails
        }
      }

      return response;

    } catch (error) {
      console.error('Enhanced vibe execution failed:', error);

      // Fallback to original vibe method
      return this.vibeTapp.vibe(input, options);
    }
  }

  /**
   * Get analytics for recent executions
   */
  async getRecentAnalytics(count: number = 50): Promise<CallTreeAnalytics[]> {
    if (!this.initialized || !this.storageBackend) {
      return [];
    }

    try {
      const traces = await this.storageBackend.getTraces({
        timeRange: {
          start: Date.now() - (24 * 60 * 60 * 1000), // Last 24 hours
          end: Date.now()
        }
      });

      return traces
        .sort((a, b) => b.storedAt - a.storedAt)
        .slice(0, count)
        .map(trace => trace.analytics)
        .filter(Boolean);

    } catch (error) {
      console.error('Failed to get recent analytics:', error);
      return [];
    }
  }

  /**
   * Get live metrics
   */
  getLiveMetrics() {
    if (!this.realTimeProcessor) {
      return null;
    }
    return this.realTimeProcessor.getLiveMetrics();
  }

  /**
   * Get optimization opportunities
   */
  async getOptimizationOpportunities() {
    if (!this.analyticsEngine) {
      return [];
    }
    return this.analyticsEngine.getOptimizationRecommendations();
  }

  /**
   * Get performance trends
   */
  getPerformanceTrends() {
    if (!this.realTimeProcessor) {
      return null;
    }
    return this.realTimeProcessor.getPerformanceTrends();
  }

  /**
   * Get usage patterns
   */
  getUsagePatterns() {
    if (!this.realTimeProcessor) {
      return [];
    }
    return this.realTimeProcessor.getUsagePatterns();
  }

  /**
   * Get active alerts
   */
  getActiveAlerts() {
    if (!this.realTimeProcessor) {
      return [];
    }
    return this.realTimeProcessor.getActiveAlerts();
  }

  /**
   * Get analytics status
   */
  getAnalyticsStatus() {
    return {
      initialized: this.initialized,
      enabled: this.config.enabled,
      storageAvailable: !!this.storageBackend,
      realTimeEnabled: this.config.realTime.enabled,
      performanceMonitoring: this.config.performance.enabled
    };
  }

  /**
   * Update analytics configuration
   */
  updateConfig(newConfig: Partial<VibeTappAnalyticsConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Stop analytics processing
   */
  async stop(): Promise<void> {
    if (this.realTimeProcessor) {
      this.realTimeProcessor.stop();
    }

    if (this.storageBackend) {
      await this.storageBackend.close();
    }

    this.initialized = false;
    console.log('⏹️ Analytics integration stopped');
  }
}

/**
 * Create enhanced VibeTapp with analytics
 */
export async function createVibeTappWithAnalytics(
  config?: Partial<VibeTappAnalyticsConfig>
): Promise<{ vibeTapp: VibeTapp; analytics: VibeTappAnalyticsIntegration }> {
  const vibeTapp = new VibeTapp();
  const analytics = new VibeTappAnalyticsIntegration(vibeTapp, config);

  await analytics.initialize();

  return { vibeTapp, analytics };
}
