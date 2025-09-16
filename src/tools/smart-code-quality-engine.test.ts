/**
 * Tests for Smart Code Quality Engine
 *
 * Comprehensive test suite for the complete code quality improvement engine
 * including analysis, batch processing, trends, monitoring, and custom rules.
 *
 * Task 2.3.5: Code Quality Improvement Engine Completion
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SmartCodeQualityEngine, QualityEngineConfig, CustomQualityRule } from './smart-code-quality-engine.js';

// Mock external dependencies
vi.mock('./smart-code-quality-analyzer.js', () => ({
  SmartCodeQualityAnalyzer: vi.fn().mockImplementation(() => ({
    analyzeCode: vi.fn().mockResolvedValue({
      issues: [
        {
          id: 'test_issue_1',
          type: 'long_functions',
          severity: 'medium',
          title: 'Long Functions Detected',
          description: 'Functions are too long',
          location: { file: 'test.ts', line: 1, column: 1 },
          code: 'test code',
          impact: { maintainability: 0.3, readability: 0.2, testability: 0.4, reusability: 0.3, overall: 0.3 },
          confidence: 0.8,
          tags: ['maintainability'],
          metadata: { language: 'typescript', detectedAt: new Date().toISOString(), category: 'Function Design' }
        }
      ],
      recommendations: [
        {
          id: 'test_rec_1',
          issueId: 'test_issue_1',
          title: 'Extract Method',
          description: 'Break down long functions',
          solution: 'Extract logical blocks',
          explanation: 'Improves readability',
          codeFix: '// Extract method',
          confidence: 0.9,
          effort: 'medium',
          impact: { maintainabilityImprovement: 80, readabilityImprovement: 85, testabilityImprovement: 90, reusabilityImprovement: 70, overallImprovement: 80 },
          prerequisites: ['Identify logical blocks'],
          alternatives: ['Use composition'],
          examples: [],
          testing: { verification: ['Test extracted methods'], refactoring: ['Ensure no side effects'] }
        }
      ],
      summary: {
        totalIssues: 1,
        criticalIssues: 0,
        highIssues: 0,
        mediumIssues: 1,
        lowIssues: 0,
        estimatedImprovement: { maintainability: 80, readability: 85, testability: 90, reusability: 70, overall: 80 }
      },
      metrics: {
        current: { overall: 75, maintainability: 80, performance: 70, security: 85, reliability: 75, usability: 80 },
        projected: { overall: 85, maintainability: 90, performance: 75, security: 90, reliability: 85, usability: 90 },
        improvement: 13.3
      },
      executionTime: 100
    }),
    applyImprovement: vi.fn().mockResolvedValue({
      success: true,
      improvedCode: 'improved code',
      changes: ['Code structure improved'],
      warnings: [],
      verification: ['Test extracted methods']
    })
  }))
}));

vi.mock('../intelligence/QualityAssuranceEngine.js', () => ({
  QualityAssuranceEngine: vi.fn().mockImplementation(() => ({
    analyzeCode: vi.fn().mockResolvedValue({
      overall: 75,
      message: 'Good quality',
      breakdown: { maintainability: 80, readability: 70, testability: 75 },
      recommendations: ['Extract methods', 'Add documentation'],
      timestamp: new Date().toISOString(),
      grade: 'B',
      gradeDetails: { letter: 'B', description: 'Good', color: '#3b82f6' },
      trend: { direction: 'improving', change: 5, confidence: 80, improvementAreas: ['maintainability'], regressionAreas: [] },
      benchmark: { industryAverage: 70, categoryAverage: 75, percentile: 80, ranking: 'above-average' },
      compliance: { standards: [], overallCompliance: 85, criticalIssues: 0, warnings: 2 },
      metrics: { codeHealthScore: 75, technicalDebtRatio: 0.2, maintainabilityIndex: 80, duplicationPercentage: 5, testCoverage: 80, complexityScore: 3, documentationCoverage: 70, securityRiskLevel: 'low', performanceRisk: 'low' }
    })
  }))
}));

describe('SmartCodeQualityEngine', () => {
  let engine: SmartCodeQualityEngine;
  let mockConfig: Partial<QualityEngineConfig>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockConfig = {
      enableRealTimeMonitoring: true,
      enableAutomatedFixes: true,
      enableTrendAnalysis: true,
      enableCustomRules: true,
      qualityThresholds: {
        critical: 0.9,
        high: 0.8,
        medium: 0.6,
        low: 0.4
      },
      monitoringInterval: 1000,
      maxFileSize: 1024 * 1024,
      supportedLanguages: ['typescript', 'javascript'],
      customRules: []
    };

    engine = new SmartCodeQualityEngine(mockConfig);
  });

  afterEach(() => {
    if (engine) {
      engine.stopMonitoring();
    }
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      const defaultEngine = new SmartCodeQualityEngine();
      const config = defaultEngine.getConfig();

      expect(config.enableRealTimeMonitoring).toBe(true);
      expect(config.enableAutomatedFixes).toBe(true);
      expect(config.enableTrendAnalysis).toBe(true);
      expect(config.enableCustomRules).toBe(true);
      expect(config.supportedLanguages).toContain('typescript');
    });

    it('should initialize with custom configuration', () => {
      const customEngine = new SmartCodeQualityEngine({
        enableRealTimeMonitoring: false,
        monitoringInterval: 5000,
        maxFileSize: 512 * 1024
      });

      const config = customEngine.getConfig();
      expect(config.enableRealTimeMonitoring).toBe(false);
      expect(config.monitoringInterval).toBe(5000);
      expect(config.maxFileSize).toBe(512 * 1024);
    });

    it('should initialize with default custom rules', () => {
      const config = engine.getConfig();
      expect(config.customRules.length).toBeGreaterThan(0);
      expect(config.customRules.some(rule => rule.id === 'no_console_log')).toBe(true);
      expect(config.customRules.some(rule => rule.id === 'no_debugger')).toBe(true);
    });
  });

  describe('File Analysis', () => {
    it('should analyze a single file successfully', async () => {
      const filePath = 'test.ts';
      const code = 'function longFunction() { /* 50 lines of code */ }';
      const language = 'typescript';

      const result = await engine.analyzeFile(filePath, code, language);

      expect(result).toBeDefined();
      expect(result.issues).toHaveLength(1);
      expect(result.recommendations).toHaveLength(1);
      expect(result.metrics.current.overall).toBe(75);
      expect(result.executionTime).toBeGreaterThan(0);
    });

    it('should handle analysis errors gracefully', async () => {
      const filePath = 'error.ts';
      const code = '';
      const language = 'typescript';

      // Mock analyzer to throw error
      const mockAnalyzer = vi.mocked(engine['analyzer']);
      mockAnalyzer.analyzeCode.mockRejectedValueOnce(new Error('Analysis failed'));

      await expect(engine.analyzeFile(filePath, code, language)).rejects.toThrow('Quality analysis failed for error.ts: Error: Analysis failed');
    });

    it('should apply custom rules when enabled', async () => {
      const filePath = 'test.ts';
      const code = 'console.log("test"); debugger;';
      const language = 'typescript';

      const result = await engine.analyzeFile(filePath, code, language);

      expect(result.issues.length).toBeGreaterThan(1); // Should have analyzer issues + custom rule issues
      expect(result.issues.some(issue => issue.tags.includes('custom'))).toBe(true);
    });

    it('should record quality trends when enabled', async () => {
      const filePath = 'test.ts';
      const code = 'function test() { return "test"; }';
      const language = 'typescript';

      await engine.analyzeFile(filePath, code, language);

      const trends = engine.getQualityTrends(filePath);
      expect(trends).toHaveLength(1);
      expect(trends[0].filePath).toBe(filePath);
      expect(trends[0].score).toBe(75);
    });
  });

  describe('Batch Analysis', () => {
    it('should analyze multiple files successfully', async () => {
      const files = [
        { path: 'file1.ts', code: 'function test1() { return "test1"; }', language: 'typescript' },
        { path: 'file2.ts', code: 'function test2() { return "test2"; }', language: 'typescript' },
        { path: 'file3.ts', code: 'function test3() { return "test3"; }', language: 'typescript' }
      ];

      const result = await engine.analyzeBatch(files);

      expect(result.results.size).toBe(3);
      expect(result.summary.totalFiles).toBe(3);
      expect(result.summary.successfulAnalyses).toBe(3);
      expect(result.summary.failedAnalyses).toBe(0);
      expect(result.summary.averageScore).toBe(75);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle file size limits', async () => {
      const largeCode = 'a'.repeat(2 * 1024 * 1024); // 2MB
      const files = [
        { path: 'large.ts', code: largeCode, language: 'typescript' }
      ];

      const result = await engine.analyzeBatch(files);

      expect(result.results.size).toBe(0);
      expect(result.summary.failedAnalyses).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toContain('File too large');
    });

    it('should handle mixed success and failure', async () => {
      const files = [
        { path: 'good.ts', code: 'function good() { return "good"; }', language: 'typescript' },
        { path: 'bad.ts', code: '', language: 'typescript' }
      ];

      // Mock one file to fail
      const mockAnalyzer = vi.mocked(engine['analyzer']);
      mockAnalyzer.analyzeCode
        .mockResolvedValueOnce({
          issues: [], recommendations: [], summary: { totalIssues: 0, criticalIssues: 0, highIssues: 0, mediumIssues: 0, lowIssues: 0, estimatedImprovement: { maintainability: 0, readability: 0, testability: 0, reusability: 0, overall: 0 } },
          metrics: { current: { overall: 80 }, projected: { overall: 85 }, improvement: 6.25 },
          executionTime: 50
        })
        .mockRejectedValueOnce(new Error('Analysis failed'));

      const result = await engine.analyzeBatch(files);

      expect(result.results.size).toBe(1);
      expect(result.summary.successfulAnalyses).toBe(1);
      expect(result.summary.failedAnalyses).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('Quality Reports', () => {
    it('should generate comprehensive quality report', async () => {
      const filePaths = ['file1.ts', 'file2.ts', 'file3.ts'];

      const report = await engine.generateQualityReport(filePaths);

      expect(report.overallScore).toBe(75);
      expect(report.grade).toBe('C');
      expect(report.metrics.totalFiles).toBe(3);
      expect(report.metrics.analyzedFiles).toBe(3);
      expect(report.metrics.totalIssues).toBe(3); // 1 issue per file
      expect(report.trends).toHaveLength(3);
      expect(report.generatedAt).toBeDefined();
      expect(report.duration).toBeGreaterThan(0);
    });

    it('should handle empty file list', async () => {
      const report = await engine.generateQualityReport([]);

      expect(report.overallScore).toBe(0);
      expect(report.grade).toBe('F');
      expect(report.metrics.totalFiles).toBe(0);
      expect(report.metrics.analyzedFiles).toBe(0);
    });
  });

  describe('Improvements', () => {
    it('should apply improvements successfully', async () => {
      const filePath = 'test.ts';
      const code = 'function test() { return "test"; }';
      const improvements = [
        { issueId: 'test_issue_1', recommendationId: 'test_rec_1' }
      ];

      const result = await engine.applyImprovements(filePath, code, improvements);

      expect(result.success).toBe(true);
      expect(result.appliedImprovements).toHaveLength(1);
      expect(result.appliedImprovements[0]).toBe('test_rec_1');
      expect(result.improvedCode).toBe('improved code');
      expect(result.changes).toHaveLength(1);
      expect(result.warnings).toHaveLength(0);
    });

    it('should handle improvement failures gracefully', async () => {
      const filePath = 'test.ts';
      const code = 'function test() { return "test"; }';
      const improvements = [
        { issueId: 'invalid_issue', recommendationId: 'invalid_rec' }
      ];

      // Mock analyzer to return failure
      const mockAnalyzer = vi.mocked(engine['analyzer']);
      mockAnalyzer.applyImprovement.mockResolvedValueOnce({
        success: false,
        improvedCode: code,
        changes: [],
        warnings: ['Issue not found'],
        verification: []
      });

      const result = await engine.applyImprovements(filePath, code, improvements);

      expect(result.success).toBe(false);
      expect(result.appliedImprovements).toHaveLength(0);
      expect(result.warnings).toHaveLength(1);
    });
  });

  describe('Monitoring', () => {
    it('should start monitoring successfully', () => {
      const startSpy = vi.spyOn(engine, 'startMonitoring');
      engine.startMonitoring();

      expect(startSpy).toHaveBeenCalled();
      expect(engine['isMonitoring']).toBe(true);
    });

    it('should stop monitoring successfully', () => {
      engine.startMonitoring();
      const stopSpy = vi.spyOn(engine, 'stopMonitoring');
      engine.stopMonitoring();

      expect(stopSpy).toHaveBeenCalled();
      expect(engine['isMonitoring']).toBe(false);
    });

    it('should not start monitoring if already running', () => {
      engine.startMonitoring();
      const consoleSpy = vi.spyOn(console, 'warn');
      engine.startMonitoring();

      expect(consoleSpy).toHaveBeenCalledWith('⚠️ Quality monitoring is already running');
    });

    it('should not stop monitoring if not running', () => {
      const consoleSpy = vi.spyOn(console, 'warn');
      engine.stopMonitoring();

      expect(consoleSpy).toHaveBeenCalledWith('⚠️ Quality monitoring is not running');
    });
  });

  describe('Trends', () => {
    it('should track quality trends for files', async () => {
      const filePath = 'test.ts';
      const code = 'function test() { return "test"; }';

      await engine.analyzeFile(filePath, code);
      await engine.analyzeFile(filePath, code);

      const trends = engine.getQualityTrends(filePath);
      expect(trends).toHaveLength(2);
      expect(trends[0].filePath).toBe(filePath);
      expect(trends[1].filePath).toBe(filePath);
    });

    it('should return empty array for unknown file', () => {
      const trends = engine.getQualityTrends('unknown.ts');
      expect(trends).toHaveLength(0);
    });

    it('should get overall trends from all files', async () => {
      await engine.analyzeFile('file1.ts', 'code1');
      await engine.analyzeFile('file2.ts', 'code2');

      const overallTrends = engine.getOverallTrends();
      expect(overallTrends).toHaveLength(2);
      expect(overallTrends.map(t => t.filePath)).toContain('file1.ts');
      expect(overallTrends.map(t => t.filePath)).toContain('file2.ts');
    });

    it('should limit trend history per file', async () => {
      const filePath = 'test.ts';
      const code = 'function test() { return "test"; }';

      // Generate more than 100 trends
      for (let i = 0; i < 105; i++) {
        await engine.analyzeFile(filePath, code);
      }

      const trends = engine.getQualityTrends(filePath);
      expect(trends).toHaveLength(100); // Should be limited to 100
    });
  });

  describe('Custom Rules', () => {
    it('should add custom rule successfully', () => {
      const rule: CustomQualityRule = {
        id: 'test_rule',
        name: 'Test Rule',
        description: 'Test description',
        pattern: /test/g,
        severity: 'medium',
        fix: (code, match) => code.replace(match[0], 'TEST'),
        enabled: true
      };

      engine.addCustomRule(rule);

      const config = engine.getConfig();
      expect(config.customRules).toContain(rule);
    });

    it('should remove custom rule successfully', () => {
      const rule: CustomQualityRule = {
        id: 'test_rule',
        name: 'Test Rule',
        description: 'Test description',
        pattern: /test/g,
        severity: 'medium',
        fix: (code, match) => code.replace(match[0], 'TEST'),
        enabled: true
      };

      engine.addCustomRule(rule);
      engine.removeCustomRule('test_rule');

      const config = engine.getConfig();
      expect(config.customRules).not.toContain(rule);
    });

    it('should handle removal of non-existent rule', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      engine.removeCustomRule('non_existent');

      expect(consoleSpy).not.toHaveBeenCalledWith('✅ Removed custom quality rule: non_existent');
    });
  });

  describe('Configuration', () => {
    it('should update configuration successfully', () => {
      const newConfig = {
        enableRealTimeMonitoring: false,
        monitoringInterval: 5000,
        maxFileSize: 512 * 1024
      };

      engine.updateConfig(newConfig);

      const config = engine.getConfig();
      expect(config.enableRealTimeMonitoring).toBe(false);
      expect(config.monitoringInterval).toBe(5000);
      expect(config.maxFileSize).toBe(512 * 1024);
    });

    it('should get current configuration', () => {
      const config = engine.getConfig();

      expect(config).toBeDefined();
      expect(config.enableRealTimeMonitoring).toBe(true);
      expect(config.enableAutomatedFixes).toBe(true);
      expect(config.enableTrendAnalysis).toBe(true);
      expect(config.enableCustomRules).toBe(true);
      expect(config.supportedLanguages).toContain('typescript');
    });
  });

  describe('Event Emission', () => {
    it('should emit events for file analysis', async () => {
      const eventSpy = vi.fn();
      engine.on('fileAnalyzed', eventSpy);

      await engine.analyzeFile('test.ts', 'code');

      expect(eventSpy).toHaveBeenCalledWith({
        filePath: 'test.ts',
        analysis: expect.any(Object),
        duration: expect.any(Number)
      });
    });

    it('should emit events for batch analysis', async () => {
      const eventSpy = vi.fn();
      engine.on('batchAnalysisComplete', eventSpy);

      const files = [{ path: 'test.ts', code: 'code' }];
      await engine.analyzeBatch(files);

      expect(eventSpy).toHaveBeenCalledWith(expect.objectContaining({
        results: expect.any(Map),
        summary: expect.any(Object),
        errors: expect.any(Array),
        duration: expect.any(Number)
      }));
    });

    it('should emit events for quality reports', async () => {
      const eventSpy = vi.fn();
      engine.on('qualityReportGenerated', eventSpy);

      await engine.generateQualityReport(['test.ts']);

      expect(eventSpy).toHaveBeenCalledWith(expect.objectContaining({
        overallScore: expect.any(Number),
        grade: expect.any(String),
        trends: expect.any(Array),
        issues: expect.any(Array),
        recommendations: expect.any(Array),
        metrics: expect.any(Object),
        generatedAt: expect.any(String),
        duration: expect.any(Number)
      }));
    });

    it('should emit events for improvements', async () => {
      const eventSpy = vi.fn();
      engine.on('improvementsApplied', eventSpy);

      const improvements = [{ issueId: 'test_issue_1', recommendationId: 'test_rec_1' }];
      await engine.applyImprovements('test.ts', 'code', improvements);

      expect(eventSpy).toHaveBeenCalledWith({
        filePath: 'test.ts',
        success: true,
        appliedCount: 1,
        totalCount: 1
      });
    });

    it('should emit events for monitoring', () => {
      const startSpy = vi.fn();
      const stopSpy = vi.fn();

      engine.on('monitoringStarted', startSpy);
      engine.on('monitoringStopped', stopSpy);

      engine.startMonitoring();
      expect(startSpy).toHaveBeenCalled();

      engine.stopMonitoring();
      expect(stopSpy).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle analyzer errors gracefully', async () => {
      const mockAnalyzer = vi.mocked(engine['analyzer']);
      mockAnalyzer.analyzeCode.mockRejectedValueOnce(new Error('Analyzer error'));

      await expect(engine.analyzeFile('test.ts', 'code')).rejects.toThrow('Quality analysis failed for test.ts: Error: Analyzer error');
    });

    it('should handle improvement application errors', async () => {
      const mockAnalyzer = vi.mocked(engine['analyzer']);
      mockAnalyzer.applyImprovement.mockRejectedValueOnce(new Error('Improvement error'));

      const improvements = [{ issueId: 'test_issue_1', recommendationId: 'test_rec_1' }];
      const result = await engine.applyImprovements('test.ts', 'code', improvements);

      expect(result.success).toBe(false);
      expect(result.appliedImprovements).toHaveLength(0);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('Failed to apply improvement');
    });

    it('should handle monitoring errors gracefully', async () => {
      const errorSpy = vi.fn();
      engine.on('qualityCheckError', errorSpy);

      // Mock performQualityCheck to throw error
      const originalMethod = engine['performQualityCheck'];
      engine['performQualityCheck'] = vi.fn().mockRejectedValueOnce(new Error('Monitoring error'));

      engine.startMonitoring();

      // Wait for monitoring interval
      await new Promise(resolve => setTimeout(resolve, 1100));

      expect(errorSpy).toHaveBeenCalledWith(expect.any(Error));

      // Restore original method
      engine['performQualityCheck'] = originalMethod;
    });
  });
});
