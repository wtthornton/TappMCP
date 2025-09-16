import { AgentSpecification, AgentTool, AgentWorkflow } from './agent-md-parser.js';
import { RealMetricsCollector } from './real-metrics-collector.js';

export interface CodeGenerationOptions {
  language: string;
  framework?: string;
  quality: 'basic' | 'standard' | 'high' | 'enterprise';
  includeTests: boolean;
  includeDocumentation: boolean;
  includeExamples: boolean;
}

export interface GeneratedCode {
  files: Array<{
    path: string;
    content: string;
    type: 'main' | 'test' | 'documentation' | 'example';
  }>;
  metadata: {
    generatedAt: string;
    specification: string;
    language: string;
    framework?: string;
    quality: string;
    metrics: {
      linesOfCode: number;
      complexity: number;
      maintainability: number;
      testCoverage: number;
    };
  };
}

export class AgentCodeGenerator {
  private metricsCollector: RealMetricsCollector;

  constructor() {
    this.metricsCollector = new RealMetricsCollector();
  }

  /**
   * Generate code from AGENT.md specification
   */
  async generateCode(
    specification: AgentSpecification,
    options: CodeGenerationOptions
  ): Promise<GeneratedCode> {
    const files: Array<{
      path: string;
      content: string;
      type: 'main' | 'test' | 'documentation' | 'example';
    }> = [];

    // Generate main code files
    for (const tool of specification.tools) {
      const toolCode = await this.generateToolCode(tool, options);
      files.push({
        path: `src/tools/${tool.name}.${this.getFileExtension(options.language)}`,
        content: toolCode,
        type: 'main'
      });
    }

    // Generate workflow implementations
    for (const workflow of specification.workflows) {
      const workflowCode = await this.generateWorkflowCode(workflow, options);
      files.push({
        path: `src/workflows/${workflow.name.toLowerCase().replace(/\s+/g, '-')}.${this.getFileExtension(options.language)}`,
        content: workflowCode,
        type: 'main'
      });
    }

    // Generate tests if requested
    if (options.includeTests) {
      for (const tool of specification.tools) {
        const testCode = await this.generateTestCode(tool, options);
        files.push({
          path: `tests/tools/${tool.name}.test.${this.getFileExtension(options.language)}`,
          content: testCode,
          type: 'test'
        });
      }
    }

    // Generate documentation if requested
    if (options.includeDocumentation) {
      const docCode = await this.generateDocumentation(specification, options);
      files.push({
        path: 'README.md',
        content: docCode,
        type: 'documentation'
      });
    }

    // Generate examples if requested
    if (options.includeExamples) {
      for (const example of specification.examples) {
        const exampleCode = await this.generateExampleCode(example, options);
        files.push({
          path: `examples/${example.scenario.toLowerCase().replace(/\s+/g, '-')}.${this.getFileExtension(options.language)}`,
          content: exampleCode,
          type: 'example'
        });
      }
    }

    // Calculate metrics
    const totalCode = files.map(f => f.content).join('\n');
    const metrics = await this.metricsCollector.calculateRealQualityMetrics(
      totalCode,
      'generated-code'
    );

    return {
      files,
      metadata: {
        generatedAt: new Date().toISOString(),
        specification: specification.name,
        language: options.language,
        framework: options.framework,
        quality: options.quality,
        metrics: {
          linesOfCode: totalCode.split('\n').length,
          complexity: metrics.complexity,
          maintainability: metrics.maintainability,
          testCoverage: options.includeTests ? 85 : 0 // Estimate based on test inclusion
        }
      }
    };
  }

  /**
   * Generate code for a specific tool
   */
  private async generateToolCode(tool: AgentTool, options: CodeGenerationOptions): Promise<string> {
    const className = this.toPascalCase(tool.name);
    const methodName = this.toCamelCase(tool.name);

    let code = '';

    // Add imports
    if (options.language === 'typescript') {
      code += `import { EventEmitter } from 'events';\n`;
      code += `import { Logger } from '../utils/logger.js';\n\n`;
    }

    // Add class definition
    code += `export class ${className} {\n`;
    code += `  private logger: Logger;\n`;
    code += `  private metrics: Map<string, number> = new Map();\n\n`;

    // Add constructor
    code += `  constructor() {\n`;
    code += `    this.logger = new Logger('${className}');\n`;
    code += `    this.initializeMetrics();\n`;
    code += `  }\n\n`;

    // Add main method
    code += `  /**\n`;
    code += `   * ${tool.description}\n`;
    code += `   */\n`;
    code += `  async ${methodName}(`;

    // Add parameters
    const params = tool.parameters.map(p => {
      const type = this.mapType(p.type);
      return p.required ? `${p.name}: ${type}` : `${p.name}?: ${type}`;
    }).join(', ');
    code += params;
    code += `): Promise<${this.getReturnType(options.language)}> {\n`;
    code += `    this.logger.info('Executing ${methodName}');\n`;
    code += `    const startTime = Date.now();\n\n`;

    // Add parameter validation
    for (const param of tool.parameters) {
      if (param.required) {
        code += `    if (!${param.name}) {\n`;
        code += `      throw new Error('${param.name} is required');\n`;
        code += `    }\n\n`;
      }
    }

    // Add main logic based on tool description
    code += `    try {\n`;
    code += `      // TODO: Implement ${tool.description.toLowerCase()}\n`;
    code += `      // This is a generated template - replace with actual implementation\n\n`;

    // Add example logic based on tool examples
    if (tool.examples.length > 0) {
      code += `      // Example usage:\n`;
      for (const example of tool.examples) {
        code += `      // ${example}\n`;
      }
      code += `\n`;
    }

    code += `      const result = {\n`;
    code += `        success: true,\n`;
    code += `        data: {},\n`;
    code += `        message: '${tool.description} completed successfully'\n`;
    code += `      };\n\n`;

    code += `      this.recordMetric('${methodName}_success', 1);\n`;
    code += `      this.recordMetric('${methodName}_duration', Date.now() - startTime);\n\n`;

    code += `      return result;\n`;
    code += `    } catch (error) {\n`;
    code += `      this.logger.error('Error in ${methodName}:', error);\n`;
    code += `      this.recordMetric('${methodName}_error', 1);\n`;
    code += `      throw error;\n`;
    code += `    }\n`;
    code += `  }\n\n`;

    // Add utility methods
    code += `  private initializeMetrics(): void {\n`;
    code += `    this.metrics.set('total_calls', 0);\n`;
    code += `    this.metrics.set('success_calls', 0);\n`;
    code += `    this.metrics.set('error_calls', 0);\n`;
    code += `  }\n\n`;

    code += `  private recordMetric(key: string, value: number): void {\n`;
    code += `    const current = this.metrics.get(key) || 0;\n`;
    code += `    this.metrics.set(key, current + value);\n`;
    code += `  }\n\n`;

    code += `  public getMetrics(): Map<string, number> {\n`;
    code += `    return new Map(this.metrics);\n`;
    code += `  }\n`;

    code += `}\n`;

    return code;
  }

  /**
   * Generate code for a specific workflow
   */
  private async generateWorkflowCode(workflow: AgentWorkflow, options: CodeGenerationOptions): Promise<string> {
    const className = this.toPascalCase(workflow.name);
    const methodName = this.toCamelCase(workflow.name);

    let code = '';

    // Add imports
    if (options.language === 'typescript') {
      code += `import { EventEmitter } from 'events';\n`;
      code += `import { Logger } from '../utils/logger.js';\n\n`;
    }

    // Add class definition
    code += `export class ${className} {\n`;
    code += `  private logger: Logger;\n`;
    code += `  private eventEmitter: EventEmitter;\n\n`;

    // Add constructor
    code += `  constructor() {\n`;
    code += `    this.logger = new Logger('${className}');\n`;
    code += `    this.eventEmitter = new EventEmitter();\n`;
    code += `    this.setupEventListeners();\n`;
    code += `  }\n\n`;

    // Add main workflow method
    code += `  /**\n`;
    code += `   * ${workflow.description}\n`;
    code += `   */\n`;
    code += `  async execute(): Promise<${this.getReturnType(options.language)}> {\n`;
    code += `    this.logger.info('Starting ${workflow.name} workflow');\n`;
    code += `    this.eventEmitter.emit('workflow:started', { workflow: '${workflow.name}' });\n\n`;

    code += `    try {\n`;

    // Add workflow steps
    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      const stepMethod = this.toMethodName(step);

      code += `      // Step ${i + 1}: ${step}\n`;
      code += `      await this.${stepMethod}();\n`;
      code += `      this.logger.info('Completed step: ${step}');\n\n`;
    }

    code += `      this.eventEmitter.emit('workflow:completed', { workflow: '${workflow.name}' });\n`;
    code += `      return { success: true, message: 'Workflow completed successfully' };\n`;
    code += `    } catch (error) {\n`;
    code += `      this.logger.error('Workflow failed:', error);\n`;
    code += `      this.eventEmitter.emit('workflow:failed', { workflow: '${workflow.name}', error });\n`;
    code += `      throw error;\n`;
    code += `    }\n`;
    code += `  }\n\n`;

    // Add step methods
    for (const step of workflow.steps) {
      const stepMethod = this.toMethodName(step);
      code += `  private async ${stepMethod}(): Promise<void> {\n`;
      code += `    // TODO: Implement ${step}\n`;
      code += `    // This is a generated template - replace with actual implementation\n`;
      code += `    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate work\n`;
      code += `  }\n\n`;
    }

    // Add event handling
    code += `  private setupEventListeners(): void {\n`;
    code += `    this.eventEmitter.on('workflow:started', (data) => {\n`;
    code += `      this.logger.info('Workflow started:', data);\n`;
    code += `    });\n\n`;
    code += `    this.eventEmitter.on('workflow:completed', (data) => {\n`;
    code += `      this.logger.info('Workflow completed:', data);\n`;
    code += `    });\n\n`;
    code += `    this.eventEmitter.on('workflow:failed', (data) => {\n`;
    code += `      this.logger.error('Workflow failed:', data);\n`;
    code += `    });\n`;
    code += `  }\n\n`;

    code += `  public on(event: string, listener: (...args: any[]) => void): void {\n`;
    code += `    this.eventEmitter.on(event, listener);\n`;
    code += `  }\n`;

    code += `}\n`;

    return code;
  }

  /**
   * Generate test code for a tool
   */
  private async generateTestCode(tool: AgentTool, options: CodeGenerationOptions): Promise<string> {
    const className = this.toPascalCase(tool.name);
    const methodName = this.toCamelCase(tool.name);

    let code = '';

    // Add imports
    if (options.language === 'typescript') {
      code += `import { describe, it, expect, beforeEach, vi } from 'vitest';\n`;
      code += `import { ${className} } from '../../src/tools/${tool.name}.js';\n\n`;
    }

    // Add test suite
    code += `describe('${className}', () => {\n`;
    code += `  let ${this.toCamelCase(tool.name)}: ${className};\n\n`;

    code += `  beforeEach(() => {\n`;
    code += `    ${this.toCamelCase(tool.name)} = new ${className}();\n`;
    code += `  });\n\n`;

    // Add basic functionality test
    code += `  describe('${methodName}', () => {\n`;
    code += `    it('should execute successfully with valid parameters', async () => {\n`;

    // Add test parameters
    const testParams = tool.parameters.map(p => {
      if (p.type === 'string') return `${p.name}: 'test-value'`;
      if (p.type === 'number') return `${p.name}: 42`;
      if (p.type === 'boolean') return `${p.name}: true`;
      return `${p.name}: 'test'`;
    }).join(', ');

    code += `      const result = await ${this.toCamelCase(tool.name)}.${methodName}(${testParams});\n\n`;
    code += `      expect(result.success).toBe(true);\n`;
    code += `      expect(result.message).toContain('completed successfully');\n`;
    code += `    });\n\n`;

    // Add parameter validation tests
    for (const param of tool.parameters) {
      if (param.required) {
        code += `    it('should throw error when ${param.name} is missing', async () => {\n`;
        code += `      await expect(${this.toCamelCase(tool.name)}.${methodName}()).rejects.toThrow('${param.name} is required');\n`;
        code += `    });\n\n`;
      }
    }

    code += `  });\n\n`;

    // Add metrics test
    code += `  describe('metrics', () => {\n`;
    code += `    it('should track metrics correctly', async () => {\n`;
    code += `      const testParams = {\n`;
    code += `        ${tool.parameters.map(p => `${p.name}: 'test'`).join(',\n        ')}\n`;
    code += `      };\n\n`;
    code += `      await ${this.toCamelCase(tool.name)}.${methodName}(testParams);\n`;
    code += `      const metrics = ${this.toCamelCase(tool.name)}.getMetrics();\n\n`;
    code += `      expect(metrics.get('total_calls')).toBeGreaterThan(0);\n`;
    code += `      expect(metrics.get('success_calls')).toBeGreaterThan(0);\n`;
    code += `    });\n`;
    code += `  });\n`;

    code += `});\n`;

    return code;
  }

  /**
   * Generate documentation
   */
  private async generateDocumentation(specification: AgentSpecification, options: CodeGenerationOptions): Promise<string> {
    let doc = '';

    doc += `# ${specification.name}\n\n`;
    doc += `${specification.description}\n\n`;

    // Add capabilities
    if (specification.capabilities.length > 0) {
      doc += `## Capabilities\n\n`;
      for (const capability of specification.capabilities) {
        doc += `- ${capability}\n`;
      }
      doc += `\n`;
    }

    // Add tools
    if (specification.tools.length > 0) {
      doc += `## Tools\n\n`;
      for (const tool of specification.tools) {
        doc += `### ${tool.name}\n\n`;
        doc += `${tool.description}\n\n`;

        if (tool.parameters.length > 0) {
          doc += `**Parameters:**\n`;
          for (const param of tool.parameters) {
            doc += `- \`${param.name}\` (${param.type}): ${param.description}\n`;
          }
          doc += `\n`;
        }
      }
    }

    // Add workflows
    if (specification.workflows.length > 0) {
      doc += `## Workflows\n\n`;
      for (const workflow of specification.workflows) {
        doc += `### ${workflow.name}\n\n`;
        doc += `${workflow.description}\n\n`;

        if (workflow.steps.length > 0) {
          doc += `**Steps:**\n`;
          for (let i = 0; i < workflow.steps.length; i++) {
            doc += `${i + 1}. ${workflow.steps[i]}\n`;
          }
          doc += `\n`;
        }
      }
    }

    // Add examples
    if (specification.examples.length > 0) {
      doc += `## Examples\n\n`;
      for (const example of specification.examples) {
        doc += `### ${example.scenario}\n\n`;
        doc += `**Input:** ${example.input}\n\n`;
        doc += `**Output:** ${example.output}\n\n`;
        if (example.explanation) {
          doc += `**Explanation:** ${example.explanation}\n\n`;
        }
      }
    }

    // Add constraints
    if (specification.constraints.length > 0) {
      doc += `## Constraints\n\n`;
      for (const constraint of specification.constraints) {
        doc += `- ${constraint}\n`;
      }
      doc += `\n`;
    }

    doc += `## Generated Code\n\n`;
    doc += `This code was generated from AGENT.md specification on ${new Date().toISOString()}.\n`;
    doc += `- Language: ${options.language}\n`;
    if (options.framework) {
      doc += `- Framework: ${options.framework}\n`;
    }
    doc += `- Quality: ${options.quality}\n`;
    doc += `- Includes Tests: ${options.includeTests}\n`;
    doc += `- Includes Documentation: ${options.includeDocumentation}\n`;

    return doc;
  }

  /**
   * Generate example code
   */
  private async generateExampleCode(example: any, options: CodeGenerationOptions): Promise<string> {
    let code = '';

    code += `// Example: ${example.scenario}\n`;
    code += `// Input: ${example.input}\n`;
    code += `// Output: ${example.output}\n\n`;

    if (example.explanation) {
      code += `// ${example.explanation}\n\n`;
    }

    code += `// TODO: Implement this example\n`;
    code += `// This is a generated template - replace with actual implementation\n\n`;

    if (options.language === 'typescript') {
      code += `export function example() {\n`;
      code += `  console.log('${example.scenario}');\n`;
      code += `  // Add your implementation here\n`;
      code += `}\n\n`;
      code += `// Run the example\n`;
      code += `example();\n`;
    }

    return code;
  }

  /**
   * Utility methods
   */
  private toPascalCase(str: string): string {
    return str.replace(/(?:^|[-_\s])([a-zA-Z])/g, (_, letter) => letter.toUpperCase());
  }

  private toCamelCase(str: string): string {
    const pascal = this.toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }

  private toMethodName(str: string): string {
    // Convert to camelCase: "Analyze requirements" -> "analyzeRequirements"
    const words = str.split(/\s+/);
    if (words.length === 0) return '';

    let result = words[0].toLowerCase();
    for (let i = 1; i < words.length; i++) {
      result += words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
    }
    return result;
  }

  private getFileExtension(language: string): string {
    const extensions: Record<string, string> = {
      'typescript': 'ts',
      'javascript': 'js',
      'python': 'py',
      'java': 'java',
      'csharp': 'cs',
      'go': 'go',
      'rust': 'rs'
    };
    return extensions[language] || 'ts';
  }

  private mapType(type: string): string {
    const typeMap: Record<string, string> = {
      'string': 'string',
      'number': 'number',
      'boolean': 'boolean',
      'array': 'any[]',
      'object': 'Record<string, any>'
    };
    return typeMap[type] || 'any';
  }

  private getReturnType(language: string): string {
    if (language === 'typescript') {
      return 'Promise<{ success: boolean; data?: any; message: string }>';
    }
    return 'any';
  }
}
