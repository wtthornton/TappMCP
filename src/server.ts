#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { handleError, getErrorMessage } from './utils/errors.js';

// Import health server for Docker health checks (skip for tests and when explicitly disabled)
if (
  process.env.NODE_ENV !== 'test' &&
  process.env.VITEST !== 'true' &&
  process.env.SKIP_HEALTH_SERVER !== 'true'
) {
  import('./health-server.js');
  import('./http-server.js');
}

// Import tool handlers
import { smartBeginTool, handleSmartBegin } from './tools/smart-begin.js';
import { smartPlanTool, handleSmartPlan } from './tools/smart-plan.js';
import { smartWriteTool, handleSmartWrite } from './tools/smart-write.js';
import { smartFinishTool, handleSmartFinish } from './tools/smart-finish.js';
import { smartOrchestrateTool, handleSmartOrchestrate } from './tools/smart-orchestrate.js';
import { smartConverseTool, handleSmartConverse } from './tools/smart-converse.js';
import { smartVibeTool, handleSmartVibe } from './tools/smart-vibe.js';

// Server configuration
const SERVER_NAME = 'smart-mcp';
const SERVER_VERSION = '0.1.0';

// Tool registry with visual indicators
const TOOLS: Record<string, { tool: Tool; handler: (input: unknown) => Promise<unknown> }> = {
  smart_begin: {
    tool: { ...smartBeginTool, description: `🔍 ${smartBeginTool.description}` },
    handler: handleSmartBegin,
  },
  smart_plan: {
    tool: { ...smartPlanTool, description: `📋 ${smartPlanTool.description}` },
    handler: handleSmartPlan,
  },
  smart_write: {
    tool: { ...smartWriteTool, description: `✍️ ${smartWriteTool.description}` },
    handler: handleSmartWrite,
  },
  smart_finish: {
    tool: { ...smartFinishTool, description: `✅ ${smartFinishTool.description}` },
    handler: handleSmartFinish,
  },
  smart_orchestrate: {
    tool: { ...smartOrchestrateTool, description: `🎭 ${smartOrchestrateTool.description}` },
    handler: handleSmartOrchestrate,
  },
  smart_converse: {
    tool: { ...smartConverseTool, description: `💬 ${smartConverseTool.description}` },
    handler: handleSmartConverse as (input: unknown) => Promise<unknown>,
  },
  smart_vibe: {
    tool: smartVibeTool, // Already has visual indicator
    handler: handleSmartVibe as (input: unknown) => Promise<unknown>,
  },
};

// Input validation schema
const ToolInputSchema = z.object({
  name: z.string().min(1, 'Tool name is required'),
  arguments: z.record(z.any()).optional().default({}),
});

// Response schema
const ToolResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  timestamp: z.string(),
});

class SmartMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server({
      name: SERVER_NAME,
      version: SERVER_VERSION,
      capabilities: {
        tools: {},
      },
    });

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      try {
        const tools = Object.values(TOOLS).map(({ tool }) => tool);

        return {
          tools,
        };
      } catch (error) {
        const mcpError = handleError(error, { operation: 'list_tools' });
        throw mcpError;
      }
    });

    // Call tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async request => {
      // Extract name for error handling
      const toolName = request.params.name || 'unknown';

      try {
        // Validate input
        const validatedInput = ToolInputSchema.parse({
          name: request.params.name,
          arguments: request.params.arguments,
        });

        const { name, arguments: args } = validatedInput;

        // Check if tool exists
        if (!TOOLS[name]) {
          throw new Error(
            `Tool '${name}' not found. Available tools: ${Object.keys(TOOLS).join(', ')}`
          );
        }

        // Get tool and handler
        const { tool, handler } = TOOLS[name];

        // Note: MCP SDK handles input validation automatically based on inputSchema

        // Execute tool handler
        const result = (await handler(args)) as {
          success?: boolean;
          data?: unknown;
          error?: string;
          timestamp?: string;
        };

        // Validate response
        const validatedResponse = ToolResponseSchema.parse({
          success: result.success ?? true,
          data: result.data ?? result,
          error: result.error,
          timestamp: result.timestamp ?? new Date().toISOString(),
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(validatedResponse, null, 2),
            },
          ],
        };
      } catch (error) {
        const mcpError = handleError(error, { operation: 'call_tool', toolName });
        const errorMessage = getErrorMessage(mcpError);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: false,
                  error: errorMessage,
                  code: mcpError.code,
                  timestamp: new Date().toISOString(),
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }
    });
  }

  async start(): Promise<void> {
    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);

      // Server started successfully - don't log to stdout in MCP mode
      // console.log(`MCP Server ${SERVER_NAME} started successfully`);
    } catch (error) {
      const mcpError = handleError(error, { operation: 'start_server' });
      // eslint-disable-next-line no-console
      console.error(`Failed to start ${SERVER_NAME}:`, mcpError.message);
      process.exit(1);
    }
  }
}

// Start server if this file is run directly
const normalizedPath = process.argv[1].replace(/\\/g, '/');
const expectedUrl = `file://${normalizedPath}`;
// Handle Windows path format with three slashes
const isMainModule =
  import.meta.url === expectedUrl || import.meta.url === `file:///${normalizedPath}`;

// Debug info removed for production

if (isMainModule) {
  // Disable console.log in MCP stdio mode to prevent interference with JSON-RPC protocol
  const originalConsoleLog = console.log;
  console.log = () => {}; // Disable console.log

  // Keep console.error for important messages
  console.error('🚀 Starting MCP Server...');

  const server = new SmartMCPServer();
  server.start().catch(error => {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  });
} else {
  console.error('❌ Server not started - condition not met');
}

export { SmartMCPServer };
