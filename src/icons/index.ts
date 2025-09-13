/**
 * Icon System Entry Point
 *
 * Centralized exports for the TappMCP icon system providing
 * easy access to all icon components and utilities.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

// Export all icon components
export {
  BaseIcon,
  WorkflowStatusIcon,
  ProgressIcon,
  AlertIcon,
  SystemStatusIcon
} from './StatusIcons.js';

// Export all types and interfaces
export type {
  IconProps,
  StatusIconProps,
  ProgressIconProps,
  AlertIconProps,
  SystemIconProps,
  IconSize,
  IconColor,
  IconAnimation,
  IconVariant,
  IconConfig
} from './types.js';

// Export constants and configurations
export {
  ICON_SIZES,
  ICON_COLORS,
  ICON_ANIMATIONS,
  STATUS_ICONS,
  ALERT_ICONS,
  SYSTEM_ICONS,
  ICON_SEMANTICS,
  DEFAULT_ICON_CONFIG
} from './types.js';

// Export utility functions
export {
  getStatusColor,
  getStatusAnimation,
  getSeverityColor,
  getSeverityAnimation,
  getSystemColor,
  getSystemAnimation
} from './utils.js';

// Re-export CSS for easy importing
import './StatusIcons.css';
