#!/usr/bin/env node

import { z } from 'zod';
import { MCPTool, MCPToolConfig, MCPToolContext, MCPToolResult } from '../framework/mcp-tool.js';

// Input schema for smart_begin tool
const SmartBeginInputSchema = z.object({
  projectName: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  techStack: z.array(z.string()).default([]),
  targetUsers: z.array(z.string()).default([]),
  businessGoals: z.array(z.string()).optional(),
});

// Output schema for smart_begin tool
const SmartBeginOutputSchema = z.object({
  projectId: z.string(),
  projectStructure: z.object({
    folders: z.array(z.string()),
    files: z.array(z.string()),
    configFiles: z.array(z.string()),
  }),
  qualityGates: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      status: z.enum(['enabled', 'disabled']),
    })
  ),
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
});

// MCP Tool Configuration
const config: MCPToolConfig = {
  name: 'smart_begin',
  description:
    'Initialize a new project with proper structure, quality gates, and business context for non-technical users',
  version: '2.0.0',
  inputSchema: SmartBeginInputSchema,
  outputSchema: SmartBeginOutputSchema,
  timeout: 30000, // 30 seconds
  retries: 2,
};

export type SmartBeginInput = z.infer<typeof SmartBeginInputSchema>;
export type SmartBeginOutput = z.infer<typeof SmartBeginOutputSchema>;

/**
 * Smart Begin MCP Tool
 *
 * Migrated to use MCPTool base class with enhanced error handling,
 * performance monitoring, and standardized patterns.
 */
export class SmartBeginMCPTool extends MCPTool<SmartBeginInput, SmartBeginOutput> {
  constructor() {
    super(config);
  }

  /**
   * Execute the smart begin tool
   */
  async execute(
    input: SmartBeginInput,
    _context?: MCPToolContext
  ): Promise<MCPToolResult<SmartBeginOutput>> {
    return super.execute(input, _context);
  }

  /**
   * Process the smart begin logic
   */
  protected async executeInternal(
    input: SmartBeginInput,
    _context?: MCPToolContext
  ): Promise<SmartBeginOutput> {
    // Generate project structure
    const projectStructure = this.generateProjectStructure(input.projectName, input.techStack);

    // Generate quality gates
    const qualityGates = this.generateQualityGates(input.techStack);

    // Generate next steps
    const nextSteps = this.generateNextSteps(input.projectName, input.targetUsers);

    // Calculate business value
    const businessValue = this.calculateBusinessValue(input.projectName, input.techStack);

    // Calculate technical metrics
    const technicalMetrics = this.calculateTechnicalMetrics(input.techStack);

    // Generate project ID
    const projectId = this.generateProjectId(input.projectName);

    return {
      projectId,
      projectStructure,
      qualityGates,
      nextSteps,
      businessValue,
      technicalMetrics,
    };
  }

  /**
   * Generate project structure based on tech stack
   */
  private generateProjectStructure(
    _projectName: string,
    techStack: string[]
  ): {
    folders: string[];
    files: string[];
    configFiles: string[];
  } {
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

    if (techStack.includes('python')) {
      baseFolders.push('src', 'tests', 'docs', 'scripts');
      baseFiles.push('requirements.txt', 'setup.py', 'README.md', '.gitignore');
    }

    return {
      folders: baseFolders,
      files: baseFiles,
      configFiles,
    };
  }

  /**
   * Generate quality gates based on tech stack
   */
  private generateQualityGates(techStack: string[]): Array<{
    name: string;
    description: string;
    status: 'enabled' | 'disabled';
  }> {
    const baseGates = [
      {
        name: 'TypeScript Strict Mode',
        description: 'Enforces strict TypeScript compilation',
        status: 'enabled' as const,
      },
      {
        name: 'ESLint Code Quality',
        description: 'Enforces code quality standards',
        status: 'enabled' as const,
      },
      {
        name: 'Prettier Formatting',
        description: 'Enforces consistent code formatting',
        status: 'enabled' as const,
      },
      {
        name: 'Unit Test Coverage',
        description: 'Ensures minimum test coverage threshold',
        status: 'enabled' as const,
      },
    ];

    // Add tech-stack specific quality gates
    if (techStack.includes('react')) {
      baseGates.push({
        name: 'React Best Practices',
        description: 'Enforces React development best practices',
        status: 'enabled' as const,
      });
    }

    if (techStack.includes('nodejs')) {
      baseGates.push({
        name: 'Node.js Security',
        description: 'Scans for Node.js security vulnerabilities',
        status: 'enabled' as const,
      });
    }

    if (techStack.includes('python')) {
      baseGates.push({
        name: 'Python Code Quality',
        description: 'Enforces Python PEP 8 standards',
        status: 'enabled' as const,
      });
    }

    return baseGates;
  }

  /**
   * Generate next steps for the project
   */
  private generateNextSteps(projectName: string, targetUsers: string[]): string[] {
    const baseSteps = [
      `Initialize git repository for ${projectName}`,
      'Set up development environment',
      'Install dependencies',
      'Run initial tests',
      'Create first feature branch',
    ];

    if (targetUsers.includes('developers')) {
      baseSteps.push('Set up CI/CD pipeline');
      baseSteps.push('Configure code review process');
    }

    if (targetUsers.includes('designers')) {
      baseSteps.push('Set up design system');
      baseSteps.push('Create component library');
    }

    return baseSteps;
  }

  /**
   * Calculate business value metrics
   */
  private calculateBusinessValue(
    _projectName: string,
    techStack: string[]
  ): {
    costPrevention: number;
    timeSaved: number;
    qualityImprovements: string[];
  } {
    let costPrevention = 1000; // Base cost prevention
    let timeSaved = 40; // Base hours saved

    // Adjust based on tech stack complexity
    if (techStack.includes('react')) {
      costPrevention += 500;
      timeSaved += 20;
    }

    if (techStack.includes('nodejs')) {
      costPrevention += 300;
      timeSaved += 15;
    }

    if (techStack.includes('python')) {
      costPrevention += 200;
      timeSaved += 10;
    }

    const qualityImprovements = [
      'Reduced technical debt',
      'Improved code maintainability',
      'Enhanced security posture',
      'Better test coverage',
      'Consistent code quality',
    ];

    return {
      costPrevention,
      timeSaved,
      qualityImprovements,
    };
  }

  /**
   * Calculate technical metrics
   */
  private calculateTechnicalMetrics(techStack: string[]): {
    responseTime: number;
    securityScore: number;
    complexityScore: number;
  } {
    let responseTime = 50; // Base response time in ms
    let securityScore = 85; // Base security score
    let complexityScore = 3; // Base complexity (1-10 scale)

    // Adjust based on tech stack
    if (techStack.includes('react')) {
      responseTime += 20;
      securityScore += 5;
      complexityScore += 2;
    }

    if (techStack.includes('nodejs')) {
      responseTime += 10;
      securityScore += 3;
      complexityScore += 1;
    }

    if (techStack.includes('python')) {
      responseTime += 15;
      securityScore += 2;
      complexityScore += 1;
    }

    return {
      responseTime: Math.min(responseTime, 200), // Cap at 200ms
      securityScore: Math.min(securityScore, 100), // Cap at 100
      complexityScore: Math.min(complexityScore, 10), // Cap at 10
    };
  }

  /**
   * Generate unique project ID
   */
  private generateProjectId(projectName: string): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const cleanName = projectName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `${cleanName}-${timestamp}-${randomSuffix}`;
  }
}

// Export the tool instance for backward compatibility
export const smartBeginMCPTool = new SmartBeginMCPTool();

// Export the legacy handler for backward compatibility
export async function handleSmartBegin(input: unknown): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
  timestamp: string;
}> {
  const tool = new SmartBeginMCPTool();
  const result = await tool.execute(input as SmartBeginInput);

  return {
    success: result.success,
    data: result.data,
    ...(result.error && { error: result.error }),
    timestamp: result.metadata.timestamp,
  };
}
