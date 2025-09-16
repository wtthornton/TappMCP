#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

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

export class SecurityScanner {
  private projectPath: string;
  private hasNpmAuditError = false;
  private hasRetireError = false;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  /**
   * Run comprehensive security scan using multiple tools
   */
  async runSecurityScan(): Promise<SecurityScanResult> {
    const startTime = Date.now();
    const vulnerabilities: Vulnerability[] = [];
    let hasErrors = false;

    // Run npm audit for dependency vulnerabilities
    const npmAuditResult = await this.runNpmAudit();
    if (npmAuditResult.length === 0 && this.hasNpmAuditError) {
      hasErrors = true;
    }
    vulnerabilities.push(...npmAuditResult);

    // Run OSV-Scanner for additional vulnerability detection
    const osvResult = await this.runOSVScanner();
    vulnerabilities.push(...osvResult);

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
  private async runNpmAudit(): Promise<Vulnerability[]> {
    try {
      this.hasNpmAuditError = false;
      const auditOutput = execSync('npm audit --json', {
        cwd: this.projectPath,
        encoding: 'utf8',
        stdio: 'pipe',
      });

      const auditData = JSON.parse(auditOutput);
      const vulnerabilities: Vulnerability[] = [];

      if (auditData.vulnerabilities) {
        this.processVulnerabilities(auditData.vulnerabilities, vulnerabilities);
      }

      return vulnerabilities;
    } catch (error) {
      // npm audit failed - set error flag and return empty result
      console.debug('npm audit failed:', error);
      this.hasNpmAuditError = true;
      return [];
    }
  }

  /**
   * Run OSV-Scanner for comprehensive vulnerability detection
   */
  private async runOSVScanner(): Promise<Vulnerability[]> {
    try {
      const osvOutput = await this.executeOSVScan();
      if (!osvOutput) {return [];}

      const osvData = JSON.parse(osvOutput);
      return this.parseOSVResults(osvData);
    } catch (error) {
      // OSV scan failed - return empty result
      console.debug('OSV scan failed:', error);
      return [];
    }
  }

  /**
   * Execute OSV scanner command
   */
  private async executeOSVScan(): Promise<string | null> {
    try {
      return execSync('osv-scanner --json .', {
        cwd: this.projectPath,
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 30000, // 30 second timeout
      });
    } catch (error) {
      // OSV-Scanner not available or scan failed - return empty results
      console.debug('OSV-Scanner execution failed:', error);
      // eslint-disable-next-line no-console
      console.warn('OSV-Scanner not available or scan failed, skipping OSV scan');
      return null;
    }
  }

  /**
   * Parse OSV scanner results
   */
  private parseOSVResults(osvData: Record<string, unknown>): Vulnerability[] {
    const vulnerabilities: Vulnerability[] = [];

    if (osvData.results && Array.isArray(osvData.results)) {
      for (const result of osvData.results) {
        this.processOSVResult(result, vulnerabilities);
      }
    }

    return vulnerabilities;
  }

  /**
   * Process individual OSV result
   */
  private processOSVResult(
    result: Record<string, unknown>,
    vulnerabilities: Vulnerability[]
  ): void {
    if (result.packages && Array.isArray(result.packages)) {
      for (const pkg of result.packages) {
        this.processOSVPackage(pkg, vulnerabilities);
      }
    }
  }

  /**
   * Process OSV package vulnerabilities
   */
  private processOSVPackage(pkg: Record<string, unknown>, vulnerabilities: Vulnerability[]): void {
    if (pkg.vulnerabilities && Array.isArray(pkg.vulnerabilities)) {
      for (const vuln of pkg.vulnerabilities) {
        vulnerabilities.push(this.createOSVVulnerability(pkg, vuln));
      }
    }
  }

  /**
   * Create vulnerability from OSV data
   */
  private createOSVVulnerability(
    pkg: Record<string, unknown>,
    vuln: Record<string, unknown>
  ): Vulnerability {
    const fixInfo = this.extractOSVFix(vuln);
    const dbSpecific = vuln.database_specific as Record<string, unknown> | undefined;
    const pkgInfo = pkg.package as Record<string, unknown> | undefined;
    const aliases = vuln.aliases as string[] | undefined;

    const cveAlias = aliases?.find((alias: string) => alias.startsWith('CVE-'));
    const vulnerability: Vulnerability = {
      id: (vuln.id as string) ?? 'unknown-osv',
      severity: this.mapOSVSeverity((dbSpecific?.severity_score as number) ?? 5.0),
      package: (pkgInfo?.name as string) ?? (pkg.name as string) ?? 'unknown',
      version: (pkgInfo?.version as string) ?? (pkg.version as string) ?? 'unknown',
      description:
        (vuln.summary as string) ?? (vuln.details as string) ?? 'No description available',
      fix: fixInfo,
    };

    if (cveAlias) {
      vulnerability.cve = cveAlias;
    }

    return vulnerability;
  }

  /**
   * Extract fix information from OSV vulnerability
   */
  private extractOSVFix(vuln: Record<string, unknown>): string {
    const affected = vuln.affected as Record<string, unknown>[] | undefined;
    const ranges = affected?.[0]?.ranges as Record<string, unknown>[] | undefined;
    const events = ranges?.[0]?.events as { fixed?: string }[] | undefined;
    const fixedVersion = events?.find((e: { fixed?: string }) => e.fixed)?.fixed;

    return fixedVersion ? `Upgrade to version ${fixedVersion} or later` : 'No fix available';
  }

  /**
   * Run retire.js scan for known vulnerable libraries
   */
  private async runRetireScan(): Promise<Vulnerability[]> {
    try {
      this.hasRetireError = false;
      const retireOutput = execSync('npx retire --outputformat json', {
        cwd: this.projectPath,
        encoding: 'utf8',
        stdio: 'pipe',
      });

      const retireData = JSON.parse(retireOutput);
      const vulnerabilities: Vulnerability[] = [];

      if (retireData.data && Array.isArray(retireData.data)) {
        for (const result of retireData.data as Record<string, unknown>[]) {
          const vulns = (result.vulnerabilities as Record<string, unknown>[]) ?? [];
          if (Array.isArray(vulns)) {
            for (const vuln of vulns) {
              const identifiers = vuln.identifiers as Record<string, unknown>;
              const info = vuln.info as string[];
              vulnerabilities.push({
                id: (identifiers?.CVE as string[])?.[0] ?? (identifiers?.id as string) ?? 'unknown',
                severity: this.mapRetireSeverity(vuln.severity as string),
                package: result.component as string,
                version: result.version as string,
                description: info?.[0] ?? 'No description available',
                cve: (identifiers?.CVE as string[])?.[0],
                fix: info?.[1] ?? 'No fix information available',
              });
            }
          }
        }
      }

      return vulnerabilities;
    } catch (error) {
      // retire.js scan failed - set error flag and return empty result
      console.debug('retire.js scan failed:', error);
      this.hasRetireError = true;
      return [];
    }
  }

  /**
   * Run basic file security checks
   */
  private async runFileSecurityChecks(): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = [];

    try {
      // Check for common security issues in source files
      const sourceFiles = this.findSourceFiles();

      for (const file of sourceFiles) {
        const content = readFileSync(file, 'utf8');
        const fileVulns = this.checkFileContent(file, content);
        vulnerabilities.push(...fileVulns);
      }

      return vulnerabilities;
    } catch (error) {
      // File security checks failed - return empty result
      console.debug('File security checks failed:', error);
      return [];
    }
  }

  /**
   * Find source files to scan
   */
  private findSourceFiles(): string[] {
    const files: string[] = [];
    const extensions = ['.ts', '.js', '.json'];

    const findFiles = (dir: string) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const fs = require('fs') as typeof import('fs');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const path = require('path') as typeof import('path');
        const items = fs.readdirSync(dir);

        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            findFiles(fullPath);
          } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        console.debug('File system scan error:', error);
        // Ignore permission errors
      }
    };

    findFiles(this.projectPath);
    return files;
  }

  /**
   * Check file content for security issues
   */
  private checkFileContent(filePath: string, content: string): Vulnerability[] {
    const vulnerabilities: Vulnerability[] = [];

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
      { pattern: /eval\s*\(/gi, severity: 'high' as const, description: 'Use of eval() function' },
      {
        pattern: /innerHTML\s*=/gi,
        severity: 'moderate' as const,
        description: 'Direct innerHTML assignment',
      },
      {
        pattern: /document\.write/gi,
        severity: 'moderate' as const,
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
   * Process vulnerabilities data to extract vulnerability information
   */
  private processVulnerabilities(
    vulnerabilityData: Record<string, unknown>,
    vulnerabilities: Vulnerability[]
  ): void {
    for (const [packageName, vuln] of Object.entries(vulnerabilityData)) {
      const vulnData = vuln as Record<string, unknown>;
      if (vulnData.via && Array.isArray(vulnData.via)) {
        this.processVulnerabilityVia(packageName, vulnData, vulnerabilities);
      }
    }
  }

  /**
   * Process vulnerability 'via' array to extract CVE information
   */
  private processVulnerabilityVia(
    packageName: string,
    vulnData: Record<string, unknown>,
    vulnerabilities: Vulnerability[]
  ): void {
    for (const via of vulnData.via as Record<string, unknown>[]) {
      if (typeof via === 'object' && via.cve) {
        vulnerabilities.push({
          id: via.cve as string,
          severity: this.mapNpmSeverity(vulnData.severity as string),
          package: packageName,
          version: (vulnData.range as string) ?? 'unknown',
          description: (vulnData.title as string) ?? 'No description available',
          cve: via.cve as string,
          fix: vulnData.fixAvailable ? 'Update available' : 'No fix available',
        });
      }
    }
  }

  /**
   * Map npm audit severity to our severity levels
   */
  private mapNpmSeverity(severity: string): 'critical' | 'high' | 'moderate' | 'low' {
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
  private mapRetireSeverity(severity: string): 'critical' | 'high' | 'moderate' | 'low' {
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
   * Map OSV-Scanner severity score to our severity levels
   */
  private mapOSVSeverity(score: number): 'critical' | 'high' | 'moderate' | 'low' {
    if (score >= 9.0) {return 'critical';}
    if (score >= 7.0) {return 'high';}
    if (score >= 4.0) {return 'moderate';}
    return 'low';
  }

  /**
   * Calculate vulnerability summary
   */
  private calculateSummary(vulnerabilities: Vulnerability[]) {
    return vulnerabilities.reduce(
      (summary, vuln) => {
        summary.total++;
        summary[vuln.severity]++;
        return summary;
      },
      { total: 0, critical: 0, high: 0, moderate: 0, low: 0 }
    );
  }

  /**
   * Determine overall scan status
   */
  private determineStatus(summary: {
    critical: number;
    high: number;
    moderate: number;
    low: number;
  }): 'pass' | 'fail' | 'warning' {
    if (summary.critical > 0 || summary.high > 0) {
      return 'fail';
    } else if (summary.moderate > 0 || summary.low > 0) {
      return 'warning';
    }
      return 'pass';

  }
}
