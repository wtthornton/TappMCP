#!/usr/bin/env node
/**
 * Code Reuse Pattern Engine
 *
 * Detects, analyzes, and suggests reusable code patterns to reduce
 * redundancy and improve development efficiency across MCP tools.
 *
 * Phase 1, Week 1 - Code Reuse Pattern Detection System
 */
import { z } from 'zod';
/**
 * Code Pattern Schema
 */
export declare const CodePatternSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    category: z.ZodEnum<["validation", "error-handling", "data-transformation", "api-integration", "logging", "testing", "utility", "schema"]>;
    pattern: z.ZodString;
    abstractPattern: z.ZodString;
    complexity: z.ZodEnum<["low", "medium", "high"]>;
    confidence: z.ZodNumber;
    usageCount: z.ZodDefault<z.ZodNumber>;
    locations: z.ZodArray<z.ZodObject<{
        file: z.ZodString;
        startLine: z.ZodNumber;
        endLine: z.ZodNumber;
        toolName: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        file: string;
        startLine: number;
        endLine: number;
        toolName?: string | undefined;
    }, {
        file: string;
        startLine: number;
        endLine: number;
        toolName?: string | undefined;
    }>, "many">;
    variables: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        type: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        name: string;
        description?: string | undefined;
    }, {
        type: string;
        name: string;
        description?: string | undefined;
    }>, "many">>;
    dependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    examples: z.ZodDefault<z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        description: z.ZodString;
        context: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        code: string;
        context?: string | undefined;
    }, {
        description: string;
        code: string;
        context?: string | undefined;
    }>, "many">>;
    metrics: z.ZodDefault<z.ZodObject<{
        tokensPerUse: z.ZodDefault<z.ZodNumber>;
        avgComplexity: z.ZodDefault<z.ZodNumber>;
        reuseOpportunities: z.ZodDefault<z.ZodNumber>;
        potentialSavings: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        tokensPerUse: number;
        avgComplexity: number;
        reuseOpportunities: number;
        potentialSavings: number;
    }, {
        tokensPerUse?: number | undefined;
        avgComplexity?: number | undefined;
        reuseOpportunities?: number | undefined;
        potentialSavings?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    description: string;
    name: string;
    complexity: "high" | "medium" | "low";
    id: string;
    pattern: string;
    metrics: {
        tokensPerUse: number;
        avgComplexity: number;
        reuseOpportunities: number;
        potentialSavings: number;
    };
    confidence: number;
    category: "validation" | "testing" | "logging" | "schema" | "error-handling" | "data-transformation" | "api-integration" | "utility";
    usageCount: number;
    dependencies: string[];
    variables: {
        type: string;
        name: string;
        description?: string | undefined;
    }[];
    examples: {
        description: string;
        code: string;
        context?: string | undefined;
    }[];
    abstractPattern: string;
    locations: {
        file: string;
        startLine: number;
        endLine: number;
        toolName?: string | undefined;
    }[];
}, {
    description: string;
    name: string;
    complexity: "high" | "medium" | "low";
    id: string;
    pattern: string;
    confidence: number;
    category: "validation" | "testing" | "logging" | "schema" | "error-handling" | "data-transformation" | "api-integration" | "utility";
    abstractPattern: string;
    locations: {
        file: string;
        startLine: number;
        endLine: number;
        toolName?: string | undefined;
    }[];
    metrics?: {
        tokensPerUse?: number | undefined;
        avgComplexity?: number | undefined;
        reuseOpportunities?: number | undefined;
        potentialSavings?: number | undefined;
    } | undefined;
    usageCount?: number | undefined;
    dependencies?: string[] | undefined;
    variables?: {
        type: string;
        name: string;
        description?: string | undefined;
    }[] | undefined;
    examples?: {
        description: string;
        code: string;
        context?: string | undefined;
    }[] | undefined;
}>;
export type CodePattern = z.infer<typeof CodePatternSchema>;
/**
 * Pattern Detection Config
 */
export declare const DetectionConfigSchema: z.ZodObject<{
    minPatternSize: z.ZodDefault<z.ZodNumber>;
    maxPatternSize: z.ZodDefault<z.ZodNumber>;
    minSimilarity: z.ZodDefault<z.ZodNumber>;
    minOccurrences: z.ZodDefault<z.ZodNumber>;
    excludePatterns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    priorityKeywords: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    minPatternSize: number;
    maxPatternSize: number;
    minSimilarity: number;
    minOccurrences: number;
    excludePatterns: string[];
    priorityKeywords: string[];
}, {
    minPatternSize?: number | undefined;
    maxPatternSize?: number | undefined;
    minSimilarity?: number | undefined;
    minOccurrences?: number | undefined;
    excludePatterns?: string[] | undefined;
    priorityKeywords?: string[] | undefined;
}>;
export type DetectionConfig = z.infer<typeof DetectionConfigSchema>;
/**
 * Code Similarity Result
 */
export interface SimilarityResult {
    similarity: number;
    matchedLines: number;
    totalLines: number;
    differences: Array<{
        line: number;
        expected: string;
        actual: string;
        type: 'addition' | 'deletion' | 'modification';
    }>;
}
/**
 * Pattern Suggestion
 */
export interface PatternSuggestion {
    pattern: CodePattern;
    confidence: number;
    estimatedSavings: number;
    replacements: Array<{
        file: string;
        startLine: number;
        endLine: number;
        currentCode: string;
        suggestedCode: string;
        variables: Record<string, string>;
    }>;
    rationale: string;
}
/**
 * Code Reuse Pattern Engine Class
 */
export declare class CodeReusePatternEngine {
    private config;
    private patterns;
    private patternIndex;
    private codeCache;
    constructor(config?: Partial<DetectionConfig>);
    /**
     * Analyze codebase and detect patterns
     */
    analyzeCodebase(files: Array<{
        path: string;
        content: string;
    }>): Promise<CodePattern[]>;
    /**
     * Suggest pattern applications for new code
     */
    suggestPatterns(code: string, context?: {
        file?: string;
        toolName?: string;
        taskType?: string;
    }): Promise<PatternSuggestion[]>;
    /**
     * Generate reusable utility function from pattern
     */
    generateUtilityFunction(pattern: CodePattern, functionName: string): {
        functionCode: string;
        imports: string[];
        usage: string;
    };
    /**
     * Get pattern statistics
     */
    getPatternStats(): {
        totalPatterns: number;
        patternsByCategory: Record<string, number>;
        topPatterns: Array<{
            pattern: CodePattern;
            score: number;
        }>;
        potentialSavings: number;
        reuseOpportunities: number;
    };
    /**
     * Extract code segments from files
     */
    private extractCodeSegments;
    /**
     * Find similar patterns in code segments
     */
    private findSimilarPatterns;
    /**
     * Analyze detected patterns
     */
    private analyzePatterns;
    /**
     * Helper methods
     */
    private shouldExcludeSegment;
    private hashCodeSegment;
    private createAbstractPattern;
    private calculatePatternConfidence;
    private categorizePattern;
    private assessComplexity;
    private extractVariables;
    private extractDependencies;
    private generateExamples;
    private estimateTokenCount;
    private calculateAverageComplexity;
    private calculatePotentialSavings;
    private generatePatternId;
    private generatePatternName;
    private generatePatternDescription;
    private calculateSimilarity;
    private createPatternSuggestion;
    private applyPatternToCode;
    private extractVariableValues;
    private parameterizePattern;
    private indexPattern;
}
export declare function createCodeReusePatternEngine(config?: Partial<DetectionConfig>): CodeReusePatternEngine;
//# sourceMappingURL=CodeReusePatternEngine.d.ts.map