/**
 * Real-Time Dashboard Component
 *
 * Main dashboard component that displays real-time workflow status,
 * performance metrics, and system monitoring information.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import React, { useState, useEffect, useCallback } from 'react';
import { WebSocketClient } from './WebSocketClient.js';
import {
  WorkflowStatusUpdate,
  PerformanceMetrics,
  NotificationMessage,
  WorkflowGraphUpdate
} from '../websocket/types.js';
import { WorkflowStatusCard } from './components/WorkflowStatusCard.js';
import { PerformanceMetricsCard } from './components/PerformanceMetricsCard.js';
import { NotificationsPanel } from './components/NotificationsPanel.js';
import { SystemStatusCard } from './components/SystemStatusCard.js';
import { ConnectionStatus } from './components/ConnectionStatus.js';
import './styles/Dashboard.css';

/**
 * Main Dashboard Component
 *
 * @example
 * ```tsx
 * <Dashboard />
 * ```
 *
 * @since 2.0.0
 */
export const Dashboard: React.FC = () => {
  const [wsClient] = useState(() => new WebSocketClient());
  const [connected, setConnected] = useState(false);
  const [workflows, setWorkflows] = useState<Map<string, WorkflowStatusUpdate>>(new Map());
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [systemStatus, setSystemStatus] = useState<'healthy' | 'degraded' | 'unhealthy' | 'maintenance'>('healthy');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Connect to WebSocket on component mount
  useEffect(() => {
    const connect = async () => {
      try {
        await wsClient.connect();
        setConnected(true);

        // Subscribe to all relevant events
        wsClient.subscribe([
          'workflow:status:update',
          'workflow:progress:update',
          'workflow:completed',
          'workflow:failed',
          'performance:metrics',
          'performance:alert',
          'notification:send',
          'system:status'
        ]);

        // Authenticate (in production, use real token)
        wsClient.authenticate('demo-token', 'demo-user');

      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        setConnected(false);
      }
    };

    connect();

    // Cleanup on unmount
    return () => {
      wsClient.disconnect();
    };
  }, [wsClient]);

  // Set up event listeners
  useEffect(() => {
    const handleWorkflowStatusUpdate = (update: WorkflowStatusUpdate) => {
      setWorkflows(prev => {
        const newMap = new Map(prev);
        newMap.set(update.workflowId, update);
        return newMap;
      });
      setLastUpdate(new Date());
    };

    const handleWorkflowProgressUpdate = (update: any) => {
      setWorkflows(prev => {
        const newMap = new Map(prev);
        const existing = newMap.get(update.workflowId);
        if (existing) {
          newMap.set(update.workflowId, { ...existing, progress: update.progress });
        }
        return newMap;
      });
      setLastUpdate(new Date());
    };

    const handleWorkflowCompleted = (update: any) => {
      setWorkflows(prev => {
        const newMap = new Map(prev);
        const existing = newMap.get(update.workflowId);
        if (existing) {
          newMap.set(update.workflowId, {
            ...existing,
            status: 'completed',
            progress: 100,
            message: update.message
          });
        }
        return newMap;
      });
      setLastUpdate(new Date());
    };

    const handleWorkflowFailed = (update: any) => {
      setWorkflows(prev => {
        const newMap = new Map(prev);
        const existing = newMap.get(update.workflowId);
        if (existing) {
          newMap.set(update.workflowId, {
            ...existing,
            status: 'failed',
            message: update.message
          });
        }
        return newMap;
      });
      setLastUpdate(new Date());
    };

    const handlePerformanceMetrics = (metrics: PerformanceMetrics) => {
      setPerformanceMetrics(metrics);
      setLastUpdate(new Date());
    };

    const handleNotification = (notification: NotificationMessage) => {
      setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50 notifications
      setLastUpdate(new Date());
    };

    const handleSystemStatus = (status: any) => {
      setSystemStatus(status.status);
      setLastUpdate(new Date());
    };

    const handleConnectionStatus = () => {
      setConnected(true);
    };

    const handleDisconnection = () => {
      setConnected(false);
    };

    // Add event listeners
    wsClient.on('workflow:status:update', handleWorkflowStatusUpdate);
    wsClient.on('workflow:progress:update', handleWorkflowProgressUpdate);
    wsClient.on('workflow:completed', handleWorkflowCompleted);
    wsClient.on('workflow:failed', handleWorkflowFailed);
    wsClient.on('performance:metrics', handlePerformanceMetrics);
    wsClient.on('notification:send', handleNotification);
    wsClient.on('system:status', handleSystemStatus);
    wsClient.on('connected', handleConnectionStatus);
    wsClient.on('disconnected', handleDisconnection);

    // Cleanup event listeners
    return () => {
      wsClient.off('workflow:status:update', handleWorkflowStatusUpdate);
      wsClient.off('workflow:progress:update', handleWorkflowProgressUpdate);
      wsClient.off('workflow:completed', handleWorkflowCompleted);
      wsClient.off('workflow:failed', handleWorkflowFailed);
      wsClient.off('performance:metrics', handlePerformanceMetrics);
      wsClient.off('notification:send', handleNotification);
      wsClient.off('system:status', handleSystemStatus);
      wsClient.off('connected', handleConnectionStatus);
      wsClient.off('disconnected', handleDisconnection);
    };
  }, [wsClient]);

  const handleRefresh = useCallback(() => {
    setLastUpdate(new Date());
    // Trigger a manual refresh of metrics
    wsClient.send('ping', { timestamp: Date.now() });
  }, [wsClient]);

  const handleNotificationDismiss = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  const workflowArray = Array.from(workflows.values());

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>TappMCP Real-Time Dashboard</h1>
        <div className="dashboard-controls">
          <ConnectionStatus
            connected={connected}
            lastUpdate={lastUpdate}
            onRefresh={handleRefresh}
          />
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-grid">
          {/* System Status */}
          <section className="dashboard-section">
            <h2>System Status</h2>
            <SystemStatusCard status={systemStatus} />
          </section>

          {/* Performance Metrics */}
          <section className="dashboard-section">
            <h2>Performance Metrics</h2>
            <PerformanceMetricsCard metrics={performanceMetrics} />
          </section>

          {/* Active Workflows */}
          <section className="dashboard-section">
            <h2>Active Workflows ({workflowArray.length})</h2>
            <div className="workflow-grid">
              {workflowArray.map(workflow => (
                <WorkflowStatusCard
                  key={workflow.workflowId}
                  workflow={workflow}
                />
              ))}
              {workflowArray.length === 0 && (
                <div className="no-workflows">
                  <p>No active workflows</p>
                </div>
              )}
            </div>
          </section>

          {/* Notifications */}
          <section className="dashboard-section">
            <h2>Notifications ({notifications.length})</h2>
            <NotificationsPanel
              notifications={notifications}
              onDismiss={handleNotificationDismiss}
            />
          </section>
        </div>
      </main>

      <footer className="dashboard-footer">
        <p>Last updated: {lastUpdate.toLocaleTimeString()}</p>
        <p>TappMCP v2.0.0 - Real-Time Monitoring Dashboard</p>
      </footer>
    </div>
  );
};

export default Dashboard;
