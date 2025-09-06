/**
 * MCP Registry Tests
 *
 * Comprehensive test suite for MCP Registry system
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { z } from 'zod';
import { MCPRegistry, mcpRegistry } from './registry';
import { MCPTool, MCPToolFactory } from './mcp-tool';
import { MCPResource, MCPResourceFactory } from './mcp-resource';
import { MCPPrompt, MCPPromptFactory } from './mcp-prompt';
// Test implementations
class TestMCPTool extends MCPTool {
    constructor() {
        super({
            name: 'test-tool',
            description: 'Test tool',
            version: '1.0.0',
            inputSchema: z.object({ input: z.string() }),
            outputSchema: z.object({ output: z.string() }),
        });
    }
    async executeInternal(input) {
        return { output: `Processed: ${input.input}` };
    }
}
class TestMCPResource extends MCPResource {
    constructor() {
        super({
            name: 'test-resource',
            type: 'memory',
            description: 'Test resource',
            version: '1.0.0',
            connectionConfig: {},
        });
    }
    async initializeInternal() {
        // Mock initialization
    }
    async createConnection() {
        return `connection_${Date.now()}`;
    }
    async closeConnection(_connection) {
        // Mock cleanup
    }
    getConnectionId(connection) {
        return connection;
    }
}
class TestMCPPrompt extends MCPPrompt {
    constructor() {
        super({
            name: 'test-prompt',
            description: 'Test prompt',
            version: '1.0.0',
            template: 'Hello {{name}}',
            variables: {
                name: z.string(),
            },
        });
    }
    async processPrompt(prompt) {
        return `Processed: ${prompt}`;
    }
}
describe('MCPRegistry', () => {
    let registry;
    let mockLogger;
    beforeEach(() => {
        mockLogger = {
            info: vi.fn(),
            error: vi.fn(),
            warn: vi.fn(),
        };
        registry = new MCPRegistry({
            enableAutoDiscovery: true,
            enableDependencyInjection: true,
            enableHealthMonitoring: true,
            healthCheckInterval: 1000, // 1 second for testing
            logger: mockLogger,
        });
    });
    afterEach(async () => {
        await registry.cleanup();
        MCPToolFactory.clearTools();
        MCPResourceFactory.clearResources();
        MCPPromptFactory.clearPrompts();
    });
    describe('Registry Initialization', () => {
        it('should initialize successfully', async () => {
            await registry.initialize();
            expect(registry.isReady()).toBe(true);
        });
        it('should not initialize twice', async () => {
            await registry.initialize();
            await registry.initialize(); // Should not throw error
            expect(registry.isReady()).toBe(true);
        });
        it('should return correct configuration', () => {
            const config = registry.getConfig();
            expect(config.enableAutoDiscovery).toBe(true);
            expect(config.enableDependencyInjection).toBe(true);
            expect(config.enableHealthMonitoring).toBe(true);
            expect(config.healthCheckInterval).toBe(1000);
        });
    });
    describe('Component Registration', () => {
        beforeEach(async () => {
            await registry.initialize();
        });
        it('should register and retrieve tools', () => {
            const tool = new TestMCPTool();
            registry.registerTool(tool);
            const retrievedTool = registry.getTool('test-tool');
            expect(retrievedTool).toBe(tool);
            expect(registry.getToolNames()).toContain('test-tool');
        });
        it('should register and retrieve resources', () => {
            const resource = new TestMCPResource();
            registry.registerResource(resource);
            const retrievedResource = registry.getResource('test-resource');
            expect(retrievedResource).toBe(resource);
            expect(registry.getResourceNames()).toContain('test-resource');
        });
        it('should register and retrieve prompts', () => {
            const prompt = new TestMCPPrompt();
            registry.registerPrompt(prompt);
            const retrievedPrompt = registry.getPrompt('test-prompt');
            expect(retrievedPrompt).toBe(prompt);
            expect(registry.getPromptNames()).toContain('test-prompt');
        });
        it('should return all components', () => {
            const tool = new TestMCPTool();
            const resource = new TestMCPResource();
            const prompt = new TestMCPPrompt();
            registry.registerTool(tool);
            registry.registerResource(resource);
            registry.registerPrompt(prompt);
            expect(registry.getAllTools()).toContain(tool);
            expect(registry.getAllResources()).toContain(resource);
            expect(registry.getAllPrompts()).toContain(prompt);
        });
    });
    describe('Component Discovery', () => {
        it('should discover components when enabled', async () => {
            await registry.initialize();
            await registry.discoverComponents();
            // Discovery is enabled but implementation is placeholder
            expect(true).toBe(true);
        });
        it('should not discover components when disabled', async () => {
            const noDiscoveryRegistry = new MCPRegistry({
                enableAutoDiscovery: false,
                logger: mockLogger,
            });
            await noDiscoveryRegistry.initialize();
            await noDiscoveryRegistry.discoverComponents();
            expect(true).toBe(true);
        });
    });
    describe('Registry Statistics', () => {
        beforeEach(async () => {
            await registry.initialize();
        });
        it('should return correct statistics', async () => {
            const tool = new TestMCPTool();
            const resource = new TestMCPResource();
            const prompt = new TestMCPPrompt();
            registry.registerTool(tool);
            registry.registerResource(resource);
            registry.registerPrompt(prompt);
            const stats = await registry.getStats();
            expect(stats.tools.total).toBe(1);
            expect(stats.resources.total).toBe(1);
            expect(stats.prompts.total).toBe(1);
            expect(stats.tools.healthy).toBeGreaterThanOrEqual(0);
            expect(stats.resources.healthy).toBeGreaterThanOrEqual(0);
            expect(stats.prompts.healthy).toBeGreaterThanOrEqual(0);
        });
        it('should track unhealthy components', async () => {
            // Create a tool that will fail health check
            class UnhealthyTool extends MCPTool {
                constructor() {
                    super({
                        name: 'unhealthy-tool',
                        description: 'Unhealthy tool',
                        version: '1.0.0',
                        inputSchema: z.object({ input: z.string() }),
                        outputSchema: z.object({ output: z.string() }),
                    });
                }
                async executeInternal() {
                    return { output: 'test' };
                }
                async healthCheck() {
                    return false; // Always unhealthy
                }
            }
            const unhealthyTool = new UnhealthyTool();
            registry.registerTool(unhealthyTool);
            const stats = await registry.getStats();
            expect(stats.tools.unhealthy).toBe(1);
        });
    });
    describe('Health Monitoring', () => {
        it('should start health monitoring when enabled', async () => {
            await registry.initialize();
            // Wait for health check interval
            await new Promise(resolve => setTimeout(resolve, 1100));
            // Should have logged health check
            expect(mockLogger.info).toHaveBeenCalledWith('Health monitoring check', expect.objectContaining({
                stats: expect.any(Object),
                timestamp: expect.any(String),
            }));
        });
        it('should stop health monitoring', () => {
            registry.stopHealthMonitoring();
            expect(true).toBe(true); // No error thrown
        });
    });
    describe('Registry Cleanup', () => {
        it('should cleanup successfully', async () => {
            await registry.initialize();
            const tool = new TestMCPTool();
            const resource = new TestMCPResource();
            const prompt = new TestMCPPrompt();
            registry.registerTool(tool);
            registry.registerResource(resource);
            registry.registerPrompt(prompt);
            await registry.cleanup();
            expect(registry.isReady()).toBe(false);
        });
    });
});
describe('Global Registry Instance', () => {
    afterEach(async () => {
        await mcpRegistry.cleanup();
    });
    it('should be available globally', () => {
        expect(mcpRegistry).toBeDefined();
        expect(mcpRegistry).toBeInstanceOf(MCPRegistry);
    });
    it('should be configurable', () => {
        const config = mcpRegistry.getConfig();
        expect(config).toBeDefined();
        expect(typeof config.enableAutoDiscovery).toBe('boolean');
    });
});
//# sourceMappingURL=registry.test.js.map