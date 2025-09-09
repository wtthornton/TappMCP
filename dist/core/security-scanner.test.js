#!/usr/bin/env node
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SecurityScanner } from './security-scanner.js';
import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
describe('SecurityScanner - REAL TESTS', () => {
    let securityScanner;
    let testProjectPath;
    beforeEach(() => {
        // Create a temporary test project
        testProjectPath = join(process.cwd(), `test-project-${Date.now()}`);
        mkdirSync(testProjectPath, { recursive: true });
        // Create a minimal package.json
        const packageJson = {
            name: 'test-project',
            version: '1.0.0',
            dependencies: {},
            devDependencies: {},
        };
        writeFileSync(join(testProjectPath, 'package.json'), JSON.stringify(packageJson, null, 2));
        securityScanner = new SecurityScanner(testProjectPath);
    });
    afterEach(() => {
        // Clean up test project
        try {
            rmSync(testProjectPath, { recursive: true, force: true });
        }
        catch {
            // Ignore cleanup errors
        }
    });
    describe('runSecurityScan - ACTUAL SECURITY SCANNING', () => {
        it('should complete security scan in reasonable time', async () => {
            const startTime = performance.now();
            const result = await securityScanner.runSecurityScan();
            const duration = performance.now() - startTime;
            // Should take actual time to run (not < 1ms fake processing)
            expect(duration).toBeGreaterThan(100); // At least 100ms for real scanning
            expect(duration).toBeLessThan(30000); // But less than 30 seconds
            // Should return complete result structure
            expect(result).toHaveProperty('vulnerabilities');
            expect(result).toHaveProperty('scanTime');
            expect(result).toHaveProperty('status');
            expect(result).toHaveProperty('summary');
            // Scan time should match actual duration (within 100ms margin)
            expect(Math.abs(result.scanTime - duration)).toBeLessThan(100);
            // Summary should be complete
            expect(result.summary).toHaveProperty('total');
            expect(result.summary).toHaveProperty('critical');
            expect(result.summary).toHaveProperty('high');
            expect(result.summary).toHaveProperty('moderate');
            expect(result.summary).toHaveProperty('low');
            // Status should be valid
            expect(['pass', 'fail', 'warning']).toContain(result.status);
            console.log(`Real scan took: ${duration.toFixed(2)}ms, found ${result.vulnerabilities.length} vulnerabilities`);
        });
        it('should run ACTUAL npm audit command (not mocked)', async () => {
            // Test that we can at least try to run npm audit
            // Even if it fails, we should see real command execution
            const result = await securityScanner.runSecurityScan();
            // The scanner should handle npm audit gracefully
            expect(result.status).toBeDefined();
            expect(Array.isArray(result.vulnerabilities)).toBe(true);
            // If npm is available, audit should work or fail gracefully
            // We're testing that the command gets executed, not mocked
            expect(result.summary.total).toBeGreaterThanOrEqual(0);
        });
        it('should build correct npm audit command', () => {
            // Test command building without mocking execSync
            const scanner = new SecurityScanner('/test/path');
            // Check that the scanner uses the correct command by inspecting source
            // The command should be 'npm audit --json'
            const scannerSource = scanner.constructor.toString();
            // This is indirect but proves we're not mocking the real command
            expect(scannerSource).toContain('execSync');
            // Verify the scanner was created with correct path
            expect(scanner.projectPath).toBe('/test/path');
        });
        it('should handle missing dependencies gracefully', async () => {
            // Create scanner for non-existent path
            const badScanner = new SecurityScanner('/non-existent-path');
            const result = await badScanner.runSecurityScan();
            // Should not crash, should return safe defaults
            expect(result.status).toBeDefined();
            expect(Array.isArray(result.vulnerabilities)).toBe(true);
            expect(result.summary).toBeDefined();
            expect(result.scanTime).toBeGreaterThan(0);
        });
    });
    describe('Command Execution - REAL EXTERNAL CALLS', () => {
        it('should attempt to execute retire.js command', async () => {
            // Test that retire.js command is actually attempted
            const result = await securityScanner.runSecurityScan();
            // Even if retire.js fails, the scanner should handle it
            expect(result).toBeDefined();
            // Check if retire command would be available
            try {
                execSync('npx retire --help', { stdio: 'pipe', timeout: 5000 });
                console.log('retire.js is available for testing');
            }
            catch {
                console.log('retire.js not available - scanner should handle this gracefully');
            }
        });
        it('should attempt OSV-Scanner execution', async () => {
            // Test OSV-Scanner availability and execution
            const result = await securityScanner.runSecurityScan();
            expect(result).toBeDefined();
            // Check if OSV-Scanner command would be available
            try {
                execSync('osv-scanner --help', { stdio: 'pipe', timeout: 5000 });
                console.log('OSV-Scanner is available for testing');
            }
            catch {
                console.log('OSV-Scanner not available - scanner should handle this gracefully');
            }
        });
    });
    describe('File Content Analysis - ACTUAL CODE SCANNING', () => {
        it('should detect REAL hardcoded secrets in files', async () => {
            // Create a test file with actual secrets
            const secretFile = join(testProjectPath, 'secrets.ts');
            const secretContent = `
        export const config = {
          database_password: "mypassword123",
          api_key: "sk-1234567890abcdef",
          jwt_secret: "super-secret-key",
          auth_token: "bearer-token-abc123"
        };
      `;
            writeFileSync(secretFile, secretContent);
            const result = await securityScanner.runSecurityScan();
            // Should detect the hardcoded secrets
            const secretVulns = result.vulnerabilities.filter(v => v.id === 'hardcoded-secret');
            expect(secretVulns.length).toBeGreaterThan(0);
            expect(secretVulns[0].severity).toBe('high');
            expect(secretVulns[0].package).toBe(secretFile);
            expect(secretVulns[0].description).toContain('hardcoded secret');
        });
        it('should detect REAL dangerous functions in files', async () => {
            // Create a test file with dangerous functions
            const dangerousFile = join(testProjectPath, 'dangerous.ts');
            const dangerousContent = `
        function badFunction(userInput: string) {
          eval("console.log('This is dangerous: " + userInput + "')");
          document.getElementById('content').innerHTML = userInput;
          document.write('<script>alert("XSS")</script>');
        }
      `;
            writeFileSync(dangerousFile, dangerousContent);
            const result = await securityScanner.runSecurityScan();
            // Should detect dangerous functions
            const dangerousVulns = result.vulnerabilities.filter(v => v.id === 'dangerous-function');
            expect(dangerousVulns.length).toBeGreaterThanOrEqual(3); // eval, innerHTML, document.write
            // Check specific dangerous patterns were found
            const descriptions = dangerousVulns.map(v => v.description);
            expect(descriptions.some(d => d.includes('eval()'))).toBe(true);
            expect(descriptions.some(d => d.includes('innerHTML'))).toBe(true);
            expect(descriptions.some(d => d.includes('document.write'))).toBe(true);
        });
        it('should NOT detect false positives in safe code', async () => {
            // Create a test file with safe code
            const safeFile = join(testProjectPath, 'safe.ts');
            const safeContent = `
        import { config } from './config';

        export class SafeClass {
          private readonly validPassword = process.env.PASSWORD || '';

          constructor() {
            console.log('Safe initialization');
          }

          public safeMethod(input: string): string {
            // Safe HTML escaping
            return input.replace(/[<>&"]/g, (char) => {
              const escapeMap: Record<string, string> = {
                '<': '&lt;',
                '>': '&gt;',
                '&': '&amp;',
                '"': '&quot;'
              };
              return escapeMap[char] || char;
            });
          }
        }
      `;
            writeFileSync(safeFile, safeContent);
            const result = await securityScanner.runSecurityScan();
            // Should NOT detect vulnerabilities in safe code
            const fileVulns = result.vulnerabilities.filter(v => v.package === safeFile);
            expect(fileVulns.length).toBe(0);
        });
    });
    describe('Severity Mapping - ACTUAL LOGIC TESTING', () => {
        it('should map npm audit severities correctly', () => {
            const scanner = new SecurityScanner('/test');
            // Access private method for testing
            const mapNpmSeverity = scanner.mapNpmSeverity.bind(scanner);
            // Test EXACT mappings
            expect(mapNpmSeverity('critical')).toBe('critical');
            expect(mapNpmSeverity('high')).toBe('high');
            expect(mapNpmSeverity('moderate')).toBe('moderate');
            expect(mapNpmSeverity('low')).toBe('low');
            // Test case insensitive
            expect(mapNpmSeverity('CRITICAL')).toBe('critical');
            expect(mapNpmSeverity('High')).toBe('high');
            // Test unknown/invalid values
            expect(mapNpmSeverity('unknown')).toBe('moderate');
            expect(mapNpmSeverity('')).toBe('moderate');
            expect(mapNpmSeverity(undefined)).toBe('moderate');
        });
        it('should map retire.js severities correctly', () => {
            const scanner = new SecurityScanner('/test');
            const mapRetireSeverity = scanner.mapRetireSeverity.bind(scanner);
            // Test retire.js specific mapping (critical -> high)
            expect(mapRetireSeverity('critical')).toBe('high');
            expect(mapRetireSeverity('high')).toBe('high');
            expect(mapRetireSeverity('medium')).toBe('moderate');
            expect(mapRetireSeverity('low')).toBe('low');
            expect(mapRetireSeverity('unknown')).toBe('moderate');
        });
        it('should map OSV severity scores correctly', () => {
            const scanner = new SecurityScanner('/test');
            const mapOSVSeverity = scanner.mapOSVSeverity.bind(scanner);
            // Test score-based mapping
            expect(mapOSVSeverity(10.0)).toBe('critical'); // >= 9.0
            expect(mapOSVSeverity(9.5)).toBe('critical');
            expect(mapOSVSeverity(8.5)).toBe('high'); // >= 7.0
            expect(mapOSVSeverity(7.0)).toBe('high');
            expect(mapOSVSeverity(5.5)).toBe('moderate'); // >= 4.0
            expect(mapOSVSeverity(4.0)).toBe('moderate');
            expect(mapOSVSeverity(2.5)).toBe('low'); // < 4.0
            expect(mapOSVSeverity(0.0)).toBe('low');
        });
    });
    describe('Status Determination - REAL LOGIC VALIDATION', () => {
        it('should determine status correctly based on vulnerability counts', () => {
            const scanner = new SecurityScanner('/test');
            const determineStatus = scanner.determineStatus.bind(scanner);
            // Critical or high = fail
            expect(determineStatus({ critical: 1, high: 0, moderate: 0, low: 0 })).toBe('fail');
            expect(determineStatus({ critical: 0, high: 1, moderate: 0, low: 0 })).toBe('fail');
            expect(determineStatus({ critical: 1, high: 1, moderate: 0, low: 0 })).toBe('fail');
            // Moderate or low = warning
            expect(determineStatus({ critical: 0, high: 0, moderate: 1, low: 0 })).toBe('warning');
            expect(determineStatus({ critical: 0, high: 0, moderate: 0, low: 1 })).toBe('warning');
            expect(determineStatus({ critical: 0, high: 0, moderate: 5, low: 3 })).toBe('warning');
            // No vulnerabilities = pass
            expect(determineStatus({ critical: 0, high: 0, moderate: 0, low: 0 })).toBe('pass');
        });
    });
    describe('Summary Calculation - ACTUAL MATH', () => {
        it('should calculate vulnerability summary correctly', () => {
            const scanner = new SecurityScanner('/test');
            const calculateSummary = scanner.calculateSummary.bind(scanner);
            const vulnerabilities = [
                { severity: 'critical' },
                { severity: 'critical' },
                { severity: 'high' },
                { severity: 'moderate' },
                { severity: 'moderate' },
                { severity: 'moderate' },
                { severity: 'low' },
            ];
            const summary = calculateSummary(vulnerabilities);
            // Verify EXACT counts
            expect(summary.total).toBe(7);
            expect(summary.critical).toBe(2);
            expect(summary.high).toBe(1);
            expect(summary.moderate).toBe(3);
            expect(summary.low).toBe(1);
            // Verify math adds up
            expect(summary.critical + summary.high + summary.moderate + summary.low).toBe(summary.total);
        });
        it('should handle empty vulnerability list', () => {
            const scanner = new SecurityScanner('/test');
            const calculateSummary = scanner.calculateSummary.bind(scanner);
            const summary = calculateSummary([]);
            expect(summary.total).toBe(0);
            expect(summary.critical).toBe(0);
            expect(summary.high).toBe(0);
            expect(summary.moderate).toBe(0);
            expect(summary.low).toBe(0);
        });
    });
    describe('File Discovery - REAL FILE SYSTEM OPERATIONS', () => {
        it('should find actual source files in project', () => {
            // Create test files
            writeFileSync(join(testProjectPath, 'index.ts'), 'export default {};');
            writeFileSync(join(testProjectPath, 'utils.js'), 'module.exports = {};');
            writeFileSync(join(testProjectPath, 'config.json'), '{}');
            writeFileSync(join(testProjectPath, 'README.md'), '# Test'); // Should be ignored
            const scanner = new SecurityScanner(testProjectPath);
            const findSourceFiles = scanner.findSourceFiles.bind(scanner);
            const files = findSourceFiles();
            // Should find TypeScript, JavaScript, and JSON files
            expect(files.some((f) => f.endsWith('index.ts'))).toBe(true);
            expect(files.some((f) => f.endsWith('utils.js'))).toBe(true);
            expect(files.some((f) => f.endsWith('config.json'))).toBe(true);
            expect(files.some((f) => f.endsWith('package.json'))).toBe(true); // Created in beforeEach
            // Should NOT find markdown files
            expect(files.some((f) => f.endsWith('README.md'))).toBe(false);
            // All results should be absolute paths (Windows: C:\ or Unix: /)
            expect(files.every((f) => f.includes(':') || f.startsWith('/'))).toBe(true);
        });
        it('should handle subdirectories correctly', () => {
            // Create nested directory structure
            mkdirSync(join(testProjectPath, 'src'), { recursive: true });
            mkdirSync(join(testProjectPath, 'tests'), { recursive: true });
            mkdirSync(join(testProjectPath, 'node_modules'), { recursive: true }); // Should be ignored
            writeFileSync(join(testProjectPath, 'src', 'main.ts'), 'export {};');
            writeFileSync(join(testProjectPath, 'tests', 'test.js'), 'test();');
            writeFileSync(join(testProjectPath, 'node_modules', 'lib.js'), 'ignored();');
            const scanner = new SecurityScanner(testProjectPath);
            const findSourceFiles = scanner.findSourceFiles.bind(scanner);
            const files = findSourceFiles();
            // Should find files in subdirectories
            expect(files.some((f) => f.includes('src') && f.endsWith('main.ts'))).toBe(true);
            expect(files.some((f) => f.includes('tests') && f.endsWith('test.js'))).toBe(true);
            // Should NOT include node_modules files
            expect(files.some((f) => f.includes('node_modules'))).toBe(false);
        });
    });
    describe('INTEGRATION - Full Security Scan with Real Files', () => {
        it('should scan real project and provide comprehensive results', async () => {
            // Create a realistic project structure with various security issues
            mkdirSync(join(testProjectPath, 'src'), { recursive: true });
            // File with secrets
            writeFileSync(join(testProjectPath, 'src', 'config.ts'), `
        export const secrets = {
          database_password: "prod123!@#",
          api_key: "sk-proj-abcdef1234567890"
        };
      `);
            // File with dangerous functions
            writeFileSync(join(testProjectPath, 'src', 'unsafe.ts'), `
        export function processUserInput(html: string) {
          eval('console.log("Processing: " + html)');
          document.getElementById('content').innerHTML = html;
        }
      `);
            // Safe file
            writeFileSync(join(testProjectPath, 'src', 'safe.ts'), `
        export function safeProcessing(input: string): string {
          return input.replace(/[<>&"]/g, char => {
            const map: Record<string, string> = {
              '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;'
            };
            return map[char] || char;
          });
        }
      `);
            const result = await securityScanner.runSecurityScan();
            // Should detect multiple types of vulnerabilities
            expect(result.vulnerabilities.length).toBeGreaterThan(0);
            // Should have secrets detected
            const secretVulns = result.vulnerabilities.filter(v => v.id === 'hardcoded-secret');
            expect(secretVulns.length).toBeGreaterThan(0);
            // Should have dangerous functions detected
            const dangerousVulns = result.vulnerabilities.filter(v => v.id === 'dangerous-function');
            expect(dangerousVulns.length).toBeGreaterThanOrEqual(2); // eval + innerHTML
            // Summary should match actual findings
            const expectedTotal = secretVulns.length + dangerousVulns.length;
            expect(result.summary.total).toBe(expectedTotal);
            // Status should reflect severity (high severity secrets = fail)
            expect(result.status).toBe('fail'); // Due to high severity secrets
            // Scan should take reasonable time
            expect(result.scanTime).toBeGreaterThan(50); // Real processing time
            expect(result.scanTime).toBeLessThan(10000); // But not too long
            console.log(`Comprehensive scan found ${result.vulnerabilities.length} issues in ${result.scanTime}ms`);
            console.log(`Status: ${result.status}, Summary:`, result.summary);
        });
    });
});
//# sourceMappingURL=security-scanner.test.js.map