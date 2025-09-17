/**
 * Storage Backend Interface for Call Tree Analytics
 *
 * Defines the contract for storing and retrieving call tree traces
 * and analytics data. Supports multiple storage backends.
 */

import {
  StoredTrace,
  CallTreeAnalytics,
  TraceFilters,
  AggregatedAnalytics,
  ExportedData
} from '../types/AnalyticsTypes.js';

/**
 * Storage backend interface for call tree analytics
 */
export interface StorageBackend {
  /**
   * Store a call tree trace with analytics
   */
  storeTrace(executionFlow: any, analytics: CallTreeAnalytics): Promise<void>;

  /**
   * Retrieve traces based on filters
   */
  getTraces(filters: TraceFilters): Promise<StoredTrace[]>;

  /**
   * Get aggregated analytics for a time range
   */
  getAggregatedAnalytics(timeRange: { start: number; end: number }): Promise<AggregatedAnalytics>;

  /**
   * Export data in specified format
   */
  exportData(format: 'json' | 'csv' | 'excel', filters: TraceFilters): Promise<ExportedData>;

  /**
   * Get storage statistics
   */
  getStorageStats(): Promise<StorageStats>;

  /**
   * Clean up old data based on retention policy
   */
  cleanup(retentionDays: number): Promise<CleanupResult>;

  /**
   * Check if storage is available
   */
  isAvailable(): Promise<boolean>;

  /**
   * Initialize storage backend
   */
  initialize(): Promise<void>;

  /**
   * Close storage backend
   */
  close(): Promise<void>;
}

/**
 * Storage statistics
 */
export interface StorageStats {
  /** Total number of stored traces */
  totalTraces: number;

  /** Storage size in bytes */
  storageSize: number;

  /** Oldest trace timestamp */
  oldestTrace: number;

  /** Newest trace timestamp */
  newestTrace: number;

  /** Storage utilization percentage */
  utilization: number;

  /** Available storage space */
  availableSpace: number;
}

/**
 * Cleanup operation result
 */
export interface CleanupResult {
  /** Number of traces removed */
  tracesRemoved: number;

  /** Storage space freed in bytes */
  spaceFreed: number;

  /** Cleanup duration in milliseconds */
  duration: number;

  /** Errors encountered during cleanup */
  errors: string[];
}

/**
 * Storage configuration
 */
export interface StorageConfig {
  /** Storage backend type */
  backend: 'sqlite' | 'postgresql' | 'json';

  /** Connection string or file path */
  connectionString?: string;

  /** Data retention period in days */
  retentionDays: number;

  /** Enable compression */
  compression: boolean;

  /** Enable encryption */
  encryption: boolean;

  /** Maximum storage size in bytes */
  maxSize?: number;

  /** Batch size for operations */
  batchSize: number;
}

/**
 * Storage backend factory
 */
export class StorageBackendFactory {
  /**
   * Create storage backend based on configuration
   */
  static async create(config: StorageConfig): Promise<StorageBackend> {
    switch (config.backend) {
      case 'sqlite':
        // TODO: Implement SQLite storage
        throw new Error('SQLite storage not yet implemented');

      case 'postgresql':
        // TODO: Implement PostgreSQL storage
        throw new Error('PostgreSQL storage not yet implemented');

      case 'json':
        // TODO: Implement JSON file storage
        throw new Error('JSON file storage not yet implemented');

      default:
        throw new Error(`Unsupported storage backend: ${config.backend}`);
    }
  }

  /**
   * Get default configuration for storage backend
   */
  static getDefaultConfig(backend: 'sqlite' | 'postgresql' | 'json'): StorageConfig {
    const baseConfig: StorageConfig = {
      backend,
      retentionDays: 30,
      compression: true,
      encryption: false,
      batchSize: 100,
    };

    switch (backend) {
      case 'sqlite':
        return {
          ...baseConfig,
          connectionString: './data/analytics.db',
        };

      case 'postgresql':
        return {
          ...baseConfig,
          connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/tappmcp_analytics',
        };

      case 'json':
        return {
          ...baseConfig,
          connectionString: './data/analytics.json',
        };

      default:
        throw new Error(`Unsupported storage backend: ${backend}`);
    }
  }
}
