import React, { useState, useEffect, useRef } from 'react';
import WorkflowGraph from '../visualization/WorkflowGraph';
import TimelineView from '../visualization/TimelineView';
import PerformanceOverlay from '../visualization/PerformanceOverlay';
import TappMCPValueDashboard from '../visualization/TappMCPValueDashboard';
import DrillDownModal from '../visualization/DrillDownModal';
import RealTimeDataManager, { RealTimeData, WorkflowData } from './RealTimeDataManager';

interface DashboardProps {
  width?: number;
  height?: number;
}

const Dashboard: React.FC<DashboardProps> = ({ width = 1200, height = 800 }) => {
  const [activeTab, setActiveTab] = useState<'workflow' | 'timeline' | 'performance' | 'value'>('value');
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    reconnectAttempts: number;
    maxReconnectAttempts: number;
  }>({ connected: false, reconnectAttempts: 0, maxReconnectAttempts: 10 });
  const dataManagerRef = useRef<RealTimeDataManager | null>(null);

  // Initialize real-time data manager
  useEffect(() => {
    dataManagerRef.current = new RealTimeDataManager();

    // Set up event listeners
    dataManagerRef.current.on('dataUpdate', (data) => {
      setRealTimeData(data);
    });

    dataManagerRef.current.on('connected', () => {
      setConnectionStatus(prev => ({ ...prev, connected: true }));
    });

    dataManagerRef.current.on('disconnected', () => {
      setConnectionStatus(prev => ({ ...prev, connected: false }));
    });

    dataManagerRef.current.on('error', (error) => {
      console.error('Real-time data manager error:', error);
    });

    // Connect to WebSocket
    dataManagerRef.current.connect().catch(console.error);

    // Cleanup on unmount
    return () => {
      dataManagerRef.current?.disconnect();
    };
  }, []);

  // Update connection status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (dataManagerRef.current) {
        setConnectionStatus(dataManagerRef.current.getConnectionStatus());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleNodeClick = (node: any) => {
    setSelectedItem({
      id: node.id,
      name: node.name,
      type: 'workflow',
      details: {
        status: node.status,
        phase: node.phase,
        progress: node.progress,
        startTime: node.startTime,
        endTime: node.endTime,
        duration: node.endTime ? node.endTime - (node.startTime || 0) : undefined,
        ...node.details
      }
    });
  };

  const handleEventClick = (event: any) => {
    setSelectedItem({
      id: event.id,
      name: event.name,
      type: 'event',
      details: {
        status: event.status,
        phase: event.phase,
        startTime: event.timestamp,
        endTime: event.duration ? event.timestamp + event.duration : undefined,
        duration: event.duration
      }
    });
  };

  const handleMetricClick = (metric: any) => {
    setSelectedItem({
      id: `metric-${Date.now()}`,
      name: 'Performance Metric',
      type: 'metric',
      details: {
        memory: metric.memory,
        cpu: metric.cpu,
        responseTime: metric.responseTime,
        errorRate: metric.errorRate,
        timestamp: metric.timestamp
      }
    });
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  return (
    <div className="tappmcp-dashboard" style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="dashboard-header" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
            🚀 TappMCP Advanced Dashboard
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
            AI Assistant Enhancement Platform - Real-time Monitoring & Value Analytics
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: connectionStatus.connected ? '#10b981' : '#ef4444'
            }} />
            {connectionStatus.connected ? 'Live Data' : 'Offline'}
          </div>
          {!connectionStatus.connected && connectionStatus.reconnectAttempts > 0 && (
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              Reconnecting... ({connectionStatus.reconnectAttempts}/{connectionStatus.maxReconnectAttempts})
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs" style={{
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        padding: '0 24px'
      }}>
        {[
          { id: 'value', label: '💰 Value Metrics', icon: '💰' },
          { id: 'workflow', label: '🔄 Workflow Graph', icon: '🔄' },
          { id: 'timeline', label: '⏱️ Timeline', icon: '⏱️' },
          { id: 'performance', label: '📈 Performance', icon: '📈' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              background: activeTab === tab.id ? '#3b82f6' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#64748b',
              border: 'none',
              padding: '12px 20px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              borderBottom: activeTab === tab.id ? '3px solid #1d4ed8' : '3px solid transparent',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="dashboard-content" style={{
        flex: 1,
        padding: '24px',
        background: '#f8fafc',
        overflow: 'auto'
      }}>
        {activeTab === 'value' && (
          <div>
            <h2 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>TappMCP Value Analytics</h2>
            <p style={{ margin: '0 0 24px 0', color: '#6b7280' }}>
              Track token usage, cost savings, bugs found, and overall AI assistant enhancement value
            </p>
            <TappMCPValueDashboard
              metrics={realTimeData?.valueMetrics ? [{
                timestamp: realTimeData.valueMetrics.timestamp,
                totalTokensUsed: realTimeData.valueMetrics.totalTokensUsed,
                totalTokensSaved: realTimeData.valueMetrics.totalTokensSaved,
                totalBugsFound: realTimeData.valueMetrics.totalBugsFound,
                totalCostSavings: realTimeData.valueMetrics.totalCostSavings,
                totalTimeSaved: realTimeData.valueMetrics.totalTimeSaved,
                averageQualityScore: realTimeData.valueMetrics.averageQualityScore,
                context7CacheHitRate: realTimeData.valueMetrics.context7CacheHitRate,
                workflowEfficiency: realTimeData.valueMetrics.workflowEfficiency
              }] : []}
              width={width}
              height={height - 200}
              onMetricClick={handleMetricClick}
            />
          </div>
        )}

        {activeTab === 'workflow' && (
          <div>
            <h2 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>Workflow Visualization</h2>
            <p style={{ margin: '0 0 24px 0', color: '#6b7280' }}>
              Interactive workflow graph showing Smart Vibe tool execution and dependencies
            </p>
            <WorkflowGraph
              nodes={realTimeData?.workflows || []}
              connections={[]}
              width={width}
              height={height - 200}
              onNodeClick={handleNodeClick}
            />
          </div>
        )}

        {activeTab === 'timeline' && (
          <div>
            <h2 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>Execution Timeline</h2>
            <p style={{ margin: '0 0 24px 0', color: '#6b7280' }}>
              Timeline view of workflow execution with phase details and duration tracking
            </p>
            <TimelineView
              events={realTimeData?.workflows.map(w => ({
                id: w.id,
                name: w.name,
                timestamp: w.startTime || Date.now(),
                duration: w.endTime ? w.endTime - (w.startTime || Date.now()) : undefined,
                status: w.status,
                phase: w.phase,
                details: `Progress: ${w.progress}%`
              })) || []}
              width={width}
              height={height - 200}
              onEventClick={handleEventClick}
            />
          </div>
        )}

        {activeTab === 'performance' && (
          <div>
            <h2 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>Performance Monitoring</h2>
            <p style={{ margin: '0 0 24px 0', color: '#6b7280' }}>
              Real-time performance metrics including memory, CPU, response times, and error rates
            </p>
            <PerformanceOverlay
              metrics={realTimeData?.metrics ? [realTimeData.metrics] : []}
              width={width}
              height={height - 200}
              onMetricClick={handleMetricClick}
              showAlerts={true}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="dashboard-footer" style={{
        background: '#1f2937',
        color: 'white',
        padding: '12px 24px',
        fontSize: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          TappMCP v2.0 - AI Assistant Enhancement Platform
        </div>
        <div>
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Drill-down Modal */}
      {selectedItem && (
        <DrillDownModal
          isOpen={!!selectedItem}
          data={selectedItem}
          onClose={handleCloseModal}
          onSubItemClick={handleNodeClick}
        />
      )}
    </div>
  );
};

export default Dashboard;
