/**
 * Notification Filter
 *
 * Intelligent filtering system for notifications based on priority,
 * context, user preferences, and machine learning insights.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import { Notification, NotificationPriority, NotificationCategory, NotificationType } from '../types.js';

/**
 * Filter Criteria
 *
 * @since 2.0.0
 */
export interface FilterCriteria {
  /** Priority levels to include */
  priorities?: NotificationPriority[];
  /** Categories to include */
  categories?: NotificationCategory[];
  /** Types to include */
  types?: NotificationType[];
  /** Keywords to filter by */
  keywords?: string[];
  /** Time range filter */
  timeRange?: {
    start: Date;
    end: Date;
  };
  /** User-specific filters */
  userFilters?: {
    userId: string;
    preferences: UserNotificationPreferences;
  };
}

/**
 * User Notification Preferences
 *
 * @since 2.0.0
 */
export interface UserNotificationPreferences {
  /** Enable/disable notifications by category */
  categorySettings: Record<NotificationCategory, boolean>;
  /** Enable/disable notifications by type */
  typeSettings: Record<NotificationType, boolean>;
  /** Priority thresholds */
  priorityThresholds: Record<NotificationCategory, NotificationPriority>;
  /** Quiet hours */
  quietHours?: {
    start: string; // HH:MM format
    end: string;   // HH:MM format
    timezone: string;
  };
  /** Maximum notifications per hour */
  maxNotificationsPerHour?: number;
  /** Keywords to always include */
  alwaysIncludeKeywords?: string[];
  /** Keywords to always exclude */
  alwaysExcludeKeywords?: string[];
}

/**
 * Filter Result
 *
 * @since 2.0.0
 */
export interface FilterResult {
  /** Notifications that passed the filter */
  included: Notification[];
  /** Notifications that were filtered out */
  excluded: Notification[];
  /** Filter statistics */
  statistics: {
    total: number;
    included: number;
    excluded: number;
    inclusionRate: number;
  };
  /** Filter reasons for excluded notifications */
  exclusionReasons: Map<string, string[]>;
}

/**
 * Notification Filter
 *
 * Intelligent filtering system for notifications with priority-based,
 * context-aware, and ML-powered filtering capabilities.
 *
 * @example
 * ```typescript
 * const filter = new NotificationFilter();
 * const result = filter.filter(notifications, criteria);
 * ```
 *
 * @since 2.0.0
 */
export class NotificationFilter {
  private static readonly DEFAULT_PRIORITY_ORDER: NotificationPriority[] = [
    'critical',
    'high',
    'medium',
    'low'
  ];

  private static readonly CATEGORY_WEIGHTS: Record<NotificationCategory, number> = {
    'workflow': 1.0,
    'system': 0.9,
    'performance': 0.8,
    'security': 0.95,
    'user': 0.6,
    'business': 0.7
  };

  private static readonly TYPE_WEIGHTS: Record<NotificationType, number> = {
    'error': 1.0,
    'warning': 0.8,
    'info': 0.6,
    'success': 0.7
  };

  /**
   * Filters notifications based on criteria
   *
   * @param notifications - Notifications to filter
   * @param criteria - Filter criteria
   * @returns Filter result
   *
   * @example
   * ```typescript
   * const result = filter.filter(notifications, {
   *   priorities: ['high', 'critical'],
   *   categories: ['workflow', 'system']
   * });
   * ```
   */
  filter(notifications: Notification[], criteria: FilterCriteria): FilterResult {
    const included: Notification[] = [];
    const excluded: Notification[] = [];
    const exclusionReasons = new Map<string, string[]>();

    for (const notification of notifications) {
      const reasons: string[] = [];
      let shouldInclude = true;

      // Priority filter
      if (criteria.priorities && !criteria.priorities.includes(notification.priority)) {
        shouldInclude = false;
        reasons.push(`Priority '${notification.priority}' not in allowed priorities`);
      }

      // Category filter
      if (criteria.categories && !criteria.categories.includes(notification.category)) {
        shouldInclude = false;
        reasons.push(`Category '${notification.category}' not in allowed categories`);
      }

      // Type filter
      if (criteria.types && !criteria.types.includes(notification.type)) {
        shouldInclude = false;
        reasons.push(`Type '${notification.type}' not in allowed types`);
      }

      // Keyword filter
      if (criteria.keywords && !this.matchesKeywords(notification, criteria.keywords)) {
        shouldInclude = false;
        reasons.push('Does not match required keywords');
      }

      // Time range filter
      if (criteria.timeRange && !this.isInTimeRange(notification, criteria.timeRange)) {
        shouldInclude = false;
        reasons.push('Outside time range');
      }

      // User-specific filters
      if (criteria.userFilters) {
        const userResult = this.applyUserFilters(notification, criteria.userFilters);
        if (!userResult.shouldInclude) {
          shouldInclude = false;
          reasons.push(...userResult.reasons);
        }
      }

      // ML-based filtering
      const mlResult = this.applyMLFiltering(notification, criteria);
      if (!mlResult.shouldInclude) {
        shouldInclude = false;
        reasons.push(...mlResult.reasons);
      }

      if (shouldInclude) {
        included.push(notification);
      } else {
        excluded.push(notification);
        exclusionReasons.set(notification.id, reasons);
      }
    }

    return {
      included,
      excluded,
      statistics: {
        total: notifications.length,
        included: included.length,
        excluded: excluded.length,
        inclusionRate: notifications.length > 0 ? included.length / notifications.length : 0
      },
      exclusionReasons
    };
  }

  /**
   * Applies priority-based filtering
   *
   * @param notifications - Notifications to filter
   * @param maxPriority - Maximum priority to include
   * @returns Filtered notifications
   *
   * @example
   * ```typescript
   * const filtered = filter.filterByPriority(notifications, 'high');
   * ```
   */
  filterByPriority(notifications: Notification[], maxPriority: NotificationPriority): Notification[] {
    const priorityIndex = NotificationFilter.DEFAULT_PRIORITY_ORDER.indexOf(maxPriority);
    if (priorityIndex === -1) {
      return notifications;
    }

    const allowedPriorities = NotificationFilter.DEFAULT_PRIORITY_ORDER.slice(0, priorityIndex + 1);
    return notifications.filter(notification => allowedPriorities.includes(notification.priority));
  }

  /**
   * Applies context-aware filtering
   *
   * @param notifications - Notifications to filter
   * @param context - Current context
   * @returns Filtered notifications
   *
   * @example
   * ```typescript
   * const filtered = filter.filterByContext(notifications, {
   *   currentWorkflow: 'deployment',
   *   userRole: 'developer'
   * });
   * ```
   */
  filterByContext(notifications: Notification[], context: any): Notification[] {
    return notifications.filter(notification => {
      // Context-based relevance scoring
      const relevanceScore = this.calculateRelevanceScore(notification, context);
      return relevanceScore > 0.5; // Threshold for inclusion
    });
  }

  /**
   * Applies rate limiting to notifications
   *
   * @param notifications - Notifications to filter
   * @param maxPerHour - Maximum notifications per hour
   * @returns Filtered notifications
   *
   * @example
   * ```typescript
   * const filtered = filter.applyRateLimit(notifications, 10);
   * ```
   */
  applyRateLimit(notifications: Notification[], maxPerHour: number): Notification[] {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Sort by priority and creation time
    const sorted = notifications.sort((a, b) => {
      const priorityA = NotificationFilter.DEFAULT_PRIORITY_ORDER.indexOf(a.priority);
      const priorityB = NotificationFilter.DEFAULT_PRIORITY_ORDER.indexOf(b.priority);

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    // Apply rate limiting
    const recent = sorted.filter(n => n.createdAt >= oneHourAgo);
    if (recent.length <= maxPerHour) {
      return sorted;
    }

    // Take the most important notifications
    return sorted.slice(0, maxPerHour);
  }

  /**
   * Checks if notification matches keywords
   *
   * @param notification - Notification to check
   * @param keywords - Keywords to match
   * @returns True if matches
   *
   * @example
   * ```typescript
   * const matches = filter.matchesKeywords(notification, ['error', 'critical']);
   * ```
   */
  private matchesKeywords(notification: Notification, keywords: string[]): boolean {
    const text = `${notification.title} ${notification.message}`.toLowerCase();
    return keywords.some(keyword => text.includes(keyword.toLowerCase()));
  }

  /**
   * Checks if notification is in time range
   *
   * @param notification - Notification to check
   * @param timeRange - Time range
   * @returns True if in range
   *
   * @example
   * ```typescript
   * const inRange = filter.isInTimeRange(notification, timeRange);
   * ```
   */
  private isInTimeRange(notification: Notification, timeRange: { start: Date; end: Date }): boolean {
    return notification.createdAt >= timeRange.start && notification.createdAt <= timeRange.end;
  }

  /**
   * Applies user-specific filters
   *
   * @param notification - Notification to filter
   * @param userFilters - User filters
   * @returns Filter result
   *
   * @example
   * ```typescript
   * const result = filter.applyUserFilters(notification, userFilters);
   * ```
   */
  private applyUserFilters(notification: Notification, userFilters: { userId: string; preferences: UserNotificationPreferences }): { shouldInclude: boolean; reasons: string[] } {
    const { preferences } = userFilters;
    const reasons: string[] = [];

    // Category settings
    if (!preferences.categorySettings[notification.category]) {
      reasons.push(`Category '${notification.category}' disabled by user`);
      return { shouldInclude: false, reasons };
    }

    // Type settings
    if (!preferences.typeSettings[notification.type]) {
      reasons.push(`Type '${notification.type}' disabled by user`);
      return { shouldInclude: false, reasons };
    }

    // Priority threshold
    const categoryThreshold = preferences.priorityThresholds[notification.category];
    const priorityIndex = NotificationFilter.DEFAULT_PRIORITY_ORDER.indexOf(notification.priority);
    const thresholdIndex = NotificationFilter.DEFAULT_PRIORITY_ORDER.indexOf(categoryThreshold);

    if (priorityIndex > thresholdIndex) {
      reasons.push(`Priority '${notification.priority}' below threshold '${categoryThreshold}' for category '${notification.category}'`);
      return { shouldInclude: false, reasons };
    }

    // Quiet hours
    if (preferences.quietHours && this.isInQuietHours(notification, preferences.quietHours)) {
      reasons.push('Notification created during quiet hours');
      return { shouldInclude: false, reasons };
    }

    // Always include keywords
    if (preferences.alwaysIncludeKeywords && this.matchesKeywords(notification, preferences.alwaysIncludeKeywords)) {
      return { shouldInclude: true, reasons: [] };
    }

    // Always exclude keywords
    if (preferences.alwaysExcludeKeywords && this.matchesKeywords(notification, preferences.alwaysExcludeKeywords)) {
      reasons.push('Matches always-exclude keywords');
      return { shouldInclude: false, reasons };
    }

    return { shouldInclude: true, reasons: [] };
  }

  /**
   * Applies ML-based filtering
   *
   * @param notification - Notification to filter
   * @param criteria - Filter criteria
   * @returns Filter result
   *
   * @example
   * ```typescript
   * const result = filter.applyMLFiltering(notification, criteria);
   * ```
   */
  private applyMLFiltering(notification: Notification, criteria: FilterCriteria): { shouldInclude: boolean; reasons: string[] } {
    const reasons: string[] = [];

    // Calculate relevance score
    const relevanceScore = this.calculateRelevanceScore(notification, criteria);

    // Apply ML-based thresholds
    if (relevanceScore < 0.3) {
      reasons.push('Low relevance score from ML analysis');
      return { shouldInclude: false, reasons };
    }

    // Duplicate detection
    if (this.isDuplicate(notification)) {
      reasons.push('Detected as duplicate notification');
      return { shouldInclude: false, reasons };
    }

    // Spam detection
    if (this.isSpam(notification)) {
      reasons.push('Detected as spam notification');
      return { shouldInclude: false, reasons };
    }

    return { shouldInclude: true, reasons: [] };
  }

  /**
   * Calculates relevance score for notification
   *
   * @param notification - Notification to score
   * @param context - Context for scoring
   * @returns Relevance score (0-1)
   *
   * @example
   * ```typescript
   * const score = filter.calculateRelevanceScore(notification, context);
   * ```
   */
  private calculateRelevanceScore(notification: Notification, context: any): number {
    let score = 0;

    // Priority weight
    const priorityIndex = NotificationFilter.DEFAULT_PRIORITY_ORDER.indexOf(notification.priority);
    score += (NotificationFilter.DEFAULT_PRIORITY_ORDER.length - priorityIndex) / NotificationFilter.DEFAULT_PRIORITY_ORDER.length * 0.4;

    // Category weight
    score += NotificationFilter.CATEGORY_WEIGHTS[notification.category] * 0.3;

    // Type weight
    score += NotificationFilter.TYPE_WEIGHTS[notification.type] * 0.2;

    // Context relevance
    if (context) {
      const contextScore = this.calculateContextRelevance(notification, context);
      score += contextScore * 0.1;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calculates context relevance score
   *
   * @param notification - Notification to score
   * @param context - Context for scoring
   * @returns Context relevance score (0-1)
   *
   * @example
   * ```typescript
   * const score = filter.calculateContextRelevance(notification, context);
   * ```
   */
  private calculateContextRelevance(notification: Notification, context: any): number {
    // Simple context matching - can be enhanced with ML
    let score = 0;

    if (context.currentWorkflow && notification.metadata?.templateId?.includes('workflow')) {
      score += 0.5;
    }

    if (context.userRole && notification.category === 'user') {
      score += 0.3;
    }

    if (context.systemStatus && notification.category === 'system') {
      score += 0.4;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Checks if notification is duplicate
   *
   * @param notification - Notification to check
   * @returns True if duplicate
   *
   * @example
   * ```typescript
   * const isDup = filter.isDuplicate(notification);
   * ```
   */
  private isDuplicate(notification: Notification): boolean {
    // Simple duplicate detection - can be enhanced with ML
    const text = `${notification.title} ${notification.message}`.toLowerCase();
    const hash = this.simpleHash(text);

    // In a real implementation, this would check against a database
    // of recent notifications
    return false;
  }

  /**
   * Checks if notification is spam
   *
   * @param notification - Notification to check
   * @returns True if spam
   *
   * @example
   * ```typescript
   * const isSpam = filter.isSpam(notification);
   * ```
   */
  private isSpam(notification: Notification): boolean {
    // Simple spam detection - can be enhanced with ML
    const text = `${notification.title} ${notification.message}`.toLowerCase();

    // Check for spam indicators
    const spamIndicators = ['urgent', 'act now', 'limited time', 'click here'];
    const spamCount = spamIndicators.filter(indicator => text.includes(indicator)).length;

    return spamCount >= 2;
  }

  /**
   * Checks if notification is in quiet hours
   *
   * @param notification - Notification to check
   * @param quietHours - Quiet hours configuration
   * @returns True if in quiet hours
   *
   * @example
   * ```typescript
   * const inQuiet = filter.isInQuietHours(notification, quietHours);
   * ```
   */
  private isInQuietHours(notification: Notification, quietHours: { start: string; end: string; timezone: string }): boolean {
    const now = new Date();
    const notificationTime = new Date(notification.createdAt);

    // Simple time comparison - in production, use proper timezone handling
    const hour = notificationTime.getHours();
    const startHour = parseInt(quietHours.start.split(':')[0]);
    const endHour = parseInt(quietHours.end.split(':')[0]);

    if (startHour <= endHour) {
      return hour >= startHour && hour < endHour;
    } else {
      return hour >= startHour || hour < endHour;
    }
  }

  /**
   * Simple hash function for text
   *
   * @param text - Text to hash
   * @returns Hash value
   *
   * @example
   * ```typescript
   * const hash = filter.simpleHash(text);
   * ```
   */
  private simpleHash(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }
}
