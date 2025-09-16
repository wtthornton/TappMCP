/**
 * TokenUsageChart - AI token consumption visualization
 * Displays token usage trends and projections
 */

import { ChartManager } from '../managers/ChartManager.js';

export class TokenUsageChart {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = null;
    this.chartManager = new ChartManager();
    this.chart = null;
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
    // Details button
    const detailsBtn = this.container.querySelector('#tokenDetails');
    if (detailsBtn) {
      detailsBtn.addEventListener('click', () => {
        this.showDetails();
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
    const chartContainer = this.container.querySelector('#tokenChart');
    if (chartContainer) {
      chartContainer.innerHTML = `
        <div class="loading">
          <div class="loading-spinner"></div>
          <div class="loading-text">Loading token usage data...</div>
        </div>
      `;
    }
  }

  createChart() {
    if (!this.data) return;

    try {
      // Destroy existing chart
      if (this.chart) {
        this.chartManager.destroyChart('tokenCanvas');
      }

      // Create new chart
      this.chart = this.chartManager.createTokenChart('tokenCanvas', this.data);

      if (!this.chart) {
        this.renderError('Failed to create token usage chart');
      }
    } catch (error) {
      console.error('Failed to create token usage chart:', error);
      this.renderError('Failed to create token usage chart');
    }
  }

  showDetails() {
    if (!this.data) return;

    const details = {
      'Current Tokens': this.data.tokenCount || 0,
      'Total Processed': this.data.totalTokensProcessed || 0,
      'Hourly Average': this.data.hourlyAverageTokens || 0,
      'Queue Size': this.data.queueSize || 0,
      'Throughput': (this.data.throughput || 0).toFixed(2) + ' tokens/sec',
      'Latency': (this.data.latency || 0).toFixed(0) + 'ms'
    };

    const detailsHtml = Object.entries(details)
      .map(([key, value]) => `
        <div class="metric-item">
          <div class="metric-label">${key}</div>
          <div class="metric-value">${value}</div>
        </div>
      `).join('');

    // Create modal or show in a tooltip
    this.showModal('Token Usage Details', detailsHtml);
  }

  showModal(title, content) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    `;

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      border-radius: 12px;
      padding: 24px;
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
    `;

    modalContent.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="margin: 0; color: #ffffff;">${title}</h3>
        <button onclick="this.closest('.modal').remove()" style="
          background: none;
          border: none;
          color: #b0b0b0;
          font-size: 24px;
          cursor: pointer;
        ">×</button>
      </div>
      <div>${content}</div>
    `;

    modal.className = 'modal';
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Close on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  renderError(message) {
    const chartContainer = this.container.querySelector('#tokenChart');
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
      this.chartManager.destroyChart('tokenCanvas');
    }
  }
}
