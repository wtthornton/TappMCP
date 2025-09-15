#!/usr/bin/env node
/**
 * Execution Engine - Handles tool chain execution
 *
 * Extracted from ToolChainOptimizer for better separation of concerns.
 * Manages parallel execution, retries, caching, and step orchestration.
 */
import { z } from 'zod';
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
    name: string;
    version: string;
    description: string;
    inputSchema: Record<string, any>;
    dependencies: string[];
    reliability: number;
    category: "validation" | "planning" | "orchestration" | "analysis" | "generation" | "transformation";
    cacheEnabled: boolean;
    outputSchema: Record<string, any>;
    estimatedExecutionTime: number;
    resourceRequirements: {
        memory: number;
        tokens: number;
        cpu: number;
    };
    costPerExecution: number;
    parallelizable: boolean;
}, {
    name: string;
    description: string;
    inputSchema: Record<string, any>;
    category: "validation" | "planning" | "orchestration" | "analysis" | "generation" | "transformation";
    outputSchema: Record<string, any>;
    version?: string | undefined;
    dependencies?: string[] | undefined;
    reliability?: number | undefined;
    cacheEnabled?: boolean | undefined;
    estimatedExecutionTime?: number | undefined;
    resourceRequirements?: {
        memory?: number | undefined;
        tokens?: number | undefined;
        cpu?: number | undefined;
    } | undefined;
    costPerExecution?: number | undefined;
    parallelizable?: boolean | undefined;
}>;
export type ToolDefinition = z.infer<typeof ToolDefinitionSchema>;
export declare const ExecutionPlanSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    steps: z.ZodArray<z.ZodAny, "many">;
    dependencies: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>>;
    optimization: z.ZodDefault<z.ZodObject<{
        enableParallel: z.ZodDefault<z.ZodBoolean>;
        enableCaching: z.ZodDefault<z.ZodBoolean>;
        enableParallelization: z.ZodDefault<z.ZodBoolean>;
        targetExecutionTime: z.ZodDefault<z.ZodNumber>;
        maxConcurrentSteps: z.ZodDefault<z.ZodNumber>;
        retryConfiguration: z.ZodDefault<z.ZodObject<{
            maxRetries: z.ZodDefault<z.ZodNumber>;
            backoffMs: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            maxRetries: number;
            backoffMs: number;
        }, {
            maxRetries?: number | undefined;
            backoffMs?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        enableParallel: boolean;
        enableCaching: boolean;
        enableParallelization: boolean;
        targetExecutionTime: number;
        maxConcurrentSteps: number;
        retryConfiguration: {
            maxRetries: number;
            backoffMs: number;
        };
    }, {
        enableParallel?: boolean | undefined;
        enableCaching?: boolean | undefined;
        enableParallelization?: boolean | undefined;
        targetExecutionTime?: number | undefined;
        maxConcurrentSteps?: number | undefined;
        retryConfiguration?: {
            maxRetries?: number | undefined;
            backoffMs?: number | undefined;
        } | undefined;
    }>>;
    constraints: z.ZodDefault<z.ZodObject<{
        maxExecutionTime: z.ZodOptional<z.ZodNumber>;
        maxCost: z.ZodOptional<z.ZodNumber>;
        requiredReliability: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        maxExecutionTime?: number | undefined;
        maxCost?: number | undefined;
        requiredReliability?: number | undefined;
    }, {
        maxExecutionTime?: number | undefined;
        maxCost?: number | undefined;
        requiredReliability?: number | undefined;
    }>>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    id: string;
    dependencies: Record<string, string[]>;
    constraints: {
        maxExecutionTime?: number | undefined;
        maxCost?: number | undefined;
        requiredReliability?: number | undefined;
    };
    optimization: {
        enableParallel: boolean;
        enableCaching: boolean;
        enableParallelization: boolean;
        targetExecutionTime: number;
        maxConcurrentSteps: number;
        retryConfiguration: {
            maxRetries: number;
            backoffMs: number;
        };
    };
    metadata: Record<string, any>;
    steps: any[];
}, {
    name: string;
    description: string;
    id: string;
    steps: any[];
    dependencies?: Record<string, string[]> | undefined;
    constraints?: {
        maxExecutionTime?: number | undefined;
        maxCost?: number | undefined;
        requiredReliability?: number | undefined;
    } | undefined;
    optimization?: {
        enableParallel?: boolean | undefined;
        enableCaching?: boolean | undefined;
        enableParallelization?: boolean | undefined;
        targetExecutionTime?: number | undefined;
        maxConcurrentSteps?: number | undefined;
        retryConfiguration?: {
            maxRetries?: number | undefined;
            backoffMs?: number | undefined;
        } | undefined;
    } | undefined;
    metadata?: Record<string, any> | undefined;
}>;
export type ExecutionPlan = z.infer<typeof ExecutionPlanSchema>;
export interface ExecutionResult {
    planId: string;
    success: boolean;
    executionTime: number;
    totalCost: number;
    stepResults: Array<any>;
    optimization: {
        parallelSteps: number;
        cacheHits: number;
        skippedSteps: number;
        bottlenecks: string[];
    };
    recommendations: Array<{
        type: string;
        message: string;
        priority: string;
    }>;
}
/**
 * ExecutionEngine - Handles tool chain execution with optimization
 */
export declare class ExecutionEngine {
    private updatePerformanceProfileFn;
    private executionCache;
    private toolRegistry;
    private performanceProfiles;
    constructor(toolRegistry: Map<string, ToolDefinition>, updatePerformanceProfileFn: (toolName: string, executionTime: number, cost: number, success: boolean) => void);
    /**
     * Execute an optimized plan
     */
    executePlan(plan: ExecutionPlan): Promise<ExecutionResult>;
    /**
     * Execute a group of steps in parallel
     */
    private executeParallelGroup;
    /**
     * Simulate tool execution (placeholder for actual tool execution)
     */
    private simulateToolExecution;
    /**
     * Generate cache key for tool execution
     */
    private generateCacheKey;
    /**
     * Group steps by parallelism constraints
     */
    private groupStepsByParallelism;
    /**
     * Identify performance bottlenecks
     */
    private identifyBottlenecks;
    /**
     * Generate execution recommendations
     */
    private generateRecommendations;
    /**
     * Get execution cache stats
     */
    getCacheStats(): {
        size: number;
        hitRate: number;
        totalEntries: number;
    };
    /**
     * Clear execution cache
     */
    clearCache(): void;
}
//# sourceMappingURL=ExecutionEngine.d.ts.map