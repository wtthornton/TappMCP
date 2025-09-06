#!/usr/bin/env node

/**
 * Simple MCP Protocol Test
 * Basic test to verify MCP STDIO communication
 */

const { spawn } = require('child_process');

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

async function testMCPProtocol() {
  log('🔍 Simple MCP Protocol Test', colors.blue);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.blue);

  return new Promise((resolve) => {
    log('\nTesting MCP STDIO communication...', colors.cyan);

    // Spawn MCP server process directly
    const mcp = spawn('docker', ['exec', '-i', 'tappmcp-smart-mcp-1', 'node', 'dist/server.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let initReceived = false;
    let startupReceived = false;
    let timeout;

    // Handle stdout
    mcp.stdout.on('data', (data) => {
      const output = data.toString();
      log(`   MCP stdout: ${output.trim()}`, colors.blue);

      try {
        const lines = output.split('\n').filter(line => line.trim());
        lines.forEach(line => {
          try {
            const parsed = JSON.parse(line);
            if (parsed.result && parsed.result.protocolVersion) {
              log('   ✓ MCP protocol response received', colors.green);
              log(`   Protocol: ${parsed.result.protocolVersion}`, colors.green);
              initReceived = true;
            }
          } catch (e) {
            // Not JSON
          }
        });
      } catch (e) {
        // Not JSON response
      }
    });

    // Handle stderr
    mcp.stderr.on('data', (data) => {
      const output = data.toString();
      log(`   MCP stderr: ${output.trim()}`, colors.yellow);

      if (output.includes('started successfully')) {
        log('   ✓ MCP server started', colors.green);
        startupReceived = true;

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

        log('   → Sending initialization request...', colors.cyan);
        mcp.stdin.write(JSON.stringify(initRequest) + '\n');
      }
    });

    // Set timeout
    timeout = setTimeout(() => {
      mcp.kill();

      log('\n📊 Test Results:', colors.blue);
      log(`   Server Startup:   ${startupReceived ? '✅ PASS' : '❌ FAIL'}`);
      log(`   Protocol Init:    ${initReceived ? '✅ PASS' : '❌ TIMEOUT'}`);

      if (startupReceived && initReceived) {
        log('\n🎉 MCP protocol communication is working!', colors.green);
        resolve(true);
      } else if (startupReceived) {
        log('\n⚠️ Server starts but protocol communication may have issues', colors.yellow);
        resolve(false);
      } else {
        log('\n❌ MCP server failed to start properly', colors.red);
        resolve(false);
      }
    }, 10000);

    // Handle process exit
    mcp.on('close', (code) => {
      if (timeout) clearTimeout(timeout);
      log(`   MCP process exited with code: ${code}`, colors.yellow);
    });
  });
}

testMCPProtocol().then(success => {
  process.exit(success ? 0 : 1);
});