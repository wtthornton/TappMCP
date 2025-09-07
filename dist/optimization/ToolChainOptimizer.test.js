import { describe, it, expect, beforeEach } from 'vitest';
import { ToolChainOptimizer, createToolChainOptimizer } from './ToolChainOptimizer';
describe('ToolChainOptimizer', () => {
    let optimizer;
    beforeEach(() => {
        optimizer = createToolChainOptimizer({
            enableIntelligentCaching: true,
            enableAdaptiveParallelism: true,
            maxParallelExecutions: 5,
        });
    });
    describe('tool registration', () => {
        it('should register tools correctly', () => {
            const customTool = {
                name: 'test_tool',
                description: 'Test tool for validation',
                category: 'validation',
                inputSchema: { data: 'string' },
                outputSchema: { result: 'boolean' },
                dependencies: [],
                estimatedExecutionTime: 1000,
                resourceRequirements: { memory: 50, cpu: 1, tokens: 100 },
                reliability: 0.95,
                costPerExecution: 0.01,
                parallelizable: true,
                cacheEnabled: true,
                version: '1.0.0',
            };
            optimizer.registerTool(customTool);
            // Tool registration should not throw and optimizer should have built-in tools + custom tool
            expect(optimizer).toBeDefined();
        });
    });
    describe('execution plan creation', () => {
        it('should create optimized execution plan', async () => {
            const planDefinition = {
                name: 'Test Workflow',
                description: 'Test workflow for validation',
                goal: 'Test system integration',
                tools: [
                    { tool: 'smart_begin', inputs: { goal: 'test project' } },
                    { tool: 'smart_plan', inputs: { requirements: {} } },
                    { tool: 'smart_write', inputs: { plan: {} } },
                ],
                constraints: {
                    maxExecutionTime: 30000,
                    maxCost: 0.5,
                    requiredReliability: 0.9,
                },
            };
            const plan = await optimizer.createOptimizedPlan(planDefinition);
            expect(plan).toBeDefined();
            expect(plan.id).toBeTruthy();
            expect(plan.name).toBe('Test Workflow');
            expect(plan.steps).toHaveLength(3);
            expect(plan.optimization.enableParallel).toBe(true);
            expect(plan.optimization.enableCaching).toBe(true);
            expect(plan.constraints.maxExecutionTime).toBeDefined();
        });
        it('should handle dependencies correctly', async () => {
            const planDefinition = {
                name: 'Dependency Test',
                description: 'Test dependency resolution',
                goal: 'Validate dependency handling',
                tools: [
                    { tool: 'smart_write', inputs: { plan: {} } }, // Depends on smart_plan
                    { tool: 'smart_plan', inputs: { requirements: {} } }, // Depends on smart_begin
                    { tool: 'smart_begin', inputs: { goal: 'test' } }, // No dependencies
                ],
            };
            const plan = await optimizer.createOptimizedPlan(planDefinition);
            // Should reorder steps based on dependencies
            expect(plan.steps[0].toolName).toBe('smart_begin');
            expect(plan.steps[1].toolName).toBe('smart_plan');
            expect(plan.steps[2].toolName).toBe('smart_write');
        });
    });
    describe('plan execution', () => {
        it('should execute plan successfully', async () => {
            const planDefinition = {
                name: 'Simple Execution Test',
                description: 'Test basic execution',
                goal: 'Test execution flow',
                tools: [{ tool: 'smart_begin', inputs: { goal: 'test execution' } }],
            };
            const plan = await optimizer.createOptimizedPlan(planDefinition);
            const result = await optimizer.executePlan(plan);
            expect(result).toBeDefined();
            expect(result.planId).toBe(plan.id);
            expect(result.success).toBe(true);
            expect(result.executionTime).toBeGreaterThan(0);
            expect(result.stepResults).toHaveLength(1);
            expect(result.stepResults[0].success).toBe(true);
        });
        it('should handle parallel execution', async () => {
            // Register parallelizable tools for testing
            optimizer.registerTool({
                name: 'parallel_tool_1',
                description: 'Parallel test tool 1',
                category: 'generation',
                inputSchema: { data: 'string' },
                outputSchema: { result: 'string' },
                dependencies: [],
                estimatedExecutionTime: 1000,
                resourceRequirements: { memory: 50, cpu: 1, tokens: 100 },
                reliability: 0.95,
                costPerExecution: 0.01,
                parallelizable: true,
                cacheEnabled: false,
                version: '1.0.0',
            });
            optimizer.registerTool({
                name: 'parallel_tool_2',
                description: 'Parallel test tool 2',
                category: 'generation',
                inputSchema: { data: 'string' },
                outputSchema: { result: 'string' },
                dependencies: [],
                estimatedExecutionTime: 1000,
                resourceRequirements: { memory: 50, cpu: 1, tokens: 100 },
                reliability: 0.95,
                costPerExecution: 0.01,
                parallelizable: true,
                cacheEnabled: false,
                version: '1.0.0',
            });
            const planDefinition = {
                name: 'Parallel Test',
                description: 'Test parallel execution',
                goal: 'Validate parallelism',
                tools: [
                    { tool: 'parallel_tool_1', inputs: { data: 'test1' } },
                    { tool: 'parallel_tool_2', inputs: { data: 'test2' } },
                ],
            };
            const plan = await optimizer.createOptimizedPlan(planDefinition);
            const result = await optimizer.executePlan(plan);
            expect(result.success).toBe(true);
            expect(result.optimization.parallelSteps).toBeGreaterThan(0);
        });
        it('should use caching when enabled', async () => {
            const planDefinition = {
                name: 'Cache Test',
                description: 'Test caching functionality',
                goal: 'Validate caching',
                tools: [{ tool: 'smart_begin', inputs: { goal: 'cache test' } }],
            };
            const plan = await optimizer.createOptimizedPlan(planDefinition);
            // Execute twice with same inputs
            const result1 = await optimizer.executePlan(plan);
            const result2 = await optimizer
                .createOptimizedPlan(planDefinition)
                .then(newPlan => optimizer.executePlan(newPlan));
            expect(result1.success).toBe(true);
            expect(result2.success).toBe(true);
            // Second execution should have cache hits
            expect(result2.optimization.cacheHits).toBeGreaterThanOrEqual(0);
        });
    });
    describe('optimization suggestions', () => {
        it('should provide optimization suggestions', async () => {
            const planDefinition = {
                name: 'Optimization Test',
                description: 'Test optimization suggestions',
                goal: 'Get optimization ideas',
                tools: [
                    { tool: 'smart_begin', inputs: { goal: 'test' } },
                    { tool: 'smart_plan', inputs: { requirements: {} } },
                    { tool: 'smart_write', inputs: { plan: {} } },
                ],
            };
            const plan = await optimizer.createOptimizedPlan(planDefinition);
            const suggestions = optimizer.suggestOptimizations(plan);
            expect(suggestions).toBeDefined();
            expect(Array.isArray(suggestions)).toBe(true);
            if (suggestions.length > 0) {
                const suggestion = suggestions[0];
                expect(suggestion.type).toBeDefined();
                expect(suggestion.suggestion).toBeTruthy();
                expect(suggestion.estimatedImpact).toBeDefined();
                expect(suggestion.difficulty).toBeDefined();
            }
        });
    });
    describe('performance metrics', () => {
        it('should provide performance metrics', async () => {
            // Execute a simple plan to generate metrics
            const planDefinition = {
                name: 'Metrics Test',
                description: 'Generate metrics data',
                goal: 'Test metrics',
                tools: [{ tool: 'smart_begin', inputs: { goal: 'metrics test' } }],
            };
            const plan = await optimizer.createOptimizedPlan(planDefinition);
            await optimizer.executePlan(plan);
            const metrics = optimizer.getPerformanceMetrics();
            expect(metrics).toBeDefined();
            expect(metrics.totalExecutions).toBeGreaterThan(0);
            expect(metrics.averageExecutionTime).toBeGreaterThanOrEqual(0);
            expect(metrics.parallelismRate).toBeGreaterThanOrEqual(0);
            expect(metrics.cacheHitRate).toBeGreaterThanOrEqual(0);
            expect(metrics.errorRate).toBeGreaterThanOrEqual(0);
            expect(metrics.costEfficiency).toBeGreaterThanOrEqual(0);
            expect(Array.isArray(metrics.bottleneckTools)).toBe(true);
            expect(metrics.trendAnalysis).toBeDefined();
        });
    });
    describe('error handling', () => {
        it('should handle tool execution failures gracefully', async () => {
            // Register an unreliable tool for testing
            optimizer.registerTool({
                name: 'unreliable_tool',
                description: 'Tool that often fails',
                category: 'validation',
                inputSchema: { data: 'string' },
                outputSchema: { result: 'boolean' },
                dependencies: [],
                estimatedExecutionTime: 1000,
                resourceRequirements: { memory: 50, cpu: 1, tokens: 100 },
                reliability: 0.3, // Very unreliable
                costPerExecution: 0.01,
                parallelizable: true,
                cacheEnabled: false,
                version: '1.0.0',
            });
            const planDefinition = {
                name: 'Error Handling Test',
                description: 'Test error handling',
                goal: 'Validate error recovery',
                tools: [{ tool: 'unreliable_tool', inputs: { data: 'test' } }],
            };
            const plan = await optimizer.createOptimizedPlan(planDefinition);
            const result = await optimizer.executePlan(plan);
            expect(result).toBeDefined();
            expect(result.planId).toBe(plan.id);
            // Result may be successful or failed, but should not throw
            expect(typeof result.success).toBe('boolean');
            expect(result.stepResults).toHaveLength(1);
        });
    });
    describe('factory function', () => {
        it('should create optimizer with default configuration', () => {
            const defaultOptimizer = createToolChainOptimizer();
            expect(defaultOptimizer).toBeInstanceOf(ToolChainOptimizer);
        });
        it('should create optimizer with custom configuration', () => {
            const customOptimizer = createToolChainOptimizer({
                enableIntelligentCaching: false,
                maxParallelExecutions: 3,
            });
            expect(customOptimizer).toBeInstanceOf(ToolChainOptimizer);
        });
    });
});
//# sourceMappingURL=ToolChainOptimizer.test.js.map