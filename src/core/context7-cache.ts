#!/usr/bin/env node

/**
 * Context7 Cache - Smart Caching Layer for Context7 Integration
 *
 * Extends MCPCoordinator to provide intelligent caching and data enhancement
 * for Context7 knowledge retrieval across all TappMCP tools.
 */

import { MCPCoordinator, type ExternalKnowledge, type KnowledgeRequest, type MCPCoordinatorConfig } from './mcp-coordinator.js';
import { Context7Broker } from '../brokers/context7-broker.js';

/**
 * Cached Data Entry
 */
export interface CachedData {
  data: ExternalKnowledge[];
  timestamp: number;
  expiry: number;
  version: string;
  hitCount: number;
  lastAccessed: number;
}

/**
 * Context7 Cache Configuration
 */
export interface Context7CacheConfig extends MCPCoordinatorConfig {
  maxCacheSize: number;
  defaultExpiryHours: number;
  enableVersionChecking: boolean;
  enableHitTracking: boolean;
  enableCompression: boolean;
}

/**
 * Cache Statistics
 */
export interface CacheStats {
  totalEntries: number;
  hitRate: number;
  missRate: number;
  averageResponseTime: number;
  memoryUsage: number;
  topHitKeys: string[];
}

/**
 * Context7 Cache - Extends MCPCoordinator with smart caching
 */
export class Context7Cache extends MCPCoordinator {
  private cache = new Map<string, CachedData>();
  private cacheConfig: Context7CacheConfig;
  private stats = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    responseTimes: [] as number[],
  };

  constructor(cacheConfig: Partial<Context7CacheConfig> = {}) {
    super(); // Initialize MCPCoordinator

    this.cacheConfig = {
      maxCacheSize: cacheConfig.maxCacheSize ?? 1000,
      defaultExpiryHours: cacheConfig.defaultExpiryHours ?? 36,
      enableVersionChecking: cacheConfig.enableVersionChecking ?? true,
      enableHitTracking: cacheConfig.enableHitTracking ?? true,
      enableCompression: cacheConfig.enableCompression ?? false,
      timeout: cacheConfig.timeout ?? 30000,
      maxConcurrentRequests: cacheConfig.maxConcurrentRequests ?? 10,
      enableFallbacks: cacheConfig.enableFallbacks ?? true,
      healthCheckInterval: cacheConfig.healthCheckInterval ?? 60000,
    };

    console.log('Context7Cache initialized with smart caching');
  }

  /**
   * Get relevant Context7 data with smart caching
   */
  async getRelevantData(input: {
    businessRequest: string;
    projectId?: string;
    domain?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    maxResults?: number;
  }): Promise<ExternalKnowledge[]> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(input);

    // Always record total requests
    this.stats.totalRequests++;

    try {
      // Check cache first
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        this.recordHit(cacheKey);
        console.log(`📦 Context7 cache hit for: ${input.businessRequest}`);
        return cachedData;
      }

      // Cache miss - fetch from Context7
      console.log(`🔄 Context7 cache miss, fetching: ${input.businessRequest}`);
      const knowledge = await this.fetchContext7Knowledge(input);

      // Cache the results
      this.setCachedData(cacheKey, knowledge);

      // Record performance
      const responseTime = Date.now() - startTime;
      this.recordResponseTime(responseTime);

      return knowledge;
    } catch (error) {
      console.error(`Context7 cache error for ${input.businessRequest}:`, error);
      this.recordMiss();

      // Fallback to basic Context7 broker
      const knowledgeRequest: KnowledgeRequest = {
        projectId: input.projectId || `cache_${Date.now()}`,
        businessRequest: input.businessRequest,
        domain: input.domain || 'general',
        priority: input.priority || 'medium',
        sources: {
          useContext7: true,
          useWebSearch: false,
          useMemory: false,
        },
        maxResults: input.maxResults || 5,
      };
      return this.getContext7FallbackKnowledge(knowledgeRequest);
    }
  }

  /**
   * Get cached data if available and not expired
   */
  private getCachedData(key: string): ExternalKnowledge[] | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    // Update access tracking
    if (this.cacheConfig.enableHitTracking) {
      cached.lastAccessed = now;
    }

    return cached.data;
  }

  /**
   * Cache data with expiry and version checking
   */
  private setCachedData(key: string, data: ExternalKnowledge[]): void {
    const now = Date.now();
    const expiry = now + this.cacheConfig.defaultExpiryHours * 60 * 60 * 1000;

    // Check cache size limit
    if (this.cache.size >= this.cacheConfig.maxCacheSize) {
      this.evictOldestEntry();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiry,
      version: this.getCurrentVersion(),
      hitCount: 0,
      lastAccessed: now,
    });
  }

  /**
   * Generate cache key from input parameters
   */
  private generateCacheKey(input: {
    businessRequest: string;
    projectId?: string;
    domain?: string;
    priority?: string;
  }): string {
    const parts = [
      input.businessRequest.toLowerCase().replace(/\s+/g, '-'),
      input.domain?.toLowerCase() || 'general',
      input.priority || 'medium',
    ];
    return parts.join(':');
  }

  /**
   * Fetch knowledge from Context7 broker
   */
  private async fetchContext7Knowledge(input: {
    businessRequest: string;
    projectId?: string;
    domain?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    maxResults?: number;
  }): Promise<ExternalKnowledge[]> {
    const knowledgeRequest: KnowledgeRequest = {
      projectId: input.projectId || `cache_${Date.now()}`,
      businessRequest: input.businessRequest,
      domain: input.domain || 'general',
      priority: input.priority || 'medium',
      sources: {
        useContext7: true,
        useWebSearch: false,
        useMemory: false,
      },
      maxResults: input.maxResults || 5,
    };

    return this.gatherKnowledge(knowledgeRequest);
  }

  /**
   * Get fallback knowledge when Context7 fails
   */
  private getContext7FallbackKnowledge(request: KnowledgeRequest): ExternalKnowledge[] {
    return [
      {
        id: `fallback-${request.businessRequest}-${Date.now()}`,
        source: 'context7',
        type: 'documentation',
        title: `${request.businessRequest} - Basic Information`,
        content: `Basic information about ${request.businessRequest}. Context7 service temporarily unavailable.`,
        relevanceScore: 0.5,
        retrievalTime: Date.now(),
        metadata: {
          fallback: true,
          topic: request.businessRequest,
          domain: request.domain || 'general',
        },
      },
    ];
  }

  /**
   * Evict oldest cache entry when size limit reached
   */
  private evictOldestEntry(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log(`🗑️ Evicted oldest cache entry: ${oldestKey}`);
    }
  }

  /**
   * Get current version for cache entries
   */
  private getCurrentVersion(): string {
    return this.cacheConfig.enableVersionChecking ? '1.0.0' : 'no-version';
  }

  /**
   * Record cache hit
   */
  private recordHit(key: string): void {
    this.stats.hits++;

    if (this.cacheConfig.enableHitTracking) {
      const cached = this.cache.get(key);
      if (cached) {
        cached.hitCount++;
      }
    }
  }

  /**
   * Record cache miss
   */
  private recordMiss(): void {
    this.stats.misses++;
    this.stats.totalRequests++;
  }

  /**
   * Record response time
   */
  private recordResponseTime(time: number): void {
    this.stats.responseTimes.push(time);

    // Keep only last 100 response times
    if (this.stats.responseTimes.length > 100) {
      this.stats.responseTimes.shift();
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStats {
    const hitRate = this.stats.totalRequests > 0
      ? this.stats.hits / this.stats.totalRequests
      : 0;

    const missRate = 1 - hitRate;

    const averageResponseTime = this.stats.responseTimes.length > 0
      ? this.stats.responseTimes.reduce((sum, time) => sum + time, 0) / this.stats.responseTimes.length
      : 0;

    // Calculate memory usage (rough estimate)
    let memoryUsage = 0;
    for (const entry of this.cache.values()) {
      memoryUsage += JSON.stringify(entry).length * 2; // UTF-16 bytes
    }

    // Get top hit keys
    const topHitKeys = Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, hits: entry.hitCount }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 5)
      .map(item => item.key);

    return {
      totalEntries: this.cache.size,
      hitRate,
      missRate,
      averageResponseTime,
      memoryUsage,
      topHitKeys,
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, totalRequests: 0, responseTimes: [] };
    console.log('🧹 Context7 cache cleared');
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * Check if cache is healthy
   */
  isHealthy(): boolean {
    const stats = this.getCacheStats();
    // For empty cache, consider it healthy
    if (stats.totalEntries === 0) return true;
    return stats.hitRate >= 0.3 && stats.averageResponseTime < 1000; // 1 second
  }
}

// Export factory function
export function createContext7Cache(config?: Partial<Context7CacheConfig>): Context7Cache {
  return new Context7Cache(config);
}
