#!/usr/bin/env node

/**
 * Start MCP Server without Early Quality Check
 * Bypasses the early quality check for faster startup
 */

import { execSync } from 'child_process';

console.log('🚀 Starting MCP Server (Skipping Early Check)');
console.log('==============================================');

try {
  console.log('📦 Building TypeScript...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('🎯 Starting MCP Server...');
  execSync('npm start', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to start MCP Server:', error.message);
  process.exit(1);
}
