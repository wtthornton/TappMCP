#!/usr/bin/env node

/**
 * Test smart_vibe tool via MCP server
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

async function testSmartVibe() {
  log('🎨 Testing smart_vibe tool via MCP server', colors.blue);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.blue);

  return new Promise((resolve) => {
    log('\nConnecting to TappMCP server...', colors.cyan);

    // Spawn MCP server process
    const mcp = spawn('docker', ['exec', '-i', 'tappmcp-smart-mcp-1', 'node', 'dist/server.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let serverReady = false;
    let initComplete = false;
    let toolsListed = false;
    let smartVibeTested = false;
    let timeout;

    // Handle stdout
    mcp.stdout.on('data', (data) => {
      const output = data.toString();

      try {
        const lines = output.split('\n').filter(line => line.trim());
        lines.forEach(line => {
          try {
            const parsed = JSON.parse(line);

            if (parsed.result && parsed.result.protocolVersion) {
              log('   ✓ MCP protocol initialized', colors.green);
              initComplete = true;

              // List tools
              const listRequest = {
                jsonrpc: '2.0',
                method: 'tools/list',
                params: {},
                id: 2
              };
              mcp.stdin.write(JSON.stringify(listRequest) + '\n');
            }

            if (parsed.result && parsed.result.tools) {
              log(`   ✓ Found ${parsed.result.tools.length} tools`, colors.green);
              const smartVibeTool = parsed.result.tools.find(tool => tool.name === 'smart_vibe');
              if (smartVibeTool) {
                log('   ✓ smart_vibe tool found', colors.green);
                toolsListed = true;

                // Test smart_vibe tool
                const smartVibeRequest = {
                  jsonrpc: '2.0',
                  method: 'tools/call',
                  params: {
                    name: 'smart_vibe',
                    arguments: {
                      command: 'create a simple html page',
                      options: {
                        role: 'developer',
                        quality: 'standard',
                        verbosity: 'standard'
                      }
                    }
                  },
                  id: 3
                };

                log('   → Testing smart_vibe: "create a simple html page"', colors.cyan);
                mcp.stdin.write(JSON.stringify(smartVibeRequest) + '\n');
              } else {
                log('   ✗ smart_vibe tool not found', colors.red);
                toolsListed = true;
              }
            }

            if (parsed.result && parsed.result.content) {
              log('   ✓ smart_vibe tool executed successfully!', colors.green);
              log('   Response preview:', colors.blue);

              const content = parsed.result.content[0];
              if (content && content.text) {
                const preview = content.text.substring(0, 200) + '...';
                log(`   ${preview}`, colors.blue);
              }

              smartVibeTested = true;
              mcp.kill();
            }

            if (parsed.error) {
              log(`   ✗ Error: ${parsed.error.message}`, colors.red);
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

      if (output.includes('started successfully')) {
        log('   ✓ MCP server started', colors.green);
        serverReady = true;

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
      log(`   Server Ready:      ${serverReady ? '✅ PASS' : '❌ FAIL'}`);
      log(`   Protocol Init:     ${initComplete ? '✅ PASS' : '❌ FAIL'}`);
      log(`   Tools Listed:      ${toolsListed ? '✅ PASS' : '❌ FAIL'}`);
      log(`   smart_vibe Test:   ${smartVibeTested ? '✅ PASS' : '❌ FAIL'}`);

      if (serverReady && initComplete && toolsListed && smartVibeTested) {
        log('\n🎉 smart_vibe tool is working perfectly!', colors.green);
        log('You can now use smart_vibe commands through the MCP server.', colors.blue);
        resolve(true);
      } else {
        log('\n⚠️ Some tests failed. Check the server logs.', colors.yellow);
        resolve(false);
      }
    }, 15000);

    // Handle process exit
    mcp.on('close', (code) => {
      if (timeout) clearTimeout(timeout);
      log(`   MCP process exited with code: ${code}`, colors.yellow);
    });
  });
}

testSmartVibe().then(success => {
  process.exit(success ? 0 : 1);
});
