/**
 * Notification Types for TappMCP
 *
 * Defines types and interfaces for the notification system
 * used throughout the TappMCP platform.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

/**
 * Notification priority levels
 */
export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low' | 'info';

/**
 * Notification types
 */
export type NotificationType =
  | 'workflow_status'
  | 'performance_alert'
  | 'system_error'
  | 'user_action'
  | 'reminder'
  | 'update'
  | 'security';

/**
 * Notification channels
 */
export type NotificationChannel = 'websocket' | 'email' | 'push' | 'in_app';

/**
 * Notification status
 */
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

/**
 * User preference for notifications
 */
export interface NotificationPreference {
  userId: string;
  channel: NotificationChannel;
  type: NotificationType;
  priority: NotificationPriority;
  enabled: boolean;
  quietHours?: {
    start: string; // HH:MM format
    end: string; // HH:MM format
    timezone: string;
  };
}

/**
 * Notification message interface
 */
export interface NotificationMessage {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: Record<string, any>;
  userId?: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  createdAt: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  expiresAt?: Date;
  retryCount: number;
  maxRetries: number;
}

/**
 * Notification template interface
 */
export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  channel: NotificationChannel;
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Notification filter interface
 */
export interface NotificationFilter {
  userId?: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  channel?: NotificationChannel;
  status?: NotificationStatus;
  dateRange?: {
    start: Date;
    end: Date;
  };
  limit?: number;
  offset?: number;
}

/**
 * Notification statistics interface
 */
export interface NotificationStats {
  total: number;
  pending: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
  byChannel: Record<NotificationChannel, number>;
}

/**
 * Notification service configuration
 */
export interface NotificationServiceConfig {
  maxRetries: number;
  retryDelay: number;
  batchSize: number;
  batchDelay: number;
  enableQuietHours: boolean;
  enableBatching: boolean;
  enableFiltering: boolean;
  enableLearning: boolean;
}

/**
 * Notification channel configuration
 */
export interface ChannelConfig {
  websocket: {
    enabled: boolean;
    maxConnections: number;
    heartbeatInterval: number;
  };
  email: {
    enabled: boolean;
    smtp: {
      host: string;
      port: number;
      secure: boolean;
      auth: {
        user: string;
        pass: string;
      };
    };
    from: string;
    replyTo?: string;
  };
  push: {
    enabled: boolean;
    vapidKeys: {
      publicKey: string;
      privateKey: string;
    };
    gcmApiKey?: string;
  };
}

/**
 * Notification queue item
 */
export interface NotificationQueueItem {
  message: NotificationMessage;
  priority: number;
  scheduledFor: Date;
  attempts: number;
  lastAttempt?: Date;
  nextRetry?: Date;
}

/**
 * Notification batch
 */
export interface NotificationBatch {
  id: string;
  items: NotificationQueueItem[];
  channel: NotificationChannel;
  createdAt: Date;
  processedAt?: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

/**
 * Notification learning data
 */
export interface NotificationLearningData {
  userId: string;
  interactionType: 'click' | 'dismiss' | 'read' | 'ignore';
  notificationId: string;
  timestamp: Date;
  context: Record<string, any>;
}

/**
 * Notification analytics
 */
export interface NotificationAnalytics {
  deliveryRate: number;
  readRate: number;
  clickRate: number;
  dismissRate: number;
  averageDeliveryTime: number;
  averageReadTime: number;
  topTypes: Array<{ type: NotificationType; count: number }>;
  topChannels: Array<{ channel: NotificationChannel; count: number }>;
  userEngagement: Record<string, number>;
}

/**
 * Default notification configuration
 */
export const DEFAULT_NOTIFICATION_CONFIG: NotificationServiceConfig = {
  maxRetries: 3,
  retryDelay: 5000,
  batchSize: 100,
  batchDelay: 1000,
  enableQuietHours: true,
  enableBatching: true,
  enableFiltering: true,
  enableLearning: true,
};

/**
 * Priority weights for notification ordering
 */
export const PRIORITY_WEIGHTS: Record<NotificationPriority, number> = {
  critical: 100,
  high: 80,
  medium: 60,
  low: 40,
  info: 20,
};

/**
 * Notification type icons
 */
export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, string> = {
  workflow_status: 'workflow',
  performance_alert: 'warning',
  system_error: 'error',
  user_action: 'user',
  reminder: 'clock',
  update: 'info',
  security: 'shield',
};

/**
 * Channel display names
 */
export const CHANNEL_DISPLAY_NAMES: Record<NotificationChannel, string> = {
  websocket: 'Real-time',
  email: 'Email',
  push: 'Push Notification',
  in_app: 'In-App',
};
