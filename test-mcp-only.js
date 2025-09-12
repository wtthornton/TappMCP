#!/usr/bin/env node

/**
 * Test MCP-only server with smart_vibe tool
 */

import { spawn } from 'child_process';

async function testMCPOnly() {
  console.log('🧪 Testing MCP-only server with smart_vibe...\n');

  return new Promise((resolve, reject) => {
    const mcp = spawn('docker', ['exec', '-i', 'tappmcp-smart-mcp-1', 'node', 'dist/mcp-only-server.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let responseData = '';
    let initialized = false;

    mcp.stdout.on('data', (data) => {
      responseData += data.toString();
      console.log('📥 Received:', data.toString().trim());

      const lines = responseData.split('\n').filter(line => line.trim());
      for (const line of lines) {
        try {
          const response = JSON.parse(line);
          if (response.id === 1) {
            console.log('\n✅ smart_vibe response received!');
            console.log(JSON.stringify(response, null, 2));
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
      console.log('📥 Stderr:', data.toString().trim());
    });

    mcp.on('close', (code) => {
      console.log(`\n🔚 MCP process closed with code: ${code}`);
      resolve();
    });

    mcp.on('error', (error) => {
      console.error('❌ MCP process error:', error);
      reject(error);
    });

    // Wait for initialization, then send request
    setTimeout(() => {
      const request = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'smart_vibe',
          arguments: {
            command: 'create a simple html'
          }
        },
        id: 1
      };
      console.log('📤 Sending request:', JSON.stringify(request, null, 2));
      mcp.stdin.write(JSON.stringify(request) + '\n');
    }, 3000);

    // Timeout after 15 seconds
    setTimeout(() => {
      console.log('⏰ Test timeout');
      mcp.kill();
      resolve();
    }, 15000);
  });
}

testMCPOnly().catch(console.error);
