// Test script to check trace and debug functionality
import { VibeTapp } from './dist/vibe/core/VibeTapp.js';

const vibeTapp = new VibeTapp();

async function testTraceDebug() {
  console.log('🧪 Testing trace and debug functionality...\n');

  // Test 1: Basic trace
  console.log('1. Testing basic trace...');
  try {
    const result1 = await vibeTapp.vibe('create a simple function', {
      trace: true,
      traceLevel: 'basic',
      outputFormat: 'console'
    });
    console.log('✅ Basic trace result:', result1.success ? 'SUCCESS' : 'FAILED');
    console.log('Trace data present:', !!result1.trace);
    if (result1.trace) {
      console.log('Trace structure:', Object.keys(result1.trace));
    }
  } catch (error) {
    console.error('❌ Basic trace error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Debug mode
  console.log('2. Testing debug mode...');
  try {
    const result2 = await vibeTapp.vibe('analyze my code', {
      debug: true,
      traceLevel: 'comprehensive',
      outputFormat: 'json'
    });
    console.log('✅ Debug mode result:', result2.success ? 'SUCCESS' : 'FAILED');
    console.log('Trace data present:', !!result2.trace);
    if (result2.trace) {
      console.log('Trace structure:', Object.keys(result2.trace));
    }
  } catch (error) {
    console.error('❌ Debug mode error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: No trace
  console.log('3. Testing without trace...');
  try {
    const result3 = await vibeTapp.vibe('help me understand this', {});
    console.log('✅ No trace result:', result3.success ? 'SUCCESS' : 'FAILED');
    console.log('Trace data present:', !!result3.trace);
  } catch (error) {
    console.error('❌ No trace error:', error.message);
  }
}

testTraceDebug().catch(console.error);
