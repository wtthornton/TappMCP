/**
 * Notifications Panel Component
 *
 * Displays real-time notifications with different priority levels,
 * types, and interactive actions.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import React from 'react';
import { NotificationMessage } from '../../websocket/types.js';
import './NotificationsPanel.css';

interface NotificationsPanelProps {
  notifications: NotificationMessage[];
  onDismiss: (notificationId: string) => void;
}

/**
 * Notifications Panel Component
 *
 * @param props - Component props
 * @returns JSX element
 *
 * @example
 * ```tsx
 * <NotificationsPanel
 *   notifications={notifications}
 *   onDismiss={handleDismiss}
 * />
 * ```
 *
 * @since 2.0.0
 */
export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  notifications,
  onDismiss
}) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return 'ℹ️';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'success':
        return '✅';
      default:
        return '📢';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'priority-critical';
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-unknown';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMs = now.getTime() - notificationTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return notificationTime.toLocaleDateString();
  };

  const handleActionClick = (action: any) => {
    console.log('Notification action clicked:', action);
    // In a real implementation, this would trigger the appropriate action
  };

  if (notifications.length === 0) {
    return (
      <div className="notifications-panel">
        <div className="notifications-header">
          <h3>Notifications</h3>
        </div>
        <div className="notifications-body">
          <div className="no-notifications">
            <span>No notifications</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-panel">
      <div className="notifications-header">
        <h3>Notifications</h3>
        <div className="notifications-count">
          {notifications.length}
        </div>
      </div>

      <div className="notifications-body">
        <div className="notifications-list">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`notification-item ${getPriorityColor(notification.priority)}`}
            >
              <div className="notification-header">
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-title">
                  {notification.title}
                </div>
                <div className="notification-actions">
                  <button
                    className="dismiss-button"
                    onClick={() => onDismiss(notification.id)}
                    title="Dismiss notification"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="notification-body">
                <div className="notification-message">
                  {notification.message}
                </div>

                {notification.actions && notification.actions.length > 0 && (
                  <div className="notification-action-buttons">
                    {notification.actions.map((action, index) => (
                      <button
                        key={index}
                        className="action-button"
                        onClick={() => handleActionClick(action)}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="notification-footer">
                <div className="notification-meta">
                  <span className="notification-type">{notification.type.toUpperCase()}</span>
                  <span className="notification-priority">{notification.priority.toUpperCase()}</span>
                  <span className="notification-time">{formatTimestamp(notification.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="notifications-footer">
        <button className="clear-all-button">
          Clear All
        </button>
        <button className="mark-all-read-button">
          Mark All Read
        </button>
      </div>
    </div>
  );
};
