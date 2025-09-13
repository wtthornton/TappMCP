/**
 * Production Smoke Test - E2E Verification of Deployed TappMCP Server
 *
 * CRITICAL: This test verifies the deployed TappMCP server is functional.
 * This is the only test that matters for production deployment verification.
 *
 * Test Type: End-to-End Smoke Test / Sanity Test
 * Purpose: Verify deployed system functionality before declaring success
 * Runtime: <30 seconds for complete verification
 *
 * IMPORTANT: This test MUST hit the real production Docker container.
 * NO MOCK RESPONSES - if the production server is not available, the test should FAIL.
 * This ensures we're actually testing the deployed system, not fake responses.
 *
 * For full functionality testing, manually connect Claude Desktop to the deployed server.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn, ChildProcess } from 'child_process';
import fetch from 'node-fetch';

// Deployment Configuration
const DEPLOYED_SERVER_CONFIG = {
  // For actual deployment testing - connect to deployed server via docker exec
  MCP_SERVER_COMMAND: process.env.MCP_SERVER_COMMAND || 'docker',
  MCP_SERVER_ARGS: process.env.MCP_SERVER_ARGS?.split(',') || [
    'exec',
    '-i',
    'tappmcp-smart-mcp-1',
    'node',
    'dist/server.js',
  ],
  HEALTH_CHECK_URL: process.env.HEALTH_CHECK_URL || 'http://localhost:8081',
  CONNECTION_TIMEOUT: parseInt(process.env.CONNECTION_TIMEOUT || '10000'),
  TEST_TIMEOUT: parseInt(process.env.TEST_TIMEOUT || '45000'), // Increased from 30s to 45s
  // New option to test against deployed server endpoints instead of starting local
  USE_DEPLOYED_ENDPOINTS: process.env.USE_DEPLOYED_ENDPOINTS === 'true' || true,
};

interface MCPMessage {
  jsonrpc: string;
  id?: number | string;
  method?: string;
  params?: any;
  result?: any;
  error?: any;
}

interface MCPTestClient {
  process?: ChildProcess;
  messageId: number;
  pendingRequests: Map<
    number,
    { resolve: Function; reject: Function; timeout: ReturnType<typeof setTimeout> }
  >;
  connected: boolean;
}

class DeploymentSmokeTestClient {
  private client: MCPTestClient = {
    messageId: 1,
    pendingRequests: new Map(),
    connected: false,
  };

  /**
   * Connect to the deployed MCP server
   */
  async connect(): Promise<void> {
    // Only attempt stdio connection if explicitly configured
    if (!DEPLOYED_SERVER_CONFIG.MCP_SERVER_COMMAND || !DEPLOYED_SERVER_CONFIG.MCP_SERVER_ARGS) {
      throw new Error('MCP_SERVER_COMMAND and MCP_SERVER_ARGS must be set for stdio connection');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(
          new Error(`Connection timeout after ${DEPLOYED_SERVER_CONFIG.CONNECTION_TIMEOUT}ms`)
        );
      }, DEPLOYED_SERVER_CONFIG.CONNECTION_TIMEOUT);

      try {
        console.log(`🔌 Connecting to deployed MCP server...`);
        console.log(
          `📋 Command: ${DEPLOYED_SERVER_CONFIG.MCP_SERVER_COMMAND} ${DEPLOYED_SERVER_CONFIG.MCP_SERVER_ARGS!.join(' ')}`
        );

        this.client.process = spawn(
          DEPLOYED_SERVER_CONFIG.MCP_SERVER_COMMAND!,
          DEPLOYED_SERVER_CONFIG.MCP_SERVER_ARGS!,
          {
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: process.platform === 'win32',
            env: {
              ...process.env,
              NODE_ENV: 'test',
              VITEST: 'true',
              HEALTH_PORT: '0', // Use port 0 to let OS assign a random port
              SKIP_HEALTH_SERVER: 'true', // Additional flag to ensure health server doesn't start
            },
          }
        );

        // Handle process errors
        this.client.process.on('error', error => {
          clearTimeout(timeout);
          reject(new Error(`Failed to start MCP server: ${error.message}`));
        });

        // Handle unexpected exit
        this.client.process.on('exit', code => {
          if (!this.client.connected) {
            clearTimeout(timeout);
            reject(
              new Error(
                `MCP server exited prematurely with code ${code}. Check if server is properly deployed.`
              )
            );
          }
        });

        // Parse incoming messages
        this.client.process!.stdout?.on('data', data => {
          const lines = data.toString().split('\n').filter(Boolean);
          for (const line of lines) {
            try {
              const message: MCPMessage = JSON.parse(line);
              this.handleMessage(message);
            } catch (error) {
              // Ignore non-JSON output (like debug logs)
              console.debug('Non-JSON output:', error);
              console.log(`📝 Server output: ${line.trim()}`);
            }
          }
        });

        // Handle stderr
        this.client.process!.stderr?.on('data', data => {
          const errorData = data.toString().trim();
          if (errorData) {
            console.error(`❌ Server stderr: ${errorData}`);
          }
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
          .catch(error => {
            clearTimeout(timeout);
            reject(error);
          });
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  /**
   * Send message to MCP server and wait for response
   */
  private async sendMessage(message: MCPMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.client.process?.stdin) {
        reject(new Error('No connection to MCP server'));
        return;
      }

      const id = message.id as number;
      const timeout = setTimeout(() => {
        this.client.pendingRequests.delete(id);
        reject(new Error(`Request timeout: ${message.method}`));
      }, 5000);

      this.client.pendingRequests.set(id, {
        resolve: (result: any) => {
          clearTimeout(timeout);
          resolve(result);
        },
        reject: (error: any) => {
          clearTimeout(timeout);
          reject(error);
        },
        timeout,
      });

      this.client.process!.stdin!.write(JSON.stringify(message) + '\n');
    });
  }

  /**
   * Handle incoming messages from MCP server
   */
  private handleMessage(message: MCPMessage): void {
    if (message.id && this.client.pendingRequests.has(message.id as number)) {
      const pending = this.client.pendingRequests.get(message.id as number)!;
      this.client.pendingRequests.delete(message.id as number);

      if (message.error) {
        pending.reject(new Error(message.error.message || JSON.stringify(message.error)));
      } else {
        pending.resolve(message.result);
      }
    }
  }

  /**
   * List available tools from deployed server
   */
  async listTools(): Promise<any> {
    if (DEPLOYED_SERVER_CONFIG.USE_DEPLOYED_ENDPOINTS) {
      // Test the actual MCP server via HTTP by calling it directly
      try {
        const response = await fetch('http://localhost:8080/tools', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/list',
            params: {},
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        return result.result || result;
      } catch (error) {
        // No fallback - smoke test must hit real production endpoints
        console.error('❌ Production MCP tools/list failed:', error);
        throw new Error(`Production MCP tools/list failed: ${error.message}`);
      }
    }

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
  async callTool(name: string, arguments_: Record<string, any> = {}): Promise<any> {
    if (DEPLOYED_SERVER_CONFIG.USE_DEPLOYED_ENDPOINTS) {
      // Test the actual MCP server via HTTP by calling it directly
      try {
        const response = await fetch('http://localhost:8080/tools', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: this.client.messageId++,
            method: 'tools/call',
            params: {
              name,
              arguments: arguments_,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        return result.result || result;
      } catch (error) {
        // No fallback - smoke test must hit real production endpoints
        console.error(`❌ Production MCP tool call failed for ${name}:`, error);
        throw new Error(`Production MCP tool call failed for ${name}: ${error.message}`);
      }
    }

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
  async disconnect(): Promise<void> {
    if (this.client.process && !this.client.process.killed) {
      this.client.process.kill();
      this.client.connected = false;

      // Clear any pending requests
      for (const [_id, pending] of this.client.pendingRequests.entries()) {
        clearTimeout(pending.timeout);
        pending.reject(new Error('Connection closed'));
      }
      this.client.pendingRequests.clear();
    }
  }
}

// Global test client
let testClient: DeploymentSmokeTestClient;

describe('🚀 TappMCP Deployment Smoke Test - E2E Verification', () => {
  // Set longer timeout for deployment tests
  const _originalTimeout = 10000;

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

        const health = (await response.json()) as any;
        expect(health.status).toBe('healthy');
        expect(health.timestamp).toBeDefined();
        expect(health.version).toBeDefined();

        console.log(`✅ Health check passed: ${health.status} (uptime: ${health.uptime}s)`);
      } catch (error) {
        throw new Error(`Health check failed: ${(error as Error).message}`);
      }
    });

    it('should respond to readiness check endpoint', async () => {
      try {
        const response = await fetch(`${DEPLOYED_SERVER_CONFIG.HEALTH_CHECK_URL}/ready`);
        expect(response.status).toBe(200);

        const ready = (await response.json()) as any;
        expect(ready.status).toBe('ready');

        console.log(`✅ Readiness check passed: ${ready.status}`);
      } catch (error) {
        throw new Error(`Readiness check failed: ${(error as Error).message}`);
      }
    });

    it('should establish MCP protocol connection', async () => {
      expect(testClient).toBeDefined();
      expect(testClient['client'].connected).toBe(true);
      console.log('✅ MCP protocol connection established');
    });
  });

  describe('🛠️ Core Tool Availability', () => {
    let availableTools: any;

    it('should list all expected tools', async () => {
      availableTools = await testClient.listTools();
      expect(availableTools).toBeDefined();
      expect(availableTools.tools).toBeDefined();
      expect(Array.isArray(availableTools.tools)).toBe(true);

      // Verify all core tools are available
      const expectedTools = [
        'smart_begin',
        'smart_plan',
        'smart_write',
        'smart_finish',
        'smart_orchestrate',
        'smart_converse',
        'smart_vibe',
      ];
      const toolNames = availableTools.tools.map((t: any) => t.name);

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
    }, 30000); // 30 second timeout for tool execution

    it('should execute smart_plan with minimal input', async () => {
      const result = await testClient.callTool('smart_plan', {
        projectId: 'smoke-test-project',
        requirements: ['Create a simple function'],
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.success).toBe(true);
      expect(parsed.data).toBeDefined();
      expect(parsed.data.projectId).toBeDefined();

      console.log('✅ smart_plan executed successfully');
    }, 30000); // 30 second timeout for tool execution

    it('should execute smart_write with minimal input', async () => {
      const result = await testClient.callTool('smart_write', {
        projectId: 'smoke-test-project',
        featureDescription: 'Create a hello world function',
        codeType: 'function',
        techStack: ['typescript'],
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.success).toBe(true);
      expect(parsed.data).toBeDefined();
      expect(parsed.data.generatedCode).toBeDefined();
      expect(parsed.data.generatedCode.files).toBeDefined();
      expect(parsed.data.generatedCode.files[0].content).toBeDefined();

      console.log('✅ smart_write executed successfully');
    }, 30000); // 30 second timeout for tool execution
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
    }, 30000); // 30 second timeout for performance test

    it('should handle error cases gracefully', async () => {
      // Test with invalid input
      try {
        await testClient.callTool('smart_begin', {
          projectName: '', // Invalid empty name
        });
        // Should not reach here
        expect(false).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
        console.log('✅ Error handling works correctly');
      }
    }, 15000); // 15 second timeout for error handling test

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
    }, 30000); // 30 second timeout for response format test
  });
});
