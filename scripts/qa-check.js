#!/usr/bin/env node

/**
 * QA Check Script - Comprehensive quality assurance
 * Runs ESLint, TypeScript checks, tests, and coverage validation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n${colors.cyan}🔍 ${description}${colors.reset}`);
  try {
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe',
      cwd: process.cwd()
    });
    log(`${colors.green}✅ ${description} - PASSED${colors.reset}`);
    return { success: true, output };
  } catch (error) {
    log(`${colors.red}❌ ${description} - FAILED${colors.reset}`);
    log(`${colors.red}Error: ${error.message}${colors.reset}`);
    return { success: false, error: error.message, output: error.stdout || '' };
  }
}

function checkFileExists(filePath) {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

function main() {
  log(`${colors.bright}${colors.blue}🚀 Starting QA Check Process${colors.reset}`);
  log(`${colors.blue}================================${colors.reset}`);

  const results = {
    eslint: false,
    typescript: false,
    tests: false,
    coverage: false,
    formatting: false,
  };

  // Check if required files exist
  const requiredFiles = [
    'package.json',
    'tsconfig.json',
    '.eslintrc.js',
    '.prettierrc',
  ];

  log(`\n${colors.yellow}📋 Checking required files...${colors.reset}`);
  const missingFiles = requiredFiles.filter(file => !checkFileExists(file));

  if (missingFiles.length > 0) {
    log(`${colors.red}❌ Missing required files: ${missingFiles.join(', ')}${colors.reset}`);
    process.exit(1);
  } else {
    log(`${colors.green}✅ All required files present${colors.reset}`);
  }

  // 1. ESLint Check
  const eslintResult = runCommand('npm run lint:check', 'ESLint Code Quality Check');
  results.eslint = eslintResult.success;

  // 2. TypeScript Check
  const tsResult = runCommand('npm run type-check', 'TypeScript Type Checking');
  results.typescript = tsResult.success;

  // 3. Code Formatting Check
  const formatResult = runCommand('npm run format:check', 'Code Formatting Check');
  results.formatting = formatResult.success;

  // 4. Unit Tests
  const testResult = runCommand('npm run test:coverage', 'Unit Tests with Coverage');
  results.tests = testResult.success;

  // 5. Coverage Check
  const coverageResult = runCommand('npm run test:coverage -- --coverage.thresholds.lines=85 --coverage.thresholds.branches=85', 'Coverage Threshold Check');
  results.coverage = coverageResult.success;

  // Summary
  log(`\n${colors.bright}${colors.blue}📊 QA Check Summary${colors.reset}`);
  log(`${colors.blue}===================${colors.reset}`);

  const totalChecks = Object.keys(results).length;
  const passedChecks = Object.values(results).filter(Boolean).length;
  const successRate = Math.round((passedChecks / totalChecks) * 100);

  Object.entries(results).forEach(([check, passed]) => {
    const status = passed ? `${colors.green}✅ PASS${colors.reset}` : `${colors.red}❌ FAIL${colors.reset}`;
    log(`${status} ${check.toUpperCase()}`);
  });

  log(`\n${colors.bright}Overall: ${passedChecks}/${totalChecks} checks passed (${successRate}%)${colors.reset}`);

  if (successRate === 100) {
    log(`${colors.green}🎉 All QA checks passed! Code is ready for commit.${colors.reset}`);
    process.exit(0);
  } else {
    log(`${colors.red}⚠️  Some QA checks failed. Please fix issues before committing.${colors.reset}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, runCommand, checkFileExists };
