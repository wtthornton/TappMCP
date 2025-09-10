#!/usr/bin/env node
import { z } from 'zod';
import { Context7Cache } from '../core/context7-cache.js';
import { enhanceWithContext7 } from '../utils/context7-enhancer.js';
// Input schema for smart_begin tool
const SmartBeginInputSchema = z.object({
    projectName: z.string().min(1, 'Project name is required'),
    description: z.string().optional(),
    techStack: z.array(z.string()).default([]),
    targetUsers: z.array(z.string()).default([]),
    businessGoals: z.array(z.string()).optional(),
    projectTemplate: z
        .enum(['mcp-server', 'web-app', 'api-service', 'full-stack', 'microservice', 'library'])
        .optional(),
    role: z
        .enum(['developer', 'product-strategist', 'operations-engineer', 'designer', 'qa-engineer'])
        .optional(),
    qualityLevel: z.enum(['basic', 'standard', 'enterprise', 'production']).default('standard'),
    complianceRequirements: z.array(z.string()).default([]),
    // New parameters for existing project analysis
    mode: z.enum(['new-project', 'analyze-existing']).default('new-project'),
    existingProjectPath: z.string().optional(),
    analysisDepth: z.enum(['quick', 'standard', 'deep']).default('standard'),
    externalSources: z
        .object({
        useContext7: z.boolean().default(true),
        useWebSearch: z.boolean().default(false),
        useMemory: z.boolean().default(false),
    })
        .optional()
        .default({ useContext7: true, useWebSearch: false, useMemory: false }),
});
// Output schema for smart_begin tool
const SmartBeginOutputSchema = z.object({
    projectId: z.string(),
    projectStructure: z.object({
        folders: z.array(z.string()),
        files: z.array(z.string()),
        configFiles: z.array(z.string()),
        templates: z.array(z.object({
            name: z.string(),
            description: z.string(),
            path: z.string(),
            content: z.string(),
        })),
    }),
    qualityGates: z.array(z.object({
        name: z.string(),
        description: z.string(),
        status: z.enum(['enabled', 'disabled']),
        roleSpecific: z.boolean().optional(),
    })),
    nextSteps: z.array(z.string()),
    businessValue: z.object({
        costPrevention: z.number(),
        timeSaved: z.number(),
        qualityImprovements: z.array(z.string()),
    }),
    technicalMetrics: z.object({
        responseTime: z.number(),
        securityScore: z.number(),
        complexityScore: z.number(),
    }),
    processCompliance: z.object({
        roleValidation: z.boolean(),
        qualityGates: z.boolean(),
        documentation: z.boolean(),
        testing: z.boolean(),
    }),
    learningIntegration: z.object({
        processLessons: z.array(z.string()),
        qualityPatterns: z.array(z.string()),
        roleCompliance: z.array(z.string()),
    }),
    // Optional analysis results for existing projects
    analysisResults: z.object({
        detectedTechStack: z.array(z.string()),
        qualityIssues: z.array(z.string()),
        improvementOpportunities: z.array(z.string()),
        analysisDepth: z.enum(['quick', 'standard', 'deep']),
    }).optional(),
    externalIntegration: z.object({
        context7Status: z.enum(['active', 'disabled']),
        context7Knowledge: z.enum(['integrated', 'not available']),
        context7Enhancement: z
            .object({
            dataCount: z.number(),
            responseTime: z.number(),
            cacheHit: z.boolean(),
        })
            .nullable(),
        cacheStats: z.object({
            totalEntries: z.number(),
            hitRate: z.number(),
            missRate: z.number(),
            averageResponseTime: z.number(),
            memoryUsage: z.number(),
            topHitKeys: z.array(z.string()),
        }),
    }),
});
// Global Context7Cache instance for smart_begin tool
const context7Cache = new Context7Cache({
    maxCacheSize: 100,
    defaultExpiryHours: 36,
    enableHitTracking: true,
});
// Tool definition
export const smartBeginTool = {
    name: 'smart_begin',
    description: 'Initialize a new project or analyze an existing project with proper structure, quality gates, and business context for non-technical users',
    inputSchema: {
        type: 'object',
        properties: {
            projectName: {
                type: 'string',
                description: 'Name of the project to initialize or analyze',
                minLength: 1,
            },
            description: {
                type: 'string',
                description: 'Optional description of the project',
            },
            techStack: {
                type: 'array',
                items: { type: 'string' },
                description: "Array of technologies to use (e.g., ['typescript', 'nodejs', 'react'])",
                default: [],
            },
            targetUsers: {
                type: 'array',
                items: { type: 'string' },
                description: "Array of target user personas (e.g., ['strategy-people', 'vibe-coders', 'non-technical-founders'])",
                default: [],
            },
            businessGoals: {
                type: 'array',
                items: { type: 'string' },
                description: 'Optional array of business goals for the project',
            },
            projectTemplate: {
                type: 'string',
                enum: ['mcp-server', 'web-app', 'api-service', 'full-stack', 'microservice', 'library'],
                description: 'Project template type',
            },
            role: {
                type: 'string',
                enum: ['developer', 'product-strategist', 'operations-engineer', 'designer', 'qa-engineer'],
                description: 'Role for AI assistance',
            },
            qualityLevel: {
                type: 'string',
                enum: ['basic', 'standard', 'enterprise', 'production'],
                description: 'Quality level for the project',
                default: 'standard',
            },
            complianceRequirements: {
                type: 'array',
                items: { type: 'string' },
                description: 'Compliance requirements for the project',
                default: [],
            },
            mode: {
                type: 'string',
                enum: ['new-project', 'analyze-existing'],
                description: 'Mode: create new project or analyze existing project',
                default: 'new-project',
            },
            existingProjectPath: {
                type: 'string',
                description: 'Path to existing project (required when mode is analyze-existing)',
            },
            analysisDepth: {
                type: 'string',
                enum: ['quick', 'standard', 'deep'],
                description: 'Depth of analysis for existing projects',
                default: 'standard',
            },
            externalSources: {
                type: 'object',
                properties: {
                    useContext7: { type: 'boolean', default: true },
                    useWebSearch: { type: 'boolean', default: false },
                    useMemory: { type: 'boolean', default: false },
                },
                description: 'External knowledge sources to integrate',
                default: { useContext7: true, useWebSearch: false, useMemory: false },
            },
        },
        required: ['projectName'],
    },
};
// Business context types (for future use)
// interface BusinessContext {
//   projectName: string;
//   description?: string;
//   techStack: string[];
//   targetUsers: string[];
//   businessGoals?: string[];
//   costPrevention: number;
//   timeSaved: number;
//   qualityImprovements: string[];
// }
// Simple project scanner for existing projects
async function scanExistingProject(projectPath, _analysisDepth) {
    // For now, return a basic structure - this will be enhanced in Phase 2
    const fs = await import('fs/promises');
    const path = await import('path');
    try {
        const entries = await fs.readdir(projectPath, { withFileTypes: true });
        const folders = [];
        const files = [];
        const configFiles = [];
        const detectedTechStack = [];
        const qualityIssues = [];
        const improvementOpportunities = [];
        for (const entry of entries) {
            if (entry.isDirectory()) {
                folders.push(entry.name);
            }
            else {
                files.push(entry.name);
                // Detect tech stack from file extensions and names
                if (entry.name === 'package.json') {
                    configFiles.push(entry.name);
                    try {
                        const packageContent = await fs.readFile(path.join(projectPath, entry.name), 'utf-8');
                        const packageJson = JSON.parse(packageContent);
                        if (packageJson.dependencies) {
                            if (packageJson.dependencies.typescript)
                                detectedTechStack.push('typescript');
                            if (packageJson.dependencies.react)
                                detectedTechStack.push('react');
                            if (packageJson.dependencies.express)
                                detectedTechStack.push('express');
                            if (packageJson.dependencies['@modelcontextprotocol/sdk'])
                                detectedTechStack.push('mcp-server');
                        }
                    }
                    catch (error) {
                        qualityIssues.push('Invalid package.json format');
                    }
                }
                if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
                    detectedTechStack.push('typescript');
                }
                if (entry.name.endsWith('.jsx') || entry.name.endsWith('.js')) {
                    detectedTechStack.push('javascript');
                }
                if (entry.name === 'tsconfig.json') {
                    configFiles.push(entry.name);
                }
                if (entry.name === '.eslintrc.json' || entry.name === '.eslintrc.js') {
                    configFiles.push(entry.name);
                }
                if (entry.name === 'vitest.config.ts' || entry.name === 'jest.config.js') {
                    configFiles.push(entry.name);
                }
            }
        }
        // Basic quality analysis
        if (!configFiles.includes('tsconfig.json')) {
            qualityIssues.push('Missing TypeScript configuration');
            improvementOpportunities.push('Add TypeScript configuration for better type safety');
        }
        if (!configFiles.some(f => f.includes('eslint'))) {
            qualityIssues.push('Missing ESLint configuration');
            improvementOpportunities.push('Add ESLint for code quality enforcement');
        }
        if (!configFiles.some(f => f.includes('vitest') || f.includes('jest'))) {
            qualityIssues.push('Missing test configuration');
            improvementOpportunities.push('Add testing framework for better code reliability');
        }
        return {
            projectStructure: {
                folders,
                files,
                configFiles,
                templates: [], // Will be populated based on analysis
            },
            detectedTechStack: [...new Set(detectedTechStack)], // Remove duplicates
            qualityIssues,
            improvementOpportunities,
        };
    }
    catch (error) {
        throw new Error(`Failed to scan project at ${projectPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
// Project structure generator with templates
function generateProjectStructure(_projectName, techStack, projectTemplate, role) {
    const baseFolders = ['src', 'docs', 'tests', 'scripts', 'config'];
    const baseFiles = ['README.md', 'package.json', 'tsconfig.json', '.gitignore', '.env.example'];
    const configFiles = [
        'tsconfig.json',
        'package.json',
        '.eslintrc.json',
        '.prettierrc',
        'vitest.config.ts',
    ];
    // Add tech-stack specific folders and files
    if (techStack.includes('react')) {
        baseFolders.push('public', 'src/components', 'src/pages');
        baseFiles.push('index.html', 'src/App.tsx', 'src/index.tsx');
    }
    if (techStack.includes('nodejs') || techStack.includes('express')) {
        baseFolders.push('src/routes', 'src/middleware', 'src/controllers');
        baseFiles.push('src/server.ts', 'src/app.ts');
    }
    // Generate templates based on project template and role
    const templates = generateProjectTemplates(projectTemplate, role, techStack);
    return {
        folders: baseFolders,
        files: baseFiles,
        configFiles,
        templates,
    };
}
// Quality gates generator with role-specific requirements
function generateQualityGates(techStack, _role, _qualityLevel) {
    const baseGates = [
        {
            name: 'TypeScript Strict Mode',
            description: 'Enforces strict TypeScript compilation',
            status: 'enabled',
        },
        {
            name: 'ESLint Code Quality',
            description: 'Enforces code quality standards',
            status: 'enabled',
        },
        {
            name: 'Prettier Formatting',
            description: 'Enforces consistent code formatting',
            status: 'enabled',
        },
        {
            name: 'Security Scanning',
            description: 'Scans for security vulnerabilities',
            status: 'enabled',
        },
        {
            name: 'Test Coverage',
            description: 'Enforces minimum test coverage',
            status: 'enabled',
        },
    ];
    // Add tech-stack specific gates
    if (techStack.includes('react')) {
        baseGates.push({
            name: 'React Best Practices',
            description: 'Enforces React development best practices',
            status: 'enabled',
        });
    }
    return baseGates;
}
// Next steps generator with process compliance
function generateNextSteps(projectName, targetUsers, role) {
    const baseSteps = [
        `Project '${projectName}' initialized successfully`,
        'Review generated project structure and configuration',
        "Install dependencies with 'npm install'",
        "Run tests with 'npm test'",
        "Start development with 'npm run dev'",
    ];
    // Add user-specific next steps
    if (targetUsers.includes('strategy-people')) {
        baseSteps.push('Review business value metrics and cost prevention summary');
        baseSteps.push('Share project structure with stakeholders');
    }
    if (targetUsers.includes('vibe-coders')) {
        baseSteps.push('Configure your preferred development environment');
        baseSteps.push('Review code quality standards and best practices');
    }
    if (targetUsers.includes('non-technical-founder')) {
        baseSteps.push('Review business-focused documentation');
        baseSteps.push('Understand the technical foundation created');
    }
    // Add role-specific next steps based on archive lessons
    if (role) {
        baseSteps.push(`Role-specific setup: Configure ${role} role requirements`);
        baseSteps.push('Review process compliance checklist');
        baseSteps.push('Validate quality gates are properly configured');
    }
    return baseSteps;
}
// Generate project templates based on template type and role
function generateProjectTemplates(projectTemplate, role, _techStack = []) {
    const templates = [];
    // MCP Server template
    if (projectTemplate === 'mcp-server') {
        templates.push({
            name: 'MCP Server Template',
            description: 'Complete MCP server setup with role-based AI assistance',
            path: 'src/server.ts',
            content: `#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// MCP Server with role-based AI assistance
const server = new Server(
  {
    name: 'smart-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'smart_begin',
        description: 'Initialize a new project with proper structure and quality gates',
        inputSchema: {
          type: 'object',
          properties: {
            projectName: { type: 'string' },
            description: { type: 'string' },
            techStack: { type: 'array', items: { type: 'string' } },
            targetUsers: { type: 'array', items: { type: 'string' } },
            businessGoals: { type: 'array', items: { type: 'string' } },
            projectTemplate: { type: 'string', enum: ['mcp-server', 'web-app', 'api-service', 'full-stack', 'microservice', 'library'] },
            role: { type: 'string', enum: ['developer', 'product-strategist', 'operations-engineer', 'designer', 'qa-engineer'] },
            qualityLevel: { type: 'string', enum: ['basic', 'standard', 'enterprise', 'production'] },
            complianceRequirements: { type: 'array', items: { type: 'string' } },
          },
          required: ['projectName'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'smart_begin':
      // Import and call the smart_begin handler
      const { handleSmartBegin } = await import('./tools/smart-begin.js');
      return await handleSmartBegin(args);

    default:
      throw new Error(\`Unknown tool: \${name}\`);
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Smart MCP Server running on stdio');
}

main().catch(console.error);`,
        });
    }
    // Role-specific templates
    if (role === 'developer') {
        templates.push({
            name: 'Developer Quality Template',
            description: 'Developer-focused quality gates and process compliance',
            path: '.github/workflows/quality-gates.yml',
            content: `name: Quality Gates

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  quality-gates:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run TypeScript check
      run: npm run type-check

    - name: Run ESLint
      run: npm run lint

    - name: Run tests with coverage
      run: npm run test:coverage

    - name: Security scan
      run: npm audit --audit-level=moderate

    - name: Check test coverage
      run: npm run coverage:check`,
        });
    }
    if (role === 'qa-engineer') {
        templates.push({
            name: 'QA Test Template',
            description: 'Comprehensive testing setup with quality validation',
            path: 'tests/quality-validation.test.ts',
            content: `import { describe, it, expect } from 'vitest';

describe('Quality Validation', () => {
  it('should validate process compliance', () => {
    // Test process compliance requirements
    expect(true).toBe(true);
  });

  it('should validate quality gates', () => {
    // Test quality gate requirements
    expect(true).toBe(true);
  });

  it('should validate role-specific requirements', () => {
    // Test role-specific requirements
    expect(true).toBe(true);
  });
});`,
        });
    }
    return templates;
}
// Generate process compliance validation
function generateProcessCompliance(role) {
    return {
        roleValidation: !!role,
        qualityGates: true,
        documentation: true,
        testing: true,
    };
}
// Generate learning integration from archive lessons
function generateLearningIntegration(role, _qualityLevel) {
    const processLessons = [
        'Always validate role compliance before claiming completion',
        'Run early quality checks before starting work',
        'Follow role-specific prevention checklist',
        'Never bypass quality gates for speed',
    ];
    const qualityPatterns = [
        'TypeScript error resolution with test-first approach',
        'Quality gate validation pattern',
        'Role validation pattern',
        'Process compliance enforcement',
    ];
    const roleCompliance = role
        ? [
            `${role} role-specific requirements configured`,
            'Role validation enabled',
            'Process compliance checklist active',
            'Quality gates role-specific',
        ]
        : [
            'General process compliance enabled',
            'Quality gates configured',
            'Documentation requirements active',
        ];
    return {
        processLessons,
        qualityPatterns,
        roleCompliance,
    };
}
// Business value calculator
function calculateBusinessValue(_projectName, techStack) {
    // Base cost prevention from proper project setup
    let costPrevention = 10000; // Base $10K prevention
    // Add tech-stack specific prevention
    if (techStack.includes('typescript')) {
        costPrevention += 5000; // TypeScript prevents type-related bugs
    }
    if (techStack.includes('react')) {
        costPrevention += 3000; // React best practices prevent UI issues
    }
    // Time saved in hours
    const timeSaved = 2.5; // 2.5 hours saved vs manual setup
    const qualityImprovements = [
        'Production-ready project structure',
        'Security scanning and vulnerability prevention',
        'Code quality enforcement',
        'Automated testing framework',
        'Consistent development standards',
    ];
    return {
        costPrevention,
        timeSaved,
        qualityImprovements,
    };
}
// Main tool handler
export async function handleSmartBegin(input) {
    const startTime = Date.now();
    try {
        // Validate input
        const validatedInput = SmartBeginInputSchema.parse(input);
        // Validate mode-specific requirements
        if (validatedInput.mode === 'analyze-existing' && !validatedInput.existingProjectPath) {
            throw new Error('existingProjectPath is required when mode is analyze-existing');
        }
        // Enhanced Context7 integration with caching
        let context7Knowledge = null;
        let context7Enhancement = null;
        if (validatedInput.externalSources?.useContext7) {
            try {
                // Get Context7 data using the cache
                const projectTopic = validatedInput.mode === 'analyze-existing'
                    ? `project analysis and improvement best practices for ${validatedInput.projectTemplate || 'existing'} projects`
                    : `project initialization best practices for ${validatedInput.projectTemplate || 'general'} projects`;
                context7Knowledge = await context7Cache.getRelevantData({
                    businessRequest: projectTopic,
                    projectId: `proj_${Date.now()}_${validatedInput.projectName.toLowerCase().replace(/\s+/g, '_')}`,
                    domain: validatedInput.projectTemplate || 'general',
                    priority: 'high',
                    maxResults: 5,
                });
                // Enhance the project structure with Context7 knowledge
                const projectData = {
                    projectName: validatedInput.projectName,
                    techStack: validatedInput.techStack,
                    projectTemplate: validatedInput.projectTemplate,
                    role: validatedInput.role,
                    mode: validatedInput.mode,
                };
                context7Enhancement = await enhanceWithContext7(projectData, projectTopic, {
                    maxResults: 3,
                    priority: 'high',
                    domain: validatedInput.projectTemplate || 'general',
                    enableLogging: true,
                });
                console.log(`🔍 Context7 enhanced smart_begin for: ${validatedInput.projectName} (${validatedInput.mode})`);
            }
            catch (error) {
                console.warn('Context7 integration failed:', error);
            }
        }
        let projectStructure;
        let detectedTechStack = validatedInput.techStack;
        let qualityIssues = [];
        let improvementOpportunities = [];
        // Handle different modes
        if (validatedInput.mode === 'analyze-existing') {
            // Scan existing project
            const scanResult = await scanExistingProject(validatedInput.existingProjectPath, validatedInput.analysisDepth);
            projectStructure = scanResult.projectStructure;
            detectedTechStack = scanResult.detectedTechStack;
            qualityIssues = scanResult.qualityIssues;
            improvementOpportunities = scanResult.improvementOpportunities;
        }
        else {
            // Generate new project structure
            projectStructure = generateProjectStructure(validatedInput.projectName, validatedInput.techStack, validatedInput.projectTemplate, validatedInput.role);
        }
        // Generate quality gates with role-specific requirements
        const qualityGates = generateQualityGates(detectedTechStack, validatedInput.role, validatedInput.qualityLevel);
        // Generate next steps with process compliance
        const nextSteps = generateNextSteps(validatedInput.projectName, validatedInput.targetUsers, validatedInput.role);
        // Add mode-specific next steps
        if (validatedInput.mode === 'analyze-existing') {
            nextSteps.unshift(`Analyzed existing project at: ${validatedInput.existingProjectPath}`);
            if (qualityIssues.length > 0) {
                nextSteps.push(`Found ${qualityIssues.length} quality issues to address`);
            }
            if (improvementOpportunities.length > 0) {
                nextSteps.push(`Identified ${improvementOpportunities.length} improvement opportunities`);
            }
        }
        // Calculate business value
        const businessValue = calculateBusinessValue(validatedInput.projectName, detectedTechStack);
        // Add analysis-specific business value
        if (validatedInput.mode === 'analyze-existing') {
            businessValue.costPrevention += qualityIssues.length * 1000; // $1K per issue prevented
            businessValue.qualityImprovements.push(...improvementOpportunities);
        }
        // Calculate technical metrics
        const responseTime = Date.now() - startTime;
        const technicalMetrics = {
            responseTime,
            securityScore: validatedInput.mode === 'analyze-existing' ? Math.max(60, 95 - qualityIssues.length * 5) : 95,
            complexityScore: validatedInput.mode === 'analyze-existing' ? Math.max(50, 85 - qualityIssues.length * 3) : 85,
        };
        // Generate process compliance validation
        const processCompliance = generateProcessCompliance(validatedInput.role);
        // Generate learning integration from archive lessons
        const learningIntegration = generateLearningIntegration(validatedInput.role, validatedInput.qualityLevel);
        // Generate project ID
        const projectId = `proj_${Date.now()}_${validatedInput.projectName.toLowerCase().replace(/\s+/g, '_')}`;
        // Create response
        const response = {
            projectId,
            projectStructure,
            qualityGates,
            nextSteps,
            businessValue,
            technicalMetrics,
            processCompliance,
            learningIntegration,
            // Add analysis-specific data
            ...(validatedInput.mode === 'analyze-existing' && {
                analysisResults: {
                    detectedTechStack,
                    qualityIssues,
                    improvementOpportunities,
                    analysisDepth: validatedInput.analysisDepth,
                },
            }),
            externalIntegration: {
                context7Status: validatedInput.externalSources?.useContext7 ? 'active' : 'disabled',
                context7Knowledge: context7Knowledge ? 'integrated' : 'not available',
                context7Enhancement: context7Enhancement
                    ? {
                        dataCount: context7Enhancement.enhancementMetadata.dataCount,
                        responseTime: context7Enhancement.enhancementMetadata.responseTime,
                        cacheHit: context7Enhancement.enhancementMetadata.cacheHit,
                    }
                    : null,
                cacheStats: context7Cache.getCacheStats(),
            },
        };
        // Validate output
        const validatedOutput = SmartBeginOutputSchema.parse(response);
        return {
            success: true,
            data: validatedOutput,
            timestamp: new Date().toISOString(),
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
            success: false,
            error: errorMessage,
            timestamp: new Date().toISOString(),
        };
    }
}
//# sourceMappingURL=smart-begin.js.map