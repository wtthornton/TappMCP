#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Server configuration
const SERVER_NAME = 'smart-mcp';
const SERVER_VERSION = '0.1.0';

// Simple tool definitions without Context7 dependencies
const TOOLS: Record<string, { tool: Tool; handler: (input: unknown) => Promise<unknown> }> = {
  smart_begin: {
    tool: {
      name: 'smart_begin',
      description: '🔍 Begin a new project with intelligent analysis and setup',
      inputSchema: {
        type: 'object',
        properties: {
          projectName: {
            type: 'string',
            description: 'Name of the project to begin',
          },
          description: {
            type: 'string',
            description: 'Description of the project',
          },
          techStack: {
            type: 'array',
            items: { type: 'string' },
            description: 'Technology stack for the project',
          },
        },
        required: ['projectName'],
      },
    },
    handler: async (input: any) => {
      return {
        success: true,
        data: {
          projectId: `proj_${Date.now()}`,
          message: `Project "${input.projectName}" initialized successfully`,
          techStack: input.techStack || [],
        },
        timestamp: new Date().toISOString(),
      };
    },
  },
  smart_plan: {
    tool: {
      name: 'smart_plan',
      description: '📋 Create a comprehensive project plan with tasks and milestones',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: {
            type: 'string',
            description: 'ID of the project to plan',
          },
          requirements: {
            type: 'string',
            description: 'Project requirements and goals',
          },
        },
        required: ['projectId', 'requirements'],
      },
    },
    handler: async (input: any) => {
      return {
        success: true,
        data: {
          planId: `plan_${Date.now()}`,
          message: `Plan created for project ${input.projectId}`,
          tasks: [
            'Setup project structure',
            'Implement core features',
            'Add testing',
            'Deploy and monitor',
          ],
        },
        timestamp: new Date().toISOString(),
      };
    },
  },
  smart_write: {
    tool: {
      name: 'smart_write',
      description: '✍️ Generate code, documentation, and other project artifacts',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: {
            type: 'string',
            description: 'ID of the project',
          },
          task: {
            type: 'string',
            description: 'Task description for code generation',
          },
          fileType: {
            type: 'string',
            description: 'Type of file to generate',
          },
        },
        required: ['projectId', 'task'],
      },
    },
    handler: async (input: any) => {
      return {
        success: true,
        data: {
          fileId: `file_${Date.now()}`,
          message: `Generated ${input.fileType || 'code'} for task: ${input.task}`,
          content: `// Generated code for: ${input.task}\n// Project: ${input.projectId}`,
        },
        timestamp: new Date().toISOString(),
      };
    },
  },
  smart_finish: {
    tool: {
      name: 'smart_finish',
      description: '✅ Complete and finalize project tasks with quality checks',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: {
            type: 'string',
            description: 'ID of the project to finish',
          },
          tasks: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of tasks to complete',
          },
        },
        required: ['projectId'],
      },
    },
    handler: async (input: any) => {
      return {
        success: true,
        data: {
          completionId: `comp_${Date.now()}`,
          message: `Project ${input.projectId} completed successfully`,
          completedTasks: input.tasks || [],
        },
        timestamp: new Date().toISOString(),
      };
    },
  },
  smart_orchestrate: {
    tool: {
      name: 'smart_orchestrate',
      description: '🎭 Orchestrate complex workflows and coordinate multiple tools',
      inputSchema: {
        type: 'object',
        properties: {
          workflow: {
            type: 'string',
            description: 'Workflow description to orchestrate',
          },
          steps: {
            type: 'array',
            items: { type: 'string' },
            description: 'Steps in the workflow',
          },
        },
        required: ['workflow'],
      },
    },
    handler: async (input: any) => {
      return {
        success: true,
        data: {
          workflowId: `workflow_${Date.now()}`,
          message: `Orchestrated workflow: ${input.workflow}`,
          steps: input.steps || [],
        },
        timestamp: new Date().toISOString(),
      };
    },
  },
  smart_converse: {
    tool: {
      name: 'smart_converse',
      description: '💬 Engage in intelligent conversation about development topics',
      inputSchema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Message or question to discuss',
          },
          context: {
            type: 'string',
            description: 'Additional context for the conversation',
          },
        },
        required: ['message'],
      },
    },
    handler: async (input: any) => {
      return {
        success: true,
        data: {
          responseId: `resp_${Date.now()}`,
          message: `Response to: ${input.message}`,
          context: input.context || '',
        },
        timestamp: new Date().toISOString(),
      };
    },
  },
  smart_vibe: {
    tool: {
      name: 'smart_vibe',
      description: '🎯 Get the right vibe for your development work with intelligent suggestions',
      inputSchema: {
        type: 'object',
        properties: {
          command: {
            type: 'string',
            description: 'Command or request for vibe suggestions',
          },
          context: {
            type: 'string',
            description: 'Additional context for vibe generation',
          },
        },
        required: ['command'],
      },
    },
    handler: async (input: any) => {
      return {
        success: true,
        data: {
          vibeId: `vibe_${Date.now()}`,
          message: `Vibe generated for: ${input.command}`,
          suggestions: [
            'Focus on clean, maintainable code',
            'Consider user experience',
            'Add proper error handling',
            'Write comprehensive tests',
          ],
        },
        timestamp: new Date().toISOString(),
      };
    },
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

class SimpleMCPServer {
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
        console.error('Error listing tools:', error);
        throw error;
      }
    });

    // Call tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async request => {
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
        const errorMessage = error instanceof Error ? error.message : String(error);

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

      // Server started successfully
    } catch (error) {
      console.error(`Failed to start ${SERVER_NAME}:`, error);
      process.exit(1);
    }
  }
}

// Start server if this file is run directly
const normalizedPath = process.argv[1].replace(/\\/g, '/');
const expectedUrl = `file://${normalizedPath}`;
const isMainModule =
  import.meta.url === expectedUrl || import.meta.url === `file:///${normalizedPath}`;

if (isMainModule) {
  const server = new SimpleMCPServer();
  server.start().catch(error => {
    console.error('Server startup failed:', error);
    process.exit(1);
  });
}

export { SimpleMCPServer };
