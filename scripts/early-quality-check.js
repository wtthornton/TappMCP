#!/usr/bin/env node

/**
 * Early Quality Check Script
 * Runs before any development work to ensure clean state
 */

const { execSync } = require('child_process');

console.log('🔍 Early Quality Check - Preventing Issues in SDLC');
console.log('==================================================');

const checks = [
  {
    name: 'TypeScript Compilation',
    command: 'npm run type-check',
    critical: true
  },
  {
    name: 'ESLint Code Quality',
    command: 'npm run lint:check',
    critical: true
  },
  {
    name: 'Code Formatting',
    command: 'npm run format:check',
    critical: false
  },
  {
    name: 'Unit Tests',
    command: 'npm run test',
    critical: true
  }
];

let allPassed = true;
const results = [];

for (const check of checks) {
  try {
    console.log(`\n📋 Running ${check.name}...`);
    execSync(check.command, { stdio: 'inherit' });
    console.log(`✅ ${check.name} - PASSED`);
    results.push({ name: check.name, status: 'PASS', critical: check.critical });
  } catch (error) {
    console.log(`❌ ${check.name} - FAILED`);
    results.push({ name: check.name, status: 'FAIL', critical: check.critical });
    
    if (check.critical) {
      allPassed = false;
    }
  }
}

console.log('\n📊 Quality Check Summary');
console.log('========================');

results.forEach(result => {
  const status = result.status === 'PASS' ? '✅' : '❌';
  const critical = result.critical ? ' (CRITICAL)' : ' (WARNING)';
  console.log(`${status} ${result.name}${critical}`);
});

if (allPassed) {
  console.log('\n🎉 All critical checks passed! Ready for development.');
  process.exit(0);
} else {
  console.log('\n⚠️  Critical issues found. Please fix before continuing.');
  console.log('\n💡 Quick fixes:');
  console.log('   - Run "npm run format" to fix formatting');
  console.log('   - Run "npm run lint" to fix ESLint issues');
  console.log('   - Run "npm run type-check" to see TypeScript errors');
  process.exit(1);
}
