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
        type: "database" | "service" | "frontend" | "backend" | "external";
        name: string;
        description: string;
        complexity: "low" | "medium" | "high";
        dependencies: string[];
    }, {
        type: "database" | "service" | "frontend" | "backend" | "external";
        name: string;
        description: string;
        complexity: "low" | "medium" | "high";
        dependencies: string[];
    }>, "many">;
    patterns: z.ZodArray<z.ZodString, "many">;
    technologies: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        category: z.ZodEnum<["language", "framework", "database", "tool", "service"]>;
        justification: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        category: "database" | "language" | "service" | "tool" | "framework";
        justification: string;
    }, {
        name: string;
        category: "database" | "language" | "service" | "tool" | "framework";
        justification: string;
    }>, "many">;
    constraints: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    patterns: string[];
    constraints: string[];
    technologies: {
        name: string;
        category: "database" | "language" | "service" | "tool" | "framework";
        justification: string;
    }[];
    components: {
        type: "database" | "service" | "frontend" | "backend" | "external";
        name: string;
        description: string;
        complexity: "low" | "medium" | "high";
        dependencies: string[];
    }[];
}, {
    patterns: string[];
    constraints: string[];
    technologies: {
        name: string;
        category: "database" | "language" | "service" | "tool" | "framework";
        justification: string;
    }[];
    components: {
        type: "database" | "service" | "frontend" | "backend" | "external";
        name: string;
        description: string;
        complexity: "low" | "medium" | "high";
        dependencies: string[];
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
    priority: "critical" | "low" | "medium" | "high";
    type: "development" | "testing" | "deployment" | "documentation" | "research";
    name: string;
    description: string;
    id: string;
    dependencies: string[];
    phase: string;
    estimatedHours: number;
    skills: string[];
}, {
    priority: "critical" | "low" | "medium" | "high";
    type: "development" | "testing" | "deployment" | "documentation" | "research";
    name: string;
    description: string;
    id: string;
    dependencies: string[];
    phase: string;
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
        development: number;
        testing: number;
        deployment: number;
        documentation: number;
        research: number;
    }, {
        development: number;
        testing: number;
        deployment: number;
        documentation: number;
        research: number;
    }>;
    confidence: z.ZodEnum<["low", "medium", "high"]>;
    assumptions: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    confidence: "low" | "medium" | "high";
    breakdown: {
        development: number;
        testing: number;
        deployment: number;
        documentation: number;
        research: number;
    };
    assumptions: string[];
    totalHours: number;
}, {
    confidence: "low" | "medium" | "high";
    breakdown: {
        development: number;
        testing: number;
        deployment: number;
        documentation: number;
        research: number;
    };
    assumptions: string[];
    totalHours: number;
}>;
export declare const DependencySchema: z.ZodObject<{
    id: z.ZodString;
    from: z.ZodString;
    to: z.ZodString;
    type: z.ZodEnum<["blocks", "requires", "enables", "influences"]>;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "blocks" | "requires" | "enables" | "influences";
    description: string;
    id: string;
    to: string;
    from: string;
}, {
    type: "blocks" | "requires" | "enables" | "influences";
    description: string;
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
        id: string;
        startDate: string;
        endDate: string;
        duration: number;
        milestones: string[];
        tasks: string[];
    }, {
        name: string;
        id: string;
        startDate: string;
        endDate: string;
        duration: number;
        milestones: string[];
        tasks: string[];
    }>, "many">;
    criticalPath: z.ZodArray<z.ZodString, "many">;
    totalDuration: z.ZodNumber;
    bufferTime: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    phases: {
        name: string;
        id: string;
        startDate: string;
        endDate: string;
        duration: number;
        milestones: string[];
        tasks: string[];
    }[];
    criticalPath: string[];
    totalDuration: number;
    bufferTime: number;
}, {
    phases: {
        name: string;
        id: string;
        startDate: string;
        endDate: string;
        duration: number;
        milestones: string[];
        tasks: string[];
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