#!/usr/bin/env node
import { z } from 'zod';
export declare const PlanPhaseSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    duration: z.ZodNumber;
    startDate: z.ZodString;
    endDate: z.ZodString;
    tasks: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        type: z.ZodEnum<["development", "testing", "deployment", "documentation", "research"]>;
        priority: z.ZodEnum<["low", "medium", "high", "critical"]>;
        estimatedHours: z.ZodNumber;
        assignedTo: z.ZodOptional<z.ZodString>;
        status: z.ZodDefault<z.ZodEnum<["pending", "in_progress", "completed"]>>;
    }, "strip", z.ZodTypeAny, {
        priority: "low" | "medium" | "high" | "critical";
        type: "documentation" | "development" | "testing" | "deployment" | "research";
        status: "pending" | "completed" | "in_progress";
        name: string;
        description: string;
        id: string;
        estimatedHours: number;
        assignedTo?: string | undefined;
    }, {
        priority: "low" | "medium" | "high" | "critical";
        type: "documentation" | "development" | "testing" | "deployment" | "research";
        name: string;
        description: string;
        id: string;
        estimatedHours: number;
        status?: "pending" | "completed" | "in_progress" | undefined;
        assignedTo?: string | undefined;
    }>, "many">;
    deliverables: z.ZodArray<z.ZodString, "many">;
    risks: z.ZodArray<z.ZodString, "many">;
    milestones: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    id: string;
    deliverables: string[];
    duration: number;
    startDate: string;
    endDate: string;
    tasks: {
        priority: "low" | "medium" | "high" | "critical";
        type: "documentation" | "development" | "testing" | "deployment" | "research";
        status: "pending" | "completed" | "in_progress";
        name: string;
        description: string;
        id: string;
        estimatedHours: number;
        assignedTo?: string | undefined;
    }[];
    milestones: string[];
    risks: string[];
}, {
    name: string;
    description: string;
    id: string;
    deliverables: string[];
    duration: number;
    startDate: string;
    endDate: string;
    tasks: {
        priority: "low" | "medium" | "high" | "critical";
        type: "documentation" | "development" | "testing" | "deployment" | "research";
        name: string;
        description: string;
        id: string;
        estimatedHours: number;
        status?: "pending" | "completed" | "in_progress" | undefined;
        assignedTo?: string | undefined;
    }[];
    milestones: string[];
    risks: string[];
}>;
export declare const ComprehensivePlanSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    businessRequirements: z.ZodObject<{
        primaryGoals: z.ZodArray<z.ZodString, "many">;
        targetUsers: z.ZodArray<z.ZodString, "many">;
        successCriteria: z.ZodArray<z.ZodString, "many">;
        constraints: z.ZodArray<z.ZodString, "many">;
        riskFactors: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        constraints: string[];
        primaryGoals: string[];
        targetUsers: string[];
        successCriteria: string[];
        riskFactors: string[];
    }, {
        constraints: string[];
        primaryGoals: string[];
        targetUsers: string[];
        successCriteria: string[];
        riskFactors: string[];
    }>;
    complexity: z.ZodObject<{
        technical: z.ZodEnum<["low", "medium", "high", "very-high"]>;
        business: z.ZodEnum<["low", "medium", "high", "very-high"]>;
        integration: z.ZodEnum<["low", "medium", "high", "very-high"]>;
        overall: z.ZodEnum<["low", "medium", "high", "very-high"]>;
        factors: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        overall: "low" | "medium" | "high" | "very-high";
        technical: "low" | "medium" | "high" | "very-high";
        business: "low" | "medium" | "high" | "very-high";
        integration: "low" | "medium" | "high" | "very-high";
        factors: string[];
    }, {
        overall: "low" | "medium" | "high" | "very-high";
        technical: "low" | "medium" | "high" | "very-high";
        business: "low" | "medium" | "high" | "very-high";
        integration: "low" | "medium" | "high" | "very-high";
        factors: string[];
    }>;
    architecture: z.ZodObject<{
        components: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            type: z.ZodEnum<["frontend", "backend", "database", "external", "service"]>;
            description: z.ZodString;
            dependencies: z.ZodArray<z.ZodString, "many">;
            complexity: z.ZodEnum<["low", "medium", "high"]>;
        }, "strip", z.ZodTypeAny, {
            type: "external" | "frontend" | "service" | "database" | "backend";
            name: string;
            description: string;
            dependencies: string[];
            complexity: "low" | "medium" | "high";
        }, {
            type: "external" | "frontend" | "service" | "database" | "backend";
            name: string;
            description: string;
            dependencies: string[];
            complexity: "low" | "medium" | "high";
        }>, "many">;
        patterns: z.ZodArray<z.ZodString, "many">;
        technologies: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            category: z.ZodEnum<["language", "framework", "database", "tool", "service"]>;
            justification: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            category: "service" | "database" | "language" | "framework" | "tool";
            justification: string;
        }, {
            name: string;
            category: "service" | "database" | "language" | "framework" | "tool";
            justification: string;
        }>, "many">;
        constraints: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        constraints: string[];
        patterns: string[];
        technologies: {
            name: string;
            category: "service" | "database" | "language" | "framework" | "tool";
            justification: string;
        }[];
        components: {
            type: "external" | "frontend" | "service" | "database" | "backend";
            name: string;
            description: string;
            dependencies: string[];
            complexity: "low" | "medium" | "high";
        }[];
    }, {
        constraints: string[];
        patterns: string[];
        technologies: {
            name: string;
            category: "service" | "database" | "language" | "framework" | "tool";
            justification: string;
        }[];
        components: {
            type: "external" | "frontend" | "service" | "database" | "backend";
            name: string;
            description: string;
            dependencies: string[];
            complexity: "low" | "medium" | "high";
        }[];
    }>;
    phases: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        duration: z.ZodNumber;
        startDate: z.ZodString;
        endDate: z.ZodString;
        tasks: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            description: z.ZodString;
            type: z.ZodEnum<["development", "testing", "deployment", "documentation", "research"]>;
            priority: z.ZodEnum<["low", "medium", "high", "critical"]>;
            estimatedHours: z.ZodNumber;
            assignedTo: z.ZodOptional<z.ZodString>;
            status: z.ZodDefault<z.ZodEnum<["pending", "in_progress", "completed"]>>;
        }, "strip", z.ZodTypeAny, {
            priority: "low" | "medium" | "high" | "critical";
            type: "documentation" | "development" | "testing" | "deployment" | "research";
            status: "pending" | "completed" | "in_progress";
            name: string;
            description: string;
            id: string;
            estimatedHours: number;
            assignedTo?: string | undefined;
        }, {
            priority: "low" | "medium" | "high" | "critical";
            type: "documentation" | "development" | "testing" | "deployment" | "research";
            name: string;
            description: string;
            id: string;
            estimatedHours: number;
            status?: "pending" | "completed" | "in_progress" | undefined;
            assignedTo?: string | undefined;
        }>, "many">;
        deliverables: z.ZodArray<z.ZodString, "many">;
        risks: z.ZodArray<z.ZodString, "many">;
        milestones: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        name: string;
        description: string;
        id: string;
        deliverables: string[];
        duration: number;
        startDate: string;
        endDate: string;
        tasks: {
            priority: "low" | "medium" | "high" | "critical";
            type: "documentation" | "development" | "testing" | "deployment" | "research";
            status: "pending" | "completed" | "in_progress";
            name: string;
            description: string;
            id: string;
            estimatedHours: number;
            assignedTo?: string | undefined;
        }[];
        milestones: string[];
        risks: string[];
    }, {
        name: string;
        description: string;
        id: string;
        deliverables: string[];
        duration: number;
        startDate: string;
        endDate: string;
        tasks: {
            priority: "low" | "medium" | "high" | "critical";
            type: "documentation" | "development" | "testing" | "deployment" | "research";
            name: string;
            description: string;
            id: string;
            estimatedHours: number;
            status?: "pending" | "completed" | "in_progress" | undefined;
            assignedTo?: string | undefined;
        }[];
        milestones: string[];
        risks: string[];
    }>, "many">;
    userStories: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        asA: z.ZodString;
        iWant: z.ZodString;
        soThat: z.ZodString;
        acceptanceCriteria: z.ZodArray<z.ZodString, "many">;
        priority: z.ZodEnum<["low", "medium", "high", "critical"]>;
        estimatedEffort: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        priority: "low" | "medium" | "high" | "critical";
        description: string;
        id: string;
        title: string;
        asA: string;
        iWant: string;
        soThat: string;
        acceptanceCriteria: string[];
        estimatedEffort: number;
    }, {
        priority: "low" | "medium" | "high" | "critical";
        description: string;
        id: string;
        title: string;
        asA: string;
        iWant: string;
        soThat: string;
        acceptanceCriteria: string[];
        estimatedEffort: number;
    }>, "many">;
    risks: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        category: z.ZodEnum<["technical", "business", "resource", "timeline", "quality"]>;
        probability: z.ZodEnum<["low", "medium", "high"]>;
        impact: z.ZodEnum<["low", "medium", "high"]>;
        severity: z.ZodEnum<["low", "medium", "high", "critical"]>;
        mitigation: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        severity: "low" | "medium" | "high" | "critical";
        name: string;
        description: string;
        id: string;
        category: "resource" | "quality" | "technical" | "business" | "timeline";
        impact: "low" | "medium" | "high";
        probability: "low" | "medium" | "high";
        mitigation: string[];
    }, {
        severity: "low" | "medium" | "high" | "critical";
        name: string;
        description: string;
        id: string;
        category: "resource" | "quality" | "technical" | "business" | "timeline";
        impact: "low" | "medium" | "high";
        probability: "low" | "medium" | "high";
        mitigation: string[];
    }>, "many">;
    timeline: z.ZodObject<{
        phases: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            startDate: z.ZodString;
            endDate: z.ZodString;
            duration: z.ZodNumber;
            tasks: z.ZodArray<z.ZodString, "many">;
            milestones: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            name: string;
            id: string;
            duration: number;
            startDate: string;
            endDate: string;
            tasks: string[];
            milestones: string[];
        }, {
            name: string;
            id: string;
            duration: number;
            startDate: string;
            endDate: string;
            tasks: string[];
            milestones: string[];
        }>, "many">;
        criticalPath: z.ZodArray<z.ZodString, "many">;
        totalDuration: z.ZodNumber;
        bufferTime: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        phases: {
            name: string;
            id: string;
            duration: number;
            startDate: string;
            endDate: string;
            tasks: string[];
            milestones: string[];
        }[];
        criticalPath: string[];
        totalDuration: number;
        bufferTime: number;
    }, {
        phases: {
            name: string;
            id: string;
            duration: number;
            startDate: string;
            endDate: string;
            tasks: string[];
            milestones: string[];
        }[];
        criticalPath: string[];
        totalDuration: number;
        bufferTime: number;
    }>;
    effort: z.ZodObject<{
        totalHours: z.ZodNumber;
        breakdown: z.ZodObject<{
            development: z.ZodNumber;
            testing: z.ZodNumber;
            deployment: z.ZodNumber;
            documentation: z.ZodNumber;
            research: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            documentation: number;
            development: number;
            testing: number;
            deployment: number;
            research: number;
        }, {
            documentation: number;
            development: number;
            testing: number;
            deployment: number;
            research: number;
        }>;
        confidence: z.ZodEnum<["low", "medium", "high"]>;
        assumptions: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        confidence: "low" | "medium" | "high";
        breakdown: {
            documentation: number;
            development: number;
            testing: number;
            deployment: number;
            research: number;
        };
        assumptions: string[];
        totalHours: number;
    }, {
        confidence: "low" | "medium" | "high";
        breakdown: {
            documentation: number;
            development: number;
            testing: number;
            deployment: number;
            research: number;
        };
        assumptions: string[];
        totalHours: number;
    }>;
    optimization: z.ZodObject<{
        originalEffort: z.ZodNumber;
        optimizedEffort: z.ZodNumber;
        savingsHours: z.ZodNumber;
        optimizations: z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["parallel", "reuse", "simplify", "automate"]>;
            description: z.ZodString;
            impact: z.ZodString;
            savings: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            type: "parallel" | "reuse" | "simplify" | "automate";
            description: string;
            impact: string;
            savings: number;
        }, {
            type: "parallel" | "reuse" | "simplify" | "automate";
            description: string;
            impact: string;
            savings: number;
        }>, "many">;
        riskAdjustments: z.ZodArray<z.ZodObject<{
            risk: z.ZodString;
            adjustment: z.ZodString;
            impact: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            risk: string;
            impact: number;
            adjustment: string;
        }, {
            risk: string;
            impact: number;
            adjustment: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        optimizations: {
            type: "parallel" | "reuse" | "simplify" | "automate";
            description: string;
            impact: string;
            savings: number;
        }[];
        originalEffort: number;
        optimizedEffort: number;
        savingsHours: number;
        riskAdjustments: {
            risk: string;
            impact: number;
            adjustment: string;
        }[];
    }, {
        optimizations: {
            type: "parallel" | "reuse" | "simplify" | "automate";
            description: string;
            impact: string;
            savings: number;
        }[];
        originalEffort: number;
        optimizedEffort: number;
        savingsHours: number;
        riskAdjustments: {
            risk: string;
            impact: number;
            adjustment: string;
        }[];
    }>;
    businessValue: z.ZodObject<{
        estimatedROI: z.ZodNumber;
        timeToMarket: z.ZodNumber;
        riskMitigation: z.ZodNumber;
        qualityImprovement: z.ZodNumber;
        costSavings: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        estimatedROI: number;
        timeToMarket: number;
        riskMitigation: number;
        qualityImprovement: number;
        costSavings: number;
    }, {
        estimatedROI: number;
        timeToMarket: number;
        riskMitigation: number;
        qualityImprovement: number;
        costSavings: number;
    }>;
    qualityGates: z.ZodArray<z.ZodObject<{
        phase: z.ZodString;
        criteria: z.ZodArray<z.ZodString, "many">;
        threshold: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        phase: string;
        threshold: string;
        criteria: string[];
    }, {
        phase: string;
        threshold: string;
        criteria: string[];
    }>, "many">;
    successMetrics: z.ZodArray<z.ZodString, "many">;
    nextSteps: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    id: string;
    complexity: {
        overall: "low" | "medium" | "high" | "very-high";
        technical: "low" | "medium" | "high" | "very-high";
        business: "low" | "medium" | "high" | "very-high";
        integration: "low" | "medium" | "high" | "very-high";
        factors: string[];
    };
    architecture: {
        constraints: string[];
        patterns: string[];
        technologies: {
            name: string;
            category: "service" | "database" | "language" | "framework" | "tool";
            justification: string;
        }[];
        components: {
            type: "external" | "frontend" | "service" | "database" | "backend";
            name: string;
            description: string;
            dependencies: string[];
            complexity: "low" | "medium" | "high";
        }[];
    };
    businessValue: {
        estimatedROI: number;
        timeToMarket: number;
        riskMitigation: number;
        qualityImprovement: number;
        costSavings: number;
    };
    optimization: {
        optimizations: {
            type: "parallel" | "reuse" | "simplify" | "automate";
            description: string;
            impact: string;
            savings: number;
        }[];
        originalEffort: number;
        optimizedEffort: number;
        savingsHours: number;
        riskAdjustments: {
            risk: string;
            impact: number;
            adjustment: string;
        }[];
    };
    timeline: {
        phases: {
            name: string;
            id: string;
            duration: number;
            startDate: string;
            endDate: string;
            tasks: string[];
            milestones: string[];
        }[];
        criticalPath: string[];
        totalDuration: number;
        bufferTime: number;
    };
    phases: {
        name: string;
        description: string;
        id: string;
        deliverables: string[];
        duration: number;
        startDate: string;
        endDate: string;
        tasks: {
            priority: "low" | "medium" | "high" | "critical";
            type: "documentation" | "development" | "testing" | "deployment" | "research";
            status: "pending" | "completed" | "in_progress";
            name: string;
            description: string;
            id: string;
            estimatedHours: number;
            assignedTo?: string | undefined;
        }[];
        milestones: string[];
        risks: string[];
    }[];
    businessRequirements: {
        constraints: string[];
        primaryGoals: string[];
        targetUsers: string[];
        successCriteria: string[];
        riskFactors: string[];
    };
    qualityGates: {
        phase: string;
        threshold: string;
        criteria: string[];
    }[];
    nextSteps: string[];
    successMetrics: string[];
    risks: {
        severity: "low" | "medium" | "high" | "critical";
        name: string;
        description: string;
        id: string;
        category: "resource" | "quality" | "technical" | "business" | "timeline";
        impact: "low" | "medium" | "high";
        probability: "low" | "medium" | "high";
        mitigation: string[];
    }[];
    userStories: {
        priority: "low" | "medium" | "high" | "critical";
        description: string;
        id: string;
        title: string;
        asA: string;
        iWant: string;
        soThat: string;
        acceptanceCriteria: string[];
        estimatedEffort: number;
    }[];
    effort: {
        confidence: "low" | "medium" | "high";
        breakdown: {
            documentation: number;
            development: number;
            testing: number;
            deployment: number;
            research: number;
        };
        assumptions: string[];
        totalHours: number;
    };
}, {
    name: string;
    description: string;
    id: string;
    complexity: {
        overall: "low" | "medium" | "high" | "very-high";
        technical: "low" | "medium" | "high" | "very-high";
        business: "low" | "medium" | "high" | "very-high";
        integration: "low" | "medium" | "high" | "very-high";
        factors: string[];
    };
    architecture: {
        constraints: string[];
        patterns: string[];
        technologies: {
            name: string;
            category: "service" | "database" | "language" | "framework" | "tool";
            justification: string;
        }[];
        components: {
            type: "external" | "frontend" | "service" | "database" | "backend";
            name: string;
            description: string;
            dependencies: string[];
            complexity: "low" | "medium" | "high";
        }[];
    };
    businessValue: {
        estimatedROI: number;
        timeToMarket: number;
        riskMitigation: number;
        qualityImprovement: number;
        costSavings: number;
    };
    optimization: {
        optimizations: {
            type: "parallel" | "reuse" | "simplify" | "automate";
            description: string;
            impact: string;
            savings: number;
        }[];
        originalEffort: number;
        optimizedEffort: number;
        savingsHours: number;
        riskAdjustments: {
            risk: string;
            impact: number;
            adjustment: string;
        }[];
    };
    timeline: {
        phases: {
            name: string;
            id: string;
            duration: number;
            startDate: string;
            endDate: string;
            tasks: string[];
            milestones: string[];
        }[];
        criticalPath: string[];
        totalDuration: number;
        bufferTime: number;
    };
    phases: {
        name: string;
        description: string;
        id: string;
        deliverables: string[];
        duration: number;
        startDate: string;
        endDate: string;
        tasks: {
            priority: "low" | "medium" | "high" | "critical";
            type: "documentation" | "development" | "testing" | "deployment" | "research";
            name: string;
            description: string;
            id: string;
            estimatedHours: number;
            status?: "pending" | "completed" | "in_progress" | undefined;
            assignedTo?: string | undefined;
        }[];
        milestones: string[];
        risks: string[];
    }[];
    businessRequirements: {
        constraints: string[];
        primaryGoals: string[];
        targetUsers: string[];
        successCriteria: string[];
        riskFactors: string[];
    };
    qualityGates: {
        phase: string;
        threshold: string;
        criteria: string[];
    }[];
    nextSteps: string[];
    successMetrics: string[];
    risks: {
        severity: "low" | "medium" | "high" | "critical";
        name: string;
        description: string;
        id: string;
        category: "resource" | "quality" | "technical" | "business" | "timeline";
        impact: "low" | "medium" | "high";
        probability: "low" | "medium" | "high";
        mitigation: string[];
    }[];
    userStories: {
        priority: "low" | "medium" | "high" | "critical";
        description: string;
        id: string;
        title: string;
        asA: string;
        iWant: string;
        soThat: string;
        acceptanceCriteria: string[];
        estimatedEffort: number;
    }[];
    effort: {
        confidence: "low" | "medium" | "high";
        breakdown: {
            documentation: number;
            development: number;
            testing: number;
            deployment: number;
            research: number;
        };
        assumptions: string[];
        totalHours: number;
    };
}>;
export type PlanPhase = z.infer<typeof PlanPhaseSchema>;
export type ComprehensivePlan = z.infer<typeof ComprehensivePlanSchema>;
export interface PlanGenerationInput {
    projectId: string;
    businessRequest: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    timeConstraint?: string;
    qualityRequirements: {
        security: 'basic' | 'standard' | 'high';
        performance: 'basic' | 'standard' | 'high';
        accessibility: boolean;
    };
    externalKnowledge?: Array<{
        id: string;
        source: string;
        type: string;
        title: string;
        content: string;
        relevanceScore: number;
    }>;
}
export declare class PlanGenerator {
    private businessAnalyzer;
    private technicalPlanner;
    constructor();
    /**
     * Generate comprehensive project plan from business request
     */
    generatePlan(input: PlanGenerationInput): Promise<ComprehensivePlan>;
    /**
     * Validate plan against business requirements
     */
    validatePlan(plan: ComprehensivePlan): {
        isValid: boolean;
        issues: string[];
        recommendations: string[];
    };
    private generateTasks;
    private createPhases;
    private extractTimeConstraintWeeks;
    private calculateBusinessValue;
    private defineQualityGates;
    private generateSuccessMetrics;
    private generateNextSteps;
    private getPhaseForStory;
    private generateFallbackPlan;
    private getComplexityMultiplier;
}
//# sourceMappingURL=plan-generator.d.ts.map