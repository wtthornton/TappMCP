#!/usr/bin/env node

/**
 * Full Integration Test for TappMCP
 */

import { spawn } from 'child_process';
import http from 'http';

const tests = {
  passed: 0,
  failed: 0,
  results: []
};

async function runTest(name, testFn) {
  console.log(`\n🧪 Testing: ${name}...`);
  try {
    await testFn();
    tests.passed++;
    tests.results.push({ name, status: '✅ PASSED' });
    console.log(`   ✅ PASSED`);
  } catch (error) {
    tests.failed++;
    tests.results.push({ name, status: '❌ FAILED', error: error.message });
    console.log(`   ❌ FAILED: ${error.message}`);
  }
}

// Test 1: Docker Container Status
async function testDockerContainer() {
  return new Promise((resolve, reject) => {
    const ps = spawn('docker', ['ps', '--filter', 'name=tappmcp-smart-mcp-1', '--format', '{{.Names}}']);
    let output = '';

    ps.stdout.on('data', (data) => {
      output += data.toString();
    });

    ps.on('close', (code) => {
      if (code !== 0 || !output.includes('tappmcp-smart-mcp-1')) {
        reject(new Error('Container not running or wrong name'));
      } else {
        resolve();
      }
    });
  });
}

// Test 2: Health Endpoint
async function testHealthEndpoint() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:8081/health', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const health = JSON.parse(data);
          if (health.status !== 'healthy') {
            reject(new Error('Health status not healthy'));
          } else {
            resolve();
          }
        } catch (e) {
          reject(new Error('Invalid health response'));
        }
      });
    }).on('error', reject);
  });
}

// Test 3: MCP Tools List
async function testMCPToolsList() {
  return new Promise((resolve, reject) => {
    const request = {
      jsonrpc: '2.0',
      method: 'tools/list',
      id: 1
    };

    const mcp = spawn('docker', [
      'exec', '-i', 'tappmcp-smart-mcp-1',
      'node', 'dist/mcp-only-server.js'
    ]);

    let responseData = '';

    mcp.stdout.on('data', (data) => {
      responseData += data.toString();
    });

    mcp.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`MCP process exited with code ${code}`));
      } else {
        // Check if we have all 7 tools
        const toolNames = ['smart_begin', 'smart_plan', 'smart_write', 'smart_finish',
                          'smart_orchestrate', 'smart_converse', 'smart_vibe'];
        let foundTools = 0;

        for (const tool of toolNames) {
          if (responseData.includes(tool)) {
            foundTools++;
          }
        }

        if (foundTools === 7) {
          resolve();
        } else {
          reject(new Error(`Only found ${foundTools}/7 tools`));
        }
      }
    });

    mcp.stdin.write(JSON.stringify(request) + '\n');
    mcp.stdin.end();
  });
}

// Test 4: Smart Vibe Status Command
async function testSmartVibeStatus() {
  return new Promise((resolve, reject) => {
    const request = {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'smart_vibe',
        arguments: {
          command: 'status'
        }
      },
      id: 2
    };

    const mcp = spawn('docker', [
      'exec', '-i', 'tappmcp-smart-mcp-1',
      'node', 'dist/mcp-only-server.js'
    ]);

    let responseData = '';

    mcp.stdout.on('data', (data) => {
      responseData += data.toString();
    });

    mcp.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`MCP process exited with code ${code}`));
      } else {
        if (responseData.includes('System Status: ACTIVE') ||
            responseData.includes('Available Tools') ||
            responseData.includes('success": true')) {
          resolve();
        } else {
          reject(new Error('Status command did not return expected output'));
        }
      }
    });

    mcp.stdin.write(JSON.stringify(request) + '\n');
    mcp.stdin.end();
  });
}

// Test 5: Port Configuration
async function testPortConfiguration() {
  return new Promise((resolve, reject) => {
    const ps = spawn('docker', ['ps', '--filter', 'name=tappmcp-smart-mcp-1', '--format', '{{.Ports}}']);
    let output = '';

    ps.stdout.on('data', (data) => {
      output += data.toString();
    });

    ps.on('close', (code) => {
      if (code !== 0) {
        reject(new Error('Failed to check ports'));
      } else if (!output.includes('8080->3000') || !output.includes('8081->3001')) {
        reject(new Error('Incorrect port mapping'));
      } else {
        resolve();
      }
    });
  });
}

// Run all tests
async function runAllTests() {
  console.log('🎯 TappMCP Full Integration Test Suite');
  console.log('=' .repeat(50));

  await runTest('Docker Container Running', testDockerContainer);
  await runTest('Health Endpoint Responding', testHealthEndpoint);
  await runTest('Port Configuration (8080/8081)', testPortConfiguration);
  await runTest('MCP Tools Available (7/7)', testMCPToolsList);
  await runTest('Smart Vibe Status Command', testSmartVibeStatus);

  console.log('\n' + '=' .repeat(50));
  console.log('📊 Test Results Summary:');
  console.log(`   ✅ Passed: ${tests.passed}`);
  console.log(`   ❌ Failed: ${tests.failed}`);
  console.log(`   📈 Success Rate: ${Math.round((tests.passed / (tests.passed + tests.failed)) * 100)}%`);

  if (tests.failed > 0) {
    console.log('\n❌ Failed Tests:');
    tests.results.filter(r => r.status.includes('FAILED')).forEach(r => {
      console.log(`   - ${r.name}: ${r.error}`);
    });
  }

  if (tests.failed === 0) {
    console.log('\n🎉 All tests passed! TappMCP is fully operational.');
  }

  process.exit(tests.failed > 0 ? 1 : 0);
}

// Run the tests
runAllTests().catch(console.error);