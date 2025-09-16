/**
 * SystemHealthCard - Main system health status component
 * Displays overall system status with key metrics
 */

export class SystemHealthCard {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = null;
    this.data = null;
    this.animationInterval = null;
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
    // Refresh button
    const refreshBtn = this.container.querySelector('#refreshHealth');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.refresh();
      });
    }

    // Export button
    const exportBtn = this.container.querySelector('#exportHealth');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportData();
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

    const healthStatus = this.determineHealthStatus();
    const metrics = this.extractMetrics();

    this.renderStatus(healthStatus);
    this.renderMetrics(metrics);
    this.startStatusAnimation(healthStatus.status);
  }

  renderLoading() {
    const content = this.container.querySelector('.card-content');
    if (content) {
      content.innerHTML = `
        <div class="loading">
          <div class="loading-spinner"></div>
          <div class="loading-text">Loading system health...</div>
        </div>
      `;
    }
  }

  renderStatus(healthStatus) {
    const statusCircle = this.container.querySelector('#statusCircle');
    const statusText = this.container.querySelector('#statusText');
    const statusMessage = this.container.querySelector('#statusMessage');

    if (statusCircle) {
      statusCircle.className = `status-circle ${healthStatus.status}`;
      const statusInner = statusCircle.querySelector('.status-inner');
      if (statusInner) {
        statusInner.textContent = healthStatus.icon;
      }
    }

    if (statusText) {
      statusText.textContent = healthStatus.text;
    }

    if (statusMessage) {
      statusMessage.textContent = healthStatus.message;
    }
  }

  renderMetrics(metrics) {
    const metricsContainer = this.container.querySelector('#healthMetrics');
    if (!metricsContainer) return;

    metricsContainer.innerHTML = metrics.map(metric => `
      <div class="metric-item">
        <div class="metric-label">${metric.label}</div>
        <div class="metric-value">${metric.value}</div>
        <div class="metric-trend ${metric.trend}">${metric.trendText}</div>
      </div>
    `).join('');
  }

  determineHealthStatus() {
    if (!this.data) {
      return {
        status: 'unknown',
        text: 'Unknown',
        message: 'No data available',
        icon: '?'
      };
    }

    const cpu = this.data.cpuUsage || 0;
    const memory = this.data.memoryUsage?.memory_percent || 0;
    const errorRate = this.data.errorRate || 0;
    const responseTime = this.data.responseTime || 0;

    // Determine overall health based on key metrics
    let status = 'healthy';
    let message = 'All systems operating normally';
    let icon = '✓';

    if (cpu > 90 || memory > 90 || errorRate > 0.1 || responseTime > 5000) {
      status = 'error';
      message = 'Critical issues detected';
      icon = '⚠';
    } else if (cpu > 75 || memory > 75 || errorRate > 0.05 || responseTime > 2000) {
      status = 'warning';
      message = 'Performance degradation detected';
      icon = '⚠';
    }

    return {
      status,
      text: status.toUpperCase(),
      message,
      icon
    };
  }

  extractMetrics() {
    if (!this.data) return [];

    const metrics = [];

    // CPU Usage
    if (this.data.cpuUsage !== undefined) {
      metrics.push({
        label: 'CPU Usage',
        value: `${(this.data.cpuUsage * 100).toFixed(1)}%`,
        trend: this.getTrend(this.data.cpuUsage, 0.5),
        trendText: this.getTrendText(this.data.cpuUsage, 0.5)
      });
    }

    // Memory Usage
    if (this.data.memoryUsage?.memory_percent !== undefined) {
      metrics.push({
        label: 'Memory Usage',
        value: `${this.data.memoryUsage.memory_percent.toFixed(1)}%`,
        trend: this.getTrend(this.data.memoryUsage.memory_percent, 70),
        trendText: this.getTrendText(this.data.memoryUsage.memory_percent, 70)
      });
    }

    // Response Time
    if (this.data.responseTime !== undefined) {
      metrics.push({
        label: 'Response Time',
        value: `${this.data.responseTime.toFixed(0)}ms`,
        trend: this.getTrend(this.data.responseTime, 1000, true),
        trendText: this.getTrendText(this.data.responseTime, 1000, true)
      });
    }

    // Success Rate
    if (this.data.successRate !== undefined) {
      metrics.push({
        label: 'Success Rate',
        value: `${(this.data.successRate * 100).toFixed(1)}%`,
        trend: this.getTrend(this.data.successRate, 0.95),
        trendText: this.getTrendText(this.data.successRate, 0.95)
      });
    }

    // Requests per Second
    if (this.data.requestsPerSecond !== undefined) {
      metrics.push({
        label: 'Requests/sec',
        value: this.data.requestsPerSecond.toFixed(2),
        trend: this.getTrend(this.data.requestsPerSecond, 1),
        trendText: this.getTrendText(this.data.requestsPerSecond, 1)
      });
    }

    // Error Rate
    if (this.data.errorRate !== undefined) {
      metrics.push({
        label: 'Error Rate',
        value: `${(this.data.errorRate * 100).toFixed(2)}%`,
        trend: this.getTrend(this.data.errorRate, 0.01, true),
        trendText: this.getTrendText(this.data.errorRate, 0.01, true)
      });
    }

    return metrics;
  }

  getTrend(current, threshold, lowerIsBetter = false) {
    if (lowerIsBetter) {
      return current < threshold ? 'trend-up' : current > threshold * 1.5 ? 'trend-down' : 'trend-stable';
    } else {
      return current > threshold ? 'trend-up' : current < threshold * 0.5 ? 'trend-down' : 'trend-stable';
    }
  }

  getTrendText(current, threshold, lowerIsBetter = false) {
    if (lowerIsBetter) {
      if (current < threshold) return '↗ Good';
      if (current > threshold * 1.5) return '↘ Poor';
      return '→ Stable';
    } else {
      if (current > threshold) return '↗ High';
      if (current < threshold * 0.5) return '↘ Low';
      return '→ Normal';
    }
  }

  startStatusAnimation(status) {
    // Stop existing animation
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }

    const statusCircle = this.container.querySelector('#statusCircle');
    if (!statusCircle) return;

    // Add pulsing animation based on status
    if (status === 'error') {
      statusCircle.style.animation = 'pulse 1s infinite';
    } else if (status === 'warning') {
      statusCircle.style.animation = 'pulse 2s infinite';
    } else {
      statusCircle.style.animation = 'pulse 3s infinite';
    }
  }

  async refresh() {
    try {
      this.renderLoading();

      // Simulate refresh delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Re-render with current data
      this.render();

    } catch (error) {
      console.error('Failed to refresh health data:', error);
      this.renderError('Failed to refresh health data');
    }
  }

  exportData() {
    if (!this.data) {
      alert('No data to export');
      return;
    }

    const exportData = {
      timestamp: new Date().toISOString(),
      health: this.determineHealthStatus(),
      metrics: this.extractMetrics(),
      rawData: this.data
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tappmcp-health-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  renderError(message) {
    const content = this.container.querySelector('.card-content');
    if (content) {
      content.innerHTML = `
        <div class="error-state">
          <h3>Error</h3>
          <p>${message}</p>
          <button class="btn-small" onclick="location.reload()">Reload</button>
        </div>
      `;
    }
  }

  cleanup() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
  }
}
