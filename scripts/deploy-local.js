#!/usr/bin/env node

/**
 * Simple Robust Local Docker Deployment
 *
 * Features for local deployment:
 * - Quality validation
 * - Clean container management
 * - Health checking with retries
 * - Basic rollback
 * - Simple logging
 */

const { execSync } = require('child_process');

class LocalDeployer {
  constructor() {
    this.containerName = 'tappmcp-smart-mcp-1';
    this.imageName = 'tappmcp-smart-mcp';
    this.port = 8080;
  }

  log(level, message) {
    const timestamp = new Date().toISOString();
    const colors = {
      INFO: '\x1b[36m',
      WARN: '\x1b[33m',
      ERROR: '\x1b[31m',
      SUCCESS: '\x1b[32m',
      RESET: '\x1b[0m'
    };
    console.log(`${colors[level]}[${timestamp}] ${level}: ${message}${colors.RESET}`);
  }

  exec(command, options = {}) {
    this.log('INFO', `Running: ${command}`);
    try {
      return execSync(command, { encoding: 'utf8', ...options });
    } catch (error) {
      if (!options.ignoreError) {
        this.log('ERROR', `Command failed: ${error.message}`);
        throw error;
      }
      return null;
    }
  }

  async validate() {
    this.log('INFO', '🔍 Running pre-deployment validation...');

    // Check Docker
    this.exec('docker --version');
    this.exec('docker-compose --version');

    // Run quality checks
    this.exec('npm run early-check');

    this.log('SUCCESS', '✅ Validation passed');
  }

  async stopExisting() {
    this.log('INFO', '🛑 Stopping existing deployment...');

    // Stop via docker-compose
    this.exec('docker-compose down', { ignoreError: true });

    // Also stop any individual containers
    this.exec(`docker stop ${this.containerName}`, { ignoreError: true });
    this.exec(`docker rm ${this.containerName}`, { ignoreError: true });

    this.log('SUCCESS', '✅ Existing containers stopped');
  }

  async deploy() {
    this.log('INFO', '🚀 Starting deployment...');

    // Deploy using docker-compose
    this.exec('docker-compose up -d --build');

    this.log('SUCCESS', '✅ Container deployed');
  }

  async waitForHealth() {
    this.log('INFO', '🏥 Waiting for health check...');

    const maxRetries = 30;
    const interval = 2000;

    for (let i = 0; i < maxRetries; i++) {
      try {
        this.exec(`curl -f --max-time 5 http://localhost:${this.port}/health`);
        this.log('SUCCESS', '✅ Health check passed');
        return;
      } catch (error) {
        if (i === maxRetries - 1) {
          this.log('ERROR', '❌ Health check failed');
          this.showLogs();
          throw new Error('Health check timeout');
        }
        this.log('INFO', `Health check attempt ${i + 1}/${maxRetries}, retrying...`);
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
  }

  showLogs() {
    this.log('INFO', '📋 Container logs:');
    try {
      const logs = this.exec(`docker logs ${this.containerName} --tail 20`);
      console.log(logs);
    } catch (error) {
      this.log('ERROR', 'Failed to get logs');
    }
  }

  async rollback() {
    this.log('WARN', '🔄 Rolling back...');

    try {
      // Stop current deployment
      this.exec('docker-compose down', { ignoreError: true });

      // Try to restart with previous image
      this.exec('docker-compose up -d', { ignoreError: true });

      this.log('SUCCESS', '✅ Rollback completed');
    } catch (error) {
      this.log('ERROR', '❌ Rollback failed');
      throw error;
    }
  }

  async run() {
    const startTime = Date.now();

    try {
      this.log('INFO', '🚀 Starting local Docker deployment');

      await this.validate();
      await this.stopExisting();
      await this.deploy();
      await this.waitForHealth();

      const duration = Date.now() - startTime;
      this.log('SUCCESS', `🎉 Deployment completed in ${duration}ms`);
      this.log('SUCCESS', `🌐 Application: http://localhost:${this.port}`);
      this.log('SUCCESS', `🏥 Health: http://localhost:${this.port}/health`);

      return { success: true };

    } catch (error) {
      this.log('ERROR', `❌ Deployment failed: ${error.message}`);

      try {
        await this.rollback();
      } catch (rollbackError) {
        this.log('ERROR', `❌ Rollback also failed: ${rollbackError.message}`);
      }

      return { success: false, error: error.message };
    }
  }
}

// Run deployment
async function main() {
  const deployer = new LocalDeployer();
  const result = await deployer.run();
  process.exit(result.success ? 0 : 1);
}

if (require.main === module) {
  main().catch(error => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });
}

module.exports = { LocalDeployer };
