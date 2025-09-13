import { EventEmitter } from 'events';

export interface RealTimeData {
  workflows: WorkflowData[];
  metrics: PerformanceMetrics;
  valueMetrics: ValueMetrics;
  notifications: NotificationData[];
  systemHealth: SystemHealthData;
}

export interface WorkflowData {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused' | 'queued';
  phase: string;
  progress: number;
  startTime?: number;
  endTime?: number;
  estimatedCompletion?: number;
  details?: {
    tokensUsed: number;
    tokensSaved: number;
    bugsFound: number;
    qualityScore: number;
    efficiency: number;
    costSavings: number;
    timeSaved: number;
  };
}

export interface PerformanceMetrics {
  memory: number;
  cpu: number;
  responseTime: number;
  errorRate: number;
  activeConnections: number;
  uptime: number;
  timestamp: number;
}

export interface ValueMetrics {
  totalTokensUsed: number;
  totalTokensSaved: number;
  totalBugsFound: number;
  totalCostSavings: number;
  totalTimeSaved: number;
  averageQualityScore: number;
  context7CacheHitRate: number;
  workflowEfficiency: number;
  timestamp: number;
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  read: boolean;
}

export interface SystemHealthData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    mcp: 'up' | 'down' | 'degraded';
    context7: 'up' | 'down' | 'degraded';
    websocket: 'up' | 'down' | 'degraded';
    database: 'up' | 'down' | 'degraded';
  };
  lastUpdate: number;
}

export class RealTimeDataManager extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private isConnected = false;
  private data: RealTimeData;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(private wsUrl: string = 'ws://localhost:3000') {
    super();
    this.data = this.initializeEmptyData();
    this.startDataUpdateLoop();
  }

  private initializeEmptyData(): RealTimeData {
    return {
      workflows: [],
      metrics: {
        memory: 0,
        cpu: 0,
        responseTime: 0,
        errorRate: 0,
        activeConnections: 0,
        uptime: 0,
        timestamp: Date.now()
      },
      valueMetrics: {
        totalTokensUsed: 0,
        totalTokensSaved: 0,
        totalBugsFound: 0,
        totalCostSavings: 0,
        totalTimeSaved: 0,
        averageQualityScore: 0,
        context7CacheHitRate: 0,
        workflowEfficiency: 0,
        timestamp: Date.now()
      },
      notifications: [],
      systemHealth: {
        status: 'unhealthy',
        services: {
          mcp: 'down',
          context7: 'down',
          websocket: 'down',
          database: 'down'
        },
        lastUpdate: Date.now()
      }
    };
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.emit('connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnected = false;
          this.emit('disconnected');
          this.handleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.emit('error', error);
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private handleMessage(message: any): void {
    switch (message.type) {
      case 'workflow_status_update':
        this.updateWorkflowData(message.data);
        break;
      case 'performance_metrics':
        this.updatePerformanceMetrics(message.data);
        break;
      case 'value_metrics':
        this.updateValueMetrics(message.data);
        break;
      case 'notification':
        this.addNotification(message.data);
        break;
      case 'system_health':
        this.updateSystemHealth(message.data);
        break;
      case 'full_update':
        this.updateAllData(message.data);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private updateWorkflowData(workflowData: WorkflowData): void {
    const existingIndex = this.data.workflows.findIndex(w => w.id === workflowData.id);

    if (existingIndex >= 0) {
      this.data.workflows[existingIndex] = { ...this.data.workflows[existingIndex], ...workflowData };
    } else {
      this.data.workflows.push(workflowData);
    }

    this.emit('workflowUpdate', workflowData);
    this.emit('dataUpdate', this.data);
  }

  private updatePerformanceMetrics(metrics: PerformanceMetrics): void {
    this.data.metrics = { ...this.data.metrics, ...metrics };
    this.emit('performanceUpdate', metrics);
    this.emit('dataUpdate', this.data);
  }

  private updateValueMetrics(valueMetrics: ValueMetrics): void {
    this.data.valueMetrics = { ...this.data.valueMetrics, ...valueMetrics };
    this.emit('valueUpdate', valueMetrics);
    this.emit('dataUpdate', this.data);
  }

  private addNotification(notification: NotificationData): void {
    this.data.notifications.unshift(notification);

    // Keep only last 50 notifications
    if (this.data.notifications.length > 50) {
      this.data.notifications = this.data.notifications.slice(0, 50);
    }

    this.emit('notification', notification);
    this.emit('dataUpdate', this.data);
  }

  private updateSystemHealth(health: SystemHealthData): void {
    this.data.systemHealth = { ...this.data.systemHealth, ...health };
    this.emit('healthUpdate', health);
    this.emit('dataUpdate', this.data);
  }

  private updateAllData(data: RealTimeData): void {
    this.data = { ...this.data, ...data };
    this.emit('dataUpdate', this.data);
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
    }
  }

  private startDataUpdateLoop(): void {
    // Simulate data updates when not connected to WebSocket
    this.updateInterval = setInterval(() => {
      if (!this.isConnected) {
        this.simulateDataUpdates();
      }
    }, 5000);
  }

  private simulateDataUpdates(): void {
    // Generate mock data for demonstration
    const now = Date.now();

    // Update performance metrics
    this.updatePerformanceMetrics({
      memory: 45 + Math.random() * 20,
      cpu: 30 + Math.random() * 25,
      responseTime: 50 + Math.random() * 100,
      errorRate: Math.random() * 0.02,
      activeConnections: Math.floor(Math.random() * 10) + 1,
      uptime: now - (Date.now() - 3600000), // 1 hour uptime
      timestamp: now
    });

    // Update value metrics
    this.updateValueMetrics({
      totalTokensUsed: 10000 + Math.random() * 5000,
      totalTokensSaved: 5000 + Math.random() * 3000,
      totalBugsFound: Math.floor(Math.random() * 10),
      totalCostSavings: 25 + Math.random() * 50,
      totalTimeSaved: 1800 + Math.random() * 3600, // 30-90 minutes
      averageQualityScore: 75 + Math.random() * 20,
      context7CacheHitRate: 60 + Math.random() * 30,
      workflowEfficiency: 70 + Math.random() * 25,
      timestamp: now
    });

    // Update workflows occasionally
    if (Math.random() < 0.3) {
      const workflowId = `workflow-${Math.floor(Math.random() * 3) + 1}`;
      const statuses = ['pending', 'running', 'completed', 'failed'] as const;
      const phases = ['Analysis', 'Planning', 'Generation', 'Validation', 'Completion'];

      this.updateWorkflowData({
        id: workflowId,
        name: `Smart ${phases[Math.floor(Math.random() * phases.length)]}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        phase: phases[Math.floor(Math.random() * phases.length)],
        progress: Math.floor(Math.random() * 100),
        startTime: now - Math.random() * 300000,
        endTime: Math.random() > 0.5 ? now - Math.random() * 60000 : 0,
        details: {
          tokensUsed: Math.floor(Math.random() * 2000) + 500,
          tokensSaved: Math.floor(Math.random() * 1500) + 200,
          bugsFound: Math.floor(Math.random() * 5),
          qualityScore: 70 + Math.random() * 25,
          efficiency: 65 + Math.random() * 30,
          costSavings: 0.5 + Math.random() * 2.0,
          timeSaved: 300 + Math.random() * 600
        }
      });
    }
  }

  public getData(): RealTimeData {
    return { ...this.data };
  }

  public getWorkflows(): WorkflowData[] {
    return [...this.data.workflows];
  }

  public getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.data.metrics };
  }

  public getValueMetrics(): ValueMetrics {
    return { ...this.data.valueMetrics };
  }

  public getNotifications(): NotificationData[] {
    return [...this.data.notifications];
  }

  public getSystemHealth(): SystemHealthData {
    return { ...this.data.systemHealth };
  }

  public markNotificationAsRead(notificationId: string): void {
    const notification = this.data.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.emit('notificationRead', notificationId);
      this.emit('dataUpdate', this.data);
    }
  }

  public clearNotifications(): void {
    this.data.notifications = [];
    this.emit('notificationsCleared');
    this.emit('dataUpdate', this.data);
  }

  public isWebSocketConnected(): boolean {
    return this.isConnected;
  }

  public getConnectionStatus(): {
    connected: boolean;
    reconnectAttempts: number;
    maxReconnectAttempts: number;
  } {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }
}

export default RealTimeDataManager;
