/**
 * Workflow Types for Visualization and Data Management
 *
 * Defines data structures for workflow visualization, timeline events,
 * and graph-based representations used by the TappMCP system.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

export interface WorkflowNode {
  id: string;
  name: string;
  type: WorkflowNodeType;
  status: WorkflowNodeStatus;
  startTime?: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
  visual: {
    x?: number;
    y?: number;
    fx?: number;
    fy?: number;
    size: number;
    color: string;
    shape: 'circle' | 'square' | 'diamond' | 'hexagon';
  };
}

export interface WorkflowEdge {
  id: string;
  sourceId: string;
  targetId: string;
  source: string;
  target: string;
  type: WorkflowEdgeType;
  weight?: number;
  metadata?: Record<string, any>;
  visual: {
    color: string;
    width: number;
    style: 'solid' | 'dashed' | 'dotted';
  };
}

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  layout: 'force' | 'hierarchical' | 'circular' | 'timeline';
  metadata: {
    title: string;
    description?: string;
    createdAt: number;
    updatedAt: number;
  };
}

export interface WorkflowTimelineEvent {
  id: string;
  type: string;
  timestamp: number;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  nodeId?: string;
  metadata?: Record<string, any>;
}

export interface WorkflowTimeline {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  events: WorkflowTimelineEvent[];
  metadata: {
    description?: string;
    tags?: string[];
    createdAt: number;
    updatedAt: number;
  };
}

export interface WorkflowStatistics {
  totalNodes: number;
  totalEdges: number;
  completedNodes: number;
  failedNodes: number;
  runningNodes: number;
  pendingNodes: number;
  averageExecutionTime: number;
  totalExecutionTime: number;
  successRate: number;
  failureRate: number;
}

export interface WorkflowGraphResponse {
  success: boolean;
  data?: WorkflowGraph;
  error?: string;
  metadata?: {
    generatedAt: number;
    processingTime: number;
  };
}

export interface WorkflowTimelineResponse {
  success: boolean;
  data?: WorkflowTimeline;
  error?: string;
  metadata?: {
    generatedAt: number;
    processingTime: number;
  };
}

export interface WorkflowStatisticsResponse {
  success: boolean;
  data?: WorkflowStatistics;
  error?: string;
  metadata?: {
    generatedAt: number;
    processingTime: number;
  };
}

export interface WorkflowVisualizationOptions {
  layout: 'force' | 'hierarchical' | 'circular' | 'timeline';
  showLabels: boolean;
  showMetadata: boolean;
  nodeSize: 'small' | 'medium' | 'large';
  colorScheme: 'default' | 'status' | 'type' | 'custom';
  animation: boolean;
  interactive: boolean;
}

export interface WorkflowTimelineOptions {
  timeRange?: {
    start: number;
    end: number;
  };
  severity?: ('info' | 'warning' | 'error' | 'critical')[];
  nodeId?: string;
  limit?: number;
  offset?: number;
}

export type WorkflowNodeType =
  | 'start'
  | 'end'
  | 'process'
  | 'decision'
  | 'parallel'
  | 'merge'
  | 'subprocess'
  | 'task'
  | 'gateway'
  | 'event';

export type WorkflowNodeStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'skipped';

export type WorkflowEdgeType =
  | 'sequence'
  | 'conditional'
  | 'parallel'
  | 'exception'
  | 'compensation'
  | 'message';
