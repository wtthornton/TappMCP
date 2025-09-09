#!/usr/bin/env node
/**
 * Intelligent Prompt Optimizer - Core Engine
 *
 * Provides AI-driven prompt optimization with context injection,
 * token budgeting, and dynamic template generation for maximum efficiency.
 *
 * Phase 1, Week 1 - Core Architecture Implementation
 */
import { z } from 'zod';
import { TokenBudgetManager } from './TokenBudgetManager';
import { ContextAwareTemplateEngine } from './ContextAwareTemplateEngine';
/**
 * Optimization Strategy Types
 */
export type OptimizationStrategy = 'compression' | 'context-aware' | 'template-based' | 'adaptive' | 'ml-driven';
/**
 * Token Budget Configuration
 */
export declare const TokenBudgetSchema: z.ZodObject<{
    maxTokens: z.ZodDefault<z.ZodNumber>;
    reserveTokens: z.ZodDefault<z.ZodNumber>;
    compressionTarget: z.ZodDefault<z.ZodNumber>;
    priorityAllocation: z.ZodDefault<z.ZodObject<{
        context: z.ZodDefault<z.ZodNumber>;
        instructions: z.ZodDefault<z.ZodNumber>;
        examples: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        context: number;
        instructions: number;
        examples: number;
    }, {
        context?: number | undefined;
        instructions?: number | undefined;
        examples?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    maxTokens: number;
    reserveTokens: number;
    compressionTarget: number;
    priorityAllocation: {
        context: number;
        instructions: number;
        examples: number;
    };
}, {
    maxTokens?: number | undefined;
    reserveTokens?: number | undefined;
    compressionTarget?: number | undefined;
    priorityAllocation?: {
        context?: number | undefined;
        instructions?: number | undefined;
        examples?: number | undefined;
    } | undefined;
}>;
export type TokenBudget = z.infer<typeof TokenBudgetSchema>;
/**
 * Prompt Optimization Context
 */
export declare const PromptContextSchema: z.ZodObject<{
    toolName: z.ZodString;
    taskComplexity: z.ZodDefault<z.ZodEnum<["low", "medium", "high"]>>;
    userHistory: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    projectContext: z.ZodOptional<z.ZodString>;
    timeConstraints: z.ZodDefault<z.ZodEnum<["fast", "balanced", "thorough"]>>;
    qualityRequirements: z.ZodDefault<z.ZodEnum<["basic", "standard", "premium"]>>;
}, "strip", z.ZodTypeAny, {
    qualityRequirements: "basic" | "standard" | "premium";
    toolName: string;
    taskComplexity: "high" | "medium" | "low";
    userHistory: string[];
    timeConstraints: "thorough" | "fast" | "balanced";
    projectContext?: string | undefined;
}, {
    toolName: string;
    qualityRequirements?: "basic" | "standard" | "premium" | undefined;
    projectContext?: string | undefined;
    taskComplexity?: "high" | "medium" | "low" | undefined;
    userHistory?: string[] | undefined;
    timeConstraints?: "thorough" | "fast" | "balanced" | undefined;
}>;
export type PromptContext = z.infer<typeof PromptContextSchema>;
/**
 * Optimization Request Interface (for API compatibility)
 */
export interface OptimizationRequest {
    toolName: string;
    originalPrompt: string;
    context: {
        taskType: 'generation' | 'analysis' | 'transformation' | 'planning' | 'debugging';
        userLevel: 'beginner' | 'intermediate' | 'advanced';
        outputFormat: 'code' | 'text' | 'structured' | 'markdown';
        timeConstraint: 'immediate' | 'standard' | 'thorough';
        constraints?: string[];
        preferences?: Record<string, any>;
        contextHistory?: string[];
    };
    targetReduction?: number;
    maxTokens?: number;
    qualityThreshold?: number;
}
/**
 * Simple Optimization Result (for API compatibility)
 */
export interface SimpleOptimizationResult {
    success: boolean;
    optimizedPrompt: string;
    tokenReduction: number;
    estimatedTokens: number;
    strategy: string;
    qualityScore: number;
    reason?: string;
    fallback?: {
        optimizedPrompt: string;
        qualityScore: number;
        strategy: string;
    };
}
/**
 * Optimization Result
 */
export interface OptimizationResult {
    originalPrompt: string;
    optimizedPrompt: string;
    strategy: OptimizationStrategy[];
    tokenSavings: {
        original: number;
        optimized: number;
        reductionPercentage: number;
    };
    qualityScore: number;
    metadata: {
        optimizationTime: number;
        strategyReasons: string[];
        contextInjected: boolean;
        templateUsed?: string;
    };
}
/**
 * Core Prompt Optimizer Class
 */
export declare class PromptOptimizer {
    private tokenBudget;
    private compressionPatterns;
    private templateCache;
    private optimizationHistory;
    private budgetManager;
    private templateEngine;
    constructor(budgetManager?: TokenBudgetManager, templateEngine?: ContextAwareTemplateEngine, budget?: Partial<TokenBudget>);
    /**
     * New API-compatible optimization method
     */
    optimize(request: OptimizationRequest): Promise<SimpleOptimizationResult>;
    /**
     * Legacy optimization entry point
     */
    optimizeLegacy(prompt: string, context: PromptContext, strategies?: OptimizationStrategy[]): Promise<OptimizationResult>;
    /**
     * Smart strategy selection based on context
     */
    private selectOptimalStrategies;
    /**
     * Apply specific optimization strategy
     */
    private applyStrategy;
    /**
     * Compression Strategy Implementation
     */
    private applyCompression;
    /**
     * Context-Aware Strategy Implementation
     */
    private applyContextAwareOptimization;
    /**
     * Template-Based Strategy Implementation
     */
    private applyTemplateOptimization;
    /**
     * ML-Driven Strategy Implementation (Placeholder for ML model)
     */
    private applyMLDrivenOptimization;
    /**
     * Initialize compression patterns
     */
    private initializeCompressionPatterns;
    /**
     * Get compression replacement for pattern
     */
    private getCompressionReplacement;
    /**
     * Token counting implementation
     */
    private countTokens;
    /**
     * Estimate quality score based on optimization changes
     */
    private estimateQualityScore;
    /**
     * Helper methods (implementation stubs for initial architecture)
     */
    private hasTemplateForTool;
    private getTemplate;
    private getUsedTemplate;
    private removeRedundantPhrases;
    private extractRelevantHistory;
    private getCommonWords;
    private buildContextInjection;
    private injectContext;
    private simplifyForLowComplexity;
    private enhanceForHighComplexity;
    private extractPromptInformation;
    private applyTemplate;
    private applyHeuristicOptimization;
    private maintainsKeyInstructions;
    /**
     * Helper methods for new API
     */
    private selectOptimalStrategy;
    private applyOptimization;
    private applyTemplateBasedOptimization;
    private applyContextOptimization;
    private applyAdaptiveOptimization;
    private extractKeyInformation;
    private calculateQualityScore;
    getAnalytics(): {
        totalOptimizations: number;
        averageReduction: number;
        strategyDistribution: Record<string, number>;
    };
    /**
     * Public API methods
     */
    getOptimizationHistory(): OptimizationResult[];
    updateTokenBudget(newBudget: Partial<TokenBudget>): void;
    addTemplate(toolName: string, template: string): void;
    getPerformanceMetrics(): {
        averageReduction: number;
        averageQualityScore: number;
        totalOptimizations: number;
    };
}
export declare function createPromptOptimizer(config?: {
    budgetConfig?: Record<string, unknown>;
    costConfig?: Record<string, unknown>;
    optimizationConfig?: {
        defaultStrategy?: OptimizationStrategy;
    };
}): PromptOptimizer;
//# sourceMappingURL=PromptOptimizer.d.ts.map