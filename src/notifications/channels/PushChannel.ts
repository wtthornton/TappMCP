/**
 * Push Notification Channel
 *
 * Handles sending push notifications to web browsers
 */

import webpush from 'web-push';
import { NotificationMessage, NotificationChannel } from '../types.js';

export interface PushConfig {
  enabled: boolean;
  vapidKeys: {
    publicKey: string;
    privateKey: string;
    subject: string;
  };
  subscriptions: Map<string, any>; // User ID -> PushSubscription
}

export class PushChannel {
  private config: PushConfig;
  private isConfigured = false;

  constructor(config: PushConfig) {
    this.config = config;
    this.initializePush();
  }

  private initializePush() {
    if (!this.config.enabled) {
      console.log('📱 Push notifications disabled');
      return;
    }

    try {
      webpush.setVapidDetails(
        this.config.vapidKeys.subject,
        this.config.vapidKeys.publicKey,
        this.config.vapidKeys.privateKey
      );

      console.log('📱 Push notifications configured successfully');
      this.isConfigured = true;
    } catch (error) {
      console.error('📱 Failed to initialize push notifications:', error);
      this.isConfigured = false;
    }
  }

  async send(notification: NotificationMessage): Promise<boolean> {
    if (!this.isConfigured) {
      console.warn('📱 Push channel not configured, skipping notification');
      return false;
    }

    if (!notification.userId) {
      console.warn('📱 No user ID provided for push notification');
      return false;
    }

    const subscription = this.config.subscriptions.get(notification.userId);
    if (!subscription) {
      console.warn('📱 No push subscription found for user:', notification.userId);
      return false;
    }

    try {
      const payload = JSON.stringify({
        title: notification.title,
        body: notification.message,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        data: {
          url: '/dashboard',
          notificationId: notification.id,
          type: notification.type,
          priority: notification.priority,
        },
        actions: [
          {
            action: 'view',
            title: 'View Dashboard',
          },
          {
            action: 'dismiss',
            title: 'Dismiss',
          },
        ],
      });

      const result = await webpush.sendNotification(subscription, payload);
      console.log('📱 Push notification sent successfully');
      return true;
    } catch (error) {
      console.error('📱 Failed to send push notification:', error);

      // If subscription is invalid, remove it
      if (
        error &&
        typeof error === 'object' &&
        'statusCode' in error &&
        (error as any).statusCode === 410
      ) {
        this.config.subscriptions.delete(notification.userId);
        console.log('📱 Removed invalid subscription for user:', notification.userId);
      }

      return false;
    }
  }

  subscribeUser(userId: string, subscription: any): void {
    this.config.subscriptions.set(userId, subscription);
    console.log('📱 User subscribed to push notifications:', userId);
  }

  unsubscribeUser(userId: string): void {
    this.config.subscriptions.delete(userId);
    console.log('📱 User unsubscribed from push notifications:', userId);
  }

  getPublicKey(): string {
    return this.config.vapidKeys.publicKey;
  }

  isAvailable(): boolean {
    return this.isConfigured;
  }

  getChannelName(): string {
    return 'push';
  }

  getSubscriptionCount(): number {
    return this.config.subscriptions.size;
  }
}
