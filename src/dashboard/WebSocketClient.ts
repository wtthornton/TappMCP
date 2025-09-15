/**
 * WebSocket Client for Real-Time Dashboard
 *
 * Provides real-time communication with TappMCP WebSocket server for
 * workflow status updates, performance metrics, and notifications.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import {
  WebSocketMessage,
  WorkflowStatusUpdate,
  PerformanceMetrics,
  NotificationMessage,
  WorkflowGraphUpdate,
  WEBSOCKET_EVENTS,
} from '../websocket/types.js';

// WebSocket type declaration for browser compatibility
declare global {
  interface WebSocket {
    send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void;
    close(code?: number, reason?: string): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
  }
}

/**
 * WebSocket Client for dashboard real-time communication
 *
 * @example
 * ```typescript
 * const client = new WebSocketClient('ws://localhost:3002');
 * client.connect();
 * client.on('workflow:status:update', (update) => console.log(update));
 * ```
 *
 * @since 2.0.0
 */
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private eventListeners: Map<string, Function[]> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(url: string = 'ws://localhost:3000') {
    this.url = url;
  }

  /**
   * Connects to the WebSocket server
   *
   * @example
   * ```typescript
   * client.connect();
   * ```
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
        resolve();
        return;
      }

      this.isConnecting = true;

      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.emit('connected');
          resolve();
        };

        this.ws.onmessage = event => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
            this.emit('error', { type: 'parse_error', error });
          }
        };

        this.ws.onclose = event => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          this.stopHeartbeat();
          this.emit('disconnected', { code: event.code, reason: event.reason });

          // Attempt to reconnect if not a clean close
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = error => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          this.emit('error', { type: 'connection_error', error });
          reject(error);
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnects from the WebSocket server
   *
   * @example
   * ```typescript
   * client.disconnect();
   * ```
   */
  disconnect(): void {
    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
    }
  }

  /**
   * Sends a message to the server
   *
   * @param type - Message type
   * @param data - Message data
   *
   * @example
   * ```typescript
   * client.send('subscribe', { eventTypes: ['workflow:status:update'] });
   * ```
   */
  send(type: string, data: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected, cannot send message');
      return;
    }

    const message: WebSocketMessage = {
      type,
      data,
      timestamp: Date.now(),
      id: this.generateMessageId(),
    };

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Subscribes to specific event types
   *
   * @param eventTypes - Array of event types to subscribe to
   * @param filters - Optional filters for events
   *
   * @example
   * ```typescript
   * client.subscribe(['workflow:status:update', 'performance:metrics']);
   * ```
   */
  subscribe(eventTypes: string[], filters?: Record<string, any>): void {
    this.send('subscribe', { eventTypes, filters });
  }

  /**
   * Unsubscribes from event types
   *
   * @param eventTypes - Array of event types to unsubscribe from
   *
   * @example
   * ```typescript
   * client.unsubscribe(['workflow:status:update']);
   * ```
   */
  unsubscribe(eventTypes: string[]): void {
    this.send('unsubscribe', { eventTypes });
  }

  /**
   * Authenticates with the server
   *
   * @param token - Authentication token
   * @param userId - User ID
   *
   * @example
   * ```typescript
   * client.authenticate('jwt-token', 'user-123');
   * ```
   */
  authenticate(token: string, userId: string): void {
    this.send(WEBSOCKET_EVENTS.AUTHENTICATE, { token, userId });
  }

  /**
   * Adds an event listener
   *
   * @param event - Event name
   * @param callback - Callback function
   *
   * @example
   * ```typescript
   * client.on('workflow:status:update', (update) => console.log(update));
   * ```
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * Removes an event listener
   *
   * @param event - Event name
   * @param callback - Callback function to remove
   *
   * @example
   * ```typescript
   * client.off('workflow:status:update', callback);
   * ```
   */
  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Gets the connection status
   *
   * @returns Connection status information
   *
   * @example
   * ```typescript
   * const status = client.getConnectionStatus();
   * console.log('Connected:', status.connected);
   * ```
   */
  getConnectionStatus(): {
    connected: boolean;
    connecting: boolean;
    reconnectAttempts: number;
    url: string;
  } {
    return {
      connected: this.ws?.readyState === WebSocket.OPEN,
      connecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      url: this.url,
    };
  }

  private handleMessage(message: WebSocketMessage): void {
    // Emit the specific event type
    this.emit(message.type, message.data);

    // Emit generic message event
    this.emit('message', message);

    // Handle specific message types
    switch (message.type) {
      case WEBSOCKET_EVENTS.WORKFLOW_STATUS_UPDATE:
        this.emit('workflow:status:update', message.data as WorkflowStatusUpdate);
        break;

      case WEBSOCKET_EVENTS.WORKFLOW_PROGRESS_UPDATE:
        this.emit('workflow:progress:update', message.data);
        break;

      case WEBSOCKET_EVENTS.WORKFLOW_COMPLETED:
        this.emit('workflow:completed', message.data);
        break;

      case WEBSOCKET_EVENTS.WORKFLOW_FAILED:
        this.emit('workflow:failed', message.data);
        break;

      case WEBSOCKET_EVENTS.PERFORMANCE_METRICS:
        this.emit('performance:metrics', message.data as PerformanceMetrics);
        break;

      case WEBSOCKET_EVENTS.PERFORMANCE_ALERT:
        this.emit('performance:alert', message.data);
        break;

      case WEBSOCKET_EVENTS.NOTIFICATION_SEND:
        this.emit('notification:send', message.data as NotificationMessage);
        break;

      case WEBSOCKET_EVENTS.WORKFLOW_GRAPH_UPDATE:
        this.emit('workflow:graph:update', message.data as WorkflowGraphUpdate);
        break;

      case 'pong':
        // Heartbeat response
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send('ping', { timestamp: Date.now() });
      }
    }, 30000); // Send ping every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

    setTimeout(() => {
      if (this.reconnectAttempts <= this.maxReconnectAttempts) {
        this.connect().catch(error => {
          console.error('Reconnect failed:', error);
        });
      }
    }, delay);
  }

  private generateMessageId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
