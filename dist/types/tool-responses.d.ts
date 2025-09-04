export interface SmartBeginResponse {
    success: boolean;
    data?: {
        projectId: string;
        projectStructure: {
            directories: string[];
            files: string[];
            qualityGates: {
                testCoverage: number;
                securityScore: number;
                performanceScore: number;
                maintainabilityScore: number;
            };
        };
        businessValue: {
            estimatedROI: number;
            timeToMarket: number;
            costPrevention: number;
            qualityImprovement: number;
        };
        nextSteps: string[];
        technicalMetrics: {
            responseTime: number;
            setupTime: number;
            directoriesCreated: number;
            filesGenerated: number;
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
    data?: {
        projectId: string;
        workflowType: string;
        orchestration: {
            workflow: {
                phases: Array<{
                    name: string;
                    duration: number;
                    qualityChecks: string[];
                    dependencies: string[];
                }>;
                integrations: Array<{
                    name: string;
                    type: string;
                    priority: number;
                    phase: string;
                    configuration: Record<string, unknown>;
                }>;
                qualityGates: Array<{
                    name: string;
                    description: string;
                    phase: string;
                    threshold: number;
                    current: number;
                    status: string;
                }>;
            };
            automation: {
                triggers: Array<{
                    event: string;
                    phase: string;
                    action: string;
                }>;
                workflows: string[];
                monitoring: {
                    metrics: string[];
                    alerts: string[];
                };
            };
            businessValue: {
                estimatedROI: number;
                timeToMarket: number;
                costPrevention: number;
                qualityImprovement: number;
                userSatisfaction: number;
            };
        };
        successMetrics: string[];
        nextSteps: string[];
        technicalMetrics: {
            responseTime: number;
            orchestrationTime: number;
            phasesOrchestrated: number;
            integrationsConfigured: number;
            qualityGatesConfigured: number;
        };
    };
    error?: string;
    timestamp: string;
}
//# sourceMappingURL=tool-responses.d.ts.map