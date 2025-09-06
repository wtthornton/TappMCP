#!/usr/bin/env node

/**
 * Test Script for Deployed MCP Server
 * Tests the MCP server capabilities after deployment
 */

const http = require('http');
const { spawn } = require('child_process');

// Colors for console output
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

// Test health endpoint
async function testHealthEndpoint() {
  return new Promise((resolve) => {
    log('\n1. Testing Health Endpoint...', colors.cyan);

    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/health',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        log('   ✓ Health check passed (200 OK)', colors.green);
        resolve(true);
      } else {
        log(`   ✗ Health check failed (${res.statusCode})`, colors.red);
        resolve(false);
      }
    });

    req.on('error', (error) => {
      log(`   ✗ Health check error: ${error.message}`, colors.red);
      resolve(false);
    });

    req.end();
  });
}

// Test MCP stdio communication
async function testMCPCommunication() {
  return new Promise((resolve) => {
    log('\n2. Testing MCP STDIO Communication...', colors.cyan);

    // Spawn the MCP server process
    const mcp = spawn('docker', ['exec', 'tappmcp-smart-mcp-1', 'node', 'dist/server.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let responseReceived = false;
    let timeout;

    // Send initialization request
    const initRequest = {
      jsonrpc: '2.0',
      method: 'initialize',
      params: {
        protocolVersion: '1.0.0',
        capabilities: {}
      },
      id: 1
    };

    // Handle stdout
    mcp.stdout.on('data', (data) => {
      const response = data.toString();
      try {
        const parsed = JSON.parse(response);
        if (parsed.result && parsed.result.protocolVersion) {
          log('   ✓ MCP initialization successful', colors.green);
          log(`   Protocol version: ${parsed.result.protocolVersion}`, colors.blue);
          responseReceived = true;
          clearTimeout(timeout);
          mcp.kill();
          resolve(true);
        }
      } catch (e) {
        // Not JSON, might be partial data
      }
    });

    // Handle stderr
    mcp.stderr.on('data', (data) => {
      log(`   MCP stderr: ${data}`, colors.yellow);
    });

    // Set timeout
    timeout = setTimeout(() => {
      if (!responseReceived) {
        log('   ✗ MCP communication timeout', colors.red);
        mcp.kill();
        resolve(false);
      }
    }, 5000);

    // Send the request
    mcp.stdin.write(JSON.stringify(initRequest) + '\n');
  });
}

// Test available tools
async function testAvailableTools() {
  return new Promise((resolve) => {
    log('\n3. Testing Available Tools...', colors.cyan);

    const mcp = spawn('docker', ['exec', 'tappmcp-smart-mcp-1', 'node', 'dist/server.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let toolsReceived = false;
    let timeout;

    // First initialize
    const initRequest = {
      jsonrpc: '2.0',
      method: 'initialize',
      params: {
        protocolVersion: '1.0.0',
        capabilities: {}
      },
      id: 1
    };

    // Then list tools
    const listToolsRequest = {
      jsonrpc: '2.0',
      method: 'tools/list',
      params: {},
      id: 2
    };

    let initialized = false;

    mcp.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());

      lines.forEach(line => {
        try {
          const parsed = JSON.parse(line);

          if (parsed.id === 1 && parsed.result) {
            initialized = true;
            // Send list tools request
            mcp.stdin.write(JSON.stringify(listToolsRequest) + '\n');
          }

          if (parsed.id === 2 && parsed.result && parsed.result.tools) {
            const tools = parsed.result.tools;
            log(`   ✓ Found ${tools.length} tools:`, colors.green);
            tools.forEach(tool => {
              log(`     - ${tool.name}: ${tool.description.substring(0, 50)}...`, colors.blue);
            });
            toolsReceived = true;
            clearTimeout(timeout);
            mcp.kill();
            resolve(true);
          }
        } catch (e) {
          // Not JSON or partial data
        }
      });
    });

    timeout = setTimeout(() => {
      if (!toolsReceived) {
        log('   ✗ Failed to list tools', colors.red);
        mcp.kill();
        resolve(false);
      }
    }, 5000);

    mcp.stdin.write(JSON.stringify(initRequest) + '\n');
  });
}

// Test tool execution
async function testToolExecution() {
  return new Promise((resolve) => {
    log('\n4. Testing Tool Execution (smart_begin)...', colors.cyan);

    const mcp = spawn('docker', ['exec', 'tappmcp-smart-mcp-1', 'node', 'dist/server.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let executionComplete = false;
    let timeout;
    let initialized = false;

    // Requests
    const initRequest = {
      jsonrpc: '2.0',
      method: 'initialize',
      params: { protocolVersion: '1.0.0', capabilities: {} },
      id: 1
    };

    const toolRequest = {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'smart_begin',
        arguments: {
          task: 'Test deployment verification',
          context: 'Testing if the deployed MCP server is working correctly'
        }
      },
      id: 2
    };

    mcp.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());

      lines.forEach(line => {
        try {
          const parsed = JSON.parse(line);

          if (parsed.id === 1 && parsed.result) {
            initialized = true;
            mcp.stdin.write(JSON.stringify(toolRequest) + '\n');
          }

          if (parsed.id === 2) {
            if (parsed.result && parsed.result.content) {
              const content = JSON.parse(parsed.result.content[0].text);
              log('   ✓ Tool executed successfully', colors.green);
              log(`   Project ID: ${content.projectId}`, colors.blue);
              log(`   Status: ${content.status}`, colors.blue);
              executionComplete = true;
            } else if (parsed.error) {
              log(`   ✗ Tool execution error: ${parsed.error.message}`, colors.red);
              executionComplete = true;
            }
            clearTimeout(timeout);
            mcp.kill();
            resolve(parsed.result ? true : false);
          }
        } catch (e) {
          // Not JSON or partial data
        }
      });
    });

    timeout = setTimeout(() => {
      if (!executionComplete) {
        log('   ✗ Tool execution timeout', colors.red);
        mcp.kill();
        resolve(false);
      }
    }, 10000);

    mcp.stdin.write(JSON.stringify(initRequest) + '\n');
  });
}

// Main test runner
async function runTests() {
  log('🧪 MCP Deployment Tests', colors.blue);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.blue);

  const results = {
    health: false,
    communication: false,
    tools: false,
    execution: false
  };

  // Run tests
  results.health = await testHealthEndpoint();
  results.communication = await testMCPCommunication();
  results.tools = await testAvailableTools();
  results.execution = await testToolExecution();

  // Summary
  log('\n📊 Test Results Summary', colors.blue);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.blue);

  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;

  log(`Health Endpoint:     ${results.health ? '✅ PASS' : '❌ FAIL'}`);
  log(`MCP Communication:   ${results.communication ? '✅ PASS' : '❌ FAIL'}`);
  log(`Available Tools:     ${results.tools ? '✅ PASS' : '❌ FAIL'}`);
  log(`Tool Execution:      ${results.execution ? '✅ PASS' : '❌ FAIL'}`);

  log(`\nTotal: ${passed}/${total} tests passed`, passed === total ? colors.green : colors.yellow);

  if (passed === total) {
    log('\n🎉 All tests passed! MCP server is working correctly.', colors.green);
  } else {
    log('\n⚠️  Some tests failed. Check the deployment logs.', colors.yellow);
    log('Run: npm run deploy:logs', colors.yellow);
  }

  process.exit(passed === total ? 0 : 1);
}

// Run the tests
runTests().catch(error => {
  log(`Unexpected error: ${error.message}`, colors.red);
  process.exit(1);
});