#!/usr/bin/env node

/**
 * Performance Optimizer for TappMCP Hybrid Architecture
 *
 * Advanced performance optimization system that continuously monitors
 * and optimizes the hybrid SQLite + JSON architecture for maximum efficiency.
 */

import { Context7Integration, Context7Config } from './context7-integration.js';
import { SQLiteDatabase } from './sqlite-database.js';
import { FileManager } from './file-manager.js';
import { ArtifactMetadataAPI } from './artifact-metadata.js';
import { EventEmitter } from 'events';

export interface PerformanceConfig extends Context7Config {
  optimizationEnabled: boolean;
  autoOptimization: boolean;
  optimizationInterval: number; // milliseconds
  performanceThresholds: {
    memoryUsage: number; // percentage
    cacheHitRate: number; // percentage
    averageLatency: number; // milliseconds
    errorRate: number; // percentage
  };
  optimizationStrategies: {
    memoryOptimization: boolean;
    cacheOptimization: boolean;
    queryOptimization: boolean;
    compressionOptimization: boolean;
    preloadOptimization: boolean;
  };
}

export interface PerformanceMetrics {
  memory: {
    usage: number;
    efficiency: number;
    fragmentation: number;
  };
  cache: {
    hitRate: number;
    missRate: number;
    evictionRate: number;
    averageSize: number;
  };
  database: {
    queryTime: number;
    connectionPool: number;
    indexEfficiency: number;
  };
  fileSystem: {
    readTime: number;
    writeTime: number;
    compressionRatio: number;
  };
  overall: {
    throughput: number;
    latency: number;
    errorRate: number;
    costEfficiency: number;
  };
}

export interface OptimizationResult {
  strategy: string;
  success: boolean;
  improvement: number; // percentage
  details: any;
  timestamp: Date;
}

export interface PerformanceEvent {
  type: 'optimization' | 'threshold_breach' | 'performance_improvement' | 'degradation';
  timestamp: Date;
  details: any;
}

export class PerformanceOptimizer extends EventEmitter {
  private config: PerformanceConfig;
  private context7Integration: Context7Integration;
  private db: SQLiteDatabase;
  private fileManager: FileManager;
  private metadataAPI: ArtifactMetadataAPI;

  private metrics: PerformanceMetrics;
  private optimizationHistory: OptimizationResult[] = [];
  private performanceHistory: PerformanceMetrics[] = [];
  private optimizationTimer: NodeJS.Timeout | null = null;
  private isOptimizing = false;

  constructor(
    database: SQLiteDatabase,
    fileManager: FileManager,
    metadataAPI: ArtifactMetadataAPI,
    config: Partial<PerformanceConfig> = {}
  ) {
    super();

    this.db = database;
    this.fileManager = fileManager;
    this.metadataAPI = metadataAPI;

    this.config = {
      maxMemoryMB: config.maxMemoryMB || 512,
      evictionThreshold: config.evictionThreshold || 0.8,
      evictionBatchSize: config.evictionBatchSize || 10,
      preloadHighPriority: config.preloadHighPriority ?? true,
      compressionThreshold: config.compressionThreshold || 1024,
      monitoringEnabled: config.monitoringEnabled ?? true,
      statsInterval: config.statsInterval || 30000,
      predictiveLoading: config.predictiveLoading ?? true,
      adaptiveEviction: config.adaptiveEviction ?? true,
      cacheWarming: config.cacheWarming ?? true,
      accessPatternLearning: config.accessPatternLearning ?? true,
      compressionStrategy: config.compressionStrategy || 'balanced',
      preloadThreshold: config.preloadThreshold || 7,
      evictionStrategy: config.evictionStrategy || 'hybrid',
      apiEndpoint: config.apiEndpoint || 'https://api.context7.com/v1',
      apiKey: config.apiKey || '',
      requestTimeout: config.requestTimeout || 30000,
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      batchSize: config.batchSize || 10,
      deduplicationEnabled: config.deduplicationEnabled ?? true,
      compressionEnabled: config.compressionEnabled ?? true,
      cacheStrategy: config.cacheStrategy || 'balanced',
      preloadRelated: config.preloadRelated ?? true,
      intelligentCaching: config.intelligentCaching ?? true,
      optimizationEnabled: config.optimizationEnabled ?? true,
      autoOptimization: config.autoOptimization ?? true,
      optimizationInterval: config.optimizationInterval || 300000, // 5 minutes
      performanceThresholds: {
        memoryUsage: config.performanceThresholds?.memoryUsage || 80,
        cacheHitRate: config.performanceThresholds?.cacheHitRate || 70,
        averageLatency: config.performanceThresholds?.averageLatency || 1000,
        errorRate: config.performanceThresholds?.errorRate || 5,
        ...config.performanceThresholds
      },
      optimizationStrategies: {
        memoryOptimization: config.optimizationStrategies?.memoryOptimization ?? true,
        cacheOptimization: config.optimizationStrategies?.cacheOptimization ?? true,
        queryOptimization: config.optimizationStrategies?.queryOptimization ?? true,
        compressionOptimization: config.optimizationStrategies?.compressionOptimization ?? true,
        preloadOptimization: config.optimizationStrategies?.preloadOptimization ?? true,
        ...config.optimizationStrategies
      },
      ...config
    };

    // Initialize Context7 integration
    this.context7Integration = new Context7Integration(
      this.db,
      this.fileManager,
      this.metadataAPI,
      this.config
    );

    // Setup event listeners
    this.setupEventListeners();

    this.metrics = this.initializeMetrics();

    // Start optimization if enabled
    if (this.config.optimizationEnabled && this.config.autoOptimization) {
      this.startOptimization();
    }

    console.log(`✅ Performance Optimizer initialized with ${this.config.optimizationInterval}ms interval`);
  }

  /**
   * Start automatic optimization
   */
  startOptimization(): void {
    if (this.optimizationTimer) {
      return; // Already running
    }

    this.optimizationTimer = setInterval(async () => {
      try {
        await this.runOptimization();
      } catch (error) {
        console.error('❌ Optimization failed:', error);
      }
    }, this.config.optimizationInterval);

    console.log('✅ Automatic optimization started');
  }

  /**
   * Stop automatic optimization
   */
  stopOptimization(): void {
    if (this.optimizationTimer) {
      clearInterval(this.optimizationTimer);
      this.optimizationTimer = null;
      console.log('✅ Automatic optimization stopped');
    }
  }

  /**
   * Run optimization cycle
   */
  async runOptimization(): Promise<void> {
    if (this.isOptimizing) {
      console.log('⚠️ Optimization already in progress');
      return;
    }

    this.isOptimizing = true;

    try {
      console.log('🔧 Starting performance optimization...');

      // Collect current metrics
      const currentMetrics = await this.collectMetrics();
      this.performanceHistory.push(currentMetrics);

      // Check performance thresholds
      const thresholdBreaches = this.checkThresholds(currentMetrics);

      if (thresholdBreaches.length > 0) {
        console.log(`⚠️ Performance thresholds breached: ${thresholdBreaches.join(', ')}`);

        this.emit('threshold_breach', {
          type: 'threshold_breach',
          timestamp: new Date(),
          details: { breaches: thresholdBreaches, metrics: currentMetrics }
        });
      }

      // Run optimization strategies
      const optimizationResults = await this.runOptimizationStrategies(currentMetrics);

      // Record optimization results
      this.optimizationHistory.push(...optimizationResults);

      // Check for performance improvements
      const improvement = this.calculateImprovement(currentMetrics);

      if (improvement > 0) {
        console.log(`✅ Performance improved by ${improvement.toFixed(1)}%`);

        this.emit('performance_improvement', {
          type: 'performance_improvement',
          timestamp: new Date(),
          details: { improvement, results: optimizationResults }
        });
      }

      console.log(`✅ Optimization completed: ${optimizationResults.length} strategies executed`);

    } catch (error) {
      console.error('❌ Optimization failed:', error);
    } finally {
      this.isOptimizing = false;
    }
  }

  /**
   * Collect performance metrics
   */
  async collectMetrics(): Promise<PerformanceMetrics> {
    try {
      // Get Context7 metrics
      const context7Metrics = await this.context7Integration.getMetrics();

      // Get cache metrics
      const cacheMetrics = await this.context7Integration.getMetrics();

      // Get database stats
      const dbStats = await this.db.getStats();

      // Get file system stats
      const fileStats = await this.fileManager.getStorageStats();

      const metrics: PerformanceMetrics = {
        memory: {
          usage: this.calculateMemoryUsage(),
          efficiency: this.calculateMemoryEfficiency(),
          fragmentation: this.calculateMemoryFragmentation()
        },
        cache: {
          hitRate: context7Metrics.cacheHits / Math.max(context7Metrics.totalRequests, 1) * 100,
          missRate: context7Metrics.cacheMisses / Math.max(context7Metrics.totalRequests, 1) * 100,
          evictionRate: this.calculateEvictionRate(),
          averageSize: this.calculateAverageCacheSize()
        },
        database: {
          queryTime: this.calculateAverageQueryTime(),
          connectionPool: 1, // SQLite single connection
          indexEfficiency: this.calculateIndexEfficiency()
        },
        fileSystem: {
          readTime: 0, // fileStats.averageReadTime || 0,
          writeTime: 0, // fileStats.averageWriteTime || 0,
          compressionRatio: 1 // fileStats.compressionRatio || 1
        },
        overall: {
          throughput: this.calculateThroughput(context7Metrics),
          latency: context7Metrics.averageLatency,
          errorRate: context7Metrics.errorRate * 100,
          costEfficiency: this.calculateCostEfficiency(context7Metrics)
        }
      };

      return metrics;

    } catch (error) {
      console.error('❌ Failed to collect metrics:', error);
      return this.metrics;
    }
  }

  /**
   * Check performance thresholds
   */
  private checkThresholds(metrics: PerformanceMetrics): string[] {
    const breaches: string[] = [];

    if (metrics.memory.usage > this.config.performanceThresholds.memoryUsage) {
      breaches.push('memory_usage');
    }

    if (metrics.cache.hitRate < this.config.performanceThresholds.cacheHitRate) {
      breaches.push('cache_hit_rate');
    }

    if (metrics.overall.latency > this.config.performanceThresholds.averageLatency) {
      breaches.push('average_latency');
    }

    if (metrics.overall.errorRate > this.config.performanceThresholds.errorRate) {
      breaches.push('error_rate');
    }

    return breaches;
  }

  /**
   * Run optimization strategies
   */
  private async runOptimizationStrategies(metrics: PerformanceMetrics): Promise<OptimizationResult[]> {
    const results: OptimizationResult[] = [];

    // Memory optimization
    if (this.config.optimizationStrategies.memoryOptimization) {
      const result = await this.optimizeMemory(metrics);
      if (result) results.push(result);
    }

    // Cache optimization
    if (this.config.optimizationStrategies.cacheOptimization) {
      const result = await this.optimizeCache(metrics);
      if (result) results.push(result);
    }

    // Query optimization
    if (this.config.optimizationStrategies.queryOptimization) {
      const result = await this.optimizeQueries(metrics);
      if (result) results.push(result);
    }

    // Compression optimization
    if (this.config.optimizationStrategies.compressionOptimization) {
      const result = await this.optimizeCompression(metrics);
      if (result) results.push(result);
    }

    // Preload optimization
    if (this.config.optimizationStrategies.preloadOptimization) {
      const result = await this.optimizePreloading(metrics);
      if (result) results.push(result);
    }

    return results;
  }

  /**
   * Optimize memory usage
   */
  private async optimizeMemory(metrics: PerformanceMetrics): Promise<OptimizationResult | null> {
    try {
      if (metrics.memory.usage < 70) {
        return null; // No optimization needed
      }

      console.log('🔧 Optimizing memory usage...');

      // Trigger cache warming for high priority artifacts
      await this.context7Integration.warmCache();

      // Calculate improvement
      const newMetrics = await this.collectMetrics();
      const improvement = metrics.memory.usage - newMetrics.memory.usage;

      return {
        strategy: 'memory_optimization',
        success: improvement > 0,
        improvement,
        details: {
          oldUsage: metrics.memory.usage,
          newUsage: newMetrics.memory.usage,
          actions: ['cache_warming', 'memory_cleanup']
        },
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Memory optimization failed:', error);
      return null;
    }
  }

  /**
   * Optimize cache performance
   */
  private async optimizeCache(metrics: PerformanceMetrics): Promise<OptimizationResult | null> {
    try {
      if (metrics.cache.hitRate > 80) {
        return null; // No optimization needed
      }

      console.log('🔧 Optimizing cache performance...');

      // Adjust cache strategy based on hit rate
      if (metrics.cache.hitRate < 60) {
        // Switch to more aggressive caching
        this.config.cacheStrategy = 'aggressive';
      } else if (metrics.cache.hitRate > 90) {
        // Switch to more conservative caching
        this.config.cacheStrategy = 'conservative';
      }

      // Calculate improvement
      const newMetrics = await this.collectMetrics();
      const improvement = newMetrics.cache.hitRate - metrics.cache.hitRate;

      return {
        strategy: 'cache_optimization',
        success: improvement > 0,
        improvement,
        details: {
          oldHitRate: metrics.cache.hitRate,
          newHitRate: newMetrics.cache.hitRate,
          newStrategy: this.config.cacheStrategy
        },
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Cache optimization failed:', error);
      return null;
    }
  }

  /**
   * Optimize database queries
   */
  private async optimizeQueries(metrics: PerformanceMetrics): Promise<OptimizationResult | null> {
    try {
      if (metrics.database.queryTime < 100) {
        return null; // No optimization needed
      }

      console.log('🔧 Optimizing database queries...');

      // Analyze and optimize slow queries
      const slowQueries = await this.analyzeSlowQueries();

      if (slowQueries.length > 0) {
        await this.optimizeSlowQueries(slowQueries);
      }

      // Calculate improvement
      const newMetrics = await this.collectMetrics();
      const improvement = metrics.database.queryTime - newMetrics.database.queryTime;

      return {
        strategy: 'query_optimization',
        success: improvement > 0,
        improvement,
        details: {
          oldQueryTime: metrics.database.queryTime,
          newQueryTime: newMetrics.database.queryTime,
          optimizedQueries: slowQueries.length
        },
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Query optimization failed:', error);
      return null;
    }
  }

  /**
   * Optimize compression
   */
  private async optimizeCompression(metrics: PerformanceMetrics): Promise<OptimizationResult | null> {
    try {
      if (metrics.fileSystem.compressionRatio > 0.7) {
        return null; // No optimization needed
      }

      console.log('🔧 Optimizing compression...');

      // Adjust compression strategy
      if (metrics.fileSystem.compressionRatio < 0.5) {
        this.config.compressionStrategy = 'aggressive';
      } else if (metrics.fileSystem.compressionRatio > 0.8) {
        this.config.compressionStrategy = 'conservative';
      }

      // Calculate improvement
      const newMetrics = await this.collectMetrics();
      const improvement = newMetrics.fileSystem.compressionRatio - metrics.fileSystem.compressionRatio;

      return {
        strategy: 'compression_optimization',
        success: improvement > 0,
        improvement,
        details: {
          oldRatio: metrics.fileSystem.compressionRatio,
          newRatio: newMetrics.fileSystem.compressionRatio,
          newStrategy: this.config.compressionStrategy
        },
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Compression optimization failed:', error);
      return null;
    }
  }

  /**
   * Optimize preloading
   */
  private async optimizePreloading(metrics: PerformanceMetrics): Promise<OptimizationResult | null> {
    try {
      if (metrics.cache.hitRate > 85) {
        return null; // No optimization needed
      }

      console.log('🔧 Optimizing preloading...');

      // Adjust preload threshold based on cache performance
      if (metrics.cache.hitRate < 70) {
        this.config.preloadThreshold = Math.max(5, this.config.preloadThreshold - 1);
      } else if (metrics.cache.hitRate > 90) {
        this.config.preloadThreshold = Math.min(9, this.config.preloadThreshold + 1);
      }

      // Calculate improvement
      const newMetrics = await this.collectMetrics();
      const improvement = newMetrics.cache.hitRate - metrics.cache.hitRate;

      return {
        strategy: 'preload_optimization',
        success: improvement > 0,
        improvement,
        details: {
          oldHitRate: metrics.cache.hitRate,
          newHitRate: newMetrics.cache.hitRate,
          newThreshold: this.config.preloadThreshold
        },
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Preload optimization failed:', error);
      return null;
    }
  }

  /**
   * Calculate performance improvement
   */
  private calculateImprovement(currentMetrics: PerformanceMetrics): number {
    if (this.performanceHistory.length < 2) {
      return 0;
    }

    const previousMetrics = this.performanceHistory[this.performanceHistory.length - 2];

    // Calculate overall improvement
    const memoryImprovement = currentMetrics.memory.usage - previousMetrics.memory.usage;
    const cacheImprovement = currentMetrics.cache.hitRate - previousMetrics.cache.hitRate;
    const latencyImprovement = previousMetrics.overall.latency - currentMetrics.overall.latency;

    // Weighted average
    const improvement = (memoryImprovement * 0.3) + (cacheImprovement * 0.4) + (latencyImprovement * 0.3);

    return improvement;
  }

  /**
   * Calculate memory usage percentage
   */
  private calculateMemoryUsage(): number {
    // This would need to be implemented with actual memory monitoring
    return 75; // Placeholder
  }

  /**
   * Calculate memory efficiency
   */
  private calculateMemoryEfficiency(): number {
    // This would need to be implemented with actual memory monitoring
    return 0.85; // Placeholder
  }

  /**
   * Calculate memory fragmentation
   */
  private calculateMemoryFragmentation(): number {
    // This would need to be implemented with actual memory monitoring
    return 0.15; // Placeholder
  }

  /**
   * Calculate eviction rate
   */
  private calculateEvictionRate(): number {
    // This would need to be implemented with actual eviction tracking
    return 0.05; // Placeholder
  }

  /**
   * Calculate average cache size
   */
  private calculateAverageCacheSize(): number {
    // This would need to be implemented with actual cache monitoring
    return 1024; // Placeholder
  }

  /**
   * Calculate average query time
   */
  private calculateAverageQueryTime(): number {
    // This would need to be implemented with actual query monitoring
    return 50; // Placeholder
  }

  /**
   * Calculate index efficiency
   */
  private calculateIndexEfficiency(): number {
    // This would need to be implemented with actual index monitoring
    return 0.95; // Placeholder
  }

  /**
   * Calculate throughput
   */
  private calculateThroughput(context7Metrics: any): number {
    return context7Metrics.totalRequests / Math.max(context7Metrics.averageLatency / 1000, 1);
  }

  /**
   * Calculate cost efficiency
   */
  private calculateCostEfficiency(context7Metrics: any): number {
    return context7Metrics.costSavings / Math.max(context7Metrics.totalRequests, 1);
  }

  /**
   * Analyze slow queries
   */
  private async analyzeSlowQueries(): Promise<string[]> {
    // This would need to be implemented with actual query analysis
    return []; // Placeholder
  }

  /**
   * Optimize slow queries
   */
  private async optimizeSlowQueries(queries: string[]): Promise<void> {
    // This would need to be implemented with actual query optimization
    console.log(`🔧 Optimizing ${queries.length} slow queries...`);
  }

  /**
   * Initialize metrics
   */
  private initializeMetrics(): PerformanceMetrics {
    return {
      memory: {
        usage: 0,
        efficiency: 0,
        fragmentation: 0
      },
      cache: {
        hitRate: 0,
        missRate: 0,
        evictionRate: 0,
        averageSize: 0
      },
      database: {
        queryTime: 0,
        connectionPool: 0,
        indexEfficiency: 0
      },
      fileSystem: {
        readTime: 0,
        writeTime: 0,
        compressionRatio: 1
      },
      overall: {
        throughput: 0,
        latency: 0,
        errorRate: 0,
        costEfficiency: 0
      }
    };
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    this.context7Integration.on('cache_hit', (event) => {
      this.emit('cache_hit', event);
    });

    this.context7Integration.on('cache_miss', (event) => {
      this.emit('cache_miss', event);
    });

    this.context7Integration.on('error', (event) => {
      this.emit('error', event);
    });
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    return await this.collectMetrics();
  }

  /**
   * Get optimization history
   */
  getOptimizationHistory(): OptimizationResult[] {
    return [...this.optimizationHistory];
  }

  /**
   * Get performance history
   */
  getPerformanceHistory(): PerformanceMetrics[] {
    return [...this.performanceHistory];
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const context7Health = await this.context7Integration.healthCheck();
      const metrics = await this.collectMetrics();

      const status = context7Health.status === 'healthy' ? 'healthy' : context7Health.status;

      return {
        status,
        details: {
          context7: context7Health.details,
          metrics,
          config: this.config,
          isOptimizing: this.isOptimizing,
          optimizationHistory: this.optimizationHistory.slice(-10) // Last 10 optimizations
        }
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Cleanup
   */
  async cleanup(): Promise<void> {
    this.stopOptimization();
    await this.context7Integration.cleanup();
    this.removeAllListeners();
    console.log('✅ Performance Optimizer cleaned up');
  }
}

// Export factory function
export function createPerformanceOptimizer(
  database: SQLiteDatabase,
  fileManager: FileManager,
  metadataAPI: ArtifactMetadataAPI,
  config?: Partial<PerformanceConfig>
): PerformanceOptimizer {
  return new PerformanceOptimizer(database, fileManager, metadataAPI, config);
}
