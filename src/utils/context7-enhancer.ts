#!/usr/bin/env node

/**
 * Context7 Enhancement Utility
 *
 * Provides simple enhancement functions for integrating Context7 cache
 * into existing TappMCP tools with minimal code changes.
 */

import { Context7Cache } from '../core/context7-cache.js';
import { type ExternalKnowledge } from '../core/mcp-coordinator.js';

/**
 * Enhancement Options
 */
export interface EnhancementOptions {
  maxResults?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  domain?: string;
  projectId?: string;
  enableLogging?: boolean;
}

/**
 * Enhanced Response with Context7 Data
 */
export interface EnhancedResponse<T = any> {
  originalData: T;
  context7Data: ExternalKnowledge[];
  enhancementMetadata: {
    cacheHit: boolean;
    responseTime: number;
    dataCount: number;
    timestamp: number;
  };
}

/**
 * Context7 Enhancement Utility
 */
export class Context7Enhancer {
  private cache: Context7Cache;
  private options: EnhancementOptions;

  constructor(cache?: Context7Cache, options: EnhancementOptions = {}) {
    this.cache = cache || new Context7Cache();
    this.options = {
      maxResults: options.maxResults ?? 5,
      priority: options.priority ?? 'medium',
      domain: options.domain ?? 'general',
      projectId: options.projectId ?? `enhance_${Date.now()}`,
      enableLogging: options.enableLogging ?? true,
    };
  }

  /**
   * Enhance any data with Context7 knowledge
   */
  async enhanceWithContext7<T>(
    data: T,
    topic: string,
    options: Partial<EnhancementOptions> = {}
  ): Promise<EnhancedResponse<T>> {
    const startTime = Date.now();
    const mergedOptions = { ...this.options, ...options };

    try {
      // Get Context7 data
      const context7Data = await this.cache.getRelevantData({
        businessRequest: topic,
        projectId: mergedOptions.projectId || `enhance_${Date.now()}`,
        domain: mergedOptions.domain || 'general',
        priority: mergedOptions.priority || 'medium',
        maxResults: mergedOptions.maxResults || 5,
      });

      const responseTime = Date.now() - startTime;
      const cacheHit = this.cache.getCacheStats().hitRate > 0;

      if (mergedOptions.enableLogging) {
        console.log(`🔍 Context7 enhanced: ${topic} (${context7Data.length} results, ${responseTime}ms)`);
      }

      return {
        originalData: data,
        context7Data,
        enhancementMetadata: {
          cacheHit,
          responseTime,
          dataCount: context7Data.length,
          timestamp: Date.now(),
        },
      };
    } catch (error) {
      console.error(`Context7 enhancement error for ${topic}:`, error);

      // Return original data with empty Context7 data on error
      return {
        originalData: data,
        context7Data: [],
        enhancementMetadata: {
          cacheHit: false,
          responseTime: Date.now() - startTime,
          dataCount: 0,
          timestamp: Date.now(),
        },
      };
    }
  }

  /**
   * Enhance text content with Context7 knowledge
   */
  async enhanceText(
    text: string,
    topic: string,
    options: Partial<EnhancementOptions> = {}
  ): Promise<EnhancedResponse<string>> {
    return this.enhanceWithContext7(text, topic, options);
  }

  /**
   * Enhance object data with Context7 knowledge
   */
  async enhanceObject<T extends Record<string, any>>(
    obj: T,
    topic: string,
    options: Partial<EnhancementOptions> = {}
  ): Promise<EnhancedResponse<T>> {
    return this.enhanceWithContext7(obj, topic, options);
  }

  /**
   * Enhance array data with Context7 knowledge
   */
  async enhanceArray<T>(
    arr: T[],
    topic: string,
    options: Partial<EnhancementOptions> = {}
  ): Promise<EnhancedResponse<T[]>> {
    return this.enhanceWithContext7(arr, topic, options);
  }

  /**
   * Get Context7 data without enhancing existing data
   */
  async getContext7Data(
    topic: string,
    options: Partial<EnhancementOptions> = {}
  ): Promise<ExternalKnowledge[]> {
    const mergedOptions = { ...this.options, ...options };

    return this.cache.getRelevantData({
      topic,
      projectId: mergedOptions.projectId || `enhance_${Date.now()}`,
      domain: mergedOptions.domain || 'general',
      priority: mergedOptions.priority || 'medium',
      maxResults: mergedOptions.maxResults || 5,
    });
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getCacheStats();
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clearCache();
  }

  /**
   * Check if cache is healthy
   */
  isHealthy() {
    return this.cache.isHealthy();
  }

  /**
   * Update enhancement options
   */
  updateOptions(options: Partial<EnhancementOptions>) {
    this.options = { ...this.options, ...options };
  }

  /**
   * Get current options
   */
  getOptions(): EnhancementOptions {
    return { ...this.options };
  }
}

/**
 * Factory function to create Context7 enhancer
 */
export function createContext7Enhancer(
  cache?: Context7Cache,
  options?: EnhancementOptions
): Context7Enhancer {
  return new Context7Enhancer(cache, options);
}

/**
 * Simple enhancement function for quick use
 */
export async function enhanceWithContext7<T>(
  data: T,
  topic: string,
  options: EnhancementOptions = {}
): Promise<EnhancedResponse<T>> {
  const enhancer = new Context7Enhancer(undefined, options);
  return enhancer.enhanceWithContext7(data, topic);
}

/**
 * Simple text enhancement function
 */
export async function enhanceText(
  text: string,
  topic: string,
  options: EnhancementOptions = {}
): Promise<EnhancedResponse<string>> {
  const enhancer = new Context7Enhancer(undefined, options);
  return enhancer.enhanceText(text, topic);
}

/**
 * Simple object enhancement function
 */
export async function enhanceObject<T extends Record<string, any>>(
  obj: T,
  topic: string,
  options: EnhancementOptions = {}
): Promise<EnhancedResponse<T>> {
  const enhancer = new Context7Enhancer(undefined, options);
  return enhancer.enhanceObject(obj, topic);
}

/**
 * Simple array enhancement function
 */
export async function enhanceArray<T>(
  arr: T[],
  topic: string,
  options: EnhancementOptions = {}
): Promise<EnhancedResponse<T[]>> {
  const enhancer = new Context7Enhancer(undefined, options);
  return enhancer.enhanceArray(arr, topic);
}
