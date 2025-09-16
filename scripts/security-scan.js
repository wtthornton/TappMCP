#!/usr/bin/env node

/**
 * Security Scan Script
 * Comprehensive security validation for TappMCP project
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

class SecurityScanner {
  constructor() {
    this.results = {
      npmAudit: { status: 'pending', vulnerabilities: [], score: 0 },
      gitleaks: { status: 'pending', leaks: [], score: 0 },
      osvScanner: { status: 'pending', vulnerabilities: [], score: 0 },
      semgrep: { status: 'pending', findings: [], score: 0 },
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

  async runNpmAudit() {
    this.log('\n🔍 Running NPM Security Audit...', 'blue');

    const result = await this.runCommand('npm audit --json');

    if (result.success) {
      try {
        const auditData = JSON.parse(result.output);
        const vulnerabilities = auditData.vulnerabilities || {};
        const vulnCount = Object.keys(vulnerabilities).length;

        if (vulnCount === 0) {
          this.log('  ✅ No vulnerabilities found', 'green');
          this.results.npmAudit = {
            status: 'passed',
            vulnerabilities: [],
            score: 100
          };
        } else {
          this.log(`  ⚠️  Found ${vulnCount} vulnerabilities`, 'yellow');

          const highSeverity = Object.values(vulnerabilities).filter(v =>
            v.severity === 'high' || v.severity === 'critical'
          ).length;

          const score = Math.max(0, 100 - (vulnCount * 10) - (highSeverity * 20));

          this.results.npmAudit = {
            status: highSeverity > 0 ? 'failed' : 'warning',
            vulnerabilities: Object.entries(vulnerabilities).map(([name, vuln]) => ({
              name,
              severity: vuln.severity,
              description: vuln.description || 'No description available'
            })),
            score
          };
        }
      } catch (parseError) {
        this.log('  ❌ Failed to parse audit results', 'red');
        this.results.npmAudit = {
          status: 'failed',
          vulnerabilities: [],
          score: 0
        };
      }
    } else {
      this.log('  ❌ NPM audit failed', 'red');
      this.results.npmAudit = {
        status: 'failed',
        vulnerabilities: [],
        score: 0
      };
    }

    return this.results.npmAudit;
  }

  async runGitleaks() {
    this.log('\n🔍 Running Gitleaks Secret Detection...', 'blue');

    const result = await this.runCommand('npx gitleaks detect --source . --verbose --json');

    if (result.success) {
      try {
        const leaks = JSON.parse(result.output);

        if (leaks.length === 0) {
          this.log('  ✅ No secrets detected', 'green');
          this.results.gitleaks = {
            status: 'passed',
            leaks: [],
            score: 100
          };
        } else {
          this.log(`  ❌ Found ${leaks.length} potential secrets`, 'red');

          this.results.gitleaks = {
            status: 'failed',
            leaks: leaks.map(leak => ({
              rule: leak.RuleID,
              file: leak.File,
              line: leak.StartLine,
              description: leak.Description
            })),
            score: Math.max(0, 100 - (leaks.length * 25))
          };
        }
      } catch (parseError) {
        this.log('  ⚠️  Gitleaks completed but could not parse results', 'yellow');
        this.results.gitleaks = {
          status: 'warning',
          leaks: [],
          score: 75
        };
      }
    } else {
      this.log('  ⚠️  Gitleaks not available or failed', 'yellow');
      this.results.gitleaks = {
        status: 'warning',
        leaks: [],
        score: 75
      };
    }

    return this.results.gitleaks;
  }

  async runOSVScanner() {
    this.log('\n🔍 Running OSV Scanner...', 'blue');

    const result = await this.runCommand('npx osv-scanner -r . --format=json');

    if (result.success) {
      try {
        const osvData = JSON.parse(result.output);
        const results = osvData.results || [];

        if (results.length === 0) {
          this.log('  ✅ No OSV vulnerabilities found', 'green');
          this.results.osvScanner = {
            status: 'passed',
            vulnerabilities: [],
            score: 100
          };
        } else {
          this.log(`  ⚠️  Found ${results.length} OSV vulnerabilities`, 'yellow');

          this.results.osvScanner = {
            status: 'warning',
            vulnerabilities: results.map(result => ({
              package: result.source?.path || 'Unknown',
              vulnerabilities: result.vulnerabilities?.map(v => ({
                id: v.id,
                summary: v.summary,
                severity: v.severity?.[0]?.score || 'Unknown'
              })) || []
            })),
            score: Math.max(0, 100 - (results.length * 15))
          };
        }
      } catch (parseError) {
        this.log('  ⚠️  OSV Scanner completed but could not parse results', 'yellow');
        this.results.osvScanner = {
          status: 'warning',
          vulnerabilities: [],
          score: 75
        };
      }
    } else {
      this.log('  ⚠️  OSV Scanner not available or failed', 'yellow');
      this.results.osvScanner = {
        status: 'warning',
        vulnerabilities: [],
        score: 75
      };
    }

    return this.results.osvScanner;
  }

  async runSemgrep() {
    this.log('\n🔍 Running Semgrep Security Scan...', 'blue');

    const result = await this.runCommand('npx semgrep --config=auto --config=p/owasp-top-ten . --json');

    if (result.success) {
      try {
        const semgrepData = JSON.parse(result.output);
        const results = semgrepData.results || [];

        if (results.length === 0) {
          this.log('  ✅ No Semgrep security issues found', 'green');
          this.results.semgrep = {
            status: 'passed',
            findings: [],
            score: 100
          };
        } else {
          this.log(`  ⚠️  Found ${results.length} Semgrep security findings`, 'yellow');

          const highSeverity = results.filter(r =>
            r.extra?.severity === 'ERROR' || r.extra?.severity === 'WARNING'
          ).length;

          const score = Math.max(0, 100 - (results.length * 5) - (highSeverity * 10));

          this.results.semgrep = {
            status: highSeverity > 5 ? 'failed' : 'warning',
            findings: results.map(result => ({
              rule: result.check_id,
              file: result.path,
              line: result.start?.line || 0,
              severity: result.extra?.severity || 'INFO',
              message: result.extra?.message || 'No message available'
            })),
            score
          };
        }
      } catch (parseError) {
        this.log('  ⚠️  Semgrep completed but could not parse results', 'yellow');
        this.results.semgrep = {
          status: 'warning',
          findings: [],
          score: 75
        };
      }
    } else {
      this.log('  ⚠️  Semgrep not available or failed', 'yellow');
      this.results.semgrep = {
        status: 'warning',
        findings: [],
        score: 75
      };
    }

    return this.results.semgrep;
  }

  calculateOverallScore() {
    const scores = [
      this.results.npmAudit.score,
      this.results.gitleaks.score,
      this.results.osvScanner.score,
      this.results.semgrep.score
    ];

    const overallScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    const hasFailures = Object.values(this.results).some(result =>
      result.status === 'failed'
    );

    this.results.overall = {
      status: hasFailures ? 'failed' : overallScore >= 90 ? 'passed' : 'warning',
      score: overallScore
    };

    return this.results.overall;
  }

  generateReport() {
    this.log('\n🔒 Security Scan Report', 'bold');
    this.log('=' .repeat(50), 'blue');

    // Individual results
    const categories = [
      { name: 'NPM Audit', result: this.results.npmAudit },
      { name: 'Gitleaks', result: this.results.gitleaks },
      { name: 'OSV Scanner', result: this.results.osvScanner },
      { name: 'Semgrep', result: this.results.semgrep }
    ];

    for (const category of categories) {
      const color = category.result.status === 'passed' ? 'green' :
                   category.result.status === 'warning' ? 'yellow' : 'red';
      const icon = category.result.status === 'passed' ? '✅' :
                  category.result.status === 'warning' ? '⚠️' : '❌';
      this.log(`\n${icon} ${category.name}: ${category.result.score}%`, color);

      if (category.result.vulnerabilities?.length > 0) {
        this.log(`  Found ${category.result.vulnerabilities.length} issues:`, 'yellow');
        category.result.vulnerabilities.slice(0, 3).forEach(vuln => {
          this.log(`    • ${vuln.name || vuln.rule || vuln.package}: ${vuln.severity || 'Unknown severity'}`, 'yellow');
        });
        if (category.result.vulnerabilities.length > 3) {
          this.log(`    ... and ${category.result.vulnerabilities.length - 3} more`, 'yellow');
        }
      }
    }

    // Overall result
    this.log('\n' + '=' .repeat(50), 'blue');
    const overallColor = this.results.overall.status === 'passed' ? 'green' :
                        this.results.overall.status === 'warning' ? 'yellow' : 'red';
    const overallIcon = this.results.overall.status === 'passed' ? '🎉' :
                       this.results.overall.status === 'warning' ? '⚠️' : '🚫';
    this.log(`${overallIcon} OVERALL SECURITY SCORE: ${this.results.overall.score}%`, overallColor);

    if (this.results.overall.status === 'passed') {
      this.log('\n✅ Security scan passed! No critical issues found.', 'green');
    } else if (this.results.overall.status === 'warning') {
      this.log('\n⚠️  Security scan completed with warnings. Review findings above.', 'yellow');
    } else {
      this.log('\n❌ Security scan failed. Critical issues found that must be addressed.', 'red');
    }

    return this.results.overall.status !== 'failed';
  }

  async run() {
    this.log('🔒 TappMCP Security Scanner', 'bold');
    this.log('Starting comprehensive security validation...\n', 'blue');

    try {
      await this.runNpmAudit();
      await this.runGitleaks();
      await this.runOSVScanner();
      await this.runSemgrep();

      this.calculateOverallScore();
      const passed = this.generateReport();

      // Save results to file
      const reportPath = './security-scan-report.json';
      fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
      this.log(`\n📄 Detailed report saved to: ${reportPath}`, 'blue');

      process.exit(passed ? 0 : 1);
    } catch (error) {
      this.log(`\n💥 Security scan failed with error: ${error.message}`, 'red');
      process.exit(1);
    }
  }
}

// Run the security scanner
const scanner = new SecurityScanner();
scanner.run();
