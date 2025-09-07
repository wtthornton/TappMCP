import { describe, it, expect, beforeEach } from 'vitest';
import {
  PromptOptimizer,
  createPromptOptimizer,
  OptimizationRequest,
  OptimizationStrategy,
} from './PromptOptimizer';
import { TokenBudgetManager } from './TokenBudgetManager';
import { ContextAwareTemplateEngine } from './ContextAwareTemplateEngine';

describe('PromptOptimizer', () => {
  let optimizer: PromptOptimizer;
  let budgetManager: TokenBudgetManager;
  let templateEngine: ContextAwareTemplateEngine;

  beforeEach(() => {
    budgetManager = new TokenBudgetManager();
    templateEngine = new ContextAwareTemplateEngine();
    optimizer = new PromptOptimizer(budgetManager, templateEngine);
  });

  describe('optimization strategies', () => {
    it('should apply compression strategy', async () => {
      const request: OptimizationRequest = {
        toolName: 'smart_begin',
        originalPrompt:
          'Please create a detailed implementation of a complex function with multiple parameters and comprehensive error handling.',
        context: {
          taskType: 'generation',
          userLevel: 'intermediate',
          outputFormat: 'code',
          timeConstraint: 'standard',
        },
        targetReduction: 0.3,
        maxTokens: 1000,
      };

      const result = await optimizer.optimize(request);

      expect(result.success).toBe(true);
      expect(result.optimizedPrompt.length).toBeLessThan(request.originalPrompt.length);
      expect(result.tokenReduction).toBeGreaterThan(0);
      expect(result.strategy).toBe('compression');
    });

    it('should apply template-based strategy for known tools', async () => {
      const request: OptimizationRequest = {
        toolName: 'smart_begin',
        originalPrompt: 'Create a function that handles user authentication',
        context: {
          taskType: 'generation',
          userLevel: 'advanced',
          outputFormat: 'code',
          timeConstraint: 'standard',
        },
        targetReduction: 0.4,
      };

      const result = await optimizer.optimize(request);

      expect(result.success).toBe(true);
      expect(result.strategy).toBe('template-based');
      expect(result.qualityScore).toBeGreaterThanOrEqual(80);
    });

    it('should handle context-aware optimization', async () => {
      const request: OptimizationRequest = {
        toolName: 'smart_plan',
        originalPrompt: 'Plan a comprehensive project for building a web application',
        context: {
          taskType: 'planning',
          userLevel: 'beginner',
          outputFormat: 'structured',
          timeConstraint: 'thorough',
          constraints: ['budget', 'timeline'],
        },
        targetReduction: 0.2,
      };

      const result = await optimizer.optimize(request);

      expect(result.success).toBe(true);
      expect(result.strategy).toBe('context-aware');
      expect(result.optimizedPrompt.toLowerCase()).toContain('plan');
    });
  });

  describe('budget integration', () => {
    it('should respect token budget limits', async () => {
      const request: OptimizationRequest = {
        toolName: 'smart_write',
        originalPrompt:
          'Write a very comprehensive, detailed, thorough, and extensive explanation with many examples and comprehensive coverage of all aspects'.repeat(
            20
          ),
        context: {
          taskType: 'generation',
          userLevel: 'intermediate',
          outputFormat: 'text',
          timeConstraint: 'immediate',
        },
        maxTokens: 500,
      };

      const result = await optimizer.optimize(request);

      expect(result.success).toBe(true);
      expect(result.estimatedTokens).toBeLessThanOrEqual(500);
    });

    it('should handle budget approval failures gracefully', async () => {
      // Set very low budget to force failure
      budgetManager.updateBudgetConfig({ dailyBudget: 0.01 });

      const request: OptimizationRequest = {
        toolName: 'smart_orchestrate',
        originalPrompt: 'Create a complex orchestration plan',
        context: {
          taskType: 'generation',
          userLevel: 'advanced',
          outputFormat: 'structured',
          timeConstraint: 'standard',
        },
      };

      const result = await optimizer.optimize(request);

      expect(result.success).toBe(false);
      expect(result.reason).toContain('budget');
    });
  });

  describe('quality preservation', () => {
    it('should maintain quality scores above threshold', async () => {
      const request: OptimizationRequest = {
        toolName: 'smart_finish',
        originalPrompt: 'Finalize the project implementation with proper testing and documentation',
        context: {
          taskType: 'generation',
          userLevel: 'advanced',
          outputFormat: 'code',
          timeConstraint: 'standard',
        },
        qualityThreshold: 85,
      };

      const result = await optimizer.optimize(request);

      expect(result.success).toBe(true);
      expect(result.qualityScore).toBeGreaterThanOrEqual(85);
    });

    it('should provide fallback when quality drops too low', async () => {
      const request: OptimizationRequest = {
        toolName: 'custom_tool',
        originalPrompt: 'Short prompt',
        context: {
          taskType: 'generation',
          userLevel: 'beginner',
          outputFormat: 'text',
          timeConstraint: 'immediate',
        },
        targetReduction: 0.9, // Aggressive reduction
        qualityThreshold: 90,
      };

      const result = await optimizer.optimize(request);

      if (!result.success) {
        expect(result.fallback).toBeDefined();
        expect(result.fallback?.qualityScore).toBeGreaterThan(result.qualityScore || 0);
      }
    });
  });

  describe('analytics and tracking', () => {
    it('should track optimization performance', async () => {
      const request: OptimizationRequest = {
        toolName: 'smart_begin',
        originalPrompt: 'Create a test function with proper error handling',
        context: {
          taskType: 'generation',
          userLevel: 'intermediate',
          outputFormat: 'code',
          timeConstraint: 'standard',
        },
      };

      await optimizer.optimize(request);
      const analytics = optimizer.getAnalytics();

      expect(analytics.totalOptimizations).toBeGreaterThan(0);
      expect(analytics.averageReduction).toBeGreaterThan(0);
      expect(analytics.strategyDistribution).toBeDefined();
    });
  });

  describe('factory function', () => {
    it('should create optimizer with default configuration', () => {
      const defaultOptimizer = createPromptOptimizer();
      expect(defaultOptimizer).toBeInstanceOf(PromptOptimizer);
    });

    it('should create optimizer with custom configuration', () => {
      const customOptimizer = createPromptOptimizer({
        budgetConfig: { dailyBudget: 50 },
        optimizationConfig: { defaultStrategy: 'adaptive' },
      });
      expect(customOptimizer).toBeInstanceOf(PromptOptimizer);
    });
  });
});
