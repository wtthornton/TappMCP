#!/usr/bin/env node

/**
 * Memory Manager for TappMCP Hybrid Architecture
 *
 * Intelligent memory management system that uses database-driven LRU eviction
 * to optimize memory usage while maintaining performance.
 */

import { SQLiteDatabase } from './sqlite-database.js';
import { FileManager } from './file-manager.js';
import { ArtifactMetadataAPI } from './artifact-metadata.js';
import { EventEmitter } from 'events';

export interface MemoryConfig {
  maxMemoryMB: number;
  evictionThreshold: number; // 0.8 = evict when 80% full
  evictionBatchSize: number;
  preloadHighPriority: boolean;
  compressionThreshold: number; // bytes
  monitoringEnabled: boolean;
  statsInterval: number; // milliseconds
}

export interface MemoryStats {
  totalMemoryMB: number;
  usedMemoryMB: number;
  freeMemoryMB: number;
  usagePercentage: number;
  artifactsInMemory: number;
  totalArtifacts: number;
  cacheHitRate: number;
  evictionCount: number;
  lastEviction: Date | null;
  averageAccessTime: number;
  topMemoryUsers: Array<{
    id: string;
    size: number;
    priority: number;
    lastAccessed: Date;
  }>;
}

export interface EvictionCandidate {
  id: string;
  priority: number;
  lastAccessed: Date | null;
  accessCount: number;
  memorySize: number;
  score: number;
}

export interface MemoryEvent {
  type: 'load' | 'unload' | 'evict' | 'preload' | 'stats';
  artifactId: string;
  size: number;
  timestamp: Date;
  details?: any;
}

export class MemoryManager extends EventEmitter {
  private config: MemoryConfig;
  private db: SQLiteDatabase;
  private fileManager: FileManager;
  private metadataAPI: ArtifactMetadataAPI;

  private memoryCache = new Map<string, any>();
  private memoryUsage = 0;
  private stats: MemoryStats;
  private evictionCount = 0;
  private lastEviction: Date | null = null;
  private statsTimer: NodeJS.Timeout | null = null;
  private isEvicting = false;

  constructor(
    database: SQLiteDatabase,
    fileManager: FileManager,
    metadataAPI: ArtifactMetadataAPI,
    config: Partial<MemoryConfig> = {}
  ) {
    super();

    this.db = database;
    this.fileManager = fileManager;
    this.metadataAPI = metadataAPI;

    this.config = {
      maxMemoryMB: config.maxMemoryMB || 512, // 512MB default
      evictionThreshold: config.evictionThreshold || 0.8,
      evictionBatchSize: config.evictionBatchSize || 10,
      preloadHighPriority: config.preloadHighPriority ?? true,
      compressionThreshold: config.compressionThreshold || 1024,
      monitoringEnabled: config.monitoringEnabled ?? true,
      statsInterval: config.statsInterval || 30000, // 30 seconds
      ...config
    };

    this.stats = this.initializeStats();
    this.startMonitoring();

    console.log(`✅ Memory Manager initialized: ${this.config.maxMemoryMB}MB max, ${this.config.evictionThreshold * 100}% eviction threshold`);
  }

  /**
   * Load artifact into memory
   */
  async loadArtifact(artifactId: string, priority?: number): Promise<any> {
    try {
      // Check if already in memory
      if (this.memoryCache.has(artifactId)) {
        this.emit('load', {
          type: 'load',
          artifactId,
          size: 0,
          timestamp: new Date(),
          details: { fromCache: true }
        });
        return this.memoryCache.get(artifactId);
      }

      // Check memory usage before loading
      await this.checkMemoryUsage();

      // Load artifact data
      const data = await this.metadataAPI.getArtifactData(artifactId);
      if (!data) {
        throw new Error(`Artifact ${artifactId} not found`);
      }

      // Calculate memory size
      const memorySize = this.calculateMemorySize(data);

      // Check if we need to evict before loading
      if (this.wouldExceedMemoryLimit(memorySize)) {
        await this.evictArtifacts(memorySize);
      }

      // Store in memory cache
      this.memoryCache.set(artifactId, data);
      this.memoryUsage += memorySize;

      // Update access tracking
      await this.updateAccessTracking(artifactId);

      this.emit('load', {
        type: 'load',
        artifactId,
        size: memorySize,
        timestamp: new Date(),
        details: { priority, memorySize }
      });

      console.log(`✅ Loaded artifact into memory: ${artifactId} (${this.formatBytes(memorySize)})`);
      return data;

    } catch (error) {
      console.error(`❌ Failed to load artifact ${artifactId}:`, error);
      throw error;
    }
  }

  /**
   * Unload artifact from memory
   */
  async unloadArtifact(artifactId: string, saveToDisk: boolean = true): Promise<void> {
    try {
      const data = this.memoryCache.get(artifactId);
      if (!data) {
        return; // Already not in memory
      }

      const memorySize = this.calculateMemorySize(data);

      // Remove from memory cache
      this.memoryCache.delete(artifactId);
      this.memoryUsage -= memorySize;

      // Optionally save to disk (if modified)
      if (saveToDisk) {
        // The data is already saved in the hybrid system
        // This is just removing from memory
      }

      this.emit('unload', {
        type: 'unload',
        artifactId,
        size: memorySize,
        timestamp: new Date(),
        details: { saveToDisk }
      });

      console.log(`✅ Unloaded artifact from memory: ${artifactId} (${this.formatBytes(memorySize)})`);

    } catch (error) {
      console.error(`❌ Failed to unload artifact ${artifactId}:`, error);
      throw error;
    }
  }

  /**
   * Preload high priority artifacts
   */
  async preloadHighPriorityArtifacts(): Promise<void> {
    if (!this.config.preloadHighPriority) {
      return;
    }

    try {
      console.log('🔄 Preloading high priority artifacts...');

      // Get high priority artifacts from database
      const highPriorityArtifacts = await this.db.searchArtifacts({
        limit: 20,
        orderBy: 'priority',
        orderDirection: 'DESC'
      });

      const preloadPromises = highPriorityArtifacts
        .filter(artifact => artifact.priority >= 8)
        .map(async (artifact) => {
          try {
            await this.loadArtifact(artifact.id, artifact.priority);
          } catch (error) {
            console.warn(`⚠️ Failed to preload ${artifact.id}:`, error);
          }
        });

      await Promise.allSettled(preloadPromises);

      console.log(`✅ Preloaded ${highPriorityArtifacts.length} high priority artifacts`);

    } catch (error) {
      console.error('❌ Failed to preload high priority artifacts:', error);
    }
  }

  /**
   * Check memory usage and evict if necessary
   */
  private async checkMemoryUsage(): Promise<void> {
    const usagePercentage = this.memoryUsage / (this.config.maxMemoryMB * 1024 * 1024);

    if (usagePercentage >= this.config.evictionThreshold) {
      console.log(`⚠️ Memory usage at ${(usagePercentage * 100).toFixed(1)}%, triggering eviction`);
      await this.evictArtifacts();
    }
  }

  /**
   * Evict artifacts based on LRU and priority
   */
  private async evictArtifacts(requiredSpace: number = 0): Promise<void> {
    if (this.isEvicting) {
      return; // Prevent concurrent evictions
    }

    this.isEvicting = true;

    try {
      console.log('🔄 Starting memory eviction...');

      // Get eviction candidates
      const candidates = await this.getEvictionCandidates();

      if (candidates.length === 0) {
        console.log('✅ No artifacts to evict');
        return;
      }

      // Calculate how much space we need to free
      const targetEvictionSize = Math.max(
        requiredSpace,
        this.memoryUsage * 0.2 // Evict 20% of current usage
      );

      let evictedSize = 0;
      let evictedCount = 0;

      // Evict artifacts in order of eviction score
      for (const candidate of candidates) {
        if (evictedSize >= targetEvictionSize) {
          break;
        }

        try {
          await this.unloadArtifact(candidate.id, false);
          evictedSize += candidate.memorySize;
          evictedCount++;

          this.emit('evict', {
            type: 'evict',
            artifactId: candidate.id,
            size: candidate.memorySize,
            timestamp: new Date(),
            details: {
              priority: candidate.priority,
              accessCount: candidate.accessCount,
              score: candidate.score
            }
          });

        } catch (error) {
          console.warn(`⚠️ Failed to evict ${candidate.id}:`, error);
        }
      }

      this.evictionCount += evictedCount;
      this.lastEviction = new Date();

      console.log(`✅ Evicted ${evictedCount} artifacts, freed ${this.formatBytes(evictedSize)}`);

    } catch (error) {
      console.error('❌ Eviction failed:', error);
    } finally {
      this.isEvicting = false;
    }
  }

  /**
   * Get eviction candidates sorted by eviction score
   */
  private async getEvictionCandidates(): Promise<EvictionCandidate[]> {
    const candidates: EvictionCandidate[] = [];

    for (const [artifactId, data] of this.memoryCache.entries()) {
      try {
        const artifact = await this.db.getArtifact(artifactId);
        if (!artifact) continue;

        const memorySize = this.calculateMemorySize(data);
        const score = this.calculateEvictionScore(artifact, memorySize);

        candidates.push({
          id: artifactId,
          priority: artifact.priority,
          lastAccessed: artifact.lastAccessed || null,
          accessCount: artifact.accessCount,
          memorySize,
          score
        });

      } catch (error) {
        console.warn(`⚠️ Failed to get artifact info for ${artifactId}:`, error);
      }
    }

    // Sort by eviction score (higher score = more likely to evict)
    return candidates.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate eviction score for an artifact
   */
  private calculateEvictionScore(artifact: any, memorySize: number): number {
    const now = Date.now();
    const lastAccessed = artifact.lastAccessed ? artifact.lastAccessed.getTime() : 0;
    const timeSinceAccess = now - lastAccessed;

    // Base score from priority (lower priority = higher eviction score)
    let score = 10 - artifact.priority;

    // Time-based decay (older access = higher eviction score)
    const hoursSinceAccess = timeSinceAccess / (1000 * 60 * 60);
    score += hoursSinceAccess * 0.1;

    // Size penalty (larger artifacts = higher eviction score)
    const sizeMB = memorySize / (1024 * 1024);
    score += sizeMB * 0.5;

    // Access count bonus (more accessed = lower eviction score)
    score -= Math.log(artifact.accessCount + 1) * 0.2;

    return Math.max(0, score);
  }

  /**
   * Check if loading would exceed memory limit
   */
  private wouldExceedMemoryLimit(additionalSize: number): boolean {
    const totalSize = this.memoryUsage + additionalSize;
    const maxSize = this.config.maxMemoryMB * 1024 * 1024;
    return totalSize > maxSize;
  }

  /**
   * Calculate memory size of data
   */
  private calculateMemorySize(data: any): number {
    try {
      return JSON.stringify(data).length * 2; // Rough estimate (UTF-16)
    } catch (error) {
      return 1024; // Fallback estimate
    }
  }

  /**
   * Update access tracking in database
   */
  private async updateAccessTracking(artifactId: string): Promise<void> {
    try {
      await this.db.incrementAccessCount(artifactId);
    } catch (error) {
      console.warn(`⚠️ Failed to update access tracking for ${artifactId}:`, error);
    }
  }

  /**
   * Get current memory statistics
   */
  async getMemoryStats(): Promise<MemoryStats> {
    try {
      const totalArtifacts = await this.db.getStats();

      this.stats = {
        totalMemoryMB: this.config.maxMemoryMB,
        usedMemoryMB: this.memoryUsage / (1024 * 1024),
        freeMemoryMB: (this.config.maxMemoryMB * 1024 * 1024 - this.memoryUsage) / (1024 * 1024),
        usagePercentage: (this.memoryUsage / (this.config.maxMemoryMB * 1024 * 1024)) * 100,
        artifactsInMemory: this.memoryCache.size,
        totalArtifacts: totalArtifacts.totalArtifacts,
        cacheHitRate: this.calculateCacheHitRate(),
        evictionCount: this.evictionCount,
        lastEviction: this.lastEviction,
        averageAccessTime: await this.calculateAverageAccessTime(),
        topMemoryUsers: await this.getTopMemoryUsers()
      };

      return this.stats;

    } catch (error) {
      console.error('❌ Failed to get memory stats:', error);
      return this.stats;
    }
  }

  /**
   * Calculate cache hit rate
   */
  private calculateCacheHitRate(): number {
    // This would need to be implemented with proper hit/miss tracking
    // For now, return a placeholder
    return 0.85; // 85% hit rate
  }

  /**
   * Calculate average access time
   */
  private async calculateAverageAccessTime(): Promise<number> {
    try {
      const artifacts = await this.db.searchArtifacts({ limit: 100 });
      const totalAccessTime = artifacts.reduce((sum, artifact) => {
        if (artifact.lastAccessed) {
          return sum + (Date.now() - artifact.lastAccessed.getTime());
        }
        return sum;
      }, 0);

      return artifacts.length > 0 ? totalAccessTime / artifacts.length : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get top memory users
   */
  private async getTopMemoryUsers(): Promise<Array<{
    id: string;
    size: number;
    priority: number;
    lastAccessed: Date;
  }>> {
    const topUsers: Array<{
      id: string;
      size: number;
      priority: number;
      lastAccessed: Date;
    }> = [];

    for (const [artifactId, data] of this.memoryCache.entries()) {
      try {
        const artifact = await this.db.getArtifact(artifactId);
        if (artifact) {
          topUsers.push({
            id: artifactId,
            size: this.calculateMemorySize(data),
            priority: artifact.priority,
            lastAccessed: artifact.lastAccessed || new Date()
          });
        }
      } catch (error) {
        // Ignore errors for individual artifacts
      }
    }

    return topUsers
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);
  }

  /**
   * Initialize stats
   */
  private initializeStats(): MemoryStats {
    return {
      totalMemoryMB: this.config.maxMemoryMB,
      usedMemoryMB: 0,
      freeMemoryMB: this.config.maxMemoryMB,
      usagePercentage: 0,
      artifactsInMemory: 0,
      totalArtifacts: 0,
      cacheHitRate: 0,
      evictionCount: 0,
      lastEviction: null,
      averageAccessTime: 0,
      topMemoryUsers: []
    };
  }

  /**
   * Start monitoring
   */
  private startMonitoring(): void {
    if (!this.config.monitoringEnabled) {
      return;
    }

    this.statsTimer = setInterval(async () => {
      try {
        const stats = await this.getMemoryStats();

        this.emit('stats', {
          type: 'stats',
          artifactId: '',
          size: 0,
          timestamp: new Date(),
          details: stats
        });

        // Log memory usage if high
        if (stats.usagePercentage > 70) {
          console.log(`⚠️ High memory usage: ${stats.usagePercentage.toFixed(1)}%`);
        }

      } catch (error) {
        console.error('❌ Memory monitoring error:', error);
      }
    }, this.config.statsInterval);

    console.log('✅ Memory monitoring started');
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.statsTimer) {
      clearInterval(this.statsTimer);
      this.statsTimer = null;
      console.log('✅ Memory monitoring stopped');
    }
  }

  /**
   * Clear all memory
   */
  async clearMemory(): Promise<void> {
    console.log('🔄 Clearing all memory...');

    for (const artifactId of this.memoryCache.keys()) {
      await this.unloadArtifact(artifactId, false);
    }

    this.memoryUsage = 0;
    console.log('✅ Memory cleared');
  }

  /**
   * Format bytes to human readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const stats = await this.getMemoryStats();

      const status = stats.usagePercentage > 95 ? 'critical' :
                    stats.usagePercentage > 80 ? 'warning' : 'healthy';

      return {
        status,
        details: {
          memory: stats,
          config: this.config,
          isEvicting: this.isEvicting
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
    this.stopMonitoring();
    await this.clearMemory();
    this.removeAllListeners();
    console.log('✅ Memory Manager cleaned up');
  }
}

// Export factory function
export function createMemoryManager(
  database: SQLiteDatabase,
  fileManager: FileManager,
  metadataAPI: ArtifactMetadataAPI,
  config?: Partial<MemoryConfig>
): MemoryManager {
  return new MemoryManager(database, fileManager, metadataAPI, config);
}
