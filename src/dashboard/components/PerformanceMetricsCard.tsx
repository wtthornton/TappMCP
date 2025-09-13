/**
 * Performance Metrics Card Component
 *
 * Displays real-time performance metrics including memory usage,
 * response times, cache hit rates, and system health indicators.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import React from 'react';
import { PerformanceMetrics } from '../../websocket/types.js';
import './PerformanceMetricsCard.css';

interface PerformanceMetricsCardProps {
  metrics: PerformanceMetrics | null;
}

/**
 * Performance Metrics Card Component
 *
 * @param props - Component props
 * @returns JSX element
 *
 * @example
 * ```tsx
 * <PerformanceMetricsCard metrics={performanceData} />
 * ```
 *
 * @since 2.0.0
 */
export const PerformanceMetricsCard: React.FC<PerformanceMetricsCardProps> = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="performance-card">
        <div className="performance-header">
          <h3>Performance Metrics</h3>
        </div>
        <div className="performance-body">
          <div className="no-data">
            <span>No performance data available</span>
          </div>
        </div>
      </div>
    );
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getHealthStatus = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'critical';
    if (value >= thresholds.warning) return 'warning';
    return 'healthy';
  };

  const memoryHealth = getHealthStatus(metrics.memoryUsage.rss, { warning: 400, critical: 600 });
  const responseHealth = getHealthStatus(metrics.responseTime, { warning: 1000, critical: 2000 });
  const cacheHealth = getHealthStatus(100 - metrics.cacheHitRate, { warning: 20, critical: 40 });
  const errorHealth = getHealthStatus(metrics.errorRate, { warning: 5, critical: 10 });

  return (
    <div className="performance-card">
      <div className="performance-header">
        <h3>Performance Metrics</h3>
        <div className="performance-timestamp">
          {new Date(metrics.timestamp).toLocaleTimeString()}
        </div>
      </div>

      <div className="performance-body">
        {/* Memory Usage */}
        <div className="metric-group">
          <div className="metric-header">
            <span className="metric-label">Memory Usage</span>
            <span className={`metric-status ${memoryHealth}`}>
              {memoryHealth.toUpperCase()}
            </span>
          </div>
          <div className="metric-details">
            <div className="metric-item">
              <span className="metric-name">RSS:</span>
              <span className="metric-value">{formatBytes(metrics.memoryUsage.rss * 1024 * 1024)}</span>
            </div>
            <div className="metric-item">
              <span className="metric-name">Heap Used:</span>
              <span className="metric-value">{formatBytes(metrics.memoryUsage.heapUsed * 1024 * 1024)}</span>
            </div>
            <div className="metric-item">
              <span className="metric-name">Heap Total:</span>
              <span className="metric-value">{formatBytes(metrics.memoryUsage.heapTotal * 1024 * 1024)}</span>
            </div>
            <div className="metric-item">
              <span className="metric-name">External:</span>
              <span className="metric-value">{formatBytes(metrics.memoryUsage.external * 1024 * 1024)}</span>
            </div>
          </div>
        </div>

        {/* Response Time */}
        <div className="metric-group">
          <div className="metric-header">
            <span className="metric-label">Response Time</span>
            <span className={`metric-status ${responseHealth}`}>
              {responseHealth.toUpperCase()}
            </span>
          </div>
          <div className="metric-details">
            <div className="metric-item">
              <span className="metric-name">Average:</span>
              <span className="metric-value">{formatTime(metrics.responseTime)}</span>
            </div>
          </div>
        </div>

        {/* Cache Performance */}
        <div className="metric-group">
          <div className="metric-header">
            <span className="metric-label">Cache Performance</span>
            <span className={`metric-status ${cacheHealth}`}>
              {cacheHealth.toUpperCase()}
            </span>
          </div>
          <div className="metric-details">
            <div className="metric-item">
              <span className="metric-name">Hit Rate:</span>
              <span className="metric-value">{metrics.cacheHitRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Error Rate */}
        <div className="metric-group">
          <div className="metric-header">
            <span className="metric-label">Error Rate</span>
            <span className={`metric-status ${errorHealth}`}>
              {errorHealth.toUpperCase()}
            </span>
          </div>
          <div className="metric-details">
            <div className="metric-item">
              <span className="metric-name">Rate:</span>
              <span className="metric-value">{metrics.errorRate.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* Active Connections */}
        <div className="metric-group">
          <div className="metric-header">
            <span className="metric-label">Connections</span>
            <span className="metric-status healthy">ACTIVE</span>
          </div>
          <div className="metric-details">
            <div className="metric-item">
              <span className="metric-name">Active:</span>
              <span className="metric-value">{metrics.activeConnections}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="performance-footer">
        <div className="performance-summary">
          <span className="summary-label">Overall Health:</span>
          <span className={`summary-status ${
            [memoryHealth, responseHealth, cacheHealth, errorHealth].includes('critical') ? 'critical' :
            [memoryHealth, responseHealth, cacheHealth, errorHealth].includes('warning') ? 'warning' : 'healthy'
          }`}>
            {[memoryHealth, responseHealth, cacheHealth, errorHealth].includes('critical') ? 'CRITICAL' :
             [memoryHealth, responseHealth, cacheHealth, errorHealth].includes('warning') ? 'WARNING' : 'HEALTHY'}
          </span>
        </div>
      </div>
    </div>
  );
};
