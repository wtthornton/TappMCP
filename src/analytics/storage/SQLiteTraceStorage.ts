/**
 * SQLite Storage Backend for Call Tree Analytics
 *
 * Implements storage backend using SQLite for local development
 * and lightweight production deployments.
 */

import {
  StorageBackend,
  StorageStats,
  CleanupResult,
  StorageConfig
} from './StorageBackend.js';
import {
  StoredTrace,
  CallTreeAnalytics,
  TraceFilters,
  AggregatedAnalytics,
  ExportedData
} from '../types/AnalyticsTypes.js';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

/**
 * SQLite implementation of storage backend
 */
export class SQLiteTraceStorage implements StorageBackend {
  private db: Database.Database | null = null;
  private config: StorageConfig;
  private initialized = false;

  constructor(config: StorageConfig) {
    this.config = config;
  }

  /**
   * Initialize SQLite database
   */
  async initialize(): Promise<void> {
    try {
      // Create database connection
      this.db = new Database(this.config.connectionString || './data/analytics.db');

      // Enable WAL mode for better concurrency
      this.db.pragma('journal_mode = WAL');

      // Create tables
      await this.createTables();

      this.initialized = true;
      console.log('✅ SQLite analytics storage initialized');
    } catch (error) {
      console.error('❌ Failed to initialize SQLite storage:', error);
      throw error;
    }
  }

  /**
   * Create database tables
   */
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Create call_tree_traces table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS call_tree_traces (
        id TEXT PRIMARY KEY,
        command TEXT NOT NULL,
        options TEXT,
        context TEXT,
        execution_flow TEXT,
        analytics TEXT,
        created_at INTEGER NOT NULL,
        duration_ms INTEGER,
        success BOOLEAN,
        error_message TEXT
      )
    `);

    // Create performance_metrics table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS performance_metrics (
        id TEXT PRIMARY KEY,
        trace_id TEXT NOT NULL,
        metric_name TEXT NOT NULL,
        metric_value REAL,
        metric_unit TEXT,
        timestamp INTEGER NOT NULL,
        tags TEXT,
        FOREIGN KEY (trace_id) REFERENCES call_tree_traces (id)
      )
    `);

    // Create tool_usage_patterns table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tool_usage_patterns (
        id TEXT PRIMARY KEY,
        trace_id TEXT NOT NULL,
        tool_name TEXT NOT NULL,
        execution_time_ms INTEGER,
        success BOOLEAN,
        parameters TEXT,
        result_size INTEGER,
        FOREIGN KEY (trace_id) REFERENCES call_tree_traces (id)
      )
    `);

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_traces_created_at ON call_tree_traces (created_at);
      CREATE INDEX IF NOT EXISTS idx_traces_command ON call_tree_traces (command);
      CREATE INDEX IF NOT EXISTS idx_traces_success ON call_tree_traces (success);
      CREATE INDEX IF NOT EXISTS idx_metrics_trace_id ON performance_metrics (trace_id);
      CREATE INDEX IF NOT EXISTS idx_metrics_name ON performance_metrics (metric_name);
      CREATE INDEX IF NOT EXISTS idx_patterns_trace_id ON tool_usage_patterns (trace_id);
      CREATE INDEX IF NOT EXISTS idx_patterns_tool ON tool_usage_patterns (tool_name);
    `);
  }

  /**
   * Store a call tree trace with analytics
   */
  async storeTrace(executionFlow: any, analytics: CallTreeAnalytics): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const traceId = uuidv4();
    const now = Date.now();

    try {
      // Insert main trace record
      const insertTrace = this.db.prepare(`
        INSERT INTO call_tree_traces (
          id, command, options, context, execution_flow, analytics,
          created_at, duration_ms, success, error_message
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertTrace.run(
        traceId,
        executionFlow.command || 'unknown',
        JSON.stringify(executionFlow.options || {}),
        JSON.stringify(executionFlow.context || {}),
        JSON.stringify(executionFlow),
        JSON.stringify(analytics),
        now,
        analytics.executionMetrics.averageExecutionTime,
        analytics.executionMetrics.successRate > 0.5,
        analytics.executionMetrics.errorRate > 0 ? 'Error occurred' : null
      );

      // Insert performance metrics
      const insertMetric = this.db.prepare(`
        INSERT INTO performance_metrics (
          id, trace_id, metric_name, metric_value, metric_unit, timestamp, tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      // Store key metrics
      const metrics = [
        { name: 'execution_time', value: analytics.executionMetrics.averageExecutionTime, unit: 'ms' },
        { name: 'success_rate', value: analytics.executionMetrics.successRate, unit: 'ratio' },
        { name: 'error_rate', value: analytics.executionMetrics.errorRate, unit: 'ratio' },
        { name: 'memory_usage', value: analytics.executionMetrics.memoryUsage.averageUsage, unit: 'bytes' },
        { name: 'cpu_usage', value: analytics.executionMetrics.cpuUsage.averageUsage, unit: 'percent' },
        { name: 'context7_hit_rate', value: analytics.executionMetrics.context7HitRate, unit: 'ratio' },
        { name: 'cache_efficiency', value: analytics.executionMetrics.cacheEfficiency, unit: 'ratio' },
      ];

      for (const metric of metrics) {
        insertMetric.run(
          uuidv4(),
          traceId,
          metric.name,
          metric.value,
          metric.unit,
          now,
          JSON.stringify({})
        );
      }

      // Store tool usage patterns
      const insertPattern = this.db.prepare(`
        INSERT INTO tool_usage_patterns (
          id, trace_id, tool_name, execution_time_ms, success, parameters, result_size
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      for (const [tool, count] of Object.entries(analytics.executionMetrics.toolUsageDistribution)) {
        insertPattern.run(
          uuidv4(),
          traceId,
          tool,
          analytics.executionMetrics.averageExecutionTime,
          true,
          JSON.stringify({}),
          0
        );
      }

    } catch (error) {
      console.error('❌ Failed to store trace:', error);
      throw error;
    }
  }

  /**
   * Retrieve traces based on filters
   */
  async getTraces(filters: TraceFilters): Promise<StoredTrace[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      let query = 'SELECT * FROM call_tree_traces WHERE 1=1';
      const params: any[] = [];

      // Apply filters
      if (filters.timeRange) {
        query += ' AND created_at >= ? AND created_at <= ?';
        params.push(filters.timeRange.start, filters.timeRange.end);
      }

      if (filters.commands && filters.commands.length > 0) {
        query += ' AND command IN (' + filters.commands.map(() => '?').join(',') + ')';
        params.push(...filters.commands);
      }

      if (filters.success !== undefined) {
        query += ' AND success = ?';
        params.push(filters.success);
      }

      if (filters.tools && filters.tools.length > 0) {
        query += ' AND id IN (SELECT DISTINCT trace_id FROM tool_usage_patterns WHERE tool_name IN (' +
                 filters.tools.map(() => '?').join(',') + '))';
        params.push(...filters.tools);
      }

      query += ' ORDER BY created_at DESC';

      const stmt = this.db.prepare(query);
      const rows = stmt.all(...params);

      return rows.map((row: any) => ({
        id: row.id,
        command: row.command,
        options: JSON.parse(row.options || '{}'),
        context: JSON.parse(row.context || '{}'),
        executionFlow: JSON.parse(row.execution_flow || '{}'),
        analytics: JSON.parse(row.analytics || '{}'),
        storedAt: row.created_at,
        duration: row.duration_ms || 0,
        success: Boolean(row.success),
        errorMessage: row.error_message || undefined,
      }));

    } catch (error) {
      console.error('❌ Failed to retrieve traces:', error);
      throw error;
    }
  }

  /**
   * Get aggregated analytics for a time range
   */
  async getAggregatedAnalytics(timeRange: { start: number; end: number }): Promise<AggregatedAnalytics> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Get traces in time range
      const traces = await this.getTraces({ timeRange });

      if (traces.length === 0) {
        return {
          timeRange,
          metrics: {
            totalCalls: 0,
            averageExecutionTime: 0,
            successRate: 0,
            errorRate: 0,
            toolUsageDistribution: {},
            context7HitRate: 0,
            cacheEfficiency: 0,
            memoryUsage: { peakUsage: 0, averageUsage: 0, trend: 'stable', leaksDetected: false, gcFrequency: 0 },
            cpuUsage: { peakUsage: 0, averageUsage: 0, trend: 'stable', intensiveOperations: [] },
            responseSize: { averageSize: 0, peakSize: 0, sizeDistribution: {}, compressionRatio: 0 },
          },
          insights: {
            bottlenecks: [],
            slowestOperations: [],
            resourceUtilization: { cpu: 0, memory: 0, io: 0, network: 0, efficiency: 0 },
            scalabilityMetrics: { rpsCapacity: 0, concurrentUsers: 0, responseTimeUnderLoad: 0, scalingEfficiency: 0 },
            optimizationScore: 0,
            recommendations: [],
          },
          patterns: [],
          quality: {
            responseQuality: 0,
            codeQualityImpact: 0,
            userSatisfaction: { overallScore: 0, responseTimeSatisfaction: 0, qualitySatisfaction: 0, usabilitySatisfaction: 0, feedbackPatterns: [] },
            errorAnalysis: { totalErrors: 0, errorRate: 0, categories: [], commonErrors: [], trends: [] },
            completeness: 0,
            accuracy: 0,
          },
          trends: {
            performanceTrends: [],
            usageTrends: [],
            qualityTrends: [],
            seasonalPatterns: [],
          },
        };
      }

      // Calculate aggregated metrics
      const totalCalls = traces.length;
      const successfulCalls = traces.filter(t => t.success).length;
      const averageExecutionTime = traces.reduce((sum, t) => sum + t.duration, 0) / totalCalls;
      const successRate = successfulCalls / totalCalls;
      const errorRate = 1 - successRate;

      // Aggregate tool usage
      const toolUsageDistribution: Record<string, number> = {};
      traces.forEach(trace => {
        if (trace.analytics?.executionMetrics?.toolUsageDistribution) {
          Object.entries(trace.analytics.executionMetrics.toolUsageDistribution).forEach(([tool, count]) => {
            toolUsageDistribution[tool] = (toolUsageDistribution[tool] || 0) + count;
          });
        }
      });

      // Calculate other metrics
      const context7HitRate = traces.reduce((sum, t) =>
        sum + (t.analytics?.executionMetrics?.context7HitRate || 0), 0) / totalCalls;

      const cacheEfficiency = traces.reduce((sum, t) =>
        sum + (t.analytics?.executionMetrics?.cacheEfficiency || 0), 0) / totalCalls;

      return {
        timeRange,
        metrics: {
          totalCalls,
          averageExecutionTime,
          successRate,
          errorRate,
          toolUsageDistribution,
          context7HitRate,
          cacheEfficiency,
          memoryUsage: { peakUsage: 0, averageUsage: 0, trend: 'stable', leaksDetected: false, gcFrequency: 0 },
          cpuUsage: { peakUsage: 0, averageUsage: 0, trend: 'stable', intensiveOperations: [] },
          responseSize: { averageSize: 0, peakSize: 0, sizeDistribution: {}, compressionRatio: 0 },
        },
        insights: {
          bottlenecks: [],
          slowestOperations: [],
          resourceUtilization: { cpu: 0, memory: 0, io: 0, network: 0, efficiency: 0 },
          scalabilityMetrics: { rpsCapacity: 0, concurrentUsers: 0, responseTimeUnderLoad: 0, scalingEfficiency: 0 },
          optimizationScore: Math.round(successRate * 100),
          recommendations: [],
        },
        patterns: [],
        quality: {
          responseQuality: Math.round(successRate * 100),
          codeQualityImpact: 0,
          userSatisfaction: { overallScore: Math.round(successRate * 100), responseTimeSatisfaction: 0, qualitySatisfaction: 0, usabilitySatisfaction: 0, feedbackPatterns: [] },
          errorAnalysis: { totalErrors: Math.round(errorRate * totalCalls), errorRate, categories: [], commonErrors: [], trends: [] },
          completeness: 0,
          accuracy: 0,
        },
        trends: {
          performanceTrends: [],
          usageTrends: [],
          qualityTrends: [],
          seasonalPatterns: [],
        },
      };

    } catch (error) {
      console.error('❌ Failed to get aggregated analytics:', error);
      throw error;
    }
  }

  /**
   * Export data in specified format
   */
  async exportData(format: 'json' | 'csv' | 'excel', filters: TraceFilters): Promise<ExportedData> {
    const traces = await this.getTraces(filters);

    switch (format) {
      case 'json':
        return {
          format: 'json',
          data: traces,
          metadata: {
            exportedAt: Date.now(),
            recordCount: traces.length,
            timeRange: filters.timeRange || { start: 0, end: Date.now() },
          },
        };

      case 'csv':
        // TODO: Implement CSV export
        throw new Error('CSV export not yet implemented');

      case 'excel':
        // TODO: Implement Excel export
        throw new Error('Excel export not yet implemented');

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<StorageStats> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const totalTraces = this.db.prepare('SELECT COUNT(*) as count FROM call_tree_traces').get() as { count: number };
      const oldestTrace = this.db.prepare('SELECT MIN(created_at) as oldest FROM call_tree_traces').get() as { oldest: number };
      const newestTrace = this.db.prepare('SELECT MAX(created_at) as newest FROM call_tree_traces').get() as { newest: number };

      // Get database file size
      const dbInfo = this.db.prepare('PRAGMA page_count').get() as { page_count: number };
      const pageSize = this.db.prepare('PRAGMA page_size').get() as { page_size: number };
      const storageSize = dbInfo.page_count * pageSize.page_size;

      return {
        totalTraces: totalTraces.count,
        storageSize,
        oldestTrace: oldestTrace.oldest || 0,
        newestTrace: newestTrace.newest || 0,
        utilization: 0, // TODO: Calculate utilization
        availableSpace: 0, // TODO: Calculate available space
      };

    } catch (error) {
      console.error('❌ Failed to get storage stats:', error);
      throw error;
    }
  }

  /**
   * Clean up old data based on retention policy
   */
  async cleanup(retentionDays: number): Promise<CleanupResult> {
    if (!this.db) throw new Error('Database not initialized');

    const startTime = Date.now();
    const cutoffTime = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);

    try {
      // Delete old traces
      const deleteTraces = this.db.prepare('DELETE FROM call_tree_traces WHERE created_at < ?');
      const result = deleteTraces.run(cutoffTime);

      const duration = Date.now() - startTime;

      return {
        tracesRemoved: result.changes,
        spaceFreed: 0, // TODO: Calculate space freed
        duration,
        errors: [],
      };

    } catch (error) {
      console.error('❌ Failed to cleanup old data:', error);
      return {
        tracesRemoved: 0,
        spaceFreed: 0,
        duration: Date.now() - startTime,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Check if storage is available
   */
  async isAvailable(): Promise<boolean> {
    return this.initialized && this.db !== null;
  }

  /**
   * Close storage backend
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initialized = false;
      console.log('✅ SQLite storage closed');
    }
  }
}
