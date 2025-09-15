/**
 * WebSocket Notification Channel
 *
 * Handles sending real-time notifications via WebSocket
 */

import { WebSocket } from 'ws';
import { NotificationMessage, NotificationChannel } from '../types.js';

export interface WebSocketConfig {
  enabled: boolean;
  clients: Set<WebSocket>;
}

export class WebSocketChannel {
  private config: WebSocketConfig;
  private isConfigured = false;

  constructor(config: WebSocketConfig) {
    this.config = config;
    this.initializeWebSocket();
  }

  private initializeWebSocket() {
    if (!this.config.enabled) {
      console.log('🌐 WebSocket notifications disabled');
      return;
    }

    console.log('🌐 WebSocket notifications configured successfully');
    this.isConfigured = true;
  }

  async send(notification: NotificationMessage): Promise<boolean> {
    if (!this.isConfigured) {
      console.warn('🌐 WebSocket channel not configured, skipping notification');
      return false;
    }

    if (this.config.clients.size === 0) {
      console.warn('🌐 No WebSocket clients connected');
      return false;
    }

    try {
      const message = {
        type: 'notification',
        data: {
          ...notification,
          channel: 'websocket',
          timestamp: Date.now(),
        },
      };

      const messageStr = JSON.stringify(message);
      let sentCount = 0;

      // Send to all connected clients
      this.config.clients.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          try {
            ws.send(messageStr);
            sentCount++;
          } catch (error) {
            console.error('🌐 Failed to send WebSocket notification:', error);
          }
        }
      });

      console.log(`🌐 WebSocket notification sent to ${sentCount} clients`);
      return sentCount > 0;
    } catch (error) {
      console.error('🌐 Failed to send WebSocket notification:', error);
      return false;
    }
  }

  addClient(ws: WebSocket): void {
    this.config.clients.add(ws);
    console.log('🌐 WebSocket client connected, total clients:', this.config.clients.size);
  }

  removeClient(ws: WebSocket): void {
    this.config.clients.delete(ws);
    console.log('🌐 WebSocket client disconnected, total clients:', this.config.clients.size);
  }

  isAvailable(): boolean {
    return this.isConfigured;
  }

  getChannelName(): string {
    return 'websocket';
  }

  getClientCount(): number {
    return this.config.clients.size;
  }
}
