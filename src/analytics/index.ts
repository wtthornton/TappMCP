/**
 * Analytics Module - Call Tree Capture & Analysis System
 *
 * Main entry point for TappMCP analytics functionality.
 * Provides comprehensive call tree capture, performance analysis,
 * and usage pattern tracking for smart_vibe tool execution.
 */

// Core analytics types
export * from './types/AnalyticsTypes.js';

// Analytics engine
export { AnalyticsEngine } from './AnalyticsEngine.js';

// Enhanced call tree tracer
export { EnhancedCallTreeTracer } from './EnhancedCallTreeTracer.js';

// Storage backends
export { StorageBackend, StorageBackendFactory } from './storage/StorageBackend.js';
export { SQLiteTraceStorage } from './storage/SQLiteTraceStorage.js';

// Real-time processing
export { RealTimeProcessor } from './RealTimeProcessor.js';

// VibeTapp integration
export { VibeTappAnalyticsIntegration, createVibeTappWithAnalytics } from './VibeTappAnalyticsIntegration.js';

// Dashboard components
export * from './dashboard/index.js';

// Machine Learning components
export { MLInsightsEngine } from './ml/MLInsightsEngine.js';
export type {
  MLInsightsConfig,
  PatternDetectionResult,
  PredictiveAnalyticsResult,
  AnomalyDetectionResult,
  TrendAnalysisResult
} from './ml/MLInsightsEngine.js';

// Optimization components
export { OptimizationEngine } from './optimization/OptimizationEngine.js';
export type {
  OptimizationConfig,
  OptimizationSuggestion,
  RegressionDetection,
  ABTestResult
} from './optimization/OptimizationEngine.js';

// API components
export { AnalyticsAPI } from './api/AnalyticsAPI.js';
export type { AnalyticsAPIConfig } from './api/AnalyticsAPI.js';

// Integration components
export * from './integrations/index.js';

/**
 * Analytics Module Configuration
 */
export interface AnalyticsModuleConfig {
  /** Enable analytics collection */
  enabled: boolean;

  /** Storage backend configuration */
  storage: {
    backend: 'sqlite' | 'postgresql' | 'json';
    connectionString?: string;
    retentionDays: number;
  };

  /** Real-time processing configuration */
  realTime: {
    enabled: boolean;
    refreshInterval: number;
  };

  /** Performance monitoring configuration */
  performance: {
    enabled: boolean;
    samplingRate: number;
    alertThresholds: {
      responseTime: number;
      errorRate: number;
      memoryUsage: number;
    };
  };
}

/**
 * Default analytics configuration
 */
export const DEFAULT_ANALYTICS_CONFIG: AnalyticsModuleConfig = {
  enabled: true,
  storage: {
    backend: 'sqlite',
    retentionDays: 30,
  },
  realTime: {
    enabled: true,
    refreshInterval: 1000, // 1 second
  },
  performance: {
    enabled: true,
    samplingRate: 1.0, // 100% sampling
    alertThresholds: {
      responseTime: 1000, // 1 second
      errorRate: 0.05, // 5%
      memoryUsage: 0.8, // 80%
    },
  },
};

/**
 * Analytics module initialization status
 */
export let analyticsInitialized = false;

/**
 * Initialize analytics module
 */
export function initializeAnalytics(config?: Partial<AnalyticsModuleConfig>): void {
  const finalConfig = { ...DEFAULT_ANALYTICS_CONFIG, ...config };

  if (finalConfig.enabled) {
    console.log('🔍 Initializing TappMCP Analytics Module...');

    // TODO: Initialize storage backend
    // TODO: Initialize analytics engine
    // TODO: Initialize real-time processor
    // TODO: Initialize dashboard components

    analyticsInitialized = true;
    console.log('✅ Analytics module initialized successfully');
  } else {
    console.log('⏸️ Analytics module disabled');
  }
}

/**
 * Check if analytics is available
 */
export function isAnalyticsAvailable(): boolean {
  return analyticsInitialized;
}

/**
 * Get analytics module status
 */
export function getAnalyticsStatus(): {
  initialized: boolean;
  enabled: boolean;
  components: {
    storage: boolean;
    engine: boolean;
    realTime: boolean;
    dashboard: boolean;
  };
} {
  return {
    initialized: analyticsInitialized,
    enabled: true, // TODO: Get from config
    components: {
      storage: false, // TODO: Check storage status
      engine: false, // TODO: Check engine status
      realTime: false, // TODO: Check real-time status
      dashboard: false, // TODO: Check dashboard status
    },
  };
}
