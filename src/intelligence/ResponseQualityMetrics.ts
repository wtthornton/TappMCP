/**
 * Response Quality Metrics System
 * Tracks and analyzes response quality over time
 */

import { TemplateDetectionEngine, IntelligenceScore, AIResponse } from './TemplateDetectionEngine';

export interface QualityMetrics {
  timestamp: number;
  responseId: string;
  sessionId: string;
  userId: string;
  overallScore: number;
  contextualRelevance: number;
  domainExpertise: number;
  originality: number;
  specificity: number;
  confidence: number;
  sourceQuality: number;
  templateDetection: {
    isTemplate: boolean;
    confidence: number;
    templateType?: string;
    detectedPatterns: string[];
  };
  improvementSuggestions: string[];
  domain: string;
  responseLength: number;
  processingTime: number;
}

export interface QualityReport {
  timeRange: {
    start: Date;
    end: Date;
  };
  averageScore: number;
  qualityTrend: 'improving' | 'declining' | 'stable';
  scoreDistribution: {
    excellent: number; // 90-100
    good: number; // 70-89
    average: number; // 50-69
    poor: number; // 30-49
    very_poor: number; // 0-29
  };
  topIssues: QualityIssue[];
  recommendations: string[];
  domainBreakdown: Map<string, QualityMetrics>;
  sourceQualityBreakdown: Map<string, QualityMetrics>;
  templateDetectionStats: TemplateDetectionStats;
}

export interface QualityIssue {
  type:
    | 'template_response'
    | 'low_contextual_relevance'
    | 'poor_domain_expertise'
    | 'low_originality'
    | 'poor_source_quality';
  severity: 'high' | 'medium' | 'low';
  frequency: number;
  description: string;
  impact: string;
  suggestedFix: string;
}

export interface TemplateDetectionStats {
  totalResponses: number;
  templateResponses: number;
  templateRate: number;
  mostCommonTemplateTypes: Array<{ type: string; count: number }>;
  mostCommonPatterns: Array<{ pattern: string; count: number }>;
  qualityImpact: {
    templateResponses: { averageScore: number; count: number };
    realIntelligence: { averageScore: number; count: number };
  };
}

export interface QualityTrend {
  period: string;
  averageScore: number;
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
  keyInsights: string[];
}

export interface QualityInsight {
  type: 'improvement' | 'decline' | 'pattern' | 'anomaly';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  suggestedActions: string[];
  confidence: number;
}

export class ResponseQualityMetrics {
  private metrics: Map<string, QualityMetrics>;
  private templateDetector: TemplateDetectionEngine;
  private qualityThresholds: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  };

  constructor() {
    this.metrics = new Map();
    this.templateDetector = new TemplateDetectionEngine();
    this.qualityThresholds = {
      excellent: 90,
      good: 70,
      average: 50,
      poor: 30,
    };
  }

  /**
   * Track quality metrics for a response
   */
  trackQualityMetrics(response: AIResponse, score: IntelligenceScore): QualityMetrics {
    const templateResult = this.templateDetector.detectTemplate(response);

    const metrics: QualityMetrics = {
      timestamp: Date.now(),
      responseId: this.generateResponseId(),
      sessionId: response.sessionId || 'unknown',
      userId: response.userId || 'unknown',
      overallScore: score.overallScore,
      contextualRelevance: score.contextualRelevance,
      domainExpertise: score.domainExpertise,
      originality: score.originality,
      specificity: score.specificity,
      confidence: score.confidence,
      sourceQuality: score.sourceQuality,
      templateDetection: {
        isTemplate: templateResult.isTemplate,
        confidence: templateResult.confidence,
        templateType: templateResult.templateType,
        detectedPatterns: templateResult.detectedPatterns,
      },
      improvementSuggestions: templateResult.improvementSuggestions,
      domain: response.domain || 'unknown',
      responseLength: response.content.length,
      processingTime: Date.now() - response.timestamp,
    };

    this.metrics.set(metrics.responseId, metrics);
    return metrics;
  }

  /**
   * Generate comprehensive quality report
   */
  generateQualityReport(timeRange?: { start: Date; end: Date }): QualityReport {
    const filteredMetrics = this.getFilteredMetrics(timeRange);

    if (filteredMetrics.length === 0) {
      return this.createEmptyReport(timeRange);
    }

    const averageScore = this.calculateAverageScore(filteredMetrics);
    const qualityTrend = this.calculateQualityTrend(filteredMetrics);
    const scoreDistribution = this.calculateScoreDistribution(filteredMetrics);
    const topIssues = this.identifyTopIssues(filteredMetrics);
    const recommendations = this.generateRecommendations(filteredMetrics, topIssues);
    const domainBreakdown = this.getDomainBreakdown(filteredMetrics);
    const sourceQualityBreakdown = this.getSourceQualityBreakdown(filteredMetrics);
    const templateDetectionStats = this.getTemplateDetectionStats(filteredMetrics);

    return {
      timeRange: timeRange || this.getDefaultTimeRange(),
      averageScore,
      qualityTrend,
      scoreDistribution,
      topIssues,
      recommendations,
      domainBreakdown,
      sourceQualityBreakdown,
      templateDetectionStats,
    };
  }

  /**
   * Identify quality trends over time
   */
  identifyQualityTrends(): QualityTrend[] {
    const trends: QualityTrend[] = [];
    const allMetrics = Array.from(this.metrics.values()).sort((a, b) => a.timestamp - b.timestamp);

    if (allMetrics.length < 10) {
      return trends; // Need sufficient data for trends
    }

    // Calculate trends for different periods
    const periods = [
      { name: 'Last 24 hours', hours: 24 },
      { name: 'Last 7 days', hours: 24 * 7 },
      { name: 'Last 30 days', hours: 24 * 30 },
    ];

    for (const period of periods) {
      const cutoffTime = Date.now() - period.hours * 60 * 60 * 1000;
      const periodMetrics = allMetrics.filter(m => m.timestamp >= cutoffTime);

      if (periodMetrics.length >= 5) {
        const trend = this.calculatePeriodTrend(periodMetrics, period.name);
        trends.push(trend);
      }
    }

    return trends;
  }

  /**
   * Get quality insights and recommendations
   */
  getQualityInsights(): QualityInsight[] {
    const insights: QualityInsight[] = [];
    const recentMetrics = this.getRecentMetrics(24 * 60 * 60 * 1000); // Last 24 hours

    if (recentMetrics.length < 5) {
      return insights;
    }

    // Insight 1: Template Detection Rate
    const templateRate = this.calculateTemplateRate(recentMetrics);
    if (templateRate > 0.3) {
      insights.push({
        type: 'decline',
        title: 'High Template Response Rate',
        description: `${(templateRate * 100).toFixed(1)}% of responses are template-based`,
        impact: 'high',
        actionable: true,
        suggestedActions: [
          'Review and update response templates',
          'Add more contextual awareness to responses',
          'Implement better context matching algorithms',
        ],
        confidence: 0.9,
      });
    }

    // Insight 2: Domain Expertise Quality
    const avgDomainExpertise = this.calculateAverage(recentMetrics.map(m => m.domainExpertise));
    if (avgDomainExpertise < 0.4) {
      insights.push({
        type: 'decline',
        title: 'Low Domain Expertise',
        description: `Average domain expertise score is ${(avgDomainExpertise * 100).toFixed(1)}%`,
        impact: 'medium',
        actionable: true,
        suggestedActions: [
          'Enhance domain-specific knowledge base',
          'Improve context-to-domain mapping',
          'Add more domain-specific examples',
        ],
        confidence: 0.8,
      });
    }

    // Insight 3: Quality Improvement Trend
    const qualityTrend = this.calculateQualityTrend(recentMetrics);
    if (qualityTrend === 'improving') {
      insights.push({
        type: 'improvement',
        title: 'Quality Improvement Detected',
        description: 'Response quality is showing positive trends',
        impact: 'medium',
        actionable: false,
        suggestedActions: ['Continue current practices'],
        confidence: 0.7,
      });
    }

    // Insight 4: Source Quality Analysis
    const avgSourceQuality = this.calculateAverage(recentMetrics.map(m => m.sourceQuality));
    if (avgSourceQuality < 0.5) {
      insights.push({
        type: 'pattern',
        title: 'Source Quality Concerns',
        description: `Average source quality is ${(avgSourceQuality * 100).toFixed(1)}%`,
        impact: 'medium',
        actionable: true,
        suggestedActions: [
          'Review source validation processes',
          'Improve Context7 integration quality',
          'Add source credibility scoring',
        ],
        confidence: 0.8,
      });
    }

    return insights;
  }

  /**
   * Get metrics for specific time range
   */
  getMetricsForTimeRange(start: Date, end: Date): QualityMetrics[] {
    const startTime = start.getTime();
    const endTime = end.getTime();

    return Array.from(this.metrics.values())
      .filter(m => m.timestamp >= startTime && m.timestamp <= endTime)
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get quality statistics
   */
  getQualityStatistics(): {
    totalResponses: number;
    averageScore: number;
    templateRate: number;
    topDomains: Array<{ domain: string; count: number; averageScore: number }>;
    qualityDistribution: { [key: string]: number };
  } {
    const allMetrics = Array.from(this.metrics.values());

    return {
      totalResponses: allMetrics.length,
      averageScore: this.calculateAverageScore(allMetrics),
      templateRate: this.calculateTemplateRate(allMetrics),
      topDomains: this.getTopDomains(allMetrics),
      qualityDistribution: this.calculateScoreDistribution(allMetrics),
    };
  }

  /**
   * Export metrics data
   */
  exportMetrics(format: 'json' | 'csv' = 'json'): string {
    const allMetrics = Array.from(this.metrics.values());

    if (format === 'json') {
      return JSON.stringify(allMetrics, null, 2);
    } else {
      return this.convertToCSV(allMetrics);
    }
  }

  /**
   * Clear old metrics (for memory management)
   */
  clearOldMetrics(olderThanDays: number = 30): void {
    const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
    const keysToDelete: string[] = [];

    for (const [key, metrics] of this.metrics) {
      if (metrics.timestamp < cutoffTime) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.metrics.delete(key));
  }

  // Private helper methods

  private getFilteredMetrics(timeRange?: { start: Date; end: Date }): QualityMetrics[] {
    if (!timeRange) {
      return Array.from(this.metrics.values());
    }

    const startTime = timeRange.start.getTime();
    const endTime = timeRange.end.getTime();

    return Array.from(this.metrics.values()).filter(
      m => m.timestamp >= startTime && m.timestamp <= endTime
    );
  }

  private calculateAverageScore(metrics: QualityMetrics[]): number {
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, m) => sum + m.overallScore, 0) / metrics.length;
  }

  private calculateQualityTrend(metrics: QualityMetrics[]): 'improving' | 'declining' | 'stable' {
    if (metrics.length < 10) return 'stable';

    const sortedMetrics = metrics.sort((a, b) => a.timestamp - b.timestamp);
    const firstHalf = sortedMetrics.slice(0, Math.floor(sortedMetrics.length / 2));
    const secondHalf = sortedMetrics.slice(Math.floor(sortedMetrics.length / 2));

    const firstHalfAvg = this.calculateAverageScore(firstHalf);
    const secondHalfAvg = this.calculateAverageScore(secondHalf);

    const difference = secondHalfAvg - firstHalfAvg;
    const threshold = 5; // 5 point difference threshold

    if (difference > threshold) return 'improving';
    if (difference < -threshold) return 'declining';
    return 'stable';
  }

  private calculateScoreDistribution(metrics: QualityMetrics[]): {
    excellent: number;
    good: number;
    average: number;
    poor: number;
    very_poor: number;
  } {
    const distribution = {
      excellent: 0,
      good: 0,
      average: 0,
      poor: 0,
      very_poor: 0,
    };

    for (const metric of metrics) {
      if (metric.overallScore >= this.qualityThresholds.excellent) {
        distribution.excellent++;
      } else if (metric.overallScore >= this.qualityThresholds.good) {
        distribution.good++;
      } else if (metric.overallScore >= this.qualityThresholds.average) {
        distribution.average++;
      } else if (metric.overallScore >= this.qualityThresholds.poor) {
        distribution.poor++;
      } else {
        distribution.very_poor++;
      }
    }

    return distribution;
  }

  private identifyTopIssues(metrics: QualityMetrics[]): QualityIssue[] {
    const issues: QualityIssue[] = [];

    // Template response issues
    const templateCount = metrics.filter(m => m.templateDetection.isTemplate).length;
    if (templateCount > 0) {
      issues.push({
        type: 'template_response',
        severity: templateCount / metrics.length > 0.3 ? 'high' : 'medium',
        frequency: templateCount,
        description: `${templateCount} template responses detected`,
        impact: 'Reduces user experience quality',
        suggestedFix: 'Implement better contextual response generation',
      });
    }

    // Low contextual relevance
    const lowRelevanceCount = metrics.filter(m => m.contextualRelevance < 0.5).length;
    if (lowRelevanceCount > 0) {
      issues.push({
        type: 'low_contextual_relevance',
        severity: lowRelevanceCount / metrics.length > 0.4 ? 'high' : 'medium',
        frequency: lowRelevanceCount,
        description: `${lowRelevanceCount} responses with low contextual relevance`,
        impact: 'Responses not aligned with user context',
        suggestedFix: 'Improve context understanding and matching',
      });
    }

    return issues.sort((a, b) => b.frequency - a.frequency);
  }

  private generateRecommendations(metrics: QualityMetrics[], issues: QualityIssue[]): string[] {
    const recommendations: string[] = [];

    if (issues.some(i => i.type === 'template_response')) {
      recommendations.push('Reduce template responses by improving contextual awareness');
    }

    if (issues.some(i => i.type === 'low_contextual_relevance')) {
      recommendations.push('Enhance context matching algorithms');
    }

    const avgScore = this.calculateAverageScore(metrics);
    if (avgScore < 70) {
      recommendations.push(
        'Overall quality improvement needed - review response generation processes'
      );
    }

    return recommendations;
  }

  private getDomainBreakdown(metrics: QualityMetrics[]): Map<string, QualityMetrics> {
    const domainMap = new Map<string, QualityMetrics[]>();

    for (const metric of metrics) {
      const domain = metric.domain;
      if (!domainMap.has(domain)) {
        domainMap.set(domain, []);
      }
      domainMap.get(domain)!.push(metric);
    }

    const breakdown = new Map<string, QualityMetrics>();
    for (const [domain, domainMetrics] of domainMap) {
      breakdown.set(domain, {
        ...domainMetrics[0],
        overallScore: this.calculateAverageScore(domainMetrics),
      });
    }

    return breakdown;
  }

  private getSourceQualityBreakdown(metrics: QualityMetrics[]): Map<string, QualityMetrics> {
    // This would analyze source quality in a real implementation
    return new Map();
  }

  private getTemplateDetectionStats(metrics: QualityMetrics[]): TemplateDetectionStats {
    const totalResponses = metrics.length;
    const templateResponses = metrics.filter(m => m.templateDetection.isTemplate).length;
    const templateRate = totalResponses > 0 ? templateResponses / totalResponses : 0;

    // Calculate template type distribution
    const templateTypes = new Map<string, number>();
    const patterns = new Map<string, number>();

    for (const metric of metrics) {
      if (metric.templateDetection.templateType) {
        templateTypes.set(
          metric.templateDetection.templateType,
          (templateTypes.get(metric.templateDetection.templateType) || 0) + 1
        );
      }

      for (const pattern of metric.templateDetection.detectedPatterns) {
        patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
      }
    }

    const templateMetrics = metrics.filter(m => m.templateDetection.isTemplate);
    const realIntelligenceMetrics = metrics.filter(m => !m.templateDetection.isTemplate);

    return {
      totalResponses,
      templateResponses,
      templateRate,
      mostCommonTemplateTypes: Array.from(templateTypes.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count),
      mostCommonPatterns: Array.from(patterns.entries())
        .map(([pattern, count]) => ({ pattern, count }))
        .sort((a, b) => b.count - a.count),
      qualityImpact: {
        templateResponses: {
          averageScore: this.calculateAverageScore(templateMetrics),
          count: templateMetrics.length,
        },
        realIntelligence: {
          averageScore: this.calculateAverageScore(realIntelligenceMetrics),
          count: realIntelligenceMetrics.length,
        },
      },
    };
  }

  private calculatePeriodTrend(metrics: QualityMetrics[], periodName: string): QualityTrend {
    const sortedMetrics = metrics.sort((a, b) => a.timestamp - b.timestamp);
    const averageScore = this.calculateAverageScore(sortedMetrics);

    // Calculate trend direction
    const firstQuarter = sortedMetrics.slice(0, Math.floor(sortedMetrics.length / 4));
    const lastQuarter = sortedMetrics.slice(-Math.floor(sortedMetrics.length / 4));

    const firstAvg = this.calculateAverageScore(firstQuarter);
    const lastAvg = this.calculateAverageScore(lastQuarter);

    const changePercentage = firstAvg > 0 ? ((lastAvg - firstAvg) / firstAvg) * 100 : 0;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (changePercentage > 5) trend = 'up';
    else if (changePercentage < -5) trend = 'down';

    return {
      period: periodName,
      averageScore,
      trend,
      changePercentage,
      keyInsights: this.generatePeriodInsights(sortedMetrics, trend),
    };
  }

  private generatePeriodInsights(
    metrics: QualityMetrics[],
    trend: 'up' | 'down' | 'stable'
  ): string[] {
    const insights: string[] = [];

    if (trend === 'up') {
      insights.push('Quality is improving over this period');
    } else if (trend === 'down') {
      insights.push('Quality is declining - attention needed');
    } else {
      insights.push('Quality is stable');
    }

    const templateRate = this.calculateTemplateRate(metrics);
    if (templateRate > 0.3) {
      insights.push('High template response rate detected');
    }

    return insights;
  }

  private getRecentMetrics(timeRangeMs: number): QualityMetrics[] {
    const cutoffTime = Date.now() - timeRangeMs;
    return Array.from(this.metrics.values()).filter(m => m.timestamp >= cutoffTime);
  }

  private calculateTemplateRate(metrics: QualityMetrics[]): number {
    if (metrics.length === 0) return 0;
    const templateCount = metrics.filter(m => m.templateDetection.isTemplate).length;
    return templateCount / metrics.length;
  }

  private getTopDomains(
    metrics: QualityMetrics[]
  ): Array<{ domain: string; count: number; averageScore: number }> {
    const domainMap = new Map<string, QualityMetrics[]>();

    for (const metric of metrics) {
      const domain = metric.domain;
      if (!domainMap.has(domain)) {
        domainMap.set(domain, []);
      }
      domainMap.get(domain)!.push(metric);
    }

    return Array.from(domainMap.entries())
      .map(([domain, domainMetrics]) => ({
        domain,
        count: domainMetrics.length,
        averageScore: this.calculateAverageScore(domainMetrics),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private convertToCSV(metrics: QualityMetrics[]): string {
    if (metrics.length === 0) return '';

    const headers = Object.keys(metrics[0]).join(',');
    const rows = metrics.map(metric =>
      Object.values(metric)
        .map(value => (typeof value === 'object' ? JSON.stringify(value) : value))
        .join(',')
    );

    return [headers, ...rows].join('\n');
  }

  private generateResponseId(): string {
    return `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultTimeRange(): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    return { start, end };
  }

  private createEmptyReport(timeRange?: { start: Date; end: Date }): QualityReport {
    return {
      timeRange: timeRange || this.getDefaultTimeRange(),
      averageScore: 0,
      qualityTrend: 'stable',
      scoreDistribution: { excellent: 0, good: 0, average: 0, poor: 0, very_poor: 0 },
      topIssues: [],
      recommendations: ['No data available for analysis'],
      domainBreakdown: new Map(),
      sourceQualityBreakdown: new Map(),
      templateDetectionStats: {
        totalResponses: 0,
        templateResponses: 0,
        templateRate: 0,
        mostCommonTemplateTypes: [],
        mostCommonPatterns: [],
        qualityImpact: {
          templateResponses: { averageScore: 0, count: 0 },
          realIntelligence: { averageScore: 0, count: 0 },
        },
      },
    };
  }
}

export default ResponseQualityMetrics;
