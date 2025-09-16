/**
 * Notification Manager
 *
 * Coordinates notifications across all channels
 */

import { EventEmitter } from 'events';
import { NotificationMessage, NotificationChannel, NotificationPreference } from './types.js';
import { EmailChannel, EmailConfig } from './channels/EmailChannel.js';
import { PushChannel, PushConfig } from './channels/PushChannel.js';
import { WebSocketChannel, WebSocketConfig } from './channels/WebSocketChannel.js';

export interface NotificationManagerConfig {
  email: EmailConfig;
  push: PushConfig;
  websocket: WebSocketConfig;
  defaultPreferences: NotificationPreference[];
}

export class NotificationManager extends EventEmitter {
  private emailChannel: EmailChannel;
  private pushChannel: PushChannel;
  private websocketChannel: WebSocketChannel;
  private preferences: Map<string, NotificationPreference[]> = new Map();
  private notificationHistory: NotificationMessage[] = [];
  private maxHistorySize = 1000;

  constructor(config: NotificationManagerConfig) {
    super();

    this.emailChannel = new EmailChannel(config.email);
    this.pushChannel = new PushChannel(config.push);
    this.websocketChannel = new WebSocketChannel(config.websocket);

    // Set default preferences
    this.preferences.set('default', config.defaultPreferences);
  }

  async sendNotification(notification: NotificationMessage): Promise<boolean> {
    try {
      // Add to history
      this.addToHistory(notification);

      // Get user preferences
      const userPrefs = this.getUserPreferences(notification.userId || 'default');

      // Send to appropriate channels based on preferences
      const results = await Promise.allSettled([
        this.sendToWebSocket(notification, userPrefs),
        this.sendToEmail(notification, userPrefs),
        this.sendToPush(notification, userPrefs),
      ]);

      const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
      const totalChannels = results.length;

      console.log(`📢 Notification sent to ${successCount}/${totalChannels} channels`);

      this.emit('notification-sent', {
        notification,
        results: results.map(r => (r.status === 'fulfilled' ? r.value : false)),
      });

      return successCount > 0;
    } catch (error) {
      console.error('📢 Failed to send notification:', error);
      this.emit('notification-error', { notification, error });
      return false;
    }
  }

  private async sendToWebSocket(
    notification: NotificationMessage,
    prefs: NotificationPreference[]
  ): Promise<boolean> {
    if (!this.shouldSendToChannel('websocket', notification, prefs)) {
      return false;
    }
    return await this.websocketChannel.send(notification);
  }

  private async sendToEmail(
    notification: NotificationMessage,
    prefs: NotificationPreference[]
  ): Promise<boolean> {
    if (!this.shouldSendToChannel('email', notification, prefs)) {
      return false;
    }
    return await this.emailChannel.send(notification);
  }

  private async sendToPush(
    notification: NotificationMessage,
    prefs: NotificationPreference[]
  ): Promise<boolean> {
    if (!this.shouldSendToChannel('push', notification, prefs)) {
      return false;
    }
    return await this.pushChannel.send(notification);
  }

  private shouldSendToChannel(
    channel: NotificationChannel,
    notification: NotificationMessage,
    prefs: NotificationPreference[]
  ): boolean {
    const channelPref = prefs.find(p => p.channel === channel && p.type === notification.type);
    if (!channelPref) {
      return false; // No preference found, don't send
    }

    if (!channelPref.enabled) {
      return false; // Channel disabled for this type
    }

    // Check priority level
    const priorityLevels = { info: 0, low: 1, medium: 2, high: 3, critical: 4 };
    const notificationPriority = priorityLevels[notification.priority] || 1;
    const minPriority = priorityLevels[channelPref.priority] || 1;

    return notificationPriority >= minPriority;
  }

  private addToHistory(notification: NotificationMessage): void {
    this.notificationHistory.unshift(notification);

    // Keep only recent notifications
    if (this.notificationHistory.length > this.maxHistorySize) {
      this.notificationHistory = this.notificationHistory.slice(0, this.maxHistorySize);
    }
  }

  // Channel management
  addWebSocketClient(ws: any): void {
    this.websocketChannel.addClient(ws);
  }

  removeWebSocketClient(ws: any): void {
    this.websocketChannel.removeClient(ws);
  }

  subscribeToPush(userId: string, subscription: any): void {
    this.pushChannel.subscribeUser(userId, subscription);
  }

  unsubscribeFromPush(userId: string): void {
    this.pushChannel.unsubscribeUser(userId);
  }

  // User preferences
  setUserPreferences(userId: string, preferences: NotificationPreference[]): void {
    this.preferences.set(userId, preferences);
    console.log(`📢 Updated notification preferences for user: ${userId}`);
  }

  getUserPreferences(userId: string): NotificationPreference[] {
    return this.preferences.get(userId) || [];
  }

  // Status and history
  getChannelStatus(): Record<string, { available: boolean; status: string }> {
    return {
      websocket: {
        available: this.websocketChannel.isAvailable(),
        status: this.websocketChannel.getClientCount() > 0 ? 'Active' : 'No clients',
      },
      email: {
        available: this.emailChannel.isAvailable(),
        status: this.emailChannel.isAvailable() ? 'Configured' : 'Not configured',
      },
      push: {
        available: this.pushChannel.isAvailable(),
        status: this.pushChannel.getSubscriptionCount() > 0 ? 'Active' : 'No subscriptions',
      },
    };
  }

  getNotificationHistory(limit = 50): NotificationMessage[] {
    return this.notificationHistory.slice(0, limit);
  }

  getPushPublicKey(): string {
    return this.pushChannel.getPublicKey();
  }

  // Utility methods
  createNotification(
    type: string,
    priority: 'low' | 'medium' | 'high' | 'critical',
    title: string,
    message: string,
    userId?: string,
    data?: Record<string, any>
  ): NotificationMessage {
    return {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: type as any,
      priority,
      title,
      message,
      data,
      userId,
      channel: 'websocket', // Will be overridden by manager
      status: 'pending',
      createdAt: new Date(),
      retryCount: 0,
      maxRetries: 3,
    };
  }
}
