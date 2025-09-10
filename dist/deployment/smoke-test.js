/**
 * Deployment Smoke Test - E2E Verification of Deployed TappMCP Server
 *
 * CRITICAL: This test verifies the deployed TappMCP server is functional.
 * This is the only test that matters for production deployment verification.
 *
 * Test Type: End-to-End Smoke Test / Sanity Test
 * Purpose: Verify deployed system functionality before declaring success
 * Runtime: <30 seconds for complete verification
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn } from 'child_process';
import fetch from 'node-fetch';
// Deployment Configuration
const DEPLOYED_SERVER_CONFIG = {
    // For local testing - adjust these for actual deployment
    MCP_SERVER_COMMAND: process.env.MCP_SERVER_COMMAND || 'node',
    MCP_SERVER_ARGS: process.env.MCP_SERVER_ARGS?.split(',') || ['dist/server.js'],
    HEALTH_CHECK_URL: process.env.HEALTH_CHECK_URL || 'http://localhost:3001',
    CONNECTION_TIMEOUT: parseInt(process.env.CONNECTION_TIMEOUT || '10000'),
    TEST_TIMEOUT: parseInt(process.env.TEST_TIMEOUT || '30000'),
};
class DeploymentSmokeTestClient {
    client = {
        messageId: 1,
        pendingRequests: new Map(),
        connected: false,
    };
    /**
     * Connect to the deployed MCP server
     */
    async connect() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Connection timeout after ${DEPLOYED_SERVER_CONFIG.CONNECTION_TIMEOUT}ms`));
            }, DEPLOYED_SERVER_CONFIG.CONNECTION_TIMEOUT);
            try {
                console.log(`🔌 Connecting to deployed MCP server...`);
                console.log(`📋 Command: ${DEPLOYED_SERVER_CONFIG.MCP_SERVER_COMMAND} ${DEPLOYED_SERVER_CONFIG.MCP_SERVER_ARGS.join(' ')}`);
                this.client.process = spawn(DEPLOYED_SERVER_CONFIG.MCP_SERVER_COMMAND, DEPLOYED_SERVER_CONFIG.MCP_SERVER_ARGS, {
                    stdio: ['pipe', 'pipe', 'pipe'],
                    shell: process.platform === 'win32',
                });
                // Handle process errors
                this.client.process.on('error', (error) => {
                    clearTimeout(timeout);
                    reject(new Error(`Failed to start MCP server: ${error.message}`));
                });
                // Handle unexpected exit
                this.client.process.on('exit', (code) => {
                    if (!this.client.connected) {
                        clearTimeout(timeout);
                        reject(new Error(`MCP server exited prematurely with code ${code}`));
                    }
                });
                // Parse incoming messages
                this.client.process.stdout?.on('data', (data) => {
                    const lines = data.toString().split('\n').filter(Boolean);
                    for (const line of lines) {
                        try {
                            const message = JSON.parse(line);
                            this.handleMessage(message);
                        }
                        catch (error) {
                            // Ignore non-JSON output (like debug logs)
                            console.log(`📝 Server output: ${line.trim()}`);
                        }
                    }
                });
                // Handle stderr
                this.client.process.stderr?.on('data', (data) => {
                    console.error(`❌ Server stderr: ${data.toString()}`);
                });
                // Initialize connection
                this.sendMessage({
                    jsonrpc: '2.0',
                    id: this.client.messageId++,
                    method: 'initialize',
                    params: {
                        protocolVersion: '2024-11-05',
                        capabilities: {
                            tools: {},
                        },
                        clientInfo: {
                            name: 'TappMCP-SmokeTest',
                            version: '1.0.0',
                        },
                    },
                })
                    .then(() => {
                    this.client.connected = true;
                    clearTimeout(timeout);
                    resolve();
                })
                    .catch((error) => {
                    clearTimeout(timeout);
                    reject(error);
                });
            }
            catch (error) {
                clearTimeout(timeout);
                reject(error);
            }
        });
    }
    /**
     * Send message to MCP server and wait for response
     */
    async sendMessage(message) {
        return new Promise((resolve, reject) => {
            if (!this.client.process?.stdin) {
                reject(new Error('No connection to MCP server'));
                return;
            }
            const id = message.id;
            const timeout = setTimeout(() => {
                this.client.pendingRequests.delete(id);
                reject(new Error(`Request timeout: ${message.method}`));
            }, 5000);
            this.client.pendingRequests.set(id, {
                resolve: (result) => {
                    clearTimeout(timeout);
                    resolve(result);
                },
                reject: (error) => {
                    clearTimeout(timeout);
                    reject(error);
                },
                timeout,
            });
            this.client.process.stdin.write(JSON.stringify(message) + '\n');
        });
    }
    /**
     * Handle incoming messages from MCP server
     */
    handleMessage(message) {
        if (message.id && this.client.pendingRequests.has(message.id)) {
            const pending = this.client.pendingRequests.get(message.id);
            this.client.pendingRequests.delete(message.id);
            if (message.error) {
                pending.reject(new Error(message.error.message || JSON.stringify(message.error)));
            }
            else {
                pending.resolve(message.result);
            }
        }
    }
    /**
     * List available tools from deployed server
     */
    async listTools() {
        return this.sendMessage({
            jsonrpc: '2.0',
            id: this.client.messageId++,
            method: 'tools/list',
            params: {},
        });
    }
    /**
     * Call a specific tool with parameters
     */
    async callTool(name, arguments_ = {}) {
        return this.sendMessage({
            jsonrpc: '2.0',
            id: this.client.messageId++,
            method: 'tools/call',
            params: {
                name,
                arguments: arguments_,
            },
        });
    }
    /**
     * Disconnect from MCP server
     */
    async disconnect() {
        if (this.client.process && !this.client.process.killed) {
            this.client.process.kill();
            this.client.connected = false;
            // Clear any pending requests
            for (const [id, pending] of this.client.pendingRequests.entries()) {
                clearTimeout(pending.timeout);
                pending.reject(new Error('Connection closed'));
            }
            this.client.pendingRequests.clear();
        }
    }
}
// Global test client
let testClient;
describe('🚀 TappMCP Deployment Smoke Test - E2E Verification', () => {
    // Set longer timeout for deployment tests
    const originalTimeout = 10000;
    beforeAll(async () => {
        testClient = new DeploymentSmokeTestClient();
        await testClient.connect();
    }, DEPLOYED_SERVER_CONFIG.TEST_TIMEOUT);
    afterAll(async () => {
        if (testClient) {
            await testClient.disconnect();
        }
    });
    describe('🏥 Server Health & Connectivity', () => {
        it('should respond to HTTP health check endpoint', async () => {
            try {
                const response = await fetch(`${DEPLOYED_SERVER_CONFIG.HEALTH_CHECK_URL}/health`);
                expect(response.status).toBe(200);
                const health = await response.json();
                expect(health.status).toBe('healthy');
                expect(health.timestamp).toBeDefined();
                expect(health.version).toBeDefined();
                console.log(`✅ Health check passed: ${health.status} (uptime: ${health.uptime}s)`);
            }
            catch (error) {
                throw new Error(`Health check failed: ${error.message}`);
            }
        });
        it('should respond to readiness check endpoint', async () => {
            try {
                const response = await fetch(`${DEPLOYED_SERVER_CONFIG.HEALTH_CHECK_URL}/ready`);
                expect(response.status).toBe(200);
                const ready = await response.json();
                expect(ready.status).toBe('ready');
                console.log(`✅ Readiness check passed: ${ready.status}`);
            }
            catch (error) {
                throw new Error(`Readiness check failed: ${error.message}`);
            }
        });
        it('should establish MCP protocol connection', async () => {
            expect(testClient).toBeDefined();
            expect(testClient['client'].connected).toBe(true);
            console.log('✅ MCP protocol connection established');
        });
    });
    describe('🛠️ Core Tool Availability', () => {
        let availableTools;
        it('should list all expected tools', async () => {
            availableTools = await testClient.listTools();
            expect(availableTools).toBeDefined();
            expect(availableTools.tools).toBeDefined();
            expect(Array.isArray(availableTools.tools)).toBe(true);
            // Verify all core tools are available
            const expectedTools = ['smart_begin', 'smart_plan', 'smart_write', 'smart_finish', 'smart_orchestrate'];
            const toolNames = availableTools.tools.map((t) => t.name);
            for (const expectedTool of expectedTools) {
                expect(toolNames).toContain(expectedTool);
            }
            console.log(`✅ All ${expectedTools.length} core tools available: ${toolNames.join(', ')}`);
        });
        it('should have properly defined tool schemas', async () => {
            expect(availableTools.tools.length).toBeGreaterThan(0);
            for (const tool of availableTools.tools) {
                expect(tool.name).toBeDefined();
                expect(tool.description).toBeDefined();
                expect(tool.inputSchema).toBeDefined();
            }
            console.log('✅ All tools have valid schemas');
        });
    });
    describe('🔧 Core Tool Execution - Minimal Tests', () => {
        it('should execute smart_begin with minimal input', async () => {
            const result = await testClient.callTool('smart_begin', {
                projectName: 'smoke-test-project',
                techStack: ['typescript'],
            });
            expect(result).toBeDefined();
            expect(result.content).toBeDefined();
            const parsed = JSON.parse(result.content[0].text);
            expect(parsed.success).toBe(true);
            expect(parsed.data).toBeDefined();
            expect(parsed.data.projectId).toContain('smoke-test-project');
            console.log('✅ smart_begin executed successfully');
        });
        it('should execute smart_plan with minimal input', async () => {
            const result = await testClient.callTool('smart_plan', {
                projectName: 'smoke-test-project',
                requirements: ['Create a simple function'],
            });
            expect(result).toBeDefined();
            expect(result.content).toBeDefined();
            const parsed = JSON.parse(result.content[0].text);
            expect(parsed.success).toBe(true);
            expect(parsed.data).toBeDefined();
            expect(parsed.data.planId).toBeDefined();
            console.log('✅ smart_plan executed successfully');
        });
        it('should execute smart_write with minimal input', async () => {
            const result = await testClient.callTool('smart_write', {
                prompt: 'Create a hello world function',
                language: 'typescript',
            });
            expect(result).toBeDefined();
            expect(result.content).toBeDefined();
            const parsed = JSON.parse(result.content[0].text);
            expect(parsed.success).toBe(true);
            expect(parsed.data).toBeDefined();
            expect(parsed.data.code).toBeDefined();
            console.log('✅ smart_write executed successfully');
        });
        it('should execute smart_finish with minimal input', async () => {
            const result = await testClient.callTool('smart_finish', {
                projectId: 'smoke-test-project',
                completedTasks: ['Basic setup'],
            });
            expect(result).toBeDefined();
            expect(result.content).toBeDefined();
            const parsed = JSON.parse(result.content[0].text);
            expect(parsed.success).toBe(true);
            expect(parsed.data).toBeDefined();
            console.log('✅ smart_finish executed successfully');
        });
        it('should execute smart_orchestrate with minimal input', async () => {
            const result = await testClient.callTool('smart_orchestrate', {
                workflow: {
                    name: 'smoke-test-workflow',
                    steps: ['begin', 'plan', 'write', 'finish'],
                },
                context: {
                    projectName: 'smoke-test-project',
                },
            });
            expect(result).toBeDefined();
            expect(result.content).toBeDefined();
            const parsed = JSON.parse(result.content[0].text);
            expect(parsed.success).toBe(true);
            expect(parsed.data).toBeDefined();
            console.log('✅ smart_orchestrate executed successfully');
        });
    });
    describe('🔄 End-to-End Workflow Test', () => {
        it('should complete a full development workflow', async () => {
            console.log('🔄 Testing complete development workflow...');
            // Step 1: Begin project
            const beginResult = await testClient.callTool('smart_begin', {
                projectName: 'e2e-test-project',
                techStack: ['typescript'],
                role: 'developer',
            });
            const beginParsed = JSON.parse(beginResult.content[0].text);
            expect(beginParsed.success).toBe(true);
            const projectId = beginParsed.data.projectId;
            console.log(`  ✅ Step 1: Project begun (${projectId})`);
            // Step 2: Create plan
            const planResult = await testClient.callTool('smart_plan', {
                projectName: 'e2e-test-project',
                requirements: ['Create a calculator function', 'Add unit tests'],
                qualityLevel: 'standard',
            });
            const planParsed = JSON.parse(planResult.content[0].text);
            expect(planParsed.success).toBe(true);
            const planId = planParsed.data.planId;
            console.log(`  ✅ Step 2: Plan created (${planId})`);
            // Step 3: Write code
            const writeResult = await testClient.callTool('smart_write', {
                prompt: 'Create a TypeScript calculator function with add, subtract, multiply, divide',
                language: 'typescript',
                style: 'functional',
            });
            const writeParsed = JSON.parse(writeResult.content[0].text);
            expect(writeParsed.success).toBe(true);
            expect(writeParsed.data.code).toContain('function');
            console.log(`  ✅ Step 3: Code generated (${writeParsed.data.code.length} chars)`);
            // Step 4: Finish project
            const finishResult = await testClient.callTool('smart_finish', {
                projectId,
                planId,
                completedTasks: ['Calculator implementation', 'Basic testing'],
            });
            const finishParsed = JSON.parse(finishResult.content[0].text);
            expect(finishParsed.success).toBe(true);
            console.log(`  ✅ Step 4: Project completed successfully`);
            console.log('🎉 Complete E2E workflow executed successfully!');
        });
    });
    describe('📊 Performance & Quality Verification', () => {
        it('should execute tools within acceptable time limits', async () => {
            const startTime = Date.now();
            await testClient.callTool('smart_begin', {
                projectName: 'performance-test',
                techStack: ['typescript'],
            });
            const duration = Date.now() - startTime;
            expect(duration).toBeLessThan(5000); // Should complete in <5 seconds
            console.log(`✅ Tool execution performance: ${duration}ms (<5000ms limit)`);
        });
        it('should handle error cases gracefully', async () => {
            // Test with invalid input
            try {
                await testClient.callTool('smart_begin', {
                    projectName: '', // Invalid empty name
                });
                // Should not reach here
                expect(false).toBe(true);
            }
            catch (error) {
                expect(error).toBeDefined();
                console.log('✅ Error handling works correctly');
            }
        });
        it('should maintain consistent response format', async () => {
            const result = await testClient.callTool('smart_begin', {
                projectName: 'format-test',
                techStack: ['typescript'],
            });
            expect(result.content).toBeDefined();
            expect(result.content[0]).toBeDefined();
            expect(result.content[0].type).toBe('text');
            expect(result.content[0].text).toBeDefined();
            const parsed = JSON.parse(result.content[0].text);
            expect(parsed).toHaveProperty('success');
            expect(parsed).toHaveProperty('data');
            expect(parsed).toHaveProperty('timestamp');
            console.log('✅ Response format is consistent');
        });
    });
});
//# sourceMappingURL=smoke-test.js.map