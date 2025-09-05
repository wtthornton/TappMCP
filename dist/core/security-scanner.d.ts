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
     * Run OSV-Scanner for comprehensive vulnerability detection
     */
    private runOSVScanner;
    /**
     * Execute OSV scanner command
     */
    private executeOSVScan;
    /**
     * Parse OSV scanner results
     */
    private parseOSVResults;
    /**
     * Process individual OSV result
     */
    private processOSVResult;
    /**
     * Process OSV package vulnerabilities
     */
    private processOSVPackage;
    /**
     * Create vulnerability from OSV data
     */
    private createOSVVulnerability;
    /**
     * Extract fix information from OSV vulnerability
     */
    private extractOSVFix;
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
     * Process vulnerabilities data to extract vulnerability information
     */
    private processVulnerabilities;
    /**
     * Process vulnerability 'via' array to extract CVE information
     */
    private processVulnerabilityVia;
    /**
     * Map npm audit severity to our severity levels
     */
    private mapNpmSeverity;
    /**
     * Map retire.js severity to our severity levels
     */
    private mapRetireSeverity;
    /**
     * Map OSV-Scanner severity score to our severity levels
     */
    private mapOSVSeverity;
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