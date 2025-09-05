#!/usr/bin/env node

/**
 * Deployed MCP Server Testing
 *
 * Test the actual deployed Docker MCP server by sending MCP requests
 * and measuring code quality with exact prompts shown
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

// Send MCP request to deployed Docker server
async function sendMCPRequest(method, params) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('MCP request timeout'));
    }, MCP_CONFIG.timeout);

    // Create MCP request
    const request = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: method,
      params: params
    };

    console.log('📤 Sending MCP Request:');
    console.log('📤 Method:', method);
    console.log('📤 Params:', JSON.stringify(params, null, 2));

    // Use docker exec to send request to the deployed MCP server
    const dockerProcess = spawn('docker', ['exec', '-i', MCP_CONFIG.containerName, 'node', '-e', `
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

// Test HTML generation via deployed MCP
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

    let projectId = '';
    try {
      const projectData = JSON.parse(projectResult);
      if (projectData.result && projectData.result.data && projectData.result.data.projectId) {
        projectId = projectData.result.data.projectId;
      }
    } catch (parseError) {
      console.log('⚠️ Could not parse project response');
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
      console.log('⚠️ Could not parse smart_write response');
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

// Test TypeScript generation via deployed MCP
async function testTypeScriptGeneration() {
  console.log('\n🧪 Testing: TypeScript Generation via Deployed MCP Server');
  console.log('==========================================================');

  try {
    // Step 1: Create project
    console.log('📝 Step 1: Creating project with smart_begin...');
    const projectResult = await sendMCPRequest('tools/call', {
      name: 'smart_begin',
      arguments: {
        projectName: "deployed-ts-test",
        projectType: "typescript",
        description: "Test project for deployed MCP TypeScript generation"
      }
    });

    let projectId = '';
    try {
      const projectData = JSON.parse(projectResult);
      if (projectData.result && projectData.result.data && projectData.result.data.projectId) {
        projectId = projectData.result.data.projectId;
      }
    } catch (parseError) {
      console.log('⚠️ Could not parse project response');
    }

    if (!projectId) {
      throw new Error('Could not extract project ID from smart_begin response');
    }

    console.log('✅ Project created with ID:', projectId);

    // Step 2: Generate TypeScript
    console.log('\n📝 Step 2: Generating TypeScript with smart_write...');
    console.log('📝 Exact Prompt to MCP:', TEST_PROMPTS.typescript);

    const tsResult = await sendMCPRequest('tools/call', {
      name: 'smart_write',
      arguments: {
        projectId: projectId,
        featureDescription: TEST_PROMPTS.typescript,
        targetRole: 'developer',
        codeType: 'function',
        techStack: ['TypeScript', 'Node.js']
      }
    });

    console.log('📥 MCP Response (smart_write):');
    console.log(tsResult);

    // Parse and analyze response
    let generatedCode = '';
    let thoughtProcess = null;
    let qualityMetrics = null;

    try {
      const response = JSON.parse(tsResult);
      if (response.result && response.result.data) {
        const data = response.result.data;

        if (data.generatedCode && data.generatedCode.files) {
          const tsFile = data.generatedCode.files.find(file => file.type === 'typescript' || file.path.endsWith('.ts'));
          if (tsFile) {
            generatedCode = tsFile.content;
          }
        }

        thoughtProcess = data.thoughtProcess;
        qualityMetrics = data.qualityMetrics;
      }
    } catch (parseError) {
      console.log('⚠️ Could not parse smart_write response');
    }

    // Analyze quality
    const qualityScore = analyzeTypeScriptQuality(generatedCode);

    console.log('\n📊 TypeScript Quality Analysis:');
    console.log('=================================');
    console.log('Code length:', generatedCode.length, 'characters');
    console.log('Quality score:', qualityScore, '/100');
    console.log('Has function:', generatedCode.includes('function'));
    console.log('Has TypeScript types:', generatedCode.includes(': string') || generatedCode.includes(': boolean'));
    console.log('Has error handling:', generatedCode.includes('try') || generatedCode.includes('catch'));

    // Save generated code
    if (generatedCode) {
      const outputDir = path.join(__dirname, 'deployed-mcp-generated');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const filename = `deployed-typescript-${Date.now()}.ts`;
      const filepath = path.join(outputDir, filename);
      fs.writeFileSync(filepath, generatedCode);

      console.log('\n💾 Generated TypeScript saved:');
      console.log('📁 File:', filepath);
    }

    return {
      success: true,
      prompt: TEST_PROMPTS.typescript,
      code: generatedCode,
      qualityScore: qualityScore,
      thoughtProcess: thoughtProcess,
      qualityMetrics: qualityMetrics,
      filepath: generatedCode ? path.join(outputDir, filename) : null
    };

  } catch (error) {
    console.log('❌ TypeScript generation test failed:', error.message);
    return { success: false, error: error.message, prompt: TEST_PROMPTS.typescript };
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

// Analyze TypeScript quality
function analyzeTypeScriptQuality(code) {
  if (!code || code.trim().length === 0) return 0;

  let score = 0;
  if (code.includes('function')) score += 15;
  if (code.includes('export')) score += 10;
  if (code.includes(': string') || code.includes(': boolean')) score += 15;
  if (code.includes('interface') || code.includes('type ')) score += 10;
  if (code.includes('try') || code.includes('catch')) score += 10;
  if (code.includes('throw') || code.includes('Error')) score += 10;
  if (code.includes('return')) score += 10;
  if (code.includes('const') || code.includes('let')) score += 10;
  if (code.includes('if') || code.includes('else')) score += 10;

  return Math.min(score, 100);
}

// Main execution
async function runDeployedMCPTest() {
  console.log('🚀 Starting Deployed MCP Server Testing');
  console.log('========================================');
  console.log('🎯 Testing actual deployed Docker MCP server');

  const results = {
    html: null,
    typescript: null,
    overallScore: 0,
    totalTests: 0,
    passedTests: 0
  };

  try {
    // Test HTML generation
    results.html = await testHTMLGeneration();
    results.totalTests++;
    if (results.html.success) results.passedTests++;

    // Test TypeScript generation
    results.typescript = await testTypeScriptGeneration();
    results.totalTests++;
    if (results.typescript.success) results.passedTests++;

    // Calculate overall score
    let totalScore = 0;
    let scoreCount = 0;

    if (results.html?.qualityScore) {
      totalScore += results.html.qualityScore;
      scoreCount++;
    }
    if (results.typescript?.qualityScore) {
      totalScore += results.typescript.qualityScore;
      scoreCount++;
    }

    results.overallScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

  } catch (error) {
    console.log('❌ Test execution failed:', error.message);
  }

  // Summary
  console.log('\n📊 Deployed MCP Test Results Summary');
  console.log('=====================================');
  console.log('HTML Generation:', results.html?.success ? '✅ PASS' : '❌ FAIL');
  console.log('TypeScript Generation:', results.typescript?.success ? '✅ PASS' : '❌ FAIL');
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
runDeployedMCPTest().catch(console.error);
