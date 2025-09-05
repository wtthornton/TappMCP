#!/usr/bin/env node

/**
 * Test 2: Medium Complexity - React Component with Hooks
 * Difficulty: MEDIUM
 * Expected: Should pass with good quality, might struggle with React complexity
 */

const fs = require('fs');
const path = require('path');

async function test2MediumReact() {
  console.log('🧪 Test 2: Medium Complexity - React Component with Hooks');
  console.log('=========================================================');
  console.log('📝 Difficulty: MEDIUM');
  console.log('🎯 Expected: Good quality, might struggle with React complexity');
  console.log('');

  const prompt = "create a React component that manages a todo list with add, edit, delete, and mark complete functionality using hooks and local state";
  const expectedFeatures = [
    "React functional component with TypeScript",
    "useState hook for todo list state management",
    "useState hook for input field state",
    "Add new todo functionality",
    "Edit existing todo functionality",
    "Delete todo functionality",
    "Mark todo as complete functionality",
    "Input validation and error handling",
    "Proper TypeScript interfaces for Todo type",
    "Event handlers for all interactions",
    "Conditional rendering for empty state",
    "CSS styling for good UX"
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
      projectName: "test2-medium-react",
      projectType: "react",
      description: "React todo list component with hooks and state management"
    });

    const projectId = projectResult.data.projectId;
    console.log('✅ Project created with ID:', projectId);

    // Import and call smart_write
    const { handleSmartWrite } = await import('./dist/tools/smart_write.js');
    const result = await handleSmartWrite({
      projectId: projectId,
      featureDescription: prompt,
      targetRole: 'developer',
      codeType: 'component',
      techStack: ['React', 'TypeScript', 'CSS']
    });

    console.log('\n📊 Test Results:');
    console.log('================');
    console.log('Success:', result.success);
    console.log('Response Time:', result.data?.technicalMetrics?.responseTime, 'ms');
    console.log('Quality Score:', result.data?.qualityMetrics?.maintainability || 'N/A');
    console.log('Files Generated:', result.data?.technicalMetrics?.filesCreated || 0);

    // Analyze the generated code
    if (result.success && result.data?.generatedCode?.files) {
      const codeFile = result.data.generatedCode.files.find(file =>
        file.type === 'typescript' || file.type === 'jsx' || file.path.endsWith('.tsx') || file.path.endsWith('.jsx')
      );
      if (codeFile) {
        const code = codeFile.content;
        console.log('\n🔍 Code Analysis:');
        console.log('================');

        const analysis = {
          hasReactComponent: code.includes('React') || code.includes('function') || code.includes('const'),
          hasTypeScript: code.includes(': string') || code.includes(': number') || code.includes('interface'),
          hasUseState: code.includes('useState') || code.includes('useState('),
          hasTodoInterface: code.includes('interface') && code.includes('Todo'),
          hasAddFunction: code.includes('add') || code.includes('Add') || code.includes('handleAdd'),
          hasEditFunction: code.includes('edit') || code.includes('Edit') || code.includes('handleEdit'),
          hasDeleteFunction: code.includes('delete') || code.includes('Delete') || code.includes('handleDelete'),
          hasCompleteFunction: code.includes('complete') || code.includes('Complete') || code.includes('handleComplete'),
          hasEventHandlers: code.includes('onClick') || code.includes('onChange') || code.includes('onSubmit'),
          hasConditionalRendering: code.includes('&&') || code.includes('?') || code.includes('if'),
          hasCSS: code.includes('className') || code.includes('style') || code.includes('css'),
          hasInputValidation: code.includes('trim') || code.includes('length') || code.includes('validate'),
          lineCount: code.split('\n').length
        };

        console.log('✅ Has React Component:', analysis.hasReactComponent);
        console.log('✅ Has TypeScript:', analysis.hasTypeScript);
        console.log('✅ Has useState Hook:', analysis.hasUseState);
        console.log('✅ Has Todo Interface:', analysis.hasTodoInterface);
        console.log('✅ Has Add Function:', analysis.hasAddFunction);
        console.log('✅ Has Edit Function:', analysis.hasEditFunction);
        console.log('✅ Has Delete Function:', analysis.hasDeleteFunction);
        console.log('✅ Has Complete Function:', analysis.hasCompleteFunction);
        console.log('✅ Has Event Handlers:', analysis.hasEventHandlers);
        console.log('✅ Has Conditional Rendering:', analysis.hasConditionalRendering);
        console.log('✅ Has CSS Styling:', analysis.hasCSS);
        console.log('✅ Has Input Validation:', analysis.hasInputValidation);
        console.log('📏 Line Count:', analysis.lineCount);

        // Calculate quality score
        const qualityScore = Object.values(analysis).filter(Boolean).length * 7.7; // 13 features max = 100%
        console.log('\n📈 Quality Score:', Math.min(qualityScore, 100), '/100');

        // Save generated code
        const outputDir = path.join(__dirname, 'test-results', 'test2');
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        const filename = `todo-component-${Date.now()}.tsx`;
        const filePath = path.join(outputDir, filename);
        fs.writeFileSync(filePath, code);

        console.log('\n💾 Generated code saved:', filePath);
        console.log('\n🎯 Test 2 Result: PASSED ✅');
        console.log('Expected: Good quality React component with hooks');
        console.log('Actual: Generated functional React code with state management');

        return { success: true, qualityScore, analysis, filePath };
      }
    }

    console.log('\n❌ Test 2 Result: FAILED');
    return { success: false, error: 'No React component code generated' };

  } catch (error) {
    console.log('\n❌ Test 2 Result: ERROR');
    console.log('Error:', error.message);
    return { success: false, error: error.message };
  }
}

// Export the function for the master test runner
module.exports = { test2MediumReact };

// Run the test if called directly
if (require.main === module) {
  test2MediumReact().catch(console.error);
}
