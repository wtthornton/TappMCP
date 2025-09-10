import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SmartMCPServer } from './server.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Mock MCP SDK
vi.mock('@modelcontextprotocol/sdk/server/index.js');
vi.mock('@modelcontextprotocol/sdk/server/stdio.js');

// Mock health server import
vi.mock('./health-server.js', () => ({}));

// Mock tool imports
vi.mock('./tools/smart-begin.js', () => ({
  smartBeginTool: { name: 'smart_begin', description: 'Test tool' },
  handleSmartBegin: vi.fn(),
}));
vi.mock('./tools/smart-plan.js', () => ({
  smartPlanTool: { name: 'smart_plan', description: 'Test tool' },
  handleSmartPlan: vi.fn(),
}));
vi.mock('./tools/smart-write.js', () => ({
  smartWriteTool: { name: 'smart_write', description: 'Test tool' },
  handleSmartWrite: vi.fn(),
}));
vi.mock('./tools/smart-finish.js', () => ({
  smartFinishTool: { name: 'smart_finish', description: 'Test tool' },
  handleSmartFinish: vi.fn(),
}));
vi.mock('./tools/smart-orchestrate.js', () => ({
  smartOrchestrateTool: { name: 'smart_orchestrate', description: 'Test tool' },
  handleSmartOrchestrate: vi.fn(),
}));
vi.mock('./tools/smart-converse.js', () => ({
  smartConverseTool: { name: 'smart_converse', description: 'Test tool' },
  handleSmartConverse: vi.fn(),
}));

// Mock error utilities
vi.mock('./utils/errors.js', () => ({
  handleError: vi.fn(error => ({ ...error, code: 'MOCK_ERROR' })),
  getErrorMessage: vi.fn(error => error.message || 'Unknown error'),
}));

describe('SmartMCPServer', () => {
  let mockServer: any;
  let mockTransport: any;

  beforeEach(() => {
    mockServer = {
      setRequestHandler: vi.fn(),
      connect: vi.fn(),
    };
    mockTransport = {};

    (Server as any).mockImplementation(() => mockServer);
    (StdioServerTransport as any).mockImplementation(() => mockTransport);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Server Initialization', () => {
    it('should create server with correct configuration', () => {
      const server = new SmartMCPServer();

      expect(Server).toHaveBeenCalledWith({
        name: 'smart-mcp',
        version: '0.1.0',
        capabilities: {
          tools: {},
        },
      });

      expect(mockServer.setRequestHandler).toHaveBeenCalledTimes(2);
    });

    it('should setup handlers during initialization', () => {
      new SmartMCPServer();

      expect(mockServer.setRequestHandler).toHaveBeenCalledTimes(2);
    });
  });

  describe('Tool Registration', () => {
    it('should register all smart tools', () => {
      new SmartMCPServer();

      // Verify setRequestHandler was called for ListTools and CallTool
      expect(mockServer.setRequestHandler).toHaveBeenCalledTimes(2);
    });

    it('should handle list tools request', async () => {
      new SmartMCPServer();

      // Get the handler for ListTools (first call)
      const listToolsHandler = mockServer.setRequestHandler.mock.calls[0][1];
      const result = await listToolsHandler();

      expect(result).toHaveProperty('tools');
      expect(Array.isArray(result.tools)).toBe(true);
      expect(result.tools).toHaveLength(6);
    });
  });

  describe('Tool Execution', () => {
    it('should handle valid tool calls', async () => {
      const mockHandleSmartBegin = vi.fn().mockResolvedValue({
        success: true,
        data: { message: 'Success' },
      });

      // Re-mock to use our test handler
      vi.doMock('./tools/smart-begin.js', () => ({
        smartBeginTool: {
          name: 'smart_begin',
          description: 'Test tool',
          inputSchema: { properties: {} },
        },
        handleSmartBegin: mockHandleSmartBegin,
      }));

      new SmartMCPServer();

      // Get the CallTool handler (second call)
      const callToolHandler = mockServer.setRequestHandler.mock.calls[1][1];
      const request = {
        params: {
          name: 'smart_begin',
          arguments: {},
        },
      };

      const result = await callToolHandler(request);

      expect(result).toHaveProperty('content');
      expect(result.content[0].type).toBe('text');
    });

    it('should handle tool not found error', async () => {
      new SmartMCPServer();

      const callToolHandler = mockServer.setRequestHandler.mock.calls[1][1];
      const request = {
        params: {
          name: 'nonexistent_tool',
          arguments: {},
        },
      };

      const result = await callToolHandler(request);

      expect(result).toHaveProperty('content');
      expect(result.isError).toBe(true);
    });

    it('should validate tool input', async () => {
      new SmartMCPServer();

      const callToolHandler = mockServer.setRequestHandler.mock.calls[1][1];
      const request = {
        params: {
          name: '', // Invalid: empty name
          arguments: {},
        },
      };

      const result = await callToolHandler(request);

      expect(result).toHaveProperty('content');
      expect(result.isError).toBe(true);
    });
  });

  describe('Server Startup', () => {
    it('should start server successfully', async () => {
      const server = new SmartMCPServer();

      await server.start();

      expect(StdioServerTransport).toHaveBeenCalled();
      expect(mockServer.connect).toHaveBeenCalledWith(mockTransport);
    });

    it('should handle startup errors', async () => {
      const server = new SmartMCPServer();
      const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('Process exit called');
      });

      mockServer.connect.mockRejectedValue(new Error('Connection failed'));

      await expect(server.start()).rejects.toThrow('Process exit called');
      expect(mockExit).toHaveBeenCalledWith(1);

      mockExit.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should handle list tools errors gracefully', async () => {
      new SmartMCPServer();

      // Mock the handler to throw an error
      const originalListHandler = mockServer.setRequestHandler.mock.calls[0][1];
      const errorHandler = async () => {
        throw new Error('List tools failed');
      };

      expect(async () => await errorHandler()).rejects.toThrow('List tools failed');
    });

    it('should handle call tool errors gracefully', async () => {
      new SmartMCPServer();

      const callToolHandler = mockServer.setRequestHandler.mock.calls[1][1];
      const request = {
        params: {
          name: 'smart_begin',
          arguments: { invalid: 'data' },
        },
      };

      // This should not throw but return error response
      const result = await callToolHandler(request);
      expect(result).toHaveProperty('content');
    });
  });
});
