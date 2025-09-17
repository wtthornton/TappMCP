/**
 * Analytics Dashboard Component
 *
 * Real-time analytics dashboard with live metrics, performance charts,
 * and call tree visualizations for smart_vibe execution analysis.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  CallTreeAnalytics,
  LiveMetrics,
  RealTimeAlert,
  UsagePattern,
  OptimizationOpportunity,
  PerformanceTrends
} from '../types/AnalyticsTypes.js';
import { RealTimeProcessor } from '../RealTimeProcessor.js';
import { AnalyticsEngine } from '../AnalyticsEngine.js';

export interface AnalyticsDashboardProps {
  /** Real-time processor instance */
  realTimeProcessor: RealTimeProcessor;

  /** Analytics engine instance */
  analyticsEngine: AnalyticsEngine;

  /** Dashboard configuration */
  config?: {
    refreshInterval?: number;
    enableAlerts?: boolean;
    enableCharts?: boolean;
    enableExport?: boolean;
  };

  /** Custom styling */
  className?: string;
}

export interface CallTreeVisualizerProps {
  /** Call tree data */
  data: any;

  /** Configuration */
  config?: {
    showTiming?: boolean;
    showPerformance?: boolean;
    showErrors?: boolean;
    showToolCalls?: boolean;
    showContext7Calls?: boolean;
    showCacheOperations?: boolean;
    enableInteractions?: boolean;
    layout?: 'hierarchical' | 'timeline' | 'flow';
  };
}

export interface CallTreeLayout {
  /** Layout type */
  type: 'hierarchical' | 'timeline' | 'flow';

  /** Layout configuration */
  config: Record<string, any>;
}

export interface PerformanceChartsProps {
  /** Performance data */
  data: any;

  /** Configuration */
  config?: {
    showResponseTime?: boolean;
    showErrorRate?: boolean;
    showMemoryUsage?: boolean;
    showCpuUsage?: boolean;
    showThroughput?: boolean;
    enableAnimations?: boolean;
    chartType?: 'line' | 'bar' | 'area';
    timeRange?: '1h' | '24h' | '7d' | '30d';
  };
}

export interface ChartData {
  /** Chart data points */
  points: Array<{ x: number; y: number }>;

  /** Chart metadata */
  metadata: Record<string, any>;
}

export interface ChartConfig {
  /** Chart configuration */
  config: Record<string, any>;
}

export interface AlertManagementProps {
  /** Alert configuration */
  config?: AlertConfig;
}

export interface AlertConfig {
  /** Alert settings */
  settings: Record<string, any>;
}

export interface AlertFilter {
  /** Filter criteria */
  criteria: Record<string, any>;
}

export interface AlertAction {
  /** Action type */
  type: string;

  /** Action data */
  data: Record<string, any>;
}

export interface DashboardState {
  liveMetrics: LiveMetrics | null;
  alerts: RealTimeAlert[];
  patterns: UsagePattern[];
  opportunities: OptimizationOpportunity[];
  trends: PerformanceTrends | null;
  isLoading: boolean;
  error: string | null;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  realTimeProcessor,
  analyticsEngine,
  config = {
    refreshInterval: 1000,
    enableAlerts: true,
    enableCharts: true,
    enableExport: true
  },
  className = ''
}) => {
  const [state, setState] = useState<DashboardState>({
    liveMetrics: null,
    alerts: [],
    patterns: [],
    opportunities: [],
    trends: null,
    isLoading: true,
    error: null
  });

  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [selectedView, setSelectedView] = useState<'overview' | 'performance' | 'patterns' | 'alerts'>('overview');

  // Update live metrics
  const updateLiveMetrics = useCallback(() => {
    try {
      const liveMetrics = realTimeProcessor.getLiveMetrics();
      const alerts = realTimeProcessor.getActiveAlerts();
      const patterns = realTimeProcessor.getUsagePatterns();
      const opportunities = realTimeProcessor.getOptimizationOpportunities();
      const trends = realTimeProcessor.getPerformanceTrends();

      setState(prev => ({
        ...prev,
        liveMetrics,
        alerts,
        patterns,
        opportunities,
        trends,
        isLoading: false,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false
      }));
    }
  }, [realTimeProcessor]);

  // Set up real-time updates
  useEffect(() => {
    updateLiveMetrics();

    const interval = setInterval(updateLiveMetrics, config.refreshInterval);

    // Set up event listeners
    const handleMetricsUpdate = () => updateLiveMetrics();
    const handleAlertCreated = () => updateLiveMetrics();
    const handleAlertResolved = () => updateLiveMetrics();

    realTimeProcessor.on('metrics:updated', handleMetricsUpdate);
    realTimeProcessor.on('alert:created', handleAlertCreated);
    realTimeProcessor.on('alert:resolved', handleAlertResolved);

    return () => {
      clearInterval(interval);
      realTimeProcessor.off('metrics:updated', handleMetricsUpdate);
      realTimeProcessor.off('alert:created', handleAlertCreated);
      realTimeProcessor.off('alert:resolved', handleAlertResolved);
    };
  }, [realTimeProcessor, config.refreshInterval, updateLiveMetrics]);

  // Handle alert resolution
  const handleResolveAlert = useCallback((alertId: string) => {
    realTimeProcessor.resolveAlert(alertId);
    updateLiveMetrics();
  }, [realTimeProcessor, updateLiveMetrics]);

  // Export data
  const handleExportData = useCallback(async (format: 'json' | 'csv' | 'excel') => {
    try {
      const endTime = Date.now();
      const startTime = endTime - (24 * 60 * 60 * 1000); // Last 24 hours

      const analytics = await analyticsEngine.getAnalyticsForTimeRange(startTime, endTime);

      const data = {
        timestamp: new Date().toISOString(),
        timeRange: { start: startTime, end: endTime },
        metrics: analytics.metrics,
        insights: analytics.insights,
        patterns: analytics.patterns,
        quality: analytics.quality
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Export failed'
      }));
    }
  }, [analyticsEngine]);

  if (state.isLoading) {
    return (
      <div className={`analytics-dashboard loading ${className}`}>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className={`analytics-dashboard error ${className}`}>
        <div className="error-message">
          <h3>❌ Error Loading Dashboard</h3>
          <p>{state.error}</p>
          <button onClick={updateLiveMetrics}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`analytics-dashboard ${className}`}>
      {/* Header */}
      <div className="dashboard-header">
        <h1>📊 Smart Vibe Analytics Dashboard</h1>
        <div className="header-controls">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="time-range-selector"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          <div className="view-tabs">
            <button
              className={selectedView === 'overview' ? 'active' : ''}
              onClick={() => setSelectedView('overview')}
            >
              Overview
            </button>
            <button
              className={selectedView === 'performance' ? 'active' : ''}
              onClick={() => setSelectedView('performance')}
            >
              Performance
            </button>
            <button
              className={selectedView === 'patterns' ? 'active' : ''}
              onClick={() => setSelectedView('patterns')}
            >
              Patterns
            </button>
            <button
              className={selectedView === 'alerts' ? 'active' : ''}
              onClick={() => setSelectedView('alerts')}
            >
              Alerts
            </button>
          </div>

          {config.enableExport && (
            <div className="export-controls">
              <button onClick={() => handleExportData('json')}>Export JSON</button>
              <button onClick={() => handleExportData('csv')}>Export CSV</button>
            </div>
          )}
        </div>
      </div>

      {/* Live Metrics Cards */}
      {state.liveMetrics && (
        <div className="metrics-cards">
          <div className="metric-card">
            <h3>🚀 Request Rate</h3>
            <div className="metric-value">{state.liveMetrics.requestRate.toFixed(2)}/s</div>
            <div className="metric-trend">Live</div>
          </div>

          <div className="metric-card">
            <h3>⏱️ Avg Response Time</h3>
            <div className="metric-value">{state.liveMetrics.averageResponseTime.toFixed(0)}ms</div>
            <div className="metric-trend">Real-time</div>
          </div>

          <div className="metric-card">
            <h3>❌ Error Rate</h3>
            <div className="metric-value">{(state.liveMetrics.errorRate * 100).toFixed(1)}%</div>
            <div className="metric-trend">Live</div>
          </div>

          <div className="metric-card">
            <h3>💾 Memory Usage</h3>
            <div className="metric-value">{(state.liveMetrics.memoryUsage * 100).toFixed(1)}%</div>
            <div className="metric-trend">Live</div>
          </div>

          <div className="metric-card">
            <h3>🚨 Active Alerts</h3>
            <div className="metric-value">{state.liveMetrics.activeAlerts}</div>
            <div className="metric-trend">Live</div>
          </div>

          <div className="metric-card">
            <h3>❤️ Health Score</h3>
            <div className="metric-value">{state.liveMetrics.healthScore}/100</div>
            <div className={`metric-trend ${state.liveMetrics.healthScore > 80 ? 'good' : state.liveMetrics.healthScore > 60 ? 'warning' : 'critical'}`}>
              {state.liveMetrics.healthScore > 80 ? 'Healthy' : state.liveMetrics.healthScore > 60 ? 'Warning' : 'Critical'}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="dashboard-content">
        {selectedView === 'overview' && (
          <div className="overview-view">
            <div className="overview-grid">
              {/* Performance Chart */}
              {config.enableCharts && state.trends && (
                <div className="chart-container">
                  <h3>📈 Performance Trends</h3>
                  <div className="performance-chart">
                    <div className="chart-placeholder">
                      Response Time: {state.trends.responseTime.map(t => t.toFixed(0)).join(', ')}ms
                    </div>
                    <div className="chart-placeholder">
                      Error Rate: {state.trends.errorRate.map(r => (r * 100).toFixed(1)).join(', ')}%
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Patterns */}
              <div className="patterns-container">
                <h3>🔍 Recent Usage Patterns</h3>
                <div className="patterns-list">
                  {state.patterns.slice(0, 5).map((pattern, index) => (
                    <div key={index} className="pattern-item">
                      <div className="pattern-type">{pattern.type}</div>
                      <div className="pattern-description">{pattern.description}</div>
                      <div className="pattern-confidence">
                        Confidence: {(pattern.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optimization Opportunities */}
              <div className="opportunities-container">
                <h3>💡 Optimization Opportunities</h3>
                <div className="opportunities-list">
                  {state.opportunities.slice(0, 3).map((opp, index) => (
                    <div key={index} className="opportunity-item">
                      <div className="opportunity-priority">{opp.priority}</div>
                      <div className="opportunity-description">{opp.description}</div>
                      <div className="opportunity-improvement">
                        Expected: +{opp.expectedImprovement.toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedView === 'performance' && (
          <div className="performance-view">
            <h3>⚡ Performance Analysis</h3>
            {state.trends && (
              <div className="performance-details">
                <div className="trend-chart">
                  <h4>Response Time Trend</h4>
                  <div className="chart-data">
                    {state.trends.responseTime.map((time, index) => (
                      <div key={index} className="data-point" style={{ height: `${(time / Math.max(...state.trends!.responseTime)) * 100}%` }}>
                        {time.toFixed(0)}ms
                      </div>
                    ))}
                  </div>
                </div>

                <div className="trend-chart">
                  <h4>Error Rate Trend</h4>
                  <div className="chart-data">
                    {state.trends.errorRate.map((rate, index) => (
                      <div key={index} className="data-point" style={{ height: `${(rate * 100)}%` }}>
                        {(rate * 100).toFixed(1)}%
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedView === 'patterns' && (
          <div className="patterns-view">
            <h3>🔍 Usage Patterns Analysis</h3>
            <div className="patterns-grid">
              {state.patterns.map((pattern, index) => (
                <div key={index} className="pattern-card">
                  <div className="pattern-header">
                    <span className="pattern-type">{pattern.type}</span>
                    <span className="pattern-confidence">{(pattern.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="pattern-description">{pattern.description}</div>
                  <div className="pattern-frequency">Frequency: {pattern.frequency}</div>
                  <div className="pattern-insights">
                    {pattern.insights.map((insight, i) => (
                      <div key={i} className="insight-item">• {insight}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedView === 'alerts' && (
          <div className="alerts-view">
            <h3>🚨 Active Alerts</h3>
            <div className="alerts-list">
              {state.alerts.length === 0 ? (
                <div className="no-alerts">✅ No active alerts</div>
              ) : (
                state.alerts.map((alert, index) => (
                  <div key={index} className={`alert-item ${alert.severity}`}>
                    <div className="alert-header">
                      <span className="alert-type">{alert.type}</span>
                      <span className="alert-severity">{alert.severity}</span>
                      <span className="alert-time">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="alert-title">{alert.title}</div>
                    <div className="alert-message">{alert.message}</div>
                    <div className="alert-actions">
                      <button
                        onClick={() => handleResolveAlert(alert.id)}
                        className="resolve-button"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="dashboard-footer">
        <div className="last-updated">
          Last updated: {state.liveMetrics ? new Date(state.liveMetrics.lastUpdated).toLocaleTimeString() : 'Never'}
        </div>
        <div className="refresh-rate">
          Auto-refresh: {config.refreshInterval}ms
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
