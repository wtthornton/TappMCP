/**
 * Icon Types for TappMCP Status System
 *
 * Defines types and interfaces for the status icon system
 * used throughout the TappMCP platform.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

/**
 * Icon color variants for different status types
 */
export type IconColor = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'loading';

/**
 * Icon size variants
 */
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Workflow status types
 */
export type WorkflowStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'paused'
  | 'queued';

/**
 * Performance status types
 */
export type PerformanceStatus = 'excellent' | 'good' | 'warning' | 'critical' | 'unknown';

/**
 * Notification priority levels
 */
export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low' | 'info';

/**
 * Icon configuration interface
 */
export interface IconConfig {
  color: IconColor;
  size: IconSize;
  animated?: boolean;
  className?: string;
  title?: string;
}

/**
 * Status icon mapping interface
 */
export interface StatusIconMapping {
  workflow: Record<WorkflowStatus, string>;
  performance: Record<PerformanceStatus, string>;
  notification: Record<NotificationPriority, string>;
  system: Record<string, string>;
}

/**
 * Icon component props
 */
export interface IconProps {
  config: IconConfig;
  onClick?: () => void;
  onHover?: () => void;
  children?: React.ReactNode;
}

/**
 * Color mapping for different status types
 */
export const COLOR_MAPPING: Record<IconColor, string> = {
  success: '#10B981', // Green
  warning: '#F59E0B', // Yellow
  error: '#EF4444', // Red
  info: '#3B82F6', // Blue
  neutral: '#6B7280', // Gray
  loading: '#8B5CF6', // Purple
};

/**
 * Size mapping for different icon sizes
 */
export const SIZE_MAPPING: Record<IconSize, string> = {
  xs: '12px',
  sm: '16px',
  md: '20px',
  lg: '24px',
  xl: '32px',
};
