#!/usr/bin/env node

/**
 * Simple MCP Testing
 *
 * Test the deployed Docker MCP server by directly calling the smart_write function
 * without trying to spawn new MCP server instances
 */

const fs = require('fs');
const path = require('path');

// Test HTML generation by first creating a project, then generating code
async function testHTMLGeneration() {
  console.log('🧪 Testing: HTML Generation via MCP Workflow');
  console.log('=============================================');

  const htmlPrompt = "create me an html page that has a header a footer and says 'i'am the best' in the body";

  try {
    // First, import and call smart_begin to create a project
    const { handleSmartBegin } = await import('./dist/tools/smart_begin.js');

    console.log('📝 Step 1: Creating project with smart_begin...');
    const projectResult = await handleSmartBegin({
      projectName: "html-test-project",
      projectType: "web",
      description: "Test project for HTML generation quality testing"
    });

    console.log('✅ Project created');
    console.log('📊 Project result type:', typeof projectResult);
    console.log('📊 Project result:', JSON.stringify(projectResult, null, 2));

    // Extract project ID
    let projectId = '';
    if (projectResult && projectResult.projectId) {
      projectId = projectResult.projectId;
    } else if (projectResult && projectResult.data && projectResult.data.projectId) {
      projectId = projectResult.data.projectId;
    } else {
      console.log('❌ Could not extract project ID from smart_begin result');
      return { success: false, error: 'No project ID found' };
    }

    console.log('📝 Step 2: Generating HTML with smart_write...');
    console.log('📝 Using project ID:', projectId);
    console.log('📝 Prompt:', htmlPrompt);

    // Now import and call smart_write with the project ID
    const { handleSmartWrite } = await import('./dist/tools/smart_write.js');

    // Call the handler with proper parameters
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

    console.log('✅ Handler response received');
    console.log('📊 Response type:', typeof result);
    console.log('📊 Full response:', JSON.stringify(result, null, 2));

    // Extract generated code from the complex response structure
    let generatedCode = '';
    let thoughtProcess = null;

    if (result && result.data && result.data.generatedCode && result.data.generatedCode.files) {
      // Extract HTML content from the files array
      const htmlFile = result.data.generatedCode.files.find(file => file.type === 'html');
      if (htmlFile) {
        generatedCode = htmlFile.content;
      }
      thoughtProcess = result.data.thoughtProcess;
    } else if (result && result.generatedCode) {
      generatedCode = result.generatedCode;
      thoughtProcess = result.thoughtProcess;
    } else if (typeof result === 'string') {
      generatedCode = result;
    } else {
      console.log('🔍 Debugging response structure...');
      console.log('Result keys:', Object.keys(result || {}));
      if (result && result.data) {
        console.log('Data keys:', Object.keys(result.data || {}));
      }
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
    let filepath = null;
    let tempFilepath = null;
    if (generatedCode) {
      const outputDir = path.join(__dirname, 'mcp-generated-code');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const filename = `html-direct-test-${Date.now()}.html`;
      filepath = path.join(outputDir, filename);
      fs.writeFileSync(filepath, generatedCode);

      // Also save to temp directory for easy access
      const tempDir = path.join(__dirname, 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const tempFilename = 'generated-html.html';
      tempFilepath = path.join(tempDir, tempFilename);
      fs.writeFileSync(tempFilepath, generatedCode);

      console.log('\n💾 Generated code saved:');
      console.log('📁 File:', filepath);
      console.log('📁 Temp file:', tempFilepath);
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
      filepath: filepath,
      tempFilepath: tempFilepath
    };

  } catch (error) {
    console.log('❌ HTML generation test failed:', error.message);
    console.log('🔍 Error details:', error);
    return { success: false, error: error.message };
  }
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
  console.log('🚀 Starting Simple MCP Testing');
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
