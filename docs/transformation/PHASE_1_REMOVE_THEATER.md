# Phase 1: Remove Theater - Implementation Guide

## Overview
**Duration:** 3 weeks
**Goal:** Replace all fake/simulated functionality with real implementations
**Priority:** 🔴 CRITICAL - This is the foundation for all other work

---

## Week 1: Core Business Logic Replacement

### Day 1-2: Business Calculation Engine

#### Step 1: Create BusinessCalculationEngine Class

**Location:** `src/core/business-calculation-engine.ts`

```typescript
// NEW FILE: src/core/business-calculation-engine.ts
export class BusinessCalculationEngine {
  /**
   * Calculate real ROI based on industry standards
   * @param investment Initial investment amount
   * @param returns Array of periodic returns
   * @param periods Number of periods (years/months)
   */
  calculateROI(investment: number, returns: number[], periods: number): number {
    const totalReturns = returns.reduce((sum, ret) => sum + ret, 0);
    const netProfit = totalReturns - investment;
    const roi = (netProfit / investment) * 100;
    return Math.round(roi * 100) / 100;
  }

  /**
   * Calculate Net Present Value
   * @param cashFlows Array of cash flows (negative = outflow, positive = inflow)
   * @param discountRate Discount rate as decimal (e.g., 0.1 for 10%)
   */
  calculateNPV(cashFlows: number[], discountRate: number): number {
    return cashFlows.reduce((npv, cashFlow, period) => {
      return npv + cashFlow / Math.pow(1 + discountRate, period);
    }, 0);
  }

  /**
   * Calculate Internal Rate of Return using Newton's method
   */
  calculateIRR(cashFlows: number[]): number {
    let rate = 0.1; // Initial guess
    let tolerance = 0.00001;
    let maxIterations = 100;

    for (let i = 0; i < maxIterations; i++) {
      const npv = this.calculateNPV(cashFlows, rate);
      const npvDerivative = this.calculateNPVDerivative(cashFlows, rate);

      const newRate = rate - npv / npvDerivative;

      if (Math.abs(newRate - rate) < tolerance) {
        return Math.round(newRate * 10000) / 100; // Return as percentage
      }

      rate = newRate;
    }

    return 0; // Failed to converge
  }

  private calculateNPVDerivative(cashFlows: number[], rate: number): number {
    return cashFlows.reduce((derivative, cashFlow, period) => {
      if (period === 0) return derivative;
      return derivative - (period * cashFlow) / Math.pow(1 + rate, period + 1);
    }, 0);
  }

  /**
   * Calculate real project value based on multiple factors
   */
  calculateProjectValue(params: {
    timeToMarket: number;
    marketSize: number;
    competitiveLandscape: number; // 0-1 scale
    teamCapability: number; // 0-1 scale
    technicalComplexity: number; // 0-1 scale
  }): {
    estimatedRevenue: number;
    riskAdjustedValue: number;
    confidenceLevel: number;
  } {
    const {
      timeToMarket,
      marketSize,
      competitiveLandscape,
      teamCapability,
      technicalComplexity
    } = params;

    // Market penetration based on time to market
    const marketPenetration = Math.exp(-timeToMarket / 12) * 0.15; // 15% max penetration

    // Risk factors
    const competitiveRisk = 1 - competitiveLandscape;
    const executionRisk = teamCapability;
    const technicalRisk = 1 - technicalComplexity;

    // Combined risk factor
    const riskFactor = (competitiveRisk * 0.3 + executionRisk * 0.4 + technicalRisk * 0.3);

    // Calculate values
    const estimatedRevenue = marketSize * marketPenetration;
    const riskAdjustedValue = estimatedRevenue * riskFactor;
    const confidenceLevel = Math.min(95, riskFactor * 100);

    return {
      estimatedRevenue: Math.round(estimatedRevenue),
      riskAdjustedValue: Math.round(riskAdjustedValue),
      confidenceLevel: Math.round(confidenceLevel)
    };
  }
}
```

#### Step 2: Replace Fake Calculations in smart-plan.ts

**File:** `src/tools/smart-plan.ts`

**BEFORE (Fake):**
```typescript
// Line ~180-190
const businessValue = {
  estimatedROI: budget * 2.5, // FAKE!
  timeToMarket: 3.0,
  riskMitigation: risks.length * 1000, // FAKE!
  qualityImprovement: 75 // FAKE!
};
```

**AFTER (Real):**
```typescript
import { BusinessCalculationEngine } from '../core/business-calculation-engine';

const calculationEngine = new BusinessCalculationEngine();

// Real calculation based on project parameters
const cashFlows = this.generateCashFlowProjection(budget, timeline, resources);
const realROI = calculationEngine.calculateROI(
  budget.total,
  cashFlows.returns,
  timeline.totalDuration
);

const realNPV = calculationEngine.calculateNPV(
  cashFlows.all,
  0.1 // 10% discount rate
);

const projectValue = calculationEngine.calculateProjectValue({
  timeToMarket: timeline.totalDuration,
  marketSize: this.estimateMarketSize(requirements),
  competitiveLandscape: 0.7, // From market analysis
  teamCapability: this.assessTeamCapability(resources.team),
  technicalComplexity: this.assessComplexity(requirements)
});

const businessValue = {
  estimatedROI: realROI,
  netPresentValue: realNPV,
  timeToMarket: timeline.totalDuration / 30, // Convert days to months
  riskAdjustedValue: projectValue.riskAdjustedValue,
  qualityImprovement: this.calculateQualityImprovement(currentMetrics, targetMetrics)
};
```

### Day 3-4: Performance Metrics Engine

#### Step 1: Create PerformanceMetricsEngine

**Location:** `src/core/performance-metrics-engine.ts`

```typescript
// NEW FILE: src/core/performance-metrics-engine.ts
import { performance } from 'perf_hooks';
import * as v8 from 'v8';
import { execSync } from 'child_process';

export class PerformanceMetricsEngine {
  private startTime: number = 0;
  private startMemory: NodeJS.MemoryUsage | null = null;
  private marks: Map<string, number> = new Map();

  /**
   * Start performance measurement
   */
  startMeasurement(label: string = 'default'): void {
    this.startTime = performance.now();
    this.startMemory = process.memoryUsage();
    this.marks.set(label, this.startTime);
  }

  /**
   * End measurement and return metrics
   */
  endMeasurement(label: string = 'default'): {
    executionTime: number;
    memoryUsed: number;
    cpuUsage: NodeJS.CpuUsage;
  } {
    const endTime = performance.now();
    const endMemory = process.memoryUsage();
    const startTime = this.marks.get(label) || this.startTime;

    const executionTime = endTime - startTime;
    const memoryUsed = this.startMemory
      ? (endMemory.heapUsed - this.startMemory.heapUsed) / 1024 / 1024
      : 0;

    const cpuUsage = process.cpuUsage();

    return {
      executionTime: Math.round(executionTime * 100) / 100,
      memoryUsed: Math.round(memoryUsed * 100) / 100,
      cpuUsage
    };
  }

  /**
   * Get real test coverage from coverage reports
   */
  async getRealTestCoverage(projectPath: string): Promise<{
    line: number;
    branch: number;
    function: number;
    statement: number;
  }> {
    try {
      // Run coverage command
      const coverageOutput = execSync('npm run test:coverage -- --json', {
        cwd: projectPath,
        encoding: 'utf8'
      });

      const coverage = JSON.parse(coverageOutput);

      return {
        line: coverage.total.lines.pct,
        branch: coverage.total.branches.pct,
        function: coverage.total.functions.pct,
        statement: coverage.total.statements.pct
      };
    } catch (error) {
      // Fallback to parsing lcov file
      return this.parseLcovFile(`${projectPath}/coverage/lcov.info`);
    }
  }

  /**
   * Parse lcov coverage file
   */
  private parseLcovFile(lcovPath: string): {
    line: number;
    branch: number;
    function: number;
    statement: number;
  } {
    const fs = require('fs');

    try {
      const lcovContent = fs.readFileSync(lcovPath, 'utf8');
      const lines = lcovContent.split('\n');

      let linesFound = 0, linesHit = 0;
      let branchesFound = 0, branchesHit = 0;
      let functionsFound = 0, functionsHit = 0;

      lines.forEach(line => {
        if (line.startsWith('LF:')) linesFound += parseInt(line.substring(3));
        if (line.startsWith('LH:')) linesHit += parseInt(line.substring(3));
        if (line.startsWith('BRF:')) branchesFound += parseInt(line.substring(4));
        if (line.startsWith('BRH:')) branchesHit += parseInt(line.substring(4));
        if (line.startsWith('FNF:')) functionsFound += parseInt(line.substring(4));
        if (line.startsWith('FNH:')) functionsHit += parseInt(line.substring(4));
      });

      return {
        line: linesFound > 0 ? (linesHit / linesFound) * 100 : 0,
        branch: branchesFound > 0 ? (branchesHit / branchesFound) * 100 : 0,
        function: functionsFound > 0 ? (functionsHit / functionsFound) * 100 : 0,
        statement: linesFound > 0 ? (linesHit / linesFound) * 100 : 0
      };
    } catch (error) {
      console.error('Failed to parse lcov file:', error);
      return { line: 0, branch: 0, function: 0, statement: 0 };
    }
  }

  /**
   * Profile code execution
   */
  async profileExecution<T>(
    fn: () => Promise<T>,
    options: {
      sampleInterval?: number;
      collectGarbage?: boolean;
    } = {}
  ): Promise<{
    result: T;
    profile: {
      executionTime: number;
      memoryUsage: NodeJS.MemoryUsage;
      heapSnapshot?: any;
    };
  }> {
    const { sampleInterval = 100, collectGarbage = false } = options;

    if (collectGarbage && global.gc) {
      global.gc();
    }

    const startTime = performance.now();
    const startMemory = process.memoryUsage();

    // Take initial heap snapshot
    const startHeapSnapshot = v8.getHeapSnapshot();

    const result = await fn();

    const endTime = performance.now();
    const endMemory = process.memoryUsage();

    return {
      result,
      profile: {
        executionTime: endTime - startTime,
        memoryUsage: {
          rss: endMemory.rss - startMemory.rss,
          heapTotal: endMemory.heapTotal - startMemory.heapTotal,
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          external: endMemory.external - startMemory.external,
          arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers
        },
        heapSnapshot: collectGarbage ? v8.getHeapSnapshot() : undefined
      }
    };
  }
}
```

#### Step 2: Replace Fake Performance Metrics in smart-finish.ts

**File:** `src/tools/smart-finish.ts`

**BEFORE (Fake):**
```typescript
// Line ~240-250
const qualityScorecard = {
  testCoverage: {
    line: Math.random() * 10 + 85, // FAKE!
    branch: Math.random() * 10 + 80, // FAKE!
    function: Math.random() * 15 + 80, // FAKE!
    statement: Math.random() * 10 + 85 // FAKE!
  },
  performance: {
    executionTime: Math.random() * 45 + 50, // FAKE!
    memoryUsage: Math.random() * 136 + 64 // FAKE!
  }
};
```

**AFTER (Real):**
```typescript
import { PerformanceMetricsEngine } from '../core/performance-metrics-engine';

const metricsEngine = new PerformanceMetricsEngine();

// Get real test coverage
const realCoverage = await metricsEngine.getRealTestCoverage(projectPath);

// Measure actual performance
metricsEngine.startMeasurement('validation');
const validationResults = await this.runValidation(projectId, codeIds);
const performanceMetrics = metricsEngine.endMeasurement('validation');

const qualityScorecard = {
  testCoverage: {
    line: realCoverage.line,
    branch: realCoverage.branch,
    function: realCoverage.function,
    statement: realCoverage.statement
  },
  performance: {
    executionTime: performanceMetrics.executionTime,
    memoryUsage: performanceMetrics.memoryUsed,
    cpuUsage: performanceMetrics.cpuUsage
  }
};
```

### Day 5: Test Suite Transformation

#### Step 1: Create Test Transformation Script

**Location:** `scripts/transform-tests.ts`

```typescript
// NEW FILE: scripts/transform-tests.ts
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface TestTransformation {
  file: string;
  pattern: RegExp;
  replacement: string;
  description: string;
}

class TestTransformer {
  private transformations: TestTransformation[] = [
    {
      file: '*',
      pattern: /expect\(([^)]+)\)\.toBeDefined\(\)/g,
      replacement: 'expect($1).not.toBeNull()',
      description: 'Replace toBeDefined with specific checks'
    },
    {
      file: '*',
      pattern: /expect\(([^)]+)\)\.toBeGreaterThan\(0\)/g,
      replacement: 'expect($1).toEqual(/* SPECIFY EXACT VALUE */)',
      description: 'Replace greater than 0 with exact values'
    },
    {
      file: '*',
      pattern: /expect\(result\.success\)\.toBe\(true\)/g,
      replacement: 'expect(result).toMatchObject({ success: true, /* ADD SPECIFIC PROPERTIES */ })',
      description: 'Replace success checks with detailed validation'
    }
  ];

  async transformTests(): Promise<void> {
    const testFiles = await glob('src/**/*.test.ts');

    for (const file of testFiles) {
      await this.transformFile(file);
    }
  }

  private async transformFile(filePath: string): Promise<void> {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    for (const transformation of this.transformations) {
      if (transformation.file === '*' || filePath.includes(transformation.file)) {
        const matches = content.match(transformation.pattern);

        if (matches) {
          console.log(`📝 ${filePath}: Found ${matches.length} instances of ${transformation.description}`);
          content = content.replace(transformation.pattern, transformation.replacement);
          modified = true;
        }
      }
    }

    if (modified) {
      // Add TODO comment at the top
      content = `// TODO: Review and update test expectations with real values\n${content}`;
      fs.writeFileSync(filePath, content);
      console.log(`✅ Transformed ${filePath}`);
    }
  }

  /**
   * Generate report of theatrical tests
   */
  async generateTheatricalTestReport(): Promise<void> {
    const testFiles = await glob('src/**/*.test.ts');
    const report: any = {
      totalFiles: testFiles.length,
      theatricalPatterns: {},
      files: {}
    };

    for (const file of testFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const fileReport: any = {
        toBeDefined: (content.match(/\.toBeDefined\(\)/g) || []).length,
        toBeGreaterThan: (content.match(/\.toBeGreaterThan\(0\)/g) || []).length,
        mockImplementations: (content.match(/jest\.fn\(\)/g) || []).length,
        todoComments: (content.match(/TODO|FIXME|HACK/g) || []).length
      };

      if (Object.values(fileReport).some(v => v > 0)) {
        report.files[file] = fileReport;

        // Update totals
        Object.keys(fileReport).forEach(key => {
          report.theatricalPatterns[key] =
            (report.theatricalPatterns[key] || 0) + fileReport[key];
        });
      }
    }

    fs.writeFileSync(
      'theatrical-test-report.json',
      JSON.stringify(report, null, 2)
    );

    console.log('\n📊 Theatrical Test Report:');
    console.log(`Total test files: ${report.totalFiles}`);
    console.log(`Files with theatrical patterns: ${Object.keys(report.files).length}`);
    console.log('\nPattern counts:');
    Object.entries(report.theatricalPatterns).forEach(([pattern, count]) => {
      console.log(`  ${pattern}: ${count}`);
    });
  }
}

// Run the transformer
const transformer = new TestTransformer();
transformer.generateTheatricalTestReport().then(() => {
  console.log('\n🚀 Starting test transformation...\n');
  return transformer.transformTests();
}).then(() => {
  console.log('\n✅ Test transformation complete!');
  console.log('⚠️  Please review all test files and update with real expected values');
}).catch(console.error);
```

---

## Week 2: Test Validation Implementation

### Day 6-7: Real Test Implementation Examples

#### Example 1: Transform smart-plan.test.ts

**BEFORE (Theatrical):**
```typescript
it('should generate a project plan', async () => {
  const result = await smartPlan({ requirements, budget });

  expect(result).toBeDefined();
  expect(result.success).toBe(true);
  expect(result.data?.businessValue.estimatedROI).toBeGreaterThan(0);
});
```

**AFTER (Real):**
```typescript
it('should generate accurate project plan with real calculations', async () => {
  const requirements = 'E-commerce platform with payment processing';
  const budget = 100000;

  const result = await smartPlan({ requirements, budget });

  // Validate structure
  expect(result).toMatchObject({
    success: true,
    data: expect.objectContaining({
      projectId: expect.stringMatching(/^plan_[a-z0-9]+$/),
      planType: 'COMPREHENSIVE_PROJECT_PLAN',
      businessValue: expect.any(Object)
    })
  });

  // Validate real calculations
  const { businessValue } = result.data!;

  // ROI should be calculated using actual formula
  // For a 100k investment with expected 250k return over 2 years
  expect(businessValue.estimatedROI).toBeCloseTo(150, 0); // 150% ROI

  // NPV with 10% discount rate
  expect(businessValue.netPresentValue).toBeCloseTo(106611, -2);

  // Time to market based on complexity
  expect(businessValue.timeToMarket).toBeCloseTo(6, 1); // 6 months

  // Risk-adjusted value based on actual risk assessment
  expect(businessValue.riskAdjustedValue).toBeCloseTo(180000, -3);
});

it('should calculate accurate timeline based on requirements', async () => {
  const simpleRequirements = 'Simple landing page';
  const complexRequirements = 'Enterprise ERP system with 50+ modules';

  const simpleResult = await smartPlan({
    requirements: simpleRequirements,
    budget: 10000
  });

  const complexResult = await smartPlan({
    requirements: complexRequirements,
    budget: 1000000
  });

  // Simple project: 1-2 months
  expect(simpleResult.data?.projectPlan.timeline.totalDuration).toBeLessThan(60);

  // Complex project: 12-18 months
  expect(complexResult.data?.projectPlan.timeline.totalDuration).toBeGreaterThan(365);
  expect(complexResult.data?.projectPlan.timeline.totalDuration).toBeLessThan(550);
});
```

### Day 8-9: Mock Replacement Strategy

#### Step 1: Create Test Doubles Instead of Mocks

**Location:** `src/test-utils/test-doubles.ts`

```typescript
// NEW FILE: src/test-utils/test-doubles.ts

/**
 * Test double for external MCP servers
 * Uses real logic but with controlled responses
 */
export class MCPServerTestDouble {
  private responses: Map<string, any> = new Map();
  private callHistory: Array<{ method: string; args: any[] }> = [];

  /**
   * Set up a controlled response
   */
  whenCalled(method: string): { thenReturn(value: any): void } {
    return {
      thenReturn: (value: any) => {
        this.responses.set(method, value);
      }
    };
  }

  /**
   * Execute method with controlled response
   */
  async execute(method: string, ...args: any[]): Promise<any> {
    this.callHistory.push({ method, args });

    if (this.responses.has(method)) {
      return this.responses.get(method);
    }

    // Default behavior - run real implementation
    return this.runRealImplementation(method, args);
  }

  /**
   * Run actual implementation for testing
   */
  private async runRealImplementation(method: string, args: any[]): Promise<any> {
    // This runs the real code but in a controlled environment
    switch (method) {
      case 'analyzeCode':
        // Run real static analysis but on test files
        const analyzer = new StaticAnalyzer(args[0]);
        return analyzer.runStaticAnalysis();

      case 'calculateMetrics':
        // Run real metric calculation
        const engine = new BusinessCalculationEngine();
        return engine.calculateProjectValue(args[0]);

      default:
        throw new Error(`No implementation for ${method}`);
    }
  }

  /**
   * Verify interactions
   */
  verify(): {
    wasCalled(method: string): boolean;
    wasCalledWith(method: string, args: any[]): boolean;
    getCallCount(method: string): number;
  } {
    return {
      wasCalled: (method: string) => {
        return this.callHistory.some(call => call.method === method);
      },
      wasCalledWith: (method: string, args: any[]) => {
        return this.callHistory.some(call =>
          call.method === method &&
          JSON.stringify(call.args) === JSON.stringify(args)
        );
      },
      getCallCount: (method: string) => {
        return this.callHistory.filter(call => call.method === method).length;
      }
    };
  }
}

/**
 * File system test double for controlled file operations
 */
export class FileSystemTestDouble {
  private files: Map<string, string> = new Map();
  private directories: Set<string> = new Set();

  constructor() {
    // Set up initial test file system
    this.directories.add('/test');
    this.directories.add('/test/src');
  }

  /**
   * Add a test file
   */
  addFile(path: string, content: string): void {
    this.files.set(path, content);

    // Add parent directories
    const parts = path.split('/');
    for (let i = 1; i < parts.length; i++) {
      this.directories.add(parts.slice(0, i).join('/'));
    }
  }

  /**
   * Read file implementation
   */
  readFileSync(path: string): string {
    if (!this.files.has(path)) {
      throw new Error(`ENOENT: no such file or directory, open '${path}'`);
    }
    return this.files.get(path)!;
  }

  /**
   * Write file implementation
   */
  writeFileSync(path: string, content: string): void {
    this.files.set(path, content);
  }

  /**
   * Check if file exists
   */
  existsSync(path: string): boolean {
    return this.files.has(path) || this.directories.has(path);
  }

  /**
   * Get all files matching pattern
   */
  glob(pattern: string): string[] {
    const regex = new RegExp(
      pattern.replace(/\*/g, '.*').replace(/\?/g, '.')
    );

    return Array.from(this.files.keys()).filter(path => regex.test(path));
  }
}
```

### Day 10: Integration Test Rewrite

#### Example: Real Integration Test

**Location:** `src/integration/real-workflow.test.ts`

```typescript
// NEW FILE: src/integration/real-workflow.test.ts
import { SmartBegin } from '../tools/smart-begin';
import { SmartPlan } from '../tools/smart-plan';
import { SmartWrite } from '../tools/smart-write';
import { SmartFinish } from '../tools/smart-finish';
import { BusinessCalculationEngine } from '../core/business-calculation-engine';
import { PerformanceMetricsEngine } from '../core/performance-metrics-engine';

describe('Real End-to-End Workflow', () => {
  let businessEngine: BusinessCalculationEngine;
  let performanceEngine: PerformanceMetricsEngine;

  beforeEach(() => {
    businessEngine = new BusinessCalculationEngine();
    performanceEngine = new PerformanceMetricsEngine();
  });

  it('should complete full workflow with real calculations', async () => {
    performanceEngine.startMeasurement('full-workflow');

    // Step 1: Begin project with real context
    const beginResult = await SmartBegin.execute({
      projectName: 'E-commerce Platform',
      description: 'Multi-vendor marketplace with payment processing',
      techStack: ['Node.js', 'React', 'PostgreSQL', 'Redis'],
      teamSize: 5
    });

    expect(beginResult.success).toBe(true);
    expect(beginResult.data?.projectId).toMatch(/^proj_[a-z0-9]+$/);

    const projectId = beginResult.data!.projectId;

    // Step 2: Plan with real calculations
    const planResult = await SmartPlan.execute({
      projectId,
      requirements: beginResult.data!.projectContext.requirements,
      budget: 150000,
      timeline: 180 // 6 months in days
    });

    expect(planResult.success).toBe(true);

    // Validate real ROI calculation
    const expectedCashFlows = [-150000, 50000, 100000, 150000, 200000];
    const expectedROI = businessEngine.calculateROI(150000, [50000, 100000, 150000, 200000], 4);

    expect(planResult.data?.businessValue.estimatedROI).toBeCloseTo(expectedROI, 1);

    // Step 3: Write code with real metrics
    const writeResult = await SmartWrite.execute({
      projectId,
      planId: planResult.data!.planId,
      component: 'UserAuthenticationService',
      requirements: 'JWT-based authentication with refresh tokens'
    });

    expect(writeResult.success).toBe(true);

    // Validate real code generation
    expect(writeResult.data?.code.length).toBeGreaterThan(100); // Real code, not template
    expect(writeResult.data?.linesOfCode).toBe(
      writeResult.data!.code.split('\n').length
    );

    // Step 4: Finish with real validation
    const finishResult = await SmartFinish.execute({
      projectId,
      codeIds: [writeResult.data!.codeId],
      runTests: true,
      generateReport: true
    });

    expect(finishResult.success).toBe(true);

    // Validate real test coverage (not random)
    const coverage = finishResult.data?.qualityScorecard.quality.testCoverage;
    expect(coverage?.line).toBeGreaterThanOrEqual(0);
    expect(coverage?.line).toBeLessThanOrEqual(100);

    // Coverage values should be different (not all the same fake value)
    expect(new Set([
      coverage?.line,
      coverage?.branch,
      coverage?.function,
      coverage?.statement
    ]).size).toBeGreaterThan(1);

    // Validate real performance metrics
    const perfMetrics = performanceEngine.endMeasurement('full-workflow');

    expect(finishResult.data?.qualityScorecard.production.performance).toMatchObject({
      executionTime: expect.any(Number),
      memoryUsage: expect.any(Number),
      throughput: expect.any(Number)
    });

    // Performance should match actual measurement
    expect(
      finishResult.data?.qualityScorecard.production.performance.executionTime
    ).toBeCloseTo(perfMetrics.executionTime, -1);
  });

  it('should handle errors gracefully with real error messages', async () => {
    // Test with invalid inputs
    const result = await SmartPlan.execute({
      projectId: 'invalid_id',
      requirements: '',
      budget: -1000,
      timeline: 0
    });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Invalid budget: must be positive/);

    // Error should include helpful context
    expect(result.error).toContain('budget');
    expect(result.error).toContain('-1000');
  });
});
```

---

## Week 3: Core Enhancement Implementation

### Day 11-12: Code Generation Engine

#### Step 1: Real Code Generation Implementation

**Location:** `src/core/code-generation-engine.ts`

```typescript
// NEW FILE: src/core/code-generation-engine.ts
import * as ts from 'typescript';
import * as prettier from 'prettier';

export class CodeGenerationEngine {
  private templates: Map<string, string> = new Map();

  /**
   * Generate real code based on requirements
   */
  async generateCode(params: {
    component: string;
    requirements: string;
    language: 'typescript' | 'javascript' | 'python';
    patterns: string[];
    roleContext?: string;
  }): Promise<{
    code: string;
    linesOfCode: number;
    complexity: number;
    imports: string[];
    exports: string[];
  }> {
    const { component, requirements, language, patterns, roleContext } = params;

    // Parse requirements to understand what to generate
    const parsedReqs = this.parseRequirements(requirements);

    // Generate AST based on requirements
    const ast = this.generateAST(component, parsedReqs, patterns);

    // Convert AST to code
    const code = this.astToCode(ast, language);

    // Format code
    const formattedCode = await this.formatCode(code, language);

    // Calculate real metrics
    const metrics = this.calculateCodeMetrics(formattedCode);

    return {
      code: formattedCode,
      linesOfCode: metrics.linesOfCode,
      complexity: metrics.complexity,
      imports: metrics.imports,
      exports: metrics.exports
    };
  }

  /**
   * Parse requirements into structured format
   */
  private parseRequirements(requirements: string): ParsedRequirements {
    const keywords = {
      authentication: ['auth', 'login', 'jwt', 'oauth', 'password'],
      database: ['database', 'sql', 'mongodb', 'postgres', 'mysql'],
      api: ['api', 'rest', 'graphql', 'endpoint', 'route'],
      frontend: ['react', 'vue', 'angular', 'ui', 'component'],
      testing: ['test', 'jest', 'mocha', 'unit', 'integration']
    };

    const parsed: ParsedRequirements = {
      type: 'generic',
      features: [],
      dependencies: [],
      patterns: []
    };

    // Identify type based on keywords
    for (const [type, words] of Object.entries(keywords)) {
      if (words.some(word => requirements.toLowerCase().includes(word))) {
        parsed.type = type;
        break;
      }
    }

    // Extract features
    const features = requirements.match(/(?:with|include|support|provide)\s+(\w+(?:\s+\w+)*)/gi);
    if (features) {
      parsed.features = features.map(f => f.replace(/^(?:with|include|support|provide)\s+/i, ''));
    }

    return parsed;
  }

  /**
   * Generate Abstract Syntax Tree
   */
  private generateAST(
    component: string,
    requirements: ParsedRequirements,
    patterns: string[]
  ): ts.Node {
    const factory = ts.factory;

    // Create class declaration
    const classMembers: ts.ClassElement[] = [];

    // Add constructor
    classMembers.push(
      factory.createConstructorDeclaration(
        undefined,
        undefined,
        [],
        factory.createBlock([])
      )
    );

    // Add methods based on requirements
    for (const feature of requirements.features) {
      const methodName = this.featureToMethodName(feature);

      classMembers.push(
        factory.createMethodDeclaration(
          undefined,
          [factory.createModifier(ts.SyntaxKind.PublicKeyword)],
          undefined,
          factory.createIdentifier(methodName),
          undefined,
          undefined,
          [],
          factory.createTypeReferenceNode('Promise', [
            factory.createTypeReferenceNode('any', undefined)
          ]),
          factory.createBlock([
            factory.createReturnStatement(
              factory.createCallExpression(
                factory.createPropertyAccessExpression(
                  factory.createIdentifier('Promise'),
                  'resolve'
                ),
                undefined,
                [factory.createObjectLiteralExpression([])]
              )
            )
          ])
        )
      );
    }

    // Create class
    const classDeclaration = factory.createClassDeclaration(
      undefined,
      [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      component,
      undefined,
      undefined,
      classMembers
    );

    return classDeclaration;
  }

  /**
   * Convert AST to code string
   */
  private astToCode(node: ts.Node, language: string): string {
    const printer = ts.createPrinter({
      newLine: ts.NewLineKind.LineFeed
    });

    const sourceFile = ts.createSourceFile(
      'generated.ts',
      '',
      ts.ScriptTarget.Latest,
      false,
      ts.ScriptKind.TS
    );

    return printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
  }

  /**
   * Format code using Prettier
   */
  private async formatCode(code: string, language: string): Promise<string> {
    const parser = language === 'typescript' ? 'typescript' : 'babel';

    return prettier.format(code, {
      parser,
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      printWidth: 100
    });
  }

  /**
   * Calculate real code metrics
   */
  private calculateCodeMetrics(code: string): {
    linesOfCode: number;
    complexity: number;
    imports: string[];
    exports: string[];
  } {
    const lines = code.split('\n');
    const linesOfCode = lines.filter(line => line.trim() && !line.trim().startsWith('//')).length;

    // Parse for real complexity
    const sourceFile = ts.createSourceFile(
      'temp.ts',
      code,
      ts.ScriptTarget.Latest,
      true
    );

    let complexity = 1;
    const imports: string[] = [];
    const exports: string[] = [];

    const visit = (node: ts.Node) => {
      // Count complexity
      if (ts.isIfStatement(node) ||
          ts.isWhileStatement(node) ||
          ts.isForStatement(node) ||
          ts.isSwitchStatement(node)) {
        complexity++;
      }

      // Collect imports
      if (ts.isImportDeclaration(node)) {
        const moduleSpecifier = node.moduleSpecifier;
        if (ts.isStringLiteral(moduleSpecifier)) {
          imports.push(moduleSpecifier.text);
        }
      }

      // Collect exports
      if (ts.isExportDeclaration(node) || ts.isExportAssignment(node)) {
        exports.push(node.getText(sourceFile));
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    return {
      linesOfCode,
      complexity,
      imports,
      exports
    };
  }

  private featureToMethodName(feature: string): string {
    return feature
      .toLowerCase()
      .replace(/\s+(.)/g, (_, char) => char.toUpperCase())
      .replace(/^(.)/, (_, char) => char.toLowerCase());
  }
}

interface ParsedRequirements {
  type: string;
  features: string[];
  dependencies: string[];
  patterns: string[];
}
```

---

## Validation Checklist

### Week 1 Validation
- [ ] All `Math.random()` removed from production code
- [ ] BusinessCalculationEngine unit tests pass with 100% coverage
- [ ] PerformanceMetricsEngine correctly measures real performance
- [ ] No hardcoded business values remain in smart-* tools

### Week 2 Validation
- [ ] Test transformation script successfully identifies all theatrical tests
- [ ] At least 50% of tests rewritten with real expectations
- [ ] Test doubles replace all mock implementations
- [ ] Integration tests validate actual workflow

### Week 3 Validation
- [ ] CodeGenerationEngine produces real, working code
- [ ] Generated code passes linting and compilation
- [ ] All metrics are calculated from actual code analysis
- [ ] End-to-end tests pass with real implementations

---

## Common Issues and Solutions

### Issue 1: Tests Failing After Removing Fake Values
**Solution:** Update test expectations with calculated values based on inputs

### Issue 2: Performance Degradation
**Solution:** Implement caching for expensive calculations

### Issue 3: External Dependencies Not Available
**Solution:** Use test doubles with fallback to real implementations

### Issue 4: Complex Business Logic Validation
**Solution:** Create separate unit tests for each calculation method

---

## Next Steps
Once Phase 1 is complete, proceed to [Phase 2: Real Integration](./PHASE_2_REAL_INTEGRATION.md)