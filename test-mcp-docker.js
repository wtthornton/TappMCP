#!/usr/bin/env node

/**
 * Test MCP Protocol through Docker Container
 */

import { spawn } from 'child_process';

async function testMCPDocker() {
  console.log('🔍 Testing MCP Protocol through Docker Container...\n');

  // Test 1: List available tools
  console.log('📋 Test 1: Listing available tools...');
  const listToolsRequest = {
    jsonrpc: '2.0',
    method: 'tools/list',
    id: 1
  };

  await sendMCPRequest(listToolsRequest);

  // Test 2: Test smart_vibe status command
  console.log('\n🎯 Test 2: Testing smart_vibe "status" command...');
  const statusRequest = {
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

  await sendMCPRequest(statusRequest);

  // Test 3: Test smart_vibe with a simple request
  console.log('\n✨ Test 3: Testing smart_vibe "create hello world" command...');
  const createRequest = {
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'smart_vibe',
      arguments: {
        command: 'create a simple hello world html page'
      }
    },
    id: 3
  };

  await sendMCPRequest(createRequest);
}

function sendMCPRequest(request) {
  return new Promise((resolve, reject) => {
    const mcp = spawn('docker', [
      'exec', '-i', 'tappmcp-smart-mcp-1',
      'node', 'dist/mcp-only-server.js'
    ]);

    let responseData = '';
    let errorData = '';

    mcp.stdout.on('data', (data) => {
      responseData += data.toString();
    });

    mcp.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    mcp.on('close', (code) => {
      if (code !== 0) {
        console.error(`❌ Process exited with code ${code}`);
        if (errorData) {
          console.error('Error:', errorData);
        }
        reject(new Error(`Process exited with code ${code}`));
      } else {
        try {
          // Parse the response
          const lines = responseData.split('\n').filter(line => line.trim());
          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.result) {
                console.log('✅ Success:', JSON.stringify(parsed.result, null, 2).substring(0, 500));
              } else if (parsed.error) {
                console.log('❌ Error:', parsed.error);
              }
            } catch (e) {
              // Not JSON, just log it
              if (line.trim()) {
                console.log('Response:', line);
              }
            }
          }
          resolve(responseData);
        } catch (error) {
          console.error('Failed to parse response:', error);
          console.log('Raw response:', responseData);
          reject(error);
        }
      }
    });

    mcp.on('error', (error) => {
      console.error('❌ Failed to start process:', error);
      reject(error);
    });

    // Send the request
    mcp.stdin.write(JSON.stringify(request) + '\n');
    mcp.stdin.end();
  });
}

// Run the test
testMCPDocker().catch(console.error);