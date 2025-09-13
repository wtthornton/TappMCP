import React, { useState, useEffect, useRef } from 'react';
import WorkflowGraph from '../visualization/WorkflowGraph';
import TimelineView from '../visualization/TimelineView';
import PerformanceOverlay from '../visualization/PerformanceOverlay';
import TappMCPValueDashboard from '../visualization/TappMCPValueDashboard';
import DrillDownModal from '../visualization/DrillDownModal';
import RealTimeDataManager, { RealTimeData, WorkflowData } from './RealTimeDataManager';

interface MobileResponsiveDashboardProps {
  width?: number;
  height?: number;
}

const MobileResponsiveDashboard: React.FC<MobileResponsiveDashboardProps> = ({
  width = window.innerWidth,
  height = window.innerHeight
}) => {
  const [activeTab, setActiveTab] = useState<'value' | 'workflow' | 'timeline' | 'performance'>('value');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null);
  const dataManagerRef = useRef<RealTimeDataManager | null>(null);

  // Detect screen size and device type
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Initialize real-time data manager
  useEffect(() => {
    dataManagerRef.current = new RealTimeDataManager();

    dataManagerRef.current.on('dataUpdate', (data) => {
      setRealTimeData(data);
    });

    dataManagerRef.current.connect().catch(console.error);

    return () => {
      dataManagerRef.current?.disconnect();
    };
  }, []);

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  const getResponsiveDimensions = () => {
    if (isMobile) {
      return {
        width: window.innerWidth - 32,
        height: window.innerHeight - 200
      };
    } else if (isTablet) {
      return {
        width: Math.min(window.innerWidth - 64, 800),
        height: Math.min(window.innerHeight - 200, 600)
      };
    }
    return { width, height: height - 200 };
  };

  const dimensions = getResponsiveDimensions();

  return (
    <div className="mobile-responsive-dashboard" style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#f8fafc',
      overflow: 'hidden'
    }}>
      {/* Mobile Header */}
      <div className="dashboard-header" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: isMobile ? '12px 16px' : '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'relative',
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: '8px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '18px'
              }}
            >
              ☰
            </button>
          )}
          <div>
            <h1 style={{
              margin: 0,
              fontSize: isMobile ? '18px' : '24px',
              fontWeight: 'bold'
            }}>
              🚀 TappMCP Dashboard
            </h1>
            {!isMobile && (
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
                AI Assistant Enhancement Platform - Real-time Monitoring
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {realTimeData && (
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              padding: isMobile ? '4px 8px' : '8px 16px',
              borderRadius: '20px',
              fontSize: isMobile ? '10px' : '12px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: dataManagerRef.current?.isWebSocketConnected() ? '#10b981' : '#ef4444'
              }} />
              {dataManagerRef.current?.isWebSocketConnected() ? 'Live' : 'Offline'}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: sidebarOpen ? 0 : '-280px',
          width: '280px',
          height: '100vh',
          background: 'white',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
          transition: 'left 0.3s ease',
          zIndex: 999,
          padding: '80px 0 0 0'
        }}>
          <div style={{ padding: '0 20px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#1f2937' }}>
              Dashboard Views
            </h3>
            {[
              { id: 'value', label: '💰 Value Metrics', icon: '💰' },
              { id: 'workflow', label: '🔄 Workflow Graph', icon: '🔄' },
              { id: 'timeline', label: '⏱️ Timeline', icon: '⏱️' },
              { id: 'performance', label: '📈 Performance', icon: '📈' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSidebarOpen(false);
                }}
                style={{
                  width: '100%',
                  background: activeTab === tab.id ? '#3b82f6' : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#64748b',
                  border: 'none',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overlay for mobile sidebar */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 998
          }}
        />
      )}

      {/* Navigation Tabs - Desktop/Tablet */}
      {!isMobile && (
        <div className="dashboard-tabs" style={{
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          padding: '0 24px',
          overflowX: 'auto'
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
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                minWidth: '120px'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="dashboard-content" style={{
        flex: 1,
        padding: isMobile ? '16px' : '24px',
        background: '#f8fafc',
        overflow: 'auto',
        position: 'relative'
      }}>
        {activeTab === 'value' && (
          <div>
            <h2 style={{
              margin: '0 0 16px 0',
              color: '#1f2937',
              fontSize: isMobile ? '18px' : '24px'
            }}>
              TappMCP Value Analytics
            </h2>
            <p style={{
              margin: '0 0 24px 0',
              color: '#6b7280',
              fontSize: isMobile ? '14px' : '16px'
            }}>
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
              width={dimensions.width}
              height={dimensions.height}
              onMetricClick={handleItemClick}
            />
          </div>
        )}

        {activeTab === 'workflow' && (
          <div>
            <h2 style={{
              margin: '0 0 16px 0',
              color: '#1f2937',
              fontSize: isMobile ? '18px' : '24px'
            }}>
              Workflow Visualization
            </h2>
            <p style={{
              margin: '0 0 24px 0',
              color: '#6b7280',
              fontSize: isMobile ? '14px' : '16px'
            }}>
              Interactive workflow graph showing Smart Vibe tool execution and dependencies
            </p>
            <WorkflowGraph
              nodes={realTimeData?.workflows || []}
              connections={[]}
              width={dimensions.width}
              height={dimensions.height}
              onNodeClick={handleItemClick}
            />
          </div>
        )}

        {activeTab === 'timeline' && (
          <div>
            <h2 style={{
              margin: '0 0 16px 0',
              color: '#1f2937',
              fontSize: isMobile ? '18px' : '24px'
            }}>
              Execution Timeline
            </h2>
            <p style={{
              margin: '0 0 24px 0',
              color: '#6b7280',
              fontSize: isMobile ? '14px' : '16px'
            }}>
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
              width={dimensions.width}
              height={dimensions.height}
              onEventClick={handleItemClick}
            />
          </div>
        )}

        {activeTab === 'performance' && (
          <div>
            <h2 style={{
              margin: '0 0 16px 0',
              color: '#1f2937',
              fontSize: isMobile ? '18px' : '24px'
            }}>
              Performance Monitoring
            </h2>
            <p style={{
              margin: '0 0 24px 0',
              color: '#6b7280',
              fontSize: isMobile ? '14px' : '16px'
            }}>
              Real-time performance metrics including memory, CPU, response times, and error rates
            </p>
            <PerformanceOverlay
              metrics={realTimeData?.metrics ? [realTimeData.metrics] : []}
              width={dimensions.width}
              height={dimensions.height}
              onMetricClick={handleItemClick}
              showAlerts={true}
            />
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div style={{
          background: 'white',
          borderTop: '1px solid #e5e7eb',
          padding: '8px 0',
          display: 'flex',
          justifyContent: 'space-around',
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000
        }}>
          {[
            { id: 'value', icon: '💰', label: 'Value' },
            { id: 'workflow', icon: '🔄', label: 'Workflow' },
            { id: 'timeline', icon: '⏱️', label: 'Timeline' },
            { id: 'performance', icon: '📈', label: 'Performance' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px 12px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                color: activeTab === tab.id ? '#3b82f6' : '#6b7280',
                fontSize: '12px',
                fontWeight: activeTab === tab.id ? '600' : '400'
              }}
            >
              <span style={{ fontSize: '18px' }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Drill-down Modal */}
      {selectedItem && (
        <DrillDownModal
          isOpen={!!selectedItem}
          data={selectedItem}
          onClose={handleCloseModal}
          onSubItemClick={handleItemClick}
        />
      )}

      {/* Mobile padding for bottom navigation */}
      {isMobile && (
        <div style={{ height: '80px' }} />
      )}
    </div>
  );
};

export default MobileResponsiveDashboard;
