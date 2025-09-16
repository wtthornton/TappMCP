#!/usr/bin/env node
export interface StaticAnalysisResult {
    issues: StaticIssue[];
    scanTime: number;
    status: 'pass' | 'fail' | 'warning';
    summary: {
        total: number;
        error: number;
        warning: number;
        info: number;
    };
    metrics: {
        complexity: number;
        maintainability: number;
        duplication: number;
    };
    complexity: number;
    maintainability: number;
    testCoverage: number;
    codeSmells: number;
    qualityScore: number;
    recommendations: string[];
    analysisTimestamp: number;
    performance?: number;
}
export interface StaticIssue {
    id: string;
    severity: 'error' | 'warning' | 'info';
    file: string;
    line: number;
    column: number;
    message: string;
    rule: string;
    fix: string;
    title?: string;
    description?: string;
}
export declare class StaticAnalyzer {
    private projectPath;
    constructor(projectPath: string);
    /**
     * Analyze code quality (alias for runStaticAnalysis)
     */
    analyzeCode(): Promise<StaticAnalysisResult>;
    /**
     * Run comprehensive static analysis using multiple tools
     */
    runStaticAnalysis(): Promise<StaticAnalysisResult>;
    /**
     * Calculate quality score based on metrics and summary
     */
    private calculateQualityScore;
    /**
     * Generate recommendations based on issues and metrics
     */
    private generateRecommendations;
    /**
     * Run ESLint analysis
     */
    private runESLint;
    /**
     * Run Semgrep analysis for security and OWASP best practices
     */
    private runSemgrep;
    /**
     * Run TypeScript compiler check
     */
    private runTypeScriptCheck;
    /**
     * Run basic complexity analysis
     */
    private runComplexityAnalysis;
    /**
     * Find source files to analyze
     */
    private findSourceFiles;
    /**
     * Analyze file complexity
     */
    private analyzeComplexity;
    /**
     * Count lines in functions
     */
    private countFunctionLines;
    /**
     * Calculate code metrics
     */
    private calculateMetrics;
    /**
     * Calculate file complexity
     */
    private calculateFileComplexity;
    /**
     * Map Semgrep severity to our severity levels
     */
    private mapSemgrepSeverity;
    /**
     * Count control flow statements in a line
     */
    private countControlFlowStatements;
    /**
     * Count logical operators in a line (excluding string literals)
     */
    private countLogicalOperators;
    /**
     * Detect duplicate lines
     */
    private detectDuplicates;
    /**
     * Calculate issue summary
     */
    private calculateSummary;
    /**
     * Determine overall analysis status
     */
    private determineStatus;
}
//# sourceMappingURL=static-analyzer.d.ts.map