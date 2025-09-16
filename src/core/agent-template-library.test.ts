import { describe, it, expect, beforeEach } from 'vitest';
import { AgentTemplateLibrary } from './agent-template-library.js';

describe('AgentTemplateLibrary', () => {
  let library: AgentTemplateLibrary;

  beforeEach(() => {
    library = new AgentTemplateLibrary();
  });

  describe('initialization', () => {
    it('should initialize with built-in templates', () => {
      const templates = library.getAllTemplates();
      expect(templates.length).toBeGreaterThan(0);
    });

    it('should have templates in multiple categories', () => {
      const categories = library.getCategories();
      expect(categories.length).toBeGreaterThan(5);
      expect(categories).toContain('Web Development');
      expect(categories).toContain('API Development');
      expect(categories).toContain('Data Processing');
    });

    it('should have diverse tags', () => {
      const tags = library.getTags();
      expect(tags.length).toBeGreaterThan(10);
      expect(tags).toContain('react');
      expect(tags).toContain('typescript');
      expect(tags).toContain('api');
    });
  });

  describe('template retrieval', () => {
    it('should get template by ID', () => {
      const template = library.getTemplate('react-component-agent');
      expect(template).toBeDefined();
      expect(template?.name).toBe('React Component Agent');
      expect(template?.category).toBe('Web Development');
    });

    it('should return undefined for non-existent template', () => {
      const template = library.getTemplate('non-existent');
      expect(template).toBeUndefined();
    });

    it('should get templates by category', () => {
      const webTemplates = library.getTemplatesByCategory('Web Development');
      expect(webTemplates.length).toBeGreaterThan(0);
      expect(webTemplates.every(t => t.category === 'Web Development')).toBe(true);
    });
  });

  describe('template search', () => {
    it('should search by category', () => {
      const results = library.searchTemplates({ category: 'Web Development' });
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(t => t.category === 'Web Development')).toBe(true);
    });

    it('should search by tags', () => {
      const results = library.searchTemplates({ tags: ['react'] });
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(t => t.tags.includes('react'))).toBe(true);
    });

    it('should search by difficulty', () => {
      const results = library.searchTemplates({ difficulty: 'beginner' });
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(t => t.usage.difficulty === 'beginner')).toBe(true);
    });

    it('should search by search term', () => {
      const results = library.searchTemplates({ searchTerm: 'react' });
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(t =>
        t.name.toLowerCase().includes('react') ||
        t.description.toLowerCase().includes('react') ||
        t.tags.some(tag => tag.toLowerCase().includes('react'))
      )).toBe(true);
    });

    it('should combine multiple search criteria', () => {
      const results = library.searchTemplates({
        category: 'Web Development',
        tags: ['typescript'],
        difficulty: 'intermediate'
      });
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(t =>
        t.category === 'Web Development' &&
        t.tags.includes('typescript') &&
        t.usage.difficulty === 'intermediate'
      )).toBe(true);
    });
  });

  describe('template generation', () => {
    it('should generate code from template', async () => {
      const options = {
        language: 'typescript',
        quality: 'standard' as const,
        includeTests: true,
        includeDocumentation: true,
        includeExamples: false
      };

      const result = await library.generateFromTemplate('react-component-agent', options);

      expect(result).toBeDefined();
      expect(result.template).toBeDefined();
      expect(result.code).toBeDefined();
      expect(result.code.files).toBeDefined();
      expect(result.code.files.length).toBeGreaterThan(0);
    });

    it('should merge customizations with template', async () => {
      const options = {
        language: 'typescript',
        quality: 'standard' as const,
        includeTests: false,
        includeDocumentation: false,
        includeExamples: false
      };

      const customizations = {
        name: 'Custom React Agent',
        description: 'A customized React component agent'
      };

      const result = await library.generateFromTemplate(
        'react-component-agent',
        options,
        customizations
      );

      expect(result.code.metadata.specification).toBe('Custom React Agent');
    });

    it('should throw error for non-existent template', async () => {
      const options = {
        language: 'typescript',
        quality: 'standard' as const,
        includeTests: false,
        includeDocumentation: false,
        includeExamples: false
      };

      await expect(
        library.generateFromTemplate('non-existent', options)
      ).rejects.toThrow('Template not found: non-existent');
    });
  });

  describe('custom templates', () => {
    it('should create custom template', () => {
      const specification = {
        name: 'Custom Agent',
        description: 'A custom agent for testing',
        capabilities: ['Testing'],
        tools: [{
          name: 'test_tool',
          description: 'A test tool',
          parameters: [],
          examples: []
        }],
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

      const template = library.createCustomTemplate(
        'custom-test-agent',
        'Custom Test Agent',
        'A custom agent for testing',
        'Testing',
        specification,
        ['custom', 'test']
      );

      expect(template).toBeDefined();
      expect(template.id).toBe('custom-test-agent');
      expect(template.name).toBe('Custom Test Agent');
      expect(template.category).toBe('Testing');
      expect(template.tags).toEqual(['custom', 'test']);
    });

    it('should retrieve custom template', () => {
      const specification = {
        name: 'Another Custom Agent',
        description: 'Another custom agent',
        capabilities: ['Custom functionality'],
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

      library.createCustomTemplate(
        'another-custom-agent',
        'Another Custom Agent',
        'Another custom agent',
        'Custom',
        specification
      );

      const template = library.getTemplate('another-custom-agent');
      expect(template).toBeDefined();
      expect(template?.name).toBe('Another Custom Agent');
    });
  });

  describe('template categories', () => {
    it('should have expected categories', () => {
      const categories = library.getCategories();
      const expectedCategories = [
        'Web Development',
        'API Development',
        'Data Processing',
        'Testing',
        'DevOps',
        'AI/ML',
        'Database',
        'Microservices',
        'Security',
        'Monitoring'
      ];

      expectedCategories.forEach(category => {
        expect(categories).toContain(category);
      });
    });
  });

  describe('template tags', () => {
    it('should have diverse tags across categories', () => {
      const tags = library.getTags();
      const expectedTags = [
        'react', 'vue', 'typescript', 'javascript',
        'api', 'rest', 'graphql', 'express',
        'python', 'machine-learning', 'data',
        'testing', 'jest', 'cypress',
        'docker', 'kubernetes', 'devops',
        'database', 'sql', 'postgresql',
        'security', 'authentication', 'jwt',
        'monitoring', 'metrics', 'logging'
      ];

      expectedTags.forEach(tag => {
        expect(tags).toContain(tag);
      });
    });
  });

  describe('template difficulty levels', () => {
    it('should have templates with different difficulty levels', () => {
      const allTemplates = library.getAllTemplates();
      const difficulties = allTemplates.map(t => t.usage.difficulty);

      expect(difficulties).toContain('beginner');
      expect(difficulties).toContain('intermediate');
      expect(difficulties).toContain('advanced');
    });

    it('should have appropriate prerequisites for each difficulty', () => {
      const allTemplates = library.getAllTemplates();

      allTemplates.forEach(template => {
        if (template.usage.difficulty === 'beginner') {
          expect(template.usage.prerequisites.length).toBeLessThanOrEqual(2);
        } else if (template.usage.difficulty === 'advanced') {
          expect(template.usage.prerequisites.length).toBeGreaterThanOrEqual(2);
        }
      });
    });
  });

  describe('template examples', () => {
    it('should have templates with examples', () => {
      const allTemplates = library.getAllTemplates();
      const templatesWithExamples = allTemplates.filter(t => t.examples.length > 0);

      expect(templatesWithExamples.length).toBeGreaterThan(0);
    });

    it('should have meaningful examples', () => {
      const template = library.getTemplate('react-component-agent');
      expect(template?.examples.length).toBeGreaterThan(0);

      const example = template?.examples[0];
      expect(example?.name).toBeDefined();
      expect(example?.description).toBeDefined();
      expect(example?.input).toBeDefined();
      expect(example?.output).toBeDefined();
    });
  });

  describe('template specifications', () => {
    it('should have valid specifications for all templates', () => {
      const allTemplates = library.getAllTemplates();

      allTemplates.forEach(template => {
        expect(template.specification.name).toBeDefined();
        expect(template.specification.description).toBeDefined();
        expect(template.specification.capabilities.length).toBeGreaterThan(0);
        expect(template.specification.tools.length).toBeGreaterThan(0);
        expect(template.specification.workflows.length).toBeGreaterThan(0);
        expect(template.specification.constraints.length).toBeGreaterThan(0);
      });
    });

    it('should have tools with proper parameters', () => {
      const template = library.getTemplate('react-component-agent');
      const tool = template?.specification.tools[0];

      expect(tool?.name).toBeDefined();
      expect(tool?.description).toBeDefined();
      expect(tool?.parameters.length).toBeGreaterThan(0);

      const param = tool?.parameters[0];
      expect(param?.name).toBeDefined();
      expect(param?.type).toBeDefined();
      expect(param?.description).toBeDefined();
      expect(typeof param?.required).toBe('boolean');
    });
  });
});
