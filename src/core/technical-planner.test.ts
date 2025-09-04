#!/usr/bin/env node

import { describe, it, expect, beforeEach } from 'vitest';
import { TechnicalPlanner } from './technical-planner.js';
import type { BusinessRequirements } from './business-analyzer.js';

describe('TechnicalPlanner', () => {
  let technicalPlanner: TechnicalPlanner;

  beforeEach(() => {
    technicalPlanner = new TechnicalPlanner();
  });

  describe('createArchitecture', () => {
    it('should create architecture from business requirements', () => {
      const requirements: BusinessRequirements = {
        primaryGoals: ['User management', 'Authentication'],
        targetUsers: ['Admin', 'User'],
        successCriteria: ['Secure login', 'User management'],
        constraints: ['High security'],
        riskFactors: ['Integration complexity'],
      };

      const result = technicalPlanner.createArchitecture(requirements);

      expect(result.components).toBeDefined();
      expect(result.components.length).toBeGreaterThan(0);
      expect(result.patterns).toBeDefined();
      expect(result.technologies).toBeDefined();
      expect(result.constraints).toBeDefined();
    });

    it('should include core components in architecture', () => {
      const requirements: BusinessRequirements = {
        primaryGoals: ['Basic functionality'],
        targetUsers: ['User'],
        successCriteria: ['Working system'],
        constraints: [],
        riskFactors: [],
      };

      const result = technicalPlanner.createArchitecture(requirements);

      const componentNames = result.components.map((c: { name: string }) => c.name);
      expect(componentNames).toContain('User Interface');
      expect(componentNames).toContain('Backend API');
      expect(componentNames).toContain('Database');
    });

    it('should add authentication service for auth requirements', () => {
      const requirements: BusinessRequirements = {
        primaryGoals: ['Authentication system'],
        targetUsers: ['User'],
        successCriteria: ['Secure login'],
        constraints: [],
        riskFactors: [],
      };

      const result = technicalPlanner.createArchitecture(requirements);

      const hasAuthService = result.components.some(
        (c: { name: string }) => c.name === 'Authentication Service'
      );
      expect(hasAuthService).toBe(true);
    });

    it('should add reporting engine for reporting requirements', () => {
      const requirements: BusinessRequirements = {
        primaryGoals: ['Generate reports'],
        targetUsers: ['Admin'],
        successCriteria: ['Reports available'],
        constraints: [],
        riskFactors: [],
      };

      const result = technicalPlanner.createArchitecture(requirements);

      const hasReportingEngine = result.components.some(
        (c: { name: string }) => c.name === 'Analytics Engine'
      );
      expect(hasReportingEngine).toBe(true);
    });

    it('should complete within performance target', () => {
      const requirements: BusinessRequirements = {
        primaryGoals: ['Test performance'],
        targetUsers: ['User'],
        successCriteria: ['Fast response'],
        constraints: [],
        riskFactors: [],
      };

      const startTime = Date.now();
      technicalPlanner.createArchitecture(requirements);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(100); // <100ms target
    });
  });

  describe('estimateEffort', () => {
    it('should estimate effort for tasks', () => {
      const tasks = [
        {
          id: 'task-1',
          name: 'Development Task',
          description: 'Test task',
          type: 'development' as const,
          priority: 'high' as const,
          estimatedHours: 40,
          dependencies: [],
          skills: ['Development'],
          phase: 'Development',
        },
        {
          id: 'task-2',
          name: 'Testing Task',
          description: 'Test task',
          type: 'testing' as const,
          priority: 'medium' as const,
          estimatedHours: 20,
          dependencies: ['task-1'],
          skills: ['Testing'],
          phase: 'Testing',
        },
      ];

      const result = technicalPlanner.estimateEffort(tasks);

      expect(result.totalHours).toBe(60);
      expect(result.breakdown.development).toBe(40);
      expect(result.breakdown.testing).toBe(20);
      expect(['low', 'medium', 'high']).toContain(result.confidence);
      expect(Array.isArray(result.assumptions)).toBe(true);
    });

    it('should set low confidence for complex tasks', () => {
      const tasks = [
        {
          id: 'task-1',
          name: 'Complex Task',
          description: 'Very complex task',
          type: 'development' as const,
          priority: 'high' as const,
          estimatedHours: 80, // High complexity
          dependencies: ['dep1', 'dep2', 'dep3', 'dep4'], // Many dependencies
          skills: ['Development'],
          phase: 'Development',
        },
        {
          id: 'task-2',
          name: 'Another Complex Task',
          description: 'Another complex task',
          type: 'development' as const,
          priority: 'high' as const,
          estimatedHours: 60,
          dependencies: ['dep1', 'dep2', 'dep3'],
          skills: ['Development'],
          phase: 'Development',
        },
      ];

      const result = technicalPlanner.estimateEffort(tasks);

      expect(result.confidence).toBe('low');
    });
  });

  describe('identifyDependencies', () => {
    it('should identify dependencies between tasks', () => {
      const tasks = [
        {
          id: 'task-1',
          name: 'Foundation',
          description: 'Base task',
          type: 'development' as const,
          priority: 'high' as const,
          estimatedHours: 20,
          dependencies: [],
          skills: ['Development'],
          phase: 'Development',
        },
        {
          id: 'task-2',
          name: 'Dependent Task',
          description: 'Depends on task-1',
          type: 'testing' as const,
          priority: 'medium' as const,
          estimatedHours: 10,
          dependencies: ['task-1'],
          skills: ['Testing'],
          phase: 'Testing',
        },
      ];

      const result = technicalPlanner.identifyDependencies(tasks);

      expect(result.length).toBeGreaterThan(0);
      const dependency = result.find(
        (d: { from: string; to: string }) => d.from === 'task-1' && d.to === 'task-2'
      );
      expect(dependency).toBeDefined();
    });

    it('should create logical phase dependencies', () => {
      const tasks = [
        {
          id: 'dev-task',
          name: 'Development',
          description: 'Dev task',
          type: 'development' as const,
          priority: 'high' as const,
          estimatedHours: 20,
          dependencies: [],
          skills: ['Development'],
          phase: 'Development',
        },
        {
          id: 'test-task',
          name: 'Testing',
          description: 'Test task',
          type: 'testing' as const,
          priority: 'medium' as const,
          estimatedHours: 10,
          dependencies: [],
          skills: ['Testing'],
          phase: 'Testing',
        },
      ];

      const result = technicalPlanner.identifyDependencies(tasks);

      const phaseDependency = result.find(
        (d: { type: string; description: string }) =>
          d.type === 'enables' && d.description.includes('development enables testing')
      );
      expect(phaseDependency).toBeDefined();
    });
  });

  describe('createTimeline', () => {
    it('should create timeline with phases', () => {
      const phases = [
        {
          name: 'Development',
          tasks: [
            {
              id: 'task-1',
              name: 'Dev Task',
              description: 'Development task',
              type: 'development' as const,
              priority: 'high' as const,
              estimatedHours: 40,
              dependencies: [],
              skills: ['Development'],
              phase: 'Development',
            },
          ],
        },
        {
          name: 'Testing',
          tasks: [
            {
              id: 'task-2',
              name: 'Test Task',
              description: 'Testing task',
              type: 'testing' as const,
              priority: 'medium' as const,
              estimatedHours: 20,
              dependencies: ['task-1'],
              skills: ['Testing'],
              phase: 'Testing',
            },
          ],
        },
      ];

      const result = technicalPlanner.createTimeline(phases);

      expect(result.phases.length).toBe(2);
      expect(result.totalDuration).toBeGreaterThan(0);
      expect(result.bufferTime).toBeGreaterThan(0);
      expect(Array.isArray(result.criticalPath)).toBe(true);
    });

    it('should calculate buffer time as 15% of total duration', () => {
      const phases = [
        {
          name: 'Test Phase',
          tasks: [
            {
              id: 'task-1',
              name: 'Task',
              description: 'Test task',
              type: 'development' as const,
              priority: 'medium' as const,
              estimatedHours: 80, // 2 weeks
              dependencies: [],
              skills: ['Development'],
              phase: 'Development',
            },
          ],
        },
      ];

      const result = technicalPlanner.createTimeline(phases);

      const expectedBuffer = Math.ceil(result.totalDuration * 0.15);
      expect(result.bufferTime).toBe(expectedBuffer);
    });
  });

  describe('optimizePlan', () => {
    it('should optimize plan and identify savings', () => {
      const plan = {
        id: 'test-plan',
        name: 'Test Plan',
        description: 'Test plan for optimization',
        architecture: {
          components: [
            {
              name: 'Common Service',
              type: 'service' as const,
              description: 'Reusable service',
              dependencies: [],
              complexity: 'medium' as const,
            },
          ],
          patterns: ['MVC'],
          technologies: [],
          constraints: [],
        },
        tasks: [
          {
            id: 'task-1',
            name: 'Independent Task',
            description: 'Can run in parallel',
            type: 'development' as const,
            priority: 'medium' as const,
            estimatedHours: 20,
            dependencies: [],
            skills: ['Development'],
            phase: 'Development',
          },
          {
            id: 'task-2',
            name: 'Testing Task',
            description: 'Can be automated',
            type: 'testing' as const,
            priority: 'medium' as const,
            estimatedHours: 16,
            dependencies: [],
            skills: ['Testing'],
            phase: 'Testing',
          },
        ],
        timeline: {
          phases: [],
          criticalPath: [],
          totalDuration: 4,
          bufferTime: 1,
        },
        effort: {
          totalHours: 100,
          breakdown: {
            development: 60,
            testing: 20,
            deployment: 10,
            documentation: 10,
            research: 0,
          },
          confidence: 'medium' as const,
          assumptions: [],
        },
        dependencies: [],
      };

      const result = technicalPlanner.optimizePlan(plan);

      expect(result.originalEffort).toBe(100);
      expect(result.optimizedEffort).toBeLessThan(100);
      expect(result.savingsHours).toBeGreaterThan(0);
      expect(Array.isArray(result.optimizations)).toBe(true);
      expect(result.optimizations.length).toBeGreaterThan(0);
    });

    it('should identify parallelization opportunities', () => {
      const plan = {
        id: 'test-plan',
        name: 'Test Plan',
        description: 'Plan with parallel tasks',
        architecture: {
          components: [],
          patterns: [],
          technologies: [],
          constraints: [],
        },
        tasks: [
          {
            id: 'task-1',
            name: 'Independent Task 1',
            description: 'No dependencies',
            type: 'development' as const,
            priority: 'medium' as const,
            estimatedHours: 20,
            dependencies: [], // No dependencies - can be parallelized
            skills: ['Development'],
            phase: 'Development',
          },
          {
            id: 'task-2',
            name: 'Independent Task 2',
            description: 'No dependencies',
            type: 'development' as const,
            priority: 'medium' as const,
            estimatedHours: 20,
            dependencies: [], // No dependencies - can be parallelized
            skills: ['Development'],
            phase: 'Development',
          },
        ],
        timeline: { phases: [], criticalPath: [], totalDuration: 4, bufferTime: 1 },
        effort: {
          totalHours: 100,
          breakdown: {
            development: 60,
            testing: 20,
            deployment: 10,
            documentation: 10,
            research: 0,
          },
          confidence: 'medium' as const,
          assumptions: [],
        },
        dependencies: [],
      };

      const result = technicalPlanner.optimizePlan(plan);

      const parallelOptimization = result.optimizations.find(
        (opt: { type: string }) => opt.type === 'parallel'
      );
      expect(parallelOptimization).toBeDefined();
    });
  });

  describe('performance', () => {
    it('should maintain performance targets', () => {
      const requirements: BusinessRequirements = {
        primaryGoals: ['Complex system with multiple components'],
        targetUsers: ['Multiple user types'],
        successCriteria: ['High performance'],
        constraints: ['Performance requirements'],
        riskFactors: ['Technical complexity'],
      };

      const startTime = Date.now();

      technicalPlanner.createArchitecture(requirements);
      const tasks = [
        {
          id: 'task-1',
          name: 'Task',
          description: 'Test task',
          type: 'development' as const,
          priority: 'high' as const,
          estimatedHours: 40,
          dependencies: [],
          skills: ['Development'],
          phase: 'Development',
        },
      ];

      technicalPlanner.estimateEffort(tasks);
      technicalPlanner.identifyDependencies(tasks);

      const totalTime = Date.now() - startTime;
      expect(totalTime).toBeLessThan(200); // All operations under 200ms
    });
  });
});
