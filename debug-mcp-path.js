#!/usr/bin/env node

/**
 * Deep Debug MCP Code Path
 *
 * This script traces the exact code path differences between:
 * 1. Direct function calls (working)
 * 2. MCP tool calls (returning simplified response)
 */

import { handleSmartWrite } from './dist/tools/smart-write.js';

// Test parameters
const testArgs = {
  projectId: 'debug_path_test',
  featureDescription: 'create a simple html file with header and footer',
  targetRole: 'developer',
  codeType: 'component',
  techStack: ['html', 'css', 'javascript'],
  businessContext: {
    goals: ['create simple web page'],
    targetUsers: ['end-users'],
    priority: 'high',
  },
  qualityRequirements: {
    testCoverage: 80,
    complexity: 3,
    securityLevel: 'medium',
  },
};

console.log('🔍 Deep Debug: MCP Code Path Analysis');
console.log('=====================================\n');

console.log('📋 Test Parameters:');
console.log(JSON.stringify(testArgs, null, 2));
console.log('\n');

// Test 1: Direct function call
console.log('🧪 Test 1: Direct Function Call');
console.log('--------------------------------');
console.log('Calling: handleSmartWrite(testArgs)');

try {
  const directResult = await handleSmartWrite(testArgs);

  console.log('✅ Direct call successful');
  console.log('Response structure:');
  console.log(`- success: ${directResult.success}`);
  console.log(`- has data: ${!!directResult.data}`);
  console.log(`- data type: ${typeof directResult.data}`);

  if (directResult.data) {
    console.log(`- data keys: ${Object.keys(directResult.data).join(', ')}`);

    if (directResult.data.generatedCode) {
      console.log(`- has generatedCode: ${!!directResult.data.generatedCode}`);
      if (directResult.data.generatedCode.files) {
        console.log(`- files count: ${directResult.data.generatedCode.files.length}`);
        if (directResult.data.generatedCode.files.length > 0) {
          const firstFile = directResult.data.generatedCode.files[0];
          console.log(`- first file path: ${firstFile.path}`);
          console.log(`- first file type: ${firstFile.type}`);
          console.log(`- first file content length: ${firstFile.content?.length || 0}`);
        }
      }
    }
  }

  console.log('\n📊 Full Direct Response:');
  console.log(JSON.stringify(directResult, null, 2));

} catch (error) {
  console.error('❌ Direct call failed:', error);
}

console.log('\n' + '='.repeat(50) + '\n');

// Test 2: Simulate MCP tool call
console.log('🧪 Test 2: MCP Tool Call Simulation');
console.log('-----------------------------------');
console.log('Simulating MCP tool call with same parameters...');

try {
  // This simulates what the MCP server does
  const mcpResult = await handleSmartWrite(testArgs);

  console.log('✅ MCP simulation successful');
  console.log('Response structure:');
  console.log(`- success: ${mcpResult.success}`);
  console.log(`- has data: ${!!mcpResult.data}`);
  console.log(`- data type: ${typeof mcpResult.data}`);

  if (mcpResult.data) {
    console.log(`- data keys: ${Object.keys(mcpResult.data).join(', ')}`);

    if (mcpResult.data.generatedCode) {
      console.log(`- has generatedCode: ${!!mcpResult.data.generatedCode}`);
      if (mcpResult.data.generatedCode.files) {
        console.log(`- files count: ${mcpResult.data.generatedCode.files.length}`);
        if (mcpResult.data.generatedCode.files.length > 0) {
          const firstFile = mcpResult.data.generatedCode.files[0];
          console.log(`- first file path: ${firstFile.path}`);
          console.log(`- first file type: ${firstFile.type}`);
          console.log(`- first file content length: ${firstFile.content?.length || 0}`);
        }
      }
    }
  }

  console.log('\n📊 Full MCP Simulation Response:');
  console.log(JSON.stringify(mcpResult, null, 2));

} catch (error) {
  console.error('❌ MCP simulation failed:', error);
}

console.log('\n' + '='.repeat(50) + '\n');

// Test 3: Check if there are multiple handleSmartWrite functions
console.log('🧪 Test 3: Function Source Analysis');
console.log('----------------------------------');
console.log('Checking function source and imports...');

try {
  console.log('handleSmartWrite function:');
  console.log('- name:', handleSmartWrite.name);
  console.log('- length:', handleSmartWrite.length);
  console.log('- toString length:', handleSmartWrite.toString().length);

  // Check if there are any other smart_write related functions
  const fs = await import('fs');
  const path = await import('path');

  const distDir = './dist/tools';
  const files = fs.readdirSync(distDir);
  console.log('\nFiles in dist/tools:');
  files.forEach(file => {
    if (file.includes('smart-write') || file.includes('smart_write')) {
      console.log(`- ${file}`);
    }
  });

} catch (error) {
  console.error('❌ Function analysis failed:', error);
}

console.log('\n🔍 Analysis Complete');
