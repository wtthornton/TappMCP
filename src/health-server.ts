#!/usr/bin/env node

import { createServer } from 'http';
import { globalPerformanceMonitor } from './monitoring/performance-monitor.js';
import { WebSocketServer } from './websocket/WebSocketServer.js';
import { WorkflowEvents } from './websocket/events/WorkflowEvents.js';
import { PerformanceEvents } from './websocket/events/PerformanceEvents.js';
import { MetricsBroadcaster } from './websocket/MetricsBroadcaster.js';
import { OrchestrationEngine } from './core/orchestration-engine.js';
// import { NotificationService } from './notifications/NotificationService.js';
// import { WorkflowDataService } from './workflow/WorkflowDataService.js';
// import { WorkflowAPIServer } from './workflow/WorkflowAPIServer.js';

const PORT = process.env.HEALTH_PORT ?? 3001;
const WS_PORT = process.env.WS_PORT ?? 3003;
const API_PORT = process.env.API_PORT ?? 3003;

// Health check server for Docker health checks
const healthServer = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version ?? '0.1.0',
      })
    );
  } else if (req.url === '/ready') {
    // Readiness check - can be used for more complex health checks
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'ready',
        timestamp: new Date().toISOString(),
      })
    );
  } else if (req.url === '/performance') {
    // Performance monitoring endpoint
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const report = globalPerformanceMonitor.generateReport();
    res.end(JSON.stringify(report, null, 2));
  } else if (req.url === '/metrics') {
    // Raw metrics endpoint
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const metrics = globalPerformanceMonitor.getMetrics();
    res.end(JSON.stringify(metrics, null, 2));
  } else if (req.url === '/alerts') {
    // Performance alerts endpoint
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const alerts = globalPerformanceMonitor.getAlerts();
    res.end(JSON.stringify(alerts, null, 2));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'not found',
        message: 'Endpoint not found',
      })
    );
  }
});

// Initialize WebSocket server and event handlers
let wsServer: WebSocketServer | null = null;
let workflowEvents: WorkflowEvents | null = null;
let performanceEvents: PerformanceEvents | null = null;
let metricsBroadcaster: MetricsBroadcaster | null = null;
let orchestrationEngine: OrchestrationEngine | null = null;
// let notificationService: NotificationService | null = null;
// let workflowDataService: WorkflowDataService | null = null;
// let workflowAPIServer: WorkflowAPIServer | null = null;

// Start health server only if not in test environment
if (
  process.env.NODE_ENV !== 'test' &&
  process.env.VITEST !== 'true' &&
  process.env.SKIP_HEALTH_SERVER !== 'true'
) {
  healthServer.listen(Number(PORT), '0.0.0.0', () => {
    // Health server running
    console.log(`Health server running on port ${PORT}`);

    // Start performance monitoring
    globalPerformanceMonitor.startMonitoring(30000); // Monitor every 30 seconds
    console.log('Performance monitoring started');

    // Initialize WebSocket server
    try {
      wsServer = new WebSocketServer(Number(WS_PORT));
      wsServer.start();

      // Initialize event handlers
      workflowEvents = new WorkflowEvents(wsServer);
      performanceEvents = new PerformanceEvents(wsServer);
      metricsBroadcaster = new MetricsBroadcaster(wsServer);

      // Initialize orchestration engine with metrics broadcaster
      orchestrationEngine = new OrchestrationEngine();
      orchestrationEngine.setMetricsBroadcaster(metricsBroadcaster);

      // Initialize notification service with WebSocket server
      // notificationService = new NotificationService(wsServer);

      // Initialize workflow data service
      // workflowDataService = new WorkflowDataService();
      // workflowDataService.initialize().then(() => {
      //   // Initialize workflow API server
      //   if (workflowDataService) {
      //     workflowAPIServer = new WorkflowAPIServer(workflowDataService);
      //     workflowAPIServer.start(Number(API_PORT));
      //   }
      // });

      // Start metrics broadcasting
      if (metricsBroadcaster) {
        metricsBroadcaster.start(); // Start metrics broadcasting
      }

      // Set up performance metrics broadcasting
      globalPerformanceMonitor.on('metric-recorded', (metric: any) => {
        if (performanceEvents) {
          performanceEvents.broadcastMetrics({
            memoryUsage: {
              rss: process.memoryUsage().rss / (1024 * 1024),
              heapUsed: process.memoryUsage().heapUsed / (1024 * 1024),
              heapTotal: process.memoryUsage().heapTotal / (1024 * 1024),
              external: process.memoryUsage().external / (1024 * 1024),
            },
            responseTime: metric.category === 'timing' ? metric.value : 0,
            cacheHitRate: metric.name.includes('hit-rate') ? metric.value : 0,
            errorRate: metric.category === 'system' ? 0 : 0,
            activeConnections: wsServer?.getConnectionCount() || 0,
          });
        }
      });

      // Set up performance alerts
      globalPerformanceMonitor.on('alert-triggered', (alert: any) => {
        if (performanceEvents) {
          performanceEvents.broadcastPerformanceAlert(alert.metric, alert.severity, alert.message, {
            responseTime: alert.threshold,
          });
        }
      });

      console.log(`WebSocket server started on port ${WS_PORT}`);
    } catch (error) {
      console.error('Failed to start WebSocket server:', error);
    }
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  // SIGTERM received, shutting down health server
  console.log('SIGTERM received, shutting down servers...');

  if (wsServer) {
    wsServer.stop();
  }

  globalPerformanceMonitor.stopMonitoring();

  healthServer.close(() => {
    console.log('Health server shut down');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  // SIGINT received, shutting down health server
  console.log('SIGINT received, shutting down servers...');

  if (wsServer) {
    wsServer.stop();
  }

  globalPerformanceMonitor.stopMonitoring();

  healthServer.close(() => {
    console.log('Health server shut down');
    process.exit(0);
  });
});

export {
  healthServer,
  wsServer,
  workflowEvents,
  performanceEvents,
  metricsBroadcaster,
  orchestrationEngine,
};
