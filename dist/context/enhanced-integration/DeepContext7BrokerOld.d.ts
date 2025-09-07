#!/usr/bin/env node
/**
 * Deep Context7 Integration Broker - Week 2 Enhanced
 *
 * Advanced Context7 integration with persistent context management,
 * intelligent context suggestion, cross-session preservation, and
 * real-time context adaptation with learning capabilities.
 *
 * Phase 1, Week 2 - Deep Context7 Integration Implementation
 * Features: Enhanced broker, intelligent injection, learning engine
 */
import { z } from 'zod';
/**
 * Enhanced Context Configuration
 */
export declare const ContextConfigSchema: z.ZodObject<{
    apiEndpoint: z.ZodDefault<z.ZodString>;
    apiKey: z.ZodOptional<z.ZodString>;
    maxContextLength: z.ZodDefault<z.ZodNumber>;
    compressionThreshold: z.ZodDefault<z.ZodNumber>;
    relevanceThreshold: z.ZodDefault<z.ZodNumber>;
    sessionTimeout: z.ZodDefault<z.ZodNumber>;
    persistenceEnabled: z.ZodDefault<z.ZodBoolean>;
    intelligentSuggestions: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    maxContextLength: number;
    relevanceThreshold: number;
    apiEndpoint: string;
    compressionThreshold: number;
    sessionTimeout: number;
    persistenceEnabled: boolean;
    intelligentSuggestions: boolean;
    apiKey?: string | undefined;
}, {
    maxContextLength?: number | undefined;
    relevanceThreshold?: number | undefined;
    apiEndpoint?: string | undefined;
    apiKey?: string | undefined;
    compressionThreshold?: number | undefined;
    sessionTimeout?: number | undefined;
    persistenceEnabled?: boolean | undefined;
    intelligentSuggestions?: boolean | undefined;
}>;
export type ContextConfig = z.infer<typeof ContextConfigSchema>;
/**
 * Context Session Schema
 */
export declare const ContextSessionSchema: z.ZodObject<{
    sessionId: z.ZodString;
    userId: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    lastAccessed: z.ZodDate;
    expiresAt: z.ZodDate;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    contextEntries: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        content: z.ZodString;
        timestamp: z.ZodDate;
        relevanceScore: z.ZodNumber;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        toolSource: z.ZodOptional<z.ZodString>;
        compressed: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        content: string;
        timestamp: Date;
        id: string;
        tags: string[];
        relevanceScore: number;
        compressed: boolean;
        toolSource?: string | undefined;
    }, {
        content: string;
        timestamp: Date;
        id: string;
        relevanceScore: number;
        tags?: string[] | undefined;
        toolSource?: string | undefined;
        compressed?: boolean | undefined;
    }>, "many">>;
    totalTokens: z.ZodDefault<z.ZodNumber>;
    compressionRatio: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    expiresAt: Date;
    sessionId: string;
    metadata: Record<string, any>;
    compressionRatio: number;
    createdAt: Date;
    lastAccessed: Date;
    contextEntries: {
        content: string;
        timestamp: Date;
        id: string;
        tags: string[];
        relevanceScore: number;
        compressed: boolean;
        toolSource?: string | undefined;
    }[];
    totalTokens: number;
    projectId?: string | undefined;
    userId?: string | undefined;
}, {
    expiresAt: Date;
    sessionId: string;
    createdAt: Date;
    lastAccessed: Date;
    projectId?: string | undefined;
    metadata?: Record<string, any> | undefined;
    compressionRatio?: number | undefined;
    userId?: string | undefined;
    contextEntries?: {
        content: string;
        timestamp: Date;
        id: string;
        relevanceScore: number;
        tags?: string[] | undefined;
        toolSource?: string | undefined;
        compressed?: boolean | undefined;
    }[] | undefined;
    totalTokens?: number | undefined;
}>;
export type ContextSession = z.infer<typeof ContextSessionSchema>;
/**
 * Context Suggestion
 */
export interface ContextSuggestion {
    id: string;
    content: string;
    relevanceScore: number;
    source: 'history' | 'similar-projects' | 'best-practices' | 'documentation';
    reasoning: string;
    estimatedTokens: number;
    priority: 'high' | 'medium' | 'low';
}
/**
 * Context Enhancement Result
 */
export interface ContextEnhancementResult {
    originalContext: string;
    enhancedContext: string;
    suggestions: ContextSuggestion[];
    tokensAdded: number;
    tokensSaved: number;
    netTokenChange: number;
    qualityImprovement: number;
    metadata: {
        enhancementTime: number;
        strategiesApplied: string[];
        sessionData: boolean;
        suggestionsCount: number;
    };
}
/**
 * Deep Context7 Broker Class
 */
export declare class DeepContext7Broker {
    private config;
    private activeSessions;
    private contextCache;
    private suggestionEngine;
    private compressionEngine;
    private persistenceEngine;
    constructor(config?: Partial<ContextConfig>);
    /**
     * Enhanced context retrieval and enrichment
     */
    enhanceContext(originalContext: string, sessionId: string, toolName: string, options?: {
        includeSuggestions?: boolean;
        maxEnhancement?: number;
        priorityLevel?: 'speed' | 'balanced' | 'comprehensive';
    }): Promise<ContextEnhancementResult>;
    /**
     * Cross-session context preservation
     */
    preserveContext(sessionId: string, contextData: {
        content: string;
        toolName: string;
        success: boolean;
        metadata?: Record<string, any>;
    }): Promise<void>;
    /**
     * Intelligent context suggestions
     */
    generateContextSuggestions(currentContext: string, sessionId: string, toolName: string, count?: number): Promise<ContextSuggestion[]>;
    /**
     * Session management
     */
    private getOrCreateSession;
    private renewSession;
    private compressSession;
    /**
     * Helper methods
     */
    private retrieveRelevantHistory;
    private mergeContexts;
    private calculateSimilarity;
    private extractWords;
    private calculateQualityImprovement;
    private getAppliedStrategies;
    private updateSession;
    private cacheContextResult;
    private hashString;
    private estimateTokens;
    /**
     * Public API methods
     */
    getSessionStats(sessionId: string): Promise<{
        totalEntries: number;
        totalTokens: number;
        compressionRatio: number;
        lastAccessed: Date;
        expiresAt: Date;
    } | null>;
    clearSession(sessionId: string): Promise<boolean>;
    getActiveSessionCount(): number;
    getCacheStats(): {
        size: number;
        hitRate: number;
    };
}
export declare function createDeepContext7Broker(config?: Partial<ContextConfig>): DeepContext7Broker;
//# sourceMappingURL=DeepContext7BrokerOld.d.ts.map