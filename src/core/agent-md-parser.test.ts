/**
 * Tests for AGENT.md Parser
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AgentMDParser } from './agent-md-parser';
import * as fs from 'fs';
import * as path from 'path';

describe('AgentMDParser', () => {
  let parser: AgentMDParser;
  const testDir = './test-agent-md';

  beforeEach(() => {
    parser = new AgentMDParser();
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('parseAgentMD', () => {
    it('should parse basic AGENT.md content', () => {
      const content = `# Test Agent

This is a test agent for development assistance.

## Capabilities

- Code generation
- Test creation
- Documentation

## Tools

### code_generator

Generate code based on requirements

#### Parameters

- language (string): Programming language [required]
- framework (string): Framework or library [default: none]

#### Examples

- Generate a React component
- Create a Python function

## Workflows

### Development Workflow

Standard development process

#### Triggers

- Trigger: User request for code generation

#### Steps

- Step: Analyze requirements
- Step: Generate code
- Step: Create tests

#### Outcomes

- Outcome: Working code with tests

## Constraints

- Must follow best practices
- Must be secure

## Examples

### Example 1

**Scenario:** Basic code generation
**Input:** Create a simple function
**Output:** Generated function with proper structure
**Explanation:** The agent generates code following best practices

## Metadata

- Version: 1.0.0
- Created: 2025-01-16T10:00:00Z
- Updated: 2025-01-16T10:00:00Z
- Author: TappMCP`;

      const spec = parser.parseAgentMD(content);

      expect(spec.name).toBe('Test Agent');
      expect(spec.description).toContain('test agent for development assistance');
      expect(spec.capabilities).toContain('Code generation');
      expect(spec.tools).toHaveLength(1);
      expect(spec.tools[0].name).toBe('code_generator');
      expect(spec.workflows).toHaveLength(1);
      expect(spec.constraints).toContain('Must follow best practices');
      expect(spec.examples).toHaveLength(1);
    });

    it('should handle empty content gracefully', () => {
      const spec = parser.parseAgentMD('');

      expect(spec.name).toBe('');
      expect(spec.description).toBe('');
      expect(spec.capabilities).toHaveLength(0);
      expect(spec.tools).toHaveLength(0);
    });

    it('should parse complex AGENT.md content', () => {
      const content = `# Advanced Development Agent

A comprehensive development assistant with multiple capabilities.

## Capabilities

- Code generation
- Test creation
- Documentation
- Debugging
- Performance optimization

## Tools

### code_generator

Generate code based on requirements

#### Parameters

- language (string): Programming language [required]
- framework (string): Framework or library [default: none]
- quality (string): Code quality level [default: standard]

#### Examples

- Generate a React component
- Create a Python function

### test_generator

Generate tests for code

#### Parameters

- code (string): Code to test [required]
- test_type (string): Type of test [default: unit]

#### Examples

- Generate unit tests
- Create integration tests

## Workflows

### Development Workflow

Standard development process

#### Triggers

- Trigger: User request for code generation
- Trigger: Code review request

#### Steps

- Step: Analyze requirements
- Step: Generate code
- Step: Create tests
- Step: Review and validate

#### Outcomes

- Outcome: Working code with tests
- Outcome: Documentation

### Testing Workflow

Comprehensive testing process

#### Triggers

- Trigger: New code added
- Trigger: Bug report

#### Steps

- Step: Analyze code
- Step: Generate tests
- Step: Run tests
- Step: Report results

#### Outcomes

- Outcome: Test coverage report
- Outcome: Bug fixes

## Constraints

- Must follow security best practices
- Must optimize for performance
- Must be accessible
- Must be maintainable

## Examples

### Example 1

**Scenario:** Full-stack development
**Input:** Create a user authentication system
**Output:** Complete authentication system with frontend, backend, and tests
**Explanation:** The agent generates a complete system following best practices

### Example 2

**Scenario:** Bug fixing
**Input:** Fix memory leak in React component
**Output:** Fixed component with proper cleanup
**Explanation:** The agent identifies and fixes the memory leak issue

## Metadata

- Version: 2.0.0
- Created: 2025-01-16T10:00:00Z
- Updated: 2025-01-16T12:00:00Z
- Author: TappMCP`;

      const spec = parser.parseAgentMD(content);

      expect(spec.name).toBe('Advanced Development Agent');
      expect(spec.capabilities).toHaveLength(5);
      expect(spec.tools).toHaveLength(2);
      expect(spec.workflows).toHaveLength(2);
      expect(spec.constraints).toHaveLength(4);
      expect(spec.examples).toHaveLength(2);
    });
  });

  describe('generateAgentMD', () => {
    it('should generate AGENT.md content from specification', () => {
      const spec = {
        name: 'Test Agent',
        description: 'A test agent for development',
        capabilities: ['Code generation', 'Testing'],
        tools: [{
          name: 'code_generator',
          description: 'Generate code',
          parameters: [{
            name: 'language',
            type: 'string',
            required: true,
            description: 'Programming language'
          }],
          examples: ['Generate a function']
        }],
        workflows: [{
          name: 'Development',
          description: 'Standard development',
          steps: ['Analyze', 'Generate'],
          triggers: ['User request'],
          outcomes: ['Working code']
        }],
        constraints: ['Must be secure'],
        examples: [{
          scenario: 'Basic generation',
          input: 'Create function',
          output: 'Generated function',
          explanation: 'Agent generates code'
        }],
        metadata: {
          version: '1.0.0',
          created: '2025-01-16T10:00:00Z',
          updated: '2025-01-16T10:00:00Z',
          author: 'TappMCP'
        }
      };

      const content = parser.generateAgentMD(spec);

      expect(content).toContain('# Test Agent');
      expect(content).toContain('A test agent for development');
      expect(content).toContain('## Capabilities');
      expect(content).toContain('- Code generation');
      expect(content).toContain('## Tools');
      expect(content).toContain('### code_generator');
      expect(content).toContain('## Workflows');
      expect(content).toContain('## Constraints');
      expect(content).toContain('## Examples');
      expect(content).toContain('## Metadata');
    });
  });

  describe('validateSpecification', () => {
    it('should validate correct specification', () => {
      const spec = {
        name: 'Test Agent',
        description: 'A test agent',
        capabilities: ['Code generation'],
        tools: [{
          name: 'code_generator',
          description: 'Generate code',
          parameters: [],
          examples: []
        }],
        workflows: [{
          name: 'Development',
          description: 'Standard development',
          steps: ['Analyze'],
          triggers: [],
          outcomes: []
        }],
        constraints: [],
        examples: [],
        metadata: {
          version: '1.0.0',
          created: '2025-01-16T10:00:00Z',
          updated: '2025-01-16T10:00:00Z',
          author: 'TappMCP'
        }
      };

      const result = parser.validateSpecification(spec);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.score).toBeGreaterThan(0);
    });

    it('should detect validation errors', () => {
      const spec = {
        name: '',
        description: '',
        capabilities: [],
        tools: [],
        workflows: [],
        constraints: [],
        examples: [],
        metadata: {
          version: '1.0.0',
          created: '2025-01-16T10:00:00Z',
          updated: '2025-01-16T10:00:00Z',
          author: 'TappMCP'
        }
      };

      const result = parser.validateSpecification(spec);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('Name is required and cannot be empty');
      expect(result.errors).toContain('Description is required and cannot be empty');
      expect(result.score).toBeLessThan(100);
    });

    it('should provide warnings for quality improvements', () => {
      const spec = {
        name: 'A', // Too short
        description: 'Short', // Too short
        capabilities: ['Cap'], // Too short
        tools: [{
          name: 'tool1',
          description: 'Short', // Too short
          parameters: [],
          examples: []
        }],
        workflows: [],
        constraints: [],
        examples: [],
        metadata: {
          version: '1.0.0',
          created: '2025-01-16T10:00:00Z',
          updated: '2025-01-16T10:00:00Z',
          author: 'TappMCP'
        }
      };

      const result = parser.validateSpecification(spec);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.score).toBeLessThan(100);
    });

    it('should validate tool names with proper format', () => {
      const spec = {
        name: 'Test Agent',
        description: 'A test agent for validation',
        capabilities: ['Testing'],
        tools: [{
          name: '123invalid', // Invalid - starts with number
          description: 'A test tool',
          parameters: [],
          examples: []
        }],
        workflows: [],
        constraints: [],
        examples: [],
        metadata: {
          version: '1.0.0',
          created: '2025-01-16T10:00:00Z',
          updated: '2025-01-16T10:00:00Z',
          author: 'TappMCP'
        }
      };

      const result = parser.validateSpecification(spec);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Name must start with a letter'))).toBe(true);
    });

    it('should validate workflow steps', () => {
      const spec = {
        name: 'Test Agent',
        description: 'A test agent for validation',
        capabilities: ['Testing'],
        tools: [{
          name: 'test-tool',
          description: 'A test tool',
          parameters: [],
          examples: []
        }],
        workflows: [{
          name: 'test-workflow',
          description: 'A test workflow',
          steps: [], // Empty steps
          triggers: [],
          outcomes: []
        }],
        constraints: [],
        examples: [],
        metadata: {
          version: '1.0.0',
          created: '2025-01-16T10:00:00Z',
          updated: '2025-01-16T10:00:00Z',
          author: 'TappMCP'
        }
      };

      const result = parser.validateSpecification(spec);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('At least one step is required'))).toBe(true);
    });

    it('should provide quality score', () => {
      const spec = {
        name: 'Test Agent',
        description: 'A comprehensive test agent for development assistance with multiple capabilities',
        capabilities: ['Code Generation', 'Testing', 'Documentation'],
        tools: [{
          name: 'code-generator',
          description: 'Generates code based on specifications',
          parameters: [{
            name: 'language',
            type: 'string',
            required: true,
            description: 'Programming language to generate code for'
          }],
          examples: []
        }],
        workflows: [{
          name: 'development-workflow',
          description: 'Complete development workflow from specification to deployment',
          steps: ['Analyze requirements', 'Generate code', 'Run tests', 'Deploy'],
          triggers: ['User request'],
          outcomes: ['Working application']
        }],
        constraints: ['Must follow coding standards', 'Must include tests'],
        examples: [{
          scenario: 'Generate a React component',
          input: 'Create a button component',
          output: 'Functional React button component',
          explanation: 'Generates a reusable button component'
        }],
        metadata: {
          version: '1.0.0',
          created: '2025-01-16T10:00:00Z',
          updated: '2025-01-16T10:00:00Z',
          author: 'TappMCP'
        }
      };

      const result = parser.validateSpecification(spec);

      expect(result.valid).toBe(true);
      expect(result.score).toBeGreaterThan(70);
      expect(result.warnings.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('generateFromDescription', () => {
    it('should generate specification from natural language', () => {
      const description = 'Create a React development agent that generates components and tests';

      const spec = parser.generateFromDescription(description);

      expect(spec.name).toContain('Create a React');
      expect(spec.description).toBe(description);
      expect(spec.capabilities.length).toBeGreaterThan(0);
      expect(spec.tools.length).toBeGreaterThan(0);
      expect(spec.workflows.length).toBeGreaterThan(0);
    });

    it('should handle empty description', () => {
      const spec = parser.generateFromDescription('');

      expect(spec.name).toBe('');
      expect(spec.description).toBe('');
      expect(spec.capabilities).toContain('General development assistance');
    });
  });

  describe('file operations', () => {
    it('should parse AGENT.md file from filesystem', async () => {
      // Create test directory and file
      fs.mkdirSync(testDir, { recursive: true });
      const filePath = path.join(testDir, 'AGENT.md');

      const content = `# Test Agent

A test agent for development.

## Capabilities

- Code generation

## Tools

### code_generator

Generate code

## Workflows

### Development

Standard development

#### Steps

- Step: Analyze requirements

## Constraints

- Must be secure

## Examples

### Example 1

**Scenario:** Basic generation
**Input:** Create function
**Output:** Generated function
**Explanation:** Agent generates code

## Metadata

- Version: 1.0.0
- Created: 2025-01-16T10:00:00Z
- Updated: 2025-01-16T10:00:00Z
- Author: TappMCP`;

      fs.writeFileSync(filePath, content);

      const spec = await parser.parseAgentMDFile(filePath);

      expect(spec.name).toBe('Test Agent');
      expect(spec.capabilities).toContain('Code generation');
    });

    it('should generate AGENT.md file to filesystem', async () => {
      // Create test directory
      fs.mkdirSync(testDir, { recursive: true });
      const filePath = path.join(testDir, 'AGENT.md');

      const spec = {
        name: 'Test Agent',
        description: 'A test agent',
        capabilities: ['Code generation'],
        tools: [{
          name: 'code_generator',
          description: 'Generate code',
          parameters: [],
          examples: []
        }],
        workflows: [{
          name: 'Development',
          description: 'Standard development',
          steps: ['Analyze'],
          triggers: [],
          outcomes: []
        }],
        constraints: [],
        examples: [],
        metadata: {
          version: '1.0.0',
          created: '2025-01-16T10:00:00Z',
          updated: '2025-01-16T10:00:00Z',
          author: 'TappMCP'
        }
      };

      await parser.generateAgentMDFile(spec, filePath);

      expect(fs.existsSync(filePath)).toBe(true);

      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('# Test Agent');
    });

    it('should handle file errors gracefully', async () => {
      const invalidPath = '/invalid/path/AGENT.md';

      await expect(parser.parseAgentMDFile(invalidPath)).rejects.toThrow();
      await expect(parser.generateAgentMDFile({} as any, invalidPath)).rejects.toThrow();
    });
  });
});
