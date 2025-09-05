#!/usr/bin/env node

/**
 * Proper MCP stdio Communication Test
 *
 * Test the deployed Docker MCP server using proper stdio communication
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const MCP_CONFIG = {
  containerName: 'tappmcp-smart-mcp-1',
  timeout: 30000
};

// Test prompts
const TEST_PROMPTS = {
  html: "create me an html page that has a header a footer and says 'i'am the best' in the body",
  typescript: "create a typescript function that validates email addresses with proper error handling"
};

// Send MCP request via proper stdio communication
async function sendMCPRequest(method, params) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('MCP request timeout'));
    }, MCP_CONFIG.timeout);

    console.log('📤 Sending MCP Request:');
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
    const dockerProcess = spawn('docker', ['exec', '-i', MCP_CONFIG.containerName, 'node', 'dist/server.js'], {
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
        reject(new Error(`MCP server exited with code ${code}: ${stderr}`));
        return;
      }
      resolve(stdout);
    });

    dockerProcess.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    // Send the request
    dockerProcess.stdin.write(JSON.stringify(request) + '\n');
    dockerProcess.stdin.end();
  });
}

// Test HTML generation
async function testHTMLGeneration() {
  console.log('\n🧪 Testing: HTML Generation via Deployed MCP Server');
  console.log('====================================================');

  try {
    // Step 1: Create project
    console.log('📝 Step 1: Creating project with smart_begin...');
    const projectResult = await sendMCPRequest('tools/call', {
      name: 'smart_begin',
      arguments: {
        projectName: "deployed-html-test",
        projectType: "web",
        description: "Test project for deployed MCP HTML generation"
      }
    });

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
    console.log('📝 Exact Prompt to MCP:', TEST_PROMPTS.html);

    const htmlResult = await sendMCPRequest('tools/call', {
      name: 'smart_write',
      arguments: {
        projectId: projectId,
        featureDescription: TEST_PROMPTS.html,
        targetRole: 'developer',
        codeType: 'component',
        techStack: ['HTML', 'CSS', 'JavaScript']
      }
    });

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

    // Analyze quality
    const qualityScore = analyzeHTMLQuality(generatedCode);

    console.log('\n📊 HTML Quality Analysis:');
    console.log('============================');
    console.log('Code length:', generatedCode.length, 'characters');
    console.log('Quality score:', qualityScore, '/100');
    console.log('Has HTML structure:', generatedCode.includes('<html') && generatedCode.includes('<head') && generatedCode.includes('<body'));
    console.log('Has required elements:', generatedCode.includes('<header') && generatedCode.includes('<footer'));
    console.log('Has required text:', generatedCode.toLowerCase().includes("i'am the best"));

    // Save generated code
    if (generatedCode) {
      const outputDir = path.join(__dirname, 'deployed-mcp-generated');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const filename = `deployed-html-${Date.now()}.html`;
      const filepath = path.join(outputDir, filename);
      fs.writeFileSync(filepath, generatedCode);

      console.log('\n💾 Generated HTML saved:');
      console.log('📁 File:', filepath);
    }

    return {
      success: true,
      prompt: TEST_PROMPTS.html,
      code: generatedCode,
      qualityScore: qualityScore,
      thoughtProcess: thoughtProcess,
      qualityMetrics: qualityMetrics,
      filepath: generatedCode ? path.join(outputDir, filename) : null
    };

  } catch (error) {
    console.log('❌ HTML generation test failed:', error.message);
    return { success: false, error: error.message, prompt: TEST_PROMPTS.html };
  }
}

// Analyze HTML quality
function analyzeHTMLQuality(html) {
  if (!html || html.trim().length === 0) return 0;

  let score = 0;
  if (html.includes('<!DOCTYPE')) score += 10;
  if (html.includes('<html')) score += 10;
  if (html.includes('<head')) score += 10;
  if (html.includes('<body')) score += 10;
  if (html.includes('<header') || html.includes('<h1')) score += 15;
  if (html.includes('<footer')) score += 15;
  if (html.toLowerCase().includes("i'am the best")) score += 20;
  if (html.includes('<style')) score += 10;

  return Math.min(score, 100);
}

// Main execution
async function runMCPTest() {
  console.log('🚀 Starting Deployed MCP Server Testing');
  console.log('========================================');
  console.log('🎯 Testing actual deployed Docker MCP server via stdio');

  const results = {
    html: null,
    overallScore: 0,
    totalTests: 0,
    passedTests: 0
  };

  try {
    // Test HTML generation
    results.html = await testHTMLGeneration();
    results.totalTests++;
    if (results.html.success) results.passedTests++;

    // Calculate overall score
    results.overallScore = results.html?.qualityScore || 0;

  } catch (error) {
    console.log('❌ Test execution failed:', error.message);
  }

  // Summary
  console.log('\n📊 Deployed MCP Test Results Summary');
  console.log('=====================================');
  console.log('HTML Generation:', results.html?.success ? '✅ PASS' : '❌ FAIL');
  console.log('Overall Score:', results.overallScore, '/100');
  console.log('Tests Passed:', results.passedTests, '/', results.totalTests);

  const grade = results.overallScore >= 90 ? 'A' :
                results.overallScore >= 80 ? 'B' :
                results.overallScore >= 70 ? 'C' :
                results.overallScore >= 60 ? 'D' : 'F';

  console.log('Grade:', grade);

  if (results.overallScore >= 70) {
    console.log('\n🎉 Deployed MCP Server Test PASSED!');
  } else {
    console.log('\n❌ Deployed MCP Server Test FAILED!');
  }

  return results;
}

// Run the test
runMCPTest().catch(console.error);
