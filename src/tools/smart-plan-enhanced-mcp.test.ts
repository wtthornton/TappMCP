import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SmartPlanEnhancedMCPTool } from './smart-plan-enhanced-mcp';

// Mock the core dependencies
vi.mock('../core/plan-generator.js', () => ({
  PlanGenerator: vi.fn().mockImplementation(() => ({
    generatePlan: vi.fn().mockImplementation(async () => {
      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 5));
      return {
        id: 'plan_12345',
        businessRequirements: {
          targetUsers: ['admin', 'user', 'guest'],
          functionalRequirements: ['authentication', 'user-profiles'],
          nonFunctionalRequirements: ['security', 'performance'],
        },
        complexity: {
          level: 'medium',
          factors: ['user-management', 'authentication'],
          estimatedEffort: '2-4 weeks',
        },
        phases: [
          {
            name: 'Planning',
            tasks: [
              { name: 'Requirements Analysis', estimatedTime: 5 },
              { name: 'Architecture Design', estimatedTime: 3 },
            ],
          },
          {
            name: 'Development',
            tasks: [
              { name: 'Backend Development', estimatedTime: 10 },
              { name: 'Frontend Development', estimatedTime: 8 },
            ],
          },
        ],
        timeline: {
          startDate: '2025-01-01',
          endDate: '2025-02-15',
          duration: '6 weeks',
        },
        userStories: [
          {
            id: 'US001',
            title: 'User Registration',
            description: 'As a user, I want to register for an account',
          },
          {
            id: 'US002',
            title: 'User Login',
            description: 'As a user, I want to log into my account',
          },
        ],
        businessValue: {
          estimatedROI: 150,
          timeToMarket: 6,
          costSavings: 50000,
          riskMitigation: 75,
          qualityImprovement: 85,
        },
        architecture: {
          components: [
            { name: 'Authentication Service', type: 'microservice' },
            { name: 'User Database', type: 'database' },
            { name: 'API Gateway', type: 'gateway' },
          ],
          patterns: ['microservices', 'api-gateway'],
          technologies: ['Node.js', 'PostgreSQL', 'React'],
        },
        effort: {
          totalHours: 200,
          confidence: 'high',
          breakdown: {
            planning: 20,
            development: 120,
            testing: 40,
            deployment: 20,
          },
        },
        optimization: {
          performance: ['caching', 'database-indexing'],
          security: ['encryption', 'authentication'],
          scalability: ['load-balancing', 'horizontal-scaling'],
        },
        qualityGates: [
          { phase: 'development', threshold: '90% test coverage' },
          { phase: 'testing', threshold: '100% security scan pass' },
          { phase: 'deployment', threshold: '99.9% uptime' },
        ],
        risks: [
          {
            id: 'R001',
            description: 'Security vulnerabilities',
            impact: 'high',
            probability: 'medium',
          },
          { id: 'R002', description: 'Performance issues', impact: 'medium', probability: 'low' },
        ],
        successMetrics: [
          'User registration completion rate > 80%',
          'Login success rate > 95%',
          'Page load time < 2 seconds',
        ],
        nextSteps: [
          'Begin requirements analysis phase',
          'Set up development environment',
          'Create project repository',
        ],
      };
    }),
    validatePlan: vi.fn().mockReturnValue({
      isValid: true,
      issues: [],
      recommendations: [
        'Consider implementing two-factor authentication',
        'Add comprehensive error handling',
      ],
    }),
  })),
}));

vi.mock('../core/mcp-coordinator.js', () => ({
  MCPCoordinator: vi.fn().mockImplementation(() => ({
    gatherKnowledge: vi.fn().mockImplementation(async () => {
      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 10));
      return [
        {
          id: 'knowledge_001',
          source: 'context7',
          type: 'documentation',
          title: 'User Authentication Best Practices',
          content: 'Best practices for implementing secure user authentication',
          relevanceScore: 0.95,
        },
        {
          id: 'knowledge_002',
          source: 'web-search',
          type: 'article',
          title: 'Modern User Management Systems',
          content: 'Latest trends in user management system design',
          relevanceScore: 0.88,
        },
      ];
    }),
  })),
}));

describe('SmartPlanEnhancedMCPTool', () => {
  let tool: SmartPlanEnhancedMCPTool;

  beforeEach(() => {
    tool = new SmartPlanEnhancedMCPTool();
  });

  describe('Initialization', () => {
    it('should initialize successfully', () => {
      expect(tool).toBeDefined();
      expect(tool['config'].name).toBe('smart_plan_enhanced');
      expect(tool['config'].version).toBe('1.0.0');
    });
  });

  describe('Plan Generation', () => {
    it('should generate comprehensive plan with minimal input', async () => {
      const input = {
        projectId: 'test-project-001',
        businessRequest: 'Create a user management system with authentication and user profiles',
        priority: 'high' as const,
        qualityRequirements: {
          security: 'high' as const,
          performance: 'standard' as const,
          accessibility: true,
        },
        planType: 'comprehensive' as const,
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.planId).toBe('plan_12345');
      expect(result.data?.planType).toBe('comprehensive');
      expect(result.data?.businessAnalysis.stakeholderCount).toBe(3);
      expect(result.data?.businessAnalysis.riskFactors).toBe(2);
      expect(result.data?.strategicPlan.phases).toHaveLength(2);
      expect(result.data?.strategicPlan.userStories).toHaveLength(2);
      expect(result.data?.technicalPlan.architecture.components).toHaveLength(3);
      expect(result.data?.validation.isValid).toBe(true);
      expect(result.data?.technicalMetrics.responseTime).toBeGreaterThan(0);
      expect(result.data?.businessMetrics.estimatedROI).toBe(150);
    });

    it('should handle strategic plan type', async () => {
      const input = {
        projectId: 'strategic-project',
        businessRequest: 'Develop a comprehensive digital transformation strategy',
        priority: 'critical' as const,
        planType: 'strategic' as const,
        qualityRequirements: {
          security: 'high' as const,
          performance: 'high' as const,
          accessibility: true,
        },
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.planType).toBe('strategic');
      expect(result.data?.data.planType).toBe('strategic');
    });

    it('should handle tactical plan type', async () => {
      const input = {
        projectId: 'tactical-project',
        businessRequest: 'Implement a customer support ticketing system',
        priority: 'medium' as const,
        planType: 'tactical' as const,
        qualityRequirements: {
          security: 'standard' as const,
          performance: 'standard' as const,
          accessibility: false,
        },
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.planType).toBe('tactical');
    });

    it('should handle technical plan type', async () => {
      const input = {
        projectId: 'technical-project',
        businessRequest: 'Build a microservices architecture for e-commerce platform',
        priority: 'high' as const,
        planType: 'technical' as const,
        qualityRequirements: {
          security: 'high' as const,
          performance: 'high' as const,
          accessibility: true,
        },
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.planType).toBe('technical');
    });
  });

  describe('External Integration', () => {
    it('should integrate with external sources when enabled', async () => {
      const input = {
        projectId: 'integration-project',
        planType: 'comprehensive' as const,
        businessRequest: 'Create an AI-powered recommendation engine',
        priority: 'high' as const,
        qualityRequirements: {
          security: 'high' as const,
          performance: 'high' as const,
          accessibility: true,
        },
        externalSources: {
          useContext7: true,
          useWebSearch: true,
          useMemory: true,
        },
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.externalIntegration.context7Status).toBe('active');
      expect(result.data?.externalIntegration.webSearchStatus).toBe('active');
      expect(result.data?.externalIntegration.memoryStatus).toBe('active');
      expect(result.data?.externalIntegration.integrationTime).toBeGreaterThan(0);
      expect(result.data?.externalIntegration.knowledgeCount).toBe(2);
      expect(result.data?.externalKnowledge).toHaveLength(2);
    });

    it('should handle external sources when disabled', async () => {
      const input = {
        projectId: 'no-integration-project',
        planType: 'technical' as const,
        businessRequest: 'Build a simple web application',
        priority: 'low' as const,
        qualityRequirements: {
          security: 'basic' as const,
          performance: 'basic' as const,
          accessibility: false,
        },
        externalSources: {
          useContext7: false,
          useWebSearch: false,
          useMemory: false,
        },
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.externalIntegration.context7Status).toBe('disabled');
      expect(result.data?.externalIntegration.webSearchStatus).toBe('disabled');
      expect(result.data?.externalIntegration.memoryStatus).toBe('disabled');
      expect(result.data?.externalIntegration.integrationTime).toBe(0);
      expect(result.data?.externalIntegration.knowledgeCount).toBe(0);
      expect(result.data?.externalKnowledge).toHaveLength(0);
    });

    it('should handle external sources errors gracefully', async () => {
      // Mock external sources to throw error
      const mockCoordinator = tool['mcpCoordinator'];
      vi.spyOn(mockCoordinator, 'gatherKnowledge').mockRejectedValue(
        new Error('External service unavailable')
      );

      const input = {
        projectId: 'error-project',
        planType: 'comprehensive' as const,
        businessRequest: 'Create a data analytics platform',
        priority: 'medium' as const,
        qualityRequirements: {
          security: 'high' as const,
          performance: 'high' as const,
          accessibility: true,
        },
        externalSources: {
          useContext7: true,
          useWebSearch: true,
          useMemory: true,
        },
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.externalIntegration.context7Status).toBe('disabled');
      expect(result.data?.externalIntegration.webSearchStatus).toBe('disabled');
      expect(result.data?.externalIntegration.memoryStatus).toBe('disabled');
    });
  });

  describe('Quality Requirements', () => {
    it('should handle high security requirements', async () => {
      const input = {
        projectId: 'security-project',
        planType: 'comprehensive' as const,
        businessRequest: 'Build a secure banking application',
        priority: 'critical' as const,
        qualityRequirements: {
          security: 'high' as const,
          performance: 'high' as const,
          accessibility: true,
        },
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.data.qualityRequirements?.security).toBe('high');
    });

    it('should handle basic quality requirements', async () => {
      const input = {
        projectId: 'basic-project',
        planType: 'technical' as const,
        businessRequest: 'Create a simple blog website',
        priority: 'low' as const,
        qualityRequirements: {
          security: 'basic' as const,
          performance: 'basic' as const,
          accessibility: false,
        },
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.data.qualityRequirements?.security).toBe('basic');
    });
  });

  describe('Time Constraints', () => {
    it('should handle time constraints', async () => {
      const input = {
        projectId: 'time-constrained-project',
        planType: 'tactical' as const,
        businessRequest: 'Deliver MVP in 4 weeks',
        priority: 'high' as const,
        qualityRequirements: {
          security: 'standard' as const,
          performance: 'standard' as const,
          accessibility: false,
        },
        timeConstraint: '4 weeks',
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.data.timeConstraint).toBe('4 weeks');
    });
  });

  describe('Technical Metrics', () => {
    it('should calculate technical metrics correctly', async () => {
      const input = {
        projectId: 'metrics-project',
        planType: 'comprehensive' as const,
        businessRequest: 'Build a comprehensive project management system',
        priority: 'high' as const,
        qualityRequirements: {
          security: 'high' as const,
          performance: 'high' as const,
          accessibility: true,
        },
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.technicalMetrics.responseTime).toBeGreaterThan(0);
      expect(result.data?.technicalMetrics.planGenerationTime).toBeGreaterThan(0);
      expect(result.data?.technicalMetrics.businessAnalysisTime).toBeGreaterThan(0);
      expect(result.data?.technicalMetrics.technicalPlanningTime).toBeGreaterThan(0);
      expect(result.data?.technicalMetrics.validationTime).toBeGreaterThan(0);
      expect(result.data?.technicalMetrics.phasesPlanned).toBe(2);
      expect(result.data?.technicalMetrics.tasksPlanned).toBe(4);
      expect(result.data?.technicalMetrics.risksIdentified).toBe(2);
      expect(result.data?.technicalMetrics.userStoriesGenerated).toBe(2);
      expect(result.data?.technicalMetrics.componentsMapped).toBe(3);
    });
  });

  describe('Business Metrics', () => {
    it('should calculate business metrics correctly', async () => {
      const input = {
        projectId: 'business-metrics-project',
        planType: 'strategic' as const,
        businessRequest: 'Implement a customer relationship management system',
        priority: 'high' as const,
        qualityRequirements: {
          security: 'high' as const,
          performance: 'high' as const,
          accessibility: true,
        },
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.businessMetrics.estimatedROI).toBe(150);
      expect(result.data?.businessMetrics.timeToMarket).toBe('6 months');
      expect(result.data?.businessMetrics.costSavings).toBe(50000);
      expect(result.data?.businessMetrics.riskMitigation).toBe(75);
      expect(result.data?.businessMetrics.qualityImprovement).toBe('85%');
    });
  });

  describe('Deliverables', () => {
    it('should generate comprehensive deliverables', async () => {
      const input = {
        projectId: 'deliverables-project',
        planType: 'comprehensive' as const,
        businessRequest: 'Create a comprehensive e-learning platform',
        priority: 'high' as const,
        qualityRequirements: {
          security: 'high' as const,
          performance: 'high' as const,
          accessibility: true,
        },
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.deliverables.successMetrics).toHaveLength(3);
      expect(result.data?.deliverables.nextSteps).toHaveLength(3);
      expect(result.data?.deliverables.qualityTargets).toHaveLength(3);
      expect(result.data?.deliverables.successMetrics[0]).toContain(
        'User registration completion rate'
      );
      expect(result.data?.deliverables.nextSteps[0]).toContain('Begin requirements analysis phase');
      expect(result.data?.deliverables.qualityTargets[0].phase).toBe('development');
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors', async () => {
      const invalidInput = {
        projectId: '', // Empty project ID
        businessRequest: 'Short', // Too short
      } as any;

      const result = await tool.execute(invalidInput);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Project ID is required');
    });

    it('should handle missing required fields', async () => {
      const invalidInput = {
        // Missing projectId and businessRequest
      } as any;

      const result = await tool.execute(invalidInput);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Required');
    });
  });

  describe('Performance', () => {
    it('should complete within performance target', async () => {
      const input = {
        projectId: 'perf-test-project',
        planType: 'technical' as const,
        businessRequest: 'Build a simple contact form with email notifications',
        priority: 'medium' as const,
        qualityRequirements: {
          security: 'standard' as const,
          performance: 'standard' as const,
          accessibility: false,
        },
      };

      const startTime = Date.now();
      const result = await tool.execute(input);
      const executionTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(executionTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('Data Structure', () => {
    it('should maintain backward compatibility with data object', async () => {
      const input = {
        projectId: 'compatibility-project',
        planType: 'technical' as const,
        businessRequest: 'Ensure backward compatibility',
        priority: 'medium' as const,
        qualityRequirements: {
          security: 'standard' as const,
          performance: 'standard' as const,
          accessibility: false,
        },
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.data).toBeDefined();
      expect(result.data?.data.projectId).toBe('compatibility-project');
      expect(result.data?.data.planType).toBe('technical');
      expect(result.data?.data.businessAnalysis).toBeDefined();
      expect(result.data?.data.strategicPlan).toBeDefined();
      expect(result.data?.data.technicalPlan).toBeDefined();
      expect(result.data?.data.validation).toBeDefined();
      expect(result.data?.data.externalIntegration).toBeDefined();
      expect(result.data?.data.deliverables).toBeDefined();
      expect(result.data?.data.technicalMetrics).toBeDefined();
      expect(result.data?.data.businessMetrics).toBeDefined();
    });
  });
});
