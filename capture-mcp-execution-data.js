#!/usr/bin/env node

/**
 * MCP Execution Data Capture
 *
 * Actually capture real execution data from MCP server calls
 * and generate a report based on actual data, not assumptions
 */

const fs = require('fs');
const path = require('path');

// Execution data storage
let executionData = {
  timestamp: new Date().toISOString(),
  testRun: {
    id: `test_${Date.now()}`,
    startTime: Date.now(),
    endTime: null,
    duration: null
  },
  functionCalls: [],
  responses: [],
  aiReasoning: [],
  qualityMetrics: [],
  errors: [],
  generatedFiles: []
};

// Capture function call data
function captureFunctionCall(functionName, inputParams, startTime) {
  const callData = {
    functionName,
    inputParams,
    startTime,
    endTime: null,
    duration: null,
    response: null,
    error: null
  };

  executionData.functionCalls.push(callData);
  console.log(`📞 Captured function call: ${functionName}`);
  return callData;
}

// Capture response data
function captureResponse(callData, response, endTime) {
  callData.endTime = endTime;
  callData.duration = endTime - callData.startTime;
  callData.response = response;

  executionData.responses.push({
    functionName: callData.functionName,
    response,
    duration: callData.duration,
    timestamp: new Date(endTime).toISOString()
  });

  console.log(`📥 Captured response for ${callData.functionName} (${callData.duration}ms)`);
}

// Capture AI reasoning data
function captureAIReasoning(thoughtProcess) {
  executionData.aiReasoning.push({
    timestamp: new Date().toISOString(),
    thoughtProcess,
    stepCount: Object.keys(thoughtProcess).length,
    confidence: thoughtProcess.step2_detection?.confidence || 0
  });

  console.log(`🧠 Captured AI reasoning with ${Object.keys(thoughtProcess).length} steps`);
}

// Capture quality metrics
function captureQualityMetrics(metrics) {
  executionData.qualityMetrics.push({
    timestamp: new Date().toISOString(),
    metrics,
    overallScore: calculateOverallScore(metrics)
  });

  console.log(`📊 Captured quality metrics (score: ${calculateOverallScore(metrics)})`);
}

// Calculate overall quality score
function calculateOverallScore(metrics) {
  if (!metrics) return 0;

  const scores = [];
  if (metrics.testCoverage) scores.push(metrics.testCoverage);
  if (metrics.securityScore) scores.push(metrics.securityScore);
  if (metrics.maintainability) scores.push(metrics.maintainability);

  return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
}

// Capture generated files
function captureGeneratedFile(filePath, content, fileType) {
  const fileData = {
    timestamp: new Date().toISOString(),
    filePath,
    fileType,
    contentLength: content.length,
    content: content.substring(0, 500) + (content.length > 500 ? '...' : ''), // Truncate for storage
    fullPath: path.resolve(filePath)
  };

  executionData.generatedFiles.push(fileData);
  console.log(`📁 Captured generated file: ${filePath} (${content.length} chars)`);
}

// Capture errors
function captureError(functionName, error) {
  executionData.errors.push({
    timestamp: new Date().toISOString(),
    functionName,
    error: error.message,
    stack: error.stack
  });

  console.log(`❌ Captured error in ${functionName}: ${error.message}`);
}

// Enhanced test function with real data capture
async function testHTMLGenerationWithCapture() {
  console.log('🧪 Testing: HTML Generation with Real Data Capture');
  console.log('==================================================');

  const htmlPrompt = "create me an html page that has a header a footer and says 'i'am the best' in the body";

  try {
    // Capture smart_begin call
    const beginStartTime = Date.now();
    const beginCall = captureFunctionCall('handleSmartBegin', {
      projectName: "html-test-project",
      projectType: "web",
      description: "Test project for HTML generation quality testing"
    }, beginStartTime);

    // Import and call smart_begin
    const { handleSmartBegin } = await import('./dist/tools/smart_begin.js');
    const projectResult = await handleSmartBegin({
      projectName: "html-test-project",
      projectType: "web",
      description: "Test project for HTML generation quality testing"
    });

    // Capture smart_begin response
    const beginEndTime = Date.now();
    captureResponse(beginCall, projectResult, beginEndTime);

    // Extract project ID
    let projectId = '';
    if (projectResult && projectResult.data && projectResult.data.projectId) {
      projectId = projectResult.data.projectId;
    }

    if (!projectId) {
      throw new Error('Could not extract project ID from smart_begin response');
    }

    // Capture smart_write call
    const writeStartTime = Date.now();
    const writeCall = captureFunctionCall('handleSmartWrite', {
      projectId: projectId,
      featureDescription: htmlPrompt,
      targetRole: 'developer',
      codeType: 'component',
      techStack: ['HTML', 'CSS', 'JavaScript']
    }, writeStartTime);

    // Import and call smart_write
    const { handleSmartWrite } = await import('./dist/tools/smart_write.js');
    const result = await handleSmartWrite({
      projectId: projectId,
      featureDescription: htmlPrompt,
      targetRole: 'developer',
      codeType: 'component',
      techStack: ['HTML', 'CSS', 'JavaScript'],
      qualityRequirements: {
        testCoverage: 80,
        complexity: 3,
        securityLevel: 'medium'
      }
    });

    // Capture smart_write response
    const writeEndTime = Date.now();
    captureResponse(writeCall, result, writeEndTime);

    // Extract and capture data
    let generatedCode = '';
    let thoughtProcess = null;
    let qualityMetrics = null;

    if (result && result.data) {
      const data = result.data;

      if (data.generatedCode && data.generatedCode.files) {
        const htmlFile = data.generatedCode.files.find(file => file.type === 'html');
        if (htmlFile) {
          generatedCode = htmlFile.content;
        }
      }

      thoughtProcess = data.thoughtProcess;
      qualityMetrics = data.qualityMetrics;
    }

    // Capture AI reasoning
    if (thoughtProcess) {
      captureAIReasoning(thoughtProcess);
    }

    // Capture quality metrics
    if (qualityMetrics) {
      captureQualityMetrics(qualityMetrics);
    }

    // Save generated code and capture file data
    if (generatedCode) {
      const outputDir = path.join(__dirname, 'captured-generated');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const filename = `captured-html-${Date.now()}.html`;
      const filepath = path.join(outputDir, filename);
      fs.writeFileSync(filepath, generatedCode);

      captureGeneratedFile(filepath, generatedCode, 'html');
    }

    // Complete test run
    executionData.testRun.endTime = Date.now();
    executionData.testRun.duration = executionData.testRun.endTime - executionData.testRun.startTime;

    console.log('\n✅ Test completed with real data capture');
    return {
      success: true,
      executionData,
      generatedCode,
      qualityScore: calculateOverallScore(qualityMetrics)
    };

  } catch (error) {
    captureError('testHTMLGenerationWithCapture', error);
    executionData.testRun.endTime = Date.now();
    executionData.testRun.duration = executionData.testRun.endTime - executionData.testRun.startTime;

    return {
      success: false,
      error: error.message,
      executionData
    };
  }
}

// Generate report from actual captured data
function generateReportFromCapturedData(executionData) {
  const report = `
# MCP Server Execution Report - Real Captured Data

## 📊 Test Run Summary
- **Test ID:** ${executionData.testRun.id}
- **Start Time:** ${new Date(executionData.testRun.startTime).toISOString()}
- **End Time:** ${new Date(executionData.testRun.endTime).toISOString()}
- **Duration:** ${executionData.testRun.duration}ms
- **Function Calls:** ${executionData.functionCalls.length}
- **Responses:** ${executionData.responses.length}
- **Errors:** ${executionData.errors.length}
- **Generated Files:** ${executionData.generatedFiles.length}

## 📞 Actual Function Calls Captured

${executionData.functionCalls.map((call, index) => `
### ${index + 1}. ${call.functionName}
- **Input Parameters:** ${JSON.stringify(call.inputParams, null, 2)}
- **Duration:** ${call.duration}ms
- **Start Time:** ${new Date(call.startTime).toISOString()}
- **End Time:** ${new Date(call.endTime).toISOString()}
- **Response Size:** ${call.response ? JSON.stringify(call.response).length : 0} characters
- **Error:** ${call.error || 'None'}
`).join('\n')}

## 🧠 AI Reasoning Captured

${executionData.aiReasoning.map((reasoning, index) => `
### Reasoning ${index + 1}
- **Timestamp:** ${reasoning.timestamp}
- **Step Count:** ${reasoning.stepCount}
- **Confidence:** ${reasoning.confidence}%
- **Thought Process:** ${JSON.stringify(reasoning.thoughtProcess, null, 2)}
`).join('\n')}

## 📊 Quality Metrics Captured

${executionData.qualityMetrics.map((metrics, index) => `
### Metrics ${index + 1}
- **Timestamp:** ${metrics.timestamp}
- **Overall Score:** ${metrics.overallScore}/100
- **Raw Metrics:** ${JSON.stringify(metrics.metrics, null, 2)}
`).join('\n')}

## 📁 Generated Files Captured

${executionData.generatedFiles.map((file, index) => `
### File ${index + 1}
- **Path:** ${file.filePath}
- **Type:** ${file.fileType}
- **Size:** ${file.contentLength} characters
- **Full Path:** ${file.fullPath}
- **Content Preview:** ${file.content}
`).join('\n')}

## ❌ Errors Captured

${executionData.errors.map((error, index) => `
### Error ${index + 1}
- **Function:** ${error.functionName}
- **Timestamp:** ${error.timestamp}
- **Message:** ${error.error}
- **Stack:** ${error.stack}
`).join('\n')}

## 📈 Performance Analysis
- **Total Function Calls:** ${executionData.functionCalls.length}
- **Average Call Duration:** ${executionData.functionCalls.length > 0 ? Math.round(executionData.functionCalls.reduce((sum, call) => sum + (call.duration || 0), 0) / executionData.functionCalls.length) : 0}ms
- **Total Test Duration:** ${executionData.testRun.duration}ms
- **Success Rate:** ${executionData.errors.length === 0 ? '100%' : `${Math.round((executionData.functionCalls.length - executionData.errors.length) / executionData.functionCalls.length * 100)}%`}
`;

  return report;
}

// Main execution
async function runCapturedTest() {
  console.log('🚀 Starting MCP Execution Data Capture');
  console.log('======================================');

  const result = await testHTMLGenerationWithCapture();

  // Save captured data
  const dataPath = path.join(__dirname, 'captured-execution-data.json');
  fs.writeFileSync(dataPath, JSON.stringify(executionData, null, 2));

  // Generate report from captured data
  const report = generateReportFromCapturedData(executionData);
  const reportPath = path.join(__dirname, 'mcp-execution-report.md');
  fs.writeFileSync(reportPath, report);

  console.log('\n📄 Captured Data Saved:');
  console.log('📁 Data:', dataPath);
  console.log('📁 Report:', reportPath);

  console.log('\n📊 Captured Data Summary:');
  console.log('Function Calls:', executionData.functionCalls.length);
  console.log('Responses:', executionData.responses.length);
  console.log('AI Reasoning Steps:', executionData.aiReasoning.length);
  console.log('Quality Metrics:', executionData.qualityMetrics.length);
  console.log('Generated Files:', executionData.generatedFiles.length);
  console.log('Errors:', executionData.errors.length);

  return result;
}

// Run the captured test
runCapturedTest().catch(console.error);
