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
import { ExecutionEngine, ToolDefinitionSchema } from './ExecutionEngine.js';
import { PerformanceTracker } from './PerformanceTracker.js';
/**
 * Optimizer Configuration Schema
 */
export const OptimizerConfigSchema = z.object({
    maxConcurrentSteps: z.number().default(5),
    cacheEnabled: z.boolean().default(true),
    learningEnabled: z.boolean().default(true),
    timeoutMs: z.number().default(30000),
    maxRetries: z.number().default(2),
    parallelizationThreshold: z.number().default(1000), // milliseconds
    costOptimizationEnabled: z.boolean().default(true),
});
/**
 * Tool Chain Optimizer Class - Main Coordinator
 */
export class ToolChainOptimizer {
    config;
    toolRegistry;
    executionEngine;
    performanceTracker;
    constructor(config = {}) {
        this.config = OptimizerConfigSchema.parse(config);
        this.toolRegistry = new Map();
        // Initialize extracted components
        this.performanceTracker = new PerformanceTracker(this.config.learningEnabled);
        this.executionEngine = new ExecutionEngine(this.toolRegistry, (toolName, executionTime, cost, success) => this.performanceTracker.updatePerformanceProfile(toolName, executionTime, cost, success));
        this.initializeBuiltInTools();
    }
    /**
     * Register a tool in the optimizer
     */
    registerTool(tool) {
        this.toolRegistry.set(tool.name, tool);
        // Initialize performance profile
        this.performanceTracker.initializeToolProfile(tool.name, {
            avgExecutionTime: tool.estimatedExecutionTime,
            costPerExecution: tool.costPerExecution,
            successRate: tool.reliability,
        });
    }
    /**
     * Create an optimized execution plan
     */
    async createOptimizedPlan(planDefinition) {
        // Build dependency graph
        const dependencyGraph = this.buildDependencyGraph(planDefinition.tools);
        // Optimize execution order
        const optimizedSteps = this.optimizeExecutionOrder(dependencyGraph);
        // Apply intelligent optimizations
        const finalSteps = await this.applyIntelligentOptimizations(optimizedSteps);
        const plan = {
            id: this.generatePlanId(),
            name: planDefinition.name,
            description: planDefinition.description || '',
            steps: finalSteps,
            dependencies: Object.fromEntries(dependencyGraph),
            optimization: {
                enableParallelization: this.config.maxConcurrentSteps > 1,
                enableCaching: this.config.cacheEnabled,
                targetExecutionTime: planDefinition.constraints?.maxExecutionTime || 30000,
                maxConcurrentSteps: this.config.maxConcurrentSteps,
                retryConfiguration: {
                    maxRetries: this.config.maxRetries,
                    backoffMs: 1000,
                },
            },
            metadata: {
                createdAt: new Date().toISOString(),
                parallelGroups: this.countParallelGroups(finalSteps),
                estimatedTime: this.estimateTotalExecutionTime(finalSteps),
                estimatedCost: this.estimateTotalCost(finalSteps),
                optimalTimeout: this.calculateOptimalTimeout(finalSteps),
            },
        };
        return plan;
    }
    /**
     * Execute an optimized plan (delegates to ExecutionEngine)
     */
    async executePlan(plan) {
        const result = await this.executionEngine.executePlan(plan);
        // Record execution for performance tracking
        this.performanceTracker.recordExecution(plan.id, result);
        // Learn from execution if enabled
        if (this.config.learningEnabled) {
            await this.performanceTracker.learnFromExecution(plan, result);
        }
        return result;
    }
    /**
     * Suggest optimizations for a plan
     */
    suggestOptimizations(plan) {
        const suggestions = [];
        // Find parallelizable steps
        const parallelizableSteps = this.performanceTracker.findParallelizableSteps(plan.steps, this.toolRegistry);
        if (parallelizableSteps.length > 0) {
            const timeSavings = this.performanceTracker.estimateParallelizationSavings(parallelizableSteps, this.toolRegistry);
            suggestions.push({
                type: 'parallelism',
                suggestion: `${parallelizableSteps.length} steps can be parallelized`,
                estimatedImpact: {
                    timeReduction: timeSavings,
                },
            });
        }
        // Find expensive steps
        const expensiveSteps = this.performanceTracker.findExpensiveSteps(plan.steps, this.toolRegistry);
        if (expensiveSteps.length > 0) {
            suggestions.push({
                type: 'cost',
                suggestion: `${expensiveSteps.length} expensive steps found, consider caching or alternatives`,
                estimatedImpact: {
                    costReduction: 25, // Estimated percentage
                },
            });
        }
        // Find unreliable steps
        const unreliableSteps = this.performanceTracker.findUnreliableSteps(plan.steps, this.toolRegistry);
        if (unreliableSteps.length > 0) {
            suggestions.push({
                type: 'reliability',
                suggestion: `${unreliableSteps.length} unreliable steps found, consider adding retries`,
                estimatedImpact: {
                    reliabilityImprovement: 15, // Estimated percentage
                },
            });
        }
        return suggestions;
    }
    /**
     * Get performance metrics (delegates to PerformanceTracker)
     */
    getPerformanceMetrics() {
        return this.performanceTracker.getPerformanceMetrics();
    }
    /**
     * Get execution cache stats (delegates to ExecutionEngine)
     */
    getCacheStats() {
        return this.executionEngine.getCacheStats();
    }
    /**
     * Clear all caches and performance data
     */
    clearCaches() {
        this.executionEngine.clearCache();
        this.performanceTracker.clearPerformanceData();
    }
    // Private helper methods for planning and optimization
    initializeBuiltInTools() {
        const builtInTools = [
            {
                name: 'smart_begin',
                description: 'Initialize a new project with smart planning',
                category: 'planning',
                inputSchema: { projectName: 'string', projectTemplate: 'string' },
                outputSchema: { projectId: 'string', structure: 'object' },
                dependencies: [],
                estimatedExecutionTime: 2000,
                resourceRequirements: { memory: 150, cpu: 1, tokens: 1500 },
                reliability: 0.95,
                costPerExecution: 0.02,
                parallelizable: false,
                cacheEnabled: true,
                version: '1.0.0',
            },
            {
                name: 'smart_plan',
                description: 'Create detailed project plans',
                category: 'planning',
                inputSchema: { requirements: 'string', context: 'object' },
                outputSchema: { plan: 'object', timeline: 'array' },
                dependencies: [],
                estimatedExecutionTime: 3000,
                resourceRequirements: { memory: 200, cpu: 2, tokens: 2000 },
                reliability: 0.92,
                costPerExecution: 0.03,
                parallelizable: false,
                cacheEnabled: true,
                version: '1.0.0',
            },
            {
                name: 'smart_write',
                description: 'Generate code and documentation',
                category: 'generation',
                inputSchema: { specification: 'string', codeType: 'string' },
                outputSchema: { code: 'string', documentation: 'string' },
                dependencies: ['smart_plan'],
                estimatedExecutionTime: 4000,
                resourceRequirements: { memory: 300, cpu: 2, tokens: 3000 },
                reliability: 0.88,
                costPerExecution: 0.05,
                parallelizable: true,
                cacheEnabled: true,
                version: '1.0.0',
            },
            {
                name: 'smart_finish',
                description: 'Finalize and validate project deliverables',
                category: 'validation',
                inputSchema: { projectId: 'string', deliverables: 'array' },
                outputSchema: { validated: 'boolean', report: 'object' },
                dependencies: ['smart_write'],
                estimatedExecutionTime: 2500,
                resourceRequirements: { memory: 180, cpu: 1, tokens: 1800 },
                reliability: 0.94,
                costPerExecution: 0.025,
                parallelizable: false,
                cacheEnabled: false,
                version: '1.0.0',
            },
            {
                name: 'smart_orchestrate',
                description: 'Orchestrate complex multi-tool workflows',
                category: 'orchestration',
                inputSchema: { workflow: 'object', parameters: 'object' },
                outputSchema: { result: 'object', metrics: 'object' },
                dependencies: [],
                estimatedExecutionTime: 1500,
                resourceRequirements: { memory: 120, cpu: 1, tokens: 1200 },
                reliability: 0.96,
                costPerExecution: 0.015,
                parallelizable: true,
                cacheEnabled: true,
                version: '1.0.0',
            },
        ];
        builtInTools.forEach(tool => this.registerTool(tool));
    }
    buildDependencyGraph(tools) {
        const graph = new Map();
        for (const tool of tools) {
            const toolDef = this.toolRegistry.get(tool.name);
            if (toolDef) {
                graph.set(tool.name, new Set(toolDef.dependencies));
            }
        }
        return graph;
    }
    optimizeExecutionOrder(dependencyGraph) {
        const sorted = [];
        const visited = new Set();
        const temp = new Set();
        const visit = (toolName) => {
            if (temp.has(toolName)) {
                throw new Error(`Circular dependency detected: ${toolName}`);
            }
            if (visited.has(toolName)) {
                return;
            }
            temp.add(toolName);
            const dependencies = dependencyGraph.get(toolName) || new Set();
            for (const dep of dependencies) {
                visit(dep);
            }
            temp.delete(toolName);
            visited.add(toolName);
            sorted.push({
                toolName,
                stepId: this.generateStepId(),
                inputs: {},
                parallelGroup: null,
            });
        };
        for (const toolName of dependencyGraph.keys()) {
            if (!visited.has(toolName)) {
                visit(toolName);
            }
        }
        return sorted;
    }
    async applyIntelligentOptimizations(steps) {
        // Apply parallelization where possible
        const parallelizableSteps = this.performanceTracker.findParallelizableSteps(steps, this.toolRegistry);
        let parallelGroup = 0;
        for (const step of parallelizableSteps) {
            if (!step.parallelGroup) {
                step.parallelGroup = parallelGroup++;
            }
        }
        return steps;
    }
    generatePlanId() {
        return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateStepId() {
        return `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    countParallelGroups(steps) {
        return new Set(steps.map(step => step.parallelGroup).filter(Boolean)).size;
    }
    calculateOptimalTimeout(steps) {
        const totalEstimatedTime = this.estimateTotalExecutionTime(steps);
        return Math.max(totalEstimatedTime * 1.5, 10000); // 150% buffer, minimum 10s
    }
    estimateTotalExecutionTime(steps) {
        return steps.reduce((total, step) => {
            const tool = this.toolRegistry.get(step.toolName);
            return total + (tool?.estimatedExecutionTime || 1000);
        }, 0);
    }
    estimateTotalCost(steps) {
        return steps.reduce((total, step) => {
            const tool = this.toolRegistry.get(step.toolName);
            return total + (tool?.costPerExecution || 0);
        }, 0);
    }
}
// Re-export types for backward compatibility
export { ToolDefinitionSchema };
//# sourceMappingURL=ToolChainOptimizer.refactored.js.map