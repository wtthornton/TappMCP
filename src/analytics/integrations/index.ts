/**
 * Analytics Integrations
 *
 * External tool integrations for monitoring, alerting,
 * and data visualization platforms.
 */

export { default as GrafanaIntegration } from './GrafanaIntegration.js';
export { default as PrometheusIntegration } from './PrometheusIntegration.js';

// Integration types
export type {
  GrafanaConfig,
  GrafanaDashboard,
  GrafanaPanel,
  GrafanaTarget
} from './GrafanaIntegration.js';
export type {
  PrometheusConfig,
  PrometheusMetric
} from './PrometheusIntegration.js';

// Integration utilities
export const createGrafanaConfig = (overrides: Partial<GrafanaConfig> = {}): GrafanaConfig => ({
  serverUrl: 'http://localhost:3000',
  apiKey: process.env.GRAFANA_API_KEY || '',
  dashboard: {
    title: 'Smart Vibe Analytics',
    uid: 'smart-vibe-analytics',
    refresh: '5s',
    timezone: 'browser'
  },
  dataSource: {
    name: 'Smart Vibe Analytics',
    type: 'prometheus',
    url: 'http://localhost:9090',
    access: 'proxy'
  },
  panels: {
    responseTime: true,
    errorRate: true,
    memoryUsage: true,
    cpuUsage: true,
    throughput: true,
    healthScore: true
  },
  ...overrides
});

export const createPrometheusConfig = (overrides: Partial<PrometheusConfig> = {}): PrometheusConfig => ({
  collectionInterval: 1000,
  enableCustomMetrics: true,
  enableHistograms: true,
  enableSummaries: true,
  metricsPrefix: 'smart_vibe_',
  customLabels: {
    service: 'smart-vibe',
    version: '1.0.0'
  },
  ...overrides
});
