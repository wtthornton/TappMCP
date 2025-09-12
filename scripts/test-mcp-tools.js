#!/usr/bin/env node

/**
 * Test MCP Tools Functionality
 * Tests individual MCP tools via STDIO protocol
 */

import { spawn } from 'child_process';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

class MCPTester {
  constructor() {
    this.mcp = null;
    this.initialized = false;
    this.requestId = 1;
  }

  async startMCPServer() {
    return new Promise((resolve, reject) => {
      log('Starting MCP server connection...', colors.cyan);

      this.mcp = spawn('docker', ['exec', '-i', 'tappmcp-smart-mcp-1', 'node', 'dist/server.js'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      this.mcp.stderr.on('data', (data) => {
        const output = data.toString();
        if (output.includes('started successfully')) {
          log('✓ MCP server connected', colors.green);
          setTimeout(() => resolve(), 1000); // Give it time to initialize
        }
      });

      this.mcp.on('error', reject);

      setTimeout(() => {
        if (!this.initialized) {
          reject(new Error('MCP server failed to start'));
        }
      }, 10000);
    });
  }

  async sendRequest(method, params = {}) {
    return new Promise((resolve, reject) => {
      const request = {
        jsonrpc: '2.0',
        method,
        params,
        id: this.requestId++
      };

      let responseData = '';
      let timeout;

      const handleResponse = (data) => {
        responseData += data.toString();

        const lines = responseData.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const response = JSON.parse(line);
            if (response.id === request.id) {
              clearTimeout(timeout);
              this.mcp.stdout.removeListener('data', handleResponse);

              if (response.error) {
                reject(new Error(`MCP Error: ${response.error.message}`));
              } else {
                resolve(response.result);
              }
              return;
            }
          } catch (e) {
            // Not JSON or incomplete data, continue
          }
        }
      };

      this.mcp.stdout.on('data', handleResponse);

      timeout = setTimeout(() => {
        this.mcp.stdout.removeListener('data', handleResponse);
        reject(new Error(`Request timeout: ${method}`));
      }, 15000);

      this.mcp.stdin.write(JSON.stringify(request) + '\n');
    });
  }

  async initialize() {
    log('\n1. Initializing MCP connection...', colors.cyan);
    try {
      const result = await this.sendRequest('initialize', {
        protocolVersion: '1.0.0',
        capabilities: {}
      });

      log(`✓ Initialized - Protocol version: ${result.protocolVersion}`, colors.green);
      this.initialized = true;
      return true;
    } catch (error) {
      log(`✗ Initialization failed: ${error.message}`, colors.red);
      return false;
    }
  }

  async listTools() {
    log('\n2. Listing available tools...', colors.cyan);
    try {
      const result = await this.sendRequest('tools/list');

      log(`✓ Found ${result.tools.length} tools:`, colors.green);
      result.tools.forEach(tool => {
        log(`   - ${tool.name}: ${tool.description.substring(0, 60)}...`, colors.blue);
      });
      return result.tools;
    } catch (error) {
      log(`✗ Failed to list tools: ${error.message}`, colors.red);
      return [];
    }
  }

  async testSmartBegin() {
    log('\n3. Testing smart_begin tool...', colors.cyan);
    try {
      const result = await this.sendRequest('tools/call', {
        name: 'smart_begin',
        arguments: {
          task: 'Test deployment verification',
          context: 'Testing if the deployed MCP server smart_begin tool works correctly'
        }
      });

      if (result.content && result.content[0]) {
        const content = JSON.parse(result.content[0].text);
        log('✓ smart_begin executed successfully', colors.green);
        log(`   Project ID: ${content.projectId}`, colors.blue);
        log(`   Status: ${content.status}`, colors.blue);
        log(`   Next steps: ${content.nextSteps?.length || 0} items`, colors.blue);
        return true;
      } else {
        log('✗ smart_begin returned invalid response', colors.red);
        return false;
      }
    } catch (error) {
      log(`✗ smart_begin failed: ${error.message}`, colors.red);
      return false;
    }
  }

  async testSmartPlan() {
    log('\n4. Testing smart_plan tool...', colors.cyan);
    try {
      const result = await this.sendRequest('tools/call', {
        name: 'smart_plan',
        arguments: {
          projectId: 'test-project-123',
          request: 'Create a simple Node.js API server with health endpoint'
        }
      });

      if (result.content && result.content[0]) {
        const content = JSON.parse(result.content[0].text);
        log('✓ smart_plan executed successfully', colors.green);
        log(`   Project ID: ${content.projectId}`, colors.blue);
        log(`   Plan items: ${content.implementation?.steps?.length || 0}`, colors.blue);
        return true;
      } else {
        log('✗ smart_plan returned invalid response', colors.red);
        return false;
      }
    } catch (error) {
      log(`✗ smart_plan failed: ${error.message}`, colors.red);
      return false;
    }
  }

  async testSmartWrite() {
    log('\n5. Testing smart_write tool...', colors.cyan);
    try {
      const result = await this.sendRequest('tools/call', {
        name: 'smart_write',
        arguments: {
          projectId: 'test-project-123',
          codeId: 'test-function',
          request: 'Write a simple hello world function in JavaScript',
          context: 'Basic function for testing'
        }
      });

      if (result.content && result.content[0]) {
        const content = JSON.parse(result.content[0].text);
        log('✓ smart_write executed successfully', colors.green);
        log(`   Code ID: ${content.codeId}`, colors.blue);
        log(`   Language: ${content.language}`, colors.blue);
        log(`   Code length: ${content.content?.length || 0} chars`, colors.blue);
        return true;
      } else {
        log('✗ smart_write returned invalid response', colors.red);
        return false;
      }
    } catch (error) {
      log(`✗ smart_write failed: ${error.message}`, colors.red);
      return false;
    }
  }

  cleanup() {
    if (this.mcp) {
      this.mcp.kill();
    }
  }
}

async function runMCPTests() {
  log('🧪 MCP Tools Functionality Tests', colors.blue);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.blue);

  const tester = new MCPTester();

  try {
    // Start MCP server connection
    await tester.startMCPServer();

    // Run tests
    const results = {
      initialization: await tester.initialize(),
      listTools: (await tester.listTools()).length > 0,
      smartBegin: await tester.testSmartBegin(),
      smartPlan: await tester.testSmartPlan(),
      smartWrite: await tester.testSmartWrite()
    };

    // Summary
    log('\n📊 MCP Tools Test Results', colors.blue);
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.blue);

    const passed = Object.values(results).filter(r => r).length;
    const total = Object.keys(results).length;

    log(`Initialization:      ${results.initialization ? '✅ PASS' : '❌ FAIL'}`);
    log(`List Tools:          ${results.listTools ? '✅ PASS' : '❌ FAIL'}`);
    log(`smart_begin:         ${results.smartBegin ? '✅ PASS' : '❌ FAIL'}`);
    log(`smart_plan:          ${results.smartPlan ? '✅ PASS' : '❌ FAIL'}`);
    log(`smart_write:         ${results.smartWrite ? '✅ PASS' : '❌ FAIL'}`);

    log(`\nTotal: ${passed}/${total} tests passed`, passed === total ? colors.green : colors.yellow);

    if (passed === total) {
      log('\n🎉 All MCP tools are working correctly!', colors.green);
      log('\nThe deployed MCP server provides full functionality for:', colors.blue);
      log('  - AI development session initialization', colors.green);
      log('  - Technical planning and architecture', colors.green);
      log('  - Code generation and documentation', colors.green);
    } else {
      log('\n⚠️  Some MCP tools failed. Check server logs.', colors.yellow);
    }

    tester.cleanup();
    process.exit(passed === total ? 0 : 1);

  } catch (error) {
    log(`\nTest setup failed: ${error.message}`, colors.red);
    tester.cleanup();
    process.exit(1);
  }
}

runMCPTests();
