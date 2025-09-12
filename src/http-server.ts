#!/usr/bin/env node

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { z } from 'zod';

// Import tool handlers
import { handleSmartBegin } from './tools/smart-begin.js';
import { handleSmartPlan } from './tools/smart-plan.js';
import { handleSmartWrite } from './tools/smart-write.js';
import { handleSmartFinish } from './tools/smart-finish.js';
import { handleSmartOrchestrate } from './tools/smart-orchestrate.js';
import { handleSmartConverse } from './tools/smart-converse.js';
import { handleSmartVibe } from './tools/smart-vibe.js';

const PORT = process.env.MCP_HTTP_PORT ?? 3000;

// Tool registry for HTTP endpoints
const TOOLS: Record<string, (input: unknown) => Promise<unknown>> = {
  smart_begin: handleSmartBegin,
  smart_plan: handleSmartPlan,
  smart_write: handleSmartWrite,
  smart_finish: handleSmartFinish,
  smart_orchestrate: handleSmartOrchestrate,
  smart_converse: handleSmartConverse as (input: unknown) => Promise<unknown>,
  smart_vibe: handleSmartVibe as (input: unknown) => Promise<unknown>,
};

// Input validation schema
const ToolInputSchema = z.object({
  name: z.string().min(1, 'Tool name is required'),
  arguments: z.record(z.unknown()).optional(),
});

// Helper function to parse JSON body
async function parseJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (_error) {
        reject(new Error('Invalid JSON'));
      }
    });
  });
}

// Helper function to send JSON response
function sendJsonResponse(res: ServerResponse, statusCode: number, data: unknown) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// Helper function to send error response
function sendErrorResponse(res: ServerResponse, statusCode: number, message: string) {
  sendJsonResponse(res, statusCode, {
    error: {
      code: statusCode,
      message,
    },
  });
}

// HTTP server for MCP tools
const httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    // Handle tools list endpoint
    if (req.method === 'GET' && req.url === '/tools') {
      const tools = Object.keys(TOOLS).map(name => ({
        name,
        description: `Tool: ${name}`,
        inputSchema: {},
      }));

      sendJsonResponse(res, 200, { tools });
      return;
    }

    // Handle POST requests to /tools (JSON-RPC)
    if (req.method === 'POST' && req.url === '/tools') {
      const body = await parseJsonBody(req);

      // Handle JSON-RPC tools/list request
      if ((body as any).jsonrpc === '2.0' && (body as any).method === 'tools/list') {
        const tools = Object.keys(TOOLS).map(name => ({
          name,
          description: `Tool: ${name}`,
          inputSchema: {},
        }));

        sendJsonResponse(res, 200, {
          jsonrpc: '2.0',
          id: (body as any).id,
          result: { tools },
        });
        return;
      }

      // Handle JSON-RPC format from smoke test
      if ((body as any).jsonrpc === '2.0' && (body as any).method === 'tools/call') {
        const { name, arguments: args } = (body as any).params;

        if (!TOOLS[name]) {
          sendErrorResponse(res, 404, `Tool '${name}' not found`);
          return;
        }

        try {
          const result = await TOOLS[name](args || {});

          sendJsonResponse(res, 200, {
            jsonrpc: '2.0',
            id: (body as any).id,
            result: {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result),
                },
              ],
            },
          });
        } catch (error) {
          console.error(`Error executing tool ${name}:`, error);
          sendJsonResponse(res, 200, {
            jsonrpc: '2.0',
            id: (body as any).id,
            error: {
              code: -32603,
              message: `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          });
        }
        return;
      }

      // Handle simple format
      const input = ToolInputSchema.parse(body);

      if (!TOOLS[input.name]) {
        sendErrorResponse(res, 404, `Tool '${input.name}' not found`);
        return;
      }

      try {
        const result = await TOOLS[input.name](input.arguments || {});

        sendJsonResponse(res, 200, {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result),
            },
          ],
        });
      } catch (error) {
        console.error(`Error executing tool ${input.name}:`, error);
        sendErrorResponse(
          res,
          500,
          `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
      return;
    }

    // Handle individual tool endpoints
    if (req.method === 'POST' && req.url?.startsWith('/tools/')) {
      const toolName = req.url.replace('/tools/', '');

      if (!TOOLS[toolName]) {
        sendErrorResponse(res, 404, `Tool '${toolName}' not found`);
        return;
      }

      const body = await parseJsonBody(req);

      try {
        const result = await TOOLS[toolName](body);

        sendJsonResponse(res, 200, {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                data: result,
                timestamp: new Date().toISOString(),
              }),
            },
          ],
        });
      } catch (error) {
        console.error(`Error executing tool ${toolName}:`, error);
        sendErrorResponse(
          res,
          500,
          `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
      return;
    }

    // 404 for other endpoints
    sendErrorResponse(res, 404, 'Endpoint not found');
  } catch (error) {
    console.error('HTTP server error:', error);
    sendErrorResponse(res, 500, 'Internal server error');
  }
});

// Start HTTP server only if not in test environment
if (process.env.NODE_ENV !== 'test' && process.env.VITEST !== 'true') {
  httpServer.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 MCP HTTP server running on port ${PORT}`);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
  });
});

export { httpServer };
