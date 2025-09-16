#!/usr/bin/env node

/**
 * MCP Docker Server - Hybrid approach for Docker deployment
 *
 * This server runs both:
 * 1. HTTP API server for dashboard and health checks
 * 2. MCP stdio server that can be spawned by Cursor
 *
 * The key insight: MCP servers should be spawned by Cursor, not run as containers
 * But we still need HTTP services for dashboard and monitoring
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import express from 'express';
import { createServer } from 'http';
import { spawn } from 'child_process';

// Import tool handlers
import { smartBeginTool, handleSmartBegin } from './tools/smart-begin.js';
import { smartPlanTool, handleSmartPlan } from './tools/smart-plan.js';
import { smartWriteTool, handleSmartWrite } from './tools/smart-write.js';
import { smartFinishTool, handleSmartFinish } from './tools/smart-finish.js';
import { smartOrchestrateTool, handleSmartOrchestrate } from './tools/smart-orchestrate.js';
import { smartConverseTool, handleSmartConverse } from './tools/smart-converse.js';
import { smartVibeTool, handleSmartVibe } from './tools/smart-vibe.js';

// Server configuration
const SERVER_NAME = 'tappmcp-docker';
const SERVER_VERSION = '0.1.0';
const HTTP_PORT = process.env.PORT || 3000;
const HEALTH_PORT = process.env.HEALTH_PORT || 3001;

// Tool registry with visual indicators
const TOOLS = {
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
    handler: handleSmartConverse,
  },
  smart_vibe: {
    tool: { ...smartVibeTool, description: `🎯 ${smartVibeTool.description}` },
    handler: handleSmartVibe,
  },
};

class MCPDockerServer {
  private mcpServer: Server;
  private httpApp: express.Application;
  private healthApp: express.Application;
  private httpServer: any;
  private healthServer: any;

  constructor() {
    this.mcpServer = new Server({
      name: SERVER_NAME,
      version: SERVER_VERSION,
      capabilities: {
        tools: {},
      },
    });

    this.httpApp = express();
    this.healthApp = express();

    this.setupMCPHandlers();
    this.setupHTTPRoutes();
    this.setupHealthRoutes();
  }

  private setupMCPHandlers() {
    // List tools handler
    this.mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: Object.values(TOOLS).map(({ tool }) => tool),
      };
    });

    // Call tool handler
    this.mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      const toolConfig = TOOLS[name as keyof typeof TOOLS];

      if (!toolConfig) {
        throw new Error(`Unknown tool: ${name}`);
      }

      try {
        const result = await toolConfig.handler(args);
        return {
          content: [
            {
              type: 'text',
              text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private setupHTTPRoutes() {
    this.httpApp.use(express.json());

    // CORS middleware
    this.httpApp.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    // Health check endpoint
    this.httpApp.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        server: SERVER_NAME,
        version: SERVER_VERSION,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // Context7 toggle endpoint
    this.httpApp.post('/api/context7/toggle', (req, res) => {
      const { enabled } = req.body;

      // Update environment variable
      process.env.CONTEXT7_ENABLED = enabled.toString();

      console.log(`Context7 ${enabled ? 'enabled' : 'disabled'} via API`);

      res.json({
        success: true,
        enabled,
        message: `Context7 ${enabled ? 'enabled' : 'disabled'} successfully`,
      });
    });

    // Tools endpoint for direct tool calls
    this.httpApp.post('/tools/:toolName', async (req, res) => {
      try {
        const { toolName } = req.params;
        const args = req.body;

        const toolConfig = TOOLS[toolName as keyof typeof TOOLS];
        if (!toolConfig) {
          return res.status(404).json({ error: `Unknown tool: ${toolName}` });
        }

        const result = await toolConfig.handler(args);
        res.json(result);
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });

    // JSON-RPC endpoint for MCP-style requests
    this.httpApp.post('/tools', async (req, res) => {
      try {
        const { method, params } = req.body;

        if (method === 'tools/list') {
          res.json({
            tools: Object.values(TOOLS).map(({ tool }) => tool),
          });
        } else if (method === 'tools/call') {
          const { name, arguments: args } = params;
          const toolConfig = TOOLS[name as keyof typeof TOOLS];

          if (!toolConfig) {
            return res.status(404).json({ error: `Unknown tool: ${name}` });
          }

          const result = await toolConfig.handler(args);
          res.json({
            content: [
              {
                type: 'text',
                text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
              },
            ],
          });
        } else {
          res.status(400).json({ error: `Unknown method: ${method}` });
        }
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });

    // Serve dashboard files
    this.httpApp.use(express.static('public'));
    this.httpApp.use('/dashboard', express.static('dashboard-v2'));

    // Catch-all for SPA routing - use a more specific pattern
    this.httpApp.get('/*', (req, res) => {
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
      }
      res.sendFile('index.html', { root: 'public' });
    });
  }

  private setupHealthRoutes() {
    this.healthApp.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        server: `${SERVER_NAME}-health`,
        version: SERVER_VERSION,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });
  }

  async start() {
    console.log('🚀 Starting TappMCP Docker Server...');

    // Start HTTP server
    this.httpServer = createServer(this.httpApp);
    this.httpServer.listen(HTTP_PORT, () => {
      console.log(`📡 HTTP server listening on port ${HTTP_PORT}`);
    });

    // Start health server
    this.healthServer = createServer(this.healthApp);
    this.healthServer.listen(HEALTH_PORT, () => {
      console.log(`🏥 Health server listening on port ${HEALTH_PORT}`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }

  async shutdown() {
    console.log('🛑 Shutting down TappMCP Docker Server...');

    if (this.httpServer) {
      this.httpServer.close();
    }

    if (this.healthServer) {
      this.healthServer.close();
    }

    process.exit(0);
  }

  // Method to spawn MCP stdio server for Cursor
  static spawnMCPStdioServer() {
    const serverPath = new URL(import.meta.url).pathname;

    return spawn('node', [serverPath, '--stdio'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        MCP_STDIO_MODE: 'true',
      },
    });
  }
}

// Main execution
async function main() {
  const server = new MCPDockerServer();

  // Check if we should run in stdio mode (for Cursor)
  if (process.env.MCP_STDIO_MODE === 'true' || process.argv.includes('--stdio')) {
    console.log('🔌 Starting MCP stdio server for Cursor...');

    const transport = new StdioServerTransport();
    await server['mcpServer'].connect(transport);

    console.log('✅ MCP stdio server ready for Cursor');
  } else {
    // Run as Docker container with HTTP services
    await server.start();
    console.log('✅ TappMCP Docker Server started successfully');
  }
}

// Handle unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
