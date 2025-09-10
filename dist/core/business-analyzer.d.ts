#!/usr/bin/env node
import { z } from 'zod';
export declare const BusinessRequirementsSchema: z.ZodObject<{
    primaryGoals: z.ZodArray<z.ZodString, "many">;
    targetUsers: z.ZodArray<z.ZodString, "many">;
    successCriteria: z.ZodArray<z.ZodString, "many">;
    constraints: z.ZodArray<z.ZodString, "many">;
    riskFactors: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    targetUsers: string[];
    riskFactors: string[];
    constraints: string[];
    primaryGoals: string[];
    successCriteria: string[];
}, {
    targetUsers: string[];
    riskFactors: string[];
    constraints: string[];
    primaryGoals: string[];
    successCriteria: string[];
}>;
export declare const StakeholderSchema: z.ZodObject<{
    name: z.ZodString;
    role: z.ZodString;
    influence: z.ZodEnum<["high", "medium", "low"]>;
    interest: z.ZodEnum<["high", "medium", "low"]>;
    requirements: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    name: string;
    role: string;
    requirements: string[];
    influence: "low" | "medium" | "high";
    interest: "low" | "medium" | "high";
}, {
    name: string;
    role: string;
    requirements: string[];
    influence: "low" | "medium" | "high";
    interest: "low" | "medium" | "high";
}>;
export declare const ComplexityAssessmentSchema: z.ZodObject<{
    technical: z.ZodEnum<["low", "medium", "high", "very-high"]>;
    business: z.ZodEnum<["low", "medium", "high", "very-high"]>;
    integration: z.ZodEnum<["low", "medium", "high", "very-high"]>;
    overall: z.ZodEnum<["low", "medium", "high", "very-high"]>;
    factors: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    technical: "low" | "medium" | "high" | "very-high";
    business: "low" | "medium" | "high" | "very-high";
    integration: "low" | "medium" | "high" | "very-high";
    overall: "low" | "medium" | "high" | "very-high";
    factors: string[];
}, {
    technical: "low" | "medium" | "high" | "very-high";
    business: "low" | "medium" | "high" | "very-high";
    integration: "low" | "medium" | "high" | "very-high";
    overall: "low" | "medium" | "high" | "very-high";
    factors: string[];
}>;
export declare const RiskSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    category: z.ZodEnum<["technical", "business", "resource", "timeline", "quality"]>;
    probability: z.ZodEnum<["low", "medium", "high"]>;
    impact: z.ZodEnum<["low", "medium", "high"]>;
    severity: z.ZodEnum<["low", "medium", "high", "critical"]>;
    mitigation: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    description: string;
    category: "technical" | "business" | "timeline" | "quality" | "resource";
    impact: "low" | "medium" | "high";
    name: string;
    severity: "low" | "medium" | "high" | "critical";
    probability: "low" | "medium" | "high";
    mitigation: string[];
}, {
    id: string;
    description: string;
    category: "technical" | "business" | "timeline" | "quality" | "resource";
    impact: "low" | "medium" | "high";
    name: string;
    severity: "low" | "medium" | "high" | "critical";
    probability: "low" | "medium" | "high";
    mitigation: string[];
}>;
export declare const UserStorySchema: z.ZodObject<{
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
    id: string;
    title: string;
    description: string;
    estimatedEffort: number;
    asA: string;
    iWant: string;
    soThat: string;
    acceptanceCriteria: string[];
}, {
    priority: "low" | "medium" | "high" | "critical";
    id: string;
    title: string;
    description: string;
    estimatedEffort: number;
    asA: string;
    iWant: string;
    soThat: string;
    acceptanceCriteria: string[];
}>;
export type BusinessRequirements = z.infer<typeof BusinessRequirementsSchema>;
export type Stakeholder = z.infer<typeof StakeholderSchema>;
export type ComplexityAssessment = z.infer<typeof ComplexityAssessmentSchema>;
export type Risk = z.infer<typeof RiskSchema>;
export type UserStory = z.infer<typeof UserStorySchema>;
export declare class BusinessAnalyzer {
    /**
     * Analyze business requirements from a business request with optional external knowledge
     */
    analyzeRequirements(request: string, externalKnowledge?: Array<{
        id: string;
        source: string;
        type: string;
        title: string;
        content: string;
        relevanceScore: number;
    }>): BusinessRequirements;
    /**
     * Identify stakeholders from business requirements
     */
    identifyStakeholders(request: string): Stakeholder[];
    /**
     * Assess project complexity with optional external knowledge
     */
    assessComplexity(request: string, externalKnowledge?: Array<{
        id: string;
        source: string;
        type: string;
        title: string;
        content: string;
        relevanceScore: number;
    }>): ComplexityAssessment;
    /**
     * Identify risks from business request with optional external knowledge
     */
    identifyRisks(request: string, externalKnowledge?: Array<{
        id: string;
        source: string;
        type: string;
        title: string;
        content: string;
        relevanceScore: number;
    }>): Risk[];
    /**
     * Generate user stories from business requirements with optional external knowledge
     */
    generateUserStories(requirements: BusinessRequirements, externalKnowledge?: Array<{
        id: string;
        source: string;
        type: string;
        title: string;
        content: string;
        relevanceScore: number;
    }>): UserStory[];
    private extractGoals;
    private extractTargetUsers;
    private generateSuccessCriteria;
    private extractConstraints;
    private identifyRiskFactors;
    private extractStakeholderRequirements;
    private scoreToComplexity;
    private estimateStoryEffort;
    private generateSpecificAcceptanceCriteria;
    private generateSoThat;
}
//# sourceMappingURL=business-analyzer.d.ts.map