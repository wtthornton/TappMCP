/**
 * Analytics Dashboard Components
 *
 * Complete dashboard system for call tree analytics visualization,
 * performance monitoring, and alert management.
 */

export { default as AnalyticsDashboard } from './AnalyticsDashboard.js';
export { default as CallTreeVisualizer } from './CallTreeVisualizer.js';
export { default as PerformanceCharts } from './PerformanceCharts.js';
export { default as AlertManagement } from './AlertManagement.js';

// Dashboard types
export type { AnalyticsDashboardProps, DashboardState } from './AnalyticsDashboard.js';
export type { CallTreeVisualizerProps, CallTreeLayout } from './CallTreeVisualizer.js';
export type { PerformanceChartsProps, ChartData, ChartConfig } from './PerformanceCharts.js';
export type { AlertManagementProps, AlertConfig, AlertFilter, AlertAction } from './AlertManagement.js';

// Dashboard utilities
export const createDashboardConfig = (config: Partial<AnalyticsDashboardProps['config']> = {}) => ({
  refreshInterval: 1000,
  enableAlerts: true,
  enableCharts: true,
  enableExport: true,
  ...config
});

export const createVisualizerConfig = (config: Partial<CallTreeVisualizerProps['config']> = {}) => ({
  showTiming: true,
  showPerformance: true,
  showErrors: true,
  showToolCalls: true,
  showContext7Calls: true,
  showCacheOperations: true,
  enableInteractions: true,
  layout: 'hierarchical' as const,
  ...config
});

export const createChartsConfig = (config: Partial<PerformanceChartsProps['config']> = {}) => ({
  showResponseTime: true,
  showErrorRate: true,
  showMemoryUsage: true,
  showCpuUsage: true,
  showThroughput: true,
  enableAnimations: true,
  chartType: 'line' as const,
  timeRange: '24h' as const,
  ...config
});
