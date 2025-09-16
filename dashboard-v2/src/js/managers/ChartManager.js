/**
 * ChartManager - Centralized chart management for TappMCP Dashboard
 * Handles Chart.js and D3.js visualizations
 */

import Chart from 'chart.js/auto';

export class ChartManager {
  constructor() {
    this.charts = new Map();
    this.defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#b0b0b0',
            font: {
              family: 'SF Pro Display, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(26, 26, 26, 0.9)',
          titleColor: '#ffffff',
          bodyColor: '#b0b0b0',
          borderColor: '#00ff88',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#666666'
          },
          grid: {
            color: 'rgba(42, 42, 42, 0.5)'
          }
        },
        y: {
          ticks: {
            color: '#666666'
          },
          grid: {
            color: 'rgba(42, 42, 42, 0.5)'
          }
        }
      }
    };

    this.colors = {
      primary: '#00ff88',
      secondary: '#4facfe',
      tertiary: '#ff6b6b',
      success: '#00ff88',
      warning: '#ffaa00',
      error: '#ff4444',
      info: '#4facfe',
      muted: '#666666'
    };
  }

  createChart(canvasId, type, data, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.error(`Canvas with id '${canvasId}' not found`);
      return null;
    }

    // Destroy existing chart if it exists
    if (this.charts.has(canvasId)) {
      this.charts.get(canvasId).destroy();
    }

    const config = {
      type,
      data,
      options: {
        ...this.defaultOptions,
        ...options
      }
    };

    try {
      const chart = new Chart(canvas, config);
      this.charts.set(canvasId, chart);
      return chart;
    } catch (error) {
      console.error(`Failed to create chart '${canvasId}':`, error);
      return null;
    }
  }

  updateChart(canvasId, data) {
    const chart = this.charts.get(canvasId);
    if (chart) {
      chart.data = data;
      chart.update('none');
    }
  }

  destroyChart(canvasId) {
    const chart = this.charts.get(canvasId);
    if (chart) {
      chart.destroy();
      this.charts.delete(canvasId);
    }
  }

  // Performance Chart
  createPerformanceChart(canvasId, metricsData) {
    const data = {
      labels: this.generateTimeLabels(24), // Last 24 hours
      datasets: [
        {
          label: 'Response Time (ms)',
          data: this.generatePerformanceData(metricsData?.responseTime || 0),
          borderColor: this.colors.primary,
          backgroundColor: this.colors.primary + '20',
          tension: 0.4,
          yAxisID: 'y'
        },
        {
          label: 'Requests/sec',
          data: this.generatePerformanceData(metricsData?.requestsPerSecond || 0),
          borderColor: this.colors.secondary,
          backgroundColor: this.colors.secondary + '20',
          tension: 0.4,
          yAxisID: 'y1'
        },
        {
          label: 'Success Rate (%)',
          data: this.generatePerformanceData(metricsData?.successRate * 100 || 100),
          borderColor: this.colors.success,
          backgroundColor: this.colors.success + '20',
          tension: 0.4,
          yAxisID: 'y2'
        }
      ]
    };

    const options = {
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Response Time (ms)',
            color: this.colors.muted
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Requests/sec',
            color: this.colors.muted
          },
          grid: {
            drawOnChartArea: false
          }
        },
        y2: {
          type: 'linear',
          display: false
        }
      }
    };

    return this.createChart(canvasId, 'line', data, options);
  }

  // Memory Usage Chart
  createMemoryChart(canvasId, memoryData) {
    const data = {
      labels: ['Heap Used', 'Heap Total', 'RSS', 'External'],
      datasets: [{
        data: [
          memoryData?.heapUsed || 0,
          memoryData?.heapTotal || 0,
          memoryData?.rss || 0,
          memoryData?.external || 0
        ],
        backgroundColor: [
          this.colors.primary,
          this.colors.secondary,
          this.colors.tertiary,
          this.colors.warning
        ],
        borderWidth: 0
      }]
    };

    const options = {
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    };

    return this.createChart(canvasId, 'doughnut', data, options);
  }

  // Token Usage Chart
  createTokenChart(canvasId, tokenData) {
    const data = {
      labels: this.generateTimeLabels(12), // Last 12 hours
      datasets: [
        {
          label: 'Token Usage',
          data: this.generateTokenData(tokenData?.totalTokensProcessed || 0),
          borderColor: this.colors.primary,
          backgroundColor: this.colors.primary + '20',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Hourly Average',
          data: this.generateTokenData(tokenData?.hourlyAverageTokens || 0),
          borderColor: this.colors.secondary,
          backgroundColor: this.colors.secondary + '20',
          fill: false,
          tension: 0.4,
          borderDash: [5, 5]
        }
      ]
    };

    const options = {
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Tokens',
            color: this.colors.muted
          }
        }
      }
    };

    return this.createChart(canvasId, 'line', data, options);
  }

  // Error Timeline Chart
  createErrorTimelineChart(canvasId, errorData) {
    const data = {
      labels: this.generateTimeLabels(24),
      datasets: [
        {
          label: 'Errors',
          data: this.generateErrorData(errorData?.error_count || 0),
          borderColor: this.colors.error,
          backgroundColor: this.colors.error + '20',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Warnings',
          data: this.generateErrorData(errorData?.warning_count || 0),
          borderColor: this.colors.warning,
          backgroundColor: this.colors.warning + '20',
          fill: true,
          tension: 0.4
        }
      ]
    };

    const options = {
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Count',
            color: this.colors.muted
          }
        }
      }
    };

    return this.createChart(canvasId, 'line', data, options);
  }

  // Context7 API Metrics Chart
  createContext7Chart(canvasId, context7Data) {
    const data = {
      labels: ['Total Requests', 'Cost', 'Quality Score', 'Performance'],
      datasets: [{
        label: 'Context7 Metrics',
        data: [
          context7Data?.apiUsage?.totalRequests || 0,
          context7Data?.cost?.totalCost || 0,
          context7Data?.knowledgeQuality?.averageRelevanceScore || 0,
          context7Data?.performance?.averageResponseTime || 0
        ],
        backgroundColor: [
          this.colors.primary,
          this.colors.secondary,
          this.colors.success,
          this.colors.info
        ],
        borderWidth: 0
      }]
    };

    const options = {
      indexAxis: 'y',
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          beginAtZero: true
        }
      }
    };

    return this.createChart(canvasId, 'bar', data, options);
  }

  // Utility methods
  generateTimeLabels(hours) {
    const labels = [];
    const now = new Date();

    for (let i = hours - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - (i * 60 * 60 * 1000));
      labels.push(time.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }));
    }

    return labels;
  }

  generatePerformanceData(baseValue) {
    const data = [];
    for (let i = 0; i < 24; i++) {
      // Add some realistic variation
      const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
      const value = baseValue * (1 + variation);
      data.push(Math.max(0, value));
    }
    return data;
  }

  generateTokenData(baseValue) {
    const data = [];
    for (let i = 0; i < 12; i++) {
      const variation = (Math.random() - 0.5) * 0.3; // ±15% variation
      const value = baseValue * (1 + variation);
      data.push(Math.max(0, Math.round(value)));
    }
    return data;
  }

  generateErrorData(baseValue) {
    const data = [];
    for (let i = 0; i < 24; i++) {
      // Errors are more sporadic
      const random = Math.random();
      const value = random < 0.1 ? Math.floor(Math.random() * baseValue * 2) : 0;
      data.push(value);
    }
    return data;
  }

  // Cleanup all charts
  destroyAllCharts() {
    for (const [canvasId, chart] of this.charts) {
      chart.destroy();
    }
    this.charts.clear();
  }

  // Get chart instance
  getChart(canvasId) {
    return this.charts.get(canvasId);
  }

  // Resize all charts
  resizeAllCharts() {
    for (const [canvasId, chart] of this.charts) {
      chart.resize();
    }
  }
}
