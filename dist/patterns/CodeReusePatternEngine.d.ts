#!/usr/bin/env node
/**
 * Code Reuse Pattern Engine
 *
 * Detects, analyzes, and suggests reusable code patterns to reduce token usage
 * and improve code quality through pattern-based optimization.
 */
import { z } from 'zod';
declare const DetectionConfigSchema: z.ZodObject<{
    minPatternSize: z.ZodDefault<z.ZodNumber>;
    maxPatternSize: z.ZodDefault<z.ZodNumber>;
    minOccurrences: z.ZodDefault<z.ZodNumber>;
    minSimilarity: z.ZodDefault<z.ZodNumber>;
    excludePatterns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    minPatternSize: number;
    maxPatternSize: number;
    minOccurrences: number;
    minSimilarity: number;
    excludePatterns: string[];
}, {
    minPatternSize?: number | undefined;
    maxPatternSize?: number | undefined;
    minOccurrences?: number | undefined;
    minSimilarity?: number | undefined;
    excludePatterns?: string[] | undefined;
}>;
declare const CodePatternSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    category: z.ZodEnum<["function", "class", "type", "control-flow", "error-handling", "async", "testing", "module", "utility"]>;
    complexity: z.ZodEnum<["low", "medium", "high"]>;
    pattern: z.ZodString;
    abstractPattern: z.ZodString;
    variables: z.ZodArray<z.ZodObject<{
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
    }>, "many">;
    dependencies: z.ZodArray<z.ZodString, "many">;
    examples: z.ZodArray<z.ZodString, "many">;
    metrics: z.ZodObject<{
        tokensPerUse: z.ZodNumber;
        avgComplexity: z.ZodNumber;
        reuseOpportunities: z.ZodNumber;
        potentialSavings: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        tokensPerUse: number;
        avgComplexity: number;
        reuseOpportunities: number;
        potentialSavings: number;
    }, {
        tokensPerUse: number;
        avgComplexity: number;
        reuseOpportunities: number;
        potentialSavings: number;
    }>;
}, "strip", z.ZodTypeAny, {
    pattern: string;
    id: string;
    description: string;
    category: "function" | "testing" | "type" | "module" | "utility" | "class" | "control-flow" | "error-handling" | "async";
    name: string;
    complexity: "low" | "medium" | "high";
    metrics: {
        tokensPerUse: number;
        avgComplexity: number;
        reuseOpportunities: number;
        potentialSavings: number;
    };
    dependencies: string[];
    variables: {
        type: string;
        name: string;
        description?: string | undefined;
    }[];
    examples: string[];
    abstractPattern: string;
}, {
    pattern: string;
    id: string;
    description: string;
    category: "function" | "testing" | "type" | "module" | "utility" | "class" | "control-flow" | "error-handling" | "async";
    name: string;
    complexity: "low" | "medium" | "high";
    metrics: {
        tokensPerUse: number;
        avgComplexity: number;
        reuseOpportunities: number;
        potentialSavings: number;
    };
    dependencies: string[];
    variables: {
        type: string;
        name: string;
        description?: string | undefined;
    }[];
    examples: string[];
    abstractPattern: string;
}>;
declare const PatternSuggestionSchema: z.ZodObject<{
    id: z.ZodString;
    patternId: z.ZodString;
    code: z.ZodString;
    similarity: z.ZodNumber;
    suggestedReplacement: z.ZodString;
    confidence: z.ZodNumber;
    rationale: z.ZodString;
    context: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    id: string;
    confidence: number;
    context: Record<string, unknown>;
    code: string;
    patternId: string;
    similarity: number;
    suggestedReplacement: string;
    rationale: string;
}, {
    id: string;
    confidence: number;
    context: Record<string, unknown>;
    code: string;
    patternId: string;
    similarity: number;
    suggestedReplacement: string;
    rationale: string;
}>;
declare const SimilarityResultSchema: z.ZodObject<{
    similarity: z.ZodNumber;
    commonLines: z.ZodNumber;
    totalLines: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    totalLines: number;
    similarity: number;
    commonLines: number;
}, {
    totalLines: number;
    similarity: number;
    commonLines: number;
}>;
export type DetectionConfig = z.infer<typeof DetectionConfigSchema>;
export type CodePattern = z.infer<typeof CodePatternSchema>;
export type PatternSuggestion = z.infer<typeof PatternSuggestionSchema>;
export type SimilarityResult = z.infer<typeof SimilarityResultSchema>;
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
    suggestPatterns(code: string, context?: Record<string, unknown>): Promise<PatternSuggestion[]>;
    /**
     * Get pattern statistics
     */
    getPatternStats(): {
        totalPatterns: number;
        patternsByCategory: Record<string, number>;
        totalPotentialSavings: number;
        processCompliancePatterns: Array<{
            id: string;
            name: string;
            description: string;
            category: string;
            pattern: string;
            abstractPattern: string;
            metrics: {
                tokensPerUse: number;
                avgComplexity: number;
                reuseOpportunities: number;
                potentialSavings: number;
            };
        }>;
        qualityFailurePatterns: Array<{
            id: string;
            name: string;
            description: string;
            category: string;
            pattern: string;
            abstractPattern: string;
            metrics: {
                tokensPerUse: number;
                avgComplexity: number;
                reuseOpportunities: number;
                potentialSavings: number;
            };
        }>;
    };
    /**
     * Get process compliance patterns from archive lessons
     */
    private getProcessCompliancePatterns;
    /**
     * Get quality failure patterns from archive lessons
     */
    private getQualityFailurePatterns;
    /**
     * Extract code segments from files
     */
    private extractCodeSegments;
    private findSimilarPatterns;
    private analyzePatterns;
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
    private indexPattern;
}
export declare function createCodeReusePatternEngine(config?: Partial<DetectionConfig>): CodeReusePatternEngine;
export {};
//# sourceMappingURL=CodeReusePatternEngine.d.ts.map