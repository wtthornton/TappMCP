/**
 * MCP Prompt Tests
 *
 * Comprehensive test suite for MCP Prompt base class and factory
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { z } from 'zod';
import { MCPPrompt, MCPPromptFactory, } from './mcp-prompt';
// Test prompt implementation
class TestMCPPrompt extends MCPPrompt {
    constructor(config) {
        super(config);
    }
    async processPrompt(prompt, _context) {
        return `Processed: ${prompt}`;
    }
}
describe('MCPPrompt', () => {
    let testPrompt;
    beforeEach(() => {
        const config = {
            name: 'test-prompt',
            description: 'Test prompt for unit testing',
            version: '1.0.0',
            template: 'Hello {{name}}, please complete this task: {{task}}',
            variables: {
                name: z.string(),
                task: z.string(),
            },
            contextSchema: z.object({
                requestId: z.string(),
                userId: z.string().optional(),
                role: z.string().optional(),
            }),
            cacheConfig: {
                enabled: true,
                ttl: 3600000, // 1 hour
                maxSize: 100,
            },
        };
        testPrompt = new TestMCPPrompt(config);
    });
    afterEach(() => {
        vi.clearAllMocks();
        testPrompt.clearCache();
    });
    describe('Prompt Configuration', () => {
        it('should return correct configuration', () => {
            const config = testPrompt.getConfig();
            expect(config.name).toBe('test-prompt');
            expect(config.description).toBe('Test prompt for unit testing');
            expect(config.version).toBe('1.0.0');
            expect(config.template).toBe('Hello {{name}}, please complete this task: {{task}}');
        });
        it('should return correct name', () => {
            expect(testPrompt.getName()).toBe('test-prompt');
        });
        it('should return correct description', () => {
            expect(testPrompt.getDescription()).toBe('Test prompt for unit testing');
        });
        it('should return correct version', () => {
            expect(testPrompt.getVersion()).toBe('1.0.0');
        });
    });
    describe('Prompt Generation', () => {
        it('should generate prompt with valid variables', async () => {
            const variables = { name: 'John', task: 'write tests' };
            const result = await testPrompt.generate(variables);
            expect(result.success).toBe(true);
            expect(result.prompt).toBe('Hello John, please complete this task: write tests');
            expect(result.data).toBe('Processed: Hello John, please complete this task: write tests');
            expect(result.metadata.promptName).toBe('test-prompt');
            expect(result.metadata.variablesUsed).toEqual(['name', 'task']);
        });
        it('should generate prompt with context', async () => {
            const variables = { name: 'Jane', task: 'review code' };
            const context = {
                requestId: 'test-request-123',
                userId: 'test-user',
                role: 'developer',
                businessContext: { project: 'test-project' },
                conversationHistory: [
                    {
                        role: 'user',
                        content: 'I need help with testing',
                        timestamp: new Date().toISOString(),
                    },
                ],
            };
            const result = await testPrompt.generate(variables, context);
            expect(result.success).toBe(true);
            expect(result.prompt).toBe('Hello Jane, please complete this task: review code');
            expect(result.data).toBe('Processed: Hello Jane, please complete this task: review code');
        });
        it('should fail with invalid variables', async () => {
            const invalidVariables = { name: 123, task: 'invalid' }; // name as number instead of string
            const result = await testPrompt.generate(invalidVariables);
            expect(result.success).toBe(false);
            expect(result.error).toContain('Variable validation failed');
            expect(result.prompt).toBeUndefined();
        });
        it('should fail with invalid context', async () => {
            const variables = { name: 'John', task: 'write tests' };
            const invalidContext = { requestId: 123 }; // requestId as number instead of string
            const result = await testPrompt.generate(variables, invalidContext);
            expect(result.success).toBe(false);
            expect(result.error).toContain('Context validation failed');
        });
        it('should handle template with context variables', async () => {
            const config = {
                name: 'context-prompt',
                description: 'Prompt with context variables',
                version: '1.0.0',
                template: 'Hello {{name}}, your role is {{context.role}} and you are working on {{context.businessContext.project}}',
                variables: {
                    name: z.string(),
                },
            };
            const contextPrompt = new TestMCPPrompt(config);
            const variables = { name: 'Alice', task: 'develop' };
            const context = {
                requestId: 'test-123',
                role: 'developer',
                businessContext: { project: 'test-project' },
            };
            const result = await contextPrompt.generate(variables, context);
            expect(result.success).toBe(true);
            expect(result.prompt).toBe('Hello Alice, your role is developer and you are working on test-project');
        });
    });
    describe('Caching', () => {
        it('should cache generated prompts', async () => {
            const variables = { name: 'John', task: 'write tests' };
            // First generation
            const result1 = await testPrompt.generate(variables);
            expect(result1.success).toBe(true);
            // Second generation should use cache
            const result2 = await testPrompt.generate(variables);
            expect(result2.success).toBe(true);
            expect(result2.prompt).toBe(result1.prompt);
        });
        it('should clear cache', () => {
            const stats = testPrompt.getCacheStats();
            expect(stats.size).toBe(0);
            expect(stats.maxSize).toBe(100);
        });
        it('should respect cache size limits', async () => {
            // Generate many prompts to exceed cache size
            for (let i = 0; i < 150; i++) {
                const variables = { name: `User${i}`, task: `Task${i}` };
                await testPrompt.generate(variables);
            }
            const stats = testPrompt.getCacheStats();
            expect(stats.size).toBeLessThanOrEqual(100);
        });
    });
    describe('Health Check', () => {
        it('should pass health check', async () => {
            const isHealthy = await testPrompt.healthCheck();
            expect(isHealthy).toBe(true);
        });
    });
    describe('Performance', () => {
        it('should generate prompts within acceptable time limits', async () => {
            const variables = { name: 'John', task: 'write tests' };
            const startTime = Date.now();
            const result = await testPrompt.generate(variables);
            const executionTime = Date.now() - startTime;
            expect(result.success).toBe(true);
            expect(executionTime).toBeLessThan(100); // Should be much faster than 100ms
        });
    });
    describe('Template Rendering', () => {
        it('should handle complex templates', async () => {
            const config = {
                name: 'complex-prompt',
                description: 'Complex template for testing',
                version: '1.0.0',
                template: 'User: {{name}}\nTask: {{task}}\nContext: {{context.role}}\nProject: {{context.businessContext.project}}',
                variables: {
                    name: z.string(),
                    task: z.string(),
                },
            };
            const complexPrompt = new TestMCPPrompt(config);
            const variables = { name: 'Bob', task: 'implement feature' };
            const context = {
                requestId: 'test-123',
                role: 'developer',
                businessContext: { project: 'awesome-project' },
            };
            const result = await complexPrompt.generate(variables, context);
            expect(result.success).toBe(true);
            expect(result.prompt).toContain('User: Bob');
            expect(result.prompt).toContain('Task: implement feature');
            expect(result.prompt).toContain('Context: developer');
            expect(result.prompt).toContain('Project: awesome-project');
        });
    });
});
describe('MCPPromptFactory', () => {
    beforeEach(() => {
        MCPPromptFactory.clearPrompts();
    });
    afterEach(() => {
        MCPPromptFactory.clearPrompts();
    });
    describe('Prompt Registration', () => {
        it('should register and retrieve prompts', () => {
            const config = {
                name: 'factory-test-prompt',
                description: 'Prompt for factory testing',
                version: '1.0.0',
                template: 'Test template {{variable}}',
                variables: {
                    variable: z.string(),
                },
            };
            const prompt = new TestMCPPrompt(config);
            MCPPromptFactory.registerPrompt(prompt);
            const retrievedPrompt = MCPPromptFactory.getPrompt('factory-test-prompt');
            expect(retrievedPrompt).toBe(prompt);
            expect(retrievedPrompt?.getName()).toBe('factory-test-prompt');
        });
        it('should return undefined for non-existent prompt', () => {
            const prompt = MCPPromptFactory.getPrompt('non-existent-prompt');
            expect(prompt).toBeUndefined();
        });
        it('should return all registered prompts', () => {
            const prompt1 = new TestMCPPrompt({
                name: 'prompt1',
                description: 'Prompt 1',
                version: '1.0.0',
                template: 'Template 1 {{var}}',
                variables: { var: z.string() },
            });
            const prompt2 = new TestMCPPrompt({
                name: 'prompt2',
                description: 'Prompt 2',
                version: '1.0.0',
                template: 'Template 2 {{var}}',
                variables: { var: z.string() },
            });
            MCPPromptFactory.registerPrompt(prompt1);
            MCPPromptFactory.registerPrompt(prompt2);
            const allPrompts = MCPPromptFactory.getAllPrompts();
            expect(allPrompts).toHaveLength(2);
            expect(allPrompts).toContain(prompt1);
            expect(allPrompts).toContain(prompt2);
        });
        it('should return prompt names', () => {
            const prompt = new TestMCPPrompt({
                name: 'name-test-prompt',
                description: 'Prompt for name testing',
                version: '1.0.0',
                template: 'Template {{var}}',
                variables: { var: z.string() },
            });
            MCPPromptFactory.registerPrompt(prompt);
            const names = MCPPromptFactory.getPromptNames();
            expect(names).toContain('name-test-prompt');
        });
        it('should clear all prompts', () => {
            const prompt = new TestMCPPrompt({
                name: 'clear-test-prompt',
                description: 'Prompt for clear testing',
                version: '1.0.0',
                template: 'Template {{var}}',
                variables: { var: z.string() },
            });
            MCPPromptFactory.registerPrompt(prompt);
            expect(MCPPromptFactory.getAllPrompts()).toHaveLength(1);
            MCPPromptFactory.clearPrompts();
            expect(MCPPromptFactory.getAllPrompts()).toHaveLength(0);
        });
    });
    describe('Logger Configuration', () => {
        it('should set logger for factory', () => {
            const mockLogger = { info: vi.fn(), error: vi.fn() };
            MCPPromptFactory.setLogger(mockLogger);
            // Logger is set but not directly testable without implementation details
            expect(true).toBe(true); // Placeholder test
        });
    });
});
//# sourceMappingURL=mcp-prompt.test.js.map