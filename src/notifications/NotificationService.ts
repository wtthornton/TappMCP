/**
 * Notification Service
 *
 * Central service for managing notifications including creation, delivery,
 * user preferences, and analytics for the TappMCP platform.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import { EventEmitter } from 'events';
import { LRUCache } from 'lru-cache';
import {
  NotificationMessage,
  UserNotificationPreferences,
  NotificationTemplate,
  NotificationDelivery,
  NotificationHistory,
  NotificationAnalytics,
  NotificationQueue,
  NotificationRule,
  NotificationChannel,
  NotificationType,
  NotificationPriority,
  NotificationCategory,
  DEFAULT_USER_PREFERENCES,
  NOTIFICATION_LIMITS
} from './types.js';
import { WebSocketChannel } from './channels/WebSocketChannel.js';
import { EmailChannel } from './channels/EmailChannel.js';
import { PushChannel } from './channels/PushChannel.js';
import { IntelligentFilter } from './ml/IntelligentFilter.js';
import { NotificationTemplates } from './templates/NotificationTemplates.js';
import { WebSocketServer } from '../websocket/WebSocketServer.js';

/**
 * Main Notification Service
 *
 * @example
 * ```typescript
 * const notificationService = new NotificationService();
 * await notificationService.sendNotification({
 *   type: 'info',
 *   priority: 'medium',
 *   title: 'Workflow Completed',
 *   message: 'Your workflow has been completed successfully'
 * });
 * ```
 *
 * @since 2.0.0
 */
export class NotificationService extends EventEmitter {
  private channels: Map<NotificationChannel, any> = new Map();
  private userPreferences: Map<string, UserNotificationPreferences> = new Map();
  private notificationQueue: NotificationQueue[] = [];
  private notificationHistory: Map<string, NotificationHistory> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  private rules: NotificationRule[] = [];
  private intelligentFilter: IntelligentFilter;
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;
  private wsServer: WebSocketServer | null = null;

  // Caches
  private notificationCache: LRUCache<string, NotificationMessage>;
  private deliveryCache: LRUCache<string, NotificationDelivery>;
  private analyticsCache: LRUCache<string, NotificationAnalytics>;

  constructor(wsServer?: WebSocketServer) {
    super();

    this.wsServer = wsServer;
    this.initializeCaches();
    this.initializeChannels();
    this.initializeTemplates();
    this.initializeIntelligentFilter();
    this.startQueueProcessing();
  }

  /**
   * Sends a notification to users
   *
   * @param notification - Notification to send
   * @param userIds - Array of user IDs to send to (optional, sends to all if not provided)
   * @returns Promise resolving to delivery results
   *
   * @example
   * ```typescript
   * await notificationService.sendNotification({
   *   type: 'success',
   *   priority: 'high',
   *   title: 'Workflow Completed',
   *   message: 'Your workflow has been completed successfully'
   * }, ['user-123']);
   * ```
   */
  async sendNotification(
    notification: Omit<NotificationMessage, 'id' | 'timestamp'>,
    userIds?: string[]
  ): Promise<NotificationDelivery[]> {
    const fullNotification: NotificationMessage = {
      ...notification,
      id: this.generateNotificationId(),
      timestamp: Date.now()
    };

    // Apply intelligent filtering
    const filteredNotification = await this.intelligentFilter.filterNotification(fullNotification);
    if (!filteredNotification) {
      this.emit('notification:filtered', { notification: fullNotification, reason: 'intelligent_filter' });
      return [];
    }

    // Get target users
    const targetUsers = userIds || await this.getActiveUsers();

    // Process each user
    const deliveries: NotificationDelivery[] = [];

    for (const userId of targetUsers) {
      const userPrefs = await this.getUserPreferences(userId);

      // Check if notification should be sent to this user
      if (!this.shouldSendToUser(filteredNotification, userPrefs)) {
        continue;
      }

      // Create delivery for each enabled channel
      const userDeliveries = await this.createDeliveries(filteredNotification, userId, userPrefs);
      deliveries.push(...userDeliveries);
    }

    // Queue deliveries for processing
    await this.queueDeliveries(deliveries);

    // Update analytics
    this.updateAnalytics(filteredNotification, deliveries);

    this.emit('notification:sent', { notification: filteredNotification, deliveries });
    return deliveries;
  }

  /**
   * Sends a notification using a template
   *
   * @param templateId - Template ID to use
   * @param variables - Variables to substitute in template
   * @param userIds - Array of user IDs to send to
   * @returns Promise resolving to delivery results
   *
   * @example
   * ```typescript
   * await notificationService.sendTemplateNotification(
   *   'workflow-completed',
   *   { workflowName: 'User Management', duration: '2m 30s' },
   *   ['user-123']
   * );
   * ```
   */
  async sendTemplateNotification(
    templateId: string,
    variables: Record<string, any>,
    userIds?: string[]
  ): Promise<NotificationDelivery[]> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Render template
    const renderedNotification = this.renderTemplate(template, variables);

    return this.sendNotification(renderedNotification, userIds);
  }

  /**
   * Gets user notification preferences
   *
   * @param userId - User ID
   * @returns User preferences
   *
   * @example
   * ```typescript
   * const prefs = await notificationService.getUserPreferences('user-123');
   * ```
   */
  async getUserPreferences(userId: string): Promise<UserNotificationPreferences> {
    let prefs = this.userPreferences.get(userId);

    if (!prefs) {
      prefs = { ...DEFAULT_USER_PREFERENCES, userId };
      this.userPreferences.set(userId, prefs);
    }

    return prefs;
  }

  /**
   * Updates user notification preferences
   *
   * @param userId - User ID
   * @param preferences - New preferences
   * @returns Promise resolving when updated
   *
   * @example
   * ```typescript
   * await notificationService.updateUserPreferences('user-123', {
   *   channels: { email: false, websocket: true }
   * });
   * ```
   */
  async updateUserPreferences(
    userId: string,
    preferences: Partial<UserNotificationPreferences>
  ): Promise<void> {
    const currentPrefs = await this.getUserPreferences(userId);
    const updatedPrefs = { ...currentPrefs, ...preferences, lastUpdated: Date.now() };

    this.userPreferences.set(userId, updatedPrefs);
    this.emit('preferences:updated', { userId, preferences: updatedPrefs });
  }

  /**
   * Gets notification history for a user
   *
   * @param userId - User ID
   * @param limit - Maximum number of notifications to return
   * @param offset - Offset for pagination
   * @returns Notification history
   *
   * @example
   * ```typescript
   * const history = await notificationService.getNotificationHistory('user-123', 50, 0);
   * ```
   */
  async getNotificationHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<NotificationHistory> {
    let history = this.notificationHistory.get(userId);

    if (!history) {
      history = {
        userId,
        notifications: [],
        totalCount: 0,
        unreadCount: 0,
        categories: {} as Record<NotificationCategory, number>,
        channels: {} as Record<NotificationChannel, number>
      };
      this.notificationHistory.set(userId, history);
    }

    // Return paginated results
    const paginatedNotifications = history.notifications.slice(offset, offset + limit);

    return {
      ...history,
      notifications: paginatedNotifications
    };
  }

  /**
   * Marks a notification as read
   *
   * @param notificationId - Notification ID
   * @param userId - User ID
   * @returns Promise resolving when marked as read
   *
   * @example
   * ```typescript
   * await notificationService.markAsRead('notif-123', 'user-123');
   * ```
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const history = this.notificationHistory.get(userId);
    if (history) {
      const notification = history.notifications.find(n => n.id === notificationId);
      if (notification) {
        // Update delivery status
        const deliveries = this.getDeliveriesForNotification(notificationId);
        for (const delivery of deliveries) {
          delivery.status = 'read';
          delivery.readAt = Date.now();
        }

        // Update history
        history.unreadCount = Math.max(0, history.unreadCount - 1);

        this.emit('notification:read', { notificationId, userId });
      }
    }
  }

  /**
   * Dismisses a notification
   *
   * @param notificationId - Notification ID
   * @param userId - User ID
   * @returns Promise resolving when dismissed
   *
   * @example
   * ```typescript
   * await notificationService.dismissNotification('notif-123', 'user-123');
   * ```
   */
  async dismissNotification(notificationId: string, userId: string): Promise<void> {
    const history = this.notificationHistory.get(userId);
    if (history) {
      const notification = history.notifications.find(n => n.id === notificationId);
      if (notification) {
        // Update delivery status
        const deliveries = this.getDeliveriesForNotification(notificationId);
        for (const delivery of deliveries) {
          delivery.status = 'dismissed';
          delivery.dismissedAt = Date.now();
        }

        // Update history
        history.unreadCount = Math.max(0, history.unreadCount - 1);

        this.emit('notification:dismissed', { notificationId, userId });
      }
    }
  }

  /**
   * Gets notification analytics
   *
   * @param timeRange - Time range for analytics
   * @returns Analytics data
   *
   * @example
   * ```typescript
   * const analytics = await notificationService.getAnalytics({
   *   start: Date.now() - 24 * 60 * 60 * 1000,
   *   end: Date.now()
   * });
   * ```
   */
  async getAnalytics(timeRange?: { start: number; end: number }): Promise<NotificationAnalytics> {
    const cacheKey = timeRange ? `${timeRange.start}-${timeRange.end}` : 'default';
    let analytics = this.analyticsCache.get(cacheKey);

    if (!analytics) {
      analytics = await this.calculateAnalytics(timeRange);
      this.analyticsCache.set(cacheKey, analytics);
    }

    return analytics;
  }

  /**
   * Adds a notification rule
   *
   * @param rule - Notification rule to add
   * @returns Promise resolving when added
   *
   * @example
   * ```typescript
   * await notificationService.addRule({
   *   id: 'rule-1',
   *   name: 'Critical Errors',
   *   conditions: [{ field: 'priority', operator: 'equals', value: 'critical' }],
   *   actions: [{ type: 'send_notification', parameters: {} }]
   * });
   * ```
   */
  async addRule(rule: NotificationRule): Promise<void> {
    this.rules.push(rule);
    this.emit('rule:added', { rule });
  }

  /**
   * Stops the notification service
   *
   * @example
   * ```typescript
   * await notificationService.stop();
   * ```
   */
  async stop(): Promise<void> {
    this.isProcessing = false;

    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }

    // Stop all channels
    for (const channel of this.channels.values()) {
      if (channel.stop) {
        await channel.stop();
      }
    }

    this.emit('service:stopped');
  }

  // Private methods

  private initializeCaches(): void {
    this.notificationCache = new LRUCache<string, NotificationMessage>({
      max: NOTIFICATION_LIMITS.MAX_NOTIFICATIONS_PER_USER,
      ttl: NOTIFICATION_LIMITS.NOTIFICATION_TTL_MS
    });

    this.deliveryCache = new LRUCache<string, NotificationDelivery>({
      max: NOTIFICATION_LIMITS.MAX_NOTIFICATIONS_PER_USER * 5, // 5 channels per notification
      ttl: NOTIFICATION_LIMITS.NOTIFICATION_TTL_MS
    });

    this.analyticsCache = new LRUCache<string, NotificationAnalytics>({
      max: 100,
      ttl: 60 * 60 * 1000 // 1 hour
    });
  }

  private initializeChannels(): void {
    this.channels.set('websocket', new WebSocketChannel(this.wsServer));
    this.channels.set('email', new EmailChannel());
    this.channels.set('push', new PushChannel());
  }

  private initializeTemplates(): void {
    const templates = NotificationTemplates.getTemplates();
    for (const template of templates) {
      this.templates.set(template.id, template);
    }
  }

  private initializeIntelligentFilter(): void {
    this.intelligentFilter = new IntelligentFilter();
  }

  private startQueueProcessing(): void {
    this.isProcessing = true;
    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, NOTIFICATION_LIMITS.QUEUE_PROCESSING_INTERVAL_MS);
  }

  private async processQueue(): Promise<void> {
    if (!this.isProcessing || this.notificationQueue.length === 0) {
      return;
    }

    const queue = this.notificationQueue.shift();
    if (!queue) return;

    try {
      for (const notification of queue.notifications) {
        await this.processNotification(notification);
      }

      queue.status = 'completed';
      this.emit('queue:processed', { queueId: queue.id, status: 'completed' });
    } catch (error) {
      queue.status = 'failed';
      this.emit('queue:processed', { queueId: queue.id, status: 'failed', error });
    }
  }

  private async processNotification(notification: NotificationMessage): Promise<void> {
    // Apply rules
    const processedNotification = await this.applyRules(notification);

    // Cache notification
    this.notificationCache.set(notification.id, processedNotification);

    // Add to user history
    await this.addToUserHistory(processedNotification);
  }

  private async applyRules(notification: NotificationMessage): Promise<NotificationMessage> {
    let processedNotification = { ...notification };

    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      if (this.matchesRule(processedNotification, rule)) {
        processedNotification = await this.applyRuleActions(processedNotification, rule);
      }
    }

    return processedNotification;
  }

  private matchesRule(notification: NotificationMessage, rule: NotificationRule): boolean {
    return rule.conditions.every(condition => {
      const fieldValue = this.getFieldValue(notification, condition.field);
      return this.evaluateCondition(fieldValue, condition.operator, condition.value);
    });
  }

  private getFieldValue(notification: NotificationMessage, field: string): any {
    const fieldMap: Record<string, any> = {
      'type': notification.type,
      'priority': notification.priority,
      'category': notification.category,
      'title': notification.title,
      'message': notification.message,
      'userId': notification.userId,
      'workflowId': notification.workflowId,
      'source': notification.source
    };

    return fieldMap[field] || notification.data?.[field];
  }

  private evaluateCondition(value: any, operator: string, expectedValue: any): boolean {
    switch (operator) {
      case 'equals':
        return value === expectedValue;
      case 'not_equals':
        return value !== expectedValue;
      case 'contains':
        return String(value).includes(String(expectedValue));
      case 'not_contains':
        return !String(value).includes(String(expectedValue));
      case 'greater_than':
        return Number(value) > Number(expectedValue);
      case 'less_than':
        return Number(value) < Number(expectedValue);
      case 'in':
        return Array.isArray(expectedValue) && expectedValue.includes(value);
      case 'not_in':
        return Array.isArray(expectedValue) && !expectedValue.includes(value);
      default:
        return false;
    }
  }

  private async applyRuleActions(
    notification: NotificationMessage,
    rule: NotificationRule
  ): Promise<NotificationMessage> {
    let processedNotification = { ...notification };

    for (const action of rule.actions) {
      switch (action.type) {
        case 'modify_priority':
          processedNotification.priority = action.parameters.priority;
          break;
        case 'add_tag':
          if (!processedNotification.metadata) {
            processedNotification.metadata = { tags: [] };
          }
          processedNotification.metadata.tags.push(action.parameters.tag);
          break;
        case 'remove_tag':
          if (processedNotification.metadata?.tags) {
            processedNotification.metadata.tags = processedNotification.metadata.tags.filter(
              (tag: string) => tag !== action.parameters.tag
            );
          }
          break;
        case 'delay':
          processedNotification.timestamp += action.parameters.delayMs;
          break;
        case 'suppress':
          return null as any; // This will be filtered out
      }
    }

    return processedNotification;
  }

  private async addToUserHistory(notification: NotificationMessage): Promise<void> {
    if (!notification.userId) return;

    let history = this.notificationHistory.get(notification.userId);
    if (!history) {
      history = {
        userId: notification.userId,
        notifications: [],
        totalCount: 0,
        unreadCount: 0,
        categories: {} as Record<NotificationCategory, number>,
        channels: {} as Record<NotificationChannel, number>
      };
      this.notificationHistory.set(notification.userId, history);
    }

    // Add notification to history
    history.notifications.unshift(notification);
    history.totalCount++;
    history.unreadCount++;

    // Update category count
    history.categories[notification.category] = (history.categories[notification.category] || 0) + 1;

    // Keep only recent notifications
    if (history.notifications.length > NOTIFICATION_LIMITS.MAX_NOTIFICATIONS_PER_USER) {
      history.notifications = history.notifications.slice(0, NOTIFICATION_LIMITS.MAX_NOTIFICATIONS_PER_USER);
    }
  }

  private async getActiveUsers(): Promise<string[]> {
    // In a real implementation, this would query the user database
    return Array.from(this.userPreferences.keys());
  }

  private shouldSendToUser(
    notification: NotificationMessage,
    preferences: UserNotificationPreferences
  ): boolean {
    // Check priority threshold
    const priorityOrder = ['low', 'medium', 'high', 'critical'];
    const notificationPriorityIndex = priorityOrder.indexOf(notification.priority);
    const minPriorityIndex = priorityOrder.indexOf(preferences.filters.minPriority);

    if (notificationPriorityIndex < minPriorityIndex) {
      return false;
    }

    // Check category preferences
    const categoryPriority = preferences.categories[notification.category];
    if (categoryPriority === 'low' && notification.priority === 'low') {
      return false;
    }

    // Check blocked keywords
    const text = `${notification.title} ${notification.message}`.toLowerCase();
    for (const keyword of preferences.filters.blockedKeywords) {
      if (text.includes(keyword.toLowerCase())) {
        return false;
      }
    }

    // Check quiet hours
    if (preferences.quietHours.enabled) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const startTime = this.parseTime(preferences.quietHours.startTime);
      const endTime = this.parseTime(preferences.quietHours.endTime);
      const currentDay = now.getDay();

      if (preferences.quietHours.days.includes(currentDay)) {
        if (startTime <= endTime) {
          if (currentTime >= startTime && currentTime <= endTime) {
            return false;
          }
        } else {
          if (currentTime >= startTime || currentTime <= endTime) {
            return false;
          }
        }
      }
    }

    return true;
  }

  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private async createDeliveries(
    notification: NotificationMessage,
    userId: string,
    preferences: UserNotificationPreferences
  ): Promise<NotificationDelivery[]> {
    const deliveries: NotificationDelivery[] = [];

    for (const [channelName, channel] of this.channels) {
      if (preferences.channels[channelName]) {
        const delivery: NotificationDelivery = {
          id: this.generateDeliveryId(),
          notificationId: notification.id,
          channel: channelName,
          status: 'pending',
          attempts: 0,
          maxAttempts: NOTIFICATION_LIMITS.MAX_RETRY_ATTEMPTS,
          metadata: {}
        };

        deliveries.push(delivery);
        this.deliveryCache.set(delivery.id, delivery);
      }
    }

    return deliveries;
  }

  private async queueDeliveries(deliveries: NotificationDelivery[]): Promise<void> {
    // Group deliveries by priority
    const groupedDeliveries = new Map<NotificationPriority, NotificationDelivery[]>();

    for (const delivery of deliveries) {
      const notification = this.notificationCache.get(delivery.notificationId);
      if (notification) {
        const priority = notification.priority;
        if (!groupedDeliveries.has(priority)) {
          groupedDeliveries.set(priority, []);
        }
        groupedDeliveries.get(priority)!.push(delivery);
      }
    }

    // Create queues for each priority
    for (const [priority, deliveryList] of groupedDeliveries) {
      const queue: NotificationQueue = {
        id: this.generateQueueId(),
        notifications: deliveryList.map(d => this.notificationCache.get(d.notificationId)!),
        priority,
        createdAt: Date.now(),
        maxRetries: NOTIFICATION_LIMITS.MAX_RETRY_ATTEMPTS,
        retryDelay: NOTIFICATION_LIMITS.RETRY_DELAY_MS,
        status: 'pending'
      };

      this.notificationQueue.push(queue);
    }
  }

  private updateAnalytics(notification: NotificationMessage, deliveries: NotificationDelivery[]): void {
    // This would update analytics in a real implementation
    this.emit('analytics:updated', { notification, deliveries });
  }

  private async calculateAnalytics(timeRange?: { start: number; end: number }): Promise<NotificationAnalytics> {
    // This would calculate analytics from the database in a real implementation
    return {
      totalSent: 0,
      totalDelivered: 0,
      totalRead: 0,
      totalDismissed: 0,
      deliveryRate: 0,
      readRate: 0,
      dismissalRate: 0,
      averageDeliveryTime: 0,
      channelPerformance: {} as Record<NotificationChannel, ChannelAnalytics>,
      categoryPerformance: {} as Record<NotificationCategory, CategoryAnalytics>,
      timeRange: timeRange || { start: 0, end: Date.now() }
    };
  }

  private renderTemplate(template: NotificationTemplate, variables: Record<string, any>): Omit<NotificationMessage, 'id' | 'timestamp'> {
    let renderedTemplate = template.template;

    // Replace variables in template
    for (const variable of template.variables) {
      const value = variables[variable] || '';
      renderedTemplate = renderedTemplate.replace(new RegExp(`{{${variable}}}`, 'g'), String(value));
    }

    return {
      type: template.type,
      priority: template.defaultPriority,
      category: template.category,
      title: renderedTemplate.split('\n')[0] || '',
      message: renderedTemplate.split('\n').slice(1).join('\n') || renderedTemplate,
      source: 'template',
      metadata: template.metadata
    };
  }

  private getDeliveriesForNotification(notificationId: string): NotificationDelivery[] {
    const deliveries: NotificationDelivery[] = [];

    for (const delivery of this.deliveryCache.values()) {
      if (delivery.notificationId === notificationId) {
        deliveries.push(delivery);
      }
    }

    return deliveries;
  }

  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateDeliveryId(): string {
    return `delivery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateQueueId(): string {
    return `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
