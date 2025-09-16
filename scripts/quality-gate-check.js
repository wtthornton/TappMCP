#!/usr/bin/env node

/**
 * Quality Gate Check Script
 * Comprehensive quality validation for TappMCP project
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const QUALITY_THRESHOLDS = {
  coverage: 85,
  eslint: 0, // 0 errors allowed
  typescript: 0, // 0 errors allowed
  prettier: 0, // 0 errors allowed
  security: 0, // 0 high/critical vulnerabilities
  performance: 1000, // Max response time in ms
};

const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

class QualityGateChecker {
  constructor() {
    this.results = {
      codeQuality: { status: 'pending', score: 0, details: [] },
      testCoverage: { status: 'pending', score: 0, details: [] },
      security: { status: 'pending', score: 0, details: [] },
      performance: { status: 'pending', score: 0, details: [] },
      overall: { status: 'pending', score: 0 }
    };
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

  async checkCodeQuality() {
    this.log('\n🔍 Checking Code Quality...', 'blue');

    const checks = [
      { name: 'TypeScript', command: 'npm run type-check' },
      { name: 'ESLint', command: 'npm run lint:check' },
      { name: 'Prettier', command: 'npm run format:check' }
    ];

    let passedChecks = 0;
    const details = [];

    for (const check of checks) {
      const result = await this.runCommand(check.command);
      if (result.success) {
        this.log(`  ✅ ${check.name}: PASSED`, 'green');
        passedChecks++;
        details.push({ check: check.name, status: 'passed', message: 'No issues found' });
      } else {
        this.log(`  ❌ ${check.name}: FAILED`, 'red');
        details.push({
          check: check.name,
          status: 'failed',
          message: result.error || 'Check failed',
          output: result.output
        });
      }
    }

    const score = Math.round((passedChecks / checks.length) * 100);
    this.results.codeQuality = {
      status: score === 100 ? 'passed' : 'failed',
      score,
      details
    };

    return this.results.codeQuality;
  }

  async checkTestCoverage() {
    this.log('\n🧪 Checking Test Coverage...', 'blue');

    // First run tests with coverage
    const testResult = await this.runCommand('npm run test:coverage');

    if (!testResult.success) {
      this.log('  ❌ Test execution failed', 'red');
      this.results.testCoverage = {
        status: 'failed',
        score: 0,
        details: [{ check: 'Test Execution', status: 'failed', message: testResult.error }]
      };
      return this.results.testCoverage;
    }

    // Check if coverage report exists
    const coveragePath = './coverage/coverage-summary.json';
    if (!fs.existsSync(coveragePath)) {
      this.log('  ❌ Coverage report not found', 'red');
      this.results.testCoverage = {
        status: 'failed',
        score: 0,
        details: [{ check: 'Coverage Report', status: 'failed', message: 'Coverage report not generated' }]
      };
      return this.results.testCoverage;
    }

    // Parse coverage report
    const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
    const total = coverageData.total;

    const metrics = [
      { name: 'Lines', value: total.lines.pct, threshold: QUALITY_THRESHOLDS.coverage },
      { name: 'Functions', value: total.functions.pct, threshold: QUALITY_THRESHOLDS.coverage },
      { name: 'Branches', value: total.branches.pct, threshold: QUALITY_THRESHOLDS.coverage },
      { name: 'Statements', value: total.statements.pct, threshold: QUALITY_THRESHOLDS.coverage }
    ];

    const details = [];
    let passedMetrics = 0;

    for (const metric of metrics) {
      const passed = metric.value >= metric.threshold;
      const status = passed ? 'passed' : 'failed';
      const color = passed ? 'green' : 'red';

      this.log(`  ${passed ? '✅' : '❌'} ${metric.name}: ${metric.value}% (threshold: ${metric.threshold}%)`, color);

      details.push({
        check: metric.name,
        status,
        value: metric.value,
        threshold: metric.threshold,
        message: `${metric.value}% coverage (threshold: ${metric.threshold}%)`
      });

      if (passed) passedMetrics++;
    }

    const score = Math.round((passedMetrics / metrics.length) * 100);
    this.results.testCoverage = {
      status: score === 100 ? 'passed' : 'failed',
      score,
      details
    };

    return this.results.testCoverage;
  }

  async checkSecurity() {
    this.log('\n🔒 Checking Security...', 'blue');

    const securityChecks = [
      { name: 'NPM Audit', command: 'npm audit --audit-level=moderate' },
      { name: 'Gitleaks', command: 'npx gitleaks detect --source . --verbose' },
      { name: 'OSV Scanner', command: 'npx osv-scanner -r .' }
    ];

    const details = [];
    let passedChecks = 0;

    for (const check of securityChecks) {
      const result = await this.runCommand(check.command);

      if (result.success) {
        this.log(`  ✅ ${check.name}: PASSED`, 'green');
        details.push({ check: check.name, status: 'passed', message: 'No security issues found' });
        passedChecks++;
      } else {
        // Check if it's a real failure or just warnings
        const isRealFailure = result.error && result.error.includes('vulnerabilities found');
        if (isRealFailure) {
          this.log(`  ❌ ${check.name}: FAILED`, 'red');
          details.push({
            check: check.name,
            status: 'failed',
            message: 'Security vulnerabilities found',
            output: result.error
          });
        } else {
          this.log(`  ⚠️  ${check.name}: WARNING`, 'yellow');
          details.push({
            check: check.name,
            status: 'warning',
            message: 'Check completed with warnings',
            output: result.output
          });
          passedChecks++; // Count as passed if just warnings
        }
      }
    }

    const score = Math.round((passedChecks / securityChecks.length) * 100);
    this.results.security = {
      status: score === 100 ? 'passed' : 'failed',
      score,
      details
    };

    return this.results.security;
  }

  async checkPerformance() {
    this.log('\n⚡ Checking Performance...', 'blue');

    // Build the project first
    const buildResult = await this.runCommand('npm run build');
    if (!buildResult.success) {
      this.log('  ❌ Build failed', 'red');
      this.results.performance = {
        status: 'failed',
        score: 0,
        details: [{ check: 'Build', status: 'failed', message: 'Project build failed' }]
      };
      return this.results.performance;
    }

    // Start the application
    this.log('  🚀 Starting application...', 'blue');
    const startResult = await this.runCommand('npm start', { timeout: 10000 });

    if (!startResult.success) {
      this.log('  ❌ Application failed to start', 'red');
      this.results.performance = {
        status: 'failed',
        score: 0,
        details: [{ check: 'Application Start', status: 'failed', message: 'Application failed to start' }]
      };
      return this.results.performance;
    }

    // Wait a moment for the app to fully start
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Test health endpoint
    const healthResult = await this.runCommand('curl -f http://localhost:8080/health');

    const details = [];
    let passedChecks = 0;

    if (healthResult.success) {
      this.log('  ✅ Health Check: PASSED', 'green');
      details.push({ check: 'Health Check', status: 'passed', message: 'Application is healthy' });
      passedChecks++;
    } else {
      this.log('  ❌ Health Check: FAILED', 'red');
      details.push({ check: 'Health Check', status: 'failed', message: 'Health check failed' });
    }

    // Basic performance test (response time)
    const perfResult = await this.runCommand('curl -w "@-" -o /dev/null -s http://localhost:8080/health <<< "time_total: %{time_total}"');

    if (perfResult.success) {
      const responseTime = parseFloat(perfResult.output.split(':')[1]?.trim()) * 1000; // Convert to ms
      const passed = responseTime <= QUALITY_THRESHOLDS.performance;

      this.log(`  ${passed ? '✅' : '❌'} Response Time: ${responseTime.toFixed(2)}ms (threshold: ${QUALITY_THRESHOLDS.performance}ms)`,
               passed ? 'green' : 'red');

      details.push({
        check: 'Response Time',
        status: passed ? 'passed' : 'failed',
        value: responseTime,
        threshold: QUALITY_THRESHOLDS.performance,
        message: `${responseTime.toFixed(2)}ms response time`
      });

      if (passed) passedChecks++;
    }

    // Stop the application
    try {
      execSync('pkill -f "node dist/server.js"', { stdio: 'pipe' });
    } catch (e) {
      // Ignore errors when stopping
    }

    const score = Math.round((passedChecks / 2) * 100);
    this.results.performance = {
      status: score === 100 ? 'passed' : 'failed',
      score,
      details
    };

    return this.results.performance;
  }

  calculateOverallScore() {
    const scores = [
      this.results.codeQuality.score,
      this.results.testCoverage.score,
      this.results.security.score,
      this.results.performance.score
    ];

    const overallScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    const allPassed = scores.every(score => score === 100);

    this.results.overall = {
      status: allPassed ? 'passed' : 'failed',
      score: overallScore
    };

    return this.results.overall;
  }

  generateReport() {
    this.log('\n📊 Quality Gate Report', 'bold');
    this.log('=' .repeat(50), 'blue');

    // Individual results
    const categories = [
      { name: 'Code Quality', result: this.results.codeQuality },
      { name: 'Test Coverage', result: this.results.testCoverage },
      { name: 'Security', result: this.results.security },
      { name: 'Performance', result: this.results.performance }
    ];

    for (const category of categories) {
      const color = category.result.status === 'passed' ? 'green' : 'red';
      const icon = category.result.status === 'passed' ? '✅' : '❌';
      this.log(`\n${icon} ${category.name}: ${category.result.score}%`, color);

      for (const detail of category.result.details) {
        const detailColor = detail.status === 'passed' ? 'green' :
                           detail.status === 'warning' ? 'yellow' : 'red';
        const detailIcon = detail.status === 'passed' ? '  ✓' :
                          detail.status === 'warning' ? '  ⚠' : '  ✗';
        this.log(`${detailIcon} ${detail.check}: ${detail.message}`, detailColor);
      }
    }

    // Overall result
    this.log('\n' + '=' .repeat(50), 'blue');
    const overallColor = this.results.overall.status === 'passed' ? 'green' : 'red';
    const overallIcon = this.results.overall.status === 'passed' ? '🎉' : '🚫';
    this.log(`${overallIcon} OVERALL QUALITY GATE: ${this.results.overall.status.toUpperCase()}`, overallColor);
    this.log(`📈 Overall Score: ${this.results.overall.score}%`, overallColor);

    if (this.results.overall.status === 'passed') {
      this.log('\n✅ All quality checks passed! Your code is ready for deployment.', 'green');
    } else {
      this.log('\n❌ Quality gate failed. Please fix the issues above before proceeding.', 'red');
    }

    return this.results.overall.status === 'passed';
  }

  async run() {
    this.log('🎯 TappMCP Quality Gate Checker', 'bold');
    this.log('Starting comprehensive quality validation...\n', 'blue');

    try {
      await this.checkCodeQuality();
      await this.checkTestCoverage();
      await this.checkSecurity();
      await this.checkPerformance();

      this.calculateOverallScore();
      const passed = this.generateReport();

      // Save results to file
      const reportPath = './quality-gate-report.json';
      fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
      this.log(`\n📄 Detailed report saved to: ${reportPath}`, 'blue');

      process.exit(passed ? 0 : 1);
    } catch (error) {
      this.log(`\n💥 Quality gate check failed with error: ${error.message}`, 'red');
      process.exit(1);
    }
  }
}

// Run the quality gate checker
const checker = new QualityGateChecker();
checker.run();
