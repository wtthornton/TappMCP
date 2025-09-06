import { z } from 'zod';
import { MCPTool, type MCPToolContext, type MCPToolResult } from '../framework/mcp-tool.js';
declare const SmartPlanEnhancedInputSchema: z.ZodObject<{
    projectId: z.ZodString;
    businessRequest: z.ZodString;
    priority: z.ZodDefault<z.ZodEnum<["low", "medium", "high", "critical"]>>;
    timeConstraint: z.ZodOptional<z.ZodString>;
    qualityRequirements: z.ZodDefault<z.ZodObject<{
        security: z.ZodDefault<z.ZodEnum<["basic", "standard", "high"]>>;
        performance: z.ZodDefault<z.ZodEnum<["basic", "standard", "high"]>>;
        accessibility: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        accessibility: boolean;
        performance: "high" | "basic" | "standard";
        security: "high" | "basic" | "standard";
    }, {
        accessibility?: boolean | undefined;
        performance?: "high" | "basic" | "standard" | undefined;
        security?: "high" | "basic" | "standard" | undefined;
    }>>;
    externalSources: z.ZodOptional<z.ZodObject<{
        useContext7: z.ZodDefault<z.ZodBoolean>;
        useWebSearch: z.ZodDefault<z.ZodBoolean>;
        useMemory: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        useContext7: boolean;
        useWebSearch: boolean;
        useMemory: boolean;
    }, {
        useContext7?: boolean | undefined;
        useWebSearch?: boolean | undefined;
        useMemory?: boolean | undefined;
    }>>;
    planType: z.ZodDefault<z.ZodEnum<["strategic", "tactical", "technical", "comprehensive"]>>;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    planType: "technical" | "strategic" | "tactical" | "comprehensive";
    priority: "high" | "medium" | "low" | "critical";
    qualityRequirements: {
        accessibility: boolean;
        performance: "high" | "basic" | "standard";
        security: "high" | "basic" | "standard";
    };
    businessRequest: string;
    externalSources?: {
        useContext7: boolean;
        useWebSearch: boolean;
        useMemory: boolean;
    } | undefined;
    timeConstraint?: string | undefined;
}, {
    projectId: string;
    businessRequest: string;
    planType?: "technical" | "strategic" | "tactical" | "comprehensive" | undefined;
    priority?: "high" | "medium" | "low" | "critical" | undefined;
    qualityRequirements?: {
        accessibility?: boolean | undefined;
        performance?: "high" | "basic" | "standard" | undefined;
        security?: "high" | "basic" | "standard" | undefined;
    } | undefined;
    externalSources?: {
        useContext7?: boolean | undefined;
        useWebSearch?: boolean | undefined;
        useMemory?: boolean | undefined;
    } | undefined;
    timeConstraint?: string | undefined;
}>;
declare const SmartPlanEnhancedOutputSchema: z.ZodObject<{
    planId: z.ZodString;
    planType: z.ZodString;
    businessAnalysis: z.ZodObject<{
        requirements: z.ZodAny;
        complexity: z.ZodAny;
        stakeholderCount: z.ZodNumber;
        riskFactors: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        riskFactors: number;
        stakeholderCount: number;
        complexity?: any;
        requirements?: any;
    }, {
        riskFactors: number;
        stakeholderCount: number;
        complexity?: any;
        requirements?: any;
    }>;
    strategicPlan: z.ZodObject<{
        phases: z.ZodArray<z.ZodAny, "many">;
        timeline: z.ZodAny;
        userStories: z.ZodArray<z.ZodAny, "many">;
        businessValue: z.ZodAny;
    }, "strip", z.ZodTypeAny, {
        phases: any[];
        userStories: any[];
        businessValue?: any;
        timeline?: any;
    }, {
        phases: any[];
        userStories: any[];
        businessValue?: any;
        timeline?: any;
    }>;
    technicalPlan: z.ZodObject<{
        architecture: z.ZodAny;
        effort: z.ZodAny;
        optimization: z.ZodAny;
        qualityGates: z.ZodArray<z.ZodAny, "many">;
    }, "strip", z.ZodTypeAny, {
        qualityGates: any[];
        architecture?: any;
        optimization?: any;
        effort?: any;
    }, {
        qualityGates: any[];
        architecture?: any;
        optimization?: any;
        effort?: any;
    }>;
    validation: z.ZodObject<{
        isValid: z.ZodBoolean;
        issues: z.ZodArray<z.ZodAny, "many">;
        recommendations: z.ZodArray<z.ZodAny, "many">;
        confidenceLevel: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        issues: any[];
        recommendations: any[];
        isValid: boolean;
        confidenceLevel: string;
    }, {
        issues: any[];
        recommendations: any[];
        isValid: boolean;
        confidenceLevel: string;
    }>;
    externalIntegration: z.ZodObject<{
        context7Status: z.ZodString;
        webSearchStatus: z.ZodString;
        memoryStatus: z.ZodString;
        integrationTime: z.ZodNumber;
        knowledgeCount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        context7Status: string;
        webSearchStatus: string;
        memoryStatus: string;
        integrationTime: number;
        knowledgeCount: number;
    }, {
        context7Status: string;
        webSearchStatus: string;
        memoryStatus: string;
        integrationTime: number;
        knowledgeCount: number;
    }>;
    externalKnowledge: z.ZodArray<z.ZodAny, "many">;
    deliverables: z.ZodObject<{
        successMetrics: z.ZodArray<z.ZodString, "many">;
        nextSteps: z.ZodArray<z.ZodString, "many">;
        qualityTargets: z.ZodArray<z.ZodObject<{
            phase: z.ZodString;
            threshold: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            phase: string;
            threshold: string;
        }, {
            phase: string;
            threshold: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        nextSteps: string[];
        successMetrics: string[];
        qualityTargets: {
            phase: string;
            threshold: string;
        }[];
    }, {
        nextSteps: string[];
        successMetrics: string[];
        qualityTargets: {
            phase: string;
            threshold: string;
        }[];
    }>;
    technicalMetrics: z.ZodObject<{
        responseTime: z.ZodNumber;
        planGenerationTime: z.ZodNumber;
        businessAnalysisTime: z.ZodNumber;
        technicalPlanningTime: z.ZodNumber;
        validationTime: z.ZodNumber;
        phasesPlanned: z.ZodNumber;
        tasksPlanned: z.ZodNumber;
        risksIdentified: z.ZodNumber;
        userStoriesGenerated: z.ZodNumber;
        componentsMapped: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        responseTime: number;
        planGenerationTime: number;
        businessAnalysisTime: number;
        technicalPlanningTime: number;
        validationTime: number;
        phasesPlanned: number;
        tasksPlanned: number;
        risksIdentified: number;
        userStoriesGenerated: number;
        componentsMapped: number;
    }, {
        responseTime: number;
        planGenerationTime: number;
        businessAnalysisTime: number;
        technicalPlanningTime: number;
        validationTime: number;
        phasesPlanned: number;
        tasksPlanned: number;
        risksIdentified: number;
        userStoriesGenerated: number;
        componentsMapped: number;
    }>;
    businessMetrics: z.ZodObject<{
        estimatedROI: z.ZodNumber;
        timeToMarket: z.ZodString;
        costSavings: z.ZodNumber;
        riskMitigation: z.ZodNumber;
        qualityImprovement: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        estimatedROI: number;
        timeToMarket: string;
        riskMitigation: number;
        qualityImprovement: string;
        costSavings: number;
    }, {
        estimatedROI: number;
        timeToMarket: string;
        riskMitigation: number;
        qualityImprovement: string;
        costSavings: number;
    }>;
    data: z.ZodObject<{
        projectId: z.ZodString;
        planType: z.ZodString;
        timeConstraint: z.ZodOptional<z.ZodString>;
        qualityRequirements: z.ZodOptional<z.ZodAny>;
        priority: z.ZodOptional<z.ZodString>;
        businessRequest: z.ZodOptional<z.ZodString>;
        externalSources: z.ZodOptional<z.ZodAny>;
        businessAnalysis: z.ZodAny;
        strategicPlan: z.ZodAny;
        technicalPlan: z.ZodAny;
        validation: z.ZodAny;
        externalIntegration: z.ZodAny;
        deliverables: z.ZodAny;
        technicalMetrics: z.ZodAny;
        businessMetrics: z.ZodAny;
    }, "strip", z.ZodTypeAny, {
        projectId: string;
        planType: string;
        validation?: any;
        technicalMetrics?: any;
        priority?: string | undefined;
        qualityRequirements?: any;
        deliverables?: any;
        externalSources?: any;
        externalIntegration?: any;
        businessRequest?: string | undefined;
        timeConstraint?: string | undefined;
        businessAnalysis?: any;
        strategicPlan?: any;
        technicalPlan?: any;
        businessMetrics?: any;
    }, {
        projectId: string;
        planType: string;
        validation?: any;
        technicalMetrics?: any;
        priority?: string | undefined;
        qualityRequirements?: any;
        deliverables?: any;
        externalSources?: any;
        externalIntegration?: any;
        businessRequest?: string | undefined;
        timeConstraint?: string | undefined;
        businessAnalysis?: any;
        strategicPlan?: any;
        technicalPlan?: any;
        businessMetrics?: any;
    }>;
}, "strip", z.ZodTypeAny, {
    validation: {
        issues: any[];
        recommendations: any[];
        isValid: boolean;
        confidenceLevel: string;
    };
    technicalMetrics: {
        responseTime: number;
        planGenerationTime: number;
        businessAnalysisTime: number;
        technicalPlanningTime: number;
        validationTime: number;
        phasesPlanned: number;
        tasksPlanned: number;
        risksIdentified: number;
        userStoriesGenerated: number;
        componentsMapped: number;
    };
    data: {
        projectId: string;
        planType: string;
        validation?: any;
        technicalMetrics?: any;
        priority?: string | undefined;
        qualityRequirements?: any;
        deliverables?: any;
        externalSources?: any;
        externalIntegration?: any;
        businessRequest?: string | undefined;
        timeConstraint?: string | undefined;
        businessAnalysis?: any;
        strategicPlan?: any;
        technicalPlan?: any;
        businessMetrics?: any;
    };
    planType: string;
    deliverables: {
        nextSteps: string[];
        successMetrics: string[];
        qualityTargets: {
            phase: string;
            threshold: string;
        }[];
    };
    externalIntegration: {
        context7Status: string;
        webSearchStatus: string;
        memoryStatus: string;
        integrationTime: number;
        knowledgeCount: number;
    };
    planId: string;
    businessAnalysis: {
        riskFactors: number;
        stakeholderCount: number;
        complexity?: any;
        requirements?: any;
    };
    strategicPlan: {
        phases: any[];
        userStories: any[];
        businessValue?: any;
        timeline?: any;
    };
    technicalPlan: {
        qualityGates: any[];
        architecture?: any;
        optimization?: any;
        effort?: any;
    };
    externalKnowledge: any[];
    businessMetrics: {
        estimatedROI: number;
        timeToMarket: string;
        riskMitigation: number;
        qualityImprovement: string;
        costSavings: number;
    };
}, {
    validation: {
        issues: any[];
        recommendations: any[];
        isValid: boolean;
        confidenceLevel: string;
    };
    technicalMetrics: {
        responseTime: number;
        planGenerationTime: number;
        businessAnalysisTime: number;
        technicalPlanningTime: number;
        validationTime: number;
        phasesPlanned: number;
        tasksPlanned: number;
        risksIdentified: number;
        userStoriesGenerated: number;
        componentsMapped: number;
    };
    data: {
        projectId: string;
        planType: string;
        validation?: any;
        technicalMetrics?: any;
        priority?: string | undefined;
        qualityRequirements?: any;
        deliverables?: any;
        externalSources?: any;
        externalIntegration?: any;
        businessRequest?: string | undefined;
        timeConstraint?: string | undefined;
        businessAnalysis?: any;
        strategicPlan?: any;
        technicalPlan?: any;
        businessMetrics?: any;
    };
    planType: string;
    deliverables: {
        nextSteps: string[];
        successMetrics: string[];
        qualityTargets: {
            phase: string;
            threshold: string;
        }[];
    };
    externalIntegration: {
        context7Status: string;
        webSearchStatus: string;
        memoryStatus: string;
        integrationTime: number;
        knowledgeCount: number;
    };
    planId: string;
    businessAnalysis: {
        riskFactors: number;
        stakeholderCount: number;
        complexity?: any;
        requirements?: any;
    };
    strategicPlan: {
        phases: any[];
        userStories: any[];
        businessValue?: any;
        timeline?: any;
    };
    technicalPlan: {
        qualityGates: any[];
        architecture?: any;
        optimization?: any;
        effort?: any;
    };
    externalKnowledge: any[];
    businessMetrics: {
        estimatedROI: number;
        timeToMarket: string;
        riskMitigation: number;
        qualityImprovement: string;
        costSavings: number;
    };
}>;
type SmartPlanEnhancedInput = z.infer<typeof SmartPlanEnhancedInputSchema>;
type SmartPlanEnhancedOutput = z.infer<typeof SmartPlanEnhancedOutputSchema>;
/**
 * Smart Plan Enhanced MCP Tool
 * Generates comprehensive business and technical plans with external MCP integration
 */
export declare class SmartPlanEnhancedMCPTool extends MCPTool<SmartPlanEnhancedInput, SmartPlanEnhancedOutput> {
    private planGenerator;
    private mcpCoordinator;
    constructor();
    /**
     * Execute the smart plan enhanced tool
     */
    execute(input: SmartPlanEnhancedInput, _context?: MCPToolContext): Promise<MCPToolResult<SmartPlanEnhancedOutput>>;
    /**
     * Process the smart plan enhanced logic
     */
    protected executeInternal(input: SmartPlanEnhancedInput, _context?: MCPToolContext): Promise<SmartPlanEnhancedOutput>;
}
export {};
//# sourceMappingURL=smart-plan-enhanced-mcp.d.ts.map