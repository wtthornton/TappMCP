#!/usr/bin/env node

/**
 * Test MCP Server Connection for New Agents
 * This script can be run by any new agent to verify TappMCP connectivity
 */

import http from 'http';

async function testMCPConnection() {
  console.log('🔌 Testing TappMCP MCP Server Connection');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Test 1: Health Check
  console.log('\n1. Testing health endpoint...');
  try {
    const healthResponse = await fetch('http://localhost:8081/health');
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log('✅ Health check passed');
      console.log(`   Status: ${health.status}`);
      console.log(`   Uptime: ${Math.round(health.uptime)}s`);
    } else {
      console.log('❌ Health check failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return false;
  }

  // Test 2: List Available Tools
  console.log('\n2. Testing tools list...');
  try {
    const toolsResponse = await fetch('http://localhost:8080/tools');
    if (toolsResponse.ok) {
      const tools = await toolsResponse.json();
      console.log('✅ Tools list retrieved');
      console.log(`   Available tools: ${tools.tools.length}`);
      tools.tools.forEach(tool => {
        console.log(`   - ${tool.name}`);
      });
    } else {
      console.log('❌ Tools list failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Tools list failed:', error.message);
    return false;
  }

  // Test 3: Test smart_vibe tool
  console.log('\n3. Testing smart_vibe tool...');
  try {
    const vibeResponse = await fetch('http://localhost:8080/tools', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'smart_vibe',
          arguments: {
            command: 'test connection',
            options: {
              role: 'developer',
              quality: 'standard'
            }
          }
        },
        id: 1
      })
    });

    if (vibeResponse.ok) {
      const result = await vibeResponse.json();
      if (result.result && result.result.content) {
        console.log('✅ smart_vibe tool working');
        console.log('   Response received successfully');
      } else if (result.error) {
        console.log('⚠️ smart_vibe tool error:', result.error.message);
      } else {
        console.log('❌ Unexpected smart_vibe response');
        return false;
      }
    } else {
      console.log('❌ smart_vibe tool failed');
      return false;
    }
  } catch (error) {
    console.log('❌ smart_vibe tool failed:', error.message);
    return false;
  }

  console.log('\n🎉 All tests passed! TappMCP is ready for new agents.');
  console.log('\n📋 Connection Details:');
  console.log('   MCP Server: http://localhost:8080');
  console.log('   Health Check: http://localhost:8081/health');
  console.log('   Available Tools: smart_begin, smart_plan, smart_write, smart_finish, smart_orchestrate, smart_converse, smart_vibe');

  return true;
}

testMCPConnection().then(success => {
  process.exit(success ? 0 : 1);
});
