/**
 * Test script for call tree tracing functionality
 * Tests VibeTapp directly without MCP layer
 */

import { VibeTapp } from './dist/vibe/core/VibeTapp.js';

async function testTracing() {
  console.log('🧪 Testing Call Tree Tracing...\n');

  // Initialize VibeTapp
  const vibeTapp = new VibeTapp();

  // Test with tracing enabled - use a simpler command to avoid Context7 rate limiting
  const options = {
    role: 'developer',
    quality: 'standard',
    verbosity: 'standard',
    mode: 'basic',
    trace: true,
    traceLevel: 'basic',
    outputFormat: 'console'
  };

  console.log('📝 Testing with trace enabled...');
  console.log('Options:', JSON.stringify(options, null, 2));
  console.log('\n' + '='.repeat(50) + '\n');

  try {
    const response = await vibeTapp.vibe('Write a simple hello world function', options);

    console.log('✅ Response received!');
    console.log('Response keys:', Object.keys(response));
    console.log('\n📊 Response structure:');
    console.log(JSON.stringify(response, null, 2));

    // Check for trace data
    if (response.trace) {
      console.log('\n🔍 Trace data found!');
      console.log('Trace summary:', response.trace.summary);
    } else {
      console.log('\n❌ No trace data found in response');
    }

    if (response.traceInfo) {
      console.log('\n📋 Trace info found!');
      console.log(response.traceInfo);
    } else {
      console.log('\n❌ No trace info found in response');
    }

  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

// Run the test
testTracing().catch(console.error);
