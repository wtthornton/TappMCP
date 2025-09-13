#!/usr/bin/env node

/**
 * Context7 Cache - Smart Caching Layer for Context7 Integration
 *
 * Extends MCPCoordinator to provide intelligent caching and data enhancement
 * for Context7 knowledge retrieval across all TappMCP tools.
 */

import {
  MCPCoordinator,
  type ExternalKnowledge,
  type KnowledgeRequest,
  type MCPCoordinatorConfig,
} from './mcp-coordinator.js';
import { Context7Broker } from '../brokers/context7-broker.js';
import { LRUCache } from 'lru-cache';
import { gzip, gunzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

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
  compressed?: boolean;
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
  averageProcessingTime: number;
  memoryUsage: number;
  topHitKeys: string[];
}

/**
 * Context7 Cache - Extends MCPCoordinator with smart caching
 */
export class Context7Cache extends MCPCoordinator {
  private cache: LRUCache<string, CachedData>;
  private cacheConfig: Context7CacheConfig;
  private stats = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    responseTimes: [] as number[],
  };

  constructor(cacheConfig: Partial<Context7CacheConfig> = {}) {
    // Skip Context7 initialization if flag is set
    if (process.env.SKIP_CONTEXT7_INIT === 'true') {
      // Initialize with minimal config to avoid Context7 connections
      super({
        timeout: 100,
        maxConcurrentRequests: 1,
        enableFallbacks: false,
        healthCheckInterval: 0,
      });
    } else {
      super(); // Initialize MCPCoordinator
    }

    this.cacheConfig = {
      maxCacheSize: cacheConfig.maxCacheSize ?? 1000,
      defaultExpiryHours: cacheConfig.defaultExpiryHours ?? 7 * 24, // 7 DAYS
      enableVersionChecking: cacheConfig.enableVersionChecking ?? true,
      enableHitTracking: cacheConfig.enableHitTracking ?? true,
      enableCompression: cacheConfig.enableCompression ?? true, // Enable compression by default
      timeout: cacheConfig.timeout ?? 30000,
      maxConcurrentRequests: cacheConfig.maxConcurrentRequests ?? 10,
      enableFallbacks: cacheConfig.enableFallbacks ?? true,
      healthCheckInterval: cacheConfig.healthCheckInterval ?? 60000,
    };

    // Initialize LRU cache with proper configuration
    this.cache = new LRUCache<string, CachedData>({
      max: this.cacheConfig.maxCacheSize,
      ttl: this.cacheConfig.defaultExpiryHours * 60 * 60 * 1000, // Convert hours to milliseconds
      updateAgeOnGet: true,
      allowStale: false,
    });

    // Context7Cache initialized with LRU caching
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
      const cachedData = await this.getCachedData(cacheKey);
      if (cachedData) {
        this.recordHit(cacheKey);
        // Context7 cache hit
        return cachedData;
      }

      // Cache miss - fetch from Context7
      // Context7 cache miss, fetching data
      const knowledge = await this.fetchContext7Knowledge(input);

      // Cache the results
      await this.setCachedData(cacheKey, knowledge);

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
  private async getCachedData(key: string): Promise<ExternalKnowledge[] | null> {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // LRU cache handles expiry automatically, but we keep manual check for compatibility
    const now = Date.now();
    if (now > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    // Update access tracking
    if (this.cacheConfig.enableHitTracking) {
      cached.lastAccessed = now;
    }

    // Decompress data if needed
    if (cached.compressed) {
      try {
        return await this.decompressData(cached.data);
      } catch (error) {
        console.warn('Failed to decompress cached data:', error);
        this.cache.delete(key);
        return null;
      }
    }

    return cached.data;
  }

  /**
   * Cache data with expiry and version checking
   */
  private async setCachedData(key: string, data: ExternalKnowledge[]): Promise<void> {
    const now = Date.now();
    const expiry = now + this.cacheConfig.defaultExpiryHours * 60 * 60 * 1000;

    // Compress data if needed and enabled
    let finalData = data;
    let compressed = false;

    if (this.cacheConfig.enableCompression) {
      const compressionResult = await this.compressIfNeeded(data);
      finalData = compressionResult.data;
      compressed = compressionResult.compressed;
    }

    // LRU cache handles size limits automatically, no need for manual eviction
    this.cache.set(key, {
      data: finalData,
      timestamp: now,
      expiry,
      version: this.getCurrentVersion(),
      hitCount: 0,
      lastAccessed: now,
      compressed,
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
      (input.businessRequest || 'unknown').toLowerCase().replace(/\s+/g, '-'),
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
   * Compress data if it's larger than threshold
   */
  private async compressIfNeeded(data: any): Promise<{ data: any; compressed: boolean }> {
    const serialized = JSON.stringify(data);
    const size = Buffer.byteLength(serialized, 'utf8');

    if (size > 1024) {
      // 1KB threshold
      try {
        const compressed = await gzipAsync(serialized);
        return {
          data: compressed.toString('base64'),
          compressed: true,
        };
      } catch (error) {
        console.warn('Compression failed, storing uncompressed:', error);
        return { data, compressed: false };
      }
    }

    return { data, compressed: false };
  }

  /**
   * Decompress data if it was compressed
   */
  private async decompressData(compressedData: any): Promise<ExternalKnowledge[]> {
    try {
      const buffer = Buffer.from(compressedData, 'base64');
      const decompressed = await gunzipAsync(buffer);
      return JSON.parse(decompressed.toString('utf8'));
    } catch (error) {
      console.warn('Decompression failed:', error);
      throw error;
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
    const hitRate = this.stats.totalRequests > 0 ? this.stats.hits / this.stats.totalRequests : 0;

    const missRate = 1 - hitRate;

    const averageResponseTime =
      this.stats.responseTimes.length > 0
        ? this.stats.responseTimes.reduce((sum, time) => sum + time, 0) /
          this.stats.responseTimes.length
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
      averageProcessingTime: averageResponseTime, // Use same value for now
      memoryUsage,
      topHitKeys,
    };
  }

  /**
   * Warm cache with common patterns
   */
  async warmCache(): Promise<void> {
    const commonPatterns = [
      'HTML5 accessibility WCAG 2.1 best practices',
      'TypeScript strict mode patterns',
      'React component optimization',
      'Node.js security headers',
      'CSS responsive design patterns',
    ];

    console.log('🔥 Warming Context7 cache with common patterns...');

    for (const pattern of commonPatterns) {
      try {
        await this.getRelevantData({
          businessRequest: pattern,
          domain: 'general',
          priority: 'medium',
          maxResults: 3,
        });
      } catch (error) {
        console.warn(`Failed to warm pattern: ${pattern}`, error);
      }
    }

    console.log('✅ Cache warming completed');
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
    return stats.hitRate >= 0.3 && stats.averageResponseTime < 3000; // 3 seconds for Context7
  }
}

// Export factory function
export function createContext7Cache(config?: Partial<Context7CacheConfig>): Context7Cache {
  return new Context7Cache(config);
}
