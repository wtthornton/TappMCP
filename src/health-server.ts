#!/usr/bin/env node

import { createServer } from 'http';

const PORT = process.env.PORT ?? 3000;

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

// Start health server
healthServer.listen(Number(PORT), '0.0.0.0', () => {
  // Health server running
});

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
