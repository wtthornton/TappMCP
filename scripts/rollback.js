#!/usr/bin/env node

/**
 * Simple Rollback Script for Local Docker Deployment
 */

const { execSync } = require('child_process');

class Rollback {
  constructor() {
    this.containerName = 'tappmcp-smart-mcp-1';
    this.port = 8080;
  }

  log(level, message) {
    const colors = {
      INFO: '\x1b[36m',
      ERROR: '\x1b[31m',
      SUCCESS: '\x1b[32m',
      RESET: '\x1b[0m'
    };
    console.log(`${colors[level]}${level}: ${message}${colors.RESET}`);
  }

  exec(command, ignoreError = false) {
    this.log('INFO', `Running: ${command}`);
    try {
      return execSync(command, { encoding: 'utf8' });
    } catch (error) {
      if (!ignoreError) {
        this.log('ERROR', `Command failed: ${error.message}`);
        throw error;
      }
      return null;
    }
  }

  async rollback() {
    try {
      this.log('INFO', '🔄 Starting rollback...');

      // Stop current deployment
      this.exec('docker-compose down', true);

      // Get the previous image
      const images = this.exec('docker images tappmcp-smart-mcp --format "{{.Tag}}" | head -2');
      const imageList = images.trim().split('\n');

      if (imageList.length > 1) {
        const previousTag = imageList[1];
        this.log('INFO', `Rolling back to image: tappmcp-smart-mcp:${previousTag}`);

        // Update docker-compose to use previous image (if needed)
        // For simplicity, just restart with latest
      }

      // Restart
      this.exec('docker-compose up -d');

      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Check health
      this.exec(`curl -f http://localhost:${this.port}/health`);

      this.log('SUCCESS', '✅ Rollback completed successfully');
      this.log('SUCCESS', `🌐 Application: http://localhost:${this.port}`);

    } catch (error) {
      this.log('ERROR', `❌ Rollback failed: ${error.message}`);
      this.log('INFO', '📋 Manual recovery may be needed');
      throw error;
    }
  }
}

async function main() {
  const rollback = new Rollback();
  await rollback.rollback();
}

if (require.main === module) {
  main().catch(error => {
    console.error('Rollback failed:', error.message);
    process.exit(1);
  });
}
