/**
 * Advanced Context7 Cache Features
 *
 * Enhanced caching system with analytics, compression, monitoring,
 * cache sharing across code types, and intelligent warming strategies.
 */

import { LRUCache } from 'lru-cache';
import { createHash } from 'crypto';
import { gzip, gunzip } from 'zlib';
import { promisify } from 'util';
import { EventEmitter } from 'events';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

export interface AdvancedCacheConfig {
  maxSize: number;
  maxAge: number; // in milliseconds
  enableCompression: boolean;
  enableAnalytics: boolean;
  enableSharing: boolean;
  enableWarmup: boolean;
  compressionThreshold: number; // bytes
  analyticsInterval: number; // milliseconds
  monitoringInterval: number; // milliseconds
  backupInterval: number; // milliseconds
}

export interface CacheAnalytics {
  codeTypeUsage: Record<string, number>;
  technologyPopularity: Record<string, number>;
  cacheEfficiency: {
    hitRate: number;
    missRate: number;
    compressionRatio: number;
    averageResponseTime: number;
  };
  performanceMetrics: {
    totalRequests: number;
    cacheHits: number;
    cacheMisses: number;
    compressionSavings: number;
    memoryUsage: number;
  };
  trends: {
    hourlyUsage: number[];
    popularPatterns: string[];
    emergingTechnologies: string[];
  };
  predictions: {
    nextHourDemand: number;
    recommendedWarmupItems: string[];
    optimizationSuggestions: string[];
  };
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  technology: string;
  codeType: string;
  size: number;
  compressed: boolean;
  hash: string;
  metadata: {
    processingTime: number;
    quality: number;
    popularity: number;
  };
}

export interface CacheMonitoringData {
  memoryUsage: number;
  hitRate: number;
  responseTime: number;
  compressionRatio: number;
  errorRate: number;
  temperature: 'cold' | 'warm' | 'hot';
}

export interface CacheBackup {
  timestamp: number;
  entries: Array<{
    key: string;
    entry: CacheEntry<any>;
  }>;
  metadata: {
    totalEntries: number;
    totalSize: number;
    version: string;
  };
}

/**
 * Advanced Context7 caching system with analytics and intelligent features
 */
export class AdvancedContext7Cache extends EventEmitter {
  private codeGenerationCache!: LRUCache<string, CacheEntry<string>>;
  private technologyInsightsCache!: LRUCache<string, CacheEntry<any>>;
  private analysisCache!: LRUCache<string, CacheEntry<any>>;
  private validationCache!: LRUCache<string, CacheEntry<any>>;
  private sharedCache!: LRUCache<string, CacheEntry<any>>;

  private analytics!: CacheAnalytics;
  private config: AdvancedCacheConfig;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private analyticsInterval: NodeJS.Timeout | null = null;
  private backupInterval: NodeJS.Timeout | null = null;
  private warmupQueue: Set<string> = new Set();

  constructor(config: Partial<AdvancedCacheConfig> = {}) {
    super();

    this.config = {
      maxSize: config.maxSize || 2000,
      maxAge: config.maxAge || 1000 * 60 * 60, // 1 hour
      enableCompression: config.enableCompression ?? true,
      enableAnalytics: config.enableAnalytics ?? true,
      enableSharing: config.enableSharing ?? true,
      enableWarmup: config.enableWarmup ?? true,
      compressionThreshold: config.compressionThreshold || 1024, // 1KB
      analyticsInterval: config.analyticsInterval || 1000 * 60 * 15, // 15 minutes
      monitoringInterval: config.monitoringInterval || 1000 * 30, // 30 seconds
      backupInterval: config.backupInterval || 1000 * 60 * 60 * 4, // 4 hours
    };

    this.initializeCaches();
    this.initializeAnalytics();

    if (this.config.enableAnalytics) {
      this.startAnalytics();
    }

    this.startMonitoring();
    this.startBackups();
  }

  /**
   * Initialize all cache instances
   */
  private initializeCaches(): void {
    const cacheOptions = {
      max: this.config.maxSize,
      ttl: this.config.maxAge,
      allowStale: false,
      updateAgeOnGet: true,
      ttlAutopurge: true,
    };

    this.codeGenerationCache = new LRUCache<string, CacheEntry<string>>(cacheOptions);
    this.technologyInsightsCache = new LRUCache<string, CacheEntry<any>>({
      ...cacheOptions,
      max: this.config.maxSize / 2,
      ttl: this.config.maxAge * 2,
    });
    this.analysisCache = new LRUCache<string, CacheEntry<any>>(cacheOptions);
    this.validationCache = new LRUCache<string, CacheEntry<any>>({
      ...cacheOptions,
      max: this.config.maxSize / 4,
      ttl: this.config.maxAge / 2,
    });

    if (this.config.enableSharing) {
      this.sharedCache = new LRUCache<string, CacheEntry<any>>({
        ...cacheOptions,
        max: this.config.maxSize * 2,
        ttl: this.config.maxAge * 3,
      });
    }
  }

  /**
   * Initialize analytics tracking
   */
  private initializeAnalytics(): void {
    this.analytics = {
      codeTypeUsage: {},
      technologyPopularity: {},
      cacheEfficiency: {
        hitRate: 0,
        missRate: 0,
        compressionRatio: 0,
        averageResponseTime: 0,
      },
      performanceMetrics: {
        totalRequests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        compressionSavings: 0,
        memoryUsage: 0,
      },
      trends: {
        hourlyUsage: new Array(24).fill(0),
        popularPatterns: [],
        emergingTechnologies: [],
      },
      predictions: {
        nextHourDemand: 0,
        recommendedWarmupItems: [],
        optimizationSuggestions: [],
      },
    };
  }

  /**
   * Cache code generation results with compression and analytics
   */
  async cacheCodeGeneration<T>(
    request: any,
    generator: () => Promise<T>,
    codeType: string = 'generic',
    technology: string = 'unknown'
  ): Promise<T> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('generation', JSON.stringify(request), technology);

    // Check cache first
    const cached = this.codeGenerationCache.get(cacheKey);
    if (cached) {
      this.recordCacheHit(cacheKey, codeType, technology);
      return this.decompressIfNeeded(cached.data) as T;
    }

    // Generate new result
    const result = await generator();
    const processingTime = Date.now() - startTime;

    // Store in cache with compression if needed
    await this.storeInCache(
      this.codeGenerationCache,
      cacheKey,
      result as string,
      codeType,
      technology,
      processingTime
    );

    this.recordCacheMiss(cacheKey, codeType, technology);
    this.updateAnalytics(codeType, technology, processingTime);

    return result;
  }

  /**
   * Cache technology insights with sharing across code types
   */
  async cacheTechnologyInsights<T>(
    key: string,
    _data: any,
    generator: () => Promise<T>,
    codeType: string = 'generic',
    technology: string = 'unknown'
  ): Promise<T> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('insights', key, technology);

    // Check shared cache first if enabled
    if (this.config.enableSharing) {
      const sharedResult = this.sharedCache.get(cacheKey);
      if (sharedResult) {
        this.recordCacheHit(cacheKey, codeType, technology);
        return this.decompressIfNeeded(sharedResult.data) as T;
      }
    }

    // Check technology insights cache
    const cached = this.technologyInsightsCache.get(cacheKey);
    if (cached) {
      this.recordCacheHit(cacheKey, codeType, technology);
      return this.decompressIfNeeded(cached.data) as T;
    }

    // Generate new insights
    const result = await generator();
    const processingTime = Date.now() - startTime;

    // Store in both caches
    await this.storeInCache(
      this.technologyInsightsCache,
      cacheKey,
      result,
      codeType,
      technology,
      processingTime
    );

    if (this.config.enableSharing) {
      await this.storeInCache(
        this.sharedCache,
        cacheKey,
        result,
        codeType,
        technology,
        processingTime
      );
    }

    this.recordCacheMiss(cacheKey, codeType, technology);
    this.updateAnalytics(codeType, technology, processingTime);

    return result;
  }

  /**
   * Cache code analysis results
   */
  async cacheCodeAnalysis<T>(
    code: string,
    technology: string,
    analyzer: () => Promise<T>,
    codeType: string = 'generic'
  ): Promise<T> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('analysis', code, technology);

    const cached = this.analysisCache.get(cacheKey);
    if (cached) {
      this.recordCacheHit(cacheKey, codeType, technology);
      return this.decompressIfNeeded(cached.data) as T;
    }

    const result = await analyzer();
    const processingTime = Date.now() - startTime;

    await this.storeInCache(
      this.analysisCache,
      cacheKey,
      result,
      codeType,
      technology,
      processingTime
    );

    this.recordCacheMiss(cacheKey, codeType, technology);
    this.updateAnalytics(codeType, technology, processingTime);

    return result;
  }

  /**
   * Store data in cache with intelligent compression
   */
  private async storeInCache<T>(
    cache: LRUCache<string, CacheEntry<T>>,
    key: string,
    data: T,
    codeType: string,
    technology: string,
    processingTime: number
  ): Promise<void> {
    const serialized = JSON.stringify(data);
    const size = Buffer.byteLength(serialized, 'utf8');

    let finalData = data;
    let compressed = false;

    // Compress if data is large and compression is enabled
    if (this.config.enableCompression && size > this.config.compressionThreshold) {
      try {
        const compressedBuffer = await gzipAsync(serialized);
        finalData = compressedBuffer.toString('base64') as T;
        compressed = true;
        this.analytics.performanceMetrics.compressionSavings += size - compressedBuffer.length;
      } catch (error) {
        // Fall back to uncompressed storage
        console.warn('Compression failed, storing uncompressed:', error);
      }
    }

    const entry: CacheEntry<T> = {
      data: finalData,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now(),
      technology,
      codeType,
      size: compressed ? Buffer.byteLength(finalData as string, 'base64') : size,
      compressed,
      hash: this.generateHash(serialized),
      metadata: {
        processingTime,
        quality: this.calculateQuality(data, processingTime),
        popularity: this.calculatePopularity(codeType, technology),
      },
    };

    cache.set(key, entry);
  }

  /**
   * Decompress data if needed
   */
  private async decompressIfNeeded<T>(data: T): Promise<T> {
    if (typeof data === 'string' && data.length > 0) {
      try {
        // Check if it's base64 compressed data
        const buffer = Buffer.from(data, 'base64');
        const decompressed = await gunzipAsync(buffer);
        return JSON.parse(decompressed.toString('utf8'));
      } catch {
        // Not compressed or compression failed, return as-is
        return data;
      }
    }
    return data;
  }

  /**
   * Generate cache key with improved hashing
   */
  private generateCacheKey(operation: string, data: string, technology: string): string {
    const content = `${operation}:${technology}:${data}`;
    return this.generateHash(content);
  }

  /**
   * Generate hash for content
   */
  private generateHash(content: string): string {
    return createHash('sha256').update(content).digest('hex').substring(0, 16);
  }

  /**
   * Fast hash function for code content
   */
  private hashCode(code: string): string {
    return createHash('md5').update(code).digest('hex');
  }

  /**
   * Calculate quality score for cached item
   */
  private calculateQuality(data: any, processingTime: number): number {
    let quality = 50; // Base quality

    // Factor in processing time (faster = better quality infrastructure)
    if (processingTime < 100) quality += 30;
    else if (processingTime < 500) quality += 20;
    else if (processingTime < 1000) quality += 10;

    // Factor in data complexity
    const complexity = JSON.stringify(data).length;
    if (complexity > 1000) quality += 10;
    if (complexity > 5000) quality += 10;

    return Math.min(quality, 100);
  }

  /**
   * Calculate popularity score
   */
  private calculatePopularity(codeType: string, technology: string): number {
    const codeTypeUsage = this.analytics.codeTypeUsage[codeType] || 0;
    const techUsage = this.analytics.technologyPopularity[technology] || 0;
    return Math.min((codeTypeUsage + techUsage) / 10, 100);
  }

  /**
   * Record cache hit for analytics
   */
  private recordCacheHit(key: string, codeType: string, technology: string): void {
    this.analytics.performanceMetrics.cacheHits++;
    this.analytics.performanceMetrics.totalRequests++;
    this.updateUsageStats(codeType, technology);

    // Update access count for the entry
    const entry = this.findEntryInCaches(key);
    if (entry) {
      entry.accessCount++;
      entry.lastAccessed = Date.now();
    }
  }

  /**
   * Record cache miss for analytics
   */
  private recordCacheMiss(key: string, codeType: string, technology: string): void {
    this.analytics.performanceMetrics.cacheMisses++;
    this.analytics.performanceMetrics.totalRequests++;
    this.updateUsageStats(codeType, technology);

    // Add to warmup queue if warmup is enabled
    if (this.config.enableWarmup) {
      this.warmupQueue.add(key);
    }
  }

  /**
   * Update usage statistics
   */
  private updateUsageStats(codeType: string, technology: string): void {
    this.analytics.codeTypeUsage[codeType] = (this.analytics.codeTypeUsage[codeType] || 0) + 1;
    this.analytics.technologyPopularity[technology] =
      (this.analytics.technologyPopularity[technology] || 0) + 1;
  }

  /**
   * Update comprehensive analytics
   */
  private updateAnalytics(_codeType: string, _technology: string, _processingTime: number): void {
    const metrics = this.analytics.performanceMetrics;
    metrics.totalRequests = metrics.cacheHits + metrics.cacheMisses;

    this.analytics.cacheEfficiency = {
      hitRate: metrics.totalRequests > 0 ? (metrics.cacheHits / metrics.totalRequests) * 100 : 0,
      missRate: metrics.totalRequests > 0 ? (metrics.cacheMisses / metrics.totalRequests) * 100 : 0,
      compressionRatio: this.calculateCompressionRatio(),
      averageResponseTime: this.calculateAverageResponseTime(),
    };

    this.updateTrends();
    this.generatePredictions();
  }

  /**
   * Find entry across all caches
   */
  private findEntryInCaches(key: string): CacheEntry<any> | undefined {
    const result =
      this.codeGenerationCache.get(key) ||
      this.technologyInsightsCache.get(key) ||
      this.analysisCache.get(key) ||
      this.validationCache.get(key) ||
      (this.config.enableSharing && this.sharedCache.get(key));
    return result ? result : undefined;
  }

  /**
   * Calculate compression ratio
   */
  private calculateCompressionRatio(): number {
    let totalOriginal = 0;
    let totalCompressed = 0;

    const processCache = (cache: LRUCache<string, CacheEntry<any>>) => {
      cache.forEach(entry => {
        if (entry.compressed) {
          totalCompressed += entry.size;
          totalOriginal += entry.size * 3; // Estimate original size
        }
      });
    };

    processCache(this.codeGenerationCache);
    processCache(this.technologyInsightsCache);
    processCache(this.analysisCache);

    return totalOriginal > 0 ? ((totalOriginal - totalCompressed) / totalOriginal) * 100 : 0;
  }

  /**
   * Calculate average response time
   */
  private calculateAverageResponseTime(): number {
    let totalTime = 0;
    let count = 0;

    const processCache = (cache: LRUCache<string, CacheEntry<any>>) => {
      cache.forEach(entry => {
        totalTime += entry.metadata.processingTime;
        count++;
      });
    };

    processCache(this.codeGenerationCache);
    processCache(this.technologyInsightsCache);
    processCache(this.analysisCache);

    return count > 0 ? totalTime / count : 0;
  }

  /**
   * Update trends analysis
   */
  private updateTrends(): void {
    const now = new Date();
    const hour = now.getHours();
    this.analytics.trends.hourlyUsage[hour]++;

    // Update popular patterns
    const patterns = Object.entries(this.analytics.codeTypeUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([pattern]) => pattern);
    this.analytics.trends.popularPatterns = patterns;

    // Update emerging technologies
    const emerging = Object.entries(this.analytics.technologyPopularity)
      .filter(([, count]) => count > 5) // Only consider technologies with some usage
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tech]) => tech);
    this.analytics.trends.emergingTechnologies = emerging;
  }

  /**
   * Generate predictions for optimization
   */
  private generatePredictions(): void {
    // Predict next hour demand based on historical data
    const currentHour = new Date().getHours();
    const nextHour = (currentHour + 1) % 24;
    this.analytics.predictions.nextHourDemand = this.analytics.trends.hourlyUsage[nextHour];

    // Recommend items for warmup
    const popular = Array.from(this.warmupQueue).slice(0, 10);
    this.analytics.predictions.recommendedWarmupItems = popular;

    // Generate optimization suggestions
    const suggestions = [];
    if (this.analytics.cacheEfficiency.hitRate < 70) {
      suggestions.push('Consider increasing cache size');
    }
    if (this.analytics.cacheEfficiency.compressionRatio < 20) {
      suggestions.push('Compression threshold may be too high');
    }
    if (this.analytics.cacheEfficiency.averageResponseTime > 1000) {
      suggestions.push('Consider optimizing cache access patterns');
    }
    this.analytics.predictions.optimizationSuggestions = suggestions;
  }

  /**
   * Start analytics collection
   */
  private startAnalytics(): void {
    this.analyticsInterval = setInterval(() => {
      this.generateAnalyticsReport();
      this.emit('analytics', this.analytics);
    }, this.config.analyticsInterval);
  }

  /**
   * Start monitoring
   */
  private startMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      const monitoring = this.getMonitoringData();
      this.emit('monitoring', monitoring);

      // Auto-optimize based on monitoring data
      if (monitoring.hitRate < 50) {
        this.performWarmup();
      }
    }, this.config.monitoringInterval);
  }

  /**
   * Start backup process
   */
  private startBackups(): void {
    this.backupInterval = setInterval(() => {
      const backup = this.createBackup();
      this.emit('backup', backup);
    }, this.config.backupInterval);
  }

  /**
   * Generate comprehensive analytics report
   */
  private generateAnalyticsReport(): void {
    // Update memory usage
    this.analytics.performanceMetrics.memoryUsage = this.calculateMemoryUsage();

    // Log analytics for debugging
    if (this.config.enableAnalytics) {
      console.log('[AdvancedContext7Cache] Analytics Report:', {
        hitRate: this.analytics.cacheEfficiency.hitRate.toFixed(2) + '%',
        compressionRatio: this.analytics.cacheEfficiency.compressionRatio.toFixed(2) + '%',
        memoryUsage:
          (this.analytics.performanceMetrics.memoryUsage / 1024 / 1024).toFixed(2) + 'MB',
        totalRequests: this.analytics.performanceMetrics.totalRequests,
      });
    }
  }

  /**
   * Calculate memory usage
   */
  private calculateMemoryUsage(): number {
    const calculateCacheMemory = (cache: LRUCache<string, CacheEntry<any>>) => {
      let size = 0;
      cache.forEach(entry => {
        size += entry.size + 200; // Add overhead estimate
      });
      return size;
    };

    return (
      calculateCacheMemory(this.codeGenerationCache) +
      calculateCacheMemory(this.technologyInsightsCache) +
      calculateCacheMemory(this.analysisCache) +
      calculateCacheMemory(this.validationCache) +
      (this.config.enableSharing ? calculateCacheMemory(this.sharedCache) : 0)
    );
  }

  /**
   * Get monitoring data
   */
  public getMonitoringData(): CacheMonitoringData {
    const hitRate = this.analytics.cacheEfficiency.hitRate;
    let temperature: 'cold' | 'warm' | 'hot' = 'cold';

    if (hitRate > 80) temperature = 'hot';
    else if (hitRate > 60) temperature = 'warm';

    return {
      memoryUsage: this.analytics.performanceMetrics.memoryUsage,
      hitRate,
      responseTime: this.analytics.cacheEfficiency.averageResponseTime,
      compressionRatio: this.analytics.cacheEfficiency.compressionRatio,
      errorRate: 0, // Could be enhanced to track errors
      temperature,
    };
  }

  /**
   * Get comprehensive analytics
   */
  public getAnalytics(): CacheAnalytics {
    return { ...this.analytics };
  }

  /**
   * Perform cache warmup
   */
  public async performWarmup(): Promise<void> {
    if (!this.config.enableWarmup) return;

    const warmupItems = Array.from(this.warmupQueue).slice(0, 50);

    for (const item of warmupItems) {
      // This would need to be implemented based on specific warmup strategies
      // For now, we just log the warmup action
      console.log(`[AdvancedContext7Cache] Warming up: ${item}`);
    }

    // Clear warmup queue
    this.warmupQueue.clear();
    this.emit('warmup', { itemsWarmed: warmupItems.length });
  }

  /**
   * Create backup of cache data
   */
  public createBackup(): CacheBackup {
    const entries: Array<{ key: string; entry: CacheEntry<any> }> = [];

    const addCacheEntries = (cache: LRUCache<string, CacheEntry<any>>, prefix: string) => {
      cache.forEach((entry, key) => {
        entries.push({ key: `${prefix}:${key}`, entry });
      });
    };

    addCacheEntries(this.codeGenerationCache, 'generation');
    addCacheEntries(this.technologyInsightsCache, 'insights');
    addCacheEntries(this.analysisCache, 'analysis');
    addCacheEntries(this.validationCache, 'validation');

    if (this.config.enableSharing) {
      addCacheEntries(this.sharedCache, 'shared');
    }

    return {
      timestamp: Date.now(),
      entries,
      metadata: {
        totalEntries: entries.length,
        totalSize: this.analytics.performanceMetrics.memoryUsage,
        version: '1.0.0',
      },
    };
  }

  /**
   * Restore from backup
   */
  public async restoreFromBackup(backup: CacheBackup): Promise<void> {
    for (const { key, entry } of backup.entries) {
      const [cacheType, ...keyParts] = key.split(':');
      const actualKey = keyParts.join(':');

      switch (cacheType) {
        case 'generation':
          this.codeGenerationCache.set(actualKey, entry);
          break;
        case 'insights':
          this.technologyInsightsCache.set(actualKey, entry);
          break;
        case 'analysis':
          this.analysisCache.set(actualKey, entry);
          break;
        case 'validation':
          this.validationCache.set(actualKey, entry);
          break;
        case 'shared':
          if (this.config.enableSharing) {
            this.sharedCache.set(actualKey, entry);
          }
          break;
      }
    }

    this.emit('restore', { entriesRestored: backup.entries.length });
  }

  /**
   * Clear all caches
   */
  public clear(): void {
    this.codeGenerationCache.clear();
    this.technologyInsightsCache.clear();
    this.analysisCache.clear();
    this.validationCache.clear();

    if (this.config.enableSharing) {
      this.sharedCache.clear();
    }

    this.initializeAnalytics();
    this.emit('cleared');
  }

  /**
   * Alias for clear() to match expected interface
   */
  public clearCache(): void {
    this.clear();
  }

  /**
   * Warm cache with common patterns
   */
  public async warmCache(
    commonPatterns: Array<{
      code: string;
      technology: string;
      operation: string;
    }>
  ): Promise<void> {
    console.log(`[AdvancedContext7Cache] Warming cache with ${commonPatterns.length} patterns`);

    for (const pattern of commonPatterns) {
      const cacheKey = this.generateCacheKey(pattern.operation, pattern.code, pattern.technology);

      // Simulate quick analysis for warming
      const entry: CacheEntry<any> = {
        data: { warmed: true, technology: pattern.technology },
        timestamp: Date.now(),
        accessCount: 0,
        lastAccessed: Date.now(),
        technology: pattern.technology,
        codeType: pattern.operation,
        size: JSON.stringify({ warmed: true }).length,
        compressed: false,
        hash: this.hashCode(pattern.code),
        metadata: {
          processingTime: 0,
          quality: 75,
          popularity: 1,
        },
      };

      switch (pattern.operation) {
        case 'analysis':
          this.analysisCache.set(cacheKey, entry);
          break;
        case 'insights':
          this.technologyInsightsCache.set(cacheKey, entry);
          break;
        case 'generation':
          this.codeGenerationCache.set(cacheKey, { ...entry, data: '// Warmed cache entry' });
          break;
        case 'validation':
          this.validationCache.set(cacheKey, entry);
          break;
      }
    }

    this.emit('warmup', { itemsWarmed: commonPatterns.length });
  }

  /**
   * Get cache statistics
   */
  public getStats() {
    return {
      hits: this.analytics.performanceMetrics.cacheHits,
      misses: this.analytics.performanceMetrics.cacheMisses,
      hitRate: this.analytics.cacheEfficiency.hitRate,
      averageProcessingTime: this.analytics.cacheEfficiency.averageResponseTime,
      codeGenerationCacheSize: this.codeGenerationCache.size,
      technologyInsightsCacheSize: this.technologyInsightsCache.size,
      codeAnalysisCacheSize: this.analysisCache.size,
      validationCacheSize: this.validationCache.size,
      sharedCacheSize: this.config.enableSharing ? this.sharedCache.size : 0,
      estimatedMemoryUsage: this.analytics.performanceMetrics.memoryUsage,
      compressionSavings: this.analytics.performanceMetrics.compressionSavings,
      compressionRatio: this.analytics.cacheEfficiency.compressionRatio,
    };
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    if (this.analyticsInterval) {
      clearInterval(this.analyticsInterval);
    }
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
    }

    this.clear();
    this.removeAllListeners();
  }
}

// Global instance for use across the application
export const globalAdvancedContext7Cache = new AdvancedContext7Cache();
