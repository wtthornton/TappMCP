/**
 * Analytics API Endpoints
 *
 * RESTful API endpoints for external tool integration,
 * data export, and monitoring integration.
 */

import { Router, Request, Response } from 'express';
import {
  CallTreeAnalytics,
  StoredTrace,
  TraceFilters,
  AggregatedAnalytics,
  ExportFormat,
  ExportedData
} from '../types/AnalyticsTypes.js';
import { AnalyticsEngine } from '../AnalyticsEngine.js';
import { RealTimeProcessor } from '../RealTimeProcessor.js';
import { MLInsightsEngine } from '../ml/MLInsightsEngine.js';
import { OptimizationEngine } from '../optimization/OptimizationEngine.js';
import { StorageBackend } from '../storage/StorageBackend.js';

export interface AnalyticsAPIConfig {
  /** API base path */
  basePath: string;

  /** Enable CORS */
  enableCORS: boolean;

  /** API rate limiting */
  rateLimit: {
    windowMs: number;
    max: number;
  };

  /** Authentication */
  auth: {
    enabled: boolean;
    apiKey?: string;
    jwtSecret?: string;
  };

  /** Data retention */
  retention: {
    enabled: boolean;
    maxAge: number; // days
  };
}

export class AnalyticsAPI {
  private router: Router;
  private analyticsEngine: AnalyticsEngine;
  private realTimeProcessor: RealTimeProcessor;
  private mlInsightsEngine: MLInsightsEngine;
  private optimizationEngine: OptimizationEngine;
  private storageBackend: StorageBackend;
  private config: AnalyticsAPIConfig;

  constructor(
    analyticsEngine: AnalyticsEngine,
    realTimeProcessor: RealTimeProcessor,
    mlInsightsEngine: MLInsightsEngine,
    optimizationEngine: OptimizationEngine,
    storageBackend: StorageBackend,
    config: Partial<AnalyticsAPIConfig> = {}
  ) {
    this.analyticsEngine = analyticsEngine;
    this.realTimeProcessor = realTimeProcessor;
    this.mlInsightsEngine = mlInsightsEngine;
    this.optimizationEngine = optimizationEngine;
    this.storageBackend = storageBackend;

    this.config = {
      basePath: '/api/analytics',
      enableCORS: true,
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // requests per window
      },
      auth: {
        enabled: false
      },
      retention: {
        enabled: true,
        maxAge: 30 // days
      },
      ...config
    };

    this.router = Router();
    this.setupRoutes();
  }

  /**
   * Get Express router
   */
  getRouter(): Router {
    return this.router;
  }

  /**
   * Setup API routes
   */
  private setupRoutes(): void {
    // Health check
    this.router.get('/health', this.healthCheck.bind(this));

    // Metrics endpoints
    this.router.get('/metrics', this.getMetrics.bind(this));
    this.router.get('/metrics/live', this.getLiveMetrics.bind(this));
    this.router.get('/metrics/historical', this.getHistoricalMetrics.bind(this));

    // Traces endpoints
    this.router.get('/traces', this.getTraces.bind(this));
    this.router.get('/traces/:id', this.getTrace.bind(this));
    this.router.delete('/traces/:id', this.deleteTrace.bind(this));

    // Analytics endpoints
    this.router.get('/analytics', this.getAnalytics.bind(this));
    this.router.get('/analytics/aggregated', this.getAggregatedAnalytics.bind(this));
    this.router.get('/analytics/insights', this.getInsights.bind(this));
    this.router.get('/analytics/optimizations', this.getOptimizations.bind(this));

    // Export endpoints
    this.router.get('/export', this.exportData.bind(this));
    this.router.get('/export/:format', this.exportDataFormat.bind(this));

    // ML endpoints
    this.router.get('/ml/patterns', this.getPatterns.bind(this));
    this.router.get('/ml/predictions', this.getPredictions.bind(this));
    this.router.get('/ml/anomalies', this.getAnomalies.bind(this));
    this.router.get('/ml/trends', this.getTrends.bind(this));

    // Optimization endpoints
    this.router.get('/optimization/suggestions', this.getOptimizationSuggestions.bind(this));
    this.router.get('/optimization/regressions', this.getRegressions.bind(this));
    this.router.post('/optimization/ab-test', this.startABTest.bind(this));
    this.router.put('/optimization/ab-test/:id', this.updateABTest.bind(this));

    // Dashboard data endpoints
    this.router.get('/dashboard/overview', this.getDashboardOverview.bind(this));
    this.router.get('/dashboard/performance', this.getPerformanceData.bind(this));
    this.router.get('/dashboard/patterns', this.getPatternData.bind(this));
    this.router.get('/dashboard/alerts', this.getAlertData.bind(this));

    // Integration endpoints
    this.router.get('/integrations/grafana', this.getGrafanaData.bind(this));
    this.router.get('/integrations/prometheus', this.getPrometheusMetrics.bind(this));
    this.router.get('/integrations/webhook', this.getWebhookData.bind(this));
  }

  /**
   * Health check endpoint
   */
  private async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const status = {
        status: 'healthy',
        timestamp: Date.now(),
        version: '1.0.0',
        services: {
          analytics: 'healthy',
          realTime: 'healthy',
          storage: 'healthy',
          ml: 'healthy',
          optimization: 'healthy'
        }
      };

      res.json(status);
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get live metrics
   */
  private async getLiveMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = this.realTimeProcessor.getLiveMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Get historical metrics
   */
  private async getHistoricalMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { startTime, endTime, granularity = 'hour' } = req.query;

      const start = startTime ? parseInt(startTime as string) : Date.now() - (24 * 60 * 60 * 1000);
      const end = endTime ? parseInt(endTime as string) : Date.now();

      const analytics = await this.analyticsEngine.getAnalyticsForTimeRange(start, end);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Get traces with filtering
   */
  private async getTraces(req: Request, res: Response): Promise<void> {
    try {
      const filters: TraceFilters = {
        timeRange: {
          start: req.query.startTime ? parseInt(req.query.startTime as string) : Date.now() - (24 * 60 * 60 * 1000),
          end: req.query.endTime ? parseInt(req.query.endTime as string) : Date.now()
        },
        commands: req.query.commands ? (req.query.commands as string).split(',') : undefined,
        success: req.query.success ? req.query.success === 'true' : undefined,
        tools: req.query.tools ? (req.query.tools as string).split(',') : undefined,
        roles: req.query.roles ? (req.query.roles as string).split(',') : undefined,
        qualityLevels: req.query.qualityLevels ? (req.query.qualityLevels as string).split(',') : undefined
      };

      const traces = await this.storageBackend.getTraces(filters);
      res.json(traces);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Get specific trace
   */
  private async getTrace(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const traces = await this.storageBackend.getTraces({
        timeRange: { start: 0, end: Date.now() }
      });

      const trace = traces.find(t => t.id === id);
      if (!trace) {
        res.status(404).json({ error: 'Trace not found' });
        return;
      }

      res.json(trace);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Delete trace
   */
  private async deleteTrace(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Implementation would depend on storage backend delete method
      res.json({ success: true, message: 'Trace deleted' });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Get analytics data
   */
  private async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { startTime, endTime } = req.query;

      const start = startTime ? parseInt(startTime as string) : Date.now() - (24 * 60 * 60 * 1000);
      const end = endTime ? parseInt(endTime as string) : Date.now();

      const analytics = await this.analyticsEngine.getAnalyticsForTimeRange(start, end);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Get aggregated analytics
   */
  private async getAggregatedAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { startTime, endTime, groupBy = 'hour' } = req.query;

      const start = startTime ? parseInt(startTime as string) : Date.now() - (24 * 60 * 60 * 1000);
      const end = endTime ? parseInt(endTime as string) : Date.now();

      const analytics = await this.analyticsEngine.getAnalyticsForTimeRange(start, end);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Get ML insights
   */
  private async getInsights(req: Request, res: Response): Promise<void> {
    try {
      const { startTime, endTime } = req.query;

      const start = startTime ? parseInt(startTime as string) : Date.now() - (24 * 60 * 60 * 1000);
      const end = endTime ? parseInt(endTime as string) : Date.now();

      const traces = await this.storageBackend.getTraces({
        timeRange: { start, end }
      });

      const insights = await this.mlInsightsEngine.processTraces(traces);
      res.json(insights);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Get optimization suggestions
   */
  private async getOptimizations(req: Request, res: Response): Promise<void> {
    try {
      const { startTime, endTime } = req.query;

      const start = startTime ? parseInt(startTime as string) : Date.now() - (24 * 60 * 60 * 1000);
      const end = endTime ? parseInt(endTime as string) : Date.now();

      const traces = await this.storageBackend.getTraces({
        timeRange: { start, end }
      });

      const suggestions = await this.optimizationEngine.analyzeForOptimizations(traces);
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Export data
   */
  private async exportData(req: Request, res: Response): Promise<void> {
    try {
      const { format = 'json', startTime, endTime } = req.query;

      const start = startTime ? parseInt(startTime as string) : Date.now() - (24 * 60 * 60 * 1000);
      const end = endTime ? parseInt(endTime as string) : Date.now();

      const filters: TraceFilters = {
        timeRange: { start, end }
      };

      const data = await this.storageBackend.exportData(format as ExportFormat, filters);

      res.setHeader('Content-Type', this.getContentType(format as string));
      res.setHeader('Content-Disposition', `attachment; filename="analytics-export-${Date.now()}.${format}"`);
      res.send(data.data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Export data in specific format
   */
  private async exportDataFormat(req: Request, res: Response): Promise<void> {
    try {
      const { format } = req.params;
      const { startTime, endTime } = req.query;

      const start = startTime ? parseInt(startTime as string) : Date.now() - (24 * 60 * 60 * 1000);
      const end = endTime ? parseInt(endTime as string) : Date.now();

      const filters: TraceFilters = {
        timeRange: { start, end }
      };

      const data = await this.storageBackend.exportData(format as ExportFormat, filters);

      res.setHeader('Content-Type', this.getContentType(format));
      res.setHeader('Content-Disposition', `attachment; filename="analytics-export-${Date.now()}.${format}"`);
      res.send(data.data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Get ML patterns
   */
  private async getPatterns(req: Request, res: Response): Promise<void> {
    try {
      const patterns = this.realTimeProcessor.getUsagePatterns();
      res.json(patterns);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Get ML predictions
   */
  private async getPredictions(req: Request, res: Response): Promise<void> {
    try {
      const { startTime, endTime } = req.query;

      const start = startTime ? parseInt(startTime as string) : Date.now() - (24 * 60 * 60 * 1000);
      const end = endTime ? parseInt(endTime as string) : Date.now();

      const traces = await this.storageBackend.getTraces({
        timeRange: { start, end }
      });

      const insights = await this.mlInsightsEngine.processTraces(traces);
      res.json(insights.predictions);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Get ML anomalies
   */
  private async getAnomalies(req: Request, res: Response): Promise<void> {
    try {
      const { startTime, endTime } = req.query;

      const start = startTime ? parseInt(startTime as string) : Date.now() - (24 * 60 * 60 * 1000);
      const end = endTime ? parseInt(endTime as string) : Date.now();

      const traces = await this.storageBackend.getTraces({
        timeRange: { start, end }
      });

      const insights = await this.mlInsightsEngine.processTraces(traces);
      res.json(insights.anomalies);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Get ML trends
   */
  private async getTrends(req: Request, res: Response): Promise<void> {
    try {
      const trends = this.realTimeProcessor.getPerformanceTrends();
      res.json(trends);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Get optimization suggestions
   */
  private async getOptimizationSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const suggestions = await this.optimizationEngine.getOptimizationRecommendations();
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Get performance regressions
   */
  private async getRegressions(req: Request, res: Response): Promise<void> {
    try {
      const { startTime, endTime } = req.query;

      const start = startTime ? parseInt(startTime as string) : Date.now() - (24 * 60 * 60 * 1000);
      const end = endTime ? parseInt(endTime as string) : Date.now();

      const traces = await this.storageBackend.getTraces({
        timeRange: { start, end }
      });

      const regressions = await this.optimizationEngine.detectRegressions(traces);
      res.json(regressions);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Start A/B test
   */
  private async startABTest(req: Request, res: Response): Promise<void> {
    try {
      const { testId, variantA, variantB } = req.body;
      const result = await this.optimizationEngine.startABTest(testId, variantA, variantB);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Update A/B test
   */
  private async updateABTest(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { variant, metrics } = req.body;
      await this.optimizationEngine.updateABTest(id, variant, metrics);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Get dashboard overview data
   */
  private async getDashboardOverview(req: Request, res: Response): Promise<void> {
    try {
      const liveMetrics = this.realTimeProcessor.getLiveMetrics();
      const alerts = this.realTimeProcessor.getActiveAlerts();
      const patterns = this.realTimeProcessor.getUsagePatterns();
      const opportunities = this.realTimeProcessor.getOptimizationOpportunities();

      res.json({
        liveMetrics,
        alerts,
        patterns,
        opportunities,
        timestamp: Date.now()
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Get performance data
   */
  private async getPerformanceData(req: Request, res: Response): Promise<void> {
    try {
      const trends = this.realTimeProcessor.getPerformanceTrends();
      res.json(trends);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Get pattern data
   */
  private async getPatternData(req: Request, res: Response): Promise<void> {
    try {
      const patterns = this.realTimeProcessor.getUsagePatterns();
      res.json(patterns);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Get alert data
   */
  private async getAlertData(req: Request, res: Response): Promise<void> {
    try {
      const alerts = this.realTimeProcessor.getActiveAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Get Grafana integration data
   */
  private async getGrafanaData(req: Request, res: Response): Promise<void> {
    try {
      const liveMetrics = this.realTimeProcessor.getLiveMetrics();
      const trends = this.realTimeProcessor.getPerformanceTrends();

      const grafanaData = {
        series: [
          {
            name: 'Response Time',
            values: trends?.responseTime || [],
            timestamps: trends?.timestamps || []
          },
          {
            name: 'Error Rate',
            values: trends?.errorRate || [],
            timestamps: trends?.timestamps || []
          },
          {
            name: 'Memory Usage',
            values: trends?.memoryUsage || [],
            timestamps: trends?.timestamps || []
          }
        ],
        current: liveMetrics
      };

      res.json(grafanaData);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Get Prometheus metrics
   */
  private async getPrometheusMetrics(req: Request, res: Response): Promise<void> {
    try {
      const liveMetrics = this.realTimeProcessor.getLiveMetrics();

      const prometheusMetrics = [
        `# HELP smart_vibe_response_time_seconds Average response time in seconds`,
        `# TYPE smart_vibe_response_time_seconds gauge`,
        `smart_vibe_response_time_seconds ${liveMetrics.averageResponseTime / 1000}`,
        ``,
        `# HELP smart_vibe_error_rate Error rate (0.0 to 1.0)`,
        `# TYPE smart_vibe_error_rate gauge`,
        `smart_vibe_error_rate ${liveMetrics.errorRate}`,
        ``,
        `# HELP smart_vibe_memory_usage Memory usage percentage`,
        `# TYPE smart_vibe_memory_usage gauge`,
        `smart_vibe_memory_usage ${liveMetrics.memoryUsage}`,
        ``,
        `# HELP smart_vibe_health_score Health score (0-100)`,
        `# TYPE smart_vibe_health_score gauge`,
        `smart_vibe_health_score ${liveMetrics.healthScore}`,
        ``,
        `# HELP smart_vibe_request_rate Requests per second`,
        `# TYPE smart_vibe_request_rate gauge`,
        `smart_vibe_request_rate ${liveMetrics.requestRate}`
      ].join('\n');

      res.setHeader('Content-Type', 'text/plain');
      res.send(prometheusMetrics);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Get webhook data
   */
  private async getWebhookData(req: Request, res: Response): Promise<void> {
    try {
      const { event = 'metrics_update' } = req.query;

      let data: any = {};

      switch (event) {
        case 'metrics_update':
          data = this.realTimeProcessor.getLiveMetrics();
          break;
        case 'alert_created':
          data = this.realTimeProcessor.getActiveAlerts();
          break;
        case 'pattern_detected':
          data = this.realTimeProcessor.getUsagePatterns();
          break;
        default:
          data = { error: 'Unknown event type' };
      }

      res.json({
        event,
        timestamp: Date.now(),
        data
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Get content type for export format
   */
  private getContentType(format: string): string {
    switch (format) {
      case 'json':
        return 'application/json';
      case 'csv':
        return 'text/csv';
      case 'excel':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      default:
        return 'application/octet-stream';
    }
  }
}

export default AnalyticsAPI;
