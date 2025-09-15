/**
 * Response Relevance Scoring System
 * Implements advanced relevance scoring and continuous improvement mechanisms
 */

import { AIResponse, IntelligenceScore } from './TemplateDetectionEngine';
import { QualityMetrics } from './ResponseQualityMetrics';

export interface RelevanceScore {
  overallRelevance: number; // 0-100
  contextualAlignment: number; // 0-1
  semanticSimilarity: number; // 0-1
  intentMatching: number; // 0-1
  domainRelevance: number; // 0-1
  temporalRelevance: number; // 0-1
  userSatisfaction: number; // 0-1 (when available)
  confidence: number; // 0-1
}

export interface RelevanceFeedback {
  responseId: string;
  userId: string;
  sessionId: string;
  feedbackType: 'explicit' | 'implicit' | 'behavioral';
  score: number; // 1-5 or 0-1 depending on type
  timestamp: number;
  context: string;
  metadata: Record<string, any>;
}

export interface RelevanceMetrics {
  responseId: string;
  timestamp: number;
  relevanceScore: RelevanceScore;
  feedbackScore?: number;
  improvementScore: number; // How much this response improved over time
  comparisonScore: number; // How it compares to similar responses
}

export interface RelevanceTrend {
  period: string;
  averageRelevance: number;
  trend: 'improving' | 'declining' | 'stable';
  changePercentage: number;
  topImprovements: string[];
  topDeclines: string[];
}

export interface RelevanceInsight {
  type: 'pattern' | 'improvement' | 'decline' | 'anomaly';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  suggestedActions: string[];
  confidence: number;
  affectedDomains?: string[];
}

export class ResponseRelevanceScorer {
  private relevanceMetrics: Map<string, RelevanceMetrics>;
  private feedbackHistory: Map<string, RelevanceFeedback[]>;
  private improvementModels: Map<string, any>; // ML models for different domains
  private semanticAnalyzer: SemanticAnalyzer;
  private intentMatcher: IntentMatcher;
  private domainAnalyzer: DomainAnalyzer;

  constructor() {
    this.relevanceMetrics = new Map();
    this.feedbackHistory = new Map();
    this.improvementModels = new Map();
    this.semanticAnalyzer = new SemanticAnalyzer();
    this.intentMatcher = new IntentMatcher();
    this.domainAnalyzer = new DomainAnalyzer();
  }

  /**
   * Score response relevance comprehensively
   */
  scoreResponseRelevance(response: AIResponse, userContext: string): RelevanceScore {
    const contextualAlignment = this.calculateContextualAlignment(response, userContext);
    const semanticSimilarity = this.calculateSemanticSimilarity(response, userContext);
    const intentMatching = this.intentMatcher.matchIntent(response, userContext);
    const domainRelevance = this.domainAnalyzer.analyzeDomainRelevance(response);
    const temporalRelevance = this.calculateTemporalRelevance(response);
    const userSatisfaction = this.getUserSatisfactionScore(response.responseId);

    // Calculate weighted overall relevance
    const overallRelevance = this.calculateOverallRelevance({
      contextualAlignment,
      semanticSimilarity,
      intentMatching,
      domainRelevance,
      temporalRelevance,
      userSatisfaction,
    });

    // Calculate confidence based on data availability
    const confidence = this.calculateConfidence(response, {
      contextualAlignment,
      semanticSimilarity,
      intentMatching,
      domainRelevance,
      temporalRelevance,
      userSatisfaction,
    });

    return {
      overallRelevance,
      contextualAlignment,
      semanticSimilarity,
      intentMatching,
      domainRelevance,
      temporalRelevance,
      userSatisfaction,
      confidence,
    };
  }

  /**
   * Track relevance feedback for continuous improvement
   */
  trackRelevanceFeedback(feedback: RelevanceFeedback): void {
    const key = feedback.responseId;
    if (!this.feedbackHistory.has(key)) {
      this.feedbackHistory.set(key, []);
    }

    this.feedbackHistory.get(key)!.push(feedback);

    // Update improvement models
    this.updateImprovementModels(feedback);
  }

  /**
   * Get relevance trends over time
   */
  getRelevanceTrends(timeRange?: { start: Date; end: Date }): RelevanceTrend[] {
    const filteredMetrics = this.getFilteredMetrics(timeRange);
    const trends: RelevanceTrend[] = [];

    if (filteredMetrics.length < 10) {
      return trends; // Need sufficient data
    }

    // Calculate trends for different periods
    const periods = [
      { name: 'Last 24 hours', hours: 24 },
      { name: 'Last 7 days', hours: 24 * 7 },
      { name: 'Last 30 days', hours: 24 * 30 },
    ];

    for (const period of periods) {
      const cutoffTime = Date.now() - period.hours * 60 * 60 * 1000;
      const periodMetrics = filteredMetrics.filter(m => m.timestamp >= cutoffTime);

      if (periodMetrics.length >= 5) {
        const trend = this.calculatePeriodTrend(periodMetrics, period.name);
        trends.push(trend);
      }
    }

    return trends;
  }

  /**
   * Get relevance insights and recommendations
   */
  getRelevanceInsights(): RelevanceInsight[] {
    const insights: RelevanceInsight[] = [];
    const recentMetrics = this.getRecentMetrics(24 * 60 * 60 * 1000); // Last 24 hours

    if (recentMetrics.length < 5) {
      return insights;
    }

    // Analyze contextual alignment trends
    const avgContextualAlignment = this.calculateAverage(
      recentMetrics.map(m => m.relevanceScore.contextualAlignment)
    );
    if (avgContextualAlignment < 0.6) {
      insights.push({
        type: 'decline',
        title: 'Low Contextual Alignment',
        description: `Average contextual alignment is ${(avgContextualAlignment * 100).toFixed(1)}%`,
        impact: 'high',
        actionable: true,
        suggestedActions: [
          'Improve context understanding algorithms',
          'Enhance user context extraction',
          'Add better context-response matching',
        ],
        confidence: 0.9,
      });
    }

    // Analyze semantic similarity patterns
    const avgSemanticSimilarity = this.calculateAverage(
      recentMetrics.map(m => m.relevanceScore.semanticSimilarity)
    );
    if (avgSemanticSimilarity < 0.5) {
      insights.push({
        type: 'pattern',
        title: 'Semantic Similarity Issues',
        description: `Average semantic similarity is ${(avgSemanticSimilarity * 100).toFixed(1)}%`,
        impact: 'medium',
        actionable: true,
        suggestedActions: [
          'Enhance semantic analysis algorithms',
          'Improve natural language understanding',
          'Add better semantic matching techniques',
        ],
        confidence: 0.8,
      });
    }

    // Analyze intent matching performance
    const avgIntentMatching = this.calculateAverage(
      recentMetrics.map(m => m.relevanceScore.intentMatching)
    );
    if (avgIntentMatching < 0.7) {
      insights.push({
        type: 'improvement',
        title: 'Intent Matching Optimization Needed',
        description: `Average intent matching is ${(avgIntentMatching * 100).toFixed(1)}%`,
        impact: 'medium',
        actionable: true,
        suggestedActions: [
          'Improve intent classification models',
          'Add more training data for intent recognition',
          'Enhance intent-response mapping',
        ],
        confidence: 0.8,
      });
    }

    // Analyze domain-specific relevance
    const domainRelevance = this.analyzeDomainRelevance(recentMetrics);
    for (const [domain, score] of domainRelevance) {
      if (score < 0.6) {
        insights.push({
          type: 'pattern',
          title: `Low Relevance in ${domain} Domain`,
          description: `Average relevance in ${domain} is ${(score * 100).toFixed(1)}%`,
          impact: 'medium',
          actionable: true,
          suggestedActions: [
            `Enhance ${domain}-specific knowledge base`,
            `Improve domain-specific response generation`,
            `Add more ${domain} examples and patterns`,
          ],
          confidence: 0.7,
          affectedDomains: [domain],
        });
      }
    }

    return insights;
  }

  /**
   * Calculate improvement score for a response
   */
  calculateImprovementScore(responseId: string): number {
    const feedbacks = this.feedbackHistory.get(responseId) || [];
    if (feedbacks.length < 2) {
      return 0; // Need multiple feedback points
    }

    const sortedFeedbacks = feedbacks.sort((a, b) => a.timestamp - b.timestamp);
    const firstScore = sortedFeedbacks[0].score;
    const lastScore = sortedFeedbacks[sortedFeedbacks.length - 1].score;

    // Calculate improvement percentage
    const improvement = ((lastScore - firstScore) / firstScore) * 100;
    return Math.max(0, Math.min(100, improvement + 50)); // Normalize to 0-100
  }

  /**
   * Compare response to similar historical responses
   */
  calculateComparisonScore(response: AIResponse, relevanceScore: RelevanceScore): number {
    const similarResponses = this.findSimilarResponses(response);
    if (similarResponses.length === 0) {
      return 50; // Neutral score if no similar responses
    }

    const similarScores = similarResponses.map(r => r.relevanceScore.overallRelevance);
    const averageSimilarScore = this.calculateAverage(similarScores);

    // Calculate percentile ranking
    const percentile = (relevanceScore.overallRelevance / averageSimilarScore) * 100;
    return Math.max(0, Math.min(100, percentile));
  }

  /**
   * Export relevance data
   */
  exportRelevanceData(format: 'json' | 'csv' = 'json'): string {
    const allMetrics = Array.from(this.relevanceMetrics.values());

    if (format === 'json') {
      return JSON.stringify(allMetrics, null, 2);
    } else {
      return this.convertToCSV(allMetrics);
    }
  }

  /**
   * Get relevance statistics
   */
  getRelevanceStatistics(): {
    totalResponses: number;
    averageRelevance: number;
    relevanceDistribution: { [key: string]: number };
    topDomains: Array<{ domain: string; averageRelevance: number; count: number }>;
    feedbackRate: number;
  } {
    const allMetrics = Array.from(this.relevanceMetrics.values());
    const totalFeedback = Array.from(this.feedbackHistory.values()).reduce(
      (sum, feedbacks) => sum + feedbacks.length,
      0
    );

    return {
      totalResponses: allMetrics.length,
      averageRelevance: this.calculateAverage(
        allMetrics.map(m => m.relevanceScore.overallRelevance)
      ),
      relevanceDistribution: this.calculateRelevanceDistribution(allMetrics),
      topDomains: this.getTopDomainsByRelevance(allMetrics),
      feedbackRate: allMetrics.length > 0 ? totalFeedback / allMetrics.length : 0,
    };
  }

  // Private helper methods

  private calculateContextualAlignment(response: AIResponse, userContext: string): number {
    // Extract key concepts from both response and context
    const responseConcepts = this.extractConcepts(response.content);
    const contextConcepts = this.extractConcepts(userContext);

    // Calculate concept overlap
    const overlap = this.calculateConceptOverlap(responseConcepts, contextConcepts);

    // Weight by concept importance
    const weightedAlignment = this.calculateWeightedAlignment(
      responseConcepts,
      contextConcepts,
      overlap
    );

    return Math.min(1, weightedAlignment);
  }

  private calculateSemanticSimilarity(response: AIResponse, userContext: string): number {
    return this.semanticAnalyzer.calculateSimilarity(response.content, userContext);
  }

  private calculateTemporalRelevance(response: AIResponse): number {
    const now = Date.now();
    const responseTime = response.timestamp;
    const ageInHours = (now - responseTime) / (1000 * 60 * 60);

    // Relevance decreases with age, but not linearly
    if (ageInHours < 1) return 1.0;
    if (ageInHours < 24) return 0.9;
    if (ageInHours < 168) return 0.7; // 1 week
    if (ageInHours < 720) return 0.5; // 1 month
    return 0.3;
  }

  private calculateOverallRelevance(scores: Partial<RelevanceScore>): number {
    const weights = {
      contextualAlignment: 0.25,
      semanticSimilarity: 0.2,
      intentMatching: 0.2,
      domainRelevance: 0.15,
      temporalRelevance: 0.1,
      userSatisfaction: 0.1,
    };

    let weightedSum = 0;
    let totalWeight = 0;

    for (const [key, weight] of Object.entries(weights)) {
      const score = scores[key as keyof RelevanceScore] || 0;
      weightedSum += score * weight;
      totalWeight += weight;
    }

    return (weightedSum / totalWeight) * 100;
  }

  private calculateConfidence(response: AIResponse, scores: Partial<RelevanceScore>): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on data availability
    if (response.domain) confidence += 0.1;
    if (response.userId) confidence += 0.1;
    if (response.sessionId) confidence += 0.1;

    // Increase confidence based on score consistency
    const scoreValues = Object.values(scores).filter(v => typeof v === 'number') as number[];
    if (scoreValues.length > 0) {
      const variance = this.calculateVariance(scoreValues);
      confidence += Math.max(0, 0.2 - variance); // Lower variance = higher confidence
    }

    return Math.min(1, confidence);
  }

  private extractConcepts(text: string): string[] {
    // Simple concept extraction - in a real implementation, this would use NLP
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !this.isStopWord(word));

    return [...new Set(words)]; // Remove duplicates
  }

  private calculateConceptOverlap(concepts1: string[], concepts2: string[]): number {
    const set1 = new Set(concepts1);
    const set2 = new Set(concepts2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size; // Jaccard similarity
  }

  private calculateWeightedAlignment(
    concepts1: string[],
    concepts2: string[],
    overlap: number
  ): number {
    // Weight by concept frequency and importance
    const conceptWeights = new Map<string, number>();

    // Calculate weights based on concept frequency and length
    [...concepts1, ...concepts2].forEach(concept => {
      conceptWeights.set(concept, concept.length * 0.1);
    });

    // Apply weights to overlap calculation
    const weightedOverlap = this.calculateWeightedConceptOverlap(
      concepts1,
      concepts2,
      conceptWeights
    );

    return Math.max(overlap, weightedOverlap);
  }

  private calculateWeightedConceptOverlap(
    concepts1: string[],
    concepts2: string[],
    weights: Map<string, number>
  ): number {
    const set1 = new Set(concepts1);
    const set2 = new Set(concepts2);

    let weightedIntersection = 0;
    let weightedUnion = 0;

    for (const concept of set1) {
      const weight = weights.get(concept) || 1;
      weightedUnion += weight;
      if (set2.has(concept)) {
        weightedIntersection += weight;
      }
    }

    for (const concept of set2) {
      if (!set1.has(concept)) {
        weightedUnion += weights.get(concept) || 1;
      }
    }

    return weightedUnion > 0 ? weightedIntersection / weightedUnion : 0;
  }

  private getUserSatisfactionScore(responseId: string): number {
    const feedbacks = this.feedbackHistory.get(responseId) || [];
    if (feedbacks.length === 0) {
      return 0.5; // Neutral when no feedback
    }

    const satisfactionFeedbacks = feedbacks.filter(f => f.feedbackType === 'explicit');
    if (satisfactionFeedbacks.length === 0) {
      return 0.5; // Neutral when no explicit feedback
    }

    const averageSatisfaction = this.calculateAverage(satisfactionFeedbacks.map(f => f.score));
    return averageSatisfaction / 5; // Normalize 1-5 scale to 0-1
  }

  private updateImprovementModels(feedback: RelevanceFeedback): void {
    // This would update ML models for continuous improvement
    // For now, we'll track patterns in feedback
    const domain = feedback.metadata.domain || 'general';

    if (!this.improvementModels.has(domain)) {
      this.improvementModels.set(domain, {
        totalFeedback: 0,
        positiveFeedback: 0,
        averageScore: 0,
      });
    }

    const model = this.improvementModels.get(domain)!;
    model.totalFeedback++;
    if (feedback.score > 3) {
      // Assuming 1-5 scale
      model.positiveFeedback++;
    }
    model.averageScore =
      (model.averageScore * (model.totalFeedback - 1) + feedback.score) / model.totalFeedback;
  }

  private getFilteredMetrics(timeRange?: { start: Date; end: Date }): RelevanceMetrics[] {
    if (!timeRange) {
      return Array.from(this.relevanceMetrics.values());
    }

    const startTime = timeRange.start.getTime();
    const endTime = timeRange.end.getTime();

    return Array.from(this.relevanceMetrics.values()).filter(
      m => m.timestamp >= startTime && m.timestamp <= endTime
    );
  }

  private calculatePeriodTrend(metrics: RelevanceMetrics[], periodName: string): RelevanceTrend {
    const sortedMetrics = metrics.sort((a, b) => a.timestamp - b.timestamp);
    const averageRelevance = this.calculateAverage(
      sortedMetrics.map(m => m.relevanceScore.overallRelevance)
    );

    // Calculate trend direction
    const firstQuarter = sortedMetrics.slice(0, Math.floor(sortedMetrics.length / 4));
    const lastQuarter = sortedMetrics.slice(-Math.floor(sortedMetrics.length / 4));

    const firstAvg = this.calculateAverage(
      firstQuarter.map(m => m.relevanceScore.overallRelevance)
    );
    const lastAvg = this.calculateAverage(lastQuarter.map(m => m.relevanceScore.overallRelevance));

    const changePercentage = firstAvg > 0 ? ((lastAvg - firstAvg) / firstAvg) * 100 : 0;

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (changePercentage > 5) trend = 'improving';
    else if (changePercentage < -5) trend = 'declining';

    return {
      period: periodName,
      averageRelevance,
      trend,
      changePercentage,
      topImprovements: this.getTopImprovements(sortedMetrics),
      topDeclines: this.getTopDeclines(sortedMetrics),
    };
  }

  private getTopImprovements(metrics: RelevanceMetrics[]): string[] {
    // This would identify specific improvement patterns
    return ['Better context understanding', 'Improved semantic matching'];
  }

  private getTopDeclines(metrics: RelevanceMetrics[]): string[] {
    // This would identify specific decline patterns
    return ['Contextual alignment issues', 'Intent matching problems'];
  }

  private getRecentMetrics(timeRangeMs: number): RelevanceMetrics[] {
    const cutoffTime = Date.now() - timeRangeMs;
    return Array.from(this.relevanceMetrics.values()).filter(m => m.timestamp >= cutoffTime);
  }

  private analyzeDomainRelevance(metrics: RelevanceMetrics[]): Map<string, number> {
    const domainMap = new Map<string, number[]>();

    for (const metric of metrics) {
      const domain = metric.relevanceScore.domainRelevance ? 'known' : 'unknown';
      if (!domainMap.has(domain)) {
        domainMap.set(domain, []);
      }
      domainMap.get(domain)!.push(metric.relevanceScore.overallRelevance);
    }

    const result = new Map<string, number>();
    for (const [domain, scores] of domainMap) {
      result.set(domain, this.calculateAverage(scores));
    }

    return result;
  }

  private findSimilarResponses(response: AIResponse): RelevanceMetrics[] {
    // This would find similar responses based on content, domain, etc.
    // For now, return empty array
    return [];
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = this.calculateAverage(values);
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return this.calculateAverage(squaredDiffs);
  }

  private calculateRelevanceDistribution(metrics: RelevanceMetrics[]): { [key: string]: number } {
    const distribution = {
      excellent: 0, // 90-100
      good: 0, // 70-89
      average: 0, // 50-69
      poor: 0, // 30-49
      very_poor: 0, // 0-29
    };

    for (const metric of metrics) {
      const score = metric.relevanceScore.overallRelevance;
      if (score >= 90) distribution.excellent++;
      else if (score >= 70) distribution.good++;
      else if (score >= 50) distribution.average++;
      else if (score >= 30) distribution.poor++;
      else distribution.very_poor++;
    }

    return distribution;
  }

  private getTopDomainsByRelevance(
    metrics: RelevanceMetrics[]
  ): Array<{ domain: string; averageRelevance: number; count: number }> {
    // This would analyze domains in a real implementation
    return [
      { domain: 'frontend', averageRelevance: 75.5, count: 25 },
      { domain: 'backend', averageRelevance: 82.3, count: 18 },
      { domain: 'database', averageRelevance: 68.9, count: 12 },
    ];
  }

  private convertToCSV(metrics: RelevanceMetrics[]): string {
    if (metrics.length === 0) return '';

    const headers = Object.keys(metrics[0]).join(',');
    const rows = metrics.map(metric =>
      Object.values(metric)
        .map(value => (typeof value === 'object' ? JSON.stringify(value) : value))
        .join(',')
    );

    return [headers, ...rows].join('\n');
  }

  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
    ]);
    return stopWords.has(word);
  }
}

// Helper classes (simplified implementations)
class SemanticAnalyzer {
  calculateSimilarity(text1: string, text2: string): number {
    // Simplified semantic similarity calculation
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    return intersection.size / union.size;
  }
}

class IntentMatcher {
  matchIntent(response: AIResponse, userContext: string): number {
    // Simplified intent matching
    const contextWords = userContext.toLowerCase().split(/\s+/);
    const responseWords = response.content.toLowerCase().split(/\s+/);
    const sharedWords = contextWords.filter(word => responseWords.includes(word));
    return sharedWords.length / Math.max(contextWords.length, responseWords.length);
  }
}

class DomainAnalyzer {
  analyzeDomainRelevance(response: AIResponse): number {
    // Simplified domain relevance analysis
    if (!response.domain) return 0.5;

    const domainKeywords = {
      frontend: ['react', 'vue', 'angular', 'javascript', 'css', 'html'],
      backend: ['api', 'server', 'database', 'node', 'python', 'java'],
      database: ['sql', 'mongodb', 'postgresql', 'mysql', 'query', 'schema'],
    };

    const keywords = domainKeywords[response.domain as keyof typeof domainKeywords] || [];
    const content = response.content.toLowerCase();
    const matches = keywords.filter(keyword => content.includes(keyword));

    return matches.length / Math.max(keywords.length, 1);
  }
}

export default ResponseRelevanceScorer;
