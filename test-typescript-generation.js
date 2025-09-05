#!/usr/bin/env node

/**
 * TypeScript Generation Quality Test
 *
 * Test the deployed Docker MCP server by generating TypeScript code
 * and measuring quality metrics
 */

const fs = require('fs');
const path = require('path');

// Test TypeScript generation
async function testTypeScriptGeneration() {
  console.log('🧪 Testing: TypeScript Generation Quality');
  console.log('==========================================');

  const typescriptPrompt = "create a typescript function that validates email addresses with proper error handling";

  try {
    // First, create a project
    const { handleSmartBegin } = await import('./dist/tools/smart_begin.js');

    console.log('📝 Step 1: Creating project for TypeScript test...');
    const projectResult = await handleSmartBegin({
      projectName: "typescript-test-project",
      projectType: "typescript",
      description: "Test project for TypeScript generation quality testing"
    });

    if (!projectResult.success) {
      throw new Error('Failed to create project');
    }

    const projectId = projectResult.data.projectId;
    console.log('✅ Project created:', projectId);

    // Generate TypeScript code
    console.log('📝 Step 2: Generating TypeScript code...');
    console.log('📝 Prompt:', typescriptPrompt);

    const { handleSmartWrite } = await import('./dist/tools/smart_write.js');

    const result = await handleSmartWrite({
      projectId: projectId,
      featureDescription: typescriptPrompt,
      targetRole: 'developer',
      codeType: 'function',
      techStack: ['TypeScript', 'Node.js'],
      qualityRequirements: {
        testCoverage: 85,
        complexity: 5,
        securityLevel: 'high'
      }
    });

    console.log('✅ TypeScript generation completed');

    // Extract generated code
    let generatedCode = '';
    let thoughtProcess = null;

    if (result && result.data && result.data.generatedCode && result.data.generatedCode.files) {
      const tsFile = result.data.generatedCode.files.find(file => file.type === 'typescript' || file.path.endsWith('.ts'));
      if (tsFile) {
        generatedCode = tsFile.content;
      }
      thoughtProcess = result.data.thoughtProcess;
    }

    console.log('\n📊 TypeScript Code Analysis:');
    console.log('=============================');
    console.log('Code length:', generatedCode.length, 'characters');
    console.log('Has function:', generatedCode.includes('function'));
    console.log('Has email validation:', generatedCode.toLowerCase().includes('email'));
    console.log('Has error handling:', generatedCode.includes('try') || generatedCode.includes('catch') || generatedCode.includes('throw'));
    console.log('Has TypeScript types:', generatedCode.includes(': string') || generatedCode.includes(': boolean'));
    console.log('Has return statement:', generatedCode.includes('return'));

    // Analyze TypeScript quality
    const qualityScore = analyzeTypeScriptQuality(generatedCode);
    console.log('\n📈 TypeScript Quality Score:', qualityScore, '/100');

    // Save generated code
    let filepath = null;
    if (generatedCode) {
      const outputDir = path.join(__dirname, 'mcp-generated-code');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const filename = `typescript-test-${Date.now()}.ts`;
      filepath = path.join(outputDir, filename);
      fs.writeFileSync(filepath, generatedCode);

      console.log('\n💾 Generated TypeScript code saved:');
      console.log('📁 File:', filepath);
      console.log('🔗 URL: file://' + filepath.replace(/\\/g, '/'));
    }

    // Display thought process
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
      filepath: filepath
    };

  } catch (error) {
    console.log('❌ TypeScript generation test failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Analyze TypeScript quality
function analyzeTypeScriptQuality(code) {
  if (!code || code.trim().length === 0) {
    return 0;
  }

  let score = 0;

  // Basic structure (30 points)
  if (code.includes('function')) score += 15;
  if (code.includes('export')) score += 10;
  if (code.includes('import')) score += 5;

  // TypeScript features (30 points)
  if (code.includes(': string') || code.includes(': boolean') || code.includes(': number')) score += 15;
  if (code.includes('interface') || code.includes('type ')) score += 10;
  if (code.includes('?:') || code.includes('|')) score += 5;

  // Error handling (20 points)
  if (code.includes('try') || code.includes('catch')) score += 10;
  if (code.includes('throw') || code.includes('Error')) score += 10;

  // Code quality (20 points)
  if (code.includes('return')) score += 10;
  if (code.includes('if') || code.includes('else')) score += 5;
  if (code.includes('const') || code.includes('let')) score += 5;

  return Math.min(score, 100);
}

// Main execution
async function runTypeScriptTest() {
  console.log('🚀 Starting TypeScript Generation Test');
  console.log('======================================');

  const result = await testTypeScriptGeneration();

  console.log('\n📊 TypeScript Test Results Summary');
  console.log('===================================');
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
    console.log('\n🎉 TypeScript Generation Test PASSED!');
  } else {
    console.log('\n❌ TypeScript Generation Test FAILED!');
  }

  return result;
}

// Run the test
runTypeScriptTest().catch(console.error);
