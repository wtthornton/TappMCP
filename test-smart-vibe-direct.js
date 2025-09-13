#!/usr/bin/env node

/**
 * Test smart_vibe tool via direct HTTP connection to running server
 */

import fetch from 'node-fetch';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testSmartVibe() {
  log('🎨 Testing smart_vibe tool via HTTP connection', colors.blue);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.blue);

  try {
    // Test health endpoint
    log('\n1. Testing health endpoint...', colors.cyan);
    const healthResponse = await fetch('http://localhost:3001/health');
    const healthData = await healthResponse.json();

    if (healthData.status === 'healthy') {
      log('   ✅ Health check passed', colors.green);
      log(`   Status: ${healthData.status}`, colors.blue);
      log(`   Uptime: ${Math.round(healthData.uptime)}s`, colors.blue);
    } else {
      log('   ❌ Health check failed', colors.red);
      return false;
    }

    // Test tools list
    log('\n2. Testing tools list...', colors.cyan);
    const toolsResponse = await fetch('http://localhost:3000/tools');
    const toolsData = await toolsResponse.json();

    if (toolsData.tools && toolsData.tools.length > 0) {
      log(`   ✅ Found ${toolsData.tools.length} tools`, colors.green);
      const smartVibeTool = toolsData.tools.find(tool => tool.name === 'smart_vibe');
      if (smartVibeTool) {
        log('   ✅ smart_vibe tool found', colors.green);
      } else {
        log('   ❌ smart_vibe tool not found', colors.red);
        return false;
      }
    } else {
      log('   ❌ No tools found', colors.red);
      return false;
    }

    // Test smart_vibe tool
    log('\n3. Testing smart_vibe tool...', colors.cyan);
    const smartVibeRequest = {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'smart_vibe',
        arguments: {
          command: 'create a simple html page',
          options: {
            role: 'developer',
            quality: 'standard',
            verbosity: 'standard'
          }
        }
      },
      id: 1
    };

    log('   → Testing smart_vibe: "create a simple html page"', colors.cyan);
    const smartVibeResponse = await fetch('http://localhost:3000/tools', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(smartVibeRequest)
    });

    const smartVibeData = await smartVibeResponse.json();

    if (smartVibeData.result && smartVibeData.result.content) {
      log('   ✅ smart_vibe tool executed successfully!', colors.green);
      log('   Response preview:', colors.blue);

      if (smartVibeData.result.content && smartVibeData.result.content.length > 0) {
        const preview = smartVibeData.result.content[0].text.substring(0, 200) + '...';
        log(`   ${preview}`, colors.blue);
      }

      log('\n🎉 smart_vibe tool is working perfectly!', colors.green);
      log('You can now use smart_vibe commands through the MCP server.', colors.blue);
      return true;
    } else {
      log('   ❌ smart_vibe tool failed', colors.red);
      log(`   Error: ${smartVibeData.error?.message || 'Unknown error'}`, colors.red);
      return false;
    }

  } catch (error) {
    log(`   ❌ Connection error: ${error.message}`, colors.red);
    return false;
  }
}

testSmartVibe().then(success => {
  process.exit(success ? 0 : 1);
});
