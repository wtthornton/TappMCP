/**
 * Icon Utility Functions
 *
 * Helper functions for determining colors, animations, and other
 * properties for icons based on status, severity, and system state.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import { IconColor, IconAnimation } from './types.js';

/**
 * Gets the appropriate color for a workflow status
 *
 * @param status - Workflow status
 * @returns Icon color
 *
 * @example
 * ```typescript
 * const color = getStatusColor('running'); // 'primary'
 * ```
 *
 * @since 2.0.0
 */
export function getStatusColor(status: string): IconColor {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'running':
      return 'primary';
    case 'completed':
      return 'success';
    case 'failed':
      return 'error';
    case 'paused':
      return 'muted';
    case 'cancelled':
      return 'muted';
    default:
      return 'muted';
  }
}

/**
 * Gets the appropriate animation for a workflow status
 *
 * @param status - Workflow status
 * @returns Icon animation
 *
 * @example
 * ```typescript
 * const animation = getStatusAnimation('running'); // 'spin'
 * ```
 *
 * @since 2.0.0
 */
export function getStatusAnimation(status: string): IconAnimation {
  switch (status) {
    case 'running':
      return 'spin';
    case 'pending':
      return 'pulse';
    default:
      return 'none';
  }
}

/**
 * Gets the appropriate color for an alert severity
 *
 * @param severity - Alert severity level
 * @returns Icon color
 *
 * @example
 * ```typescript
 * const color = getSeverityColor('critical'); // 'error'
 * ```
 *
 * @since 2.0.0
 */
export function getSeverityColor(severity: string): IconColor {
  switch (severity) {
    case 'critical':
      return 'error';
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'info';
    default:
      return 'muted';
  }
}

/**
 * Gets the appropriate animation for an alert severity
 *
 * @param severity - Alert severity level
 * @returns Icon animation
 *
 * @example
 * ```typescript
 * const animation = getSeverityAnimation('critical'); // 'shake'
 * ```
 *
 * @since 2.0.0
 */
export function getSeverityAnimation(severity: string): IconAnimation {
  switch (severity) {
    case 'critical':
      return 'shake';
    case 'high':
      return 'pulse';
    default:
      return 'none';
  }
}

/**
 * Gets the appropriate color for a system status
 *
 * @param system - System status
 * @returns Icon color
 *
 * @example
 * ```typescript
 * const color = getSystemColor('healthy'); // 'success'
 * ```
 *
 * @since 2.0.0
 */
export function getSystemColor(system: string): IconColor {
  switch (system) {
    case 'healthy':
      return 'success';
    case 'degraded':
      return 'warning';
    case 'unhealthy':
      return 'error';
    case 'maintenance':
      return 'muted';
    case 'offline':
      return 'muted';
    default:
      return 'muted';
  }
}

/**
 * Gets the appropriate animation for a system status
 *
 * @param system - System status
 * @returns Icon animation
 *
 * @example
 * ```typescript
 * const animation = getSystemAnimation('healthy'); // 'pulse'
 * ```
 *
 * @since 2.0.0
 */
export function getSystemAnimation(system: string): IconAnimation {
  switch (system) {
    case 'healthy':
      return 'pulse';
    case 'degraded':
      return 'pulse';
    case 'unhealthy':
      return 'shake';
    default:
      return 'none';
  }
}

/**
 * Gets the semantic meaning for an icon
 *
 * @param type - Icon type
 * @returns Semantic description
 *
 * @example
 * ```typescript
 * const meaning = getIconSemantic('running'); // 'Workflow is currently executing'
 * ```
 *
 * @since 2.0.0
 */
export function getIconSemantic(type: string): string {
  const semantics: Record<string, string> = {
    pending: 'Workflow is waiting to start',
    running: 'Workflow is currently executing',
    completed: 'Workflow finished successfully',
    failed: 'Workflow encountered an error',
    paused: 'Workflow execution is paused',
    cancelled: 'Workflow was cancelled',
    unknown: 'Workflow status is unknown',
    healthy: 'System is operating normally',
    degraded: 'System has minor issues',
    unhealthy: 'System has critical issues',
    maintenance: 'System is under maintenance',
    offline: 'System is offline',
    info: 'Informational message',
    warning: 'Warning message',
    error: 'Error message',
    success: 'Success message',
    critical: 'Critical alert',
  };

  return semantics[type] || 'Unknown status';
}

/**
 * Validates if a status is valid
 *
 * @param status - Status to validate
 * @returns True if valid
 *
 * @example
 * ```typescript
 * const isValid = isValidStatus('running'); // true
 * ```
 *
 * @since 2.0.0
 */
export function isValidStatus(status: string): boolean {
  const validStatuses = [
    'pending', 'running', 'completed', 'failed', 'paused', 'cancelled', 'unknown',
    'healthy', 'degraded', 'unhealthy', 'maintenance', 'offline',
    'info', 'warning', 'error', 'success', 'critical'
  ];
  return validStatuses.includes(status);
}

/**
 * Gets all available statuses
 *
 * @returns Array of all valid statuses
 *
 * @example
 * ```typescript
 * const statuses = getAllStatuses();
 * ```
 *
 * @since 2.0.0
 */
export function getAllStatuses(): string[] {
  return [
    'pending', 'running', 'completed', 'failed', 'paused', 'cancelled', 'unknown',
    'healthy', 'degraded', 'unhealthy', 'maintenance', 'offline',
    'info', 'warning', 'error', 'success', 'critical'
  ];
}

/**
 * Creates an icon configuration object
 *
 * @param overrides - Configuration overrides
 * @returns Icon configuration
 *
 * @example
 * ```typescript
 * const config = createIconConfig({ defaultSize: 'lg', enableAnimations: false });
 * ```
 *
 * @since 2.0.0
 */
export function createIconConfig(overrides: Partial<{
  defaultSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  defaultColor: IconColor;
  defaultAnimation: IconAnimation;
  enableAnimations: boolean;
  enableAccessibility: boolean;
  enableTooltips: boolean;
}> = {}) {
  return {
    defaultSize: 'md',
    defaultColor: 'primary',
    defaultAnimation: 'none',
    enableAnimations: true,
    enableAccessibility: true,
    enableTooltips: true,
    ...overrides
  };
}
