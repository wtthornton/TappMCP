import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SmartBeginMCPTool, type SmartBeginInput } from './smart-begin-mcp.js';

describe('SmartBeginMCPTool', () => {
  let tool: SmartBeginMCPTool;

  beforeEach(() => {
    tool = new SmartBeginMCPTool();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize successfully', () => {
      expect(tool).toBeDefined();
      expect(tool).toBeInstanceOf(SmartBeginMCPTool);
    });
  });

  describe('Basic Project Creation', () => {
    it('should create a basic project successfully', async () => {
      const input: SmartBeginInput = {
        projectName: 'test-project',
        description: 'A test project',
        techStack: ['typescript'],
        targetUsers: ['developers'],
        businessGoals: ['improve efficiency']
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.projectId).toContain('test-project');
      expect(result.data?.projectStructure.folders).toContain('src');
      expect(result.data?.projectStructure.folders).toContain('tests');
      expect(result.data?.qualityGates).toHaveLength(4); // Base quality gates
      expect(result.data?.nextSteps.length).toBeGreaterThanOrEqual(5); // Base next steps
      expect(result.data?.businessValue.costPrevention).toBeGreaterThan(0);
      expect(result.data?.technicalMetrics.responseTime).toBeGreaterThan(0);
    });

    it('should handle minimal input', async () => {
      const input: SmartBeginInput = {
        projectName: 'minimal-project',
        techStack: [],
        targetUsers: []
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.projectId).toContain('minimal-project');
    });
  });

  describe('Tech Stack Specific Features', () => {
    it('should add React-specific structure and quality gates', async () => {
      const input: SmartBeginInput = {
        projectName: 'react-project',
        techStack: ['react', 'typescript'],
        targetUsers: ['developers']
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.projectStructure.folders).toContain('public');
      expect(result.data?.projectStructure.folders).toContain('src/components');
      expect(result.data?.projectStructure.files).toContain('index.html');
      expect(result.data?.projectStructure.files).toContain('src/App.tsx');
      expect(result.data?.qualityGates).toHaveLength(5); // Base + React
      expect(result.data?.qualityGates.some(gate => gate.name === 'React Best Practices')).toBe(true);
    });

    it('should add Node.js-specific structure and quality gates', async () => {
      const input: SmartBeginInput = {
        projectName: 'nodejs-project',
        techStack: ['nodejs', 'express'],
        targetUsers: ['developers']
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.projectStructure.folders).toContain('src/routes');
      expect(result.data?.projectStructure.folders).toContain('src/middleware');
      expect(result.data?.projectStructure.files).toContain('src/server.ts');
      expect(result.data?.qualityGates).toHaveLength(5); // Base + Node.js
      expect(result.data?.qualityGates.some(gate => gate.name === 'Node.js Security')).toBe(true);
    });

    it('should add Python-specific structure and quality gates', async () => {
      const input: SmartBeginInput = {
        projectName: 'python-project',
        techStack: ['python'],
        targetUsers: ['developers']
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.projectStructure.files).toContain('requirements.txt');
      expect(result.data?.projectStructure.files).toContain('setup.py');
      expect(result.data?.qualityGates).toHaveLength(5); // Base + Python
      expect(result.data?.qualityGates.some(gate => gate.name === 'Python Code Quality')).toBe(true);
    });
  });

  describe('Target Users Impact', () => {
    it('should add developer-specific next steps', async () => {
      const input: SmartBeginInput = {
        projectName: 'dev-project',
        techStack: ['typescript'],
        targetUsers: ['developers']
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.nextSteps).toContain('Set up CI/CD pipeline');
      expect(result.data?.nextSteps).toContain('Configure code review process');
    });

    it('should add designer-specific next steps', async () => {
      const input: SmartBeginInput = {
        projectName: 'design-project',
        techStack: ['react'],
        targetUsers: ['designers']
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.nextSteps).toContain('Set up design system');
      expect(result.data?.nextSteps).toContain('Create component library');
    });
  });

  describe('Business Value Calculation', () => {
    it('should calculate higher business value for complex tech stacks', async () => {
      const simpleInput: SmartBeginInput = {
        projectName: 'simple-project',
        techStack: ['typescript'],
        targetUsers: []
      };

      const complexInput: SmartBeginInput = {
        projectName: 'complex-project',
        techStack: ['react', 'nodejs', 'python'],
        targetUsers: ['developers', 'designers']
      };

      const simpleResult = await tool.execute(simpleInput);
      const complexResult = await tool.execute(complexInput);

      expect(simpleResult.success).toBe(true);
      expect(complexResult.success).toBe(true);
      expect(complexResult.data?.businessValue.costPrevention).toBeGreaterThan(
        simpleResult.data?.businessValue.costPrevention || 0
      );
      expect(complexResult.data?.businessValue.timeSaved).toBeGreaterThan(
        simpleResult.data?.businessValue.timeSaved || 0
      );
    });
  });

  describe('Technical Metrics', () => {
    it('should calculate appropriate technical metrics', async () => {
      const input: SmartBeginInput = {
        projectName: 'metrics-project',
        techStack: ['react', 'nodejs'],
        targetUsers: ['developers']
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.technicalMetrics.responseTime).toBeGreaterThan(0);
      expect(result.data?.technicalMetrics.responseTime).toBeLessThanOrEqual(200);
      expect(result.data?.technicalMetrics.securityScore).toBeGreaterThan(0);
      expect(result.data?.technicalMetrics.securityScore).toBeLessThanOrEqual(100);
      expect(result.data?.technicalMetrics.complexityScore).toBeGreaterThan(0);
      expect(result.data?.technicalMetrics.complexityScore).toBeLessThanOrEqual(10);
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors', async () => {
      const invalidInput = {
        projectName: '', // Invalid: empty string
        techStack: 'not-an-array' // Invalid: should be array
      } as any;

      const result = await tool.execute(invalidInput);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Project name is required');
    });

    it('should handle missing required fields', async () => {
      const invalidInput = {
        // Missing projectName
        techStack: ['typescript']
      } as any;

      const result = await tool.execute(invalidInput);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Required');
    });
  });

  describe('Performance', () => {
    it('should complete within reasonable time', async () => {
      const input: SmartBeginInput = {
        projectName: 'perf-project',
        techStack: ['react', 'nodejs', 'python'],
        targetUsers: ['developers', 'designers']
      };

      const startTime = performance.now();
      const result = await tool.execute(input);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('Project ID Generation', () => {
    it('should generate unique project IDs', async () => {
      const input1: SmartBeginInput = {
        projectName: 'unique-project',
        techStack: ['typescript'],
        targetUsers: []
      };

      const input2: SmartBeginInput = {
        projectName: 'unique-project',
        techStack: ['typescript'],
        targetUsers: []
      };

      const result1 = await tool.execute(input1);
      const result2 = await tool.execute(input2);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.data?.projectId).not.toBe(result2.data?.projectId);
    });

    it('should clean project names in IDs', async () => {
      const input: SmartBeginInput = {
        projectName: 'My Awesome Project!',
        techStack: ['typescript'],
        targetUsers: []
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.projectId).toContain('my-awesome-project');
      expect(result.data?.projectId).not.toContain('!');
      expect(result.data?.projectId).not.toContain(' ');
    });
  });
});
