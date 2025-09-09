/**
 * Complete Workflow Example
 *
 * Demonstrates using all Smart MCP tools together to build a complete project
 * from initialization to completion with quality validation.
 */
declare function completeProjectWorkflow(): Promise<{
    success: boolean;
    data: {
        projectInit: {
            projectId: string;
            projectStructure: {
                folders: string[];
                files: string[];
                configFiles: string[];
            };
            qualityGates: {
                name: string;
                description: string;
                status: string;
            }[];
            businessValue: {
                estimatedROI: number;
                timeToMarket: number;
                riskMitigation: number;
                qualityImprovement: number;
            };
            nextSteps: string[];
            technicalMetrics: {
                responseTime: number;
                validationTime: number;
                codeUnitsValidated: number;
            };
        };
        message: string;
    };
}>;
export { completeProjectWorkflow };
//# sourceMappingURL=complete-workflow-example.d.ts.map