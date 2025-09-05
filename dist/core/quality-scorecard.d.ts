#!/usr/bin/env node
import { SecurityScanResult } from './security-scanner.js';
import { StaticAnalysisResult } from './static-analyzer.js';
export interface QualityScorecard {
    overall: {
        score: number;
        grade: 'A' | 'B' | 'C' | 'D' | 'F';
        status: 'pass' | 'fail' | 'warning';
    };
    security: {
        score: number;
        grade: 'A' | 'B' | 'C' | 'D' | 'F';
        vulnerabilities: number;
        critical: number;
        high: number;
        moderate: number;
        low: number;
    };
    coverage: {
        lineCoverage: number;
        branchCoverage: number;
        functionCoverage: number;
        grade: 'A' | 'B' | 'C' | 'D' | 'F';
    };
    complexity: {
        cyclomaticComplexity: number;
        maintainabilityIndex: number;
        duplication: number;
        grade: 'A' | 'B' | 'C' | 'D' | 'F';
    };
    performance: {
        responseTime: number;
        memoryUsage: number;
        efficiency: number;
        grade: 'A' | 'B' | 'C' | 'D' | 'F';
    };
    business: {
        costPrevention: number;
        timeSaved: number;
        userSatisfaction: number;
        grade: 'A' | 'B' | 'C' | 'D' | 'F';
    };
    quality: {
        score: number;
        grade: 'A' | 'B' | 'C' | 'D' | 'F';
        status: 'pass' | 'fail' | 'warning';
    };
    production: {
        securityScan: boolean;
        performanceTest: boolean;
        documentationComplete: boolean;
        deploymentReady: boolean;
        grade: 'A' | 'B' | 'C' | 'D' | 'F';
    };
    recommendations: string[];
    issues: QualityIssue[];
}
export interface QualityIssue {
    id: string;
    severity: 'critical' | 'high' | 'moderate' | 'low';
    category: 'security' | 'coverage' | 'complexity' | 'performance' | 'business';
    message: string;
    file?: string;
    line?: number;
    fix: string;
}
export interface QualityMetrics {
    testCoverage: number;
    securityScore: number;
    complexityScore: number;
    maintainabilityScore: number;
    responseTime: number;
    memoryUsage: number;
    businessValue: number;
}
export declare class QualityScorecardGenerator {
    /**
     * Generate comprehensive quality scorecard
     */
    generateScorecard(securityResult: SecurityScanResult, staticResult: StaticAnalysisResult, coverageMetrics: {
        line: number;
        branch: number;
        function: number;
    }, performanceMetrics: {
        responseTime: number;
        memoryUsage: number;
    }, businessMetrics: {
        costPrevention: number;
        timeSaved: number;
        userSatisfaction: number;
    }): QualityScorecard;
    /**
     * Calculate security score
     */
    private calculateSecurityScore;
    /**
     * Calculate coverage score
     */
    private calculateCoverageScore;
    /**
     * Calculate complexity score
     */
    private calculateComplexityScore;
    /**
     * Calculate performance score
     */
    private calculatePerformanceScore;
    /**
     * Calculate business score
     */
    private calculateBusinessScore;
    /**
     * Calculate grade from score
     */
    private calculateGrade;
    /**
     * Determine overall status
     */
    private determineOverallStatus;
    /**
     * Generate recommendations
     */
    private generateRecommendations;
    /**
     * Generate quality issues
     */
    private generateIssues;
}
//# sourceMappingURL=quality-scorecard.d.ts.map