/**
 * Workflow WebSocket Events
 *
 * Handles real-time workflow status updates, progress tracking, and
 * workflow completion notifications via WebSocket connections.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import { EventEmitter } from 'events';
import { WebSocketServer } from '../WebSocketServer.js';
import {
  WorkflowStatusUpdate,
  WorkflowGraphUpdate,
  WEBSOCKET_EVENTS
} from '../types.js';

/**
 * Workflow Events Manager for WebSocket communication
 *
 * @example
 * ```typescript
 * const workflowEvents = new WorkflowEvents(wsServer);
 * workflowEvents.broadcastWorkflowUpdate('workflow-123', 'running', 50, 'Processing data');
 * ```
 *
 * @since 2.0.0
 */
export class WorkflowEvents extends EventEmitter {
  constructor(private wsServer: WebSocketServer) {
    super();
  }

  /**
   * Broadcasts a workflow status update to all subscribed clients
   *
   * @param workflowId - Unique identifier for the workflow
   * @param status - Current status of the workflow
   * @param progress - Progress percentage (0-100)
   * @param currentPhase - Current phase of execution
   * @param message - Optional status message
   *
   * @example
   * ```typescript
   * workflowEvents.broadcastWorkflowUpdate('workflow-123', 'running', 50, 'Processing data');
   * ```
   */
  broadcastWorkflowUpdate(
    workflowId: string,
    status: 'pending' | 'running' | 'completed' | 'failed' | 'paused',
    progress: number,
    currentPhase: string,
    message?: string
  ): void {
    const update: WorkflowStatusUpdate = {
      workflowId,
      status,
      progress: Math.max(0, Math.min(100, progress)),
      currentPhase,
      message: message || this.getDefaultMessage(status),
      timestamp: Date.now()
    };

    this.wsServer.broadcast(WEBSOCKET_EVENTS.WORKFLOW_STATUS_UPDATE, update, {
      workflowId
    });

    this.emit('workflow:status:update', update);
  }

  /**
   * Broadcasts workflow progress update
   *
   * @param workflowId - Unique identifier for the workflow
   * @param progress - Progress percentage (0-100)
   * @param message - Progress message
   */
  broadcastWorkflowProgress(
    workflowId: string,
    progress: number,
    message: string
  ): void {
    const update = {
      workflowId,
      progress: Math.max(0, Math.min(100, progress)),
      message,
      timestamp: Date.now()
    };

    this.wsServer.broadcast(WEBSOCKET_EVENTS.WORKFLOW_PROGRESS_UPDATE, update, {
      workflowId
    });

    this.emit('workflow:progress:update', update);
  }

  /**
   * Broadcasts workflow completion
   *
   * @param workflowId - Unique identifier for the workflow
   * @param success - Whether the workflow completed successfully
   * @param message - Completion message
   * @param results - Optional workflow results
   */
  broadcastWorkflowCompletion(
    workflowId: string,
    success: boolean,
    message: string,
    results?: any
  ): void {
    const eventType = success
      ? WEBSOCKET_EVENTS.WORKFLOW_COMPLETED
      : WEBSOCKET_EVENTS.WORKFLOW_FAILED;

    const update = {
      workflowId,
      success,
      message,
      results,
      timestamp: Date.now()
    };

    this.wsServer.broadcast(eventType, update, { workflowId });
    this.emit(success ? 'workflow:completed' : 'workflow:failed', update);
  }

  /**
   * Broadcasts workflow graph update
   *
   * @param workflowId - Unique identifier for the workflow
   * @param nodes - Updated workflow nodes
   * @param connections - Updated workflow connections
   * @param status - Update status
   */
  broadcastWorkflowGraphUpdate(
    workflowId: string,
    nodes: any[],
    connections: any[],
    status: 'updated' | 'created' | 'deleted'
  ): void {
    const update: WorkflowGraphUpdate = {
      workflowId,
      nodes,
      connections,
      status,
      timestamp: Date.now()
    };

    this.wsServer.broadcast(WEBSOCKET_EVENTS.WORKFLOW_GRAPH_UPDATE, update, {
      workflowId
    });

    this.emit('workflow:graph:update', update);
  }

  /**
   * Broadcasts workflow node update
   *
   * @param workflowId - Unique identifier for the workflow
   * @param nodeId - Unique identifier for the node
   * @param nodeData - Updated node data
   */
  broadcastWorkflowNodeUpdate(
    workflowId: string,
    nodeId: string,
    nodeData: any
  ): void {
    const update = {
      workflowId,
      nodeId,
      nodeData,
      timestamp: Date.now()
    };

    this.wsServer.broadcast(WEBSOCKET_EVENTS.WORKFLOW_NODE_UPDATE, update, {
      workflowId,
      nodeId
    });

    this.emit('workflow:node:update', update);
  }

  /**
   * Broadcasts workflow connection update
   *
   * @param workflowId - Unique identifier for the workflow
   * @param connectionId - Unique identifier for the connection
   * @param connectionData - Updated connection data
   */
  broadcastWorkflowConnectionUpdate(
    workflowId: string,
    connectionId: string,
    connectionData: any
  ): void {
    const update = {
      workflowId,
      connectionId,
      connectionData,
      timestamp: Date.now()
    };

    this.wsServer.broadcast(WEBSOCKET_EVENTS.WORKFLOW_CONNECTION_UPDATE, update, {
      workflowId,
      connectionId
    });

    this.emit('workflow:connection:update', update);
  }

  /**
   * Gets default message for workflow status
   *
   * @param status - Workflow status
   * @returns Default status message
   */
  private getDefaultMessage(status: string): string {
    const messages = {
      pending: 'Workflow is pending execution',
      running: 'Workflow is currently running',
      completed: 'Workflow completed successfully',
      failed: 'Workflow execution failed',
      paused: 'Workflow execution is paused'
    };

    return messages[status as keyof typeof messages] || 'Unknown workflow status';
  }
}
