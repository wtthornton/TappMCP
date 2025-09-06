#!/usr/bin/env node

/**
 * Simple Test Script for Already-Deployed MCP Server
 * Tests the running container without spawning new processes
 */

const http = require('http');

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
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          log('   ✓ Health check passed (200 OK)', colors.green);
          try {
            const health = JSON.parse(data);
            log(`   Status: ${health.status}`, colors.blue);
            if (health.timestamp) {
              log(`   Server time: ${new Date(health.timestamp).toLocaleString()}`, colors.blue);
            }
          } catch {
            log('   Response: OK', colors.blue);
          }
          resolve(true);
        });
      } else {
        log(`   ✗ Health check failed (${res.statusCode})`, colors.red);
        resolve(false);
      }
    });

    req.on('error', (error) => {
      log(`   ✗ Health check error: ${error.message}`, colors.red);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      log('   ✗ Health check timeout', colors.red);
      resolve(false);
    });

    req.end();
  });
}

// Test container status
async function testContainerStatus() {
  return new Promise((resolve) => {
    log('\n2. Testing Container Status...', colors.cyan);

    const { exec } = require('child_process');

    exec('docker inspect tappmcp-smart-mcp-1 --format="{{.State.Status}} {{.State.Health.Status}}"', (error, stdout) => {
      if (error) {
        log('   ✗ Container inspection failed', colors.red);
        resolve(false);
        return;
      }

      const [status, health] = stdout.trim().split(' ');
      log(`   ✓ Container Status: ${status}`, colors.green);
      if (health && health !== '<no value>') {
        log(`   ✓ Health Status: ${health}`, colors.green);
      }
      resolve(status === 'running');
    });
  });
}

// Test container logs
async function testContainerLogs() {
  return new Promise((resolve) => {
    log('\n3. Checking Recent Logs...', colors.cyan);

    const { exec } = require('child_process');

    exec('docker logs tappmcp-smart-mcp-1 --tail=5', (error, stdout, stderr) => {
      if (error) {
        log('   ✗ Failed to get logs', colors.red);
        resolve(false);
        return;
      }

      const allOutput = (stdout + stderr).trim();
      if (allOutput.includes('started successfully')) {
        log('   ✓ Server started successfully', colors.green);
        resolve(true);
      } else if (allOutput.includes('Error') || allOutput.includes('error')) {
        log('   ⚠ Found errors in logs', colors.yellow);
        resolve(false);
      } else {
        log('   ✓ Logs look clean', colors.green);
        resolve(true);
      }
    });
  });
}

// Test MCP capabilities via simple HTTP probe
async function testMCPCapabilities() {
  return new Promise((resolve) => {
    log('\n4. Testing MCP Process...', colors.cyan);

    const { exec } = require('child_process');

    // Check if the MCP process is running inside container
    exec('docker exec tappmcp-smart-mcp-1 ps aux', (error, stdout) => {
      if (error) {
        log('   ✗ Failed to check process', colors.red);
        resolve(false);
        return;
      }

      if (stdout.includes('node dist/server.js')) {
        log('   ✓ MCP server process is running', colors.green);
        resolve(true);
      } else {
        log('   ✗ MCP server process not found', colors.red);
        resolve(false);
      }
    });
  });
}

// Main test runner
async function runTests() {
  log('🧪 Simple MCP Deployment Tests', colors.blue);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.blue);

  const results = {
    health: false,
    container: false,
    logs: false,
    process: false
  };

  // Run tests
  results.health = await testHealthEndpoint();
  results.container = await testContainerStatus();
  results.logs = await testContainerLogs();
  results.process = await testMCPCapabilities();

  // Summary
  log('\n📊 Test Results Summary', colors.blue);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.blue);

  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;

  log(`Health Endpoint:     ${results.health ? '✅ PASS' : '❌ FAIL'}`);
  log(`Container Status:    ${results.container ? '✅ PASS' : '❌ FAIL'}`);
  log(`Server Logs:         ${results.logs ? '✅ PASS' : '❌ FAIL'}`);
  log(`MCP Process:         ${results.process ? '✅ PASS' : '❌ FAIL'}`);

  log(`\nTotal: ${passed}/${total} tests passed`, passed === total ? colors.green : colors.yellow);

  if (passed === total) {
    log('\n🎉 All tests passed! MCP server is deployed and running correctly.', colors.green);
    log('\n📋 Deployment Info:', colors.blue);
    log('  URL: http://localhost:8080', colors.green);
    log('  Health: http://localhost:8080/health', colors.green);
    log('  Container: tappmcp-smart-mcp-1', colors.green);
    log('  Management: npm run deploy:logs, npm run deploy:status', colors.green);
  } else {
    log('\n⚠️  Some tests failed. Check the deployment.', colors.yellow);
    log('Commands to debug:', colors.yellow);
    log('  docker logs tappmcp-smart-mcp-1', colors.yellow);
    log('  docker exec -it tappmcp-smart-mcp-1 sh', colors.yellow);
  }

  process.exit(passed === total ? 0 : 1);
}

// Run the tests
runTests().catch(error => {
  log(`Unexpected error: ${error.message}`, colors.red);
  process.exit(1);
});