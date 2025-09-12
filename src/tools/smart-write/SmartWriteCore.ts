/**
 * Smart Write Core - Main Orchestration Module
 *
 * Main orchestration module that coordinates all smart-write functionality.
 * This replaces the monolithic smart-write.ts with a modular approach.
 * Integrates ContextualAnalyzer, CodeGenerator, and QualityValidator.
 */

import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import {
  ContextualAnalyzer,
  EnhancedInput,
  ProjectAnalysisResult,
  Context7ProjectData
} from './ContextualAnalyzer.js';
import { CodeGenerator, GeneratedCode } from './CodeGenerator.js';
import { QualityValidator, ValidatedGeneratedCode } from './QualityValidator.js';

// Input schema for smart_write tool
const SmartWriteInputSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  featureDescription: z.string().min(1, 'Feature description is required'),
  targetRole: z
    .enum(['developer', 'product-strategist', 'designer', 'qa-engineer', 'operations-engineer'])
    .default('developer'),
  codeType: z
    .enum(['component', 'function', 'api', 'test', 'config', 'documentation'])
    .default('function'),
  techStack: z.array(z.string()).default([]),
  businessContext: z
    .object({
      goals: z.array(z.string()).optional(),
      targetUsers: z.array(z.string()).optional(),
      priority: z.enum(['high', 'medium', 'low']).default('medium'),
    })
    .optional(),
  qualityRequirements: z
    .object({
      testCoverage: z.number().min(0).max(100).default(85),
      complexity: z.number().min(1).max(10).default(5),
      securityLevel: z.enum(['low', 'medium', 'high']).default('medium'),
    })
    .optional(),
  quality: z.enum(['basic', 'standard', 'enterprise', 'production']).default('standard'),
  projectPath: z.string().optional(),
  writeMode: z.enum(['create', 'modify', 'enhance']).default('create'),
  backupOriginal: z.boolean().default(true),
  modificationStrategy: z
    .enum(['in-place', 'side-by-side', 'backup-first'])
    .default('backup-first'),
  externalSources: z
    .object({
      useContext7: z.boolean().default(true),
      useProjectAnalysis: z.boolean().default(true),
      cacheResults: z.boolean().default(true),
    })
    .default({
      useContext7: true,
      useProjectAnalysis: true,
      cacheResults: true,
    }),
});

type SmartWriteInput = z.infer<typeof SmartWriteInputSchema>;

// Execution log for tracking operations
interface ExecutionLog {
  startTime: number;
  duration: number;
  operations: string[];
  projectAnalysisPerformed: boolean;
  context7IntegrationPerformed: boolean;
  qualityValidationPerformed: boolean;
}

let executionLog: ExecutionLog = {
  startTime: 0,
  duration: 0,
  operations: [],
  projectAnalysisPerformed: false,
  context7IntegrationPerformed: false,
  qualityValidationPerformed: false,
};

/**
 * Reset execution log for new operations
 */
function resetExecutionLog() {
  executionLog = {
    startTime: Date.now(),
    duration: 0,
    operations: [],
    projectAnalysisPerformed: false,
    context7IntegrationPerformed: false,
    qualityValidationPerformed: false,
  };
}

/**
 * Smart Write Core orchestrator
 */
export class SmartWriteCore {
  private contextualAnalyzer = new ContextualAnalyzer();
  private codeGenerator = new CodeGenerator();
  private qualityValidator = new QualityValidator();

  /**
   * Main smart write handler
   */
  async handleSmartWrite(args: any): Promise<any> {
    try {
      resetExecutionLog();
      executionLog.operations.push('Input validation');

      // Validate input
      const validatedInput = SmartWriteInputSchema.parse(args);

      // Perform project analysis if requested and path provided
      let projectAnalysis: ProjectAnalysisResult | null = null;
      if (validatedInput.externalSources.useProjectAnalysis && validatedInput.projectPath) {
        executionLog.operations.push('Project analysis');
        projectAnalysis = await this.contextualAnalyzer.analyzeProject(validatedInput.projectPath);
        executionLog.projectAnalysisPerformed = true;

        if (projectAnalysis) {
          console.log(`Project analysis completed: ${projectAnalysis.summary.status} (${projectAnalysis.summary.overallScore})`);
        }
      }

      // Fetch Context7 project insights
      let context7ProjectData: Context7ProjectData | null = null;
      if (validatedInput.externalSources.useContext7) {
        executionLog.operations.push('Context7 integration');
        context7ProjectData = await this.contextualAnalyzer.fetchContext7ProjectData(
          validatedInput,
          projectAnalysis
        );
        executionLog.context7IntegrationPerformed = true;

        if (context7ProjectData) {
          console.log(`Context7 enhanced smart_write for: ${validatedInput.featureDescription} (${validatedInput.writeMode})`);
        }
      }

      // Enhance input with contextual analysis
      executionLog.operations.push('Input enhancement');
      const enhancedInput = await this.contextualAnalyzer.enhanceInput(
        validatedInput,
        projectAnalysis,
        context7ProjectData
      );

      // Generate code
      executionLog.operations.push('Code generation');
      const generatedCode = await this.codeGenerator.generateIntelligentCode(enhancedInput);

      // Validate quality
      executionLog.operations.push('Quality validation');
      const validatedCode = await this.qualityValidator.validateQuality(generatedCode, enhancedInput);
      executionLog.qualityValidationPerformed = true;

      // Update execution log
      executionLog.duration = Date.now() - executionLog.startTime;

      // Create response
      const response = this.createResponse(
        validatedCode,
        enhancedInput,
        projectAnalysis,
        context7ProjectData
      );

      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Create comprehensive response
   */
  private createResponse(
    validatedCode: ValidatedGeneratedCode,
    enhancedInput: EnhancedInput,
    projectAnalysis: ProjectAnalysisResult | null,
    context7ProjectData: Context7ProjectData | null
  ): any {
    const codeId = `code_${Date.now()}_${enhancedInput.featureDescription.toLowerCase().replace(/\s+/g, '_')}`;

    return {
      id: codeId,
      projectId: enhancedInput.projectId,
      featureDescription: enhancedInput.featureDescription,
      targetRole: enhancedInput.targetRole,
      codeType: enhancedInput.codeType,
      writeMode: enhancedInput.writeMode,

      // Generated code and files
      generatedCode: {
        files: validatedCode.files,
        primaryFile: validatedCode.primaryFile,
        dependencies: validatedCode.dependencies,
        summary: validatedCode.summary,
        roleSpecific: validatedCode.roleSpecific,
      },

      // Quality validation results
      qualityAssurance: {
        validationPassed: validatedCode.qualityValidation.passed,
        overallScore: validatedCode.qualityValidation.score,
        metrics: validatedCode.qualityValidation.metrics,
        issues: validatedCode.qualityValidation.issues.length,
        criticalIssues: validatedCode.qualityValidation.issues.filter(i => i.severity === 'critical').length,
        recommendations: validatedCode.qualityValidation.recommendations.slice(0, 5),
        hasQualityEnhancements: !!validatedCode.qualityEnhancements,
      },

      // Execution context
      executionContext: {
        duration: executionLog.duration,
        operations: executionLog.operations,
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        engine: 'SmartWrite-Modular',
      },

      // Project analysis integration
      projectAnalysisIntegration: projectAnalysis ? {
        analysisPerformed: true,
        securityStatus: projectAnalysis.security.status,
        staticStatus: projectAnalysis.static.status,
        overallScore: projectAnalysis.summary.overallScore,
        criticalIssues: projectAnalysis.summary.criticalIssues,
        recommendations: projectAnalysis.summary.recommendations.slice(0, 3),
      } : {
        analysisPerformed: false,
        message: 'Provide projectPath to enable real analysis',
      },

      // Context7 integration
      context7ProjectIntegration: context7ProjectData ? {
        context7ProjectAnalysisPerformed: true,
        topicsGenerated: context7ProjectData.topics.length,
        insightsCount: context7ProjectData.data.length,
        patterns: context7ProjectData.insights.patterns.slice(0, 3),
        warnings: context7ProjectData.insights.warnings,
        techStackInsights: Object.keys(context7ProjectData.insights.techStackSpecific).length,
        fetchTime: context7ProjectData.metadata.fetchTime,
      } : {
        context7ProjectAnalysisPerformed: false,
        message: 'Project analysis required for Context7 project insights',
      },
    };
  }
}

/**
 * Create the MCP tool definition
 */
export const smartWriteTool: Tool = {
  name: 'smart_write',
  description: `Smart Write v2.0 - Modular AI-Assisted Code Generation

Intelligent code generation with Context7 integration, project analysis, quality validation, and role-specific optimizations.

Key Features:
- **Role-Based Generation**: Tailored for developer, product-strategist, designer, qa-engineer, operations-engineer
- **Context7 Integration**: Leverages project context and best practices
- **Quality Validation**: Comprehensive quality assessment with OWASP security analysis
- **Project Analysis**: Real-time project analysis with security scanning
- **Multi-Technology Support**: TypeScript, JavaScript, Python, Java, Go, HTML/CSS
- **Quality Levels**: basic, standard, enterprise, production

Use Cases:
- Generate production-ready components and functions
- Create role-specific implementations with best practices
- Enhance existing code with quality improvements
- Generate comprehensive test suites and documentation
- Create deployment configs and monitoring setup

Example: Generate a user authentication API endpoint for a Node.js backend with high security requirements.`,
  inputSchema: {
    type: 'object',
    properties: {
      projectId: {
        type: 'string',
        description: 'Unique identifier for your project',
        minLength: 1,
      },
      featureDescription: {
        type: 'string',
        description: 'Detailed description of the feature to generate',
        minLength: 1,
      },
      targetRole: {
        type: 'string',
        enum: ['developer', 'product-strategist', 'designer', 'qa-engineer', 'operations-engineer'],
        description: 'Target role for optimized code generation',
        default: 'developer',
      },
      codeType: {
        type: 'string',
        enum: ['component', 'function', 'api', 'test', 'config', 'documentation'],
        description: 'Type of code to generate',
        default: 'function',
      },
      techStack: {
        type: 'array',
        items: { type: 'string' },
        description: 'Technology stack (e.g., ["TypeScript", "React", "Node.js"])',
        default: [],
      },
      businessContext: {
        type: 'object',
        properties: {
          goals: {
            type: 'array',
            items: { type: 'string' },
            description: 'Business goals for the feature',
          },
          targetUsers: {
            type: 'array',
            items: { type: 'string' },
            description: 'Target users for the feature',
          },
          priority: {
            type: 'string',
            enum: ['high', 'medium', 'low'],
            description: 'Priority level of the feature',
            default: 'medium',
          },
        },
        description: 'Business context for code generation',
      },
      qualityRequirements: {
        type: 'object',
        properties: {
          testCoverage: {
            type: 'number',
            minimum: 0,
            maximum: 100,
            description: 'Required test coverage percentage',
            default: 85,
          },
          complexity: {
            type: 'number',
            minimum: 1,
            maximum: 10,
            description: 'Maximum complexity level',
            default: 5,
          },
          securityLevel: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
            description: 'Security level requirement',
            default: 'medium',
          },
        },
        description: 'Quality requirements for generated code',
      },
      writeMode: {
        type: 'string',
        enum: ['create', 'modify', 'enhance'],
        description: 'Mode for writing code: create new, modify existing, or enhance existing',
        default: 'create',
      },
      backupOriginal: {
        type: 'boolean',
        description: 'Whether to backup original files before modification',
        default: true,
      },
      modificationStrategy: {
        type: 'string',
        enum: ['in-place', 'side-by-side', 'backup-first'],
        description: 'Strategy for modifying existing code',
        default: 'backup-first',
      },
      quality: {
        type: 'string',
        enum: ['basic', 'standard', 'enterprise', 'production'],
        description: 'Quality level for code generation (affects complexity and features)',
        default: 'standard',
      },
      projectPath: {
        type: 'string',
        description: 'Path to project directory for real-time analysis (optional)',
      },
      externalSources: {
        type: 'object',
        properties: {
          useContext7: {
            type: 'boolean',
            description: 'Enable Context7 integration for enhanced insights',
            default: true,
          },
          useProjectAnalysis: {
            type: 'boolean',
            description: 'Enable real-time project analysis',
            default: true,
          },
          cacheResults: {
            type: 'boolean',
            description: 'Cache results for improved performance',
            default: true,
          },
        },
        description: 'External data sources configuration',
        default: {
          useContext7: true,
          useProjectAnalysis: true,
          cacheResults: true,
        },
      },
    },
    required: ['projectId', 'featureDescription'],
    additionalProperties: false,
  },
};

/**
 * Smart Write handler function
 */
export async function handleSmartWrite(args: any): Promise<any> {
  const smartWrite = new SmartWriteCore();
  return await smartWrite.handleSmartWrite(args);
}