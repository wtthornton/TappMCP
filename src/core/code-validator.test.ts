#!/usr/bin/env node

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CodeValidator } from './code-validator.js';
import * as fs from 'fs/promises';

// Mock the SecurityScanner and StaticAnalyzer
vi.mock('./security-scanner.js');
vi.mock('./static-analyzer.js');

describe('CodeValidator', () => {
  let validator: CodeValidator;

  beforeEach(() => {
    validator = new CodeValidator('./temp-test-validation');
  });

  afterEach(async () => {
    // Cleanup any remaining temp files
    try {
      await fs.rm('./temp-test-validation', { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
      console.debug('Cleanup error ignored:', error);
    }
  });

  describe('validateGeneratedCode', () => {
    it('should validate secure, high-quality code successfully', async () => {
      const goodCode = {
        files: [
          {
            path: 'src/utils.ts',
            content: `#!/usr/bin/env node

export function validateInput(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  return input.length > 0 && input.length < 1000;
}

export function processData(data: unknown): { success: boolean; result?: any } {
  try {
    if (typeof data === 'object' && data !== null) {
      return { success: true, result: data };
    }
    return { success: false };
  } catch (error) {
    return { success: false };
  }
}`,
            type: 'function',
          },
        ],
      };

      // Mock successful security and static analysis
      const { SecurityScanner } = await import('./security-scanner.js');
      const { StaticAnalyzer } = await import('./static-analyzer.js');

      vi.mocked(SecurityScanner).prototype.runSecurityScan = vi.fn().mockResolvedValue({
        vulnerabilities: [],
        summary: { total: 0, critical: 0, high: 0, moderate: 0, low: 0 },
      });

      vi.mocked(StaticAnalyzer).prototype.runStaticAnalysis = vi.fn().mockResolvedValue({
        issues: [],
        metrics: {
          complexity: 3,
          maintainability: 90,
          duplication: 0,
        },
      });

      const result = await validator.validateGeneratedCode(goodCode);

      expect(result.isValid).toBe(true);
      expect(result.overallScore).toBeGreaterThan(80);
      expect(result.security.status).toBe('pass');
      expect(result.quality.status).toBe('pass');
      expect(result.recommendations).toEqual([]);
    });

    it('should detect security vulnerabilities in code', async () => {
      const vulnerableCode = {
        files: [
          {
            path: 'src/vulnerable.ts',
            content: `#!/usr/bin/env node

const API_KEY = "hardcoded-secret-key";

export function executeCode(userInput: string) {
  // Dangerous: using eval with user input
  return eval(userInput);
}

export function renderHTML(content: string) {
  document.getElementById('content').innerHTML = content;
}`,
            type: 'function',
          },
        ],
      };

      const { SecurityScanner } = await import('./security-scanner.js');
      const { StaticAnalyzer } = await import('./static-analyzer.js');

      // Mock external scanners to return empty results so we test internal pattern detection
      vi.mocked(SecurityScanner).prototype.runSecurityScan = vi.fn().mockResolvedValue({
        vulnerabilities: [],
        summary: { total: 0, critical: 0, high: 0, moderate: 0, low: 0 },
      });

      vi.mocked(StaticAnalyzer).prototype.runStaticAnalysis = vi.fn().mockResolvedValue({
        issues: [],
        metrics: {
          complexity: 5,
          maintainability: 70,
          duplication: 0,
        },
      });

      const result = await validator.validateGeneratedCode(vulnerableCode);

      expect(result.isValid).toBe(false);
      expect(result.security.status).toBe('fail');

      // Should detect hardcoded credentials
      const credentialIssue = result.security.issues.find(i => i.message.includes('credentials'));
      expect(credentialIssue).toBeDefined();
      expect(credentialIssue?.severity).toBe('critical');

      // Should detect eval usage
      const evalIssue = result.security.issues.find(i => i.message.includes('eval'));
      expect(evalIssue).toBeDefined();
      expect(evalIssue?.severity).toBe('high');

      // Should detect innerHTML usage
      const xssIssue = result.security.issues.find(i => i.message.includes('innerHTML'));
      expect(xssIssue).toBeDefined();
      expect(xssIssue?.severity).toBe('medium');

      expect(result.recommendations).toContain(
        '🚨 CRITICAL: Fix 1 critical security issues immediately'
      );
    });

    it('should detect code quality issues', async () => {
      const poorQualityCode = {
        files: [
          {
            path: 'src/poor-quality.ts',
            content: `#!/usr/bin/env node

export function complexFunction(data: any): any {
  console.log("Debug: processing data");

  // Very long line that exceeds the recommended 120 character limit and should be flagged by the quality checker for readability

                                        // Deeply nested code
                                        if (data) {
                                            if (data.value) {
                                                if (data.value.nested) {
                                                    if (data.value.nested.deep) {
                                                        return data.value.nested.deep;
                                                    }
                                                }
                                            }
                                        }

  // No error handling for async operation
  const result = await someAsyncOperation();

  return result;
}`,
            type: 'function',
          },
        ],
      };

      const { SecurityScanner } = await import('./security-scanner.js');
      const { StaticAnalyzer } = await import('./static-analyzer.js');

      vi.mocked(SecurityScanner).prototype.runSecurityScan = vi.fn().mockResolvedValue({
        vulnerabilities: [],
        summary: { total: 0, critical: 0, high: 0, moderate: 0, low: 0 },
      });

      vi.mocked(StaticAnalyzer).prototype.runStaticAnalysis = vi.fn().mockResolvedValue({
        issues: [],
        metrics: {
          complexity: 15,
          maintainability: 40,
          duplication: 5,
        },
      });

      const result = await validator.validateGeneratedCode(poorQualityCode);

      expect(result.quality.status).toBe('warning');

      // Should detect 'any' type usage
      const anyTypeIssue = result.quality.issues.find(i => i.message.includes('any'));
      expect(anyTypeIssue).toBeDefined();

      // Should detect long line
      const longLineIssue = result.quality.issues.find(i => i.message.includes('Line too long'));
      expect(longLineIssue).toBeDefined();

      // Should detect deeply nested code
      const nestedIssue = result.quality.issues.find(i => i.message.includes('nested'));
      expect(nestedIssue).toBeDefined();

      // Should detect missing error handling
      const errorHandlingIssue = result.quality.issues.find(i =>
        i.message.includes('error handling')
      );
      expect(errorHandlingIssue).toBeDefined();

      expect(result.quality.metrics.complexity).toBe(15);
      expect(result.recommendations).toContain(
        '📊 Reduce complexity from 15 to improve maintainability'
      );
    });

    it('should handle validation failures gracefully', async () => {
      const { SecurityScanner } = await import('./security-scanner.js');
      const { StaticAnalyzer } = await import('./static-analyzer.js');

      // Mock failures
      vi.mocked(SecurityScanner).prototype.runSecurityScan = vi
        .fn()
        .mockRejectedValue(new Error('Scanner failed'));
      vi.mocked(StaticAnalyzer).prototype.runStaticAnalysis = vi
        .fn()
        .mockRejectedValue(new Error('Analysis failed'));

      const testCode = {
        files: [
          {
            path: 'src/test.ts',
            content: 'export const test = "hello";',
            type: 'function',
          },
        ],
      };

      const result = await validator.validateGeneratedCode(testCode);

      expect(result.isValid).toBe(false);
      expect(result.security.status).toBe('warning');
      expect(result.quality.status).toBe('warning');
      expect(result.recommendations).toContain(
        'Manual code review recommended due to validation failure'
      );
    });
  });

  describe('quickValidate', () => {
    it('should quickly validate simple code snippets', async () => {
      const { SecurityScanner } = await import('./security-scanner.js');
      const { StaticAnalyzer } = await import('./static-analyzer.js');

      vi.mocked(SecurityScanner).prototype.runSecurityScan = vi.fn().mockResolvedValue({
        vulnerabilities: [],
        summary: { total: 0, critical: 0, high: 0, moderate: 0, low: 0 },
      });

      vi.mocked(StaticAnalyzer).prototype.runStaticAnalysis = vi.fn().mockResolvedValue({
        issues: [],
        metrics: {
          complexity: 2,
          maintainability: 85,
          duplication: 0,
        },
      });

      const simpleCode = 'export const greeting = "Hello, World!";';

      const result = await validator.quickValidate(simpleCode);

      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(70);
      expect(result.issues).toEqual([]);
    });

    it('should detect issues in quick validation', async () => {
      const { SecurityScanner } = await import('./security-scanner.js');
      const { StaticAnalyzer } = await import('./static-analyzer.js');

      vi.mocked(SecurityScanner).prototype.runSecurityScan = vi.fn().mockResolvedValue({
        vulnerabilities: [],
        summary: { total: 0, critical: 0, high: 0, moderate: 0, low: 0 },
      });

      vi.mocked(StaticAnalyzer).prototype.runStaticAnalysis = vi.fn().mockResolvedValue({
        issues: [],
        metrics: {
          complexity: 5,
          maintainability: 60,
          duplication: 0,
        },
      });

      const badCode = 'const secret = "api-key-12345"; eval(userInput);';

      const result = await validator.quickValidate(badCode);

      expect(result.isValid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues.some(issue => issue.includes('credentials'))).toBe(true);
      expect(result.issues.some(issue => issue.includes('eval'))).toBe(true);
    });
  });

  describe('testability calculation', () => {
    it('should calculate high testability for well-structured code', async () => {
      const testableCode = {
        files: [
          {
            path: 'src/utils.ts',
            content: `#!/usr/bin/env node

export function add(a: number, b: number): number {
  return a + b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}`,
            type: 'function',
          },
          {
            path: 'src/utils.test.ts',
            content: `#!/usr/bin/env node

import { add, multiply } from './utils.js';

describe('utils', () => {
  it('should add numbers', () => {
    expect(add(2, 3)).toBe(5);
  });
});`,
            type: 'test',
          },
        ],
      };

      const { SecurityScanner } = await import('./security-scanner.js');
      const { StaticAnalyzer } = await import('./static-analyzer.js');

      vi.mocked(SecurityScanner).prototype.runSecurityScan = vi.fn().mockResolvedValue({
        vulnerabilities: [],
        summary: { total: 0, critical: 0, high: 0, moderate: 0, low: 0 },
      });

      vi.mocked(StaticAnalyzer).prototype.runStaticAnalysis = vi.fn().mockResolvedValue({
        issues: [],
        metrics: {
          complexity: 2,
          maintainability: 90,
          duplication: 0,
        },
      });

      const result = await validator.validateGeneratedCode(testableCode);

      expect(result.quality.metrics.testability).toBeGreaterThan(80);
    });

    it('should calculate low testability for poorly structured code', async () => {
      const untestedCode = {
        files: [
          {
            path: 'src/untestable.ts',
            content: `#!/usr/bin/env node

// No exports, uses side effects
function processWithSideEffects() {
  const randomValue = Math.random();
  const timestamp = Date.now();

  console.log("Processing at", timestamp, "with", randomValue);
  // No return value, just side effects
}

processWithSideEffects();`,
            type: 'function',
          },
        ],
      };

      const { SecurityScanner } = await import('./security-scanner.js');
      const { StaticAnalyzer } = await import('./static-analyzer.js');

      vi.mocked(SecurityScanner).prototype.runSecurityScan = vi.fn().mockResolvedValue({
        vulnerabilities: [],
        summary: { total: 0, critical: 0, high: 0, moderate: 0, low: 0 },
      });

      vi.mocked(StaticAnalyzer).prototype.runStaticAnalysis = vi.fn().mockResolvedValue({
        issues: [],
        metrics: {
          complexity: 3,
          maintainability: 60,
          duplication: 0,
        },
      });

      const result = await validator.validateGeneratedCode(untestedCode);

      expect(result.quality.metrics.testability).toBeLessThan(70);
      expect(result.recommendations).toContain('🧪 Improve testability (current: 65%)');
    });
  });
});
