"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const health_server_1 = require("./health-server");
(0, vitest_1.describe)('Health Server', () => {
    let server;
    const TEST_PORT = 3001; // Use different port to avoid conflicts
    (0, vitest_1.beforeAll)(() => {
        server = (0, health_server_1.createHealthServer)(TEST_PORT);
    });
    (0, vitest_1.afterAll)((done) => {
        if (server) {
            server.close(done);
        }
        else {
            done();
        }
    });
    (0, vitest_1.it)('should create health server successfully', () => {
        (0, vitest_1.expect)(server).toBeDefined();
        (0, vitest_1.expect)(server.listening).toBe(true);
    });
    (0, vitest_1.it)('should respond to health check', async () => {
        const response = await fetch(`http://localhost:${TEST_PORT}/health`);
        const data = await response.json();
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(data.status).toBe('healthy');
        (0, vitest_1.expect)(data.timestamp).toBeDefined();
        (0, vitest_1.expect)(data.uptime).toBeGreaterThanOrEqual(0);
    });
    (0, vitest_1.it)('should respond to readiness check', async () => {
        const response = await fetch(`http://localhost:${TEST_PORT}/ready`);
        const data = await response.json();
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(data.ready).toBe(true);
        (0, vitest_1.expect)(data.timestamp).toBeDefined();
    });
    (0, vitest_1.it)('should return 404 for unknown routes', async () => {
        const response = await fetch(`http://localhost:${TEST_PORT}/unknown`);
        (0, vitest_1.expect)(response.status).toBe(404);
    });
});
//# sourceMappingURL=health-server.test.js.map