#!/usr/bin/env node

import { spawn } from 'child_process';

// Test the Docker MCP server connection
function testDockerMCP() {
  console.log('🔌 Testing Docker MCP server connection...');

  const docker = spawn('docker', [
    'exec', '-i', 'tappmcp-smart-mcp-1',
    'node', 'dist/mcp-only-server.js'
  ], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Send MCP initialization message
  const initMessage = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  };

  docker.stdin.write(JSON.stringify(initMessage) + '\n');

  let output = '';
  docker.stdout.on('data', (data) => {
    output += data.toString();
    console.log('📤 Server response:', data.toString().trim());
  });

  docker.stderr.on('data', (data) => {
    console.log('⚠️ Server stderr:', data.toString().trim());
  });

  docker.on('error', (error) => {
    console.error('❌ Connection failed:', error.message);
  });

  // After 3 seconds, send tools/list request
  setTimeout(() => {
    const toolsMessage = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    };

    console.log('📋 Requesting tools list...');
    docker.stdin.write(JSON.stringify(toolsMessage) + '\n');
  }, 1000);

  // Clean up after 5 seconds
  setTimeout(() => {
    console.log('🏁 Test complete');
    docker.kill();
    process.exit(0);
  }, 5000);
}

testDockerMCP();