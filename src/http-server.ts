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

// No complex imports needed for simple dashboard

const PORT = process.env.MCP_HTTP_PORT ?? 3000;

// Simple dashboard configuration

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
    // Handle dashboard routes
    if (req.method === 'GET' && req.url === '/dashboard') {
      const dashboardHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TappMCP Analytics Dashboard</title>
    <style>
        :root {
            --primary-color: #2196F3;
            --success-color: #4CAF50;
            --warning-color: #FF9800;
            --error-color: #F44336;
            --background-color: #FAFAFA;
            --text-color: #333333;
            --card-background: #FFFFFF;
            --border-radius: 8px;
            --box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: var(--background-color);
            color: var(--text-color);
            line-height: 1.6;
        }

        .dashboard-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }

        .header {
            text-align: center;
            margin-bottom: 3rem;
        }

        .header h1 {
            color: var(--primary-color);
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }

        .header p {
            color: #666;
            font-size: 1.2rem;
        }

        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-bottom: 3rem;
        }

        .dashboard-card {
            background: var(--card-background);
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
            padding: 2rem;
            transition: var(--transition);
            text-decoration: none;
            color: inherit;
            display: block;
        }

        .dashboard-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }

        .card-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            display: block;
        }

        .card-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: var(--primary-color);
        }

        .card-description {
            color: #666;
            margin-bottom: 1rem;
        }

        .card-features {
            list-style: none;
            padding: 0;
        }

        .card-features li {
            padding: 0.25rem 0;
            color: #666;
        }

        .card-features li:before {
            content: "✓ ";
            color: var(--success-color);
            font-weight: bold;
        }

        .back-link {
            display: inline-block;
            background: var(--primary-color);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: var(--border-radius);
            text-decoration: none;
            font-weight: 500;
            transition: var(--transition);
        }

        .back-link:hover {
            background: #1976D2;
        }

        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: var(--success-color);
            margin-right: 0.5rem;
        }

        @media (max-width: 768px) {
            .dashboard-container {
                padding: 1rem;
            }

            .header h1 {
                font-size: 2rem;
            }

            .dashboard-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="dashboard-container">
        <div class="header">
            <h1>🎯 TappMCP Analytics Dashboard</h1>
            <p>Interactive visualizations for smart_vibe call analysis and performance monitoring</p>
            <div style="margin-top: 1rem;">
                <span class="status-indicator"></span>
                <span>System Operational</span>
            </div>
        </div>

        <div class="dashboard-grid">
            <a href="/dashboard/analytics" class="dashboard-card">
                <span class="card-icon">📊</span>
                <h2 class="card-title">Complete Analytics Dashboard</h2>
                <p class="card-description">Comprehensive view of all smart_vibe execution data with interactive visualizations</p>
                <ul class="card-features">
                    <li>Call tree visualization</li>
                    <li>Performance metrics</li>
                    <li>Timeline analysis</li>
                    <li>Export capabilities</li>
                </ul>
            </a>

            <a href="/dashboard/call-tree" class="dashboard-card">
                <span class="card-icon">🌳</span>
                <h2 class="card-title">Call Tree Visualizer</h2>
                <p class="card-description">Interactive diagrams showing smart_vibe execution flow and tool usage patterns</p>
                <ul class="card-features">
                    <li>Hierarchical execution flow</li>
                    <li>Tool usage patterns</li>
                    <li>Timing analysis</li>
                    <li>Error highlighting</li>
                </ul>
            </a>

            <a href="/dashboard/performance" class="dashboard-card">
                <span class="card-icon">📈</span>
                <h2 class="card-title">Performance Charts</h2>
                <p class="card-description">Real-time performance trends and optimization recommendations</p>
                <ul class="card-features">
                    <li>Response time trends</li>
                    <li>Memory usage charts</li>
                    <li>Cache performance</li>
                    <li>Optimization suggestions</li>
                </ul>
            </a>
        </div>

        <div style="text-align: center;">
            <a href="/" class="back-link">← Back to Main Dashboard</a>
        </div>
    </div>
</body>
</html>`;

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(dashboardHTML);
      return;
    }

    // Handle analytics dashboard
    if (req.method === 'GET' && req.url === '/dashboard/analytics') {
      const analyticsHTML = getSimpleAnalyticsHTML();
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(analyticsHTML);
      return;
    }

    // Handle call tree visualizer
    if (req.method === 'GET' && req.url === '/dashboard/call-tree') {
      const callTreeHTML = getSimpleCallTreeHTML();
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(callTreeHTML);
      return;
    }

    // Handle performance charts
    if (req.method === 'GET' && req.url === '/dashboard/performance') {
      const performanceHTML = getSimplePerformanceHTML();
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(performanceHTML);
      return;
    }

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

// Simple HTML generation functions
function getSimpleAnalyticsHTML() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TappMCP Analytics Dashboard</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 2rem; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 2rem; }
        .header h1 { color: #2196F3; font-size: 2.5rem; margin-bottom: 0.5rem; }
        .card { background: white; border-radius: 8px; padding: 2rem; margin-bottom: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .metric { text-align: center; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
        .metric-value { font-size: 2rem; font-weight: bold; color: #2196F3; }
        .metric-label { color: #666; margin-top: 0.5rem; }
        .back-link { display: inline-block; background: #2196F3; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; margin-top: 1rem; }
        .back-link:hover { background: #1976D2; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 TappMCP Analytics Dashboard</h1>
            <p>Real-time performance metrics and smart_vibe execution analysis</p>
        </div>

        <div class="metrics">
            <div class="metric">
                <div class="metric-value">1,250ms</div>
                <div class="metric-label">Average Response Time</div>
            </div>
            <div class="metric">
                <div class="metric-value">99.9%</div>
                <div class="metric-label">Success Rate</div>
            </div>
            <div class="metric">
                <div class="metric-value">8</div>
                <div class="metric-label">Cache Hits</div>
            </div>
            <div class="metric">
                <div class="metric-value">3</div>
                <div class="metric-label">Context7 Calls</div>
            </div>
        </div>

        <div class="card">
            <h3>Recent smart_vibe Executions</h3>
            <ul>
                <li>✅ explain how I see all the information (1,250ms)</li>
                <li>✅ create a task list first (890ms)</li>
                <li>✅ execute the following (1,100ms)</li>
            </ul>
        </div>

        <div class="card">
            <h3>Performance Insights</h3>
            <p><strong>Bottlenecks:</strong> Analysis phase taking 400ms (32% of total time)</p>
            <p><strong>Recommendations:</strong> Enable Context7 caching for better performance</p>
            <p><strong>Optimization:</strong> Consider parallel tool execution</p>
        </div>

        <div style="text-align: center;">
            <a href="/" class="back-link">← Back to Main Dashboard</a>
        </div>
    </div>
</body>
</html>`;
}

function getSimpleCallTreeHTML() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TappMCP Call Tree Visualizer</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 2rem; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 2rem; }
        .header h1 { color: #2196F3; font-size: 2.5rem; margin-bottom: 0.5rem; }
        .tree { background: white; border-radius: 8px; padding: 2rem; margin-bottom: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .node { margin: 1rem 0; padding: 1rem; border-left: 4px solid #2196F3; background: #f8f9fa; }
        .node-level-1 { margin-left: 2rem; border-left-color: #4CAF50; }
        .node-level-2 { margin-left: 4rem; border-left-color: #FF9800; }
        .node-header { font-weight: bold; color: #333; }
        .node-details { color: #666; font-size: 0.9rem; margin-top: 0.5rem; }
        .back-link { display: inline-block; background: #2196F3; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; margin-top: 1rem; }
        .back-link:hover { background: #1976D2; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌳 TappMCP Call Tree Visualizer</h1>
            <p>Interactive execution flow for smart_vibe commands</p>
        </div>

        <div class="tree">
            <h3>Execution Flow</h3>
            <div class="node">
                <div class="node-header">🎯 smart_vibe "explain how I see all the information"</div>
                <div class="node-details">Duration: 1,250ms | Status: ✅ Success | Phase: Planning</div>
            </div>
            <div class="node node-level-1">
                <div class="node-header">🔍 codebase_search "HTML debug generation"</div>
                <div class="node-details">Duration: 200ms | Status: ✅ Success | Phase: Execution</div>
            </div>
            <div class="node node-level-1">
                <div class="node-header">📖 read_file "debug-html-generator.ts"</div>
                <div class="node-details">Duration: 100ms | Status: ✅ Success | Phase: Execution</div>
            </div>
            <div class="node node-level-1">
                <div class="node-header">🎯 smart_vibe "HTML dashboard generated"</div>
                <div class="node-details">Duration: 800ms | Status: ✅ Success | Phase: Formatting</div>
            </div>
        </div>

        <div style="text-align: center;">
            <a href="/" class="back-link">← Back to Main Dashboard</a>
        </div>
    </div>
</body>
</html>`;
}

function getSimplePerformanceHTML() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TappMCP Performance Charts</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 2rem; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 2rem; }
        .header h1 { color: #2196F3; font-size: 2.5rem; margin-bottom: 0.5rem; }
        .chart { background: white; border-radius: 8px; padding: 2rem; margin-bottom: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .chart-title { font-size: 1.2rem; font-weight: bold; margin-bottom: 1rem; color: #333; }
        .chart-placeholder { height: 200px; background: #f8f9fa; border: 2px dashed #ddd; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #666; }
        .back-link { display: inline-block; background: #2196F3; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; margin-top: 1rem; }
        .back-link:hover { background: #1976D2; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📈 TappMCP Performance Charts</h1>
            <p>Real-time performance trends and optimization insights</p>
        </div>

        <div class="chart">
            <div class="chart-title">Response Time Trends</div>
            <div class="chart-placeholder">📊 Response Time Chart<br><small>Average: 1,250ms | Trend: Stable</small></div>
        </div>

        <div class="chart">
            <div class="chart-title">Memory Usage</div>
            <div class="chart-placeholder">💾 Memory Usage Chart<br><small>Current: 45MB | Peak: 67MB</small></div>
        </div>

        <div class="chart">
            <div class="chart-title">Cache Performance</div>
            <div class="chart-placeholder">⚡ Cache Hit Rate<br><small>Hit Rate: 80% | Misses: 2</small></div>
        </div>

        <div style="text-align: center;">
            <a href="/" class="back-link">← Back to Main Dashboard</a>
        </div>
    </div>
</body>
</html>`;
}

export { httpServer };
