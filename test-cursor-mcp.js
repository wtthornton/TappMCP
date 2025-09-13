#!/usr/bin/env node

/**
 * Test MCP connection for Cursor integration
 */

import { spawn } from 'child_process';

async function testCursorMCP() {
  console.log('🧪 Testing MCP connection for Cursor...\n');

  return new Promise((resolve, reject) => {
    // Use the same command that Cursor will use
    const mcp = spawn('docker', ['exec', '-i', 'tappmcp-smart-mcp-1', 'node', 'dist/server.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        NODE_ENV: 'production',
        MCP_STDIO_MODE: 'true'
      }
    });

    let responseData = '';
    let toolsReceived = false;

    mcp.stdout.on('data', (data) => {
      responseData += data.toString();
      const lines = responseData.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const response = JSON.parse(line);
          if (response.result && response.result.tools) {
            console.log('✅ Tools received successfully!');
            console.log(`📊 Found ${response.result.tools.length} tools:`);
            response.result.tools.forEach((tool, index) => {
              console.log(`   ${index + 1}. ${tool.name} - ${tool.description.split('\n')[0]}`);
            });
            toolsReceived = true;
            mcp.kill();
            resolve();
            return;
          }
        } catch (e) {
          // Not JSON, continue
        }
      }
    });

    mcp.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (output && !output.includes('Context7') && !output.includes('VibeTapp')) {
        console.log('📥 Stderr:', output);
      }
    });

    mcp.on('close', (code) => {
      console.log(`\n🔚 MCP process closed with code: ${code}`);
      if (!toolsReceived) {
        console.log('❌ No tools received');
      }
      resolve();
    });

    mcp.on('error', (error) => {
      console.error('❌ MCP process error:', error);
      reject(error);
    });

    // Wait for initialization, then send tools/list request
    setTimeout(() => {
      const request = {
        jsonrpc: '2.0',
        method: 'tools/list',
        params: {},
        id: 1
      };
      console.log('📤 Sending tools/list request...');
      mcp.stdin.write(JSON.stringify(request) + '\n');
    }, 2000);

    // Timeout after 10 seconds
    setTimeout(() => {
      console.log('⏰ Test timeout');
      mcp.kill();
      resolve();
    }, 10000);
  });
}

testCursorMCP().catch(console.error);

