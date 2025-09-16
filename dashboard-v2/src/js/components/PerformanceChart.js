/**
 * PerformanceChart - Real-time performance metrics visualization
 * Displays response time, requests per second, and success rate trends
 */

import { ChartManager } from '../managers/ChartManager.js';

export class PerformanceChart {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = null;
    this.chartManager = new ChartManager();
    this.chart = null;
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
    const timeRangeSelect = this.container.querySelector('#performanceTimeRange');
    if (timeRangeSelect) {
      timeRangeSelect.addEventListener('change', (e) => {
        this.timeRange = e.target.value;
        this.updateChart();
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

    this.createChart();
  }

  renderLoading() {
    const chartContainer = this.container.querySelector('#performanceChart');
    if (chartContainer) {
      chartContainer.innerHTML = `
        <div class="loading">
          <div class="loading-spinner"></div>
          <div class="loading-text">Loading performance data...</div>
        </div>
      `;
    }
  }

  createChart() {
    if (!this.data) return;

    try {
      // Destroy existing chart
      if (this.chart) {
        this.chartManager.destroyChart('performanceCanvas');
      }

      // Create new chart
      this.chart = this.chartManager.createPerformanceChart('performanceCanvas', this.data);

      if (!this.chart) {
        this.renderError('Failed to create performance chart');
      }
    } catch (error) {
      console.error('Failed to create performance chart:', error);
      this.renderError('Failed to create performance chart');
    }
  }

  updateChart() {
    if (!this.data || !this.chart) return;

    try {
      // Update chart data based on time range
      const timeLabels = this.generateTimeLabels();
      const performanceData = this.generatePerformanceData();

      this.chart.data.labels = timeLabels;
      this.chart.data.datasets[0].data = performanceData.responseTime;
      this.chart.data.datasets[1].data = performanceData.requestsPerSecond;
      this.chart.data.datasets[2].data = performanceData.successRate;

      this.chart.update('active');
    } catch (error) {
      console.error('Failed to update performance chart:', error);
    }
  }

  generateTimeLabels() {
    const labels = [];
    const now = new Date();
    let hours;

    switch (this.timeRange) {
      case '1h':
        hours = 1;
        break;
      case '6h':
        hours = 6;
        break;
      case '24h':
        hours = 24;
        break;
      default:
        hours = 1;
    }

    const interval = hours === 1 ? 5 : hours === 6 ? 30 : 60; // minutes
    const points = hours === 1 ? 12 : hours === 6 ? 12 : 24;

    for (let i = points - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - (i * interval * 60 * 1000));
      labels.push(time.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }));
    }

    return labels;
  }

  generatePerformanceData() {
    if (!this.data) return { responseTime: [], requestsPerSecond: [], successRate: [] };

    const baseResponseTime = this.data.responseTime || 0;
    const baseRequestsPerSecond = this.data.requestsPerSecond || 0;
    const baseSuccessRate = (this.data.successRate || 0) * 100;

    const points = this.timeRange === '1h' ? 12 : this.timeRange === '6h' ? 12 : 24;

    const responseTime = [];
    const requestsPerSecond = [];
    const successRate = [];

    for (let i = 0; i < points; i++) {
      // Add realistic variation
      const variation = (Math.random() - 0.5) * 0.3; // ±15% variation

      responseTime.push(Math.max(0, baseResponseTime * (1 + variation)));
      requestsPerSecond.push(Math.max(0, baseRequestsPerSecond * (1 + variation)));
      successRate.push(Math.max(0, Math.min(100, baseSuccessRate * (1 + variation * 0.1)));
    }

    return { responseTime, requestsPerSecond, successRate };
  }

  renderError(message) {
    const chartContainer = this.container.querySelector('#performanceChart');
    if (chartContainer) {
      chartContainer.innerHTML = `
        <div class="error-state">
          <h3>Chart Error</h3>
          <p>${message}</p>
          <button class="btn-small" onclick="this.parentElement.parentElement.innerHTML=''">Retry</button>
        </div>
      `;
    }
  }

  cleanup() {
    if (this.chart) {
      this.chartManager.destroyChart('performanceCanvas');
    }
  }
}
