/**
 * Workflow Graph React Component
 *
 * React wrapper for the D3.js workflow graph visualizer with
 * real-time updates and interactive controls.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { WorkflowGraphVisualizer } from './WorkflowGraphVisualizer.js';
import { WorkflowGraph, WorkflowVisualizationOptions } from '../workflow/types.js';
import './WorkflowGraphComponent.css';

/**
 * Workflow Graph Component Props
 *
 * @since 2.0.0
 */
export interface WorkflowGraphComponentProps {
  /** Workflow graph data */
  graph: WorkflowGraph | null;
  /** Visualization options */
  options?: Partial<WorkflowVisualizationOptions>;
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: string | null;
  /** Callback when nodes are selected */
  onNodeSelect?: (nodeIds: string[]) => void;
  /** Callback when edges are selected */
  onEdgeSelect?: (edgeIds: string[]) => void;
  /** Callback when graph is clicked */
  onGraphClick?: () => void;
  /** Callback when options change */
  onOptionsChange?: (options: WorkflowVisualizationOptions) => void;
  /** Custom CSS class */
  className?: string;
  /** Component height */
  height?: string | number;
  /** Component width */
  width?: string | number;
}

/**
 * Workflow Graph React Component
 *
 * Interactive D3.js-based workflow graph visualization component
 * with real-time updates and comprehensive controls.
 *
 * @example
 * ```tsx
 * <WorkflowGraphComponent
 *   graph={workflowGraph}
 *   options={{ layout: 'force' }}
 *   onNodeSelect={(nodeIds) => console.log('Selected:', nodeIds)}
 * />
 * ```
 *
 * @since 2.0.0
 */
export const WorkflowGraphComponent: React.FC<WorkflowGraphComponentProps> = ({
  graph,
  options = {},
  loading = false,
  error = null,
  onNodeSelect,
  onEdgeSelect,
  onGraphClick,
  onOptionsChange,
  className = '',
  height = '600px',
  width = '100%'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const visualizerRef = useRef<WorkflowGraphVisualizer | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize visualizer
  useEffect(() => {
    if (!containerRef.current || isInitialized) return;

    try {
      visualizerRef.current = new WorkflowGraphVisualizer(containerRef.current, options);
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize workflow graph visualizer:', error);
    }

    return () => {
      if (visualizerRef.current) {
        visualizerRef.current.destroy();
        visualizerRef.current = null;
      }
    };
  }, [isInitialized, options]);

  // Render graph when data changes
  useEffect(() => {
    if (!visualizerRef.current || !graph || !isInitialized) return;

    const renderGraph = async () => {
      try {
        await visualizerRef.current!.render(graph);
      } catch (error) {
        console.error('Failed to render workflow graph:', error);
      }
    };

    renderGraph();
  }, [graph, isInitialized]);

  // Update options when they change
  useEffect(() => {
    if (!visualizerRef.current || !isInitialized) return;

    const updateOptions = async () => {
      try {
        await visualizerRef.current!.updateOptions(options);
        if (onOptionsChange) {
          onOptionsChange(visualizerRef.current['options']);
        }
      } catch (error) {
        console.error('Failed to update visualization options:', error);
      }
    };

    updateOptions();
  }, [options, isInitialized, onOptionsChange]);

  // Handle node selection
  const handleNodeSelect = useCallback((nodeIds: string[]) => {
    setSelectedNodes(nodeIds);
    if (onNodeSelect) {
      onNodeSelect(nodeIds);
    }
  }, [onNodeSelect]);

  // Handle edge selection
  const handleEdgeSelect = useCallback((edgeIds: string[]) => {
    setSelectedEdges(edgeIds);
    if (onEdgeSelect) {
      onEdgeSelect(edgeIds);
    }
  }, [onEdgeSelect]);

  // Handle graph click
  const handleGraphClick = useCallback(() => {
    if (onGraphClick) {
      onGraphClick();
    }
  }, [onGraphClick]);

  // Control handlers
  const handleZoomToFit = useCallback(async () => {
    if (!visualizerRef.current) return;
    await visualizerRef.current.zoomToFit(500);
  }, []);

  const handleClearSelection = useCallback(() => {
    if (!visualizerRef.current) return;
    visualizerRef.current.clearSelection();
    setSelectedNodes([]);
    setSelectedEdges([]);
  }, []);

  const handleLayoutChange = useCallback(async (layout: string) => {
    if (!visualizerRef.current) return;
    await visualizerRef.current.updateOptions({ layout: layout as any });
  }, []);

  // Render loading state
  if (loading) {
    return (
      <div className={`workflow-graph-container ${className}`} style={{ height, width }}>
        <div className="workflow-graph-loading">
          <div className="loading-spinner"></div>
          <p>Loading workflow graph...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={`workflow-graph-container ${className}`} style={{ height, width }}>
        <div className="workflow-graph-error">
          <div className="error-icon">⚠️</div>
          <p>Error loading workflow graph</p>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  // Render empty state
  if (!graph) {
    return (
      <div className={`workflow-graph-container ${className}`} style={{ height, width }}>
        <div className="workflow-graph-empty">
          <div className="empty-icon">📊</div>
          <p>No workflow data available</p>
          <p className="empty-message">Select a workflow to view its graph</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`workflow-graph-container ${className}`} style={{ height, width }}>
      {/* Controls */}
      <div className="workflow-graph-controls">
        <div className="control-group">
          <label htmlFor="layout-select">Layout:</label>
          <select
            id="layout-select"
            value={options.layout || 'force'}
            onChange={(e) => handleLayoutChange(e.target.value)}
            className="control-select"
          >
            <option value="force">Force</option>
            <option value="hierarchical">Hierarchical</option>
            <option value="circular">Circular</option>
            <option value="grid">Grid</option>
            <option value="timeline">Timeline</option>
          </select>
        </div>

        <div className="control-group">
          <button
            onClick={handleZoomToFit}
            className="control-button"
            title="Zoom to fit"
          >
            🔍 Fit
          </button>
          <button
            onClick={handleClearSelection}
            className="control-button"
            title="Clear selection"
          >
            ✕ Clear
          </button>
        </div>

        <div className="control-group">
          <label className="control-checkbox">
            <input
              type="checkbox"
              checked={options.visibility?.showLabels !== false}
              onChange={(e) => {
                const newOptions = {
                  ...options,
                  visibility: {
                    ...options.visibility,
                    showLabels: e.target.checked
                  }
                };
                handleLayoutChange(JSON.stringify(newOptions));
              }}
            />
            Show Labels
          </label>
          <label className="control-checkbox">
            <input
              type="checkbox"
              checked={options.visibility?.showProgress !== false}
              onChange={(e) => {
                const newOptions = {
                  ...options,
                  visibility: {
                    ...options.visibility,
                    showProgress: e.target.checked
                  }
                };
                handleLayoutChange(JSON.stringify(newOptions));
              }}
            />
            Show Progress
          </label>
        </div>
      </div>

      {/* Graph visualization */}
      <div className="workflow-graph-visualization">
        <div
          ref={containerRef}
          className="workflow-graph-svg-container"
          onClick={handleGraphClick}
        />
      </div>

      {/* Selection info */}
      {(selectedNodes.length > 0 || selectedEdges.length > 0) && (
        <div className="workflow-graph-selection">
          <div className="selection-info">
            <span className="selection-count">
              {selectedNodes.length} node{selectedNodes.length !== 1 ? 's' : ''} selected
            </span>
            {selectedEdges.length > 0 && (
              <span className="selection-count">
                {selectedEdges.length} edge{selectedEdges.length !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
        </div>
      )}

      {/* Graph info */}
      {graph && (
        <div className="workflow-graph-info">
          <div className="info-item">
            <span className="info-label">Nodes:</span>
            <span className="info-value">{graph.nodes.length}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Edges:</span>
            <span className="info-value">{graph.edges.length}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Complexity:</span>
            <span className="info-value">{graph.metadata.complexity.toFixed(1)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Duration:</span>
            <span className="info-value">{graph.metadata.estimatedDuration}m</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowGraphComponent;
