#!/usr/bin/env node

/**
 * Deployment Verification Script
 *
 * This script runs the smoke test against a deployed TappMCP server
 * and provides clear pass/fail results for CI/CD pipelines.
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Configuration from environment
const config = {
  MCP_SERVER_COMMAND: process.env.MCP_SERVER_COMMAND || 'node',
  MCP_SERVER_ARGS: process.env.MCP_SERVER_ARGS || 'dist/server.js',
  HEALTH_CHECK_URL: process.env.HEALTH_CHECK_URL || 'http://localhost:3001',
  CONNECTION_TIMEOUT: process.env.CONNECTION_TIMEOUT || '10000',
  TEST_TIMEOUT: process.env.TEST_TIMEOUT || '30000',
  VERBOSE: process.env.VERBOSE || 'false',
};

console.log('🚀 TappMCP Deployment Verification');
console.log('====================================');
console.log(`📦 Server Command: ${config.MCP_SERVER_COMMAND} ${config.MCP_SERVER_ARGS}`);
console.log(`🏥 Health Check URL: ${config.HEALTH_CHECK_URL}`);
console.log(`⏱️  Timeout: ${config.TEST_TIMEOUT}ms`);
console.log('====================================\n');

// Check if built files exist
const distPath = join(projectRoot, 'dist', 'server.js');
if (!existsSync(distPath)) {
  console.error('❌ ERROR: Dist files not found. Run "npm run build" first.');
  process.exit(1);
}

// Set environment variables for the test
process.env.MCP_SERVER_COMMAND = config.MCP_SERVER_COMMAND;
process.env.MCP_SERVER_ARGS = config.MCP_SERVER_ARGS;
process.env.HEALTH_CHECK_URL = config.HEALTH_CHECK_URL;
process.env.CONNECTION_TIMEOUT = config.CONNECTION_TIMEOUT;
process.env.TEST_TIMEOUT = config.TEST_TIMEOUT;

// Run the smoke test
const testCommand = 'npx';
const testArgs = ['vitest', 'run', 'src/deployment/smoke-test.test.ts', '--reporter=verbose'];

if (config.VERBOSE === 'true') {
  testArgs.push('--reporter=verbose');
}

console.log(`🧪 Running smoke test: ${testCommand} ${testArgs.join(' ')}\n`);

const testProcess = spawn(testCommand, testArgs, {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

testProcess.on('error', (error) => {
  console.error(`❌ Failed to start test process: ${error.message}`);
  process.exit(1);
});

testProcess.on('exit', (code) => {
  console.log('\n====================================');

  if (code === 0) {
    console.log('✅ DEPLOYMENT VERIFICATION PASSED');
    console.log('🎉 TappMCP server is ready for production!');
    console.log('====================================');
    process.exit(0);
  } else {
    console.log('❌ DEPLOYMENT VERIFICATION FAILED');
    console.log('🚨 DO NOT DEPLOY - Fix issues before deploying');
    console.log('====================================');
    process.exit(code || 1);
  }
});