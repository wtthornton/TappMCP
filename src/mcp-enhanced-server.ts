#!/usr/bin/env node

/**
 * Enhanced MCP Server with Response Caching and Performance Monitoring
 * Implements Task 2.4.1 (Response Caching) and Task 2.4.4 (Performance Monitoring)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import express from 'express';
import { createServer } from 'http';
import { performance } from 'perf_hooks';

// Import caching and monitoring
import { ResponseCacheLRU, createResponseCacheLRU, cacheMiddlewareLRU, defaultCacheConfigLRU } from './core/response-cache-lru.js';
import { PerformanceMonitor, createPerformanceMonitor, performanceMiddleware } from './monitoring/performance-monitor.js';

// Import tool handlers
import { smartBeginTool, handleSmartBegin } from './tools/smart-begin.js';
import { smartPlanTool, handleSmartPlan } from './tools/smart-plan.js';
import { smartWriteTool, handleSmartWrite } from './tools/smart-write.js';
import { smartFinishTool, handleSmartFinish } from './tools/smart-finish.js';
import { smartOrchestrateTool, handleSmartOrchestrate } from './tools/smart-orchestrate.js';
import { smartConverseTool, handleSmartConverse } from './tools/smart-converse.js';
import { smartVibeTool, handleSmartVibe } from './tools/smart-vibe.js';

// Server configuration
const SERVER_NAME = 'tappmcp-enhanced';
const SERVER_VERSION = '2.0.0';
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

class EnhancedMCPServer {
  public mcpServer: Server;
  private httpApp: express.Application;
  private healthApp: express.Application;
  private httpServer: any;
  private healthServer: any;
  private responseCache: ResponseCacheLRU;
  private performanceMonitor: PerformanceMonitor;
  private isInitialized: boolean = false;

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

    // Initialize caching and monitoring
    this.responseCache = new ResponseCacheLRU(defaultCacheConfigLRU);
    this.performanceMonitor = createPerformanceMonitor({
      collectionInterval: 5000,
      alertThresholds: {
        responseTime: 1000,
        errorRate: 0.05,
        memoryUsage: 0.8,
        cpuUsage: 0.8
      }
    });

    this.setupMCPHandlers();
    this.setupHTTPRoutes();
    this.setupHealthRoutes();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize LRU cache
      console.log('✅ ResponseCacheLRU ready');
      console.log('✅ Response cache initialized');

      // Start performance monitoring
      this.performanceMonitor.start();
      console.log('✅ Performance monitoring started');

      this.isInitialized = true;
      console.log('🚀 Enhanced MCP Server initialized');
    } catch (error) {
      console.error('❌ Failed to initialize enhanced server:', error);
      throw error;
    }
  }

  private setupMCPHandlers() {
    // List tools handler
    this.mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
      const startTime = performance.now();

      try {
        const result = {
          tools: Object.values(TOOLS).map(({ tool }) => tool),
        };

        // Record performance
        this.performanceMonitor.recordRequest('list_tools', performance.now() - startTime, true);

        return result;
      } catch (error) {
        this.performanceMonitor.recordRequest('list_tools', performance.now() - startTime, false);
        throw error;
      }
    });

    // Call tool handler with caching
    this.mcpServer.setRequestHandler(CallToolRequestSchema, async request => {
      const startTime = performance.now();
      const { name, arguments: args } = request.params;
      const toolConfig = TOOLS[name as keyof typeof TOOLS];

      if (!toolConfig) {
        this.performanceMonitor.recordRequest('unknown_tool', performance.now() - startTime, false);
        throw new Error(`Unknown tool: ${name}`);
      }

      try {
        // Generate cache key based on tool name and arguments
        const cacheKey = this.generateCacheKey(name, args);

        // Try to get from cache first
        const cachedResult = await this.responseCache.get(cacheKey, 'mcp_tools');

        if (cachedResult) {
          console.log(`🎯 Cache hit for ${name}`);
          this.performanceMonitor.recordRequest(`tool_${name}`, performance.now() - startTime, true, {
            cached: 'true',
            tool: name
          });

          return cachedResult;
        }

        // Execute tool if not cached
        console.log(`⚡ Executing ${name} (cache miss)`);
        const result = await toolConfig.handler(args);

        const response = {
          content: [
            {
              type: 'text',
              text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
            },
          ],
        };

        // Cache the result with appropriate TTL
        const ttl = this.getCacheTTL(name);
        const tags = this.getCacheTags(name, args);

        await this.responseCache.set(cacheKey, response, ttl, 'mcp_tools', tags);

        // Record performance
        this.performanceMonitor.recordRequest(`tool_${name}`, performance.now() - startTime, true, {
          cached: 'false',
          tool: name
        });

        return response;
      } catch (error) {
        this.performanceMonitor.recordRequest(`tool_${name}`, performance.now() - startTime, false, {
          tool: name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });

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
      res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
      );
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    // Performance monitoring middleware
    this.httpApp.use(performanceMiddleware(this.performanceMonitor));

    // Cache middleware for API routes
    this.httpApp.use('/api', cacheMiddlewareLRU(this.responseCache, {
      ttl: 300, // 5 minutes for API responses
      namespace: 'api'
    }));

    // Health check endpoint
    this.httpApp.get('/health', async (req, res) => {
      try {
        const cacheHealth = await this.responseCache.healthCheck();
        const performanceHealth = this.performanceMonitor.getHealthStatus();
        const performanceSummary = this.performanceMonitor.getSummary();
        const cacheMetrics = await this.responseCache.getMetrics();

        res.json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: SERVER_VERSION,
          services: {
            cache: cacheHealth,
            performance: performanceHealth,
            server: { status: 'running' }
          },
          metrics: {
            performance: performanceSummary,
            cache: cacheMetrics
          }
        });
      } catch (error) {
        res.status(500).json({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Performance metrics endpoint
    this.httpApp.get('/api/metrics', async (req, res) => {
      try {
        const summary = this.performanceMonitor.getSummary();
        const metrics = this.performanceMonitor.getMetrics();
        const alerts = this.performanceMonitor.getAlerts();
        const cacheMetrics = await this.responseCache.getMetrics();

        res.json({
          timestamp: new Date().toISOString(),
          performance: {
            summary,
            metrics: metrics.slice(-100), // Last 100 metrics
            alerts
          },
          cache: cacheMetrics
        });
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Cache management endpoints
    this.httpApp.get('/api/cache/status', async (req, res) => {
      try {
        const metrics = await this.responseCache.getMetrics();
        const health = await this.responseCache.healthCheck();

        res.json({
          health,
          metrics,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    this.httpApp.post('/api/cache/clear', async (req, res) => {
      try {
        await this.responseCache.clear();
        res.json({
          message: 'Cache cleared successfully',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    this.httpApp.post('/api/cache/invalidate', async (req, res) => {
      try {
        const { key, namespace, tags } = req.body;

        if (tags && Array.isArray(tags)) {
          await this.responseCache.invalidateByTags(tags);
        } else if (key) {
          await this.responseCache.invalidate(key, namespace);
        } else {
          res.status(400).json({ error: 'Either key or tags must be provided' });
          return;
        }

        res.json({
          message: 'Cache invalidated successfully',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Performance alerts endpoint
    this.httpApp.get('/api/alerts', (req, res) => {
      try {
        const resolved = req.query.resolved === 'true';
        const alerts = this.performanceMonitor.getAlerts(resolved);

        res.json({
          alerts,
          count: alerts.length,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    this.httpApp.post('/api/alerts/:alertId/resolve', (req, res) => {
      try {
        const { alertId } = req.params;
        this.performanceMonitor.resolveAlert(alertId);

        res.json({
          message: 'Alert resolved successfully',
          alertId,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Dashboard endpoint
    this.httpApp.get('/dashboard', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>TappMCP Enhanced Dashboard</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; }
            .card { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .metric { display: inline-block; margin: 10px; padding: 10px; background: #e3f2fd; border-radius: 4px; }
            .alert { padding: 10px; margin: 5px 0; border-radius: 4px; }
            .alert.high { background: #ffebee; border-left: 4px solid #f44336; }
            .alert.critical { background: #fce4ec; border-left: 4px solid #e91e63; }
            .status { display: inline-block; padding: 4px 8px; border-radius: 4px; color: white; }
            .status.healthy { background: #4caf50; }
            .status.degraded { background: #ff9800; }
            .status.unhealthy { background: #f44336; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🎯 TappMCP Enhanced Dashboard</h1>

            <div class="card">
              <h2>System Status</h2>
              <div id="system-status">Loading...</div>
            </div>

            <div class="card">
              <h2>Performance Metrics</h2>
              <div id="performance-metrics">Loading...</div>
            </div>

            <div class="card">
              <h2>Cache Status</h2>
              <div id="cache-status">Loading...</div>
            </div>

            <div class="card">
              <h2>Active Alerts</h2>
              <div id="alerts">Loading...</div>
            </div>
          </div>

          <script>
            async function loadDashboard() {
              try {
                // Load system status
                const healthResponse = await fetch('/health');
                const health = await healthResponse.json();

                document.getElementById('system-status').innerHTML = \`
                  <div class="metric">
                    <strong>Server:</strong>
                    <span class="status \${health.status}">\${health.status}</span>
                  </div>
                  <div class="metric">
                    <strong>Cache:</strong>
                    <span class="status \${health.services.cache.status}">\${health.services.cache.status}</span>
                  </div>
                  <div class="metric">
                    <strong>Performance:</strong>
                    <span class="status \${health.services.performance.status}">\${health.services.performance.status}</span>
                  </div>
                \`;

                // Load performance metrics
                const metricsResponse = await fetch('/api/metrics');
                const metrics = await metricsResponse.json();

                document.getElementById('performance-metrics').innerHTML = \`
                  <div class="metric">
                    <strong>Total Requests:</strong> \${metrics.performance.summary.totalRequests}
                  </div>
                  <div class="metric">
                    <strong>Avg Response Time:</strong> \${metrics.performance.summary.averageResponseTime.toFixed(2)}ms
                  </div>
                  <div class="metric">
                    <strong>Error Rate:</strong> \${(metrics.performance.summary.errorRate * 100).toFixed(2)}%
                  </div>
                  <div class="metric">
                    <strong>Throughput:</strong> \${metrics.performance.summary.throughput.toFixed(2)} req/s
                  </div>
                  <div class="metric">
                    <strong>Memory Usage:</strong> \${(metrics.performance.summary.memoryUsage * 100).toFixed(2)}%
                  </div>
                \`;

                // Load cache status
                document.getElementById('cache-status').innerHTML = \`
                  <div class="metric">
                    <strong>Cache Hit Rate:</strong> \${(metrics.cache.hitRate * 100).toFixed(2)}%
                  </div>
                  <div class="metric">
                    <strong>Cache Size:</strong> \${metrics.cache.cacheSize} keys
                  </div>
                  <div class="metric">
                    <strong>Memory Usage:</strong> \${(metrics.cache.memoryUsage / 1024 / 1024).toFixed(2)} MB
                  </div>
                \`;

                // Load alerts
                const alertsResponse = await fetch('/api/alerts');
                const alerts = await alertsResponse.json();

                if (alerts.alerts.length === 0) {
                  document.getElementById('alerts').innerHTML = '<p>No active alerts</p>';
                } else {
                  const alertsHtml = alerts.alerts.map(alert => \`
                    <div class="alert \${alert.severity}">
                      <strong>\${alert.severity.toUpperCase()}:</strong> \${alert.message}
                      <br><small>Metric: \${alert.metric} | Value: \${alert.currentValue} | Threshold: \${alert.threshold}</small>
                    </div>
                  \`).join('');
                  document.getElementById('alerts').innerHTML = alertsHtml;
                }

              } catch (error) {
                console.error('Failed to load dashboard:', error);
                document.getElementById('system-status').innerHTML = '<p>Error loading dashboard</p>';
              }
            }

            // Load dashboard on page load
            loadDashboard();

            // Refresh every 5 seconds
            setInterval(loadDashboard, 5000);
          </script>
        </body>
        </html>
      `);
    });
  }

  private setupHealthRoutes() {
    this.healthApp.use(express.json());

    this.healthApp.get('/health', async (req, res) => {
      try {
        const cacheHealth = await this.responseCache.healthCheck();
        const performanceHealth = this.performanceMonitor.getHealthStatus();

        const overallStatus =
          cacheHealth.status === 'healthy' && performanceHealth.status === 'healthy'
            ? 'healthy'
            : 'degraded';

        res.status(overallStatus === 'healthy' ? 200 : 503).json({
          status: overallStatus,
          timestamp: new Date().toISOString(),
          services: {
            cache: cacheHealth.status,
            performance: performanceHealth.status
          }
        });
      } catch (error) {
        res.status(503).json({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
  }

  private generateCacheKey(toolName: string, args: any): string {
    const argsString = JSON.stringify(args, Object.keys(args).sort());
    return `${toolName}:${Buffer.from(argsString).toString('base64')}`;
  }

  private getCacheTTL(toolName: string): number {
    // Different TTLs for different tools
    const ttlMap: Record<string, number> = {
      smart_vibe: 300,      // 5 minutes - frequently changing
      smart_begin: 3600,    // 1 hour - stable
      smart_plan: 1800,     // 30 minutes - moderate
      smart_write: 600,     // 10 minutes - code generation
      smart_finish: 1800,   // 30 minutes
      smart_orchestrate: 900, // 15 minutes
      smart_converse: 300   // 5 minutes
    };

    return ttlMap[toolName] || 600; // Default 10 minutes
  }

  private getCacheTags(toolName: string, args: any): string[] {
    const tags = ['mcp', toolName];

    // Add context-specific tags
    if (args.projectId) tags.push(`project:${args.projectId}`);
    if (args.role) tags.push(`role:${args.role}`);
    if (args.quality) tags.push(`quality:${args.quality}`);

    return tags;
  }

  async start(): Promise<void> {
    await this.initialize();

    // Start HTTP server
    this.httpServer = this.httpApp.listen(HTTP_PORT, () => {
      console.log(`🌐 HTTP server running on port ${HTTP_PORT}`);
      console.log(`📊 Dashboard available at http://localhost:${HTTP_PORT}/dashboard`);
    });

    // Start health server
    this.healthServer = this.healthApp.listen(HEALTH_PORT, () => {
      console.log(`🏥 Health server running on port ${HEALTH_PORT}`);
    });

    // Start MCP server
    const transport = new StdioServerTransport();
    await this.mcpServer.connect(transport);
    console.log(`🚀 Enhanced MCP server started`);
  }

  async stop(): Promise<void> {
    if (this.httpServer) {
      this.httpServer.close();
    }

    if (this.healthServer) {
      this.healthServer.close();
    }

    this.performanceMonitor.stop();
      // LRU cache doesn't need disconnection
      console.log('✅ ResponseCacheLRU cleanup complete');

    console.log('🛑 Enhanced MCP server stopped');
  }
}

// Main execution
async function main() {
  const server = new EnhancedMCPServer();

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });

  try {
    await server.start();
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Only run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { EnhancedMCPServer };
