import { describe, it, expect, beforeEach } from 'vitest';
import { QualityScorecardGenerator } from './quality-scorecard.js';
import type { SecurityScanResult } from './security-scanner.js';
import type { StaticAnalysisResult } from './static-analyzer.js';

describe('QualityScorecardGenerator', () => {
  let generator: QualityScorecardGenerator;

  beforeEach(() => {
    generator = new QualityScorecardGenerator();
  });

  describe('generateScorecard', () => {
    it('should generate comprehensive quality scorecard', () => {
      const securityResult: SecurityScanResult = {
        vulnerabilities: [],
        scanTime: 100,
        status: 'pass',
        summary: { total: 0, critical: 0, high: 0, moderate: 0, low: 0 },
      };

      const staticResult: StaticAnalysisResult = {
        issues: [],
        scanTime: 200,
        status: 'pass',
        summary: { total: 0, error: 0, warning: 0, info: 0 },
        metrics: { complexity: 5, maintainability: 85, duplication: 2 },
      };

      const coverageMetrics = { line: 90, branch: 85, function: 88 };
      const performanceMetrics = { responseTime: 80, memoryUsage: 128 };
      const businessMetrics = { costPrevention: 15000, timeSaved: 5, userSatisfaction: 95 };

      const scorecard = generator.generateScorecard(
        securityResult,
        staticResult,
        coverageMetrics,
        performanceMetrics,
        businessMetrics
      );

      expect(scorecard).toHaveProperty('overall');
      expect(scorecard).toHaveProperty('security');
      expect(scorecard).toHaveProperty('coverage');
      expect(scorecard).toHaveProperty('complexity');
      expect(scorecard).toHaveProperty('performance');
      expect(scorecard).toHaveProperty('business');
      expect(scorecard).toHaveProperty('recommendations');
      expect(scorecard).toHaveProperty('issues');

      expect(scorecard.overall.score).toBeGreaterThan(0);
      expect(scorecard.overall.grade).toMatch(/A|B|C|D|F/);
      expect(scorecard.overall.status).toMatch(/pass|fail|warning/);
    });

    it('should handle security vulnerabilities correctly', () => {
      const securityResult: SecurityScanResult = {
        vulnerabilities: [
          {
            id: 'CVE-2023-1234',
            severity: 'critical',
            package: 'test-package',
            version: '1.0.0',
            description: 'Critical vulnerability',
          },
        ],
        scanTime: 100,
        status: 'fail',
        summary: { total: 1, critical: 1, high: 0, moderate: 0, low: 0 },
      };

      const staticResult: StaticAnalysisResult = {
        issues: [],
        scanTime: 200,
        status: 'pass',
        summary: { total: 0, error: 0, warning: 0, info: 0 },
        metrics: { complexity: 5, maintainability: 85, duplication: 2 },
      };

      const coverageMetrics = { line: 90, branch: 85, function: 88 };
      const performanceMetrics = { responseTime: 80, memoryUsage: 128 };
      const businessMetrics = { costPrevention: 15000, timeSaved: 5, userSatisfaction: 95 };

      const scorecard = generator.generateScorecard(
        securityResult,
        staticResult,
        coverageMetrics,
        performanceMetrics,
        businessMetrics
      );

      expect(scorecard.security.critical).toBe(1);
      expect(scorecard.security.score).toBeLessThan(100);
      expect(scorecard.overall.status).toBe('fail');
      expect(scorecard.recommendations.some(rec => rec.includes('critical'))).toBe(true);
    });

    it('should handle low coverage correctly', () => {
      const securityResult: SecurityScanResult = {
        vulnerabilities: [],
        scanTime: 100,
        status: 'pass',
        summary: { total: 0, critical: 0, high: 0, moderate: 0, low: 0 },
      };

      const staticResult: StaticAnalysisResult = {
        issues: [],
        scanTime: 200,
        status: 'pass',
        summary: { total: 0, error: 0, warning: 0, info: 0 },
        metrics: { complexity: 5, maintainability: 85, duplication: 2 },
      };

      const coverageMetrics = { line: 60, branch: 55, function: 58 };
      const performanceMetrics = { responseTime: 80, memoryUsage: 128 };
      const businessMetrics = { costPrevention: 15000, timeSaved: 5, userSatisfaction: 95 };

      const scorecard = generator.generateScorecard(
        securityResult,
        staticResult,
        coverageMetrics,
        performanceMetrics,
        businessMetrics
      );

      expect(scorecard.coverage.lineCoverage).toBe(60);
      expect(scorecard.coverage.grade).toBe('F');
      expect(scorecard.recommendations.some(rec => rec.includes('coverage'))).toBe(true);
    });

    it('should handle high complexity correctly', () => {
      const securityResult: SecurityScanResult = {
        vulnerabilities: [],
        scanTime: 100,
        status: 'pass',
        summary: { total: 0, critical: 0, high: 0, moderate: 0, low: 0 },
      };

      const staticResult: StaticAnalysisResult = {
        issues: [],
        scanTime: 200,
        status: 'pass',
        summary: { total: 0, error: 0, warning: 0, info: 0 },
        metrics: { complexity: 15, maintainability: 40, duplication: 10 },
      };

      const coverageMetrics = { line: 90, branch: 85, function: 88 };
      const performanceMetrics = { responseTime: 80, memoryUsage: 128 };
      const businessMetrics = { costPrevention: 15000, timeSaved: 5, userSatisfaction: 95 };

      const scorecard = generator.generateScorecard(
        securityResult,
        staticResult,
        coverageMetrics,
        performanceMetrics,
        businessMetrics
      );

      expect(scorecard.complexity.cyclomaticComplexity).toBe(15);
      expect(scorecard.complexity.maintainabilityIndex).toBe(40);
      expect(scorecard.complexity.grade).toBe('F');
      expect(scorecard.recommendations.some(rec => rec.includes('complexity'))).toBe(true);
    });

    it('should handle performance issues correctly', () => {
      const securityResult: SecurityScanResult = {
        vulnerabilities: [],
        scanTime: 100,
        status: 'pass',
        summary: { total: 0, critical: 0, high: 0, moderate: 0, low: 0 },
      };

      const staticResult: StaticAnalysisResult = {
        issues: [],
        scanTime: 200,
        status: 'pass',
        summary: { total: 0, error: 0, warning: 0, info: 0 },
        metrics: { complexity: 5, maintainability: 85, duplication: 2 },
      };

      const coverageMetrics = { line: 90, branch: 85, function: 88 };
      const performanceMetrics = { responseTime: 500, memoryUsage: 512 };
      const businessMetrics = { costPrevention: 15000, timeSaved: 5, userSatisfaction: 95 };

      const scorecard = generator.generateScorecard(
        securityResult,
        staticResult,
        coverageMetrics,
        performanceMetrics,
        businessMetrics
      );

      expect(scorecard.performance.responseTime).toBe(500);
      expect(scorecard.performance.memoryUsage).toBe(512);
      expect(scorecard.performance.grade).toBe('F');
      expect(scorecard.recommendations.some(rec => rec.toLowerCase().includes('performance'))).toBe(
        true
      );
    });

    it('should generate appropriate recommendations', () => {
      const securityResult: SecurityScanResult = {
        vulnerabilities: [
          {
            id: 'CVE-2023-1234',
            severity: 'high',
            package: 'test-package',
            version: '1.0.0',
            description: 'High severity vulnerability',
          },
        ],
        scanTime: 100,
        status: 'fail',
        summary: { total: 1, critical: 0, high: 1, moderate: 0, low: 0 },
      };

      const staticResult: StaticAnalysisResult = {
        issues: [],
        scanTime: 200,
        status: 'pass',
        summary: { total: 0, error: 0, warning: 0, info: 0 },
        metrics: { complexity: 5, maintainability: 85, duplication: 2 },
      };

      const coverageMetrics = { line: 60, branch: 55, function: 58 };
      const performanceMetrics = { responseTime: 500, memoryUsage: 512 };
      const businessMetrics = { costPrevention: 5000, timeSaved: 1, userSatisfaction: 70 };

      const scorecard = generator.generateScorecard(
        securityResult,
        staticResult,
        coverageMetrics,
        performanceMetrics,
        businessMetrics
      );

      expect(scorecard.recommendations.length).toBeGreaterThan(0);
      expect(scorecard.recommendations.some(rec => rec.includes('security'))).toBe(true);
      expect(scorecard.recommendations.some(rec => rec.includes('coverage'))).toBe(true);
      expect(scorecard.recommendations.some(rec => rec.includes('performance'))).toBe(true);
    });

    it('should generate issues for quality problems', () => {
      const securityResult: SecurityScanResult = {
        vulnerabilities: [
          {
            id: 'CVE-2023-1234',
            severity: 'critical',
            package: 'test-package',
            version: '1.0.0',
            description: 'Critical vulnerability',
          },
        ],
        scanTime: 100,
        status: 'fail',
        summary: { total: 1, critical: 1, high: 0, moderate: 0, low: 0 },
      };

      const staticResult: StaticAnalysisResult = {
        issues: [
          {
            id: 'high-complexity',
            severity: 'warning',
            file: '/test/file.ts',
            line: 10,
            column: 1,
            message: 'High complexity detected',
            rule: 'complexity',
            fix: 'Refactor function to reduce complexity',
          },
        ],
        scanTime: 200,
        status: 'warning',
        summary: { total: 1, error: 0, warning: 1, info: 0 },
        metrics: { complexity: 5, maintainability: 85, duplication: 2 },
      };

      const coverageMetrics = { line: 60, branch: 55, function: 58 };
      const performanceMetrics = { responseTime: 500, memoryUsage: 512 };
      const businessMetrics = { costPrevention: 15000, timeSaved: 5, userSatisfaction: 95 };

      const scorecard = generator.generateScorecard(
        securityResult,
        staticResult,
        coverageMetrics,
        performanceMetrics,
        businessMetrics
      );

      expect(scorecard.issues.length).toBeGreaterThan(0);
      expect(scorecard.issues.some(issue => issue.category === 'security')).toBe(true);
      expect(scorecard.issues.some(issue => issue.category === 'complexity')).toBe(true);
      expect(scorecard.issues.some(issue => issue.category === 'coverage')).toBe(true);
      expect(scorecard.issues.some(issue => issue.category === 'performance')).toBe(true);
    });
  });
});
