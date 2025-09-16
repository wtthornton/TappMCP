/**
 * Lazy Loading System for TappMCP
 * Implements Task 2.4.3: Lazy loading and resource optimization
 * Target: 30% reduction in memory usage
 */

import { performance } from 'perf_hooks';

export interface LazyLoadConfig {
  maxMemoryUsage: number; // MB
  cleanupThreshold: number; // MB
  ttl: number; // milliseconds
  maxCacheSize: number;
  enableCompression: boolean;
}

export interface LazyLoadable {
  id: string;
  load(): Promise<any>;
  unload(): Promise<void>;
  getMemoryUsage(): number;
  isLoaded: boolean;
  lastAccessed: number;
  accessCount: number;
}

export interface MemoryStats {
  totalMemory: number;
  usedMemory: number;
  availableMemory: number;
  cacheSize: number;
  loadedItems: number;
  unloadedItems: number;
  memorySaved: number;
}

export class LazyLoader {
  private loadedItems: Map<string, LazyLoadable> = new Map();
  private unloadedItems: Map<string, LazyLoadable> = new Map();
  private config: LazyLoadConfig;
  private memoryStats: MemoryStats;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  constructor(config: Partial<LazyLoadConfig> = {}) {
    this.config = {
      maxMemoryUsage: config.maxMemoryUsage || 100, // 100MB default
      cleanupThreshold: config.cleanupThreshold || 80, // 80MB threshold
      ttl: config.ttl || 5 * 60 * 1000, // 5 minutes
      maxCacheSize: config.maxCacheSize || 1000,
      enableCompression: config.enableCompression || false
    };

    this.memoryStats = {
      totalMemory: 0,
      usedMemory: 0,
      availableMemory: 0,
      cacheSize: 0,
      loadedItems: 0,
      unloadedItems: 0,
      memorySaved: 0
    };

    console.log('✅ LazyLoader initialized with config:', this.config);
  }

  /**
   * Register a lazy loadable item
   */
  register(item: LazyLoadable): void {
    if (this.loadedItems.has(item.id) || this.unloadedItems.has(item.id)) {
      console.warn(`⚠️ Item ${item.id} already registered`);
      return;
    }

    this.unloadedItems.set(item.id, item);
    this.updateMemoryStats();
    console.log(`📝 Registered lazy loadable item: ${item.id}`);
  }

  /**
   * Load an item on demand
   */
  async load(itemId: string): Promise<any> {
    const startTime = performance.now();

    // Check if already loaded
    if (this.loadedItems.has(itemId)) {
      const item = this.loadedItems.get(itemId)!;
      item.lastAccessed = Date.now();
      item.accessCount++;
      console.log(`✅ Item ${itemId} already loaded (${(performance.now() - startTime).toFixed(2)}ms)`);
      return (item as any).data || item;
    }

    // Check if registered but unloaded
    if (this.unloadedItems.has(itemId)) {
      const item = this.unloadedItems.get(itemId)!;

      // Check memory before loading
      await this.ensureMemoryAvailable();

      try {
        const data = await item.load();
        item.isLoaded = true;
        item.lastAccessed = Date.now();
        item.accessCount++;

        // Move from unloaded to loaded
        this.unloadedItems.delete(itemId);
        this.loadedItems.set(itemId, item);

        this.updateMemoryStats();

        const loadTime = performance.now() - startTime;
        console.log(`🔄 Loaded item ${itemId} (${loadTime.toFixed(2)}ms)`);

        return data;
      } catch (error) {
        console.error(`❌ Failed to load item ${itemId}:`, error);
        throw error;
      }
    }

    throw new Error(`Item ${itemId} not registered`);
  }

  /**
   * Unload an item to free memory
   */
  async unload(itemId: string): Promise<void> {
    if (!this.loadedItems.has(itemId)) {
      console.warn(`⚠️ Item ${itemId} not loaded`);
      return;
    }

    const item = this.loadedItems.get(itemId)!;

    try {
      await item.unload();
      item.isLoaded = false;

      // Move from loaded to unloaded
      this.loadedItems.delete(itemId);
      this.unloadedItems.set(itemId, item);

      this.updateMemoryStats();
      console.log(`🗑️ Unloaded item ${itemId}`);
    } catch (error) {
      console.error(`❌ Failed to unload item ${itemId}:`, error);
      throw error;
    }
  }

  /**
   * Get an item (load if necessary)
   */
  async get(itemId: string): Promise<any> {
    return this.load(itemId);
  }

  /**
   * Preload multiple items
   */
  async preload(itemIds: string[]): Promise<void> {
    console.log(`🔄 Preloading ${itemIds.length} items...`);
    const startTime = performance.now();

    const promises = itemIds.map(id => this.load(id));
    await Promise.all(promises);

    const preloadTime = performance.now() - startTime;
    console.log(`✅ Preloaded ${itemIds.length} items in ${preloadTime.toFixed(2)}ms`);
  }

  /**
   * Unload multiple items
   */
  async unloadMultiple(itemIds: string[]): Promise<void> {
    console.log(`🗑️ Unloading ${itemIds.length} items...`);
    const startTime = performance.now();

    const promises = itemIds.map(id => this.unload(id));
    await Promise.all(promises);

    const unloadTime = performance.now() - startTime;
    console.log(`✅ Unloaded ${itemIds.length} items in ${unloadTime.toFixed(2)}ms`);
  }

  /**
   * Start automatic cleanup
   */
  startCleanup(): void {
    if (this.isRunning) {
      console.warn('⚠️ Cleanup already running');
      return;
    }

    this.isRunning = true;
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 30000); // Every 30 seconds

    console.log('🔄 Started automatic cleanup');
  }

  /**
   * Stop automatic cleanup
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.isRunning = false;
    console.log('🛑 Stopped automatic cleanup');
  }

  /**
   * Perform memory cleanup
   */
  async performCleanup(): Promise<void> {
    const startTime = performance.now();
    let cleanedCount = 0;

    // Check if cleanup is needed
    if (this.memoryStats.usedMemory < this.config.cleanupThreshold * 1024 * 1024) {
      return;
    }

    console.log('🧹 Performing memory cleanup...');

    // Sort loaded items by last accessed time (oldest first)
    const sortedItems = Array.from(this.loadedItems.values())
      .sort((a, b) => a.lastAccessed - b.lastAccessed);

    // Unload oldest items until memory is below threshold
    for (const item of sortedItems) {
      if (this.memoryStats.usedMemory < this.config.cleanupThreshold * 1024 * 1024) {
        break;
      }

      await this.unload(item.id);
      cleanedCount++;
    }

    const cleanupTime = performance.now() - startTime;
    console.log(`✅ Cleanup completed: ${cleanedCount} items unloaded in ${cleanupTime.toFixed(2)}ms`);
  }

  /**
   * Ensure memory is available before loading
   */
  private async ensureMemoryAvailable(): Promise<void> {
    if (this.memoryStats.usedMemory >= this.config.maxMemoryUsage * 1024 * 1024) {
      console.log('⚠️ Memory limit reached, performing cleanup...');
      await this.performCleanup();
    }
  }

  /**
   * Update memory statistics
   */
  private updateMemoryStats(): void {
    const memUsage = process.memoryUsage();

    this.memoryStats.totalMemory = memUsage.heapTotal;
    this.memoryStats.usedMemory = memUsage.heapUsed;
    this.memoryStats.availableMemory = memUsage.heapTotal - memUsage.heapUsed;
    this.memoryStats.cacheSize = this.loadedItems.size + this.unloadedItems.size;
    this.memoryStats.loadedItems = this.loadedItems.size;
    this.memoryStats.unloadedItems = this.unloadedItems.size;

    // Calculate memory saved by lazy loading
    const unloadedMemory = Array.from(this.unloadedItems.values())
      .reduce((total, item) => total + item.getMemoryUsage(), 0);
    this.memoryStats.memorySaved = unloadedMemory;
  }

  /**
   * Get memory statistics
   */
  getMemoryStats(): MemoryStats {
    this.updateMemoryStats();
    return { ...this.memoryStats };
  }

  /**
   * Get loaded items
   */
  getLoadedItems(): string[] {
    return Array.from(this.loadedItems.keys());
  }

  /**
   * Get unloaded items
   */
  getUnloadedItems(): string[] {
    return Array.from(this.unloadedItems.keys());
  }

  /**
   * Clear all items
   */
  async clear(): Promise<void> {
    console.log('🧹 Clearing all items...');

    // Unload all loaded items
    const loadedIds = Array.from(this.loadedItems.keys());
    await this.unloadMultiple(loadedIds);

    // Clear unloaded items
    this.unloadedItems.clear();

    this.updateMemoryStats();
    console.log('✅ All items cleared');
  }

  /**
   * Get configuration
   */
  getConfig(): LazyLoadConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<LazyLoadConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Configuration updated:', this.config);
  }
}

/**
 * Create lazy loader instance
 */
export function createLazyLoader(config?: Partial<LazyLoadConfig>): LazyLoader {
  return new LazyLoader(config);
}

/**
 * Default configuration
 */
export const defaultLazyLoadConfig: LazyLoadConfig = {
  maxMemoryUsage: 100, // 100MB
  cleanupThreshold: 80, // 80MB
  ttl: 5 * 60 * 1000, // 5 minutes
  maxCacheSize: 1000,
  enableCompression: false
};
