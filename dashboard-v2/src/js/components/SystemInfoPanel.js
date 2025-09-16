/**
 * SystemInfoPanel - System information and details
 * Displays platform, version, and runtime information
 */

export class SystemInfoPanel {
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
    // Details button
    const detailsBtn = this.container.querySelector('#systemDetails');
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

    this.renderInfo();
  }

  renderLoading() {
    const infoContainer = this.container.querySelector('#systemInfo');
    if (infoContainer) {
      infoContainer.innerHTML = `
        <div class="loading">
          <div class="loading-spinner"></div>
          <div class="loading-text">Loading system info...</div>
        </div>
      `;
    }
  }

  renderInfo() {
    const infoContainer = this.container.querySelector('#systemInfo');
    if (!infoContainer) return;

    const systemInfo = this.extractSystemInfo();

    infoContainer.innerHTML = systemInfo.map(info => `
      <div class="system-info-item">
        <div class="system-info-label">${info.label}</div>
        <div class="system-info-value">${info.value}</div>
      </div>
    `).join('');
  }

  extractSystemInfo() {
    if (!this.data) return [];

    return [
      {
        label: 'Platform',
        value: this.data.platform || 'Unknown'
      },
      {
        label: 'Architecture',
        value: this.data.arch || 'Unknown'
      },
      {
        label: 'Node.js',
        value: this.data.nodeVersion || 'Unknown'
      },
      {
        label: 'Process ID',
        value: this.data.pid || 'Unknown'
      },
      {
        label: 'Uptime',
        value: this.formatUptime(this.data.uptime)
      },
      {
        label: 'Total Requests',
        value: this.data.totalRequests || 0
      },
      {
        label: 'Total Errors',
        value: this.data.totalErrors || 0
      },
      {
        label: 'Server Version',
        value: this.data.server || 'Unknown'
      }
    ];
  }

  formatUptime(seconds) {
    if (!seconds) return 'Unknown';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  showDetails() {
    if (!this.data) return;

    const details = this.extractDetailedInfo();
    const detailsHtml = details
      .map(([key, value]) => `
        <div class="metric-item">
          <div class="metric-label">${key}</div>
          <div class="metric-value">${value}</div>
        </div>
      `).join('');

    this.showModal('Detailed System Information', detailsHtml);
  }

  extractDetailedInfo() {
    if (!this.data) return [];

    return [
      ['Platform', this.data.platform || 'Unknown'],
      ['Architecture', this.data.arch || 'Unknown'],
      ['Node.js Version', this.data.nodeVersion || 'Unknown'],
      ['Process ID', this.data.pid || 'Unknown'],
      ['Uptime', this.formatUptime(this.data.uptime)],
      ['Total Requests', this.data.totalRequests || 0],
      ['Total Errors', this.data.totalErrors || 0],
      ['Success Rate', ((this.data.successRate || 0) * 100).toFixed(2) + '%'],
      ['Error Rate', ((this.data.errorRate || 0) * 100).toFixed(2) + '%'],
      ['Response Time', (this.data.responseTime || 0).toFixed(2) + 'ms'],
      ['Requests/sec', (this.data.requestsPerSecond || 0).toFixed(2)],
      ['Memory Usage', this.data.memoryUsage ?
        `${(this.data.memoryUsage.memory_percent || 0).toFixed(1)}%` : 'Unknown'],
      ['CPU Usage', ((this.data.cpuUsage || 0) * 100).toFixed(1) + '%'],
      ['Cache Hit Rate', ((this.data.cacheHitRate || 0) * 100).toFixed(1) + '%'],
      ['Server Version', this.data.server || 'Unknown'],
      ['Timestamp', this.data.timestamp ?
        new Date(this.data.timestamp).toLocaleString() : 'Unknown']
    ];
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
      max-width: 600px;
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

  cleanup() {
    // No cleanup needed
  }
}
