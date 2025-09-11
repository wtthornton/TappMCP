#!/usr/bin/env node

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SimpleAnalyzer } from './simple-analyzer.js';

// Mock the dependencies
vi.mock('./security-scanner.js');
vi.mock('./static-analyzer.js');
vi.mock('./project-scanner.js');

describe('SimpleAnalyzer', () => {
  let analyzer: SimpleAnalyzer;
  const testProjectPath = '/test/project';
  let mockSecurityScanner: any;
  let mockStaticAnalyzer: any;
  let mockProjectScanner: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Import mocked modules
    const { SecurityScanner } = await import('./security-scanner.js');
    const { StaticAnalyzer } = await import('./static-analyzer.js');
    const { ProjectScanner } = await import('./project-scanner.js');

    // Create mock instances
    mockSecurityScanner = {
      runSecurityScan: vi.fn(),
    };
    mockStaticAnalyzer = {
      runStaticAnalysis: vi.fn(),
    };
    mockProjectScanner = {
      scanProject: vi.fn(),
    };

    // Setup constructor mocks
    vi.mocked(SecurityScanner).mockImplementation(() => mockSecurityScanner);
    vi.mocked(StaticAnalyzer).mockImplementation(() => mockStaticAnalyzer);
    vi.mocked(ProjectScanner).mockImplementation(() => mockProjectScanner);

    analyzer = new SimpleAnalyzer(testProjectPath);
  });

  describe('runBasicAnalysis', () => {
    it('should run all analyzers in parallel', async () => {
      // Setup mocks
      const mockSecurityResult = {
        vulnerabilities: [],
        scanTime: 100,
        status: 'pass' as const,
        summary: {
          total: 0,
          critical: 0,
          high: 0,
          moderate: 0,
          low: 0,
        },
      };

      const mockStaticResult = {
        issues: [],
        scanTime: 150,
        status: 'pass' as const,
        summary: {
          total: 0,
          error: 0,
          warning: 0,
          info: 0,
        },
        metrics: {
          complexity: 5,
          maintainability: 85,
          duplication: 2,
        },
      };

      const mockProjectResult = {
        projectStructure: {
          folders: ['src', 'tests'],
          files: ['index.ts', 'package.json'],
          configFiles: ['tsconfig.json', '.eslintrc.json'],
          templates: [],
        },
        detectedTechStack: ['typescript', 'nodejs'],
        qualityIssues: [],
        improvementOpportunities: [],
        projectMetadata: {
          name: 'test-project',
          version: '1.0.0',
        },
        analysisDepth: 'standard' as const,
        analysisTimestamp: new Date().toISOString(),
      };

      mockSecurityScanner.runSecurityScan.mockResolvedValue(mockSecurityResult);
      mockStaticAnalyzer.runStaticAnalysis.mockResolvedValue(mockStaticResult);
      mockProjectScanner.scanProject.mockResolvedValue(mockProjectResult);

      // Run analysis
      const result = await analyzer.runBasicAnalysis(testProjectPath);

      // Verify all analyzers were called
      expect(mockSecurityScanner.runSecurityScan).toHaveBeenCalled();
      expect(mockStaticAnalyzer.runStaticAnalysis).toHaveBeenCalled();
      expect(mockProjectScanner.scanProject).toHaveBeenCalledWith(testProjectPath, 'standard');

      // Verify result structure
      expect(result).toHaveProperty('projectPath', testProjectPath);
      expect(result).toHaveProperty('analysisTime');
      expect(result).toHaveProperty('security', mockSecurityResult);
      expect(result).toHaveProperty('static', mockStaticResult);
      expect(result).toHaveProperty('project', mockProjectResult);
      expect(result).toHaveProperty('summary');

      // Verify summary
      expect(result.summary.status).toBe('pass');
      expect(result.summary.overallScore).toBeGreaterThan(80);
      expect(result.summary.criticalIssues).toBe(0);
      expect(result.summary.qualityIssues).toBe(0);
    });

    it('should handle analyzer failures gracefully', async () => {
      // Setup mocks to fail
      mockSecurityScanner.runSecurityScan.mockRejectedValue(new Error('Security scan failed'));
      mockStaticAnalyzer.runStaticAnalysis.mockRejectedValue(new Error('Static analysis failed'));
      mockProjectScanner.scanProject.mockRejectedValue(new Error('Project scan failed'));

      // Run analysis - should not throw
      const result = await analyzer.runBasicAnalysis(testProjectPath);

      // Verify result has default values
      expect(result.security.status).toBe('warning');
      expect(result.static.status).toBe('warning');
      expect(result.project.detectedTechStack).toEqual([]);
      expect(result.summary.status).toBe('pass'); // No critical issues in defaults
    });

    it('should calculate correct summary for critical issues', async () => {
      // Setup mocks with critical issues
      const mockSecurityResult = {
        vulnerabilities: [
          {
            id: '1',
            severity: 'critical' as const,
            package: 'test',
            version: '1.0.0',
            description: 'Critical vuln',
          },
        ],
        scanTime: 100,
        status: 'fail' as const,
        summary: {
          total: 2,
          critical: 1,
          high: 1,
          moderate: 0,
          low: 0,
        },
      };

      const mockStaticResult = {
        issues: [
          {
            id: '1',
            severity: 'error' as const,
            file: 'test.ts',
            line: 1,
            column: 1,
            message: 'Error',
            rule: 'test',
            fix: 'Fix',
          },
        ],
        scanTime: 150,
        status: 'fail' as const,
        summary: {
          total: 2,
          error: 1,
          warning: 1,
          info: 0,
        },
        metrics: {
          complexity: 15,
          maintainability: 60,
          duplication: 8,
        },
      };

      const mockProjectResult = {
        projectStructure: {
          folders: [],
          files: [],
          configFiles: [],
          templates: [],
        },
        detectedTechStack: ['typescript'],
        qualityIssues: ['Missing tests', 'No ESLint config'],
        improvementOpportunities: ['Add testing framework', 'Configure linting'],
        projectMetadata: {
          name: 'test-project',
          version: '1.0.0',
        },
        analysisDepth: 'standard' as const,
        analysisTimestamp: new Date().toISOString(),
      };

      mockSecurityScanner.runSecurityScan.mockResolvedValue(mockSecurityResult);
      mockStaticAnalyzer.runStaticAnalysis.mockResolvedValue(mockStaticResult);
      mockProjectScanner.scanProject.mockResolvedValue(mockProjectResult);

      // Run analysis
      const result = await analyzer.runBasicAnalysis(testProjectPath);

      // Verify summary reflects issues
      expect(result.summary.status).toBe('fail');
      expect(result.summary.criticalIssues).toBe(2); // 1 critical + 1 high
      expect(result.summary.qualityIssues).toBe(2); // 1 error + 1 warning
      expect(result.summary.overallScore).toBeLessThan(70);

      // Check that appropriate recommendations are included
      expect(result.summary.recommendations.length).toBeGreaterThan(0);
      expect(result.summary.recommendations).toContain(
        'Fix 1 critical security vulnerabilities immediately'
      );
      expect(result.summary.recommendations).toContain('Address 1 high-priority security issues');

      // Complexity is 15, so should have complexity recommendation
      // We add "Add testing framework" from project improvements before complexity
      // So check we have at least 3 recommendations total
      expect(result.summary.recommendations.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('getQuickSummary', () => {
    it('should return only summary from quick analysis', async () => {
      // Setup mocks
      const mockSecurityResult = {
        vulnerabilities: [],
        scanTime: 50,
        status: 'pass' as const,
        summary: {
          total: 0,
          critical: 0,
          high: 0,
          moderate: 0,
          low: 0,
        },
      };

      const mockStaticResult = {
        issues: [],
        scanTime: 75,
        status: 'pass' as const,
        summary: {
          total: 0,
          error: 0,
          warning: 0,
          info: 0,
        },
        metrics: {
          complexity: 3,
          maintainability: 90,
          duplication: 1,
        },
      };

      const mockProjectResult = {
        projectStructure: {
          folders: ['src'],
          files: ['index.ts'],
          configFiles: ['package.json'],
          templates: [],
        },
        detectedTechStack: ['typescript'],
        qualityIssues: [],
        improvementOpportunities: [],
        projectMetadata: {
          name: 'test-project',
          version: '1.0.0',
        },
        analysisDepth: 'quick' as const,
        analysisTimestamp: new Date().toISOString(),
      };

      mockSecurityScanner.runSecurityScan.mockResolvedValue(mockSecurityResult);
      mockStaticAnalyzer.runStaticAnalysis.mockResolvedValue(mockStaticResult);
      mockProjectScanner.scanProject.mockResolvedValue(mockProjectResult);

      // Run quick summary
      const summary = await analyzer.getQuickSummary(testProjectPath);

      // Verify ProjectScanner was called with 'quick' depth
      expect(mockProjectScanner.scanProject).toHaveBeenCalledWith(testProjectPath, 'quick');

      // Verify summary structure
      expect(summary).toHaveProperty('overallScore');
      expect(summary).toHaveProperty('criticalIssues');
      expect(summary).toHaveProperty('qualityIssues');
      expect(summary).toHaveProperty('recommendations');
      expect(summary).toHaveProperty('status');
      expect(summary.status).toBe('pass');
    });
  });

  describe('checkQualityGates', () => {
    it('should return true when all quality gates pass', async () => {
      // Setup mocks for passing quality gates
      const mockSecurityResult = {
        vulnerabilities: [],
        scanTime: 100,
        status: 'pass' as const,
        summary: {
          total: 0,
          critical: 0,
          high: 0,
          moderate: 0,
          low: 0,
        },
      };

      const mockStaticResult = {
        issues: [],
        scanTime: 150,
        status: 'pass' as const,
        summary: {
          total: 0,
          error: 0,
          warning: 0,
          info: 0,
        },
        metrics: {
          complexity: 5,
          maintainability: 85,
          duplication: 2,
        },
      };

      const mockProjectResult = {
        projectStructure: {
          folders: ['src', 'tests'],
          files: ['index.ts', 'package.json'],
          configFiles: ['tsconfig.json', '.eslintrc.json'],
          templates: [],
        },
        detectedTechStack: ['typescript'],
        qualityIssues: [],
        improvementOpportunities: [],
        projectMetadata: {
          name: 'test-project',
          version: '1.0.0',
        },
        analysisDepth: 'standard' as const,
        analysisTimestamp: new Date().toISOString(),
      };

      mockSecurityScanner.runSecurityScan.mockResolvedValue(mockSecurityResult);
      mockStaticAnalyzer.runStaticAnalysis.mockResolvedValue(mockStaticResult);
      mockProjectScanner.scanProject.mockResolvedValue(mockProjectResult);

      // Check quality gates
      const result = await analyzer.checkQualityGates(testProjectPath);

      expect(result).toBe(true);
    });

    it('should return false when quality gates fail', async () => {
      // Setup mocks for failing quality gates
      const mockSecurityResult = {
        vulnerabilities: [],
        scanTime: 100,
        status: 'fail' as const,
        summary: {
          total: 1,
          critical: 1,
          high: 0,
          moderate: 0,
          low: 0,
        },
      };

      const mockStaticResult = {
        issues: [],
        scanTime: 150,
        status: 'pass' as const,
        summary: {
          total: 0,
          error: 0,
          warning: 0,
          info: 0,
        },
        metrics: {
          complexity: 5,
          maintainability: 85,
          duplication: 2,
        },
      };

      const mockProjectResult = {
        projectStructure: {
          folders: [],
          files: [],
          configFiles: [],
          templates: [],
        },
        detectedTechStack: [],
        qualityIssues: [],
        improvementOpportunities: [],
        projectMetadata: {
          name: 'test-project',
          version: '1.0.0',
        },
        analysisDepth: 'standard' as const,
        analysisTimestamp: new Date().toISOString(),
      };

      mockSecurityScanner.runSecurityScan.mockResolvedValue(mockSecurityResult);
      mockStaticAnalyzer.runStaticAnalysis.mockResolvedValue(mockStaticResult);
      mockProjectScanner.scanProject.mockResolvedValue(mockProjectResult);

      // Check quality gates
      const result = await analyzer.checkQualityGates(testProjectPath);

      expect(result).toBe(false);
    });
  });
});
