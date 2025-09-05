#!/usr/bin/env node

/**
 * Proper MCP Client for Deployed Server
 *
 * Communicate with the running MCP server via stdio transport
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Execution data storage
let executionData = {
  timestamp: new Date().toISOString(),
  testRun: {
    id: `mcp_client_test_${Date.now()}`,
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

// Send MCP request via proper stdio communication
async function sendMCPRequest(method, params) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('MCP request timeout'));
    }, 30000);

    console.log('📤 Sending MCP Request via stdio:');
    console.log('📤 Method:', method);
    console.log('📤 Params:', JSON.stringify(params, null, 2));

    // Create MCP request
    const request = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: method,
      params: params
    };

    // Use docker exec to communicate with the MCP server via stdio
    const dockerProcess = spawn('docker', ['exec', '-i', 'tappmcp-smart-mcp-1', 'node', '-e', `
      const { spawn } = require('child_process');
      const server = spawn('node', ['dist/server.js'], { stdio: ['pipe', 'pipe', 'pipe'] });

      const request = ${JSON.stringify(request)};

      server.stdin.write(JSON.stringify(request) + '\\n');
      server.stdin.end();

      let output = '';
      server.stdout.on('data', (data) => {
        output += data.toString();
      });

      server.on('close', () => {
        console.log(output);
      });
    `], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    dockerProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    dockerProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    dockerProcess.on('close', (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        reject(new Error(`Docker MCP call failed: ${stderr}`));
        return;
      }
      resolve(stdout);
    });

    dockerProcess.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

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
    content: content.substring(0, 500) + (content.length > 500 ? '...' : ''),
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

// Test HTML generation with proper MCP client
async function testMCPClientHTMLGeneration() {
  console.log('🧪 Testing: HTML Generation via MCP Client');
  console.log('===========================================');

  const htmlPrompt = "create me an html page that has a header a footer and says 'i'am the best' in the body";

  try {
    // Step 1: Create project
    console.log('📝 Step 1: Creating project with smart_begin...');
    const beginStartTime = Date.now();
    const beginCall = captureFunctionCall('smart_begin', {
      projectName: "mcp-client-test",
      projectType: "web",
      description: "Test project for MCP client HTML generation"
    }, beginStartTime);

    const projectResult = await sendMCPRequest('tools/call', {
      name: 'smart_begin',
      arguments: {
        projectName: "mcp-client-test",
        projectType: "web",
        description: "Test project for MCP client HTML generation"
      }
    });

    const beginEndTime = Date.now();
    captureResponse(beginCall, projectResult, beginEndTime);

    console.log('📥 MCP Response (smart_begin):');
    console.log(projectResult);

    // Parse project response
    let projectId = '';
    try {
      const projectData = JSON.parse(projectResult);
      if (projectData.result && projectData.result.data && projectData.result.data.projectId) {
        projectId = projectData.result.data.projectId;
      }
    } catch (parseError) {
      console.log('⚠️ Could not parse project response as JSON');
      console.log('Raw response:', projectResult);
    }

    if (!projectId) {
      throw new Error('Could not extract project ID from smart_begin response');
    }

    console.log('✅ Project created with ID:', projectId);

    // Step 2: Generate HTML
    console.log('\n📝 Step 2: Generating HTML with smart_write...');
    console.log('📝 Exact Prompt to MCP:', htmlPrompt);

    const writeStartTime = Date.now();
    const writeCall = captureFunctionCall('smart_write', {
      projectId: projectId,
      featureDescription: htmlPrompt,
      targetRole: 'developer',
      codeType: 'component',
      techStack: ['HTML', 'CSS', 'JavaScript']
    }, writeStartTime);

    const htmlResult = await sendMCPRequest('tools/call', {
      name: 'smart_write',
      arguments: {
        projectId: projectId,
        featureDescription: htmlPrompt,
        targetRole: 'developer',
        codeType: 'component',
        techStack: ['HTML', 'CSS', 'JavaScript']
      }
    });

    const writeEndTime = Date.now();
    captureResponse(writeCall, htmlResult, writeEndTime);

    console.log('📥 MCP Response (smart_write):');
    console.log(htmlResult);

    // Parse and analyze response
    let generatedCode = '';
    let thoughtProcess = null;
    let qualityMetrics = null;

    try {
      const response = JSON.parse(htmlResult);
      if (response.result && response.result.data) {
        const data = response.result.data;

        if (data.generatedCode && data.generatedCode.files) {
          const htmlFile = data.generatedCode.files.find(file => file.type === 'html');
          if (htmlFile) {
            generatedCode = htmlFile.content;
          }
        }

        thoughtProcess = data.thoughtProcess;
        qualityMetrics = data.qualityMetrics;
      }
    } catch (parseError) {
      console.log('⚠️ Could not parse smart_write response as JSON');
      console.log('Raw response:', htmlResult);
    }

    // Capture AI reasoning
    if (thoughtProcess) {
      captureAIReasoning(thoughtProcess);
    }

    // Capture quality metrics
    if (qualityMetrics) {
      captureQualityMetrics(qualityMetrics);
    }

    // Analyze quality
    const qualityScore = calculateOverallScore(qualityMetrics);

    console.log('\n📊 HTML Quality Analysis:');
    console.log('============================');
    console.log('Code length:', generatedCode.length, 'characters');
    console.log('Quality score:', qualityScore, '/100');
    console.log('Has HTML structure:', generatedCode.includes('<html') && generatedCode.includes('<head') && generatedCode.includes('<body'));
    console.log('Has required elements:', generatedCode.includes('<header') && generatedCode.includes('<footer'));
    console.log('Has required text:', generatedCode.toLowerCase().includes("i'am the best"));

    // Save generated code and capture file data
    if (generatedCode) {
      const outputDir = path.join(__dirname, 'mcp-client-generated');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const filename = `mcp-client-html-${Date.now()}.html`;
      const filepath = path.join(outputDir, filename);
      fs.writeFileSync(filepath, generatedCode);

      captureGeneratedFile(filepath, generatedCode, 'html');

      console.log('\n💾 Generated HTML saved:');
      console.log('📁 File:', filepath);
    }

    // Complete test run
    executionData.testRun.endTime = Date.now();
    executionData.testRun.duration = executionData.testRun.endTime - executionData.testRun.startTime;

    console.log('\n✅ MCP client test completed with real data capture');
    return {
      success: true,
      executionData,
      generatedCode,
      qualityScore,
      thoughtProcess,
      qualityMetrics,
      filepath: generatedCode ? path.join(outputDir, filename) : null
    };

  } catch (error) {
    captureError('testMCPClientHTMLGeneration', error);
    executionData.testRun.endTime = Date.now();
    executionData.testRun.duration = executionData.testRun.endTime - executionData.testRun.startTime;

    console.log('❌ MCP client HTML generation test failed:', error.message);
    return {
      success: false,
      error: error.message,
      executionData
    };
  }
}

// Generate report from actual captured data
function generateMCPClientReport(executionData) {
  const report = `
# MCP Client Execution Report - Real Captured Data

## 📊 Test Run Summary
- **Test ID:** ${executionData.testRun.id}
- **Start Time:** ${new Date(executionData.testRun.startTime).toISOString()}
- **End Time:** ${new Date(executionData.testRun.endTime).toISOString()}
- **Duration:** ${executionData.testRun.duration}ms
- **Function Calls:** ${executionData.functionCalls.length}
- **Responses:** ${executionData.responses.length}
- **Errors:** ${executionData.errors.length}
- **Generated Files:** ${executionData.generatedFiles.length}

## 📞 Actual Function Calls to MCP Server

${executionData.functionCalls.map((call, index) => `
### ${index + 1}. ${call.functionName}
- **Input Parameters:** ${JSON.stringify(call.inputParams, null, 2)}
- **Duration:** ${call.duration}ms
- **Start Time:** ${new Date(call.startTime).toISOString()}
- **End Time:** ${new Date(call.endTime).toISOString()}
- **Response Size:** ${call.response ? JSON.stringify(call.response).length : 0} characters
- **Error:** ${call.error || 'None'}
`).join('\n')}

## 🧠 AI Reasoning Captured from MCP Server

${executionData.aiReasoning.map((reasoning, index) => `
### Reasoning ${index + 1}
- **Timestamp:** ${reasoning.timestamp}
- **Step Count:** ${reasoning.stepCount}
- **Confidence:** ${reasoning.confidence}%
- **Thought Process:** ${JSON.stringify(reasoning.thoughtProcess, null, 2)}
`).join('\n')}

## 📊 Quality Metrics from MCP Server

${executionData.qualityMetrics.map((metrics, index) => `
### Metrics ${index + 1}
- **Timestamp:** ${metrics.timestamp}
- **Overall Score:** ${metrics.overallScore}/100
- **Raw Metrics:** ${JSON.stringify(metrics.metrics, null, 2)}
`).join('\n')}

## 📁 Generated Files from MCP Server

${executionData.generatedFiles.map((file, index) => `
### File ${index + 1}
- **Path:** ${file.filePath}
- **Type:** ${file.fileType}
- **Size:** ${file.contentLength} characters
- **Full Path:** ${file.fullPath}
- **Content Preview:** ${file.content}
`).join('\n')}

## ❌ Errors from MCP Server

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
async function runMCPClientTest() {
  console.log('🚀 Starting MCP Client Testing');
  console.log('===============================');

  const result = await testMCPClientHTMLGeneration();

  // Save captured data
  const dataPath = path.join(__dirname, 'mcp-client-execution-data.json');
  fs.writeFileSync(dataPath, JSON.stringify(executionData, null, 2));

  // Generate report from captured data
  const report = generateMCPClientReport(executionData);
  const reportPath = path.join(__dirname, 'mcp-client-execution-report.md');
  fs.writeFileSync(reportPath, report);

  console.log('\n📄 MCP Client Data Saved:');
  console.log('📁 Data:', dataPath);
  console.log('📁 Report:', reportPath);

  console.log('\n📊 MCP Client Data Summary:');
  console.log('Function Calls:', executionData.functionCalls.length);
  console.log('Responses:', executionData.responses.length);
  console.log('AI Reasoning Steps:', executionData.aiReasoning.length);
  console.log('Quality Metrics:', executionData.qualityMetrics.length);
  console.log('Generated Files:', executionData.generatedFiles.length);
  console.log('Errors:', executionData.errors.length);

  return result;
}

// Run the MCP client test
runMCPClientTest().catch(console.error);
