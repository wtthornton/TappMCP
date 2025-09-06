#!/usr/bin/env node

/**
 * Simple Local Production Deployment Script
 * Deploys the MCP server locally using Docker
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function exec(command, silent = false) {
  try {
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: silent ? 'pipe' : 'inherit'
    });
    return output;
  } catch (error) {
    if (!silent) {
      log(`Error executing: ${command}`, colors.red);
      log(error.message, colors.red);
    }
    throw error;
  }
}

async function deploy() {
  log('\n🚀 Starting Local Production Deployment', colors.blue);

  try {
    // Step 1: Check Docker is running
    log('\n1. Checking Docker...', colors.yellow);
    try {
      exec('docker --version', true);
      log('✓ Docker is available', colors.green);
    } catch {
      log('✗ Docker is not running. Please start Docker first.', colors.red);
      process.exit(1);
    }

    // Step 2: Build the application
    log('\n2. Building application...', colors.yellow);
    exec('npm run build');
    log('✓ Build completed', colors.green);

    // Step 3: Stop any existing deployment
    log('\n3. Stopping existing deployment (if any)...', colors.yellow);
    try {
      exec('docker-compose down', true);
    } catch {
      // Ignore if nothing to stop
    }
    log('✓ Clean slate ready', colors.green);

    // Step 4: Build and start Docker container
    log('\n4. Building and starting Docker container...', colors.yellow);
    exec('docker-compose build --no-cache');
    exec('docker-compose up -d');
    log('✓ Container started', colors.green);

    // Step 5: Wait for health check
    log('\n5. Waiting for service to be healthy...', colors.yellow);
    let healthy = false;
    let attempts = 0;
    const maxAttempts = 30;

    while (!healthy && attempts < maxAttempts) {
      attempts++;
      process.stdout.write('.');

      try {
        const health = exec('docker-compose ps --format json', true);
        if (health.includes('"Health":"healthy"')) {
          healthy = true;
        }
      } catch {
        // Continue waiting
      }

      if (!healthy) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    if (healthy) {
      log('\n✓ Service is healthy', colors.green);
    } else {
      log('\n✗ Service failed health check', colors.red);
      exec('docker-compose logs --tail=50');
      process.exit(1);
    }

    // Step 6: Verify deployment
    log('\n6. Verifying deployment...', colors.yellow);
    try {
      exec('curl -f http://localhost:8080/health', true);
      log('✓ Health endpoint responding', colors.green);
    } catch {
      log('⚠ Health endpoint not responding on port 8080', colors.yellow);
    }

    // Step 7: Show deployment info
    log('\n📊 Deployment Summary:', colors.blue);
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    exec('docker ps --filter name=tappmcp-smart-mcp --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"');

    log('\n✅ Deployment Complete!', colors.green);
    log('\nUseful commands:', colors.yellow);
    log('  View logs:        npm run deploy:logs');
    log('  Check status:     npm run deploy:status');
    log('  Monitor resources: npm run deploy:monitor');
    log('  Stop deployment:  npm run deploy:stop');
    log('  Test MCP:         node scripts/test-mcp-deployment.js');

  } catch (error) {
    log('\n❌ Deployment failed!', colors.red);
    log('Rolling back...', colors.yellow);
    try {
      exec('docker-compose down', true);
    } catch {
      // Best effort rollback
    }
    process.exit(1);
  }
}

// Run deployment
deploy().catch(error => {
  log(`Unexpected error: ${error.message}`, colors.red);
  process.exit(1);
});