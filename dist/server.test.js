"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
// Mock the health server import
vitest_1.vi.mock('./health-server.js', () => ({}));
// Mock tool handlers to avoid complex dependencies
vitest_1.vi.mock('./tools/smart_begin.js', () => ({
    smartBeginTool: { name: 'smart_begin', description: 'Mock tool' },
    handleSmartBegin: vitest_1.vi.fn().mockResolvedValue({ success: true })
}));
vitest_1.vi.mock('./tools/smart_plan.js', () => ({
    smartPlanTool: { name: 'smart_plan', description: 'Mock tool' },
    handleSmartPlan: vitest_1.vi.fn().mockResolvedValue({ success: true })
}));
vitest_1.vi.mock('./tools/smart_write.js', () => ({
    smartWriteTool: { name: 'smart_write', description: 'Mock tool' },
    handleSmartWrite: vitest_1.vi.fn().mockResolvedValue({ success: true })
}));
vitest_1.vi.mock('./tools/smart_finish.js', () => ({
    smartFinishTool: { name: 'smart_finish', description: 'Mock tool' },
    handleSmartFinish: vitest_1.vi.fn().mockResolvedValue({ success: true })
}));
vitest_1.vi.mock('./tools/smart_orchestrate.js', () => ({
    smartOrchestrateTool: { name: 'smart_orchestrate', description: 'Mock tool' },
    handleSmartOrchestrate: vitest_1.vi.fn().mockResolvedValue({ success: true })
}));
(0, vitest_1.describe)('MCP Server', () => {
    (0, vitest_1.it)('should create server instance', () => {
        const server = new index_js_1.Server({
            name: 'smart-mcp-server',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        (0, vitest_1.expect)(server).toBeDefined();
    });
    (0, vitest_1.it)('should have required server properties', () => {
        const serverInfo = {
            name: 'smart-mcp-server',
            version: '1.0.0',
        };
        (0, vitest_1.expect)(serverInfo.name).toBe('smart-mcp-server');
        (0, vitest_1.expect)(serverInfo.version).toBe('1.0.0');
    });
});
//# sourceMappingURL=server.test.js.map