#!/usr/bin/env node
/**
 * Context-Aware Template Engine Tests - Week 2 Enhanced
 *
 * Comprehensive test suite for the enhanced Context-Aware Template Engine
 * with advanced context intelligence, cross-session learning, and behavioral adaptation.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ContextAwareTemplateEngine, createTemplateEngine, } from './ContextAwareTemplateEngine';
describe('ContextAwareTemplateEngine - Week 2 Enhanced', () => {
    let engine;
    beforeEach(() => {
        engine = createTemplateEngine();
    });
    afterEach(() => {
        // Cleanup after each test
    });
    describe('template generation', () => {
        it('should generate template for generation task', async () => {
            const context = {
                toolName: 'smart_begin',
                taskType: 'generation',
                userLevel: 'intermediate',
                outputFormat: 'code',
                timeConstraint: 'standard',
            };
            const result = await engine.generateTemplate(context);
            expect(result.template).toBeTruthy();
            expect(result.metadata.taskType).toBe('generation');
            expect(result.estimatedTokens).toBeGreaterThan(0);
            expect(result.variables.toolName).toBe('smart_begin');
            expect(result.variables.userLevel_intermediate).toBe(true);
        });
        it('should generate template for analysis task', async () => {
            const context = {
                toolName: 'smart_plan',
                taskType: 'analysis',
                userLevel: 'advanced',
                outputFormat: 'structured',
                timeConstraint: 'thorough',
                constraints: ['performance', 'security'],
            };
            const result = await engine.generateTemplate(context);
            expect(result.template).toContain('Analyze');
            expect(result.metadata.taskType).toBe('analysis');
            expect(result.variables.constraints).toEqual(['performance', 'security']);
            expect(result.variables.userLevel_advanced).toBe(true);
        });
        it('should generate template for planning task', async () => {
            const context = {
                toolName: 'smart_orchestrate',
                taskType: 'planning',
                userLevel: 'beginner',
                outputFormat: 'markdown',
                timeConstraint: 'immediate',
            };
            const result = await engine.generateTemplate(context);
            expect(result.template).toContain('plan');
            expect(result.metadata.taskType).toBe('planning');
            expect(result.variables.timeConstraint_immediate).toBe(true);
        });
    });
    describe('user level adaptation', () => {
        it('should adapt template for beginner users', async () => {
            const beginnerContext = {
                toolName: 'smart_write',
                taskType: 'generation',
                userLevel: 'beginner',
                outputFormat: 'text',
                timeConstraint: 'standard',
            };
            const result = await engine.generateTemplate(beginnerContext);
            expect(result.metadata.qualityScore).toBeGreaterThanOrEqual(85);
            expect(result.metadata.compressionRatio).toBeLessThanOrEqual(0.4); // Less compression for clarity
        });
        it('should adapt template for advanced users', async () => {
            const advancedContext = {
                toolName: 'smart_finish',
                taskType: 'generation',
                userLevel: 'advanced',
                outputFormat: 'code',
                timeConstraint: 'standard',
            };
            const result = await engine.generateTemplate(advancedContext);
            expect(result.metadata.compressionRatio).toBeGreaterThan(0.3); // More compression for advanced
        });
    });
    describe('time constraint optimization', () => {
        it('should optimize for immediate time constraint', async () => {
            const immediateContext = {
                toolName: 'smart_begin',
                taskType: 'generation',
                userLevel: 'intermediate',
                outputFormat: 'code',
                timeConstraint: 'immediate',
            };
            const result = await engine.generateTemplate(immediateContext);
            expect(result.metadata.compressionRatio).toBeGreaterThanOrEqual(0.4); // Higher compression for speed
            expect(result.template).not.toContain('{{#unless timeConstraint_immediate}}');
        });
        it('should optimize for thorough time constraint', async () => {
            const thoroughContext = {
                toolName: 'smart_plan',
                taskType: 'planning',
                userLevel: 'advanced',
                outputFormat: 'structured',
                timeConstraint: 'thorough',
            };
            const result = await engine.generateTemplate(thoroughContext);
            expect(result.metadata.compressionRatio).toBeLessThanOrEqual(0.4); // Less compression for thoroughness
        });
    });
    describe('context history integration', () => {
        it('should include context history in template variables', async () => {
            const contextWithHistory = {
                toolName: 'smart_write',
                taskType: 'generation',
                userLevel: 'intermediate',
                outputFormat: 'code',
                timeConstraint: 'standard',
                contextHistory: ['Previous implementation focused on performance', 'Used React framework'],
            };
            const result = await engine.generateTemplate(contextWithHistory);
            expect(result.variables.contextHistory).toEqual(contextWithHistory.contextHistory);
            expect(result.contextInjections).toContain('Previous context: Previous implementation focused on performance');
        });
    });
    describe('constraints handling', () => {
        it('should handle multiple constraints', async () => {
            const constrainedContext = {
                toolName: 'smart_orchestrate',
                taskType: 'planning',
                userLevel: 'advanced',
                outputFormat: 'structured',
                timeConstraint: 'standard',
                constraints: ['budget', 'timeline', 'resources', 'compliance'],
            };
            const result = await engine.generateTemplate(constrainedContext);
            expect(result.variables.constraints).toHaveLength(4);
            expect(result.contextInjections).toContain('Active constraints: 4 items');
        });
    });
    describe('built-in templates', () => {
        it('should have built-in templates for common tools', () => {
            const templates = engine.getAllTemplates();
            const smartBeginTemplate = templates.find((t) => t.toolName === 'smart_begin');
            const smartPlanTemplate = templates.find((t) => t.toolName === 'smart_plan');
            const smartWriteTemplate = templates.find((t) => t.toolName === 'smart_write');
            expect(smartBeginTemplate).toBeDefined();
            expect(smartPlanTemplate).toBeDefined();
            expect(smartWriteTemplate).toBeDefined();
        });
        it('should retrieve template by ID', () => {
            const template = engine.getTemplateById('smart_begin_basic');
            expect(template).toBeDefined();
            expect(template?.toolName).toBe('smart_begin');
        });
    });
    describe('custom templates', () => {
        it('should allow adding custom templates', () => {
            const customTemplate = {
                id: 'custom_test',
                name: 'Custom Test Template',
                description: 'Test template',
                toolName: 'custom_tool',
                taskType: 'testing',
                baseTokens: 100,
                compressionRatio: 0.3,
                qualityScore: 85,
                usageCount: 0,
                lastUpdated: new Date(),
                variables: ['testVar'],
                template: 'Test {{testVar}} with custom template',
            };
            engine.addCustomTemplate(customTemplate);
            const retrieved = engine.getTemplateById('custom_test');
            expect(retrieved).toBeDefined();
            expect(retrieved?.name).toBe('Custom Test Template');
        });
    });
    describe('template rendering', () => {
        it('should render template with variables', () => {
            const customTemplate = {
                id: 'render_test',
                name: 'Render Test Template',
                description: 'Template for testing rendering',
                toolName: 'test_tool',
                taskType: 'generation',
                baseTokens: 50,
                compressionRatio: 0.4,
                qualityScore: 80,
                usageCount: 0,
                lastUpdated: new Date(),
                variables: ['name', 'task'],
                template: 'Hello {{name}}, please complete {{task}}',
            };
            engine.addCustomTemplate(customTemplate);
            const rendered = engine.renderTemplate('render_test', {
                name: 'Developer',
                task: 'unit testing',
            });
            expect(rendered).toBe('Hello Developer, please complete unit testing');
        });
        it('should return null for non-existent template', () => {
            const result = engine.renderTemplate('non_existent', {});
            expect(result).toBeNull();
        });
    });
    describe('usage statistics', () => {
        it('should track template usage', async () => {
            const context = {
                toolName: 'smart_begin',
                taskType: 'generation',
                userLevel: 'intermediate',
                outputFormat: 'code',
                timeConstraint: 'standard',
            };
            // Generate template multiple times
            await engine.generateTemplate(context);
            await engine.generateTemplate(context);
            await engine.generateTemplate(context);
            const stats = engine.getUsageStats();
            expect(stats.size).toBeGreaterThan(0);
        });
    });
    describe('factory function', () => {
        it('should create template engine', () => {
            const engine = createTemplateEngine();
            expect(engine).toBeInstanceOf(ContextAwareTemplateEngine);
        });
    });
    describe('handlebars helpers', () => {
        it('should support custom handlebars helpers', () => {
            const customTemplate = {
                id: 'helper_test',
                name: 'Helper Test Template',
                description: 'Template for testing helpers',
                toolName: 'test_tool',
                taskType: 'generation',
                baseTokens: 60,
                compressionRatio: 0.4,
                qualityScore: 80,
                usageCount: 0,
                lastUpdated: new Date(),
                variables: ['items'],
                template: 'Array has {{array_length items}} items. {{#if (array_length items)}}Items exist{{else}}No items{{/if}}',
            };
            engine.addCustomTemplate(customTemplate);
            const rendered = engine.renderTemplate('helper_test', {
                items: ['a', 'b', 'c'],
            });
            expect(rendered).toContain('Array has 3 items');
            expect(rendered).toContain('Items exist');
        });
    });
});
//# sourceMappingURL=ContextAwareTemplateEngine.test.js.map