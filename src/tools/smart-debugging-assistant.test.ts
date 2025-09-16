#!/usr/bin/env node

/**
 * Tests for Smart Debugging Assistant
 * Ensures AI-powered debugging works correctly
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SmartDebuggingAssistant, DebugContext } from './smart-debugging-assistant.js';

// Mock external dependencies
vi.mock('../core/real-metrics-collector.js', () => ({
  RealMetricsCollector: vi.fn().mockImplementation(() => ({
    calculateRealQualityMetrics: vi.fn().mockResolvedValue({
      overall: 75,
      maintainability: 80,
      performance: 70,
      security: 85,
      reliability: 75,
      usability: 80,
      testCoverage: 60,
      complexity: 3,
      source: 'real_analysis',
      timestamp: new Date().toISOString()
    })
  }))
}));

vi.mock('../core/context7-cache.js', () => ({
  Context7Cache: vi.fn().mockImplementation(() => ({
    getRelevantData: vi.fn().mockResolvedValue([])
  }))
}));

describe('SmartDebuggingAssistant', () => {
  let assistant: SmartDebuggingAssistant;
  let mockContext: DebugContext;

  beforeEach(() => {
    vi.clearAllMocks();
    assistant = new SmartDebuggingAssistant();

    mockContext = {
      code: `
        function processUserData(user) {
          if (user && user.name && user.email && user.age > 18) {
            if (user.subscription && user.subscription.active) {
              if (user.payment && user.payment.valid) {
                return {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  status: 'active'
                };
              }
            }
          }
          return null;
        }
      `,
      language: 'typescript',
      filePath: 'test-file.ts',
      errorMessage: 'ReferenceError: user is not defined',
      stackTrace: 'at processUserData (test-file.ts:2:10)',
      dependencies: ['react', 'typescript'],
      framework: 'react',
      environment: 'development'
    };
  });

  describe('Basic Functionality', () => {
    it('should initialize debugging assistant', () => {
      expect(assistant).toBeDefined();
      expect(assistant).toBeInstanceOf(SmartDebuggingAssistant);
    });

    it('should analyze code and detect issues', async () => {
      const result = await assistant.analyzeCode(mockContext);

      expect(result).toBeDefined();
      expect(result.issues).toBeDefined();
      expect(Array.isArray(result.issues)).toBe(true);
      expect(result.solutions).toBeDefined();
      expect(Array.isArray(result.solutions)).toBe(true);
      expect(result.summary).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.metrics).toBeDefined();
      expect(result.executionTime).toBeGreaterThan(0);
    });

    it('should generate issues with proper structure', async () => {
      const result = await assistant.analyzeCode(mockContext);

      if (result.issues.length > 0) {
        const issue = result.issues[0];

        expect(issue.id).toBeDefined();
        expect(issue.type).toBeDefined();
        expect(issue.severity).toBeDefined();
        expect(issue.title).toBeDefined();
        expect(issue.description).toBeDefined();
        expect(issue.location).toBeDefined();
        expect(issue.code).toBeDefined();
        expect(issue.confidence).toBeGreaterThanOrEqual(0);
        expect(issue.confidence).toBeLessThanOrEqual(1);
        expect(issue.impact).toBeDefined();
        expect(issue.tags).toBeDefined();
        expect(issue.metadata).toBeDefined();
      }
    });

    it('should generate solutions with proper structure', async () => {
      const result = await assistant.analyzeCode(mockContext);

      if (result.solutions.length > 0) {
        const solution = result.solutions[0];

        expect(solution.id).toBeDefined();
        expect(solution.issueId).toBeDefined();
        expect(solution.title).toBeDefined();
        expect(solution.description).toBeDefined();
        expect(solution.solution).toBeDefined();
        expect(solution.explanation).toBeDefined();
        expect(solution.codeFix).toBeDefined();
        expect(solution.confidence).toBeGreaterThanOrEqual(0);
        expect(solution.confidence).toBeLessThanOrEqual(1);
        expect(solution.effort).toBeDefined();
        expect(solution.risk).toBeDefined();
        expect(solution.prerequisites).toBeDefined();
        expect(solution.alternatives).toBeDefined();
        expect(solution.examples).toBeDefined();
        expect(solution.testing).toBeDefined();
      }
    });
  });

  describe('Issue Detection', () => {
    it('should detect syntax errors', async () => {
      const syntaxErrorContext: DebugContext = {
        ...mockContext,
        code: `
          function test() {
            const x = 5
            return x
          }
        `,
        errorMessage: 'SyntaxError: Missing semicolon'
      };

      const result = await assistant.analyzeCode(syntaxErrorContext);
      const syntaxErrors = result.issues.filter(i => i.type === 'syntax_error');

      expect(syntaxErrors.length).toBeGreaterThan(0);
    });

    it('should detect type errors', async () => {
      const typeErrorContext: DebugContext = {
        ...mockContext,
        code: `
          function processData(data) {
            return data.map(item => item.value.toUpperCase());
          }
        `,
        errorMessage: 'TypeError: Cannot read property "toUpperCase" of undefined'
      };

      const result = await assistant.analyzeCode(typeErrorContext);
      const typeErrors = result.issues.filter(i => i.type === 'type_error');

      expect(typeErrors.length).toBeGreaterThan(0);
    });

    it('should detect reference errors', async () => {
      const referenceErrorContext: DebugContext = {
        ...mockContext,
        code: `
          function test() {
            console.log(undefinedVariable);
            return undefinedVariable;
          }
        `,
        errorMessage: 'ReferenceError: undefinedVariable is not defined'
      };

      const result = await assistant.analyzeCode(referenceErrorContext);
      const referenceErrors = result.issues.filter(i => i.type === 'reference_error');

      expect(referenceErrors.length).toBeGreaterThan(0);
    });

    it('should detect logic errors', async () => {
      const logicErrorContext: DebugContext = {
        ...mockContext,
        code: `
          function test() {
            if (x = 5) {
              return true;
            }
            return false;
          }
        `,
        errorMessage: 'Logic error: Assignment in if condition'
      };

      const result = await assistant.analyzeCode(logicErrorContext);
      const logicErrors = result.issues.filter(i => i.type === 'logic_error');

      expect(logicErrors.length).toBeGreaterThan(0);
    });

    it('should detect performance issues', async () => {
      const performanceContext: DebugContext = {
        ...mockContext,
        code: `
          function findDuplicates(items) {
            const duplicates = [];
            for (let i = 0; i < items.length; i++) {
              for (let j = 0; j < items.length; j++) {
                if (i !== j && items[i].id === items[j].id) {
                  duplicates.push(items[i]);
                }
              }
            }
            return duplicates;
          }
        `,
        errorMessage: 'Performance issue: Nested loops detected'
      };

      const result = await assistant.analyzeCode(performanceContext);
      const performanceIssues = result.issues.filter(i => i.type === 'performance_issue');

      expect(performanceIssues.length).toBeGreaterThan(0);
    });

    it('should detect memory leaks', async () => {
      const memoryLeakContext: DebugContext = {
        ...mockContext,
        code: `
          function setupEventListeners() {
            document.addEventListener('click', handleClick);
            setInterval(updateData, 1000);
          }
        `,
        errorMessage: 'Memory leak: Event listeners and intervals without cleanup'
      };

      const result = await assistant.analyzeCode(memoryLeakContext);
      const memoryLeaks = result.issues.filter(i => i.type === 'memory_leak');

      expect(memoryLeaks.length).toBeGreaterThan(0);
    });

    it('should detect security vulnerabilities', async () => {
      const securityContext: DebugContext = {
        ...mockContext,
        code: `
          function renderUserContent(userInput) {
            document.innerHTML = '<div>' + userInput + '</div>';
            eval('console.log("executed")');
          }
        `,
        errorMessage: 'Security vulnerability: XSS and eval usage'
      };

      const result = await assistant.analyzeCode(securityContext);
      const securityIssues = result.issues.filter(i => i.type === 'security_vulnerability');

      expect(securityIssues.length).toBeGreaterThan(0);
    });

    it('should detect async/await errors', async () => {
      const asyncContext: DebugContext = {
        ...mockContext,
        code: `
          async function fetchData() {
            const data = await fetch('/api/data');
            return data.json();
          }
        `,
        errorMessage: 'Async/await error: Missing error handling'
      };

      const result = await assistant.analyzeCode(asyncContext);
      const asyncErrors = result.issues.filter(i => i.type === 'async_await_error');

      expect(asyncErrors.length).toBeGreaterThan(0);
    });

    it('should detect promise errors', async () => {
      const promiseContext: DebugContext = {
        ...mockContext,
        code: `
          function fetchData() {
            return fetch('/api/data')
              .then(response => response.json())
              .then(data => data);
          }
        `,
        errorMessage: 'Promise error: Missing error handling'
      };

      const result = await assistant.analyzeCode(promiseContext);
      const promiseErrors = result.issues.filter(i => i.type === 'promise_error');

      expect(promiseErrors.length).toBeGreaterThan(0);
    });
  });

  describe('Solution Generation', () => {
    it('should generate solutions for detected issues', async () => {
      const result = await assistant.analyzeCode(mockContext);

      expect(result.solutions.length).toBeGreaterThanOrEqual(0);

      if (result.solutions.length > 0) {
        const solution = result.solutions[0];
        expect(solution.issueId).toBeDefined();
        expect(solution.title).toBeDefined();
        expect(solution.description).toBeDefined();
        expect(solution.solution).toBeDefined();
        expect(solution.codeFix).toBeDefined();
      }
    });

    it('should get solutions for specific issue', async () => {
      const result = await assistant.analyzeCode(mockContext);

      if (result.issues.length > 0) {
        const issue = result.issues[0];
        const solutions = await assistant.getSolutionsForIssue(issue.id, mockContext);

        expect(solutions).toBeDefined();
        expect(Array.isArray(solutions)).toBe(true);
        expect(solutions.every(s => s.issueId === issue.id)).toBe(true);
      }
    });

    it('should get solutions by issue type', async () => {
      const result = await assistant.analyzeCode(mockContext);

      if (result.issues.length > 0) {
        const issueType = result.issues[0].type;
        const solutions = await assistant.getSolutionsByType(issueType, mockContext);

        expect(solutions).toBeDefined();
        expect(Array.isArray(solutions)).toBe(true);
      }
    });

    it('should get solutions by severity', async () => {
      const result = await assistant.analyzeCode(mockContext);

      if (result.issues.length > 0) {
        const severity = result.issues[0].severity;
        const solutions = await assistant.getSolutionsBySeverity(severity, mockContext);

        expect(solutions).toBeDefined();
        expect(Array.isArray(solutions)).toBe(true);
      }
    });
  });

  describe('Solution Application', () => {
    it('should apply solutions to fix issues', async () => {
      const result = await assistant.analyzeCode(mockContext);

      if (result.issues.length > 0 && result.solutions.length > 0) {
        const issue = result.issues[0];
        const solution = result.solutions[0];

        const applyResult = await assistant.applySolution(issue.id, solution.id, mockContext);

        expect(applyResult).toBeDefined();
        expect(applyResult.success).toBeDefined();
        expect(applyResult.fixedCode).toBeDefined();
        expect(applyResult.changes).toBeDefined();
        expect(applyResult.warnings).toBeDefined();
        expect(applyResult.verification).toBeDefined();
      }
    });

    it('should handle non-existent issue or solution', async () => {
      await expect(
        assistant.applySolution('non-existent-issue', 'non-existent-solution', mockContext)
      ).rejects.toThrow('Issue or solution not found');
    });
  });

  describe('Summary and Metrics', () => {
    it('should generate comprehensive summary', async () => {
      const result = await assistant.analyzeCode(mockContext);

      expect(result.summary).toBeDefined();
      expect(result.summary.totalIssues).toBeGreaterThanOrEqual(0);
      expect(result.summary.criticalIssues).toBeGreaterThanOrEqual(0);
      expect(result.summary.highIssues).toBeGreaterThanOrEqual(0);
      expect(result.summary.mediumIssues).toBeGreaterThanOrEqual(0);
      expect(result.summary.lowIssues).toBeGreaterThanOrEqual(0);
      expect(result.summary.solvedIssues).toBeGreaterThanOrEqual(0);
      expect(result.summary.unsolvedIssues).toBeGreaterThanOrEqual(0);
    });

    it('should calculate quality metrics', async () => {
      const result = await assistant.analyzeCode(mockContext);

      expect(result.metrics).toBeDefined();
      expect(result.metrics.codeQuality).toBeGreaterThanOrEqual(0);
      expect(result.metrics.maintainability).toBeGreaterThanOrEqual(0);
      expect(result.metrics.performance).toBeGreaterThanOrEqual(0);
      expect(result.metrics.security).toBeGreaterThanOrEqual(0);
      expect(result.metrics.reliability).toBeGreaterThanOrEqual(0);
    });

    it('should generate recommendations', async () => {
      const result = await assistant.analyzeCode(mockContext);

      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should track execution time', async () => {
      const result = await assistant.analyzeCode(mockContext);

      expect(result.executionTime).toBeGreaterThan(0);
      expect(typeof result.executionTime).toBe('number');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid code gracefully', async () => {
      const invalidContext: DebugContext = {
        ...mockContext,
        code: 'invalid syntax {'
      };

      await expect(assistant.analyzeCode(invalidContext)).resolves.toBeDefined();
    });

    it('should handle empty code', async () => {
      const emptyContext: DebugContext = {
        ...mockContext,
        code: ''
      };

      const result = await assistant.analyzeCode(emptyContext);
      expect(result).toBeDefined();
      expect(result.issues).toBeDefined();
    });

    it('should handle null/undefined code', async () => {
      const nullContext: DebugContext = {
        ...mockContext,
        code: null as any
      };

      await expect(assistant.analyzeCode(nullContext)).resolves.toBeDefined();
    });
  });

  describe('Different Languages', () => {
    it('should work with JavaScript code', async () => {
      const jsContext: DebugContext = {
        ...mockContext,
        language: 'javascript',
        code: `
          function add(a, b) {
            return a + b;
          }
        `
      };

      const result = await assistant.analyzeCode(jsContext);
      expect(result).toBeDefined();
      expect(result.issues).toBeDefined();
    });

    it('should work with Python code', async () => {
      const pythonContext: DebugContext = {
        ...mockContext,
        language: 'python',
        code: `
          def add(a, b):
              return a + b
        `
      };

      const result = await assistant.analyzeCode(pythonContext);
      expect(result).toBeDefined();
      expect(result.issues).toBeDefined();
    });

    it('should work with Java code', async () => {
      const javaContext: DebugContext = {
        ...mockContext,
        language: 'java',
        code: `
          public class Calculator {
              public int add(int a, int b) {
                  return a + b;
              }
          }
        `
      };

      const result = await assistant.analyzeCode(javaContext);
      expect(result).toBeDefined();
      expect(result.issues).toBeDefined();
    });
  });

  describe('Integration with External Services', () => {
    it('should handle Context7 cache integration', async () => {
      const result = await assistant.analyzeCode(mockContext);
      expect(result).toBeDefined();
      // The Context7Cache is mocked, so we just verify it doesn't crash
    });

    it('should handle metrics collector integration', async () => {
      const result = await assistant.analyzeCode(mockContext);
      expect(result).toBeDefined();
      expect(result.metrics).toBeDefined();
      // The RealMetricsCollector is mocked, so we just verify it doesn't crash
    });
  });

  describe('Issue Severity and Impact', () => {
    it('should categorize issues by severity', async () => {
      const result = await assistant.analyzeCode(mockContext);

      const severityCounts = {
        critical: result.issues.filter(i => i.severity === 'critical').length,
        high: result.issues.filter(i => i.severity === 'high').length,
        medium: result.issues.filter(i => i.severity === 'medium').length,
        low: result.issues.filter(i => i.severity === 'low').length
      };

      expect(severityCounts.critical + severityCounts.high + severityCounts.medium + severityCounts.low)
        .toBe(result.issues.length);
    });

    it('should calculate impact scores', async () => {
      const result = await assistant.analyzeCode(mockContext);

      if (result.issues.length > 0) {
        const issue = result.issues[0];
        expect(issue.impact.performance).toBeGreaterThanOrEqual(0);
        expect(issue.impact.performance).toBeLessThanOrEqual(1);
        expect(issue.impact.security).toBeGreaterThanOrEqual(0);
        expect(issue.impact.security).toBeLessThanOrEqual(1);
        expect(issue.impact.maintainability).toBeGreaterThanOrEqual(0);
        expect(issue.impact.maintainability).toBeLessThanOrEqual(1);
        expect(issue.impact.reliability).toBeGreaterThanOrEqual(0);
        expect(issue.impact.reliability).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('Solution Quality', () => {
    it('should provide confidence scores for solutions', async () => {
      const result = await assistant.analyzeCode(mockContext);

      if (result.solutions.length > 0) {
        const solution = result.solutions[0];
        expect(solution.confidence).toBeGreaterThanOrEqual(0);
        expect(solution.confidence).toBeLessThanOrEqual(1);
      }
    });

    it('should categorize solutions by effort and risk', async () => {
      const result = await assistant.analyzeCode(mockContext);

      if (result.solutions.length > 0) {
        const solution = result.solutions[0];
        expect(['low', 'medium', 'high']).toContain(solution.effort);
        expect(['low', 'medium', 'high']).toContain(solution.risk);
      }
    });

    it('should provide examples and testing guidance', async () => {
      const result = await assistant.analyzeCode(mockContext);

      if (result.solutions.length > 0) {
        const solution = result.solutions[0];
        expect(solution.examples).toBeDefined();
        expect(Array.isArray(solution.examples)).toBe(true);
        expect(solution.testing).toBeDefined();
        expect(solution.testing.testCases).toBeDefined();
        expect(solution.testing.verification).toBeDefined();
      }
    });
  });
});
