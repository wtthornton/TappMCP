#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Import health server for Docker health checks
import './health-server.js';

// Import tool handlers
import { smartBeginTool, handleSmartBegin } from './tools/smart-begin.js';
import { smartPlanTool, handleSmartPlan } from './tools/smart-plan.js';
import { smartWriteTool, handleSmartWrite } from './tools/smart-write.js';
import { smartFinishTool, handleSmartFinish } from './tools/smart-finish.js';
import { smartOrchestrateTool, handleSmartOrchestrate } from './tools/smart-orchestrate.js';

// Server configuration
const SERVER_NAME = 'smart-mcp';
const SERVER_VERSION = '0.1.0';

// Tool registry
const TOOLS: Record<string, { tool: Tool; handler: (input: unknown) => Promise<unknown> }> = {
  smart_begin: { tool: smartBeginTool, handler: handleSmartBegin },
  smart_plan: { tool: smartPlanTool, handler: handleSmartPlan },
  smart_write: { tool: smartWriteTool, handler: handleSmartWrite },
  smart_finish: { tool: smartFinishTool, handler: handleSmartFinish },
  smart_orchestrate: { tool: smartOrchestrateTool, handler: handleSmartOrchestrate },
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
        throw new Error(
          `Failed to list tools: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    });

    // Call tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async request => {
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

        // Validate tool arguments against schema
        if (tool.inputSchema) {
          try {
            const schema = z.object(tool.inputSchema.properties as Record<string, z.ZodTypeAny>);
            schema.parse(args);
          } catch (validationError) {
            throw new Error(
              `Invalid arguments for tool '${name}': ${validationError instanceof Error ? validationError.message : 'Validation failed'}`
            );
          }
        }

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
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: false,
                  error: errorMessage,
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

      // eslint-disable-next-line no-console
      console.error(`${SERVER_NAME} v${SERVER_VERSION} started successfully`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to start ${SERVER_NAME}:`, error);
      process.exit(1);
    }
  }
}

// Start server if this file is run directly
if (require.main === module) {
  const server = new SmartMCPServer();
  server.start().catch(error => {
    // eslint-disable-next-line no-console
    console.error('Server startup failed:', error);
    process.exit(1);
  });
}

export { SmartMCPServer };
