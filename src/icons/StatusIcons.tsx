/**
 * Status Icons Component Library
 *
 * Comprehensive collection of status icons for TappMCP with
 * consistent styling, animations, and accessibility features.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import React from 'react';
import {
  IconProps,
  StatusIconProps,
  ProgressIconProps,
  AlertIconProps,
  SystemIconProps,
  ICON_SIZES,
  ICON_COLORS,
  ICON_ANIMATIONS,
  STATUS_ICONS,
  ALERT_ICONS,
  SYSTEM_ICONS,
  ICON_SEMANTICS,
  DEFAULT_ICON_CONFIG
} from './types.js';
import './StatusIcons.css';

/**
 * Base Icon Component
 *
 * @param props - Icon properties
 * @returns JSX element
 *
 * @example
 * ```tsx
 * <BaseIcon size="lg" color="success" animation="pulse">✅</BaseIcon>
 * ```
 *
 * @since 2.0.0
 */
export const BaseIcon: React.FC<IconProps & { children: React.ReactNode }> = ({
  size = DEFAULT_ICON_CONFIG.defaultSize,
  color = DEFAULT_ICON_CONFIG.defaultColor,
  animation = DEFAULT_ICON_CONFIG.defaultAnimation,
  variant = DEFAULT_ICON_CONFIG.defaultVariant,
  className = '',
  style = {},
  title,
  'aria-label': ariaLabel,
  children
}) => {
  const iconStyle: React.CSSProperties = {
    fontSize: ICON_SIZES[size],
    color: ICON_COLORS[color],
    animation: animation !== 'none' ? ICON_ANIMATIONS[animation] : undefined,
    ...style
  };

  const iconClass = [
    'status-icon',
    `status-icon--${size}`,
    `status-icon--${color}`,
    `status-icon--${variant}`,
    animation !== 'none' ? `status-icon--${animation}` : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <span
      className={iconClass}
      style={iconStyle}
      title={title}
      aria-label={ariaLabel}
      role="img"
    >
      {children}
    </span>
  );
};

/**
 * Workflow Status Icon
 *
 * @param props - Status icon properties
 * @returns JSX element
 *
 * @example
 * ```tsx
 * <WorkflowStatusIcon status="running" size="lg" animation="spin" />
 * ```
 *
 * @since 2.0.0
 */
export const WorkflowStatusIcon: React.FC<StatusIconProps> = ({
  status,
  size = 'md',
  color,
  animation = 'none',
  variant = 'filled',
  className = '',
  style = {},
  showText = false,
  textPosition = 'right',
  title,
  'aria-label': ariaLabel
}) => {
  const icon = STATUS_ICONS[status] || STATUS_ICONS.unknown;
  const semantic = ICON_SEMANTICS[status] || 'Unknown status';

  // Determine color based on status if not provided
  const statusColor = color || getStatusColor(status);

  // Determine animation based on status if not provided
  const statusAnimation = animation === 'none' ? getStatusAnimation(status) : animation;

  const iconElement = (
    <BaseIcon
      size={size}
      color={statusColor}
      animation={statusAnimation}
      variant={variant}
      className={className}
      style={style}
      title={title || semantic}
      aria-label={ariaLabel || semantic}
    >
      {icon}
    </BaseIcon>
  );

  if (!showText) {
    return iconElement;
  }

  const textElement = (
    <span className="status-text">
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );

  const containerClass = [
    'status-container',
    `status-container--${textPosition}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={containerClass}>
      {textPosition === 'left' || textPosition === 'top' ? textElement : iconElement}
      {textPosition === 'right' || textPosition === 'bottom' ? textElement : iconElement}
    </span>
  );
};

/**
 * Progress Icon
 *
 * @param props - Progress icon properties
 * @returns JSX element
 *
 * @example
 * ```tsx
 * <ProgressIcon progress={75} size="lg" showPercentage />
 * ```
 *
 * @since 2.0.0
 */
export const ProgressIcon: React.FC<ProgressIconProps> = ({
  progress,
  size = 'md',
  color = 'primary',
  animation = 'none',
  variant = 'filled',
  className = '',
  style = {},
  showPercentage = false,
  title
}) => {
  const progressValue = Math.max(0, Math.min(100, progress));
  const isComplete = progressValue === 100;
  const isInProgress = progressValue > 0 && progressValue < 100;

  const icon = isComplete ? '✅' : isInProgress ? '🔄' : '⏳';
  const progressColor = isComplete ? 'success' : isInProgress ? 'primary' : 'muted';
  const progressAnimation = isInProgress ? 'spin' : 'none';

  const iconElement = (
    <BaseIcon
      size={size}
      color={progressColor}
      animation={progressAnimation}
      variant={variant}
      className={className}
      style={style}
      title={title || `${progressValue}% complete`}
      aria-label={`${progressValue}% complete`}
    >
      {icon}
    </BaseIcon>
  );

  if (!showPercentage) {
    return iconElement;
  }

  return (
    <span className="progress-container">
      {iconElement}
      <span className="progress-text">
        {progressValue}%
      </span>
    </span>
  );
};

/**
 * Alert Icon
 *
 * @param props - Alert icon properties
 * @returns JSX element
 *
 * @example
 * ```tsx
 * <AlertIcon type="error" severity="high" size="lg" animation="shake" />
 * ```
 *
 * @since 2.0.0
 */
export const AlertIcon: React.FC<AlertIconProps> = ({
  type,
  severity,
  size = 'md',
  color,
  animation = 'none',
  variant = 'filled',
  className = '',
  style = {},
  title,
  'aria-label': ariaLabel
}) => {
  const icon = ALERT_ICONS[type] || ALERT_ICONS.info;
  const semantic = ICON_SEMANTICS[type] || 'Alert message';

  // Determine color based on severity if not provided
  const alertColor = color || getSeverityColor(severity);

  // Determine animation based on severity if not provided
  const alertAnimation = animation === 'none' ? getSeverityAnimation(severity) : animation;

  return (
    <BaseIcon
      size={size}
      color={alertColor}
      animation={alertAnimation}
      variant={variant}
      className={className}
      style={style}
      title={title || semantic}
      aria-label={ariaLabel || semantic}
    >
      {icon}
    </BaseIcon>
  );
};

/**
 * System Status Icon
 *
 * @param props - System icon properties
 * @returns JSX element
 *
 * @example
 * ```tsx
 * <SystemStatusIcon system="healthy" size="lg" animation="pulse" />
 * ```
 *
 * @since 2.0.0
 */
export const SystemStatusIcon: React.FC<SystemIconProps> = ({
  system,
  size = 'md',
  color,
  animation = 'none',
  variant = 'filled',
  className = '',
  style = {},
  title,
  'aria-label': ariaLabel
}) => {
  const icon = SYSTEM_ICONS[system] || SYSTEM_ICONS.offline;
  const semantic = ICON_SEMANTICS[system] || 'System status unknown';

  // Determine color based on system status if not provided
  const systemColor = color || getSystemColor(system);

  // Determine animation based on system status if not provided
  const systemAnimation = animation === 'none' ? getSystemAnimation(system) : animation;

  return (
    <BaseIcon
      size={size}
      color={systemColor}
      animation={systemAnimation}
      variant={variant}
      className={className}
      style={style}
      title={title || semantic}
      aria-label={ariaLabel || semantic}
    >
      {icon}
    </BaseIcon>
  );
};

// Helper functions for determining colors and animations

function getStatusColor(status: string): string {
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

function getStatusAnimation(status: string): string {
  switch (status) {
    case 'running':
      return 'spin';
    case 'pending':
      return 'pulse';
    default:
      return 'none';
  }
}

function getSeverityColor(severity: string): string {
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

function getSeverityAnimation(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'shake';
    case 'high':
      return 'pulse';
    default:
      return 'none';
  }
}

function getSystemColor(system: string): string {
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

function getSystemAnimation(system: string): string {
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

// Export all icon components
export {
  BaseIcon,
  WorkflowStatusIcon,
  ProgressIcon,
  AlertIcon,
  SystemStatusIcon
};
