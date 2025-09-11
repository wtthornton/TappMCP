/**
 * Performance Cache for Unified Code Intelligence
 *
 * Intelligent caching system for code analysis results, technology insights,
 * and generation patterns to improve response times and reduce redundant processing.
 */

import { LRUCache } from 'lru-cache';
import { createHash } from 'crypto';

export interface CacheConfig {
  maxSize: number;
  maxAge: number; // in milliseconds
  enableCompression: boolean;
  enableStats: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalRequests: number;
  totalSize: number;
  averageProcessingTime: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  processingTime: number;
  technology: string;
  hash: string;
}

/**
 * High-performance caching system for code intelligence results
 */
export class PerformanceCache {
  private codeAnalysisCache: LRUCache<string, CacheEntry<any>>;
  private technologyInsightsCache: LRUCache<string, CacheEntry<any>>;
  private codeGenerationCache: LRUCache<string, CacheEntry<string>>;
  private validationCache: LRUCache<string, CacheEntry<any>>;

  private stats: CacheStats;
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: config.maxSize || 1000,
      maxAge: config.maxAge || 1000 * 60 * 30, // 30 minutes
      enableCompression: config.enableCompression ?? true,
      enableStats: config.enableStats ?? true,
    };

    // Initialize LRU caches for different types of data
    this.codeAnalysisCache = new LRUCache({
      max: this.config.maxSize,
      ttl: this.config.maxAge,
      allowStale: false,
      updateAgeOnGet: true,
    });

    this.technologyInsightsCache = new LRUCache({
      max: this.config.maxSize / 2, // Smaller cache for insights
      ttl: this.config.maxAge * 2, // Longer TTL for insights
      allowStale: false,
      updateAgeOnGet: true,
    });

    this.codeGenerationCache = new LRUCache({
      max: this.config.maxSize,
      ttl: this.config.maxAge,
      allowStale: false,
      updateAgeOnGet: true,
    });

    this.validationCache = new LRUCache({
      max: this.config.maxSize / 4, // Smaller validation cache
      ttl: this.config.maxAge / 2, // Shorter TTL for validation
      allowStale: false,
      updateAgeOnGet: true,
    });

    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalRequests: 0,
      totalSize: 0,
      averageProcessingTime: 0,
    };
  }

  /**
   * Generate cache key from input parameters
   */
  private generateCacheKey(
    operation: string,
    code: string,
    technology: string,
    ...additionalParams: any[]
  ): string {
    const input = {
      operation,
      codeHash: this.hashCode(code),
      technology: technology.toLowerCase(),
      params: additionalParams,
    };

    return createHash('sha256').update(JSON.stringify(input)).digest('hex').substring(0, 32); // Use first 32 chars for key
  }

  /**
   * Fast hash function for code content
   */
  private hashCode(code: string): string {
    return createHash('md5').update(code).digest('hex');
  }

  /**
   * Cache code analysis results
   */
  async cacheCodeAnalysis<T>(
    key: string,
    technology: string,
    analysisFunction: () => Promise<T>
  ): Promise<T> {
    const cacheKey = this.generateCacheKey('analysis', key, technology);

    // Try to get from cache first
    const cached = this.codeAnalysisCache.get(cacheKey);
    if (cached && this.config.enableStats) {
      this.stats.hits++;
      this.stats.totalRequests++;
      this.updateHitRate();
      return cached.data;
    }

    // Cache miss - perform analysis
    if (this.config.enableStats) {
      this.stats.misses++;
      this.stats.totalRequests++;
    }

    const startTime = Date.now();
    const result = await analysisFunction();
    const processingTime = Date.now() - startTime;

    // Store in cache
    const entry: CacheEntry<T> = {
      data: result,
      timestamp: Date.now(),
      processingTime,
      technology,
      hash: this.hashCode(JSON.stringify(result)),
    };

    this.codeAnalysisCache.set(cacheKey, entry);
    this.updateStats(processingTime);

    return result;
  }

  /**
   * Cache technology insights
   */
  async cacheTechnologyInsights<T>(
    technology: string,
    context: any,
    insightsFunction: () => Promise<T>
  ): Promise<T> {
    const cacheKey = this.generateCacheKey('insights', technology, technology, context);

    const cached = this.technologyInsightsCache.get(cacheKey);
    if (cached) {
      if (this.config.enableStats) {
        this.stats.hits++;
        this.stats.totalRequests++;
        this.updateHitRate();
      }
      return cached.data;
    }

    if (this.config.enableStats) {
      this.stats.misses++;
      this.stats.totalRequests++;
    }

    const startTime = Date.now();
    const result = await insightsFunction();
    const processingTime = Date.now() - startTime;

    const entry: CacheEntry<T> = {
      data: result,
      timestamp: Date.now(),
      processingTime,
      technology,
      hash: this.hashCode(JSON.stringify(result)),
    };

    this.technologyInsightsCache.set(cacheKey, entry);
    this.updateStats(processingTime);

    return result;
  }

  /**
   * Cache code generation results
   */
  async cacheCodeGeneration(
    request: any,
    generationFunction: () => Promise<string>
  ): Promise<string> {
    const cacheKey = this.generateCacheKey(
      'generation',
      request.featureDescription,
      request.techStack?.[0] || 'generic',
      request.role,
      request.quality
    );

    const cached = this.codeGenerationCache.get(cacheKey);
    if (cached) {
      if (this.config.enableStats) {
        this.stats.hits++;
        this.stats.totalRequests++;
        this.updateHitRate();
      }
      return cached.data;
    }

    if (this.config.enableStats) {
      this.stats.misses++;
      this.stats.totalRequests++;
    }

    const startTime = Date.now();
    const result = await generationFunction();
    const processingTime = Date.now() - startTime;

    const entry: CacheEntry<string> = {
      data: result,
      timestamp: Date.now(),
      processingTime,
      technology: request.techStack?.[0] || 'generic',
      hash: this.hashCode(result),
    };

    this.codeGenerationCache.set(cacheKey, entry);
    this.updateStats(processingTime);

    return result;
  }

  /**
   * Cache validation results
   */
  async cacheValidation<T>(
    code: string,
    technology: string,
    validationFunction: () => Promise<T>
  ): Promise<T> {
    const cacheKey = this.generateCacheKey('validation', code, technology);

    const cached = this.validationCache.get(cacheKey);
    if (cached) {
      if (this.config.enableStats) {
        this.stats.hits++;
        this.stats.totalRequests++;
        this.updateHitRate();
      }
      return cached.data;
    }

    if (this.config.enableStats) {
      this.stats.misses++;
      this.stats.totalRequests++;
    }

    const startTime = Date.now();
    const result = await validationFunction();
    const processingTime = Date.now() - startTime;

    const entry: CacheEntry<T> = {
      data: result,
      timestamp: Date.now(),
      processingTime,
      technology,
      hash: this.hashCode(JSON.stringify(result)),
    };

    this.validationCache.set(cacheKey, entry);
    this.updateStats(processingTime);

    return result;
  }

  /**
   * Preload cache with common patterns
   */
  async warmCache(
    commonPatterns: Array<{
      code: string;
      technology: string;
      operation: string;
    }>
  ): Promise<void> {
    console.log(`[PerformanceCache] Warming cache with ${commonPatterns.length} patterns`);

    for (const pattern of commonPatterns) {
      const cacheKey = this.generateCacheKey(pattern.operation, pattern.code, pattern.technology);

      // Simulate quick analysis for warming
      const entry: CacheEntry<any> = {
        data: { warmed: true, technology: pattern.technology },
        timestamp: Date.now(),
        processingTime: 0,
        technology: pattern.technology,
        hash: this.hashCode(pattern.code),
      };

      switch (pattern.operation) {
        case 'analysis':
          this.codeAnalysisCache.set(cacheKey, entry);
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
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.codeAnalysisCache.clear();
    this.technologyInsightsCache.clear();
    this.codeGenerationCache.clear();
    this.validationCache.clear();

    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalRequests: 0,
      totalSize: 0,
      averageProcessingTime: 0,
    };

    console.log('[PerformanceCache] All caches cleared');
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return {
      ...this.stats,
      totalSize:
        this.codeAnalysisCache.size +
        this.technologyInsightsCache.size +
        this.codeGenerationCache.size +
        this.validationCache.size,
    };
  }

  /**
   * Get cache configuration
   */
  getConfig(): CacheConfig {
    return { ...this.config };
  }

  /**
   * Update cache configuration
   */
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Private methods for stats management
   */
  private updateHitRate(): void {
    if (this.stats.totalRequests > 0) {
      this.stats.hitRate = (this.stats.hits / this.stats.totalRequests) * 100;
    }
  }

  private updateStats(processingTime: number): void {
    this.updateHitRate();

    // Update average processing time
    const totalTime =
      this.stats.averageProcessingTime * (this.stats.totalRequests - 1) + processingTime;
    this.stats.averageProcessingTime = totalTime / this.stats.totalRequests;
  }
}

// Singleton instance for global use
export const globalPerformanceCache = new PerformanceCache({
  maxSize: 2000,
  maxAge: 1000 * 60 * 45, // 45 minutes
  enableCompression: true,
  enableStats: true,
});
