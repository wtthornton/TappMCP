#!/usr/bin/env node

// Test script to verify Docker MCP server connection
import { spawn } from 'child_process';

console.log('🐳 Testing Docker MCP server connection...\n');

// Test the tools/list method
const testRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list',
  params: {}
};

const server = spawn('docker', ['exec', '-i', 'tappmcp-tappmcp-1', 'node', 'dist/simple-mcp-server.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let errorOutput = '';

server.stdout.on('data', (data) => {
  output += data.toString();
});

server.stderr.on('data', (data) => {
  errorOutput += data.toString();
});

server.on('close', (code) => {
  console.log(`\n📊 Server exit code: ${code}`);

  if (errorOutput) {
    console.log('❌ Error output:', errorOutput);
  }

  try {
    const response = JSON.parse(output);
    if (response.result && response.result.tools) {
      console.log('✅ Docker MCP server is working correctly!');
      console.log(`📋 Found ${response.result.tools.length} tools:`);
      response.result.tools.forEach(tool => {
        console.log(`  • ${tool.name} - ${tool.description}`);
      });
      console.log('\n🎉 Ready for Cursor integration!');
    } else {
      console.log('❌ Invalid response format:', response);
    }
  } catch (error) {
    console.log('❌ Failed to parse response:', error.message);
    console.log('Raw output:', output);
  }
});

// Send the test request
server.stdin.write(JSON.stringify(testRequest) + '\n');
server.stdin.end();

// Timeout after 5 seconds
setTimeout(() => {
  server.kill();
  console.log('⏰ Test timed out');
}, 5000);
