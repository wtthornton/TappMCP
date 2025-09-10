#!/usr/bin/env node
export interface ProjectAnalysis {
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
    detectedTechStack: string[];
    qualityIssues: string[];
    improvementOpportunities: string[];
    projectMetadata: {
        name: string;
        version?: string;
        description?: string;
        main?: string;
        scripts?: Record<string, string>;
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
    };
    analysisDepth: 'quick' | 'standard' | 'deep';
    analysisTimestamp: string;
}
export declare class ProjectScanner {
    private readonly configFilePatterns;
    private readonly techStackIndicators;
    scanProject(projectPath: string, analysisDepth?: 'quick' | 'standard' | 'deep'): Promise<ProjectAnalysis>;
    private scanProjectStructure;
    private detectTechStack;
    private analyzeQualityIssues;
    private identifyImprovementOpportunities;
    private extractProjectMetadata;
}
//# sourceMappingURL=project-scanner.d.ts.map