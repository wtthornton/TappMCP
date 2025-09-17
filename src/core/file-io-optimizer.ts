/**
 * File I/O Performance Optimizer for TappMCP
 * Implements Task 2.4.2: Optimize database queries and data access
 * Target: 50% reduction in file I/O query time
 */

import { readFile, writeFile, stat, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { performance } from 'perf_hooks';
import { LRUCache } from 'lru-cache';

export interface FileIOMetrics {
  totalReads: number;
  totalWrites: number;
  cacheHits: number;
  cacheMisses: number;
  averageReadTime: number;
  averageWriteTime: number;
  totalTimeSaved: number;
  hitRate: number;
}

export interface FileCacheEntry {
  content: string;
  timestamp: number;
  size: number;
  mtime: number;
}

export class FileIOOptimizer {
  private fileCache: LRUCache<string, FileCacheEntry>;
  private metrics: FileIOMetrics;
  private readTimes: number[] = [];
  private writeTimes: number[] = [];

  constructor(config: {
    maxCacheSize?: number;
    ttl?: number;
    enableCompression?: boolean;
  } = {}) {
    this.fileCache = new LRUCache<string, FileCacheEntry>({
      max: config.maxCacheSize || 1000,
      ttl: config.ttl || 7 * 24 * 60 * 60 * 1000, // 1 week - optimized for performance
      updateAgeOnGet: true,
      allowStale: false,
      dispose: (value, key) => {
        console.log(`🗑️ File cache evicted: ${key}`);
      }
    });

    this.metrics = {
      totalReads: 0,
      totalWrites: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageReadTime: 0,
      averageWriteTime: 0,
      totalTimeSaved: 0,
      hitRate: 0
    };

    console.log('✅ FileIOOptimizer initialized');
  }

  /**
   * Optimized file read with caching and performance tracking
   */
  async readFile(filePath: string, encoding: BufferEncoding = 'utf8'): Promise<string> {
    const startTime = performance.now();
    this.metrics.totalReads++;

    try {
      // Check cache first
      const cached = this.fileCache.get(filePath);
      if (cached) {
        // Verify file hasn't changed
        const stats = await stat(filePath);
        if (stats.mtime.getTime() === cached.mtime) {
          this.metrics.cacheHits++;
          this.updateHitRate();

          const responseTime = performance.now() - startTime;
          this.recordReadTime(responseTime);

          console.log(`✅ File cache HIT: ${filePath} (${responseTime.toFixed(2)}ms)`);
          return cached.content;
        } else {
          // File changed, remove from cache
          this.fileCache.delete(filePath);
        }
      }

      // Cache miss - read from disk
      this.metrics.cacheMisses++;
      this.updateHitRate();

      const content = await readFile(filePath, encoding);
      const stats = await stat(filePath);

      // Cache the content
      this.fileCache.set(filePath, {
        content,
        timestamp: Date.now(),
        size: content.length,
        mtime: stats.mtime.getTime()
      });

      const responseTime = performance.now() - startTime;
      this.recordReadTime(responseTime);

      console.log(`❌ File cache MISS: ${filePath} (${responseTime.toFixed(2)}ms)`);
      return content;

    } catch (error) {
      console.error(`❌ File read error: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Optimized file write with performance tracking
   */
  async writeFile(filePath: string, content: string, encoding: BufferEncoding = 'utf8'): Promise<void> {
    const startTime = performance.now();
    this.metrics.totalWrites++;

    try {
      // Ensure directory exists
      const dir = dirname(filePath);
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }

      // Write file
      await writeFile(filePath, content, encoding);

      // Update cache
      const stats = await stat(filePath);
      this.fileCache.set(filePath, {
        content,
        timestamp: Date.now(),
        size: content.length,
        mtime: stats.mtime.getTime()
      });

      const responseTime = performance.now() - startTime;
      this.recordWriteTime(responseTime);

      console.log(`💾 File written: ${filePath} (${responseTime.toFixed(2)}ms)`);

    } catch (error) {
      console.error(`❌ File write error: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Optimized JSON file read with caching
   */
  async readJSON<T = any>(filePath: string): Promise<T> {
    const content = await this.readFile(filePath);
    try {
      return JSON.parse(content);
    } catch (error) {
      console.error(`❌ JSON parse error: ${filePath}`, error);
      throw new Error(`Invalid JSON in file: ${filePath}`);
    }
  }

  /**
   * Optimized JSON file write with formatting
   */
  async writeJSON(filePath: string, data: any, pretty: boolean = true): Promise<void> {
    const content = pretty
      ? JSON.stringify(data, null, 2)
      : JSON.stringify(data);

    await this.writeFile(filePath, content);
  }

  /**
   * Batch file operations for better performance
   */
  async batchRead(files: string[]): Promise<Map<string, string>> {
    const startTime = performance.now();
    const results = new Map<string, string>();

    // Process files in parallel
    const promises = files.map(async (filePath) => {
      try {
        const content = await this.readFile(filePath);
        results.set(filePath, content);
      } catch (error) {
        console.error(`❌ Batch read error: ${filePath}`, error);
        results.set(filePath, '');
      }
    });

    await Promise.all(promises);

    const totalTime = performance.now() - startTime;
    console.log(`📦 Batch read ${files.length} files in ${totalTime.toFixed(2)}ms`);

    return results;
  }

  /**
   * Batch file writes for better performance
   */
  async batchWrite(operations: Array<{ path: string; content: string }>): Promise<void> {
    const startTime = performance.now();

    // Process writes in parallel
    const promises = operations.map(async ({ path, content }) => {
      try {
        await this.writeFile(path, content);
      } catch (error) {
        console.error(`❌ Batch write error: ${path}`, error);
      }
    });

    await Promise.all(promises);

    const totalTime = performance.now() - startTime;
    console.log(`📦 Batch wrote ${operations.length} files in ${totalTime.toFixed(2)}ms`);
  }

  /**
   * Clear file cache
   */
  clearCache(): void {
    this.fileCache.clear();
    console.log('🧹 File cache cleared');
  }

  /**
   * Get performance metrics
   */
  getMetrics(): FileIOMetrics {
    return { ...this.metrics };
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    memoryUsage: number;
  } {
    return {
      size: this.fileCache.size,
      maxSize: this.fileCache.max,
      hitRate: this.metrics.hitRate,
      memoryUsage: process.memoryUsage().heapUsed
    };
  }

  /**
   * Record read time
   */
  private recordReadTime(time: number): void {
    this.readTimes.push(time);

    // Keep only last 100 read times
    if (this.readTimes.length > 100) {
      this.readTimes = this.readTimes.slice(-100);
    }

    this.metrics.averageReadTime = this.readTimes.reduce((a, b) => a + b, 0) / this.readTimes.length;
  }

  /**
   * Record write time
   */
  private recordWriteTime(time: number): void {
    this.writeTimes.push(time);

    // Keep only last 100 write times
    if (this.writeTimes.length > 100) {
      this.writeTimes = this.writeTimes.slice(-100);
    }

    this.metrics.averageWriteTime = this.writeTimes.reduce((a, b) => a + b, 0) / this.writeTimes.length;
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    if (total > 0) {
      this.metrics.hitRate = this.metrics.cacheHits / total;
    }
  }

  /**
   * Calculate time saved through caching
   */
  calculateTimeSaved(): number {
    // Estimate time saved based on cache hits
    const estimatedDiskReadTime = 5; // ms average disk read
    const cacheReadTime = 0.1; // ms average cache read
    const timeSavedPerHit = estimatedDiskReadTime - cacheReadTime;

    this.metrics.totalTimeSaved = this.metrics.cacheHits * timeSavedPerHit;
    return this.metrics.totalTimeSaved;
  }
}

/**
 * Create file I/O optimizer instance
 */
export function createFileIOOptimizer(config?: {
  maxCacheSize?: number;
  ttl?: number;
  enableCompression?: boolean;
}): FileIOOptimizer {
  return new FileIOOptimizer(config);
}

/**
 * Default configuration
 */
export const defaultFileIOConfig = {
  maxCacheSize: 1000,
  ttl: 7 * 24 * 60 * 60 * 1000, // 1 week - optimized for performance
  enableCompression: false // Disabled for performance
};
