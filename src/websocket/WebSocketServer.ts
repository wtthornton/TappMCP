/**
 * WebSocket Server for Real-Time Communication
 *
 * Provides real-time communication capabilities for TappMCP including
 * workflow status updates, performance metrics, notifications, and
 * interactive workflow visualization.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import { WebSocket, WebSocketServer as WSWebSocketServer } from 'ws';
import { EventEmitter } from 'events';
import {
  WebSocketMessage,
  ConnectionInfo,
  ClientSubscription,
  WEBSOCKET_EVENTS,
  WebSocketEventType
} from './types.js';

/**
 * WebSocket Server for handling real-time client connections
 *
 * @example
 * ```typescript
 * const wsServer = new WebSocketServer(8080);
 * wsServer.start();
 * wsServer.broadcast('workflow:status:update', { workflowId: '123', status: 'running' });
 * ```
 *
 * @since 2.0.0
 */
export class WebSocketServer extends EventEmitter {
  private wss: WSWebSocketServer;
  private connections: Map<string, WebSocket> = new Map();
  private connectionInfo: Map<string, ConnectionInfo> = new Map();
  private subscriptions: Map<string, ClientSubscription> = new Map();
  private isRunning = false;

  constructor(private port: number = 3001) {
    super();
    this.wss = new WSWebSocketServer({
      port: this.port,
      perMessageDeflate: false // Disable compression for better performance
    });

    this.setupEventHandlers();
  }

  /**
   * Starts the WebSocket server
   *
   * @example
   * ```typescript
   * wsServer.start();
   * ```
   */
  start(): void {
    if (this.isRunning) {
      return;
    }

    this.wss.on('connection', (ws: WebSocket, request) => {
      this.handleConnection(ws, request);
    });

    this.isRunning = true;
    this.emit('server:started', { port: this.port });
    console.log(`WebSocket server started on port ${this.port}`);
  }

  /**
   * Stops the WebSocket server
   *
   * @example
   * ```typescript
   * wsServer.stop();
   * ```
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    // Close all connections
    this.connections.forEach((ws) => {
      ws.close(1000, 'Server shutting down');
    });

    this.wss.close(() => {
      this.isRunning = false;
      this.emit('server:stopped');
      console.log('WebSocket server stopped');
    });
  }

  /**
   * Broadcasts a message to all connected clients
   *
   * @param eventType - Type of event to broadcast
   * @param data - Data to send
   * @param filters - Optional filters to apply
   *
   * @example
   * ```typescript
   * wsServer.broadcast('workflow:status:update', { workflowId: '123', status: 'running' });
   * ```
   */
  broadcast(eventType: WebSocketEventType, data: any, filters?: Record<string, any>): void {
    const message: WebSocketMessage = {
      type: eventType,
      data,
      timestamp: Date.now(),
      id: this.generateMessageId()
    };

    this.connections.forEach((ws, clientId) => {
      if (this.shouldSendToClient(clientId, eventType, filters)) {
        this.sendToWebSocket(ws, message);
      }
    });

    this.emit('message:broadcast', { eventType, data, clientCount: this.connections.size });
  }

  /**
   * Sends a message to a specific client
   *
   * @param clientId - ID of the client to send to
   * @param eventType - Type of event to send
   * @param data - Data to send
   *
   * @example
   * ```typescript
   * wsServer.sendToClient('client-123', 'notification:send', { title: 'Test', message: 'Hello' });
   * ```
   */
  sendToClient(clientId: string, eventType: WebSocketEventType, data: any): boolean {
    const ws = this.connections.get(clientId);
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    const message: WebSocketMessage = {
      type: eventType,
      data,
      timestamp: Date.now(),
      id: this.generateMessageId()
    };

    return this.sendToWebSocket(ws, message);
  }

  /**
   * Gets information about all connected clients
   *
   * @returns Array of connection information
   *
   * @example
   * ```typescript
   * const clients = wsServer.getConnectedClients();
   * console.log(`Connected clients: ${clients.length}`);
   * ```
   */
  getConnectedClients(): ConnectionInfo[] {
    return Array.from(this.connectionInfo.values());
  }

  /**
   * Gets the number of connected clients
   *
   * @returns Number of connected clients
   */
  getConnectionCount(): number {
    return this.connections.size;
  }

  /**
   * Checks if the server is running
   *
   * @returns True if server is running
   */
  isServerRunning(): boolean {
    return this.isRunning;
  }

  private setupEventHandlers(): void {
    this.wss.on('error', (error) => {
      this.emit('server:error', error);
      console.error('WebSocket server error:', error);
    });
  }

  private handleConnection(ws: WebSocket, request: any): void {
    const clientId = this.generateClientId();
    const ipAddress = request.socket.remoteAddress || 'unknown';
    const userAgent = request.headers['user-agent'] || 'unknown';

    // Store connection
    this.connections.set(clientId, ws);

    const connectionInfo: ConnectionInfo = {
      clientId,
      connectedAt: Date.now(),
      lastActivity: Date.now(),
      subscriptions: [],
      userAgent,
      ipAddress
    };
    this.connectionInfo.set(clientId, connectionInfo);

    this.emit('client:connected', connectionInfo);
    console.log(`Client connected: ${clientId} from ${ipAddress}`);

    // Send welcome message
    this.sendToWebSocket(ws, {
      type: WEBSOCKET_EVENTS.CONNECT,
      data: { clientId, serverTime: Date.now() },
      timestamp: Date.now(),
      id: this.generateMessageId()
    });

    // Handle incoming messages
    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString()) as WebSocketMessage;
        this.handleClientMessage(clientId, message);
        this.updateLastActivity(clientId);
      } catch (error) {
        console.error(`Error parsing message from ${clientId}:`, error);
        this.sendError(clientId, 'Invalid message format');
      }
    });

    // Handle connection close
    ws.on('close', (code: number, reason: Buffer) => {
      this.handleDisconnection(clientId, code, reason.toString());
    });

    // Handle connection errors
    ws.on('error', (error: Error) => {
      this.handleConnectionError(clientId, error);
    });
  }

  private handleClientMessage(clientId: string, message: WebSocketMessage): void {
    switch (message.type) {
      case WEBSOCKET_EVENTS.AUTHENTICATE:
        this.handleAuthentication(clientId, message.data);
        break;

      case 'subscribe':
        this.handleSubscription(clientId, message.data);
        break;

      case 'unsubscribe':
        this.handleUnsubscription(clientId, message.data);
        break;

      case 'ping':
        this.sendToClient(clientId, WEBSOCKET_EVENTS.PONG, { timestamp: Date.now() });
        break;

      default:
        this.emit('client:message', { clientId, message });
    }
  }

  private handleAuthentication(clientId: string, data: any): void {
    // Simple authentication - in production, implement proper JWT validation
    const { token, userId } = data;

    if (token && userId) {
      const connectionInfo = this.connectionInfo.get(clientId);
      if (connectionInfo) {
        connectionInfo.subscriptions.push({
          clientId,
          eventTypes: ['*'], // Subscribe to all events
          filters: {},
          timestamp: Date.now()
        });
        this.connectionInfo.set(clientId, connectionInfo);

        this.sendToClient(clientId, WEBSOCKET_EVENTS.AUTHENTICATED, {
          success: true,
          userId,
          timestamp: Date.now()
        });
      }
    } else {
      this.sendError(clientId, 'Authentication failed');
    }
  }

  private handleSubscription(clientId: string, data: any): void {
    const { eventTypes, filters } = data;

    const subscription: ClientSubscription = {
      clientId,
      eventTypes: eventTypes || ['*'],
      filters: filters || {},
      timestamp: Date.now()
    };

    this.subscriptions.set(clientId, subscription);

    const connectionInfo = this.connectionInfo.get(clientId);
    if (connectionInfo) {
      connectionInfo.subscriptions.push(subscription);
      this.connectionInfo.set(clientId, connectionInfo);
    }

    this.sendToClient(clientId, WEBSOCKET_EVENTS.SUBSCRIBED, {
      eventTypes,
      filters,
      timestamp: Date.now()
    });
  }

  private handleUnsubscription(clientId: string, data: any): void {
    this.subscriptions.delete(clientId);

    const connectionInfo = this.connectionInfo.get(clientId);
    if (connectionInfo) {
      connectionInfo.subscriptions = connectionInfo.subscriptions.filter(
        sub => sub.timestamp !== data.timestamp
      );
      this.connectionInfo.set(clientId, connectionInfo);
    }

    this.sendToClient(clientId, WEBSOCKET_EVENTS.UNSUBSCRIBED, {
      timestamp: Date.now()
    });
  }

  private handleDisconnection(clientId: string, code: number, reason: string): void {
    this.connections.delete(clientId);
    this.connectionInfo.delete(clientId);
    this.subscriptions.delete(clientId);

    this.emit('client:disconnected', { clientId, code, reason });
    console.log(`Client disconnected: ${clientId} (${code}) ${reason}`);
  }

  private handleConnectionError(clientId: string, error: Error): void {
    this.emit('client:error', { clientId, error });
    console.error(`Connection error for ${clientId}:`, error);
  }

  private shouldSendToClient(clientId: string, eventType: WebSocketEventType, filters?: Record<string, any>): boolean {
    const subscription = this.subscriptions.get(clientId);
    if (!subscription) {
      return false;
    }

    // Check if client is subscribed to this event type
    if (!subscription.eventTypes.includes('*') && !subscription.eventTypes.includes(eventType)) {
      return false;
    }

    // Apply filters if provided
    if (filters && subscription.filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (subscription.filters[key] && subscription.filters[key] !== value) {
          return false;
        }
      }
    }

    return true;
  }

  private sendToWebSocket(ws: WebSocket, message: WebSocketMessage): boolean {
    if (ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Error sending message to client:', error);
      return false;
    }
  }

  private sendError(clientId: string, message: string): void {
    const ws = this.connections.get(clientId);
    if (ws) {
      this.sendToWebSocket(ws, {
        type: 'error',
        data: { message },
        timestamp: Date.now(),
        id: this.generateMessageId()
      });
    }
  }

  private updateLastActivity(clientId: string): void {
    const connectionInfo = this.connectionInfo.get(clientId);
    if (connectionInfo) {
      connectionInfo.lastActivity = Date.now();
      this.connectionInfo.set(clientId, connectionInfo);
    }
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
