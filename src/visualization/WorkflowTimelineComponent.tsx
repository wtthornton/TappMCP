/**
 * Workflow Timeline React Component
 *
 * React wrapper for the D3.js workflow timeline visualizer with
 * real-time updates and interactive controls.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { WorkflowTimelineVisualizer } from './WorkflowTimelineVisualizer.js';
import { WorkflowTimeline, WorkflowTimelineOptions } from '../workflow/types.js';
import './WorkflowTimelineComponent.css';

/**
 * Workflow Timeline Component Props
 *
 * @since 2.0.0
 */
export interface WorkflowTimelineComponentProps {
  /** Workflow timeline data */
  timeline: WorkflowTimeline | null;
  /** Visualization options */
  options?: Partial<WorkflowTimelineOptions>;
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: string | null;
  /** Callback when events are selected */
  onEventSelect?: (eventIds: string[]) => void;
  /** Callback when timeline is clicked */
  onTimelineClick?: () => void;
  /** Callback when options change */
  onOptionsChange?: (options: WorkflowTimelineOptions) => void;
  /** Custom CSS class */
  className?: string;
  /** Component height */
  height?: string | number;
  /** Component width */
  width?: string | number;
}

/**
 * Workflow Timeline React Component
 *
 * Interactive D3.js-based workflow timeline visualization component
 * with real-time updates and comprehensive controls.
 *
 * @example
 * ```tsx
 * <WorkflowTimelineComponent
 *   timeline={workflowTimeline}
 *   options={{ showLabels: true }}
 *   onEventSelect={(eventIds) => console.log('Selected:', eventIds)}
 * />
 * ```
 *
 * @since 2.0.0
 */
export const WorkflowTimelineComponent: React.FC<WorkflowTimelineComponentProps> = ({
  timeline,
  options = {},
  loading = false,
  error = null,
  onEventSelect,
  onTimelineClick,
  onOptionsChange,
  className = '',
  height = '400px',
  width = '100%'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const visualizerRef = useRef<WorkflowTimelineVisualizer | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [filterTypes, setFilterTypes] = useState<string[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<string[]>([]);

  // Initialize visualizer
  useEffect(() => {
    if (!containerRef.current || isInitialized) return;

    try {
      visualizerRef.current = new WorkflowTimelineVisualizer(containerRef.current, options);
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize workflow timeline visualizer:', error);
    }

    return () => {
      if (visualizerRef.current) {
        visualizerRef.current.destroy();
        visualizerRef.current = null;
      }
    };
  }, [isInitialized, options]);

  // Render timeline when data changes
  useEffect(() => {
    if (!visualizerRef.current || !timeline || !isInitialized) return;

    const renderTimeline = async () => {
      try {
        await visualizerRef.current!.render(timeline);
      } catch (error) {
        console.error('Failed to render workflow timeline:', error);
      }
    };

    renderTimeline();
  }, [timeline, isInitialized]);

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
        console.error('Failed to update timeline options:', error);
      }
    };

    updateOptions();
  }, [options, isInitialized, onOptionsChange]);

  // Handle event selection
  const handleEventSelect = useCallback((eventIds: string[]) => {
    setSelectedEvents(eventIds);
    if (onEventSelect) {
      onEventSelect(eventIds);
    }
  }, [onEventSelect]);

  // Handle timeline click
  const handleTimelineClick = useCallback(() => {
    if (onTimelineClick) {
      onTimelineClick();
    }
  }, [onTimelineClick]);

  // Control handlers
  const handleZoomToFit = useCallback(async () => {
    if (!visualizerRef.current) return;
    await visualizerRef.current.zoomToFit(500);
  }, []);

  const handleClearSelection = useCallback(() => {
    if (!visualizerRef.current) return;
    visualizerRef.current.clearSelection();
    setSelectedEvents([]);
  }, []);

  const handleFilterByType = useCallback(async (eventTypes: string[]) => {
    setFilterTypes(eventTypes);
    if (visualizerRef.current) {
      await visualizerRef.current.filterByType(eventTypes);
    }
  }, []);

  const handleFilterBySeverity = useCallback(async (severities: string[]) => {
    setFilterSeverity(severities);
    if (visualizerRef.current) {
      await visualizerRef.current.updateOptions({
        filter: { ...options.filter, severity: severities }
      });
    }
  }, [options.filter]);

  // Get available event types and severities
  const getAvailableTypes = useCallback((): string[] => {
    if (!timeline) return [];
    return [...new Set(timeline.events.map(event => event.type))];
  }, [timeline]);

  const getAvailableSeverities = useCallback((): string[] => {
    if (!timeline) return [];
    return [...new Set(timeline.events.map(event => event.severity).filter(Boolean))];
  }, [timeline]);

  // Render loading state
  if (loading) {
    return (
      <div className={`workflow-timeline-container ${className}`} style={{ height, width }}>
        <div className="workflow-timeline-loading">
          <div className="loading-spinner"></div>
          <p>Loading workflow timeline...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={`workflow-timeline-container ${className}`} style={{ height, width }}>
        <div className="workflow-timeline-error">
          <div className="error-icon">⚠️</div>
          <p>Error loading workflow timeline</p>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  // Render empty state
  if (!timeline) {
    return (
      <div className={`workflow-timeline-container ${className}`} style={{ height, width }}>
        <div className="workflow-timeline-empty">
          <div className="empty-icon">📅</div>
          <p>No timeline data available</p>
          <p className="empty-message">Select a workflow to view its timeline</p>
        </div>
      </div>
    );
  }

  const availableTypes = getAvailableTypes();
  const availableSeverities = getAvailableSeverities();

  return (
    <div className={`workflow-timeline-container ${className}`} style={{ height, width }}>
      {/* Controls */}
      <div className="workflow-timeline-controls">
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
          <label htmlFor="type-filter">Event Type:</label>
          <select
            id="type-filter"
            multiple
            value={filterTypes}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              handleFilterByType(selected);
            }}
            className="control-select"
            size={Math.min(availableTypes.length, 4)}
          >
            {availableTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="severity-filter">Severity:</label>
          <select
            id="severity-filter"
            multiple
            value={filterSeverity}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              handleFilterBySeverity(selected);
            }}
            className="control-select"
            size={Math.min(availableSeverities.length, 4)}
          >
            {availableSeverities.map(severity => (
              <option key={severity} value={severity}>
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label className="control-checkbox">
            <input
              type="checkbox"
              checked={options.showLabels !== false}
              onChange={(e) => {
                const newOptions = {
                  ...options,
                  showLabels: e.target.checked
                };
                handleFilterByType(JSON.stringify(newOptions));
              }}
            />
            Show Labels
          </label>
          <label className="control-checkbox">
            <input
              type="checkbox"
              checked={options.showGrid !== false}
              onChange={(e) => {
                const newOptions = {
                  ...options,
                  showGrid: e.target.checked
                };
                handleFilterByType(JSON.stringify(newOptions));
              }}
            />
            Show Grid
          </label>
        </div>
      </div>

      {/* Timeline visualization */}
      <div className="workflow-timeline-visualization">
        <div
          ref={containerRef}
          className="workflow-timeline-svg-container"
          onClick={handleTimelineClick}
        />
      </div>

      {/* Selection info */}
      {selectedEvents.length > 0 && (
        <div className="workflow-timeline-selection">
          <div className="selection-info">
            <span className="selection-count">
              {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''} selected
            </span>
          </div>
        </div>
      )}

      {/* Timeline info */}
      {timeline && (
        <div className="workflow-timeline-info">
          <div className="info-item">
            <span className="info-label">Events:</span>
            <span className="info-value">{timeline.events.length}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Duration:</span>
            <span className="info-value">
              {timeline.endTime ?
                `${Math.round((timeline.endTime - timeline.startTime) / 1000 / 60)}m` :
                'Ongoing'
              }
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Start:</span>
            <span className="info-value">
              {new Date(timeline.startTime).toLocaleTimeString()}
            </span>
          </div>
          {timeline.endTime && (
            <div className="info-item">
              <span className="info-label">End:</span>
              <span className="info-value">
                {new Date(timeline.endTime).toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkflowTimelineComponent;
