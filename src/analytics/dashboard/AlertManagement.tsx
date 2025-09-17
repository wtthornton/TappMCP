/**
 * Alert Management Component
 *
 * Alert configuration, management, and notification system
 * for performance monitoring and issue detection.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { RealTimeAlert, LiveMetrics } from '../types/AnalyticsTypes.js';

export interface AlertManagementProps {
  /** Current alerts */
  alerts: RealTimeAlert[];

  /** Live metrics */
  liveMetrics: LiveMetrics | null;

  /** Alert handlers */
  onResolveAlert: (alertId: string) => void;
  onDismissAlert: (alertId: string) => void;
  onConfigureAlerts: (config: AlertConfig) => void;

  /** Configuration */
  className?: string;
}

export interface AlertConfig {
  responseTimeThreshold: number;
  errorRateThreshold: number;
  memoryUsageThreshold: number;
  cpuUsageThreshold: number;
  enableNotifications: boolean;
  alertCooldown: number;
}

export const AlertManagement: React.FC<AlertManagementProps> = ({
  alerts,
  liveMetrics,
  onResolveAlert,
  onDismissAlert,
  onConfigureAlerts,
  className = ''
}) => {
  const [showConfig, setShowConfig] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    responseTimeThreshold: 1000,
    errorRateThreshold: 0.05,
    memoryUsageThreshold: 0.8,
    cpuUsageThreshold: 0.8,
    enableNotifications: true,
    alertCooldown: 60000
  });

  const [filteredAlerts, setFilteredAlerts] = useState<RealTimeAlert[]>([]);
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');

  // Filter alerts based on selected filter
  useEffect(() => {
    if (filter === 'all') {
      setFilteredAlerts(alerts);
    } else {
      setFilteredAlerts(alerts.filter(alert => alert.severity === filter));
    }
  }, [alerts, filter]);

  // Handle alert resolution
  const handleResolveAlert = useCallback((alertId: string) => {
    onResolveAlert(alertId);
  }, [onResolveAlert]);

  // Handle alert dismissal
  const handleDismissAlert = useCallback((alertId: string) => {
    onDismissAlert(alertId);
  }, [onDismissAlert]);

  // Handle configuration save
  const handleSaveConfig = useCallback(() => {
    onConfigureAlerts(alertConfig);
    setShowConfig(false);
  }, [alertConfig, onConfigureAlerts]);

  // Get alert severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#f44336';
      case 'high': return '#ff9800';
      case 'medium': return '#ffc107';
      case 'low': return '#4caf50';
      default: return '#666';
    }
  };

  // Get alert type icon
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'performance': return '⚡';
      case 'error': return '❌';
      case 'optimization': return '💡';
      case 'usage': return '📊';
      default: return '🔔';
    }
  };

  return (
    <div className={`alert-management ${className}`}>
      <div className="alert-header">
        <h3>🚨 Alert Management</h3>
        <div className="alert-controls">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="alert-filter"
          >
            <option value="all">All Alerts</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className="config-button"
          >
            ⚙️ Configure
          </button>
        </div>
      </div>

      {showConfig && (
        <div className="alert-config">
          <h4>Alert Configuration</h4>
          <div className="config-grid">
            <div className="config-item">
              <label>Response Time Threshold (ms)</label>
              <input
                type="number"
                value={alertConfig.responseTimeThreshold}
                onChange={(e) => setAlertConfig(prev => ({
                  ...prev,
                  responseTimeThreshold: parseInt(e.target.value) || 1000
                }))}
              />
            </div>

            <div className="config-item">
              <label>Error Rate Threshold (%)</label>
              <input
                type="number"
                value={alertConfig.errorRateThreshold * 100}
                onChange={(e) => setAlertConfig(prev => ({
                  ...prev,
                  errorRateThreshold: (parseInt(e.target.value) || 5) / 100
                }))}
              />
            </div>

            <div className="config-item">
              <label>Memory Usage Threshold (%)</label>
              <input
                type="number"
                value={alertConfig.memoryUsageThreshold * 100}
                onChange={(e) => setAlertConfig(prev => ({
                  ...prev,
                  memoryUsageThreshold: (parseInt(e.target.value) || 80) / 100
                }))}
              />
            </div>

            <div className="config-item">
              <label>CPU Usage Threshold (%)</label>
              <input
                type="number"
                value={alertConfig.cpuUsageThreshold * 100}
                onChange={(e) => setAlertConfig(prev => ({
                  ...prev,
                  cpuUsageThreshold: (parseInt(e.target.value) || 80) / 100
                }))}
              />
            </div>

            <div className="config-item">
              <label>Alert Cooldown (ms)</label>
              <input
                type="number"
                value={alertConfig.alertCooldown}
                onChange={(e) => setAlertConfig(prev => ({
                  ...prev,
                  alertCooldown: parseInt(e.target.value) || 60000
                }))}
              />
            </div>

            <div className="config-item">
              <label>
                <input
                  type="checkbox"
                  checked={alertConfig.enableNotifications}
                  onChange={(e) => setAlertConfig(prev => ({
                    ...prev,
                    enableNotifications: e.target.checked
                  }))}
                />
                Enable Notifications
              </label>
            </div>
          </div>

          <div className="config-actions">
            <button onClick={handleSaveConfig} className="save-button">
              Save Configuration
            </button>
            <button onClick={() => setShowConfig(false)} className="cancel-button">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="alerts-list">
        {filteredAlerts.length === 0 ? (
          <div className="no-alerts">
            <div className="no-alerts-icon">✅</div>
            <p>No alerts found</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div key={alert.id} className={`alert-item ${alert.severity}`}>
              <div className="alert-icon">
                {getAlertIcon(alert.type)}
              </div>

              <div className="alert-content">
                <div className="alert-header">
                  <h4>{alert.title}</h4>
                  <div className="alert-meta">
                    <span
                      className="alert-severity"
                      style={{ color: getSeverityColor(alert.severity) }}
                    >
                      {alert.severity.toUpperCase()}
                    </span>
                    <span className="alert-time">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="alert-message">
                  {alert.message}
                </div>

                {alert.data && Object.keys(alert.data).length > 0 && (
                  <div className="alert-data">
                    <details>
                      <summary>Alert Data</summary>
                      <pre>{JSON.stringify(alert.data, null, 2)}</pre>
                    </details>
                  </div>
                )}
              </div>

              <div className="alert-actions">
                <button
                  onClick={() => handleResolveAlert(alert.id)}
                  className="resolve-button"
                >
                  Resolve
                </button>
                <button
                  onClick={() => handleDismissAlert(alert.id)}
                  className="dismiss-button"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {liveMetrics && (
        <div className="current-metrics">
          <h4>Current Metrics</h4>
          <div className="metrics-grid">
            <div className="metric-item">
              <span>Response Time:</span>
              <span className={liveMetrics.averageResponseTime > alertConfig.responseTimeThreshold ? 'warning' : 'normal'}>
                {liveMetrics.averageResponseTime.toFixed(0)}ms
              </span>
            </div>
            <div className="metric-item">
              <span>Error Rate:</span>
              <span className={liveMetrics.errorRate > alertConfig.errorRateThreshold ? 'warning' : 'normal'}>
                {(liveMetrics.errorRate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="metric-item">
              <span>Memory Usage:</span>
              <span className={liveMetrics.memoryUsage > alertConfig.memoryUsageThreshold ? 'warning' : 'normal'}>
                {(liveMetrics.memoryUsage * 100).toFixed(1)}%
              </span>
            </div>
            <div className="metric-item">
              <span>Health Score:</span>
              <span className={liveMetrics.healthScore > 80 ? 'good' : liveMetrics.healthScore > 60 ? 'warning' : 'critical'}>
                {liveMetrics.healthScore}/100
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertManagement;
