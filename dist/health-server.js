#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthServer = void 0;
const http_1 = require("http");
const PORT = process.env.PORT ?? 3000;
// Health check server for Docker health checks
const healthServer = (0, http_1.createServer)((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: process.env.npm_package_version ?? '0.1.0',
        }));
    }
    else if (req.url === '/ready') {
        // Readiness check - can be used for more complex health checks
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ready',
            timestamp: new Date().toISOString(),
        }));
    }
    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'not found',
            message: 'Endpoint not found',
        }));
    }
});
exports.healthServer = healthServer;
// Start health server
healthServer.listen(Number(PORT), '0.0.0.0', () => {
    // eslint-disable-next-line no-console
    console.log(`Health server running on port ${PORT}`);
});
// Graceful shutdown
process.on('SIGTERM', () => {
    // eslint-disable-next-line no-console
    console.log('SIGTERM received, shutting down health server');
    healthServer.close(() => {
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    // eslint-disable-next-line no-console
    console.log('SIGINT received, shutting down health server');
    healthServer.close(() => {
        process.exit(0);
    });
});
//# sourceMappingURL=health-server.js.map