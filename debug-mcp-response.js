#!/usr/bin/env node

/**
 * Debug MCP Tool Response
 *
 * This script tests the smart_write tool directly to see what response structure
 * it actually returns, helping us understand why MCP tools return metadata only.
 */

import { handleSmartWrite } from './dist/tools/smart-write.js';

async function debugSmartWriteResponse() {
  console.log('🔍 Debugging smart_write tool response...\n');

  try {
    const result = await handleSmartWrite({
      projectId: 'debug_test_project',
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
    });

    console.log('📊 Response Structure:');
    console.log('====================');
    console.log(JSON.stringify(result, null, 2));

    console.log('\n🔍 Response Analysis:');
    console.log('====================');
    console.log(`Success: ${result.success}`);
    console.log(`Has data: ${!!result.data}`);
    console.log(`Data type: ${typeof result.data}`);

    if (result.data) {
      console.log(`Data keys: ${Object.keys(result.data).join(', ')}`);

      if (result.data.generatedCode) {
        console.log(`Has generatedCode: ${!!result.data.generatedCode}`);
        if (result.data.generatedCode.files) {
          console.log(`Files count: ${result.data.generatedCode.files.length}`);
          if (result.data.generatedCode.files.length > 0) {
            const firstFile = result.data.generatedCode.files[0];
            console.log(`First file path: ${firstFile.path}`);
            console.log(`First file type: ${firstFile.type}`);
            console.log(`First file content length: ${firstFile.content?.length || 0}`);
            console.log(`First file content preview: ${firstFile.content?.substring(0, 100) || 'N/A'}...`);
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ Error testing smart_write:', error);
  }
}

debugSmartWriteResponse();
