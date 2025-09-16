/**
 * Memory Monitor for TappMCP
 * Implements Task 2.4.3: Memory monitoring and optimization
 */

import { performance } from 'perf_hooks';
import { EventEmitter } from 'events';

export interface MemoryThreshold {
  level: 'low' | 'medium' | 'high' | 'critical';
  percentage: number;
  action: 'warn' | 'cleanup' | 'emergency';
}

export interface MemoryAlert {
  timestamp: number;
  level: string;
  currentUsage: number;
  threshold: number;
  message: string;
  action: string;
}

export interface MemoryStats {
  heapUsed: number;
  heapTotal: number;
  heapFree: number;
  external: number;
  rss: number;
  usagePercentage: number;
  availableMemory: number;
  peakUsage: number;
  averageUsage: number;
  gcCount: number;
  lastGcTime: number;
}

export class MemoryMonitor extends EventEmitter {
  private thresholds: MemoryThreshold[] = [
    { level: 'low', percentage: 50, action: 'warn' },
    { level: 'medium', percentage: 70, action: 'warn' },
    { level: 'high', percentage: 85, action: 'cleanup' },
    { level: 'critical', percentage: 95, action: 'emergency' }
  ];

  private stats: MemoryStats;
  private peakUsage: number = 0;
  private usageHistory: number[] = [];
  private gcCount: number = 0;
  private lastGcTime: number = 0;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring: boolean = false;
  private maxHistorySize: number = 100;

  constructor() {
    super();

    this.stats = {
      heapUsed: 0,
      heapTotal: 0,
      heapFree: 0,
      external: 0,
      rss: 0,
      usagePercentage: 0,
      availableMemory: 0,
      peakUsage: 0,
      averageUsage: 0,
      gcCount: 0,
      lastGcTime: 0
    };

    this.setupGCMonitoring();
    console.log('✅ MemoryMonitor initialized');
  }

  /**
   * Start memory monitoring
   */
  startMonitoring(intervalMs: number = 5000): void {
    if (this.isMonitoring) {
      console.warn('⚠️ Memory monitoring already running');
      return;
    }

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, intervalMs);

    console.log(`🔄 Started memory monitoring (${intervalMs}ms interval)`);
  }

  /**
   * Stop memory monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('🛑 Stopped memory monitoring');
  }

  /**
   * Check current memory usage
   */
  checkMemoryUsage(): void {
    const memUsage = process.memoryUsage();
    const usagePercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;

    // Update stats
    this.stats = {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      heapFree: memUsage.heapTotal - memUsage.heapUsed,
      external: memUsage.external,
      rss: memUsage.rss,
      usagePercentage,
      availableMemory: memUsage.heapTotal - memUsage.heapUsed,
      peakUsage: this.peakUsage,
      averageUsage: this.calculateAverageUsage(),
      gcCount: this.gcCount,
      lastGcTime: this.lastGcTime
    };

    // Update peak usage
    if (memUsage.heapUsed > this.peakUsage) {
      this.peakUsage = memUsage.heapUsed;
      this.stats.peakUsage = this.peakUsage;
    }

    // Add to history
    this.usageHistory.push(usagePercentage);
    if (this.usageHistory.length > this.maxHistorySize) {
      this.usageHistory.shift();
    }

    // Check thresholds
    this.checkThresholds(usagePercentage);
  }

  /**
   * Check memory thresholds
   */
  private checkThresholds(usagePercentage: number): void {
    for (const threshold of this.thresholds) {
      if (usagePercentage >= threshold.percentage) {
        const alert: MemoryAlert = {
          timestamp: Date.now(),
          level: threshold.level,
          currentUsage: usagePercentage,
          threshold: threshold.percentage,
          message: `Memory usage is ${usagePercentage.toFixed(1)}% (${threshold.level} level)`,
          action: threshold.action
        };

        this.emit('memoryAlert', alert);
        this.handleMemoryAlert(alert);
        break; // Only trigger the highest threshold
      }
    }
  }

  /**
   * Handle memory alert
   */
  private handleMemoryAlert(alert: MemoryAlert): void {
    console.log(`🚨 Memory Alert: ${alert.message}`);

    switch (alert.action) {
      case 'warn':
        console.warn(`⚠️ Memory usage warning: ${alert.currentUsage.toFixed(1)}%`);
        break;

      case 'cleanup':
        console.log('🧹 Triggering memory cleanup...');
        this.emit('cleanupRequested', alert);
        break;

      case 'emergency':
        console.error('🚨 Emergency memory cleanup required!');
        this.emit('emergencyCleanup', alert);
        break;
    }
  }

  /**
   * Setup garbage collection monitoring
   */
  private setupGCMonitoring(): void {
    if (global.gc) {
      // Monitor GC events if available
      const originalGC = global.gc;
      global.gc = async () => {
        this.gcCount++;
        this.lastGcTime = Date.now();
        console.log(`🗑️ Garbage collection #${this.gcCount}`);
        return originalGC();
      };
    }
  }

  /**
   * Force garbage collection
   */
  forceGC(): boolean {
    if (global.gc) {
      const beforeGC = process.memoryUsage().heapUsed;
      global.gc();
      const afterGC = process.memoryUsage().heapUsed;
      const freed = beforeGC - afterGC;

      console.log(`🗑️ Forced GC: freed ${(freed / 1024 / 1024).toFixed(2)}MB`);
      return true;
    } else {
      console.warn('⚠️ Garbage collection not available (run with --expose-gc)');
      return false;
    }
  }

  /**
   * Calculate average memory usage
   */
  private calculateAverageUsage(): number {
    if (this.usageHistory.length === 0) return 0;

    const sum = this.usageHistory.reduce((a, b) => a + b, 0);
    return sum / this.usageHistory.length;
  }

  /**
   * Get current memory statistics
   */
  getStats(): MemoryStats {
    this.checkMemoryUsage();
    return { ...this.stats };
  }

  /**
   * Get memory usage history
   */
  getHistory(): number[] {
    return [...this.usageHistory];
  }

  /**
   * Get memory usage trend
   */
  getTrend(): 'increasing' | 'decreasing' | 'stable' {
    if (this.usageHistory.length < 10) return 'stable';

    const recent = this.usageHistory.slice(-10);
    const firstHalf = recent.slice(0, 5);
    const secondHalf = recent.slice(5);

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const diff = secondAvg - firstAvg;

    if (diff > 5) return 'increasing';
    if (diff < -5) return 'decreasing';
    return 'stable';
  }

  /**
   * Get memory efficiency score
   */
  getEfficiencyScore(): number {
    const stats = this.getStats();
    const trend = this.getTrend();

    let score = 100;

    // Penalize high usage
    if (stats.usagePercentage > 90) score -= 30;
    else if (stats.usagePercentage > 80) score -= 20;
    else if (stats.usagePercentage > 70) score -= 10;

    // Penalize increasing trend
    if (trend === 'increasing') score -= 15;
    else if (trend === 'stable') score -= 5;

    // Bonus for frequent GC (memory management)
    if (this.gcCount > 0) {
      const gcFrequency = this.gcCount / (Date.now() - this.lastGcTime) * 1000;
      if (gcFrequency > 0.1) score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get memory recommendations
   */
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    const stats = this.getStats();
    const trend = this.getTrend();

    if (stats.usagePercentage > 80) {
      recommendations.push('Consider reducing memory usage - currently at ' + stats.usagePercentage.toFixed(1) + '%');
    }

    if (trend === 'increasing') {
      recommendations.push('Memory usage is increasing - investigate memory leaks');
    }

    if (stats.peakUsage > stats.heapTotal * 0.9) {
      recommendations.push('Peak memory usage is very high - consider increasing heap size');
    }

    if (this.gcCount === 0) {
      recommendations.push('No garbage collection detected - run with --expose-gc for better monitoring');
    }

    return recommendations;
  }

  /**
   * Set custom thresholds
   */
  setThresholds(thresholds: MemoryThreshold[]): void {
    this.thresholds = thresholds.sort((a, b) => a.percentage - b.percentage);
    console.log('⚙️ Memory thresholds updated:', this.thresholds);
  }

  /**
   * Get current thresholds
   */
  getThresholds(): MemoryThreshold[] {
    return [...this.thresholds];
  }

  /**
   * Reset statistics
   */
  reset(): void {
    this.peakUsage = 0;
    this.usageHistory = [];
    this.gcCount = 0;
    this.lastGcTime = 0;
    console.log('🔄 Memory statistics reset');
  }
}

/**
 * Create memory monitor instance
 */
export function createMemoryMonitor(): MemoryMonitor {
  return new MemoryMonitor();
}

/**
 * Global memory monitor instance
 */
export const globalMemoryMonitor = createMemoryMonitor();
