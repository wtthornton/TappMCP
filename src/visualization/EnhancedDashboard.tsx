import React, { useState, useEffect, useRef } from 'react';
import LiveMetricsChart from './LiveMetricsChart';
import TappMCPValueDashboard from './TappMCPValueDashboard';
import PerformanceOverlay from './PerformanceOverlay';
import WorkflowGraph from './WorkflowGraph';
import TimelineView from './TimelineView';
import DrillDownModal from './DrillDownModal';
import ExportPanel from './ExportPanel';
import RealTimeMetricsService from '../dashboard/RealTimeMetricsService';
import { RealTimeData } from '../dashboard/RealTimeDataManager';

interface EnhancedDashboardProps {
  width?: number;
  height?: number;
  isMobile?: boolean;
  isTablet?: boolean;
}

const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({
  width = 1200,
  height = 800,
  isMobile = false,
  isTablet = false
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'workflows' | 'value' | 'export'>('overview');
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [metricsHistory, setMetricsHistory] = useState<{
  performance: any[];
  value: any[];
  workflows: any[];
  }>({ performance: [], value: [], workflows: [] });
  const [liveMetrics, setLiveMetrics] = useState<{
    memory: any[];
    cpu: any[];
    responseTime: any[];
    cacheHitRate: any[];
  }>({
    memory: [],
    cpu: [],
    responseTime: [],
    cacheHitRate: []
  });

  const metricsServiceRef = useRef<RealTimeMetricsService | null>(null);

  // Initialize real-time metrics service
  useEffect(() => {
    metricsServiceRef.current = new RealTimeMetricsService();

    // Set up event listeners
    metricsServiceRef.current.on('dataUpdate', (data) => {
      setRealTimeData(data);
    });

    metricsServiceRef.current.on('performanceUpdate', (metrics) => {
      console.log('📊 Performance metrics updated:', metrics);
      updateLiveMetrics('memory', metrics.memory, 'Memory Usage');
      updateLiveMetrics('cpu', metrics.cpu, 'CPU Usage');
      updateLiveMetrics('responseTime', metrics.responseTime, 'Response Time');
      updateLiveMetrics('cacheHitRate', metrics.cacheMetrics?.hitRate || 0, 'Cache Hit Rate');
    });

    metricsServiceRef.current.on('valueUpdate', (metrics) => {
      console.log('💰 Value metrics updated:', metrics);
    });

    metricsServiceRef.current.on('workflowUpdate', (workflows) => {
      console.log('🔄 Workflow data updated:', workflows);
    });

    // Start the service
    metricsServiceRef.current.start();

    // Cleanup on unmount
    return () => {
      metricsServiceRef.current?.stop();
    };
  }, []);

  // Update live metrics for charts
  const updateLiveMetrics = (type: keyof typeof liveMetrics, value: number, label: string) => {
    const now = Date.now();
    const newDataPoint = {
      timestamp: now,
      value,
      label,
      color: getMetricColor(type, value)
    };

    setLiveMetrics(prev => ({
      ...prev,
      [type]: [...prev[type].slice(-49), newDataPoint] // Keep last 50 points
    }));
  };

  // Get color based on metric type and value
  const getMetricColor = (type: string, value: number): string => {
    switch (type) {
      case 'memory':
        return value > 80 ? '#ef4444' : value > 60 ? '#f59e0b' : '#10b981';
      case 'cpu':
        return value > 80 ? '#ef4444' : value > 60 ? '#f59e0b' : '#3b82f6';
      case 'responseTime':
        return value > 1000 ? '#ef4444' : value > 500 ? '#f59e0b' : '#10b981';
      case 'cacheHitRate':
        return value > 80 ? '#10b981' : value > 60 ? '#f59e0b' : '#ef4444';
      default:
        return '#3b82f6';
    }
  };

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

  const getChartWidth = () => {
    if (isMobile) return Math.min(width, window.innerWidth - 32);
    if (isTablet) return Math.min(width, window.innerWidth - 64);
    return width;
  };

  const getChartHeight = () => {
    if (isMobile) return Math.min(height - 300, 300);
    if (isTablet) return Math.min(height - 400, 400);
    return height - 200;
  };

  return (
    <div className="enhanced-dashboard" style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#f8fafc'
    }}>
      {/* Header */}
      <div className="dashboard-header" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: isMobile ? '12px 16px' : '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: isMobile ? '18px' : '24px',
            fontWeight: 'bold'
          }}>
            🚀 TappMCP Enhanced Dashboard
          </h1>
          {!isMobile && (
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
              Real-time AI Assistant Enhancement Monitoring & Analytics
            </p>
          )}
        </div>
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
            background: '#10b981'
          }} />
          Live Data
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs" style={{
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        padding: '0 24px',
        overflowX: isMobile ? 'auto' : 'visible'
      }}>
        {[
          { id: 'overview', label: '📊 Overview', icon: '📊' },
          { id: 'performance', label: '⚡ Performance', icon: '⚡' },
          { id: 'workflows', label: '🔄 Workflows', icon: '🔄' },
          { id: 'value', label: '💰 Value', icon: '💰' },
          { id: 'export', label: '📤 Export', icon: '📤' }
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
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              minWidth: isMobile ? '120px' : 'auto'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="dashboard-content" style={{
        flex: 1,
        padding: isMobile ? '16px' : '24px',
        background: '#f8fafc',
        overflow: 'auto'
      }}>
        {activeTab === 'overview' && (
          <div>
            <h2 style={{
              margin: '0 0 24px 0',
              color: '#1f2937',
              fontSize: isMobile ? '20px' : '24px'
            }}>
              System Overview
            </h2>

            {/* Live Metrics Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginBottom: '24px'
            }}>
              <LiveMetricsChart
                data={liveMetrics.memory}
                width={getChartWidth()}
                height={200}
                title="Memory Usage"
                unit="%"
                onDataPointClick={handleMetricClick}
              />
              <LiveMetricsChart
                data={liveMetrics.cpu}
                width={getChartWidth()}
                height={200}
                title="CPU Usage"
                unit="%"
                onDataPointClick={handleMetricClick}
              />
              <LiveMetricsChart
                data={liveMetrics.responseTime}
                width={getChartWidth()}
                height={200}
                title="Response Time"
                unit="ms"
                onDataPointClick={handleMetricClick}
              />
              <LiveMetricsChart
                data={liveMetrics.cacheHitRate}
                width={getChartWidth()}
                height={200}
                title="Cache Hit Rate"
                unit="%"
                onDataPointClick={handleMetricClick}
              />
            </div>

            {/* Quick Stats */}
            {realTimeData?.valueMetrics && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb'
                }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '16px' }}>💰 Cost Savings</h3>
                  <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                    ${realTimeData.valueMetrics.totalCostSavings.toFixed(2)}
                  </p>
                </div>

                <div style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb'
                }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '16px' }}>⏱️ Time Saved</h3>
                  <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
                    {Math.floor(realTimeData.valueMetrics.totalTimeSaved / 60)}m
                  </p>
                </div>

                <div style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb'
                }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '16px' }}>🐛 Bugs Found</h3>
                  <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
                    {realTimeData.valueMetrics.totalBugsFound}
                  </p>
                </div>

                <div style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb'
                }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '16px' }}>📊 Quality Score</h3>
                  <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>
                    {realTimeData.valueMetrics.averageQualityScore.toFixed(1)}%
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'performance' && (
          <div>
            <h2 style={{
              margin: '0 0 24px 0',
              color: '#1f2937',
              fontSize: isMobile ? '20px' : '24px'
            }}>
              Performance Monitoring
            </h2>
            <PerformanceOverlay
              metrics={realTimeData?.metrics ? [realTimeData.metrics] : []}
              width={getChartWidth()}
              height={getChartHeight()}
              onMetricClick={handleMetricClick}
              showAlerts={true}
            />
          </div>
        )}

        {activeTab === 'workflows' && (
          <div>
            <h2 style={{
              margin: '0 0 24px 0',
              color: '#1f2937',
              fontSize: isMobile ? '20px' : '24px'
            }}>
              Workflow Visualization
            </h2>
            <WorkflowGraph
              nodes={realTimeData?.workflows || []}
              connections={[]}
              width={getChartWidth()}
              height={getChartHeight()}
              onNodeClick={handleNodeClick}
            />
          </div>
        )}

        {activeTab === 'value' && (
          <div>
            <h2 style={{
              margin: '0 0 24px 0',
              color: '#1f2937',
              fontSize: isMobile ? '20px' : '24px'
            }}>
              Value Analytics
            </h2>
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
              width={getChartWidth()}
              height={getChartHeight()}
              onMetricClick={handleMetricClick}
            />
          </div>
        )}

        {activeTab === 'export' && (
          <div>
            <h2 style={{
              margin: '0 0 24px 0',
              color: '#1f2937',
              fontSize: isMobile ? '20px' : '24px'
            }}>
              Export Dashboard Data
            </h2>
            <ExportPanel
              data={{
                type: 'dashboard',
                data: realTimeData,
                metadata: {
                  timestamp: Date.now(),
                  version: '2.0',
                  exportFormat: 'dashboard',
                  generatedBy: 'TappMCP Enhanced Dashboard'
                }
              }}
              onExport={(format, success) => {
                console.log(`Export ${success ? 'successful' : 'failed'} for format: ${format}`);
              }}
            />
          </div>
        )}
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

export default EnhancedDashboard;
