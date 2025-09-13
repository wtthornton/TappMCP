/**
 * Context Analyzer
 *
 * Analyzes context and user behavior to provide intelligent
 * notification filtering and prioritization.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import { Notification, NotificationCategory, NotificationType, NotificationPriority } from '../types.js';

/**
 * Context Data
 *
 * @since 2.0.0
 */
export interface ContextData {
  /** Current user session */
  userSession?: {
    userId: string;
    role: string;
    permissions: string[];
    lastActive: Date;
  };
  /** Current workflow context */
  workflowContext?: {
    workflowId: string;
    phase: string;
    status: string;
    progress: number;
  };
  /** System context */
  systemContext?: {
    status: 'healthy' | 'degraded' | 'unhealthy' | 'maintenance';
    load: number;
    memoryUsage: number;
    errorRate: number;
  };
  /** Time context */
  timeContext?: {
    hour: number;
    dayOfWeek: number;
    isBusinessHours: boolean;
    isWeekend: boolean;
  };
  /** Historical context */
  historicalContext?: {
    recentNotifications: Notification[];
    userEngagement: Record<string, number>;
    notificationPreferences: Record<string, any>;
  };
}

/**
 * Context Analysis Result
 *
 * @since 2.0.0
 */
export interface ContextAnalysisResult {
  /** Relevance score for notification */
  relevanceScore: number;
  /** Recommended priority adjustment */
  priorityAdjustment: number;
  /** Context-based recommendations */
  recommendations: string[];
  /** Risk factors */
  riskFactors: string[];
  /** Opportunities */
  opportunities: string[];
}

/**
 * User Behavior Pattern
 *
 * @since 2.0.0
 */
export interface UserBehaviorPattern {
  /** User ID */
  userId: string;
  /** Preferred notification times */
  preferredTimes: number[];
  /** Preferred categories */
  preferredCategories: NotificationCategory[];
  /** Preferred types */
  preferredTypes: NotificationType[];
  /** Engagement patterns */
  engagementPatterns: {
    category: NotificationCategory;
    engagementRate: number;
    averageResponseTime: number;
  }[];
  /** Notification fatigue indicators */
  fatigueIndicators: {
    recentNotificationCount: number;
    averageTimeBetweenNotifications: number;
    lastEngagementTime: Date;
  };
}

/**
 * Context Analyzer
 *
 * Analyzes context and user behavior to provide intelligent
 * notification filtering and prioritization.
 *
 * @example
 * ```typescript
 * const analyzer = new ContextAnalyzer();
 * const result = analyzer.analyzeContext(notification, context);
 * ```
 *
 * @since 2.0.0
 */
export class ContextAnalyzer {
  private static readonly RELEVANCE_WEIGHTS = {
    userRole: 0.3,
    workflowPhase: 0.25,
    systemStatus: 0.2,
    timeContext: 0.15,
    historicalPatterns: 0.1
  };

  private static readonly PRIORITY_ADJUSTMENTS = {
    critical: 0,
    high: 0.1,
    medium: 0.2,
    low: 0.3
  };

  private static readonly ENGAGEMENT_THRESHOLDS = {
    high: 0.8,
    medium: 0.5,
    low: 0.2
  };

  /**
   * Analyzes context for a notification
   *
   * @param notification - Notification to analyze
   * @param context - Context data
   * @returns Context analysis result
   *
   * @example
   * ```typescript
   * const result = analyzer.analyzeContext(notification, context);
   * ```
   */
  analyzeContext(notification: Notification, context: ContextData): ContextAnalysisResult {
    const relevanceScore = this.calculateRelevanceScore(notification, context);
    const priorityAdjustment = this.calculatePriorityAdjustment(notification, context);
    const recommendations = this.generateRecommendations(notification, context);
    const riskFactors = this.identifyRiskFactors(notification, context);
    const opportunities = this.identifyOpportunities(notification, context);

    return {
      relevanceScore,
      priorityAdjustment,
      recommendations,
      riskFactors,
      opportunities
    };
  }

  /**
   * Analyzes user behavior patterns
   *
   * @param userId - User ID
   * @param notifications - User's notification history
   * @returns Behavior pattern
   *
   * @example
   * ```typescript
   * const pattern = analyzer.analyzeUserBehavior(userId, notifications);
   * ```
   */
  analyzeUserBehavior(userId: string, notifications: Notification[]): UserBehaviorPattern {
    const preferredTimes = this.extractPreferredTimes(notifications);
    const preferredCategories = this.extractPreferredCategories(notifications);
    const preferredTypes = this.extractPreferredTypes(notifications);
    const engagementPatterns = this.analyzeEngagementPatterns(notifications);
    const fatigueIndicators = this.analyzeFatigueIndicators(notifications);

    return {
      userId,
      preferredTimes,
      preferredCategories,
      preferredTypes,
      engagementPatterns,
      fatigueIndicators
    };
  }

  /**
   * Calculates relevance score based on context
   *
   * @param notification - Notification to score
   * @param context - Context data
   * @returns Relevance score (0-1)
   *
   * @example
   * ```typescript
   * const score = analyzer.calculateRelevanceScore(notification, context);
   * ```
   */
  private calculateRelevanceScore(notification: Notification, context: ContextData): number {
    let score = 0;

    // User role relevance
    if (context.userSession) {
      score += this.calculateUserRoleRelevance(notification, context.userSession) * ContextAnalyzer.RELEVANCE_WEIGHTS.userRole;
    }

    // Workflow context relevance
    if (context.workflowContext) {
      score += this.calculateWorkflowRelevance(notification, context.workflowContext) * ContextAnalyzer.RELEVANCE_WEIGHTS.workflowPhase;
    }

    // System context relevance
    if (context.systemContext) {
      score += this.calculateSystemRelevance(notification, context.systemContext) * ContextAnalyzer.RELEVANCE_WEIGHTS.systemStatus;
    }

    // Time context relevance
    if (context.timeContext) {
      score += this.calculateTimeRelevance(notification, context.timeContext) * ContextAnalyzer.RELEVANCE_WEIGHTS.timeContext;
    }

    // Historical patterns relevance
    if (context.historicalContext) {
      score += this.calculateHistoricalRelevance(notification, context.historicalContext) * ContextAnalyzer.RELEVANCE_WEIGHTS.historicalPatterns;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calculates user role relevance
   *
   * @param notification - Notification to score
   * @param userSession - User session data
   * @returns Relevance score (0-1)
   *
   * @example
   * ```typescript
   * const score = analyzer.calculateUserRoleRelevance(notification, userSession);
   * ```
   */
  private calculateUserRoleRelevance(notification: Notification, userSession: { userId: string; role: string; permissions: string[]; lastActive: Date }): number {
    let score = 0;

    // Role-based relevance
    if (notification.category === 'workflow' && userSession.role === 'developer') {
      score += 0.8;
    } else if (notification.category === 'system' && userSession.role === 'admin') {
      score += 0.9;
    } else if (notification.category === 'business' && userSession.role === 'manager') {
      score += 0.7;
    }

    // Permission-based relevance
    if (notification.metadata?.requiresPermission) {
      const hasPermission = userSession.permissions.includes(notification.metadata.requiresPermission);
      score += hasPermission ? 0.5 : -0.3;
    }

    // Activity-based relevance
    const timeSinceLastActive = Date.now() - userSession.lastActive.getTime();
    const hoursSinceActive = timeSinceLastActive / (1000 * 60 * 60);

    if (hoursSinceActive < 1) {
      score += 0.2; // Very active user
    } else if (hoursSinceActive < 24) {
      score += 0.1; // Recently active
    } else {
      score -= 0.1; // Inactive user
    }

    return Math.max(0, Math.min(score, 1.0));
  }

  /**
   * Calculates workflow context relevance
   *
   * @param notification - Notification to score
   * @param workflowContext - Workflow context
   * @returns Relevance score (0-1)
   *
   * @example
   * ```typescript
   * const score = analyzer.calculateWorkflowRelevance(notification, workflowContext);
   * ```
   */
  private calculateWorkflowRelevance(notification: Notification, workflowContext: { workflowId: string; phase: string; status: string; progress: number }): number {
    let score = 0;

    // Workflow-specific notifications
    if (notification.metadata?.workflowId === workflowContext.workflowId) {
      score += 0.9;
    }

    // Phase-specific relevance
    if (notification.metadata?.phase === workflowContext.phase) {
      score += 0.7;
    }

    // Status-based relevance
    if (workflowContext.status === 'running' && notification.type === 'info') {
      score += 0.6;
    } else if (workflowContext.status === 'failed' && notification.type === 'error') {
      score += 0.8;
    } else if (workflowContext.status === 'completed' && notification.type === 'success') {
      score += 0.7;
    }

    // Progress-based relevance
    if (workflowContext.progress > 0.8 && notification.type === 'success') {
      score += 0.5;
    } else if (workflowContext.progress < 0.2 && notification.type === 'warning') {
      score += 0.4;
    }

    return Math.max(0, Math.min(score, 1.0));
  }

  /**
   * Calculates system context relevance
   *
   * @param notification - Notification to score
   * @param systemContext - System context
   * @returns Relevance score (0-1)
   *
   * @example
   * ```typescript
   * const score = analyzer.calculateSystemRelevance(notification, systemContext);
   * ```
   */
  private calculateSystemRelevance(notification: Notification, systemContext: { status: string; load: number; memoryUsage: number; errorRate: number }): number {
    let score = 0;

    // System status relevance
    if (notification.category === 'system') {
      if (systemContext.status === 'unhealthy' && notification.type === 'error') {
        score += 0.9;
      } else if (systemContext.status === 'degraded' && notification.type === 'warning') {
        score += 0.7;
      } else if (systemContext.status === 'healthy' && notification.type === 'success') {
        score += 0.6;
      }
    }

    // Performance relevance
    if (notification.category === 'performance') {
      if (systemContext.load > 0.8 && notification.type === 'warning') {
        score += 0.8;
      } else if (systemContext.memoryUsage > 0.9 && notification.type === 'error') {
        score += 0.9;
      } else if (systemContext.errorRate > 0.1 && notification.type === 'error') {
        score += 0.8;
      }
    }

    return Math.max(0, Math.min(score, 1.0));
  }

  /**
   * Calculates time context relevance
   *
   * @param notification - Notification to score
   * @param timeContext - Time context
   * @returns Relevance score (0-1)
   *
   * @example
   * ```typescript
   * const score = analyzer.calculateTimeRelevance(notification, timeContext);
   * ```
   */
  private calculateTimeRelevance(notification: Notification, timeContext: { hour: number; dayOfWeek: number; isBusinessHours: boolean; isWeekend: boolean }): number {
    let score = 0;

    // Business hours relevance
    if (timeContext.isBusinessHours) {
      score += 0.3;
    } else if (timeContext.isWeekend) {
      score -= 0.2;
    }

    // Time-based relevance
    if (timeContext.hour >= 9 && timeContext.hour <= 17) {
      score += 0.2; // Business hours
    } else if (timeContext.hour >= 18 && timeContext.hour <= 22) {
      score += 0.1; // Evening hours
    } else {
      score -= 0.1; // Off hours
    }

    // Day of week relevance
    if (timeContext.dayOfWeek >= 1 && timeContext.dayOfWeek <= 5) {
      score += 0.1; // Weekdays
    } else {
      score -= 0.1; // Weekend
    }

    return Math.max(0, Math.min(score, 1.0));
  }

  /**
   * Calculates historical relevance
   *
   * @param notification - Notification to score
   * @param historicalContext - Historical context
   * @returns Relevance score (0-1)
   *
   * @example
   * ```typescript
   * const score = analyzer.calculateHistoricalRelevance(notification, historicalContext);
   * ```
   */
  private calculateHistoricalRelevance(notification: Notification, historicalContext: { recentNotifications: Notification[]; userEngagement: Record<string, number>; notificationPreferences: Record<string, any> }): number {
    let score = 0;

    // Recent notification patterns
    const recentCount = historicalContext.recentNotifications.length;
    if (recentCount > 10) {
      score -= 0.2; // Too many recent notifications
    } else if (recentCount < 3) {
      score += 0.1; // Few recent notifications
    }

    // User engagement patterns
    const categoryEngagement = historicalContext.userEngagement[notification.category] || 0;
    if (categoryEngagement > ContextAnalyzer.ENGAGEMENT_THRESHOLDS.high) {
      score += 0.3;
    } else if (categoryEngagement > ContextAnalyzer.ENGAGEMENT_THRESHOLDS.medium) {
      score += 0.2;
    } else if (categoryEngagement < ContextAnalyzer.ENGAGEMENT_THRESHOLDS.low) {
      score -= 0.1;
    }

    // Notification preferences
    if (historicalContext.notificationPreferences[notification.category] === false) {
      score -= 0.5;
    } else if (historicalContext.notificationPreferences[notification.category] === true) {
      score += 0.2;
    }

    return Math.max(0, Math.min(score, 1.0));
  }

  /**
   * Calculates priority adjustment based on context
   *
   * @param notification - Notification to adjust
   * @param context - Context data
   * @returns Priority adjustment (-1 to 1)
   *
   * @example
   * ```typescript
   * const adjustment = analyzer.calculatePriorityAdjustment(notification, context);
   * ```
   */
  private calculatePriorityAdjustment(notification: Notification, context: ContextData): number {
    let adjustment = 0;

    // Base adjustment from priority
    adjustment += ContextAnalyzer.PRIORITY_ADJUSTMENTS[notification.priority];

    // Context-based adjustments
    if (context.userSession?.role === 'admin' && notification.category === 'system') {
      adjustment += 0.2;
    }

    if (context.workflowContext?.status === 'failed' && notification.type === 'error') {
      adjustment += 0.3;
    }

    if (context.systemContext?.status === 'unhealthy' && notification.category === 'system') {
      adjustment += 0.4;
    }

    if (context.timeContext?.isWeekend && notification.priority === 'low') {
      adjustment -= 0.2;
    }

    return Math.max(-1, Math.min(adjustment, 1));
  }

  /**
   * Generates context-based recommendations
   *
   * @param notification - Notification to analyze
   * @param context - Context data
   * @returns Recommendations
   *
   * @example
   * ```typescript
   * const recommendations = analyzer.generateRecommendations(notification, context);
   * ```
   */
  private generateRecommendations(notification: Notification, context: ContextData): string[] {
    const recommendations: string[] = [];

    // User role recommendations
    if (context.userSession?.role === 'developer' && notification.category === 'workflow') {
      recommendations.push('Consider showing this notification prominently as it relates to active development work');
    }

    // Workflow phase recommendations
    if (context.workflowContext?.phase === 'testing' && notification.type === 'error') {
      recommendations.push('This error notification is highly relevant during the testing phase');
    }

    // System status recommendations
    if (context.systemContext?.status === 'unhealthy' && notification.category === 'system') {
      recommendations.push('System is unhealthy - prioritize this notification for immediate attention');
    }

    // Time-based recommendations
    if (context.timeContext?.isWeekend && notification.priority === 'low') {
      recommendations.push('Consider delaying this notification until business hours');
    }

    // Historical pattern recommendations
    if (context.historicalContext?.userEngagement[notification.category] < ContextAnalyzer.ENGAGEMENT_THRESHOLDS.low) {
      recommendations.push('User has low engagement with this category - consider alternative notification approach');
    }

    return recommendations;
  }

  /**
   * Identifies risk factors
   *
   * @param notification - Notification to analyze
   * @param context - Context data
   * @returns Risk factors
   *
   * @example
   * ```typescript
   * const risks = analyzer.identifyRiskFactors(notification, context);
   * ```
   */
  private identifyRiskFactors(notification: Notification, context: ContextData): string[] {
    const risks: string[] = [];

    // Notification fatigue
    if (context.historicalContext?.recentNotifications.length > 15) {
      risks.push('High notification volume may cause user fatigue');
    }

    // Critical notification during off hours
    if (notification.priority === 'critical' && context.timeContext?.isWeekend) {
      risks.push('Critical notification during off hours may not be noticed');
    }

    // System overload
    if (context.systemContext?.load > 0.9 && notification.category === 'performance') {
      risks.push('System is overloaded - additional notifications may worsen the situation');
    }

    // User inactivity
    if (context.userSession && Date.now() - context.userSession.lastActive.getTime() > 24 * 60 * 60 * 1000) {
      risks.push('User has been inactive for over 24 hours - notification may not be seen');
    }

    return risks;
  }

  /**
   * Identifies opportunities
   *
   * @param notification - Notification to analyze
   * @param context - Context data
   * @returns Opportunities
   *
   * @example
   * ```typescript
   * const opportunities = analyzer.identifyOpportunities(notification, context);
   * ```
   */
  private identifyOpportunities(notification: Notification, context: ContextData): string[] {
    const opportunities: string[] = [];

    // High engagement opportunity
    if (context.historicalContext?.userEngagement[notification.category] > ContextAnalyzer.ENGAGEMENT_THRESHOLDS.high) {
      opportunities.push('User has high engagement with this category - good opportunity for interaction');
    }

    // Workflow completion opportunity
    if (context.workflowContext?.progress > 0.9 && notification.type === 'success') {
      opportunities.push('Workflow is nearly complete - good time for celebration notification');
    }

    // System recovery opportunity
    if (context.systemContext?.status === 'healthy' && notification.category === 'system') {
      opportunities.push('System is healthy - good time for positive reinforcement');
    }

    // Business hours opportunity
    if (context.timeContext?.isBusinessHours && notification.priority === 'medium') {
      opportunities.push('Business hours - good time for non-critical notifications');
    }

    return opportunities;
  }

  /**
   * Extracts preferred times from notification history
   *
   * @param notifications - Notification history
   * @returns Preferred hours
   *
   * @example
   * ```typescript
   * const times = analyzer.extractPreferredTimes(notifications);
   * ```
   */
  private extractPreferredTimes(notifications: Notification[]): number[] {
    const hourCounts = new Map<number, number>();

    for (const notification of notifications) {
      const hour = notification.createdAt.getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    }

    // Return hours with above-average activity
    const average = notifications.length / 24;
    return Array.from(hourCounts.entries())
      .filter(([_, count]) => count > average)
      .map(([hour, _]) => hour)
      .sort((a, b) => a - b);
  }

  /**
   * Extracts preferred categories from notification history
   *
   * @param notifications - Notification history
   * @returns Preferred categories
   *
   * @example
   * ```typescript
   * const categories = analyzer.extractPreferredCategories(notifications);
   * ```
   */
  private extractPreferredCategories(notifications: Notification[]): NotificationCategory[] {
    const categoryCounts = new Map<NotificationCategory, number>();

    for (const notification of notifications) {
      categoryCounts.set(notification.category, (categoryCounts.get(notification.category) || 0) + 1);
    }

    // Return categories with above-average activity
    const average = notifications.length / Object.keys(categoryCounts).length;
    return Array.from(categoryCounts.entries())
      .filter(([_, count]) => count > average)
      .map(([category, _]) => category);
  }

  /**
   * Extracts preferred types from notification history
   *
   * @param notifications - Notification history
   * @returns Preferred types
   *
   * @example
   * ```typescript
   * const types = analyzer.extractPreferredTypes(notifications);
   * ```
   */
  private extractPreferredTypes(notifications: Notification[]): NotificationType[] {
    const typeCounts = new Map<NotificationType, number>();

    for (const notification of notifications) {
      typeCounts.set(notification.type, (typeCounts.get(notification.type) || 0) + 1);
    }

    // Return types with above-average activity
    const average = notifications.length / Object.keys(typeCounts).length;
    return Array.from(typeCounts.entries())
      .filter(([_, count]) => count > average)
      .map(([type, _]) => type);
  }

  /**
   * Analyzes engagement patterns
   *
   * @param notifications - Notification history
   * @returns Engagement patterns
   *
   * @example
   * ```typescript
   * const patterns = analyzer.analyzeEngagementPatterns(notifications);
   * ```
   */
  private analyzeEngagementPatterns(notifications: Notification[]): { category: NotificationCategory; engagementRate: number; averageResponseTime: number }[] {
    const categoryEngagement = new Map<NotificationCategory, { total: number; engaged: number; responseTimes: number[] }>();

    for (const notification of notifications) {
      const category = notification.category;
      const engagement = categoryEngagement.get(category) || { total: 0, engaged: 0, responseTimes: [] };

      engagement.total++;

      // Simple engagement detection - in production, this would be more sophisticated
      if (notification.metadata?.userEngaged) {
        engagement.engaged++;
        if (notification.metadata.responseTime) {
          engagement.responseTimes.push(notification.metadata.responseTime);
        }
      }

      categoryEngagement.set(category, engagement);
    }

    return Array.from(categoryEngagement.entries()).map(([category, data]) => ({
      category,
      engagementRate: data.total > 0 ? data.engaged / data.total : 0,
      averageResponseTime: data.responseTimes.length > 0
        ? data.responseTimes.reduce((a, b) => a + b, 0) / data.responseTimes.length
        : 0
    }));
  }

  /**
   * Analyzes fatigue indicators
   *
   * @param notifications - Notification history
   * @returns Fatigue indicators
   *
   * @example
   * ```typescript
   * const fatigue = analyzer.analyzeFatigueIndicators(notifications);
   * ```
   */
  private analyzeFatigueIndicators(notifications: Notification[]): { recentNotificationCount: number; averageTimeBetweenNotifications: number; lastEngagementTime: Date } {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentNotifications = notifications.filter(n => n.createdAt >= oneDayAgo);

    // Calculate average time between notifications
    let totalTimeBetween = 0;
    let timeBetweenCount = 0;

    for (let i = 1; i < notifications.length; i++) {
      const timeBetween = notifications[i].createdAt.getTime() - notifications[i - 1].createdAt.getTime();
      totalTimeBetween += timeBetween;
      timeBetweenCount++;
    }

    const averageTimeBetween = timeBetweenCount > 0 ? totalTimeBetween / timeBetweenCount : 0;

    // Find last engagement time
    const lastEngagement = notifications
      .filter(n => n.metadata?.userEngaged)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    return {
      recentNotificationCount: recentNotifications.length,
      averageTimeBetweenNotifications: averageTimeBetween,
      lastEngagementTime: lastEngagement?.createdAt || new Date(0)
    };
  }
}
