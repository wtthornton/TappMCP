#!/usr/bin/env node
import { z } from 'zod';
import { MCPTool, MCPToolContext, MCPToolResult } from '../framework/mcp-tool.js';
declare const SmartWriteInputSchema: z.ZodObject<{
    projectId: z.ZodString;
    featureDescription: z.ZodString;
    targetRole: z.ZodDefault<z.ZodEnum<["developer", "product-strategist", "designer", "qa-engineer", "operations-engineer"]>>;
    codeType: z.ZodDefault<z.ZodEnum<["component", "function", "api", "test", "config", "documentation"]>>;
    techStack: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    businessContext: z.ZodOptional<z.ZodObject<{
        goals: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        targetUsers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        priority: z.ZodDefault<z.ZodEnum<["high", "medium", "low"]>>;
    }, "strip", z.ZodTypeAny, {
        priority: "high" | "medium" | "low";
        targetUsers?: string[] | undefined;
        goals?: string[] | undefined;
    }, {
        targetUsers?: string[] | undefined;
        priority?: "high" | "medium" | "low" | undefined;
        goals?: string[] | undefined;
    }>>;
    qualityRequirements: z.ZodOptional<z.ZodObject<{
        testCoverage: z.ZodDefault<z.ZodNumber>;
        complexity: z.ZodDefault<z.ZodNumber>;
        securityLevel: z.ZodDefault<z.ZodEnum<["low", "medium", "high"]>>;
    }, "strip", z.ZodTypeAny, {
        testCoverage: number;
        securityLevel: "high" | "medium" | "low";
        complexity: number;
    }, {
        testCoverage?: number | undefined;
        securityLevel?: "high" | "medium" | "low" | undefined;
        complexity?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    techStack: string[];
    projectId: string;
    featureDescription: string;
    targetRole: "developer" | "product-strategist" | "designer" | "qa-engineer" | "operations-engineer";
    codeType: "function" | "config" | "api" | "component" | "test" | "documentation";
    qualityRequirements?: {
        testCoverage: number;
        securityLevel: "high" | "medium" | "low";
        complexity: number;
    } | undefined;
    businessContext?: {
        priority: "high" | "medium" | "low";
        targetUsers?: string[] | undefined;
        goals?: string[] | undefined;
    } | undefined;
}, {
    projectId: string;
    featureDescription: string;
    techStack?: string[] | undefined;
    qualityRequirements?: {
        testCoverage?: number | undefined;
        securityLevel?: "high" | "medium" | "low" | undefined;
        complexity?: number | undefined;
    } | undefined;
    businessContext?: {
        targetUsers?: string[] | undefined;
        priority?: "high" | "medium" | "low" | undefined;
        goals?: string[] | undefined;
    } | undefined;
    targetRole?: "developer" | "product-strategist" | "designer" | "qa-engineer" | "operations-engineer" | undefined;
    codeType?: "function" | "config" | "api" | "component" | "test" | "documentation" | undefined;
}>;
declare const SmartWriteOutputSchema: z.ZodObject<{
    codeId: z.ZodString;
    generatedCode: z.ZodObject<{
        content: z.ZodString;
        language: z.ZodString;
        framework: z.ZodOptional<z.ZodString>;
        thoughtProcess: z.ZodArray<z.ZodString, "many">;
        dependencies: z.ZodArray<z.ZodString, "many">;
        testCases: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodString;
            code: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            description: string;
            code: string;
            name: string;
        }, {
            description: string;
            code: string;
            name: string;
        }>, "many">;
        documentation: z.ZodObject<{
            description: z.ZodString;
            parameters: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                type: z.ZodString;
                description: z.ZodString;
                required: z.ZodBoolean;
            }, "strip", z.ZodTypeAny, {
                description: string;
                type: string;
                name: string;
                required: boolean;
            }, {
                description: string;
                type: string;
                name: string;
                required: boolean;
            }>, "many">;
            returns: z.ZodString;
            examples: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            description: string;
            examples: string[];
            parameters: {
                description: string;
                type: string;
                name: string;
                required: boolean;
            }[];
            returns: string;
        }, {
            description: string;
            examples: string[];
            parameters: {
                description: string;
                type: string;
                name: string;
                required: boolean;
            }[];
            returns: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        documentation: {
            description: string;
            examples: string[];
            parameters: {
                description: string;
                type: string;
                name: string;
                required: boolean;
            }[];
            returns: string;
        };
        language: string;
        content: string;
        dependencies: string[];
        thoughtProcess: string[];
        testCases: {
            description: string;
            code: string;
            name: string;
        }[];
        framework?: string | undefined;
    }, {
        documentation: {
            description: string;
            examples: string[];
            parameters: {
                description: string;
                type: string;
                name: string;
                required: boolean;
            }[];
            returns: string;
        };
        language: string;
        content: string;
        dependencies: string[];
        thoughtProcess: string[];
        testCases: {
            description: string;
            code: string;
            name: string;
        }[];
        framework?: string | undefined;
    }>;
    qualityMetrics: z.ZodObject<{
        testCoverage: z.ZodNumber;
        complexity: z.ZodNumber;
        securityScore: z.ZodNumber;
        maintainabilityScore: z.ZodNumber;
        performanceScore: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        securityScore: number;
        testCoverage: number;
        complexity: number;
        maintainabilityScore: number;
        performanceScore: number;
    }, {
        securityScore: number;
        testCoverage: number;
        complexity: number;
        maintainabilityScore: number;
        performanceScore: number;
    }>;
    businessValue: z.ZodObject<{
        timeSaved: z.ZodNumber;
        costPrevention: z.ZodNumber;
        qualityImprovements: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        costPrevention: number;
        timeSaved: number;
        qualityImprovements: string[];
    }, {
        costPrevention: number;
        timeSaved: number;
        qualityImprovements: string[];
    }>;
    nextSteps: z.ZodArray<z.ZodString, "many">;
    roleSpecificInsights: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    nextSteps: string[];
    businessValue: {
        costPrevention: number;
        timeSaved: number;
        qualityImprovements: string[];
    };
    qualityMetrics: {
        securityScore: number;
        testCoverage: number;
        complexity: number;
        maintainabilityScore: number;
        performanceScore: number;
    };
    codeId: string;
    generatedCode: {
        documentation: {
            description: string;
            examples: string[];
            parameters: {
                description: string;
                type: string;
                name: string;
                required: boolean;
            }[];
            returns: string;
        };
        language: string;
        content: string;
        dependencies: string[];
        thoughtProcess: string[];
        testCases: {
            description: string;
            code: string;
            name: string;
        }[];
        framework?: string | undefined;
    };
    roleSpecificInsights: string[];
}, {
    nextSteps: string[];
    businessValue: {
        costPrevention: number;
        timeSaved: number;
        qualityImprovements: string[];
    };
    qualityMetrics: {
        securityScore: number;
        testCoverage: number;
        complexity: number;
        maintainabilityScore: number;
        performanceScore: number;
    };
    codeId: string;
    generatedCode: {
        documentation: {
            description: string;
            examples: string[];
            parameters: {
                description: string;
                type: string;
                name: string;
                required: boolean;
            }[];
            returns: string;
        };
        language: string;
        content: string;
        dependencies: string[];
        thoughtProcess: string[];
        testCases: {
            description: string;
            code: string;
            name: string;
        }[];
        framework?: string | undefined;
    };
    roleSpecificInsights: string[];
}>;
export type SmartWriteInput = z.infer<typeof SmartWriteInputSchema>;
export type SmartWriteOutput = z.infer<typeof SmartWriteOutputSchema>;
/**
 * Smart Write MCP Tool
 *
 * Migrated to use MCPTool base class with enhanced error handling,
 * performance monitoring, and standardized patterns.
 */
export declare class SmartWriteMCPTool extends MCPTool<SmartWriteInput, SmartWriteOutput> {
    constructor();
    /**
     * Execute the smart write tool
     */
    execute(input: SmartWriteInput, _context?: MCPToolContext): Promise<MCPToolResult<SmartWriteOutput>>;
    /**
     * Process the smart write logic
     */
    protected executeInternal(input: SmartWriteInput, _context?: MCPToolContext): Promise<SmartWriteOutput>;
    /**
     * Generate unique code ID
     */
    private generateCodeId;
    /**
     * Generate code based on input parameters
     */
    private generateCode;
    /**
     * Determine programming language from tech stack
     */
    private determineLanguage;
    /**
     * Determine framework from tech stack
     */
    private determineFramework;
    /**
     * Generate thought process for code generation
     */
    private generateThoughtProcess;
    /**
     * Generate code content
     */
    private generateCodeContent;
    /**
     * Generate function code
     */
    private generateFunctionCode;
    /**
     * Generate component code
     */
    private generateComponentCode;
    /**
     * Generate API code
     */
    private generateApiCode;
    /**
     * Generate test code
     */
    private generateTestCode;
    /**
     * Generate config code
     */
    private generateConfigCode;
    /**
     * Generate documentation code
     */
    private generateDocumentationCode;
    /**
     * Generate dependencies
     */
    private generateDependencies;
    /**
     * Generate test cases
     */
    private generateTestCases;
    /**
     * Generate documentation
     */
    private generateDocumentation;
    /**
     * Calculate quality metrics
     */
    private calculateQualityMetrics;
    /**
     * Calculate business value
     */
    private calculateBusinessValue;
    /**
     * Generate next steps
     */
    private generateNextSteps;
    /**
     * Generate role-specific insights
     */
    private generateRoleSpecificInsights;
    /**
     * Convert string to PascalCase
     */
    private toPascalCase;
    /**
     * Convert string to camelCase
     */
    private toCamelCase;
    /**
     * Convert string to kebab-case
     */
    private toKebabCase;
}
export declare const smartWriteMCPTool: SmartWriteMCPTool;
export declare function handleSmartWrite(input: unknown): Promise<{
    success: boolean;
    data?: unknown;
    error?: string;
    timestamp: string;
}>;
export {};
//# sourceMappingURL=smart-write-mcp.d.ts.map