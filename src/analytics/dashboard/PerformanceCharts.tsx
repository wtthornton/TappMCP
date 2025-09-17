/**
 * Performance Charts Component
 *
 * Interactive performance charts and trend visualizations
 * for analytics data display and analysis.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PerformanceTrends,
  LiveMetrics,
  ExecutionMetrics,
  PerformanceInsights
} from '../types/AnalyticsTypes.js';

export interface PerformanceChartsProps {
  /** Performance trends data */
  trends: PerformanceTrends | null;

  /** Live metrics data */
  liveMetrics: LiveMetrics | null;

  /** Execution metrics data */
  executionMetrics: ExecutionMetrics | null;

  /** Performance insights */
  performanceInsights: PerformanceInsights | null;

  /** Chart configuration */
  config?: {
    showResponseTime?: boolean;
    showErrorRate?: boolean;
    showMemoryUsage?: boolean;
    showCpuUsage?: boolean;
    showThroughput?: boolean;
    enableAnimations?: boolean;
    chartType?: 'line' | 'bar' | 'area' | 'scatter';
    timeRange?: '1h' | '24h' | '7d' | '30d';
  };

  /** Custom styling */
  className?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill?: boolean;
    tension?: number;
  }[];
}

export const PerformanceCharts: React.FC<PerformanceChartsProps> = ({
  trends,
  liveMetrics,
  executionMetrics,
  performanceInsights,
  config = {
    showResponseTime: true,
    showErrorRate: true,
    showMemoryUsage: true,
    showCpuUsage: true,
    showThroughput: true,
    enableAnimations: true,
    chartType: 'line',
    timeRange: '24h'
  },
  className = ''
}) => {
  const [selectedChart, setSelectedChart] = useState<'responseTime' | 'errorRate' | 'memory' | 'cpu' | 'throughput'>('responseTime');
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Generate chart data from trends
  const generateChartData = useCallback((chartType: string): ChartData | null => {
    if (!trends) return null;

    const timeLabels = trends.timestamps.map((timestamp, index) => {
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    });

    let datasets: any[] = [];

    if (chartType === 'responseTime' && config.showResponseTime) {
      datasets.push({
        label: 'Response Time (ms)',
        data: trends.responseTime,
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        fill: true,
        tension: 0.4
      });
    }

    if (chartType === 'errorRate' && config.showErrorRate) {
      datasets.push({
        label: 'Error Rate (%)',
        data: trends.errorRate.map(rate => rate * 100),
        borderColor: '#f44336',
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        fill: true,
        tension: 0.4
      });
    }

    if (chartType === 'memory' && config.showMemoryUsage) {
      datasets.push({
        label: 'Memory Usage (%)',
        data: trends.memoryUsage.map(usage => usage * 100),
        borderColor: '#ff9800',
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        fill: true,
        tension: 0.4
      });
    }

    if (chartType === 'cpu' && config.showCpuUsage) {
      datasets.push({
        label: 'CPU Usage (%)',
        data: trends.cpuUsage || [],
        borderColor: '#9c27b0',
        backgroundColor: 'rgba(156, 39, 176, 0.1)',
        fill: true,
        tension: 0.4
      });
    }

    if (chartType === 'throughput' && config.showThroughput) {
      // Calculate throughput from response times
      const throughput = trends.responseTime.map(time => time > 0 ? 1000 / time : 0);
      datasets.push({
        label: 'Throughput (req/s)',
        data: throughput,
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        fill: true,
        tension: 0.4
      });
    }

    return {
      labels: timeLabels,
      datasets
    };
  }, [trends, config]);

  // Update chart data when selection changes
  useEffect(() => {
    setIsLoading(true);
    const data = generateChartData(selectedChart);
    setChartData(data);
    setIsLoading(false);
  }, [selectedChart, generateChartData]);

  // Generate mock data if no trends available
  useEffect(() => {
    if (!trends && liveMetrics) {
      const mockData: ChartData = {
        labels: ['Now'],
        datasets: [{
          label: 'Current Value',
          data: [liveMetrics.averageResponseTime],
          borderColor: '#2196f3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          fill: true
        }]
      };
      setChartData(mockData);
    }
  }, [trends, liveMetrics]);

  // Render simple chart (since we don't have a charting library)
  const renderSimpleChart = useCallback((data: ChartData) => {
    if (!data || data.datasets.length === 0) return null;

    const maxValue = Math.max(...data.datasets[0].data);
    const minValue = Math.min(...data.datasets[0].data);
    const range = maxValue - minValue || 1;

    return (
      <div className="simple-chart">
        <div className="chart-header">
          <h4>{data.datasets[0].label}</h4>
          <div className="chart-stats">
            <span>Max: {maxValue.toFixed(2)}</span>
            <span>Min: {minValue.toFixed(2)}</span>
            <span>Avg: {(data.datasets[0].data.reduce((a, b) => a + b, 0) / data.datasets[0].data.length).toFixed(2)}</span>
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-bars">
            {data.datasets[0].data.map((value, index) => {
              const height = ((value - minValue) / range) * 100;
              return (
                <div key={index} className="chart-bar-container">
                  <div
                    className="chart-bar"
                    style={{
                      height: `${height}%`,
                      backgroundColor: data.datasets[0].backgroundColor
                    }}
                    title={`${data.labels[index]}: ${value.toFixed(2)}`}
                  />
                  <div className="chart-label">{data.labels[index]}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }, []);

  // Render performance insights
  const renderPerformanceInsights = useCallback(() => {
    if (!performanceInsights) return null;

    return (
      <div className="performance-insights">
        <h4>⚡ Performance Insights</h4>

        <div className="insight-metrics">
          <div className="metric-card">
            <div className="metric-label">Optimization Score</div>
            <div className="metric-value">{performanceInsights.optimizationScore}/100</div>
            <div className={`metric-indicator ${performanceInsights.optimizationScore > 80 ? 'good' : performanceInsights.optimizationScore > 60 ? 'warning' : 'critical'}`}>
              {performanceInsights.optimizationScore > 80 ? 'Excellent' : performanceInsights.optimizationScore > 60 ? 'Good' : 'Needs Improvement'}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Bottlenecks</div>
            <div className="metric-value">{performanceInsights.bottlenecks.length}</div>
            <div className="metric-indicator">
              {performanceInsights.bottlenecks.length === 0 ? 'None' : 'Found'}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Slow Operations</div>
            <div className="metric-value">{performanceInsights.slowestOperations.length}</div>
            <div className="metric-indicator">
              {performanceInsights.slowestOperations.length === 0 ? 'None' : 'Found'}
            </div>
          </div>
        </div>

        {performanceInsights.bottlenecks.length > 0 && (
          <div className="bottlenecks-list">
            <h5>🚨 Bottlenecks</h5>
            {performanceInsights.bottlenecks.map((bottleneck, index) => (
              <div key={index} className="bottleneck-item">
                <div className="bottleneck-type">{bottleneck.type}</div>
                <div className="bottleneck-description">{bottleneck.description}</div>
                <div className="bottleneck-impact">Impact: {bottleneck.impact}%</div>
              </div>
            ))}
          </div>
        )}

        {performanceInsights.slowestOperations.length > 0 && (
          <div className="slow-operations-list">
            <h5>🐌 Slowest Operations</h5>
            {performanceInsights.slowestOperations.map((operation, index) => (
              <div key={index} className="operation-item">
                <div className="operation-name">{operation.operation}</div>
                <div className="operation-time">{operation.executionTime}ms</div>
                <div className="operation-percentage">{operation.percentage.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }, [performanceInsights]);

  // Render execution metrics summary
  const renderExecutionMetrics = useCallback(() => {
    if (!executionMetrics) return null;

    return (
      <div className="execution-metrics">
        <h4>📊 Execution Metrics</h4>

        <div className="metrics-grid">
          <div className="metric-item">
            <div className="metric-label">Total Calls</div>
            <div className="metric-value">{executionMetrics.totalCalls}</div>
          </div>

          <div className="metric-item">
            <div className="metric-label">Avg Response Time</div>
            <div className="metric-value">{executionMetrics.averageExecutionTime.toFixed(0)}ms</div>
          </div>

          <div className="metric-item">
            <div className="metric-label">Success Rate</div>
            <div className="metric-value">{(executionMetrics.successRate * 100).toFixed(1)}%</div>
          </div>

          <div className="metric-item">
            <div className="metric-label">Error Rate</div>
            <div className="metric-value">{(executionMetrics.errorRate * 100).toFixed(1)}%</div>
          </div>

          <div className="metric-item">
            <div className="metric-label">Context7 Hit Rate</div>
            <div className="metric-value">{(executionMetrics.context7HitRate * 100).toFixed(1)}%</div>
          </div>

          <div className="metric-item">
            <div className="metric-label">Cache Efficiency</div>
            <div className="metric-value">{(executionMetrics.cacheEfficiency * 100).toFixed(1)}%</div>
          </div>
        </div>

        {Object.keys(executionMetrics.toolUsageDistribution).length > 0 && (
          <div className="tool-usage-distribution">
            <h5>🔧 Tool Usage Distribution</h5>
            <div className="tool-usage-chart">
              {Object.entries(executionMetrics.toolUsageDistribution).map(([tool, count]) => (
                <div key={tool} className="tool-usage-item">
                  <div className="tool-name">{tool}</div>
                  <div className="tool-count">{count}</div>
                  <div className="tool-bar">
                    <div
                      className="tool-bar-fill"
                      style={{
                        width: `${(count / Math.max(...Object.values(executionMetrics.toolUsageDistribution))) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }, [executionMetrics]);

  return (
    <div className={`performance-charts ${className}`}>
      <div className="charts-header">
        <h3>📈 Performance Charts</h3>

        <div className="chart-controls">
          <div className="chart-selector">
            <button
              className={selectedChart === 'responseTime' ? 'active' : ''}
              onClick={() => setSelectedChart('responseTime')}
            >
              Response Time
            </button>
            <button
              className={selectedChart === 'errorRate' ? 'active' : ''}
              onClick={() => setSelectedChart('errorRate')}
            >
              Error Rate
            </button>
            <button
              className={selectedChart === 'memory' ? 'active' : ''}
              onClick={() => setSelectedChart('memory')}
            >
              Memory
            </button>
            <button
              className={selectedChart === 'cpu' ? 'active' : ''}
              onClick={() => setSelectedChart('cpu')}
            >
              CPU
            </button>
            <button
              className={selectedChart === 'throughput' ? 'active' : ''}
              onClick={() => setSelectedChart('throughput')}
            >
              Throughput
            </button>
          </div>
        </div>
      </div>

      <div className="charts-content">
        {isLoading ? (
          <div className="loading-chart">
            <div className="spinner"></div>
            <p>Loading chart data...</p>
          </div>
        ) : chartData ? (
          <div className="chart-section">
            {renderSimpleChart(chartData)}
          </div>
        ) : (
          <div className="no-data">
            <p>No chart data available</p>
          </div>
        )}

        <div className="metrics-sections">
          {renderExecutionMetrics()}
          {renderPerformanceInsights()}
        </div>
      </div>
    </div>
  );
};

export default PerformanceCharts;
