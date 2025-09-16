#!/usr/bin/env node

/**
 * Performance Monitor Script
 * Comprehensive performance validation for TappMCP project
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';

const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

const PERFORMANCE_THRESHOLDS = {
  buildTime: 30000, // 30 seconds
  startTime: 10000, // 10 seconds
  responseTime: 1000, // 1 second
  memoryUsage: 100 * 1024 * 1024, // 100MB
  bundleSize: 5 * 1024 * 1024, // 5MB
  testTime: 60000, // 60 seconds
};

class PerformanceMonitor {
  constructor() {
    this.results = {
      buildPerformance: { status: 'pending', metrics: {}, score: 0 },
      runtimePerformance: { status: 'pending', metrics: {}, score: 0 },
      memoryUsage: { status: 'pending', metrics: {}, score: 0 },
      bundleSize: { status: 'pending', metrics: {}, score: 0 },
      testPerformance: { status: 'pending', metrics: {}, score: 0 },
      overall: { status: 'pending', score: 0 }
    };
    this.appProcess = null;
  }

  log(message, color = 'reset') {
    console.log(`${COLORS[color]}${message}${COLORS.reset}`);
  }

  async runCommand(command, options = {}) {
    try {
      const result = execSync(command, {
        encoding: 'utf8',
        stdio: 'pipe',
        ...options
      });
      return { success: true, output: result };
    } catch (error) {
      return {
        success: false,
        output: error.stdout || error.message,
        error: error.stderr || error.message
      };
    }
  }

  async measureBuildPerformance() {
    this.log('\n⚡ Measuring Build Performance...', 'blue');

    const startTime = performance.now();
    const result = await this.runCommand('npm run build');
    const endTime = performance.now();

    const buildTime = endTime - startTime;
    const passed = buildTime <= PERFORMANCE_THRESHOLDS.buildTime;

    this.log(`  ${passed ? '✅' : '❌'} Build Time: ${buildTime.toFixed(2)}ms (threshold: ${PERFORMANCE_THRESHOLDS.buildTime}ms)`,
             passed ? 'green' : 'red');

    // Check bundle size
    const distPath = './dist';
    let bundleSize = 0;
    if (fs.existsSync(distPath)) {
      bundleSize = this.getDirectorySize(distPath);
      const sizePassed = bundleSize <= PERFORMANCE_THRESHOLDS.bundleSize;
      this.log(`  ${sizePassed ? '✅' : '❌'} Bundle Size: ${this.formatBytes(bundleSize)} (threshold: ${this.formatBytes(PERFORMANCE_THRESHOLDS.bundleSize)})`,
               sizePassed ? 'green' : 'red');
    }

    const score = Math.round(
      (passed ? 50 : 0) +
      (bundleSize <= PERFORMANCE_THRESHOLDS.bundleSize ? 50 : 0)
    );

    this.results.buildPerformance = {
      status: passed && bundleSize <= PERFORMANCE_THRESHOLDS.bundleSize ? 'passed' : 'failed',
      metrics: {
        buildTime,
        bundleSize,
        threshold: PERFORMANCE_THRESHOLDS.buildTime,
        sizeThreshold: PERFORMANCE_THRESHOLDS.bundleSize
      },
      score
    };

    return this.results.buildPerformance;
  }

  async measureRuntimePerformance() {
    this.log('\n⚡ Measuring Runtime Performance...', 'blue');

    // Start the application
    this.log('  🚀 Starting application...', 'blue');
    const startTime = performance.now();

    try {
      this.appProcess = spawn('npm', ['start'], {
        stdio: 'pipe',
        detached: false
      });

      // Wait for app to start
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Application start timeout'));
        }, PERFORMANCE_THRESHOLDS.startTime);

        this.appProcess.stdout.on('data', (data) => {
          if (data.toString().includes('Server running') || data.toString().includes('listening')) {
            clearTimeout(timeout);
            resolve();
          }
        });

        this.appProcess.stderr.on('data', (data) => {
          if (data.toString().includes('Error')) {
            clearTimeout(timeout);
            reject(new Error(data.toString()));
          }
        });
      });

      const appStartTime = performance.now() - startTime;
      const startPassed = appStartTime <= PERFORMANCE_THRESHOLDS.startTime;

      this.log(`  ${startPassed ? '✅' : '❌'} Start Time: ${appStartTime.toFixed(2)}ms (threshold: ${PERFORMANCE_THRESHOLDS.startTime}ms)`,
               startPassed ? 'green' : 'red');

      // Test response time
      const responseStart = performance.now();
      const responseResult = await this.runCommand('curl -f http://localhost:8080/health');
      const responseTime = performance.now() - responseStart;

      const responsePassed = responseTime <= PERFORMANCE_THRESHOLDS.responseTime;
      this.log(`  ${responsePassed ? '✅' : '❌'} Response Time: ${responseTime.toFixed(2)}ms (threshold: ${PERFORMANCE_THRESHOLDS.responseTime}ms)`,
               responsePassed ? 'green' : 'red');

      const score = Math.round(
        (startPassed ? 50 : 0) +
        (responsePassed ? 50 : 0)
      );

      this.results.runtimePerformance = {
        status: startPassed && responsePassed ? 'passed' : 'failed',
        metrics: {
          startTime: appStartTime,
          responseTime,
          startThreshold: PERFORMANCE_THRESHOLDS.startTime,
          responseThreshold: PERFORMANCE_THRESHOLDS.responseTime
        },
        score
      };

    } catch (error) {
      this.log(`  ❌ Runtime performance test failed: ${error.message}`, 'red');
      this.results.runtimePerformance = {
        status: 'failed',
        metrics: {
          startTime: 0,
          responseTime: 0,
          error: error.message
        },
        score: 0
      };
    } finally {
      // Clean up
      if (this.appProcess) {
        this.appProcess.kill();
        this.appProcess = null;
      }
    }

    return this.results.runtimePerformance;
  }

  async measureMemoryUsage() {
    this.log('\n⚡ Measuring Memory Usage...', 'blue');

    // Get memory usage from process
    const memUsage = process.memoryUsage();
    const heapUsed = memUsage.heapUsed;
    const heapTotal = memUsage.heapTotal;
    const external = memUsage.external;

    const totalMemory = heapUsed + external;
    const passed = totalMemory <= PERFORMANCE_THRESHOLDS.memoryUsage;

    this.log(`  ${passed ? '✅' : '❌'} Memory Usage: ${this.formatBytes(totalMemory)} (threshold: ${this.formatBytes(PERFORMANCE_THRESHOLDS.memoryUsage)})`,
             passed ? 'green' : 'red');
    this.log(`    Heap Used: ${this.formatBytes(heapUsed)}`, 'blue');
    this.log(`    Heap Total: ${this.formatBytes(heapTotal)}`, 'blue');
    this.log(`    External: ${this.formatBytes(external)}`, 'blue');

    const score = Math.round(Math.max(0, 100 - ((totalMemory / PERFORMANCE_THRESHOLDS.memoryUsage) * 100)));

    this.results.memoryUsage = {
      status: passed ? 'passed' : 'failed',
      metrics: {
        heapUsed,
        heapTotal,
        external,
        totalMemory,
        threshold: PERFORMANCE_THRESHOLDS.memoryUsage
      },
      score
    };

    return this.results.memoryUsage;
  }

  async measureTestPerformance() {
    this.log('\n⚡ Measuring Test Performance...', 'blue');

    const startTime = performance.now();
    const result = await this.runCommand('npm run test:coverage');
    const endTime = performance.now();

    const testTime = endTime - startTime;
    const passed = testTime <= PERFORMANCE_THRESHOLDS.testTime;

    this.log(`  ${passed ? '✅' : '❌'} Test Time: ${testTime.toFixed(2)}ms (threshold: ${PERFORMANCE_THRESHOLDS.testTime}ms)`,
             passed ? 'green' : 'red');

    const score = Math.round(Math.max(0, 100 - ((testTime / PERFORMANCE_THRESHOLDS.testTime) * 100)));

    this.results.testPerformance = {
      status: passed ? 'passed' : 'failed',
      metrics: {
        testTime,
        threshold: PERFORMANCE_THRESHOLDS.testTime
      },
      score
    };

    return this.results.testPerformance;
  }

  getDirectorySize(dirPath) {
    let totalSize = 0;

    try {
      const files = fs.readdirSync(dirPath);

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
          totalSize += this.getDirectorySize(filePath);
        } else {
          totalSize += stats.size;
        }
      }
    } catch (error) {
      // Ignore errors
    }

    return totalSize;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  calculateOverallScore() {
    const scores = [
      this.results.buildPerformance.score,
      this.results.runtimePerformance.score,
      this.results.memoryUsage.score,
      this.results.testPerformance.score
    ];

    const overallScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    const allPassed = scores.every(score => score >= 80);

    this.results.overall = {
      status: allPassed ? 'passed' : 'failed',
      score: overallScore
    };

    return this.results.overall;
  }

  generateReport() {
    this.log('\n⚡ Performance Monitor Report', 'bold');
    this.log('=' .repeat(50), 'blue');

    // Individual results
    const categories = [
      { name: 'Build Performance', result: this.results.buildPerformance },
      { name: 'Runtime Performance', result: this.results.runtimePerformance },
      { name: 'Memory Usage', result: this.results.memoryUsage },
      { name: 'Test Performance', result: this.results.testPerformance }
    ];

    for (const category of categories) {
      const color = category.result.status === 'passed' ? 'green' : 'red';
      const icon = category.result.status === 'passed' ? '✅' : '❌';
      this.log(`\n${icon} ${category.name}: ${category.result.score}%`, color);

      for (const [key, value] of Object.entries(category.result.metrics)) {
        if (typeof value === 'number' && key.includes('Time')) {
          this.log(`    ${key}: ${value.toFixed(2)}ms`, 'blue');
        } else if (typeof value === 'number' && key.includes('Size') || key.includes('Memory')) {
          this.log(`    ${key}: ${this.formatBytes(value)}`, 'blue');
        } else if (typeof value === 'number') {
          this.log(`    ${key}: ${value}`, 'blue');
        }
      }
    }

    // Overall result
    this.log('\n' + '=' .repeat(50), 'blue');
    const overallColor = this.results.overall.status === 'passed' ? 'green' : 'red';
    const overallIcon = this.results.overall.status === 'passed' ? '🎉' : '🚫';
    this.log(`${overallIcon} OVERALL PERFORMANCE SCORE: ${this.results.overall.score}%`, overallColor);

    if (this.results.overall.status === 'passed') {
      this.log('\n✅ Performance tests passed! Application meets performance requirements.', 'green');
    } else {
      this.log('\n❌ Performance tests failed. Consider optimizing the application.', 'red');
    }

    return this.results.overall.status === 'passed';
  }

  async run() {
    this.log('⚡ TappMCP Performance Monitor', 'bold');
    this.log('Starting comprehensive performance validation...\n', 'blue');

    try {
      await this.measureBuildPerformance();
      await this.measureMemoryUsage();
      await this.measureTestPerformance();
      await this.measureRuntimePerformance();

      this.calculateOverallScore();
      const passed = this.generateReport();

      // Save results to file
      const reportPath = './performance-report.json';
      fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
      this.log(`\n📄 Detailed report saved to: ${reportPath}`, 'blue');

      process.exit(passed ? 0 : 1);
    } catch (error) {
      this.log(`\n💥 Performance monitoring failed with error: ${error.message}`, 'red');
      process.exit(1);
    }
  }
}

// Run the performance monitor
const monitor = new PerformanceMonitor();
monitor.run();
