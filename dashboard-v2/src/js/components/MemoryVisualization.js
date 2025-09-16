/**
 * MemoryVisualization - Memory usage charts and details
 * Displays heap, RSS, and external memory usage
 */

import { ChartManager } from '../managers/ChartManager.js';

export class MemoryVisualization {
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
    const detailsBtn = this.container.querySelector('#memoryDetails');
    if (detailsBtn) {
      detailsBtn.addEventListener('click', () => {
        this.toggleDetails();
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
    this.renderDetails();
  }

  renderLoading() {
    const chartContainer = this.container.querySelector('#memoryChart');
    if (chartContainer) {
      chartContainer.innerHTML = `
        <div class="loading">
          <div class="loading-spinner"></div>
          <div class="loading-text">Loading memory data...</div>
        </div>
      `;
    }
  }

  createChart() {
    if (!this.data || !this.data.memoryUsage) return;

    try {
      // Destroy existing chart
      if (this.chart) {
        this.chartManager.destroyChart('memoryCanvas');
      }

      // Create new chart
      this.chart = this.chartManager.createMemoryChart('memoryCanvas', this.data.memoryUsage);

      if (!this.chart) {
        this.renderError('Failed to create memory chart');
      }
    } catch (error) {
      console.error('Failed to create memory chart:', error);
      this.renderError('Failed to create memory chart');
    }
  }

  renderDetails() {
    const detailsContainer = this.container.querySelector('#memoryDetailsList');
    if (!detailsContainer || !this.data.memoryUsage) return;

    const memory = this.data.memoryUsage;
    const totalMemory = memory.heapTotal + memory.rss + memory.external;

    detailsContainer.innerHTML = `
      <div class="memory-detail-item">
        <span class="memory-detail-label">Heap Used</span>
        <span class="memory-detail-value">${this.formatBytes(memory.heapUsed)}</span>
      </div>
      <div class="memory-detail-item">
        <span class="memory-detail-label">Heap Total</span>
        <span class="memory-detail-value">${this.formatBytes(memory.heapTotal)}</span>
      </div>
      <div class="memory-detail-item">
        <span class="memory-detail-label">RSS Memory</span>
        <span class="memory-detail-value">${this.formatBytes(memory.rss)}</span>
      </div>
      <div class="memory-detail-item">
        <span class="memory-detail-label">External</span>
        <span class="memory-detail-value">${this.formatBytes(memory.external)}</span>
      </div>
      <div class="memory-detail-item">
        <span class="memory-detail-label">Total Usage</span>
        <span class="memory-detail-value">${this.formatBytes(totalMemory)}</span>
      </div>
      <div class="memory-detail-item">
        <span class="memory-detail-label">Memory %</span>
        <span class="memory-detail-value">${this.data.memory_percent?.toFixed(1) || 'N/A'}%</span>
      </div>
    `;
  }

  toggleDetails() {
    const detailsContainer = this.container.querySelector('#memoryDetailsList');
    if (detailsContainer) {
      detailsContainer.style.display = detailsContainer.style.display === 'none' ? 'flex' : 'none';
    }
  }

  formatBytes(bytes) {
    if (!bytes) return 'N/A';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  renderError(message) {
    const chartContainer = this.container.querySelector('#memoryChart');
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
      this.chartManager.destroyChart('memoryCanvas');
    }
  }
}
