import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SecurityScanner } from './security-scanner.js';

// Mock child_process
vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));

// Mock fs
vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  existsSync: vi.fn(),
}));

// Mock path
vi.mock('path', () => ({
  join: vi.fn((...args) => args.join('/')),
}));

describe('SecurityScanner', () => {
  let securityScanner: SecurityScanner;
  const mockProjectPath = '/test/project';

  beforeEach(() => {
    securityScanner = new SecurityScanner(mockProjectPath);
    vi.clearAllMocks();
  });

  describe('runSecurityScan', () => {
    it('should run comprehensive security scan', async () => {
      const { execSync } = await import('child_process');
      const { readFileSync } = await import('fs');

      // Mock npm audit output
      (execSync as any).mockImplementation((command: string) => {
        if (command.includes('npm audit')) {
          return JSON.stringify({
            vulnerabilities: {
              'test-package': {
                severity: 'high',
                range: '1.0.0',
                title: 'Test vulnerability',
                via: [{ cve: 'CVE-2023-1234' }],
                fixAvailable: true,
              },
            },
          });
        }
        if (command.includes('retire')) {
          return JSON.stringify({
            data: [
              {
                component: 'test-lib',
                version: '1.0.0',
                vulnerabilities: [
                  {
                    identifiers: { CVE: ['CVE-2023-5678'] },
                    severity: 'medium',
                    info: ['Test vulnerability description'],
                  },
                ],
              },
            ],
          });
        }
        return '';
      });

      // Mock file reading
      (readFileSync as any).mockReturnValue('test file content');

      const result = await securityScanner.runSecurityScan();

      expect(result).toHaveProperty('vulnerabilities');
      expect(result).toHaveProperty('scanTime');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('summary');
      expect(result.vulnerabilities.length).toBeGreaterThan(0);
    });

    it('should handle npm audit failures gracefully', async () => {
      const { execSync } = await import('child_process');

      (execSync as any).mockImplementation((command: string) => {
        if (command.includes('npm audit')) {
          throw new Error('npm audit failed');
        }
        return '';
      });

      const result = await securityScanner.runSecurityScan();

      expect(result.vulnerabilities).toEqual([]);
      expect(result.status).toBe('fail');
    });

    it('should handle retire scan failures gracefully', async () => {
      const { execSync } = await import('child_process');

      (execSync as any).mockImplementation((command: string) => {
        if (command.includes('retire')) {
          throw new Error('retire scan failed');
        }
        return '';
      });

      const result = await securityScanner.runSecurityScan();

      expect(result.vulnerabilities).toEqual([]);
      expect(result.status).toBe('fail');
    });
  });

  describe('mapNpmSeverity', () => {
    it('should map npm severities correctly', () => {
      const scanner = new SecurityScanner('/test');

      // Access private method through any type
      const mapSeverity = (scanner as any).mapNpmSeverity.bind(scanner);

      expect(mapSeverity('critical')).toBe('critical');
      expect(mapSeverity('high')).toBe('high');
      expect(mapSeverity('moderate')).toBe('moderate');
      expect(mapSeverity('low')).toBe('low');
      expect(mapSeverity('unknown')).toBe('moderate');
    });
  });

  describe('mapRetireSeverity', () => {
    it('should map retire severities correctly', () => {
      const scanner = new SecurityScanner('/test');

      // Access private method through any type
      const mapSeverity = (scanner as any).mapRetireSeverity.bind(scanner);

      expect(mapSeverity('critical')).toBe('high');
      expect(mapSeverity('high')).toBe('high');
      expect(mapSeverity('medium')).toBe('moderate');
      expect(mapSeverity('low')).toBe('low');
      expect(mapSeverity('unknown')).toBe('moderate');
    });
  });

  describe('calculateSummary', () => {
    it('should calculate vulnerability summary correctly', () => {
      const scanner = new SecurityScanner('/test');

      // Access private method through any type
      const calculateSummary = (scanner as any).calculateSummary.bind(scanner);

      const vulnerabilities = [
        { severity: 'critical' },
        { severity: 'high' },
        { severity: 'moderate' },
        { severity: 'low' },
        { severity: 'low' },
      ];

      const summary = calculateSummary(vulnerabilities);

      expect(summary.total).toBe(5);
      expect(summary.critical).toBe(1);
      expect(summary.high).toBe(1);
      expect(summary.moderate).toBe(1);
      expect(summary.low).toBe(2);
    });
  });

  describe('determineStatus', () => {
    it('should determine status based on vulnerabilities', () => {
      const scanner = new SecurityScanner('/test');

      // Access private method through any type
      const determineStatus = (scanner as any).determineStatus.bind(scanner);

      expect(determineStatus({ critical: 1, high: 0, moderate: 0, low: 0 })).toBe('fail');
      expect(determineStatus({ critical: 0, high: 1, moderate: 0, low: 0 })).toBe('fail');
      expect(determineStatus({ critical: 0, high: 0, moderate: 1, low: 0 })).toBe('warning');
      expect(determineStatus({ critical: 0, high: 0, moderate: 0, low: 1 })).toBe('warning');
      expect(determineStatus({ critical: 0, high: 0, moderate: 0, low: 0 })).toBe('pass');
    });
  });

  describe('checkFileContent', () => {
    it('should detect hardcoded secrets', () => {
      const scanner = new SecurityScanner('/test');
      const checkFileContent = (scanner as any).checkFileContent.bind(scanner);

      const codeWithSecrets = `
        const password = "mypassword123";
        const api_key = "sk-12345";
        const secret = "topsecret";
        const token = "abc123";
      `;

      const result = checkFileContent('/test/file.ts', codeWithSecrets);
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((v: { id: string }) => v.id === 'hardcoded-secret')).toBe(true);
    });

    it('should detect dangerous functions', () => {
      const scanner = new SecurityScanner('/test');
      const checkFileContent = (scanner as any).checkFileContent.bind(scanner);

      const dangerousCode = `
        eval("alert('test')");
        element.innerHTML = userInput;
        document.write(content);
      `;

      const result = checkFileContent('/test/file.ts', dangerousCode);
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((v: { id: string }) => v.id === 'dangerous-function')).toBe(true);
    });

    it('should return empty array for safe code', () => {
      const scanner = new SecurityScanner('/test');
      const checkFileContent = (scanner as any).checkFileContent.bind(scanner);

      const safeCode = `
        const x = 1;
        const y = 2;
        console.log(x + y);
      `;

      const result = checkFileContent('/test/file.ts', safeCode);
      expect(result).toEqual([]);
    });
  });

  describe('findSourceFiles', () => {
    it('should find source files', () => {
      const scanner = new SecurityScanner('/test');
      const findSourceFiles = (scanner as any).findSourceFiles.bind(scanner);
      
      const files = findSourceFiles();
      expect(Array.isArray(files)).toBe(true);
    });
  });
});
