#!/usr/bin/env node
/**
 * Context7 Cache - Smart Caching Layer for Context7 Integration
 *
 * Extends MCPCoordinator to provide intelligent caching and data enhancement
 * for Context7 knowledge retrieval across all TappMCP tools.
 */
import { MCPCoordinator, } from './mcp-coordinator.js';
/**
 * Context7 Cache - Extends MCPCoordinator with smart caching
 */
export class Context7Cache extends MCPCoordinator {
    cache = new Map();
    cacheConfig;
    stats = {
        hits: 0,
        misses: 0,
        totalRequests: 0,
        responseTimes: [],
    };
    constructor(cacheConfig = {}) {
        super(); // Initialize MCPCoordinator
        this.cacheConfig = {
            maxCacheSize: cacheConfig.maxCacheSize ?? 1000,
            defaultExpiryHours: cacheConfig.defaultExpiryHours ?? 72,
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
    async getRelevantData(input) {
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
        }
        catch (error) {
            console.error(`Context7 cache error for ${input.businessRequest}:`, error);
            this.recordMiss();
            // Fallback to basic Context7 broker
            const knowledgeRequest = {
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
    getCachedData(key) {
        const cached = this.cache.get(key);
        if (!cached)
            return null;
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
    setCachedData(key, data) {
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
    generateCacheKey(input) {
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
    async fetchContext7Knowledge(input) {
        const knowledgeRequest = {
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
    getContext7FallbackKnowledge(request) {
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
    evictOldestEntry() {
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
    getCurrentVersion() {
        return this.cacheConfig.enableVersionChecking ? '1.0.0' : 'no-version';
    }
    /**
     * Record cache hit
     */
    recordHit(key) {
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
    recordMiss() {
        this.stats.misses++;
        this.stats.totalRequests++;
    }
    /**
     * Record response time
     */
    recordResponseTime(time) {
        this.stats.responseTimes.push(time);
        // Keep only last 100 response times
        if (this.stats.responseTimes.length > 100) {
            this.stats.responseTimes.shift();
        }
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
        const hitRate = this.stats.totalRequests > 0 ? this.stats.hits / this.stats.totalRequests : 0;
        const missRate = 1 - hitRate;
        const averageResponseTime = this.stats.responseTimes.length > 0
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
            memoryUsage,
            topHitKeys,
        };
    }
    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        this.stats = { hits: 0, misses: 0, totalRequests: 0, responseTimes: [] };
        console.log('🧹 Context7 cache cleared');
    }
    /**
     * Get cache size
     */
    getCacheSize() {
        return this.cache.size;
    }
    /**
     * Check if cache is healthy
     */
    isHealthy() {
        const stats = this.getCacheStats();
        // For empty cache, consider it healthy
        if (stats.totalEntries === 0)
            return true;
        return stats.hitRate >= 0.3 && stats.averageResponseTime < 3000; // 3 seconds for Context7
    }
}
// Export factory function
export function createContext7Cache(config) {
    return new Context7Cache(config);
}
//# sourceMappingURL=context7-cache.js.map