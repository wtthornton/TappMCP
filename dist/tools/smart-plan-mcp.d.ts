#!/usr/bin/env node
import { z } from 'zod';
import { MCPTool, MCPToolContext, MCPToolResult } from '../framework/mcp-tool.js';
declare const SmartPlanInputSchema: z.ZodObject<{
    projectId: z.ZodString;
    planType: z.ZodDefault<z.ZodEnum<["development", "testing", "deployment", "maintenance", "migration"]>>;
    scope: z.ZodOptional<z.ZodObject<{
        features: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        timeline: z.ZodOptional<z.ZodObject<{
            startDate: z.ZodOptional<z.ZodString>;
            endDate: z.ZodOptional<z.ZodString>;
            duration: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            duration: number;
            startDate?: string | undefined;
            endDate?: string | undefined;
        }, {
            startDate?: string | undefined;
            endDate?: string | undefined;
            duration?: number | undefined;
        }>>;
        resources: z.ZodOptional<z.ZodObject<{
            teamSize: z.ZodDefault<z.ZodNumber>;
            budget: z.ZodDefault<z.ZodNumber>;
            externalTools: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            teamSize: number;
            budget: number;
            externalTools: string[];
        }, {
            teamSize?: number | undefined;
            budget?: number | undefined;
            externalTools?: string[] | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        features: string[];
        timeline?: {
            duration: number;
            startDate?: string | undefined;
            endDate?: string | undefined;
        } | undefined;
        resources?: {
            teamSize: number;
            budget: number;
            externalTools: string[];
        } | undefined;
    }, {
        features?: string[] | undefined;
        timeline?: {
            startDate?: string | undefined;
            endDate?: string | undefined;
            duration?: number | undefined;
        } | undefined;
        resources?: {
            teamSize?: number | undefined;
            budget?: number | undefined;
            externalTools?: string[] | undefined;
        } | undefined;
    }>>;
    externalMCPs: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        integrationType: z.ZodEnum<["api", "database", "service", "tool"]>;
        priority: z.ZodDefault<z.ZodEnum<["high", "medium", "low"]>>;
        estimatedEffort: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        name: string;
        integrationType: "api" | "database" | "service" | "tool";
        priority: "high" | "medium" | "low";
        estimatedEffort: number;
    }, {
        description: string;
        name: string;
        integrationType: "api" | "database" | "service" | "tool";
        priority?: "high" | "medium" | "low" | undefined;
        estimatedEffort?: number | undefined;
    }>, "many">>>;
    qualityRequirements: z.ZodOptional<z.ZodObject<{
        testCoverage: z.ZodDefault<z.ZodNumber>;
        securityLevel: z.ZodDefault<z.ZodEnum<["low", "medium", "high"]>>;
        performanceTargets: z.ZodOptional<z.ZodObject<{
            responseTime: z.ZodDefault<z.ZodNumber>;
            throughput: z.ZodDefault<z.ZodNumber>;
            availability: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            responseTime: number;
            throughput: number;
            availability: number;
        }, {
            responseTime?: number | undefined;
            throughput?: number | undefined;
            availability?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        testCoverage: number;
        securityLevel: "high" | "medium" | "low";
        performanceTargets?: {
            responseTime: number;
            throughput: number;
            availability: number;
        } | undefined;
    }, {
        testCoverage?: number | undefined;
        securityLevel?: "high" | "medium" | "low" | undefined;
        performanceTargets?: {
            responseTime?: number | undefined;
            throughput?: number | undefined;
            availability?: number | undefined;
        } | undefined;
    }>>;
    businessContext: z.ZodOptional<z.ZodObject<{
        goals: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        targetUsers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        priority: z.ZodDefault<z.ZodEnum<["high", "medium", "low"]>>;
        riskTolerance: z.ZodDefault<z.ZodEnum<["low", "medium", "high"]>>;
    }, "strip", z.ZodTypeAny, {
        priority: "high" | "medium" | "low";
        riskTolerance: "high" | "medium" | "low";
        targetUsers?: string[] | undefined;
        goals?: string[] | undefined;
    }, {
        targetUsers?: string[] | undefined;
        priority?: "high" | "medium" | "low" | undefined;
        goals?: string[] | undefined;
        riskTolerance?: "high" | "medium" | "low" | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    planType: "development" | "testing" | "deployment" | "maintenance" | "migration";
    externalMCPs: {
        description: string;
        name: string;
        integrationType: "api" | "database" | "service" | "tool";
        priority: "high" | "medium" | "low";
        estimatedEffort: number;
    }[];
    scope?: {
        features: string[];
        timeline?: {
            duration: number;
            startDate?: string | undefined;
            endDate?: string | undefined;
        } | undefined;
        resources?: {
            teamSize: number;
            budget: number;
            externalTools: string[];
        } | undefined;
    } | undefined;
    qualityRequirements?: {
        testCoverage: number;
        securityLevel: "high" | "medium" | "low";
        performanceTargets?: {
            responseTime: number;
            throughput: number;
            availability: number;
        } | undefined;
    } | undefined;
    businessContext?: {
        priority: "high" | "medium" | "low";
        riskTolerance: "high" | "medium" | "low";
        targetUsers?: string[] | undefined;
        goals?: string[] | undefined;
    } | undefined;
}, {
    projectId: string;
    planType?: "development" | "testing" | "deployment" | "maintenance" | "migration" | undefined;
    scope?: {
        features?: string[] | undefined;
        timeline?: {
            startDate?: string | undefined;
            endDate?: string | undefined;
            duration?: number | undefined;
        } | undefined;
        resources?: {
            teamSize?: number | undefined;
            budget?: number | undefined;
            externalTools?: string[] | undefined;
        } | undefined;
    } | undefined;
    externalMCPs?: {
        description: string;
        name: string;
        integrationType: "api" | "database" | "service" | "tool";
        priority?: "high" | "medium" | "low" | undefined;
        estimatedEffort?: number | undefined;
    }[] | undefined;
    qualityRequirements?: {
        testCoverage?: number | undefined;
        securityLevel?: "high" | "medium" | "low" | undefined;
        performanceTargets?: {
            responseTime?: number | undefined;
            throughput?: number | undefined;
            availability?: number | undefined;
        } | undefined;
    } | undefined;
    businessContext?: {
        targetUsers?: string[] | undefined;
        priority?: "high" | "medium" | "low" | undefined;
        goals?: string[] | undefined;
        riskTolerance?: "high" | "medium" | "low" | undefined;
    } | undefined;
}>;
declare const SmartPlanOutputSchema: z.ZodObject<{
    planId: z.ZodString;
    projectPlan: z.ZodObject<{
        phases: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodString;
            duration: z.ZodNumber;
            tasks: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                description: z.ZodString;
                effort: z.ZodNumber;
                dependencies: z.ZodArray<z.ZodString, "many">;
                deliverables: z.ZodArray<z.ZodString, "many">;
                assignee: z.ZodOptional<z.ZodString>;
                status: z.ZodDefault<z.ZodEnum<["pending", "in-progress", "completed", "blocked"]>>;
            }, "strip", z.ZodTypeAny, {
                description: string;
                status: "pending" | "completed" | "in-progress" | "blocked";
                name: string;
                deliverables: string[];
                dependencies: string[];
                effort: number;
                assignee?: string | undefined;
            }, {
                description: string;
                name: string;
                deliverables: string[];
                dependencies: string[];
                effort: number;
                status?: "pending" | "completed" | "in-progress" | "blocked" | undefined;
                assignee?: string | undefined;
            }>, "many">;
            milestones: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                description: z.ZodString;
                dueDate: z.ZodString;
                successCriteria: z.ZodArray<z.ZodString, "many">;
                dependencies: z.ZodArray<z.ZodString, "many">;
            }, "strip", z.ZodTypeAny, {
                description: string;
                name: string;
                successCriteria: string[];
                dependencies: string[];
                dueDate: string;
            }, {
                description: string;
                name: string;
                successCriteria: string[];
                dependencies: string[];
                dueDate: string;
            }>, "many">;
            risks: z.ZodArray<z.ZodObject<{
                description: z.ZodString;
                impact: z.ZodEnum<["low", "medium", "high"]>;
                probability: z.ZodEnum<["low", "medium", "high"]>;
                mitigation: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                description: string;
                impact: "high" | "medium" | "low";
                probability: "high" | "medium" | "low";
                mitigation: string;
            }, {
                description: string;
                impact: "high" | "medium" | "low";
                probability: "high" | "medium" | "low";
                mitigation: string;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            description: string;
            name: string;
            duration: number;
            tasks: {
                description: string;
                status: "pending" | "completed" | "in-progress" | "blocked";
                name: string;
                deliverables: string[];
                dependencies: string[];
                effort: number;
                assignee?: string | undefined;
            }[];
            milestones: {
                description: string;
                name: string;
                successCriteria: string[];
                dependencies: string[];
                dueDate: string;
            }[];
            risks: {
                description: string;
                impact: "high" | "medium" | "low";
                probability: "high" | "medium" | "low";
                mitigation: string;
            }[];
        }, {
            description: string;
            name: string;
            duration: number;
            tasks: {
                description: string;
                name: string;
                deliverables: string[];
                dependencies: string[];
                effort: number;
                status?: "pending" | "completed" | "in-progress" | "blocked" | undefined;
                assignee?: string | undefined;
            }[];
            milestones: {
                description: string;
                name: string;
                successCriteria: string[];
                dependencies: string[];
                dueDate: string;
            }[];
            risks: {
                description: string;
                impact: "high" | "medium" | "low";
                probability: "high" | "medium" | "low";
                mitigation: string;
            }[];
        }>, "many">;
        timeline: z.ZodObject<{
            startDate: z.ZodString;
            endDate: z.ZodString;
            totalDuration: z.ZodNumber;
            criticalPath: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            startDate: string;
            endDate: string;
            criticalPath: string[];
            totalDuration: number;
        }, {
            startDate: string;
            endDate: string;
            criticalPath: string[];
            totalDuration: number;
        }>;
        resources: z.ZodObject<{
            team: z.ZodArray<z.ZodObject<{
                role: z.ZodString;
                name: z.ZodString;
                skills: z.ZodArray<z.ZodString, "many">;
                availability: z.ZodNumber;
                cost: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                name: string;
                availability: number;
                role: string;
                cost: number;
                skills: string[];
            }, {
                name: string;
                availability: number;
                role: string;
                cost: number;
                skills: string[];
            }>, "many">;
            budget: z.ZodObject<{
                total: z.ZodNumber;
                allocated: z.ZodNumber;
                remaining: z.ZodNumber;
                breakdown: z.ZodRecord<z.ZodString, z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                total: number;
                breakdown: Record<string, number>;
                remaining: number;
                allocated: number;
            }, {
                total: number;
                breakdown: Record<string, number>;
                remaining: number;
                allocated: number;
            }>;
            tools: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                type: z.ZodString;
                cost: z.ZodNumber;
                necessity: z.ZodEnum<["required", "recommended", "optional"]>;
            }, "strip", z.ZodTypeAny, {
                type: string;
                name: string;
                cost: number;
                necessity: "required" | "recommended" | "optional";
            }, {
                type: string;
                name: string;
                cost: number;
                necessity: "required" | "recommended" | "optional";
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            budget: {
                total: number;
                breakdown: Record<string, number>;
                remaining: number;
                allocated: number;
            };
            tools: {
                type: string;
                name: string;
                cost: number;
                necessity: "required" | "recommended" | "optional";
            }[];
            team: {
                name: string;
                availability: number;
                role: string;
                cost: number;
                skills: string[];
            }[];
        }, {
            budget: {
                total: number;
                breakdown: Record<string, number>;
                remaining: number;
                allocated: number;
            };
            tools: {
                type: string;
                name: string;
                cost: number;
                necessity: "required" | "recommended" | "optional";
            }[];
            team: {
                name: string;
                availability: number;
                role: string;
                cost: number;
                skills: string[];
            }[];
        }>;
        quality: z.ZodObject<{
            testStrategy: z.ZodObject<{
                unitTests: z.ZodObject<{
                    coverage: z.ZodNumber;
                    framework: z.ZodString;
                    estimatedEffort: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    estimatedEffort: number;
                    coverage: number;
                    framework: string;
                }, {
                    estimatedEffort: number;
                    coverage: number;
                    framework: string;
                }>;
                integrationTests: z.ZodObject<{
                    coverage: z.ZodNumber;
                    framework: z.ZodString;
                    estimatedEffort: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    estimatedEffort: number;
                    coverage: number;
                    framework: string;
                }, {
                    estimatedEffort: number;
                    coverage: number;
                    framework: string;
                }>;
                e2eTests: z.ZodObject<{
                    coverage: z.ZodNumber;
                    framework: z.ZodString;
                    estimatedEffort: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    estimatedEffort: number;
                    coverage: number;
                    framework: string;
                }, {
                    estimatedEffort: number;
                    coverage: number;
                    framework: string;
                }>;
            }, "strip", z.ZodTypeAny, {
                unitTests: {
                    estimatedEffort: number;
                    coverage: number;
                    framework: string;
                };
                integrationTests: {
                    estimatedEffort: number;
                    coverage: number;
                    framework: string;
                };
                e2eTests: {
                    estimatedEffort: number;
                    coverage: number;
                    framework: string;
                };
            }, {
                unitTests: {
                    estimatedEffort: number;
                    coverage: number;
                    framework: string;
                };
                integrationTests: {
                    estimatedEffort: number;
                    coverage: number;
                    framework: string;
                };
                e2eTests: {
                    estimatedEffort: number;
                    coverage: number;
                    framework: string;
                };
            }>;
            security: z.ZodObject<{
                level: z.ZodString;
                requirements: z.ZodArray<z.ZodString, "many">;
                tools: z.ZodArray<z.ZodString, "many">;
                estimatedEffort: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                estimatedEffort: number;
                requirements: string[];
                tools: string[];
                level: string;
            }, {
                estimatedEffort: number;
                requirements: string[];
                tools: string[];
                level: string;
            }>;
            performance: z.ZodObject<{
                targets: z.ZodObject<{
                    responseTime: z.ZodNumber;
                    throughput: z.ZodNumber;
                    availability: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    responseTime: number;
                    throughput: number;
                    availability: number;
                }, {
                    responseTime: number;
                    throughput: number;
                    availability: number;
                }>;
                monitoring: z.ZodArray<z.ZodString, "many">;
                estimatedEffort: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                estimatedEffort: number;
                monitoring: string[];
                targets: {
                    responseTime: number;
                    throughput: number;
                    availability: number;
                };
            }, {
                estimatedEffort: number;
                monitoring: string[];
                targets: {
                    responseTime: number;
                    throughput: number;
                    availability: number;
                };
            }>;
        }, "strip", z.ZodTypeAny, {
            security: {
                estimatedEffort: number;
                requirements: string[];
                tools: string[];
                level: string;
            };
            performance: {
                estimatedEffort: number;
                monitoring: string[];
                targets: {
                    responseTime: number;
                    throughput: number;
                    availability: number;
                };
            };
            testStrategy: {
                unitTests: {
                    estimatedEffort: number;
                    coverage: number;
                    framework: string;
                };
                integrationTests: {
                    estimatedEffort: number;
                    coverage: number;
                    framework: string;
                };
                e2eTests: {
                    estimatedEffort: number;
                    coverage: number;
                    framework: string;
                };
            };
        }, {
            security: {
                estimatedEffort: number;
                requirements: string[];
                tools: string[];
                level: string;
            };
            performance: {
                estimatedEffort: number;
                monitoring: string[];
                targets: {
                    responseTime: number;
                    throughput: number;
                    availability: number;
                };
            };
            testStrategy: {
                unitTests: {
                    estimatedEffort: number;
                    coverage: number;
                    framework: string;
                };
                integrationTests: {
                    estimatedEffort: number;
                    coverage: number;
                    framework: string;
                };
                e2eTests: {
                    estimatedEffort: number;
                    coverage: number;
                    framework: string;
                };
            };
        }>;
    }, "strip", z.ZodTypeAny, {
        timeline: {
            startDate: string;
            endDate: string;
            criticalPath: string[];
            totalDuration: number;
        };
        resources: {
            budget: {
                total: number;
                breakdown: Record<string, number>;
                remaining: number;
                allocated: number;
            };
            tools: {
                type: string;
                name: string;
                cost: number;
                necessity: "required" | "recommended" | "optional";
            }[];
            team: {
                name: string;
                availability: number;
                role: string;
                cost: number;
                skills: string[];
            }[];
        };
        quality: {
            security: {
                estimatedEffort: number;
                requirements: string[];
                tools: string[];
                level: string;
            };
            performance: {
                estimatedEffort: number;
                monitoring: string[];
                targets: {
                    responseTime: number;
                    throughput: number;
                    availability: number;
                };
            };
            testStrategy: {
                unitTests: {
                    estimatedEffort: number;
                    coverage: number;
                    framework: string;
                };
                integrationTests: {
                    estimatedEffort: number;
                    coverage: number;
                    framework: string;
                };
                e2eTests: {
                    estimatedEffort: number;
                    coverage: number;
                    framework: string;
                };
            };
        };
        phases: {
            description: string;
            name: string;
            duration: number;
            tasks: {
                description: string;
                status: "pending" | "completed" | "in-progress" | "blocked";
                name: string;
                deliverables: string[];
                dependencies: string[];
                effort: number;
                assignee?: string | undefined;
            }[];
            milestones: {
                description: string;
                name: string;
                successCriteria: string[];
                dependencies: string[];
                dueDate: string;
            }[];
            risks: {
                description: string;
                impact: "high" | "medium" | "low";
                probability: "high" | "medium" | "low";
                mitigation: string;
            }[];
        }[];
    }, {
        timeline: {
            startDate: string;
            endDate: string;
            criticalPath: string[];
            totalDuration: number;
        };
        resources: {
            budget: {
                total: number;
                breakdown: Record<string, number>;
                remaining: number;
                allocated: number;
            };
            tools: {
                type: string;
                name: string;
                cost: number;
                necessity: "required" | "recommended" | "optional";
            }[];
            team: {
                name: string;
                availability: number;
                role: string;
                cost: number;
                skills: string[];
            }[];
        };
        quality: {
            security: {
                estimatedEffort: number;
                requirements: string[];
                tools: string[];
                level: string;
            };
            performance: {
                estimatedEffort: number;
                monitoring: string[];
                targets: {
                    responseTime: number;
                    throughput: number;
                    availability: number;
                };
            };
            testStrategy: {
                unitTests: {
                    estimatedEffort: number;
                    coverage: number;
                    framework: string;
                };
                integrationTests: {
                    estimatedEffort: number;
                    coverage: number;
                    framework: string;
                };
                e2eTests: {
                    estimatedEffort: number;
                    coverage: number;
                    framework: string;
                };
            };
        };
        phases: {
            description: string;
            name: string;
            duration: number;
            tasks: {
                description: string;
                name: string;
                deliverables: string[];
                dependencies: string[];
                effort: number;
                status?: "pending" | "completed" | "in-progress" | "blocked" | undefined;
                assignee?: string | undefined;
            }[];
            milestones: {
                description: string;
                name: string;
                successCriteria: string[];
                dependencies: string[];
                dueDate: string;
            }[];
            risks: {
                description: string;
                impact: "high" | "medium" | "low";
                probability: "high" | "medium" | "low";
                mitigation: string;
            }[];
        }[];
    }>;
    businessValue: z.ZodObject<{
        roi: z.ZodNumber;
        costBenefit: z.ZodObject<{
            developmentCost: z.ZodNumber;
            maintenanceCost: z.ZodNumber;
            expectedSavings: z.ZodNumber;
            paybackPeriod: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            developmentCost: number;
            maintenanceCost: number;
            expectedSavings: number;
            paybackPeriod: number;
        }, {
            developmentCost: number;
            maintenanceCost: number;
            expectedSavings: number;
            paybackPeriod: number;
        }>;
        riskAssessment: z.ZodObject<{
            technicalRisks: z.ZodArray<z.ZodString, "many">;
            businessRisks: z.ZodArray<z.ZodString, "many">;
            mitigationStrategies: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            technicalRisks: string[];
            businessRisks: string[];
            mitigationStrategies: string[];
        }, {
            technicalRisks: string[];
            businessRisks: string[];
            mitigationStrategies: string[];
        }>;
        successMetrics: z.ZodArray<z.ZodObject<{
            metric: z.ZodString;
            target: z.ZodString;
            measurement: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            metric: string;
            target: string;
            measurement: string;
        }, {
            metric: string;
            target: string;
            measurement: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        successMetrics: {
            metric: string;
            target: string;
            measurement: string;
        }[];
        roi: number;
        riskAssessment: {
            technicalRisks: string[];
            businessRisks: string[];
            mitigationStrategies: string[];
        };
        costBenefit: {
            developmentCost: number;
            maintenanceCost: number;
            expectedSavings: number;
            paybackPeriod: number;
        };
    }, {
        successMetrics: {
            metric: string;
            target: string;
            measurement: string;
        }[];
        roi: number;
        riskAssessment: {
            technicalRisks: string[];
            businessRisks: string[];
            mitigationStrategies: string[];
        };
        costBenefit: {
            developmentCost: number;
            maintenanceCost: number;
            expectedSavings: number;
            paybackPeriod: number;
        };
    }>;
    nextSteps: z.ZodArray<z.ZodString, "many">;
    recommendations: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    nextSteps: string[];
    businessValue: {
        successMetrics: {
            metric: string;
            target: string;
            measurement: string;
        }[];
        roi: number;
        riskAssessment: {
            technicalRisks: string[];
            businessRisks: string[];
            mitigationStrategies: string[];
        };
        costBenefit: {
            developmentCost: number;
            maintenanceCost: number;
            expectedSavings: number;
            paybackPeriod: number;
        };
    };
    recommendations: string[];
    planId: string;
    projectPlan: {
        timeline: {
            startDate: string;
            endDate: string;
            criticalPath: string[];
            totalDuration: number;
        };
        resources: {
            budget: {
                total: number;
                breakdown: Record<string, number>;
                remaining: number;
                allocated: number;
            };
            tools: {
                type: string;
                name: string;
                cost: number;
                necessity: "required" | "recommended" | "optional";
            }[];
            team: {
                name: string;
                availability: number;
                role: string;
                cost: number;
                skills: string[];
            }[];
        };
        quality: {
            security: {
                estimatedEffort: number;
                requirements: string[];
                tools: string[];
                level: string;
            };
            performance: {
                estimatedEffort: number;
                monitoring: string[];
                targets: {
                    responseTime: number;
                    throughput: number;
                    availability: number;
                };
            };
            testStrategy: {
                unitTests: {
                    estimatedEffort: number;
                    coverage: number;
                    framework: string;
                };
                integrationTests: {
                    estimatedEffort: number;
                    coverage: number;
                    framework: string;
                };
                e2eTests: {
                    estimatedEffort: number;
                    coverage: number;
                    framework: string;
                };
            };
        };
        phases: {
            description: string;
            name: string;
            duration: number;
            tasks: {
                description: string;
                status: "pending" | "completed" | "in-progress" | "blocked";
                name: string;
                deliverables: string[];
                dependencies: string[];
                effort: number;
                assignee?: string | undefined;
            }[];
            milestones: {
                description: string;
                name: string;
                successCriteria: string[];
                dependencies: string[];
                dueDate: string;
            }[];
            risks: {
                description: string;
                impact: "high" | "medium" | "low";
                probability: "high" | "medium" | "low";
                mitigation: string;
            }[];
        }[];
    };
}, {
    nextSteps: string[];
    businessValue: {
        successMetrics: {
            metric: string;
            target: string;
            measurement: string;
        }[];
        roi: number;
        riskAssessment: {
            technicalRisks: string[];
            businessRisks: string[];
            mitigationStrategies: string[];
        };
        costBenefit: {
            developmentCost: number;
            maintenanceCost: number;
            expectedSavings: number;
            paybackPeriod: number;
        };
    };
    recommendations: string[];
    planId: string;
    projectPlan: {
        timeline: {
            startDate: string;
            endDate: string;
            criticalPath: string[];
            totalDuration: number;
        };
        resources: {
            budget: {
                total: number;
                breakdown: Record<string, number>;
                remaining: number;
                allocated: number;
            };
            tools: {
                type: string;
                name: string;
                cost: number;
                necessity: "required" | "recommended" | "optional";
            }[];
            team: {
                name: string;
                availability: number;
                role: string;
                cost: number;
                skills: string[];
            }[];
        };
        quality: {
            security: {
                estimatedEffort: number;
                requirements: string[];
                tools: string[];
                level: string;
            };
            performance: {
                estimatedEffort: number;
                monitoring: string[];
                targets: {
                    responseTime: number;
                    throughput: number;
                    availability: number;
                };
            };
            testStrategy: {
                unitTests: {
                    estimatedEffort: number;
                    coverage: number;
                    framework: string;
                };
                integrationTests: {
                    estimatedEffort: number;
                    coverage: number;
                    framework: string;
                };
                e2eTests: {
                    estimatedEffort: number;
                    coverage: number;
                    framework: string;
                };
            };
        };
        phases: {
            description: string;
            name: string;
            duration: number;
            tasks: {
                description: string;
                name: string;
                deliverables: string[];
                dependencies: string[];
                effort: number;
                status?: "pending" | "completed" | "in-progress" | "blocked" | undefined;
                assignee?: string | undefined;
            }[];
            milestones: {
                description: string;
                name: string;
                successCriteria: string[];
                dependencies: string[];
                dueDate: string;
            }[];
            risks: {
                description: string;
                impact: "high" | "medium" | "low";
                probability: "high" | "medium" | "low";
                mitigation: string;
            }[];
        }[];
    };
}>;
export type SmartPlanInput = z.infer<typeof SmartPlanInputSchema>;
export type SmartPlanOutput = z.infer<typeof SmartPlanOutputSchema>;
/**
 * Smart Plan MCP Tool
 *
 * Migrated to use MCPTool base class with enhanced error handling,
 * performance monitoring, and standardized patterns.
 */
export declare class SmartPlanMCPTool extends MCPTool<SmartPlanInput, SmartPlanOutput> {
    constructor();
    /**
     * Execute the smart plan tool
     */
    execute(input: SmartPlanInput, _context?: MCPToolContext): Promise<MCPToolResult<SmartPlanOutput>>;
    /**
     * Process the smart plan logic
     */
    protected executeInternal(input: SmartPlanInput, _context?: MCPToolContext): Promise<SmartPlanOutput>;
    /**
     * Generate unique plan ID
     */
    private generatePlanId;
    /**
     * Generate comprehensive project plan
     */
    private generateProjectPlan;
    /**
     * Generate project phases
     */
    private generatePhases;
    /**
     * Create a project phase
     */
    private createPhase;
    /**
     * Create a task
     */
    private createTask;
    /**
     * Create a milestone
     */
    private createMilestone;
    /**
     * Generate risks for a phase
     */
    private generateRisks;
    /**
     * Calculate project timeline
     */
    private calculateTimeline;
    /**
     * Allocate resources
     */
    private allocateResources;
    /**
     * Generate team members
     */
    private generateTeam;
    /**
     * Define quality requirements
     */
    private defineQualityRequirements;
    /**
     * Get security requirements based on level
     */
    private getSecurityRequirements;
    /**
     * Get security tools based on level
     */
    private getSecurityTools;
    /**
     * Calculate business value
     */
    private calculateBusinessValue;
    /**
     * Generate next steps
     */
    private generateNextSteps;
    /**
     * Generate recommendations
     */
    private generateRecommendations;
    /**
     * Get date string for given weeks from now
     */
    private getDateString;
}
export declare const smartPlanMCPTool: SmartPlanMCPTool;
export declare function handleSmartPlan(input: unknown): Promise<{
    success: boolean;
    data?: unknown;
    error?: string;
    timestamp: string;
}>;
export {};
//# sourceMappingURL=smart-plan-mcp.d.ts.map