"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const quality_scorecard_js_1 = require("./quality-scorecard.js");
(0, vitest_1.describe)('QualityScorecardGenerator', () => {
    let generator;
    (0, vitest_1.beforeEach)(() => {
        generator = new quality_scorecard_js_1.QualityScorecardGenerator();
    });
    (0, vitest_1.describe)('generateScorecard', () => {
        (0, vitest_1.it)('should generate comprehensive quality scorecard', () => {
            const securityResult = {
                vulnerabilities: [],
                scanTime: 100,
                status: 'pass',
                summary: { total: 0, critical: 0, high: 0, moderate: 0, low: 0 },
            };
            const staticResult = {
                issues: [],
                scanTime: 200,
                status: 'pass',
                summary: { total: 0, error: 0, warning: 0, info: 0 },
                metrics: { complexity: 5, maintainability: 85, duplication: 2 },
            };
            const coverageMetrics = { line: 90, branch: 85, function: 88 };
            const performanceMetrics = { responseTime: 80, memoryUsage: 128 };
            const businessMetrics = { costPrevention: 15000, timeSaved: 5, userSatisfaction: 95 };
            const scorecard = generator.generateScorecard(securityResult, staticResult, coverageMetrics, performanceMetrics, businessMetrics);
            (0, vitest_1.expect)(scorecard).toHaveProperty('overall');
            (0, vitest_1.expect)(scorecard).toHaveProperty('security');
            (0, vitest_1.expect)(scorecard).toHaveProperty('coverage');
            (0, vitest_1.expect)(scorecard).toHaveProperty('complexity');
            (0, vitest_1.expect)(scorecard).toHaveProperty('performance');
            (0, vitest_1.expect)(scorecard).toHaveProperty('business');
            (0, vitest_1.expect)(scorecard).toHaveProperty('recommendations');
            (0, vitest_1.expect)(scorecard).toHaveProperty('issues');
            (0, vitest_1.expect)(scorecard.overall.score).toBeGreaterThan(0);
            (0, vitest_1.expect)(scorecard.overall.grade).toMatch(/A|B|C|D|F/);
            (0, vitest_1.expect)(scorecard.overall.status).toMatch(/pass|fail|warning/);
        });
        (0, vitest_1.it)('should handle security vulnerabilities correctly', () => {
            const securityResult = {
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
            const staticResult = {
                issues: [],
                scanTime: 200,
                status: 'pass',
                summary: { total: 0, error: 0, warning: 0, info: 0 },
                metrics: { complexity: 5, maintainability: 85, duplication: 2 },
            };
            const coverageMetrics = { line: 90, branch: 85, function: 88 };
            const performanceMetrics = { responseTime: 80, memoryUsage: 128 };
            const businessMetrics = { costPrevention: 15000, timeSaved: 5, userSatisfaction: 95 };
            const scorecard = generator.generateScorecard(securityResult, staticResult, coverageMetrics, performanceMetrics, businessMetrics);
            (0, vitest_1.expect)(scorecard.security.critical).toBe(1);
            (0, vitest_1.expect)(scorecard.security.score).toBeLessThan(100);
            (0, vitest_1.expect)(scorecard.overall.status).toBe('fail');
            (0, vitest_1.expect)(scorecard.recommendations.some(rec => rec.includes('critical'))).toBe(true);
        });
        (0, vitest_1.it)('should handle low coverage correctly', () => {
            const securityResult = {
                vulnerabilities: [],
                scanTime: 100,
                status: 'pass',
                summary: { total: 0, critical: 0, high: 0, moderate: 0, low: 0 },
            };
            const staticResult = {
                issues: [],
                scanTime: 200,
                status: 'pass',
                summary: { total: 0, error: 0, warning: 0, info: 0 },
                metrics: { complexity: 5, maintainability: 85, duplication: 2 },
            };
            const coverageMetrics = { line: 60, branch: 55, function: 58 };
            const performanceMetrics = { responseTime: 80, memoryUsage: 128 };
            const businessMetrics = { costPrevention: 15000, timeSaved: 5, userSatisfaction: 95 };
            const scorecard = generator.generateScorecard(securityResult, staticResult, coverageMetrics, performanceMetrics, businessMetrics);
            (0, vitest_1.expect)(scorecard.coverage.lineCoverage).toBe(60);
            (0, vitest_1.expect)(scorecard.coverage.grade).toBe('F');
            (0, vitest_1.expect)(scorecard.recommendations.some(rec => rec.includes('coverage'))).toBe(true);
        });
        (0, vitest_1.it)('should handle high complexity correctly', () => {
            const securityResult = {
                vulnerabilities: [],
                scanTime: 100,
                status: 'pass',
                summary: { total: 0, critical: 0, high: 0, moderate: 0, low: 0 },
            };
            const staticResult = {
                issues: [],
                scanTime: 200,
                status: 'pass',
                summary: { total: 0, error: 0, warning: 0, info: 0 },
                metrics: { complexity: 15, maintainability: 40, duplication: 10 },
            };
            const coverageMetrics = { line: 90, branch: 85, function: 88 };
            const performanceMetrics = { responseTime: 80, memoryUsage: 128 };
            const businessMetrics = { costPrevention: 15000, timeSaved: 5, userSatisfaction: 95 };
            const scorecard = generator.generateScorecard(securityResult, staticResult, coverageMetrics, performanceMetrics, businessMetrics);
            (0, vitest_1.expect)(scorecard.complexity.cyclomaticComplexity).toBe(15);
            (0, vitest_1.expect)(scorecard.complexity.maintainabilityIndex).toBe(40);
            (0, vitest_1.expect)(scorecard.complexity.grade).toBe('F');
            (0, vitest_1.expect)(scorecard.recommendations.some(rec => rec.includes('complexity'))).toBe(true);
        });
        (0, vitest_1.it)('should handle performance issues correctly', () => {
            const securityResult = {
                vulnerabilities: [],
                scanTime: 100,
                status: 'pass',
                summary: { total: 0, critical: 0, high: 0, moderate: 0, low: 0 },
            };
            const staticResult = {
                issues: [],
                scanTime: 200,
                status: 'pass',
                summary: { total: 0, error: 0, warning: 0, info: 0 },
                metrics: { complexity: 5, maintainability: 85, duplication: 2 },
            };
            const coverageMetrics = { line: 90, branch: 85, function: 88 };
            const performanceMetrics = { responseTime: 500, memoryUsage: 512 };
            const businessMetrics = { costPrevention: 15000, timeSaved: 5, userSatisfaction: 95 };
            const scorecard = generator.generateScorecard(securityResult, staticResult, coverageMetrics, performanceMetrics, businessMetrics);
            (0, vitest_1.expect)(scorecard.performance.responseTime).toBe(500);
            (0, vitest_1.expect)(scorecard.performance.memoryUsage).toBe(512);
            (0, vitest_1.expect)(scorecard.performance.grade).toBe('F');
            (0, vitest_1.expect)(scorecard.recommendations.some(rec => rec.toLowerCase().includes('performance'))).toBe(true);
        });
        (0, vitest_1.it)('should generate appropriate recommendations', () => {
            const securityResult = {
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
            const staticResult = {
                issues: [],
                scanTime: 200,
                status: 'pass',
                summary: { total: 0, error: 0, warning: 0, info: 0 },
                metrics: { complexity: 5, maintainability: 85, duplication: 2 },
            };
            const coverageMetrics = { line: 60, branch: 55, function: 58 };
            const performanceMetrics = { responseTime: 500, memoryUsage: 512 };
            const businessMetrics = { costPrevention: 5000, timeSaved: 1, userSatisfaction: 70 };
            const scorecard = generator.generateScorecard(securityResult, staticResult, coverageMetrics, performanceMetrics, businessMetrics);
            (0, vitest_1.expect)(scorecard.recommendations.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(scorecard.recommendations.some(rec => rec.includes('security'))).toBe(true);
            (0, vitest_1.expect)(scorecard.recommendations.some(rec => rec.includes('coverage'))).toBe(true);
            (0, vitest_1.expect)(scorecard.recommendations.some(rec => rec.includes('performance'))).toBe(true);
        });
        (0, vitest_1.it)('should generate issues for quality problems', () => {
            const securityResult = {
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
            const staticResult = {
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
            const scorecard = generator.generateScorecard(securityResult, staticResult, coverageMetrics, performanceMetrics, businessMetrics);
            (0, vitest_1.expect)(scorecard.issues.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(scorecard.issues.some(issue => issue.category === 'security')).toBe(true);
            (0, vitest_1.expect)(scorecard.issues.some(issue => issue.category === 'complexity')).toBe(true);
            (0, vitest_1.expect)(scorecard.issues.some(issue => issue.category === 'coverage')).toBe(true);
            (0, vitest_1.expect)(scorecard.issues.some(issue => issue.category === 'performance')).toBe(true);
        });
    });
});
//# sourceMappingURL=quality-scorecard.test.js.map