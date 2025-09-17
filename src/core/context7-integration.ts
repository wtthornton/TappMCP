#!/usr/bin/env node

/**
 * Context7 Integration for TappMCP Hybrid Architecture
 *
 * Intelligent integration layer that optimizes Context7 API usage
 * with the hybrid SQLite + JSON caching system.
 */

import { SmartCache, SmartCacheConfig } from './smart-cache.js';
import { SQLiteDatabase } from './sqlite-database.js';
import { FileManager } from './file-manager.js';
import { ArtifactMetadataAPI } from './artifact-metadata.js';
import { EventEmitter } from 'events';

export interface Context7Config extends SmartCacheConfig {
  apiEndpoint: string;
  apiKey: string;
  requestTimeout: number;
  maxRetries: number;
  retryDelay: number;
  batchSize: number;
  deduplicationEnabled: boolean;
  compressionEnabled: boolean;
  cacheStrategy: 'aggressive' | 'balanced' | 'conservative';
  preloadRelated: boolean;
  intelligentCaching: boolean;
}

export interface Context7Request {
  query: string;
  context?: string;
  options?: {
    maxTokens?: number;
    temperature?: number;
    model?: string;
    priority?: number;
    tags?: string[];
  };
}

export interface Context7Response {
  id: string;
  query: string;
  response: string;
  metadata: {
    model: string;
    tokens: number;
    latency: number;
    timestamp: Date;
    cacheHit: boolean;
  };
  related?: string[];
}

export interface Context7Metrics {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  apiCalls: number;
  averageLatency: number;
  totalTokens: number;
  costSavings: number;
  errorRate: number;
  deduplicationSavings: number;
}

export interface Context7Event {
  type: 'request' | 'response' | 'cache_hit' | 'cache_miss' | 'error' | 'deduplication';
  requestId: string;
  timestamp: Date;
  details: any;
}

export class Context7Integration extends EventEmitter {
  private config: Context7Config;
  private smartCache: SmartCache;
  private db: SQLiteDatabase;
  private fileManager: FileManager;
  private metadataAPI: ArtifactMetadataAPI;

  private metrics: Context7Metrics;
  private pendingRequests = new Map<string, Promise<Context7Response>>();
  private requestHistory = new Map<string, Date[]>();
  private deduplicationCache = new Map<string, string>();

  constructor(
    database: SQLiteDatabase,
    fileManager: FileManager,
    metadataAPI: ArtifactMetadataAPI,
    config: Partial<Context7Config> = {}
  ) {
    super();

    this.db = database;
    this.fileManager = fileManager;
    this.metadataAPI = metadataAPI;

    this.config = {
      maxMemoryMB: config.maxMemoryMB || 512,
      evictionThreshold: config.evictionThreshold || 0.8,
      evictionBatchSize: config.evictionBatchSize || 10,
      preloadHighPriority: config.preloadHighPriority ?? true,
      compressionThreshold: config.compressionThreshold || 1024,
      monitoringEnabled: config.monitoringEnabled ?? true,
      statsInterval: config.statsInterval || 30000,
      predictiveLoading: config.predictiveLoading ?? true,
      adaptiveEviction: config.adaptiveEviction ?? true,
      cacheWarming: config.cacheWarming ?? true,
      accessPatternLearning: config.accessPatternLearning ?? true,
      compressionStrategy: config.compressionStrategy || 'balanced',
      preloadThreshold: config.preloadThreshold || 7,
      evictionStrategy: config.evictionStrategy || 'hybrid',
      apiEndpoint: config.apiEndpoint || 'https://api.context7.com/v1',
      apiKey: config.apiKey || '',
      requestTimeout: config.requestTimeout || 30000,
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      batchSize: config.batchSize || 10,
      deduplicationEnabled: config.deduplicationEnabled ?? true,
      compressionEnabled: config.compressionEnabled ?? true,
      cacheStrategy: config.cacheStrategy || 'balanced',
      preloadRelated: config.preloadRelated ?? true,
      intelligentCaching: config.intelligentCaching ?? true,
      ...config
    };

    // Initialize smart cache
    this.smartCache = new SmartCache(
      this.db,
      this.fileManager,
      this.metadataAPI,
      this.config
    );

    // Setup event listeners
    this.setupEventListeners();

    this.metrics = this.initializeMetrics();

    console.log(`✅ Context7 Integration initialized with ${this.config.cacheStrategy} caching strategy`);
  }

  /**
   * Query Context7 with intelligent caching
   */
  async query(request: Context7Request): Promise<Context7Response> {
    const startTime = Date.now();
    const requestId = this.generateRequestId(request);

    try {
      // Check for deduplication
      if (this.config.deduplicationEnabled) {
        const existingRequest = this.pendingRequests.get(requestId);
        if (existingRequest) {
          console.log(`🔄 Deduplicating request: ${requestId}`);
          this.recordDeduplication();
          return await existingRequest;
        }
      }

      // Create request promise
      const requestPromise = this.processRequest(request, requestId, startTime);

      // Store pending request for deduplication
      if (this.config.deduplicationEnabled) {
        this.pendingRequests.set(requestId, requestPromise);
      }

      // Process request
      const response = await requestPromise;

      // Clean up pending request
      if (this.config.deduplicationEnabled) {
        this.pendingRequests.delete(requestId);
      }

      return response;

    } catch (error) {
      // Clean up pending request on error
      if (this.config.deduplicationEnabled) {
        this.pendingRequests.delete(requestId);
      }

      console.error(`❌ Context7 query failed:`, error);
      throw error;
    }
  }

  /**
   * Process Context7 request
   */
  private async processRequest(
    request: Context7Request,
    requestId: string,
    startTime: number
  ): Promise<Context7Response> {
    try {
      // Check cache first
      const cachedResponse = await this.checkCache(requestId);
      if (cachedResponse) {
        this.recordCacheHit();

        this.emit('cache_hit', {
          type: 'cache_hit',
          requestId,
          timestamp: new Date(),
          details: {
            query: request.query,
            latency: Date.now() - startTime
          }
        });

        return cachedResponse;
      }

      // Cache miss - make API call
      this.recordCacheMiss();

      const response = await this.makeApiCall(request, startTime);

      // Store in cache
      await this.storeInCache(requestId, response, request);

      // Preload related content if enabled
      if (this.config.preloadRelated && response.related) {
        this.preloadRelatedContent(response.related).catch(error =>
          console.warn(`⚠️ Failed to preload related content:`, error)
        );
      }

      this.emit('response', {
        type: 'response',
        requestId,
        timestamp: new Date(),
        details: {
          query: request.query,
          latency: response.metadata.latency,
          tokens: response.metadata.tokens
        }
      });

      return response;

    } catch (error) {
      this.recordError();

      this.emit('error', {
        type: 'error',
        requestId,
        timestamp: new Date(),
        details: {
          query: request.query,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      throw error;
    }
  }

  /**
   * Check cache for existing response
   */
  private async checkCache(requestId: string): Promise<Context7Response | null> {
    try {
      const cachedData = await this.smartCache.get(requestId, {
        trackAccess: true,
        preloadRelated: false
      });

      if (cachedData) {
        // Validate cache entry
        if (this.isCacheValid(cachedData)) {
          return cachedData;
        } else {
          // Remove invalid cache entry
          await this.smartCache.delete(requestId);
        }
      }

      return null;

    } catch (error) {
      console.warn(`⚠️ Cache check failed for ${requestId}:`, error);
      return null;
    }
  }

  /**
   * Make API call to Context7
   */
  private async makeApiCall(
    request: Context7Request,
    startTime: number
  ): Promise<Context7Response> {
    const requestId = this.generateRequestId(request);

    try {
      // Simulate API call (replace with actual Context7 API integration)
      const response = await this.simulateContext7ApiCall(request);

      // Calculate latency
      const latency = Date.now() - startTime;

      // Create response object
      const context7Response: Context7Response = {
        id: requestId,
        query: request.query,
        response: response.content,
        metadata: {
          model: response.model || 'context7-default',
          tokens: response.tokens || 0,
          latency,
          timestamp: new Date(),
          cacheHit: false
        },
        related: response.related || []
      };

      this.recordApiCall(latency, response.tokens || 0);

      return context7Response;

    } catch (error) {
      console.error(`❌ Context7 API call failed:`, error);
      throw error;
    }
  }

  /**
   * Simulate Context7 API call (replace with actual implementation)
   */
  private async simulateContext7ApiCall(request: Context7Request): Promise<{
    content: string;
    model: string;
    tokens: number;
    related: string[];
  }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    // Simulate response
    return {
      content: `Context7 response for: "${request.query}"`,
      model: 'context7-simulated',
      tokens: Math.floor(Math.random() * 1000) + 100,
      related: [`related-${Math.random().toString(36).substr(2, 9)}`]
    };
  }

  /**
   * Store response in cache
   */
  private async storeInCache(
    requestId: string,
    response: Context7Response,
    originalRequest: Context7Request
  ): Promise<void> {
    try {
      // Determine cache priority based on request options
      const priority = originalRequest.options?.priority || this.calculateCachePriority(response);

      // Determine compression based on response size
      const shouldCompress = this.shouldCompress(response);

      // Store in smart cache
      await this.smartCache.set(requestId, response, {
        priority,
        compress: shouldCompress,
        preloadRelated: this.config.preloadRelated
      });

      // Store in deduplication cache
      if (this.config.deduplicationEnabled) {
        this.deduplicationCache.set(requestId, requestId);
      }

      console.log(`✅ Stored Context7 response in cache: ${requestId}`);

    } catch (error) {
      console.error(`❌ Failed to store Context7 response in cache:`, error);
    }
  }

  /**
   * Preload related content
   */
  private async preloadRelatedContent(relatedIds: string[]): Promise<void> {
    try {
      const preloadPromises = relatedIds.map(async (id) => {
        try {
          await this.smartCache.get(id, {
            trackAccess: true,
            preloadRelated: false
          });
        } catch (error) {
          // Ignore preload errors
        }
      });

      await Promise.allSettled(preloadPromises);

    } catch (error) {
      console.warn(`⚠️ Failed to preload related content:`, error);
    }
  }

  /**
   * Generate request ID for caching
   */
  private generateRequestId(request: Context7Request): string {
    const queryHash = this.hashString(request.query);
    const contextHash = request.context ? this.hashString(request.context) : '';
    const optionsHash = request.options ? this.hashString(JSON.stringify(request.options)) : '';

    return `context7-${queryHash}-${contextHash}-${optionsHash}`.replace(/-+/g, '-').replace(/^-|-$/g, '');
  }

  /**
   * Hash string for ID generation
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Check if cache entry is valid
   */
  private isCacheValid(cachedData: any): boolean {
    try {
      // Check if it's a valid Context7Response
      if (!cachedData || typeof cachedData !== 'object') {
        return false;
      }

      // Check required fields
      if (!cachedData.id || !cachedData.query || !cachedData.response) {
        return false;
      }

      // Check timestamp (cache for 24 hours)
      if (cachedData.metadata?.timestamp) {
        const cacheAge = Date.now() - new Date(cachedData.metadata.timestamp).getTime();
        if (cacheAge > 24 * 60 * 60 * 1000) { // 24 hours
          return false;
        }
      }

      return true;

    } catch (error) {
      return false;
    }
  }

  /**
   * Calculate cache priority based on response
   */
  private calculateCachePriority(response: Context7Response): number {
    let priority = 5; // Default priority

    // Higher priority for responses with more tokens (more valuable)
    if (response.metadata.tokens > 500) priority += 2;
    if (response.metadata.tokens > 1000) priority += 1;

    // Higher priority for faster responses (more likely to be reused)
    if (response.metadata.latency < 1000) priority += 1;

    // Higher priority for responses with related content
    if (response.related && response.related.length > 0) priority += 1;

    return Math.min(10, Math.max(1, priority));
  }

  /**
   * Determine if response should be compressed
   */
  private shouldCompress(response: Context7Response): boolean {
    if (!this.config.compressionEnabled) return false;

    const responseSize = JSON.stringify(response).length;
    return responseSize > this.config.compressionThreshold;
  }

  /**
   * Record cache hit
   */
  private recordCacheHit(): void {
    this.metrics.cacheHits++;
    this.metrics.totalRequests++;
  }

  /**
   * Record cache miss
   */
  private recordCacheMiss(): void {
    this.metrics.cacheMisses++;
    this.metrics.totalRequests++;
  }

  /**
   * Record API call
   */
  private recordApiCall(latency: number, tokens: number): void {
    this.metrics.apiCalls++;
    this.metrics.totalTokens += tokens;
    this.metrics.averageLatency = (this.metrics.averageLatency * 0.9) + (latency * 0.1);
  }

  /**
   * Record deduplication
   */
  private recordDeduplication(): void {
    this.metrics.deduplicationSavings++;
  }

  /**
   * Record error
   */
  private recordError(): void {
    this.metrics.errorRate = (this.metrics.errorRate * 0.9) + (1 * 0.1);
  }

  /**
   * Get Context7 metrics
   */
  async getMetrics(): Promise<Context7Metrics> {
    try {
      // Update cost savings calculation
      this.metrics.costSavings = this.metrics.cacheHits * 0.001; // $0.001 per cache hit

      return { ...this.metrics };

    } catch (error) {
      console.error('❌ Failed to get Context7 metrics:', error);
      return this.metrics;
    }
  }

  /**
   * Initialize metrics
   */
  private initializeMetrics(): Context7Metrics {
    return {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      apiCalls: 0,
      averageLatency: 0,
      totalTokens: 0,
      costSavings: 0,
      errorRate: 0,
      deduplicationSavings: 0
    };
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    this.smartCache.on('hit', (event) => {
      this.emit('cache_hit', event);
    });

    this.smartCache.on('miss', (event) => {
      this.emit('cache_miss', event);
    });

    this.smartCache.on('evict', (event) => {
      this.emit('evict', event);
    });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const cacheHealth = await this.smartCache.healthCheck();
      const metrics = await this.getMetrics();

      const status = cacheHealth.status === 'healthy' ? 'healthy' : cacheHealth.status;

      return {
        status,
        details: {
          cache: cacheHealth.details,
          metrics,
          config: {
            apiEndpoint: this.config.apiEndpoint,
            cacheStrategy: this.config.cacheStrategy,
            deduplicationEnabled: this.config.deduplicationEnabled,
            compressionEnabled: this.config.compressionEnabled
          }
        }
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Warm cache
   */
  async warmCache(): Promise<void> {
    try {
      await this.smartCache.warmCache();
      console.log('✅ Context7 cache warmed');
    } catch (error) {
      console.error('❌ Failed to warm Context7 cache:', error);
      throw error;
    }
  }

  /**
   * Cleanup
   */
  async cleanup(): Promise<void> {
    await this.smartCache.cleanup();
    this.removeAllListeners();
    console.log('✅ Context7 Integration cleaned up');
  }
}

// Export factory function
export function createContext7Integration(
  database: SQLiteDatabase,
  fileManager: FileManager,
  metadataAPI: ArtifactMetadataAPI,
  config?: Partial<Context7Config>
): Context7Integration {
  return new Context7Integration(database, fileManager, metadataAPI, config);
}
