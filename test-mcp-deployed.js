#!/usr/bin/env node

/**
 * Simple MCP Deployed Server Test
 * 
 * This script tests the deployed TappMCP Docker container by making
 * direct HTTP requests to test HTML generation capabilities.
 */

const http = require('http');

// Test configuration
const MCP_CONFIG = {
  host: 'localhost',
  port: 8080,
  timeout: 30000
};

// Helper function to make HTTP requests
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: MCP_CONFIG.host,
      port: MCP_CONFIG.port,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: MCP_CONFIG.timeout
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test functions
async function testHealthEndpoint() {
  console.log('\n🧪 Testing: Health Endpoint');
  try {
    const result = await makeRequest('/health');
    console.log(`✅ Health check: ${result.status} - ${JSON.stringify(result.data)}`);
    return result.status === 200;
  } catch (error) {
    console.log(`❌ Health check failed: ${error.message}`);
    return false;
  }
}

async function testMCPTools() {
  console.log('\n🧪 Testing: MCP Tools Discovery');
  try {
    // Try to discover available tools
    const result = await makeRequest('/tools');
    console.log(`✅ Tools endpoint: ${result.status}`);
    console.log(`📋 Available tools:`, JSON.stringify(result.data, null, 2));
    return result.status === 200;
  } catch (error) {
    console.log(`❌ Tools discovery failed: ${error.message}`);
    return false;
  }
}

async function testHTMLGeneration() {
  console.log('\n🧪 Testing: HTML Generation via MCP');
  
  try {
    // Test project initialization
    console.log('📝 Step 1: Initializing project...');
    const beginResult = await makeRequest('/mcp/smart_begin', 'POST', {
      projectName: 'HTML Test Project',
      description: 'Test HTML generation',
      techStack: ['html', 'css'],
      targetUsers: ['developer'],
      businessGoals: ['test html generation']
    });
    
    console.log(`✅ Project initialization: ${beginResult.status}`);
    console.log(`📊 Project data:`, JSON.stringify(beginResult.data, null, 2));
    
    if (beginResult.status !== 200 || !beginResult.data.success) {
      console.log('❌ Project initialization failed');
      return false;
    }
    
    const projectId = beginResult.data.data?.projectId;
    if (!projectId) {
      console.log('❌ No project ID returned');
      return false;
    }
    
    // Test HTML generation
    console.log('📝 Step 2: Generating HTML page...');
    const writeResult = await makeRequest('/mcp/smart_write', 'POST', {
      projectId: projectId,
      featureDescription: 'Create me an HTML page that has a header, a footer, and says "I\'m the best" in the body',
      targetRole: 'developer',
      codeType: 'component',
      techStack: ['html', 'css', 'javascript']
    });
    
    console.log(`✅ HTML generation: ${writeResult.status}`);
    console.log(`📊 Generated code:`, JSON.stringify(writeResult.data, null, 2));
    
    if (writeResult.status !== 200 || !writeResult.data.success) {
      console.log('❌ HTML generation failed');
      return false;
    }
    
    // Analyze generated HTML
    const generatedCode = writeResult.data.data?.generatedCode;
    if (generatedCode && generatedCode.files) {
      const htmlFile = generatedCode.files.find(file => 
        file.path.endsWith('.html') || file.type === 'html' || file.content.includes('<html')
      );
      
      if (htmlFile) {
        console.log('📄 Generated HTML file found:');
        console.log(`   - Path: ${htmlFile.path}`);
        console.log(`   - Size: ${htmlFile.content.length} characters`);
        console.log(`   - Has Header: ${htmlFile.content.includes('<header') ? '✅' : '❌'}`);
        console.log(`   - Has Footer: ${htmlFile.content.includes('<footer') ? '✅' : '❌'}`);
        console.log(`   - Has Body: ${htmlFile.content.includes('<body') ? '✅' : '❌'}`);
        console.log(`   - Has "I'm the best": ${htmlFile.content.includes("I'm the best") ? '✅' : '❌'}`);
        
        // Save the generated HTML for inspection
        const fs = require('fs');
        fs.writeFileSync('deployed-mcp-generated.html', htmlFile.content);
        console.log('💾 Generated HTML saved to: deployed-mcp-generated.html');
        
        return true;
      } else {
        console.log('❌ No HTML file found in generated code');
        return false;
      }
    } else {
      console.log('❌ No generated code found in response');
      return false;
    }
    
  } catch (error) {
    console.log(`❌ HTML generation test failed: ${error.message}`);
    return false;
  }
}

// Main test execution
async function runTests() {
  console.log('🚀 Starting MCP Deployed Server Tests');
  console.log('=====================================');
  
  const results = {
    health: false,
    tools: false,
    htmlGeneration: false
  };
  
  // Run tests
  results.health = await testHealthEndpoint();
  results.tools = await testMCPTools();
  results.htmlGeneration = await testHTMLGeneration();
  
  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('========================');
  console.log(`Health Endpoint: ${results.health ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Tools Discovery: ${results.tools ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`HTML Generation: ${results.htmlGeneration ? '✅ PASS' : '❌ FAIL'}`);
  
  const passCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;
  const score = Math.round((passCount / totalCount) * 100);
  
  console.log(`\nOverall Score: ${score}% (${passCount}/${totalCount} tests passed)`);
  console.log('Grade:', score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F');
  
  if (results.htmlGeneration) {
    console.log('\n🎉 HTML Generation Test PASSED!');
    console.log('📄 Check the generated HTML file: deployed-mcp-generated.html');
  } else {
    console.log('\n❌ HTML Generation Test FAILED!');
    console.log('🔍 Check the server logs and configuration');
  }
}

// Run the tests
runTests().catch(console.error);
