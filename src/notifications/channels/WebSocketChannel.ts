/**
 * WebSocket Notification Channel
 *
 * Handles real-time notification delivery via WebSocket connections
 * for immediate user feedback and interaction.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import { EventEmitter } from 'events';
import { NotificationMessage, NotificationDelivery, NotificationChannel, Notification } from '../types.js';
import { WebSocketServer } from '../../websocket/WebSocketServer.js';

/**
 * WebSocket Notification Channel
 *
 * @example
 * ```typescript
 * const channel = new WebSocketChannel();
 * await channel.send(notification, delivery);
 * ```
 *
 * @since 2.0.0
 */
export class WebSocketChannel extends EventEmitter {
  private connections: Map<string, any> = new Map();
  private isConnected = false;
  private wsServer: WebSocketServer | null = null;

  constructor(wsServer?: WebSocketServer) {
    super();
    this.wsServer = wsServer;
  }

  /**
   * Sends a notification via WebSocket
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
    try {
      // Use WebSocket server if available, otherwise use direct connections
      if (this.wsServer) {
        await this.sendViaServer(notification);
      } else {
        await this.sendViaConnection(notification, delivery);
      }
    } catch (error) {
      if (delivery) {
        delivery.status = 'failed';
        delivery.error = error instanceof Error ? error.message : 'Unknown error';
        delivery.attempts++;
      }

      this.emit('notification:failed', { notification, delivery, error });
      throw error;
    }
  }

  /**
   * Registers a WebSocket connection for a user
   *
   * @param userId - User ID
   * @param connection - WebSocket connection
   *
   * @example
   * ```typescript
   * channel.registerConnection('user-123', wsConnection);
   * ```
   */
  registerConnection(userId: string, connection: any): void {
    this.connections.set(userId, connection);
    this.isConnected = true;

    // Set up connection event handlers
    connection.on('close', () => {
      this.connections.delete(userId);
      this.emit('connection:closed', { userId });
    });

    connection.on('error', (error: Error) => {
      this.emit('connection:error', { userId, error });
    });

    this.emit('connection:registered', { userId });
  }

  /**
   * Unregisters a WebSocket connection
   *
   * @param userId - User ID
   *
   * @example
   * ```typescript
   * channel.unregisterConnection('user-123');
   * ```
   */
  unregisterConnection(userId: string): void {
    this.connections.delete(userId);
    this.emit('connection:unregistered', { userId });
  }

  /**
   * Gets the channel type
   *
   * @returns Channel type
   */
  getChannelType(): NotificationChannel {
    return 'websocket';
  }

  /**
   * Checks if the channel is available
   *
   * @returns True if available
   */
  isAvailable(): boolean {
    return this.isConnected && this.connections.size > 0;
  }

  /**
   * Gets connection statistics
   *
   * @returns Connection statistics
   */
  getStats(): {
    totalConnections: number;
    activeConnections: number;
    isConnected: boolean;
  } {
    const activeConnections = Array.from(this.connections.values()).filter(
      conn => conn.readyState === 1
    ).length;

    return {
      totalConnections: this.connections.size,
      activeConnections,
      isConnected: this.isConnected
    };
  }

  /**
   * Broadcasts a notification to all connected users
   *
   * @param notification - Notification to broadcast
   * @returns Promise resolving when broadcasted
   *
   * @example
   * ```typescript
   * await channel.broadcast(notification);
   * ```
   */
  async broadcast(notification: NotificationMessage): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const [userId, connection] of this.connections) {
      const delivery: NotificationDelivery = {
        id: `delivery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        notificationId: notification.id,
        channel: 'websocket',
        status: 'pending',
        attempts: 0,
        maxAttempts: 3,
        metadata: { userId }
      };

      promises.push(this.send(notification, delivery));
    }

    await Promise.allSettled(promises);
  }

  /**
   * Stops the WebSocket channel
   *
   * @returns Promise resolving when stopped
   */
  async stop(): Promise<void> {
    // Close all connections
    for (const [userId, connection] of this.connections) {
      if (connection.readyState === 1) {
        connection.close(1000, 'Service shutting down');
      }
    }

    this.connections.clear();
    this.isConnected = false;

    this.emit('channel:stopped');
  }

  /**
   * Sends notification via WebSocket server
   *
   * @param notification - Notification to send
   * @returns Promise resolving when sent
   *
   * @example
   * ```typescript
   * await channel.sendViaServer(notification);
   * ```
   */
  private async sendViaServer(notification: NotificationMessage | Notification): Promise<void> {
    if (!this.wsServer) {
      throw new Error('WebSocket server not available');
    }

    // Prepare WebSocket message
    const wsMessage = {
      type: 'notification',
      data: {
        id: notification.id,
        type: notification.type,
        priority: notification.priority,
        category: notification.category,
        title: notification.title,
        message: notification.message,
        actions: 'actions' in notification ? notification.actions : undefined,
        metadata: notification.metadata,
        timestamp: 'timestamp' in notification ? notification.timestamp : Date.now(),
        createdAt: notification.createdAt
      }
    };

    // Send via WebSocket server
    if (notification.userId) {
      // Send to specific user
      this.wsServer.sendToUser(notification.userId, wsMessage);
    } else {
      // Broadcast to all users
      this.wsServer.broadcast(wsMessage);
    }

    this.emit('notification:sent', { notification });
  }

  /**
   * Sends notification via direct connection
   *
   * @param notification - Notification to send
   * @param delivery - Delivery configuration
   * @returns Promise resolving when sent
   *
   * @example
   * ```typescript
   * await channel.sendViaConnection(notification, delivery);
   * ```
   */
  private async sendViaConnection(notification: NotificationMessage | Notification, delivery?: NotificationDelivery): Promise<void> {
    // Find WebSocket connection for user
    const connection = this.findConnectionForUser(notification.userId);

    if (!connection) {
      throw new Error(`No WebSocket connection found for user ${notification.userId}`);
    }

    // Prepare WebSocket message
    const wsMessage = {
      type: 'notification',
      data: {
        id: notification.id,
        type: notification.type,
        priority: notification.priority,
        category: notification.category,
        title: notification.title,
        message: notification.message,
        actions: 'actions' in notification ? notification.actions : undefined,
        metadata: notification.metadata,
        timestamp: 'timestamp' in notification ? notification.timestamp : Date.now(),
        createdAt: notification.createdAt
      }
    };

    // Send via WebSocket
    if (connection.readyState === 1) { // WebSocket.OPEN
      connection.send(JSON.stringify(wsMessage));

      // Update delivery status
      if (delivery) {
        delivery.status = 'delivered';
        delivery.deliveredAt = Date.now();
      }

      this.emit('notification:sent', { notification, delivery });
    } else {
      throw new Error('WebSocket connection is not open');
    }
  }

  private findConnectionForUser(userId: string): any {
    return this.connections.get(userId);
  }
}
