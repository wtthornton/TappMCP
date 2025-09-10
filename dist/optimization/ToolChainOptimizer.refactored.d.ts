#!/usr/bin/env node
/**
 * Tool Chain Optimization System - Main Coordinator
 *
 * Refactored to use ExecutionEngine and PerformanceTracker for better separation of concerns.
 * This main class now focuses on coordination, planning, and optimization logic.
 *
 * Phase 1, Week 1 - Dynamic Tool Chain Optimization
 */
import { z } from 'zod';
import { ExecutionPlan, ExecutionResult, ToolDefinition, ToolDefinitionSchema } from './ExecutionEngine.js';
import { PerformanceMetrics } from './PerformanceTracker.js';
/**
 * Optimizer Configuration Schema
 */
export declare const OptimizerConfigSchema: z.ZodObject<{
    maxConcurrentSteps: z.ZodDefault<z.ZodNumber>;
    cacheEnabled: z.ZodDefault<z.ZodBoolean>;
    learningEnabled: z.ZodDefault<z.ZodBoolean>;
    timeoutMs: z.ZodDefault<z.ZodNumber>;
    maxRetries: z.ZodDefault<z.ZodNumber>;
    parallelizationThreshold: z.ZodDefault<z.ZodNumber>;
    costOptimizationEnabled: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    maxRetries: number;
    learningEnabled: boolean;
    cacheEnabled: boolean;
    maxConcurrentSteps: number;
    timeoutMs: number;
    parallelizationThreshold: number;
    costOptimizationEnabled: boolean;
}, {
    maxRetries?: number | undefined;
    learningEnabled?: boolean | undefined;
    cacheEnabled?: boolean | undefined;
    maxConcurrentSteps?: number | undefined;
    timeoutMs?: number | undefined;
    parallelizationThreshold?: number | undefined;
    costOptimizationEnabled?: boolean | undefined;
}>;
export type OptimizerConfig = z.infer<typeof OptimizerConfigSchema>;
/**
 * Tool Chain Optimizer Class - Main Coordinator
 */
export declare class ToolChainOptimizer {
    private config;
    private toolRegistry;
    private executionEngine;
    private performanceTracker;
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
        description?: string;
        tools: Array<{
            name: string;
            inputs: Record<string, unknown>;
            requirements?: Record<string, unknown>;
        }>;
        constraints?: {
            maxExecutionTime?: number;
            maxCost?: number;
            requiredReliability?: number;
        };
    }): Promise<ExecutionPlan>;
    /**
     * Execute an optimized plan (delegates to ExecutionEngine)
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
    }>;
    /**
     * Get performance metrics (delegates to PerformanceTracker)
     */
    getPerformanceMetrics(): PerformanceMetrics;
    /**
     * Get execution cache stats (delegates to ExecutionEngine)
     */
    getCacheStats(): {
        size: number;
        hitRate: number;
        totalEntries: number;
    };
    /**
     * Clear all caches and performance data
     */
    clearCaches(): void;
    private initializeBuiltInTools;
    private buildDependencyGraph;
    private optimizeExecutionOrder;
    private applyIntelligentOptimizations;
    private generatePlanId;
    private generateStepId;
    private countParallelGroups;
    private calculateOptimalTimeout;
    private estimateTotalExecutionTime;
    private estimateTotalCost;
}
export { ToolDefinition, ToolDefinitionSchema, ExecutionPlan, ExecutionResult, PerformanceMetrics };
//# sourceMappingURL=ToolChainOptimizer.refactored.d.ts.map