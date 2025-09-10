#!/usr/bin/env node
/**
 * Performance Tracker - Handles performance monitoring and learning
 *
 * Extracted from ToolChainOptimizer for better separation of concerns.
 * Manages performance profiles, metrics collection, and trend analysis.
 */
/**
 * PerformanceTracker - Monitors and analyzes tool chain performance
 */
export class PerformanceTracker {
    performanceProfiles = new Map();
    executionHistory = [];
    learningEnabled;
    constructor(learningEnabled = true) {
        this.learningEnabled = learningEnabled;
    }
    /**
     * Initialize performance profile for a tool
     */
    initializeToolProfile(toolName, initialProfile) {
        this.performanceProfiles.set(toolName, {
            toolName,
            avgExecutionTime: initialProfile.avgExecutionTime,
            costPerExecution: initialProfile.costPerExecution,
            successRate: initialProfile.successRate,
            sampleCount: 1,
        });
    }
    /**
     * Update performance profile based on execution results
     */
    updatePerformanceProfile(toolName, executionTime, cost, success) {
        const profile = this.performanceProfiles.get(toolName);
        if (!profile)
            return;
        const newSampleCount = profile.sampleCount + 1;
        const timeWeight = 1 / newSampleCount;
        const costWeight = 1 / newSampleCount;
        const successWeight = 1 / newSampleCount;
        profile.avgExecutionTime =
            profile.avgExecutionTime * (1 - timeWeight) + executionTime * timeWeight;
        profile.costPerExecution = profile.costPerExecution * (1 - costWeight) + cost * costWeight;
        profile.successRate =
            profile.successRate * (1 - successWeight) + (success ? 1 : 0) * successWeight;
        profile.sampleCount = newSampleCount;
    }
    /**
     * Record execution for learning and analysis
     */
    recordExecution(planId, result) {
        this.executionHistory.push({
            planId,
            timestamp: new Date(),
            result,
        });
        // Keep only last 100 executions
        if (this.executionHistory.length > 100) {
            this.executionHistory = this.executionHistory.slice(-100);
        }
    }
    /**
     * Learn from execution patterns and update profiles
     */
    async learnFromExecution(plan, result) {
        if (!this.learningEnabled)
            return;
        // Update tool performance profiles based on actual execution
        for (const stepResult of result.stepResults) {
            if (stepResult.success) {
                this.updatePerformanceProfile(stepResult.toolName, stepResult.executionTime, stepResult.cost, true);
            }
        }
        // Learn optimization patterns
        if (result.success) {
            console.log(`Learning from successful execution: ${plan.name}`);
        }
    }
    /**
     * Get comprehensive performance metrics
     */
    getPerformanceMetrics() {
        const executions = this.executionHistory;
        if (executions.length === 0) {
            return {
                totalExecutions: 0,
                averageExecutionTime: 0,
                parallelismRate: 0,
                cacheHitRate: 0,
                errorRate: 0,
                costEfficiency: 0,
                bottleneckTools: [],
                trendAnalysis: {
                    performanceImprovement: 0,
                    costReduction: 0,
                    reliabilityImprovement: 0,
                },
            };
        }
        const totalExecutions = executions.length;
        const averageExecutionTime = executions.reduce((sum, exec) => sum + exec.result.executionTime, 0) / totalExecutions;
        // Calculate parallelism rate
        let totalSteps = 0;
        let parallelSteps = 0;
        executions.forEach(exec => {
            totalSteps += exec.result.stepResults.length;
            parallelSteps += exec.result.optimization.parallelSteps;
        });
        const parallelismRate = totalSteps > 0 ? (parallelSteps / totalSteps) * 100 : 0;
        // Calculate cache hit rate
        let totalStepExecutions = 0;
        let cacheHits = 0;
        executions.forEach(exec => {
            totalStepExecutions += exec.result.stepResults.length;
            cacheHits += exec.result.optimization.cacheHits;
        });
        const cacheHitRate = totalStepExecutions > 0 ? (cacheHits / totalStepExecutions) * 100 : 0;
        // Calculate error rate
        const failedExecutions = executions.filter(exec => !exec.result.success).length;
        const errorRate = (failedExecutions / totalExecutions) * 100;
        // Calculate cost efficiency (successful executions per dollar)
        const totalCost = executions.reduce((sum, exec) => sum + exec.result.totalCost, 0);
        const successfulExecutions = executions.filter(exec => exec.result.success).length;
        const costEfficiency = totalCost > 0 ? successfulExecutions / totalCost : 0;
        // Find bottleneck tools
        const toolPerformance = {};
        executions.forEach(exec => {
            exec.result.stepResults.forEach(step => {
                if (!toolPerformance[step.toolName]) {
                    toolPerformance[step.toolName] = { executionTime: 0, count: 0 };
                }
                toolPerformance[step.toolName].executionTime += step.executionTime;
                toolPerformance[step.toolName].count += 1;
            });
        });
        const bottleneckTools = Object.entries(toolPerformance)
            .map(([name, perf]) => ({
            name,
            averageExecutionTime: perf.executionTime / perf.count,
            frequency: perf.count,
        }))
            .sort((a, b) => b.averageExecutionTime - a.averageExecutionTime)
            .slice(0, 5);
        // Calculate trend analysis
        const halfPoint = Math.floor(executions.length / 2);
        const olderExecutions = executions.slice(0, halfPoint);
        const recentExecutions = executions.slice(halfPoint);
        const trendAnalysis = {
            performanceImprovement: this.calculateTrend(olderExecutions, recentExecutions, 'executionTime'),
            costReduction: this.calculateTrend(olderExecutions, recentExecutions, 'totalCost'),
            reliabilityImprovement: this.calculateReliabilityTrend(olderExecutions, recentExecutions),
        };
        return {
            totalExecutions,
            averageExecutionTime,
            parallelismRate,
            cacheHitRate,
            errorRate,
            costEfficiency,
            bottleneckTools,
            trendAnalysis,
        };
    }
    /**
     * Find tools that could benefit from parallelization
     */
    findParallelizableSteps(steps, toolRegistry) {
        return steps.filter(step => {
            const tool = toolRegistry.get(step.toolName);
            return tool && tool.parallelizable && !step.parallelGroup;
        });
    }
    /**
     * Estimate time savings from parallelization
     */
    estimateParallelizationSavings(steps, toolRegistry) {
        const totalTime = steps.reduce((sum, step) => {
            const tool = toolRegistry.get(step.toolName);
            return sum + (tool?.estimatedExecutionTime || 1000);
        }, 0);
        const parallelTime = Math.max(...steps.map(step => {
            const tool = toolRegistry.get(step.toolName);
            return tool?.estimatedExecutionTime || 1000;
        }));
        return ((totalTime - parallelTime) / totalTime) * 100;
    }
    /**
     * Find expensive steps for cost optimization
     */
    findExpensiveSteps(steps, toolRegistry) {
        return steps
            .filter(step => {
            const tool = toolRegistry.get(step.toolName);
            return tool && tool.costPerExecution > 0.05; // > 5 cents
        })
            .sort((a, b) => {
            const costA = toolRegistry.get(a.toolName)?.costPerExecution || 0;
            const costB = toolRegistry.get(b.toolName)?.costPerExecution || 0;
            return costB - costA;
        });
    }
    /**
     * Find unreliable steps that need attention
     */
    findUnreliableSteps(steps, toolRegistry) {
        return steps.filter(step => {
            const tool = toolRegistry.get(step.toolName);
            const profile = this.performanceProfiles.get(step.toolName);
            return (tool && tool.reliability < 0.9) || (profile && profile.successRate < 0.9);
        });
    }
    /**
     * Calculate performance trend
     */
    calculateTrend(older, recent, metric) {
        if (older.length === 0 || recent.length === 0)
            return 0;
        const olderAvg = older.reduce((sum, exec) => sum + exec.result[metric], 0) / older.length;
        const recentAvg = recent.reduce((sum, exec) => sum + exec.result[metric], 0) / recent.length;
        // Return percentage improvement (negative means worse performance)
        return ((olderAvg - recentAvg) / olderAvg) * 100;
    }
    /**
     * Calculate reliability trend
     */
    calculateReliabilityTrend(older, recent) {
        if (older.length === 0 || recent.length === 0)
            return 0;
        const olderSuccessRate = older.filter(exec => exec.result.success).length / older.length;
        const recentSuccessRate = recent.filter(exec => exec.result.success).length / recent.length;
        // Return percentage improvement in success rate
        return ((recentSuccessRate - olderSuccessRate) / olderSuccessRate) * 100;
    }
    /**
     * Get current performance profiles
     */
    getPerformanceProfiles() {
        return new Map(this.performanceProfiles);
    }
    /**
     * Get execution history
     */
    getExecutionHistory() {
        return [...this.executionHistory];
    }
    /**
     * Clear performance data
     */
    clearPerformanceData() {
        this.performanceProfiles.clear();
        this.executionHistory = [];
    }
    /**
     * Export performance data for analysis
     */
    exportPerformanceData() {
        return {
            profiles: Array.from(this.performanceProfiles.entries()),
            history: this.executionHistory,
            metrics: this.getPerformanceMetrics(),
        };
    }
}
//# sourceMappingURL=PerformanceTracker.js.map