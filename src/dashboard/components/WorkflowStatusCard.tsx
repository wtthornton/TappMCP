/**
 * Workflow Status Card Component
 *
 * Displays real-time status information for a single workflow including
 * progress, current phase, and status indicators.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import React from 'react';
import { WorkflowStatusUpdate } from '../../websocket/types.js';
import './WorkflowStatusCard.css';

interface WorkflowStatusCardProps {
  workflow: WorkflowStatusUpdate;
}

/**
 * Workflow Status Card Component
 *
 * @param props - Component props
 * @returns JSX element
 *
 * @example
 * ```tsx
 * <WorkflowStatusCard workflow={workflowUpdate} />
 * ```
 *
 * @since 2.0.0
 */
export const WorkflowStatusCard: React.FC<WorkflowStatusCardProps> = ({ workflow }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'running':
        return '🔄';
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      case 'paused':
        return '⏸️';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'running':
        return 'status-running';
      case 'completed':
        return 'status-completed';
      case 'failed':
        return 'status-failed';
      case 'paused':
        return 'status-paused';
      default:
        return 'status-unknown';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className={`workflow-card ${getStatusColor(workflow.status)}`}>
      <div className="workflow-header">
        <div className="workflow-title">
          <span className="workflow-icon">{getStatusIcon(workflow.status)}</span>
          <span className="workflow-name">{workflow.workflowId}</span>
        </div>
        <div className="workflow-status">
          <span className={`status-badge ${getStatusColor(workflow.status)}`}>
            {workflow.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="workflow-body">
        <div className="workflow-progress">
          <div className="progress-label">
            <span>Progress: {workflow.progress}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${workflow.progress}%` }}
            />
          </div>
        </div>

        <div className="workflow-phase">
          <span className="phase-label">Current Phase:</span>
          <span className="phase-name">{workflow.currentPhase}</span>
        </div>

        {workflow.message && (
          <div className="workflow-message">
            <span className="message-label">Message:</span>
            <span className="message-text">{workflow.message}</span>
          </div>
        )}

        <div className="workflow-timestamp">
          <span className="timestamp-label">Last Updated:</span>
          <span className="timestamp-value">{formatTimestamp(workflow.timestamp)}</span>
        </div>
      </div>

      <div className="workflow-footer">
        <div className="workflow-actions">
          <button className="action-button view-details">
            View Details
          </button>
          {workflow.status === 'running' && (
            <button className="action-button pause-workflow">
              Pause
            </button>
          )}
          {workflow.status === 'paused' && (
            <button className="action-button resume-workflow">
              Resume
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
