/**
 * Workflow Visualization Demo Component
 *
 * Demo component showcasing both workflow graph and timeline visualizations
 * with real-time data integration and interactive controls.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import React, { useState, useEffect, useCallback } from 'react';
import { WorkflowGraphComponent } from './WorkflowGraphComponent.js';
import { WorkflowTimelineComponent } from './WorkflowTimelineComponent.js';
import { WorkflowGraph, WorkflowTimeline, WorkflowVisualizationOptions, WorkflowTimelineOptions } from '../workflow/types.js';
import './WorkflowVisualizationDemo.css';

/**
 * Workflow Visualization Demo Props
 *
 * @since 2.0.0
 */
export interface WorkflowVisualizationDemoProps {
  /** Workflow graph data */
  graph: WorkflowGraph | null;
  /** Workflow timeline data */
  timeline: WorkflowTimeline | null;
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: string | null;
  /** Custom CSS class */
  className?: string;
  /** Component height */
  height?: string | number;
  /** Component width */
  width?: string | number;
}

/**
 * Workflow Visualization Demo Component
 *
 * Comprehensive demo showcasing interactive workflow visualizations
 * with real-time updates and synchronized views.
 *
 * @example
 * ```tsx
 * <WorkflowVisualizationDemo
 *   graph={workflowGraph}
 *   timeline={workflowTimeline}
 *   loading={false}
 * />
 * ```
 *
 * @since 2.0.0
 */
export const WorkflowVisualizationDemo: React.FC<WorkflowVisualizationDemoProps> = ({
  graph,
  timeline,
  loading = false,
  error = null,
  className = '',
  height = '800px',
  width = '100%'
}) => {
  const [activeTab, setActiveTab] = useState<'graph' | 'timeline' | 'split'>('split');
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [graphOptions, setGraphOptions] = useState<Partial<WorkflowVisualizationOptions>>({
    layout: 'force',
    visibility: {
      showLabels: true,
      showEdgeLabels: true,
      showProgress: true,
      showStatus: true,
      showTimeEstimates: true,
      showCriticalPath: true
    }
  });
  const [timelineOptions, setTimelineOptions] = useState<Partial<WorkflowTimelineOptions>>({
    showLabels: true,
    showGrid: true,
    showAxis: true,
    showTooltips: true
  });

  // Handle node selection
  const handleNodeSelect = useCallback((nodeIds: string[]) => {
    setSelectedNodes(nodeIds);
    console.log('Selected nodes:', nodeIds);
  }, []);

  // Handle event selection
  const handleEventSelect = useCallback((eventIds: string[]) => {
    setSelectedEvents(eventIds);
    console.log('Selected events:', eventIds);
  }, []);

  // Handle graph options change
  const handleGraphOptionsChange = useCallback((options: WorkflowVisualizationOptions) => {
    setGraphOptions(options);
  }, []);

  // Handle timeline options change
  const handleTimelineOptionsChange = useCallback((options: WorkflowTimelineOptions) => {
    setTimelineOptions(options);
  }, []);

  // Clear all selections
  const handleClearSelections = useCallback(() => {
    setSelectedNodes([]);
    setSelectedEvents([]);
  }, []);

  // Render loading state
  if (loading) {
    return (
      <div className={`workflow-visualization-demo ${className}`} style={{ height, width }}>
        <div className="demo-loading">
          <div className="loading-spinner"></div>
          <p>Loading workflow visualizations...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={`workflow-visualization-demo ${className}`} style={{ height, width }}>
        <div className="demo-error">
          <div className="error-icon">⚠️</div>
          <p>Error loading workflow data</p>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  // Render empty state
  if (!graph && !timeline) {
    return (
      <div className={`workflow-visualization-demo ${className}`} style={{ height, width }}>
        <div className="demo-empty">
          <div className="empty-icon">📊</div>
          <p>No workflow data available</p>
          <p className="empty-message">Select a workflow to view its visualizations</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`workflow-visualization-demo ${className}`} style={{ height, width }}>
      {/* Header */}
      <div className="demo-header">
        <h2>Workflow Visualization</h2>
        <div className="demo-controls">
          <div className="tab-controls">
            <button
              className={`tab-button ${activeTab === 'graph' ? 'active' : ''}`}
              onClick={() => setActiveTab('graph')}
            >
              📊 Graph
            </button>
            <button
              className={`tab-button ${activeTab === 'timeline' ? 'active' : ''}`}
              onClick={() => setActiveTab('timeline')}
            >
              📅 Timeline
            </button>
            <button
              className={`tab-button ${activeTab === 'split' ? 'active' : ''}`}
              onClick={() => setActiveTab('split')}
            >
              🔀 Split View
            </button>
          </div>
          <div className="action-controls">
            <button
              className="action-button"
              onClick={handleClearSelections}
              disabled={selectedNodes.length === 0 && selectedEvents.length === 0}
            >
              ✕ Clear Selections
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="demo-content">
        {/* Graph View */}
        {(activeTab === 'graph' || activeTab === 'split') && (
          <div className={`demo-panel ${activeTab === 'split' ? 'split-panel' : 'full-panel'}`}>
            <div className="panel-header">
              <h3>Workflow Graph</h3>
              <div className="panel-info">
                {graph && (
                  <>
                    <span className="info-item">{graph.nodes.length} nodes</span>
                    <span className="info-item">{graph.edges.length} edges</span>
                    <span className="info-item">
                      {selectedNodes.length} selected
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="panel-content">
              <WorkflowGraphComponent
                graph={graph}
                options={graphOptions}
                onNodeSelect={handleNodeSelect}
                onOptionsChange={handleGraphOptionsChange}
                height={activeTab === 'split' ? '300px' : '100%'}
              />
            </div>
          </div>
        )}

        {/* Timeline View */}
        {(activeTab === 'timeline' || activeTab === 'split') && (
          <div className={`demo-panel ${activeTab === 'split' ? 'split-panel' : 'full-panel'}`}>
            <div className="panel-header">
              <h3>Workflow Timeline</h3>
              <div className="panel-info">
                {timeline && (
                  <>
                    <span className="info-item">{timeline.events.length} events</span>
                    <span className="info-item">
                      {timeline.endTime ?
                        `${Math.round((timeline.endTime - timeline.startTime) / 1000 / 60)}m` :
                        'Ongoing'
                      }
                    </span>
                    <span className="info-item">
                      {selectedEvents.length} selected
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="panel-content">
              <WorkflowTimelineComponent
                timeline={timeline}
                options={timelineOptions}
                onEventSelect={handleEventSelect}
                onOptionsChange={handleTimelineOptionsChange}
                height={activeTab === 'split' ? '300px' : '100%'}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="demo-footer">
        <div className="footer-info">
          <span className="footer-item">
            <strong>Graph:</strong> {graph ? 'Loaded' : 'Not available'}
          </span>
          <span className="footer-item">
            <strong>Timeline:</strong> {timeline ? 'Loaded' : 'Not available'}
          </span>
          <span className="footer-item">
            <strong>Selections:</strong> {selectedNodes.length + selectedEvents.length} items
          </span>
        </div>
        <div className="footer-actions">
          <button className="footer-button" onClick={() => window.print()}>
            🖨️ Print
          </button>
          <button className="footer-button" onClick={() => {
            const data = { graph, timeline, selectedNodes, selectedEvents };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'workflow-data.json';
            a.click();
            URL.revokeObjectURL(url);
          }}>
            💾 Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowVisualizationDemo;
