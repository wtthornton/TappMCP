import { describe, it, expect, beforeEach } from 'vitest';
import { AgentCodeGenerator } from './agent-code-generator.js';
import { AgentSpecification } from './agent-md-parser.js';

describe('AgentCodeGenerator', () => {
  let generator: AgentCodeGenerator;
  let sampleSpec: AgentSpecification;

  beforeEach(() => {
    generator = new AgentCodeGenerator();
    sampleSpec = {
      name: 'Test Agent',
      description: 'A test agent for code generation',
      capabilities: ['Code generation', 'Testing'],
      tools: [{
        name: 'code_generator',
        description: 'Generates code based on requirements',
        parameters: [{
          name: 'language',
          type: 'string',
          required: true,
          description: 'Programming language'
        }, {
          name: 'framework',
          type: 'string',
          required: false,
          description: 'Framework to use'
        }],
        examples: ['Generate a React component', 'Create a Python function']
      }],
      workflows: [{
        name: 'Development Workflow',
        description: 'Standard development process',
        steps: ['Analyze requirements', 'Generate code', 'Run tests'],
        triggers: ['User request'],
        outcomes: ['Working code']
      }],
      constraints: ['Must follow best practices'],
      examples: [{
        scenario: 'Generate a simple function',
        input: 'Create a hello world function',
        output: 'A working hello world function',
        explanation: 'Generates a basic function template'
      }],
      metadata: {
        version: '1.0.0',
        created: '2025-01-16T10:00:00Z',
        updated: '2025-01-16T10:00:00Z',
        author: 'TappMCP'
      }
    };
  });

  describe('generateCode', () => {
    it('should generate code from specification', async () => {
      const options = {
        language: 'typescript',
        quality: 'standard' as const,
        includeTests: true,
        includeDocumentation: true,
        includeExamples: true
      };

      const result = await generator.generateCode(sampleSpec, options);

      expect(result).toBeDefined();
      expect(result.files).toBeDefined();
      expect(result.files.length).toBeGreaterThan(0);
      expect(result.metadata).toBeDefined();
      expect(result.metadata.specification).toBe('Test Agent');
      expect(result.metadata.language).toBe('typescript');
    });

    it('should generate tool code files', async () => {
      const options = {
        language: 'typescript',
        quality: 'standard' as const,
        includeTests: false,
        includeDocumentation: false,
        includeExamples: false
      };

      const result = await generator.generateCode(sampleSpec, options);

      const toolFiles = result.files.filter(f => f.type === 'main' && f.path.includes('tools'));
      expect(toolFiles.length).toBe(1);
      expect(toolFiles[0].path).toBe('src/tools/code_generator.ts');
      expect(toolFiles[0].content).toContain('export class CodeGenerator');
    });

    it('should generate workflow code files', async () => {
      const options = {
        language: 'typescript',
        quality: 'standard' as const,
        includeTests: false,
        includeDocumentation: false,
        includeExamples: false
      };

      const result = await generator.generateCode(sampleSpec, options);

      const workflowFiles = result.files.filter(f => f.type === 'main' && f.path.includes('workflows'));
      expect(workflowFiles.length).toBe(1);
      expect(workflowFiles[0].path).toBe('src/workflows/development-workflow.ts');
      expect(workflowFiles[0].content).toContain('export class DevelopmentWorkflow');
    });

    it('should generate test files when requested', async () => {
      const options = {
        language: 'typescript',
        quality: 'standard' as const,
        includeTests: true,
        includeDocumentation: false,
        includeExamples: false
      };

      const result = await generator.generateCode(sampleSpec, options);

      const testFiles = result.files.filter(f => f.type === 'test');
      expect(testFiles.length).toBe(1);
      expect(testFiles[0].path).toBe('tests/tools/code_generator.test.ts');
      expect(testFiles[0].content).toContain('describe(\'CodeGenerator\'');
    });

    it('should generate documentation when requested', async () => {
      const options = {
        language: 'typescript',
        quality: 'standard' as const,
        includeTests: false,
        includeDocumentation: true,
        includeExamples: false
      };

      const result = await generator.generateCode(sampleSpec, options);

      const docFiles = result.files.filter(f => f.type === 'documentation');
      expect(docFiles.length).toBe(1);
      expect(docFiles[0].path).toBe('README.md');
      expect(docFiles[0].content).toContain('# Test Agent');
    });

    it('should generate example files when requested', async () => {
      const options = {
        language: 'typescript',
        quality: 'standard' as const,
        includeTests: false,
        includeDocumentation: false,
        includeExamples: true
      };

      const result = await generator.generateCode(sampleSpec, options);

      const exampleFiles = result.files.filter(f => f.type === 'example');
      expect(exampleFiles.length).toBe(1);
      expect(exampleFiles[0].path).toBe('examples/generate-a-simple-function.ts');
      expect(exampleFiles[0].content).toContain('// Example: Generate a simple function');
    });

    it('should include metrics in metadata', async () => {
      const options = {
        language: 'typescript',
        quality: 'standard' as const,
        includeTests: true,
        includeDocumentation: true,
        includeExamples: true
      };

      const result = await generator.generateCode(sampleSpec, options);

      expect(result.metadata.metrics).toBeDefined();
      expect(result.metadata.metrics.linesOfCode).toBeGreaterThan(0);
      expect(result.metadata.metrics.complexity).toBeGreaterThan(0);
      expect(result.metadata.metrics.maintainability).toBeGreaterThan(0);
    });

    it('should handle different languages', async () => {
      const options = {
        language: 'javascript',
        quality: 'standard' as const,
        includeTests: false,
        includeDocumentation: false,
        includeExamples: false
      };

      const result = await generator.generateCode(sampleSpec, options);

      const toolFiles = result.files.filter(f => f.type === 'main' && f.path.includes('tools'));
      expect(toolFiles[0].path).toBe('src/tools/code_generator.js');
    });

    it('should handle different quality levels', async () => {
      const options = {
        language: 'typescript',
        quality: 'enterprise' as const,
        includeTests: true,
        includeDocumentation: true,
        includeExamples: true
      };

      const result = await generator.generateCode(sampleSpec, options);

      expect(result.metadata.quality).toBe('enterprise');
    });
  });

  describe('generateToolCode', () => {
    it('should generate valid TypeScript code for a tool', async () => {
      const tool = sampleSpec.tools[0];
      const options = {
        language: 'typescript',
        quality: 'standard' as const,
        includeTests: false,
        includeDocumentation: false,
        includeExamples: false
      };

      const code = await generator['generateToolCode'](tool, options);

      expect(code).toContain('export class CodeGenerator');
      expect(code).toContain('async codeGenerator(');
      expect(code).toContain('language: string');
      expect(code).toContain('framework?: string');
      expect(code).toContain('throw new Error(\'language is required\')');
      expect(code).toContain('this.logger.info');
      expect(code).toContain('this.recordMetric');
    });
  });

  describe('generateWorkflowCode', () => {
    it('should generate valid TypeScript code for a workflow', async () => {
      const workflow = sampleSpec.workflows[0];
      const options = {
        language: 'typescript',
        quality: 'standard' as const,
        includeTests: false,
        includeDocumentation: false,
        includeExamples: false
      };

      const code = await generator['generateWorkflowCode'](workflow, options);

      expect(code).toContain('export class DevelopmentWorkflow');
      expect(code).toContain('async execute()');
      expect(code).toContain('await this.analyzeRequirements()');
      expect(code).toContain('await this.generateCode()');
      expect(code).toContain('await this.runTests()');
      expect(code).toContain('this.eventEmitter.emit');
    });
  });

  describe('generateTestCode', () => {
    it('should generate valid test code for a tool', async () => {
      const tool = sampleSpec.tools[0];
      const options = {
        language: 'typescript',
        quality: 'standard' as const,
        includeTests: false,
        includeDocumentation: false,
        includeExamples: false
      };

      const code = await generator['generateTestCode'](tool, options);

      expect(code).toContain('describe(\'CodeGenerator\'');
      expect(code).toContain('it(\'should execute successfully with valid parameters\'');
      expect(code).toContain('expect(result.success).toBe(true)');
      expect(code).toContain('it(\'should throw error when language is missing\'');
    });
  });

  describe('utility methods', () => {
    it('should convert names to PascalCase', () => {
      expect(generator['toPascalCase']('code_generator')).toBe('CodeGenerator');
      expect(generator['toPascalCase']('test-tool')).toBe('TestTool');
    });

    it('should convert names to camelCase', () => {
      expect(generator['toCamelCase']('code_generator')).toBe('codeGenerator');
      expect(generator['toCamelCase']('test-tool')).toBe('testTool');
    });

    it('should get correct file extensions', () => {
      expect(generator['getFileExtension']('typescript')).toBe('ts');
      expect(generator['getFileExtension']('javascript')).toBe('js');
      expect(generator['getFileExtension']('python')).toBe('py');
    });

    it('should map types correctly', () => {
      expect(generator['mapType']('string')).toBe('string');
      expect(generator['mapType']('number')).toBe('number');
      expect(generator['mapType']('boolean')).toBe('boolean');
      expect(generator['mapType']('array')).toBe('any[]');
      expect(generator['mapType']('object')).toBe('Record<string, any>');
    });
  });
});
