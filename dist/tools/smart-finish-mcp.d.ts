#!/usr/bin/env node
import { z } from 'zod';
import { MCPTool, MCPToolContext, MCPToolResult } from '../framework/mcp-tool.js';
declare const SmartFinishInputSchema: z.ZodObject<{
    projectId: z.ZodString;
    codeIds: z.ZodArray<z.ZodString, "many">;
    qualityGates: z.ZodOptional<z.ZodObject<{
        testCoverage: z.ZodDefault<z.ZodNumber>;
        securityScore: z.ZodDefault<z.ZodNumber>;
        complexityScore: z.ZodDefault<z.ZodNumber>;
        maintainabilityScore: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        securityScore: number;
        complexityScore: number;
        testCoverage: number;
        maintainabilityScore: number;
    }, {
        securityScore?: number | undefined;
        complexityScore?: number | undefined;
        testCoverage?: number | undefined;
        maintainabilityScore?: number | undefined;
    }>>;
    businessRequirements: z.ZodOptional<z.ZodObject<{
        costPrevention: z.ZodDefault<z.ZodNumber>;
        timeSaved: z.ZodDefault<z.ZodNumber>;
        userSatisfaction: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        costPrevention: number;
        timeSaved: number;
        userSatisfaction: number;
    }, {
        costPrevention?: number | undefined;
        timeSaved?: number | undefined;
        userSatisfaction?: number | undefined;
    }>>;
    productionReadiness: z.ZodOptional<z.ZodObject<{
        securityScan: z.ZodDefault<z.ZodBoolean>;
        performanceTest: z.ZodDefault<z.ZodBoolean>;
        documentationComplete: z.ZodDefault<z.ZodBoolean>;
        deploymentReady: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        securityScan: boolean;
        performanceTest: boolean;
        documentationComplete: boolean;
        deploymentReady: boolean;
    }, {
        securityScan?: boolean | undefined;
        performanceTest?: boolean | undefined;
        documentationComplete?: boolean | undefined;
        deploymentReady?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    codeIds: string[];
    qualityGates?: {
        securityScore: number;
        complexityScore: number;
        testCoverage: number;
        maintainabilityScore: number;
    } | undefined;
    businessRequirements?: {
        costPrevention: number;
        timeSaved: number;
        userSatisfaction: number;
    } | undefined;
    productionReadiness?: {
        securityScan: boolean;
        performanceTest: boolean;
        documentationComplete: boolean;
        deploymentReady: boolean;
    } | undefined;
}, {
    projectId: string;
    codeIds: string[];
    qualityGates?: {
        securityScore?: number | undefined;
        complexityScore?: number | undefined;
        testCoverage?: number | undefined;
        maintainabilityScore?: number | undefined;
    } | undefined;
    businessRequirements?: {
        costPrevention?: number | undefined;
        timeSaved?: number | undefined;
        userSatisfaction?: number | undefined;
    } | undefined;
    productionReadiness?: {
        securityScan?: boolean | undefined;
        performanceTest?: boolean | undefined;
        documentationComplete?: boolean | undefined;
        deploymentReady?: boolean | undefined;
    } | undefined;
}>;
declare const SmartFinishOutputSchema: z.ZodObject<{
    projectId: z.ZodString;
    qualityScorecard: z.ZodObject<{
        overallScore: z.ZodNumber;
        testCoverage: z.ZodObject<{
            score: z.ZodNumber;
            details: z.ZodString;
            recommendations: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            details: string;
            score: number;
            recommendations: string[];
        }, {
            details: string;
            score: number;
            recommendations: string[];
        }>;
        securityScore: z.ZodObject<{
            score: z.ZodNumber;
            details: z.ZodString;
            vulnerabilities: z.ZodArray<z.ZodString, "many">;
            recommendations: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            vulnerabilities: string[];
            details: string;
            score: number;
            recommendations: string[];
        }, {
            vulnerabilities: string[];
            details: string;
            score: number;
            recommendations: string[];
        }>;
        complexityScore: z.ZodObject<{
            score: z.ZodNumber;
            details: z.ZodString;
            metrics: z.ZodObject<{
                cyclomaticComplexity: z.ZodNumber;
                maintainabilityIndex: z.ZodNumber;
                duplicationPercentage: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                cyclomaticComplexity: number;
                maintainabilityIndex: number;
                duplicationPercentage: number;
            }, {
                cyclomaticComplexity: number;
                maintainabilityIndex: number;
                duplicationPercentage: number;
            }>;
            recommendations: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            details: string;
            metrics: {
                cyclomaticComplexity: number;
                maintainabilityIndex: number;
                duplicationPercentage: number;
            };
            score: number;
            recommendations: string[];
        }, {
            details: string;
            metrics: {
                cyclomaticComplexity: number;
                maintainabilityIndex: number;
                duplicationPercentage: number;
            };
            score: number;
            recommendations: string[];
        }>;
        maintainabilityScore: z.ZodObject<{
            score: z.ZodNumber;
            details: z.ZodString;
            metrics: z.ZodObject<{
                codeSmells: z.ZodNumber;
                technicalDebt: z.ZodString;
                documentationCoverage: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                codeSmells: number;
                technicalDebt: string;
                documentationCoverage: number;
            }, {
                codeSmells: number;
                technicalDebt: string;
                documentationCoverage: number;
            }>;
            recommendations: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            details: string;
            metrics: {
                codeSmells: number;
                technicalDebt: string;
                documentationCoverage: number;
            };
            score: number;
            recommendations: string[];
        }, {
            details: string;
            metrics: {
                codeSmells: number;
                technicalDebt: string;
                documentationCoverage: number;
            };
            score: number;
            recommendations: string[];
        }>;
    }, "strip", z.ZodTypeAny, {
        securityScore: {
            vulnerabilities: string[];
            details: string;
            score: number;
            recommendations: string[];
        };
        complexityScore: {
            details: string;
            metrics: {
                cyclomaticComplexity: number;
                maintainabilityIndex: number;
                duplicationPercentage: number;
            };
            score: number;
            recommendations: string[];
        };
        testCoverage: {
            details: string;
            score: number;
            recommendations: string[];
        };
        maintainabilityScore: {
            details: string;
            metrics: {
                codeSmells: number;
                technicalDebt: string;
                documentationCoverage: number;
            };
            score: number;
            recommendations: string[];
        };
        overallScore: number;
    }, {
        securityScore: {
            vulnerabilities: string[];
            details: string;
            score: number;
            recommendations: string[];
        };
        complexityScore: {
            details: string;
            metrics: {
                cyclomaticComplexity: number;
                maintainabilityIndex: number;
                duplicationPercentage: number;
            };
            score: number;
            recommendations: string[];
        };
        testCoverage: {
            details: string;
            score: number;
            recommendations: string[];
        };
        maintainabilityScore: {
            details: string;
            metrics: {
                codeSmells: number;
                technicalDebt: string;
                documentationCoverage: number;
            };
            score: number;
            recommendations: string[];
        };
        overallScore: number;
    }>;
    businessValue: z.ZodObject<{
        costPrevention: z.ZodNumber;
        timeSaved: z.ZodNumber;
        userSatisfaction: z.ZodNumber;
        roi: z.ZodNumber;
        riskMitigation: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        costPrevention: number;
        timeSaved: number;
        userSatisfaction: number;
        riskMitigation: string[];
        roi: number;
    }, {
        costPrevention: number;
        timeSaved: number;
        userSatisfaction: number;
        riskMitigation: string[];
        roi: number;
    }>;
    productionReadiness: z.ZodObject<{
        securityScan: z.ZodObject<{
            passed: z.ZodBoolean;
            score: z.ZodNumber;
            issues: z.ZodArray<z.ZodString, "many">;
            recommendations: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            issues: string[];
            score: number;
            recommendations: string[];
            passed: boolean;
        }, {
            issues: string[];
            score: number;
            recommendations: string[];
            passed: boolean;
        }>;
        performanceTest: z.ZodObject<{
            passed: z.ZodBoolean;
            score: z.ZodNumber;
            metrics: z.ZodObject<{
                responseTime: z.ZodNumber;
                throughput: z.ZodNumber;
                memoryUsage: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                responseTime: number;
                throughput: number;
                memoryUsage: number;
            }, {
                responseTime: number;
                throughput: number;
                memoryUsage: number;
            }>;
            recommendations: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            metrics: {
                responseTime: number;
                throughput: number;
                memoryUsage: number;
            };
            score: number;
            recommendations: string[];
            passed: boolean;
        }, {
            metrics: {
                responseTime: number;
                throughput: number;
                memoryUsage: number;
            };
            score: number;
            recommendations: string[];
            passed: boolean;
        }>;
        documentationComplete: z.ZodObject<{
            passed: z.ZodBoolean;
            score: z.ZodNumber;
            coverage: z.ZodObject<{
                apiDocumentation: z.ZodNumber;
                userGuide: z.ZodNumber;
                technicalDocs: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                apiDocumentation: number;
                userGuide: number;
                technicalDocs: number;
            }, {
                apiDocumentation: number;
                userGuide: number;
                technicalDocs: number;
            }>;
            recommendations: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            coverage: {
                apiDocumentation: number;
                userGuide: number;
                technicalDocs: number;
            };
            score: number;
            recommendations: string[];
            passed: boolean;
        }, {
            coverage: {
                apiDocumentation: number;
                userGuide: number;
                technicalDocs: number;
            };
            score: number;
            recommendations: string[];
            passed: boolean;
        }>;
        deploymentReady: z.ZodObject<{
            passed: z.ZodBoolean;
            score: z.ZodNumber;
            checks: z.ZodArray<z.ZodString, "many">;
            recommendations: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            score: number;
            recommendations: string[];
            passed: boolean;
            checks: string[];
        }, {
            score: number;
            recommendations: string[];
            passed: boolean;
            checks: string[];
        }>;
    }, "strip", z.ZodTypeAny, {
        securityScan: {
            issues: string[];
            score: number;
            recommendations: string[];
            passed: boolean;
        };
        performanceTest: {
            metrics: {
                responseTime: number;
                throughput: number;
                memoryUsage: number;
            };
            score: number;
            recommendations: string[];
            passed: boolean;
        };
        documentationComplete: {
            coverage: {
                apiDocumentation: number;
                userGuide: number;
                technicalDocs: number;
            };
            score: number;
            recommendations: string[];
            passed: boolean;
        };
        deploymentReady: {
            score: number;
            recommendations: string[];
            passed: boolean;
            checks: string[];
        };
    }, {
        securityScan: {
            issues: string[];
            score: number;
            recommendations: string[];
            passed: boolean;
        };
        performanceTest: {
            metrics: {
                responseTime: number;
                throughput: number;
                memoryUsage: number;
            };
            score: number;
            recommendations: string[];
            passed: boolean;
        };
        documentationComplete: {
            coverage: {
                apiDocumentation: number;
                userGuide: number;
                technicalDocs: number;
            };
            score: number;
            recommendations: string[];
            passed: boolean;
        };
        deploymentReady: {
            score: number;
            recommendations: string[];
            passed: boolean;
            checks: string[];
        };
    }>;
    nextSteps: z.ZodArray<z.ZodString, "many">;
    recommendations: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    nextSteps: string[];
    businessValue: {
        costPrevention: number;
        timeSaved: number;
        userSatisfaction: number;
        riskMitigation: string[];
        roi: number;
    };
    productionReadiness: {
        securityScan: {
            issues: string[];
            score: number;
            recommendations: string[];
            passed: boolean;
        };
        performanceTest: {
            metrics: {
                responseTime: number;
                throughput: number;
                memoryUsage: number;
            };
            score: number;
            recommendations: string[];
            passed: boolean;
        };
        documentationComplete: {
            coverage: {
                apiDocumentation: number;
                userGuide: number;
                technicalDocs: number;
            };
            score: number;
            recommendations: string[];
            passed: boolean;
        };
        deploymentReady: {
            score: number;
            recommendations: string[];
            passed: boolean;
            checks: string[];
        };
    };
    recommendations: string[];
    qualityScorecard: {
        securityScore: {
            vulnerabilities: string[];
            details: string;
            score: number;
            recommendations: string[];
        };
        complexityScore: {
            details: string;
            metrics: {
                cyclomaticComplexity: number;
                maintainabilityIndex: number;
                duplicationPercentage: number;
            };
            score: number;
            recommendations: string[];
        };
        testCoverage: {
            details: string;
            score: number;
            recommendations: string[];
        };
        maintainabilityScore: {
            details: string;
            metrics: {
                codeSmells: number;
                technicalDebt: string;
                documentationCoverage: number;
            };
            score: number;
            recommendations: string[];
        };
        overallScore: number;
    };
}, {
    projectId: string;
    nextSteps: string[];
    businessValue: {
        costPrevention: number;
        timeSaved: number;
        userSatisfaction: number;
        riskMitigation: string[];
        roi: number;
    };
    productionReadiness: {
        securityScan: {
            issues: string[];
            score: number;
            recommendations: string[];
            passed: boolean;
        };
        performanceTest: {
            metrics: {
                responseTime: number;
                throughput: number;
                memoryUsage: number;
            };
            score: number;
            recommendations: string[];
            passed: boolean;
        };
        documentationComplete: {
            coverage: {
                apiDocumentation: number;
                userGuide: number;
                technicalDocs: number;
            };
            score: number;
            recommendations: string[];
            passed: boolean;
        };
        deploymentReady: {
            score: number;
            recommendations: string[];
            passed: boolean;
            checks: string[];
        };
    };
    recommendations: string[];
    qualityScorecard: {
        securityScore: {
            vulnerabilities: string[];
            details: string;
            score: number;
            recommendations: string[];
        };
        complexityScore: {
            details: string;
            metrics: {
                cyclomaticComplexity: number;
                maintainabilityIndex: number;
                duplicationPercentage: number;
            };
            score: number;
            recommendations: string[];
        };
        testCoverage: {
            details: string;
            score: number;
            recommendations: string[];
        };
        maintainabilityScore: {
            details: string;
            metrics: {
                codeSmells: number;
                technicalDebt: string;
                documentationCoverage: number;
            };
            score: number;
            recommendations: string[];
        };
        overallScore: number;
    };
}>;
export type SmartFinishInput = z.infer<typeof SmartFinishInputSchema>;
export type SmartFinishOutput = z.infer<typeof SmartFinishOutputSchema>;
/**
 * Smart Finish MCP Tool
 *
 * Migrated to use MCPTool base class with enhanced error handling,
 * performance monitoring, and standardized patterns.
 */
export declare class SmartFinishMCPTool extends MCPTool<SmartFinishInput, SmartFinishOutput> {
    constructor();
    /**
     * Execute the smart finish tool
     */
    execute(input: SmartFinishInput, _context?: MCPToolContext): Promise<MCPToolResult<SmartFinishOutput>>;
    /**
     * Process the smart finish logic
     */
    protected executeInternal(input: SmartFinishInput, _context?: MCPToolContext): Promise<SmartFinishOutput>;
    /**
     * Initialize security and analysis tools
     */
    private initializeScanners;
    /**
     * Generate comprehensive quality scorecard
     */
    private generateQualityScorecard;
    /**
     * Analyze test coverage
     */
    private analyzeTestCoverage;
    /**
     * Analyze security
     */
    private analyzeSecurity;
    /**
     * Analyze code complexity
     */
    private analyzeComplexity;
    /**
     * Analyze maintainability
     */
    private analyzeMaintainability;
    /**
     * Calculate business value
     */
    private calculateBusinessValue;
    /**
     * Check production readiness
     */
    private checkProductionReadiness;
    /**
     * Generate next steps
     */
    private generateNextSteps;
    /**
     * Generate recommendations
     */
    private generateRecommendations;
}
export declare const smartFinishMCPTool: SmartFinishMCPTool;
export declare function handleSmartFinish(input: unknown): Promise<{
    success: boolean;
    data?: unknown;
    error?: string;
    timestamp: string;
}>;
export {};
//# sourceMappingURL=smart-finish-mcp.d.ts.map