#!/usr/bin/env node

/**
 * Simple MCP vs Direct LLM Comparison Test
 *
 * Tests a single HTML generation prompt through both:
 * 1. MCP Framework (deployed Docker container)
 * 2. Direct LLM call (simulated)
 *
 * Compares quality, structure, and performance
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_PROMPT = "Create an HTML page with a header, footer, and body that says 'I am the best developer'";
const MCP_CONFIG = {
  containerName: 'tappmcp-smart-mcp-1',
  timeout: 30000
};

// Send MCP request to deployed Docker server via stdio
async function sendMCPRequest(method, params) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('MCP request timeout'));
    }, MCP_CONFIG.timeout);

    const request = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: method,
      params: params
    };

    console.log('📤 Sending MCP Request:');
    console.log('📤 Method:', method);
    console.log('📤 Params:', JSON.stringify(params, null, 2));

    // Connect directly to MCP server via stdio
    const mcpProcess = spawn('docker', ['exec', '-i', MCP_CONFIG.containerName, 'node', 'dist/server.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';
    let responseReceived = false;

    mcpProcess.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;

      // Try to parse JSON responses
      const lines = output.split('\n').filter(line => line.trim());
      for (const line of lines) {
        try {
          const response = JSON.parse(line);
          if (response.id === request.id) {
            responseReceived = true;
            clearTimeout(timeout);
            resolve(JSON.stringify(response, null, 2));
            mcpProcess.kill();
            return;
          }
        } catch (parseError) {
          // Not a JSON response, continue
        }
      }
    });

    mcpProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    mcpProcess.on('close', (code) => {
      clearTimeout(timeout);
      if (!responseReceived) {
        if (code !== 0) {
          reject(new Error(`MCP process exited with code ${code}: ${stderr}`));
        } else {
          reject(new Error(`No response received from MCP server. Output: ${stdout}`));
        }
      }
    });

    mcpProcess.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    // Send the request
    mcpProcess.stdin.write(JSON.stringify(request) + '\n');
    mcpProcess.stdin.end();
  });
}

// Simulate direct LLM call (replace with actual LLM API call)
async function simulateDirectLLMCall(prompt) {
  console.log('\n🤖 Simulating Direct LLM Call...');
  console.log('📝 Prompt:', prompt);

  // Simulate response time
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Return simulated HTML response
  return {
    success: true,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Direct LLM Generated Page</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
        header { background-color: #333; color: white; padding: 20px; text-align: center; }
        main { padding: 40px; text-align: center; font-size: 24px; }
        footer { background-color: #333; color: white; padding: 20px; text-align: center; position: fixed; bottom: 0; width: 100%; }
    </style>
</head>
<body>
    <header>
        <h1>My Website</h1>
    </header>
    <main>
        <p>I am the best developer</p>
    </main>
    <footer>
        <p>&copy; 2024 My Website. All rights reserved.</p>
    </footer>
</body>
</html>`,
    responseTime: 1000,
    method: 'direct-llm'
  };
}

// Test MCP Framework
async function testMCPFramework() {
  console.log('\n🧪 Testing: MCP Framework');
  console.log('=========================');

  const startTime = Date.now();

  try {
    // Step 1: Create project
    console.log('📝 Step 1: Creating project...');
    const projectResult = await sendMCPRequest('tools/call', {
      name: 'smart_begin',
      arguments: {
        projectName: "mcp-comparison-test",
        projectType: "web",
        description: "MCP vs Direct LLM comparison test"
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

    // Step 2: Generate HTML
    console.log('📝 Step 2: Generating HTML...');
    console.log('📝 Prompt:', TEST_PROMPT);

    const htmlResult = await sendMCPRequest('tools/call', {
      name: 'smart_write',
      arguments: {
        projectId: projectId,
        featureDescription: TEST_PROMPT,
        targetRole: 'developer',
        codeType: 'component',
        techStack: ['HTML', 'CSS', 'JavaScript']
      }
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    console.log('📥 MCP Response:');
    console.log(htmlResult);

    // Parse response
    let generatedHTML = '';
    let thoughtProcess = null;
    let qualityMetrics = null;

    try {
      const response = JSON.parse(htmlResult);
      if (response.result && response.result.data) {
        const data = response.result.data;

        if (data.generatedCode && data.generatedCode.files) {
          const htmlFile = data.generatedCode.files.find(file => file.type === 'html');
          if (htmlFile) {
            generatedHTML = htmlFile.content;
          }
        }

        thoughtProcess = data.thoughtProcess;
        qualityMetrics = data.qualityMetrics;
      }
    } catch (parseError) {
      console.log('⚠️ Could not parse MCP response');
    }

    return {
      success: true,
      html: generatedHTML,
      responseTime: responseTime,
      thoughtProcess: thoughtProcess,
      qualityMetrics: qualityMetrics,
      method: 'mcp-framework'
    };

  } catch (error) {
    console.log('❌ MCP Framework test failed:', error.message);
    return {
      success: false,
      error: error.message,
      method: 'mcp-framework'
    };
  }
}

// Analyze HTML quality
function analyzeHTMLQuality(html, method) {
  if (!html || html.trim().length === 0) {
    return {
      score: 0,
      details: ['No HTML generated'],
      method: method
    };
  }

  let score = 0;
  const details = [];

  // Basic structure checks
  if (html.includes('<!DOCTYPE')) { score += 10; details.push('Has DOCTYPE'); }
  if (html.includes('<html')) { score += 10; details.push('Has HTML tag'); }
  if (html.includes('<head')) { score += 10; details.push('Has HEAD section'); }
  if (html.includes('<body')) { score += 10; details.push('Has BODY section'); }

  // Required elements
  if (html.includes('<header') || html.includes('<h1')) { score += 15; details.push('Has header'); }
  if (html.includes('<footer')) { score += 15; details.push('Has footer'); }
  if (html.toLowerCase().includes('i am the best')) { score += 20; details.push('Has required text'); }

  // Quality checks
  if (html.includes('<style') || html.includes('style=')) { score += 10; details.push('Has styling'); }
  if (html.includes('meta charset')) { score += 5; details.push('Has charset meta'); }
  if (html.includes('viewport')) { score += 5; details.push('Has viewport meta'); }

  return {
    score: Math.min(score, 100),
    details: details,
    method: method,
    length: html.length
  };
}

// Generate HTML comparison report
function generateHTMLComparisonReport(mcpResult, directResult) {
  const mcpQuality = analyzeHTMLQuality(mcpResult.html, 'MCP Framework');
  const directQuality = analyzeHTMLQuality(directResult.html, 'Direct LLM');

  const report = `
# MCP Framework vs Direct LLM Comparison Report

## Test Prompt
"${TEST_PROMPT}"

## Results Summary

| Metric | MCP Framework | Direct LLM | Winner |
|--------|---------------|------------|--------|
| Success | ${mcpResult.success ? '✅' : '❌'} | ${directResult.success ? '✅' : '❌'} | ${mcpResult.success && !directResult.success ? 'MCP' : !mcpResult.success && directResult.success ? 'Direct' : 'Tie'} |
| Response Time | ${mcpResult.responseTime}ms | ${directResult.responseTime}ms | ${mcpResult.responseTime < directResult.responseTime ? 'MCP' : 'Direct'} |
| Quality Score | ${mcpQuality.score}/100 | ${directQuality.score}/100 | ${mcpQuality.score > directQuality.score ? 'MCP' : 'Direct'} |
| HTML Length | ${mcpQuality.length} chars | ${directQuality.length} chars | ${mcpQuality.length > directQuality.length ? 'MCP' : 'Direct'} |

## MCP Framework Results
- **Quality Score**: ${mcpQuality.score}/100
- **Response Time**: ${mcpResult.responseTime}ms
- **HTML Length**: ${mcpQuality.length} characters
- **Quality Details**: ${mcpQuality.details.join(', ')}

## Direct LLM Results
- **Quality Score**: ${directQuality.score}/100
- **Response Time**: ${directResult.responseTime}ms
- **HTML Length**: ${directQuality.length} characters
- **Quality Details**: ${directQuality.details.join(', ')}

## Generated HTML

### MCP Framework Output
\`\`\`html
${mcpResult.html || 'No HTML generated'}
\`\`\`

### Direct LLM Output
\`\`\`html
${directResult.html || 'No HTML generated'}
\`\`\`

## Conclusion
${mcpQuality.score > directQuality.score ?
  '**MCP Framework wins** with higher quality score and better structure' :
  '**Direct LLM wins** with higher quality score and better structure'}

Generated: ${new Date().toISOString()}
`;

  return report;
}

// Main test execution
async function runComparisonTest() {
  console.log('🚀 Starting MCP Framework vs Direct LLM Comparison');
  console.log('==================================================');
  console.log('📝 Test Prompt:', TEST_PROMPT);

  const results = {
    mcp: null,
    direct: null,
    comparison: null
  };

  try {
    // Test MCP Framework
    results.mcp = await testMCPFramework();

    // Test Direct LLM
    results.direct = await simulateDirectLLMCall(TEST_PROMPT);

    // Generate comparison report
    results.comparison = generateComparisonReport(results.mcp, results.direct);

    // Save results
    const outputDir = path.join(__dirname, 'comparison-results');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // Save HTML files
    if (results.mcp.html) {
      fs.writeFileSync(
        path.join(outputDir, `mcp-framework-${timestamp}.html`),
        results.mcp.html
      );
    }

    if (results.direct.html) {
      fs.writeFileSync(
        path.join(outputDir, `direct-llm-${timestamp}.html`),
        results.direct.html
      );
    }

    // Save comparison report
    fs.writeFileSync(
      path.join(outputDir, `comparison-report-${timestamp}.md`),
      results.comparison
    );

    console.log('\n📊 Comparison Results:');
    console.log('======================');
    console.log('MCP Framework Success:', results.mcp.success ? '✅' : '❌');
    console.log('Direct LLM Success:', results.direct.success ? '✅' : '❌');

    if (results.mcp.success && results.direct.success) {
      const mcpQuality = analyzeHTMLQuality(results.mcp.html, 'MCP');
      const directQuality = analyzeHTMLQuality(results.direct.html, 'Direct');

      console.log('MCP Quality Score:', mcpQuality.score, '/100');
      console.log('Direct Quality Score:', directQuality.score, '/100');
      console.log('MCP Response Time:', results.mcp.responseTime, 'ms');
      console.log('Direct Response Time:', results.direct.responseTime, 'ms');
    }

    console.log('\n💾 Results saved to:', outputDir);
    console.log('📄 Comparison report:', path.join(outputDir, `comparison-report-${timestamp}.md`));

  } catch (error) {
    console.log('❌ Comparison test failed:', error.message);
  }

  return results;
}

// Run the test
runComparisonTest().catch(console.error);
