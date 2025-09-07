#!/usr/bin/env node
import { z } from 'zod';
import type { BusinessRequirements } from './business-analyzer.js';
export declare const ArchitectureSchema: z.ZodObject<{
    components: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        type: z.ZodEnum<["frontend", "backend", "database", "external", "service"]>;
        description: z.ZodString;
        dependencies: z.ZodArray<z.ZodString, "many">;
        complexity: z.ZodEnum<["low", "medium", "high"]>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        type: "database" | "service" | "external" | "frontend" | "backend";
        name: string;
        complexity: "high" | "medium" | "low";
        dependencies: string[];
    }, {
        description: string;
        type: "database" | "service" | "external" | "frontend" | "backend";
        name: string;
        complexity: "high" | "medium" | "low";
        dependencies: string[];
    }>, "many">;
    patterns: z.ZodArray<z.ZodString, "many">;
    technologies: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        category: z.ZodEnum<["language", "framework", "database", "tool", "service"]>;
        justification: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        category: "database" | "service" | "tool" | "language" | "framework";
        justification: string;
    }, {
        name: string;
        category: "database" | "service" | "tool" | "language" | "framework";
        justification: string;
    }>, "many">;
    constraints: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    constraints: string[];
    components: {
        description: string;
        type: "database" | "service" | "external" | "frontend" | "backend";
        name: string;
        complexity: "high" | "medium" | "low";
        dependencies: string[];
    }[];
    patterns: string[];
    technologies: {
        name: string;
        category: "database" | "service" | "tool" | "language" | "framework";
        justification: string;
    }[];
}, {
    constraints: string[];
    components: {
        description: string;
        type: "database" | "service" | "external" | "frontend" | "backend";
        name: string;
        complexity: "high" | "medium" | "low";
        dependencies: string[];
    }[];
    patterns: string[];
    technologies: {
        name: string;
        category: "database" | "service" | "tool" | "language" | "framework";
        justification: string;
    }[];
}>;
export declare const TaskSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    type: z.ZodEnum<["development", "testing", "deployment", "documentation", "research"]>;
    priority: z.ZodEnum<["low", "medium", "high", "critical"]>;
    estimatedHours: z.ZodNumber;
    dependencies: z.ZodArray<z.ZodString, "many">;
    skills: z.ZodArray<z.ZodString, "many">;
    phase: z.ZodString;
}, "strip", z.ZodTypeAny, {
    description: string;
    type: "documentation" | "testing" | "development" | "deployment" | "research";
    name: string;
    priority: "high" | "medium" | "low" | "critical";
    phase: string;
    id: string;
    dependencies: string[];
    estimatedHours: number;
    skills: string[];
}, {
    description: string;
    type: "documentation" | "testing" | "development" | "deployment" | "research";
    name: string;
    priority: "high" | "medium" | "low" | "critical";
    phase: string;
    id: string;
    dependencies: string[];
    estimatedHours: number;
    skills: string[];
}>;
export declare const EffortEstimateSchema: z.ZodObject<{
    totalHours: z.ZodNumber;
    breakdown: z.ZodObject<{
        development: z.ZodNumber;
        testing: z.ZodNumber;
        deployment: z.ZodNumber;
        documentation: z.ZodNumber;
        research: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        documentation: number;
        testing: number;
        development: number;
        deployment: number;
        research: number;
    }, {
        documentation: number;
        testing: number;
        development: number;
        deployment: number;
        research: number;
    }>;
    confidence: z.ZodEnum<["low", "medium", "high"]>;
    assumptions: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    confidence: "high" | "medium" | "low";
    totalHours: number;
    breakdown: {
        documentation: number;
        testing: number;
        development: number;
        deployment: number;
        research: number;
    };
    assumptions: string[];
}, {
    confidence: "high" | "medium" | "low";
    totalHours: number;
    breakdown: {
        documentation: number;
        testing: number;
        development: number;
        deployment: number;
        research: number;
    };
    assumptions: string[];
}>;
export declare const DependencySchema: z.ZodObject<{
    id: z.ZodString;
    from: z.ZodString;
    to: z.ZodString;
    type: z.ZodEnum<["blocks", "requires", "enables", "influences"]>;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    description: string;
    type: "blocks" | "requires" | "enables" | "influences";
    id: string;
    to: string;
    from: string;
}, {
    description: string;
    type: "blocks" | "requires" | "enables" | "influences";
    id: string;
    to: string;
    from: string;
}>;
export declare const TimelineSchema: z.ZodObject<{
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
        startDate: string;
        endDate: string;
        duration: number;
        id: string;
        tasks: string[];
        milestones: string[];
    }, {
        name: string;
        startDate: string;
        endDate: string;
        duration: number;
        id: string;
        tasks: string[];
        milestones: string[];
    }>, "many">;
    criticalPath: z.ZodArray<z.ZodString, "many">;
    totalDuration: z.ZodNumber;
    bufferTime: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    phases: {
        name: string;
        startDate: string;
        endDate: string;
        duration: number;
        id: string;
        tasks: string[];
        milestones: string[];
    }[];
    criticalPath: string[];
    totalDuration: number;
    bufferTime: number;
}, {
    phases: {
        name: string;
        startDate: string;
        endDate: string;
        duration: number;
        id: string;
        tasks: string[];
        milestones: string[];
    }[];
    criticalPath: string[];
    totalDuration: number;
    bufferTime: number;
}>;
export declare const OptimizedPlanSchema: z.ZodObject<{
    originalEffort: z.ZodNumber;
    optimizedEffort: z.ZodNumber;
    savingsHours: z.ZodNumber;
    optimizations: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["parallel", "reuse", "simplify", "automate"]>;
        description: z.ZodString;
        impact: z.ZodString;
        savings: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        description: string;
        type: "parallel" | "reuse" | "simplify" | "automate";
        impact: string;
        savings: number;
    }, {
        description: string;
        type: "parallel" | "reuse" | "simplify" | "automate";
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
    originalEffort: number;
    optimizedEffort: number;
    savingsHours: number;
    optimizations: {
        description: string;
        type: "parallel" | "reuse" | "simplify" | "automate";
        impact: string;
        savings: number;
    }[];
    riskAdjustments: {
        risk: string;
        impact: number;
        adjustment: string;
    }[];
}, {
    originalEffort: number;
    optimizedEffort: number;
    savingsHours: number;
    optimizations: {
        description: string;
        type: "parallel" | "reuse" | "simplify" | "automate";
        impact: string;
        savings: number;
    }[];
    riskAdjustments: {
        risk: string;
        impact: number;
        adjustment: string;
    }[];
}>;
export type Architecture = z.infer<typeof ArchitectureSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type EffortEstimate = z.infer<typeof EffortEstimateSchema>;
export type Dependency = z.infer<typeof DependencySchema>;
export type Timeline = z.infer<typeof TimelineSchema>;
export type OptimizedPlan = z.infer<typeof OptimizedPlanSchema>;
export interface Plan {
    id: string;
    name: string;
    description: string;
    architecture: Architecture;
    tasks: Task[];
    timeline: Timeline;
    effort: EffortEstimate;
    dependencies: Dependency[];
}
export declare class TechnicalPlanner {
    /**
     * Create system architecture based on requirements
     */
    createArchitecture(requirements: BusinessRequirements): Architecture;
    /**
     * Estimate effort for tasks
     */
    estimateEffort(tasks: Task[]): EffortEstimate;
    /**
     * Identify dependencies between tasks
     */
    identifyDependencies(tasks: Task[]): Dependency[];
    /**
     * Create project timeline with phases
     */
    createTimeline(phases: Array<{
        name: string;
        tasks: Task[];
        duration?: number;
    }>): Timeline;
    /**
     * Optimize plan for efficiency
     */
    optimizePlan(plan: Plan): OptimizedPlan;
    private identifyComponents;
    private identifyPatterns;
    private selectTechnologies;
    private identifyConstraints;
    private findCriticalPath;
    private identifyParallelTasks;
    private identifyReusableComponents;
}
//# sourceMappingURL=technical-planner.d.ts.map