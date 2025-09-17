/**
 * Dashboard Integration Example
 *
 * Complete example showing how to integrate the analytics dashboard
 * with VibeTapp for comprehensive monitoring and visualization.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  AnalyticsDashboard,
  CallTreeVisualizer,
  PerformanceCharts,
  AlertManagement,
  createDashboardConfig,
  createVisualizerConfig,
  createChartsConfig
} from '../dashboard/index.js';
import {
  VibeTappAnalyticsIntegration,
  createVibeTappWithAnalytics
} from '../VibeTappAnalyticsIntegration.js';
import {
  LiveMetrics,
  RealTimeAlert,
  UsagePattern,
  OptimizationOpportunity,
  PerformanceTrends,
  DetailedExecutionFlow
} from '../types/AnalyticsTypes.js';

export interface DashboardIntegrationExampleProps {
  className?: string;
}

export const DashboardIntegrationExample: React.FC<DashboardIntegrationExampleProps> = ({
  className = ''
}) => {
  const [vibeTapp, setVibeTapp] = useState<any>(null);
  const [analytics, setAnalytics] = useState<VibeTappAnalyticsIntegration | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dashboard state
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics | null>(null);
  const [alerts, setAlerts] = useState<RealTimeAlert[]>([]);
  const [patterns, setPatterns] = useState<UsagePattern[]>([]);
  const [opportunities, setOpportunities] = useState<OptimizationOpportunity[]>([]);
  const [trends, setTrends] = useState<PerformanceTrends | null>(null);
  const [executionFlow, setExecutionFlow] = useState<DetailedExecutionFlow | null>(null);

  // Initialize VibeTapp with analytics
  useEffect(() => {
    const initializeAnalytics = async () => {
      try {
        const { vibeTapp: vt, analytics: a } = await createVibeTappWithAnalytics({
          enabled: true,
          storage: {
            backend: 'sqlite',
            connectionString: './data/analytics.db',
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
          }
        });

        setVibeTapp(vt);
        setAnalytics(a);
        setIsInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize analytics');
      }
    };

    initializeAnalytics();
  }, []);

  // Update dashboard data
  const updateDashboardData = useCallback(() => {
    if (!analytics) return;

    try {
      const liveMetrics = analytics.getLiveMetrics();
      const alerts = analytics.getActiveAlerts();
      const patterns = analytics.getUsagePatterns();
      const opportunities = analytics.getOptimizationOpportunities();
      const trends = analytics.getPerformanceTrends();

      setLiveMetrics(liveMetrics);
      setAlerts(alerts);
      setPatterns(patterns);
      setOpportunities(opportunities);
      setTrends(trends);
    } catch (err) {
      console.error('Failed to update dashboard data:', err);
    }
  }, [analytics]);

  // Set up real-time updates
  useEffect(() => {
    if (!analytics) return;

    updateDashboardData();
    const interval = setInterval(updateDashboardData, 1000);

    return () => clearInterval(interval);
  }, [analytics, updateDashboardData]);

  // Handle alert resolution
  const handleResolveAlert = useCallback((alertId: string) => {
    if (analytics) {
      analytics.realTimeProcessor?.resolveAlert(alertId);
      updateDashboardData();
    }
  }, [analytics, updateDashboardData]);

  // Handle alert dismissal
  const handleDismissAlert = useCallback((alertId: string) => {
    // Implement alert dismissal logic
    console.log('Dismissing alert:', alertId);
  }, []);

  // Handle alert configuration
  const handleConfigureAlerts = useCallback((config: any) => {
    // Implement alert configuration logic
    console.log('Configuring alerts:', config);
  }, []);

  // Test VibeTapp execution
  const handleTestExecution = useCallback(async () => {
    if (!vibeTapp || !analytics) return;

    try {
      const response = await analytics.vibe('create a React todo app', {
        role: 'developer',
        quality: 'enterprise',
        trace: true
      });

      console.log('VibeTapp response:', response);

      // Update execution flow for visualizer
      if (analytics.enhancedTracer?.executionFlow) {
        setExecutionFlow(analytics.enhancedTracer.executionFlow);
      }
    } catch (err) {
      console.error('VibeTapp execution failed:', err);
    }
  }, [vibeTapp, analytics]);

  if (!isInitialized) {
    return (
      <div className={`dashboard-integration-example loading ${className}`}>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Initializing analytics dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`dashboard-integration-example error ${className}`}>
        <div className="error-container">
          <h3>❌ Error</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-integration-example ${className}`}>
      <div className="example-header">
        <h1>📊 Analytics Dashboard Integration Example</h1>
        <div className="example-controls">
          <button onClick={handleTestExecution} className="test-button">
            🚀 Test VibeTapp Execution
          </button>
          <button onClick={updateDashboardData} className="refresh-button">
            🔄 Refresh Data
          </button>
        </div>
      </div>

      <div className="dashboard-container">
        {/* Main Analytics Dashboard */}
        <div className="main-dashboard">
          <AnalyticsDashboard
            realTimeProcessor={analytics!.realTimeProcessor!}
            analyticsEngine={analytics!.analyticsEngine!}
            config={createDashboardConfig({
              refreshInterval: 1000,
              enableAlerts: true,
              enableCharts: true,
              enableExport: true
            })}
          />
        </div>

        {/* Performance Charts */}
        <div className="charts-section">
          <PerformanceCharts
            trends={trends}
            liveMetrics={liveMetrics}
            executionMetrics={null} // Would be populated from analytics data
            performanceInsights={null} // Would be populated from analytics data
            config={createChartsConfig({
              showResponseTime: true,
              showErrorRate: true,
              showMemoryUsage: true,
              showCpuUsage: true,
              showThroughput: true,
              enableAnimations: true,
              chartType: 'line',
              timeRange: '24h'
            })}
          />
        </div>

        {/* Call Tree Visualizer */}
        {executionFlow && (
          <div className="visualizer-section">
            <CallTreeVisualizer
              executionFlow={executionFlow}
              performanceMetrics={[]} // Would be populated from analytics data
              errors={[]} // Would be populated from analytics data
              config={createVisualizerConfig({
                showTiming: true,
                showPerformance: true,
                showErrors: true,
                showToolCalls: true,
                showContext7Calls: true,
                showCacheOperations: true,
                enableInteractions: true,
                layout: 'hierarchical'
              })}
            />
          </div>
        )}

        {/* Alert Management */}
        <div className="alerts-section">
          <AlertManagement
            alerts={alerts}
            liveMetrics={liveMetrics}
            onResolveAlert={handleResolveAlert}
            onDismissAlert={handleDismissAlert}
            onConfigureAlerts={handleConfigureAlerts}
          />
        </div>
      </div>

      {/* Status Information */}
      <div className="status-info">
        <h3>📊 Dashboard Status</h3>
        <div className="status-grid">
          <div className="status-item">
            <span>Analytics Status:</span>
            <span className="status-value">
              {analytics?.getAnalyticsStatus().enabled ? '✅ Enabled' : '❌ Disabled'}
            </span>
          </div>
          <div className="status-item">
            <span>Real-time Processing:</span>
            <span className="status-value">
              {analytics?.getAnalyticsStatus().realTimeEnabled ? '✅ Active' : '❌ Inactive'}
            </span>
          </div>
          <div className="status-item">
            <span>Storage Backend:</span>
            <span className="status-value">
              {analytics?.getAnalyticsStatus().storageAvailable ? '✅ Available' : '❌ Unavailable'}
            </span>
          </div>
          <div className="status-item">
            <span>Performance Monitoring:</span>
            <span className="status-value">
              {analytics?.getAnalyticsStatus().performanceMonitoring ? '✅ Active' : '❌ Inactive'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardIntegrationExample;
