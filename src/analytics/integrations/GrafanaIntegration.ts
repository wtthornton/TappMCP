/**
 * Grafana Integration
 *
 * Integration with Grafana for professional monitoring dashboards,
 * data source configuration, and panel definitions.
 */

import {
  LiveMetrics,
  PerformanceTrends,
  StoredTrace,
  ExecutionMetrics
} from '../types/AnalyticsTypes.js';
import { RealTimeProcessor } from '../RealTimeProcessor.js';
import { AnalyticsEngine } from '../AnalyticsEngine.js';

export interface GrafanaConfig {
  /** Grafana server URL */
  serverUrl: string;

  /** API key for authentication */
  apiKey: string;

  /** Dashboard configuration */
  dashboard: {
    title: string;
    uid: string;
    refresh: string;
    timezone: string;
  };

  /** Data source configuration */
  dataSource: {
    name: string;
    type: string;
    url: string;
    access: 'proxy' | 'direct';
  };

  /** Panel configuration */
  panels: {
    responseTime: boolean;
    errorRate: boolean;
    memoryUsage: boolean;
    cpuUsage: boolean;
    throughput: boolean;
    healthScore: boolean;
  };
}

export interface GrafanaDashboard {
  dashboard: {
    id: number | null;
    uid: string;
    title: string;
    tags: string[];
    timezone: string;
    refresh: string;
    time: {
      from: string;
      to: string;
    };
    panels: GrafanaPanel[];
  };
  overwrite: boolean;
}

export interface GrafanaPanel {
  id: number;
  title: string;
  type: string;
  targets: GrafanaTarget[];
  fieldConfig: {
    defaults: {
      unit: string;
      color: {
        mode: string;
      };
    };
  };
  gridPos: {
    h: number;
    w: number;
    x: number;
    y: number;
  };
}

export interface GrafanaTarget {
  expr: string;
  refId: string;
  legendFormat?: string;
}

export class GrafanaIntegration {
  private config: GrafanaConfig;
  private realTimeProcessor: RealTimeProcessor;
  private analyticsEngine: AnalyticsEngine;

  constructor(
    config: GrafanaConfig,
    realTimeProcessor: RealTimeProcessor,
    analyticsEngine: AnalyticsEngine
  ) {
    this.config = config;
    this.realTimeProcessor = realTimeProcessor;
    this.analyticsEngine = analyticsEngine;
  }

  /**
   * Create Grafana dashboard configuration
   */
  createDashboardConfig(): GrafanaDashboard {
    const panels: GrafanaPanel[] = [];
    let panelId = 1;
    let yPosition = 0;

    // Response Time Panel
    if (this.config.panels.responseTime) {
      panels.push({
        id: panelId++,
        title: 'Response Time',
        type: 'timeseries',
        targets: [
          {
            expr: 'smart_vibe_response_time_seconds',
            refId: 'A',
            legendFormat: 'Response Time (s)'
          }
        ],
        fieldConfig: {
          defaults: {
            unit: 's',
            color: { mode: 'palette-classic' }
          }
        },
        gridPos: { h: 8, w: 12, x: 0, y: yPosition }
      });
      yPosition += 8;
    }

    // Error Rate Panel
    if (this.config.panels.errorRate) {
      panels.push({
        id: panelId++,
        title: 'Error Rate',
        type: 'timeseries',
        targets: [
          {
            expr: 'smart_vibe_error_rate',
            refId: 'A',
            legendFormat: 'Error Rate'
          }
        ],
        fieldConfig: {
          defaults: {
            unit: 'percentunit',
            color: { mode: 'palette-classic' }
          }
        },
        gridPos: { h: 8, w: 12, x: 12, y: yPosition - 8 }
      });
    }

    // Memory Usage Panel
    if (this.config.panels.memoryUsage) {
      panels.push({
        id: panelId++,
        title: 'Memory Usage',
        type: 'timeseries',
        targets: [
          {
            expr: 'smart_vibe_memory_usage',
            refId: 'A',
            legendFormat: 'Memory Usage (%)'
          }
        ],
        fieldConfig: {
          defaults: {
            unit: 'percent',
            color: { mode: 'palette-classic' }
          }
        },
        gridPos: { h: 8, w: 12, x: 0, y: yPosition }
      });
      yPosition += 8;
    }

    // CPU Usage Panel
    if (this.config.panels.cpuUsage) {
      panels.push({
        id: panelId++,
        title: 'CPU Usage',
        type: 'timeseries',
        targets: [
          {
            expr: 'smart_vibe_cpu_usage',
            refId: 'A',
            legendFormat: 'CPU Usage (%)'
          }
        ],
        fieldConfig: {
          defaults: {
            unit: 'percent',
            color: { mode: 'palette-classic' }
          }
        },
        gridPos: { h: 8, w: 12, x: 12, y: yPosition - 8 }
      });
    }

    // Throughput Panel
    if (this.config.panels.throughput) {
      panels.push({
        id: panelId++,
        title: 'Throughput',
        type: 'timeseries',
        targets: [
          {
            expr: 'smart_vibe_request_rate',
            refId: 'A',
            legendFormat: 'Requests/sec'
          }
        ],
        fieldConfig: {
          defaults: {
            unit: 'reqps',
            color: { mode: 'palette-classic' }
          }
        },
        gridPos: { h: 8, w: 12, x: 0, y: yPosition }
      });
      yPosition += 8;
    }

    // Health Score Panel
    if (this.config.panels.healthScore) {
      panels.push({
        id: panelId++,
        title: 'Health Score',
        type: 'stat',
        targets: [
          {
            expr: 'smart_vibe_health_score',
            refId: 'A',
            legendFormat: 'Health Score'
          }
        ],
        fieldConfig: {
          defaults: {
            unit: 'short',
            color: { mode: 'thresholds' }
          }
        },
        gridPos: { h: 8, w: 12, x: 12, y: yPosition - 8 }
      });
    }

    return {
      dashboard: {
        id: null,
        uid: this.config.dashboard.uid,
        title: this.config.dashboard.title,
        tags: ['smart-vibe', 'analytics', 'monitoring'],
        timezone: this.config.dashboard.timezone,
        refresh: this.config.dashboard.refresh,
        time: {
          from: 'now-1h',
          to: 'now'
        },
        panels
      },
      overwrite: true
    };
  }

  /**
   * Create data source configuration
   */
  createDataSourceConfig(): any {
    return {
      name: this.config.dataSource.name,
      type: this.config.dataSource.type,
      url: this.config.dataSource.url,
      access: this.config.dataSource.access,
      isDefault: false,
      jsonData: {
        httpMethod: 'POST',
        queryTimeout: '60s',
        timeInterval: '1m'
      },
      secureJsonData: {
        apiKey: this.config.apiKey
      }
    };
  }

  /**
   * Get metrics data for Grafana
   */
  async getMetricsData(timeRange: { from: string; to: string }): Promise<any> {
    try {
      const liveMetrics = this.realTimeProcessor.getLiveMetrics();
      const trends = this.realTimeProcessor.getPerformanceTrends();

      // Convert time range to timestamps
      const fromTime = this.parseTimeRange(timeRange.from);
      const toTime = this.parseTimeRange(timeRange.to);

      // Get historical data
      const analytics = await this.analyticsEngine.getAnalyticsForTimeRange(fromTime, toTime);

      return {
        responseTime: {
          values: trends?.responseTime || [liveMetrics.averageResponseTime],
          timestamps: trends?.timestamps || [Date.now()]
        },
        errorRate: {
          values: trends?.errorRate || [liveMetrics.errorRate],
          timestamps: trends?.timestamps || [Date.now()]
        },
        memoryUsage: {
          values: trends?.memoryUsage || [liveMetrics.memoryUsage],
          timestamps: trends?.timestamps || [Date.now()]
        },
        cpuUsage: {
          values: trends?.cpuUsage || [liveMetrics.cpuUsage],
          timestamps: trends?.timestamps || [Date.now()]
        },
        throughput: {
          values: trends?.responseTime ? trends.responseTime.map(t => t > 0 ? 1000 / t : 0) : [liveMetrics.requestRate],
          timestamps: trends?.timestamps || [Date.now()]
        },
        healthScore: {
          values: [liveMetrics.healthScore],
          timestamps: [Date.now()]
        }
      };
    } catch (error) {
      console.error('Failed to get metrics data for Grafana:', error);
      return {};
    }
  }

  /**
   * Create alert rules for Grafana
   */
  createAlertRules(): any[] {
    return [
      {
        uid: 'smart-vibe-response-time-high',
        title: 'Smart Vibe Response Time High',
        condition: 'C',
        data: [
          {
            refId: 'A',
            queryType: '',
            relativeTimeRange: {
              from: 300,
              to: 0
            },
            datasourceUid: this.config.dataSource.name,
            model: {
              expr: 'smart_vibe_response_time_seconds > 1',
              refId: 'A'
            }
          },
          {
            refId: 'B',
            queryType: '',
            relativeTimeRange: {
              from: 0,
              to: 0
            },
            datasourceUid: '__expr__',
            model: {
              conditions: [
                {
                  evaluator: {
                    params: [1],
                    type: 'gt'
                  },
                  operator: {
                    type: 'and'
                  },
                  query: {
                    params: ['A']
                  },
                  reducer: {
                    params: [],
                    type: 'last'
                  },
                  type: 'query'
                }
              ],
              datasource: {
                type: '__expr__',
                uid: '__expr__'
              },
              expression: 'A',
              hide: false,
              intervalMs: 1000,
              maxDataPoints: 43200,
              reducer: 'last',
              refId: 'B',
              type: 'reduce'
            }
          },
          {
            refId: 'C',
            queryType: '',
            relativeTimeRange: {
              from: 0,
              to: 0
            },
            datasourceUid: '__expr__',
            model: {
              conditions: [
                {
                  evaluator: {
                    params: [0.5],
                    type: 'gt'
                  },
                  operator: {
                    type: 'and'
                  },
                  query: {
                    params: ['B']
                  },
                  reducer: {
                    params: [],
                    type: 'last'
                  },
                  type: 'query'
                }
              ],
              datasource: {
                type: '__expr__',
                uid: '__expr__'
              },
              expression: 'B',
              hide: false,
              intervalMs: 1000,
              maxDataPoints: 43200,
              refId: 'C',
              type: 'threshold'
            }
          }
        ],
        noDataState: 'NoData',
        execErrState: 'Alerting',
        for: '5m',
        annotations: {
          summary: 'Smart Vibe response time is above threshold'
        },
        labels: {
          severity: 'warning'
        }
      },
      {
        uid: 'smart-vibe-error-rate-high',
        title: 'Smart Vibe Error Rate High',
        condition: 'C',
        data: [
          {
            refId: 'A',
            queryType: '',
            relativeTimeRange: {
              from: 300,
              to: 0
            },
            datasourceUid: this.config.dataSource.name,
            model: {
              expr: 'smart_vibe_error_rate > 0.05',
              refId: 'A'
            }
          },
          {
            refId: 'B',
            queryType: '',
            relativeTimeRange: {
              from: 0,
              to: 0
            },
            datasourceUid: '__expr__',
            model: {
              conditions: [
                {
                  evaluator: {
                    params: [0.05],
                    type: 'gt'
                  },
                  operator: {
                    type: 'and'
                  },
                  query: {
                    params: ['A']
                  },
                  reducer: {
                    params: [],
                    type: 'last'
                  },
                  type: 'query'
                }
              ],
              datasource: {
                type: '__expr__',
                uid: '__expr__'
              },
              expression: 'A',
              hide: false,
              intervalMs: 1000,
              maxDataPoints: 43200,
              reducer: 'last',
              refId: 'B',
              type: 'reduce'
            }
          },
          {
            refId: 'C',
            queryType: '',
            relativeTimeRange: {
              from: 0,
              to: 0
            },
            datasourceUid: '__expr__',
            model: {
              conditions: [
                {
                  evaluator: {
                    params: [0.5],
                    type: 'gt'
                  },
                  operator: {
                    type: 'and'
                  },
                  query: {
                    params: ['B']
                  },
                  reducer: {
                    params: [],
                    type: 'last'
                  },
                  type: 'query'
                }
              ],
              datasource: {
                type: '__expr__',
                uid: '__expr__'
              },
              expression: 'B',
              hide: false,
              intervalMs: 1000,
              maxDataPoints: 43200,
              refId: 'C',
              type: 'threshold'
            }
          }
        ],
        noDataState: 'NoData',
        execErrState: 'Alerting',
        for: '2m',
        annotations: {
          summary: 'Smart Vibe error rate is above threshold'
        },
        labels: {
          severity: 'critical'
        }
      },
      {
        uid: 'smart-vibe-health-score-low',
        title: 'Smart Vibe Health Score Low',
        condition: 'C',
        data: [
          {
            refId: 'A',
            queryType: '',
            relativeTimeRange: {
              from: 300,
              to: 0
            },
            datasourceUid: this.config.dataSource.name,
            model: {
              expr: 'smart_vibe_health_score < 60',
              refId: 'A'
            }
          },
          {
            refId: 'B',
            queryType: '',
            relativeTimeRange: {
              from: 0,
              to: 0
            },
            datasourceUid: '__expr__',
            model: {
              conditions: [
                {
                  evaluator: {
                    params: [60],
                    type: 'lt'
                  },
                  operator: {
                    type: 'and'
                  },
                  query: {
                    params: ['A']
                  },
                  reducer: {
                    params: [],
                    type: 'last'
                  },
                  type: 'query'
                }
              ],
              datasource: {
                type: '__expr__',
                uid: '__expr__'
              },
              expression: 'A',
              hide: false,
              intervalMs: 1000,
              maxDataPoints: 43200,
              reducer: 'last',
              refId: 'B',
              type: 'reduce'
            }
          },
          {
            refId: 'C',
            queryType: '',
            relativeTimeRange: {
              from: 0,
              to: 0
            },
            datasourceUid: '__expr__',
            model: {
              conditions: [
                {
                  evaluator: {
                    params: [0.5],
                    type: 'gt'
                  },
                  operator: {
                    type: 'and'
                  },
                  query: {
                    params: ['B']
                  },
                  reducer: {
                    params: [],
                    type: 'last'
                  },
                  type: 'query'
                }
              ],
              datasource: {
                type: '__expr__',
                uid: '__expr__'
              },
              expression: 'B',
              hide: false,
              intervalMs: 1000,
              maxDataPoints: 43200,
              refId: 'C',
              type: 'threshold'
            }
          }
        ],
        noDataState: 'NoData',
        execErrState: 'Alerting',
        for: '3m',
        annotations: {
          summary: 'Smart Vibe health score is below threshold'
        },
        labels: {
          severity: 'warning'
        }
      }
    ];
  }

  /**
   * Export dashboard configuration to JSON
   */
  exportDashboardConfig(): string {
    const config = this.createDashboardConfig();
    return JSON.stringify(config, null, 2);
  }

  /**
   * Export data source configuration to JSON
   */
  exportDataSourceConfig(): string {
    const config = this.createDataSourceConfig();
    return JSON.stringify(config, null, 2);
  }

  /**
   * Export alert rules to JSON
   */
  exportAlertRules(): string {
    const rules = this.createAlertRules();
    return JSON.stringify(rules, null, 2);
  }

  /**
   * Parse Grafana time range to timestamp
   */
  private parseTimeRange(timeRange: string): number {
    const now = Date.now();

    if (timeRange === 'now') {
      return now;
    }

    if (timeRange.startsWith('now-')) {
      const duration = timeRange.substring(4);
      const multiplier = this.getDurationMultiplier(duration);
      return now - multiplier;
    }

    // Try to parse as ISO string
    const timestamp = new Date(timeRange).getTime();
    return isNaN(timestamp) ? now : timestamp;
  }

  /**
   * Get duration multiplier in milliseconds
   */
  private getDurationMultiplier(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) return 0;

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 0;
    }
  }
}

export default GrafanaIntegration;
