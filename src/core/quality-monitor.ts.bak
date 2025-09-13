#!/usr/bin/env node

/**
 * Real-Time Quality Monitoring System
 *
 * Provides continuous quality assessment, degradation detection,
 * improvement recommendations, and metrics dashboard for the
 * TappMCP Smart Vibe system.
 */

import { EventEmitter } from 'events';
import { LRUCache } from 'lru-cache';
import { ProjectScanner, type ProjectAnalysis } from './project-scanner.js';
import { SecurityScanner, type SecurityScanResult } from './security-scanner.js';
import { StaticAnalyzer, type StaticAnalysisResult } from './static-analyzer.js';

export interface QualityMetrics {
  overallScore: number;
  securityScore: number;
  codeQualityScore: number;
  maintainabilityScore: number;
  testCoverageScore: number;
  performanceScore: number;
  lastUpdated: string;
  trend: 'improving' | 'stable' | 'degrading';
  issues: QualityIssue[];
  recommendations: QualityRecommendation[];
}

export interface QualityIssue {
  id: string;
  type: 'security' | 'code-quality' | 'performance' | 'maintainability' | 'test-coverage';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  file?: string;
  line?: number;
  fix?: string;
  detectedAt: string;
  resolvedAt?: string;
}

export interface QualityRecommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  category: 'security' | 'performance' | 'maintainability' | 'testing' | 'architecture';
  actions: string[];
  estimatedTime: string;
}

export interface QualityTrend {
  timestamp: string;
  overallScore: number;
  securityScore: number;
  codeQualityScore: number;
  maintainabilityScore: number;
  testCoverageScore: number;
  performanceScore: number;
  issueCount: number;
  criticalIssues: number;
  highIssues: number;
}

export interface QualityAlert {
  id: string;
  type: 'degradation' | 'critical-issue' | 'threshold-exceeded' | 'improvement';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  metric: string;
  currentValue: number;
  threshold: number;
  trend: 'improving' | 'stable' | 'degrading';
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
}

export class QualityMonitor extends EventEmitter {
  private projectScanner: ProjectScanner;
  private securityScanner: SecurityScanner;
  private staticAnalyzer: StaticAnalyzer;
  private qualityCache: LRUCache<string, QualityMetrics>;
  private trendHistory: LRUCache<string, QualityTrend>;
  private alerts: Map<string, QualityAlert> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;
  private projectPath: string;

  // Quality thresholds
  private readonly thresholds = {
    overallScore: 70,
    securityScore: 80,
    codeQualityScore: 75,
    maintainabilityScore: 70,
    testCoverageScore: 80,
    performanceScore: 75,
  };

  // Alert thresholds
  private readonly alertThresholds = {
    degradation: 10, // 10% degradation triggers alert
    criticalIssues: 1, // 1 critical issue triggers alert
    highIssues: 5, // 5 high issues triggers alert
  };

  constructor(projectPath: string = process.cwd()) {
    super();
    this.projectPath = projectPath;
    this.projectScanner = new ProjectScanner();
    this.securityScanner = new SecurityScanner();
    this.staticAnalyzer = new StaticAnalyzer();

    // Initialize caches
    this.qualityCache = new LRUCache<string, QualityMetrics>({
      max: 100,
      ttl: 5 * 60 * 1000, // 5 minutes
    });

    this.trendHistory = new LRUCache<string, QualityTrend>({
      max: 1000,
      ttl: 24 * 60 * 60 * 1000, // 24 hours
    });
  }

  /**
   * Start real-time quality monitoring
   */
  startMonitoring(intervalMs: number = 60000): void {
    if (this.isMonitoring) {
      console.warn('Quality monitoring is already running');
      return;
    }

    this.isMonitoring = true;
    console.log(`Starting quality monitoring with ${intervalMs}ms interval`);

    // Initial assessment
    this.performQualityAssessment();

    // Set up interval
    this.monitoringInterval = setInterval(() => {
      this.performQualityAssessment();
    }, intervalMs);

    this.emit('monitoring-started', { interval: intervalMs });
  }

  /**
   * Stop real-time quality monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      console.warn('Quality monitoring is not running');
      return;
    }

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log('Quality monitoring stopped');
    this.emit('monitoring-stopped');
  }

  /**
   * Perform comprehensive quality assessment
   */
  async performQualityAssessment(): Promise<QualityMetrics> {
    try {
      console.log('Performing quality assessment...');
      const startTime = Date.now();

      // Run all analysis tools in parallel
      const [projectAnalysis, securityScan, staticAnalysis] = await Promise.allSettled([
        this.projectScanner.scanProject(this.projectPath),
        this.securityScanner.runSecurityScan(this.projectPath),
        this.staticAnalyzer.analyzeCode(this.projectPath),
      ]);

      // Calculate quality scores
      const qualityMetrics = this.calculateQualityMetrics(
        projectAnalysis.status === 'fulfilled' ? projectAnalysis.value : null,
        securityScan.status === 'fulfilled' ? securityScan.value : null,
        staticAnalysis.status === 'fulfilled' ? staticAnalysis.value : null
      );

      // Detect quality degradation
      await this.detectQualityDegradation(qualityMetrics);

      // Generate recommendations
      qualityMetrics.recommendations = this.generateQualityRecommendations(qualityMetrics);

      // Cache results
      const cacheKey = `quality:${Date.now()}`;
      this.qualityCache.set(cacheKey, qualityMetrics);

      // Store trend data
      this.storeTrendData(qualityMetrics);

      const duration = Date.now() - startTime;
      console.log(`Quality assessment completed in ${duration}ms`);

      this.emit('quality-assessment-completed', {
        metrics: qualityMetrics,
        duration,
      });

      return qualityMetrics;
    } catch (error) {
      console.error('Quality assessment failed:', error);
      this.emit('quality-assessment-failed', { error });
      throw error;
    }
  }

  /**
   * Calculate comprehensive quality metrics
   */
  private calculateQualityMetrics(
    projectAnalysis: ProjectAnalysis | null,
    securityScan: SecurityScanResult | null,
    staticAnalysis: StaticAnalysisResult | null
  ): QualityMetrics {
    const now = new Date().toISOString();
    const issues: QualityIssue[] = [];
    let overallScore = 0;
    let securityScore = 100;
    let codeQualityScore = 100;
    let maintainabilityScore = 100;
    let testCoverageScore = 100;
    let performanceScore = 100;

    // Security score calculation
    if (securityScan) {
      const { critical, high, moderate, low } = securityScan.summary;
      securityScore = Math.max(0, 100 - (critical * 20) - (high * 10) - (moderate * 5) - (low * 1));

      // Add security issues
      securityScan.vulnerabilities.forEach(vuln => {
        issues.push({
          id: `security-${vuln.id}`,
          type: 'security',
          severity: vuln.severity,
          title: vuln.description,
          description: `Vulnerability in ${vuln.package}@${vuln.version}`,
          fix: vuln.fix,
          detectedAt: now,
        });
      });
    }

    // Code quality score calculation
    if (staticAnalysis) {
      codeQualityScore = staticAnalysis.qualityScore || 100;
      maintainabilityScore = staticAnalysis.maintainability || 100;
      testCoverageScore = staticAnalysis.testCoverage || 100;
      performanceScore = staticAnalysis.performance || 100;

      // Add code quality issues
      if (staticAnalysis.issues) {
        staticAnalysis.issues.forEach(issue => {
          issues.push({
            id: `code-${issue.id || Date.now()}`,
            type: 'code-quality',
            severity: issue.severity || 'medium',
            title: issue.title || 'Code Quality Issue',
            description: issue.description || 'Code quality issue detected',
            file: issue.file,
            line: issue.line,
            fix: issue.fix,
            detectedAt: now,
          });
        });
      }
    }

    // Project analysis issues
    if (projectAnalysis) {
      projectAnalysis.qualityIssues.forEach((issue, index) => {
        issues.push({
          id: `project-${index}`,
          type: 'maintainability',
          severity: 'medium',
          title: 'Project Quality Issue',
          description: issue,
          detectedAt: now,
        });
      });
    }

    // Calculate overall score (weighted average)
    overallScore = Math.round(
      (securityScore * 0.25) +
      (codeQualityScore * 0.25) +
      (maintainabilityScore * 0.20) +
      (testCoverageScore * 0.15) +
      (performanceScore * 0.15)
    );

    // Determine trend
    const trend = this.calculateTrend(overallScore);

    return {
      overallScore,
      securityScore,
      codeQualityScore,
      maintainabilityScore,
      testCoverageScore,
      performanceScore,
      lastUpdated: now,
      trend,
      issues,
      recommendations: [], // Will be populated by generateQualityRecommendations
    };
  }

  /**
   * Detect quality degradation and generate alerts
   */
  private async detectQualityDegradation(currentMetrics: QualityMetrics): Promise<void> {
    const previousMetrics = this.getPreviousMetrics();
    if (!previousMetrics) return;

    // Check for overall score degradation
    const scoreDiff = currentMetrics.overallScore - previousMetrics.overallScore;
    if (scoreDiff < -this.alertThresholds.degradation) {
      await this.createAlert({
        type: 'degradation',
        severity: 'high',
        title: 'Quality Score Degradation Detected',
        description: `Overall quality score decreased by ${Math.abs(scoreDiff)} points`,
        metric: 'overallScore',
        currentValue: currentMetrics.overallScore,
        threshold: previousMetrics.overallScore,
        trend: 'degrading',
      });
    }

    // Check for critical issues
    const criticalIssues = currentMetrics.issues.filter(issue => issue.severity === 'critical');
    if (criticalIssues.length >= this.alertThresholds.criticalIssues) {
      await this.createAlert({
        type: 'critical-issue',
        severity: 'critical',
        title: 'Critical Quality Issues Detected',
        description: `${criticalIssues.length} critical issues found`,
        metric: 'criticalIssues',
        currentValue: criticalIssues.length,
        threshold: this.alertThresholds.criticalIssues,
        trend: 'degrading',
      });
    }

    // Check for high issues
    const highIssues = currentMetrics.issues.filter(issue => issue.severity === 'high');
    if (highIssues.length >= this.alertThresholds.highIssues) {
      await this.createAlert({
        type: 'threshold-exceeded',
        severity: 'high',
        title: 'High Priority Issues Threshold Exceeded',
        description: `${highIssues.length} high priority issues found`,
        metric: 'highIssues',
        currentValue: highIssues.length,
        threshold: this.alertThresholds.highIssues,
        trend: 'degrading',
      });
    }

    // Check individual metric thresholds
    Object.entries(this.thresholds).forEach(([metric, threshold]) => {
      const currentValue = currentMetrics[metric as keyof QualityMetrics] as number;
      if (currentValue < threshold) {
        this.createAlert({
          type: 'threshold-exceeded',
          severity: currentValue < threshold * 0.8 ? 'critical' : 'high',
          title: `${metric} Below Threshold`,
          description: `${metric} score (${currentValue}) is below threshold (${threshold})`,
          metric,
          currentValue,
          threshold,
          trend: 'degrading',
        });
      }
    });
  }

  /**
   * Generate quality recommendations
   */
  private generateQualityRecommendations(metrics: QualityMetrics): QualityRecommendation[] {
    const recommendations: QualityRecommendation[] = [];

    // Security recommendations
    if (metrics.securityScore < this.thresholds.securityScore) {
      recommendations.push({
        id: 'security-improvement',
        priority: 'high',
        title: 'Improve Security Score',
        description: `Current security score is ${metrics.securityScore}, below threshold of ${this.thresholds.securityScore}`,
        impact: 'High - Security vulnerabilities pose significant risks',
        effort: 'medium',
        category: 'security',
        actions: [
          'Update vulnerable dependencies',
          'Implement security headers',
          'Add input validation',
          'Enable security scanning in CI/CD',
        ],
        estimatedTime: '4-8 hours',
      });
    }

    // Code quality recommendations
    if (metrics.codeQualityScore < this.thresholds.codeQualityScore) {
      recommendations.push({
        id: 'code-quality-improvement',
        priority: 'medium',
        title: 'Improve Code Quality',
        description: `Current code quality score is ${metrics.codeQualityScore}, below threshold of ${this.thresholds.codeQualityScore}`,
        impact: 'Medium - Poor code quality affects maintainability',
        effort: 'high',
        category: 'maintainability',
        actions: [
          'Refactor complex functions',
          'Add proper error handling',
          'Improve code documentation',
          'Implement code reviews',
        ],
        estimatedTime: '8-16 hours',
      });
    }

    // Test coverage recommendations
    if (metrics.testCoverageScore < this.thresholds.testCoverageScore) {
      recommendations.push({
        id: 'test-coverage-improvement',
        priority: 'medium',
        title: 'Increase Test Coverage',
        description: `Current test coverage is ${metrics.testCoverageScore}%, below threshold of ${this.thresholds.testCoverageScore}%`,
        impact: 'Medium - Low test coverage increases bug risk',
        effort: 'high',
        category: 'testing',
        actions: [
          'Write unit tests for uncovered code',
          'Add integration tests',
          'Implement test automation',
          'Set up coverage reporting',
        ],
        estimatedTime: '12-24 hours',
      });
    }

    // Performance recommendations
    if (metrics.performanceScore < this.thresholds.performanceScore) {
      recommendations.push({
        id: 'performance-improvement',
        priority: 'medium',
        title: 'Improve Performance',
        description: `Current performance score is ${metrics.performanceScore}, below threshold of ${this.thresholds.performanceScore}`,
        impact: 'Medium - Poor performance affects user experience',
        effort: 'medium',
        category: 'performance',
        actions: [
          'Optimize database queries',
          'Implement caching',
          'Reduce bundle size',
          'Add performance monitoring',
        ],
        estimatedTime: '6-12 hours',
      });
    }

    return recommendations;
  }

  /**
   * Create quality alert
   */
  private async createAlert(alertData: Omit<QualityAlert, 'id' | 'timestamp' | 'acknowledged' | 'resolved'>): Promise<void> {
    const alert: QualityAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      resolved: false,
      ...alertData,
    };

    this.alerts.set(alert.id, alert);
    this.emit('quality-alert', alert);

    console.warn(`Quality Alert: ${alert.title} - ${alert.description}`);
  }

  /**
   * Store trend data for analysis
   */
  private storeTrendData(metrics: QualityMetrics): void {
    const trend: QualityTrend = {
      timestamp: metrics.lastUpdated,
      overallScore: metrics.overallScore,
      securityScore: metrics.securityScore,
      codeQualityScore: metrics.codeQualityScore,
      maintainabilityScore: metrics.maintainabilityScore,
      testCoverageScore: metrics.testCoverageScore,
      performanceScore: metrics.performanceScore,
      issueCount: metrics.issues.length,
      criticalIssues: metrics.issues.filter(i => i.severity === 'critical').length,
      highIssues: metrics.issues.filter(i => i.severity === 'high').length,
    };

    this.trendHistory.set(metrics.lastUpdated, trend);
  }

  /**
   * Calculate quality trend
   */
  private calculateTrend(currentScore: number): 'improving' | 'stable' | 'degrading' {
    const previousMetrics = this.getPreviousMetrics();
    if (!previousMetrics) return 'stable';

    const diff = currentScore - previousMetrics.overallScore;
    if (diff > 5) return 'improving';
    if (diff < -5) return 'degrading';
    return 'stable';
  }

  /**
   * Get previous quality metrics for comparison
   */
  private getPreviousMetrics(): QualityMetrics | null {
    const keys = Array.from(this.qualityCache.keys()).sort();
    if (keys.length < 2) return null;

    const previousKey = keys[keys.length - 2];
    return this.qualityCache.get(previousKey) || null;
  }

  /**
   * Get current quality metrics
   */
  getCurrentMetrics(): QualityMetrics | null {
    const keys = Array.from(this.qualityCache.keys()).sort();
    if (keys.length === 0) return null;

    const latestKey = keys[keys.length - 1];
    return this.qualityCache.get(latestKey) || null;
  }

  /**
   * Get quality trend history
   */
  getTrendHistory(limit: number = 100): QualityTrend[] {
    const trends = Array.from(this.trendHistory.values())
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return trends.slice(-limit);
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): QualityAlert[] {
    return Array.from(this.alerts.values())
      .filter(alert => !alert.resolved)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.acknowledged = true;
    this.alerts.set(alertId, alert);
    this.emit('alert-acknowledged', alert);
    return true;
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.resolved = true;
    alert.acknowledged = true;
    this.alerts.set(alertId, alert);
    this.emit('alert-resolved', alert);
    return true;
  }

  /**
   * Get quality dashboard data
   */
  getDashboardData(): {
    currentMetrics: QualityMetrics | null;
    trendHistory: QualityTrend[];
    activeAlerts: QualityAlert[];
    isMonitoring: boolean;
  } {
    return {
      currentMetrics: this.getCurrentMetrics(),
      trendHistory: this.getTrendHistory(),
      activeAlerts: this.getActiveAlerts(),
      isMonitoring: this.isMonitoring,
    };
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stopMonitoring();
    this.qualityCache.clear();
    this.trendHistory.clear();
    this.alerts.clear();
    this.removeAllListeners();
  }
}
