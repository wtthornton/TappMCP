#!/usr/bin/env node

/**
 * Test Execution Log Capture
 *
 * Test the MCP server with detailed execution logging
 */

const fs = require('fs');
const path = require('path');

async function testExecutionLog() {
  console.log('🧪 Testing: MCP Server Execution Logging');
  console.log('=========================================');

  try {
    // Import and call smart_begin
    const { handleSmartBegin } = await import('./dist/tools/smart_begin.js');
    const projectResult = await handleSmartBegin({
      projectName: "execution-log-test",
      projectType: "web",
      description: "Test project for execution logging"
    });

    const projectId = projectResult.data.projectId;
    console.log('✅ Project created with ID:', projectId);

    // Import and call smart_write
    const { handleSmartWrite } = await import('./dist/tools/smart_write.js');
    const result = await handleSmartWrite({
      projectId: projectId,
      featureDescription: "create me an html page that has a header a footer and says 'i'am the best' in the body",
      targetRole: 'developer',
      codeType: 'component',
      techStack: ['HTML', 'CSS', 'JavaScript']
    });

    console.log('\n📊 MCP Response Analysis:');
    console.log('==========================');
    console.log('Success:', result.success);
    console.log('Data keys:', Object.keys(result.data || {}));
    console.log('Has executionLog:', result.data?.executionLog ? 'YES' : 'NO');

    // Show full response structure
    console.log('\n📋 Full Response Structure:');
    console.log(JSON.stringify(result, null, 2));

    if (result.data?.executionLog) {
      console.log('\n🔧 Execution Log Details:');
      console.log('=========================');
      console.log('Total Duration:', result.data.executionLog.totalDuration, 'ms');
      console.log('Function Calls:', result.data.executionLog.functionCalls.length);
      console.log('External Tools:', result.data.executionLog.externalTools.length);
      console.log('Data Flow Steps:', result.data.executionLog.dataFlow.length);

      console.log('\n📞 Function Calls:');
      result.data.executionLog.functionCalls.forEach((call, index) => {
        console.log(`  ${index + 1}. ${call.function} (${call.duration || 'N/A'}ms)`);
        if (call.externalTools && call.externalTools.length > 0) {
          console.log(`     External tools: ${call.externalTools.join(', ')}`);
        }
      });

      console.log('\n🔧 External Tools:');
      result.data.executionLog.externalTools.forEach((tool, index) => {
        console.log(`  ${index + 1}. ${tool.tool} - ${tool.purpose}`);
      });

      console.log('\n📊 Data Flow:');
      result.data.executionLog.dataFlow.forEach((flow, index) => {
        console.log(`  ${index + 1}. ${flow.step}`);
      });
    } else {
      console.log('❌ No execution log found in response');
    }

    // Save the execution log
    if (result.data?.executionLog) {
      const logPath = path.join(__dirname, 'execution-log.json');
      fs.writeFileSync(logPath, JSON.stringify(result.data.executionLog, null, 2));
      console.log('\n💾 Execution log saved:', logPath);
    }

    return result;

  } catch (error) {
    console.log('❌ Test failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Run the test
testExecutionLog().catch(console.error);
