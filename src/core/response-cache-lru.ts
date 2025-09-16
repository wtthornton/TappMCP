/**
 * In-Memory Response Caching System for TappMCP
 * Uses LRU cache for maximum performance and simplicity
 * Target: 40% response time improvement
 */

import { LRUCache } from 'lru-cache';
import { performance } from 'perf_hooks';

export interface CacheConfig {
  maxSize: number;
  ttl: number; // Time to live in milliseconds
  updateAgeOnGet: boolean;
  allowStale: boolean;
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  averageResponseTime: number;
  totalRequests: number;
  cacheSize: number;
  memoryUsage: number;
}

export interface CachedResponse {
  data: any;
  timestamp: number;
  ttl: number;
  metadata: {
    source: string;
    version: string;
    tags: string[];
  };
}

export class ResponseCacheLRU {
  private cache: LRUCache<string, CachedResponse>;
  private config: CacheConfig;
  private metrics: CacheMetrics;
  private responseTimes: number[] = [];

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: config.maxSize ?? 1000,
      ttl: config.ttl ?? 24 * 60 * 60 * 1000, // 24 hours default
      updateAgeOnGet: config.updateAgeOnGet ?? true,
      allowStale: config.allowStale ?? false,
      ...config
    };

    this.metrics = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      averageResponseTime: 0,
      totalRequests: 0,
      cacheSize: 0,
      memoryUsage: 0
    };

    // Initialize LRU cache
    this.cache = new LRUCache<string, CachedResponse>({
      max: this.config.maxSize,
      ttl: this.config.ttl,
      updateAgeOnGet: this.config.updateAgeOnGet,
      allowStale: this.config.allowStale,
      dispose: (value, key) => {
        console.log(`🗑️ Cache evicted: ${key}`);
      }
    });

    console.log(`✅ ResponseCacheLRU initialized: max=${this.config.maxSize}, ttl=${this.config.ttl}ms`);
  }

  /**
   * Get cached response
   */
  async get(key: string, namespace?: string): Promise<any> {
    const startTime = performance.now();
    const cacheKey = this.generateCacheKey(key, namespace);

    try {
      const cached = this.cache.get(cacheKey);

      if (cached) {
        // Check if expired
        if (Date.now() - cached.timestamp > cached.ttl) {
          this.cache.delete(cacheKey);
          this.recordMiss();
          return null;
        }

        this.recordHit();
        const responseTime = performance.now() - startTime;
        this.recordResponseTime(responseTime);

        console.log(`✅ Cache HIT: ${cacheKey} (${responseTime.toFixed(2)}ms)`);
        return cached.data;
      } else {
        this.recordMiss();
        const responseTime = performance.now() - startTime;
        this.recordResponseTime(responseTime);

        console.log(`❌ Cache MISS: ${cacheKey} (${responseTime.toFixed(2)}ms)`);
        return null;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      this.recordMiss();
      return null;
    }
  }

  /**
   * Set cached response
   */
  async set(
    key: string,
    data: any,
    ttl?: number,
    namespace?: string,
    tags?: string[]
  ): Promise<void> {
    const cacheKey = this.generateCacheKey(key, namespace);
    const now = Date.now();

    const cachedResponse: CachedResponse = {
      data,
      timestamp: now,
      ttl: ttl || this.config.ttl,
      metadata: {
        source: 'tappmcp',
        version: '2.0.0',
        tags: tags || []
      }
    };

    try {
      this.cache.set(cacheKey, cachedResponse);
      this.updateMetrics();

      console.log(`💾 Cache SET: ${cacheKey} (ttl: ${ttl || this.config.ttl}ms)`);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Delete cached response
   */
  async delete(key: string, namespace?: string): Promise<void> {
    const cacheKey = this.generateCacheKey(key, namespace);
    this.cache.delete(cacheKey);
    this.updateMetrics();
    console.log(`🗑️ Cache DELETE: ${cacheKey}`);
  }

  /**
   * Invalidate cached response (alias for delete)
   */
  async invalidate(key: string, namespace?: string): Promise<void> {
    return this.delete(key, namespace);
  }

  /**
   * Clear all cached responses
   */
  async clear(): Promise<void> {
    this.cache.clear();
    this.updateMetrics();
    console.log('🧹 Cache CLEARED');
  }

  /**
   * Invalidate by tags
   */
  async invalidateByTags(tags: string[]): Promise<void> {
    let invalidated = 0;

    for (const [key, value] of this.cache.entries()) {
      if (value.metadata.tags.some(tag => tags.includes(tag))) {
        this.cache.delete(key);
        invalidated++;
      }
    }

    this.updateMetrics();
    console.log(`🏷️ Cache invalidated by tags: ${tags.join(', ')} (${invalidated} items)`);
  }

  /**
   * Get cache metrics
   */
  async getMetrics(): Promise<CacheMetrics> {
    this.updateMetrics();
    return { ...this.metrics };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; details: any }> {
    this.updateMetrics();

    return {
      status: 'healthy',
      details: {
        cacheSize: this.cache.size,
        maxSize: this.config.maxSize,
        hitRate: this.metrics.hitRate,
        memoryUsage: this.metrics.memoryUsage,
        uptime: process.uptime()
      }
    };
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(key: string, namespace?: string): string {
    return namespace ? `${namespace}:${key}` : key;
  }

  /**
   * Record cache hit
   */
  private recordHit(): void {
    this.metrics.hits++;
    this.metrics.totalRequests++;
    this.updateHitRate();
  }

  /**
   * Record cache miss
   */
  private recordMiss(): void {
    this.metrics.misses++;
    this.metrics.totalRequests++;
    this.updateHitRate();
  }

  /**
   * Record response time
   */
  private recordResponseTime(time: number): void {
    this.responseTimes.push(time);

    // Keep only last 100 response times
    if (this.responseTimes.length > 100) {
      this.responseTimes = this.responseTimes.slice(-100);
    }

    this.metrics.averageResponseTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    if (this.metrics.totalRequests > 0) {
      this.metrics.hitRate = this.metrics.hits / this.metrics.totalRequests;
    }
  }

  /**
   * Update metrics
   */
  private updateMetrics(): void {
    this.metrics.cacheSize = this.cache.size;
    this.metrics.memoryUsage = process.memoryUsage().heapUsed;
  }
}

/**
 * Create response cache instance
 */
export async function createResponseCacheLRU(config?: Partial<CacheConfig>): Promise<ResponseCacheLRU> {
  return new ResponseCacheLRU(config);
}

/**
 * Default cache configuration
 */
export const defaultCacheConfigLRU: CacheConfig = {
  maxSize: 1000,
  ttl: 24 * 60 * 60 * 1000, // 24 hours
  updateAgeOnGet: true,
  allowStale: false
};

/**
 * Cache middleware for Express
 */
export function cacheMiddlewareLRU(
  cache: ResponseCacheLRU,
  options: {
    ttl?: number;
    namespace?: string;
    tags?: string[];
    skipCache?: (req: any) => boolean;
  } = {}
) {
  return async (req: any, res: any, next: any) => {
    const { ttl, namespace, tags, skipCache } = options;

    if (skipCache && skipCache(req)) {
      return next();
    }

    const cacheKey = `${req.method}:${req.originalUrl}`;
    const cached = await cache.get(cacheKey, namespace);

    if (cached) {
      return res.json(cached);
    }

    // Store original res.json
    const originalJson = res.json.bind(res);

    res.json = (data: any) => {
      // Cache the response
      cache.set(cacheKey, data, ttl, namespace, tags);
      return originalJson(data);
    };

    next();
  };
}
