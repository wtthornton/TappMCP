/**
 * TappMCP Dashboard v2.0 - Main Application
 * Modern real-time monitoring interface with Web Components
 */

import { DataService } from './services/DataService.js';
import { ChartManager } from './managers/ChartManager.js';
import { NotificationManager } from './managers/NotificationManager.js';
import { ThemeManager } from './managers/ThemeManager.js';
import { SystemHealthCard } from './components/SystemHealthCard.js';
import { PerformanceChart } from './components/PerformanceChart.js';
import { MemoryVisualization } from './components/MemoryVisualization.js';
import { RequestFlowDiagram } from './components/RequestFlowDiagram.js';
import { ErrorTimeline } from './components/ErrorTimeline.js';
import { Context7Metrics } from './components/Context7Metrics.js';
import { LogsFeed } from './components/LogsFeed.js';
import { TokenUsageChart } from './components/TokenUsageChart.js';
import { SystemInfoPanel } from './components/SystemInfoPanel.js';

class TappMCPDashboard {
  constructor() {
    this.dataService = new DataService();
    this.chartManager = new ChartManager();
    this.notificationManager = new NotificationManager();
    this.themeManager = new ThemeManager();

    this.components = new Map();
    this.isConnected = false;
    this.autoRefreshInterval = null;
    this.refreshInterval = 5000; // 5 seconds

    this.init();
  }

  async init() {
    try {
      console.log('🚀 Initializing TappMCP Dashboard v2.0...');

      // Hide loading screen
      this.hideLoadingScreen();

      // Initialize components
      await this.initializeComponents();

      // Set up event listeners
      this.setupEventListeners();

      // Start data fetching
      await this.startDataFetching();

      // Start auto-refresh
      this.startAutoRefresh();

      console.log('✅ Dashboard initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize dashboard:', error);
      this.showError('Failed to initialize dashboard. Please refresh the page.');
    }
  }

  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    const dashboard = document.getElementById('dashboard');

    if (loadingScreen && dashboard) {
      loadingScreen.style.display = 'none';
      dashboard.style.display = 'block';
      dashboard.classList.add('fade-in');
    }
  }

  async initializeComponents() {
    // Initialize all dashboard components
    this.components.set('systemHealth', new SystemHealthCard('systemHealthCard'));
    this.components.set('performance', new PerformanceChart('performanceCard'));
    this.components.set('memory', new MemoryVisualization('memoryCard'));
    this.components.set('requestFlow', new RequestFlowDiagram('requestFlowCard'));
    this.components.set('errorTimeline', new ErrorTimeline('errorAnalysisCard'));
    this.components.set('context7', new Context7Metrics('context7Card'));
    this.components.set('logs', new LogsFeed('logsCard'));
    this.components.set('tokenUsage', new TokenUsageChart('tokenUsageCard'));
    this.components.set('systemInfo', new SystemInfoPanel('systemInfoCard'));

    // Initialize all components
    for (const [name, component] of this.components) {
      try {
        await component.initialize();
        console.log(`✅ ${name} component initialized`);
      } catch (error) {
        console.error(`❌ Failed to initialize ${name} component:`, error);
      }
    }
  }

  setupEventListeners() {
    // Connection status
    this.dataService.on('connection', (isConnected) => {
      this.updateConnectionStatus(isConnected);
    });

    // Data updates
    this.dataService.on('data', (data) => {
      this.updateAllComponents(data);
    });

    // Error handling
    this.dataService.on('error', (error) => {
      console.error('Data service error:', error);
      this.notificationManager.showError('Data connection error', error.message);
    });

    // Manual refresh button
    const refreshButtons = document.querySelectorAll('[id$="Refresh"]');
    refreshButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.refreshData();
      });
    });

    // Auto-refresh toggle
    const refreshStatus = document.getElementById('refreshStatus');
    if (refreshStatus) {
      refreshStatus.addEventListener('click', () => {
        this.toggleAutoRefresh();
      });
    }

    // Settings button
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        this.openSettings();
      });
    }

    // Notifications button
    const notificationsBtn = document.getElementById('notificationsBtn');
    if (notificationsBtn) {
      notificationsBtn.addEventListener('click', () => {
        this.openNotifications();
      });
    }

    // Window events
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });

    window.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseUpdates();
      } else {
        this.resumeUpdates();
      }
    });
  }

  async startDataFetching() {
    try {
      await this.dataService.connect();
      this.isConnected = true;
      this.updateConnectionStatus(true);

      // Initial data fetch
      await this.refreshData();

    } catch (error) {
      console.error('Failed to start data fetching:', error);
      this.isConnected = false;
      this.updateConnectionStatus(false);
    }
  }

  async refreshData() {
    try {
      console.log('🔄 Refreshing dashboard data...');

      const data = await this.dataService.getMetrics();
      if (data) {
        this.updateAllComponents(data);
        this.updateLastUpdated();
      }

    } catch (error) {
      console.error('Failed to refresh data:', error);
      this.notificationManager.showError('Refresh failed', error.message);
    }
  }

  updateAllComponents(data) {
    // Update each component with new data
    for (const [name, component] of this.components) {
      try {
        component.update(data);
      } catch (error) {
        console.error(`Failed to update ${name} component:`, error);
      }
    }
  }

  updateConnectionStatus(isConnected) {
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('#connectionStatus span');

    if (statusDot && statusText) {
      if (isConnected) {
        statusDot.classList.remove('disconnected');
        statusText.textContent = 'Online';
        this.isConnected = true;
      } else {
        statusDot.classList.add('disconnected');
        statusText.textContent = 'Offline';
        this.isConnected = false;
      }
    }
  }

  updateLastUpdated() {
    const lastUpdated = document.getElementById('lastUpdated');
    if (lastUpdated) {
      lastUpdated.textContent = new Date().toLocaleString();
    }
  }

  startAutoRefresh() {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }

    this.autoRefreshInterval = setInterval(() => {
      if (this.isConnected && !document.hidden) {
        this.refreshData();
      }
    }, this.refreshInterval);

    const refreshStatus = document.getElementById('refreshStatus');
    if (refreshStatus) {
      refreshStatus.textContent = '🔄 Auto-refresh ON';
    }
  }

  stopAutoRefresh() {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
      this.autoRefreshInterval = null;
    }

    const refreshStatus = document.getElementById('refreshStatus');
    if (refreshStatus) {
      refreshStatus.textContent = '⏸️ Auto-refresh OFF';
    }
  }

  toggleAutoRefresh() {
    if (this.autoRefreshInterval) {
      this.stopAutoRefresh();
    } else {
      this.startAutoRefresh();
    }
  }

  pauseUpdates() {
    console.log('⏸️ Pausing updates (tab hidden)');
    this.stopAutoRefresh();
  }

  resumeUpdates() {
    console.log('▶️ Resuming updates (tab visible)');
    this.startAutoRefresh();
    this.refreshData();
  }

  openSettings() {
    // TODO: Implement settings modal
    console.log('Settings clicked');
    this.notificationManager.showInfo('Settings', 'Settings panel coming soon!');
  }

  openNotifications() {
    // TODO: Implement notifications panel
    console.log('Notifications clicked');
    this.notificationManager.showInfo('Notifications', 'Notifications panel coming soon!');
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-state';
    errorDiv.innerHTML = `
      <h3>Error</h3>
      <p>${message}</p>
      <button onclick="location.reload()" class="btn-small">Reload Page</button>
    `;

    document.body.appendChild(errorDiv);
  }

  cleanup() {
    console.log('🧹 Cleaning up dashboard...');

    // Stop auto-refresh
    this.stopAutoRefresh();

    // Disconnect data service
    this.dataService.disconnect();

    // Cleanup components
    for (const [name, component] of this.components) {
      try {
        if (component.cleanup) {
          component.cleanup();
        }
      } catch (error) {
        console.error(`Failed to cleanup ${name} component:`, error);
      }
    }

    console.log('✅ Dashboard cleanup complete');
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.dashboard = new TappMCPDashboard();
});

// Export for debugging
window.TappMCPDashboard = TappMCPDashboard;
