import { describe, it, expect, beforeEach } from 'vitest';
import { TokenBudgetManager, BudgetRequest, createTokenBudgetManager } from './TokenBudgetManager';

describe('TokenBudgetManager', () => {
  let budgetManager: TokenBudgetManager;

  beforeEach(() => {
    budgetManager = new TokenBudgetManager(
      {
        costPerInputToken: 0.00003,
        costPerOutputToken: 0.00006,
      },
      {
        dailyBudget: 100,
        monthlyBudget: 2000,
      }
    );
  });

  describe('budget approval', () => {
    it('should approve requests within budget', async () => {
      const request: BudgetRequest = {
        requestId: 'test-001',
        toolName: 'smart_begin',
        estimatedInputTokens: 500,
        estimatedOutputTokens: 300,
        priority: 'medium',
      };

      const approval = await budgetManager.requestBudgetApproval(request);

      expect(approval.approved).toBe(true);
      expect(approval.allocatedTokens.input).toBe(500);
      expect(approval.allocatedTokens.output).toBe(300);
      expect(approval.estimatedCost).toBeCloseTo(0.000033, 6); // (500/1000)*0.00003 + (300/1000)*0.00006 = 0.000015 + 0.000018 = 0.000033
    });

    it('should reject requests exceeding daily budget', async () => {
      const expensiveRequest: BudgetRequest = {
        requestId: 'test-002',
        toolName: 'smart_orchestrate',
        estimatedInputTokens: 2000000000, // $60K input cost: (2B/1000)*0.00003 = $60,000
        estimatedOutputTokens: 1000000000, // $60K output cost: (1B/1000)*0.00006 = $60,000
        priority: 'low', // Total: $120,000 >> $100 daily budget
      };

      const approval = await budgetManager.requestBudgetApproval(expensiveRequest);

      expect(approval.approved).toBe(false);
      expect(approval.reason).toContain('daily budget');
      expect(approval.alternatives).toBeDefined();
    });

    it('should allow high priority requests slight overage', async () => {
      // First, consume most of the budget
      const largeRequest: BudgetRequest = {
        requestId: 'setup-001',
        toolName: 'smart_plan',
        estimatedInputTokens: 1600000000, // Large request to consume most budget
        estimatedOutputTokens: 800000000,
        priority: 'medium',
      };
      await budgetManager.requestBudgetApproval(largeRequest);
      budgetManager.recordUsage('setup-001', 1600000000, 800000000);

      // Now try a high priority request that slightly exceeds remaining budget
      const urgentRequest: BudgetRequest = {
        requestId: 'urgent-001',
        toolName: 'smart_finish',
        estimatedInputTokens: 200000,
        estimatedOutputTokens: 100000,
        priority: 'high',
      };

      const approval = await budgetManager.requestBudgetApproval(urgentRequest);

      expect(approval.approved).toBe(true); // Should allow 10% overage for high priority
    });
  });

  describe('usage tracking', () => {
    it('should track actual usage and update statistics', async () => {
      const request: BudgetRequest = {
        requestId: 'track-001',
        toolName: 'smart_write',
        estimatedInputTokens: 1000,
        estimatedOutputTokens: 500,
        priority: 'medium',
      };

      await budgetManager.requestBudgetApproval(request);
      budgetManager.recordUsage('track-001', 800, 600); // Different from estimate

      const dailyUsage = budgetManager.getDailyUsage();
      expect(dailyUsage.totalTokens.input).toBe(800);
      expect(dailyUsage.totalTokens.output).toBe(600);
      expect(dailyUsage.totalTokens.total).toBe(1400);
      expect(dailyUsage.requestCount).toBe(1);
      expect(dailyUsage.averageTokensPerRequest).toBe(1400);
    });

    it('should handle usage for unknown request ID gracefully', () => {
      expect(() => {
        budgetManager.recordUsage('unknown-001', 100, 50);
      }).not.toThrow();
    });
  });

  describe('budget alerts', () => {
    it('should generate warning alerts at 80% usage', async () => {
      // Consume 80% of daily budget
      const request: BudgetRequest = {
        requestId: 'alert-001',
        toolName: 'smart_orchestrate',
        estimatedInputTokens: 1280000000, // Should trigger 80% warning
        estimatedOutputTokens: 640000000,
        priority: 'medium',
      };

      await budgetManager.requestBudgetApproval(request);
      budgetManager.recordUsage('alert-001', 1280000000, 640000000);

      const alerts = budgetManager.getAlerts();
      const warningAlert = alerts.find((alert: any) => alert.type === 'warning');

      expect(warningAlert).toBeDefined();
      expect(warningAlert?.message).toContain('80');
    });

    it('should generate critical alerts at 95% usage', async () => {
      // Consume 95% of daily budget
      const request: BudgetRequest = {
        requestId: 'critical-001',
        toolName: 'smart_plan',
        estimatedInputTokens: 1520000000, // Should trigger 95% critical alert
        estimatedOutputTokens: 760000000,
        priority: 'medium',
      };

      await budgetManager.requestBudgetApproval(request);
      budgetManager.recordUsage('critical-001', 1520000000, 760000000);

      const alerts = budgetManager.getAlerts();
      const criticalAlert = alerts.find((alert: any) => alert.type === 'critical');

      expect(criticalAlert).toBeDefined();
      expect(criticalAlert?.message).toContain('95');
      expect(criticalAlert?.recommendedAction).toContain('Immediate action');
    });
  });

  describe('budget projections', () => {
    it('should calculate remaining budget correctly', () => {
      const remaining = budgetManager.getRemainingBudget();

      expect(remaining.daily).toBe(100);
      expect(remaining.monthly).toBe(2000);
    });

    it('should project usage based on current patterns', async () => {
      // Add some usage to establish a pattern
      const request: BudgetRequest = {
        requestId: 'pattern-001',
        toolName: 'smart_begin',
        estimatedInputTokens: 500,
        estimatedOutputTokens: 250,
        priority: 'medium',
      };

      await budgetManager.requestBudgetApproval(request);
      budgetManager.recordUsage('pattern-001', 500, 250);

      const projections = budgetManager.getProjectedUsage();

      expect(projections.daily).toBeGreaterThan(0);
      expect(projections.monthly).toBeGreaterThan(0);
    });
  });

  describe('alternatives generation', () => {
    it('should provide alternatives for rejected requests', async () => {
      const expensiveRequest: BudgetRequest = {
        requestId: 'expensive-001',
        toolName: 'smart_orchestrate',
        estimatedInputTokens: 5000000000, // Way over budget
        estimatedOutputTokens: 2500000000,
        priority: 'low',
      };

      const approval = await budgetManager.requestBudgetApproval(expensiveRequest);

      expect(approval.approved).toBe(false);
      expect(approval.alternatives).toBeDefined();
      expect(approval.alternatives?.reducedTokens).toBeLessThan(
        expensiveRequest.estimatedInputTokens
      );
      expect(approval.alternatives?.fallbackStrategy).toBeTruthy();
    });
  });

  describe('configuration updates', () => {
    it('should update budget configuration', () => {
      budgetManager.updateBudgetConfig({
        dailyBudget: 200,
        alertThresholds: {
          warning: 0.7,
          critical: 0.9,
        },
      });

      const remaining = budgetManager.getRemainingBudget();
      expect(remaining.daily).toBe(200);
    });

    it('should update cost configuration', () => {
      budgetManager.updateCostConfig({
        costPerInputToken: 0.00005,
        costPerOutputToken: 0.0001,
      });

      // Budget manager should use new costs for future calculations
      expect(budgetManager).toBeDefined(); // Basic check that update doesn't break
    });
  });

  describe('factory function', () => {
    it('should create manager with default configuration', () => {
      const defaultManager = createTokenBudgetManager();
      expect(defaultManager).toBeInstanceOf(TokenBudgetManager);
    });

    it('should create manager with custom configuration', () => {
      const customManager = createTokenBudgetManager(
        { costPerInputToken: 0.00005 },
        { dailyBudget: 50 }
      );
      expect(customManager).toBeInstanceOf(TokenBudgetManager);
    });
  });
});
