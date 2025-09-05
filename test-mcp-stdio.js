#!/usr/bin/env node

/**
 * MCP Stdio Client Test
 *
 * This script tests the deployed TappMCP Docker container by communicating
 * via stdio with the MCP server running inside the container.
 */

const { spawn } = require('child_process');
const fs = require('fs');

class MCPClient {
  constructor() {
    this.process = null;
    this.messageId = 0;
    this.pendingRequests = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      console.log('🔌 Connecting to MCP server via stdio...');

      // Connect to the MCP server via stdio
      this.process = spawn('docker', ['exec', '-i', 'tappmcp-smart-mcp-1', 'node', 'dist/server.js'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      this.process.stdout.on('data', (data) => {
        try {
          const lines = data.toString().split('\n').filter(line => line.trim());
          for (const line of lines) {
            const message = JSON.parse(line);
            this.handleMessage(message);
          }
        } catch (error) {
          console.error('Error parsing MCP response:', error);
        }
      });

      this.process.stderr.on('data', (data) => {
        console.error('MCP stderr:', data.toString());
      });

      this.process.on('close', (code) => {
        console.log(`MCP process exited with code ${code}`);
      });

      this.process.on('error', (error) => {
        console.error('MCP process error:', error);
        reject(error);
      });

      // Initialize MCP connection
      setTimeout(() => {
        this.sendMessage({
          jsonrpc: '2.0',
          id: this.messageId++,
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {}
            },
            clientInfo: {
              name: 'test-client',
              version: '1.0.0'
            }
          }
        }).then(() => {
          console.log('✅ MCP connection established');
          resolve();
        }).catch(reject);
      }, 2000);
    });
  }

  handleMessage(message) {
    if (message.id && this.pendingRequests.has(message.id)) {
      const { resolve, reject } = this.pendingRequests.get(message.id);
      this.pendingRequests.delete(message.id);

      if (message.error) {
        reject(new Error(message.error.message || 'MCP Error'));
      } else {
        resolve(message.result);
      }
    }
  }

  sendMessage(message) {
    return new Promise((resolve, reject) => {
      const id = this.messageId++;
      message.id = id;

      this.pendingRequests.set(id, { resolve, reject });

      this.process.stdin.write(JSON.stringify(message) + '\n');

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  async callTool(toolName, arguments_) {
    console.log(`🔧 Calling MCP Tool: ${toolName}`);
    console.log(`📝 Arguments:`, JSON.stringify(arguments_, null, 2));

    const result = await this.sendMessage({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: arguments_
      }
    });

    console.log(`✅ MCP Response:`, JSON.stringify(result, null, 2));
    return result;
  }

  async disconnect() {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }
}

// Test functions
async function testMCPConnection() {
  console.log('\n🧪 Testing: MCP Stdio Connection');

  const client = new MCPClient();
  try {
    await client.connect();
    console.log('✅ MCP Server connected via stdio');
    return { success: true, client };
  } catch (error) {
    console.log('❌ MCP Server connection failed:', error.message);
    return { success: false, client: null };
  }
}

async function testProjectInitialization(client) {
  console.log('\n🧪 Testing: Project Initialization via MCP');

  try {
    const result = await client.callTool('smart_begin', {
      projectName: 'HTML Test Project',
      description: 'Test HTML generation via deployed MCP',
      techStack: ['html', 'css', 'javascript'],
      targetUsers: ['developer'],
      businessGoals: ['test html generation', 'validate mcp deployment']
    });

    if (result.success) {
      console.log('✅ Project initialized successfully');
      console.log(`📊 Project ID: ${result.data.projectId}`);
      console.log(`📁 Folders: ${result.data.projectStructure?.folders?.length || 'N/A'}`);
      console.log(`🛡️ Quality Gates: ${result.data.qualityGates?.length || 'N/A'}`);
      return { success: true, projectId: result.data.projectId };
    } else {
      console.log('❌ Project initialization failed');
      return { success: false, projectId: null };
    }
  } catch (error) {
    console.log('❌ Project initialization error:', error.message);
    return { success: false, projectId: null };
  }
}

async function testHTMLGeneration(client, projectId) {
  console.log('\n🧪 Testing: HTML Generation via MCP');

  try {
    const result = await client.callTool('smart_write', {
      projectId: projectId,
      featureDescription: 'Create me an HTML page that has a header, a footer, and says "I\'m the best" in the body',
      targetRole: 'developer',
      codeType: 'component',
      techStack: ['html', 'css', 'javascript'],
      businessContext: {
        goals: ['create simple web page', 'test html generation'],
        targetUsers: ['developer'],
        priority: 'high'
      },
      qualityRequirements: {
        testCoverage: 80,
        complexity: 3,
        securityLevel: 'medium'
      }
    });

    if (result.success) {
      console.log('✅ HTML generation successful');
      console.log(`📊 Files Created: ${result.data.generatedCode?.files?.length || 'N/A'}`);
      console.log(`📏 Lines Generated: ${result.data.technicalMetrics?.linesGenerated || 'N/A'}`);
      console.log(`⏱️ Response Time: ${result.data.technicalMetrics?.responseTime || 'N/A'}ms`);

      // Display thought process if available
      if (result.data.thoughtProcess) {
        console.log('\n🧠 TappMCP Thought Process:');
        console.log(`   - Step 1: ${result.data.thoughtProcess.step1_analysis?.decision || 'N/A'}`);
        console.log(`   - Reasoning: ${result.data.thoughtProcess.step1_analysis?.reasoning || 'N/A'}`);
        console.log(`   - Detection Confidence: ${result.data.thoughtProcess.step2_detection?.confidence || 'N/A'}%`);
        console.log(`   - Approach: ${result.data.thoughtProcess.step3_generation?.chosenApproach || 'N/A'}`);
        console.log(`   - Requirements Met: ${result.data.thoughtProcess.step4_validation?.requirementsCheck?.filter(check => check.includes('✅')).length || 0}/${result.data.thoughtProcess.step4_validation?.requirementsCheck?.length || 0}`);
      }

      // Analyze generated HTML
      const generatedCode = result.data.generatedCode;
      if (generatedCode && generatedCode.files) {
        const htmlFile = generatedCode.files.find(file =>
          file.path.endsWith('.html') || file.type === 'html' || file.content.includes('<html')
        );

        if (htmlFile) {
          console.log('\n📄 Generated HTML Analysis:');
          console.log(`   - File Path: ${htmlFile.path}`);
          console.log(`   - File Size: ${htmlFile.content.length} characters`);
          console.log(`   - Has Header: ${htmlFile.content.includes('<header') ? '✅' : '❌'}`);
          console.log(`   - Has Footer: ${htmlFile.content.includes('<footer') ? '✅' : '❌'}`);
          console.log(`   - Has Body: ${htmlFile.content.includes('<body') ? '✅' : '❌'}`);
          console.log(`   - Has "I'm the best": ${htmlFile.content.includes("I'm the best") ? '✅' : '❌'}`);
          console.log(`   - Has DOCTYPE: ${htmlFile.content.includes('<!DOCTYPE') ? '✅' : '❌'}`);
          console.log(`   - Has CSS: ${htmlFile.content.includes('<style') ? '✅' : '❌'}`);

          // Save the generated HTML for inspection
          fs.writeFileSync('deployed-mcp-generated.html', htmlFile.content);
          console.log('💾 Generated HTML saved to: deployed-mcp-generated.html');

          return { success: true, htmlFile };
        } else {
          console.log('❌ No HTML file found in generated code');
          return { success: false, htmlFile: null };
        }
      } else {
        console.log('❌ No generated code found in response');
        return { success: false, htmlFile: null };
      }
    } else {
      console.log('❌ HTML generation failed');
      return { success: false, htmlFile: null };
    }
  } catch (error) {
    console.log('❌ HTML generation error:', error.message);
    return { success: false, htmlFile: null };
  }
}

// Main test execution
async function runTests() {
  console.log('🚀 Starting MCP Deployed Server Tests (Stdio)');
  console.log('==============================================');

  const results = {
    connection: false,
    projectInit: false,
    htmlGeneration: false
  };

  let client = null;
  let projectId = null;

  try {
    // Test 1: Connection
    const connectionResult = await testMCPConnection();
    results.connection = connectionResult.success;
    client = connectionResult.client;

    if (!results.connection) {
      throw new Error('Failed to connect to MCP server');
    }

    // Test 2: Project Initialization
    const initResult = await testProjectInitialization(client);
    results.projectInit = initResult.success;
    projectId = initResult.projectId;

    if (!results.projectInit) {
      throw new Error('Failed to initialize project');
    }

    // Test 3: HTML Generation
    const htmlResult = await testHTMLGeneration(client, projectId);
    results.htmlGeneration = htmlResult.success;

  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  } finally {
    if (client) {
      await client.disconnect();
    }
  }

  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('========================');
  console.log(`MCP Connection: ${results.connection ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Project Initialization: ${results.projectInit ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`HTML Generation: ${results.htmlGeneration ? '✅ PASS' : '❌ FAIL'}`);

  const passCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;
  const score = Math.round((passCount / totalCount) * 100);

  console.log(`\nOverall Score: ${score}% (${passCount}/${totalCount} tests passed)`);
  console.log('Grade:', score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F');

  if (results.htmlGeneration) {
    console.log('\n🎉 HTML Generation Test PASSED!');
    console.log('📄 Check the generated HTML file: deployed-mcp-generated.html');
    console.log('🌐 The deployed MCP server successfully generated HTML code!');
  } else {
    console.log('\n❌ HTML Generation Test FAILED!');
    console.log('🔍 Check the server logs and configuration');
  }
}

// Run the tests
runTests().catch(console.error);
