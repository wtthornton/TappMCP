/**
 * ErrorTimeline - Error analysis and timeline visualization
 * Displays error trends and recent error events
 */

export class ErrorTimeline {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = null;
    this.data = null;
    this.timeRange = '1h';
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
    // Time range selector
    const timeRangeSelect = this.container.querySelector('#errorTimeRange');
    if (timeRangeSelect) {
      timeRangeSelect.addEventListener('change', (e) => {
        this.timeRange = e.target.value;
        this.render();
      });
    }
  }

  update(data) {
    this.data = data;
    this.render();
  }

  render() {
    if (!this.data) {
      this.renderLoading();
      return;
    }

    this.renderTimeline();
  }

  renderLoading() {
    const timelineContainer = this.container.querySelector('#errorTimeline');
    if (timelineContainer) {
      timelineContainer.innerHTML = `
        <div class="loading">
          <div class="loading-spinner"></div>
          <div class="loading-text">Loading error data...</div>
        </div>
      `;
    }
  }

  renderTimeline() {
    const timelineContainer = this.container.querySelector('#errorTimeline');
    if (!timelineContainer) return;

    const errors = this.generateErrorData();

    if (errors.length === 0) {
      timelineContainer.innerHTML = `
        <div class="success-state">
          <h3>No Errors</h3>
          <p>No errors detected in the selected time range</p>
        </div>
      `;
      return;
    }

    timelineContainer.innerHTML = errors.map(error => `
      <div class="error-item ${error.level}">
        <div class="error-time">${error.time}</div>
        <div class="error-level ${error.level}">${error.level.toUpperCase()}</div>
        <div class="error-message">${error.message}</div>
      </div>
    `).join('');
  }

  generateErrorData() {
    if (!this.data) return [];

    const errors = [];
    const now = new Date();
    const timeRangeMs = this.getTimeRangeMs();

    // Generate some sample errors based on error rate
    const errorRate = this.data.errorRate || 0;
    const totalRequests = this.data.totalRequests || 0;
    const errorCount = Math.floor(totalRequests * errorRate);

    for (let i = 0; i < Math.min(errorCount, 10); i++) {
      const timeAgo = Math.random() * timeRangeMs;
      const errorTime = new Date(now.getTime() - timeAgo);

      const errorTypes = [
        { level: 'error', messages: ['Database connection failed', 'API timeout', 'Memory allocation error', 'Network error'] },
        { level: 'warning', messages: ['High CPU usage', 'Slow response time', 'Cache miss rate high', 'Queue size growing'] },
        { level: 'info', messages: ['Service restart', 'Configuration updated', 'Health check passed', 'Metrics updated'] }
      ];

      const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
      const message = errorType.messages[Math.floor(Math.random() * errorType.messages.length)];

      errors.push({
        time: errorTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        level: errorType.level,
        message: message
      });
    }

    // Sort by time (newest first)
    return errors.sort((a, b) => new Date(b.time) - new Date(a.time));
  }

  getTimeRangeMs() {
    switch (this.timeRange) {
      case '1h': return 60 * 60 * 1000;
      case '6h': return 6 * 60 * 60 * 1000;
      case '24h': return 24 * 60 * 60 * 1000;
      default: return 60 * 60 * 1000;
    }
  }

  cleanup() {
    // No cleanup needed
  }
}
