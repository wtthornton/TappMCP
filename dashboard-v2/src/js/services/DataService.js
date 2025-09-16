/**
 * DataService - Real-time data integration for TappMCP Dashboard
 * Handles WebSocket connections, API calls, and data caching
 */

export class DataService {
  constructor() {
    this.baseUrl = window.location.origin.replace(':3000', ':8080');
    this.wsUrl = `ws://${window.location.hostname}:8080`;
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.eventListeners = new Map();
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds

    this.init();
  }

  init() {
    this.setupWebSocket();
    this.setupCacheCleanup();
  }

  setupWebSocket() {
    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        console.log('🔌 WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connection', true);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        this.isConnected = false;
        this.emit('connection', false);
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };

    } catch (error) {
      console.error('Failed to setup WebSocket:', error);
      this.emit('error', error);
    }
  }

  handleWebSocketMessage(data) {
    switch (data.type) {
      case 'performance_metrics':
        this.cacheData('metrics', data.data);
        this.emit('data', data.data);
        break;

      case 'workflow_status_update':
        this.cacheData('workflows', data.data);
        this.emit('workflow', data.data);
        break;

      case 'notification':
        this.emit('notification', data.data);
        break;

      case 'system_health':
        this.cacheData('health', data.data);
        this.emit('health', data.data);
        break;

      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        this.setupWebSocket();
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached');
      this.emit('error', new Error('Max reconnection attempts reached'));
    }
  }

  async connect() {
    if (this.isConnected) {
      return true;
    }

    try {
      // Test API connection first
      const response = await fetch(`${this.baseUrl}/health`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const health = await response.json();
      console.log('✅ API connection established:', health);

      return true;
    } catch (error) {
      console.error('Failed to connect to API:', error);
      this.emit('error', error);
      return false;
    }
  }

  async getMetrics() {
    try {
      const response = await fetch(`${this.baseUrl}/metrics`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        this.cacheData('metrics', data.data);
        return data.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      this.emit('error', error);

      // Return cached data if available
      const cached = this.getCachedData('metrics');
      if (cached) {
        console.log('Using cached metrics data');
        return cached;
      }

      throw error;
    }
  }

  async getHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.cacheData('health', data);
      return data;
    } catch (error) {
      console.error('Failed to fetch health:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async getDetailedHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/health/detailed`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.cacheData('detailedHealth', data);
      return data;
    } catch (error) {
      console.error('Failed to fetch detailed health:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async getSystemMetrics() {
    try {
      const response = await fetch(`${this.baseUrl}/metrics/system`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.cacheData('systemMetrics', data);
      return data;
    } catch (error) {
      console.error('Failed to fetch system metrics:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async getPerformanceMetrics() {
    try {
      const response = await fetch(`${this.baseUrl}/metrics/performance`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.cacheData('performanceMetrics', data);
      return data;
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async getLogAnalysis() {
    try {
      const response = await fetch(`${this.baseUrl}/logs/analysis`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.cacheData('logAnalysis', data);
      return data;
    } catch (error) {
      console.error('Failed to fetch log analysis:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async getContext7Metrics() {
    try {
      const response = await fetch(`${this.baseUrl}/context7/metrics`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.cacheData('context7Metrics', data);
      return data;
    } catch (error) {
      console.error('Failed to fetch Context7 metrics:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async testContext7API(endpoint = 'documentation', topic = 'javascript best practices') {
    try {
      const response = await fetch(`${this.baseUrl}/context7/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint, topic }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to test Context7 API:', error);
      this.emit('error', error);
      throw error;
    }
  }

  // Event system
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Caching system
  cacheData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setupCacheCleanup() {
    // Clean up expired cache entries every minute
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.cache.entries()) {
        if (now - value.timestamp > this.cacheTimeout) {
          this.cache.delete(key);
        }
      }
    }, 60000);
  }

  // Utility methods
  formatBytes(bytes) {
    if (!bytes) return 'N/A';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  formatPercentage(value) {
    if (value === null || value === undefined) return 'N/A';
    return value.toFixed(1) + '%';
  }

  formatTimestamp(timestamp) {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  }

  getStatusClass(status) {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'success':
        return 'success';
      case 'warning':
      case 'warn':
        return 'warning';
      case 'critical':
      case 'error':
        return 'error';
      default:
        return 'unknown';
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  // Public API
  get connectionStatus() {
    return this.isConnected;
  }

  get baseURL() {
    return this.baseUrl;
  }

  get websocketURL() {
    return this.wsUrl;
  }
}
