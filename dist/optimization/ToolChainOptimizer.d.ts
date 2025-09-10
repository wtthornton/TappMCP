#!/usr/bin/env node
/**
 * Tool Chain Optimization System
 *
 * Intelligent orchestration and optimization of MCP tool execution chains
 * with parallel processing, dependency management, and performance optimization.
 *
 * Phase 1, Week 1 - Dynamic Tool Chain Optimization
 */
import { z } from 'zod';
/**
 * Tool Definition Schema
 */
export declare const ToolDefinitionSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    category: z.ZodEnum<["planning", "generation", "analysis", "transformation", "validation", "orchestration"]>;
    inputSchema: z.ZodRecord<z.ZodString, z.ZodAny>;
    outputSchema: z.ZodRecord<z.ZodString, z.ZodAny>;
    dependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    estimatedExecutionTime: z.ZodDefault<z.ZodNumber>;
    resourceRequirements: z.ZodDefault<z.ZodObject<{
        memory: z.ZodDefault<z.ZodNumber>;
        cpu: z.ZodDefault<z.ZodNumber>;
        tokens: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        memory: number;
        tokens: number;
        cpu: number;
    }, {
        memory?: number | undefined;
        tokens?: number | undefined;
        cpu?: number | undefined;
    }>>;
    reliability: z.ZodDefault<z.ZodNumber>;
    costPerExecution: z.ZodDefault<z.ZodNumber>;
    parallelizable: z.ZodDefault<z.ZodBoolean>;
    cacheEnabled: z.ZodDefault<z.ZodBoolean>;
    version: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    description: string;
    version: string;
    category: "planning" | "analysis" | "validation" | "generation" | "transformation" | "orchestration";
    name: string;
    inputSchema: Record<string, any>;
    dependencies: string[];
    outputSchema: Record<string, any>;
    estimatedExecutionTime: number;
    resourceRequirements: {
        memory: number;
        tokens: number;
        cpu: number;
    };
    reliability: number;
    costPerExecution: number;
    parallelizable: boolean;
    cacheEnabled: boolean;
}, {
    description: string;
    category: "planning" | "analysis" | "validation" | "generation" | "transformation" | "orchestration";
    name: string;
    inputSchema: Record<string, any>;
    outputSchema: Record<string, any>;
    version?: string | undefined;
    dependencies?: string[] | undefined;
    estimatedExecutionTime?: number | undefined;
    resourceRequirements?: {
        memory?: number | undefined;
        tokens?: number | undefined;
        cpu?: number | undefined;
    } | undefined;
    reliability?: number | undefined;
    costPerExecution?: number | undefined;
    parallelizable?: boolean | undefined;
    cacheEnabled?: boolean | undefined;
}>;
export type ToolDefinition = z.infer<typeof ToolDefinitionSchema>;
/**
 * Execution Plan Schema
 */
export declare const ExecutionPlanSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    steps: z.ZodArray<z.ZodObject<{
        stepId: z.ZodString;
        toolName: z.ZodString;
        inputs: z.ZodRecord<z.ZodString, z.ZodAny>;
        expectedOutputs: z.ZodArray<z.ZodString, "many">;
        dependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        parallelGroup: z.ZodOptional<z.ZodNumber>;
        conditional: z.ZodOptional<z.ZodObject<{
            condition: z.ZodString;
            skipIf: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            condition: string;
            skipIf: boolean;
        }, {
            condition: string;
            skipIf?: boolean | undefined;
        }>>;
        retryConfig: z.ZodDefault<z.ZodObject<{
            maxRetries: z.ZodDefault<z.ZodNumber>;
            backoffMs: z.ZodDefault<z.ZodNumber>;
            retryConditions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            maxRetries: number;
            backoffMs: number;
            retryConditions: string[];
        }, {
            maxRetries?: number | undefined;
            backoffMs?: number | undefined;
            retryConditions?: string[] | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        toolName: string;
        dependencies: string[];
        stepId: string;
        inputs: Record<string, any>;
        expectedOutputs: string[];
        retryConfig: {
            maxRetries: number;
            backoffMs: number;
            retryConditions: string[];
        };
        parallelGroup?: number | undefined;
        conditional?: {
            condition: string;
            skipIf: boolean;
        } | undefined;
    }, {
        toolName: string;
        stepId: string;
        inputs: Record<string, any>;
        expectedOutputs: string[];
        dependencies?: string[] | undefined;
        parallelGroup?: number | undefined;
        conditional?: {
            condition: string;
            skipIf?: boolean | undefined;
        } | undefined;
        retryConfig?: {
            maxRetries?: number | undefined;
            backoffMs?: number | undefined;
            retryConditions?: string[] | undefined;
        } | undefined;
    }>, "many">;
    optimization: z.ZodDefault<z.ZodObject<{
        enableParallel: z.ZodDefault<z.ZodBoolean>;
        enableCaching: z.ZodDefault<z.ZodBoolean>;
        timeoutMs: z.ZodDefault<z.ZodNumber>;
        maxConcurrency: z.ZodDefault<z.ZodNumber>;
        fallbackStrategies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        enableParallel: boolean;
        enableCaching: boolean;
        timeoutMs: number;
        maxConcurrency: number;
        fallbackStrategies: string[];
    }, {
        enableParallel?: boolean | undefined;
        enableCaching?: boolean | undefined;
        timeoutMs?: number | undefined;
        maxConcurrency?: number | undefined;
        fallbackStrategies?: string[] | undefined;
    }>>;
    constraints: z.ZodDefault<z.ZodObject<{
        maxExecutionTime: z.ZodOptional<z.ZodNumber>;
        maxCost: z.ZodOptional<z.ZodNumber>;
        maxMemoryUsage: z.ZodOptional<z.ZodNumber>;
        requiredReliability: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        requiredReliability: number;
        maxMemoryUsage?: number | undefined;
        maxExecutionTime?: number | undefined;
        maxCost?: number | undefined;
    }, {
        maxMemoryUsage?: number | undefined;
        maxExecutionTime?: number | undefined;
        maxCost?: number | undefined;
        requiredReliability?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    optimization: {
        enableParallel: boolean;
        enableCaching: boolean;
        timeoutMs: number;
        maxConcurrency: number;
        fallbackStrategies: string[];
    };
    id: string;
    description: string;
    name: string;
    constraints: {
        requiredReliability: number;
        maxMemoryUsage?: number | undefined;
        maxExecutionTime?: number | undefined;
        maxCost?: number | undefined;
    };
    steps: {
        toolName: string;
        dependencies: string[];
        stepId: string;
        inputs: Record<string, any>;
        expectedOutputs: string[];
        retryConfig: {
            maxRetries: number;
            backoffMs: number;
            retryConditions: string[];
        };
        parallelGroup?: number | undefined;
        conditional?: {
            condition: string;
            skipIf: boolean;
        } | undefined;
    }[];
}, {
    id: string;
    description: string;
    name: string;
    steps: {
        toolName: string;
        stepId: string;
        inputs: Record<string, any>;
        expectedOutputs: string[];
        dependencies?: string[] | undefined;
        parallelGroup?: number | undefined;
        conditional?: {
            condition: string;
            skipIf?: boolean | undefined;
        } | undefined;
        retryConfig?: {
            maxRetries?: number | undefined;
            backoffMs?: number | undefined;
            retryConditions?: string[] | undefined;
        } | undefined;
    }[];
    optimization?: {
        enableParallel?: boolean | undefined;
        enableCaching?: boolean | undefined;
        timeoutMs?: number | undefined;
        maxConcurrency?: number | undefined;
        fallbackStrategies?: string[] | undefined;
    } | undefined;
    constraints?: {
        maxMemoryUsage?: number | undefined;
        maxExecutionTime?: number | undefined;
        maxCost?: number | undefined;
        requiredReliability?: number | undefined;
    } | undefined;
}>;
export type ExecutionPlan = z.infer<typeof ExecutionPlanSchema>;
/**
 * Execution Result Schema
 */
export interface ExecutionResult {
    planId: string;
    success: boolean;
    executionTime: number;
    totalCost: number;
    stepResults: Array<{
        stepId: string;
        toolName: string;
        success: boolean;
        executionTime: number;
        cost: number;
        output?: unknown;
        error?: string;
        retryCount: number;
        cacheHit: boolean;
    }>;
    optimization: {
        parallelSteps: number;
        cacheHits: number;
        skippedSteps: number;
        bottlenecks: string[];
    };
    recommendations: Array<{
        type: 'performance' | 'cost' | 'reliability';
        message: string;
        priority: 'low' | 'medium' | 'high';
    }>;
}
/**
 * Optimization Configuration
 */
export declare const OptimizerConfigSchema: z.ZodObject<{
    enableIntelligentCaching: z.ZodDefault<z.ZodBoolean>;
    enableAdaptiveParallelism: z.ZodDefault<z.ZodBoolean>;
    enablePredictiveOptimization: z.ZodDefault<z.ZodBoolean>;
    maxParallelExecutions: z.ZodDefault<z.ZodNumber>;
    cacheExpirationMs: z.ZodDefault<z.ZodNumber>;
    performanceThreshold: z.ZodDefault<z.ZodNumber>;
    costThreshold: z.ZodDefault<z.ZodNumber>;
    reliabilityThreshold: z.ZodDefault<z.ZodNumber>;
    learningEnabled: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    learningEnabled: boolean;
    enableIntelligentCaching: boolean;
    enableAdaptiveParallelism: boolean;
    enablePredictiveOptimization: boolean;
    maxParallelExecutions: number;
    cacheExpirationMs: number;
    performanceThreshold: number;
    costThreshold: number;
    reliabilityThreshold: number;
}, {
    learningEnabled?: boolean | undefined;
    enableIntelligentCaching?: boolean | undefined;
    enableAdaptiveParallelism?: boolean | undefined;
    enablePredictiveOptimization?: boolean | undefined;
    maxParallelExecutions?: number | undefined;
    cacheExpirationMs?: number | undefined;
    performanceThreshold?: number | undefined;
    costThreshold?: number | undefined;
    reliabilityThreshold?: number | undefined;
}>;
export type OptimizerConfig = z.infer<typeof OptimizerConfigSchema>;
/**
 * Performance Metrics
 */
export interface PerformanceMetrics {
    totalExecutions: number;
    averageExecutionTime: number;
    parallelismRate: number;
    cacheHitRate: number;
    errorRate: number;
    costEfficiency: number;
    bottleneckTools: Array<{
        toolName: string;
        avgExecutionTime: number;
        frequency: number;
        impact: number;
    }>;
    trendAnalysis: {
        performanceImprovement: number;
        costReduction: number;
        reliabilityImprovement: number;
    };
}
/**
 * Tool Chain Optimizer Class
 */
export declare class ToolChainOptimizer {
    private config;
    private toolRegistry;
    private executionCache;
    private executionHistory;
    private performanceProfiles;
    constructor(config?: Partial<OptimizerConfig>);
    /**
     * Register a tool in the optimizer
     */
    registerTool(tool: ToolDefinition): void;
    /**
     * Create an optimized execution plan
     */
    createOptimizedPlan(planDefinition: {
        name: string;
        description: string;
        goal: string;
        tools: Array<{
            tool: string;
            inputs: Record<string, unknown>;
            requirements?: Record<string, unknown>;
        }>;
        constraints?: Partial<ExecutionPlan['constraints']>;
    }): Promise<ExecutionPlan>;
    /**
     * Execute an optimized plan
     */
    executePlan(plan: ExecutionPlan): Promise<ExecutionResult>;
    /**
     * Suggest optimizations for a plan
     */
    suggestOptimizations(plan: ExecutionPlan): Array<{
        type: 'performance' | 'cost' | 'reliability' | 'parallelism';
        suggestion: string;
        estimatedImpact: {
            timeReduction?: number;
            costReduction?: number;
            reliabilityImprovement?: number;
        };
        difficulty: 'low' | 'medium' | 'high';
    }>;
    /**
     * Get performance metrics
     */
    getPerformanceMetrics(): PerformanceMetrics;
    /**
     * Initialize built-in tools
     */
    private initializeBuiltInTools;
    /**
     * Helper methods
     */
    private buildDependencyGraph;
    private optimizeExecutionOrder;
    private applyIntelligentOptimizations;
    private executeParallelGroup;
    private simulateToolExecution;
    /**
     * Additional helper methods
     */
    private generatePlanId;
    private generateStepId;
    private generateCacheKey;
    private countParallelGroups;
    private calculateOptimalTimeout;
    private estimateTotalExecutionTime;
    private estimateTotalCost;
    private groupStepsByParallelism;
    private identifyBottlenecks;
    private generateRecommendations;
    private recordExecution;
    private learnFromExecution;
    private updatePerformanceProfile;
    private findParallelizableSteps;
    private estimateParallelizationSavings;
    private findExpensiveSteps;
    private findUnreliableSteps;
    private calculateTrend;
    private calculateReliabilityTrend;
}
export declare function createToolChainOptimizer(config?: Partial<OptimizerConfig>): ToolChainOptimizer;
//# sourceMappingURL=ToolChainOptimizer.d.ts.map