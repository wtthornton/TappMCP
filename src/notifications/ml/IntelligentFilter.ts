/**
 * Intelligent Filter
 *
 * Advanced notification filtering using machine learning and context analysis.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import { Notification, NotificationPriority, NotificationCategory, NotificationType } from '../types.js';
import { NotificationFilter, FilterCriteria, FilterResult, UserNotificationPreferences } from './NotificationFilter.js';
import { ContextAnalyzer, ContextData, ContextAnalysisResult, UserBehaviorPattern } from './ContextAnalyzer.js';

/**
 * Intelligent Filter Configuration
 *
 * @since 2.0.0
 */
export interface IntelligentFilterConfig {
  /** Enable ML-based filtering */
  enableMLFiltering: boolean;
  /** Enable context-aware filtering */
  enableContextFiltering: boolean;
  /** Enable user behavior analysis */
  enableBehaviorAnalysis: boolean;
  /** Learning rate for ML models */
  learningRate: number;
  /** Minimum confidence threshold */
  minConfidenceThreshold: number;
  /** Maximum notifications per user per hour */
  maxNotificationsPerHour: number;
  /** Enable adaptive filtering */
  enableAdaptiveFiltering: boolean;
}

/**
 * Intelligent Filter Result
 *
 * @since 2.0.0
 */
export interface IntelligentFilterResult {
  /** Filtered notifications */
  notifications: Notification[];
  /** Filter statistics */
  statistics: {
    total: number;
    filtered: number;
    inclusionRate: number;
    mlConfidence: number;
  };
  /** Filter explanations */
  explanations: Map<string, string[]>;
  /** Recommendations */
  recommendations: string[];
}

/**
 * Intelligent Filter
 *
 * Advanced notification filtering system that combines traditional filtering
 * with machine learning, context analysis, and user behavior patterns.
 *
 * @example
 * ```typescript
 * const filter = new IntelligentFilter(config);
 * const result = filter.filter(notifications, context);
 * ```
 *
 * @since 2.0.0
 */
export class IntelligentFilter {
  private notificationFilter: NotificationFilter;
  private contextAnalyzer: ContextAnalyzer;
  private config: IntelligentFilterConfig;
  private userBehaviorCache: Map<string, UserBehaviorPattern> = new Map();
  private mlModel: any = null; // Placeholder for ML model

  constructor(config: IntelligentFilterConfig) {
    this.config = config;
    this.notificationFilter = new NotificationFilter();
    this.contextAnalyzer = new ContextAnalyzer();
  }

  /**
   * Filters notifications intelligently
   *
   * @param notifications - Notifications to filter
   * @param context - Context for filtering
   * @returns Intelligent filter result
   *
   * @example
   * ```typescript
   * const result = filter.filter(notifications, context);
   * ```
   */
  async filter(notifications: Notification[], context: ContextData): Promise<IntelligentFilterResult> {
    try {
      // Step 1: Basic filtering
      const basicFilterResult = this.applyBasicFiltering(notifications, context);

      // Step 2: Context-aware filtering
      const contextFilterResult = this.applyContextFiltering(basicFilterResult.included, context);

      // Step 3: ML-based filtering
      const mlFilterResult = this.config.enableMLFiltering
        ? await this.applyMLFiltering(contextFilterResult, context)
        : contextFilterResult;

      // Step 4: User behavior analysis
      const behaviorFilterResult = this.config.enableBehaviorAnalysis
        ? this.applyBehaviorFiltering(mlFilterResult, context)
        : mlFilterResult;

      // Step 5: Rate limiting
      const rateLimitedResult = this.applyRateLimiting(behaviorFilterResult, context);

      // Step 6: Generate explanations and recommendations
      const explanations = this.generateExplanations(notifications, rateLimitedResult, context);
      const recommendations = this.generateRecommendations(rateLimitedResult, context);

      return {
        notifications: rateLimitedResult,
        statistics: {
          total: notifications.length,
          filtered: rateLimitedResult.length,
          inclusionRate: notifications.length > 0 ? rateLimitedResult.length / notifications.length : 0,
          mlConfidence: this.calculateMLConfidence(rateLimitedResult, context)
        },
        explanations,
        recommendations
      };
    } catch (error) {
      console.error('Error in intelligent filtering:', error);
      // Fallback to basic filtering
      return this.fallbackFiltering(notifications, context);
    }
  }

  /**
   * Applies basic filtering rules
   *
   * @param notifications - Notifications to filter
   * @param context - Context for filtering
   * @returns Filtered notifications
   *
   * @example
   * ```typescript
   * const filtered = filter.applyBasicFiltering(notifications, context);
   * ```
   */
  private applyBasicFiltering(notifications: Notification[], context: ContextData): FilterResult {
    const criteria: FilterCriteria = {
      priorities: this.getPriorityCriteria(context),
      categories: this.getCategoryCriteria(context),
      types: this.getTypeCriteria(context),
      keywords: this.getKeywordCriteria(context),
      timeRange: this.getTimeRangeCriteria(context),
      userFilters: this.getUserFilterCriteria(context)
    };

    return this.notificationFilter.filter(notifications, criteria);
  }

  /**
   * Applies context-aware filtering
   *
   * @param notifications - Notifications to filter
   * @param context - Context for filtering
   * @returns Filtered notifications
   *
   * @example
   * ```typescript
   * const filtered = filter.applyContextFiltering(notifications, context);
   * ```
   */
  private applyContextFiltering(notifications: Notification[], context: ContextData): Notification[] {
    if (!this.config.enableContextFiltering) {
      return notifications;
    }

    return notifications.filter(notification => {
      const analysis = this.contextAnalyzer.analyzeContext(notification, context);
      return analysis.relevanceScore >= this.config.minConfidenceThreshold;
    });
  }

  /**
   * Applies ML-based filtering
   *
   * @param notifications - Notifications to filter
   * @param context - Context for filtering
   * @returns Filtered notifications
   *
   * @example
   * ```typescript
   * const filtered = await filter.applyMLFiltering(notifications, context);
   * ```
   */
  private async applyMLFiltering(notifications: Notification[], context: ContextData): Promise<Notification[]> {
    if (!this.mlModel) {
      return notifications; // No ML model available
    }

    const filtered: Notification[] = [];

    for (const notification of notifications) {
      try {
        // ML-based relevance scoring
        const relevanceScore = await this.predictRelevance(notification, context);

        if (relevanceScore >= this.config.minConfidenceThreshold) {
          filtered.push(notification);
        }
      } catch (error) {
        console.warn(`ML filtering failed for notification ${notification.id}:`, error);
        // Include notification if ML filtering fails
        filtered.push(notification);
      }
    }

    return filtered;
  }

  /**
   * Applies behavior-based filtering
   *
   * @param notifications - Notifications to filter
   * @param context - Context for filtering
   * @returns Filtered notifications
   *
   * @example
   * ```typescript
   * const filtered = filter.applyBehaviorFiltering(notifications, context);
   * ```
   */
  private applyBehaviorFiltering(notifications: Notification[], context: ContextData): Notification[] {
    if (!context.userSession) {
      return notifications;
    }

    const userId = context.userSession.userId;
    let behaviorPattern = this.userBehaviorCache.get(userId);

    if (!behaviorPattern) {
      // Analyze user behavior from historical data
      const historicalNotifications = context.historicalContext?.recentNotifications || [];
      behaviorPattern = this.contextAnalyzer.analyzeUserBehavior(userId, historicalNotifications);
      this.userBehaviorCache.set(userId, behaviorPattern);
    }

    return notifications.filter(notification => {
      // Check if user prefers this category
      if (behaviorPattern.preferredCategories.length > 0 &&
          !behaviorPattern.preferredCategories.includes(notification.category)) {
        return false;
      }

      // Check if user prefers this type
      if (behaviorPattern.preferredTypes.length > 0 &&
          !behaviorPattern.preferredTypes.includes(notification.type)) {
        return false;
      }

      // Check for notification fatigue
      if (behaviorPattern.fatigueIndicators.recentNotificationCount > this.config.maxNotificationsPerHour) {
        return notification.priority === 'critical' || notification.priority === 'high';
      }

      return true;
    });
  }

  /**
   * Applies rate limiting
   *
   * @param notifications - Notifications to filter
   * @param context - Context for filtering
   * @returns Rate-limited notifications
   *
   * @example
   * ```typescript
   * const filtered = filter.applyRateLimiting(notifications, context);
   * ```
   */
  private applyRateLimiting(notifications: Notification[], context: ContextData): Notification[] {
    return this.notificationFilter.applyRateLimit(notifications, this.config.maxNotificationsPerHour);
  }

  /**
   * Generates explanations for filtering decisions
   *
   * @param original - Original notifications
   * @param filtered - Filtered notifications
   * @param context - Context for filtering
   * @returns Explanations map
   *
   * @example
   * ```typescript
   * const explanations = filter.generateExplanations(original, filtered, context);
   * ```
   */
  private generateExplanations(original: Notification[], filtered: Notification[], context: ContextData): Map<string, string[]> {
    const explanations = new Map<string, string[]>();
    const filteredIds = new Set(filtered.map(n => n.id));

    for (const notification of original) {
      if (!filteredIds.has(notification.id)) {
        const reasons: string[] = [];

        // Basic filtering reasons
        if (notification.priority === 'low' && context.timeContext?.isWeekend) {
          reasons.push('Low priority notification during weekend');
        }

        if (notification.category === 'user' && context.userSession?.role === 'admin') {
          reasons.push('User notification not relevant for admin role');
        }

        // ML-based reasons
        if (this.config.enableMLFiltering) {
          reasons.push('Low relevance score from ML analysis');
        }

        // Behavior-based reasons
        if (this.config.enableBehaviorAnalysis && context.userSession) {
          const behaviorPattern = this.userBehaviorCache.get(context.userSession.userId);
          if (behaviorPattern && !behaviorPattern.preferredCategories.includes(notification.category)) {
            reasons.push('User has low engagement with this category');
          }
        }

        explanations.set(notification.id, reasons);
      }
    }

    return explanations;
  }

  /**
   * Generates recommendations for notification optimization
   *
   * @param notifications - Filtered notifications
   * @param context - Context for filtering
   * @returns Recommendations
   *
   * @example
   * ```typescript
   * const recommendations = filter.generateRecommendations(notifications, context);
   * ```
   */
  private generateRecommendations(notifications: Notification[], context: ContextData): string[] {
    const recommendations: string[] = [];

    // Priority distribution analysis
    const priorityCounts = this.countByPriority(notifications);
    if (priorityCounts.critical > 3) {
      recommendations.push('High number of critical notifications - consider reviewing system health');
    }

    // Category distribution analysis
    const categoryCounts = this.countByCategory(notifications);
    const dominantCategory = Object.entries(categoryCounts).reduce((a, b) => a[1] > b[1] ? a : b);
    if (dominantCategory[1] > notifications.length * 0.6) {
      recommendations.push(`Notifications are dominated by ${dominantCategory[0]} category - consider diversifying`);
    }

    // Time-based recommendations
    if (context.timeContext?.isWeekend && notifications.length > 5) {
      recommendations.push('High notification volume during weekend - consider implementing quiet hours');
    }

    // User engagement recommendations
    if (context.userSession && this.config.enableBehaviorAnalysis) {
      const behaviorPattern = this.userBehaviorCache.get(context.userSession.userId);
      if (behaviorPattern && behaviorPattern.fatigueIndicators.recentNotificationCount > 10) {
        recommendations.push('User showing signs of notification fatigue - consider reducing frequency');
      }
    }

    return recommendations;
  }

  /**
   * Calculates ML confidence score
   *
   * @param notifications - Filtered notifications
   * @param context - Context for filtering
   * @returns Confidence score
   *
   * @example
   * ```typescript
   * const confidence = filter.calculateMLConfidence(notifications, context);
   * ```
   */
  private calculateMLConfidence(notifications: Notification[], context: ContextData): number {
    if (!this.config.enableMLFiltering || notifications.length === 0) {
      return 1.0;
    }

    // Simple confidence calculation - in production, this would be more sophisticated
    let totalConfidence = 0;
    for (const notification of notifications) {
      const analysis = this.contextAnalyzer.analyzeContext(notification, context);
      totalConfidence += analysis.relevanceScore;
    }

    return totalConfidence / notifications.length;
  }

  /**
   * Predicts relevance using ML model
   *
   * @param notification - Notification to predict
   * @param context - Context for prediction
   * @returns Relevance score
   *
   * @example
   * ```typescript
   * const score = await filter.predictRelevance(notification, context);
   * ```
   */
  private async predictRelevance(notification: Notification, context: ContextData): Promise<number> {
    // Placeholder for ML model prediction
    // In production, this would call the actual ML model
    const analysis = this.contextAnalyzer.analyzeContext(notification, context);
    return analysis.relevanceScore;
  }

  /**
   * Fallback filtering when ML fails
   *
   * @param notifications - Notifications to filter
   * @param context - Context for filtering
   * @returns Fallback filter result
   *
   * @example
   * ```typescript
   * const result = filter.fallbackFiltering(notifications, context);
   * ```
   */
  private fallbackFiltering(notifications: Notification[], context: ContextData): IntelligentFilterResult {
    const basicResult = this.applyBasicFiltering(notifications, context);

    return {
      notifications: basicResult.included,
      statistics: {
        total: notifications.length,
        filtered: basicResult.included.length,
        inclusionRate: basicResult.statistics.inclusionRate,
        mlConfidence: 0.5 // Lower confidence for fallback
      },
      explanations: basicResult.exclusionReasons,
      recommendations: ['ML filtering unavailable - using basic filtering']
    };
  }

  /**
   * Gets priority criteria based on context
   *
   * @param context - Context data
   * @returns Priority criteria
   *
   * @example
   * ```typescript
   * const criteria = filter.getPriorityCriteria(context);
   * ```
   */
  private getPriorityCriteria(context: ContextData): NotificationPriority[] {
    const priorities: NotificationPriority[] = ['critical', 'high'];

    if (context.timeContext?.isBusinessHours) {
      priorities.push('medium');
    }

    if (context.userSession?.role === 'admin') {
      priorities.push('low');
    }

    return priorities;
  }

  /**
   * Gets category criteria based on context
   *
   * @param context - Context data
   * @returns Category criteria
   *
   * @example
   * ```typescript
   * const criteria = filter.getCategoryCriteria(context);
   * ```
   */
  private getCategoryCriteria(context: ContextData): NotificationCategory[] {
    const categories: NotificationCategory[] = ['workflow', 'system'];

    if (context.userSession?.role === 'admin') {
      categories.push('security', 'performance');
    }

    if (context.userSession?.role === 'manager') {
      categories.push('business');
    }

    categories.push('user');

    return categories;
  }

  /**
   * Gets type criteria based on context
   *
   * @param context - Context data
   * @returns Type criteria
   *
   * @example
   * ```typescript
   * const criteria = filter.getTypeCriteria(context);
   * ```
   */
  private getTypeCriteria(context: ContextData): NotificationType[] {
    const types: NotificationType[] = ['error', 'warning'];

    if (context.timeContext?.isBusinessHours) {
      types.push('info', 'success');
    }

    return types;
  }

  /**
   * Gets keyword criteria based on context
   *
   * @param context - Context data
   * @returns Keyword criteria
   *
   * @example
   * ```typescript
   * const criteria = filter.getKeywordCriteria(context);
   * ```
   */
  private getKeywordCriteria(context: ContextData): string[] {
    const keywords: string[] = [];

    if (context.workflowContext?.workflowId) {
      keywords.push(context.workflowContext.workflowId);
    }

    if (context.userSession?.role) {
      keywords.push(context.userSession.role);
    }

    return keywords;
  }

  /**
   * Gets time range criteria based on context
   *
   * @param context - Context data
   * @returns Time range criteria
   *
   * @example
   * ```typescript
   * const criteria = filter.getTimeRangeCriteria(context);
   * ```
   */
  private getTimeRangeCriteria(context: ContextData): { start: Date; end: Date } | undefined {
    if (context.timeContext?.isWeekend) {
      // Only show critical notifications during weekend
      return undefined;
    }

    return undefined; // No time range restriction
  }

  /**
   * Gets user filter criteria based on context
   *
   * @param context - Context data
   * @returns User filter criteria
   *
   * @example
   * ```typescript
   * const criteria = filter.getUserFilterCriteria(context);
   * ```
   */
  private getUserFilterCriteria(context: ContextData): { userId: string; preferences: UserNotificationPreferences } | undefined {
    if (!context.userSession) {
      return undefined;
    }

    // Default preferences - in production, these would come from user settings
    const preferences: UserNotificationPreferences = {
      categorySettings: {
        'workflow': true,
        'system': true,
        'performance': true,
        'security': true,
        'user': true,
        'business': true
      },
      typeSettings: {
        'error': true,
        'warning': true,
        'info': true,
        'success': true
      },
      priorityThresholds: {
        'workflow': 'medium',
        'system': 'high',
        'performance': 'medium',
        'security': 'high',
        'user': 'low',
        'business': 'medium'
      }
    };

    return {
      userId: context.userSession.userId,
      preferences
    };
  }

  /**
   * Counts notifications by priority
   *
   * @param notifications - Notifications to count
   * @returns Priority counts
   *
   * @example
   * ```typescript
   * const counts = filter.countByPriority(notifications);
   * ```
   */
  private countByPriority(notifications: Notification[]): Record<NotificationPriority, number> {
    const counts: Record<NotificationPriority, number> = {
      'critical': 0,
      'high': 0,
      'medium': 0,
      'low': 0
    };

    for (const notification of notifications) {
      counts[notification.priority]++;
    }

    return counts;
  }

  /**
   * Counts notifications by category
   *
   * @param notifications - Notifications to count
   * @returns Category counts
   *
   * @example
   * ```typescript
   * const counts = filter.countByCategory(notifications);
   * ```
   */
  private countByCategory(notifications: Notification[]): Record<NotificationCategory, number> {
    const counts: Record<NotificationCategory, number> = {
      'workflow': 0,
      'system': 0,
      'performance': 0,
      'security': 0,
      'user': 0,
      'business': 0
    };

    for (const notification of notifications) {
      counts[notification.category]++;
    }

    return counts;
  }

  /**
   * Updates ML model with new data
   *
   * @param notifications - New notification data
   * @param context - Context data
   *
   * @example
   * ```typescript
   * await filter.updateModel(notifications, context);
   * ```
   */
  async updateModel(notifications: Notification[], context: ContextData): Promise<void> {
    if (!this.config.enableMLFiltering || !this.config.enableAdaptiveFiltering) {
      return;
    }

    // Placeholder for ML model update
    // In production, this would update the actual ML model with new data
    console.log('Updating ML model with new data...');
  }

  /**
   * Clears user behavior cache
   *
   * @param userId - User ID to clear (optional)
   *
   * @example
   * ```typescript
   * filter.clearBehaviorCache(); // Clear all
   * filter.clearBehaviorCache('user123'); // Clear specific user
   * ```
   */
  clearBehaviorCache(userId?: string): void {
    if (userId) {
      this.userBehaviorCache.delete(userId);
    } else {
      this.userBehaviorCache.clear();
    }
  }
}
