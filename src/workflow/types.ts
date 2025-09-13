/**
 * Enhanced Workflow Data Types
 *
 * Enhanced data structures for workflow visualization and graph representation.
 * These types extend the core orchestration engine types with visualization-specific
 * properties and relationships.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import { Workflow, WorkflowPhase, WorkflowTask } from '../core/orchestration-engine.js';

/**
 * Workflow Node Types
 *
 * @since 2.0.0
 */
export type WorkflowNodeType = 'workflow' | 'phase' | 'task' | 'deliverable' | 'role' | 'tool';

/**
 * Workflow Edge Types
 *
 * @since 2.0.0
 */
export type WorkflowEdgeType = 'dependency' | 'transition' | 'delivery' | 'assignment' | 'execution';

/**
 * Workflow Node
 *
 * Represents a node in the workflow graph with visualization properties.
 *
 * @since 2.0.0
 */
export interface WorkflowNode {
  /** Unique node identifier */
  id: string;
  /** Node type */
  type: WorkflowNodeType;
  /** Human-readable label */
  label: string;
  /** Node description */
  description?: string;
  /** Current status */
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused' | 'cancelled';
  /** Progress percentage (0-100) */
  progress: number;
  /** Priority level */
  priority: 'low' | 'medium' | 'high' | 'critical';
  /** Estimated duration in minutes */
  estimatedDuration?: number;
  /** Actual duration in minutes */
  actualDuration?: number;
  /** Start time */
  startTime?: Date;
  /** End time */
  endTime?: Date;
  /** Visual properties */
  visual: {
    /** Node color based on status */
    color: string;
    /** Node size based on priority */
    size: number;
    /** Node shape */
    shape: 'circle' | 'rectangle' | 'diamond' | 'hexagon';
    /** Icon identifier */
    icon?: string;
    /** Opacity level */
    opacity: number;
    /** Border style */
    borderStyle: 'solid' | 'dashed' | 'dotted';
    /** Border width */
    borderWidth: number;
  };
  /** Metadata */
  metadata: {
    /** Original workflow data reference */
    workflowId?: string;
    /** Phase name if applicable */
    phaseName?: string;
    /** Task ID if applicable */
    taskId?: string;
    /** Role if applicable */
    role?: string;
    /** Tool if applicable */
    tool?: string;
    /** Custom properties */
    [key: string]: any;
  };
  /** Position in graph */
  position?: {
    x: number;
    y: number;
  };
}

/**
 * Workflow Edge
 *
 * Represents a connection between workflow nodes.
 *
 * @since 2.0.0
 */
export interface WorkflowEdge {
  /** Unique edge identifier */
  id: string;
  /** Source node ID */
  source: string;
  /** Target node ID */
  target: string;
  /** Edge type */
  type: WorkflowEdgeType;
  /** Edge label */
  label?: string;
  /** Edge weight (for layout algorithms) */
  weight: number;
  /** Whether this is a critical path edge */
  isCritical: boolean;
  /** Visual properties */
  visual: {
    /** Edge color */
    color: string;
    /** Edge width */
    width: number;
    /** Edge style */
    style: 'solid' | 'dashed' | 'dotted' | 'curved';
    /** Arrow type */
    arrowType: 'none' | 'arrow' | 'circle' | 'diamond';
    /** Opacity level */
    opacity: number;
  };
  /** Metadata */
  metadata: {
    /** Dependency type */
    dependencyType?: 'hard' | 'soft' | 'conditional';
    /** Transition condition */
    condition?: string;
    /** Custom properties */
    [key: string]: any;
  };
}

/**
 * Workflow Graph
 *
 * Complete graph representation of a workflow.
 *
 * @since 2.0.0
 */
export interface WorkflowGraph {
  /** Workflow ID */
  workflowId: string;
  /** Workflow name */
  name: string;
  /** Graph nodes */
  nodes: WorkflowNode[];
  /** Graph edges */
  edges: WorkflowEdge[];
  /** Graph metadata */
  metadata: {
    /** Total nodes count */
    nodeCount: number;
    /** Total edges count */
    edgeCount: number;
    /** Graph complexity score */
    complexity: number;
    /** Critical path length */
    criticalPathLength: number;
    /** Estimated total duration */
    estimatedDuration: number;
    /** Actual duration */
    actualDuration?: number;
    /** Creation timestamp */
    createdAt: Date;
    /** Last update timestamp */
    updatedAt: Date;
  };
  /** Layout configuration */
  layout: {
    /** Layout algorithm */
    algorithm: 'force' | 'hierarchical' | 'circular' | 'grid' | 'timeline' | 'custom';
    /** Layout parameters */
    parameters: Record<string, any>;
    /** Auto-layout enabled */
    autoLayout: boolean;
  };
}

/**
 * Workflow Timeline Event
 *
 * Represents a point in time event in the workflow execution.
 *
 * @since 2.0.0
 */
export interface WorkflowTimelineEvent {
  /** Event ID */
  id: string;
  /** Event timestamp */
  timestamp: number;
  /** Event type */
  type: 'start' | 'phase_start' | 'phase_complete' | 'task_start' | 'task_complete' | 'error' | 'milestone' | 'end';
  /** Event title */
  title: string;
  /** Event description */
  description?: string;
  /** Related node ID */
  nodeId?: string;
  /** Event severity */
  severity: 'info' | 'warning' | 'error' | 'success' | 'critical';
  /** Event data */
  data: Record<string, any>;
  /** Visual properties */
  visual: {
    /** Event color */
    color: string;
    /** Event icon */
    icon: string;
    /** Event size */
    size: number;
  };
}

/**
 * Workflow Timeline
 *
 * Complete timeline of workflow execution events.
 *
 * @since 2.0.0
 */
export interface WorkflowTimeline {
  /** Workflow ID */
  workflowId: string;
  /** Timeline events */
  events: WorkflowTimelineEvent[];
  /** Start time */
  startTime: number;
  /** End time */
  endTime?: number;
  /** Timeline metadata */
  metadata?: {
    /** Total duration */
    duration: number;
    /** Event count */
    eventCount: number;
    /** Error count */
    errorCount: number;
    /** Milestone count */
    milestoneCount: number;
    /** Additional metadata */
    [key: string]: any;
  };
}

/**
 * Workflow Statistics
 *
 * Statistical data about workflow execution.
 *
 * @since 2.0.0
 */
export interface WorkflowStatistics {
  /** Workflow ID */
  workflowId: string;
  /** Execution statistics */
  execution: {
    /** Total execution time in minutes */
    totalTime: number;
    /** Average phase duration */
    averagePhaseTime: number;
    /** Fastest phase duration */
    fastestPhaseTime: number;
    /** Slowest phase duration */
    slowestPhaseTime: number;
    /** Success rate percentage */
    successRate: number;
    /** Error rate percentage */
    errorRate: number;
  };
  /** Performance metrics */
  performance: {
    /** Overall performance score */
    score: number;
    /** Efficiency rating */
    efficiency: number;
    /** Quality rating */
    quality: number;
    /** Resource utilization */
    resourceUtilization: number;
  };
  /** Role statistics */
  roles: {
    /** Role name */
    role: string;
    /** Time spent in minutes */
    timeSpent: number;
    /** Task count */
    taskCount: number;
    /** Success rate */
    successRate: number;
  }[];
  /** Phase statistics */
  phases: {
    /** Phase name */
    phase: string;
    /** Duration in minutes */
    duration: number;
    /** Task count */
    taskCount: number;
    /** Success rate */
    successRate: number;
    /** Quality score */
    qualityScore: number;
  }[];
}

/**
 * Workflow Filter Options
 *
 * Options for filtering workflow data.
 *
 * @since 2.0.0
 */
export interface WorkflowFilterOptions {
  /** Filter by status */
  status?: ('pending' | 'running' | 'completed' | 'failed' | 'paused' | 'cancelled')[];
  /** Filter by role */
  roles?: string[];
  /** Filter by phase */
  phases?: string[];
  /** Filter by priority */
  priorities?: ('low' | 'medium' | 'high' | 'critical')[];
  /** Filter by date range */
  dateRange?: {
    start: Date;
    end: Date;
  };
  /** Filter by duration range */
  durationRange?: {
    min: number;
    max: number;
  };
  /** Search query */
  search?: string;
  /** Sort options */
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  /** Pagination */
  pagination?: {
    page: number;
    limit: number;
  };
}

/**
 * Workflow Visualization Options
 *
 * Options for customizing workflow visualization.
 *
 * @since 2.0.0
 */
export interface WorkflowVisualizationOptions {
  /** Layout algorithm */
  layout: 'force' | 'hierarchical' | 'circular' | 'grid' | 'timeline';
  /** Show/hide elements */
  visibility: {
    /** Show node labels */
    showLabels: boolean;
    /** Show edge labels */
    showEdgeLabels: boolean;
    /** Show progress bars */
    showProgress: boolean;
    /** Show status indicators */
    showStatus: boolean;
    /** Show time estimates */
    showTimeEstimates: boolean;
    /** Show critical path */
    showCriticalPath: boolean;
  };
  /** Color scheme */
  colors: {
    /** Status colors */
    status: {
      pending: string;
      running: string;
      completed: string;
      failed: string;
      paused: string;
      cancelled: string;
    };
    /** Priority colors */
    priority: {
      low: string;
      medium: string;
      high: string;
      critical: string;
    };
    /** Role colors */
    roles: Record<string, string>;
  };
  /** Animation settings */
  animation: {
    /** Enable animations */
    enabled: boolean;
    /** Animation duration in ms */
    duration: number;
    /** Animation easing */
    easing: string;
  };
  /** Interaction settings */
  interaction: {
    /** Enable zoom */
    zoom: boolean;
    /** Enable pan */
    pan: boolean;
    /** Enable selection */
    selection: boolean;
    /** Enable drag and drop */
    dragDrop: boolean;
  };
}

/**
 * Workflow Graph API Response
 *
 * Standard response format for workflow graph API endpoints.
 *
 * @since 2.0.0
 */
export interface WorkflowGraphResponse {
  /** Success status */
  success: boolean;
  /** Response data */
  data: WorkflowGraph | WorkflowGraph[];
  /** Response metadata */
  metadata: {
    /** Total count (for paginated responses) */
    total?: number;
    /** Page number */
    page?: number;
    /** Items per page */
    limit?: number;
    /** Response timestamp */
    timestamp: Date;
  };
  /** Error information */
  error?: {
    /** Error code */
    code: string;
    /** Error message */
    message: string;
    /** Error details */
    details?: any;
  };
}

/**
 * Workflow Timeline API Response
 *
 * Standard response format for workflow timeline API endpoints.
 *
 * @since 2.0.0
 */
export interface WorkflowTimelineResponse {
  /** Success status */
  success: boolean;
  /** Timeline data */
  data: WorkflowTimeline;
  /** Response metadata */
  metadata: {
    /** Response timestamp */
    timestamp: Date;
  };
  /** Error information */
  error?: {
    /** Error code */
    code: string;
    /** Error message */
    message: string;
    /** Error details */
    details?: any;
  };
}

/**
 * Workflow Statistics API Response
 *
 * Standard response format for workflow statistics API endpoints.
 *
 * @since 2.0.0
 */
export interface WorkflowStatisticsResponse {
  /** Success status */
  success: boolean;
  /** Statistics data */
  data: WorkflowStatistics;
  /** Response metadata */
  metadata: {
    /** Response timestamp */
    timestamp: Date;
  };
  /** Error information */
  error?: {
    /** Error code */
    code: string;
    /** Error message */
    message: string;
    /** Error details */
    details?: any;
  };
}

/**
 * Workflow Visualization Options
 *
 * Configuration options for workflow graph visualization.
 *
 * @since 2.0.0
 */
export interface WorkflowVisualizationOptions {
  /** Layout algorithm to use */
  layout: 'force' | 'hierarchical' | 'circular' | 'grid' | 'timeline';
  /** Visibility settings */
  visibility: {
    showLabels: boolean;
    showEdgeLabels: boolean;
    showProgress: boolean;
    showStatus: boolean;
    showTimeEstimates: boolean;
    showCriticalPath: boolean;
  };
  /** Color schemes */
  colors: {
    status: {
      pending: string;
      running: string;
      completed: string;
      failed: string;
      paused: string;
      cancelled: string;
    };
    priority: {
      low: string;
      medium: string;
      high: string;
      critical: string;
    };
    roles: Record<string, string>;
  };
  /** Animation settings */
  animation: {
    enabled: boolean;
    duration: number;
    easing: string;
  };
  /** Interaction settings */
  interaction: {
    zoom: boolean;
    pan: boolean;
    selection: boolean;
    dragDrop: boolean;
  };
}

/**
 * Workflow Timeline Options
 *
 * Configuration options for workflow timeline visualization.
 *
 * @since 2.0.0
 */
export interface WorkflowTimelineOptions {
  /** Show event labels */
  showLabels: boolean;
  /** Show grid lines */
  showGrid: boolean;
  /** Show axis */
  showAxis: boolean;
  /** Show tooltips */
  showTooltips: boolean;
  /** Filter settings */
  filter: {
    eventTypes: string[];
    severity: string[];
    timeRange: [number, number] | null;
  };
  /** Color schemes for event types */
  colors: {
    start: string;
    end: string;
    status_change: string;
    alert: string;
    milestone: string;
  };
  /** Animation settings */
  animation: {
    enabled: boolean;
    duration: number;
    easing: string;
  };
  /** Interaction settings */
  interaction: {
    zoom: boolean;
    pan: boolean;
    selection: boolean;
    tooltips: boolean;
  };
}
