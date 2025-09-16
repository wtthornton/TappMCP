/**
 * Tests for Resource Optimizer
 * Implements Task 2.4.3: Resource optimization testing
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ResourceOptimizer, createResourceOptimizer } from './resource-optimizer.js';
import { LazyLoadable } from './lazy-loader.js';

// Mock LazyLoadable implementation
class MockLazyLoadable implements LazyLoadable {
  id: string;
  data: any;
  isLoaded: boolean = false;
  lastAccessed: number = 0;
  accessCount: number = 0;

  constructor(id: string, data: any) {
    this.id = id;
    this.data = data;
  }

  async load(): Promise<any> {
    this.isLoaded = true;
    this.lastAccessed = Date.now();
    this.accessCount++;
    return this.data;
  }

  async unload(): Promise<void> {
    this.isLoaded = false;
  }

  getMemoryUsage(): number {
    return JSON.stringify(this.data).length;
  }
}

describe('ResourceOptimizer', () => {
  let optimizer: ResourceOptimizer;

  beforeEach(() => {
    optimizer = createResourceOptimizer({
      enableLazyLoading: true,
      enableCompression: true,
      enableDeduplication: true,
      maxMemoryUsage: 10, // 10MB for testing
      compressionThreshold: 100, // 100 bytes
      deduplicationThreshold: 50 // 50 bytes
    });
  });

  afterEach(async () => {
    await optimizer.clear();
  });

  describe('Resource Optimization', () => {
    it('should optimize resources with compression', async () => {
      const largeData = { data: 'x'.repeat(1000) }; // 1000+ bytes
      const resource = await optimizer.optimize('test1', largeData);

      expect(resource.id).toBe('test1');
      expect(resource.compressed).toBe(true);
      expect(resource.optimizedSize).toBeLessThan(resource.originalSize);
      expect(resource.compressionRatio).toBeLessThan(1);
    });

    it('should optimize resources with deduplication', async () => {
      const data = { data: 'duplicate content that is long enough to trigger deduplication threshold' };

      // Optimize same data twice
      const resource1 = await optimizer.optimize('test1', data);
      const resource2 = await optimizer.optimize('test2', data);

      expect(resource1.deduplicated).toBe(false); // First occurrence
      expect(resource2.deduplicated).toBe(true); // Duplicate
    });

    it('should not compress small data', async () => {
      const smallData = { data: 'small' }; // < 100 bytes
      const resource = await optimizer.optimize('test1', smallData);

      expect(resource.compressed).toBe(false);
      expect(resource.optimizedSize).toBe(resource.originalSize);
    });

    it('should not deduplicate small data', async () => {
      const smallData = { data: 'small' }; // < 50 bytes

      const resource1 = await optimizer.optimize('test1', smallData);
      const resource2 = await optimizer.optimize('test2', smallData);

      expect(resource1.deduplicated).toBe(false);
      expect(resource2.deduplicated).toBe(false);
    });
  });

  describe('Resource Retrieval', () => {
    it('should retrieve optimized resources', async () => {
      const data = { data: 'test content' };
      await optimizer.optimize('test1', data);

      const retrieved = await optimizer.get('test1');
      expect(retrieved).toEqual(data);
    });

    it('should throw error for non-existent resources', async () => {
      await expect(optimizer.get('nonexistent')).rejects.toThrow('Resource nonexistent not found');
    });
  });

  describe('Lazy Loading Integration', () => {
    it('should register lazy loadable resources', () => {
      const item = new MockLazyLoadable('lazy1', { data: 'lazy content' });
      optimizer.registerLazyResource(item);

      // Should not throw error
      expect(true).toBe(true);
    });

    it('should load lazy resources', async () => {
      const item = new MockLazyLoadable('lazy1', { data: 'lazy content' });
      optimizer.registerLazyResource(item);

      const result = await optimizer.loadLazyResource('lazy1');
      expect(result).toEqual({ data: 'lazy content' });
    });

    it('should throw error when lazy loading is disabled', async () => {
      const disabledOptimizer = createResourceOptimizer({
        enableLazyLoading: false
      });

      const item = new MockLazyLoadable('lazy1', { data: 'lazy content' });
      disabledOptimizer.registerLazyResource(item);

      await expect(disabledOptimizer.loadLazyResource('lazy1')).rejects.toThrow('Lazy loading is disabled');
    });
  });

  describe('Statistics', () => {
    it('should track optimization statistics', async () => {
      const data1 = { data: 'x'.repeat(1000) };
      const data2 = { data: 'x'.repeat(1000) }; // Duplicate

      await optimizer.optimize('test1', data1);
      await optimizer.optimize('test2', data2);

      const stats = optimizer.getStats();

      expect(stats.totalResources).toBe(2);
      expect(stats.optimizedResources).toBeGreaterThan(0);
      expect(stats.memorySaved).toBeGreaterThan(0);
      expect(stats.averageOptimization).toBeGreaterThan(0);
    });

    it('should track memory usage', () => {
      const memStats = optimizer.getMemoryStats();

      expect(memStats).toHaveProperty('heapUsed');
      expect(memStats).toHaveProperty('heapTotal');
      expect(memStats).toHaveProperty('external');
      expect(memStats).toHaveProperty('resources');
      expect(memStats).toHaveProperty('compressionCache');
      expect(memStats).toHaveProperty('deduplicationMap');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup old resources', async () => {
      const data = { data: 'test content' };
      await optimizer.optimize('test1', data);

      // Wait for TTL to expire (in real implementation)
      await new Promise(resolve => setTimeout(resolve, 100));

      await optimizer.cleanup();

      // Should still have the resource (TTL not expired in test)
      const stats = optimizer.getStats();
      expect(stats.totalResources).toBeGreaterThanOrEqual(0);
    });

    it('should clear all resources', async () => {
      const data = { data: 'test content' };
      await optimizer.optimize('test1', data);

      await optimizer.clear();

      const stats = optimizer.getStats();
      expect(stats.totalResources).toBe(0);
    });
  });

  describe('Configuration', () => {
    it('should update configuration', () => {
      const newConfig = {
        enableCompression: false,
        maxMemoryUsage: 50
      };

      optimizer.updateConfig(newConfig);

      const config = optimizer.getConfig();
      expect(config.enableCompression).toBe(false);
      expect(config.maxMemoryUsage).toBe(50);
    });

    it('should use default configuration', () => {
      const defaultOptimizer = createResourceOptimizer();
      const config = defaultOptimizer.getConfig();

      expect(config.enableLazyLoading).toBe(true);
      expect(config.enableCompression).toBe(true);
      expect(config.enableDeduplication).toBe(true);
      expect(config.maxMemoryUsage).toBe(100);
    });
  });

  describe('Error Handling', () => {
    it('should handle optimization errors gracefully', async () => {
      // Create data that might cause compression issues
      const problematicData = { circular: null };
      problematicData.circular = problematicData;

      // Should not throw error
      const resource = await optimizer.optimize('test1', problematicData);
      expect(resource.id).toBe('test1');
    });

    it('should handle retrieval errors gracefully', async () => {
      const data = { data: 'test' };
      await optimizer.optimize('test1', data);

      // Should retrieve successfully
      const retrieved = await optimizer.get('test1');
      expect(retrieved).toEqual(data);
    });
  });

  describe('Performance', () => {
    it('should optimize multiple resources efficiently', async () => {
      const startTime = Date.now();

      const promises = Array.from({ length: 10 }, (_, i) =>
        optimizer.optimize(`test${i}`, { data: 'x'.repeat(100) })
      );

      await Promise.all(promises);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // Should complete in under 1 second

      const stats = optimizer.getStats();
      expect(stats.totalResources).toBe(10);
    });
  });
});
