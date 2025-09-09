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
export const ToolDefinitionSchema = z.object({
    name: z.string(),
    description: z.string(),
    category: z.enum([
        'planning',
        'generation',
        'analysis',
        'transformation',
        'validation',
        'orchestration',
    ]),
    inputSchema: z.record(z.any()),
    outputSchema: z.record(z.any()),
    dependencies: z.array(z.string()).default([]),
    estimatedExecutionTime: z.number().default(1000), // milliseconds
    resourceRequirements: z
        .object({
        memory: z.number().default(100), // MB
        cpu: z.number().default(1), // CPU units
        tokens: z.number().default(1000), // Average token usage
    })
        .default({}),
    reliability: z.number().min(0).max(1).default(0.95),
    costPerExecution: z.number().default(0.01), // USD
    parallelizable: z.boolean().default(true),
    cacheEnabled: z.boolean().default(false),
    version: z.string().default('1.0.0'),
});
/**
 * Execution Plan Schema
 */
export const ExecutionPlanSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    steps: z.array(z.object({
        stepId: z.string(),
        toolName: z.string(),
        inputs: z.record(z.any()),
        expectedOutputs: z.array(z.string()),
        dependencies: z.array(z.string()).default([]),
        parallelGroup: z.number().optional(), // Steps in same group can run in parallel
        conditional: z
            .object({
            condition: z.string(),
            skipIf: z.boolean().default(false),
        })
            .optional(),
        retryConfig: z
            .object({
            maxRetries: z.number().default(3),
            backoffMs: z.number().default(1000),
            retryConditions: z.array(z.string()).default(['timeout', 'network_error']),
        })
            .default({}),
    })),
    optimization: z
        .object({
        enableParallel: z.boolean().default(true),
        enableCaching: z.boolean().default(true),
        timeoutMs: z.number().default(60000),
        maxConcurrency: z.number().default(5),
        fallbackStrategies: z.array(z.string()).default(['retry', 'skip', 'alternative']),
    })
        .default({}),
    constraints: z
        .object({
        maxExecutionTime: z.number().optional(),
        maxCost: z.number().optional(),
        maxMemoryUsage: z.number().optional(),
        requiredReliability: z.number().min(0).max(1).default(0.9),
    })
        .default({}),
});
/**
 * Optimization Configuration
 */
export const OptimizerConfigSchema = z.object({
    enableIntelligentCaching: z.boolean().default(true),
    enableAdaptiveParallelism: z.boolean().default(true),
    enablePredictiveOptimization: z.boolean().default(true),
    maxParallelExecutions: z.number().default(10),
    cacheExpirationMs: z.number().default(3600000), // 1 hour
    performanceThreshold: z.number().default(5000), // ms
    costThreshold: z.number().default(1.0), // USD
    reliabilityThreshold: z.number().default(0.95),
    learningEnabled: z.boolean().default(true),
});
/**
 * Tool Chain Optimizer Class
 */
export class ToolChainOptimizer {
    config;
    toolRegistry;
    executionCache;
    executionHistory;
    performanceProfiles;
    constructor(config = {}) {
        this.config = OptimizerConfigSchema.parse(config);
        this.toolRegistry = new Map();
        this.executionCache = new Map();
        this.executionHistory = [];
        this.performanceProfiles = new Map();
        this.initializeBuiltInTools();
    }
    /**
     * Register a tool in the optimizer
     */
    registerTool(tool) {
        this.toolRegistry.set(tool.name, tool);
        // Initialize performance profile
        this.performanceProfiles.set(tool.name, {
            avgExecutionTime: tool.estimatedExecutionTime,
            successRate: tool.reliability,
            costPerExecution: tool.costPerExecution,
            sampleCount: 0,
        });
        console.log(`Registered tool: ${tool.name} (${tool.category})`);
    }
    /**
     * Create an optimized execution plan
     */
    async createOptimizedPlan(planDefinition) {
        console.log(`Creating optimized execution plan: ${planDefinition.name}`);
        // Analyze dependencies and create execution graph
        const dependencyGraph = this.buildDependencyGraph(planDefinition.tools);
        // Optimize execution order for parallelism
        const optimizedSteps = this.optimizeExecutionOrder(dependencyGraph);
        // Apply intelligent optimizations
        const finalSteps = await this.applyIntelligentOptimizations(optimizedSteps);
        const plan = {
            id: this.generatePlanId(),
            name: planDefinition.name,
            description: planDefinition.description,
            steps: finalSteps,
            optimization: {
                enableParallel: true,
                enableCaching: this.config.enableIntelligentCaching,
                timeoutMs: this.calculateOptimalTimeout(finalSteps),
                maxConcurrency: this.config.maxParallelExecutions,
                fallbackStrategies: ['retry', 'skip', 'alternative'],
            },
            constraints: {
                maxExecutionTime: this.estimateTotalExecutionTime(finalSteps),
                maxCost: this.estimateTotalCost(finalSteps),
                requiredReliability: planDefinition.constraints?.requiredReliability || 0.9,
                ...planDefinition.constraints,
            },
        };
        console.log(`Created plan with ${plan.steps.length} steps, ${this.countParallelGroups(plan.steps)} parallel groups`);
        return plan;
    }
    /**
     * Execute an optimized plan
     */
    async executePlan(plan) {
        console.log(`Executing plan: ${plan.name} (${plan.steps.length} steps)`);
        const startTime = Date.now();
        const stepResults = [];
        const optimization = {
            parallelSteps: 0,
            cacheHits: 0,
            skippedSteps: 0,
            bottlenecks: [],
        };
        try {
            // Group steps by parallel execution groups
            const parallelGroups = this.groupStepsByParallelism(plan.steps);
            // Execute each group
            for (const group of parallelGroups) {
                const groupResults = await this.executeParallelGroup(group, plan);
                stepResults.push(...groupResults);
                // Update optimization metrics
                optimization.parallelSteps += group.length > 1 ? group.length : 0;
                optimization.cacheHits += groupResults.filter(r => r.cacheHit).length;
                optimization.skippedSteps += groupResults.filter(r => r.success && !r.output).length;
            }
            // Identify bottlenecks
            optimization.bottlenecks = this.identifyBottlenecks(stepResults);
            const executionTime = Date.now() - startTime;
            const totalCost = stepResults.reduce((sum, result) => sum + result.cost, 0);
            const success = stepResults.every(result => result.success);
            const result = {
                planId: plan.id,
                success,
                executionTime,
                totalCost,
                stepResults,
                optimization,
                recommendations: this.generateRecommendations(stepResults, {
                    totalTime: executionTime,
                    totalCost,
                    cacheHitRate: 0.8,
                    parallelizationEfficiency: 0.7,
                    retryRate: 0.1,
                }, plan),
            };
            // Store execution history
            this.recordExecution(plan.id, result);
            // Learn from execution
            if (this.config.learningEnabled) {
                await this.learnFromExecution(plan, result);
            }
            console.log(`Plan execution ${success ? 'completed' : 'failed'} in ${executionTime}ms, cost: $${totalCost.toFixed(4)}`);
            return result;
        }
        catch (error) {
            console.error('Plan execution failed:', error);
            return {
                planId: plan.id,
                success: false,
                executionTime: Date.now() - startTime,
                totalCost: 0,
                stepResults,
                optimization,
                recommendations: [
                    {
                        type: 'reliability',
                        message: `Execution failed: ${error}`,
                        priority: 'high',
                    },
                ],
            };
        }
    }
    /**
     * Suggest optimizations for a plan
     */
    suggestOptimizations(plan) {
        const suggestions = [];
        // Analyze parallelization opportunities
        const parallelizableSteps = this.findParallelizableSteps(plan.steps);
        if (parallelizableSteps.length > 0) {
            suggestions.push({
                type: 'parallelism',
                suggestion: `${parallelizableSteps.length} steps can be parallelized to reduce execution time`,
                estimatedImpact: {
                    timeReduction: this.estimateParallelizationSavings(parallelizableSteps),
                },
                difficulty: 'low',
            });
        }
        // Analyze caching opportunities
        const cacheableSteps = plan.steps.filter(step => {
            const tool = this.toolRegistry.get(step.toolName);
            return tool?.cacheEnabled;
        });
        if (cacheableSteps.length > 0) {
            suggestions.push({
                type: 'performance',
                suggestion: `Enable caching for ${cacheableSteps.length} steps to improve performance`,
                estimatedImpact: {
                    timeReduction: cacheableSteps.length * 0.3, // 30% average cache hit benefit
                    costReduction: cacheableSteps.length * 0.5, // 50% cost reduction on cache hits
                },
                difficulty: 'low',
            });
        }
        // Analyze cost optimization opportunities
        const expensiveSteps = this.findExpensiveSteps(plan.steps);
        if (expensiveSteps.length > 0) {
            suggestions.push({
                type: 'cost',
                suggestion: `Optimize ${expensiveSteps.length} high-cost steps through alternative approaches`,
                estimatedImpact: {
                    costReduction: expensiveSteps.reduce((sum, step) => {
                        const tool = this.toolRegistry.get(step.toolName);
                        return sum + (tool?.costPerExecution || 0);
                    }, 0) * 0.3,
                },
                difficulty: 'medium',
            });
        }
        // Analyze reliability improvements
        const unreliableSteps = this.findUnreliableSteps(plan.steps);
        if (unreliableSteps.length > 0) {
            suggestions.push({
                type: 'reliability',
                suggestion: `Add fallback strategies for ${unreliableSteps.length} potentially unreliable steps`,
                estimatedImpact: {
                    reliabilityImprovement: 0.15, // 15% reliability improvement
                },
                difficulty: 'medium',
            });
        }
        return suggestions.sort((a, b) => {
            const impactScore = (suggestion) => {
                return ((suggestion.estimatedImpact.timeReduction || 0) * 10 +
                    (suggestion.estimatedImpact.costReduction || 0) * 100 +
                    (suggestion.estimatedImpact.qualityImprovement || 0) * 50);
            };
            return impactScore(b) - impactScore(a);
        });
    }
    /**
     * Get performance metrics
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
            .map(([toolName, perf]) => ({
            toolName,
            avgExecutionTime: perf.executionTime / perf.count,
            frequency: perf.count,
            impact: (perf.executionTime / perf.count) * perf.count, // Total time impact
        }))
            .sort((a, b) => b.impact - a.impact)
            .slice(0, 5);
        // Calculate trends (simplified - would need more sophisticated analysis in production)
        const recentExecutions = executions.slice(-20);
        const olderExecutions = executions.slice(-40, -20);
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
     * Initialize built-in tools
     */
    initializeBuiltInTools() {
        const builtInTools = [
            {
                name: 'smart_begin',
                description: 'Initialize and plan project structure',
                category: 'planning',
                inputSchema: { goal: 'string', context: 'object' },
                outputSchema: { plan: 'object', structure: 'array' },
                dependencies: [],
                estimatedExecutionTime: 2000,
                resourceRequirements: { memory: 50, cpu: 1, tokens: 500 },
                reliability: 0.95,
                costPerExecution: 0.02,
                parallelizable: false,
                cacheEnabled: true,
                version: '1.0.0',
            },
            {
                name: 'smart_plan',
                description: 'Create detailed implementation plans',
                category: 'planning',
                inputSchema: { requirements: 'object', constraints: 'object' },
                outputSchema: { plan: 'object', steps: 'array' },
                dependencies: ['smart_begin'],
                estimatedExecutionTime: 3000,
                resourceRequirements: { memory: 100, cpu: 2, tokens: 1000 },
                reliability: 0.92,
                costPerExecution: 0.04,
                parallelizable: false,
                cacheEnabled: true,
                version: '1.0.0',
            },
            {
                name: 'smart_write',
                description: 'Generate code and documentation',
                category: 'generation',
                inputSchema: { plan: 'object', specifications: 'object' },
                outputSchema: { code: 'string', documentation: 'string' },
                dependencies: ['smart_plan'],
                estimatedExecutionTime: 4000,
                resourceRequirements: { memory: 200, cpu: 2, tokens: 2000 },
                reliability: 0.9,
                costPerExecution: 0.08,
                parallelizable: true,
                cacheEnabled: false,
                version: '1.0.0',
            },
            {
                name: 'smart_orchestrate',
                description: 'Coordinate multiple tool executions',
                category: 'orchestration',
                inputSchema: { workflow: 'object', tools: 'array' },
                outputSchema: { results: 'array', summary: 'object' },
                dependencies: [],
                estimatedExecutionTime: 1500,
                resourceRequirements: { memory: 150, cpu: 3, tokens: 800 },
                reliability: 0.98,
                costPerExecution: 0.03,
                parallelizable: false,
                cacheEnabled: true,
                version: '1.0.0',
            },
        ];
        for (const tool of builtInTools) {
            this.registerTool(tool);
        }
        console.log(`Initialized ${builtInTools.length} built-in tools`);
    }
    /**
     * Helper methods
     */
    buildDependencyGraph(tools) {
        const graph = new Map();
        for (const toolSpec of tools) {
            const tool = this.toolRegistry.get(toolSpec.tool);
            if (tool) {
                graph.set(tool.name, new Set(tool.dependencies));
            }
        }
        return graph;
    }
    optimizeExecutionOrder(dependencyGraph) {
        // Topological sort with parallel group assignment
        const steps = [];
        const visited = new Set();
        const parallelGroup = new Map();
        let currentGroup = 0;
        const visit = (toolName, depth = 0) => {
            if (visited.has(toolName)) {
                return;
            }
            visited.add(toolName);
            const tool = this.toolRegistry.get(toolName);
            if (!tool)
                return;
            // Visit dependencies first
            const dependencies = dependencyGraph.get(toolName) || new Set();
            for (const dep of dependencies) {
                visit(dep, depth + 1);
            }
            // Assign parallel group based on dependencies
            let groupNum = 0;
            for (const dep of dependencies) {
                const depGroup = parallelGroup.get(dep) || 0;
                groupNum = Math.max(groupNum, depGroup + 1);
            }
            parallelGroup.set(toolName, groupNum);
            currentGroup = Math.max(currentGroup, groupNum);
            steps.push({
                stepId: this.generateStepId(),
                toolName,
                inputs: {},
                expectedOutputs: Object.keys(tool.outputSchema),
                dependencies: Array.from(dependencies),
                parallelGroup: groupNum,
            });
        };
        // Visit all tools
        for (const toolName of dependencyGraph.keys()) {
            visit(toolName);
        }
        return steps.sort((a, b) => (a.parallelGroup || 0) - (b.parallelGroup || 0));
    }
    async applyIntelligentOptimizations(steps) {
        const optimizedSteps = [...steps];
        // Apply predictive optimization based on historical performance
        if (this.config.enablePredictiveOptimization) {
            for (const step of optimizedSteps) {
                const profile = this.performanceProfiles.get(step.toolName);
                if (profile && profile.successRate < 0.9) {
                    // Add retry configuration for unreliable tools
                    step.retryConfig = {
                        maxRetries: 3,
                        backoffMs: 1000,
                        retryConditions: ['timeout', 'network_error', 'service_unavailable'],
                    };
                }
            }
        }
        return optimizedSteps;
    }
    async executeParallelGroup(steps, plan) {
        const promises = steps.map(async (step) => {
            const startTime = Date.now();
            let retryCount = 0;
            let lastError;
            while (retryCount <= (step.retryConfig?.maxRetries || 0)) {
                try {
                    // Check cache first
                    const cacheKey = this.generateCacheKey(step.toolName, step.inputs);
                    const cachedResult = this.executionCache.get(cacheKey);
                    if (cachedResult && plan.optimization.enableCaching) {
                        cachedResult.hitCount++;
                        return {
                            stepId: step.stepId,
                            toolName: step.toolName,
                            success: true,
                            executionTime: 50, // Cache access time
                            cost: 0,
                            output: cachedResult.output,
                            retryCount,
                            cacheHit: true,
                        };
                    }
                    // Execute the tool (simulated)
                    const result = await this.simulateToolExecution(step.toolName, step.inputs);
                    const executionTime = Date.now() - startTime;
                    const tool = this.toolRegistry.get(step.toolName);
                    const cost = tool?.costPerExecution || 0;
                    // Cache the result if caching is enabled
                    if (plan.optimization.enableCaching && tool?.cacheEnabled) {
                        this.executionCache.set(cacheKey, {
                            key: cacheKey,
                            toolName: step.toolName,
                            inputs: step.inputs,
                            output: result,
                            timestamp: new Date(),
                            executionTime,
                            hitCount: 0,
                        });
                    }
                    // Update performance profile
                    this.updatePerformanceProfile(step.toolName, executionTime, cost, true);
                    return {
                        stepId: step.stepId,
                        toolName: step.toolName,
                        success: true,
                        executionTime,
                        cost,
                        output: result,
                        retryCount,
                        cacheHit: false,
                    };
                }
                catch (error) {
                    lastError = error;
                    retryCount++;
                    if (retryCount <= (step.retryConfig?.maxRetries || 0)) {
                        const backoffMs = step.retryConfig?.backoffMs || 1000;
                        await new Promise(resolve => setTimeout(resolve, backoffMs * retryCount));
                    }
                }
            }
            // All retries failed
            const executionTime = Date.now() - startTime;
            this.updatePerformanceProfile(step.toolName, executionTime, 0, false);
            return {
                stepId: step.stepId,
                toolName: step.toolName,
                success: false,
                executionTime,
                cost: 0,
                error: lastError?.message || 'Execution failed',
                retryCount,
                cacheHit: false,
            };
        });
        return Promise.all(promises);
    }
    async simulateToolExecution(toolName, inputs) {
        const tool = this.toolRegistry.get(toolName);
        if (!tool) {
            throw new Error(`Tool ${toolName} not found`);
        }
        // Simulate execution time
        const executionTime = tool.estimatedExecutionTime + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, Math.min(executionTime, 100))); // Cap simulation time
        // Simulate occasional failures based on reliability
        if (Math.random() > tool.reliability) {
            throw new Error(`Simulated failure for ${toolName}`);
        }
        // Return mock output based on schema
        return {
            toolName,
            timestamp: new Date(),
            inputs,
            mockOutput: `Simulated output from ${toolName}`,
        };
    }
    /**
     * Additional helper methods
     */
    generatePlanId() {
        return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateStepId() {
        return `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateCacheKey(toolName, inputs) {
        const inputHash = JSON.stringify(inputs);
        return `${toolName}_${Buffer.from(inputHash).toString('base64')}`;
    }
    countParallelGroups(steps) {
        const groups = new Set(steps.map(step => step.parallelGroup).filter(g => g !== undefined));
        return groups.size;
    }
    calculateOptimalTimeout(steps) {
        const totalEstimatedTime = steps.reduce((sum, step) => {
            const tool = this.toolRegistry.get(step.toolName);
            return sum + (tool?.estimatedExecutionTime || 1000);
        }, 0);
        return Math.max(totalEstimatedTime * 1.5, 60000); // 150% of estimated time, minimum 60s
    }
    estimateTotalExecutionTime(steps) {
        const parallelGroups = this.groupStepsByParallelism(steps);
        return parallelGroups.reduce((sum, group) => {
            const maxGroupTime = Math.max(...group.map(step => {
                const tool = this.toolRegistry.get(step.toolName);
                return tool?.estimatedExecutionTime || 1000;
            }));
            return sum + maxGroupTime;
        }, 0);
    }
    estimateTotalCost(steps) {
        return steps.reduce((sum, step) => {
            const tool = this.toolRegistry.get(step.toolName);
            return sum + (tool?.costPerExecution || 0);
        }, 0);
    }
    groupStepsByParallelism(steps) {
        // const _groups: Array<Array<any>> = [];
        const groupMap = new Map();
        for (const step of steps) {
            const groupNum = step.parallelGroup || 0;
            if (!groupMap.has(groupNum)) {
                groupMap.set(groupNum, []);
            }
            groupMap.get(groupNum).push(step);
        }
        const sortedGroups = Array.from(groupMap.entries()).sort((a, b) => a[0] - b[0]);
        return sortedGroups.map(([_, group]) => group);
    }
    identifyBottlenecks(stepResults) {
        return stepResults
            .filter(result => result.executionTime > this.config.performanceThreshold)
            .map(result => result.toolName)
            .filter((toolName, index, arr) => arr.indexOf(toolName) === index) // Unique
            .slice(0, 5); // Top 5 bottlenecks
    }
    generateRecommendations(stepResults, _optimization, _plan) {
        const recommendations = [];
        // Performance recommendations
        const slowSteps = stepResults.filter(r => r.executionTime > this.config.performanceThreshold);
        if (slowSteps.length > 0) {
            recommendations.push({
                type: 'performance',
                message: `${slowSteps.length} steps exceeded performance threshold. Consider optimization.`,
                priority: 'medium',
            });
        }
        // Cost recommendations
        const totalCost = stepResults.reduce((sum, r) => sum + r.cost, 0);
        if (totalCost > this.config.costThreshold) {
            recommendations.push({
                type: 'cost',
                message: `Total execution cost ($${totalCost.toFixed(4)}) exceeded threshold. Consider optimization.`,
                priority: 'medium',
            });
        }
        // Reliability recommendations
        const failedSteps = stepResults.filter(r => !r.success);
        if (failedSteps.length > 0) {
            recommendations.push({
                type: 'reliability',
                message: `${failedSteps.length} steps failed. Consider adding fallback strategies.`,
                priority: 'high',
            });
        }
        return recommendations;
    }
    recordExecution(planId, result) {
        this.executionHistory.push({
            planId,
            timestamp: new Date(),
            result,
        });
        // Keep only last 1000 executions for memory management
        if (this.executionHistory.length > 1000) {
            this.executionHistory = this.executionHistory.slice(-1000);
        }
    }
    async learnFromExecution(plan, result) {
        // Update tool performance profiles based on actual execution
        for (const stepResult of result.stepResults) {
            this.updatePerformanceProfile(stepResult.toolName, stepResult.executionTime, stepResult.cost, stepResult.success);
        }
        // Learn optimization patterns
        if (result.success && result.executionTime < plan.constraints.maxExecutionTime) {
            // Successful optimization - reinforce successful patterns
            console.log(`Learning from successful execution: ${plan.name}`);
        }
    }
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
    findParallelizableSteps(steps) {
        return steps.filter(step => {
            const tool = this.toolRegistry.get(step.toolName);
            return tool && tool.parallelizable && !step.parallelGroup;
        });
    }
    estimateParallelizationSavings(steps) {
        const totalTime = steps.reduce((sum, step) => {
            const tool = this.toolRegistry.get(step.toolName);
            return sum + (tool?.estimatedExecutionTime || 1000);
        }, 0);
        const parallelTime = Math.max(...steps.map(step => {
            const tool = this.toolRegistry.get(step.toolName);
            return tool?.estimatedExecutionTime || 1000;
        }));
        return ((totalTime - parallelTime) / totalTime) * 100;
    }
    findExpensiveSteps(steps) {
        const avgCost = steps.reduce((sum, step) => {
            const tool = this.toolRegistry.get(step.toolName);
            return sum + (tool?.costPerExecution || 0);
        }, 0) / steps.length;
        return steps.filter(step => {
            const tool = this.toolRegistry.get(step.toolName);
            return tool && tool.costPerExecution > avgCost * 2;
        });
    }
    findUnreliableSteps(steps) {
        return steps.filter(step => {
            const tool = this.toolRegistry.get(step.toolName);
            return tool && tool.reliability < 0.9;
        });
    }
    calculateTrend(older, recent, metric) {
        if (older.length === 0 || recent.length === 0)
            return 0;
        const olderAvg = older.reduce((sum, exec) => sum + exec.result[metric], 0) / older.length;
        const recentAvg = recent.reduce((sum, exec) => sum + exec.result[metric], 0) / recent.length;
        return ((olderAvg - recentAvg) / olderAvg) * 100; // Positive means improvement
    }
    calculateReliabilityTrend(older, recent) {
        if (older.length === 0 || recent.length === 0)
            return 0;
        const olderSuccessRate = older.filter(exec => exec.result.success).length / older.length;
        const recentSuccessRate = recent.filter(exec => exec.result.success).length / recent.length;
        return (recentSuccessRate - olderSuccessRate) * 100; // Positive means improvement
    }
}
// Export factory function
export function createToolChainOptimizer(config) {
    return new ToolChainOptimizer(config);
}
//# sourceMappingURL=ToolChainOptimizer.js.map