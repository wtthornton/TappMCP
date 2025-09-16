import { AgentSpecification } from './agent-md-parser.js';
import { AgentCodeGenerator, CodeGenerationOptions } from './agent-code-generator.js';

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  specification: AgentSpecification;
  examples: Array<{
    name: string;
    description: string;
    input: string;
    output: string;
  }>;
  usage: {
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: string;
    prerequisites: string[];
  };
}

export interface TemplateSearchOptions {
  category?: string;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  searchTerm?: string;
}

export class AgentTemplateLibrary {
  private templates: Map<string, AgentTemplate> = new Map();
  private codeGenerator: AgentCodeGenerator;

  constructor() {
    this.codeGenerator = new AgentCodeGenerator();
    this.initializeTemplates();
  }

  /**
   * Get all available templates
   */
  getAllTemplates(): AgentTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): AgentTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * Search templates based on criteria
   */
  searchTemplates(options: TemplateSearchOptions): AgentTemplate[] {
    let results = this.getAllTemplates();

    if (options.category) {
      results = results.filter(t => t.category === options.category);
    }

    if (options.tags && options.tags.length > 0) {
      results = results.filter(t =>
        options.tags!.some(tag => t.tags.includes(tag))
      );
    }

    if (options.difficulty) {
      results = results.filter(t => t.usage.difficulty === options.difficulty);
    }

    if (options.searchTerm) {
      const searchLower = options.searchTerm.toLowerCase();
      results = results.filter(t =>
        t.name.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    return results;
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: string): AgentTemplate[] {
    return this.getAllTemplates().filter(t => t.category === category);
  }

  /**
   * Get template categories
   */
  getCategories(): string[] {
    const categories = new Set(this.getAllTemplates().map(t => t.category));
    return Array.from(categories).sort();
  }

  /**
   * Get all available tags
   */
  getTags(): string[] {
    const tags = new Set<string>();
    this.getAllTemplates().forEach(t => {
      t.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }

  /**
   * Generate code from template
   */
  async generateFromTemplate(
    templateId: string,
    options: CodeGenerationOptions,
    customizations?: Partial<AgentSpecification>
  ): Promise<{ code: any; template: AgentTemplate }> {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Merge template specification with customizations
    const specification = this.mergeSpecifications(template.specification, customizations);

    // Generate code
    const code = await this.codeGenerator.generateCode(specification, options);

    return { code, template };
  }

  /**
   * Create custom template from specification
   */
  createCustomTemplate(
    id: string,
    name: string,
    description: string,
    category: string,
    specification: AgentSpecification,
    tags: string[] = []
  ): AgentTemplate {
    const template: AgentTemplate = {
      id,
      name,
      description,
      category,
      tags,
      specification,
      examples: [],
      usage: {
        difficulty: 'intermediate',
        estimatedTime: '30 minutes',
        prerequisites: []
      }
    };

    this.templates.set(id, template);
    return template;
  }

  /**
   * Initialize built-in templates
   */
  private initializeTemplates(): void {
    // Web Development Templates
    this.addWebDevelopmentTemplates();

    // API Development Templates
    this.addApiDevelopmentTemplates();

    // Data Processing Templates
    this.addDataProcessingTemplates();

    // Testing Templates
    this.addTestingTemplates();

    // DevOps Templates
    this.addDevOpsTemplates();

    // AI/ML Templates
    this.addAIMLTemplates();

    // Database Templates
    this.addDatabaseTemplates();

    // Microservices Templates
    this.addMicroservicesTemplates();

    // Security Templates
    this.addSecurityTemplates();

    // Monitoring Templates
    this.addMonitoringTemplates();
  }

  private addWebDevelopmentTemplates(): void {
    // HTML/CSS Agent (Beginner)
    this.templates.set('html-css-agent', {
      id: 'html-css-agent',
      name: 'HTML/CSS Agent',
      description: 'A beginner-friendly agent for creating HTML pages and CSS styling',
      category: 'Web Development',
      tags: ['html', 'css', 'frontend', 'beginner', 'static'],
      specification: {
        name: 'HTML/CSS Agent',
        description: 'A beginner-friendly agent for creating HTML pages and CSS styling.',
        capabilities: [
          'HTML page generation',
          'CSS styling',
          'Responsive design',
          'Basic animations',
          'Cross-browser compatibility'
        ],
        tools: [{
          name: 'page_generator',
          description: 'Generates HTML pages with CSS',
          parameters: [{
            name: 'pageType',
            type: 'string',
            required: true,
            description: 'Type of page to generate (landing, portfolio, blog)'
          }, {
            name: 'includeResponsive',
            type: 'boolean',
            required: false,
            description: 'Whether to include responsive design'
          }],
          examples: ['Generate a landing page', 'Create a portfolio website']
        }],
        workflows: [{
          name: 'Web Page Development Workflow',
          description: 'Simple workflow for web page development',
          steps: [
            'Create HTML structure',
            'Add CSS styling',
            'Make responsive',
            'Test in browsers'
          ],
          triggers: ['Web page request'],
          outcomes: ['Complete HTML/CSS page']
        }],
        constraints: [
          'Must be semantic HTML',
          'Must be accessible',
          'Must be responsive',
          'Must follow CSS best practices'
        ],
        examples: [{
          scenario: 'Generate Landing Page',
          input: 'Create a simple landing page with hero section',
          output: 'Complete HTML page with CSS styling',
          explanation: 'Generates a clean, responsive landing page'
        }],
        metadata: {
          version: '1.0.0',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          author: 'TappMCP'
        }
      },
      examples: [{
        name: 'Landing Page',
        description: 'Generate a simple landing page',
        input: 'Hero section with call-to-action button',
        output: 'Complete HTML page with CSS'
      }],
      usage: {
        difficulty: 'beginner',
        estimatedTime: '30 minutes',
        prerequisites: ['Basic HTML knowledge']
      }
    });

    // React Component Agent
    this.templates.set('react-component-agent', {
      id: 'react-component-agent',
      name: 'React Component Agent',
      description: 'An agent for generating React components with TypeScript, testing, and documentation',
      category: 'Web Development',
      tags: ['react', 'typescript', 'frontend', 'component', 'ui'],
      specification: {
        name: 'React Component Agent',
        description: 'A specialized agent for creating React components with TypeScript, comprehensive testing, and documentation.',
        capabilities: [
          'React component generation',
          'TypeScript integration',
          'Component testing',
          'Storybook documentation',
          'Accessibility compliance'
        ],
        tools: [{
          name: 'component_generator',
          description: 'Generates React components with TypeScript',
          parameters: [{
            name: 'componentName',
            type: 'string',
            required: true,
            description: 'Name of the component to generate'
          }, {
            name: 'componentType',
            type: 'string',
            required: false,
            description: 'Type of component (functional, class, hook)'
          }, {
            name: 'includeTests',
            type: 'boolean',
            required: false,
            description: 'Whether to include test files'
          }],
          examples: ['Generate a Button component', 'Create a Modal with TypeScript']
        }],
        workflows: [{
          name: 'Component Development Workflow',
          description: 'Complete workflow for React component development',
          steps: [
            'Analyze component requirements',
            'Generate component structure',
            'Add TypeScript types',
            'Create test files',
            'Generate Storybook stories',
            'Add accessibility features'
          ],
          triggers: ['New component request'],
          outcomes: ['Production-ready React component']
        }],
        constraints: [
          'Must follow React best practices',
          'Must include TypeScript types',
          'Must be accessible (WCAG 2.1)',
          'Must include comprehensive tests'
        ],
        examples: [{
          scenario: 'Generate a Button component',
          input: 'Create a reusable Button component with variants',
          output: 'Complete Button component with TypeScript, tests, and Storybook stories',
          explanation: 'Generates a fully-featured Button component following React best practices'
        }],
        metadata: {
          version: '1.0.0',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          author: 'TappMCP'
        }
      },
      examples: [{
        name: 'Button Component',
        description: 'Generate a reusable Button component',
        input: 'Button with primary, secondary, and danger variants',
        output: 'Complete Button component with TypeScript and tests'
      }],
      usage: {
        difficulty: 'intermediate',
        estimatedTime: '45 minutes',
        prerequisites: ['React knowledge', 'TypeScript basics']
      }
    });

    // JavaScript Utility Agent (Beginner)
    this.templates.set('javascript-utility-agent', {
      id: 'javascript-utility-agent',
      name: 'JavaScript Utility Agent',
      description: 'A beginner-friendly agent for creating JavaScript utility functions',
      category: 'Web Development',
      tags: ['javascript', 'utilities', 'functions', 'beginner', 'vanilla'],
      specification: {
        name: 'JavaScript Utility Agent',
        description: 'A beginner-friendly agent for creating JavaScript utility functions and helpers.',
        capabilities: [
          'JavaScript function generation',
          'Array manipulation utilities',
          'String processing functions',
          'Object helpers',
          'Basic validation functions'
        ],
        tools: [{
          name: 'utility_generator',
          description: 'Generates JavaScript utility functions',
          parameters: [{
            name: 'functionType',
            type: 'string',
            required: true,
            description: 'Type of utility function to generate'
          }, {
            name: 'includeTests',
            type: 'boolean',
            required: false,
            description: 'Whether to include test functions'
          }],
          examples: ['Generate array helper functions', 'Create string utilities']
        }],
        workflows: [{
          name: 'Utility Development Workflow',
          description: 'Simple workflow for utility function development',
          steps: [
            'Define function requirements',
            'Generate function code',
            'Add error handling',
            'Create test cases'
          ],
          triggers: ['Utility function request'],
          outcomes: ['Working utility functions']
        }],
        constraints: [
          'Must be pure functions',
          'Must include error handling',
          'Must be well-documented',
          'Must be testable'
        ],
        examples: [{
          scenario: 'Generate Array Utilities',
          input: 'Create functions for array manipulation',
          output: 'Complete utility functions with tests',
          explanation: 'Generates clean, reusable array utility functions'
        }],
        metadata: {
          version: '1.0.0',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          author: 'TappMCP'
        }
      },
      examples: [{
        name: 'Array Utilities',
        description: 'Generate array helper functions',
        input: 'Functions for filtering, mapping, and reducing arrays',
        output: 'Complete utility functions with documentation'
      }],
      usage: {
        difficulty: 'beginner',
        estimatedTime: '25 minutes',
        prerequisites: ['Basic JavaScript knowledge']
      }
    });

    // Vue.js Component Agent
    this.templates.set('vue-component-agent', {
      id: 'vue-component-agent',
      name: 'Vue.js Component Agent',
      description: 'An agent for generating Vue.js components with Composition API and TypeScript',
      category: 'Web Development',
      tags: ['vue', 'typescript', 'javascript', 'frontend', 'component', 'composition-api'],
      specification: {
        name: 'Vue.js Component Agent',
        description: 'A specialized agent for creating Vue.js components using Composition API with TypeScript.',
        capabilities: [
          'Vue.js component generation',
          'Composition API integration',
          'TypeScript support',
          'Component testing',
          'Vue DevTools integration'
        ],
        tools: [{
          name: 'vue_component_generator',
          description: 'Generates Vue.js components with Composition API',
          parameters: [{
            name: 'componentName',
            type: 'string',
            required: true,
            description: 'Name of the Vue component'
          }, {
            name: 'useCompositionAPI',
            type: 'boolean',
            required: false,
            description: 'Whether to use Composition API'
          }],
          examples: ['Generate a Card component', 'Create a Form with validation']
        }],
        workflows: [{
          name: 'Vue Component Workflow',
          description: 'Workflow for Vue.js component development',
          steps: [
            'Analyze component requirements',
            'Generate Vue component structure',
            'Add Composition API logic',
            'Create TypeScript interfaces',
            'Generate test files'
          ],
          triggers: ['Vue component request'],
          outcomes: ['Production-ready Vue component']
        }],
        constraints: [
          'Must use Vue 3 Composition API',
          'Must include TypeScript',
          'Must follow Vue.js best practices'
        ],
        examples: [{
          scenario: 'Generate a Card component',
          input: 'Create a reusable Card component with slots',
          output: 'Complete Card component with Composition API and TypeScript',
          explanation: 'Generates a Vue component following modern Vue.js patterns'
        }],
        metadata: {
          version: '1.0.0',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          author: 'TappMCP'
        }
      },
      examples: [{
        name: 'Card Component',
        description: 'Generate a Vue Card component',
        input: 'Card with header, body, and footer slots',
        output: 'Complete Card component with Composition API'
      }],
      usage: {
        difficulty: 'intermediate',
        estimatedTime: '40 minutes',
        prerequisites: ['Vue.js knowledge', 'TypeScript basics']
      }
    });
  }

  private addApiDevelopmentTemplates(): void {
    // REST API Agent
    this.templates.set('rest-api-agent', {
      id: 'rest-api-agent',
      name: 'REST API Agent',
      description: 'An agent for generating REST APIs with Express.js, validation, and documentation',
      category: 'API Development',
      tags: ['rest', 'api', 'express', 'nodejs', 'typescript', 'swagger'],
      specification: {
        name: 'REST API Agent',
        description: 'A comprehensive agent for creating REST APIs with Express.js, TypeScript, validation, and OpenAPI documentation.',
        capabilities: [
          'REST API generation',
          'Express.js integration',
          'Request validation',
          'OpenAPI documentation',
          'Error handling',
          'Authentication middleware'
        ],
        tools: [{
          name: 'api_generator',
          description: 'Generates REST API endpoints',
          parameters: [{
            name: 'resourceName',
            type: 'string',
            required: true,
            description: 'Name of the API resource'
          }, {
            name: 'operations',
            type: 'array',
            required: false,
            description: 'List of CRUD operations to generate'
          }],
          examples: ['Generate User API', 'Create Product CRUD endpoints']
        }],
        workflows: [{
          name: 'API Development Workflow',
          description: 'Complete workflow for REST API development',
          steps: [
            'Define API specification',
            'Generate Express routes',
            'Add validation middleware',
            'Create error handlers',
            'Generate OpenAPI documentation',
            'Add authentication'
          ],
          triggers: ['API development request'],
          outcomes: ['Production-ready REST API']
        }],
        constraints: [
          'Must follow REST conventions',
          'Must include input validation',
          'Must have comprehensive error handling',
          'Must include OpenAPI documentation'
        ],
        examples: [{
          scenario: 'Generate User API',
          input: 'Create CRUD operations for User resource',
          output: 'Complete REST API with validation and documentation',
          explanation: 'Generates a full REST API following best practices'
        }],
        metadata: {
          version: '1.0.0',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          author: 'TappMCP'
        }
      },
      examples: [{
        name: 'User API',
        description: 'Generate User CRUD API',
        input: 'User resource with GET, POST, PUT, DELETE operations',
        output: 'Complete REST API with Express.js and validation'
      }],
      usage: {
        difficulty: 'intermediate',
        estimatedTime: '60 minutes',
        prerequisites: ['Node.js knowledge', 'Express.js basics', 'REST API concepts']
      }
    });

    // GraphQL API Agent
    this.templates.set('graphql-api-agent', {
      id: 'graphql-api-agent',
      name: 'GraphQL API Agent',
      description: 'An agent for generating GraphQL APIs with Apollo Server and TypeScript',
      category: 'API Development',
      tags: ['graphql', 'apollo', 'api', 'typescript', 'schema'],
      specification: {
        name: 'GraphQL API Agent',
        description: 'A specialized agent for creating GraphQL APIs with Apollo Server, TypeScript, and comprehensive schema management.',
        capabilities: [
          'GraphQL schema generation',
          'Apollo Server integration',
          'Resolver implementation',
          'Type safety',
          'Schema validation',
          'Query optimization'
        ],
        tools: [{
          name: 'graphql_schema_generator',
          description: 'Generates GraphQL schemas and resolvers',
          parameters: [{
            name: 'schemaName',
            type: 'string',
            required: true,
            description: 'Name of the GraphQL schema'
          }, {
            name: 'includeMutations',
            type: 'boolean',
            required: false,
            description: 'Whether to include mutations'
          }],
          examples: ['Generate User schema', 'Create Product GraphQL API']
        }],
        workflows: [{
          name: 'GraphQL Development Workflow',
          description: 'Workflow for GraphQL API development',
          steps: [
            'Define GraphQL schema',
            'Generate TypeScript types',
            'Create resolvers',
            'Add data sources',
            'Implement authentication',
            'Add query optimization'
          ],
          triggers: ['GraphQL API request'],
          outcomes: ['Production-ready GraphQL API']
        }],
        constraints: [
          'Must follow GraphQL best practices',
          'Must include TypeScript types',
          'Must have proper error handling',
          'Must include query optimization'
        ],
        examples: [{
          scenario: 'Generate User GraphQL API',
          input: 'Create User schema with queries and mutations',
          output: 'Complete GraphQL API with Apollo Server',
          explanation: 'Generates a full GraphQL API with type safety'
        }],
        metadata: {
          version: '1.0.0',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          author: 'TappMCP'
        }
      },
      examples: [{
        name: 'User GraphQL API',
        description: 'Generate User GraphQL schema',
        input: 'User type with queries and mutations',
        output: 'Complete GraphQL API with resolvers'
      }],
      usage: {
        difficulty: 'advanced',
        estimatedTime: '90 minutes',
        prerequisites: ['GraphQL knowledge', 'Apollo Server basics', 'TypeScript']
      }
    });
  }

  private addDataProcessingTemplates(): void {
    // ETL Pipeline Agent
    this.templates.set('etl-pipeline-agent', {
      id: 'etl-pipeline-agent',
      name: 'ETL Pipeline Agent',
      description: 'An agent for creating Extract, Transform, Load data pipelines',
      category: 'Data Processing',
      tags: ['etl', 'data', 'pipeline', 'processing', 'python'],
      specification: {
        name: 'ETL Pipeline Agent',
        description: 'A specialized agent for creating ETL (Extract, Transform, Load) data pipelines with error handling and monitoring.',
        capabilities: [
          'Data extraction',
          'Data transformation',
          'Data loading',
          'Error handling',
          'Data validation',
          'Pipeline monitoring'
        ],
        tools: [{
          name: 'pipeline_generator',
          description: 'Generates ETL pipeline components',
          parameters: [{
            name: 'sourceType',
            type: 'string',
            required: true,
            description: 'Type of data source (database, file, api)'
          }, {
            name: 'destinationType',
            type: 'string',
            required: true,
            description: 'Type of destination (database, file, warehouse)'
          }],
          examples: ['Generate CSV to Database pipeline', 'Create API to Data Warehouse ETL']
        }],
        workflows: [{
          name: 'ETL Development Workflow',
          description: 'Workflow for ETL pipeline development',
          steps: [
            'Define data sources',
            'Create extraction logic',
            'Implement transformations',
            'Set up loading process',
            'Add error handling',
            'Configure monitoring'
          ],
          triggers: ['ETL pipeline request'],
          outcomes: ['Production-ready ETL pipeline']
        }],
        constraints: [
          'Must handle data validation',
          'Must include error recovery',
          'Must be scalable',
          'Must include monitoring'
        ],
        examples: [{
          scenario: 'Generate CSV ETL Pipeline',
          input: 'Extract from CSV, transform data, load to database',
          output: 'Complete ETL pipeline with error handling',
          explanation: 'Creates a robust ETL pipeline for data processing'
        }],
        metadata: {
          version: '1.0.0',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          author: 'TappMCP'
        }
      },
      examples: [{
        name: 'CSV ETL Pipeline',
        description: 'Generate CSV to Database ETL',
        input: 'CSV file processing with validation',
        output: 'Complete ETL pipeline with monitoring'
      }],
      usage: {
        difficulty: 'advanced',
        estimatedTime: '120 minutes',
        prerequisites: ['Python knowledge', 'Data processing concepts', 'Database basics']
      }
    });
  }

  private addTestingTemplates(): void {
    // Test Suite Agent
    this.templates.set('test-suite-agent', {
      id: 'test-suite-agent',
      name: 'Test Suite Agent',
      description: 'An agent for generating comprehensive test suites with multiple testing frameworks',
      category: 'Testing',
      tags: ['testing', 'jest', 'vitest', 'cypress', 'playwright', 'unit-tests'],
      specification: {
        name: 'Test Suite Agent',
        description: 'A comprehensive agent for creating test suites with unit tests, integration tests, and e2e tests.',
        capabilities: [
          'Unit test generation',
          'Integration test creation',
          'E2E test automation',
          'Test data management',
          'Mock generation',
          'Coverage reporting'
        ],
        tools: [{
          name: 'test_generator',
          description: 'Generates test files and test cases',
          parameters: [{
            name: 'testType',
            type: 'string',
            required: true,
            description: 'Type of tests to generate (unit, integration, e2e)'
          }, {
            name: 'framework',
            type: 'string',
            required: false,
            description: 'Testing framework to use'
          }],
          examples: ['Generate unit tests for components', 'Create e2e tests for user flows']
        }],
        workflows: [{
          name: 'Test Development Workflow',
          description: 'Workflow for comprehensive test development',
          steps: [
            'Analyze code to test',
            'Generate unit tests',
            'Create integration tests',
            'Add e2e tests',
            'Set up test data',
            'Configure coverage'
          ],
          triggers: ['Test suite request'],
          outcomes: ['Comprehensive test suite']
        }],
        constraints: [
          'Must achieve high coverage',
          'Must include edge cases',
          'Must be maintainable',
          'Must run efficiently'
        ],
        examples: [{
          scenario: 'Generate Component Tests',
          input: 'Create tests for React components',
          output: 'Complete test suite with unit and integration tests',
          explanation: 'Generates comprehensive tests following best practices'
        }],
        metadata: {
          version: '1.0.0',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          author: 'TappMCP'
        }
      },
      examples: [{
        name: 'Component Test Suite',
        description: 'Generate React component tests',
        input: 'Button component with various props',
        output: 'Complete test suite with Jest and React Testing Library'
      }],
      usage: {
        difficulty: 'intermediate',
        estimatedTime: '50 minutes',
        prerequisites: ['Testing concepts', 'Jest/Vitest knowledge', 'Testing Library basics']
      }
    });
  }

  private addDevOpsTemplates(): void {
    // Docker Agent
    this.templates.set('docker-agent', {
      id: 'docker-agent',
      name: 'Docker Agent',
      description: 'An agent for generating Docker configurations and containerization',
      category: 'DevOps',
      tags: ['docker', 'containerization', 'devops', 'deployment'],
      specification: {
        name: 'Docker Agent',
        description: 'A specialized agent for creating Docker configurations, multi-stage builds, and containerization strategies.',
        capabilities: [
          'Dockerfile generation',
          'Multi-stage builds',
          'Container optimization',
          'Security hardening',
          'Health checks',
          'Docker Compose setup'
        ],
        tools: [{
          name: 'dockerfile_generator',
          description: 'Generates optimized Dockerfiles',
          parameters: [{
            name: 'applicationType',
            type: 'string',
            required: true,
            description: 'Type of application (nodejs, python, java, etc.)'
          }, {
            name: 'optimizationLevel',
            type: 'string',
            required: false,
            description: 'Level of optimization (basic, standard, production)'
          }],
          examples: ['Generate Node.js Dockerfile', 'Create Python multi-stage build']
        }],
        workflows: [{
          name: 'Containerization Workflow',
          description: 'Workflow for application containerization',
          steps: [
            'Analyze application requirements',
            'Generate Dockerfile',
            'Create multi-stage build',
            'Add security hardening',
            'Configure health checks',
            'Set up Docker Compose'
          ],
          triggers: ['Containerization request'],
          outcomes: ['Production-ready container setup']
        }],
        constraints: [
          'Must be secure',
          'Must be optimized for size',
          'Must include health checks',
          'Must follow best practices'
        ],
        examples: [{
          scenario: 'Generate Node.js Dockerfile',
          input: 'Containerize a Node.js application',
          output: 'Optimized Dockerfile with multi-stage build',
          explanation: 'Creates a production-ready Docker configuration'
        }],
        metadata: {
          version: '1.0.0',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          author: 'TappMCP'
        }
      },
      examples: [{
        name: 'Node.js Dockerfile',
        description: 'Generate Node.js containerization',
        input: 'Node.js app with TypeScript and dependencies',
        output: 'Optimized Dockerfile with multi-stage build'
      }],
      usage: {
        difficulty: 'intermediate',
        estimatedTime: '30 minutes',
        prerequisites: ['Docker basics', 'Containerization concepts']
      }
    });
  }

  private addAIMLTemplates(): void {
    // ML Pipeline Agent
    this.templates.set('ml-pipeline-agent', {
      id: 'ml-pipeline-agent',
      name: 'ML Pipeline Agent',
      description: 'An agent for creating machine learning pipelines and models',
      category: 'AI/ML',
      tags: ['machine-learning', 'python', 'scikit-learn', 'pandas', 'data-science'],
      specification: {
        name: 'ML Pipeline Agent',
        description: 'A specialized agent for creating machine learning pipelines with data preprocessing, model training, and evaluation.',
        capabilities: [
          'Data preprocessing',
          'Feature engineering',
          'Model training',
          'Model evaluation',
          'Hyperparameter tuning',
          'Model deployment'
        ],
        tools: [{
          name: 'ml_pipeline_generator',
          description: 'Generates ML pipeline components',
          parameters: [{
            name: 'problemType',
            type: 'string',
            required: true,
            description: 'Type of ML problem (classification, regression, clustering)'
          }, {
            name: 'algorithm',
            type: 'string',
            required: false,
            description: 'ML algorithm to use'
          }],
          examples: ['Generate classification pipeline', 'Create regression model']
        }],
        workflows: [{
          name: 'ML Development Workflow',
          description: 'Workflow for ML pipeline development',
          steps: [
            'Data exploration',
            'Data preprocessing',
            'Feature engineering',
            'Model training',
            'Model evaluation',
            'Hyperparameter tuning'
          ],
          triggers: ['ML pipeline request'],
          outcomes: ['Trained ML model with evaluation']
        }],
        constraints: [
          'Must include data validation',
          'Must have proper evaluation metrics',
          'Must be reproducible',
          'Must include feature importance'
        ],
        examples: [{
          scenario: 'Generate Classification Pipeline',
          input: 'Create a binary classification model',
          output: 'Complete ML pipeline with evaluation',
          explanation: 'Generates a full ML pipeline for classification'
        }],
        metadata: {
          version: '1.0.0',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          author: 'TappMCP'
        }
      },
      examples: [{
        name: 'Classification Pipeline',
        description: 'Generate binary classification model',
        input: 'Customer churn prediction dataset',
        output: 'Complete ML pipeline with evaluation metrics'
      }],
      usage: {
        difficulty: 'advanced',
        estimatedTime: '150 minutes',
        prerequisites: ['Python knowledge', 'Machine learning basics', 'Pandas/NumPy']
      }
    });
  }

  private addDatabaseTemplates(): void {
    // Database Schema Agent
    this.templates.set('database-schema-agent', {
      id: 'database-schema-agent',
      name: 'Database Schema Agent',
      description: 'An agent for generating database schemas and migrations',
      category: 'Database',
      tags: ['database', 'sql', 'migrations', 'schema', 'postgresql', 'mysql'],
      specification: {
        name: 'Database Schema Agent',
        description: 'A specialized agent for creating database schemas, migrations, and database management tools.',
        capabilities: [
          'Schema generation',
          'Migration creation',
          'Index optimization',
          'Query optimization',
          'Data seeding',
          'Backup strategies'
        ],
        tools: [{
          name: 'schema_generator',
          description: 'Generates database schemas and migrations',
          parameters: [{
            name: 'databaseType',
            type: 'string',
            required: true,
            description: 'Type of database (postgresql, mysql, sqlite)'
          }, {
            name: 'schemaName',
            type: 'string',
            required: true,
            description: 'Name of the schema to generate'
          }],
          examples: ['Generate User schema', 'Create Product database']
        }],
        workflows: [{
          name: 'Database Development Workflow',
          description: 'Workflow for database development',
          steps: [
            'Define entity relationships',
            'Generate schema',
            'Create migrations',
            'Add indexes',
            'Seed test data',
            'Optimize queries'
          ],
          triggers: ['Database schema request'],
          outcomes: ['Production-ready database schema']
        }],
        constraints: [
          'Must follow normalization rules',
          'Must include proper indexes',
          'Must have migration scripts',
          'Must include data validation'
        ],
        examples: [{
          scenario: 'Generate User Schema',
          input: 'Create user management database',
          output: 'Complete schema with migrations and indexes',
          explanation: 'Generates a normalized database schema'
        }],
        metadata: {
          version: '1.0.0',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          author: 'TappMCP'
        }
      },
      examples: [{
        name: 'User Management Schema',
        description: 'Generate user database schema',
        input: 'User, Role, Permission entities',
        output: 'Complete schema with relationships and migrations'
      }],
      usage: {
        difficulty: 'intermediate',
        estimatedTime: '45 minutes',
        prerequisites: ['SQL knowledge', 'Database design concepts']
      }
    });
  }

  private addMicroservicesTemplates(): void {
    // Microservice Agent
    this.templates.set('microservice-agent', {
      id: 'microservice-agent',
      name: 'Microservice Agent',
      description: 'An agent for creating microservices with service discovery and communication',
      category: 'Microservices',
      tags: ['microservices', 'docker', 'kubernetes', 'service-mesh', 'api-gateway'],
      specification: {
        name: 'Microservice Agent',
        description: 'A specialized agent for creating microservices with service discovery, API gateway, and inter-service communication.',
        capabilities: [
          'Service generation',
          'API gateway setup',
          'Service discovery',
          'Inter-service communication',
          'Load balancing',
          'Circuit breaker pattern'
        ],
        tools: [{
          name: 'microservice_generator',
          description: 'Generates microservice components',
          parameters: [{
            name: 'serviceName',
            type: 'string',
            required: true,
            description: 'Name of the microservice'
          }, {
            name: 'serviceType',
            type: 'string',
            required: false,
            description: 'Type of service (api, worker, scheduler)'
          }],
          examples: ['Generate User service', 'Create Payment microservice']
        }],
        workflows: [{
          name: 'Microservice Development Workflow',
          description: 'Workflow for microservice development',
          steps: [
            'Define service boundaries',
            'Generate service structure',
            'Add API endpoints',
            'Implement service discovery',
            'Add inter-service communication',
            'Configure monitoring'
          ],
          triggers: ['Microservice request'],
          outcomes: ['Production-ready microservice']
        }],
        constraints: [
          'Must be stateless',
          'Must include health checks',
          'Must have proper error handling',
          'Must be containerized'
        ],
        examples: [{
          scenario: 'Generate User Service',
          input: 'Create user management microservice',
          output: 'Complete microservice with API and discovery',
          explanation: 'Generates a full microservice following best practices'
        }],
        metadata: {
          version: '1.0.0',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          author: 'TappMCP'
        }
      },
      examples: [{
        name: 'User Microservice',
        description: 'Generate user management service',
        input: 'User CRUD operations with authentication',
        output: 'Complete microservice with Docker and discovery'
      }],
      usage: {
        difficulty: 'advanced',
        estimatedTime: '120 minutes',
        prerequisites: ['Microservices concepts', 'Docker knowledge', 'API design']
      }
    });
  }

  private addSecurityTemplates(): void {
    // Security Agent
    this.templates.set('security-agent', {
      id: 'security-agent',
      name: 'Security Agent',
      description: 'An agent for implementing security measures and authentication',
      category: 'Security',
      tags: ['security', 'authentication', 'authorization', 'jwt', 'oauth', 'encryption'],
      specification: {
        name: 'Security Agent',
        description: 'A specialized agent for implementing security measures, authentication, authorization, and security best practices.',
        capabilities: [
          'Authentication implementation',
          'Authorization systems',
          'JWT token management',
          'OAuth integration',
          'Data encryption',
          'Security auditing'
        ],
        tools: [{
          name: 'security_generator',
          description: 'Generates security components',
          parameters: [{
            name: 'authType',
            type: 'string',
            required: true,
            description: 'Type of authentication (jwt, oauth, session)'
          }, {
            name: 'securityLevel',
            type: 'string',
            required: false,
            description: 'Level of security (basic, standard, high)'
          }],
          examples: ['Generate JWT authentication', 'Create OAuth integration']
        }],
        workflows: [{
          name: 'Security Implementation Workflow',
          description: 'Workflow for security implementation',
          steps: [
            'Analyze security requirements',
            'Implement authentication',
            'Add authorization',
            'Configure encryption',
            'Add security headers',
            'Implement auditing'
          ],
          triggers: ['Security implementation request'],
          outcomes: ['Secure application with authentication']
        }],
        constraints: [
          'Must follow OWASP guidelines',
          'Must include proper encryption',
          'Must have secure defaults',
          'Must include security testing'
        ],
        examples: [{
          scenario: 'Generate JWT Authentication',
          input: 'Implement JWT-based authentication system',
          output: 'Complete authentication with JWT and middleware',
          explanation: 'Creates a secure authentication system'
        }],
        metadata: {
          version: '1.0.0',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          author: 'TappMCP'
        }
      },
      examples: [{
        name: 'JWT Authentication',
        description: 'Generate JWT authentication system',
        input: 'User login with JWT tokens',
        output: 'Complete auth system with middleware and validation'
      }],
      usage: {
        difficulty: 'advanced',
        estimatedTime: '90 minutes',
        prerequisites: ['Security concepts', 'JWT knowledge', 'Authentication patterns']
      }
    });
  }

  private addMonitoringTemplates(): void {
    // Monitoring Agent
    this.templates.set('monitoring-agent', {
      id: 'monitoring-agent',
      name: 'Monitoring Agent',
      description: 'An agent for implementing application monitoring and observability',
      category: 'Monitoring',
      tags: ['monitoring', 'observability', 'metrics', 'logging', 'alerting', 'prometheus'],
      specification: {
        name: 'Monitoring Agent',
        description: 'A specialized agent for implementing comprehensive monitoring, logging, metrics, and alerting systems.',
        capabilities: [
          'Metrics collection',
          'Log aggregation',
          'Health checks',
          'Alerting systems',
          'Performance monitoring',
          'Error tracking'
        ],
        tools: [{
          name: 'monitoring_generator',
          description: 'Generates monitoring components',
          parameters: [{
            name: 'monitoringType',
            type: 'string',
            required: true,
            description: 'Type of monitoring (application, infrastructure, business)'
          }, {
            name: 'alertLevel',
            type: 'string',
            required: false,
            description: 'Level of alerting (basic, standard, comprehensive)'
          }],
          examples: ['Generate application metrics', 'Create health check endpoints']
        }],
        workflows: [{
          name: 'Monitoring Implementation Workflow',
          description: 'Workflow for monitoring implementation',
          steps: [
            'Define monitoring requirements',
            'Implement metrics collection',
            'Set up logging',
            'Configure health checks',
            'Add alerting rules',
            'Create dashboards'
          ],
          triggers: ['Monitoring implementation request'],
          outcomes: ['Comprehensive monitoring system']
        }],
        constraints: [
          'Must have minimal performance impact',
          'Must include proper alerting',
          'Must be scalable',
          'Must include dashboard'
        ],
        examples: [{
          scenario: 'Generate Application Monitoring',
          input: 'Monitor Node.js application performance',
          output: 'Complete monitoring with metrics and alerts',
          explanation: 'Creates a comprehensive monitoring solution'
        }],
        metadata: {
          version: '1.0.0',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          author: 'TappMCP'
        }
      },
      examples: [{
        name: 'Application Monitoring',
        description: 'Generate Node.js monitoring',
        input: 'Monitor API performance and errors',
        output: 'Complete monitoring with Prometheus and Grafana'
      }],
      usage: {
        difficulty: 'intermediate',
        estimatedTime: '75 minutes',
        prerequisites: ['Monitoring concepts', 'Metrics knowledge', 'Alerting basics']
      }
    });
  }

  /**
   * Merge template specification with customizations
   */
  private mergeSpecifications(
    template: AgentSpecification,
    customizations?: Partial<AgentSpecification>
  ): AgentSpecification {
    if (!customizations) {
      return template;
    }

    return {
      ...template,
      ...customizations,
      tools: customizations.tools || template.tools,
      workflows: customizations.workflows || template.workflows,
      examples: customizations.examples || template.examples,
      constraints: customizations.constraints || template.constraints,
      capabilities: customizations.capabilities || template.capabilities,
      metadata: {
        ...template.metadata,
        ...customizations.metadata,
        updated: new Date().toISOString()
      }
    };
  }
}
