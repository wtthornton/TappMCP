#!/usr/bin/env node

/**
 * Minimal Test - Direct execution test
 */

console.log('🧪 MINIMAL TEST STARTING...');
console.log('✅ Console output working');

// Test basic file operations
import { existsSync, mkdirSync } from 'fs';

console.log('✅ ES modules imported');

// Create test directory
const testDir = './test-data/minimal-test';
if (!existsSync(testDir)) {
  mkdirSync(testDir, { recursive: true });
  console.log('✅ Test directory created');
} else {
  console.log('✅ Test directory already exists');
}

console.log('✅ File operations working');

console.log('\n🎉 MINIMAL TEST COMPLETED SUCCESSFULLY!');
console.log('✅ All basic functionality working');
