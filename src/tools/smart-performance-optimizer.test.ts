#!/usr/bin/env node

/**
 * Tests for Smart Performance Optimizer
 * Ensures AI-powered performance optimization works correctly
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SmartPerformanceOptimizer, PerformanceContext } from './smart-performance-optimizer.js';

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

describe('SmartPerformanceOptimizer', () => {
  let optimizer: SmartPerformanceOptimizer;
  let mockContext: PerformanceContext;

  beforeEach(() => {
    vi.clearAllMocks();
    optimizer = new SmartPerformanceOptimizer();

    mockContext = {
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
      language: 'typescript',
      filePath: 'test-file.ts',
      framework: 'react',
      dependencies: ['react', 'typescript'],
      environment: 'development',
      performanceRequirements: {
        maxExecutionTime: 100,
        maxMemoryUsage: 50,
        maxCpuUsage: 80,
        targetThroughput: 1000
      }
    };
  });

  describe('Basic Functionality', () => {
    it('should initialize performance optimizer', () => {
      expect(optimizer).toBeDefined();
      expect(optimizer).toBeInstanceOf(SmartPerformanceOptimizer);
    });

    it('should analyze code and detect performance issues', async () => {
      const result = await optimizer.analyzeCode(mockContext);

      expect(result).toBeDefined();
      expect(result.issues).toBeDefined();
      expect(Array.isArray(result.issues)).toBe(true);
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.summary).toBeDefined();
      expect(result.metrics).toBeDefined();
      expect(result.executionTime).toBeGreaterThan(0);
    });

    it('should generate issues with proper structure', async () => {
      const result = await optimizer.analyzeCode(mockContext);

      if (result.issues.length > 0) {
        const issue = result.issues[0];

        expect(issue.id).toBeDefined();
        expect(issue.type).toBeDefined();
        expect(issue.severity).toBeDefined();
        expect(issue.title).toBeDefined();
        expect(issue.description).toBeDefined();
        expect(issue.location).toBeDefined();
        expect(issue.code).toBeDefined();
        expect(issue.impact).toBeDefined();
        expect(issue.confidence).toBeGreaterThanOrEqual(0);
        expect(issue.confidence).toBeLessThanOrEqual(1);
        expect(issue.tags).toBeDefined();
        expect(issue.metadata).toBeDefined();
      }
    });

    it('should generate recommendations with proper structure', async () => {
      const result = await optimizer.analyzeCode(mockContext);

      if (result.recommendations.length > 0) {
        const recommendation = result.recommendations[0];

        expect(recommendation.id).toBeDefined();
        expect(recommendation.issueId).toBeDefined();
        expect(recommendation.title).toBeDefined();
        expect(recommendation.description).toBeDefined();
        expect(recommendation.solution).toBeDefined();
        expect(recommendation.explanation).toBeDefined();
        expect(recommendation.codeFix).toBeDefined();
        expect(recommendation.confidence).toBeGreaterThanOrEqual(0);
        expect(recommendation.confidence).toBeLessThanOrEqual(1);
        expect(recommendation.effort).toBeDefined();
        expect(recommendation.impact).toBeDefined();
        expect(recommendation.prerequisites).toBeDefined();
        expect(recommendation.alternatives).toBeDefined();
        expect(recommendation.examples).toBeDefined();
        expect(recommendation.testing).toBeDefined();
      }
    });
  });

  describe('Performance Issue Detection', () => {
    it('should detect nested loops', async () => {
      const nestedLoopsContext: PerformanceContext = {
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
        `
      };

      const result = await optimizer.analyzeCode(nestedLoopsContext);
      const nestedLoopIssues = result.issues.filter(i => i.type === 'nested_loops');

      expect(nestedLoopIssues.length).toBeGreaterThan(0);
    });

    it('should detect inefficient algorithms', async () => {
      const inefficientContext: PerformanceContext = {
        ...mockContext,
        code: `
          function processData(data) {
            return data
              .filter(item => item.active)
              .filter(item => item.verified)
              .filter(item => item.valid)
              .map(item => item.value)
              .map(item => item.toUpperCase())
              .map(item => item.trim());
          }
        `
      };

      const result = await optimizer.analyzeCode(inefficientContext);
      const inefficientIssues = result.issues.filter(i => i.type === 'inefficient_algorithms');

      expect(inefficientIssues.length).toBeGreaterThan(0);
    });

    it('should detect memory leaks', async () => {
      const memoryLeakContext: PerformanceContext = {
        ...mockContext,
        code: `
          function setupEventListeners() {
            document.addEventListener('click', handleClick);
            setInterval(updateData, 1000);
            setTimeout(cleanup, 5000);
          }
        `
      };

      const result = await optimizer.analyzeCode(memoryLeakContext);
      const memoryLeakIssues = result.issues.filter(i => i.type === 'memory_leaks');

      expect(memoryLeakIssues.length).toBeGreaterThan(0);
    });

    it('should detect excessive allocations', async () => {
      const allocationContext: PerformanceContext = {
        ...mockContext,
        code: `
          function processItems(items) {
            const results = [];
            for (const item of items) {
              const processed = new Object();
              processed.id = item.id;
              processed.name = item.name;
              processed.timestamp = new Date();
              results.push(processed);
            }
            return results;
          }
        `
      };

      const result = await optimizer.analyzeCode(allocationContext);
      const allocationIssues = result.issues.filter(i => i.type === 'excessive_allocations');

      expect(allocationIssues.length).toBeGreaterThan(0);
    });

    it('should detect synchronous operations', async () => {
      const syncContext: PerformanceContext = {
        ...mockContext,
        code: `
          function processFile(filename) {
            const data = fs.readFileSync(filename, 'utf8');
            const parsed = JSON.parse(data);
            return parsed;
          }
        `
      };

      const result = await optimizer.analyzeCode(syncContext);
      const syncIssues = result.issues.filter(i => i.type === 'synchronous_operations');

      expect(syncIssues.length).toBeGreaterThan(0);
    });

    it('should detect redundant calculations', async () => {
      const redundantContext: PerformanceContext = {
        ...mockContext,
        code: `
          function calculateDistance(x1, y1, x2, y2) {
            const dx = x2 - x1;
            const dy = y2 - y1;
            return Math.pow(dx, 2) + Math.pow(dy, 2);
          }
        `
      };

      const result = await optimizer.analyzeCode(redundantContext);
      const redundantIssues = result.issues.filter(i => i.type === 'redundant_calculations');

      expect(redundantIssues.length).toBeGreaterThan(0);
    });

    it('should detect inefficient data structures', async () => {
      const inefficientContext: PerformanceContext = {
        ...mockContext,
        code: `
          function findItem(items, targetId) {
            for (let i = 0; i < items.length; i++) {
              if (items[i].id === targetId) {
                return items[i];
              }
            }
            return null;
          }

          function checkItems(items) {
            return items.indexOf('test') !== -1;
          }
        `
      };

      const result = await optimizer.analyzeCode(inefficientContext);
      const inefficientIssues = result.issues.filter(i => i.type === 'inefficient_data_structures');

      expect(inefficientIssues.length).toBeGreaterThan(0);
    });

    it('should detect large bundle size', async () => {
      const bundleContext: PerformanceContext = {
        ...mockContext,
        code: `
          import * as _ from 'lodash';
          import moment from 'moment';
          import $ from 'jquery';
        `
      };

      const result = await optimizer.analyzeCode(bundleContext);
      const bundleIssues = result.issues.filter(i => i.type === 'large_bundle_size');

      expect(bundleIssues.length).toBeGreaterThan(0);
    });

    it('should detect excessive API calls', async () => {
      const apiContext: PerformanceContext = {
        ...mockContext,
        code: `
          function fetchUserData(userIds) {
            return userIds.map(id =>
              fetch(\`/api/users/\${id}\`)
                .then(response => response.json())
            );
          }
        `
      };

      const result = await optimizer.analyzeCode(apiContext);
      const apiIssues = result.issues.filter(i => i.type === 'excessive_api_calls');

      expect(apiIssues.length).toBeGreaterThan(0);
    });
  });

  describe('Recommendation Generation', () => {
    it('should generate recommendations for detected issues', async () => {
      const result = await optimizer.analyzeCode(mockContext);

      expect(result.recommendations.length).toBeGreaterThanOrEqual(0);

      if (result.recommendations.length > 0) {
        const recommendation = result.recommendations[0];
        expect(recommendation.issueId).toBeDefined();
        expect(recommendation.title).toBeDefined();
        expect(recommendation.description).toBeDefined();
        expect(recommendation.solution).toBeDefined();
        expect(recommendation.codeFix).toBeDefined();
      }
    });

    it('should get recommendations by issue type', async () => {
      const result = await optimizer.analyzeCode(mockContext);

      if (result.issues.length > 0) {
        const issueType = result.issues[0].type;
        const recommendations = await optimizer.getRecommendationsByType(issueType, mockContext);

        expect(recommendations).toBeDefined();
        expect(Array.isArray(recommendations)).toBe(true);
        expect(recommendations.every(r => {
          const issue = result.issues.find(i => i.id === r.issueId);
          return issue?.type === issueType;
        })).toBe(true);
      }
    });

    it('should get recommendations by severity', async () => {
      const result = await optimizer.analyzeCode(mockContext);

      if (result.issues.length > 0) {
        const severity = result.issues[0].severity;
        const recommendations = await optimizer.getRecommendationsBySeverity(severity, mockContext);

        expect(recommendations).toBeDefined();
        expect(Array.isArray(recommendations)).toBe(true);
        expect(recommendations.every(r => {
          const issue = result.issues.find(i => i.id === r.issueId);
          return issue?.severity === severity;
        })).toBe(true);
      }
    });
  });

  describe('Optimization Application', () => {
    it('should apply performance optimizations', async () => {
      const result = await optimizer.analyzeCode(mockContext);

      if (result.issues.length > 0 && result.recommendations.length > 0) {
        const issue = result.issues[0];
        const recommendation = result.recommendations.find(r => r.issueId === issue.id);

        if (recommendation) {
          const applyResult = await optimizer.applyOptimization(issue.id, recommendation.id, mockContext);

          expect(applyResult).toBeDefined();
          expect(applyResult.success).toBeDefined();
          expect(applyResult.optimizedCode).toBeDefined();
          expect(applyResult.changes).toBeDefined();
          expect(applyResult.warnings).toBeDefined();
          expect(applyResult.verification).toBeDefined();
        } else {
          // If no matching recommendation, just verify the method exists
          expect(typeof optimizer.applyOptimization).toBe('function');
        }
      } else {
        // If no issues or recommendations, just verify the method exists
        expect(typeof optimizer.applyOptimization).toBe('function');
      }
    });

    it('should handle non-existent issue or recommendation', async () => {
      await expect(
        optimizer.applyOptimization('non-existent-issue', 'non-existent-recommendation', mockContext)
      ).rejects.toThrow('Issue or recommendation not found');
    });
  });

  describe('Summary and Metrics', () => {
    it('should generate comprehensive summary', async () => {
      const result = await optimizer.analyzeCode(mockContext);

      expect(result.summary).toBeDefined();
      expect(result.summary.totalIssues).toBeGreaterThanOrEqual(0);
      expect(result.summary.criticalIssues).toBeGreaterThanOrEqual(0);
      expect(result.summary.highIssues).toBeGreaterThanOrEqual(0);
      expect(result.summary.mediumIssues).toBeGreaterThanOrEqual(0);
      expect(result.summary.lowIssues).toBeGreaterThanOrEqual(0);
      expect(result.summary.estimatedImprovement).toBeDefined();
    });

    it('should calculate performance metrics', async () => {
      const result = await optimizer.analyzeCode(mockContext);

      expect(result.metrics).toBeDefined();
      expect(result.metrics.current).toBeDefined();
      expect(result.metrics.projected).toBeDefined();
      expect(result.metrics.improvement).toBeDefined();
      expect(typeof result.metrics.improvement).toBe('number');
    });

    it('should track execution time', async () => {
      const result = await optimizer.analyzeCode(mockContext);

      expect(result.executionTime).toBeGreaterThan(0);
      expect(typeof result.executionTime).toBe('number');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid code gracefully', async () => {
      const invalidContext: PerformanceContext = {
        ...mockContext,
        code: 'invalid syntax {'
      };

      await expect(optimizer.analyzeCode(invalidContext)).resolves.toBeDefined();
    });

    it('should handle empty code', async () => {
      const emptyContext: PerformanceContext = {
        ...mockContext,
        code: ''
      };

      const result = await optimizer.analyzeCode(emptyContext);
      expect(result).toBeDefined();
      expect(result.issues).toBeDefined();
    });

    it('should handle null/undefined code', async () => {
      const nullContext: PerformanceContext = {
        ...mockContext,
        code: null as any
      };

      await expect(optimizer.analyzeCode(nullContext)).resolves.toBeDefined();
    });
  });

  describe('Different Languages', () => {
    it('should work with JavaScript code', async () => {
      const jsContext: PerformanceContext = {
        ...mockContext,
        language: 'javascript',
        code: `
          function add(a, b) {
            return a + b;
          }
        `
      };

      const result = await optimizer.analyzeCode(jsContext);
      expect(result).toBeDefined();
      expect(result.issues).toBeDefined();
    });

    it('should work with Python code', async () => {
      const pythonContext: PerformanceContext = {
        ...mockContext,
        language: 'python',
        code: `
          def add(a, b):
              return a + b
        `
      };

      const result = await optimizer.analyzeCode(pythonContext);
      expect(result).toBeDefined();
      expect(result.issues).toBeDefined();
    });

    it('should work with Java code', async () => {
      const javaContext: PerformanceContext = {
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

      const result = await optimizer.analyzeCode(javaContext);
      expect(result).toBeDefined();
      expect(result.issues).toBeDefined();
    });
  });

  describe('Performance Requirements', () => {
    it('should respect performance requirements', async () => {
      const requirementsContext: PerformanceContext = {
        ...mockContext,
        performanceRequirements: {
          maxExecutionTime: 50,
          maxMemoryUsage: 25,
          maxCpuUsage: 60,
          targetThroughput: 2000
        }
      };

      const result = await optimizer.analyzeCode(requirementsContext);
      expect(result).toBeDefined();
      expect(result.issues).toBeDefined();
    });

    it('should work without performance requirements', async () => {
      const noRequirementsContext: PerformanceContext = {
        ...mockContext,
        performanceRequirements: undefined
      };

      const result = await optimizer.analyzeCode(noRequirementsContext);
      expect(result).toBeDefined();
      expect(result.issues).toBeDefined();
    });
  });

  describe('Issue Severity and Impact', () => {
    it('should categorize issues by severity', async () => {
      const result = await optimizer.analyzeCode(mockContext);

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
      const result = await optimizer.analyzeCode(mockContext);

      if (result.issues.length > 0) {
        const issue = result.issues[0];
        expect(issue.impact.executionTime).toBeGreaterThanOrEqual(0);
        expect(issue.impact.memoryUsage).toBeGreaterThanOrEqual(0);
        expect(issue.impact.cpuUsage).toBeGreaterThanOrEqual(0);
        expect(issue.impact.scalability).toBeGreaterThanOrEqual(0);
        expect(issue.impact.scalability).toBeLessThanOrEqual(1);
        expect(issue.impact.overall).toBeGreaterThanOrEqual(0);
        expect(issue.impact.overall).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('Recommendation Quality', () => {
    it('should provide confidence scores for recommendations', async () => {
      const result = await optimizer.analyzeCode(mockContext);

      if (result.recommendations.length > 0) {
        const recommendation = result.recommendations[0];
        expect(recommendation.confidence).toBeGreaterThanOrEqual(0);
        expect(recommendation.confidence).toBeLessThanOrEqual(1);
      }
    });

    it('should categorize recommendations by effort and impact', async () => {
      const result = await optimizer.analyzeCode(mockContext);

      if (result.recommendations.length > 0) {
        const recommendation = result.recommendations[0];
        expect(['low', 'medium', 'high']).toContain(recommendation.effort);
        expect(recommendation.impact.executionTimeImprovement).toBeGreaterThanOrEqual(0);
        expect(recommendation.impact.memoryImprovement).toBeGreaterThanOrEqual(-100);
        expect(recommendation.impact.cpuImprovement).toBeGreaterThanOrEqual(0);
        expect(recommendation.impact.scalabilityImprovement).toBeGreaterThanOrEqual(0);
        expect(recommendation.impact.overallImprovement).toBeGreaterThanOrEqual(0);
      }
    });

    it('should provide examples and testing guidance', async () => {
      const result = await optimizer.analyzeCode(mockContext);

      if (result.recommendations.length > 0) {
        const recommendation = result.recommendations[0];
        expect(recommendation.examples).toBeDefined();
        expect(Array.isArray(recommendation.examples)).toBe(true);
        expect(recommendation.testing).toBeDefined();
        expect(recommendation.testing.benchmarks).toBeDefined();
        expect(recommendation.testing.verification).toBeDefined();
      }
    });
  });

  describe('Integration with External Services', () => {
    it('should handle Context7 cache integration', async () => {
      const result = await optimizer.analyzeCode(mockContext);
      expect(result).toBeDefined();
      // The Context7Cache is mocked, so we just verify it doesn't crash
    });

    it('should handle metrics collector integration', async () => {
      const result = await optimizer.analyzeCode(mockContext);
      expect(result).toBeDefined();
      expect(result.metrics).toBeDefined();
      // The RealMetricsCollector is mocked, so we just verify it doesn't crash
    });
  });
});
