// Comprehensive test for trace functionality
import { VibeTapp } from './dist/vibe/core/VibeTapp.js';
import { CallTreeTracer } from './dist/tracing/CallTreeTracer.js';

async function testTraceComprehensive() {
  console.log('🧪 Comprehensive Trace Test\n');
  console.log('='.repeat(50));

  // Test 1: Direct CallTreeTracer test
  console.log('\n1. Testing CallTreeTracer directly...');
  const tracer = new CallTreeTracer({
    enabled: true,
    level: 'basic',
    includeParameters: true,
    includeResults: true,
    includeTiming: true,
    outputFormat: 'console'
  });

  tracer.startTrace('test command', { test: true });
  tracer.addNode('test_tool', 'execution', { param: 'test' });
  tracer.addInternalStep('test_step', { step: 'test' });
  const traceData = tracer.endTrace();

  console.log('✅ Tracer test result:', !!traceData);
  if (traceData) {
    console.log('✅ Trace data keys:', Object.keys(traceData));
    console.log('✅ Trace duration:', traceData.duration);
    console.log('✅ Trace node count:', traceData.nodeCount);
  }

  // Test 2: VibeTapp with trace
  console.log('\n2. Testing VibeTapp with trace...');
  const vibeTapp = new VibeTapp();

  try {
    const result = await vibeTapp.vibe('create a simple function', {
      trace: true,
      traceLevel: 'basic',
      outputFormat: 'console'
    });

    console.log('✅ VibeTapp result success:', result.success);
    console.log('✅ Trace data present:', !!result.trace);
    console.log('✅ Trace info present:', !!result.traceInfo);

    if (result.trace) {
      console.log('✅ Trace data structure:');
      console.log('  - Keys:', Object.keys(result.trace));
      console.log('  - Duration:', result.trace.duration);
      console.log('  - Node count:', result.trace.nodeCount);
      console.log('  - Summary:', result.trace.summary);
    }

    if (result.traceInfo) {
      console.log('✅ Trace info content:');
      console.log(result.traceInfo);
    }

  } catch (error) {
    console.error('❌ VibeTapp error:', error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('🏁 Test completed');
}

testTraceComprehensive().catch(console.error);
