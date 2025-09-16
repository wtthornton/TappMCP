#!/usr/bin/env node

/**
 * Documentation Quality Checker
 * Comprehensive documentation validation for TappMCP project
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

const DOCUMENTATION_STANDARDS = {
  minReadmeLength: 1000,
  minApiDocLength: 500,
  minUserGuideLength: 800,
  requiredFiles: [
    'README.md',
    'docs/API_DOCUMENTATION.md',
    'docs/USER_GUIDE.md',
    'docs/DEPLOYMENT_GUIDE.md'
  ],
  requiredSections: [
    'Installation',
    'Usage',
    'API Reference',
    'Contributing',
    'License'
  ]
};

class DocumentationChecker {
  constructor() {
    this.results = {
      fileCompleteness: { status: 'pending', missing: [], score: 0 },
      contentQuality: { status: 'pending', issues: [], score: 0 },
      apiDocumentation: { status: 'pending', coverage: 0, score: 0 },
      userGuide: { status: 'pending', completeness: 0, score: 0 },
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

  checkFileCompleteness() {
    this.log('\n📚 Checking Documentation File Completeness...', 'blue');

    const missingFiles = [];
    const existingFiles = [];

    for (const file of DOCUMENTATION_STANDARDS.requiredFiles) {
      if (fs.existsSync(file)) {
        existingFiles.push(file);
        this.log(`  ✅ ${file}`, 'green');
      } else {
        missingFiles.push(file);
        this.log(`  ❌ ${file} - Missing`, 'red');
      }
    }

    const score = Math.round((existingFiles.length / DOCUMENTATION_STANDARDS.requiredFiles.length) * 100);

    this.results.fileCompleteness = {
      status: missingFiles.length === 0 ? 'passed' : 'failed',
      missing: missingFiles,
      score
    };

    return this.results.fileCompleteness;
  }

  checkContentQuality() {
    this.log('\n📝 Checking Content Quality...', 'blue');

    const issues = [];
    let totalScore = 0;
    let fileCount = 0;

    // Check README.md
    if (fs.existsSync('README.md')) {
      const readmeContent = fs.readFileSync('README.md', 'utf8');
      const readmeScore = this.analyzeMarkdownContent(readmeContent, 'README.md');
      totalScore += readmeScore.score;
      fileCount++;

      if (readmeScore.issues.length > 0) {
        issues.push(...readmeScore.issues);
      }
    }

    // Check docs directory
    if (fs.existsSync('docs')) {
      const docFiles = fs.readdirSync('docs').filter(file => file.endsWith('.md'));

      for (const file of docFiles) {
        const filePath = path.join('docs', file);
        const content = fs.readFileSync(filePath, 'utf8');
        const fileScore = this.analyzeMarkdownContent(content, filePath);
        totalScore += fileScore.score;
        fileCount++;

        if (fileScore.issues.length > 0) {
          issues.push(...fileScore.issues);
        }
      }
    }

    const avgScore = fileCount > 0 ? Math.round(totalScore / fileCount) : 0;

    this.results.contentQuality = {
      status: avgScore >= 80 ? 'passed' : 'failed',
      issues,
      score: avgScore
    };

    return this.results.contentQuality;
  }

  analyzeMarkdownContent(content, filePath) {
    const issues = [];
    let score = 100;

    // Check length
    if (content.length < DOCUMENTATION_STANDARDS.minReadmeLength && filePath.includes('README')) {
      issues.push(`README.md is too short (${content.length} chars, min: ${DOCUMENTATION_STANDARDS.minReadmeLength})`);
      score -= 20;
    }

    // Check for required sections
    const requiredSections = filePath.includes('README') ? DOCUMENTATION_STANDARDS.requiredSections : [];
    for (const section of requiredSections) {
      if (!content.toLowerCase().includes(section.toLowerCase())) {
        issues.push(`Missing required section: ${section}`);
        score -= 10;
      }
    }

    // Check for code examples
    if (!content.includes('```') && !content.includes('`')) {
      issues.push('No code examples found');
      score -= 15;
    }

    // Check for links
    const linkCount = (content.match(/\[.*?\]\(.*?\)/g) || []).length;
    if (linkCount === 0) {
      issues.push('No links found');
      score -= 10;
    }

    // Check for images
    const imageCount = (content.match(/!\[.*?\]\(.*?\)/g) || []).length;
    if (imageCount === 0 && filePath.includes('README')) {
      issues.push('No images found in README');
      score -= 5;
    }

    // Check for proper headings
    const headingCount = (content.match(/^#+\s/gm) || []).length;
    if (headingCount < 3) {
      issues.push('Insufficient heading structure');
      score -= 10;
    }

    // Check for TODO/FIXME comments
    const todoCount = (content.match(/(TODO|FIXME|XXX|HACK)/gi) || []).length;
    if (todoCount > 0) {
      issues.push(`Found ${todoCount} TODO/FIXME comments`);
      score -= todoCount * 2;
    }

    return { score: Math.max(0, score), issues };
  }

  checkApiDocumentation() {
    this.log('\n🔌 Checking API Documentation...', 'blue');

    let coverage = 0;
    let totalEndpoints = 0;
    let documentedEndpoints = 0;

    // Check if API documentation exists
    if (!fs.existsSync('docs/API_DOCUMENTATION.md')) {
      this.log('  ❌ API documentation file not found', 'red');
      this.results.apiDocumentation = {
        status: 'failed',
        coverage: 0,
        score: 0
      };
      return this.results.apiDocumentation;
    }

    const apiContent = fs.readFileSync('docs/API_DOCUMENTATION.md', 'utf8');

    // Look for API endpoints in source code
    const srcFiles = this.getSourceFiles();
    const endpoints = this.extractEndpoints(srcFiles);
    totalEndpoints = endpoints.length;

    // Check documentation coverage
    for (const endpoint of endpoints) {
      if (apiContent.toLowerCase().includes(endpoint.toLowerCase())) {
        documentedEndpoints++;
      }
    }

    coverage = totalEndpoints > 0 ? Math.round((documentedEndpoints / totalEndpoints) * 100) : 100;

    this.log(`  📊 API Coverage: ${documentedEndpoints}/${totalEndpoints} endpoints (${coverage}%)`,
             coverage >= 80 ? 'green' : 'yellow');

    const score = coverage;

    this.results.apiDocumentation = {
      status: coverage >= 80 ? 'passed' : 'failed',
      coverage,
      score
    };

    return this.results.apiDocumentation;
  }

  getSourceFiles() {
    const files = [];

    const scanDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;

      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanDirectory(fullPath);
        } else if (item.endsWith('.ts') || item.endsWith('.js')) {
          files.push(fullPath);
        }
      }
    };

    scanDirectory('src');
    return files;
  }

  extractEndpoints(files) {
    const endpoints = new Set();

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');

        // Look for Express routes
        const routeMatches = content.match(/app\.(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`]/g);
        if (routeMatches) {
          for (const match of routeMatches) {
            const endpoint = match.match(/['"`]([^'"`]+)['"`]/)[1];
            endpoints.add(endpoint);
          }
        }

        // Look for MCP tools
        const toolMatches = content.match(/name:\s*['"`]([^'"`]+)['"`]/g);
        if (toolMatches) {
          for (const match of toolMatches) {
            const tool = match.match(/['"`]([^'"`]+)['"`]/)[1];
            endpoints.add(`tool:${tool}`);
          }
        }
      } catch (error) {
        // Ignore file read errors
      }
    }

    return Array.from(endpoints);
  }

  checkUserGuide() {
    this.log('\n👥 Checking User Guide...', 'blue');

    if (!fs.existsSync('docs/USER_GUIDE.md')) {
      this.log('  ❌ User guide not found', 'red');
      this.results.userGuide = {
        status: 'failed',
        completeness: 0,
        score: 0
      };
      return this.results.userGuide;
    }

    const userGuideContent = fs.readFileSync('docs/USER_GUIDE.md', 'utf8');
    const requiredSections = [
      'Getting Started',
      'Installation',
      'Configuration',
      'Usage Examples',
      'Troubleshooting'
    ];

    let foundSections = 0;
    for (const section of requiredSections) {
      if (userGuideContent.toLowerCase().includes(section.toLowerCase())) {
        foundSections++;
      }
    }

    const completeness = Math.round((foundSections / requiredSections.length) * 100);
    const score = completeness;

    this.log(`  📊 User Guide Completeness: ${foundSections}/${requiredSections.length} sections (${completeness}%)`,
             completeness >= 80 ? 'green' : 'yellow');

    this.results.userGuide = {
      status: completeness >= 80 ? 'passed' : 'failed',
      completeness,
      score
    };

    return this.results.userGuide;
  }

  calculateOverallScore() {
    const scores = [
      this.results.fileCompleteness.score,
      this.results.contentQuality.score,
      this.results.apiDocumentation.score,
      this.results.userGuide.score
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
    this.log('\n📚 Documentation Quality Report', 'bold');
    this.log('=' .repeat(50), 'blue');

    // Individual results
    const categories = [
      { name: 'File Completeness', result: this.results.fileCompleteness },
      { name: 'Content Quality', result: this.results.contentQuality },
      { name: 'API Documentation', result: this.results.apiDocumentation },
      { name: 'User Guide', result: this.results.userGuide }
    ];

    for (const category of categories) {
      const color = category.result.status === 'passed' ? 'green' : 'red';
      const icon = category.result.status === 'passed' ? '✅' : '❌';
      this.log(`\n${icon} ${category.name}: ${category.result.score}%`, color);

      if (category.result.issues?.length > 0) {
        this.log(`  Issues found:`, 'yellow');
        category.result.issues.slice(0, 3).forEach(issue => {
          this.log(`    • ${issue}`, 'yellow');
        });
        if (category.result.issues.length > 3) {
          this.log(`    ... and ${category.result.issues.length - 3} more`, 'yellow');
        }
      }

      if (category.result.missing?.length > 0) {
        this.log(`  Missing files:`, 'red');
        category.result.missing.forEach(file => {
          this.log(`    • ${file}`, 'red');
        });
      }
    }

    // Overall result
    this.log('\n' + '=' .repeat(50), 'blue');
    const overallColor = this.results.overall.status === 'passed' ? 'green' : 'red';
    const overallIcon = this.results.overall.status === 'passed' ? '🎉' : '🚫';
    this.log(`${overallIcon} OVERALL DOCUMENTATION SCORE: ${this.results.overall.score}%`, overallColor);

    if (this.results.overall.status === 'passed') {
      this.log('\n✅ Documentation quality passed! All standards met.', 'green');
    } else {
      this.log('\n❌ Documentation quality failed. Please address the issues above.', 'red');
    }

    return this.results.overall.status === 'passed';
  }

  async run() {
    this.log('📚 TappMCP Documentation Checker', 'bold');
    this.log('Starting comprehensive documentation validation...\n', 'blue');

    try {
      this.checkFileCompleteness();
      this.checkContentQuality();
      this.checkApiDocumentation();
      this.checkUserGuide();

      this.calculateOverallScore();
      const passed = this.generateReport();

      // Save results to file
      const reportPath = './documentation-report.json';
      fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
      this.log(`\n📄 Detailed report saved to: ${reportPath}`, 'blue');

      process.exit(passed ? 0 : 1);
    } catch (error) {
      this.log(`\n💥 Documentation check failed with error: ${error.message}`, 'red');
      process.exit(1);
    }
  }
}

// Run the documentation checker
const checker = new DocumentationChecker();
checker.run();
