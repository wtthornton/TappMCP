#!/usr/bin/env node

/**
 * Smart Cache Implementation for TappMCP Hybrid Architecture
 *
 * Intelligent caching system that combines memory management with
 * predictive loading and adaptive eviction strategies.
 */

import { MemoryManager, MemoryConfig } from './memory-manager.js';
import { SQLiteDatabase } from './sqlite-database.js';
import { FileManager } from './file-manager.js';
import { ArtifactMetadataAPI } from './artifact-metadata.js';
import { EventEmitter } from 'events';

export interface SmartCacheConfig extends MemoryConfig {
  predictiveLoading: boolean;
  adaptiveEviction: boolean;
  cacheWarming: boolean;
  accessPatternLearning: boolean;
  compressionStrategy: 'aggressive' | 'balanced' | 'conservative';
  preloadThreshold: number; // Priority threshold for preloading
  evictionStrategy: 'lru' | 'lfu' | 'adaptive' | 'hybrid';
}

export interface CacheMetrics {
  hitRate: number;
  missRate: number;
  evictionRate: number;
  preloadSuccessRate: number;
  averageLoadTime: number;
  memoryEfficiency: number;
  compressionRatio: number;
  accessPatterns: {
    mostAccessed: string[];
    recentlyAccessed: string[];
    rarelyAccessed: string[];
  };
}

export interface PredictiveModel {
  artifactId: string;
  probability: number;
  confidence: number;
  factors: {
    accessFrequency: number;
    timePattern: number;
    priority: number;
    size: number;
  };
}

export interface CacheEvent {
  type: 'hit' | 'miss' | 'evict' | 'preload' | 'warm' | 'compress' | 'decompress';
  artifactId: string;
  timestamp: Date;
  details: any;
}

export class SmartCache extends EventEmitter {
  private config: SmartCacheConfig;
  private memoryManager: MemoryManager;
  private db: SQLiteDatabase;
  private fileManager: FileManager;
  private metadataAPI: ArtifactMetadataAPI;

  private metrics: CacheMetrics;
  private accessHistory = new Map<string, Date[]>();
  private predictiveModel = new Map<string, PredictiveModel>();
  private isWarming = false;
  private warmingProgress = 0;

  constructor(
    database: SQLiteDatabase,
    fileManager: FileManager,
    metadataAPI: ArtifactMetadataAPI,
    config: Partial<SmartCacheConfig> = {}
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
      ...config
    };

    // Initialize memory manager
    this.memoryManager = new MemoryManager(
      this.db,
      this.fileManager,
      this.metadataAPI,
      this.config
    );

    // Setup event listeners
    this.setupEventListeners();

    this.metrics = this.initializeMetrics();

    console.log(`✅ Smart Cache initialized with ${this.config.evictionStrategy} eviction strategy`);
  }

  /**
   * Get artifact with smart caching
   */
  async get(artifactId: string, options: {
    forceReload?: boolean;
    preloadRelated?: boolean;
    trackAccess?: boolean;
  } = {}): Promise<any> {
    const startTime = Date.now();
    const trackAccess = options.trackAccess !== false;

    try {
      // Track access pattern
      if (trackAccess) {
        this.recordAccess(artifactId);
      }

      // Try to get from memory first
      if (!options.forceReload) {
        const cachedData = await this.memoryManager.loadArtifact(artifactId);
        if (cachedData) {
          this.recordCacheHit(artifactId, Date.now() - startTime);

          // Preload related artifacts if requested
          if (options.preloadRelated) {
            this.preloadRelatedArtifacts(artifactId).catch(error =>
              console.warn(`⚠️ Failed to preload related artifacts:`, error)
            );
          }

          return cachedData;
        }
      }

      // Cache miss - load from hybrid system
      this.recordCacheMiss(artifactId, Date.now() - startTime);

      const data = await this.metadataAPI.getArtifactData(artifactId);
      if (!data) {
        throw new Error(`Artifact ${artifactId} not found`);
      }

      // Load into memory
      await this.memoryManager.loadArtifact(artifactId);

      // Preload related artifacts
      if (options.preloadRelated) {
        this.preloadRelatedArtifacts(artifactId).catch(error =>
          console.warn(`⚠️ Failed to preload related artifacts:`, error)
        );
      }

      return data;

    } catch (error) {
      console.error(`❌ Failed to get artifact ${artifactId}:`, error);
      throw error;
    }
  }

  /**
   * Set artifact with smart caching
   */
  async set(artifactId: string, data: any, options: {
    priority?: number;
    compress?: boolean;
    preloadRelated?: boolean;
  } = {}): Promise<void> {
    try {
      // Store in hybrid system
      await this.metadataAPI.createArtifact({
        id: artifactId,
        type: 'cache',
        category: 'cache',
        title: `Cached: ${artifactId}`,
        data,
        priority: options.priority || 5,
        compress: options.compress !== false
      });

      // Load into memory
      await this.memoryManager.loadArtifact(artifactId, options.priority);

      // Update predictive model
      if (this.config.accessPatternLearning) {
        this.updatePredictiveModel(artifactId, data);
      }

      // Preload related artifacts
      if (options.preloadRelated) {
        this.preloadRelatedArtifacts(artifactId).catch(error =>
          console.warn(`⚠️ Failed to preload related artifacts:`, error)
        );
      }

      this.emit('set', {
        type: 'set',
        artifactId,
        timestamp: new Date(),
        details: { priority: options.priority, size: this.calculateDataSize(data) }
      });

    } catch (error) {
      console.error(`❌ Failed to set artifact ${artifactId}:`, error);
      throw error;
    }
  }

  /**
   * Delete artifact from cache
   */
  async delete(artifactId: string): Promise<boolean> {
    try {
      // Remove from memory
      await this.memoryManager.unloadArtifact(artifactId, false);

      // Remove from hybrid system
      const success = await this.metadataAPI.deleteArtifact(artifactId);

      // Remove from access history
      this.accessHistory.delete(artifactId);
      this.predictiveModel.delete(artifactId);

      this.emit('delete', {
        type: 'delete',
        artifactId,
        timestamp: new Date(),
        details: { success }
      });

      return success;

    } catch (error) {
      console.error(`❌ Failed to delete artifact ${artifactId}:`, error);
      return false;
    }
  }

  /**
   * Warm cache with predictive loading
   */
  async warmCache(): Promise<void> {
    if (this.isWarming) {
      console.log('⚠️ Cache warming already in progress');
      return;
    }

    this.isWarming = true;
    this.warmingProgress = 0;

    try {
      console.log('🔥 Starting cache warming...');

      // Get all artifacts for analysis
      const allArtifacts = await this.db.searchArtifacts({ limit: 1000 });

      // Build predictive model
      if (this.config.predictiveLoading) {
        await this.buildPredictiveModel(allArtifacts);
      }

      // Get high priority artifacts
      const highPriorityArtifacts = allArtifacts
        .filter(artifact => artifact.priority >= this.config.preloadThreshold)
        .sort((a, b) => b.priority - a.priority);

      // Preload high priority artifacts
      const preloadPromises = highPriorityArtifacts.map(async (artifact, index) => {
        try {
          await this.memoryManager.loadArtifact(artifact.id, artifact.priority);
          this.warmingProgress = ((index + 1) / highPriorityArtifacts.length) * 100;

          this.emit('warm', {
            type: 'warm',
            artifactId: artifact.id,
            timestamp: new Date(),
            details: {
              priority: artifact.priority,
              progress: this.warmingProgress
            }
          });

        } catch (error) {
          console.warn(`⚠️ Failed to preload ${artifact.id}:`, error);
        }
      });

      await Promise.allSettled(preloadPromises);

      console.log(`✅ Cache warming completed: ${highPriorityArtifacts.length} artifacts preloaded`);
      this.warmingProgress = 100;

    } catch (error) {
      console.error('❌ Cache warming failed:', error);
    } finally {
      this.isWarming = false;
    }
  }

  /**
   * Preload related artifacts
   */
  private async preloadRelatedArtifacts(artifactId: string): Promise<void> {
    try {
      // Get related artifacts based on tags, type, or category
      const artifact = await this.db.getArtifact(artifactId);
      if (!artifact) return;

      // Find related artifacts
      const relatedArtifacts = await this.db.searchArtifacts({
        type: artifact.type,
        category: artifact.category,
        tags: artifact.tags.slice(0, 2), // Use first 2 tags
        limit: 5
      });

      // Preload related artifacts
      const preloadPromises = relatedArtifacts
        .filter(related => related.id !== artifactId)
        .map(async (related) => {
          try {
            await this.memoryManager.loadArtifact(related.id, related.priority);
          } catch (error) {
            // Ignore preload errors
          }
        });

      await Promise.allSettled(preloadPromises);

    } catch (error) {
      console.warn(`⚠️ Failed to preload related artifacts for ${artifactId}:`, error);
    }
  }

  /**
   * Build predictive model for access patterns
   */
  private async buildPredictiveModel(artifacts: any[]): Promise<void> {
    console.log('🧠 Building predictive model...');

    for (const artifact of artifacts) {
      try {
        const accessHistory = this.accessHistory.get(artifact.id) || [];
        const accessFrequency = accessHistory.length;

        // Calculate time pattern (accesses during certain hours)
        const timePattern = this.calculateTimePattern(accessHistory);

        // Calculate probability based on multiple factors
        const probability = this.calculateAccessProbability({
          accessFrequency,
          timePattern,
          priority: artifact.priority,
          size: artifact.fileSize
        });

        const confidence = this.calculateConfidence(accessHistory);

        this.predictiveModel.set(artifact.id, {
          artifactId: artifact.id,
          probability,
          confidence,
          factors: {
            accessFrequency,
            timePattern,
            priority: artifact.priority,
            size: artifact.fileSize
          }
        });

      } catch (error) {
        console.warn(`⚠️ Failed to build predictive model for ${artifact.id}:`, error);
      }
    }

    console.log(`✅ Predictive model built for ${this.predictiveModel.size} artifacts`);
  }

  /**
   * Update predictive model for an artifact
   */
  private updatePredictiveModel(artifactId: string, data: any): void {
    const accessHistory = this.accessHistory.get(artifactId) || [];
    const accessFrequency = accessHistory.length;
    const timePattern = this.calculateTimePattern(accessHistory);
    const dataSize = this.calculateDataSize(data);

    const probability = this.calculateAccessProbability({
      accessFrequency,
      timePattern,
      priority: 5, // Default priority
      size: dataSize
    });

    const confidence = this.calculateConfidence(accessHistory);

    this.predictiveModel.set(artifactId, {
      artifactId,
      probability,
      confidence,
      factors: {
        accessFrequency,
        timePattern,
        priority: 5,
        size: dataSize
      }
    });
  }

  /**
   * Calculate access probability
   */
  private calculateAccessProbability(factors: {
    accessFrequency: number;
    timePattern: number;
    priority: number;
    size: number;
  }): number {
    let probability = 0;

    // Access frequency factor (0-0.4)
    probability += Math.min(factors.accessFrequency * 0.1, 0.4);

    // Time pattern factor (0-0.2)
    probability += factors.timePattern * 0.2;

    // Priority factor (0-0.3)
    probability += (factors.priority / 10) * 0.3;

    // Size factor (0-0.1, inverse relationship)
    probability += Math.max(0, (1 - factors.size / (1024 * 1024)) * 0.1);

    return Math.min(1, Math.max(0, probability));
  }

  /**
   * Calculate confidence in prediction
   */
  private calculateConfidence(accessHistory: Date[]): number {
    if (accessHistory.length === 0) return 0;

    // More data points = higher confidence
    const dataPoints = Math.min(accessHistory.length / 10, 1);

    // Recent data = higher confidence
    const now = Date.now();
    const recentAccesses = accessHistory.filter(date =>
      now - date.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
    ).length;
    const recency = recentAccesses / Math.max(accessHistory.length, 1);

    return (dataPoints + recency) / 2;
  }

  /**
   * Calculate time pattern
   */
  private calculateTimePattern(accessHistory: Date[]): number {
    if (accessHistory.length === 0) return 0;

    // Analyze access patterns by hour
    const hourCounts = new Array(24).fill(0);
    accessHistory.forEach(date => {
      hourCounts[date.getHours()]++;
    });

    // Calculate pattern strength (0-1)
    const maxHour = Math.max(...hourCounts);
    const totalAccesses = accessHistory.length;

    return maxHour / Math.max(totalAccesses, 1);
  }

  /**
   * Record cache hit
   */
  private recordCacheHit(artifactId: string, loadTime: number): void {
    this.metrics.hitRate = (this.metrics.hitRate * 0.9) + (1 * 0.1);
    this.metrics.averageLoadTime = (this.metrics.averageLoadTime * 0.9) + (loadTime * 0.1);

    this.emit('hit', {
      type: 'hit',
      artifactId,
      timestamp: new Date(),
      details: { loadTime }
    });
  }

  /**
   * Record cache miss
   */
  private recordCacheMiss(artifactId: string, loadTime: number): void {
    this.metrics.missRate = (this.metrics.missRate * 0.9) + (1 * 0.1);
    this.metrics.averageLoadTime = (this.metrics.averageLoadTime * 0.9) + (loadTime * 0.1);

    this.emit('miss', {
      type: 'miss',
      artifactId,
      timestamp: new Date(),
      details: { loadTime }
    });
  }

  /**
   * Record access pattern
   */
  private recordAccess(artifactId: string): void {
    const now = new Date();
    const history = this.accessHistory.get(artifactId) || [];

    // Keep only last 100 accesses
    history.push(now);
    if (history.length > 100) {
      history.shift();
    }

    this.accessHistory.set(artifactId, history);
  }

  /**
   * Calculate data size
   */
  private calculateDataSize(data: any): number {
    try {
      return JSON.stringify(data).length;
    } catch (error) {
      return 1024; // Fallback
    }
  }

  /**
   * Get cache metrics
   */
  async getMetrics(): Promise<CacheMetrics> {
    try {
      const memoryStats = await this.memoryManager.getMemoryStats();

      // Update metrics
      this.metrics.memoryEfficiency = memoryStats.usagePercentage / 100;
      this.metrics.evictionRate = memoryStats.evictionCount / Math.max(memoryStats.artifactsInMemory, 1);

      // Get access patterns
      const accessPatterns = this.getAccessPatterns();
      this.metrics.accessPatterns = accessPatterns;

      return this.metrics;

    } catch (error) {
      console.error('❌ Failed to get cache metrics:', error);
      return this.metrics;
    }
  }

  /**
   * Get access patterns
   */
  private getAccessPatterns(): {
    mostAccessed: string[];
    recentlyAccessed: string[];
    rarelyAccessed: string[];
  } {
    const mostAccessed = Array.from(this.accessHistory.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 10)
      .map(([id]) => id);

    const recentlyAccessed = Array.from(this.accessHistory.entries())
      .filter(([, history]) => {
        const lastAccess = history[history.length - 1];
        return lastAccess && Date.now() - lastAccess.getTime() < 60 * 60 * 1000; // Last hour
      })
      .map(([id]) => id);

    const rarelyAccessed = Array.from(this.accessHistory.entries())
      .filter(([, history]) => history.length < 3)
      .map(([id]) => id);

    return {
      mostAccessed,
      recentlyAccessed,
      rarelyAccessed
    };
  }

  /**
   * Initialize metrics
   */
  private initializeMetrics(): CacheMetrics {
    return {
      hitRate: 0,
      missRate: 0,
      evictionRate: 0,
      preloadSuccessRate: 0,
      averageLoadTime: 0,
      memoryEfficiency: 0,
      compressionRatio: 0,
      accessPatterns: {
        mostAccessed: [],
        recentlyAccessed: [],
        rarelyAccessed: []
      }
    };
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    this.memoryManager.on('evict', (event) => {
      this.emit('evict', event);
    });

    this.memoryManager.on('load', (event) => {
      this.emit('load', event);
    });

    this.memoryManager.on('unload', (event) => {
      this.emit('unload', event);
    });

    this.memoryManager.on('stats', (event) => {
      this.emit('stats', event);
    });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const memoryHealth = await this.memoryManager.healthCheck();
      const metrics = await this.getMetrics();

      const status = memoryHealth.status === 'healthy' ? 'healthy' : memoryHealth.status;

      return {
        status,
        details: {
          memory: memoryHealth.details,
          metrics,
          config: this.config,
          isWarming: this.isWarming,
          warmingProgress: this.warmingProgress
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
    await this.memoryManager.cleanup();
    this.removeAllListeners();
    console.log('✅ Smart Cache cleaned up');
  }
}

// Export factory function
export function createSmartCache(
  database: SQLiteDatabase,
  fileManager: FileManager,
  metadataAPI: ArtifactMetadataAPI,
  config?: Partial<SmartCacheConfig>
): SmartCache {
  return new SmartCache(database, fileManager, metadataAPI, config);
}
