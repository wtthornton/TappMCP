/**
 * Connection Status Component
 *
 * Displays WebSocket connection status and provides manual refresh
 * functionality for the dashboard.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import React from 'react';
import './ConnectionStatus.css';

interface ConnectionStatusProps {
  connected: boolean;
  lastUpdate: Date;
  onRefresh: () => void;
}

/**
 * Connection Status Component
 *
 * @param props - Component props
 * @returns JSX element
 *
 * @example
 * ```tsx
 * <ConnectionStatus
 *   connected={true}
 *   lastUpdate={new Date()}
 *   onRefresh={handleRefresh}
 * />
 * ```
 *
 * @since 2.0.0
 */
export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  connected,
  lastUpdate,
  onRefresh
}) => {
  const getConnectionIcon = () => {
    return connected ? '🟢' : '🔴';
  };

  const getConnectionText = () => {
    return connected ? 'Connected' : 'Disconnected';
  };

  const getConnectionClass = () => {
    return connected ? 'connection-connected' : 'connection-disconnected';
  };

  const formatLastUpdate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);

    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <div className="connection-status">
      <div className="connection-info">
        <div className={`connection-indicator ${getConnectionClass()}`}>
          <span className="connection-icon">{getConnectionIcon()}</span>
          <span className="connection-text">{getConnectionText()}</span>
        </div>

        <div className="connection-details">
          <div className="last-update">
            <span className="update-label">Last Update:</span>
            <span className="update-time">{formatLastUpdate(lastUpdate)}</span>
          </div>
        </div>
      </div>

      <div className="connection-actions">
        <button
          className="refresh-button"
          onClick={onRefresh}
          disabled={!connected}
          title="Refresh dashboard data"
        >
          <span className="refresh-icon">🔄</span>
          Refresh
        </button>
      </div>
    </div>
  );
};
