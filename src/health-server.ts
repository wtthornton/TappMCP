#!/usr/bin/env node

import { createServer } from 'http';
import { globalPerformanceMonitor } from './monitoring/performance-monitor.js';

const PORT = process.env.HEALTH_PORT ?? 3001;

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
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  // SIGTERM received, shutting down health server
  healthServer.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  // SIGINT received, shutting down health server
  healthServer.close(() => {
    process.exit(0);
  });
});

export { healthServer };
