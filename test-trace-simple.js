// Simple test to verify trace functionality
import { VibeTapp } from './dist/vibe/core/VibeTapp.js';

const vibeTapp = new VibeTapp();

async function testTrace() {
  console.log('🧪 Testing trace functionality...\n');

  try {
    const result = await vibeTapp.vibe('create a simple function', {
      trace: true,
      traceLevel: 'basic',
      outputFormat: 'console'
    });

    console.log('✅ Result success:', result.success);
    console.log('✅ Trace data present:', !!result.trace);
    console.log('✅ Trace info present:', !!result.traceInfo);

    if (result.trace) {
      console.log('✅ Trace data keys:', Object.keys(result.trace));
      console.log('✅ Trace duration:', result.trace.duration);
      console.log('✅ Trace node count:', result.trace.nodeCount);
    }

    if (result.traceInfo) {
      console.log('✅ Trace info:', result.traceInfo);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testTrace().catch(console.error);
