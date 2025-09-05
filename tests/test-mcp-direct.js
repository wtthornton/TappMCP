#!/usr/bin/env node

/**
 * Direct MCP Testing
 *
 * Test the deployed Docker MCP server by calling smart_write tool
 * to generate HTML and measure code quality
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const MCP_CONFIG = {
  containerName: 'tappmcp-smart-mcp-1',
  timeout: 15000
};

// Test HTML generation
async function testHTMLGeneration() {
  console.log('🧪 Testing: HTML Generation via MCP smart_write');
  console.log('================================================');

  const htmlPrompt = "create me an html page that has a header a footer and says 'i'am the best' in the body";

  try {
    // Create MCP request
    const mcpRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "smart_write",
        arguments: {
          featureDescription: htmlPrompt,
          projectContext: "web-development",
          qualityLevel: "production"
        }
      }
    };

    console.log('📝 Sending MCP request...');
    console.log('📝 Prompt:', htmlPrompt);

    // Send request to Docker MCP server
    const result = await sendMCPRequest(mcpRequest);

    console.log('✅ MCP Response received');
    console.log('📊 Response length:', result.length, 'characters');

    // Parse response
    let response;
    try {
      response = JSON.parse(result);
      console.log('✅ Successfully parsed MCP response');
    } catch (parseError) {
      console.log('⚠️ Could not parse as JSON, treating as raw response');
      response = { content: [{ type: 'text', text: result }] };
    }

    // Extract generated code
    let generatedCode = '';
    let thoughtProcess = null;

    if (response.content && response.content[0] && response.content[0].text) {
      const content = JSON.parse(response.content[0].text);
      generatedCode = content.data?.generatedCode || content.data?.code || '';
      thoughtProcess = content.data?.thoughtProcess || null;
    }

    console.log('\n📊 Generated Code Analysis:');
    console.log('============================');
    console.log('Code length:', generatedCode.length, 'characters');
    console.log('Has HTML tag:', generatedCode.includes('<html'));
    console.log('Has head tag:', generatedCode.includes('<head'));
    console.log('Has body tag:', generatedCode.includes('<body'));
    console.log('Has header:', generatedCode.includes('<header') || generatedCode.includes('<h1'));
    console.log('Has footer:', generatedCode.includes('<footer'));
    console.log('Has required text:', generatedCode.toLowerCase().includes("i'am the best"));

    // Analyze quality
    const qualityScore = analyzeHTMLQuality(generatedCode);
    console.log('\n📈 Quality Score:', qualityScore, '/100');

    // Save generated code
    if (generatedCode) {
      const outputDir = path.join(__dirname, 'mcp-generated-code');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const filename = `html-test-${Date.now()}.html`;
      const filepath = path.join(outputDir, filename);
      fs.writeFileSync(filepath, generatedCode);

      console.log('\n💾 Generated code saved:');
      console.log('📁 File:', filepath);
      console.log('🔗 URL: file://' + filepath.replace(/\\/g, '/'));
    }

    // Display thought process if available
    if (thoughtProcess) {
      console.log('\n🧠 AI Thought Process:');
      console.log('======================');
      console.log('Decision:', thoughtProcess.step1_analysis?.decision || 'Not available');
      console.log('Confidence:', thoughtProcess.step2_detection?.confidence || 'Not available');
      console.log('Approach:', thoughtProcess.step3_generation?.chosenApproach || 'Not available');
    }

    return {
      success: true,
      code: generatedCode,
      qualityScore: qualityScore,
      thoughtProcess: thoughtProcess,
      filepath: generatedCode ? path.join(outputDir, filename) : null
    };

  } catch (error) {
    console.log('❌ HTML generation test failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Send MCP request to Docker container
async function sendMCPRequest(request) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('MCP request timeout'));
    }, MCP_CONFIG.timeout);

    // Use docker exec to send request to MCP server
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

// Analyze HTML quality
function analyzeHTMLQuality(html) {
  if (!html || html.trim().length === 0) {
    return 0;
  }

  let score = 0;

  // Basic structure (40 points)
  if (html.includes('<!DOCTYPE')) score += 10;
  if (html.includes('<html')) score += 10;
  if (html.includes('<head')) score += 10;
  if (html.includes('<body')) score += 10;

  // Required elements (30 points)
  if (html.includes('<header') || html.includes('<h1')) score += 15;
  if (html.includes('<footer')) score += 15;

  // Content (20 points)
  if (html.toLowerCase().includes("i'am the best")) score += 20;

  // Quality features (10 points)
  if (html.includes('<style')) score += 5;
  if (html.includes('<meta')) score += 5;

  return Math.min(score, 100);
}

// Main execution
async function runTest() {
  console.log('🚀 Starting Direct MCP Testing');
  console.log('===============================');

  const result = await testHTMLGeneration();

  console.log('\n📊 Test Results Summary');
  console.log('========================');
  console.log('Success:', result.success ? '✅ YES' : '❌ NO');
  if (result.success) {
    console.log('Quality Score:', result.qualityScore, '/100');
    console.log('Code Generated:', result.code ? '✅ YES' : '❌ NO');
    console.log('Thought Process:', result.thoughtProcess ? '✅ YES' : '❌ NO');
    console.log('File Saved:', result.filepath ? '✅ YES' : '❌ NO');
  } else {
    console.log('Error:', result.error);
  }

  const grade = result.qualityScore >= 90 ? 'A' :
                result.qualityScore >= 80 ? 'B' :
                result.qualityScore >= 70 ? 'C' :
                result.qualityScore >= 60 ? 'D' : 'F';

  console.log('Grade:', grade);

  if (result.success && result.qualityScore >= 70) {
    console.log('\n🎉 MCP HTML Generation Test PASSED!');
  } else {
    console.log('\n❌ MCP HTML Generation Test FAILED!');
  }
}

// Run the test
runTest().catch(console.error);
