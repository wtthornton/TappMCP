#!/usr/bin/env node

/**
 * Context7 API Performance Optimizer
 *
 * Provides intelligent caching, request batching, performance monitoring,
 * and response time optimization for Context7 API calls.
 */

import { EventEmitter } from 'events';
import { LRUCache } from 'lru-cache';
import { Context7Broker } from '../brokers/context7-broker.js';

export interface PerformanceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  cacheHitRate: number;
  batchEfficiency: number;
  lastUpdated: string;
}

export interface RequestBatch {
  id: string;
  requests: BatchRequest[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  processedAt?: string;
  totalTime?: number;
  results: Map<string, any>;
  errors: Map<string, Error>;
}

export interface BatchRequest {
  id: string;
  type: 'documentation' | 'codeExamples' | 'bestPractices' | 'troubleshooting';
  topic: string;
  role?: string;
  category?: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
}

export interface CacheEntry {
  data: any;
  timestamp: string;
  ttl: number;
  hitCount: number;
  lastAccessed: string;
  size: number;
}

export interface PerformanceAlert {
  id: string;
  type: 'slow-response' | 'high-error-rate' | 'low-cache-hit' | 'batch-failure';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  metric: string;
  currentValue: number;
  threshold: number;
  timestamp: string;
  resolved: boolean;
}

export interface OptimizationConfig {
  maxCacheSize: number;
  defaultTTL: number;
  batchSize: number;
  batchTimeout: number;
  responseTimeThreshold: number;
  errorRateThreshold: number;
  cacheHitRateThreshold: number;
  enableBatching: boolean;
  enableCompression: boolean;
  enableMetrics: boolean;
}

export class Context7PerformanceOptimizer extends EventEmitter {
  private context7Broker: Context7Broker;
  private cache: LRUCache<string, CacheEntry>;
  private requestQueue: Map<string, BatchRequest> = new Map();
  private batchQueue: RequestBatch[] = [];
  private metrics: PerformanceMetrics;
  private config: OptimizationConfig;
  private batchProcessor: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private alerts: Map<string, PerformanceAlert> = new Map();

  constructor(context7Broker: Context7Broker, config: Partial<OptimizationConfig> = {}) {
    super();

    this.context7Broker = context7Broker;
    this.config = {
      maxCacheSize: 1000,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      batchSize: 10,
      batchTimeout: 1000, // 1 second
      responseTimeThreshold: 2000, // 2 seconds
      errorRateThreshold: 0.1, // 10%
      cacheHitRateThreshold: 0.8, // 80%
      enableBatching: true,
      enableCompression: true,
      enableMetrics: true,
      ...config,
    };

    // Initialize cache
    this.cache = new LRUCache<string, CacheEntry>({
      max: this.config.maxCacheSize,
      ttl: this.config.defaultTTL,
      updateAgeOnGet: true,
      allowStale: false,
    });

    // Initialize metrics
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      batchEfficiency: 0,
      lastUpdated: new Date().toISOString(),
    };

    // Start batch processor if enabled
    if (this.config.enableBatching) {
      this.startBatchProcessor();
    }
  }

  /**
   * Optimized documentation request with caching and batching
   */
  async getDocumentation(
    topic: string,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<any> {
    const cacheKey = `doc:${topic}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      this.updateCacheStats(cacheKey, cached);
      return cached.data;
    }

    // Add to batch if batching is enabled
    if (this.config.enableBatching && priority !== 'high') {
      return this.addToBatch('documentation', topic, priority);
    }

    // Direct request for high priority or when batching is disabled
    return this.executeDirectRequest('documentation', topic, cacheKey);
  }

  /**
   * Optimized code examples request with caching and batching
   */
  async getCodeExamples(
    topic: string,
    role: string = 'developer',
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<any> {
    const cacheKey = `code:${topic}:${role}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      this.updateCacheStats(cacheKey, cached);
      return cached.data;
    }

    // Add to batch if batching is enabled
    if (this.config.enableBatching && priority !== 'high') {
      return this.addToBatch('codeExamples', topic, priority, role);
    }

    // Direct request for high priority or when batching is disabled
    return this.executeDirectRequest('codeExamples', topic, cacheKey, role);
  }

  /**
   * Optimized best practices request with caching and batching
   */
  async getBestPractices(
    topic: string,
    role: string = 'developer',
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<any> {
    const cacheKey = `practices:${topic}:${role}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      this.updateCacheStats(cacheKey, cached);
      return cached.data;
    }

    // Add to batch if batching is enabled
    if (this.config.enableBatching && priority !== 'high') {
      return this.addToBatch('bestPractices', topic, priority, role);
    }

    // Direct request for high priority or when batching is disabled
    return this.executeDirectRequest('bestPractices', topic, cacheKey, role);
  }

  /**
   * Optimized troubleshooting request with caching and batching
   */
  async getTroubleshooting(
    topic: string,
    role: string = 'developer',
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<any> {
    const cacheKey = `troubleshooting:${topic}:${role}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      this.updateCacheStats(cacheKey, cached);
      return cached.data;
    }

    // Add to batch if batching is enabled
    if (this.config.enableBatching && priority !== 'high') {
      return this.addToBatch('troubleshooting', topic, priority, role);
    }

    // Direct request for high priority or when batching is disabled
    return this.executeDirectRequest('troubleshooting', topic, cacheKey, role);
  }

  /**
   * Execute direct request with performance monitoring
   */
  private async executeDirectRequest(
    type: string,
    topic: string,
    cacheKey: string,
    role?: string
  ): Promise<any> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      let result: any;

      switch (type) {
        case 'documentation':
          result = await this.context7Broker.getDocumentation(topic);
          break;
        case 'codeExamples':
          result = await this.context7Broker.getCodeExamples(topic, role || 'developer');
          break;
        case 'bestPractices':
          result = await this.context7Broker.getBestPractices(topic);
          break;
        case 'troubleshooting':
          result = await this.context7Broker.getTroubleshootingGuides(topic);
          break;
        default:
          throw new Error(`Unknown request type: ${type}`);
      }

      const responseTime = Date.now() - startTime;
      this.updateMetrics(true, responseTime);

      // Cache the result
      this.cacheResult(cacheKey, result);

      // Check for performance alerts
      this.checkPerformanceAlerts(responseTime);

      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateMetrics(false, responseTime);

      console.error(`Context7 ${type} request failed:`, error);
      throw error;
    }
  }

  /**
   * Add request to batch queue
   */
  private addToBatch(
    type: 'documentation' | 'codeExamples' | 'bestPractices' | 'troubleshooting',
    topic: string,
    priority: 'high' | 'medium' | 'low',
    role?: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const batchRequest: BatchRequest = {
        id: requestId,
        type,
        topic,
        role: role || 'developer',
        priority,
        timestamp: new Date().toISOString(),
      };

      this.requestQueue.set(requestId, batchRequest);

      // Set up promise resolution
      const checkResult = () => {
        const batch = this.batchQueue.find(b => b.results.has(requestId));
        if (batch) {
          if (batch.results.has(requestId)) {
            resolve(batch.results.get(requestId));
          } else if (batch.errors.has(requestId)) {
            reject(batch.errors.get(requestId));
          }
        } else {
          setTimeout(checkResult, 100);
        }
      };

      checkResult();
    });
  }

  /**
   * Start batch processor
   */
  private startBatchProcessor(): void {
    this.batchProcessor = setInterval(() => {
      this.processBatchQueue();
    }, this.config.batchTimeout);
  }

  /**
   * Process batch queue
   */
  private async processBatchQueue(): Promise<void> {
    if (this.isProcessing || this.requestQueue.size === 0) return;

    this.isProcessing = true;

    try {
      // Create batch from queued requests
      const requests = Array.from(this.requestQueue.values())
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        })
        .slice(0, this.config.batchSize);

      if (requests.length === 0) return;

      const batch: RequestBatch = {
        id: `batch-${Date.now()}`,
        requests,
        status: 'processing',
        createdAt: new Date().toISOString(),
        results: new Map(),
        errors: new Map(),
      };

      this.batchQueue.push(batch);

      // Remove requests from queue
      requests.forEach(req => this.requestQueue.delete(req.id));

      // Process batch
      await this.processBatch(batch);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process individual batch
   */
  private async processBatch(batch: RequestBatch): Promise<void> {
    const startTime = Date.now();
    batch.status = 'processing';
    batch.processedAt = new Date().toISOString();

    try {
      // Group requests by type for efficient processing
      const groupedRequests = this.groupRequestsByType(batch.requests);

      // Process each group
      for (const [type, typeRequests] of groupedRequests) {
        await this.processRequestGroup(type, typeRequests, batch);
      }

      batch.status = 'completed';
      batch.totalTime = Date.now() - startTime;

      // Calculate batch efficiency
      const successRate = batch.results.size / batch.requests.length;
      this.updateBatchEfficiency(successRate);

      this.emit('batch-completed', batch);
    } catch (error) {
      batch.status = 'failed';
      batch.totalTime = Date.now() - startTime;

      // Mark all requests as failed
      batch.requests.forEach(req => {
        batch.errors.set(req.id, error as Error);
      });

      this.emit('batch-failed', { batch, error });
    }
  }

  /**
   * Group requests by type
   */
  private groupRequestsByType(requests: BatchRequest[]): Map<string, BatchRequest[]> {
    const grouped = new Map<string, BatchRequest[]>();

    requests.forEach(req => {
      if (!grouped.has(req.type)) {
        grouped.set(req.type, []);
      }
      grouped.get(req.type)!.push(req);
    });

    return grouped;
  }

  /**
   * Process a group of requests of the same type
   */
  private async processRequestGroup(
    type: string,
    requests: BatchRequest[],
    batch: RequestBatch
  ): Promise<void> {
    // Process requests in parallel within the group
    const promises = requests.map(async req => {
      try {
        let result: any;

        switch (type) {
          case 'documentation':
            result = await this.context7Broker.getDocumentation(req.topic);
            break;
          case 'codeExamples':
            result = await this.context7Broker.getCodeExamples(req.topic, req.role || 'developer');
            break;
          case 'bestPractices':
            result = await this.context7Broker.getBestPractices(req.topic);
            break;
          case 'troubleshooting':
            result = await this.context7Broker.getTroubleshootingGuides(req.topic);
            break;
        }

        batch.results.set(req.id, result);

        // Cache the result
        const cacheKey = this.generateCacheKey(type, req.topic, req.role);
        this.cacheResult(cacheKey, result);
      } catch (error) {
        batch.errors.set(req.id, error as Error);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(type: string, topic: string, role?: string): string {
    return role ? `${type}:${topic}:${role}` : `${type}:${topic}`;
  }

  /**
   * Cache result with metadata
   */
  private cacheResult(key: string, data: any): void {
    const entry: CacheEntry = {
      data,
      timestamp: new Date().toISOString(),
      ttl: this.config.defaultTTL,
      hitCount: 0,
      lastAccessed: new Date().toISOString(),
      size: JSON.stringify(data).length,
    };

    this.cache.set(key, entry);
  }

  /**
   * Update cache statistics
   */
  private updateCacheStats(key: string, entry: CacheEntry): void {
    entry.hitCount++;
    entry.lastAccessed = new Date().toISOString();
    this.cache.set(key, entry);
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(success: boolean, responseTime: number): void {
    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }

    // Update average response time
    const totalRequests = this.metrics.successfulRequests + this.metrics.failedRequests;
    this.metrics.averageResponseTime =
      (this.metrics.averageResponseTime * (totalRequests - 1) + responseTime) / totalRequests;

    // Update cache hit rate
    const totalCacheRequests = this.cache.size + this.metrics.totalRequests;
    this.metrics.cacheHitRate = this.cache.size / totalCacheRequests;

    this.metrics.lastUpdated = new Date().toISOString();
  }

  /**
   * Update batch efficiency
   */
  private updateBatchEfficiency(successRate: number): void {
    this.metrics.batchEfficiency = (this.metrics.batchEfficiency + successRate) / 2;
  }

  /**
   * Check for performance alerts
   */
  private checkPerformanceAlerts(responseTime: number): void {
    // Slow response alert
    if (responseTime > this.config.responseTimeThreshold) {
      this.createAlert(
        'slow-response',
        'high',
        `Slow response time: ${responseTime}ms`,
        'responseTime',
        responseTime,
        this.config.responseTimeThreshold
      );
    }

    // High error rate alert
    const errorRate = this.metrics.failedRequests / this.metrics.totalRequests;
    if (errorRate > this.config.errorRateThreshold) {
      this.createAlert(
        'high-error-rate',
        'critical',
        `High error rate: ${(errorRate * 100).toFixed(1)}%`,
        'errorRate',
        errorRate,
        this.config.errorRateThreshold
      );
    }

    // Low cache hit rate alert
    if (this.metrics.cacheHitRate < this.config.cacheHitRateThreshold) {
      this.createAlert(
        'low-cache-hit',
        'medium',
        `Low cache hit rate: ${(this.metrics.cacheHitRate * 100).toFixed(1)}%`,
        'cacheHitRate',
        this.metrics.cacheHitRate,
        this.config.cacheHitRateThreshold
      );
    }
  }

  /**
   * Create performance alert
   */
  private createAlert(
    type: string,
    severity: 'critical' | 'high' | 'medium' | 'low',
    message: string,
    metric: string,
    currentValue: number,
    threshold: number
  ): void {
    const alert: PerformanceAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: type as any,
      severity,
      message,
      metric,
      currentValue,
      threshold,
      timestamp: new Date().toISOString(),
      resolved: false,
    };

    this.alerts.set(alert.id, alert);
    this.emit('performance-alert', alert);

    console.warn(`Performance Alert: ${message}`);
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    entries: Array<{
      key: string;
      hitCount: number;
      lastAccessed: string;
      size: number;
    }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      hitCount: entry.hitCount,
      lastAccessed: entry.lastAccessed,
      size: entry.size,
    }));

    return {
      size: this.cache.size,
      maxSize: this.cache.max,
      hitRate: this.metrics.cacheHitRate,
      entries,
    };
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): PerformanceAlert[] {
    return Array.from(this.alerts.values())
      .filter(alert => !alert.resolved)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.resolved = true;
    this.alerts.set(alertId, alert);
    this.emit('alert-resolved', alert);
    return true;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.emit('cache-cleared');
  }

  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.metrics.cacheHitRate < 0.7) {
      recommendations.push('Consider increasing cache TTL or cache size');
    }

    if (this.metrics.averageResponseTime > 1500) {
      recommendations.push('Consider enabling request batching for better performance');
    }

    if (this.metrics.batchEfficiency < 0.8) {
      recommendations.push('Review batch processing logic for better efficiency');
    }

    const errorRate = this.metrics.failedRequests / this.metrics.totalRequests;
    if (errorRate > 0.05) {
      recommendations.push('Investigate and fix API errors to improve reliability');
    }

    return recommendations;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.batchProcessor) {
      clearInterval(this.batchProcessor);
      this.batchProcessor = null;
    }

    this.cache.clear();
    this.requestQueue.clear();
    this.batchQueue.length = 0;
    this.alerts.clear();
    this.removeAllListeners();
  }
}
