#!/usr/bin/env node

/**
 * MCP HTML Generation Test
 *
 * This script tests the deployed TappMCP Docker container's HTML generation
 * capabilities by communicating via stdio with the MCP server.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const MCP_CONFIG = {
  containerName: 'tappmcp-smart-mcp-1',
  timeout: 30000
};

// Test data
const HTML_TEST_PROMPT = "create me an html page that has a header a footer and says 'i'am the best' in the body";

// Helper function to communicate with MCP server via stdio
function callMCPServer(method, params = {}) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('MCP request timeout'));
    }, MCP_CONFIG.timeout);

    // Spawn docker exec to run the MCP server
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
      resolve({ stdout, stderr });
    });

    dockerProcess.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    // Send MCP request
    const request = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: method,
      params: params
    };

    dockerProcess.stdin.write(JSON.stringify(request) + '\n');
    dockerProcess.stdin.end();
  });
}

// Test functions
async function testMCPInitialization() {
  console.log('\n🧪 Testing: MCP Server Initialization');
  try {
    const result = await callMCPServer('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {}
      },
      clientInfo: {
        name: 'html-test-client',
        version: '1.0.0'
      }
    });

    console.log('✅ MCP initialization successful');
    console.log('📊 Server response:', result.stdout);
    return true;
  } catch (error) {
    console.log('❌ MCP initialization failed:', error.message);
    return false;
  }
}

async function testSmartBegin() {
  console.log('\n🧪 Testing: Smart Begin Tool');
  try {
    const result = await callMCPServer('tools/call', {
      name: 'smart_begin',
      arguments: {
        projectName: 'html-generation-test',
        projectType: 'web',
        description: 'Test project for HTML generation capabilities'
      }
    });

    console.log('✅ Smart begin successful');
    console.log('📊 Project initialization response:', result.stdout);
    return true;
  } catch (error) {
    console.log('❌ Smart begin failed:', error.message);
    return false;
  }
}

async function testSmartWriteHTML() {
  console.log('\n🧪 Testing: Smart Write HTML Generation');
  try {
    const result = await callMCPServer('tools/call', {
      name: 'smart_write',
      arguments: {
        featureDescription: HTML_TEST_PROMPT,
        projectContext: 'web-development',
        qualityLevel: 'production'
      }
    });

    console.log('✅ Smart write HTML generation successful');
    console.log('📊 HTML generation response:', result.stdout);

    // Parse the response to extract generated code
    try {
      const response = JSON.parse(result.stdout);
      if (response.result && response.result.generatedCode) {
        console.log('📝 Generated HTML code found');
        return { success: true, code: response.result.generatedCode, fullResponse: response };
      }
    } catch (parseError) {
      console.log('⚠️ Could not parse response as JSON, treating as raw output');
      return { success: true, code: result.stdout, fullResponse: null };
    }

    return { success: true, code: result.stdout, fullResponse: null };
  } catch (error) {
    console.log('❌ Smart write HTML generation failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function analyzeGeneratedHTML(htmlCode) {
  console.log('\n🔍 Analyzing Generated HTML Code');

  const analysis = {
    hasHtmlTag: htmlCode.includes('<html'),
    hasHeadTag: htmlCode.includes('<head'),
    hasBodyTag: htmlCode.includes('<body'),
    hasHeaderTag: htmlCode.includes('<header') || htmlCode.includes('<h1'),
    hasFooterTag: htmlCode.includes('<footer') || htmlCode.includes('<h2'),
    hasRequiredText: htmlCode.toLowerCase().includes("i'am the best") || htmlCode.toLowerCase().includes("i'm the best"),
    hasCss: htmlCode.includes('<style') || htmlCode.includes('css'),
    hasMeta: htmlCode.includes('<meta'),
    hasTitle: htmlCode.includes('<title'),
    isComplete: false,
    qualityScore: 0,
    issues: []
  };

  // Calculate quality score
  let score = 0;
  if (analysis.hasHtmlTag) score += 20;
  if (analysis.hasHeadTag) score += 15;
  if (analysis.hasBodyTag) score += 15;
  if (analysis.hasHeaderTag) score += 15;
  if (analysis.hasFooterTag) score += 15;
  if (analysis.hasRequiredText) score += 20;

  analysis.qualityScore = score;
  analysis.isComplete = score >= 80;

  // Identify issues
  if (!analysis.hasHtmlTag) analysis.issues.push('Missing HTML tag');
  if (!analysis.hasHeadTag) analysis.issues.push('Missing head tag');
  if (!analysis.hasBodyTag) analysis.issues.push('Missing body tag');
  if (!analysis.hasHeaderTag) analysis.issues.push('Missing header element');
  if (!analysis.hasFooterTag) analysis.issues.push('Missing footer element');
  if (!analysis.hasRequiredText) analysis.issues.push('Missing required text "I\'m the best"');

  console.log(`📊 HTML Analysis Results:`);
  console.log(`   Quality Score: ${analysis.qualityScore}/100`);
  console.log(`   Complete: ${analysis.isComplete ? 'Yes' : 'No'}`);
  console.log(`   Issues: ${analysis.issues.length > 0 ? analysis.issues.join(', ') : 'None'}`);

  return analysis;
}

async function saveGeneratedHTML(htmlCode, analysis) {
  console.log('\n💾 Saving Generated HTML File');

  try {
    // Create public directory if it doesn't exist
    const publicDir = path.join(__dirname, 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Save the HTML file
    const filename = 'mcp-generated-html-test.html';
    const filepath = path.join(publicDir, filename);
    fs.writeFileSync(filepath, htmlCode);

    console.log(`✅ HTML file saved: ${filepath}`);
    console.log(`🔗 File URL: file://${filepath.replace(/\\/g, '/')}`);

    return { success: true, filepath, filename };
  } catch (error) {
    console.log('❌ Failed to save HTML file:', error.message);
    return { success: false, error: error.message };
  }
}

// Main test execution
async function runHTMLGenerationTest() {
  console.log('🚀 Starting MCP HTML Generation Test');
  console.log('=====================================');
  console.log(`📝 Test Prompt: "${HTML_TEST_PROMPT}"`);

  const results = {
    initialization: false,
    smartBegin: false,
    smartWrite: false,
    htmlAnalysis: null,
    fileSave: false,
    overallSuccess: false
  };

  try {
    // Test MCP initialization
    results.initialization = await testMCPInitialization();

    // Test smart_begin
    results.smartBegin = await testSmartBegin();

    // Test smart_write HTML generation
    const writeResult = await testSmartWriteHTML();
    results.smartWrite = writeResult.success;

    if (writeResult.success && writeResult.code) {
      // Analyze generated HTML
      results.htmlAnalysis = await analyzeGeneratedHTML(writeResult.code);

      // Save generated HTML
      const saveResult = await saveGeneratedHTML(writeResult.code, results.htmlAnalysis);
      results.fileSave = saveResult.success;

      // Determine overall success
      results.overallSuccess = results.initialization &&
                              results.smartBegin &&
                              results.smartWrite &&
                              results.htmlAnalysis &&
                              results.htmlAnalysis.isComplete &&
                              results.fileSave;
    }

  } catch (error) {
    console.log('❌ Test execution failed:', error.message);
  }

  // Summary
  console.log('\n📊 HTML Generation Test Results');
  console.log('================================');
  console.log(`MCP Initialization: ${results.initialization ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Smart Begin: ${results.smartBegin ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Smart Write: ${results.smartWrite ? '✅ PASS' : '❌ FAIL'}`);

  if (results.htmlAnalysis) {
    console.log(`HTML Quality Score: ${results.htmlAnalysis.qualityScore}/100`);
    console.log(`HTML Complete: ${results.htmlAnalysis.isComplete ? '✅ YES' : '❌ NO'}`);
    console.log(`File Saved: ${results.fileSave ? '✅ YES' : '❌ NO'}`);
  }

  const passCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;
  const score = Math.round((passCount / totalCount) * 100);

  console.log(`\nOverall Score: ${score}% (${passCount}/${totalCount} tests passed)`);
  console.log('Grade:', score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F');

  if (results.overallSuccess) {
    console.log('\n🎉 HTML Generation Test PASSED!');
    console.log('📊 TappMCP successfully generated HTML code');
    console.log('🔧 Ready for comprehensive testing');
  } else {
    console.log('\n❌ HTML Generation Test FAILED!');
    console.log('🔍 Check MCP server configuration and tool implementation');
  }

  return results;
}

// Run the test
runHTMLGenerationTest().catch(console.error);
