import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SmartOrchestrateMCPTool } from './smart-orchestrate-mcp';

// Mock the core dependencies
vi.mock('../core/orchestration-engine.js', () => ({
  OrchestrationEngine: vi.fn().mockImplementation(() => ({
    executeWorkflow: vi.fn().mockResolvedValue({
      success: true,
      phases: [
        {
          name: 'Strategic Planning',
          success: true,
          role: 'product-strategist',
          phase: 'planning',
          issues: [],
        },
        {
          name: 'Development',
          success: true,
          role: 'developer',
          phase: 'development',
          issues: [],
        },
      ],
      technicalMetrics: {
        totalExecutionTime: 5000,
        roleTransitionTime: 200,
        contextPreservationAccuracy: 95,
      },
    }),
  })),
}));

vi.mock('../core/business-context-broker.js', () => ({
  BusinessContextBroker: vi.fn().mockImplementation(() => ({
    setContext: vi.fn(),
    getBusinessValue: vi.fn().mockReturnValue({
      costPrevention: 10000,
      timesSaved: 40,
      qualityImprovement: 85,
      riskMitigation: ['Quality issues addressed', 'High test coverage reduces regression risk'],
      strategicAlignment: 90,
      userSatisfaction: 88,
    }),
    generateContextInsights: vi.fn().mockReturnValue({
      businessAlignment: 92,
      contextConsistency: 95,
      stakeholderSatisfaction: 88,
    }),
  })),
}));

vi.mock('../core/mcp-coordinator.js', () => ({
  MCPCoordinator: vi.fn().mockImplementation(() => ({
    gatherKnowledge: vi.fn().mockImplementation(async () => {
      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 10));
      return {
        context7: { status: 'success', data: [] },
        webSearch: { status: 'success', data: [] },
        memory: { status: 'success', data: [] },
      };
    }),
  })),
}));

describe('SmartOrchestrateMCPTool', () => {
  let tool: SmartOrchestrateMCPTool;

  beforeEach(() => {
    tool = new SmartOrchestrateMCPTool();
  });

  describe('Initialization', () => {
    it('should initialize successfully', () => {
      expect(tool).toBeDefined();
      expect(tool['config'].name).toBe('smart_orchestrate');
      expect(tool['config'].version).toBe('1.0.0');
    });
  });

  describe('Workflow Orchestration', () => {
    it('should orchestrate workflow with minimal input', async () => {
      const input = {
        request: 'Build a user management system with authentication',
        options: {
          costPrevention: true,
          skipPhases: [],
          focusAreas: [],
          qualityLevel: 'standard' as const,
          businessContext: {
            projectId: 'test-project',
            businessGoals: ['Improve user experience'],
            requirements: ['User authentication', 'Role-based access'],
            stakeholders: ['development-team'],
            constraints: {},
            success: {
              metrics: ['user-satisfaction'],
              criteria: ['security-compliance'],
            },
          },
        },
        workflow: 'sdlc' as const,
        externalSources: {
          useContext7: false,
          useWebSearch: false,
          useMemory: false,
        },
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.orchestrationId).toContain('orchestration_');
      expect(result.data?.workflow.success).toBe(true);
      expect(result.data?.businessContext.projectId).toBe('test-project');
      expect(result.data?.businessValue.costPrevention).toBe(10000);
      expect(result.data?.technicalMetrics.responseTime).toBeGreaterThan(0);
      expect(result.data?.nextSteps).toHaveLength(4);
    });

    it('should handle workflow with custom phases', async () => {
      const input = {
        request: 'Implement a microservices architecture',
        options: {
          costPrevention: true,
          skipPhases: ['testing'],
          focusAreas: ['architecture', 'scalability'],
          qualityLevel: 'high' as const,
          businessContext: {
            projectId: 'microservices-project',
            businessGoals: ['Improve scalability', 'Reduce coupling'],
            requirements: ['Service discovery', 'API gateway'],
            stakeholders: ['architecture-team'],
            constraints: { budget: 50000 },
            marketContext: {
              industry: 'fintech',
              targetMarket: 'enterprise',
              competitors: ['company-a', 'company-b'],
            },
            success: {
              metrics: ['response-time', 'availability'],
              criteria: ['99.9% uptime'],
            },
          },
        },
        workflow: 'custom' as const,
        externalSources: {
          useContext7: true,
          useWebSearch: true,
          useMemory: true,
        },
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.data.workflowType).toBe('custom');
      expect(result.data?.businessContext.marketContext?.industry).toBe('fintech');
      expect(result.data?.externalIntegration.context7Status).toBe('active');
      expect(result.data?.externalIntegration.webSearchStatus).toBe('active');
      expect(result.data?.externalIntegration.memoryStatus).toBe('active');
    });

    it('should handle project workflow type', async () => {
      const input = {
        request: 'Create a project management dashboard',
        options: {
          costPrevention: true,
          skipPhases: [],
          focusAreas: [],
          qualityLevel: 'standard' as const,
          businessContext: {
            projectId: 'dashboard-project',
            businessGoals: ['Improve project visibility'],
            requirements: ['Real-time updates', 'Team collaboration'],
            stakeholders: ['project-managers'],
            constraints: {},
            success: {
              metrics: ['adoption-rate'],
              criteria: ['user-friendly'],
            },
          },
        },
        workflow: 'project' as const,
        externalSources: {
          useContext7: true,
          useWebSearch: true,
          useMemory: true,
        },
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.data.workflowType).toBe('project');
      expect(result.data?.data.orchestration.workflow.phases).toBeDefined();
      expect(result.data?.data.orchestration.automation.triggers).toContain('git-push');
    });
  });

  describe('Business Context Management', () => {
    it('should handle business context with market information', async () => {
      const input = {
        request: 'Develop a mobile banking app',
        options: {
          costPrevention: true,
          skipPhases: [],
          focusAreas: [],
          qualityLevel: 'standard' as const,
          businessContext: {
            projectId: 'mobile-banking',
            businessGoals: ['Increase customer engagement', 'Reduce support calls'],
            requirements: ['Biometric authentication', 'Real-time notifications'],
            stakeholders: ['product-team', 'security-team'],
            constraints: { compliance: 'PCI-DSS' },
            marketContext: {
              industry: 'banking',
              targetMarket: 'millennials',
              competitors: ['chase', 'bank-of-america'],
            },
            success: {
              metrics: ['app-store-rating', 'user-retention'],
              criteria: ['4.5+ stars', '80% retention'],
            },
          },
        },
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.businessContext.marketContext?.industry).toBe('banking');
      expect(result.data?.businessContext.marketContext?.targetMarket).toBe('millennials');
      expect(result.data?.businessContext.constraints.compliance).toBe('PCI-DSS');
    });

    it('should handle minimal business context', async () => {
      const input = {
        request: 'Create a simple calculator app',
        options: {
          costPrevention: true,
          skipPhases: [],
          focusAreas: [],
          qualityLevel: 'standard' as const,
          businessContext: {
            projectId: 'calculator-app',
          },
        },
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.businessContext.businessGoals).toContain(
        'Implement: Create a simple calculator app'
      );
      expect(result.data?.businessContext.requirements).toContain('Create a simple calculator app');
    });
  });

  describe('External Integration', () => {
    it('should handle external sources integration', async () => {
      const input = {
        request: 'Build an AI-powered recommendation system',
        options: {
          costPrevention: true,
          skipPhases: [],
          focusAreas: [],
          qualityLevel: 'standard' as const,
          businessContext: {
            projectId: 'ai-recommendations',
          },
        },
        externalSources: {
          useContext7: true,
          useWebSearch: true,
          useMemory: false,
        },
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.externalIntegration.context7Status).toBe('active');
      expect(result.data?.externalIntegration.webSearchStatus).toBe('active');
      expect(result.data?.externalIntegration.memoryStatus).toBe('disabled');
      expect(result.data?.externalIntegration.integrationTime).toBeGreaterThan(0);
    });

    it('should handle external sources errors gracefully', async () => {
      // Mock external sources to throw error
      const mockCoordinator = tool['mcpCoordinator'];
      vi.spyOn(mockCoordinator, 'gatherKnowledge').mockRejectedValue(
        new Error('External service unavailable')
      );

      const input = {
        request: 'Build a data analytics platform',
        options: {
          costPrevention: true,
          skipPhases: [],
          focusAreas: [],
          qualityLevel: 'standard' as const,
          businessContext: {
            projectId: 'analytics-platform',
          },
        },
        externalSources: {
          useContext7: true,
          useWebSearch: true,
          useMemory: true,
        },
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.externalIntegration.context7Status).toBe('error');
      expect(result.data?.externalIntegration.webSearchStatus).toBe('error');
      expect(result.data?.externalIntegration.memoryStatus).toBe('error');
    });
  });

  describe('Technical Metrics', () => {
    it('should calculate technical metrics correctly', async () => {
      const input = {
        request: 'Implement a real-time chat system',
        options: {
          costPrevention: true,
          skipPhases: [],
          focusAreas: [],
          qualityLevel: 'standard' as const,
          businessContext: {
            projectId: 'chat-system',
          },
        },
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.technicalMetrics.responseTime).toBeGreaterThan(0);
      expect(result.data?.technicalMetrics.orchestrationTime).toBe(5000);
      expect(result.data?.technicalMetrics.roleTransitionTime).toBe(200);
      expect(result.data?.technicalMetrics.contextPreservationAccuracy).toBe(95);
      expect(result.data?.technicalMetrics.businessAlignmentScore).toBe(92);
    });
  });

  describe('Next Steps Generation', () => {
    it('should generate next steps for successful workflow', async () => {
      const input = {
        request: 'Deploy a production-ready API',
        options: {
          costPrevention: true,
          skipPhases: [],
          focusAreas: [],
          qualityLevel: 'standard' as const,
          businessContext: {
            projectId: 'api-deployment',
          },
        },
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.nextSteps).toHaveLength(4);
      expect(result.data?.nextSteps[0].step).toContain('Monitor production deployment');
      expect(result.data?.nextSteps[0].role).toBe('operations-engineer');
      expect(result.data?.nextSteps[0].priority).toBe('high');
    });

    it('should generate next steps for failed workflow', async () => {
      // Mock workflow to fail
      const mockEngine = tool['orchestrationEngine'];
      vi.spyOn(mockEngine, 'executeWorkflow').mockResolvedValue({
        success: false,
        phases: [
          {
            name: 'Development',
            success: false,
            role: 'developer',
            phase: 'development',
            issues: ['Compilation errors', 'Test failures'],
          },
        ],
        technicalMetrics: {
          totalExecutionTime: 3000,
          roleTransitionTime: 100,
          contextPreservationAccuracy: 80,
        },
      });

      const input = {
        request: 'Build a complex data pipeline',
        options: {
          costPrevention: true,
          skipPhases: [],
          focusAreas: [],
          qualityLevel: 'standard' as const,
          businessContext: {
            projectId: 'data-pipeline',
            businessGoals: [],
            success: { metrics: [], criteria: [] },
            requirements: [],
            stakeholders: [],
            constraints: {}
          },
        },
        workflow: 'standard',
        externalSources: []
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.nextSteps).toHaveLength(3);
      expect(result.data?.nextSteps[0].step).toContain('Address issues in development phase');
      expect(result.data?.nextSteps[0].role).toBe('developer');
      expect(result.data?.nextSteps[0].priority).toBe('high');
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors', async () => {
      const invalidInput = {
        request: 'Short', // Too short
        options: {
          costPrevention: true,
          skipPhases: [],
          focusAreas: [],
          qualityLevel: 'standard' as const,
          businessContext: {
            projectId: '', // Empty project ID
          },
        },
      } as any;

      const result = await tool.execute(invalidInput);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Orchestration request must be at least 10 characters');
    });

    it('should handle missing required fields', async () => {
      const invalidInput = {
        // Missing request and options
      } as any;

      const result = await tool.execute(invalidInput);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Required');
    });
  });

  describe('Performance', () => {
    it('should complete within reasonable time', async () => {
      const input = {
        request: 'Implement a comprehensive e-commerce platform',
        options: {
          costPrevention: true,
          skipPhases: [],
          focusAreas: [],
          qualityLevel: 'standard' as const,
          businessContext: {
            projectId: 'ecommerce-platform',
            businessGoals: [],
            success: { metrics: [], criteria: [] },
            requirements: [],
            stakeholders: [],
            constraints: {}
          },
        },
        workflow: 'standard',
        externalSources: []
      };

      const startTime = Date.now();
      const result = await tool.execute(input);
      const executionTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(executionTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
