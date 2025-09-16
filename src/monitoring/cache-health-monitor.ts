/**
 * Simple Cache Health Monitor for TappMCP
 * Monitors cache performance and provides health status
 */

export interface CacheHealthStatus {
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  score: number; // 0-100
  issues: string[];
  recommendations: string[];
  metrics: {
    hitRate: number;
    averageResponseTime: number;
    cacheSize: number;
    deduplicatedRequests: number;
    totalRequests: number;
  };
  thresholds: {
    minHitRate: number;
    maxResponseTime: number;
    maxCacheSize: number;
  };
}

export class CacheHealthMonitor {
  private thresholds = {
    minHitRate: 0.6,        // 60%
    maxResponseTime: 500,    // 500ms
    maxCacheSize: 800,       // 800 entries (80% of 1000 max)
    minDeduplicationRate: 0.1 // 10% of requests should be deduplicated
  };

  /**
   * Check cache health based on metrics
   */
  checkHealth(metrics: {
    hits: number;
    misses: number;
    hitRate: number;
    averageResponseTime: number;
    totalRequests: number;
    deduplicatedRequests: number;
    cacheSize: number;
  }): CacheHealthStatus {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check hit rate
    if (metrics.hitRate < this.thresholds.minHitRate) {
      const severity = metrics.hitRate < 0.1 ? 'critical' : 'high';
      issues.push(`${severity.toUpperCase()}: Hit rate is ${(metrics.hitRate * 100).toFixed(1)}%, below threshold of ${this.thresholds.minHitRate * 100}%`);
      recommendations.push('Consider warming cache or adjusting cache strategy');
      score -= metrics.hitRate < 0.1 ? 40 : 20;
    }

    // Check response time
    if (metrics.averageResponseTime > this.thresholds.maxResponseTime) {
      const severity = metrics.averageResponseTime > 1000 ? 'critical' : 'high';
      issues.push(`${severity.toUpperCase()}: Average response time is ${metrics.averageResponseTime}ms, above threshold of ${this.thresholds.maxResponseTime}ms`);
      recommendations.push('Consider optimizing cache or reducing cache size');
      score -= metrics.averageResponseTime > 1000 ? 30 : 15;
    }

    // Check cache size
    if (metrics.cacheSize > this.thresholds.maxCacheSize) {
      issues.push(`WARNING: Cache size is ${metrics.cacheSize} entries, above threshold of ${this.thresholds.maxCacheSize} entries`);
      recommendations.push('Consider implementing cache eviction or increasing cache size');
      score -= 10;
    }

    // Check deduplication effectiveness
    if (metrics.totalRequests > 10) { // Only check if we have enough requests
      const deduplicationRate = metrics.deduplicatedRequests / metrics.totalRequests;
      if (deduplicationRate < this.thresholds.minDeduplicationRate) {
        issues.push(`INFO: Low deduplication rate ${(deduplicationRate * 100).toFixed(1)}%, consider request optimization`);
        recommendations.push('Review request patterns for better deduplication');
        score -= 5;
      }
    }

    // Check for no requests
    if (metrics.totalRequests === 0) {
      issues.push('INFO: No cache requests recorded yet');
      recommendations.push('Start using the cache to see performance metrics');
      score = 60; // Fair score for no data
    }

    // Determine overall status
    let status: CacheHealthStatus['status'];
    if (score >= 90) status = 'excellent';
    else if (score >= 75) status = 'good';
    else if (score >= 60) status = 'fair';
    else if (score >= 40) status = 'poor';
    else status = 'critical';

    return {
      status,
      score: Math.max(0, Math.min(100, score)),
      issues,
      recommendations,
      metrics: {
        hitRate: metrics.hitRate,
        averageResponseTime: metrics.averageResponseTime,
        cacheSize: metrics.cacheSize,
        deduplicatedRequests: metrics.deduplicatedRequests,
        totalRequests: metrics.totalRequests
      },
      thresholds: {
        minHitRate: this.thresholds.minHitRate,
        maxResponseTime: this.thresholds.maxResponseTime,
        maxCacheSize: this.thresholds.maxCacheSize
      }
    };
  }

  /**
   * Get health status with emoji indicators
   */
  getHealthStatusEmoji(status: CacheHealthStatus): string {
    const emojiMap = {
      excellent: '🟢',
      good: '🟡',
      fair: '🟠',
      poor: '🔴',
      critical: '🚨'
    };
    return emojiMap[status.status];
  }

  /**
   * Format health report for console output
   */
  formatHealthReport(status: CacheHealthStatus): string {
    const emoji = this.getHealthStatusEmoji(status);
    let report = `\n${emoji} Cache Health Status: ${status.status.toUpperCase()} (${status.score}/100)\n`;
    report += '='.repeat(50) + '\n';

    // Metrics
    report += '📊 Metrics:\n';
    report += `   Hit Rate: ${(status.metrics.hitRate * 100).toFixed(1)}% (target: ${status.thresholds.minHitRate * 100}%+)\n`;
    report += `   Response Time: ${status.metrics.averageResponseTime}ms (target: <${status.thresholds.maxResponseTime}ms)\n`;
    report += `   Cache Size: ${status.metrics.cacheSize} entries (max: ${status.thresholds.maxCacheSize})\n`;
    report += `   Total Requests: ${status.metrics.totalRequests}\n`;
    report += `   Deduplicated: ${status.metrics.deduplicatedRequests}\n\n`;

    // Issues
    if (status.issues.length > 0) {
      report += '⚠️  Issues:\n';
      status.issues.forEach(issue => {
        report += `   • ${issue}\n`;
      });
      report += '\n';
    }

    // Recommendations
    if (status.recommendations.length > 0) {
      report += '💡 Recommendations:\n';
      status.recommendations.forEach(rec => {
        report += `   • ${rec}\n`;
      });
      report += '\n';
    }

    return report;
  }

  /**
   * Update thresholds
   */
  updateThresholds(newThresholds: Partial<typeof this.thresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    console.log('🔧 Cache health thresholds updated:', this.thresholds);
  }

  /**
   * Get current thresholds
   */
  getThresholds(): typeof this.thresholds {
    return { ...this.thresholds };
  }
}
