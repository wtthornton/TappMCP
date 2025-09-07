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
export declare const CostConfigSchema: z.ZodObject<{
    model: z.ZodDefault<z.ZodString>;
    costPerInputToken: z.ZodDefault<z.ZodNumber>;
    costPerOutputToken: z.ZodDefault<z.ZodNumber>;
    currency: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    model: string;
    costPerInputToken: number;
    costPerOutputToken: number;
    currency: string;
}, {
    model?: string | undefined;
    costPerInputToken?: number | undefined;
    costPerOutputToken?: number | undefined;
    currency?: string | undefined;
}>;
export type CostConfig = z.infer<typeof CostConfigSchema>;
/**
 * Budget Configuration Schema
 */
export declare const BudgetConfigSchema: z.ZodObject<{
    dailyBudget: z.ZodDefault<z.ZodNumber>;
    monthlyBudget: z.ZodDefault<z.ZodNumber>;
    maxTokensPerRequest: z.ZodDefault<z.ZodNumber>;
    reservePercentage: z.ZodDefault<z.ZodNumber>;
    alertThresholds: z.ZodDefault<z.ZodObject<{
        warning: z.ZodDefault<z.ZodNumber>;
        critical: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        warning: number;
        critical: number;
    }, {
        warning?: number | undefined;
        critical?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    dailyBudget: number;
    monthlyBudget: number;
    maxTokensPerRequest: number;
    reservePercentage: number;
    alertThresholds: {
        warning: number;
        critical: number;
    };
}, {
    dailyBudget?: number | undefined;
    monthlyBudget?: number | undefined;
    maxTokensPerRequest?: number | undefined;
    reservePercentage?: number | undefined;
    alertThresholds?: {
        warning?: number | undefined;
        critical?: number | undefined;
    } | undefined;
}>;
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
export declare class TokenBudgetManager {
    private costConfig;
    private budgetConfig;
    private dailyUsage;
    private monthlyUsage;
    private alerts;
    private activeAllocations;
    constructor(costConfig?: Partial<CostConfig>, budgetConfig?: Partial<BudgetConfig>);
    /**
     * Request token budget approval
     */
    requestBudgetApproval(request: BudgetRequest): Promise<BudgetApproval>;
    /**
     * Record actual token usage
     */
    recordUsage(requestId: string, actualInputTokens: number, actualOutputTokens: number): void;
    /**
     * Check budget availability
     */
    private checkBudgetAvailability;
    /**
     * Generate alternatives for rejected requests
     */
    private generateAlternatives;
    /**
     * Calculate cost for token usage
     */
    private calculateCost;
    /**
     * Update usage statistics
     */
    private updateUsageStats;
    /**
     * Check for budget alerts
     */
    private checkBudgetAlerts;
    /**
     * Create budget alert
     */
    private createAlert;
    /**
     * Get recommended action for alert
     */
    private getRecommendedAction;
    /**
     * Initialize usage statistics
     */
    private initializeUsageStats;
    /**
     * Log usage for analytics
     */
    private logUsage;
    /**
     * Public API methods
     */
    getDailyUsage(): UsageStats;
    getMonthlyUsage(): UsageStats;
    getAlerts(): BudgetAlert[];
    getActiveAllocations(): Array<BudgetRequest & BudgetApproval>;
    updateBudgetConfig(newConfig: Partial<BudgetConfig>): void;
    updateCostConfig(newConfig: Partial<CostConfig>): void;
    getRemainingBudget(): {
        daily: number;
        monthly: number;
    };
    getProjectedUsage(): {
        daily: number;
        monthly: number;
    };
    private estimateRemainingRequests;
    /**
     * Reset statistics for new period
     */
    resetDailyUsage(): void;
    resetMonthlyUsage(): void;
}
export declare function createTokenBudgetManager(costConfig?: Partial<CostConfig>, budgetConfig?: Partial<BudgetConfig>): TokenBudgetManager;
//# sourceMappingURL=TokenBudgetManager.d.ts.map