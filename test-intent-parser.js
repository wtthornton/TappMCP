// Test script to debug IntentParser
import { IntentParser } from './dist/vibe/core/IntentParser.js';

const parser = new IntentParser();

async function testIntent(input) {
  console.log(`\nTesting: "${input}"`);
  try {
    const intent = await parser.parseIntent(input);
    console.log('Intent:', JSON.stringify(intent, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Test various commands
await testIntent('analyze why smart_vibe and smart_write tools failed');
await testIntent('create a React component');
await testIntent('check my code quality');
await testIntent('explain this function');
await testIntent('build a todo app');
