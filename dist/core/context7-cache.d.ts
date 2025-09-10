#!/usr/bin/env node
/**
 * Context7 Cache - Smart Caching Layer for Context7 Integration
 *
 * Extends MCPCoordinator to provide intelligent caching and data enhancement
 * for Context7 knowledge retrieval across all TappMCP tools.
 */
import { MCPCoordinator, type ExternalKnowledge, type MCPCoordinatorConfig } from './mcp-coordinator.js';
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
export declare class Context7Cache extends MCPCoordinator {
    private cache;
    private cacheConfig;
    private stats;
    constructor(cacheConfig?: Partial<Context7CacheConfig>);
    /**
     * Get relevant Context7 data with smart caching
     */
    getRelevantData(input: {
        businessRequest: string;
        projectId?: string;
        domain?: string;
        priority?: 'low' | 'medium' | 'high' | 'critical';
        maxResults?: number;
    }): Promise<ExternalKnowledge[]>;
    /**
     * Get cached data if available and not expired
     */
    private getCachedData;
    /**
     * Cache data with expiry and version checking
     */
    private setCachedData;
    /**
     * Generate cache key from input parameters
     */
    private generateCacheKey;
    /**
     * Fetch knowledge from Context7 broker
     */
    private fetchContext7Knowledge;
    /**
     * Get fallback knowledge when Context7 fails
     */
    private getContext7FallbackKnowledge;
    /**
     * Evict oldest cache entry when size limit reached
     */
    private evictOldestEntry;
    /**
     * Get current version for cache entries
     */
    private getCurrentVersion;
    /**
     * Record cache hit
     */
    private recordHit;
    /**
     * Record cache miss
     */
    private recordMiss;
    /**
     * Record response time
     */
    private recordResponseTime;
    /**
     * Get cache statistics
     */
    getCacheStats(): CacheStats;
    /**
     * Clear cache
     */
    clearCache(): void;
    /**
     * Get cache size
     */
    getCacheSize(): number;
    /**
     * Check if cache is healthy
     */
    isHealthy(): boolean;
}
export declare function createContext7Cache(config?: Partial<Context7CacheConfig>): Context7Cache;
//# sourceMappingURL=context7-cache.d.ts.map