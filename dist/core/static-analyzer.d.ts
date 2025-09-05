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
}
export declare class StaticAnalyzer {
    private projectPath;
    constructor(projectPath: string);
    /**
     * Run comprehensive static analysis using multiple tools
     */
    runStaticAnalysis(): Promise<StaticAnalysisResult>;
    /**
     * Run ESLint analysis
     */
    private runESLint;
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