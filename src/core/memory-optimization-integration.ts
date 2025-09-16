/**
 * Memory Optimization Integration for TappMCP
 * Implements Task 2.4.3: Complete memory optimization system
 */

import { LazyLoader, createLazyLoader } from './lazy-loader.js';
import { ResourceOptimizer, createResourceOptimizer } from './resource-optimizer.js';
import { MemoryMonitor, createMemoryMonitor } from './memory-monitor.js';
import { EventEmitter } from 'events';

export interface MemoryOptimizationConfig {
  enableLazyLoading: boolean;
  enableResourceOptimization: boolean;
  enableMemoryMonitoring: boolean;
  maxMemoryUsage: number; // MB
  cleanupThreshold: number; // MB
  monitoringInterval: number; // ms
  optimizationThreshold: number; // MB
}

export interface OptimizationReport {
  timestamp: number;
  memoryBefore: number;
  memoryAfter: number;
  memorySaved: number;
  optimizationRatio: number;
  lazyLoaderStats: any;
  resourceOptimizerStats: any;
  memoryMonitorStats: any;
  recommendations: string[];
}

export class MemoryOptimizationIntegration extends EventEmitter {
  private lazyLoader: LazyLoader;
  private resourceOptimizer: ResourceOptimizer;
  private memoryMonitor: MemoryMonitor;
  private config: MemoryOptimizationConfig;
  private isRunning: boolean = false;
  private optimizationHistory: OptimizationReport[] = [];

  constructor(config: Partial<MemoryOptimizationConfig> = {}) {
    super();

    this.config = {
      enableLazyLoading: config.enableLazyLoading ?? true,
      enableResourceOptimization: config.enableResourceOptimization ?? true,
      enableMemoryMonitoring: config.enableMemoryMonitoring ?? true,
      maxMemoryUsage: config.maxMemoryUsage ?? 100, // 100MB
      cleanupThreshold: config.cleanupThreshold ?? 80, // 80MB
      monitoringInterval: config.monitoringInterval ?? 5000, // 5 seconds
      optimizationThreshold: config.optimizationThreshold ?? 70 // 70MB
    };

    // Initialize components
    this.lazyLoader = createLazyLoader({
      maxMemoryUsage: this.config.maxMemoryUsage,
      cleanupThreshold: this.config.cleanupThreshold
    });

    this.resourceOptimizer = createResourceOptimizer({
      enableLazyLoading: this.config.enableLazyLoading,
      maxMemoryUsage: this.config.maxMemoryUsage
    });

    this.memoryMonitor = createMemoryMonitor();

    this.setupEventHandlers();
    console.log('✅ MemoryOptimizationIntegration initialized');
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Memory monitor events
    this.memoryMonitor.on('memoryAlert', (alert) => {
      this.handleMemoryAlert(alert);
    });

    this.memoryMonitor.on('cleanupRequested', (alert) => {
      this.performOptimization();
    });

    this.memoryMonitor.on('emergencyCleanup', (alert) => {
      this.performEmergencyCleanup();
    });
  }

  /**
   * Start memory optimization
   */
  start(): void {
    if (this.isRunning) {
      console.warn('⚠️ Memory optimization already running');
      return;
    }

    this.isRunning = true;

    // Start lazy loader cleanup
    if (this.config.enableLazyLoading) {
      this.lazyLoader.startCleanup();
    }

    // Start memory monitoring
    if (this.config.enableMemoryMonitoring) {
      this.memoryMonitor.startMonitoring(this.config.monitoringInterval);
    }

    console.log('🔄 Memory optimization started');
    this.emit('started');
  }

  /**
   * Stop memory optimization
   */
  stop(): void {
    if (!this.isRunning) {
      console.warn('⚠️ Memory optimization not running');
      return;
    }

    this.isRunning = false;

    // Stop lazy loader cleanup
    this.lazyLoader.stopCleanup();

    // Stop memory monitoring
    this.memoryMonitor.stopMonitoring();

    console.log('🛑 Memory optimization stopped');
    this.emit('stopped');
  }

  /**
   * Handle memory alerts
   */
  private handleMemoryAlert(alert: any): void {
    console.log(`🚨 Memory Alert: ${alert.message}`);
    this.emit('memoryAlert', alert);
  }

  /**
   * Perform memory optimization
   */
  async performOptimization(): Promise<OptimizationReport> {
    const startTime = Date.now();
    const memoryBefore = this.memoryMonitor.getStats().heapUsed;

    console.log('🔧 Performing memory optimization...');

    // Perform lazy loader cleanup
    if (this.config.enableLazyLoading) {
      await this.lazyLoader.performCleanup();
    }

    // Perform resource optimizer cleanup
    if (this.config.enableResourceOptimization) {
      await this.resourceOptimizer.cleanup();
    }

    // Force garbage collection if available
    this.memoryMonitor.forceGC();

    const memoryAfter = this.memoryMonitor.getStats().heapUsed;
    const memorySaved = memoryBefore - memoryAfter;
    const optimizationRatio = memoryBefore > 0 ? (memorySaved / memoryBefore) * 100 : 0;

    const report: OptimizationReport = {
      timestamp: startTime,
      memoryBefore,
      memoryAfter,
      memorySaved,
      optimizationRatio,
      lazyLoaderStats: this.lazyLoader.getMemoryStats(),
      resourceOptimizerStats: this.resourceOptimizer.getStats(),
      memoryMonitorStats: this.memoryMonitor.getStats(),
      recommendations: this.memoryMonitor.getRecommendations()
    };

    this.optimizationHistory.push(report);

    // Keep only last 100 reports
    if (this.optimizationHistory.length > 100) {
      this.optimizationHistory.shift();
    }

    console.log(`✅ Memory optimization completed: saved ${(memorySaved / 1024 / 1024).toFixed(2)}MB (${optimizationRatio.toFixed(1)}%)`);

    this.emit('optimizationCompleted', report);
    return report;
  }

  /**
   * Perform emergency cleanup
   */
  async performEmergencyCleanup(): Promise<void> {
    console.log('🚨 Performing emergency memory cleanup...');

    // Clear all lazy loaded items
    await this.lazyLoader.clear();

    // Clear all optimized resources
    await this.resourceOptimizer.clear();

    // Force garbage collection
    this.memoryMonitor.forceGC();

    console.log('✅ Emergency cleanup completed');
    this.emit('emergencyCleanupCompleted');
  }

  /**
   * Optimize a resource
   */
  async optimizeResource(id: string, data: any): Promise<any> {
    if (!this.config.enableResourceOptimization) {
      return data;
    }

    const resource = await this.resourceOptimizer.optimize(id, data);
    return resource.data;
  }

  /**
   * Register a lazy loadable item
   */
  registerLazyItem(item: any): void {
    if (!this.config.enableLazyLoading) {
      console.warn('⚠️ Lazy loading is disabled');
      return;
    }

    this.lazyLoader.register(item);
  }

  /**
   * Load a lazy item
   */
  async loadLazyItem(id: string): Promise<any> {
    if (!this.config.enableLazyLoading) {
      throw new Error('Lazy loading is disabled');
    }

    return this.lazyLoader.load(id);
  }

  /**
   * Get comprehensive memory statistics
   */
  getMemoryStats(): any {
    return {
      lazyLoader: this.lazyLoader.getMemoryStats(),
      resourceOptimizer: this.resourceOptimizer.getMemoryStats(),
      memoryMonitor: this.memoryMonitor.getStats(),
      isRunning: this.isRunning,
      config: this.config
    };
  }

  /**
   * Get optimization history
   */
  getOptimizationHistory(): OptimizationReport[] {
    return [...this.optimizationHistory];
  }

  /**
   * Get latest optimization report
   */
  getLatestReport(): OptimizationReport | null {
    return this.optimizationHistory.length > 0
      ? this.optimizationHistory[this.optimizationHistory.length - 1]
      : null;
  }

  /**
   * Get memory efficiency score
   */
  getEfficiencyScore(): number {
    const memoryStats = this.memoryMonitor.getStats();
    const lazyStats = this.lazyLoader.getMemoryStats();
    const resourceStats = this.resourceOptimizer.getStats();

    let score = 100;

    // Penalize high memory usage
    if (memoryStats.usagePercentage > 90) score -= 30;
    else if (memoryStats.usagePercentage > 80) score -= 20;
    else if (memoryStats.usagePercentage > 70) score -= 10;

    // Bonus for memory saved through optimization
    const memorySavedRatio = lazyStats.memorySaved / (memoryStats.heapUsed + lazyStats.memorySaved);
    if (memorySavedRatio > 0.3) score += 20;
    else if (memorySavedRatio > 0.2) score += 10;
    else if (memorySavedRatio > 0.1) score += 5;

    // Bonus for resource optimization
    if (resourceStats.averageOptimization < 80) score += 15;
    else if (resourceStats.averageOptimization < 90) score += 10;
    else if (resourceStats.averageOptimization < 95) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get optimization recommendations
   */
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    const memoryStats = this.memoryMonitor.getStats();
    const lazyStats = this.lazyLoader.getMemoryStats();
    const resourceStats = this.resourceOptimizer.getStats();

    // Memory usage recommendations
    if (memoryStats.usagePercentage > 80) {
      recommendations.push('High memory usage detected - consider increasing memory limits or optimizing data structures');
    }

    // Lazy loading recommendations
    if (lazyStats.unloadedItems > lazyStats.loadedItems) {
      recommendations.push('Many items are unloaded - consider preloading frequently used items');
    }

    // Resource optimization recommendations
    if (resourceStats.averageOptimization > 95) {
      recommendations.push('Resource optimization is minimal - consider enabling compression or deduplication');
    }

    // General recommendations
    if (this.getEfficiencyScore() < 70) {
      recommendations.push('Memory efficiency is low - consider reviewing memory usage patterns');
    }

    return recommendations;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<MemoryOptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Update component configurations
    this.lazyLoader.updateConfig({
      maxMemoryUsage: this.config.maxMemoryUsage,
      cleanupThreshold: this.config.cleanupThreshold
    });

    this.resourceOptimizer.updateConfig({
      maxMemoryUsage: this.config.maxMemoryUsage
    });

    console.log('⚙️ Memory optimization configuration updated');
  }

  /**
   * Get current configuration
   */
  getConfig(): MemoryOptimizationConfig {
    return { ...this.config };
  }

  /**
   * Reset all statistics and history
   */
  reset(): void {
    this.optimizationHistory = [];
    this.memoryMonitor.reset();
    console.log('🔄 Memory optimization statistics reset');
  }
}

/**
 * Create memory optimization integration instance
 */
export function createMemoryOptimizationIntegration(config?: Partial<MemoryOptimizationConfig>): MemoryOptimizationIntegration {
  return new MemoryOptimizationIntegration(config);
}

/**
 * Default configuration
 */
export const defaultMemoryOptimizationConfig: MemoryOptimizationConfig = {
  enableLazyLoading: true,
  enableResourceOptimization: true,
  enableMemoryMonitoring: true,
  maxMemoryUsage: 100, // 100MB
  cleanupThreshold: 80, // 80MB
  monitoringInterval: 5000, // 5 seconds
  optimizationThreshold: 70 // 70MB
};
