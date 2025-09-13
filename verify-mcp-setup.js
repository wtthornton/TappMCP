#!/usr/bin/env node

// Verification script for MCP setup
import { spawn } from 'child_process';

console.log('🔍 Verifying MCP Setup...\n');

// Test 1: Check if container is running
console.log('1. Checking Docker container...');
const containerCheck = spawn('docker', ['ps', '--filter', 'name=tappmcp-tappmcp-1', '--format', '{{.Status}}'], { stdio: 'pipe' });

let containerStatus = '';
containerCheck.stdout.on('data', (data) => {
  containerStatus += data.toString();
});

containerCheck.on('close', (code) => {
  if (containerStatus.includes('Up')) {
    console.log('   ✅ Container is running');
  } else {
    console.log('   ❌ Container is not running');
    return;
  }

  // Test 2: Check if MCP server file exists in container
  console.log('2. Checking MCP server file in container...');
  const fileCheck = spawn('docker', ['exec', 'tappmcp-tappmcp-1', 'test', '-f', '/app/dist/simple-mcp-server.js'], { stdio: 'pipe' });

  fileCheck.on('close', (code) => {
    if (code === 0) {
      console.log('   ✅ MCP server file exists in container');
    } else {
      console.log('   ❌ MCP server file not found in container');
      return;
    }

    // Test 3: Test MCP server functionality
    console.log('3. Testing MCP server functionality...');
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
      if (code === 0) {
        try {
          const response = JSON.parse(output);
          if (response.result && response.result.tools && response.result.tools.length === 7) {
            console.log('   ✅ MCP server returns 7 tools correctly');
            console.log('\n🎉 All tests passed! MCP setup is working correctly.');
            console.log('\n📋 Available tools:');
            response.result.tools.forEach(tool => {
              console.log(`   • ${tool.name} - ${tool.description}`);
            });
            console.log('\n🔄 Next steps:');
            console.log('   1. Restart Cursor completely');
            console.log('   2. Go to Cursor Settings → MCP & Integrations');
            console.log('   3. Verify "tappmcp" shows as enabled with tools');
            console.log('   4. If still showing "No tools or prompts", try toggling the switch off/on');
          } else {
            console.log('   ❌ MCP server returned invalid or incomplete tool list');
            console.log('   Response:', response);
          }
        } catch (error) {
          console.log('   ❌ Failed to parse MCP server response:', error.message);
          console.log('   Raw output:', output);
        }
      } else {
        console.log('   ❌ MCP server failed to start');
        if (errorOutput) {
          console.log('   Error:', errorOutput);
        }
      }
    });

    // Send the test request
    server.stdin.write(JSON.stringify(testRequest) + '\n');
    server.stdin.end();
  });
});
