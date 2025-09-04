import { describe, it, expect } from 'vitest';
import { handleSmartBegin } from '../tools/smart_begin';
import { handleSmartWrite } from '../tools/smart_write';
import { handleSmartFinish } from '../tools/smart_finish';
import { handleSmartPlan } from '../tools/smart_plan';
import { handleSmartOrchestrate } from '../tools/smart_orchestrate';

describe('Complete 5-Tool Workflow Integration', () => {
  describe('end-to-end orchestrated workflow', () => {
    it('should complete full orchestrated development workflow', async () => {
      // Step 1: Initialize project with smart_begin
      const projectResult = await handleSmartBegin({
        projectName: 'complete-orchestration-test',
        description: 'Test project for complete 5-tool orchestrated workflow',
        techStack: ['typescript', 'nodejs', 'react', 'postgresql'],
        targetUsers: ['strategy-people', 'vibe-coders', 'non-technical-founders'],
        businessGoals: ['cost-reduction', 'time-savings', 'quality-improvement', 'user-satisfaction'],
      });

      expect(projectResult.success).toBe(true);
      expect(projectResult.data.projectId).toBeDefined();
      const projectId = projectResult.data.projectId;

      // Step 2: Create comprehensive project plan with smart_plan
      const planResult = await handleSmartPlan({
        projectId,
        planType: 'development',
        scope: {
          features: ['user-authentication', 'dashboard', 'api-integration', 'monitoring'],
          timeline: {
            duration: 8,
          },
          resources: {
            teamSize: 5,
            budget: 100000,
            externalTools: ['github', 'slack', 'jira'],
          },
        },
        externalMCPs: [
          {
            name: 'Database MCP',
            description: 'PostgreSQL database integration',
            integrationType: 'database',
            priority: 'high',
            estimatedEffort: 7,
          },
          {
            name: 'API MCP',
            description: 'External API integration service',
            integrationType: 'api',
            priority: 'medium',
            estimatedEffort: 5,
          },
        ],
        qualityRequirements: {
          testCoverage: 90,
          securityLevel: 'high',
          performanceTargets: {
            responseTime: 50,
            throughput: 2000,
            availability: 99.9,
          },
        },
        businessContext: {
          goals: ['cost-reduction', 'time-savings', 'quality-improvement'],
          targetUsers: ['strategy-people', 'vibe-coders'],
          successMetrics: ['user-satisfaction', 'performance', 'reliability'],
          riskFactors: ['technical-complexity', 'timeline-pressure'],
        },
      });

      expect(planResult.success).toBe(true);
      expect(planResult.data.projectPlan).toBeDefined();

      // Step 3: Generate multiple code units with smart_write
      const codeResults = [];
      const codeIds = [];

      // Generate authentication code
      const authCodeResult = await handleSmartWrite({
        projectId,
        featureDescription: 'user authentication system',
        targetRole: 'developer',
        codeType: 'api',
        techStack: ['typescript', 'nodejs'],
        businessContext: {
          goals: ['cost-reduction', 'time-savings'],
          targetUsers: ['strategy-people', 'vibe-coders'],
          priority: 'high',
        },
        qualityRequirements: {
          testCoverage: 95,
          complexity: 3,
          securityLevel: 'high',
        },
      });

      expect(authCodeResult.success).toBe(true);
      codeResults.push(authCodeResult);
      codeIds.push(authCodeResult.data.codeId);

      // Generate dashboard code
      const dashboardCodeResult = await handleSmartWrite({
        projectId,
        featureDescription: 'user dashboard interface',
        targetRole: 'designer',
        codeType: 'component',
        techStack: ['react', 'typescript'],
        businessContext: {
          goals: ['user-satisfaction', 'quality-improvement'],
          targetUsers: ['strategy-people', 'non-technical-founders'],
          priority: 'high',
        },
        qualityRequirements: {
          testCoverage: 90,
          complexity: 4,
          securityLevel: 'medium',
        },
      });

      expect(dashboardCodeResult.success).toBe(true);
      codeResults.push(dashboardCodeResult);
      codeIds.push(dashboardCodeResult.data.codeId);

      // Generate test code
      const testCodeResult = await handleSmartWrite({
        projectId,
        featureDescription: 'comprehensive test suite',
        targetRole: 'qa-engineer',
        codeType: 'test',
        techStack: ['typescript', 'vitest'],
        businessContext: {
          goals: ['quality-improvement'],
          targetUsers: ['vibe-coders'],
          priority: 'high',
        },
        qualityRequirements: {
          testCoverage: 98,
          complexity: 2,
          securityLevel: 'high',
        },
      });

      expect(testCodeResult.success).toBe(true);
      codeResults.push(testCodeResult);
      codeIds.push(testCodeResult.data.codeId);

      // Step 4: Validate complete project with smart_finish
      const validationResult = await handleSmartFinish({
        projectId,
        codeIds,
        qualityGates: {
          testCoverage: 90,
          securityScore: 95,
          complexityScore: 80,
          maintainabilityScore: 85,
        },
        businessRequirements: {
          costPrevention: 50000,
          timeSaved: 8,
          userSatisfaction: 95,
        },
        productionReadiness: {
          securityScan: true,
          performanceTest: true,
          documentationComplete: true,
          deploymentReady: true,
        },
      });

      expect(validationResult.success).toBe(true);
      expect(validationResult.data.qualityScorecard).toBeDefined();

      // Step 5: Orchestrate complete workflow with smart_orchestrate
      const orchestrationResult = await handleSmartOrchestrate({
        projectId,
        workflowType: 'full-development',
        orchestrationScope: {
          includePlanning: true,
          includeDevelopment: true,
          includeTesting: true,
          includeDeployment: true,
          includeMonitoring: true,
        },
        externalIntegrations: [
          {
            name: 'Database MCP',
            type: 'mcp',
            priority: 'high',
            configuration: { host: 'localhost', port: 5432 },
          },
          {
            name: 'API Service',
            type: 'api',
            priority: 'medium',
            configuration: { baseUrl: 'https://api.example.com' },
          },
          {
            name: 'Monitoring Service',
            type: 'service',
            priority: 'high',
            configuration: { endpoint: 'https://monitoring.example.com' },
          },
        ],
        qualityGates: {
          testCoverage: 90,
          securityScore: 95,
          performanceScore: 90,
          maintainabilityScore: 85,
        },
        businessRequirements: {
          costPrevention: 75000,
          timeSaved: 12,
          userSatisfaction: 98,
          roiTarget: 400,
        },
        monitoringConfig: {
          enableMetrics: true,
          enableAlerts: true,
          enableLogging: true,
          enableTracing: true,
        },
      });

      expect(orchestrationResult.success).toBe(true);
      expect(orchestrationResult.data.orchestration).toBeDefined();
      expect(orchestrationResult.data.orchestration.workflow).toBeDefined();
      expect(orchestrationResult.data.orchestration.automation).toBeDefined();
      expect(orchestrationResult.data.orchestration.businessValue).toBeDefined();

      // Validate complete workflow integration
      expect(projectResult.data.projectId).toBe(projectId);
      expect(planResult.data.projectId).toBe(projectId);
      expect(authCodeResult.data.generatedCode).toBeDefined();
      expect(dashboardCodeResult.data.generatedCode).toBeDefined();
      expect(testCodeResult.data.generatedCode).toBeDefined();
      expect(validationResult.data.projectId).toBe(projectId);
      expect(validationResult.data.codeIds).toEqual(codeIds);
      expect(orchestrationResult.data.projectId).toBe(projectId);
    });

    it('should maintain context and business value across all five tools', async () => {
      // Initialize project
      const projectResult = await handleSmartBegin({
        projectName: 'context-preservation-5-tool-test',
        techStack: ['typescript', 'react'],
        targetUsers: ['strategy-people'],
        businessGoals: ['revenue-growth', 'cost-reduction'],
      });

      expect(projectResult.success).toBe(true);
      const projectId = projectResult.data.projectId;

      // Create plan
      const planResult = await handleSmartPlan({
        projectId,
        businessContext: {
          goals: ['revenue-growth', 'cost-reduction'],
          targetUsers: ['strategy-people'],
        },
      });

      expect(planResult.success).toBe(true);

      // Generate code
      const codeResult = await handleSmartWrite({
        projectId,
        featureDescription: 'revenue tracking feature',
        targetRole: 'product-strategist',
        businessContext: {
          goals: ['revenue-growth', 'cost-reduction'],
          targetUsers: ['strategy-people'],
        },
      });

      expect(codeResult.success).toBe(true);

      // Validate project
      const validationResult = await handleSmartFinish({
        projectId,
        codeIds: [codeResult.data.codeId],
        businessRequirements: {
          costPrevention: 30000,
          timeSaved: 4,
          userSatisfaction: 90,
        },
      });

      expect(validationResult.success).toBe(true);

      // Orchestrate workflow
      const orchestrationResult = await handleSmartOrchestrate({
        projectId,
        businessRequirements: {
          costPrevention: 30000,
          timeSaved: 4,
          userSatisfaction: 90,
          roiTarget: 250,
        },
      });

      expect(orchestrationResult.success).toBe(true);

      // Validate business value consistency
      expect(projectResult.data.businessValue).toBeDefined();
      expect(planResult.data.businessValue).toBeDefined();
      expect(codeResult.data.businessValue).toBeDefined();
      expect(validationResult.data.businessValue).toBeDefined();
      expect(orchestrationResult.data.orchestration.businessValue).toBeDefined();
    });

    it('should meet performance requirements for complete 5-tool workflow', async () => {
      const startTime = Date.now();

      // Complete 5-tool workflow
      const projectResult = await handleSmartBegin({
        projectName: 'performance-5-tool-test',
        techStack: ['typescript'],
      });

      const planResult = await handleSmartPlan({
        projectId: projectResult.data.projectId,
      });

      const codeResult = await handleSmartWrite({
        projectId: projectResult.data.projectId,
        featureDescription: 'performance test feature',
        targetRole: 'developer',
      });

      const validationResult = await handleSmartFinish({
        projectId: projectResult.data.projectId,
        codeIds: [codeResult.data.codeId],
      });

      const orchestrationResult = await handleSmartOrchestrate({
        projectId: projectResult.data.projectId,
      });

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      expect(projectResult.success).toBe(true);
      expect(planResult.success).toBe(true);
      expect(codeResult.success).toBe(true);
      expect(validationResult.success).toBe(true);
      expect(orchestrationResult.success).toBe(true);
      expect(totalTime).toBeLessThan(500); // <500ms for complete 5-tool workflow
    });

    it('should handle different workflow types across all tools', async () => {
      const workflowTypes = ['full-development', 'feature-development', 'bug-fix', 'maintenance', 'migration'];

      for (const workflowType of workflowTypes) {
        // Initialize project
        const projectResult = await handleSmartBegin({
          projectName: `workflow-type-${workflowType}-test`,
          techStack: ['typescript'],
        });

        expect(projectResult.success).toBe(true);

        // Create plan
        const planResult = await handleSmartPlan({
          projectId: projectResult.data.projectId,
          planType: workflowType === 'full-development' ? 'development' : 'maintenance',
        });

        expect(planResult.success).toBe(true);

        // Generate code
        const codeResult = await handleSmartWrite({
          projectId: projectResult.data.projectId,
          featureDescription: `${workflowType} feature`,
          targetRole: 'developer',
        });

        expect(codeResult.success).toBe(true);

        // Validate project
        const validationResult = await handleSmartFinish({
          projectId: projectResult.data.projectId,
          codeIds: [codeResult.data.codeId],
        });

        expect(validationResult.success).toBe(true);

        // Orchestrate workflow
        const orchestrationResult = await handleSmartOrchestrate({
          projectId: projectResult.data.projectId,
          workflowType: workflowType,
        });

        expect(orchestrationResult.success).toBe(true);
        expect(orchestrationResult.data.workflowType).toBe(workflowType);
      }
    });

    it('should provide comprehensive quality scorecard for complete orchestrated project', async () => {
      // Initialize project
      const projectResult = await handleSmartBegin({
        projectName: 'quality-scorecard-5-tool-test',
        techStack: ['typescript', 'react', 'nodejs', 'postgresql'],
        targetUsers: ['strategy-people', 'vibe-coders', 'non-technical-founders'],
        businessGoals: ['cost-reduction', 'time-savings', 'quality-improvement', 'user-satisfaction'],
      });

      // Create comprehensive plan
      const planResult = await handleSmartPlan({
        projectId: projectResult.data.projectId,
        scope: {
          features: ['auth', 'dashboard', 'api', 'monitoring'],
          resources: { teamSize: 6, budget: 150000 },
        },
        externalMCPs: [
          { name: 'DB MCP', description: 'Database', integrationType: 'database', priority: 'high' },
          { name: 'API MCP', description: 'API Service', integrationType: 'api', priority: 'medium' },
        ],
        qualityRequirements: {
          testCoverage: 95,
          securityLevel: 'high',
        },
      });

      // Generate multiple code units
      const codeResults = await Promise.all([
        handleSmartWrite({
          projectId: projectResult.data.projectId,
          featureDescription: 'authentication system',
          targetRole: 'developer',
          codeType: 'api',
        }),
        handleSmartWrite({
          projectId: projectResult.data.projectId,
          featureDescription: 'user interface',
          targetRole: 'designer',
          codeType: 'component',
        }),
        handleSmartWrite({
          projectId: projectResult.data.projectId,
          featureDescription: 'test suite',
          targetRole: 'qa-engineer',
          codeType: 'test',
        }),
      ]);

      const codeIds = codeResults.map(result => result.data.codeId);

      // Validate complete project
      const validationResult = await handleSmartFinish({
        projectId: projectResult.data.projectId,
        codeIds,
        qualityGates: {
          testCoverage: 95,
          securityScore: 98,
          complexityScore: 85,
          maintainabilityScore: 90,
        },
        businessRequirements: {
          costPrevention: 100000,
          timeSaved: 16,
          userSatisfaction: 98,
        },
      });

      // Orchestrate complete workflow
      const orchestrationResult = await handleSmartOrchestrate({
        projectId: projectResult.data.projectId,
        externalIntegrations: [
          { name: 'DB MCP', type: 'mcp', priority: 'high' },
          { name: 'API MCP', type: 'api', priority: 'medium' },
        ],
        qualityGates: {
          testCoverage: 95,
          securityScore: 98,
          performanceScore: 90,
          maintainabilityScore: 90,
        },
        businessRequirements: {
          costPrevention: 100000,
          timeSaved: 16,
          userSatisfaction: 98,
          roiTarget: 500,
        },
      });

      expect(projectResult.success).toBe(true);
      expect(planResult.success).toBe(true);
      expect(codeResults.every(result => result.success)).toBe(true);
      expect(validationResult.success).toBe(true);
      expect(orchestrationResult.success).toBe(true);

      // Validate comprehensive quality scorecard
      expect(validationResult.data.qualityScorecard.overall.score).toBeGreaterThan(0);
      expect(validationResult.data.qualityScorecard.overall.status).toMatch(/pass|fail/);
      expect(validationResult.data.qualityScorecard.overall.grade).toMatch(/A|B|C|D|F/);
      expect(validationResult.data.qualityScorecard.quality).toBeDefined();
      expect(validationResult.data.qualityScorecard.business).toBeDefined();
      expect(validationResult.data.qualityScorecard.production).toBeDefined();

      // Validate orchestration quality
      expect(orchestrationResult.data.orchestration.workflow.phases.length).toBeGreaterThan(0);
      expect(orchestrationResult.data.orchestration.workflow.integrations.length).toBeGreaterThan(0);
      expect(orchestrationResult.data.orchestration.workflow.qualityGates.length).toBeGreaterThan(0);
      expect(orchestrationResult.data.orchestration.automation).toBeDefined();
      expect(orchestrationResult.data.orchestration.businessValue).toBeDefined();
    });

    it('should handle workflow errors gracefully across all tools', async () => {
      // Test with invalid project ID in later tools
      const codeResult = await handleSmartWrite({
        projectId: 'invalid-project-id',
        featureDescription: 'error test feature',
      });

      // Should still work but with basic context
      expect(codeResult.success).toBe(true);

      const validationResult = await handleSmartFinish({
        projectId: 'invalid-project-id',
        codeIds: ['invalid-code-id'],
      });

      // Should still work but with basic validation
      expect(validationResult.success).toBe(true);

      const orchestrationResult = await handleSmartOrchestrate({
        projectId: 'invalid-project-id',
      });

      // Should still work but with basic orchestration
      expect(orchestrationResult.success).toBe(true);
    });
  });
});
