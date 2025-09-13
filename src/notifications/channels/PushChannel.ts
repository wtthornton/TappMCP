/**
 * Push Notification Channel
 *
 * Handles push notification delivery for mobile and web applications
 * with device registration and delivery tracking.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import { EventEmitter } from 'events';
import { NotificationMessage, NotificationDelivery, NotificationChannel, Notification } from '../types.js';

/**
 * Push Notification Channel
 *
 * @example
 * ```typescript
 * const channel = new PushChannel();
 * await channel.send(notification, delivery);
 * ```
 *
 * @since 2.0.0
 */
export class PushChannel extends EventEmitter {
  private devices: Map<string, any> = new Map();
  private isConfigured = false;
  private vapidKeys: any = null;

  constructor() {
    super();
  }

  /**
   * Configures the push channel
   *
   * @param config - Push notification configuration
   *
   * @example
   * ```typescript
   * channel.configure({
   *   vapidKeys: { publicKey: '...', privateKey: '...' },
   *   gcmApiKey: '...'
   * });
   * ```
   */
  configure(config: any): void {
    this.vapidKeys = config.vapidKeys;
    this.isConfigured = true;
    this.emit('channel:configured');
  }

  /**
   * Registers a device for push notifications
   *
   * @param userId - User ID
   * @param deviceInfo - Device information
   *
   * @example
   * ```typescript
   * channel.registerDevice('user-123', {
   *   endpoint: 'https://fcm.googleapis.com/fcm/send/...',
   *   keys: { p256dh: '...', auth: '...' },
   *   platform: 'web'
   * });
   * ```
   */
  registerDevice(userId: string, deviceInfo: any): void {
    if (!this.devices.has(userId)) {
      this.devices.set(userId, []);
    }

    const userDevices = this.devices.get(userId)!;
    userDevices.push({
      ...deviceInfo,
      registeredAt: Date.now(),
      lastUsed: Date.now()
    });

    this.emit('device:registered', { userId, deviceInfo });
  }

  /**
   * Unregisters a device
   *
   * @param userId - User ID
   * @param deviceId - Device ID
   *
   * @example
   * ```typescript
   * channel.unregisterDevice('user-123', 'device-456');
   * ```
   */
  unregisterDevice(userId: string, deviceId: string): void {
    const userDevices = this.devices.get(userId);
    if (userDevices) {
      const filteredDevices = userDevices.filter((device: any) => device.id !== deviceId);
      this.devices.set(userId, filteredDevices);
      this.emit('device:unregistered', { userId, deviceId });
    }
  }

  /**
   * Sends a notification via push
   *
   * @param notification - Notification to send
   * @param delivery - Delivery configuration (optional)
   * @returns Promise resolving when sent
   *
   * @example
   * ```typescript
   * await channel.send(notification, delivery);
   * ```
   */
  async send(notification: NotificationMessage | Notification, delivery?: NotificationDelivery): Promise<void> {
    if (!this.isConfigured) {
      throw new Error('Push channel not configured');
    }

    try {
      // Get user devices
      const userDevices = this.devices.get(notification.userId || '');
      if (!userDevices || userDevices.length === 0) {
        throw new Error(`No devices registered for user ${notification.userId}`);
      }

      // Prepare push payload
      const payload = this.preparePushPayload(notification);

      // Send to all user devices
      const promises = userDevices.map((device: any) =>
        this.sendToDevice(device, payload)
      );

      await Promise.allSettled(promises);

      // Update delivery status
      delivery.status = 'delivered';
      delivery.deliveredAt = Date.now();

      this.emit('notification:sent', { notification, delivery });
    } catch (error) {
      delivery.status = 'failed';
      delivery.error = error instanceof Error ? error.message : 'Unknown error';
      delivery.attempts++;

      this.emit('notification:failed', { notification, delivery, error });
      throw error;
    }
  }

  /**
   * Gets the channel type
   *
   * @returns Channel type
   */
  getChannelType(): NotificationChannel {
    return 'push';
  }

  /**
   * Checks if the channel is available
   *
   * @returns True if available
   */
  isAvailable(): boolean {
    return this.isConfigured && this.devices.size > 0;
  }

  /**
   * Gets channel statistics
   *
   * @returns Channel statistics
   */
  getStats(): {
    isConfigured: boolean;
    totalDevices: number;
    totalUsers: number;
    lastSent?: number;
  } {
    const totalDevices = Array.from(this.devices.values())
      .reduce((total, devices) => total + devices.length, 0);

    return {
      isConfigured: this.isConfigured,
      totalDevices,
      totalUsers: this.devices.size
    };
  }

  /**
   * Stops the push channel
   *
   * @returns Promise resolving when stopped
   */
  async stop(): Promise<void> {
    this.isConfigured = false;
    this.vapidKeys = null;
    this.devices.clear();
    this.emit('channel:stopped');
  }

  private preparePushPayload(notification: NotificationMessage): any {
    const priorityEmoji = this.getPriorityEmoji(notification.priority);
    const categoryEmoji = this.getCategoryEmoji(notification.category);

    return {
      title: `${priorityEmoji} ${notification.title}`,
      body: notification.message,
      icon: '/icons/notification-icon.png',
      badge: '/icons/badge-icon.png',
      data: {
        notificationId: notification.id,
        type: notification.type,
        priority: notification.priority,
        category: notification.category,
        source: notification.source,
        timestamp: notification.timestamp,
        actions: notification.actions || [],
        metadata: notification.metadata || {}
      },
      actions: this.prepareActions(notification.actions || []),
      requireInteraction: notification.priority === 'critical',
      silent: notification.priority === 'low',
      tag: `tappmcp-${notification.category}`,
      renotify: notification.priority === 'critical',
      vibrate: notification.priority === 'critical' ? [200, 100, 200] : undefined,
      timestamp: notification.timestamp
    };
  }

  private prepareActions(actions: any[]): any[] {
    return actions.slice(0, 2).map(action => ({
      action: action.action,
      title: action.label,
      icon: this.getActionIcon(action.action)
    }));
  }

  private getActionIcon(action: string): string {
    const icons: Record<string, string> = {
      'view': '/icons/view-icon.png',
      'dismiss': '/icons/dismiss-icon.png',
      'approve': '/icons/approve-icon.png',
      'reject': '/icons/reject-icon.png',
      'open': '/icons/open-icon.png'
    };
    return icons[action] || '/icons/default-action-icon.png';
  }

  private getPriorityEmoji(priority: string): string {
    const emojis: Record<string, string> = {
      'critical': '🚨',
      'high': '⚠️',
      'medium': 'ℹ️',
      'low': '📢'
    };
    return emojis[priority] || '📢';
  }

  private getCategoryEmoji(category: string): string {
    const emojis: Record<string, string> = {
      'workflow': '🔄',
      'system': '⚙️',
      'performance': '📊',
      'security': '🔒',
      'user': '👤',
      'business': '💼'
    };
    return emojis[category] || '📢';
  }

  private async sendToDevice(device: any, payload: any): Promise<void> {
    try {
      // In a real implementation, this would use web-push library
      console.log('Sending push notification to device:', {
        endpoint: device.endpoint,
        platform: device.platform,
        title: payload.title,
        body: payload.body
      });

      // Simulate push notification sending
      await new Promise(resolve => setTimeout(resolve, 50));

      // Update device last used time
      device.lastUsed = Date.now();

      this.emit('push:sent', { device, payload });
    } catch (error) {
      this.emit('push:failed', { device, payload, error });
      throw error;
    }
  }
}
