/**
 * WebSocket Event Types and Interfaces
 *
 * Defines all WebSocket event types, message schemas, and connection management
 * interfaces for real-time communication between TappMCP server and clients.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
  id?: string;
}

export interface WorkflowStatusUpdate {
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  currentPhase: string;
  message: string;
  timestamp: number;
}

export interface PerformanceMetrics {
  memoryUsage: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  responseTime: number;
  cacheHitRate: number;
  errorRate: number;
  activeConnections: number;
  timestamp: number;
}

export interface NotificationMessage {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  actions?: Array<{
    label: string;
    action: string;
    data?: any;
  }>;
}

export interface WorkflowGraphUpdate {
  workflowId: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  status: 'updated' | 'created' | 'deleted';
  timestamp: number;
}

export interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  position: { x: number; y: number };
  metadata: Record<string, any>;
}

export interface WorkflowConnection {
  id: string;
  source: string;
  target: string;
  type: 'data' | 'control' | 'dependency';
  status: 'active' | 'inactive' | 'error';
}

export interface ClientSubscription {
  clientId: string;
  eventTypes: string[];
  filters: Record<string, any>;
  timestamp: number;
}

export interface ConnectionInfo {
  clientId: string;
  connectedAt: number;
  lastActivity: number;
  subscriptions: ClientSubscription[];
  userAgent: string;
  ipAddress: string;
}

// Event type constants
export const WEBSOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  AUTHENTICATE: 'authenticate',

  // Workflow events
  WORKFLOW_STATUS_UPDATE: 'workflow:status:update',
  WORKFLOW_PROGRESS_UPDATE: 'workflow:progress:update',
  WORKFLOW_COMPLETED: 'workflow:completed',
  WORKFLOW_FAILED: 'workflow:failed',

  // Performance events
  PERFORMANCE_METRICS: 'performance:metrics',
  PERFORMANCE_ALERT: 'performance:alert',

  // Notification events
  NOTIFICATION_SEND: 'notification:send',
  NOTIFICATION_READ: 'notification:read',
  NOTIFICATION_DISMISS: 'notification:dismiss',

  // Workflow graph events
  WORKFLOW_GRAPH_UPDATE: 'workflow:graph:update',
  WORKFLOW_NODE_UPDATE: 'workflow:node:update',
  WORKFLOW_CONNECTION_UPDATE: 'workflow:connection:update',

  // System events
  SYSTEM_STATUS: 'system:status',
  SYSTEM_MAINTENANCE: 'system:maintenance',
  SYSTEM_ERROR: 'system:error',
} as const;

export type WebSocketEventType = typeof WEBSOCKET_EVENTS[keyof typeof WEBSOCKET_EVENTS];
