/**
 * Tests for Lazy Loader
 * Implements Task 2.4.3: Lazy loading testing
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LazyLoader, createLazyLoader, LazyLoadable } from './lazy-loader.js';

// Mock LazyLoadable implementation
class MockLazyLoadable implements LazyLoadable {
  id: string;
  data: any;
  isLoaded: boolean = false;
  lastAccessed: number = 0;
  accessCount: number = 0;
  private loadTime: number = 0;

  constructor(id: string, data: any, loadTime: number = 10) {
    this.id = id;
    this.data = data;
    this.loadTime = loadTime;
  }

  async load(): Promise<any> {
    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, this.loadTime));
    this.isLoaded = true;
    this.lastAccessed = Date.now();
    this.accessCount++;
    return this.data;
  }

  async unload(): Promise<void> {
    // Simulate unloading time
    await new Promise(resolve => setTimeout(resolve, 5));
    this.isLoaded = false;
  }

  getMemoryUsage(): number {
    return JSON.stringify(this.data).length;
  }
}

describe('LazyLoader', () => {
  let lazyLoader: LazyLoader;

  beforeEach(() => {
    lazyLoader = createLazyLoader({
      maxMemoryUsage: 10, // 10MB for testing
      cleanupThreshold: 8, // 8MB threshold
      ttl: 1000, // 1 second for testing
      maxCacheSize: 10
    });
  });

  afterEach(async () => {
    try {
      await lazyLoader.clear();
    } catch (error) {
      // Ignore cleanup errors in tests
    }
  });

  describe('Registration', () => {
    it('should register lazy loadable items', () => {
      const item = new MockLazyLoadable('test1', { data: 'test' });
      lazyLoader.register(item);

      expect(lazyLoader.getUnloadedItems()).toContain('test1');
      expect(lazyLoader.getLoadedItems()).not.toContain('test1');
    });

    it('should not register duplicate items', () => {
      const item1 = new MockLazyLoadable('test1', { data: 'test' });
      const item2 = new MockLazyLoadable('test1', { data: 'test2' });

      lazyLoader.register(item1);
      lazyLoader.register(item2);

      expect(lazyLoader.getUnloadedItems()).toHaveLength(1);
    });
  });

  describe('Loading', () => {
    it('should load items on demand', async () => {
      const item = new MockLazyLoadable('test1', { data: 'test' });
      lazyLoader.register(item);

      const result = await lazyLoader.load('test1');

      expect(result).toEqual({ data: 'test' });
      expect(lazyLoader.getLoadedItems()).toContain('test1');
      expect(lazyLoader.getUnloadedItems()).not.toContain('test1');
    });

    it('should return cached items without reloading', async () => {
      const item = new MockLazyLoadable('test1', { data: 'test' });
      lazyLoader.register(item);

      // First load
      const result1 = await lazyLoader.load('test1');
      const accessCount1 = item.accessCount;

      // Second load (should be cached)
      const result2 = await lazyLoader.load('test1');
      const accessCount2 = item.accessCount;

      expect(result1).toEqual({ data: 'test' });
      expect(result2).toEqual({ data: 'test' });
      expect(accessCount2).toBe(accessCount1 + 1); // Should increment access count
    });

    it('should throw error for unregistered items', async () => {
      await expect(lazyLoader.load('nonexistent')).rejects.toThrow('Item nonexistent not registered');
    });
  });

  describe('Unloading', () => {
    it('should unload items to free memory', async () => {
      const item = new MockLazyLoadable('test1', { data: 'test' });
      lazyLoader.register(item);

      await lazyLoader.load('test1');
      expect(lazyLoader.getLoadedItems()).toContain('test1');

      await lazyLoader.unload('test1');
      expect(lazyLoader.getLoadedItems()).not.toContain('test1');
      expect(lazyLoader.getUnloadedItems()).toContain('test1');
    });

    it('should handle unloading unloaded items gracefully', async () => {
      const item = new MockLazyLoadable('test1', { data: 'test' });
      lazyLoader.register(item);

      // Try to unload before loading
      await lazyLoader.unload('test1');
      expect(lazyLoader.getUnloadedItems()).toContain('test1');
    });
  });

  describe('Batch Operations', () => {
    it('should preload multiple items', async () => {
      const items = [
        new MockLazyLoadable('test1', { data: 'test1' }),
        new MockLazyLoadable('test2', { data: 'test2' }),
        new MockLazyLoadable('test3', { data: 'test3' })
      ];

      items.forEach(item => lazyLoader.register(item));

      await lazyLoader.preload(['test1', 'test2', 'test3']);

      expect(lazyLoader.getLoadedItems()).toHaveLength(3);
      expect(lazyLoader.getUnloadedItems()).toHaveLength(0);
    });

    it('should unload multiple items', async () => {
      const items = [
        new MockLazyLoadable('test1', { data: 'test1' }),
        new MockLazyLoadable('test2', { data: 'test2' })
      ];

      items.forEach(item => lazyLoader.register(item));
      await lazyLoader.preload(['test1', 'test2']);

      await lazyLoader.unloadMultiple(['test1', 'test2']);

      expect(lazyLoader.getLoadedItems()).toHaveLength(0);
      expect(lazyLoader.getUnloadedItems()).toHaveLength(2);
    });
  });

  describe('Memory Management', () => {
    it('should track memory usage', () => {
      const stats = lazyLoader.getMemoryStats();

      expect(stats).toHaveProperty('totalMemory');
      expect(stats).toHaveProperty('usedMemory');
      expect(stats).toHaveProperty('availableMemory');
      expect(stats).toHaveProperty('cacheSize');
      expect(stats).toHaveProperty('loadedItems');
      expect(stats).toHaveProperty('unloadedItems');
      expect(stats).toHaveProperty('memorySaved');
    });

    it('should perform cleanup when memory threshold is reached', async () => {
      // Create items that consume memory
      const items = Array.from({ length: 5 }, (_, i) =>
        new MockLazyLoadable(`test${i}`, { data: 'x'.repeat(1000) })
      );

      items.forEach(item => lazyLoader.register(item));
      await lazyLoader.preload(items.map(item => item.id));

      // Force cleanup
      await lazyLoader.performCleanup();

      // Should have unloaded some items
      expect(lazyLoader.getLoadedItems().length).toBeLessThan(5);
    });
  });

  describe('Cleanup', () => {
    it('should start and stop automatic cleanup', () => {
      lazyLoader.startCleanup();
      expect(lazyLoader['isRunning']).toBe(true);

      lazyLoader.stopCleanup();
      expect(lazyLoader['isRunning']).toBe(false);
    });

    it('should clear all items', async () => {
      const items = [
        new MockLazyLoadable('test1', { data: 'test1' }),
        new MockLazyLoadable('test2', { data: 'test2' })
      ];

      items.forEach(item => lazyLoader.register(item));
      await lazyLoader.preload(['test1', 'test2']);

      await lazyLoader.clear();

      expect(lazyLoader.getLoadedItems()).toHaveLength(0);
      expect(lazyLoader.getUnloadedItems()).toHaveLength(0);
    });
  });

  describe('Configuration', () => {
    it('should update configuration', () => {
      const newConfig = { maxMemoryUsage: 50, ttl: 2000 };
      lazyLoader.updateConfig(newConfig);

      const config = lazyLoader.getConfig();
      expect(config.maxMemoryUsage).toBe(50);
      expect(config.ttl).toBe(2000);
    });
  });

  describe('Error Handling', () => {
    it('should handle load errors gracefully', async () => {
      const item = new MockLazyLoadable('error', { data: 'test' });
      // Override load method to throw error
      item.load = async () => {
        throw new Error('Load failed');
      };

      lazyLoader.register(item);

      await expect(lazyLoader.load('error')).rejects.toThrow('Load failed');
    });

    it('should handle unload errors gracefully', async () => {
      const item = new MockLazyLoadable('error', { data: 'test' });
      // Override unload method to throw error
      item.unload = async () => {
        throw new Error('Unload failed');
      };

      lazyLoader.register(item);
      await lazyLoader.load('error');

      await expect(lazyLoader.unload('error')).rejects.toThrow('Unload failed');
    });
  });
});
