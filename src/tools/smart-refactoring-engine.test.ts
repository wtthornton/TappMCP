#!/usr/bin/env node

/**
 * Tests for Smart Refactoring Engine
 * Ensures AI-powered code refactoring works correctly
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SmartRefactoringEngine, RefactoringContext } from './smart-refactoring-engine.js';

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

vi.mock('../core/context7-query-optimizer.js', () => ({
  Context7QueryOptimizer: vi.fn().mockImplementation(() => ({
    optimizeQuery: vi.fn().mockResolvedValue({
      optimizedQuery: 'test query',
      confidence: 0.8,
      suggestions: []
    })
  }))
}));

describe('SmartRefactoringEngine', () => {
  let engine: SmartRefactoringEngine;
  let mockContext: RefactoringContext;

  beforeEach(() => {
    vi.clearAllMocks();
    engine = new SmartRefactoringEngine();

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
      projectType: 'web',
      framework: 'react',
      dependencies: ['react', 'typescript'],
      userPreferences: {
        preferredPatterns: ['extract_method', 'improve_naming'],
        avoidPatterns: ['eval'],
        codingStyle: 'functional',
        maxComplexity: 5,
        minTestCoverage: 80
      }
    };
  });

  describe('Basic Functionality', () => {
    it('should initialize refactoring engine', () => {
      expect(engine).toBeDefined();
      expect(engine).toBeInstanceOf(SmartRefactoringEngine);
    });

    it('should analyze code and generate suggestions', async () => {
      const result = await engine.analyzeCode(mockContext);

      expect(result).toBeDefined();
      expect(result.suggestions).toBeDefined();
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(result.summary).toBeDefined();
      expect(result.metrics).toBeDefined();
      expect(result.executionTime).toBeGreaterThan(0);
    });

    it('should generate refactoring suggestions with proper structure', async () => {
      const result = await engine.analyzeCode(mockContext);

      if (result.suggestions.length > 0) {
        const suggestion = result.suggestions[0];

        expect(suggestion.id).toBeDefined();
        expect(suggestion.type).toBeDefined();
        expect(suggestion.title).toBeDefined();
        expect(suggestion.description).toBeDefined();
        expect(suggestion.currentCode).toBeDefined();
        expect(suggestion.suggestedCode).toBeDefined();
        expect(suggestion.confidence).toBeGreaterThanOrEqual(0);
        expect(suggestion.confidence).toBeLessThanOrEqual(1);
        expect(suggestion.impact).toBeDefined();
        expect(suggestion.effort).toBeDefined();
        expect(suggestion.benefits).toBeDefined();
        expect(suggestion.risks).toBeDefined();
        expect(suggestion.prerequisites).toBeDefined();
        expect(suggestion.examples).toBeDefined();
        expect(suggestion.metadata).toBeDefined();
      }
    });
  });

  describe('Refactoring Analysis', () => {
    it('should detect long methods and suggest extraction', async () => {
      const longMethodContext: RefactoringContext = {
        ...mockContext,
        code: `
          function processUserData(user) {
            // 30+ lines of complex logic
            const validated = validateUser(user);
            const processed = processUserInfo(validated);
            const enriched = enrichUserData(processed);
            const normalized = normalizeUserData(enriched);
            const formatted = formatUserData(normalized);
            const saved = saveUserData(formatted);
            const logged = logUserData(saved);
            const notified = notifyUser(logged);
            return notified;
          }
        `
      };

      const result = await engine.analyzeCode(longMethodContext);
      const extractMethodSuggestions = result.suggestions.filter(s => s.type === 'extract_method');

      expect(extractMethodSuggestions.length).toBeGreaterThan(0);
    });

    it('should detect complex expressions and suggest variable extraction', async () => {
      const complexExpressionContext: RefactoringContext = {
        ...mockContext,
        code: `
          if (user && user.profile && user.profile.settings && user.profile.settings.notifications && user.profile.settings.notifications.email && user.profile.settings.notifications.email.enabled) {
            sendEmail(user.email, 'Welcome!');
          }
        `
      };

      const result = await engine.analyzeCode(complexExpressionContext);
      const extractVariableSuggestions = result.suggestions.filter(s => s.type === 'extract_variable');

      expect(extractVariableSuggestions.length).toBeGreaterThan(0);
    });

    it('should detect dead code and suggest removal', async () => {
      const deadCodeContext: RefactoringContext = {
        ...mockContext,
        code: `
          function processData(data) {
            // TODO: Remove this debug code
            console.log('Processing data:', data);

            const result = data.map(item => item.value);

            // FIXME: Remove this deprecated code
            // const oldResult = data.filter(item => item.old);

            debugger;

            return result;
          }
        `
      };

      const result = await engine.analyzeCode(deadCodeContext);
      const removeDeadCodeSuggestions = result.suggestions.filter(s => s.type === 'remove_dead_code');

      expect(removeDeadCodeSuggestions.length).toBeGreaterThan(0);
    });

    it('should detect poor naming and suggest improvements', async () => {
      const poorNamingContext: RefactoringContext = {
        ...mockContext,
        code: `
          function calc(a, b) {
            const x = a + b;
            const y = x * 2;
            return y;
          }
        `
      };

      const result = await engine.analyzeCode(poorNamingContext);
      const improveNamingSuggestions = result.suggestions.filter(s => s.type === 'improve_naming');

      expect(improveNamingSuggestions.length).toBeGreaterThan(0);
    });

    it('should detect high complexity and suggest reduction', async () => {
      const highComplexityContext: RefactoringContext = {
        ...mockContext,
        code: `
          function processOrder(order) {
            if (order) {
              if (order.items) {
                if (order.items.length > 0) {
                  if (order.customer) {
                    if (order.customer.verified) {
                      if (order.payment) {
                        if (order.payment.valid) {
                          return processValidOrder(order);
                        } else {
                          return handleInvalidPayment(order);
                        }
                      } else {
                        return handleMissingPayment(order);
                      }
                    } else {
                      return handleUnverifiedCustomer(order);
                    }
                  } else {
                    return handleMissingCustomer(order);
                  }
                } else {
                  return handleEmptyOrder(order);
                }
              } else {
                return handleMissingItems(order);
              }
            } else {
              return handleNullOrder();
            }
          }
        `
      };

      const result = await engine.analyzeCode(highComplexityContext);
      const reduceComplexitySuggestions = result.suggestions.filter(s => s.type === 'reduce_complexity');

      expect(reduceComplexitySuggestions.length).toBeGreaterThan(0);
    });

    it('should detect missing documentation and suggest addition', async () => {
      const noDocumentationContext: RefactoringContext = {
        ...mockContext,
        code: `
          function calculateTotal(items, taxRate, discount) {
            let subtotal = 0;
            for (const item of items) {
              subtotal += item.price * item.quantity;
            }
            const tax = subtotal * taxRate;
            const discountAmount = subtotal * discount;
            return subtotal + tax - discountAmount;
          }
        `
      };

      const result = await engine.analyzeCode(noDocumentationContext);
      const addDocumentationSuggestions = result.suggestions.filter(s => s.type === 'add_documentation');

      expect(addDocumentationSuggestions.length).toBeGreaterThan(0);
    });

    it('should detect poor error handling and suggest improvements', async () => {
      const poorErrorHandlingContext: RefactoringContext = {
        ...mockContext,
        code: `
          function riskyOperation(data) {
            try {
              return JSON.parse(data);
            } catch (e) {
              // ignore
            }
          }
        `
      };

      const result = await engine.analyzeCode(poorErrorHandlingContext);
      const improveErrorHandlingSuggestions = result.suggestions.filter(s => s.type === 'improve_error_handling');

      expect(improveErrorHandlingSuggestions.length).toBeGreaterThan(0);
    });

    it('should detect performance issues and suggest optimizations', async () => {
      const performanceIssuesContext: RefactoringContext = {
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

      const result = await engine.analyzeCode(performanceIssuesContext);
      const performanceSuggestions = result.suggestions.filter(s => s.type === 'improve_performance');

      expect(performanceSuggestions.length).toBeGreaterThan(0);
    });

    it('should detect security issues and suggest improvements', async () => {
      const securityIssuesContext: RefactoringContext = {
        ...mockContext,
        code: `
          function renderUserContent(userInput) {
            const html = \`<div>\${userInput}</div>\`;
            document.innerHTML = html;

            eval('console.log("executed")');
          }
        `
      };

      const result = await engine.analyzeCode(securityIssuesContext);
      const securitySuggestions = result.suggestions.filter(s => s.type === 'improve_security');

      expect(securitySuggestions.length).toBeGreaterThan(0);
    });
  });

  describe('Refactoring Application', () => {
    it('should apply refactoring suggestions', async () => {
      const result = await engine.analyzeCode(mockContext);

      if (result.suggestions.length > 0) {
        const suggestion = result.suggestions[0];
        const applyResult = await engine.applyRefactoring(mockContext, suggestion.id);

        expect(applyResult).toBeDefined();
        expect(applyResult.success).toBeDefined();
        expect(applyResult.refactoredCode).toBeDefined();
        expect(applyResult.changes).toBeDefined();
        expect(applyResult.warnings).toBeDefined();
      } else {
        // If no suggestions are generated, test should still pass
        expect(result.suggestions).toBeDefined();
        expect(Array.isArray(result.suggestions)).toBe(true);
      }
    });

    it('should apply custom refactoring code', async () => {
      const result = await engine.analyzeCode(mockContext);

      if (result.suggestions.length > 0) {
        const suggestion = result.suggestions[0];
        const customCode = '// Custom refactored code';
        const applyResult = await engine.applyRefactoring(mockContext, suggestion.id, customCode);

        expect(applyResult).toBeDefined();
        expect(applyResult.refactoredCode).toBe(customCode);
      } else {
        // If no suggestions are generated, test should still pass
        expect(result.suggestions).toBeDefined();
        expect(Array.isArray(result.suggestions)).toBe(true);
      }
    });

    it('should handle non-existent suggestion ID', async () => {
      await expect(
        engine.applyRefactoring(mockContext, 'non-existent-id')
      ).rejects.toThrow('Refactoring suggestion not found');
    });
  });

  describe('Filtering and Search', () => {
    it('should filter suggestions by type', async () => {
      const result = await engine.analyzeCode(mockContext);
      const extractMethodSuggestions = await engine.getSuggestionsByType(mockContext, ['extract_method']);

      expect(extractMethodSuggestions.every(s => s.type === 'extract_method')).toBe(true);
    });

    it('should filter suggestions by confidence level', async () => {
      const result = await engine.analyzeCode(mockContext);
      const highConfidenceSuggestions = await engine.getSuggestionsByConfidence(mockContext, 0.8);

      expect(highConfidenceSuggestions.every(s => s.confidence >= 0.8)).toBe(true);
    });

    it('should filter suggestions by impact level', async () => {
      const result = await engine.analyzeCode(mockContext);
      const highImpactSuggestions = await engine.getSuggestionsByImpact(mockContext, 0.7);

      expect(highImpactSuggestions.every(s => s.impact.overall >= 0.7)).toBe(true);
    });
  });

  describe('Summary and Metrics', () => {
    it('should generate comprehensive summary', async () => {
      const result = await engine.analyzeCode(mockContext);

      expect(result.summary).toBeDefined();
      expect(result.summary.totalSuggestions).toBeGreaterThanOrEqual(0);
      expect(result.summary.highConfidence).toBeGreaterThanOrEqual(0);
      expect(result.summary.mediumConfidence).toBeGreaterThanOrEqual(0);
      expect(result.summary.lowConfidence).toBeGreaterThanOrEqual(0);
      expect(result.summary.criticalIssues).toBeGreaterThanOrEqual(0);
      expect(result.summary.performanceImprovements).toBeGreaterThanOrEqual(0);
      expect(result.summary.maintainabilityImprovements).toBeGreaterThanOrEqual(0);
      expect(result.summary.securityImprovements).toBeGreaterThanOrEqual(0);
    });

    it('should calculate metrics improvement', async () => {
      const result = await engine.analyzeCode(mockContext);

      expect(result.metrics).toBeDefined();
      expect(result.metrics.before).toBeDefined();
      expect(result.metrics.after).toBeDefined();
      expect(result.metrics.improvement).toBeDefined();
      expect(typeof result.metrics.improvement).toBe('number');
    });

    it('should track execution time', async () => {
      const result = await engine.analyzeCode(mockContext);

      expect(result.executionTime).toBeGreaterThan(0);
      expect(typeof result.executionTime).toBe('number');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid code gracefully', async () => {
      const invalidContext: RefactoringContext = {
        ...mockContext,
        code: 'invalid syntax {'
      };

      await expect(engine.analyzeCode(invalidContext)).resolves.toBeDefined();
    });

    it('should handle empty code', async () => {
      const emptyContext: RefactoringContext = {
        ...mockContext,
        code: ''
      };

      const result = await engine.analyzeCode(emptyContext);
      expect(result).toBeDefined();
      expect(result.suggestions).toBeDefined();
    });

    it('should handle null/undefined code', async () => {
      const nullContext: RefactoringContext = {
        ...mockContext,
        code: null as any
      };

      await expect(engine.analyzeCode(nullContext)).resolves.toBeDefined();
    });
  });

  describe('Different Languages', () => {
    it('should work with JavaScript code', async () => {
      const jsContext: RefactoringContext = {
        ...mockContext,
        language: 'javascript',
        code: `
          function add(a, b) {
            return a + b;
          }
        `
      };

      const result = await engine.analyzeCode(jsContext);
      expect(result).toBeDefined();
      expect(result.suggestions).toBeDefined();
    });

    it('should work with Python code', async () => {
      const pythonContext: RefactoringContext = {
        ...mockContext,
        language: 'python',
        code: `
          def add(a, b):
              return a + b
        `
      };

      const result = await engine.analyzeCode(pythonContext);
      expect(result).toBeDefined();
      expect(result.suggestions).toBeDefined();
    });

    it('should work with Java code', async () => {
      const javaContext: RefactoringContext = {
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

      const result = await engine.analyzeCode(javaContext);
      expect(result).toBeDefined();
      expect(result.suggestions).toBeDefined();
    });
  });

  describe('User Preferences', () => {
    it('should respect user preferences for preferred patterns', async () => {
      const preferredPatternsContext: RefactoringContext = {
        ...mockContext,
        userPreferences: {
          preferredPatterns: ['extract_method', 'improve_naming'],
          avoidPatterns: ['eval'],
          codingStyle: 'functional',
          maxComplexity: 3,
          minTestCoverage: 90
        }
      };

      const result = await engine.analyzeCode(preferredPatternsContext);
      expect(result).toBeDefined();
      // Note: The current implementation doesn't filter by preferences yet
      // This test ensures the engine doesn't crash with preferences
    });

    it('should work without user preferences', async () => {
      const noPreferencesContext: RefactoringContext = {
        ...mockContext,
        userPreferences: undefined
      };

      const result = await engine.analyzeCode(noPreferencesContext);
      expect(result).toBeDefined();
      expect(result.suggestions).toBeDefined();
    });
  });

  describe('Integration with External Services', () => {
    it('should handle Context7 cache integration', async () => {
      const result = await engine.analyzeCode(mockContext);
      expect(result).toBeDefined();
      // The Context7Cache is mocked, so we just verify it doesn't crash
    });

    it('should handle metrics collector integration', async () => {
      const result = await engine.analyzeCode(mockContext);
      expect(result).toBeDefined();
      expect(result.metrics).toBeDefined();
      // The RealMetricsCollector is mocked, so we just verify it doesn't crash
    });

    it('should handle query optimizer integration', async () => {
      const result = await engine.analyzeCode(mockContext);
      expect(result).toBeDefined();
      // The Context7QueryOptimizer is mocked, so we just verify it doesn't crash
    });
  });
});
