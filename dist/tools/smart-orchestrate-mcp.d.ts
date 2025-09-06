import { z } from 'zod';
import { MCPTool, type MCPToolContext, type MCPToolResult } from '../framework/mcp-tool.js';
declare const SmartOrchestrateInputSchema: z.ZodObject<{
    request: z.ZodString;
    options: z.ZodObject<{
        skipPhases: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
        focusAreas: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
        timeEstimate: z.ZodOptional<z.ZodNumber>;
        costPrevention: z.ZodDefault<z.ZodBoolean>;
        qualityLevel: z.ZodDefault<z.ZodEnum<["basic", "standard", "high"]>>;
        businessContext: z.ZodObject<{
            projectId: z.ZodString;
            businessGoals: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            requirements: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            stakeholders: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            constraints: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            marketContext: z.ZodOptional<z.ZodObject<{
                industry: z.ZodOptional<z.ZodString>;
                targetMarket: z.ZodOptional<z.ZodString>;
                competitors: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
            }, "strip", z.ZodTypeAny, {
                competitors: string[];
                industry?: string | undefined;
                targetMarket?: string | undefined;
            }, {
                industry?: string | undefined;
                targetMarket?: string | undefined;
                competitors?: string[] | undefined;
            }>>;
            success: z.ZodDefault<z.ZodObject<{
                metrics: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                criteria: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                metrics: string[];
                criteria: string[];
            }, {
                metrics?: string[] | undefined;
                criteria?: string[] | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            businessGoals: string[];
            projectId: string;
            success: {
                metrics: string[];
                criteria: string[];
            };
            requirements: string[];
            stakeholders: string[];
            constraints: Record<string, unknown>;
            marketContext?: {
                competitors: string[];
                industry?: string | undefined;
                targetMarket?: string | undefined;
            } | undefined;
        }, {
            projectId: string;
            businessGoals?: string[] | undefined;
            success?: {
                metrics?: string[] | undefined;
                criteria?: string[] | undefined;
            } | undefined;
            requirements?: string[] | undefined;
            stakeholders?: string[] | undefined;
            constraints?: Record<string, unknown> | undefined;
            marketContext?: {
                industry?: string | undefined;
                targetMarket?: string | undefined;
                competitors?: string[] | undefined;
            } | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        costPrevention: boolean;
        businessContext: {
            businessGoals: string[];
            projectId: string;
            success: {
                metrics: string[];
                criteria: string[];
            };
            requirements: string[];
            stakeholders: string[];
            constraints: Record<string, unknown>;
            marketContext?: {
                competitors: string[];
                industry?: string | undefined;
                targetMarket?: string | undefined;
            } | undefined;
        };
        skipPhases: string[];
        focusAreas: string[];
        qualityLevel: "high" | "basic" | "standard";
        timeEstimate?: number | undefined;
    }, {
        businessContext: {
            projectId: string;
            businessGoals?: string[] | undefined;
            success?: {
                metrics?: string[] | undefined;
                criteria?: string[] | undefined;
            } | undefined;
            requirements?: string[] | undefined;
            stakeholders?: string[] | undefined;
            constraints?: Record<string, unknown> | undefined;
            marketContext?: {
                industry?: string | undefined;
                targetMarket?: string | undefined;
                competitors?: string[] | undefined;
            } | undefined;
        };
        costPrevention?: boolean | undefined;
        skipPhases?: string[] | undefined;
        focusAreas?: string[] | undefined;
        timeEstimate?: number | undefined;
        qualityLevel?: "high" | "basic" | "standard" | undefined;
    }>;
    workflow: z.ZodDefault<z.ZodEnum<["sdlc", "project", "quality", "custom"]>>;
    externalSources: z.ZodDefault<z.ZodOptional<z.ZodObject<{
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
    }>>>;
}, "strip", z.ZodTypeAny, {
    options: {
        costPrevention: boolean;
        businessContext: {
            businessGoals: string[];
            projectId: string;
            success: {
                metrics: string[];
                criteria: string[];
            };
            requirements: string[];
            stakeholders: string[];
            constraints: Record<string, unknown>;
            marketContext?: {
                competitors: string[];
                industry?: string | undefined;
                targetMarket?: string | undefined;
            } | undefined;
        };
        skipPhases: string[];
        focusAreas: string[];
        qualityLevel: "high" | "basic" | "standard";
        timeEstimate?: number | undefined;
    };
    request: string;
    workflow: "custom" | "quality" | "sdlc" | "project";
    externalSources: {
        useContext7: boolean;
        useWebSearch: boolean;
        useMemory: boolean;
    };
}, {
    options: {
        businessContext: {
            projectId: string;
            businessGoals?: string[] | undefined;
            success?: {
                metrics?: string[] | undefined;
                criteria?: string[] | undefined;
            } | undefined;
            requirements?: string[] | undefined;
            stakeholders?: string[] | undefined;
            constraints?: Record<string, unknown> | undefined;
            marketContext?: {
                industry?: string | undefined;
                targetMarket?: string | undefined;
                competitors?: string[] | undefined;
            } | undefined;
        };
        costPrevention?: boolean | undefined;
        skipPhases?: string[] | undefined;
        focusAreas?: string[] | undefined;
        timeEstimate?: number | undefined;
        qualityLevel?: "high" | "basic" | "standard" | undefined;
    };
    request: string;
    workflow?: "custom" | "quality" | "sdlc" | "project" | undefined;
    externalSources?: {
        useContext7?: boolean | undefined;
        useWebSearch?: boolean | undefined;
        useMemory?: boolean | undefined;
    } | undefined;
}>;
declare const SmartOrchestrateOutputSchema: z.ZodObject<{
    orchestrationId: z.ZodString;
    workflow: z.ZodObject<{
        success: z.ZodBoolean;
        phases: z.ZodArray<z.ZodAny, "many">;
        technicalMetrics: z.ZodObject<{
            totalExecutionTime: z.ZodNumber;
            roleTransitionTime: z.ZodNumber;
            contextPreservationAccuracy: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            roleTransitionTime: number;
            totalExecutionTime: number;
            contextPreservationAccuracy: number;
        }, {
            roleTransitionTime: number;
            totalExecutionTime: number;
            contextPreservationAccuracy: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        technicalMetrics: {
            roleTransitionTime: number;
            totalExecutionTime: number;
            contextPreservationAccuracy: number;
        };
        success: boolean;
        phases: any[];
    }, {
        technicalMetrics: {
            roleTransitionTime: number;
            totalExecutionTime: number;
            contextPreservationAccuracy: number;
        };
        success: boolean;
        phases: any[];
    }>;
    businessContext: z.ZodObject<{
        projectId: z.ZodString;
        businessGoals: z.ZodArray<z.ZodString, "many">;
        requirements: z.ZodArray<z.ZodString, "many">;
        stakeholders: z.ZodArray<z.ZodString, "many">;
        constraints: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        marketContext: z.ZodOptional<z.ZodObject<{
            industry: z.ZodString;
            targetMarket: z.ZodString;
            competitors: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            industry: string;
            targetMarket: string;
            competitors: string[];
        }, {
            industry: string;
            targetMarket: string;
            competitors: string[];
        }>>;
        success: z.ZodObject<{
            metrics: z.ZodArray<z.ZodString, "many">;
            criteria: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            metrics: string[];
            criteria: string[];
        }, {
            metrics: string[];
            criteria: string[];
        }>;
        timestamp: z.ZodString;
        version: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        businessGoals: string[];
        projectId: string;
        success: {
            metrics: string[];
            criteria: string[];
        };
        timestamp: string;
        version: number;
        requirements: string[];
        stakeholders: string[];
        constraints: Record<string, unknown>;
        marketContext?: {
            industry: string;
            targetMarket: string;
            competitors: string[];
        } | undefined;
    }, {
        businessGoals: string[];
        projectId: string;
        success: {
            metrics: string[];
            criteria: string[];
        };
        timestamp: string;
        version: number;
        requirements: string[];
        stakeholders: string[];
        constraints: Record<string, unknown>;
        marketContext?: {
            industry: string;
            targetMarket: string;
            competitors: string[];
        } | undefined;
    }>;
    businessValue: z.ZodObject<{
        costPrevention: z.ZodNumber;
        timesSaved: z.ZodNumber;
        qualityImprovement: z.ZodNumber;
        riskMitigation: z.ZodArray<z.ZodString, "many">;
        strategicAlignment: z.ZodNumber;
        userSatisfaction: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        costPrevention: number;
        userSatisfaction: number;
        riskMitigation: string[];
        qualityImprovement: number;
        timesSaved: number;
        strategicAlignment: number;
    }, {
        costPrevention: number;
        userSatisfaction: number;
        riskMitigation: string[];
        qualityImprovement: number;
        timesSaved: number;
        strategicAlignment: number;
    }>;
    technicalMetrics: z.ZodObject<{
        responseTime: z.ZodNumber;
        orchestrationTime: z.ZodNumber;
        roleTransitionTime: z.ZodNumber;
        contextPreservationAccuracy: z.ZodNumber;
        businessAlignmentScore: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        responseTime: number;
        roleTransitionTime: number;
        contextPreservationAccuracy: number;
        orchestrationTime: number;
        businessAlignmentScore: number;
    }, {
        responseTime: number;
        roleTransitionTime: number;
        contextPreservationAccuracy: number;
        orchestrationTime: number;
        businessAlignmentScore: number;
    }>;
    nextSteps: z.ZodArray<z.ZodObject<{
        step: z.ZodString;
        role: z.ZodString;
        estimatedTime: z.ZodString;
        priority: z.ZodEnum<["high", "medium", "low"]>;
    }, "strip", z.ZodTypeAny, {
        priority: "high" | "medium" | "low";
        role: string;
        step: string;
        estimatedTime: string;
    }, {
        priority: "high" | "medium" | "low";
        role: string;
        step: string;
        estimatedTime: string;
    }>, "many">;
    externalIntegration: z.ZodObject<{
        context7Status: z.ZodString;
        webSearchStatus: z.ZodString;
        memoryStatus: z.ZodString;
        integrationTime: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        context7Status: string;
        webSearchStatus: string;
        memoryStatus: string;
        integrationTime: number;
    }, {
        context7Status: string;
        webSearchStatus: string;
        memoryStatus: string;
        integrationTime: number;
    }>;
    data: z.ZodObject<{
        projectId: z.ZodString;
        workflowType: z.ZodString;
        orchestration: z.ZodObject<{
            workflow: z.ZodObject<{
                phases: z.ZodArray<z.ZodAny, "many">;
                integrations: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    type: z.ZodString;
                    priority: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    type: string;
                    name: string;
                    priority: string;
                }, {
                    type: string;
                    name: string;
                    priority: string;
                }>, "many">;
                qualityGates: z.ZodArray<z.ZodString, "many">;
            }, "strip", z.ZodTypeAny, {
                qualityGates: string[];
                phases: any[];
                integrations: {
                    type: string;
                    name: string;
                    priority: string;
                }[];
            }, {
                qualityGates: string[];
                phases: any[];
                integrations: {
                    type: string;
                    name: string;
                    priority: string;
                }[];
            }>;
            automation: z.ZodObject<{
                triggers: z.ZodArray<z.ZodString, "many">;
                workflows: z.ZodArray<z.ZodString, "many">;
                monitoring: z.ZodArray<z.ZodString, "many">;
            }, "strip", z.ZodTypeAny, {
                monitoring: string[];
                triggers: string[];
                workflows: string[];
            }, {
                monitoring: string[];
                triggers: string[];
                workflows: string[];
            }>;
            businessValue: z.ZodObject<{
                estimatedROI: z.ZodNumber;
                timeToMarket: z.ZodNumber;
                costPrevention: z.ZodNumber;
                qualityImprovement: z.ZodNumber;
                userSatisfaction: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                costPrevention: number;
                userSatisfaction: number;
                estimatedROI: number;
                timeToMarket: number;
                qualityImprovement: number;
            }, {
                costPrevention: number;
                userSatisfaction: number;
                estimatedROI: number;
                timeToMarket: number;
                qualityImprovement: number;
            }>;
        }, "strip", z.ZodTypeAny, {
            businessValue: {
                costPrevention: number;
                userSatisfaction: number;
                estimatedROI: number;
                timeToMarket: number;
                qualityImprovement: number;
            };
            automation: {
                monitoring: string[];
                triggers: string[];
                workflows: string[];
            };
            workflow: {
                qualityGates: string[];
                phases: any[];
                integrations: {
                    type: string;
                    name: string;
                    priority: string;
                }[];
            };
        }, {
            businessValue: {
                costPrevention: number;
                userSatisfaction: number;
                estimatedROI: number;
                timeToMarket: number;
                qualityImprovement: number;
            };
            automation: {
                monitoring: string[];
                triggers: string[];
                workflows: string[];
            };
            workflow: {
                qualityGates: string[];
                phases: any[];
                integrations: {
                    type: string;
                    name: string;
                    priority: string;
                }[];
            };
        }>;
        successMetrics: z.ZodArray<z.ZodString, "many">;
        technicalMetrics: z.ZodObject<{
            responseTime: z.ZodNumber;
            orchestrationTime: z.ZodNumber;
            roleTransitionTime: z.ZodNumber;
            contextPreservationAccuracy: z.ZodNumber;
            businessAlignmentScore: z.ZodNumber;
            phasesOrchestrated: z.ZodNumber;
            integrationsConfigured: z.ZodNumber;
            qualityGatesConfigured: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            responseTime: number;
            roleTransitionTime: number;
            contextPreservationAccuracy: number;
            orchestrationTime: number;
            businessAlignmentScore: number;
            phasesOrchestrated: number;
            integrationsConfigured: number;
            qualityGatesConfigured: number;
        }, {
            responseTime: number;
            roleTransitionTime: number;
            contextPreservationAccuracy: number;
            orchestrationTime: number;
            businessAlignmentScore: number;
            phasesOrchestrated: number;
            integrationsConfigured: number;
            qualityGatesConfigured: number;
        }>;
        nextSteps: z.ZodArray<z.ZodObject<{
            step: z.ZodString;
            role: z.ZodString;
            estimatedTime: z.ZodString;
            priority: z.ZodEnum<["high", "medium", "low"]>;
        }, "strip", z.ZodTypeAny, {
            priority: "high" | "medium" | "low";
            role: string;
            step: string;
            estimatedTime: string;
        }, {
            priority: "high" | "medium" | "low";
            role: string;
            step: string;
            estimatedTime: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        projectId: string;
        nextSteps: {
            priority: "high" | "medium" | "low";
            role: string;
            step: string;
            estimatedTime: string;
        }[];
        technicalMetrics: {
            responseTime: number;
            roleTransitionTime: number;
            contextPreservationAccuracy: number;
            orchestrationTime: number;
            businessAlignmentScore: number;
            phasesOrchestrated: number;
            integrationsConfigured: number;
            qualityGatesConfigured: number;
        };
        successMetrics: string[];
        workflowType: string;
        orchestration: {
            businessValue: {
                costPrevention: number;
                userSatisfaction: number;
                estimatedROI: number;
                timeToMarket: number;
                qualityImprovement: number;
            };
            automation: {
                monitoring: string[];
                triggers: string[];
                workflows: string[];
            };
            workflow: {
                qualityGates: string[];
                phases: any[];
                integrations: {
                    type: string;
                    name: string;
                    priority: string;
                }[];
            };
        };
    }, {
        projectId: string;
        nextSteps: {
            priority: "high" | "medium" | "low";
            role: string;
            step: string;
            estimatedTime: string;
        }[];
        technicalMetrics: {
            responseTime: number;
            roleTransitionTime: number;
            contextPreservationAccuracy: number;
            orchestrationTime: number;
            businessAlignmentScore: number;
            phasesOrchestrated: number;
            integrationsConfigured: number;
            qualityGatesConfigured: number;
        };
        successMetrics: string[];
        workflowType: string;
        orchestration: {
            businessValue: {
                costPrevention: number;
                userSatisfaction: number;
                estimatedROI: number;
                timeToMarket: number;
                qualityImprovement: number;
            };
            automation: {
                monitoring: string[];
                triggers: string[];
                workflows: string[];
            };
            workflow: {
                qualityGates: string[];
                phases: any[];
                integrations: {
                    type: string;
                    name: string;
                    priority: string;
                }[];
            };
        };
    }>;
}, "strip", z.ZodTypeAny, {
    nextSteps: {
        priority: "high" | "medium" | "low";
        role: string;
        step: string;
        estimatedTime: string;
    }[];
    businessValue: {
        costPrevention: number;
        userSatisfaction: number;
        riskMitigation: string[];
        qualityImprovement: number;
        timesSaved: number;
        strategicAlignment: number;
    };
    technicalMetrics: {
        responseTime: number;
        roleTransitionTime: number;
        contextPreservationAccuracy: number;
        orchestrationTime: number;
        businessAlignmentScore: number;
    };
    data: {
        projectId: string;
        nextSteps: {
            priority: "high" | "medium" | "low";
            role: string;
            step: string;
            estimatedTime: string;
        }[];
        technicalMetrics: {
            responseTime: number;
            roleTransitionTime: number;
            contextPreservationAccuracy: number;
            orchestrationTime: number;
            businessAlignmentScore: number;
            phasesOrchestrated: number;
            integrationsConfigured: number;
            qualityGatesConfigured: number;
        };
        successMetrics: string[];
        workflowType: string;
        orchestration: {
            businessValue: {
                costPrevention: number;
                userSatisfaction: number;
                estimatedROI: number;
                timeToMarket: number;
                qualityImprovement: number;
            };
            automation: {
                monitoring: string[];
                triggers: string[];
                workflows: string[];
            };
            workflow: {
                qualityGates: string[];
                phases: any[];
                integrations: {
                    type: string;
                    name: string;
                    priority: string;
                }[];
            };
        };
    };
    businessContext: {
        businessGoals: string[];
        projectId: string;
        success: {
            metrics: string[];
            criteria: string[];
        };
        timestamp: string;
        version: number;
        requirements: string[];
        stakeholders: string[];
        constraints: Record<string, unknown>;
        marketContext?: {
            industry: string;
            targetMarket: string;
            competitors: string[];
        } | undefined;
    };
    workflow: {
        technicalMetrics: {
            roleTransitionTime: number;
            totalExecutionTime: number;
            contextPreservationAccuracy: number;
        };
        success: boolean;
        phases: any[];
    };
    orchestrationId: string;
    externalIntegration: {
        context7Status: string;
        webSearchStatus: string;
        memoryStatus: string;
        integrationTime: number;
    };
}, {
    nextSteps: {
        priority: "high" | "medium" | "low";
        role: string;
        step: string;
        estimatedTime: string;
    }[];
    businessValue: {
        costPrevention: number;
        userSatisfaction: number;
        riskMitigation: string[];
        qualityImprovement: number;
        timesSaved: number;
        strategicAlignment: number;
    };
    technicalMetrics: {
        responseTime: number;
        roleTransitionTime: number;
        contextPreservationAccuracy: number;
        orchestrationTime: number;
        businessAlignmentScore: number;
    };
    data: {
        projectId: string;
        nextSteps: {
            priority: "high" | "medium" | "low";
            role: string;
            step: string;
            estimatedTime: string;
        }[];
        technicalMetrics: {
            responseTime: number;
            roleTransitionTime: number;
            contextPreservationAccuracy: number;
            orchestrationTime: number;
            businessAlignmentScore: number;
            phasesOrchestrated: number;
            integrationsConfigured: number;
            qualityGatesConfigured: number;
        };
        successMetrics: string[];
        workflowType: string;
        orchestration: {
            businessValue: {
                costPrevention: number;
                userSatisfaction: number;
                estimatedROI: number;
                timeToMarket: number;
                qualityImprovement: number;
            };
            automation: {
                monitoring: string[];
                triggers: string[];
                workflows: string[];
            };
            workflow: {
                qualityGates: string[];
                phases: any[];
                integrations: {
                    type: string;
                    name: string;
                    priority: string;
                }[];
            };
        };
    };
    businessContext: {
        businessGoals: string[];
        projectId: string;
        success: {
            metrics: string[];
            criteria: string[];
        };
        timestamp: string;
        version: number;
        requirements: string[];
        stakeholders: string[];
        constraints: Record<string, unknown>;
        marketContext?: {
            industry: string;
            targetMarket: string;
            competitors: string[];
        } | undefined;
    };
    workflow: {
        technicalMetrics: {
            roleTransitionTime: number;
            totalExecutionTime: number;
            contextPreservationAccuracy: number;
        };
        success: boolean;
        phases: any[];
    };
    orchestrationId: string;
    externalIntegration: {
        context7Status: string;
        webSearchStatus: string;
        memoryStatus: string;
        integrationTime: number;
    };
}>;
type SmartOrchestrateInput = z.infer<typeof SmartOrchestrateInputSchema>;
type SmartOrchestrateOutput = z.infer<typeof SmartOrchestrateOutputSchema>;
/**
 * Smart Orchestrate MCP Tool
 * Orchestrates complete SDLC workflows with role switching and business context management
 */
export declare class SmartOrchestrateMCPTool extends MCPTool<SmartOrchestrateInput, SmartOrchestrateOutput> {
    private orchestrationEngine;
    private contextBroker;
    private _mcpCoordinator;
    constructor();
    /**
     * Execute the smart orchestrate tool
     */
    execute(input: SmartOrchestrateInput, _context?: MCPToolContext): Promise<MCPToolResult<SmartOrchestrateOutput>>;
    /**
     * Process the smart orchestrate logic
     */
    protected executeInternal(input: SmartOrchestrateInput, _context?: MCPToolContext): Promise<SmartOrchestrateOutput>;
    /**
     * Generate enhanced workflow phases for Phase 2B with role integration
     */
    private generateEnhancedWorkflowPhases;
    /**
     * Generate next steps based on workflow execution results
     */
    private generateNextSteps;
}
export {};
//# sourceMappingURL=smart-orchestrate-mcp.d.ts.map