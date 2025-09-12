#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

async function checkTappMCPStatus() {
  console.log('\n=== TappMCP Status ===');

  // Check Docker container
  try {
    const { stdout } = await execAsync('docker ps --filter name=tappmcp --format "table {{.Names}}\\t{{.Status}}"');
    if (stdout.trim()) {
      console.log('✅ Docker container:', stdout.trim().split('\n')[1] || 'Running');
    } else {
      console.log('❌ Docker container: Not running');
    }
  } catch (error) {
    console.log('❌ Docker container: Not accessible');
  }

  // Check health endpoint
  try {
    const response = await fetch('http://localhost:8081/health');
    if (response.ok) {
      const health = await response.json();
      console.log('✅ Health endpoint: Responding');
      console.log(`   Uptime: ${Math.floor(health.uptime)}s`);
      console.log(`   Status: ${health.status}`);
    } else {
      console.log('❌ Health endpoint: Not healthy');
    }
  } catch (error) {
    console.log('❌ Health endpoint: Not responding');
  }

  // List tools
  console.log('\n📋 Available Tools:');
  console.log('  - smart_vibe (Natural language interface)');
  console.log('  - smart_begin (Project initialization)');
  console.log('  - smart_write (Code generation)');
  console.log('  - smart_plan (Technical planning)');
  console.log('  - smart_orchestrate (Full SDLC automation)');
  console.log('  - smart_finish (Project completion)');
  console.log('  - smart_converse (Advanced conversation)');

  console.log('\n💡 Usage: smart_vibe "your request here"');
  console.log('======================\n');
}

checkTappMCPStatus().catch(console.error);
