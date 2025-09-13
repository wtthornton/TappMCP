/**
 * Notification System Types and Interfaces
 *
 * Defines all types, interfaces, and constants for the TappMCP notification system
 * including notification types, priorities, channels, and user preferences.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

export type NotificationType = 'info' | 'warning' | 'error' | 'success' | 'critical';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';
export type NotificationChannel = 'websocket' | 'email' | 'push' | 'sms' | 'in_app';
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'dismissed' | 'failed';
export type NotificationCategory = 'workflow' | 'system' | 'performance' | 'security' | 'user' | 'business';

export interface NotificationMessage {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  category: NotificationCategory;
  title: string;
  message: string;
  data?: Record<string, any>;
  actions?: NotificationAction[];
  metadata?: NotificationMetadata;
  timestamp: number;
  expiresAt?: number;
  userId?: string;
  workflowId?: string;
  source: string;
}

export interface NotificationAction {
  id: string;
  label: string;
  action: string;
  data?: Record<string, any>;
  style?: 'primary' | 'secondary' | 'danger' | 'success';
  requiresConfirmation?: boolean;
}

export interface NotificationMetadata {
  source: string;
  version: string;
  tags: string[];
  context: Record<string, any>;
  trackingId?: string;
  correlationId?: string;
}

export interface UserNotificationPreferences {
  userId: string;
  channels: ChannelPreferences;
  categories: CategoryPreferences;
  filters: NotificationFilters;
  quietHours: QuietHours;
  batching: BatchingSettings;
  learning: LearningSettings;
  lastUpdated: number;
}

export interface ChannelPreferences {
  websocket: boolean;
  email: boolean;
  push: boolean;
  sms: boolean;
  in_app: boolean;
}

export interface CategoryPreferences {
  workflow: NotificationPriority;
  system: NotificationPriority;
  performance: NotificationPriority;
  security: NotificationPriority;
  user: NotificationPriority;
  business: NotificationPriority;
}

export interface NotificationFilters {
  keywords: string[];
  blockedKeywords: string[];
  sources: string[];
  blockedSources: string[];
  workflows: string[];
  blockedWorkflows: string[];
  minPriority: NotificationPriority;
  maxFrequency: number; // notifications per hour
}

export interface QuietHours {
  enabled: boolean;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  timezone: string;
  days: number[]; // 0-6 (Sunday-Saturday)
}

export interface BatchingSettings {
  enabled: boolean;
  maxBatchSize: number;
  maxWaitTime: number; // milliseconds
  categories: string[]; // categories to batch
}

export interface LearningSettings {
  enabled: boolean;
  feedbackWeight: number; // 0-1
  interactionWeight: number; // 0-1
  decayRate: number; // 0-1
  minSamples: number;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  category: NotificationCategory;
  template: string;
  variables: string[];
  defaultPriority: NotificationPriority;
  channels: NotificationChannel[];
  metadata: Record<string, any>;
}

export interface NotificationDelivery {
  id: string;
  notificationId: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  attempts: number;
  maxAttempts: number;
  lastAttempt?: number;
  nextAttempt?: number;
  error?: string;
  deliveredAt?: number;
  readAt?: number;
  dismissedAt?: number;
  metadata: Record<string, any>;
}

export interface NotificationHistory {
  userId: string;
  notifications: NotificationMessage[];
  totalCount: number;
  unreadCount: number;
  lastNotification?: number;
  categories: Record<NotificationCategory, number>;
  channels: Record<NotificationChannel, number>;
}

export interface NotificationAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalDismissed: number;
  deliveryRate: number;
  readRate: number;
  dismissalRate: number;
  averageDeliveryTime: number;
  channelPerformance: Record<NotificationChannel, ChannelAnalytics>;
  categoryPerformance: Record<NotificationCategory, CategoryAnalytics>;
  timeRange: {
    start: number;
    end: number;
  };
}

export interface ChannelAnalytics {
  sent: number;
  delivered: number;
  failed: number;
  deliveryRate: number;
  averageDeliveryTime: number;
  errorRate: number;
}

export interface CategoryAnalytics {
  sent: number;
  read: number;
  dismissed: number;
  readRate: number;
  dismissalRate: number;
  averageReadTime: number;
}

export interface NotificationQueue {
  id: string;
  notifications: NotificationMessage[];
  priority: NotificationPriority;
  createdAt: number;
  scheduledFor?: number;
  maxRetries: number;
  retryDelay: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface NotificationRule {
  id: string;
  name: string;
  description: string;
  conditions: NotificationCondition[];
  actions: NotificationRuleAction[];
  enabled: boolean;
  priority: number;
  createdAt: number;
  lastModified: number;
}

export interface NotificationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface NotificationRuleAction {
  type: 'send_notification' | 'modify_priority' | 'add_tag' | 'remove_tag' | 'delay' | 'suppress';
  parameters: Record<string, any>;
}

// Constants
export const NOTIFICATION_TYPES: Record<NotificationType, string> = {
  info: 'Information',
  warning: 'Warning',
  error: 'Error',
  success: 'Success',
  critical: 'Critical'
};

export const NOTIFICATION_PRIORITIES: Record<NotificationPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical'
};

export const NOTIFICATION_CHANNELS: Record<NotificationChannel, string> = {
  websocket: 'WebSocket',
  email: 'Email',
  push: 'Push Notification',
  sms: 'SMS',
  in_app: 'In-App'
};

export const NOTIFICATION_CATEGORIES: Record<NotificationCategory, string> = {
  workflow: 'Workflow',
  system: 'System',
  performance: 'Performance',
  security: 'Security',
  user: 'User',
  business: 'Business'
};

export const DEFAULT_USER_PREFERENCES: UserNotificationPreferences = {
  userId: '',
  channels: {
    websocket: true,
    email: true,
    push: true,
    sms: false,
    in_app: true
  },
  categories: {
    workflow: 'medium',
    system: 'high',
    performance: 'low',
    security: 'critical',
    user: 'medium',
    business: 'high'
  },
  filters: {
    keywords: [],
    blockedKeywords: [],
    sources: [],
    blockedSources: [],
    workflows: [],
    blockedWorkflows: [],
    minPriority: 'low',
    maxFrequency: 60
  },
  quietHours: {
    enabled: false,
    startTime: '22:00',
    endTime: '08:00',
    timezone: 'UTC',
    days: [0, 1, 2, 3, 4, 5, 6]
  },
  batching: {
    enabled: true,
    maxBatchSize: 5,
    maxWaitTime: 300000, // 5 minutes
    categories: ['workflow', 'performance']
  },
  learning: {
    enabled: true,
    feedbackWeight: 0.7,
    interactionWeight: 0.3,
    decayRate: 0.1,
    minSamples: 10
  },
  lastUpdated: Date.now()
};

export const NOTIFICATION_LIMITS = {
  MAX_NOTIFICATIONS_PER_USER: 1000,
  MAX_NOTIFICATIONS_PER_HOUR: 100,
  MAX_BATCH_SIZE: 50,
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 5000,
  NOTIFICATION_TTL_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
  QUEUE_PROCESSING_INTERVAL_MS: 1000,
  CLEANUP_INTERVAL_MS: 60 * 60 * 1000 // 1 hour
};
