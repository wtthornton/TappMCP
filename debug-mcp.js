#!/usr/bin/env node

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

console.log('🔍 Debugging MCP Server...');

const server = spawn('node', ['dist/server.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: process.cwd(),
});

let output = '';
let errorOutput = '';

server.stdout.on('data', (data) => {
  const text = data.toString();
  output += text;
  console.log('📤 STDOUT:', text);
});

server.stderr.on('data', (data) => {
  const text = data.toString();
  errorOutput += text;
  console.log('❌ STDERR:', text);
});

server.on('close', (code) => {
  console.log(`🔚 Process exited with code ${code}`);
  console.log('📤 Total output:', output);
  console.log('❌ Total errors:', errorOutput);
});

server.on('error', (error) => {
  console.error('💥 Process error:', error);
});

// Send initialize message after a short delay
setTimeout(1000).then(() => {
  console.log('📨 Sending initialize message...');
  const initMessage = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {},
      },
      clientInfo: {
        name: 'debug-client',
        version: '1.0.0',
      },
    },
  };

  server.stdin.write(JSON.stringify(initMessage) + '\n');

  // Wait a bit then send tools/list
  setTimeout(2000).then(() => {
    console.log('📨 Sending tools/list message...');
    const listMessage = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {},
    };

    server.stdin.write(JSON.stringify(listMessage) + '\n');

    // Close after another delay
    setTimeout(3000).then(() => {
      console.log('🔚 Closing server...');
      server.kill();
    });
  });
});
