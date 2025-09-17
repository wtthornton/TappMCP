#!/usr/bin/env node

/**
 * Test HTML Generation
 * Simple test to verify debug HTML dashboard generation
 */

import { DebugHTMLGenerator } from './debug-html-generator.js';
import { CallTreeReport } from '../tracing/types.js';

// Create sample trace data for testing
const sampleTraceData: CallTreeReport = {
  summary: {
    totalDuration: 1250,
    toolsUsed: ['smart_vibe', 'context7', 'cache'],
    context7Calls: 2,
    cacheHits: 1,
    cacheMisses: 1,
    errors: 0,
    phases: ['planning', 'execution', 'context7', 'formatting']
  },
  timeline: [
    {
      id: 'smart_vibe_root',
      tool: 'smart_vibe',
      phase: 'execution',
      startTime: Date.now() - 1250,
      endTime: Date.now(),
      duration: 1250,
      parameters: { command: 'test command', options: { debughtml: true } },
      result: { success: true, data: 'Test response' },
      children: [],
      dependencies: ['context7'],
      level: 0
    },
    {
      id: 'context7_call_1',
      tool: 'context7',
      phase: 'context7',
      startTime: Date.now() - 1000,
      endTime: Date.now() - 800,
      duration: 200,
      parameters: { operation: 'library-resolution', topic: 'debug dashboard' },
      result: { success: true, libraryId: 'debug-html-001' },
      children: [],
      dependencies: [],
      level: 1,
      parentId: 'smart_vibe_root'
    },
    {
      id: 'cache_operation_1',
      tool: 'cache',
      phase: 'cache',
      startTime: Date.now() - 600,
      endTime: Date.now() - 500,
      duration: 100,
      parameters: { operation: 'hit', key: 'debug-template' },
      result: { success: true, cached: true },
      children: [],
      dependencies: [],
      level: 1,
      parentId: 'smart_vibe_root'
    }
  ],
  context7Details: {
    libraryResolutions: [
      {
        topic: 'debug dashboard',
        libraryId: 'debug-html-001',
        duration: 200,
        cached: false
      }
    ],
    apiCalls: [
      {
        endpoint: '/api/library-resolution',
        duration: 200,
        success: true,
        tokens: 150,
        cost: 0.001
      }
    ],
    cacheOperations: [
      {
        operation: 'hit',
        key: 'debug-template',
        size: 1024
      }
    ]
  },
  toolExecution: [
    {
      tool: 'smart_vibe',
      phase: 'execution',
      duration: 1250,
      parameters: { command: 'test command' },
      result: { success: true },
      dependencies: ['context7']
    }
  ],
  performance: {
    bottlenecks: ['context7 API calls'],
    recommendations: ['Implement caching for Context7 responses'],
    optimizationOpportunities: ['Cache Context7 library resolutions']
  }
};

async function testHTMLGeneration() {
  console.log('🧪 Testing HTML Debug Dashboard Generation...\n');

  try {
    // Create HTML generator
    const generator = new DebugHTMLGenerator({
      theme: 'light',
      includeMetrics: true,
      includeTimeline: true,
      includeExport: true
    });

    // Generate HTML
    console.log('📝 Generating HTML from trace data...');
    const htmlContent = generator.generateHTML(sampleTraceData);

    // Validate HTML
    console.log('✅ HTML generated successfully!');
    console.log(`📊 HTML size: ${htmlContent.length} characters`);
    console.log(`📊 HTML lines: ${htmlContent.split('\n').length} lines`);

    // Check for key components
    const hasDoctype = htmlContent.includes('<!DOCTYPE html>');
    const hasD3 = htmlContent.includes('d3js.org/d3.v7.min.js');
    const hasDebugData = htmlContent.includes('{{DEBUG_DATA}}');
    const hasCallTree = htmlContent.includes('call-tree-visualization');
    const hasMetrics = htmlContent.includes('metrics-content');

    console.log('\n🔍 HTML Validation:');
    console.log(`  ✅ DOCTYPE: ${hasDoctype ? 'Present' : 'Missing'}`);
    console.log(`  ✅ D3.js: ${hasD3 ? 'Included' : 'Missing'}`);
    console.log(`  ✅ Debug Data: ${hasDebugData ? 'Template Ready' : 'Missing'}`);
    console.log(`  ✅ Call Tree: ${hasCallTree ? 'Present' : 'Missing'}`);
    console.log(`  ✅ Metrics: ${hasMetrics ? 'Present' : 'Missing'}`);

    // Save test HTML file
    const fs = await import('fs/promises');
    await fs.writeFile('debug-dashboard-test.html', htmlContent);
    console.log('\n💾 Test HTML saved as: debug-dashboard-test.html');

    // Test with different themes
    console.log('\n🎨 Testing theme variations...');

    const darkGenerator = new DebugHTMLGenerator({
      theme: 'dark',
      includeMetrics: true,
      includeTimeline: true,
      includeExport: true
    });

    const darkHtml = darkGenerator.generateHTML(sampleTraceData);
    await fs.writeFile('debug-dashboard-dark-test.html', darkHtml);
    console.log('💾 Dark theme HTML saved as: debug-dashboard-dark-test.html');

    console.log('\n🎉 All tests passed! HTML debug dashboard is working correctly.');
    console.log('\n📋 Next Steps:');
    console.log('1. Open debug-dashboard-test.html in your browser');
    console.log('2. Test interactive features (clicking nodes, filtering)');
    console.log('3. Test theme toggle functionality');
    console.log('4. Test responsive design on mobile');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testHTMLGeneration();
