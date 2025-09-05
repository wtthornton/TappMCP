#!/usr/bin/env node
export interface SecurityScanResult {
    vulnerabilities: Vulnerability[];
    scanTime: number;
    status: 'pass' | 'fail' | 'warning';
    summary: {
        total: number;
        critical: number;
        high: number;
        moderate: number;
        low: number;
    };
}
export interface Vulnerability {
    id: string;
    severity: 'critical' | 'high' | 'moderate' | 'low';
    package: string;
    version: string;
    description: string;
    cve?: string;
    fix?: string;
}
export declare class SecurityScanner {
    private projectPath;
    private hasNpmAuditError;
    private hasRetireError;
    constructor(projectPath: string);
    /**
     * Run comprehensive security scan using multiple tools
     */
    runSecurityScan(): Promise<SecurityScanResult>;
    /**
     * Run npm audit for dependency vulnerabilities
     */
    private runNpmAudit;
    /**
     * Run retire.js scan for known vulnerable libraries
     */
    private runRetireScan;
    /**
     * Run basic file security checks
     */
    private runFileSecurityChecks;
    /**
     * Find source files to scan
     */
    private findSourceFiles;
    /**
     * Check file content for security issues
     */
    private checkFileContent;
    /**
     * Map npm audit severity to our severity levels
     */
    private mapNpmSeverity;
    /**
     * Map retire.js severity to our severity levels
     */
    private mapRetireSeverity;
    /**
     * Calculate vulnerability summary
     */
    private calculateSummary;
    /**
     * Determine overall scan status
     */
    private determineStatus;
}
//# sourceMappingURL=security-scanner.d.ts.map