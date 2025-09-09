#!/usr/bin/env node

/**
 * Simple MCP vs Direct LLM Comparison Test with HTML Report
 *
 * Tests a single HTML generation prompt through both:
 * 1. MCP Framework (deployed Docker container)
 * 2. Direct LLM call (simulated)
 *
 * Compares quality, structure, and performance
 * Generates a beautiful HTML report
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

  const mcpWinner = mcpQuality.score > directQuality.score;
  const directWinner = directQuality.score > mcpQuality.score;
  const tie = mcpQuality.score === directQuality.score;

  const overallWinner = mcpWinner ? 'MCP Framework' : directWinner ? 'Direct LLM' : 'Tie';
  const winnerColor = mcpWinner ? '#4CAF50' : directWinner ? '#2196F3' : '#FF9800';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MCP Framework vs Direct LLM Comparison Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: white;
            box-shadow: 0 0 30px rgba(0,0,0,0.1);
            margin-top: 20px;
            margin-bottom: 20px;
            border-radius: 10px;
        }

        .header {
            text-align: center;
            padding: 40px 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin: -20px -20px 30px -20px;
            border-radius: 10px 10px 0 0;
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }

        .winner-badge {
            display: inline-block;
            background: ${winnerColor};
            color: white;
            padding: 15px 30px;
            border-radius: 50px;
            font-size: 1.5em;
            font-weight: bold;
            margin: 20px 0;
        }

        .section {
            margin: 40px 0;
            padding: 30px;
            background: #f8f9fa;
            border-radius: 10px;
            border-left: 5px solid #667eea;
        }

        .section h2 {
            color: #667eea;
            font-size: 1.8em;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
        }

        .section h2::before {
            content: '📊';
            margin-right: 10px;
        }

        .comparison-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .comparison-table th,
        .comparison-table td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #e9ecef;
        }

        .comparison-table th {
            background: #667eea;
            color: white;
            font-weight: 600;
        }

        .comparison-table tr:hover {
            background: #f8f9fa;
        }

        .winner {
            background: #d4edda !important;
            color: #155724;
            font-weight: bold;
        }

        .code-section {
            background: #2d3748;
            color: #e2e8f0;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 15px 0;
            font-family: 'Courier New', monospace;
        }

        .code-section h3 {
            color: #f7fafc;
            margin-bottom: 15px;
        }

        .code-section pre {
            white-space: pre-wrap;
            word-wrap: break-word;
        }

        .quality-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
        }

        .quality-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .quality-card h3 {
            color: #667eea;
            margin-bottom: 15px;
        }

        .quality-detail {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }

        .quality-detail:last-child {
            border-bottom: none;
        }

        .success { color: #28a745; }
        .error { color: #dc3545; }
        .warning { color: #ffc107; }

        .footer {
            text-align: center;
            padding: 30px;
            background: #2d3748;
            color: white;
            margin: 40px -20px -20px -20px;
            border-radius: 0 0 10px 10px;
        }

        @media (max-width: 768px) {
            .container {
                margin: 10px;
                padding: 15px;
            }

            .header h1 {
                font-size: 2em;
            }

            .quality-details {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 MCP Framework vs Direct LLM Comparison</h1>
            <p>HTML Generation Quality and Performance Analysis</p>
            <div class="winner-badge">Winner: ${overallWinner}</div>
            <p>Generated: ${new Date().toLocaleString()}</p>
        </div>

        <div class="section">
            <h2>📝 Test Prompt</h2>
            <div class="code-section">
                <p><strong>Prompt:</strong> "${TEST_PROMPT}"</p>
            </div>
        </div>

        <div class="section">
            <h2>📊 Results Summary</h2>
            <table class="comparison-table">
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>MCP Framework</th>
                        <th>Direct LLM</th>
                        <th>Winner</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Success</strong></td>
                        <td class="${mcpResult.success ? 'success' : 'error'}">${mcpResult.success ? '✅ Success' : '❌ Failed'}</td>
                        <td class="${directResult.success ? 'success' : 'error'}">${directResult.success ? '✅ Success' : '❌ Failed'}</td>
                        <td class="${mcpResult.success && !directResult.success ? 'winner' : !mcpResult.success && directResult.success ? 'winner' : ''}">${mcpResult.success && !directResult.success ? 'MCP' : !mcpResult.success && directResult.success ? 'Direct' : 'Tie'}</td>
                    </tr>
                    <tr>
                        <td><strong>Response Time</strong></td>
                        <td>${mcpResult.responseTime}ms</td>
                        <td>${directResult.responseTime}ms</td>
                        <td class="${mcpResult.responseTime < directResult.responseTime ? 'winner' : ''}">${mcpResult.responseTime < directResult.responseTime ? 'MCP' : 'Direct'}</td>
                    </tr>
                    <tr>
                        <td><strong>Quality Score</strong></td>
                        <td>${mcpQuality.score}/100</td>
                        <td>${directQuality.score}/100</td>
                        <td class="${mcpQuality.score > directQuality.score ? 'winner' : ''}">${mcpQuality.score > directQuality.score ? 'MCP' : 'Direct'}</td>
                    </tr>
                    <tr>
                        <td><strong>HTML Length</strong></td>
                        <td>${mcpQuality.length} chars</td>
                        <td>${directQuality.length} chars</td>
                        <td class="${mcpQuality.length > directQuality.length ? 'winner' : ''}">${mcpQuality.length > directQuality.length ? 'MCP' : 'Direct'}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>🎯 Quality Analysis</h2>
            <div class="quality-details">
                <div class="quality-card">
                    <h3>MCP Framework</h3>
                    <div style="font-size: 2.5em; font-weight: bold; color: #667eea; margin-bottom: 5px;">${mcpQuality.score}/100</div>
                    <div style="font-size: 0.9em; color: #666; text-transform: uppercase;">Quality Score</div>
                    <div style="margin-top: 15px;">
                        <div class="quality-detail">
                            <span>Response Time:</span>
                            <span>${mcpResult.responseTime}ms</span>
                        </div>
                        <div class="quality-detail">
                            <span>HTML Length:</span>
                            <span>${mcpQuality.length} chars</span>
                        </div>
                        <div class="quality-detail">
                            <span>Success:</span>
                            <span class="${mcpResult.success ? 'success' : 'error'}">${mcpResult.success ? 'Yes' : 'No'}</span>
                        </div>
                    </div>
                    <div style="margin-top: 15px;">
                        <strong>Quality Details:</strong>
                        <ul style="margin-top: 10px; padding-left: 20px;">
                            ${mcpQuality.details.map(detail => `<li>${detail}</li>`).join('')}
                        </ul>
                    </div>
                </div>

                <div class="quality-card">
                    <h3>Direct LLM</h3>
                    <div style="font-size: 2.5em; font-weight: bold; color: #667eea; margin-bottom: 5px;">${directQuality.score}/100</div>
                    <div style="font-size: 0.9em; color: #666; text-transform: uppercase;">Quality Score</div>
                    <div style="margin-top: 15px;">
                        <div class="quality-detail">
                            <span>Response Time:</span>
                            <span>${directResult.responseTime}ms</span>
                        </div>
                        <div class="quality-detail">
                            <span>HTML Length:</span>
                            <span>${directQuality.length} chars</span>
                        </div>
                        <div class="quality-detail">
                            <span>Success:</span>
                            <span class="${directResult.success ? 'success' : 'error'}">${directResult.success ? 'Yes' : 'No'}</span>
                        </div>
                    </div>
                    <div style="margin-top: 15px;">
                        <strong>Quality Details:</strong>
                        <ul style="margin-top: 10px; padding-left: 20px;">
                            ${directQuality.details.map(detail => `<li>${detail}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>💻 Generated HTML Code</h2>

            <div class="code-section">
                <h3>MCP Framework Output</h3>
                <pre>${mcpResult.html || 'No HTML generated'}</pre>
            </div>

            <div class="code-section">
                <h3>Direct LLM Output</h3>
                <pre>${directResult.html || 'No HTML generated'}</pre>
            </div>
        </div>

        <div class="section">
            <h2>🏆 Conclusion</h2>
            <div style="background: ${winnerColor}; color: white; padding: 20px; border-radius: 8px; text-align: center;">
                <h3 style="margin-bottom: 10px;">${overallWinner} Wins!</h3>
                <p>${mcpWinner ?
                    'MCP Framework demonstrates superior quality and structure for HTML generation' :
                    directWinner ?
                    'Direct LLM shows better performance and quality for this specific task' :
                    'Both approaches perform equally well for this task'
                }</p>
            </div>
        </div>

        <div class="footer">
            <p>Generated by MCP Framework vs Direct LLM Comparison Test</p>
            <p>Report Date: ${new Date().toLocaleString()}</p>
            <p>For questions or support, please refer to the MCP documentation</p>
        </div>
    </div>
</body>
</html>`;

  return html;
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
    results.comparison = generateHTMLComparisonReport(results.mcp, results.direct);

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

    // Save HTML comparison report
    fs.writeFileSync(
      path.join(outputDir, `comparison-report-${timestamp}.html`),
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
    console.log('📄 HTML Comparison report:', path.join(outputDir, `comparison-report-${timestamp}.html`));
    console.log('🌐 Open the HTML report in your browser to view the full comparison!');

  } catch (error) {
    console.log('❌ Comparison test failed:', error.message);
  }

  return results;
}

// Run the test
runComparisonTest().catch(console.error);
