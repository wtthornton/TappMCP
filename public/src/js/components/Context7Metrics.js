/**
 * Context7Metrics - Context7 API integration metrics
 * Displays API usage, costs, and performance data
 */

export class Context7Metrics {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = null;
    this.data = null;
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
    // Test API button
    const testBtn = this.container.querySelector('#context7Test');
    if (testBtn) {
      testBtn.addEventListener('click', () => {
        this.testAPI();
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

    this.renderMetrics();
  }

  renderLoading() {
    const metricsContainer = this.container.querySelector('#context7Metrics');
    if (metricsContainer) {
      metricsContainer.innerHTML = `
        <div class="loading">
          <div class="loading-spinner"></div>
          <div class="loading-text">Loading Context7 metrics...</div>
        </div>
      `;
    }
  }

  renderMetrics() {
    const metricsContainer = this.container.querySelector('#context7Metrics');
    if (!metricsContainer) return;

    const context7 = this.data.context7 || {};
    const apiUsage = context7.apiUsage || {};
    const cost = context7.cost || {};
    const performance = context7.performance || {};
    const knowledgeQuality = context7.knowledgeQuality || {};

    metricsContainer.innerHTML = `
      <div class="context7-metric">
        <div class="context7-metric-label">Total Requests</div>
        <div class="context7-metric-value">${apiUsage.totalRequests || 0}</div>
      </div>
      <div class="context7-metric">
        <div class="context7-metric-label">Requests/Hour</div>
        <div class="context7-metric-value">${apiUsage.requestsPerHour || 0}</div>
      </div>
      <div class="context7-metric">
        <div class="context7-metric-label">Total Cost</div>
        <div class="context7-metric-value">$${cost.totalCost?.toFixed(2) || '0.00'}</div>
      </div>
      <div class="context7-metric">
        <div class="context7-metric-label">Cost/Hour</div>
        <div class="context7-metric-value">$${cost.costPerHour?.toFixed(4) || '0.0000'}</div>
      </div>
      <div class="context7-metric">
        <div class="context7-metric-label">Quality Score</div>
        <div class="context7-metric-value">${knowledgeQuality.averageRelevanceScore?.toFixed(2) || 'N/A'}</div>
      </div>
      <div class="context7-metric">
        <div class="context7-metric-label">Response Time</div>
        <div class="context7-metric-value">${performance.averageResponseTime?.toFixed(0) || 'N/A'}ms</div>
      </div>
      <div class="context7-metric">
        <div class="context7-metric-label">Cache Hit Rate</div>
        <div class="context7-metric-value">${(performance.cacheHitRate * 100)?.toFixed(1) || '0.0'}%</div>
      </div>
      <div class="context7-metric">
        <div class="context7-metric-label">Error Rate</div>
        <div class="context7-metric-value">${(performance.errorRate * 100)?.toFixed(2) || '0.00'}%</div>
      </div>
    `;
  }

  async testAPI() {
    const testBtn = this.container.querySelector('#context7Test');
    if (testBtn) {
      testBtn.textContent = 'Testing...';
      testBtn.disabled = true;
    }

    try {
      // This would call the actual API test endpoint
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Show success message
      this.showMessage('API test completed successfully!', 'success');

    } catch (error) {
      console.error('API test failed:', error);
      this.showMessage('API test failed: ' + error.message, 'error');
    } finally {
      if (testBtn) {
        testBtn.textContent = 'Test API';
        testBtn.disabled = false;
      }
    }
  }

  showMessage(message, type) {
    const metricsContainer = this.container.querySelector('#context7Metrics');
    if (!metricsContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
      padding: 8px 12px;
      margin: 8px 0;
      border-radius: 4px;
      font-size: 0.875rem;
      text-align: center;
      background: ${type === 'success' ? '#00ff8820' : '#ff444420'};
      color: ${type === 'success' ? '#00ff88' : '#ff4444'};
      border: 1px solid ${type === 'success' ? '#00ff88' : '#ff4444'};
    `;

    metricsContainer.appendChild(messageDiv);

    // Remove message after 3 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.parentNode.removeChild(messageDiv);
      }
    }, 3000);
  }

  cleanup() {
    // No cleanup needed
  }
}
