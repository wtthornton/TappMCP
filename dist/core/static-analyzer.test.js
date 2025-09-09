#!/usr/bin/env node
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StaticAnalyzer } from './static-analyzer.js';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
describe('StaticAnalyzer - REAL TESTS', () => {
    let staticAnalyzer;
    let testProjectPath;
    beforeEach(() => {
        // Create a temporary test project
        testProjectPath = join(process.cwd(), `test-static-${Date.now()}`);
        mkdirSync(testProjectPath, { recursive: true });
        mkdirSync(join(testProjectPath, 'src'), { recursive: true });
        // Create a minimal package.json
        const packageJson = {
            name: 'test-static-analysis',
            version: '1.0.0',
            dependencies: {},
            devDependencies: {},
        };
        writeFileSync(join(testProjectPath, 'package.json'), JSON.stringify(packageJson, null, 2));
        staticAnalyzer = new StaticAnalyzer(testProjectPath);
    });
    afterEach(() => {
        // Clean up test project
        try {
            rmSync(testProjectPath, { recursive: true, force: true });
        }
        catch {
            // Ignore cleanup errors
        }
    });
    describe('runStaticAnalysis - ACTUAL STATIC ANALYSIS', () => {
        it('should complete static analysis in reasonable time', async () => {
            // Create a simple TypeScript file
            writeFileSync(join(testProjectPath, 'src', 'test.ts'), `
        export function simpleFunction(): void {
          console.log("Hello, world!");
        }
      `);
            const startTime = performance.now();
            const result = await staticAnalyzer.runStaticAnalysis();
            const duration = performance.now() - startTime;
            // Should take actual time to run (not < 1ms fake processing)
            expect(duration).toBeGreaterThan(1); // At least 1ms for real processing
            expect(duration).toBeLessThan(30000); // But less than 30 seconds
            // Should return complete result structure
            expect(result).toHaveProperty('issues');
            expect(result).toHaveProperty('scanTime');
            expect(result).toHaveProperty('status');
            expect(result).toHaveProperty('summary');
            expect(result).toHaveProperty('metrics');
            // Scan time should match actual duration (within 100ms margin)
            expect(Math.abs(result.scanTime - duration)).toBeLessThan(100);
            // Summary should be complete
            expect(result.summary).toHaveProperty('total');
            expect(result.summary).toHaveProperty('error');
            expect(result.summary).toHaveProperty('warning');
            expect(result.summary).toHaveProperty('info');
            // Metrics should be calculated
            expect(result.metrics).toHaveProperty('complexity');
            expect(result.metrics).toHaveProperty('maintainability');
            expect(result.metrics).toHaveProperty('duplication');
            expect(result.metrics.complexity).toBeGreaterThanOrEqual(1);
            // Status should be valid
            expect(['pass', 'fail', 'warning']).toContain(result.status);
            console.log(`Real static analysis took: ${duration.toFixed(2)}ms, found ${result.issues.length} issues`);
            console.log(`Complexity: ${result.metrics.complexity}, Maintainability: ${result.metrics.maintainability}%`);
        });
        it('should handle empty project gracefully', async () => {
            const result = await staticAnalyzer.runStaticAnalysis();
            // Should not crash with empty project
            expect(result.status).toBeDefined();
            expect(Array.isArray(result.issues)).toBe(true);
            expect(result.summary).toBeDefined();
            expect(result.metrics).toBeDefined();
            expect(result.scanTime).toBeGreaterThanOrEqual(0);
            // Metrics should have reasonable defaults
            expect(result.metrics.complexity).toBeGreaterThanOrEqual(0);
            expect(result.metrics.maintainability).toBeGreaterThanOrEqual(0);
            expect(result.metrics.duplication).toBeGreaterThanOrEqual(0);
        });
        it('should analyze real project files and provide actual results', async () => {
            // Use current project directory for real analysis
            const realAnalyzer = new StaticAnalyzer(process.cwd());
            const result = await realAnalyzer.runStaticAnalysis();
            // Should analyze the actual project
            expect(result.metrics.complexity).toBeGreaterThan(1); // Real project should have complexity
            expect(result.metrics.maintainability).toBeGreaterThan(0);
            expect(result.metrics.maintainability).toBeLessThanOrEqual(100);
            expect(result.metrics.duplication).toBeGreaterThanOrEqual(0);
            // Should find real source files
            expect(result.scanTime).toBeGreaterThan(100); // Real analysis takes time
            console.log('Real project analysis:', {
                issues: result.issues.length,
                complexity: result.metrics.complexity,
                maintainability: result.metrics.maintainability,
                duplication: result.metrics.duplication,
                status: result.status,
            });
        });
    });
    describe('Complexity Analysis - REAL COMPLEXITY CALCULATION', () => {
        it('should calculate DIFFERENT complexity for simple vs complex code', () => {
            const analyzer = new StaticAnalyzer('/test');
            const calculateComplexity = analyzer.calculateFileComplexity.bind(analyzer);
            const simpleCode = `
        const x = 1;
        const y = 2;
        console.log(x + y);
      `;
            const complexCode = `
        if (condition1) {
          if (condition2) {
            for (let i = 0; i < 10; i++) {
              if (i > 5) {
                while (i < 8) {
                  switch (i) {
                    case 6:
                      if (flag && other || third) {
                        i++;
                      }
                      break;
                    case 7:
                      i++;
                      break;
                  }
                }
              }
            }
          }
        }
      `;
            const simpleComplexity = calculateComplexity(simpleCode);
            const complexComplexity = calculateComplexity(complexCode);
            // Simple code should have low complexity
            expect(simpleComplexity).toBe(1); // Base complexity only
            // Complex code should have much higher complexity
            expect(complexComplexity).toBeGreaterThan(simpleComplexity);
            expect(complexComplexity).toBeGreaterThan(5);
            console.log(`Complexity: simple=${simpleComplexity}, complex=${complexComplexity}`);
        });
        it('should flag high complexity files with specific warnings', async () => {
            // Create a file with intentionally high complexity
            const highComplexityCode = `
        export function complexFunction(a: number, b: string, c: boolean): string {
          if (a > 0) {
            if (b.length > 0) {
              for (let i = 0; i < a; i++) {
                if (i % 2 === 0) {
                  while (i < a - 1) {
                    switch (b) {
                      case 'test':
                        if (c && a > 5 || b.includes('x')) {
                          return 'complex';
                        }
                        break;
                      case 'other':
                        if (c) {
                          for (let j = 0; j < i; j++) {
                            if (j > 3 && j < 7 || j === 9) {
                              return 'very complex';
                            }
                          }
                        }
                        break;
                    }
                  }
                }
              }
            }
          }
          return 'default';
        }
      `;
            writeFileSync(join(testProjectPath, 'src', 'complex.ts'), highComplexityCode);
            const result = await staticAnalyzer.runStaticAnalysis();
            // Should detect high complexity
            const complexityIssues = result.issues.filter(issue => issue.id === 'high-complexity');
            expect(complexityIssues.length).toBeGreaterThan(0);
            const complexityIssue = complexityIssues[0];
            expect(complexityIssue.severity).toBe('warning');
            expect(complexityIssue.message).toContain('High cyclomatic complexity');
            expect(complexityIssue.rule).toBe('complexity');
        });
        it('should detect long functions correctly', async () => {
            // Create a file with a very long function
            const longFunctionCode = `
        export function veryLongFunction(): void {
${Array(60).fill('          console.log("This is a long function");').join('\n')}
        }
      `;
            writeFileSync(join(testProjectPath, 'src', 'long.ts'), longFunctionCode);
            const result = await staticAnalyzer.runStaticAnalysis();
            // Should detect long function
            const longFunctionIssues = result.issues.filter(issue => issue.id === 'long-function');
            expect(longFunctionIssues.length).toBeGreaterThan(0);
            const longFunctionIssue = longFunctionIssues[0];
            expect(longFunctionIssue.severity).toBe('warning');
            expect(longFunctionIssue.message).toContain('Long function');
            expect(longFunctionIssue.rule).toBe('function-length');
        });
    });
    describe('Control Flow Analysis - REAL PATTERN MATCHING', () => {
        it('should count control flow statements correctly', () => {
            const analyzer = new StaticAnalyzer('/test');
            const countControlFlow = analyzer.countControlFlowStatements.bind(analyzer);
            // Test individual statements
            expect(countControlFlow('if (true) { return; }')).toBe(1);
            expect(countControlFlow('while (condition) { break; }')).toBe(1);
            expect(countControlFlow('for (let i = 0; i < 10; i++) {}')).toBe(1);
            expect(countControlFlow('switch (value) { case 1: break; }')).toBe(2); // switch + case
            expect(countControlFlow('} else if (other) {')).toBe(1); // else
            expect(countControlFlow('} catch (error) {')).toBe(1);
            // Test combinations
            expect(countControlFlow('if (a) { for (let i = 0; i < 10; i++) { } }')).toBe(2);
            // Test no control flow
            expect(countControlFlow('const x = 1;')).toBe(0);
            expect(countControlFlow('console.log("test");')).toBe(0);
            expect(countControlFlow('return value;')).toBe(0);
        });
        it('should count logical operators correctly (excluding strings)', () => {
            const analyzer = new StaticAnalyzer('/test');
            const countLogical = analyzer.countLogicalOperators.bind(analyzer);
            // Test logical operators
            expect(countLogical('if (a && b) { return; }')).toBe(1);
            expect(countLogical('if (a || b || c) { return; }')).toBe(2); // Two || operators
            expect(countLogical('const result = condition ? value1 : value2;')).toBe(1);
            // Test combinations
            expect(countLogical('if (a && b || c) { return; }')).toBe(2);
            // Should ignore operators in strings
            expect(countLogical('const message = "test && test";')).toBe(0);
            expect(countLogical("const query = 'SELECT * FROM table WHERE a && b';")).toBe(0);
            // Test no logical operators
            expect(countLogical('const x = 1 + 2;')).toBe(0);
            expect(countLogical('if (simple) { return; }')).toBe(0);
        });
    });
    describe('Duplicate Detection - ACTUAL DUPLICATION ANALYSIS', () => {
        it('should detect duplicate lines correctly', () => {
            const analyzer = new StaticAnalyzer('/test');
            const detectDuplicates = analyzer.detectDuplicates.bind(analyzer);
            const codeWithDuplicates = `
        console.log("This is a duplicate line that appears multiple times");
        const result = processData(input, config, options);
        console.log("This is a duplicate line that appears multiple times");
        const other = calculateValue(data);
        const result = processData(input, config, options);
        console.log("Different line");
      `;
            const codeWithoutDuplicates = `
        console.log("Unique line 1");
        const result1 = processData1(input);
        const result2 = processData2(input);
        console.log("Unique line 4");
      `;
            const duplicatesCount = detectDuplicates(codeWithDuplicates);
            const noDuplicatesCount = detectDuplicates(codeWithoutDuplicates);
            // Should detect duplicates (2 duplicate pairs = 2 extra occurrences)
            expect(duplicatesCount).toBe(2);
            // Should detect no duplicates in unique code
            expect(noDuplicatesCount).toBe(0);
        });
        it('should ignore short lines when detecting duplicates', () => {
            const analyzer = new StaticAnalyzer('/test');
            const detectDuplicates = analyzer.detectDuplicates.bind(analyzer);
            const codeWithShortDuplicates = `
        const x = 1;
        const y = 2;
        const x = 1;
        const z = 3;
      `;
            // Short lines (≤10 chars) should be ignored
            const duplicatesCount = detectDuplicates(codeWithShortDuplicates);
            expect(duplicatesCount).toBe(0);
        });
    });
    describe('Function Line Counting - REAL FUNCTION ANALYSIS', () => {
        it('should count function lines correctly', () => {
            const analyzer = new StaticAnalyzer('/test');
            const countFunctionLines = analyzer.countFunctionLines.bind(analyzer);
            const codeWithShortFunction = `
        function shortFunction() {
          const x = 1;
          return x;
        }
      `;
            const codeWithLongFunction = `
        function longFunction() {
          const step1 = initialize();
          const step2 = process(step1);
          const step3 = validate(step2);
${Array(55).fill('          processStep();').join('\n')}
          return finalResult;
        }
      `;
            const codeWithArrowFunction = `
        const arrowFunc = () => {
          const data = fetchData();
          const processed = transform(data);
          const validated = validate(processed);
          return validated;
        };
      `;
            expect(countFunctionLines(codeWithShortFunction)).toBeLessThanOrEqual(4);
            expect(countFunctionLines(codeWithLongFunction)).toBeGreaterThan(50);
            expect(countFunctionLines(codeWithArrowFunction)).toBeGreaterThan(3);
            // Code without functions
            const codeWithoutFunctions = `
        const x = 1;
        const y = 2;
        console.log(x + y);
      `;
            expect(countFunctionLines(codeWithoutFunctions)).toBe(0);
        });
    });
    describe('Metrics Calculation - REAL METRICS', () => {
        it('should calculate metrics consistently with same input', async () => {
            // Create identical test files
            const testCode = `
        export function testFunction(input: string): number {
          if (input.length > 0) {
            for (let i = 0; i < input.length; i++) {
              if (input[i] === 'x') {
                return i;
              }
            }
          }
          return -1;
        }
      `;
            writeFileSync(join(testProjectPath, 'src', 'test1.ts'), testCode);
            // Run analysis multiple times
            const results = [];
            for (let i = 0; i < 3; i++) {
                const result = await staticAnalyzer.runStaticAnalysis();
                results.push(result.metrics);
            }
            // All metrics should be identical (no randomness)
            for (let i = 1; i < results.length; i++) {
                expect(results[i].complexity).toBe(results[0].complexity);
                expect(results[i].maintainability).toBe(results[0].maintainability);
                expect(results[i].duplication).toBe(results[0].duplication);
            }
            console.log('Consistent metrics:', results[0]);
        });
        it('should calculate different metrics for different complexity levels', async () => {
            // Create simple file
            writeFileSync(join(testProjectPath, 'src', 'simple.ts'), `
        export const value = 42;
        export function simpleAdd(a: number, b: number): number {
          return a + b;
        }
      `);
            const simpleResult = await staticAnalyzer.runStaticAnalysis();
            // Clean up and create complex file
            rmSync(join(testProjectPath, 'src', 'simple.ts'));
            writeFileSync(join(testProjectPath, 'src', 'complex.ts'), `
        export function complexFunction(data: any[]): any[] {
          const results = [];
          for (let i = 0; i < data.length; i++) {
            if (data[i]) {
              if (typeof data[i] === 'object') {
                for (const key in data[i]) {
                  if (data[i].hasOwnProperty(key)) {
                    switch (typeof data[i][key]) {
                      case 'string':
                        if (data[i][key].length > 10) {
                          results.push(data[i][key].toUpperCase());
                        } else {
                          results.push(data[i][key]);
                        }
                        break;
                      case 'number':
                        if (data[i][key] > 100 && data[i][key] < 1000 || data[i][key] === 0) {
                          results.push(data[i][key] * 2);
                        }
                        break;
                    }
                  }
                }
              }
            }
          }
          return results;
        }
      `);
            const complexResult = await staticAnalyzer.runStaticAnalysis();
            // Complex code should have higher complexity, lower maintainability
            expect(complexResult.metrics.complexity).toBeGreaterThan(simpleResult.metrics.complexity);
            expect(complexResult.metrics.maintainability).toBeLessThan(simpleResult.metrics.maintainability);
            console.log('Simple metrics:', simpleResult.metrics);
            console.log('Complex metrics:', complexResult.metrics);
        });
    });
    describe('Status Determination - REAL LOGIC VALIDATION', () => {
        it('should determine status correctly based on issue severity', () => {
            const analyzer = new StaticAnalyzer('/test');
            const determineStatus = analyzer.determineStatus.bind(analyzer);
            // Error = fail
            expect(determineStatus({ error: 1, warning: 0, info: 0 })).toBe('fail');
            expect(determineStatus({ error: 5, warning: 2, info: 1 })).toBe('fail');
            // Warning only = warning
            expect(determineStatus({ error: 0, warning: 1, info: 0 })).toBe('warning');
            expect(determineStatus({ error: 0, warning: 3, info: 5 })).toBe('warning');
            // Info only = pass
            expect(determineStatus({ error: 0, warning: 0, info: 1 })).toBe('pass');
            expect(determineStatus({ error: 0, warning: 0, info: 10 })).toBe('pass');
            // No issues = pass
            expect(determineStatus({ error: 0, warning: 0, info: 0 })).toBe('pass');
        });
    });
    describe('Summary Calculation - ACTUAL MATH', () => {
        it('should calculate issue summary correctly', () => {
            const analyzer = new StaticAnalyzer('/test');
            const calculateSummary = analyzer.calculateSummary.bind(analyzer);
            const issues = [
                { severity: 'error' },
                { severity: 'error' },
                { severity: 'warning' },
                { severity: 'warning' },
                { severity: 'warning' },
                { severity: 'info' },
            ];
            const summary = calculateSummary(issues);
            // Verify exact counts
            expect(summary.total).toBe(6);
            expect(summary.error).toBe(2);
            expect(summary.warning).toBe(3);
            expect(summary.info).toBe(1);
            // Verify math adds up
            expect(summary.error + summary.warning + summary.info).toBe(summary.total);
        });
        it('should handle empty issue list', () => {
            const analyzer = new StaticAnalyzer('/test');
            const calculateSummary = analyzer.calculateSummary.bind(analyzer);
            const summary = calculateSummary([]);
            expect(summary.total).toBe(0);
            expect(summary.error).toBe(0);
            expect(summary.warning).toBe(0);
            expect(summary.info).toBe(0);
        });
    });
    describe('INTEGRATION - Full Static Analysis Workflow', () => {
        it('should analyze complete project and provide comprehensive results', async () => {
            // Create realistic project structure with various issues
            mkdirSync(join(testProjectPath, 'src', 'utils'), { recursive: true });
            // File with complexity issues
            writeFileSync(join(testProjectPath, 'src', 'complex.ts'), `
        export function processData(input: any): any {
          if (input) {
            if (typeof input === 'object') {
              for (const key in input) {
                if (input.hasOwnProperty(key)) {
                  switch (typeof input[key]) {
                    case 'string':
                      if (input[key].length > 0 && input[key].length < 100 || input[key] === 'special') {
                        return input[key].toUpperCase();
                      }
                      break;
                    case 'number':
                      if (input[key] > 0) {
                        for (let i = 0; i < input[key]; i++) {
                          if (i % 2 === 0 && i > 5 || i === 1) {
                            console.log(i);
                          }
                        }
                      }
                      break;
                  }
                }
              }
            }
          }
          return null;
        }
      `);
            // File with long function
            writeFileSync(join(testProjectPath, 'src', 'longFunction.ts'), `
        export function veryLongProcessingFunction(): void {
${Array(60).fill('          console.log("Processing step");').join('\n')}
        }
      `);
            // File with duplicates
            writeFileSync(join(testProjectPath, 'src', 'duplicates.ts'), `
        export function withDuplicates(): void {
          const configuration = getDefaultConfiguration();
          const processed = processWithConfiguration(configuration);
          const configuration = getDefaultConfiguration();
          const validated = validateProcessedData(processed);
          const processed = processWithConfiguration(configuration);
        }
      `);
            const result = await staticAnalyzer.runStaticAnalysis();
            // Should detect various types of issues
            expect(result.issues.length).toBeGreaterThan(0);
            // Should detect complexity issues
            const complexityIssues = result.issues.filter(issue => issue.id === 'high-complexity');
            expect(complexityIssues.length).toBeGreaterThan(0);
            // Should detect long function
            const longFunctionIssues = result.issues.filter(issue => issue.id === 'long-function');
            expect(longFunctionIssues.length).toBeGreaterThan(0);
            // Should calculate meaningful metrics
            expect(result.metrics.complexity).toBeGreaterThan(1);
            expect(result.metrics.duplication).toBeGreaterThan(0);
            expect(result.metrics.maintainability).toBeLessThan(100); // Should be reduced due to issues
            // Should determine appropriate status
            expect(result.status).toBe('warning'); // Due to complexity/length warnings
            // Summary should match findings
            expect(result.summary.total).toBe(result.issues.length);
            console.log(`Full analysis found ${result.issues.length} issues:`);
            console.log(`- Complexity: ${result.metrics.complexity}`);
            console.log(`- Maintainability: ${result.metrics.maintainability}%`);
            console.log(`- Duplication: ${result.metrics.duplication}%`);
            console.log(`- Status: ${result.status}`);
        });
    });
});
//# sourceMappingURL=static-analyzer.test.js.map