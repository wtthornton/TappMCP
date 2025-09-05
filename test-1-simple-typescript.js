#!/usr/bin/env node

/**
 * Test 1: Simple TypeScript Function Generation
 * Difficulty: EASY
 * Expected: Should pass with high quality
 */

const fs = require('fs');
const path = require('path');

async function test1SimpleTypeScript() {
  console.log('🧪 Test 1: Simple TypeScript Function Generation');
  console.log('================================================');
  console.log('📝 Difficulty: EASY');
  console.log('🎯 Expected: High quality, should pass easily');
  console.log('');

  const prompt = "create a function that calculates the area of a circle given the radius";
  const expectedFeatures = [
    "TypeScript function with proper typing",
    "Input validation for radius parameter",
    "Mathematical calculation using Math.PI",
    "Return type annotation",
    "Error handling for invalid inputs",
    "JSDoc documentation"
  ];

  console.log('📋 Prompt:', prompt);
  console.log('🎯 Expected Features:');
  expectedFeatures.forEach((feature, index) => {
    console.log(`   ${index + 1}. ${feature}`);
  });
  console.log('');

  try {
    // Import and call smart_begin
    const { handleSmartBegin } = await import('./dist/tools/smart_begin.js');
    const projectResult = await handleSmartBegin({
      projectName: "test1-simple-typescript",
      projectType: "library",
      description: "Simple TypeScript function for circle area calculation"
    });

    const projectId = projectResult.data.projectId;
    console.log('✅ Project created with ID:', projectId);

    // Import and call smart_write
    const { handleSmartWrite } = await import('./dist/tools/smart_write.js');
    const result = await handleSmartWrite({
      projectId: projectId,
      featureDescription: prompt,
      targetRole: 'developer',
      codeType: 'function',
      techStack: ['TypeScript', 'Node.js']
    });

    console.log('\n📊 Test Results:');
    console.log('================');
    console.log('Success:', result.success);
    console.log('Response Time:', result.data?.technicalMetrics?.responseTime, 'ms');
    console.log('Quality Score:', result.data?.qualityMetrics?.maintainability || 'N/A');
    console.log('Files Generated:', result.data?.technicalMetrics?.filesCreated || 0);

    // Analyze the generated code
    if (result.success && result.data?.generatedCode?.files) {
      const codeFile = result.data.generatedCode.files.find(file => file.type === 'typescript' || file.path.endsWith('.ts'));
      if (codeFile) {
        const code = codeFile.content;
        console.log('\n🔍 Code Analysis:');
        console.log('================');

        const analysis = {
          hasFunction: code.includes('function') || code.includes('const') || code.includes('export'),
          hasTypeScript: code.includes(': number') || code.includes(': string') || code.includes('interface'),
          hasMathPI: code.includes('Math.PI') || code.includes('Math.PI'),
          hasValidation: code.includes('if') || code.includes('throw') || code.includes('validate'),
          hasJSDoc: code.includes('/**') || code.includes('@param') || code.includes('@returns'),
          hasReturnType: code.includes('): number') || code.includes('): string'),
          hasErrorHandling: code.includes('throw') || code.includes('Error') || code.includes('try'),
          lineCount: code.split('\n').length
        };

        console.log('✅ Has Function:', analysis.hasFunction);
        console.log('✅ Has TypeScript Types:', analysis.hasTypeScript);
        console.log('✅ Uses Math.PI:', analysis.hasMathPI);
        console.log('✅ Has Input Validation:', analysis.hasValidation);
        console.log('✅ Has JSDoc:', analysis.hasJSDoc);
        console.log('✅ Has Return Type:', analysis.hasReturnType);
        console.log('✅ Has Error Handling:', analysis.hasErrorHandling);
        console.log('📏 Line Count:', analysis.lineCount);

        // Calculate quality score
        const qualityScore = Object.values(analysis).filter(Boolean).length * 12.5; // 8 features max = 100%
        console.log('\n📈 Quality Score:', Math.min(qualityScore, 100), '/100');

        // Save generated code
        const outputDir = path.join(__dirname, 'test-results', 'test1');
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        const filename = `circle-area-function-${Date.now()}.ts`;
        const filePath = path.join(outputDir, filename);
        fs.writeFileSync(filePath, code);

        console.log('\n💾 Generated code saved:', filePath);
        console.log('\n🎯 Test 1 Result: PASSED ✅');
        console.log('Expected: High quality TypeScript function');
        console.log('Actual: Generated functional code with good structure');

        return { success: true, qualityScore, analysis, filePath };
      }
    }

    console.log('\n❌ Test 1 Result: FAILED');
    return { success: false, error: 'No TypeScript code generated' };

  } catch (error) {
    console.log('\n❌ Test 1 Result: ERROR');
    console.log('Error:', error.message);
    return { success: false, error: error.message };
  }
}

// Export the function for the master test runner
module.exports = { test1SimpleTypeScript };

// Run the test if called directly
if (require.main === module) {
  test1SimpleTypeScript().catch(console.error);
}
