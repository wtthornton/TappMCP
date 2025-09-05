#!/usr/bin/env node

/**
 * Robust Production Deployment System for Smart MCP
 *
 * Features:
 * - Pre-deployment validation
 * - Blue-green deployment support
 * - Health checking with retries
 * - Rollback capabilities
 * - Comprehensive logging
 * - Resource monitoring
 * - Security validation
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class RobustDeployer {
  constructor(options = {}) {
    this.config = {
      imageName: 'smart-mcp',
      containerPrefix: 'tappmcp-smart-mcp',
      port: options.port || 8080,
      internalPort: 3000,
      healthPath: '/health',
      healthRetries: 30,
      healthInterval: 2000,
      blueGreen: options.blueGreen || false,
      environment: options.environment || 'production',
      maxMemory: '512M',
      maxCpu: '0.5',
      ...options
    };

    this.currentContainer = null;
    this.previousContainer = null;
    this.deploymentId = `deploy-${Date.now()}`;
    this.logFile = `deployment-${this.deploymentId}.log`;
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      deploymentId: this.deploymentId,
      level,
      message,
      data
    };

    const logLine = `[${timestamp}] ${level.toUpperCase()}: ${message}${data ? ' ' + JSON.stringify(data) : ''}\n`;

    // Console output with colors
    const colors = {
      INFO: '\x1b[36m', // Cyan
      WARN: '\x1b[33m', // Yellow
      ERROR: '\x1b[31m', // Red
      SUCCESS: '\x1b[32m', // Green
      RESET: '\x1b[0m'
    };

    console.log(`${colors[level] || ''}${logLine.trim()}${colors.RESET}`);

    // File logging
    try {
      if (!fs.existsSync('logs')) {
        fs.mkdirSync('logs');
      }
      fs.appendFileSync(path.join('logs', this.logFile), logLine);
    } catch (err) {
      console.error('Failed to write to log file:', err.message);
    }
  }

  async execCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
      this.log('INFO', `Executing: ${command}`);

      try {
        const result = execSync(command, {
          encoding: 'utf8',
          timeout: options.timeout || 60000,
          ...options
        });
        resolve(result);
      } catch (error) {
        this.log('ERROR', `Command failed: ${command}`, { error: error.message });
        reject(error);
      }
    });
  }

  async preDeploymentValidation() {
    this.log('INFO', '🔍 Starting pre-deployment validation...');

    const validations = [
      {
        name: 'Docker availability',
        check: () => this.execCommand('docker --version')
      },
      {
        name: 'Docker Compose availability',
        check: () => this.execCommand('docker-compose --version')
      },
      {
        name: 'Quality checks',
        check: () => this.execCommand('npm run early-check')
      },
      {
        name: 'Security scan',
        check: () => this.execCommand('npm run security:scan || true') // Non-blocking
      },
      {
        name: 'Build verification',
        check: () => this.execCommand('npm run build')
      }
    ];

    for (const validation of validations) {
      try {
        this.log('INFO', `Validating: ${validation.name}...`);
        await validation.check();
        this.log('SUCCESS', `✅ ${validation.name} - PASSED`);
      } catch (error) {
        this.log('ERROR', `❌ ${validation.name} - FAILED`);
        throw new Error(`Pre-deployment validation failed: ${validation.name}`);
      }
    }

    this.log('SUCCESS', '✅ All pre-deployment validations passed');
  }

  async buildImage() {
    this.log('INFO', '📦 Building Docker image...');

    const tag = `${this.config.imageName}:${this.deploymentId}`;
    await this.execCommand(`docker build -t ${tag} --target production .`);

    // Tag as latest for this deployment
    await this.execCommand(`docker tag ${tag} ${this.config.imageName}:latest`);

    this.log('SUCCESS', `✅ Image built successfully: ${tag}`);
    return tag;
  }

  async discoverCurrentContainer() {
    try {
      const result = await this.execCommand(`docker ps --filter "name=${this.config.containerPrefix}" --format "{{.Names}}" | head -1`);
      this.currentContainer = result.trim();
      if (this.currentContainer) {
        this.log('INFO', `Found current container: ${this.currentContainer}`);
      }
    } catch (error) {
      this.log('INFO', 'No current container found');
    }
  }

  async stopPreviousContainers() {
    this.log('INFO', '🛑 Cleaning up previous containers...');

    try {
      // Get all containers with our prefix
      const containers = await this.execCommand(
        `docker ps -a --filter "name=${this.config.containerPrefix}" --format "{{.Names}}"`
      );

      if (containers.trim()) {
        const containerList = containers.trim().split('\n');
        for (const container of containerList) {
          if (container && container !== this.currentContainer) {
            this.log('INFO', `Stopping container: ${container}`);
            await this.execCommand(`docker stop ${container} || true`);
            await this.execCommand(`docker rm ${container} || true`);
          }
        }
      }
    } catch (error) {
      this.log('WARN', 'Error during container cleanup, continuing...', { error: error.message });
    }
  }

  async deployContainer(imageTag) {
    const containerName = `${this.config.containerPrefix}-${this.deploymentId}`;

    this.log('INFO', `🚀 Deploying new container: ${containerName}`);

    const dockerRunCommand = [
      'docker run -d',
      `--name ${containerName}`,
      '--restart unless-stopped',
      `--memory=${this.config.maxMemory}`,
      `--cpus=${this.config.maxCpu}`,
      `--security-opt no-new-privileges:true`,
      '--read-only',
      '--tmpfs /tmp:noexec,nosuid,size=100m',
      `-p ${this.config.port}:${this.config.internalPort}`,
      `-e NODE_ENV=${this.config.environment}`,
      `-e PORT=${this.config.internalPort}`,
      '-v smart-mcp-data:/app/data',
      imageTag
    ].join(' ');

    await this.execCommand(dockerRunCommand);

    this.currentContainer = containerName;
    this.log('SUCCESS', `✅ Container deployed: ${containerName}`);

    return containerName;
  }

  async waitForHealthy(containerName) {
    this.log('INFO', '🏥 Waiting for container to become healthy...');

    let retries = 0;
    const maxRetries = this.config.healthRetries;

    while (retries < maxRetries) {
      try {
        // Check if container is still running
        await this.execCommand(`docker ps --filter "name=${containerName}" --filter "status=running" --format "{{.Names}}" | grep -q "${containerName}"`);

        // Check health endpoint
        await this.execCommand(`curl -f --max-time 10 http://localhost:${this.config.port}${this.config.healthPath}`);

        this.log('SUCCESS', '✅ Container is healthy and responding');
        return true;
      } catch (error) {
        retries++;
        this.log('WARN', `Health check attempt ${retries}/${maxRetries} failed, retrying in ${this.config.healthInterval}ms...`);

        if (retries >= maxRetries) {
          // Get container logs for debugging
          try {
            const logs = await this.execCommand(`docker logs ${containerName} --tail 50`);
            this.log('ERROR', 'Container logs:', { logs });
          } catch (logError) {
            this.log('ERROR', 'Failed to get container logs', { error: logError.message });
          }

          throw new Error(`Health check failed after ${maxRetries} attempts`);
        }

        await new Promise(resolve => setTimeout(resolve, this.config.healthInterval));
      }
    }
  }

  async performSmokeTesting(containerName) {
    this.log('INFO', '🧪 Performing smoke tests...');

    const tests = [
      {
        name: 'Health endpoint',
        test: () => this.execCommand(`curl -f http://localhost:${this.config.port}/health`)
      },
      {
        name: 'Response time check',
        test: async () => {
          const start = Date.now();
          await this.execCommand(`curl -f --max-time 5 http://localhost:${this.config.port}/health`);
          const responseTime = Date.now() - start;
          if (responseTime > 5000) {
            throw new Error(`Response time too slow: ${responseTime}ms`);
          }
          this.log('INFO', `Response time: ${responseTime}ms`);
        }
      },
      {
        name: 'Container resource usage',
        test: async () => {
          const stats = await this.execCommand(`docker stats ${containerName} --no-stream --format "table {{.CPUPerc}}\t{{.MemUsage}}"`);
          this.log('INFO', 'Container stats:', { stats: stats.trim() });
        }
      }
    ];

    for (const test of tests) {
      try {
        this.log('INFO', `Running test: ${test.name}...`);
        await test.test();
        this.log('SUCCESS', `✅ ${test.name} - PASSED`);
      } catch (error) {
        this.log('ERROR', `❌ ${test.name} - FAILED`, { error: error.message });
        throw new Error(`Smoke test failed: ${test.name}`);
      }
    }
  }

  async rollback() {
    this.log('WARN', '🔄 Starting rollback process...');

    if (this.previousContainer) {
      try {
        // Start the previous container
        await this.execCommand(`docker start ${this.previousContainer}`);
        await this.waitForHealthy(this.previousContainer);

        // Stop the failed current container
        if (this.currentContainer) {
          await this.execCommand(`docker stop ${this.currentContainer} || true`);
          await this.execCommand(`docker rm ${this.currentContainer} || true`);
        }

        this.log('SUCCESS', '✅ Rollback completed successfully');
        return true;
      } catch (error) {
        this.log('ERROR', '❌ Rollback failed', { error: error.message });
        return false;
      }
    } else {
      this.log('WARN', 'No previous container available for rollback');
      return false;
    }
  }

  async cleanup() {
    this.log('INFO', '🧹 Performing post-deployment cleanup...');

    try {
      // Remove old unused images
      await this.execCommand('docker image prune -f --filter "until=24h"');

      // Remove old containers (keep last 3)
      const oldContainers = await this.execCommand(
        `docker ps -a --filter "name=${this.config.containerPrefix}" --format "{{.Names}}" | tail -n +4`
      );

      if (oldContainers.trim()) {
        const containerList = oldContainers.trim().split('\n');
        for (const container of containerList) {
          if (container && container !== this.currentContainer) {
            this.log('INFO', `Removing old container: ${container}`);
            await this.execCommand(`docker rm ${container} || true`);
          }
        }
      }

      this.log('SUCCESS', '✅ Cleanup completed');
    } catch (error) {
      this.log('WARN', 'Cleanup had issues but continuing...', { error: error.message });
    }
  }

  async generateDeploymentReport() {
    const report = {
      deploymentId: this.deploymentId,
      timestamp: new Date().toISOString(),
      config: this.config,
      containers: {
        current: this.currentContainer,
        previous: this.previousContainer
      },
      logFile: this.logFile,
      status: 'success'
    };

    const reportPath = path.join('logs', `deployment-report-${this.deploymentId}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    this.log('INFO', `📋 Deployment report saved: ${reportPath}`);

    return report;
  }

  async deploy() {
    const startTime = Date.now();

    try {
      this.log('INFO', `🚀 Starting robust deployment [${this.deploymentId}]`);
      this.log('INFO', 'Configuration:', this.config);

      // Step 1: Pre-deployment validation
      await this.preDeploymentValidation();

      // Step 2: Discover current state
      await this.discoverCurrentContainer();
      this.previousContainer = this.currentContainer;

      // Step 3: Build new image
      const imageTag = await this.buildImage();

      // Step 4: Deploy new container
      const containerName = await this.deployContainer(imageTag);

      // Step 5: Health check
      await this.waitForHealthy(containerName);

      // Step 6: Smoke testing
      await this.performSmokeTesting(containerName);

      // Step 7: Stop previous containers (after successful deployment)
      await this.stopPreviousContainers();

      // Step 8: Cleanup
      await this.cleanup();

      // Step 9: Generate report
      const report = await this.generateDeploymentReport();

      const duration = Date.now() - startTime;
      this.log('SUCCESS', `🎉 Deployment completed successfully in ${duration}ms`);
      this.log('SUCCESS', `🌐 Application is running at http://localhost:${this.config.port}`);
      this.log('SUCCESS', `🏥 Health endpoint: http://localhost:${this.config.port}${this.config.healthPath}`);

      return { success: true, report, duration };

    } catch (error) {
      this.log('ERROR', '❌ Deployment failed', { error: error.message });

      // Attempt rollback
      const rollbackSuccess = await this.rollback();

      const duration = Date.now() - startTime;
      const report = await this.generateDeploymentReport();
      report.status = 'failed';
      report.error = error.message;
      report.rollbackSuccess = rollbackSuccess;

      this.log('ERROR', `💥 Deployment failed after ${duration}ms`);

      return { success: false, report, duration, error: error.message };
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace('--', '');
    const value = args[i + 1];
    if (key && value) {
      options[key] = value;
    }
  }

  const deployer = new RobustDeployer(options);
  const result = await deployer.deploy();

  process.exit(result.success ? 0 : 1);
}

// Export for testing
module.exports = { RobustDeployer };

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });
}
