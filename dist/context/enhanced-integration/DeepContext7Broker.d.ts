#!/usr/bin/env node
/**
 * Deep Context7 Broker - Week 2 Enhanced
 *
 * Advanced Context7 integration with deep features including:
 * - Persistent context management across sessions
 * - Intelligent context injection and suggestion
 * - Context compression and relevance scoring
 * - Cross-session context preservation and retrieval
 * - Real-time context adaptation and learning
 *
 * Phase 1, Week 2 - Deep Context7 Integration Implementation
 */
import { z } from 'zod';
/**
 * Context Entry Schema for Deep Context7
 */
export declare const ContextEntrySchema: z.ZodObject<{
    id: z.ZodString;
    sessionId: z.ZodString;
    toolName: z.ZodString;
    contextType: z.ZodEnum<["user_query", "system_response", "tool_output", "error_context", "workflow_state"]>;
    content: z.ZodString;
    relevanceScore: z.ZodNumber;
    timestamp: z.ZodDate;
    metadata: z.ZodOptional<z.ZodObject<{
        tokenCount: z.ZodOptional<z.ZodNumber>;
        qualityScore: z.ZodOptional<z.ZodNumber>;
        userLevel: z.ZodOptional<z.ZodString>;
        projectId: z.ZodOptional<z.ZodString>;
        workflowStage: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        projectId?: string | undefined;
        qualityScore?: number | undefined;
        tokenCount?: number | undefined;
        userLevel?: string | undefined;
        workflowStage?: string | undefined;
    }, {
        projectId?: string | undefined;
        qualityScore?: number | undefined;
        tokenCount?: number | undefined;
        userLevel?: string | undefined;
        workflowStage?: string | undefined;
    }>>;
    relationships: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["follows", "references", "contradicts", "enhances"]>;
        targetContextId: z.ZodString;
        strength: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        type: "follows" | "references" | "contradicts" | "enhances";
        targetContextId: string;
        strength: number;
    }, {
        type: "follows" | "references" | "contradicts" | "enhances";
        targetContextId: string;
        strength: number;
    }>, "many">>;
    persistenceLevel: z.ZodDefault<z.ZodEnum<["session", "project", "user", "global"]>>;
    compressionInfo: z.ZodOptional<z.ZodObject<{
        originalLength: z.ZodNumber;
        compressedLength: z.ZodNumber;
        compressionRatio: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        originalLength: number;
        compressedLength: number;
        compressionRatio: number;
    }, {
        originalLength: number;
        compressedLength: number;
        compressionRatio: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    content: string;
    timestamp: Date;
    toolName: string;
    sessionId: string;
    contextType: "user_query" | "system_response" | "tool_output" | "error_context" | "workflow_state";
    relevanceScore: number;
    persistenceLevel: "project" | "session" | "user" | "global";
    metadata?: {
        projectId?: string | undefined;
        qualityScore?: number | undefined;
        tokenCount?: number | undefined;
        userLevel?: string | undefined;
        workflowStage?: string | undefined;
    } | undefined;
    relationships?: {
        type: "follows" | "references" | "contradicts" | "enhances";
        targetContextId: string;
        strength: number;
    }[] | undefined;
    compressionInfo?: {
        originalLength: number;
        compressedLength: number;
        compressionRatio: number;
    } | undefined;
}, {
    id: string;
    content: string;
    timestamp: Date;
    toolName: string;
    sessionId: string;
    contextType: "user_query" | "system_response" | "tool_output" | "error_context" | "workflow_state";
    relevanceScore: number;
    metadata?: {
        projectId?: string | undefined;
        qualityScore?: number | undefined;
        tokenCount?: number | undefined;
        userLevel?: string | undefined;
        workflowStage?: string | undefined;
    } | undefined;
    relationships?: {
        type: "follows" | "references" | "contradicts" | "enhances";
        targetContextId: string;
        strength: number;
    }[] | undefined;
    persistenceLevel?: "project" | "session" | "user" | "global" | undefined;
    compressionInfo?: {
        originalLength: number;
        compressedLength: number;
        compressionRatio: number;
    } | undefined;
}>;
export type ContextEntry = z.infer<typeof ContextEntrySchema>;
/**
 * Context Injection Configuration
 */
export interface ContextInjectionConfig {
    maxContextLength: number;
    relevanceThreshold: number;
    compressionEnabled: boolean;
    adaptiveInjection: boolean;
    crossSessionEnabled: boolean;
    learningEnabled: boolean;
}
/**
 * Context Suggestion Result
 */
export interface ContextSuggestion {
    id: string;
    type: 'relevant_context' | 'similar_pattern' | 'workflow_continuation' | 'error_prevention';
    content: string;
    relevanceScore: number;
    reasoning: string;
    suggestedAction: 'inject' | 'reference' | 'ignore';
    metadata: Record<string, any>;
}
/**
 * Context Analysis Result
 */
export interface ContextAnalysis {
    contextId: string;
    analysis: {
        relevanceScore: number;
        qualityIndicators: {
            clarity: number;
            completeness: number;
            specificity: number;
            actionability: number;
        };
        relationships: Array<{
            contextId: string;
            relationshipType: string;
            strength: number;
        }>;
        compressionOpportunities: Array<{
            section: string;
            potentialReduction: number;
            preservedInformation: number;
        }>;
        adaptationSuggestions: string[];
    };
}
/**
 * Deep Context7 Broker Class
 */
export declare class DeepContext7Broker {
    private contextStore;
    private sessionContexts;
    private relevanceScorer;
    private contextCompressor;
    private suggestionEngine;
    private learningEngine;
    private config;
    constructor(config?: Partial<ContextInjectionConfig>);
    /**
     * Store context with deep analysis and relationships
     */
    storeContext(entry: Partial<ContextEntry>): Promise<string>;
    /**
     * Retrieve relevant context with intelligent selection
     */
    getRelevantContext(sessionId: string, query: string, toolName: string, options?: {
        maxResults?: number;
        minRelevance?: number;
        includeMetadata?: boolean;
        crossSession?: boolean;
    }): Promise<ContextEntry[]>;
    /**
     * Generate intelligent context suggestions
     */
    generateContextSuggestions(sessionId: string, currentTool: string, userInput: string, workflowStage?: string): Promise<ContextSuggestion[]>;
    /**
     * Inject context into tool execution
     */
    injectContext(sessionId: string, toolName: string, userInput: string, injectionMode?: 'adaptive' | 'comprehensive' | 'minimal'): Promise<{
        enhancedInput: string;
        injectedContexts: ContextEntry[];
        injectionMetadata: {
            totalContexts: number;
            totalTokens: number;
            compressionApplied: boolean;
            adaptationReason: string;
        };
    }>;
    /**
     * Clean up old contexts with intelligent retention
     */
    cleanupContexts(options?: {
        maxAge?: number;
        minRelevance?: number;
        preserveHighValue?: boolean;
        sessionId?: string;
    }): Promise<{
        removed: number;
        preserved: number;
        preservedHighValue: number;
    }>;
    /**
     * Get context statistics and performance metrics
     */
    getContextStatistics(): {
        totalContexts: number;
        sessionCount: number;
        avgContextsPerSession: number;
        avgRelevanceScore: number;
        compressionStats: {
            compressedContexts: number;
            avgCompressionRatio: number;
            totalSpaceSaved: number;
        };
        persistenceStats: {
            session: number;
            project: number;
            user: number;
            global: number;
        };
    };
    /**
     * Private helper methods
     */
    private generateContextId;
    private getSessionContext;
    private addToSessionContext;
    private removeFromSessionContext;
    private getCrossSessionContext;
    private analyzeContext;
    private adaptiveContextSelection;
    private assessInputComplexity;
    private getToolContextRequirements;
    private buildContextPreamble;
    private estimateTokens;
    private isHighValueContext;
}
export declare function createDeepContext7Broker(config?: Partial<ContextInjectionConfig>): DeepContext7Broker;
//# sourceMappingURL=DeepContext7Broker.d.ts.map