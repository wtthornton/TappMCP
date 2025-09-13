/**
 * Icon Utilities
 *
 * Provides utility functions for working with status icons
 * and managing icon configurations.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import {
  IconConfig,
  WorkflowStatus,
  PerformanceStatus,
  NotificationPriority,
  IconColor,
  IconSize,
  COLOR_MAPPING,
  SIZE_MAPPING
} from './types.js';

/**
 * Creates a default icon configuration
 */
export function createIconConfig(
  color: IconColor = 'neutral',
  size: IconSize = 'md',
  animated: boolean = false
): IconConfig {
  return {
    color,
    size,
    animated,
    className: '',
    title: ''
  };
}

/**
 * Maps workflow status to appropriate icon color
 */
export function getWorkflowStatusColor(status: WorkflowStatus): IconColor {
  const colorMap: Record<WorkflowStatus, IconColor> = {
    pending: 'neutral',
    running: 'info',
    completed: 'success',
    failed: 'error',
    cancelled: 'warning',
    paused: 'warning',
    queued: 'neutral'
  };

  return colorMap[status] || 'neutral';
}

/**
 * Maps performance status to appropriate icon color
 */
export function getPerformanceStatusColor(status: PerformanceStatus): IconColor {
  const colorMap: Record<PerformanceStatus, IconColor> = {
    excellent: 'success',
    good: 'success',
    warning: 'warning',
    critical: 'error',
    unknown: 'neutral'
  };

  return colorMap[status] || 'neutral';
}

/**
 * Maps notification priority to appropriate icon color
 */
export function getNotificationPriorityColor(priority: NotificationPriority): IconColor {
  const colorMap: Record<NotificationPriority, IconColor> = {
    critical: 'error',
    high: 'warning',
    medium: 'info',
    low: 'neutral',
    info: 'info'
  };

  return colorMap[priority] || 'neutral';
}

/**
 * Gets the appropriate icon name for a workflow status
 */
export function getWorkflowStatusIconName(status: WorkflowStatus): string {
  const iconMap: Record<WorkflowStatus, string> = {
    pending: 'Pending',
    running: 'Running',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled',
    paused: 'Paused',
    queued: 'Queued'
  };

  return iconMap[status] || 'Pending';
}

/**
 * Gets the appropriate icon name for a performance status
 */
export function getPerformanceStatusIconName(status: PerformanceStatus): string {
  const iconMap: Record<PerformanceStatus, string> = {
    excellent: 'Excellent',
    good: 'Good',
    warning: 'Warning',
    critical: 'Critical',
    unknown: 'Unknown'
  };

  return iconMap[status] || 'Unknown';
}

/**
 * Gets the appropriate icon name for a notification priority
 */
export function getNotificationPriorityIconName(priority: NotificationPriority): string {
  const iconMap: Record<NotificationPriority, string> = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    info: 'Info'
  };

  return iconMap[priority] || 'Info';
}

/**
 * Creates an icon configuration for a workflow status
 */
export function createWorkflowStatusIconConfig(
  status: WorkflowStatus,
  size: IconSize = 'md',
  animated: boolean = false
): IconConfig {
  return createIconConfig(
    getWorkflowStatusColor(status),
    size,
    animated || status === 'running'
  );
}

/**
 * Creates an icon configuration for a performance status
 */
export function createPerformanceStatusIconConfig(
  status: PerformanceStatus,
  size: IconSize = 'md',
  animated: boolean = false
): IconConfig {
  return createIconConfig(
    getPerformanceStatusColor(status),
    size,
    animated || status === 'critical'
  );
}

/**
 * Creates an icon configuration for a notification priority
 */
export function createNotificationPriorityIconConfig(
  priority: NotificationPriority,
  size: IconSize = 'md',
  animated: boolean = false
): IconConfig {
  return createIconConfig(
    getNotificationPriorityColor(priority),
    size,
    animated || priority === 'critical'
  );
}

/**
 * Validates an icon configuration
 */
export function validateIconConfig(config: IconConfig): boolean {
  return (
    Object.keys(COLOR_MAPPING).includes(config.color) &&
    Object.keys(SIZE_MAPPING).includes(config.size) &&
    typeof config.animated === 'boolean'
  );
}

/**
 * Merges two icon configurations
 */
export function mergeIconConfigs(
  base: IconConfig,
  override: Partial<IconConfig>
): IconConfig {
  return {
    ...base,
    ...override
  };
}

/**
 * Gets CSS class name for icon animations
 */
export function getAnimationClass(animated: boolean, animationType: string = 'pulse'): string {
  if (!animated) return '';

  const animationClasses: Record<string, string> = {
    pulse: 'icon-pulse',
    spin: 'icon-spin',
    bounce: 'icon-bounce'
  };

  return animationClasses[animationType] || 'icon-pulse';
}

/**
 * Generates a unique ID for icon instances
 */
export function generateIconId(prefix: string = 'icon'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Checks if an icon should be animated based on status
 */
export function shouldAnimateIcon(status: string, type: 'workflow' | 'performance' | 'notification'): boolean {
  const animatedStatuses = {
    workflow: ['running', 'pending'],
    performance: ['critical', 'warning'],
    notification: ['critical', 'high']
  };

  return animatedStatuses[type]?.includes(status) || false;
}

