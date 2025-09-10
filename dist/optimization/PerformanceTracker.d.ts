#!/usr/bin/env node
/**
 * Performance Tracker - Handles performance monitoring and learning
 *
 * Extracted from ToolChainOptimizer for better separation of concerns.
 * Manages performance profiles, metrics collection, and trend analysis.
 */
import { ExecutionResult, ExecutionPlan } from './ExecutionEngine.js';
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
        name: string;
        averageExecutionTime: number;
        frequency: number;
    }>;
    trendAnalysis: {
        performanceImprovement: number;
        costReduction: number;
        reliabilityImprovement: number;
    };
}
interface PerformanceProfile {
    toolName: string;
    avgExecutionTime: number;
    costPerExecution: number;
    successRate: number;
    sampleCount: number;
}
interface ExecutionRecord {
    planId: string;
    timestamp: Date;
    result: ExecutionResult;
}
/**
 * PerformanceTracker - Monitors and analyzes tool chain performance
 */
export declare class PerformanceTracker {
    private performanceProfiles;
    private executionHistory;
    private learningEnabled;
    constructor(learningEnabled?: boolean);
    /**
     * Initialize performance profile for a tool
     */
    initializeToolProfile(toolName: string, initialProfile: {
        avgExecutionTime: number;
        costPerExecution: number;
        successRate: number;
    }): void;
    /**
     * Update performance profile based on execution results
     */
    updatePerformanceProfile(toolName: string, executionTime: number, cost: number, success: boolean): void;
    /**
     * Record execution for learning and analysis
     */
    recordExecution(planId: string, result: ExecutionResult): void;
    /**
     * Learn from execution patterns and update profiles
     */
    learnFromExecution(plan: ExecutionPlan, result: ExecutionResult): Promise<void>;
    /**
     * Get comprehensive performance metrics
     */
    getPerformanceMetrics(): PerformanceMetrics;
    /**
     * Find tools that could benefit from parallelization
     */
    findParallelizableSteps(steps: Array<any>, toolRegistry: Map<string, any>): Array<any>;
    /**
     * Estimate time savings from parallelization
     */
    estimateParallelizationSavings(steps: Array<any>, toolRegistry: Map<string, any>): number;
    /**
     * Find expensive steps for cost optimization
     */
    findExpensiveSteps(steps: Array<any>, toolRegistry: Map<string, any>): Array<any>;
    /**
     * Find unreliable steps that need attention
     */
    findUnreliableSteps(steps: Array<any>, toolRegistry: Map<string, any>): Array<any>;
    /**
     * Calculate performance trend
     */
    private calculateTrend;
    /**
     * Calculate reliability trend
     */
    private calculateReliabilityTrend;
    /**
     * Get current performance profiles
     */
    getPerformanceProfiles(): Map<string, PerformanceProfile>;
    /**
     * Get execution history
     */
    getExecutionHistory(): ExecutionRecord[];
    /**
     * Clear performance data
     */
    clearPerformanceData(): void;
    /**
     * Export performance data for analysis
     */
    exportPerformanceData(): {
        profiles: [string, PerformanceProfile][];
        history: ExecutionRecord[];
        metrics: PerformanceMetrics;
    };
}
export {};
//# sourceMappingURL=PerformanceTracker.d.ts.map