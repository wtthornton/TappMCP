/**
 * Resource Optimizer for TappMCP
 * Implements Task 2.4.3: Resource optimization for 30% memory reduction
 */

import { performance } from 'perf_hooks';
import { gzip, gunzip } from 'zlib';
import { promisify } from 'util';
import { LazyLoader, LazyLoadable, createLazyLoader } from './lazy-loader.js';

const gzipPromise = promisify(gzip);
const gunzipPromise = promisify(gunzip);

export interface ResourceConfig {
  enableLazyLoading: boolean;
  enableCompression: boolean;
  enableDeduplication: boolean;
  maxMemoryUsage: number; // MB
  compressionThreshold: number; // bytes
  deduplicationThreshold: number; // bytes
}

export interface OptimizedResource {
  id: string;
  data: any;
  compressed: boolean;
  deduplicated: boolean;
  memoryUsage: number;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  lastAccessed: number;
  accessCount: number;
}

export interface OptimizationStats {
  totalResources: number;
  optimizedResources: number;
  memorySaved: number;
  compressionRatio: number;
  deduplicationRatio: number;
  averageOptimization: number;
}

export class ResourceOptimizer {
  private lazyLoader: LazyLoader | null = null;
  private resources: Map<string, OptimizedResource> = new Map();
  private config: ResourceConfig;
  private stats: OptimizationStats;
  private compressionCache: Map<string, Buffer> = new Map();
  private deduplicationMap: Map<string, string[]> = new Map();

  constructor(config: Partial<ResourceConfig> = {}) {
    this.config = {
      enableLazyLoading: config.enableLazyLoading ?? true,
      enableCompression: config.enableCompression ?? true,
      enableDeduplication: config.enableDeduplication ?? true,
      maxMemoryUsage: config.maxMemoryUsage ?? 100, // 100MB
      compressionThreshold: config.compressionThreshold ?? 1024, // 1KB
      deduplicationThreshold: config.deduplicationThreshold ?? 512 // 512B
    };

    this.stats = {
      totalResources: 0,
      optimizedResources: 0,
      memorySaved: 0,
      compressionRatio: 0,
      deduplicationRatio: 0,
      averageOptimization: 0
    };

    // Initialize lazy loader if enabled
    if (this.config.enableLazyLoading) {
      this.lazyLoader = createLazyLoader({
        maxMemoryUsage: this.config.maxMemoryUsage,
        cleanupThreshold: this.config.maxMemoryUsage * 0.8
      });
    }

    console.log('✅ ResourceOptimizer initialized with config:', this.config);
  }

  /**
   * Optimize a resource
   */
  async optimize(id: string, data: any): Promise<OptimizedResource> {
    const startTime = performance.now();
    const originalSize = this.calculateSize(data);

    let optimizedData = data;
    let compressed = false;
    let deduplicated = false;
    let compressionRatio = 1.0;
    let deduplicationRatio = 1.0;

    // Apply deduplication first if enabled
    if (this.config.enableDeduplication && originalSize > this.config.deduplicationThreshold) {
      const deduplicationResult = await this.deduplicate(id, data);
      if (deduplicationResult.isDeduplicated) {
        optimizedData = deduplicationResult.data;
        deduplicated = true;
        deduplicationRatio = this.calculateSize(deduplicationResult.data) / originalSize;
      }
    }

    // Apply compression if enabled and data is large enough
    if (this.config.enableCompression && originalSize > this.config.compressionThreshold) {
      const compressedData = await this.compress(optimizedData);
      if (compressedData.length < this.calculateSize(optimizedData)) {
        optimizedData = compressedData;
        compressed = true;
        compressionRatio = compressedData.length / this.calculateSize(optimizedData);
      }
    }

    const optimizedSize = this.calculateSize(optimizedData);
    const memoryUsage = optimizedSize;
    const optimizationRatio = optimizedSize / originalSize;

    const resource: OptimizedResource = {
      id,
      data: optimizedData,
      compressed,
      deduplicated,
      memoryUsage,
      originalSize,
      optimizedSize,
      compressionRatio,
      lastAccessed: Date.now(),
      accessCount: 0
    };

    this.resources.set(id, resource);
    this.updateStats();

    const optimizationTime = performance.now() - startTime;
    console.log(`🔧 Optimized resource ${id}: ${originalSize}B → ${optimizedSize}B (${(optimizationRatio * 100).toFixed(1)}%) in ${optimizationTime.toFixed(2)}ms`);

    return resource;
  }

  /**
   * Get an optimized resource
   */
  async get(id: string): Promise<any> {
    const resource = this.resources.get(id);
    if (!resource) {
      throw new Error(`Resource ${id} not found`);
    }

    resource.lastAccessed = Date.now();
    resource.accessCount++;

    // Decompress if needed
    if (resource.compressed) {
      return this.decompress(resource.data);
    }

    return resource.data;
  }

  /**
   * Register a lazy loadable resource
   */
  registerLazyResource(item: LazyLoadable): void {
    if (!this.config.enableLazyLoading) {
      console.warn('⚠️ Lazy loading is disabled');
      return;
    }

    this.lazyLoader?.register(item);
  }

  /**
   * Load a lazy resource
   */
  async loadLazyResource(id: string): Promise<any> {
    if (!this.config.enableLazyLoading) {
      throw new Error('Lazy loading is disabled');
    }

    return this.lazyLoader?.load(id);
  }

  /**
   * Compress data
   */
  private async compress(data: any): Promise<Buffer> {
    try {
      const jsonString = JSON.stringify(data);
      const buffer = Buffer.from(jsonString, 'utf8');

      // Use actual gzip compression
      const compressed = await gzipPromise(buffer);
      return compressed;
    } catch (error) {
      console.error('❌ Compression failed:', error);
      return Buffer.from(JSON.stringify(data), 'utf8');
    }
  }

  /**
   * Decompress data
   */
  private async decompress(data: Buffer): Promise<any> {
    try {
      const decompressed = await gunzipPromise(data);
      const jsonString = decompressed.toString('utf8');
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('❌ Decompression failed:', error);
      return data;
    }
  }

  /**
   * Deduplicate data
   */
  private async deduplicate(id: string, data: any): Promise<{ data: any; isDeduplicated: boolean }> {
    try {
      const dataHash = this.createHash(data);

      // Check if we've seen this data before
      if (this.deduplicationMap.has(dataHash)) {
        const existingIds = this.deduplicationMap.get(dataHash)!;

        // Return reference to existing data
        const existingId = existingIds[0];
        const existingResource = this.resources.get(existingId);
        if (existingResource) {
          // Add this ID to the existing group
          existingIds.push(id);
          return { data: existingResource.data, isDeduplicated: true };
        }
      } else {
        // Store new data hash
        this.deduplicationMap.set(dataHash, [id]);
      }

      return { data, isDeduplicated: false };
    } catch (error) {
      console.error('❌ Deduplication failed:', error);
      return { data, isDeduplicated: false };
    }
  }

  /**
   * Create hash for data
   */
  private createHash(data: any): string {
    const jsonString = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Calculate size of data
   */
  private calculateSize(data: any): number {
    try {
      return Buffer.byteLength(JSON.stringify(data), 'utf8');
    } catch (error) {
      return 0;
    }
  }

  /**
   * Update optimization statistics
   */
  private updateStats(): void {
    const resources = Array.from(this.resources.values());

    this.stats.totalResources = resources.length;
    this.stats.optimizedResources = resources.filter(r => r.compressed || r.deduplicated).length;

    const totalOriginalSize = resources.reduce((sum, r) => sum + r.originalSize, 0);
    const totalOptimizedSize = resources.reduce((sum, r) => sum + r.optimizedSize, 0);

    // Memory saved should be positive when we actually save memory
    this.stats.memorySaved = Math.max(0, totalOriginalSize - totalOptimizedSize);
    this.stats.compressionRatio = totalOriginalSize > 0 ? totalOptimizedSize / totalOriginalSize : 1.0;
    this.stats.deduplicationRatio = this.calculateDeduplicationRatio();
    this.stats.averageOptimization = totalOriginalSize > 0 ? (totalOptimizedSize / totalOriginalSize) * 100 : 100;
  }

  /**
   * Calculate deduplication ratio
   */
  private calculateDeduplicationRatio(): number {
    let totalDeduplicated = 0;
    let totalResources = 0;

    for (const [hash, ids] of this.deduplicationMap.entries()) {
      if (ids.length > 1) {
        totalDeduplicated += ids.length - 1; // Number of duplicates
        totalResources += ids.length;
      }
    }

    return totalResources > 0 ? totalDeduplicated / totalResources : 0;
  }

  /**
   * Get optimization statistics
   */
  getStats(): OptimizationStats {
    this.updateStats();
    return { ...this.stats };
  }

  /**
   * Get memory usage statistics
   */
  getMemoryStats(): any {
    const memUsage = process.memoryUsage();
    const lazyStats = this.config.enableLazyLoading ? this.lazyLoader?.getMemoryStats() : null;

    return {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      lazyLoader: lazyStats,
      resources: this.resources.size,
      compressionCache: this.compressionCache.size,
      deduplicationMap: this.deduplicationMap.size
    };
  }

  /**
   * Cleanup old resources
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up old resources...');

    const now = Date.now();
    const ttl = 5 * 60 * 1000; // 5 minutes
    const toRemove: string[] = [];

    for (const [id, resource] of this.resources.entries()) {
      if (now - resource.lastAccessed > ttl) {
        toRemove.push(id);
      }
    }

    for (const id of toRemove) {
      this.resources.delete(id);
    }

    // Cleanup lazy loader if enabled
    if (this.config.enableLazyLoading) {
      await this.lazyLoader?.performCleanup();
    }

    this.updateStats();
    console.log(`✅ Cleaned up ${toRemove.length} old resources`);
  }

  /**
   * Clear all resources
   */
  async clear(): Promise<void> {
    console.log('🧹 Clearing all resources...');

    this.resources.clear();
    this.compressionCache.clear();
    this.deduplicationMap.clear();

    if (this.config.enableLazyLoading) {
      await this.lazyLoader?.clear();
    }

    this.updateStats();
    console.log('✅ All resources cleared');
  }

  /**
   * Get configuration
   */
  getConfig(): ResourceConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ResourceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Resource configuration updated:', this.config);
  }
}

/**
 * Create resource optimizer instance
 */
export function createResourceOptimizer(config?: Partial<ResourceConfig>): ResourceOptimizer {
  return new ResourceOptimizer(config);
}

/**
 * Default configuration
 */
export const defaultResourceConfig: ResourceConfig = {
  enableLazyLoading: true,
  enableCompression: true,
  enableDeduplication: true,
  maxMemoryUsage: 100, // 100MB
  compressionThreshold: 1024, // 1KB
  deduplicationThreshold: 512 // 512B
};
