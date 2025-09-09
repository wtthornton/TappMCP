export interface SmartBeginResponse {
    success: boolean;
    data?: {
        projectId: string;
        projectStructure: {
            folders: string[];
            files: string[];
            configFiles: string[];
            templates: Array<{
                name: string;
                description: string;
                path: string;
                content: string;
            }>;
        };
        qualityGates: Array<{
            name: string;
            description: string;
            status: 'enabled' | 'disabled';
        }>;
        businessValue: {
            costPrevention: number;
            timeSaved: number;
            qualityImprovements: string[];
        };
        nextSteps: string[];
        technicalMetrics: {
            responseTime: number;
            securityScore: number;
            complexityScore: number;
        };
    };
    error?: string;
    timestamp: string;
}
export interface SmartWriteResponse {
    success: boolean;
    data?: {
        codeId: string;
        generatedCode: {
            files: Array<{
                path: string;
                content: string;
                type: string;
            }>;
        };
        qualityMetrics: {
            testCoverage: number;
            complexity: number;
            securityScore: number;
            maintainability: number;
        };
        businessValue: {
            timeSaved: number;
            qualityImprovement: number;
            costPrevention: number;
        };
        nextSteps: string[];
        technicalMetrics: {
            responseTime: number;
            generationTime: number;
            linesGenerated: number;
            filesCreated: number;
        };
    };
    error?: string;
    timestamp: string;
}
export interface SmartFinishResponse {
    success: boolean;
    data?: {
        projectId: string;
        codeIds: string[];
        qualityScorecard: {
            overall: {
                score: number;
                status: string;
                grade: string;
            };
            quality: {
                testCoverage: {
                    score: number;
                    status: string;
                };
                security: {
                    score: number;
                    status: string;
                };
                complexity: {
                    score: number;
                    status: string;
                };
                maintainability: {
                    score: number;
                    status: string;
                };
            };
            business: {
                requirements: {
                    score: number;
                    status: string;
                };
                value: {
                    score: number;
                    status: string;
                };
                alignment: {
                    score: number;
                    status: string;
                };
            };
            production: {
                securityScan: {
                    status: string;
                    score: number;
                };
                performanceTest: {
                    status: string;
                    score: number;
                };
                documentationComplete: {
                    status: string;
                    score: number;
                };
                deploymentReady: {
                    status: string;
                    score: number;
                };
            };
        };
        businessValue: {
            totalCostPrevention: number;
            totalTimeSaved: number;
            userSatisfactionScore: number;
        };
        recommendations: string[];
        nextSteps: string[];
        technicalMetrics: {
            responseTime: number;
            validationTime: number;
            codeUnitsValidated: number;
        };
    };
    error?: string;
    timestamp: string;
}
export interface SmartPlanResponse {
    success: boolean;
    data?: {
        projectId: string;
        planType: string;
        projectPlan: {
            phases: Array<{
                name: string;
                duration: number;
                tasks: string[];
                dependencies: string[];
            }>;
            resources: {
                team: Array<{
                    role: string;
                    count: number;
                    skills: string[];
                }>;
                budget: {
                    total: number;
                    phases: Array<{
                        phase: string;
                        amount: number;
                    }>;
                };
                tools: string[];
            };
            timeline: {
                duration: number;
                startDate: string;
                endDate: string;
                milestones: Array<{
                    name: string;
                    date: string;
                }>;
            };
            risks: Array<{
                name: string;
                probability: number;
                impact: number;
                mitigation: string;
            }>;
        };
        businessValue: {
            estimatedROI: number;
            timeToMarket: number;
            riskMitigation: number;
            qualityImprovement: number;
        };
        successMetrics: string[];
        nextSteps: string[];
        technicalMetrics: {
            responseTime: number;
            planningTime: number;
            phasesPlanned: number;
            tasksPlanned: number;
        };
    };
    error?: string;
    timestamp: string;
}
export interface SmartOrchestrateResponse {
    success: boolean;
    orchestrationId?: string;
    workflow?: {
        workflowId: string;
        success: boolean;
        phases: Array<{
            phase: string;
            role: string;
            success: boolean;
            deliverables: string[];
            qualityMetrics: Record<string, number>;
            duration: number;
            issues?: string[];
        }>;
        businessValue: {
            costPrevention: number;
            timeToMarket: number;
            qualityImprovement: number;
            riskMitigation: number;
            strategicAlignment: number;
            businessScore: number;
        };
        roleTransitions: Array<{
            fromRole: string;
            toRole: string;
            timestamp: string;
            transitionId: string;
        }>;
        technicalMetrics: {
            totalExecutionTime: number;
            roleTransitionTime: number;
            contextPreservationAccuracy: number;
            phaseSuccessRate: number;
            businessAlignmentScore: number;
            performanceScore: number;
        };
        errors?: string[];
    };
    businessContext?: {
        projectId: string;
        businessGoals: string[];
        requirements: string[];
        stakeholders: string[];
        constraints: Record<string, unknown>;
        success: {
            metrics: string[];
            criteria: string[];
        };
        timestamp: string;
        version: number;
    };
    businessValue?: {
        costPrevention: number;
        timesSaved: number;
        qualityImprovement: number;
        riskMitigation: number;
        strategicAlignment: number;
        userSatisfaction: number;
    };
    technicalMetrics?: {
        responseTime: number;
        orchestrationTime: number;
        roleTransitionTime: number;
        contextPreservationAccuracy: number;
        businessAlignmentScore: number;
    };
    nextSteps?: Array<{
        step: string;
        role: string;
        estimatedTime: string;
        priority: 'high' | 'medium' | 'low';
    }>;
    externalIntegration?: {
        context7Status: string;
        webSearchStatus: string;
        memoryStatus: string;
        integrationTime: number;
    };
    externalKnowledge?: Array<{
        source: string;
        type: string;
        relevance: number;
        summary: string;
    }>;
    data?: any;
    error?: string;
    timestamp: string;
}
//# sourceMappingURL=tool-responses.d.ts.map