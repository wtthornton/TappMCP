#!/usr/bin/env node
import { ProjectAnalysis } from './project-scanner.js';
export interface ImprovementOpportunity {
    id: string;
    type: 'quality' | 'security' | 'performance' | 'maintainability' | 'documentation' | 'testing';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
    estimatedTime: number;
    dependencies: string[];
    recommendations: string[];
    codeExamples?: string[];
    relatedFiles?: string[];
}
export interface ImprovementPlan {
    projectId: string;
    totalOpportunities: number;
    highPriorityCount: number;
    mediumPriorityCount: number;
    lowPriorityCount: number;
    estimatedTotalTime: number;
    opportunities: ImprovementOpportunity[];
    summary: {
        qualityScore: number;
        securityScore: number;
        performanceScore: number;
        maintainabilityScore: number;
        overallScore: number;
    };
    recommendations: {
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
    };
}
export declare class ImprovementDetector {
    private readonly qualityThresholds;
    detectImprovements(analysis: ProjectAnalysis, targetQualityLevel?: 'basic' | 'standard' | 'enterprise' | 'production'): Promise<ImprovementPlan>;
    private analyzeQualityIssues;
    private analyzeSecurityIssues;
    private analyzePerformanceIssues;
    private analyzeMaintainabilityIssues;
    private analyzeDocumentationIssues;
    private analyzeTestingIssues;
    private calculateScores;
    private generateRecommendations;
}
//# sourceMappingURL=improvement-detector.d.ts.map