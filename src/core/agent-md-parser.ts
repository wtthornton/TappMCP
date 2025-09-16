/**
 * AGENT.md Parser and Generator
 * Handles parsing and generation of AGENT.md specification files
 */

import * as fs from 'fs';
import * as path from 'path';

export interface AgentSpecification {
  name: string;
  description: string;
  capabilities: string[];
  tools: AgentTool[];
  workflows: AgentWorkflow[];
  constraints: string[];
  examples: AgentExample[];
  metadata: {
    version: string;
    created: string;
    updated: string;
    author: string;
  };
}

export interface AgentTool {
  name: string;
  description: string;
  parameters: AgentParameter[];
  examples: string[];
}

export interface AgentParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  default?: any;
}

export interface AgentWorkflow {
  name: string;
  description: string;
  steps: string[];
  triggers: string[];
  outcomes: string[];
}

export interface AgentExample {
  scenario: string;
  input: string;
  output: string;
  explanation: string;
}

export class AgentMDParser {
  /**
   * Parse AGENT.md file content
   */
  parseAgentMD(content: string): AgentSpecification {
    const lines = content.split('\n');
    const spec: AgentSpecification = {
      name: '',
      description: '',
      capabilities: [],
      tools: [],
      workflows: [],
      constraints: [],
      examples: [],
      metadata: {
        version: '1.0.0',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        author: 'TappMCP'
      }
    };

    let currentSection = '';
    let currentTool: AgentTool | null = null;
    let currentWorkflow: AgentWorkflow | null = null;
    let currentExample: AgentExample | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('# ')) {
        currentSection = 'name';
        spec.name = line.substring(2).trim();
        // Set description section as next section to capture description after title
        currentSection = 'description';
      } else if (line.startsWith('## ')) {
        const section = line.substring(3).toLowerCase();
        currentSection = section;

        if (section.includes('description')) {
          // Reset description for new section
          spec.description = '';
        } else if (section.includes('tool')) {
          if (currentTool) {
            spec.tools.push(currentTool);
          }
          currentTool = {
            name: '',
            description: '',
            parameters: [],
            examples: []
          };
        } else if (section.includes('workflow')) {
          if (currentWorkflow) {
            spec.workflows.push(currentWorkflow);
          }
          currentWorkflow = {
            name: '',
            description: '',
            steps: [],
            triggers: [],
            outcomes: []
          };
        } else if (section.includes('example')) {
          if (currentExample) {
            spec.examples.push(currentExample);
          }
          currentExample = {
            scenario: '',
            input: '',
            output: '',
            explanation: ''
          };
        }
      } else if (line.startsWith('### ')) {
        const subsection = line.substring(4).toLowerCase();

        if (currentTool && subsection.includes('parameter')) {
          // Handle tool parameters
          const paramLine = lines[i + 1];
          if (paramLine) {
            const param = this.parseParameter(paramLine);
            if (param) {
              currentTool.parameters.push(param);
            }
          }
        } else if (currentSection === 'tools' && currentTool) {
          // Handle tool name (e.g., ### code_generator)
          // First push the previous tool if it exists and has content
          if (currentTool.name || currentTool.description) {
            spec.tools.push(currentTool);
          }
          // Create new tool
          currentTool = {
            name: line.substring(4).trim(),
            description: '',
            parameters: [],
            examples: []
          };
        }
      } else if (line.startsWith('- ')) {
        const item = line.substring(2).trim();

        switch (currentSection) {
          case 'capabilities':
            spec.capabilities.push(item);
            break;
          case 'constraints':
            spec.constraints.push(item);
            break;
          case 'tools':
            if (currentTool) {
              currentTool.examples.push(item);
            }
            break;
          case 'workflows':
            if (currentWorkflow) {
              if (item.startsWith('Step:')) {
                currentWorkflow.steps.push(item.substring(5).trim());
              } else if (item.startsWith('Trigger:')) {
                currentWorkflow.triggers.push(item.substring(8).trim());
              } else if (item.startsWith('Outcome:')) {
                currentWorkflow.outcomes.push(item.substring(8).trim());
              }
            }
            break;
        }
      } else if (line && !line.startsWith('#')) {
        // Regular content
        switch (currentSection) {
          case 'description':
            if (spec.description) {
              spec.description += ' ' + line;
            } else {
              spec.description = line;
            }
            break;
          case 'tools':
            if (currentTool && !currentTool.name) {
              currentTool.name = line;
            } else if (currentTool && currentTool.name && !currentTool.description) {
              currentTool.description = line;
            }
            break;
          case 'workflows':
            if (currentWorkflow && !currentWorkflow.name) {
              currentWorkflow.name = line;
            } else if (currentWorkflow && !currentWorkflow.description) {
              currentWorkflow.description = line;
            }
            break;
          case 'examples':
            if (currentExample) {
              if (line.startsWith('Scenario:')) {
                currentExample.scenario = line.substring(9).trim();
              } else if (line.startsWith('Input:')) {
                currentExample.input = line.substring(6).trim();
              } else if (line.startsWith('Output:')) {
                currentExample.output = line.substring(7).trim();
              } else if (line.startsWith('Explanation:')) {
                currentExample.explanation = line.substring(12).trim();
              }
            }
            break;
        }
      }
    }

    // Clean up description
    spec.description = spec.description.trim();

    // Add final tools and workflows
    if (currentTool) {
      spec.tools.push(currentTool);
    }
    if (currentWorkflow) {
      spec.workflows.push(currentWorkflow);
    }
    if (currentExample) {
      spec.examples.push(currentExample);
    }

    return spec;
  }

  /**
   * Parse parameter line
   */
  private parseParameter(line: string): AgentParameter | null {
    // Format: - name (type): description [required/default]
    const match = line.match(/^- (.+?) \((.+?)\): (.+?)( \[(.+?)\])?$/);
    if (!match) return null;

    const name = match[1].trim();
    const type = match[2].trim();
    const description = match[3].trim();
    const required = !match[5] || match[5].includes('required');
    const defaultValue = match[5]?.includes('default') ? match[5].split('=')[1] : undefined;

    return {
      name,
      type,
      required,
      description,
      default: defaultValue
    };
  }

  /**
   * Generate AGENT.md content from specification
   */
  generateAgentMD(spec: AgentSpecification): string {
    let content = `# ${spec.name}\n\n`;

    if (spec.description) {
      content += `${spec.description}\n\n`;
    }

    // Capabilities
    if (spec.capabilities.length > 0) {
      content += `## Capabilities\n\n`;
      spec.capabilities.forEach(cap => {
        content += `- ${cap}\n`;
      });
      content += '\n';
    }

    // Tools
    if (spec.tools.length > 0) {
      content += `## Tools\n\n`;
      spec.tools.forEach(tool => {
        content += `### ${tool.name}\n\n`;
        content += `${tool.description}\n\n`;

        if (tool.parameters.length > 0) {
          content += `#### Parameters\n\n`;
          tool.parameters.forEach(param => {
            const required = param.required ? ' [required]' : '';
            const defaultValue = param.default ? ` [default: ${param.default}]` : '';
            content += `- ${param.name} (${param.type}): ${param.description}${required}${defaultValue}\n`;
          });
          content += '\n';
        }

        if (tool.examples.length > 0) {
          content += `#### Examples\n\n`;
          tool.examples.forEach(example => {
            content += `- ${example}\n`;
          });
          content += '\n';
        }
      });
    }

    // Workflows
    if (spec.workflows.length > 0) {
      content += `## Workflows\n\n`;
      spec.workflows.forEach(workflow => {
        content += `### ${workflow.name}\n\n`;
        content += `${workflow.description}\n\n`;

        if (workflow.triggers.length > 0) {
          content += `#### Triggers\n\n`;
          workflow.triggers.forEach(trigger => {
            content += `- Trigger: ${trigger}\n`;
          });
          content += '\n';
        }

        if (workflow.steps.length > 0) {
          content += `#### Steps\n\n`;
          workflow.steps.forEach(step => {
            content += `- Step: ${step}\n`;
          });
          content += '\n';
        }

        if (workflow.outcomes.length > 0) {
          content += `#### Outcomes\n\n`;
          workflow.outcomes.forEach(outcome => {
            content += `- Outcome: ${outcome}\n`;
          });
          content += '\n';
        }
      });
    }

    // Constraints
    if (spec.constraints.length > 0) {
      content += `## Constraints\n\n`;
      spec.constraints.forEach(constraint => {
        content += `- ${constraint}\n`;
      });
      content += '\n';
    }

    // Examples
    if (spec.examples.length > 0) {
      content += `## Examples\n\n`;
      spec.examples.forEach((example, index) => {
        content += `### Example ${index + 1}\n\n`;
        content += `**Scenario:** ${example.scenario}\n\n`;
        content += `**Input:** ${example.input}\n\n`;
        content += `**Output:** ${example.output}\n\n`;
        content += `**Explanation:** ${example.explanation}\n\n`;
      });
    }

    // Metadata
    content += `## Metadata\n\n`;
    content += `- Version: ${spec.metadata.version}\n`;
    content += `- Created: ${spec.metadata.created}\n`;
    content += `- Updated: ${spec.metadata.updated}\n`;
    content += `- Author: ${spec.metadata.author}\n`;

    return content;
  }

  /**
   * Parse AGENT.md file from filesystem
   */
  async parseAgentMDFile(filePath: string): Promise<AgentSpecification> {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return this.parseAgentMD(content);
    } catch (error) {
      console.error('Error parsing AGENT.md file:', error);
      throw new Error(`Failed to parse AGENT.md file: ${filePath}`);
    }
  }

  /**
   * Generate AGENT.md file to filesystem
   */
  async generateAgentMDFile(spec: AgentSpecification, filePath: string): Promise<void> {
    try {
      const content = this.generateAgentMD(spec);
      fs.writeFileSync(filePath, content, 'utf8');
    } catch (error) {
      console.error('Error generating AGENT.md file:', error);
      throw new Error(`Failed to generate AGENT.md file: ${filePath}`);
    }
  }

  /**
   * Validate AGENT.md specification with comprehensive rules
   */
  validateSpecification(spec: AgentSpecification): {
    valid: boolean;
    errors: string[];
    warnings: string[];
    score: number;
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Basic required fields validation
    if (!spec.name || spec.name.trim().length === 0) {
      errors.push('Name is required and cannot be empty');
      score -= 20;
    } else if (spec.name.length < 3) {
      warnings.push('Name should be at least 3 characters long');
      score -= 5;
    }

    if (!spec.description || spec.description.trim().length === 0) {
      errors.push('Description is required and cannot be empty');
      score -= 20;
    } else if (spec.description.length < 20) {
      warnings.push('Description should be at least 20 characters long for clarity');
      score -= 5;
    } else if (spec.description.length > 500) {
      warnings.push('Description should be concise (under 500 characters)');
      score -= 2;
    }

    // Capabilities validation
    if (spec.capabilities.length === 0) {
      errors.push('At least one capability is required');
      score -= 15;
    } else {
      spec.capabilities.forEach((capability, index) => {
        if (!capability || capability.trim().length === 0) {
          errors.push(`Capability ${index + 1}: Cannot be empty`);
          score -= 5;
        } else if (capability.length < 5) {
          warnings.push(`Capability ${index + 1}: Should be more descriptive (at least 5 characters)`);
          score -= 2;
        }
      });
    }

    // Tools validation
    if (spec.tools.length === 0) {
      errors.push('At least one tool is required');
      score -= 15;
    } else {
      spec.tools.forEach((tool, index) => {
        if (!tool.name || tool.name.trim().length === 0) {
          errors.push(`Tool ${index + 1}: Name is required`);
          score -= 10;
        } else if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(tool.name)) {
          errors.push(`Tool ${index + 1}: Name must start with a letter and contain only alphanumeric characters, hyphens, and underscores`);
          score -= 5;
        }

        if (!tool.description || tool.description.trim().length === 0) {
          errors.push(`Tool ${index + 1}: Description is required`);
          score -= 10;
        } else if (tool.description.length < 10) {
          warnings.push(`Tool ${index + 1}: Description should be more detailed (at least 10 characters)`);
          score -= 3;
        }

        // Validate parameters
        tool.parameters.forEach((param, paramIndex) => {
          if (!param.name || param.name.trim().length === 0) {
            errors.push(`Tool ${index + 1}, Parameter ${paramIndex + 1}: Name is required`);
            score -= 5;
          }
          if (!param.type || param.type.trim().length === 0) {
            errors.push(`Tool ${index + 1}, Parameter ${paramIndex + 1}: Type is required`);
            score -= 5;
          }
          if (!param.description || param.description.trim().length === 0) {
            warnings.push(`Tool ${index + 1}, Parameter ${paramIndex + 1}: Description is recommended`);
            score -= 2;
          }
        });
      });
    }

    // Workflows validation
    spec.workflows.forEach((workflow, index) => {
      if (!workflow.name || workflow.name.trim().length === 0) {
        errors.push(`Workflow ${index + 1}: Name is required`);
        score -= 10;
      } else if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(workflow.name)) {
        errors.push(`Workflow ${index + 1}: Name must start with a letter and contain only alphanumeric characters, hyphens, and underscores`);
        score -= 5;
      }

      if (!workflow.description || workflow.description.trim().length === 0) {
        errors.push(`Workflow ${index + 1}: Description is required`);
        score -= 10;
      } else if (workflow.description.length < 10) {
        warnings.push(`Workflow ${index + 1}: Description should be more detailed (at least 10 characters)`);
        score -= 3;
      }

      if (workflow.steps.length === 0) {
        errors.push(`Workflow ${index + 1}: At least one step is required`);
        score -= 10;
      } else {
        workflow.steps.forEach((step, stepIndex) => {
          if (!step || step.trim().length === 0) {
            errors.push(`Workflow ${index + 1}, Step ${stepIndex + 1}: Cannot be empty`);
            score -= 5;
          } else if (step.length < 5) {
            warnings.push(`Workflow ${index + 1}, Step ${stepIndex + 1}: Should be more descriptive (at least 5 characters)`);
            score -= 2;
          }
        });
      }

      if (workflow.triggers.length === 0) {
        warnings.push(`Workflow ${index + 1}: Triggers are recommended for better clarity`);
        score -= 3;
      }

      if (workflow.outcomes.length === 0) {
        warnings.push(`Workflow ${index + 1}: Outcomes are recommended for better clarity`);
        score -= 3;
      }
    });

    // Examples validation
    spec.examples.forEach((example, index) => {
      if (!example.scenario || example.scenario.trim().length === 0) {
        warnings.push(`Example ${index + 1}: Scenario is recommended`);
        score -= 2;
      }
      if (!example.input || example.input.trim().length === 0) {
        warnings.push(`Example ${index + 1}: Input is recommended`);
        score -= 2;
      }
      if (!example.output || example.output.trim().length === 0) {
        warnings.push(`Example ${index + 1}: Output is recommended`);
        score -= 2;
      }
    });

    // Constraints validation
    if (spec.constraints.length === 0) {
      warnings.push('Constraints are recommended to define limitations and boundaries');
      score -= 5;
    } else {
      spec.constraints.forEach((constraint, index) => {
        if (!constraint || constraint.trim().length === 0) {
          warnings.push(`Constraint ${index + 1}: Cannot be empty`);
          score -= 2;
        } else if (constraint.length < 10) {
          warnings.push(`Constraint ${index + 1}: Should be more descriptive (at least 10 characters)`);
          score -= 1;
        }
      });
    }

    // Version validation
    if (!spec.metadata.version || spec.metadata.version.trim().length === 0) {
      warnings.push('Version is recommended for tracking changes');
      score -= 3;
    } else if (!/^\d+\.\d+(\.\d+)?$/.test(spec.metadata.version)) {
      warnings.push('Version should follow semantic versioning (e.g., 1.0.0 or 1.0)');
      score -= 2;
    }

    // Overall quality checks
    if (spec.tools.length > 10) {
      warnings.push('Consider limiting tools to 10 or fewer for better usability');
      score -= 2;
    }

    if (spec.workflows.length > 5) {
      warnings.push('Consider limiting workflows to 5 or fewer for better clarity');
      score -= 2;
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      score
    };
  }

  /**
   * Generate AGENT.md from natural language description
   */
  generateFromDescription(description: string, context?: any): AgentSpecification {
    // Handle empty description
    if (!description || description.trim().length === 0) {
      return {
        name: '',
        description: '',
        capabilities: ['General development assistance'],
        tools: [],
        workflows: [],
        constraints: [],
        examples: [],
        metadata: {
          version: '1.0.0',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          author: 'TappMCP'
        }
      };
    }

    // Simple template-based generation
    const spec: AgentSpecification = {
      name: this.extractName(description),
      description: description,
      capabilities: this.extractCapabilities(description),
      tools: this.generateTools(description),
      workflows: this.generateWorkflows(description),
      constraints: this.extractConstraints(description),
      examples: this.generateExamples(description),
      metadata: {
        version: '1.0.0',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        author: 'TappMCP'
      }
    };

    return spec;
  }

  private extractName(description: string): string {
    // Extract name from description
    if (!description || description.trim().length === 0) {
      return '';
    }
    const words = description.split(' ');
    const name = words.slice(0, 3).join(' ').replace(/[^a-zA-Z0-9\s]/g, '');
    return name || 'Development Agent';
  }

  private extractCapabilities(description: string): string[] {
    const capabilities: string[] = [];

    if (description.toLowerCase().includes('code')) {
      capabilities.push('Code generation and analysis');
    }
    if (description.toLowerCase().includes('test')) {
      capabilities.push('Test generation and execution');
    }
    if (description.toLowerCase().includes('debug')) {
      capabilities.push('Debugging and error analysis');
    }
    if (description.toLowerCase().includes('document')) {
      capabilities.push('Documentation generation');
    }
    if (description.toLowerCase().includes('deploy')) {
      capabilities.push('Deployment and DevOps');
    }

    return capabilities.length > 0 ? capabilities : ['General development assistance'];
  }

  private generateTools(description: string): AgentTool[] {
    const tools: AgentTool[] = [];

    // Default tools based on description
    tools.push({
      name: 'code_generator',
      description: 'Generate code based on requirements',
      parameters: [
        { name: 'language', type: 'string', required: true, description: 'Programming language' },
        { name: 'framework', type: 'string', required: false, description: 'Framework or library' },
        { name: 'requirements', type: 'string', required: true, description: 'Code requirements' }
      ],
      examples: ['Generate a React component for user authentication']
    });

    if (description.toLowerCase().includes('test')) {
      tools.push({
        name: 'test_generator',
        description: 'Generate tests for code',
        parameters: [
          { name: 'code', type: 'string', required: true, description: 'Code to test' },
          { name: 'test_type', type: 'string', required: false, description: 'Type of test (unit, integration, e2e)' }
        ],
        examples: ['Generate unit tests for a React component']
      });
    }

    return tools;
  }

  private generateWorkflows(description: string): AgentWorkflow[] {
    const workflows: AgentWorkflow[] = [];

    workflows.push({
      name: 'Development Workflow',
      description: 'Standard development process',
      steps: [
        'Analyze requirements',
        'Generate code',
        'Create tests',
        'Review and validate',
        'Document changes'
      ],
      triggers: ['User request for code generation'],
      outcomes: ['Working code with tests and documentation']
    });

    return workflows;
  }

  private extractConstraints(description: string): string[] {
    const constraints: string[] = [];

    if (description.toLowerCase().includes('security')) {
      constraints.push('Must follow security best practices');
    }
    if (description.toLowerCase().includes('performance')) {
      constraints.push('Must optimize for performance');
    }
    if (description.toLowerCase().includes('accessibility')) {
      constraints.push('Must be accessible');
    }

    return constraints;
  }

  private generateExamples(description: string): AgentExample[] {
    return [
      {
        scenario: 'Basic code generation',
        input: 'Create a simple function',
        output: 'Generated function with proper structure',
        explanation: 'The agent generates code following best practices'
      }
    ];
  }
}

export default AgentMDParser;
