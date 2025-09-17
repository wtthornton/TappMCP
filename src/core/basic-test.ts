#!/usr/bin/env node

/**
 * Basic Test - Minimal Component Test
 */

async function runBasicTest(): Promise<void> {
  console.log('🧪 BASIC TEST STARTING...');

  try {
    console.log('✅ Console output working');

    // Test basic file operations
    const fs = await import('fs');
    const path = await import('path');

    console.log('✅ Node.js modules loaded');

    // Create test directory
    const testDir = './test-data/basic-test';
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
      console.log('✅ Test directory created');
    } else {
      console.log('✅ Test directory already exists');
    }

    console.log('✅ File operations working');

    console.log('\n🎉 BASIC TEST COMPLETED SUCCESSFULLY!');
    console.log('✅ All basic functionality working');

  } catch (error) {
    console.error('❌ Basic test failed:', error);
    process.exit(1);
  }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runBasicTest().catch(console.error);
}
