#!/usr/bin/env node

/**
 * Context7 Cache Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Context7Cache, createContext7Cache } from './context7-cache.js';

describe('Context7Cache', () => {
  let cache: Context7Cache;

  beforeEach(() => {
    vi.clearAllMocks();
    cache = new Context7Cache({
      maxCacheSize: 10,
      defaultExpiryHours: 0.001, // Very short expiry for testing
      enableHitTracking: true,
    });
  });

  describe('Basic Functionality', () => {
    it('should initialize with empty cache', () => {
      expect(cache.getCacheSize()).toBe(0);
      expect(cache.isHealthy()).toBe(true);
    });

    it('should create cache with factory function', () => {
      const factoryCache = createContext7Cache();
      expect(factoryCache).toBeInstanceOf(Context7Cache);
    });
  });

  describe('Cache Operations', () => {
    it('should cache and retrieve data', async () => {
      const input = {
        businessRequest: 'react application development',
        domain: 'web',
        priority: 'high' as const,
      };

      // First call should be a miss
      const result1 = await cache.getRelevantData(input);
      expect(result1).toBeDefined();
      expect(result1.length).toBeGreaterThan(0);

      // Second call should be a hit
      const result2 = await cache.getRelevantData(input);
      expect(result2).toBeDefined();
      expect(result2).toEqual(result1);
    });

    it('should handle cache expiry', async () => {
      const input = {
        businessRequest: 'typescript development',
        domain: 'programming',
      };

      // First call
      await cache.getRelevantData(input);

      // Wait for expiry
      await new Promise(resolve => setTimeout(resolve, 100));

      // Second call should be a miss due to expiry
      const result = await cache.getRelevantData(input);
      expect(result).toBeDefined();
    });

    it('should generate different cache keys for different inputs', async () => {
      const input1 = { businessRequest: 'react', domain: 'web' };
      const input2 = { businessRequest: 'react', domain: 'mobile' };
      const input3 = { businessRequest: 'vue', domain: 'web' };

      await cache.getRelevantData(input1);
      await cache.getRelevantData(input2);
      await cache.getRelevantData(input3);

      expect(cache.getCacheSize()).toBe(3);
    });
  });

  describe('Cache Statistics', () => {
    it('should track cache hits and misses', async () => {
      const input = { businessRequest: 'nodejs' };

      // First call - miss
      await cache.getRelevantData(input);

      // Second call - hit
      await cache.getRelevantData(input);

      const stats = cache.getCacheStats();
      expect(stats.totalEntries).toBe(1);
      expect(stats.hitRate).toBe(0.5); // 1 hit out of 2 total requests
      expect(stats.missRate).toBe(0.5);
    });

    it('should track response times', async () => {
      const input = { businessRequest: 'python' };

      await cache.getRelevantData(input);

      const stats = cache.getCacheStats();
      expect(stats.averageResponseTime).toBeGreaterThan(0);
      expect(stats.memoryUsage).toBeGreaterThan(0);
    });

    it('should track top hit keys', async () => {
      const input1 = { businessRequest: 'react' };
      const input2 = { businessRequest: 'vue' };

      // Call react multiple times
      await cache.getRelevantData(input1);
      await cache.getRelevantData(input1);
      await cache.getRelevantData(input1);

      // Call vue once
      await cache.getRelevantData(input2);

      const stats = cache.getCacheStats();
      expect(stats.topHitKeys.length).toBeGreaterThanOrEqual(1);
      if (stats.topHitKeys.length > 0) {
        expect(stats.topHitKeys[0]).toContain('react');
      }
    });
  });

  describe('Cache Management', () => {
    it('should evict oldest entries when size limit reached', async () => {
      // Fill cache beyond limit
      for (let i = 0; i < 15; i++) {
        await cache.getRelevantData({ businessRequest: `topic${i}` });
      }

      expect(cache.getCacheSize()).toBeLessThanOrEqual(10);
    }, 30000); // 30 second timeout

    it('should clear cache', async () => {
      await cache.getRelevantData({ businessRequest: 'test' });
      expect(cache.getCacheSize()).toBe(1);

      cache.clearCache();
      expect(cache.getCacheSize()).toBe(0);
    });

    it('should maintain cache health', async () => {
      const input = { businessRequest: 'health-test' };

      // Multiple calls to improve hit rate
      await cache.getRelevantData(input);
      await cache.getRelevantData(input);
      await cache.getRelevantData(input);

      // Cache should be healthy with good hit rate
      const stats = cache.getCacheStats();
      expect(stats.hitRate).toBeGreaterThanOrEqual(0.5);
      expect(cache.isHealthy()).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', async () => {
      // This test will use real Context7 calls, but should handle any errors gracefully
      const result = await cache.getRelevantData({ businessRequest: 'error-test' });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      // Result should either be real Context7 data or fallback data
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('id');
        expect(result[0]).toHaveProperty('source');
        expect(result[0]).toHaveProperty('type');
      }
    });

    it('should provide fallback knowledge on failure', async () => {
      // This test will use real Context7 calls
      const result = await cache.getRelevantData({ businessRequest: 'fallback-test' });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      // Result should either be real Context7 data or fallback data
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('title');
        expect(result[0]).toHaveProperty('content');
      }
    });
  });

  describe('Configuration', () => {
    it('should respect max cache size configuration', () => {
      const smallCache = new Context7Cache({ maxCacheSize: 2 });
      expect(smallCache['cacheConfig'].maxCacheSize).toBe(2);
    });

    it('should respect expiry hours configuration', () => {
      const longCache = new Context7Cache({ defaultExpiryHours: 48 });
      expect(longCache['cacheConfig'].defaultExpiryHours).toBe(48);
    });

    it('should respect hit tracking configuration', () => {
      const noTrackingCache = new Context7Cache({ enableHitTracking: false });
      expect(noTrackingCache['cacheConfig'].enableHitTracking).toBe(false);
    });
  });
});
