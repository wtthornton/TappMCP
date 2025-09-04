#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartMCPServer = void 0;
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const zod_1 = require("zod");
// Import health server for Docker health checks
require("./health-server.js");
// Import tool handlers
const smart_begin_js_1 = require("./tools/smart_begin.js");
const smart_plan_js_1 = require("./tools/smart_plan.js");
const smart_write_js_1 = require("./tools/smart_write.js");
const smart_finish_js_1 = require("./tools/smart_finish.js");
// Server configuration
const SERVER_NAME = 'smart-mcp';
const SERVER_VERSION = '0.1.0';
// Tool registry
const TOOLS = {
    smart_begin: { tool: smart_begin_js_1.smartBeginTool, handler: smart_begin_js_1.handleSmartBegin },
    smart_plan: { tool: smart_plan_js_1.smartPlanTool, handler: smart_plan_js_1.handleSmartPlan },
    smart_write: { tool: smart_write_js_1.smartWriteTool, handler: smart_write_js_1.handleSmartWrite },
    smart_finish: { tool: smart_finish_js_1.smartFinishTool, handler: smart_finish_js_1.handleSmartFinish },
};
// Input validation schema
const ToolInputSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Tool name is required'),
    arguments: zod_1.z.record(zod_1.z.any()).optional().default({}),
});
// Response schema
const ToolResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional(),
    timestamp: zod_1.z.string(),
});
class SmartMCPServer {
    server;
    constructor() {
        this.server = new index_js_1.Server({
            name: SERVER_NAME,
            version: SERVER_VERSION,
            capabilities: {
                tools: {},
            },
        });
        this.setupHandlers();
    }
    setupHandlers() {
        // List tools handler
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
            try {
                const tools = Object.values(TOOLS).map(({ tool }) => tool);
                return {
                    tools,
                };
            }
            catch (error) {
                throw new Error(`Failed to list tools: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
        // Call tool handler
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            try {
                // Validate input
                const validatedInput = ToolInputSchema.parse({
                    name: request.params.name,
                    arguments: request.params.arguments,
                });
                const { name, arguments: args } = validatedInput;
                // Check if tool exists
                if (!TOOLS[name]) {
                    throw new Error(`Tool '${name}' not found. Available tools: ${Object.keys(TOOLS).join(', ')}`);
                }
                // Get tool and handler
                const { tool, handler } = TOOLS[name];
                // Validate tool arguments against schema
                if (tool.inputSchema) {
                    try {
                        const schema = zod_1.z.object(tool.inputSchema.properties);
                        schema.parse(args);
                    }
                    catch (validationError) {
                        throw new Error(`Invalid arguments for tool '${name}': ${validationError instanceof Error ? validationError.message : 'Validation failed'}`);
                    }
                }
                // Execute tool handler
                const result = (await handler(args));
                // Validate response
                const validatedResponse = ToolResponseSchema.parse({
                    success: result.success ?? true,
                    data: result.data ?? result,
                    error: result.error,
                    timestamp: result.timestamp ?? new Date().toISOString(),
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(validatedResponse, null, 2),
                        },
                    ],
                };
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: false,
                                error: errorMessage,
                                timestamp: new Date().toISOString(),
                            }, null, 2),
                        },
                    ],
                    isError: true,
                };
            }
        });
    }
    async start() {
        try {
            const transport = new stdio_js_1.StdioServerTransport();
            await this.server.connect(transport);
            // eslint-disable-next-line no-console
            console.error(`${SERVER_NAME} v${SERVER_VERSION} started successfully`);
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error(`Failed to start ${SERVER_NAME}:`, error);
            process.exit(1);
        }
    }
}
exports.SmartMCPServer = SmartMCPServer;
// Start server if this file is run directly
if (require.main === module) {
    const server = new SmartMCPServer();
    server.start().catch(error => {
        // eslint-disable-next-line no-console
        console.error('Server startup failed:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=server.js.map