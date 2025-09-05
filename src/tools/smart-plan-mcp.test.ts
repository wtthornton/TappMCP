import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SmartPlanMCPTool, type SmartPlanInput } from './smart-plan-mcp.js';

describe('SmartPlanMCPTool', () => {
  let tool: SmartPlanMCPTool;

  beforeEach(() => {
    tool = new SmartPlanMCPTool();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize successfully', () => {
      expect(tool).toBeDefined();
      expect(tool).toBeInstanceOf(SmartPlanMCPTool);
    });
  });

  describe('Development Plan Generation', () => {
    it('should generate a comprehensive development plan', async () => {
      const input: SmartPlanInput = {
        projectId: 'test-dev-project',
        planType: 'development',
        scope: {
          features: ['user authentication', 'data management', 'reporting'],
          timeline: {
            duration: 8,
            startDate: '2025-01-01',
            endDate: '2025-02-28'
          },
          resources: {
            teamSize: 4,
            budget: 75000,
            externalTools: ['AWS', 'Stripe', 'SendGrid']
          }
        },
        qualityRequirements: {
          testCoverage: 90,
          securityLevel: 'high',
          performanceTargets: {
            responseTime: 50,
            throughput: 2000,
            availability: 99.9
          }
        },
        businessContext: {
          goals: ['increase efficiency', 'reduce costs'],
          targetUsers: ['developers', 'end users'],
          priority: 'high',
          riskTolerance: 'low'
        }
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.planId).toContain('plan_test-dev-project_development');
      expect(result.data?.projectPlan.phases).toHaveLength(4); // Planning, Development, Testing, Deployment
      expect(result.data?.projectPlan.phases[0].name).toBe('Core Development');
      expect(result.data?.projectPlan.phases[1].name).toBe('Testing and Quality Assurance');
      expect(result.data?.projectPlan.timeline.totalDuration).toBeGreaterThan(0);
      expect(result.data?.projectPlan.resources.team).toHaveLength(4);
      expect(result.data?.projectPlan.resources.budget.total).toBe(75000);
      expect(result.data?.businessValue.roi).toBeGreaterThan(0);
      expect(result.data?.nextSteps).toHaveLength(7);
      expect(result.data?.recommendations).toHaveLength(4);
    });

    it('should handle minimal development plan input', async () => {
      const input: SmartPlanInput = {
        projectId: 'minimal-dev-project',
        planType: 'development',
        techStack: []
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.projectPlan.phases).toHaveLength(4);
      expect(result.data?.projectPlan.resources.team).toHaveLength(3); // Default team size
      expect(result.data?.projectPlan.resources.budget.total).toBe(50000); // Default budget
    });
  });

  describe('Testing Plan Generation', () => {
    it('should generate a testing plan', async () => {
      const input: SmartPlanInput = {
        projectId: 'test-project',
        planType: 'testing',
        scope: {
          features: ['unit tests', 'integration tests', 'e2e tests'],
          resources: {
            teamSize: 2,
            budget: 25000
          }
        },
        qualityRequirements: {
          testCoverage: 95,
          securityLevel: 'medium'
        }
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.projectPlan.phases).toHaveLength(2); // Test Planning, Test Execution
      expect(result.data?.projectPlan.phases[0].name).toBe('Test Execution');
      expect(result.data?.projectPlan.phases[1].name).toBe('Test Planning');
      expect(result.data?.projectPlan.quality.testStrategy.unitTests.coverage).toBe(95);
    });
  });

  describe('Deployment Plan Generation', () => {
    it('should generate a deployment plan', async () => {
      const input: SmartPlanInput = {
        projectId: 'deploy-project',
        planType: 'deployment',
        scope: {
          resources: {
            teamSize: 3,
            budget: 30000
          }
        }
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.projectPlan.phases).toHaveLength(2); // Deployment Planning, Deployment Execution
      expect(result.data?.projectPlan.phases[0].name).toBe('Deployment Planning');
      expect(result.data?.projectPlan.phases[1].name).toBe('Deployment Execution');
    });
  });

  describe('Maintenance Plan Generation', () => {
    it('should generate a maintenance plan', async () => {
      const input: SmartPlanInput = {
        projectId: 'maintenance-project',
        planType: 'maintenance',
        scope: {
          resources: {
            teamSize: 2,
            budget: 15000
          }
        }
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.projectPlan.phases).toHaveLength(2); // Maintenance Planning, Ongoing Maintenance
      expect(result.data?.projectPlan.phases[0].name).toBe('Ongoing Maintenance');
      expect(result.data?.projectPlan.phases[1].name).toBe('Maintenance Planning');
    });
  });

  describe('Migration Plan Generation', () => {
    it('should generate a migration plan', async () => {
      const input: SmartPlanInput = {
        projectId: 'migration-project',
        planType: 'migration',
        scope: {
          resources: {
            teamSize: 5,
            budget: 100000
          }
        }
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.projectPlan.phases).toHaveLength(2); // Migration Planning, Migration Execution
      expect(result.data?.projectPlan.phases[0].name).toBe('Migration Execution');
      expect(result.data?.projectPlan.phases[1].name).toBe('Migration Planning');
    });
  });

  describe('External MCP Integration', () => {
    it('should include external MCP integration phase when specified', async () => {
      const input: SmartPlanInput = {
        projectId: 'integration-project',
        planType: 'development',
        externalMCPs: [
          {
            name: 'Payment MCP',
            description: 'Payment processing service',
            integrationType: 'api',
            priority: 'high',
            estimatedEffort: 5
          },
          {
            name: 'Database MCP',
            description: 'Database management service',
            integrationType: 'database',
            priority: 'medium',
            estimatedEffort: 3
          }
        ]
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.projectPlan.phases).toHaveLength(5); // 4 base phases + 1 integration phase
      // Find the external integration phase
      const integrationPhase = result.data?.projectPlan.phases.find(phase => phase.name === 'External Integration');
      expect(integrationPhase).toBeDefined();
      expect(integrationPhase?.tasks).toHaveLength(2);
      expect(integrationPhase?.tasks[0].name).toContain('Payment MCP');
      expect(integrationPhase?.tasks[1].name).toContain('Database MCP');
    });
  });

  describe('Quality Requirements', () => {
    it('should apply high security requirements', async () => {
      const input: SmartPlanInput = {
        projectId: 'secure-project',
        planType: 'development',
        qualityRequirements: {
          testCoverage: 95,
          securityLevel: 'high',
          performanceTargets: {
            responseTime: 25,
            throughput: 5000,
            availability: 99.99
          }
        }
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.projectPlan.quality.security.level).toBe('high');
      expect(result.data?.projectPlan.quality.security.requirements).toContain('Penetration testing');
      expect(result.data?.projectPlan.quality.security.requirements).toContain('Security audit');
      expect(result.data?.projectPlan.quality.security.tools).toContain('OWASP ZAP');
      expect(result.data?.projectPlan.quality.performance.targets.responseTime).toBe(25);
      expect(result.data?.projectPlan.quality.performance.targets.availability).toBe(99.99);
    });

    it('should apply medium security requirements', async () => {
      const input: SmartPlanInput = {
        projectId: 'medium-secure-project',
        planType: 'development',
        qualityRequirements: {
          testCoverage: 80,
          securityLevel: 'medium'
        }
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.projectPlan.quality.security.level).toBe('medium');
      expect(result.data?.projectPlan.quality.security.requirements).toContain('Regular security updates');
      expect(result.data?.projectPlan.quality.security.tools).toContain('Snyk');
    });

    it('should apply low security requirements', async () => {
      const input: SmartPlanInput = {
        projectId: 'basic-project',
        planType: 'development',
        qualityRequirements: {
          testCoverage: 70,
          securityLevel: 'low'
        }
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.projectPlan.quality.security.level).toBe('low');
      expect(result.data?.projectPlan.quality.security.requirements).toContain('Input validation and sanitization');
      expect(result.data?.projectPlan.quality.security.tools).toContain('ESLint security rules');
    });
  });

  describe('Resource Allocation', () => {
    it('should allocate resources based on team size and budget', async () => {
      const input: SmartPlanInput = {
        projectId: 'resource-project',
        planType: 'development',
        scope: {
          resources: {
            teamSize: 6,
            budget: 120000,
            externalTools: ['AWS', 'Stripe', 'MongoDB', 'Redis']
          }
        }
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.projectPlan.resources.team).toHaveLength(6);
      expect(result.data?.projectPlan.resources.budget.total).toBe(120000);
      expect(result.data?.projectPlan.resources.tools).toHaveLength(4);
      expect(result.data?.projectPlan.resources.tools[0].name).toBe('AWS');
    });

    it('should calculate budget breakdown correctly', async () => {
      const input: SmartPlanInput = {
        projectId: 'budget-project',
        planType: 'development',
        scope: {
          resources: {
            teamSize: 3,
            budget: 50000
          }
        }
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.projectPlan.resources.budget.total).toBe(50000);
      expect(result.data?.projectPlan.resources.budget.breakdown).toHaveProperty('Team Costs');
      expect(result.data?.projectPlan.resources.budget.breakdown).toHaveProperty('Tools & Licenses');
      expect(result.data?.projectPlan.resources.budget.breakdown).toHaveProperty('Infrastructure');
      expect(result.data?.projectPlan.resources.budget.breakdown).toHaveProperty('Contingency');
    });
  });

  describe('Business Value Calculation', () => {
    it('should calculate ROI for development plan', async () => {
      const input: SmartPlanInput = {
        projectId: 'roi-project',
        planType: 'development',
        scope: {
          resources: {
            budget: 100000
          }
        }
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.businessValue.roi).toBeGreaterThan(0);
      expect(result.data?.businessValue.costBenefit.developmentCost).toBe(100000);
      expect(result.data?.businessValue.costBenefit.expectedSavings).toBeGreaterThan(100000);
      expect(result.data?.businessValue.successMetrics).toHaveLength(3);
    });

    it('should calculate different ROI for different plan types', async () => {
      const developmentInput: SmartPlanInput = {
        projectId: 'dev-roi',
        planType: 'development',
        scope: { resources: { budget: 100000 } }
      };

      const testingInput: SmartPlanInput = {
        projectId: 'test-roi',
        planType: 'testing',
        scope: { resources: { budget: 100000 } }
      };

      const devResult = await tool.execute(developmentInput);
      const testResult = await tool.execute(testingInput);

      expect(devResult.success).toBe(true);
      expect(testResult.success).toBe(true);
      expect(devResult.data?.businessValue.roi).toBeGreaterThan(testResult.data?.businessValue.roi || 0);
    });
  });

  describe('Timeline Calculation', () => {
    it('should calculate timeline based on phases', async () => {
      const input: SmartPlanInput = {
        projectId: 'timeline-project',
        planType: 'development',
        scope: {
          timeline: {
            startDate: '2025-01-01',
            endDate: '2025-03-01',
            duration: 8
          }
        }
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.projectPlan.timeline.startDate).toBe('2025-01-01');
      expect(result.data?.projectPlan.timeline.endDate).toBe('2025-03-01');
      expect(result.data?.projectPlan.timeline.totalDuration).toBeGreaterThan(0);
      expect(result.data?.projectPlan.timeline.criticalPath).toHaveLength(2);
    });

    it('should generate default timeline when not specified', async () => {
      const input: SmartPlanInput = {
        projectId: 'default-timeline',
        planType: 'development'
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.projectPlan.timeline.startDate).toBeDefined();
      expect(result.data?.projectPlan.timeline.endDate).toBeDefined();
      expect(result.data?.projectPlan.timeline.totalDuration).toBeGreaterThan(0);
    });
  });

  describe('Risk Assessment', () => {
    it('should generate risks for each phase', async () => {
      const input: SmartPlanInput = {
        projectId: 'risk-project',
        planType: 'development'
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.projectPlan.phases[0].risks).toHaveLength(3);
      expect(result.data?.projectPlan.phases[0].risks[0]).toHaveProperty('description');
      expect(result.data?.projectPlan.phases[0].risks[0]).toHaveProperty('impact');
      expect(result.data?.projectPlan.phases[0].risks[0]).toHaveProperty('probability');
      expect(result.data?.projectPlan.phases[0].risks[0]).toHaveProperty('mitigation');
    });

    it('should include scope creep risk for long phases', async () => {
      const input: SmartPlanInput = {
        projectId: 'long-project',
        planType: 'development',
        scope: {
          timeline: { duration: 12 }
        }
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      const longPhase = result.data?.projectPlan.phases.find(phase => phase.duration > 2);
      expect(longPhase).toBeDefined();
      expect(longPhase?.risks.some(risk => risk.description.includes('Scope creep'))).toBe(true);
    });
  });

  describe('Plan ID Generation', () => {
    it('should generate unique plan IDs', async () => {
      const input1: SmartPlanInput = {
        projectId: 'test-project-1',
        planType: 'development'
      };

      const input2: SmartPlanInput = {
        projectId: 'test-project-2',
        planType: 'testing'
      };

      const result1 = await tool.execute(input1);
      const result2 = await tool.execute(input2);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.data?.planId).not.toBe(result2.data?.planId);
      expect(result1.data?.planId).toContain('test-project-1');
      expect(result1.data?.planId).toContain('development');
      expect(result2.data?.planId).toContain('test-project-2');
      expect(result2.data?.planId).toContain('testing');
    });

    it('should clean project IDs in plan IDs', async () => {
      const input: SmartPlanInput = {
        projectId: 'Test Project with Special Characters!',
        planType: 'development'
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.planId).toContain('test-project-with-special-characters');
      expect(result.data?.planId).not.toContain('!');
      expect(result.data?.planId).not.toContain(' ');
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors', async () => {
      const invalidInput = {
        projectId: '', // Invalid: empty string
        planType: 'invalid-type', // Invalid: not in enum
        scope: 'not-an-object' // Invalid: should be object
      } as any;

      const result = await tool.execute(invalidInput);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Project ID is required');
    });

    it('should handle missing required fields', async () => {
      const invalidInput = {
        // Missing projectId
        planType: 'development'
      } as any;

      const result = await tool.execute(invalidInput);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Required');
    });
  });

  describe('Performance', () => {
    it('should complete within reasonable time', async () => {
      const input: SmartPlanInput = {
        projectId: 'perf-project',
        planType: 'development',
        scope: {
          features: ['feature1', 'feature2', 'feature3'],
          resources: {
            teamSize: 8,
            budget: 200000,
            externalTools: ['AWS', 'Stripe', 'MongoDB', 'Redis', 'Elasticsearch']
          }
        },
        externalMCPs: [
          { name: 'MCP1', description: 'Service 1', integrationType: 'api', priority: 'high', estimatedEffort: 5 },
          { name: 'MCP2', description: 'Service 2', integrationType: 'database', priority: 'medium', estimatedEffort: 3 }
        ],
        qualityRequirements: {
          testCoverage: 95,
          securityLevel: 'high',
          performanceTargets: {
            responseTime: 25,
            throughput: 5000,
            availability: 99.99
          }
        },
        businessContext: {
          goals: ['goal1', 'goal2'],
          targetUsers: ['user1', 'user2'],
          priority: 'high',
          riskTolerance: 'low'
        }
      };

      const startTime = performance.now();
      const result = await tool.execute(input);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(3000); // Should complete within 3 seconds
    });
  });

  describe('Recommendations', () => {
    it('should generate appropriate recommendations', async () => {
      const input: SmartPlanInput = {
        projectId: 'rec-project',
        planType: 'development',
        scope: {
          resources: {
            budget: 10000 // Low budget
          }
        },
        qualityRequirements: {
          securityLevel: 'high'
        }
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.recommendations).toContain('Consider adding buffer time for unexpected delays');
      expect(result.data?.recommendations).toContain('Implement regular risk assessment reviews');
      expect(result.data?.recommendations).toContain('Engage security experts early in the process');
    });
  });
});
