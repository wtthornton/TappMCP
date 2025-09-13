/**
 * System Status Card Component
 *
 * Displays overall system health status with visual indicators
 * and system information.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import React from 'react';
import './SystemStatusCard.css';

interface SystemStatusCardProps {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'maintenance';
}

/**
 * System Status Card Component
 *
 * @param props - Component props
 * @returns JSX element
 *
 * @example
 * ```tsx
 * <SystemStatusCard status="healthy" />
 * ```
 *
 * @since 2.0.0
 */
export const SystemStatusCard: React.FC<SystemStatusCardProps> = ({ status }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return '🟢';
      case 'degraded':
        return '🟡';
      case 'unhealthy':
        return '🔴';
      case 'maintenance':
        return '🔧';
      default:
        return '❓';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'All systems operational';
      case 'degraded':
        return 'Some systems experiencing issues';
      case 'unhealthy':
        return 'Multiple systems down';
      case 'maintenance':
        return 'System maintenance in progress';
      default:
        return 'Unknown system status';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'status-healthy';
      case 'degraded':
        return 'status-degraded';
      case 'unhealthy':
        return 'status-unhealthy';
      case 'maintenance':
        return 'status-maintenance';
      default:
        return 'status-unknown';
    }
  };

  return (
    <div className={`system-status-card ${getStatusColor(status)}`}>
      <div className="system-status-header">
        <div className="status-indicator">
          <span className="status-icon">{getStatusIcon(status)}</span>
          <div className="status-info">
            <h3 className="status-title">System Status</h3>
            <p className="status-message">{getStatusMessage(status)}</p>
          </div>
        </div>
        <div className="status-badge">
          <span className={`badge ${getStatusColor(status)}`}>
            {status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="system-status-body">
        <div className="status-details">
          <div className="detail-item">
            <span className="detail-label">Uptime:</span>
            <span className="detail-value">99.9%</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Last Check:</span>
            <span className="detail-value">{new Date().toLocaleTimeString()}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Version:</span>
            <span className="detail-value">2.0.0</span>
          </div>
        </div>

        {status === 'degraded' && (
          <div className="status-warnings">
            <h4>Active Issues:</h4>
            <ul>
              <li>High memory usage detected</li>
              <li>Response time above threshold</li>
            </ul>
          </div>
        )}

        {status === 'unhealthy' && (
          <div className="status-errors">
            <h4>Critical Issues:</h4>
            <ul>
              <li>Database connection failed</li>
              <li>WebSocket server down</li>
              <li>Cache service unavailable</li>
            </ul>
          </div>
        )}

        {status === 'maintenance' && (
          <div className="status-maintenance">
            <h4>Maintenance Information:</h4>
            <p>System maintenance is currently in progress. Some features may be unavailable.</p>
            <div className="maintenance-details">
              <div className="detail-item">
                <span className="detail-label">Started:</span>
                <span className="detail-value">2:00 AM UTC</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Expected End:</span>
                <span className="detail-value">4:00 AM UTC</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="system-status-footer">
        <div className="status-actions">
          <button className="action-button refresh-status">
            Refresh Status
          </button>
          <button className="action-button view-details">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};
