#!/usr/bin/env node

/**
 * Debug Smart Vibe Execution
 *
 * This script traces the smart_vibe tool execution to see why it's not
 * properly orchestrating file creation.
 */

import { handleSmartVibe } from './dist/tools/smart-vibe.js';

console.log('🔍 Debug: Smart Vibe Execution');
console.log('==============================\n');

// Test the smart_vibe tool with HTML file creation request
const testCommand = 'create a simple html file with header and footer';

console.log(`📝 Testing command: "${testCommand}"`);
console.log('Calling: handleSmartVibe({ command: testCommand })');
console.log('\n');

try {
  const result = await handleSmartVibe({
    command: testCommand,
    options: {
      role: 'developer',
      quality: 'standard'
    }
  });

  console.log('✅ Smart Vibe execution completed');
  console.log('\n📊 Response Structure:');
  console.log(`- has content: ${!!result.content}`);
  console.log(`- content length: ${result.content?.length || 0}`);
  console.log(`- isError: ${result.isError || false}`);

  if (result.content && result.content.length > 0) {
    console.log('\n📄 Response Content:');
    result.content.forEach((item, index) => {
      console.log(`\n--- Content Item ${index + 1} ---`);
      console.log(`Type: ${item.type}`);
      console.log(`Text length: ${item.text?.length || 0}`);
      console.log(`Text preview: ${item.text?.substring(0, 200) || 'N/A'}...`);

      // Check if the response contains generated code
      if (item.text && item.text.includes('generatedCode')) {
        console.log('🎉 Found generatedCode in response!');
      } else if (item.text && item.text.includes('files')) {
        console.log('🎉 Found files in response!');
      } else if (item.text && item.text.includes('HTML')) {
        console.log('🎉 Found HTML content in response!');
      } else {
        console.log('❌ No generated code found in response');
      }
    });
  }

  console.log('\n📊 Full Response:');
  console.log(JSON.stringify(result, null, 2));

} catch (error) {
  console.error('❌ Smart Vibe execution failed:', error);
}

console.log('\n🔍 Debug Complete');
