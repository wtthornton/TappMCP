#!/usr/bin/env node
import { z } from 'zod';
import { MCPTool, MCPToolContext, MCPToolResult } from '../framework/mcp-tool.js';
declare const SmartBeginInputSchema: z.ZodObject<{
    projectName: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    techStack: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    targetUsers: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    businessGoals: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    projectName: string;
    techStack: string[];
    targetUsers: string[];
    description?: string | undefined;
    businessGoals?: string[] | undefined;
}, {
    projectName: string;
    description?: string | undefined;
    techStack?: string[] | undefined;
    targetUsers?: string[] | undefined;
    businessGoals?: string[] | undefined;
}>;
declare const SmartBeginOutputSchema: z.ZodObject<{
    projectId: z.ZodString;
    projectStructure: z.ZodObject<{
        folders: z.ZodArray<z.ZodString, "many">;
        files: z.ZodArray<z.ZodString, "many">;
        configFiles: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        folders: string[];
        files: string[];
        configFiles: string[];
    }, {
        folders: string[];
        files: string[];
        configFiles: string[];
    }>;
    qualityGates: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        status: z.ZodEnum<["enabled", "disabled"]>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        status: "enabled" | "disabled";
        name: string;
    }, {
        description: string;
        status: "enabled" | "disabled";
        name: string;
    }>, "many">;
    nextSteps: z.ZodArray<z.ZodString, "many">;
    businessValue: z.ZodObject<{
        costPrevention: z.ZodNumber;
        timeSaved: z.ZodNumber;
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
    technicalMetrics: z.ZodObject<{
        responseTime: z.ZodNumber;
        securityScore: z.ZodNumber;
        complexityScore: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        responseTime: number;
        securityScore: number;
        complexityScore: number;
    }, {
        responseTime: number;
        securityScore: number;
        complexityScore: number;
    }>;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    projectStructure: {
        folders: string[];
        files: string[];
        configFiles: string[];
    };
    qualityGates: {
        description: string;
        status: "enabled" | "disabled";
        name: string;
    }[];
    nextSteps: string[];
    businessValue: {
        costPrevention: number;
        timeSaved: number;
        qualityImprovements: string[];
    };
    technicalMetrics: {
        responseTime: number;
        securityScore: number;
        complexityScore: number;
    };
}, {
    projectId: string;
    projectStructure: {
        folders: string[];
        files: string[];
        configFiles: string[];
    };
    qualityGates: {
        description: string;
        status: "enabled" | "disabled";
        name: string;
    }[];
    nextSteps: string[];
    businessValue: {
        costPrevention: number;
        timeSaved: number;
        qualityImprovements: string[];
    };
    technicalMetrics: {
        responseTime: number;
        securityScore: number;
        complexityScore: number;
    };
}>;
export type SmartBeginInput = z.infer<typeof SmartBeginInputSchema>;
export type SmartBeginOutput = z.infer<typeof SmartBeginOutputSchema>;
/**
 * Smart Begin MCP Tool
 *
 * Migrated to use MCPTool base class with enhanced error handling,
 * performance monitoring, and standardized patterns.
 */
export declare class SmartBeginMCPTool extends MCPTool<SmartBeginInput, SmartBeginOutput> {
    constructor();
    /**
     * Execute the smart begin tool
     */
    execute(input: SmartBeginInput, _context?: MCPToolContext): Promise<MCPToolResult<SmartBeginOutput>>;
    /**
     * Process the smart begin logic
     */
    protected executeInternal(input: SmartBeginInput, _context?: MCPToolContext): Promise<SmartBeginOutput>;
    /**
     * Generate project structure based on tech stack
     */
    private generateProjectStructure;
    /**
     * Generate quality gates based on tech stack
     */
    private generateQualityGates;
    /**
     * Generate next steps for the project
     */
    private generateNextSteps;
    /**
     * Calculate business value metrics
     */
    private calculateBusinessValue;
    /**
     * Calculate technical metrics
     */
    private calculateTechnicalMetrics;
    /**
     * Generate unique project ID
     */
    private generateProjectId;
}
export declare const smartBeginMCPTool: SmartBeginMCPTool;
export declare function handleSmartBegin(input: unknown): Promise<{
    success: boolean;
    data?: unknown;
    error?: string;
    timestamp: string;
}>;
export {};
//# sourceMappingURL=smart-begin-mcp.d.ts.map