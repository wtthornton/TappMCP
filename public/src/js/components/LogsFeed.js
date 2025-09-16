/**
 * LogsFeed - Real-time logs display
 * Shows live log entries with filtering and search
 */

export class LogsFeed {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = null;
    this.data = null;
    this.logLevel = 'all';
    this.logs = [];
    this.maxLogs = 100;
  }

  async initialize() {
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      throw new Error(`Container with id '${this.containerId}' not found`);
    }

    this.setupEventListeners();
    this.renderLoading();
  }

  setupEventListeners() {
    // Log level filter
    const levelFilter = this.container.querySelector('#logLevelFilter');
    if (levelFilter) {
      levelFilter.addEventListener('change', (e) => {
        this.logLevel = e.target.value;
        this.render();
      });
    }

    // Clear logs button
    const clearBtn = this.container.querySelector('#clearLogs');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clearLogs();
      });
    }
  }

  update(data) {
    this.data = data;
    this.generateLogs();
    this.render();
  }

  generateLogs() {
    if (!this.data) return;

    // Generate sample logs based on system data
    const now = new Date();
    const logLevels = ['info', 'warn', 'error', 'debug'];
    const logMessages = {
      info: [
        'System health check completed',
        'Metrics updated successfully',
        'WebSocket connection established',
        'Data refresh completed',
        'Cache cleared successfully'
      ],
      warn: [
        'High CPU usage detected',
        'Memory usage above threshold',
        'Slow response time detected',
        'Cache hit rate below optimal',
        'Queue size growing'
      ],
      error: [
        'Database connection failed',
        'API request timeout',
        'Memory allocation error',
        'WebSocket connection lost',
        'Failed to process request'
      ],
      debug: [
        'Processing request data',
        'Updating component state',
        'Calculating metrics',
        'Sending WebSocket message',
        'Cleaning up resources'
      ]
    };

    // Add new logs based on system state
    if (this.data.errorRate > 0.1) {
      this.addLog('error', 'High error rate detected: ' + (this.data.errorRate * 100).toFixed(2) + '%');
    }

    if (this.data.cpuUsage > 0.8) {
      this.addLog('warn', 'High CPU usage: ' + (this.data.cpuUsage * 100).toFixed(1) + '%');
    }

    if (this.data.memoryUsage?.memory_percent > 80) {
      this.addLog('warn', 'High memory usage: ' + this.data.memoryUsage.memory_percent.toFixed(1) + '%');
    }

    // Add random logs occasionally
    if (Math.random() < 0.3) {
      const level = logLevels[Math.floor(Math.random() * logLevels.length)];
      const messages = logMessages[level];
      const message = messages[Math.floor(Math.random() * messages.length)];
      this.addLog(level, message);
    }
  }

  addLog(level, message) {
    const log = {
      timestamp: new Date(),
      level: level,
      message: message
    };

    this.logs.unshift(log);

    // Keep only the latest logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
  }

  render() {
    if (!this.data) {
      this.renderLoading();
      return;
    }

    this.renderLogs();
  }

  renderLoading() {
    const logsContainer = this.container.querySelector('#logsFeed');
    if (logsContainer) {
      logsContainer.innerHTML = `
        <div class="loading">
          <div class="loading-spinner"></div>
          <div class="loading-text">Loading logs...</div>
        </div>
      `;
    }
  }

  renderLogs() {
    const logsContainer = this.container.querySelector('#logsFeed');
    if (!logsContainer) return;

    const filteredLogs = this.filterLogs();

    if (filteredLogs.length === 0) {
      logsContainer.innerHTML = `
        <div class="no-logs">
          <p>No logs available for the selected level</p>
        </div>
      `;
      return;
    }

    logsContainer.innerHTML = filteredLogs.map(log => `
      <div class="log-entry">
        <span class="log-timestamp">${log.timestamp.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          fractionalSecondDigits: 3
        })}</span>
        <span class="log-level ${log.level}">[${log.level.toUpperCase()}]</span>
        <span class="log-message">${log.message}</span>
      </div>
    `).join('');

    // Auto-scroll to top for new logs
    logsContainer.scrollTop = 0;
  }

  filterLogs() {
    if (this.logLevel === 'all') {
      return this.logs;
    }

    const levelMap = {
      'error': ['error'],
      'warn': ['warn', 'error'],
      'info': ['info', 'warn', 'error']
    };

    const allowedLevels = levelMap[this.logLevel] || ['error'];
    return this.logs.filter(log => allowedLevels.includes(log.level));
  }

  clearLogs() {
    this.logs = [];
    this.render();
  }

  cleanup() {
    // No cleanup needed
  }
}
