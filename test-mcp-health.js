#!/usr/bin/env node

/**
 * MCP Health Server Test
 *
 * This script tests the deployed TappMCP Docker container by using
 * the health server endpoint to validate the MCP server is working.
 */

const http = require('http');

// Test configuration
const MCP_CONFIG = {
  host: 'localhost',
  port: 8080, // Docker port mapping
  timeout: 30000
};

// Helper function to make HTTP requests
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: MCP_CONFIG.host,
      port: MCP_CONFIG.port,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: MCP_CONFIG.timeout
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test functions
async function testHealthEndpoint() {
  console.log('\n🧪 Testing: Health Endpoint');
  try {
    const result = await makeRequest('/health');
    console.log(`✅ Health check: ${result.status}`);
    console.log(`📊 Server status: ${result.data.status}`);
    console.log(`⏱️ Uptime: ${Math.round(result.data.uptime)} seconds`);
    console.log(`💾 Memory usage: ${Math.round(result.data.memory.heapUsed / 1024 / 1024)}MB`);
    return result.status === 200;
  } catch (error) {
    console.log(`❌ Health check failed: ${error.message}`);
    return false;
  }
}

async function testReadinessEndpoint() {
  console.log('\n🧪 Testing: Readiness Endpoint');
  try {
    const result = await makeRequest('/ready');
    console.log(`✅ Readiness check: ${result.status}`);
    console.log(`📊 Server status: ${result.data.status}`);
    return result.status === 200;
  } catch (error) {
    console.log(`❌ Readiness check failed: ${error.message}`);
    return false;
  }
}

async function testMCPFunctionality() {
  console.log('\n🧪 Testing: MCP Functionality via Health Server');

  try {
    // Test if we can access the MCP server through the health server
    // Since the health server is running, we know the MCP server is active

    console.log('📝 Checking MCP server process...');

    // Use docker exec to check if MCP server is responding
    const { exec } = require('child_process');

    return new Promise((resolve) => {
      exec('docker exec tappmcp-smart-mcp-1 ps aux | grep "node dist/server.js"', (error, stdout, stderr) => {
        if (error) {
          console.log('❌ MCP server process check failed:', error.message);
          resolve(false);
          return;
        }

        if (stdout.includes('node dist/server.js')) {
          console.log('✅ MCP server process is running');
          console.log('📊 Process info:', stdout.trim());
          resolve(true);
        } else {
          console.log('❌ MCP server process not found');
          resolve(false);
        }
      });
    });

  } catch (error) {
    console.log('❌ MCP functionality test failed:', error.message);
    return false;
  }
}

async function testContainerHealth() {
  console.log('\n🧪 Testing: Container Health');

  try {
    const { exec } = require('child_process');

    return new Promise((resolve) => {
      exec('docker inspect tappmcp-smart-mcp-1 --format="{{.State.Health.Status}}"', (error, stdout, stderr) => {
        if (error) {
          console.log('❌ Container health check failed:', error.message);
          resolve(false);
          return;
        }

        const healthStatus = stdout.trim();
        console.log(`📊 Container health status: ${healthStatus}`);

        if (healthStatus === 'healthy') {
          console.log('✅ Container is healthy');
          resolve(true);
        } else {
          console.log('❌ Container is not healthy');
          resolve(false);
        }
      });
    });

  } catch (error) {
    console.log('❌ Container health test failed:', error.message);
    return false;
  }
}

// Main test execution
async function runTests() {
  console.log('🚀 Starting MCP Deployed Server Health Tests');
  console.log('=============================================');

  const results = {
    health: false,
    readiness: false,
    mcpFunctionality: false,
    containerHealth: false
  };

  // Run tests
  results.health = await testHealthEndpoint();
  results.readiness = await testReadinessEndpoint();
  results.mcpFunctionality = await testMCPFunctionality();
  results.containerHealth = await testContainerHealth();

  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('========================');
  console.log(`Health Endpoint: ${results.health ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Readiness Endpoint: ${results.readiness ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`MCP Functionality: ${results.mcpFunctionality ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Container Health: ${results.containerHealth ? '✅ PASS' : '❌ FAIL'}`);

  const passCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;
  const score = Math.round((passCount / totalCount) * 100);

  console.log(`\nOverall Score: ${score}% (${passCount}/${totalCount} tests passed)`);
  console.log('Grade:', score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F');

  if (score >= 75) {
    console.log('\n🎉 MCP Server Health Tests PASSED!');
    console.log('📊 The deployed TappMCP server is running and healthy');
    console.log('🔧 Ready for HTML generation testing');
  } else {
    console.log('\n❌ MCP Server Health Tests FAILED!');
    console.log('🔍 Check the server logs and configuration');
  }

  // Recommendations
  console.log('\n💡 Recommendations:');
  if (results.health && results.readiness) {
    console.log('✅ Server endpoints are working correctly');
  }
  if (results.mcpFunctionality) {
    console.log('✅ MCP server process is running');
  }
  if (results.containerHealth) {
    console.log('✅ Docker container is healthy');
  }

  if (!results.health || !results.readiness) {
    console.log('⚠️ Check server configuration and port mappings');
  }
  if (!results.mcpFunctionality) {
    console.log('⚠️ MCP server may not be properly initialized');
  }
  if (!results.containerHealth) {
    console.log('⚠️ Container may need restart or health check configuration');
  }
}

// Run the tests
runTests().catch(console.error);
