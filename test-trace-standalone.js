// Standalone test for trace functionality
import { VibeTapp } from './dist/vibe/core/VibeTapp.js';

console.log('🧪 Standalone Trace Test\n');

const vibeTapp = new VibeTapp();

async function testTrace() {
  try {
    console.log('Starting trace test...');

    const result = await vibeTapp.vibe('create a simple function', {
      trace: true,
      traceLevel: 'basic',
      outputFormat: 'console'
    });

    console.log('\n✅ Test Results:');
    console.log('- Success:', result.success);
    console.log('- Trace data present:', !!result.trace);
    console.log('- Trace info present:', !!result.traceInfo);

    if (result.trace) {
      console.log('\n🔍 Trace Data:');
      console.log('- Keys:', Object.keys(result.trace));
      console.log('- Duration:', result.trace.duration);
      console.log('- Node count:', result.trace.nodeCount);
      console.log('- Summary:', result.trace.summary);
    }

    if (result.traceInfo) {
      console.log('\n🔍 Trace Info:');
      console.log(result.traceInfo);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testTrace();
