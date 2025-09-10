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
export declare class Context7Enhancer {
    private cache;
    private options;
    constructor(cache?: Context7Cache, options?: EnhancementOptions);
    /**
     * Enhance any data with Context7 knowledge
     */
    enhanceWithContext7<T>(data: T, topic: string, options?: Partial<EnhancementOptions>): Promise<EnhancedResponse<T>>;
    /**
     * Enhance text content with Context7 knowledge
     */
    enhanceText(text: string, topic: string, options?: Partial<EnhancementOptions>): Promise<EnhancedResponse<string>>;
    /**
     * Enhance object data with Context7 knowledge
     */
    enhanceObject<T extends Record<string, any>>(obj: T, topic: string, options?: Partial<EnhancementOptions>): Promise<EnhancedResponse<T>>;
    /**
     * Enhance array data with Context7 knowledge
     */
    enhanceArray<T>(arr: T[], topic: string, options?: Partial<EnhancementOptions>): Promise<EnhancedResponse<T[]>>;
    /**
     * Get Context7 data without enhancing existing data
     */
    getContext7Data(topic: string, options?: Partial<EnhancementOptions>): Promise<ExternalKnowledge[]>;
    /**
     * Get cache statistics
     */
    getCacheStats(): import("../core/context7-cache.js").CacheStats;
    /**
     * Clear cache
     */
    clearCache(): void;
    /**
     * Check if cache is healthy
     */
    isHealthy(): boolean;
    /**
     * Update enhancement options
     */
    updateOptions(options: Partial<EnhancementOptions>): void;
    /**
     * Get current options
     */
    getOptions(): EnhancementOptions;
}
/**
 * Factory function to create Context7 enhancer
 */
export declare function createContext7Enhancer(cache?: Context7Cache, options?: EnhancementOptions): Context7Enhancer;
/**
 * Simple enhancement function for quick use
 */
export declare function enhanceWithContext7<T>(data: T, topic: string, options?: EnhancementOptions): Promise<EnhancedResponse<T>>;
/**
 * Simple text enhancement function
 */
export declare function enhanceText(text: string, topic: string, options?: EnhancementOptions): Promise<EnhancedResponse<string>>;
/**
 * Simple object enhancement function
 */
export declare function enhanceObject<T extends Record<string, any>>(obj: T, topic: string, options?: EnhancementOptions): Promise<EnhancedResponse<T>>;
/**
 * Simple array enhancement function
 */
export declare function enhanceArray<T>(arr: T[], topic: string, options?: EnhancementOptions): Promise<EnhancedResponse<T[]>>;
//# sourceMappingURL=context7-enhancer.d.ts.map