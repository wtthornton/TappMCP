#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityScanner = void 0;
const child_process_1 = require("child_process");
const fs_1 = require("fs");
class SecurityScanner {
    projectPath;
    hasNpmAuditError = false;
    hasRetireError = false;
    constructor(projectPath) {
        this.projectPath = projectPath;
    }
    /**
     * Run comprehensive security scan using multiple tools
     */
    async runSecurityScan() {
        const startTime = Date.now();
        const vulnerabilities = [];
        let hasErrors = false;
        // Run npm audit for dependency vulnerabilities
        const npmAuditResult = await this.runNpmAudit();
        if (npmAuditResult.length === 0 && this.hasNpmAuditError) {
            hasErrors = true;
        }
        vulnerabilities.push(...npmAuditResult);
        // Run retire.js for known vulnerable libraries
        const retireResult = await this.runRetireScan();
        if (retireResult.length === 0 && this.hasRetireError) {
            hasErrors = true;
        }
        vulnerabilities.push(...retireResult);
        // Run basic file security checks
        const fileSecurityResult = await this.runFileSecurityChecks();
        vulnerabilities.push(...fileSecurityResult);
        const scanTime = Date.now() - startTime;
        const summary = this.calculateSummary(vulnerabilities);
        const status = hasErrors ? 'fail' : this.determineStatus(summary);
        return {
            vulnerabilities,
            scanTime,
            status,
            summary,
        };
    }
    /**
     * Run npm audit for dependency vulnerabilities
     */
    async runNpmAudit() {
        try {
            this.hasNpmAuditError = false;
            const auditOutput = (0, child_process_1.execSync)('npm audit --json', {
                cwd: this.projectPath,
                encoding: 'utf8',
                stdio: 'pipe',
            });
            const auditData = JSON.parse(auditOutput);
            const vulnerabilities = [];
            if (auditData.vulnerabilities) {
                for (const [packageName, vuln] of Object.entries(auditData.vulnerabilities)) {
                    const vulnData = vuln;
                    if (vulnData.via && Array.isArray(vulnData.via)) {
                        for (const via of vulnData.via) {
                            if (typeof via === 'object' && via.cve) {
                                vulnerabilities.push({
                                    id: via.cve,
                                    severity: this.mapNpmSeverity(vulnData.severity),
                                    package: packageName,
                                    version: vulnData.range ?? 'unknown',
                                    description: vulnData.title ?? 'No description available',
                                    cve: via.cve,
                                    fix: vulnData.fixAvailable ? 'Update available' : 'No fix available',
                                });
                            }
                        }
                    }
                }
            }
            return vulnerabilities;
        }
        catch (_error) {
            // npm audit failed - set error flag and return empty result
            this.hasNpmAuditError = true;
            return [];
        }
    }
    /**
     * Run retire.js scan for known vulnerable libraries
     */
    async runRetireScan() {
        try {
            this.hasRetireError = false;
            const retireOutput = (0, child_process_1.execSync)('npx retire --outputformat json', {
                cwd: this.projectPath,
                encoding: 'utf8',
                stdio: 'pipe',
            });
            const retireData = JSON.parse(retireOutput);
            const vulnerabilities = [];
            if (retireData.data && Array.isArray(retireData.data)) {
                for (const result of retireData.data) {
                    const vulns = result.vulnerabilities ?? [];
                    if (Array.isArray(vulns)) {
                        for (const vuln of vulns) {
                            const identifiers = vuln.identifiers;
                            const info = vuln.info;
                            vulnerabilities.push({
                                id: identifiers?.CVE?.[0] ?? identifiers?.id ?? 'unknown',
                                severity: this.mapRetireSeverity(vuln.severity),
                                package: result.component,
                                version: result.version,
                                description: info?.[0] ?? 'No description available',
                                cve: identifiers?.CVE?.[0],
                                fix: info?.[1] ?? 'No fix information available',
                            });
                        }
                    }
                }
            }
            return vulnerabilities;
        }
        catch (_error) {
            // retire.js scan failed - set error flag and return empty result
            this.hasRetireError = true;
            return [];
        }
    }
    /**
     * Run basic file security checks
     */
    async runFileSecurityChecks() {
        const vulnerabilities = [];
        try {
            // Check for common security issues in source files
            const sourceFiles = this.findSourceFiles();
            for (const file of sourceFiles) {
                const content = (0, fs_1.readFileSync)(file, 'utf8');
                const fileVulns = this.checkFileContent(file, content);
                vulnerabilities.push(...fileVulns);
            }
            return vulnerabilities;
        }
        catch (_error) {
            // File security checks failed - return empty result
            return [];
        }
    }
    /**
     * Find source files to scan
     */
    findSourceFiles() {
        const files = [];
        const extensions = ['.ts', '.js', '.json'];
        const findFiles = (dir) => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const fs = require('fs');
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const path = require('path');
                const items = fs.readdirSync(dir);
                for (const item of items) {
                    const fullPath = path.join(dir, item);
                    const stat = fs.statSync(fullPath);
                    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                        findFiles(fullPath);
                    }
                    else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
                        files.push(fullPath);
                    }
                }
            }
            catch (_error) {
                // Ignore permission errors
            }
        };
        findFiles(this.projectPath);
        return files;
    }
    /**
     * Check file content for security issues
     */
    checkFileContent(filePath, content) {
        const vulnerabilities = [];
        // Check for hardcoded secrets
        const secretPatterns = [
            /password\s*[:=]\s*['"][^'"]+['"]/gi,
            /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi,
            /secret\s*[:=]\s*['"][^'"]+['"]/gi,
            /token\s*[:=]\s*['"][^'"]+['"]/gi,
        ];
        for (const pattern of secretPatterns) {
            const matches = content.match(pattern);
            if (matches) {
                vulnerabilities.push({
                    id: 'hardcoded-secret',
                    severity: 'high',
                    package: filePath,
                    version: 'unknown',
                    description: 'Potential hardcoded secret detected',
                    fix: 'Use environment variables or secure configuration management',
                });
            }
        }
        // Check for dangerous functions
        const dangerousPatterns = [
            { pattern: /eval\s*\(/gi, severity: 'high', description: 'Use of eval() function' },
            {
                pattern: /innerHTML\s*=/gi,
                severity: 'moderate',
                description: 'Direct innerHTML assignment',
            },
            {
                pattern: /document\.write/gi,
                severity: 'moderate',
                description: 'Use of document.write()',
            },
        ];
        for (const { pattern, severity, description } of dangerousPatterns) {
            const matches = content.match(pattern);
            if (matches) {
                vulnerabilities.push({
                    id: 'dangerous-function',
                    severity,
                    package: filePath,
                    version: 'unknown',
                    description,
                    fix: 'Use safer alternatives',
                });
            }
        }
        return vulnerabilities;
    }
    /**
     * Map npm audit severity to our severity levels
     */
    mapNpmSeverity(severity) {
        switch (severity?.toLowerCase()) {
            case 'critical':
                return 'critical';
            case 'high':
                return 'high';
            case 'moderate':
                return 'moderate';
            case 'low':
                return 'low';
            default:
                return 'moderate';
        }
    }
    /**
     * Map retire.js severity to our severity levels
     */
    mapRetireSeverity(severity) {
        switch (severity?.toLowerCase()) {
            case 'critical':
            case 'high':
                return 'high';
            case 'medium':
                return 'moderate';
            case 'low':
                return 'low';
            default:
                return 'moderate';
        }
    }
    /**
     * Calculate vulnerability summary
     */
    calculateSummary(vulnerabilities) {
        return vulnerabilities.reduce((summary, vuln) => {
            summary.total++;
            summary[vuln.severity]++;
            return summary;
        }, { total: 0, critical: 0, high: 0, moderate: 0, low: 0 });
    }
    /**
     * Determine overall scan status
     */
    determineStatus(summary) {
        if (summary.critical > 0 || summary.high > 0) {
            return 'fail';
        }
        else if (summary.moderate > 0 || summary.low > 0) {
            return 'warning';
        }
        else {
            return 'pass';
        }
    }
}
exports.SecurityScanner = SecurityScanner;
//# sourceMappingURL=security-scanner.js.map