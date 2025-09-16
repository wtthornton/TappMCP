#!/usr/bin/env node

/**
 * Quality Dashboard Generator
 * Comprehensive quality monitoring dashboard for TappMCP project
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

class QualityDashboard {
  constructor() {
    this.results = {
      codeQuality: { status: 'pending', score: 0, details: {} },
      testCoverage: { status: 'pending', score: 0, details: {} },
      security: { status: 'pending', score: 0, details: {} },
      performance: { status: 'pending', score: 0, details: {} },
      documentation: { status: 'pending', score: 0, details: {} },
      overall: { status: 'pending', score: 0, timestamp: new Date().toISOString() }
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
    const details = {};

    for (const check of checks) {
      const result = await this.runCommand(check.command);
      const passed = result.success;

      if (passed) {
        this.log(`  ✅ ${check.name}: PASSED`, 'green');
        passedChecks++;
      } else {
        this.log(`  ❌ ${check.name}: FAILED`, 'red');
      }

      details[check.name.toLowerCase()] = {
        status: passed ? 'passed' : 'failed',
        output: result.output,
        error: result.error
      };
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

    const result = await this.runCommand('npm run test:coverage');

    if (!result.success) {
      this.log('  ❌ Test execution failed', 'red');
      this.results.testCoverage = {
        status: 'failed',
        score: 0,
        details: { error: result.error }
      };
      return this.results.testCoverage;
    }

    const coveragePath = './coverage/coverage-summary.json';
    if (!fs.existsSync(coveragePath)) {
      this.log('  ❌ Coverage report not found', 'red');
      this.results.testCoverage = {
        status: 'failed',
        score: 0,
        details: { error: 'Coverage report not generated' }
      };
      return this.results.testCoverage;
    }

    const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
    const total = coverageData.total;

    const metrics = {
      lines: total.lines.pct,
      functions: total.functions.pct,
      branches: total.branches.pct,
      statements: total.statements.pct
    };

    const avgCoverage = Math.round(
      (metrics.lines + metrics.functions + metrics.branches + metrics.statements) / 4
    );

    this.log(`  📊 Coverage: ${avgCoverage}% (Lines: ${metrics.lines}%, Functions: ${metrics.functions}%, Branches: ${metrics.branches}%, Statements: ${metrics.statements}%)`,
             avgCoverage >= 85 ? 'green' : 'yellow');

    this.results.testCoverage = {
      status: avgCoverage >= 85 ? 'passed' : 'failed',
      score: avgCoverage,
      details: metrics
    };

    return this.results.testCoverage;
  }

  async checkSecurity() {
    this.log('\n🔒 Checking Security...', 'blue');

    const result = await this.runCommand('npm audit --json');

    if (result.success) {
      try {
        const auditData = JSON.parse(result.output);
        const vulnerabilities = auditData.vulnerabilities || {};
        const vulnCount = Object.keys(vulnerabilities).length;

        if (vulnCount === 0) {
          this.log('  ✅ No vulnerabilities found', 'green');
          this.results.security = {
            status: 'passed',
            score: 100,
            details: { vulnerabilities: 0, high: 0, critical: 0 }
          };
        } else {
          const highSeverity = Object.values(vulnerabilities).filter(v =>
            v.severity === 'high' || v.severity === 'critical'
          ).length;

          const score = Math.max(0, 100 - (vulnCount * 10) - (highSeverity * 20));

          this.log(`  ⚠️  Found ${vulnCount} vulnerabilities (${highSeverity} high/critical)`,
                   highSeverity > 0 ? 'red' : 'yellow');

          this.results.security = {
            status: highSeverity > 0 ? 'failed' : 'warning',
            score,
            details: {
              vulnerabilities: vulnCount,
              high: highSeverity,
              critical: Object.values(vulnerabilities).filter(v => v.severity === 'critical').length
            }
          };
        }
      } catch (parseError) {
        this.log('  ❌ Failed to parse audit results', 'red');
        this.results.security = {
          status: 'failed',
          score: 0,
          details: { error: 'Failed to parse audit results' }
        };
      }
    } else {
      this.log('  ❌ Security audit failed', 'red');
      this.results.security = {
        status: 'failed',
        score: 0,
        details: { error: result.error }
      };
    }

    return this.results.security;
  }

  async checkPerformance() {
    this.log('\n⚡ Checking Performance...', 'blue');

    // Check build time
    const buildStart = Date.now();
    const buildResult = await this.runCommand('npm run build');
    const buildTime = Date.now() - buildStart;

    if (!buildResult.success) {
      this.log('  ❌ Build failed', 'red');
      this.results.performance = {
        status: 'failed',
        score: 0,
        details: { error: 'Build failed' }
      };
      return this.results.performance;
    }

    // Check bundle size
    let bundleSize = 0;
    if (fs.existsSync('./dist')) {
      bundleSize = this.getDirectorySize('./dist');
    }

    const buildScore = buildTime <= 30000 ? 50 : Math.max(0, 50 - ((buildTime - 30000) / 1000));
    const sizeScore = bundleSize <= 5 * 1024 * 1024 ? 50 : Math.max(0, 50 - ((bundleSize - 5 * 1024 * 1024) / (1024 * 1024)));
    const totalScore = Math.round(buildScore + sizeScore);

    this.log(`  📊 Build Time: ${buildTime}ms, Bundle Size: ${this.formatBytes(bundleSize)}`,
             totalScore >= 80 ? 'green' : 'yellow');

    this.results.performance = {
      status: totalScore >= 80 ? 'passed' : 'failed',
      score: totalScore,
      details: { buildTime, bundleSize }
    };

    return this.results.performance;
  }

  async checkDocumentation() {
    this.log('\n📚 Checking Documentation...', 'blue');

    const requiredFiles = [
      'README.md',
      'docs/API_DOCUMENTATION.md',
      'docs/USER_GUIDE.md',
      'docs/DEPLOYMENT_GUIDE.md'
    ];

    let existingFiles = 0;
    const details = {};

    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        existingFiles++;
        const content = fs.readFileSync(file, 'utf8');
        details[file] = {
          exists: true,
          size: content.length,
          hasCodeExamples: content.includes('```'),
          hasLinks: (content.match(/\[.*?\]\(.*?\)/g) || []).length
        };
      } else {
        details[file] = { exists: false };
      }
    }

    const score = Math.round((existingFiles / requiredFiles.length) * 100);

    this.log(`  📊 Documentation: ${existingFiles}/${requiredFiles.length} files exist (${score}%)`,
             score >= 80 ? 'green' : 'yellow');

    this.results.documentation = {
      status: score >= 80 ? 'passed' : 'failed',
      score,
      details
    };

    return this.results.documentation;
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
      this.results.codeQuality.score,
      this.results.testCoverage.score,
      this.results.security.score,
      this.results.performance.score,
      this.results.documentation.score
    ];

    const overallScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    const allPassed = scores.every(score => score >= 80);

    this.results.overall = {
      status: allPassed ? 'passed' : 'failed',
      score: overallScore,
      timestamp: new Date().toISOString()
    };

    return this.results.overall;
  }

  generateHTMLReport() {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TappMCP Quality Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; text-align: center; }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header p { font-size: 1.2em; opacity: 0.9; }
        .overall-score { background: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .score-circle { width: 120px; height: 120px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 2em; font-weight: bold; color: white; }
        .score-passed { background: linear-gradient(135deg, #4CAF50, #45a049); }
        .score-failed { background: linear-gradient(135deg, #f44336, #d32f2f); }
        .score-warning { background: linear-gradient(135deg, #ff9800, #f57c00); }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric-card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .metric-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .metric-title { font-size: 1.2em; font-weight: 600; }
        .metric-score { font-size: 1.5em; font-weight: bold; }
        .metric-passed { color: #4CAF50; }
        .metric-failed { color: #f44336; }
        .metric-warning { color: #ff9800; }
        .metric-details { font-size: 0.9em; color: #666; }
        .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.8em; font-weight: 600; text-transform: uppercase; }
        .status-passed { background: #e8f5e8; color: #2e7d32; }
        .status-failed { background: #ffebee; color: #c62828; }
        .status-warning { background: #fff3e0; color: #ef6c00; }
        .footer { text-align: center; color: #666; margin-top: 30px; }
        .timestamp { font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 TappMCP Quality Dashboard</h1>
            <p>Comprehensive Quality Monitoring & Validation</p>
        </div>

        <div class="overall-score">
            <div class="score-circle ${this.results.overall.status === 'passed' ? 'score-passed' : 'score-failed'}">
                ${this.results.overall.score}%
            </div>
            <h2>Overall Quality Score</h2>
            <p class="timestamp">Last updated: ${new Date(this.results.overall.timestamp).toLocaleString()}</p>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-title">🔍 Code Quality</span>
                    <span class="metric-score ${this.results.codeQuality.status === 'passed' ? 'metric-passed' : 'metric-failed'}">
                        ${this.results.codeQuality.score}%
                    </span>
                </div>
                <div class="status-badge status-${this.results.codeQuality.status}">
                    ${this.results.codeQuality.status}
                </div>
                <div class="metric-details">
                    TypeScript, ESLint, Prettier validation
                </div>
            </div>

            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-title">🧪 Test Coverage</span>
                    <span class="metric-score ${this.results.testCoverage.status === 'passed' ? 'metric-passed' : 'metric-failed'}">
                        ${this.results.testCoverage.score}%
                    </span>
                </div>
                <div class="status-badge status-${this.results.testCoverage.status}">
                    ${this.results.testCoverage.status}
                </div>
                <div class="metric-details">
                    ${this.results.testCoverage.details.lines ?
                      `Lines: ${this.results.testCoverage.details.lines}%, Functions: ${this.results.testCoverage.details.functions}%` :
                      'Test execution and coverage analysis'
                    }
                </div>
            </div>

            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-title">🔒 Security</span>
                    <span class="metric-score ${this.results.security.status === 'passed' ? 'metric-passed' : this.results.security.status === 'warning' ? 'metric-warning' : 'metric-failed'}">
                        ${this.results.security.score}%
                    </span>
                </div>
                <div class="status-badge status-${this.results.security.status}">
                    ${this.results.security.status}
                </div>
                <div class="metric-details">
                    ${this.results.security.details.vulnerabilities !== undefined ?
                      `Vulnerabilities: ${this.results.security.details.vulnerabilities}, High: ${this.results.security.details.high}` :
                      'NPM audit and security scanning'
                    }
                </div>
            </div>

            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-title">⚡ Performance</span>
                    <span class="metric-score ${this.results.performance.status === 'passed' ? 'metric-passed' : 'metric-failed'}">
                        ${this.results.performance.score}%
                    </span>
                </div>
                <div class="status-badge status-${this.results.performance.status}">
                    ${this.results.performance.status}
                </div>
                <div class="metric-details">
                    ${this.results.performance.details.buildTime ?
                      `Build: ${this.results.performance.details.buildTime}ms, Size: ${this.formatBytes(this.results.performance.details.bundleSize)}` :
                      'Build time and bundle size analysis'
                    }
                </div>
            </div>

            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-title">📚 Documentation</span>
                    <span class="metric-score ${this.results.documentation.status === 'passed' ? 'metric-passed' : 'metric-failed'}">
                        ${this.results.documentation.score}%
                    </span>
                </div>
                <div class="status-badge status-${this.results.documentation.status}">
                    ${this.results.documentation.status}
                </div>
                <div class="metric-details">
                    README, API docs, user guides, and deployment guides
                </div>
            </div>
        </div>

        <div class="footer">
            <p>Generated by TappMCP Quality Dashboard</p>
            <p class="timestamp">${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>`;

    return html;
  }

  generateReport() {
    this.log('\n🎯 Quality Dashboard Report', 'bold');
    this.log('=' .repeat(50), 'blue');

    // Overall result
    const overallColor = this.results.overall.status === 'passed' ? 'green' : 'red';
    const overallIcon = this.results.overall.status === 'passed' ? '🎉' : '🚫';
    this.log(`${overallIcon} OVERALL QUALITY SCORE: ${this.results.overall.score}%`, overallColor);

    // Individual results
    const categories = [
      { name: 'Code Quality', result: this.results.codeQuality, icon: '🔍' },
      { name: 'Test Coverage', result: this.results.testCoverage, icon: '🧪' },
      { name: 'Security', result: this.results.security, icon: '🔒' },
      { name: 'Performance', result: this.results.performance, icon: '⚡' },
      { name: 'Documentation', result: this.results.documentation, icon: '📚' }
    ];

    for (const category of categories) {
      const color = category.result.status === 'passed' ? 'green' :
                   category.result.status === 'warning' ? 'yellow' : 'red';
      const icon = category.result.status === 'passed' ? '✅' :
                  category.result.status === 'warning' ? '⚠️' : '❌';
      this.log(`\n${icon} ${category.icon} ${category.name}: ${category.result.score}%`, color);
    }

    if (this.results.overall.status === 'passed') {
      this.log('\n✅ All quality checks passed! Your project meets quality standards.', 'green');
    } else {
      this.log('\n❌ Quality checks failed. Please address the issues above.', 'red');
    }

    return this.results.overall.status === 'passed';
  }

  async run() {
    this.log('🎯 TappMCP Quality Dashboard', 'bold');
    this.log('Starting comprehensive quality monitoring...\n', 'blue');

    try {
      await this.checkCodeQuality();
      await this.checkTestCoverage();
      await this.checkSecurity();
      await this.checkPerformance();
      await this.checkDocumentation();

      this.calculateOverallScore();
      const passed = this.generateReport();

      // Save results to JSON
      const jsonReportPath = './quality-dashboard-report.json';
      fs.writeFileSync(jsonReportPath, JSON.stringify(this.results, null, 2));
      this.log(`\n📄 JSON report saved to: ${jsonReportPath}`, 'blue');

      // Generate HTML report
      const htmlReportPath = './quality-dashboard.html';
      const htmlContent = this.generateHTMLReport();
      fs.writeFileSync(htmlReportPath, htmlContent);
      this.log(`📄 HTML dashboard saved to: ${htmlReportPath}`, 'blue');

      process.exit(passed ? 0 : 1);
    } catch (error) {
      this.log(`\n💥 Quality dashboard failed with error: ${error.message}`, 'red');
      process.exit(1);
    }
  }
}

// Run the quality dashboard
const dashboard = new QualityDashboard();
dashboard.run();
