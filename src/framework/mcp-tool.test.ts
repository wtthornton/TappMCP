/**
 * MCP Tool Tests
 *
 * Comprehensive test suite for MCP Tool base class and factory
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { z } from 'zod';
import { MCPTool, MCPToolFactory, type MCPToolConfig, type MCPToolContext } from './mcp-tool';

// Test tool implementation
class TestMCPTool extends MCPTool<{ input: string }, { output: string }> {
  constructor(config: MCPToolConfig) {
    super(config);
  }

  protected async executeInternal(
    input: { input: string },
    _context?: MCPToolContext
  ): Promise<{ output: string }> {
    return { output: `Processed: ${input.input}` };
  }
}

describe('MCPTool', () => {
  let testTool: TestMCPTool;

  beforeEach(() => {
    const config: MCPToolConfig = {
      name: 'test-tool',
      description: 'Test tool for unit testing',
      version: '1.0.0',
      inputSchema: z.object({ input: z.string() }),
      outputSchema: z.object({ output: z.string() }),
      timeout: 5000,
      retries: 3,
    };

    testTool = new TestMCPTool(config);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Tool Configuration', () => {
    it('should return correct configuration', () => {
      const config = testTool.getConfig();
      expect(config.name).toBe('test-tool');
      expect(config.description).toBe('Test tool for unit testing');
      expect(config.version).toBe('1.0.0');
    });

    it('should return correct name', () => {
      expect(testTool.getName()).toBe('test-tool');
    });

    it('should return correct description', () => {
      expect(testTool.getDescription()).toBe('Test tool for unit testing');
    });

    it('should return correct version', () => {
      expect(testTool.getVersion()).toBe('1.0.0');
    });
  });

  describe('Tool Execution', () => {
    it('should execute successfully with valid input', async () => {
      const input = { input: 'test input' };
      const result = await testTool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ output: 'Processed: test input' });
      expect(result.metadata.toolName).toBe('test-tool');
      expect(result.metadata.version).toBe('1.0.0');
      expect(result.metadata.executionTime).toBeGreaterThan(0);
    });

    it('should handle execution with context', async () => {
      const input = { input: 'test input' };
      const context: MCPToolContext = {
        requestId: 'test-request-123',
        userId: 'test-user',
        sessionId: 'test-session',
        businessContext: { project: 'test-project' },
        role: 'developer',
      };

      const result = await testTool.execute(input, context);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ output: 'Processed: test input' });
    });

    it('should fail with invalid input', async () => {
      const invalidInput = { input: 123 } as any;
      const result = await testTool.execute(invalidInput);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Input validation failed');
      expect(result.data).toBeUndefined();
    });

    it('should handle execution errors gracefully', async () => {
      // Create a tool that throws an error
      class ErrorTool extends MCPTool<{ input: string }, { output: string }> {
        constructor() {
          super({
            name: 'error-tool',
            description: 'Tool that throws errors',
            version: '1.0.0',
            inputSchema: z.object({ input: z.string() }),
            outputSchema: z.object({ output: z.string() }),
          });
        }

        protected async executeInternal(): Promise<{ output: string }> {
          throw new Error('Test error');
        }
      }

      const errorTool = new ErrorTool();
      const result = await errorTool.execute({ input: 'test' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Test error');
    });
  });

  describe('Health Check', () => {
    it('should pass health check', async () => {
      const isHealthy = await testTool.healthCheck();
      expect(isHealthy).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should execute within acceptable time limits', async () => {
      const input = { input: 'test input' };
      const startTime = Date.now();

      const result = await testTool.execute(input);

      const executionTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(executionTime).toBeLessThan(100); // Should be much faster than 100ms
    });
  });
});

describe('MCPToolFactory', () => {
  beforeEach(() => {
    MCPToolFactory.clearTools();
  });

  afterEach(() => {
    MCPToolFactory.clearTools();
  });

  describe('Tool Registration', () => {
    it('should register and retrieve tools', () => {
      const config: MCPToolConfig = {
        name: 'factory-test-tool',
        description: 'Tool for factory testing',
        version: '1.0.0',
        inputSchema: z.object({ input: z.string() }),
        outputSchema: z.object({ output: z.string() }),
      };

      const tool = new TestMCPTool(config);
      MCPToolFactory.registerTool(tool);

      const retrievedTool = MCPToolFactory.getTool('factory-test-tool');
      expect(retrievedTool).toBe(tool);
      expect(retrievedTool?.getName()).toBe('factory-test-tool');
    });

    it('should return undefined for non-existent tool', () => {
      const tool = MCPToolFactory.getTool('non-existent-tool');
      expect(tool).toBeUndefined();
    });

    it('should return all registered tools', () => {
      const tool1 = new TestMCPTool({
        name: 'tool1',
        description: 'Tool 1',
        version: '1.0.0',
        inputSchema: z.object({ input: z.string() }),
        outputSchema: z.object({ output: z.string() }),
      });

      const tool2 = new TestMCPTool({
        name: 'tool2',
        description: 'Tool 2',
        version: '1.0.0',
        inputSchema: z.object({ input: z.string() }),
        outputSchema: z.object({ output: z.string() }),
      });

      MCPToolFactory.registerTool(tool1);
      MCPToolFactory.registerTool(tool2);

      const allTools = MCPToolFactory.getAllTools();
      expect(allTools).toHaveLength(2);
      expect(allTools).toContain(tool1);
      expect(allTools).toContain(tool2);
    });

    it('should return tool names', () => {
      const tool = new TestMCPTool({
        name: 'name-test-tool',
        description: 'Tool for name testing',
        version: '1.0.0',
        inputSchema: z.object({ input: z.string() }),
        outputSchema: z.object({ output: z.string() }),
      });

      MCPToolFactory.registerTool(tool);

      const names = MCPToolFactory.getToolNames();
      expect(names).toContain('name-test-tool');
    });

    it('should clear all tools', () => {
      const tool = new TestMCPTool({
        name: 'clear-test-tool',
        description: 'Tool for clear testing',
        version: '1.0.0',
        inputSchema: z.object({ input: z.string() }),
        outputSchema: z.object({ output: z.string() }),
      });

      MCPToolFactory.registerTool(tool);
      expect(MCPToolFactory.getAllTools()).toHaveLength(1);

      MCPToolFactory.clearTools();
      expect(MCPToolFactory.getAllTools()).toHaveLength(0);
    });
  });
});
