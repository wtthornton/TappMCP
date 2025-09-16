#!/usr/bin/env node
/**
 * Error Prevention System
 *
 * Predictive error detection and prevention system using ML-based analysis
 * to identify potential failures before they occur in MCP tool operations.
 *
 * Phase 1, Week 1 - Proactive Error Prevention System
 */
import { z } from 'zod';
/**
 * Error Pattern Schema
 */
export declare const ErrorPatternSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    category: z.ZodEnum<["validation", "network", "authentication", "timeout", "memory", "dependency", "configuration", "logic", "data"]>;
    pattern: z.ZodString;
    description: z.ZodString;
    severity: z.ZodEnum<["low", "medium", "high", "critical"]>;
    confidence: z.ZodNumber;
    historicalOccurrences: z.ZodDefault<z.ZodNumber>;
    lastSeen: z.ZodOptional<z.ZodDate>;
    preventionStrategies: z.ZodArray<z.ZodObject<{
        strategy: z.ZodString;
        description: z.ZodString;
        effectiveness: z.ZodNumber;
        autoApplicable: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        strategy: string;
        effectiveness: number;
        autoApplicable: boolean;
    }, {
        description: string;
        strategy: string;
        effectiveness: number;
        autoApplicable?: boolean | undefined;
    }>, "many">;
    contextPatterns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    associatedErrors: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    severity: "low" | "medium" | "high" | "critical";
    name: string;
    description: string;
    id: string;
    pattern: string;
    confidence: number;
    category: "data" | "dependency" | "timeout" | "validation" | "network" | "memory" | "authentication" | "configuration" | "logic";
    historicalOccurrences: number;
    preventionStrategies: {
        description: string;
        strategy: string;
        effectiveness: number;
        autoApplicable: boolean;
    }[];
    contextPatterns: string[];
    associatedErrors: string[];
    lastSeen?: Date | undefined;
}, {
    severity: "low" | "medium" | "high" | "critical";
    name: string;
    description: string;
    id: string;
    pattern: string;
    confidence: number;
    category: "data" | "dependency" | "timeout" | "validation" | "network" | "memory" | "authentication" | "configuration" | "logic";
    preventionStrategies: {
        description: string;
        strategy: string;
        effectiveness: number;
        autoApplicable?: boolean | undefined;
    }[];
    historicalOccurrences?: number | undefined;
    lastSeen?: Date | undefined;
    contextPatterns?: string[] | undefined;
    associatedErrors?: string[] | undefined;
}>;
export type ErrorPattern = z.infer<typeof ErrorPatternSchema>;
/**
 * Error Prediction Result
 */
export interface ErrorPrediction {
    patternId: string;
    patternName: string;
    category: ErrorPattern['category'];
    severity: ErrorPattern['severity'];
    confidence: number;
    riskScore: number;
    location: {
        file?: string;
        line?: number;
        function?: string;
        context: string;
    };
    description: string;
    suggestedFixes: Array<{
        fix: string;
        description: string;
        priority: number;
        estimatedEffort: 'low' | 'medium' | 'high';
        autoApplicable: boolean;
    }>;
    similarPastErrors: Array<{
        pattern: string;
        resolution: string;
        effectiveness: number;
    }>;
}
/**
 * Prevention Configuration
 */
export declare const PreventionConfigSchema: z.ZodObject<{
    riskThreshold: z.ZodDefault<z.ZodNumber>;
    enableAutoFix: z.ZodDefault<z.ZodBoolean>;
    maxPredictionsPerAnalysis: z.ZodDefault<z.ZodNumber>;
    contextWindowSize: z.ZodDefault<z.ZodNumber>;
    enableLearning: z.ZodDefault<z.ZodBoolean>;
    priorityFilters: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    riskThreshold: number;
    enableAutoFix: boolean;
    maxPredictionsPerAnalysis: number;
    contextWindowSize: number;
    enableLearning: boolean;
    priorityFilters: string[];
}, {
    riskThreshold?: number | undefined;
    enableAutoFix?: boolean | undefined;
    maxPredictionsPerAnalysis?: number | undefined;
    contextWindowSize?: number | undefined;
    enableLearning?: boolean | undefined;
    priorityFilters?: string[] | undefined;
}>;
export type PreventionConfig = z.infer<typeof PreventionConfigSchema>;
/**
 * Analysis Context
 */
export interface AnalysisContext {
    toolName: string;
    operation: string;
    codeContext: string;
    environment: 'development' | 'staging' | 'production';
    previousErrors?: Array<{
        error: string;
        timestamp: Date;
        resolved: boolean;
    }>;
    dependencies: string[];
    configurationState: Record<string, any>;
}
/**
 * Prevention Statistics
 */
export interface PreventionStats {
    totalAnalyses: number;
    predictionsGenerated: number;
    errorsPrevented: number;
    falsePositives: number;
    accuracyRate: number;
    patternsByCategory: Record<string, number>;
    mostCommonPatterns: Array<{
        pattern: ErrorPattern;
        occurrences: number;
        preventionRate: number;
    }>;
    recentTrends: {
        increasingPatterns: string[];
        decreasingPatterns: string[];
    };
}
/**
 * Error Prevention System Class
 */
export declare class ErrorPreventionSystem {
    private config;
    private errorPatterns;
    private analysisHistory;
    private patternIndex;
    private learningData;
    constructor(config?: Partial<PreventionConfig>);
    /**
     * Analyze code and predict potential errors
     */
    analyzeForErrors(context: AnalysisContext): Promise<ErrorPrediction[]>;
    /**
     * Learn from actual errors to improve predictions
     */
    learnFromError(error: {
        message: string;
        stack?: string;
        context: AnalysisContext;
        resolution?: string;
    }): Promise<void>;
    /**
     * Get prevention statistics
     */
    getStatistics(): PreventionStats;
    /**
     * Get specific error pattern suggestions
     */
    getPreventionSuggestions(category?: ErrorPattern['category']): Array<{
        pattern: ErrorPattern;
        suggestions: string[];
        priority: number;
    }>;
    /**
     * Initialize built-in error patterns
     */
    private initializeBuiltInPatterns;
    /**
     * Check if a pattern matches the given context
     */
    private checkPattern;
    /**
     * Calculate risk score for a pattern match
     */
    private calculateRiskScore;
    /**
     * Find the location of a pattern match
     */
    private findMatchLocation;
    /**
     * Find similar past errors for pattern
     */
    private findSimilarPastErrors;
    /**
     * Apply automatic fixes where possible
     */
    private applyAutoFixes;
    /**
     * Helper methods
     */
    private indexPattern;
    private recordAnalysis;
    private findMatchingPatterns;
    private createPatternFromError;
    private categorizeError;
    private updatePreventionStrategies;
    private calculatePreventionRate;
    private calculatePatternPriority;
    private calculateTrends;
    private estimateEffort;
}
export declare function createErrorPreventionSystem(config?: Partial<PreventionConfig>): ErrorPreventionSystem;
//# sourceMappingURL=ErrorPreventionSystem.d.ts.map