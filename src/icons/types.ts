/**
 * Icon System Types and Interfaces
 *
 * Defines types, interfaces, and constants for the TappMCP icon system
 * including status icons, semantic meanings, and animation configurations.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type IconColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'muted';
export type IconAnimation = 'none' | 'spin' | 'pulse' | 'bounce' | 'shake' | 'fade';
export type IconVariant = 'outline' | 'filled' | 'duotone' | 'gradient';

export interface IconProps {
  size?: IconSize;
  color?: IconColor;
  animation?: IconAnimation;
  variant?: IconVariant;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  'aria-label'?: string;
}

export interface StatusIconProps extends IconProps {
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused' | 'cancelled' | 'unknown';
  showText?: boolean;
  textPosition?: 'right' | 'bottom' | 'left' | 'top';
}

export interface ProgressIconProps extends IconProps {
  progress: number; // 0-100
  showPercentage?: boolean;
  size?: IconSize;
}

export interface AlertIconProps extends IconProps {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'info' | 'warning' | 'error' | 'success';
}

export interface SystemIconProps extends IconProps {
  system: 'healthy' | 'degraded' | 'unhealthy' | 'maintenance' | 'offline';
}

// Icon size mappings
export const ICON_SIZES: Record<IconSize, string> = {
  xs: '12px',
  sm: '16px',
  md: '20px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
};

// Icon color mappings
export const ICON_COLORS: Record<IconColor, string> = {
  primary: '#007bff',
  secondary: '#6c757d',
  success: '#28a745',
  warning: '#ffc107',
  error: '#dc3545',
  info: '#17a2b8',
  muted: '#6c757d',
};

// Status icon mappings
export const STATUS_ICONS: Record<string, string> = {
  pending: '⏳',
  running: '🔄',
  completed: '✅',
  failed: '❌',
  paused: '⏸️',
  cancelled: '🚫',
  unknown: '❓',
  healthy: '🟢',
  degraded: '🟡',
  unhealthy: '🔴',
  maintenance: '🔧',
  offline: '⚫',
};

// Alert type icons
export const ALERT_ICONS: Record<string, string> = {
  info: 'ℹ️',
  warning: '⚠️',
  error: '❌',
  success: '✅',
  critical: '🚨',
};

// System status icons
export const SYSTEM_ICONS: Record<string, string> = {
  healthy: '🟢',
  degraded: '🟡',
  unhealthy: '🔴',
  maintenance: '🔧',
  offline: '⚫',
};

// Animation keyframes
export const ICON_ANIMATIONS = {
  spin: 'icon-spin 1s linear infinite',
  pulse: 'icon-pulse 2s ease-in-out infinite',
  bounce: 'icon-bounce 1s ease-in-out infinite',
  shake: 'icon-shake 0.5s ease-in-out',
  fade: 'icon-fade 0.3s ease-in-out',
};

// Semantic meanings for accessibility
export const ICON_SEMANTICS: Record<string, string> = {
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

// Icon component configuration
export interface IconConfig {
  defaultSize: IconSize;
  defaultColor: IconColor;
  defaultAnimation: IconAnimation;
  defaultVariant: IconVariant;
  enableAnimations: boolean;
  enableAccessibility: boolean;
  enableTooltips: boolean;
}

export const DEFAULT_ICON_CONFIG: IconConfig = {
  defaultSize: 'md',
  defaultColor: 'primary',
  defaultAnimation: 'none',
  defaultVariant: 'filled',
  enableAnimations: true,
  enableAccessibility: true,
  enableTooltips: true,
};
