#!/usr/bin/env node

import { z } from 'zod';
import type { BusinessRequirements } from './business-analyzer.js';

// Technical planning schemas
export const ArchitectureSchema = z.object({
  components: z.array(
    z.object({
      name: z.string(),
      type: z.enum(['frontend', 'backend', 'database', 'external', 'service']),
      description: z.string(),
      dependencies: z.array(z.string()),
      complexity: z.enum(['low', 'medium', 'high']),
    })
  ),
  patterns: z.array(z.string()),
  technologies: z.array(
    z.object({
      name: z.string(),
      category: z.enum(['language', 'framework', 'database', 'tool', 'service']),
      justification: z.string(),
    })
  ),
  constraints: z.array(z.string()),
});

export const TaskSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(['development', 'testing', 'deployment', 'documentation', 'research']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  estimatedHours: z.number().min(1),
  dependencies: z.array(z.string()),
  skills: z.array(z.string()),
  phase: z.string(),
});

export const EffortEstimateSchema = z.object({
  totalHours: z.number(),
  breakdown: z.object({
    development: z.number(),
    testing: z.number(),
    deployment: z.number(),
    documentation: z.number(),
    research: z.number(),
  }),
  confidence: z.enum(['low', 'medium', 'high']),
  assumptions: z.array(z.string()),
});

export const DependencySchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  type: z.enum(['blocks', 'requires', 'enables', 'influences']),
  description: z.string(),
});

export const TimelineSchema = z.object({
  phases: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      duration: z.number(),
      tasks: z.array(z.string()),
      milestones: z.array(z.string()),
    })
  ),
  criticalPath: z.array(z.string()),
  totalDuration: z.number(),
  bufferTime: z.number(),
});

export const OptimizedPlanSchema = z.object({
  originalEffort: z.number(),
  optimizedEffort: z.number(),
  savingsHours: z.number(),
  optimizations: z.array(
    z.object({
      type: z.enum(['parallel', 'reuse', 'simplify', 'automate']),
      description: z.string(),
      impact: z.string(),
      savings: z.number(),
    })
  ),
  riskAdjustments: z.array(
    z.object({
      risk: z.string(),
      adjustment: z.string(),
      impact: z.number(),
    })
  ),
});

export type Architecture = z.infer<typeof ArchitectureSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type EffortEstimate = z.infer<typeof EffortEstimateSchema>;
export type Dependency = z.infer<typeof DependencySchema>;
export type Timeline = z.infer<typeof TimelineSchema>;
export type OptimizedPlan = z.infer<typeof OptimizedPlanSchema>;

export interface Plan {
  id: string;
  name: string;
  description: string;
  architecture: Architecture;
  tasks: Task[];
  timeline: Timeline;
  effort: EffortEstimate;
  dependencies: Dependency[];
}

export class TechnicalPlanner {
  /**
   * Create system architecture based on requirements
   */
  createArchitecture(requirements: BusinessRequirements): Architecture {
    const startTime = Date.now();

    // Analyze requirements to determine components
    const components = this.identifyComponents(requirements);

    // Identify architectural patterns
    const patterns = this.identifyPatterns(requirements);

    // Select technologies
    const technologies = this.selectTechnologies(requirements, components);

    // Identify constraints
    const constraints = this.identifyConstraints(requirements);

    const processingTime = Date.now() - startTime;
    if (processingTime > 100) {
      // eslint-disable-next-line no-console
      console.warn(`Architecture creation took ${processingTime}ms - target is <100ms`);
    }

    return ArchitectureSchema.parse({
      components,
      patterns,
      technologies,
      constraints,
    });
  }

  /**
   * Estimate effort for tasks
   */
  estimateEffort(tasks: Task[]): EffortEstimate {
    const breakdown = {
      development: 0,
      testing: 0,
      deployment: 0,
      documentation: 0,
      research: 0,
    };

    // Calculate effort breakdown
    tasks.forEach(task => {
      breakdown[task.type] += task.estimatedHours;
    });

    const totalHours = Object.values(breakdown).reduce((sum, hours) => sum + hours, 0);

    // Determine confidence based on task complexity
    const highComplexityTasks = tasks.filter(
      t => t.estimatedHours > 40 || t.dependencies.length > 3
    ).length;

    const confidence =
      highComplexityTasks > tasks.length * 0.3
        ? 'low'
        : highComplexityTasks > tasks.length * 0.1
          ? 'medium'
          : 'high';

    // Generate assumptions
    const assumptions = [
      'Team has required technical skills',
      'No major blockers or external dependencies',
      'Requirements remain stable during development',
      'Standard working hours and availability',
    ];

    if (confidence === 'low') {
      assumptions.push('High complexity may require additional research time');
    }

    return EffortEstimateSchema.parse({
      totalHours,
      breakdown,
      confidence,
      assumptions,
    });
  }

  /**
   * Identify dependencies between tasks
   */
  identifyDependencies(tasks: Task[]): Dependency[] {
    const dependencies: Dependency[] = [];

    // Analyze task dependencies
    tasks.forEach(task => {
      task.dependencies.forEach(depId => {
        const dependentTask = tasks.find(t => t.id === depId);
        if (dependentTask) {
          dependencies.push({
            id: `dep-${task.id}-${depId}`,
            from: depId,
            to: task.id,
            type: 'blocks',
            description: `${dependentTask.name} must complete before ${task.name}`,
          });
        }
      });
    });

    // Add logical dependencies based on task types
    const phases = ['research', 'development', 'testing', 'deployment', 'documentation'];

    phases.forEach((phase, index) => {
      if (index < phases.length - 1) {
        const currentPhaseTasks = tasks.filter(t => t.type === phase);
        const nextPhaseTasks = tasks.filter(t => t.type === phases[index + 1]);

        currentPhaseTasks.forEach(currentTask => {
          nextPhaseTasks.forEach(nextTask => {
            dependencies.push({
              id: `dep-phase-${currentTask.id}-${nextTask.id}`,
              from: currentTask.id,
              to: nextTask.id,
              type: 'enables',
              description: `${phase} enables ${phases[index + 1]}`,
            });
          });
        });
      }
    });

    return dependencies;
  }

  /**
   * Create project timeline with phases
   */
  createTimeline(
    phases: Array<{
      name: string;
      tasks: Task[];
      duration?: number;
    }>
  ): Timeline {
    const timelinePhases: Array<{
      id: string;
      name: string;
      startDate: string;
      endDate: string;
      duration: number;
      tasks: string[];
      milestones: string[];
    }> = [];
    let currentDate = new Date();
    let totalDuration = 0;
    const allTaskIds: string[] = [];

    phases.forEach((phase, index) => {
      const phaseDuration =
        phase.duration ??
        Math.ceil(phase.tasks.reduce((sum, task) => sum + task.estimatedHours, 0) / 40); // 40 hours per week

      const startDate = new Date(currentDate);
      const endDate = new Date(currentDate);
      endDate.setDate(endDate.getDate() + phaseDuration * 7); // Convert weeks to days

      const taskIds = phase.tasks.map(t => t.id);
      const milestones = [`Complete ${phase.name} phase`];

      if (index === 0) milestones.unshift('Project kickoff');
      if (index === phases.length - 1) milestones.push('Project completion');

      timelinePhases.push({
        id: `phase-${index + 1}`,
        name: phase.name,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        duration: phaseDuration,
        tasks: taskIds,
        milestones,
      });

      allTaskIds.push(...taskIds);
      totalDuration += phaseDuration;
      currentDate = endDate;
    });

    // Calculate buffer time (15% of total duration)
    const bufferTime = Math.ceil(totalDuration * 0.15);

    // Identify critical path (simplified - longest chain of dependencies)
    const criticalPath = this.findCriticalPath(phases.flatMap(p => p.tasks));

    return TimelineSchema.parse({
      phases: timelinePhases,
      criticalPath,
      totalDuration,
      bufferTime,
    });
  }

  /**
   * Optimize plan for efficiency
   */
  optimizePlan(plan: Plan): OptimizedPlan {
    const optimizations = [];
    let totalSavings = 0;
    const riskAdjustments = [];

    // Identify parallelization opportunities
    const parallelizable = this.identifyParallelTasks(plan.tasks);
    if (parallelizable.length > 0) {
      const savings = parallelizable.length * 8; // 8 hours savings per parallel task
      optimizations.push({
        type: 'parallel' as const,
        description: `Parallelize ${parallelizable.length} independent tasks`,
        impact: 'Reduce overall timeline',
        savings,
      });
      totalSavings += savings;
    }

    // Identify code reuse opportunities
    const reusable = this.identifyReusableComponents(plan.architecture);
    if (reusable.length > 0) {
      const savings = reusable.length * 16; // 16 hours savings per reused component
      optimizations.push({
        type: 'reuse' as const,
        description: `Reuse ${reusable.length} existing components`,
        impact: 'Reduce development time',
        savings,
      });
      totalSavings += savings;
    }

    // Identify automation opportunities
    const automatable = plan.tasks.filter(t => t.type === 'testing' || t.type === 'deployment');
    if (automatable.length > 0) {
      const savings = automatable.reduce((sum, t) => sum + t.estimatedHours * 0.6, 0);
      optimizations.push({
        type: 'automate' as const,
        description: `Automate ${automatable.length} testing/deployment tasks`,
        impact: 'Reduce manual effort and errors',
        savings,
      });
      totalSavings += savings;
    }

    // Identify simplification opportunities
    const complex = plan.tasks.filter(t => t.estimatedHours > 40);
    if (complex.length > 0) {
      const savings = complex.length * 8; // 8 hours savings per simplified task
      optimizations.push({
        type: 'simplify' as const,
        description: `Simplify ${complex.length} complex tasks`,
        impact: 'Reduce complexity and risk',
        savings,
      });
      totalSavings += savings;
    }

    // Add risk adjustments
    if (plan.effort.confidence === 'low') {
      riskAdjustments.push({
        risk: 'Low confidence estimate',
        adjustment: 'Add 25% buffer time',
        impact: plan.effort.totalHours * 0.25,
      });
    }

    const optimizedEffort = plan.effort.totalHours - totalSavings;

    return OptimizedPlanSchema.parse({
      originalEffort: plan.effort.totalHours,
      optimizedEffort,
      savingsHours: totalSavings,
      optimizations,
      riskAdjustments,
    });
  }

  // Private helper methods
  private identifyComponents(requirements: BusinessRequirements) {
    const components = [];

    // Always include core components
    components.push({
      name: 'User Interface',
      type: 'frontend' as const,
      description: 'Main user interface for the application',
      dependencies: ['Backend API'],
      complexity: 'medium' as const,
    });

    components.push({
      name: 'Backend API',
      type: 'backend' as const,
      description: 'Core business logic and API endpoints',
      dependencies: ['Database'],
      complexity: 'medium' as const,
    });

    components.push({
      name: 'Database',
      type: 'database' as const,
      description: 'Data storage and persistence layer',
      dependencies: [],
      complexity: 'low' as const,
    });

    // Add components based on requirements (including business request analysis)
    const allGoals = requirements.primaryGoals.join(' ').toLowerCase();

    if (allGoals.includes('auth') || allGoals.includes('login') || allGoals.includes('security')) {
      components.push({
        name: 'Authentication Service',
        type: 'service' as const,
        description: 'User authentication and authorization',
        dependencies: ['Database'],
        complexity: 'medium' as const,
      });
    }

    if (
      allGoals.includes('report') ||
      allGoals.includes('analytics') ||
      allGoals.includes('dashboard')
    ) {
      components.push({
        name: 'Analytics Engine',
        type: 'service' as const,
        description: 'Real-time analytics and reporting',
        dependencies: ['Database', 'Backend API'],
        complexity: 'high' as const,
      });
    }

    if (allGoals.includes('crm') || allGoals.includes('customer')) {
      components.push({
        name: 'CRM Module',
        type: 'service' as const,
        description: 'Customer relationship management',
        dependencies: ['Database', 'Backend API'],
        complexity: 'high' as const,
      });
    }

    if (allGoals.includes('erp') || allGoals.includes('enterprise')) {
      components.push({
        name: 'ERP System',
        type: 'service' as const,
        description: 'Enterprise resource planning',
        dependencies: ['Database', 'Backend API'],
        complexity: 'high' as const,
      });
    }

    if (allGoals.includes('api') || allGoals.includes('integration')) {
      components.push({
        name: 'Integration Gateway',
        type: 'service' as const,
        description: 'External API integrations',
        dependencies: ['Backend API'],
        complexity: 'medium' as const,
      });
    }

    if (allGoals.includes('mobile') || allGoals.includes('app')) {
      components.push({
        name: 'Mobile API',
        type: 'service' as const,
        description: 'Mobile application backend',
        dependencies: ['Backend API'],
        complexity: 'medium' as const,
      });
    }

    if (allGoals.includes('multi-tenant') || allGoals.includes('tenant')) {
      components.push({
        name: 'Tenant Management',
        type: 'service' as const,
        description: 'Multi-tenant architecture support',
        dependencies: ['Database', 'Backend API'],
        complexity: 'high' as const,
      });
    }

    return components;
  }

  private identifyPatterns(requirements: BusinessRequirements): string[] {
    const patterns = ['MVC', 'RESTful API', 'Repository Pattern'];

    if (requirements.targetUsers.length > 1) {
      patterns.push('Multi-tenant Architecture');
    }

    if (requirements.primaryGoals.some(goal => goal.toLowerCase().includes('scale'))) {
      patterns.push('Microservices', 'Load Balancing');
    }

    return patterns;
  }

  private selectTechnologies(
    requirements: BusinessRequirements,
    components: Array<{
      name: string;
      type: string;
      description: string;
      dependencies: string[];
      complexity: string;
    }>
  ): Array<{
    name: string;
    category: 'language' | 'framework' | 'database' | 'tool' | 'service';
    justification: string;
  }> {
    const technologies: Array<{
      name: string;
      category: 'language' | 'framework' | 'database' | 'tool' | 'service';
      justification: string;
    }> = [
      {
        name: 'TypeScript',
        category: 'language',
        justification: 'Type safety and better development experience',
      },
      {
        name: 'Node.js',
        category: 'framework',
        justification: 'JavaScript runtime for backend development',
      },
    ];

    if (components.some(c => c.type === 'database')) {
      technologies.push({
        name: 'PostgreSQL',
        category: 'database' as const,
        justification: 'Reliable relational database with good performance',
      });
    }

    if (components.some(c => c.type === 'frontend')) {
      technologies.push({
        name: 'React',
        category: 'framework' as const,
        justification: 'Popular frontend framework with good ecosystem',
      });
    }

    // Add security-focused tech for high security requirements
    if (requirements.constraints.some(c => c.toLowerCase().includes('security'))) {
      technologies.push({
        name: 'Helmet.js',
        category: 'tool' as const,
        justification: 'Enhanced security headers for web applications',
      });
    }

    return technologies;
  }

  private identifyConstraints(requirements: BusinessRequirements): string[] {
    return [
      'Must maintain high performance (<500ms response time)',
      'Must ensure security best practices',
      'Must be scalable and maintainable',
      ...requirements.constraints,
    ];
  }

  private findCriticalPath(tasks: Task[]): string[] {
    // Simplified critical path - return IDs of longest dependency chain
    const sortedTasks = tasks
      .filter(t => t.dependencies.length > 0)
      .sort((a, b) => b.estimatedHours - a.estimatedHours);

    return sortedTasks.slice(0, 3).map(t => t.id);
  }

  private identifyParallelTasks(tasks: Task[]): Task[] {
    return tasks.filter(task => task.dependencies.length === 0);
  }

  private identifyReusableComponents(architecture: Architecture) {
    return architecture.components.filter(
      c =>
        c.name.toLowerCase().includes('service') ||
        c.name.toLowerCase().includes('util') ||
        c.name.toLowerCase().includes('common')
    );
  }
}
