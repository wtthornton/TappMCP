#!/usr/bin/env node

/**
 * Token Budget Manager
 *
 * Manages token budgets, cost control, and budget enforcement
 * across all prompt optimization operations.
 *
 * Phase 1, Week 1 - Token Budget Management System
 */

import { z } from 'zod';

/**
 * Cost Configuration Schema
 */
export const CostConfigSchema = z.object({
  model: z.string().default('gpt-4'),
  costPerInputToken: z.number().default(0.00003), // $0.03 per 1K input tokens
  costPerOutputToken: z.number().default(0.00006), // $0.06 per 1K output tokens
  currency: z.string().default('USD'),
});

export type CostConfig = z.infer<typeof CostConfigSchema>;

/**
 * Budget Configuration Schema
 */
export const BudgetConfigSchema = z.object({
  dailyBudget: z.number().min(0).default(100), // $100 per day
  monthlyBudget: z.number().min(0).default(2000), // $2000 per month
  maxTokensPerRequest: z.number().min(100).max(32000).default(4000),
  reservePercentage: z.number().min(0).max(0.5).default(0.2), // 20% reserve
  alertThresholds: z
    .object({
      warning: z.number().min(0).max(1).default(0.8), // 80% usage warning
      critical: z.number().min(0).max(1).default(0.95), // 95% usage critical
    })
    .default({ warning: 0.8, critical: 0.95 }),
});

export type BudgetConfig = z.infer<typeof BudgetConfigSchema>;

/**
 * Usage Statistics
 */
export interface UsageStats {
  period: 'daily' | 'monthly';
  startDate: Date;
  endDate: Date;
  totalTokens: {
    input: number;
    output: number;
    total: number;
  };
  totalCost: number;
  requestCount: number;
  averageTokensPerRequest: number;
  peakUsageHour?: number;
}

/**
 * Budget Alert
 */
export interface BudgetAlert {
  id: string;
  type: 'warning' | 'critical' | 'exceeded';
  message: string;
  timestamp: Date;
  currentUsage: number;
  threshold: number;
  recommendedAction: string;
}

/**
 * Token Budget Request
 */
export interface BudgetRequest {
  requestId: string;
  toolName: string;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  priority: 'low' | 'medium' | 'high';
  maxCost?: number;
}

/**
 * Budget Approval Result
 */
export interface BudgetApproval {
  approved: boolean;
  allocatedTokens: {
    input: number;
    output: number;
  };
  estimatedCost: number;
  reason?: string;
  alternatives?: {
    reducedTokens: number;
    fallbackStrategy: string;
  };
}

/**
 * Token Budget Manager Class
 */
export class TokenBudgetManager {
  private costConfig: CostConfig;
  private budgetConfig: BudgetConfig;
  private dailyUsage: UsageStats;
  private monthlyUsage: UsageStats;
  private alerts: BudgetAlert[];
  private activeAllocations: Map<string, BudgetRequest & BudgetApproval>;

  constructor(costConfig: Partial<CostConfig> = {}, budgetConfig: Partial<BudgetConfig> = {}) {
    this.costConfig = CostConfigSchema.parse(costConfig);
    this.budgetConfig = BudgetConfigSchema.parse(budgetConfig);
    this.dailyUsage = this.initializeUsageStats('daily');
    this.monthlyUsage = this.initializeUsageStats('monthly');
    this.alerts = [];
    this.activeAllocations = new Map();
  }

  /**
   * Request token budget approval
   */
  async requestBudgetApproval(request: BudgetRequest): Promise<BudgetApproval> {
    // Calculate estimated cost
    const estimatedCost = this.calculateCost(
      request.estimatedInputTokens,
      request.estimatedOutputTokens
    );

    // Check if request fits within budget
    const budgetCheck = this.checkBudgetAvailability(estimatedCost, request.priority);

    if (!budgetCheck.available) {
      return {
        approved: false,
        allocatedTokens: { input: 0, output: 0 },
        estimatedCost: 0,
        reason: budgetCheck.reason || 'Budget check failed',
        alternatives: this.generateAlternatives(request),
      };
    }

    // Approve request and allocate budget
    const approval: BudgetApproval = {
      approved: true,
      allocatedTokens: {
        input: request.estimatedInputTokens,
        output: request.estimatedOutputTokens,
      },
      estimatedCost,
    };

    // Track allocation
    this.activeAllocations.set(request.requestId, { ...request, ...approval });

    return approval;
  }

  /**
   * Record actual token usage
   */
  recordUsage(requestId: string, actualInputTokens: number, actualOutputTokens: number): void {
    const allocation = this.activeAllocations.get(requestId);
    if (!allocation) {
      console.warn(`No allocation found for request ${requestId}`);
      return;
    }

    // Calculate actual cost
    const actualCost = this.calculateCost(actualInputTokens, actualOutputTokens);

    // Update usage statistics
    this.updateUsageStats(actualInputTokens, actualOutputTokens, actualCost);

    // Check for budget alerts
    this.checkBudgetAlerts();

    // Remove allocation
    this.activeAllocations.delete(requestId);

    // Log usage for analytics
    this.logUsage(requestId, {
      estimated: {
        input: allocation.estimatedInputTokens,
        output: allocation.estimatedOutputTokens,
        cost: allocation.estimatedCost,
      },
      actual: {
        input: actualInputTokens,
        output: actualOutputTokens,
        cost: actualCost,
      },
      variance: {
        input: actualInputTokens - allocation.estimatedInputTokens,
        output: actualOutputTokens - allocation.estimatedOutputTokens,
        cost: actualCost - allocation.estimatedCost,
      },
    });
  }

  /**
   * Check budget availability
   */
  private checkBudgetAvailability(
    requestedCost: number,
    priority: 'low' | 'medium' | 'high'
  ): { available: boolean; reason?: string } {
    const dailyRemaining = this.budgetConfig.dailyBudget - this.dailyUsage.totalCost;
    const monthlyRemaining = this.budgetConfig.monthlyBudget - this.monthlyUsage.totalCost;

    // Check daily budget
    if (requestedCost > dailyRemaining) {
      if (priority === 'high' && requestedCost <= dailyRemaining * 1.1) {
        // Allow 10% overage for high priority requests
        return { available: true };
      }
      return {
        available: false,
        reason: `Request exceeds daily budget. Remaining: $${dailyRemaining.toFixed(2)}, Requested: $${requestedCost.toFixed(2)}`,
      };
    }

    // Check monthly budget
    if (requestedCost > monthlyRemaining) {
      return {
        available: false,
        reason: `Request exceeds monthly budget. Remaining: $${monthlyRemaining.toFixed(2)}, Requested: $${requestedCost.toFixed(2)}`,
      };
    }

    // Check reserve budget
    const reserveAmount = this.budgetConfig.dailyBudget * this.budgetConfig.reservePercentage;
    const availableForNonCritical = dailyRemaining - reserveAmount;

    if (priority === 'low' && requestedCost > availableForNonCritical) {
      return {
        available: false,
        reason: `Low priority request exceeds available non-reserve budget. Available: $${availableForNonCritical.toFixed(2)}`,
      };
    }

    return { available: true };
  }

  /**
   * Generate alternatives for rejected requests
   */
  private generateAlternatives(request: BudgetRequest): {
    reducedTokens: number;
    fallbackStrategy: string;
  } {
    const dailyRemaining = this.budgetConfig.dailyBudget - this.dailyUsage.totalCost;
    const maxAffordableTokens = Math.floor(dailyRemaining / this.costConfig.costPerInputToken);

    const reducedTokens = Math.min(
      request.estimatedInputTokens * 0.7, // 30% reduction
      maxAffordableTokens
    );

    let fallbackStrategy = 'Reduce prompt complexity and use compression';

    if (reducedTokens < request.estimatedInputTokens * 0.5) {
      fallbackStrategy = 'Use cached responses or defer request to next budget period';
    } else if (reducedTokens < request.estimatedInputTokens * 0.8) {
      fallbackStrategy = 'Apply aggressive prompt compression and remove examples';
    }

    return { reducedTokens: Math.floor(reducedTokens), fallbackStrategy };
  }

  /**
   * Calculate cost for token usage
   */
  private calculateCost(inputTokens: number, outputTokens: number): number {
    const inputCost = (inputTokens / 1000) * this.costConfig.costPerInputToken;
    const outputCost = (outputTokens / 1000) * this.costConfig.costPerOutputToken;
    return inputCost + outputCost;
  }

  /**
   * Update usage statistics
   */
  private updateUsageStats(inputTokens: number, outputTokens: number, cost: number): void {
    // Update daily usage
    this.dailyUsage.totalTokens.input += inputTokens;
    this.dailyUsage.totalTokens.output += outputTokens;
    this.dailyUsage.totalTokens.total += inputTokens + outputTokens;
    this.dailyUsage.totalCost += cost;
    this.dailyUsage.requestCount += 1;
    this.dailyUsage.averageTokensPerRequest =
      this.dailyUsage.totalTokens.total / this.dailyUsage.requestCount;

    // Update monthly usage
    this.monthlyUsage.totalTokens.input += inputTokens;
    this.monthlyUsage.totalTokens.output += outputTokens;
    this.monthlyUsage.totalTokens.total += inputTokens + outputTokens;
    this.monthlyUsage.totalCost += cost;
    this.monthlyUsage.requestCount += 1;
    this.monthlyUsage.averageTokensPerRequest =
      this.monthlyUsage.totalTokens.total / this.monthlyUsage.requestCount;
  }

  /**
   * Check for budget alerts
   */
  private checkBudgetAlerts(): void {
    const dailyUsagePercent = this.dailyUsage.totalCost / this.budgetConfig.dailyBudget;
    const monthlyUsagePercent = this.monthlyUsage.totalCost / this.budgetConfig.monthlyBudget;

    // Check daily budget alerts
    if (dailyUsagePercent >= this.budgetConfig.alertThresholds.critical) {
      this.createAlert('critical', 'daily', dailyUsagePercent);
    } else if (dailyUsagePercent >= this.budgetConfig.alertThresholds.warning) {
      this.createAlert('warning', 'daily', dailyUsagePercent);
    }

    // Check monthly budget alerts
    if (monthlyUsagePercent >= this.budgetConfig.alertThresholds.critical) {
      this.createAlert('critical', 'monthly', monthlyUsagePercent);
    } else if (monthlyUsagePercent >= this.budgetConfig.alertThresholds.warning) {
      this.createAlert('warning', 'monthly', monthlyUsagePercent);
    }
  }

  /**
   * Create budget alert
   */
  private createAlert(
    type: 'warning' | 'critical',
    period: 'daily' | 'monthly',
    usagePercent: number
  ): void {
    const threshold =
      type === 'warning'
        ? this.budgetConfig.alertThresholds.warning
        : this.budgetConfig.alertThresholds.critical;

    const alert: BudgetAlert = {
      id: `${type}_${period}_${Date.now()}`,
      type,
      message: `${period.charAt(0).toUpperCase() + period.slice(1)} budget ${type}: ${(usagePercent * 100).toFixed(1)}% used`,
      timestamp: new Date(),
      currentUsage: usagePercent,
      threshold,
      recommendedAction: this.getRecommendedAction(type, period),
    };

    this.alerts.push(alert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }

  /**
   * Get recommended action for alert
   */
  private getRecommendedAction(type: 'warning' | 'critical', period: 'daily' | 'monthly'): string {
    if (type === 'critical') {
      return `Immediate action required: Consider pausing non-essential operations for remainder of ${period} period`;
    } else {
      return `Monitor usage closely and consider optimizing prompts to reduce token consumption`;
    }
  }

  /**
   * Initialize usage statistics
   */
  private initializeUsageStats(period: 'daily' | 'monthly'): UsageStats {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (period === 'daily') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000 - 1);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    return {
      period,
      startDate,
      endDate,
      totalTokens: { input: 0, output: 0, total: 0 },
      totalCost: 0,
      requestCount: 0,
      averageTokensPerRequest: 0,
    };
  }

  /**
   * Log usage for analytics
   */
  private logUsage(requestId: string, usage: Record<string, unknown>): void {
    // In production, this would write to a logging service
    console.log(`Usage logged for ${requestId}:`, {
      timestamp: new Date().toISOString(),
      ...usage,
    });
  }

  /**
   * Public API methods
   */
  public getDailyUsage(): UsageStats {
    return { ...this.dailyUsage };
  }

  public getMonthlyUsage(): UsageStats {
    return { ...this.monthlyUsage };
  }

  public getAlerts(): BudgetAlert[] {
    return [...this.alerts];
  }

  public getActiveAllocations(): Array<BudgetRequest & BudgetApproval> {
    return Array.from(this.activeAllocations.values());
  }

  public updateBudgetConfig(newConfig: Partial<BudgetConfig>): void {
    this.budgetConfig = BudgetConfigSchema.parse({ ...this.budgetConfig, ...newConfig });
  }

  public updateCostConfig(newConfig: Partial<CostConfig>): void {
    this.costConfig = CostConfigSchema.parse({ ...this.costConfig, ...newConfig });
  }

  public getRemainingBudget(): { daily: number; monthly: number } {
    return {
      daily: Math.max(0, this.budgetConfig.dailyBudget - this.dailyUsage.totalCost),
      monthly: Math.max(0, this.budgetConfig.monthlyBudget - this.monthlyUsage.totalCost),
    };
  }

  public getProjectedUsage(): { daily: number; monthly: number } {
    const dailyProjection =
      this.dailyUsage.requestCount > 0
        ? (this.dailyUsage.totalCost / this.dailyUsage.requestCount) *
          this.estimateRemainingRequests('daily')
        : 0;

    const monthlyProjection =
      this.monthlyUsage.requestCount > 0
        ? (this.monthlyUsage.totalCost / this.monthlyUsage.requestCount) *
          this.estimateRemainingRequests('monthly')
        : 0;

    return { daily: dailyProjection, monthly: monthlyProjection };
  }

  private estimateRemainingRequests(period: 'daily' | 'monthly'): number {
    // Simple estimation based on current usage pattern
    const usage = period === 'daily' ? this.dailyUsage : this.monthlyUsage;
    const now = new Date();
    const elapsedHours = (now.getTime() - usage.startDate.getTime()) / (1000 * 60 * 60);
    const totalHours =
      period === 'daily' ? 24 : 24 * new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    if (elapsedHours === 0) return 0;

    const requestsPerHour = usage.requestCount / elapsedHours;
    const remainingHours = totalHours - elapsedHours;

    return Math.max(0, requestsPerHour * remainingHours);
  }

  /**
   * Reset statistics for new period
   */
  public resetDailyUsage(): void {
    this.dailyUsage = this.initializeUsageStats('daily');
  }

  public resetMonthlyUsage(): void {
    this.monthlyUsage = this.initializeUsageStats('monthly');
  }
}

// Export factory function
export function createTokenBudgetManager(
  costConfig?: Partial<CostConfig>,
  budgetConfig?: Partial<BudgetConfig>
): TokenBudgetManager {
  return new TokenBudgetManager(costConfig, budgetConfig);
}
