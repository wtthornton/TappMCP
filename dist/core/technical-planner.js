#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicalPlanner = exports.OptimizedPlanSchema = exports.TimelineSchema = exports.DependencySchema = exports.EffortEstimateSchema = exports.TaskSchema = exports.ArchitectureSchema = void 0;
const zod_1 = require("zod");
// Technical planning schemas
exports.ArchitectureSchema = zod_1.z.object({
    components: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        type: zod_1.z.enum(['frontend', 'backend', 'database', 'external', 'service']),
        description: zod_1.z.string(),
        dependencies: zod_1.z.array(zod_1.z.string()),
        complexity: zod_1.z.enum(['low', 'medium', 'high']),
    })),
    patterns: zod_1.z.array(zod_1.z.string()),
    technologies: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        category: zod_1.z.enum(['language', 'framework', 'database', 'tool', 'service']),
        justification: zod_1.z.string(),
    })),
    constraints: zod_1.z.array(zod_1.z.string()),
});
exports.TaskSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    type: zod_1.z.enum(['development', 'testing', 'deployment', 'documentation', 'research']),
    priority: zod_1.z.enum(['low', 'medium', 'high', 'critical']),
    estimatedHours: zod_1.z.number().min(1),
    dependencies: zod_1.z.array(zod_1.z.string()),
    skills: zod_1.z.array(zod_1.z.string()),
    phase: zod_1.z.string(),
});
exports.EffortEstimateSchema = zod_1.z.object({
    totalHours: zod_1.z.number(),
    breakdown: zod_1.z.object({
        development: zod_1.z.number(),
        testing: zod_1.z.number(),
        deployment: zod_1.z.number(),
        documentation: zod_1.z.number(),
        research: zod_1.z.number(),
    }),
    confidence: zod_1.z.enum(['low', 'medium', 'high']),
    assumptions: zod_1.z.array(zod_1.z.string()),
});
exports.DependencySchema = zod_1.z.object({
    id: zod_1.z.string(),
    from: zod_1.z.string(),
    to: zod_1.z.string(),
    type: zod_1.z.enum(['blocks', 'requires', 'enables', 'influences']),
    description: zod_1.z.string(),
});
exports.TimelineSchema = zod_1.z.object({
    phases: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string(),
        startDate: zod_1.z.string(),
        endDate: zod_1.z.string(),
        duration: zod_1.z.number(),
        tasks: zod_1.z.array(zod_1.z.string()),
        milestones: zod_1.z.array(zod_1.z.string()),
    })),
    criticalPath: zod_1.z.array(zod_1.z.string()),
    totalDuration: zod_1.z.number(),
    bufferTime: zod_1.z.number(),
});
exports.OptimizedPlanSchema = zod_1.z.object({
    originalEffort: zod_1.z.number(),
    optimizedEffort: zod_1.z.number(),
    savingsHours: zod_1.z.number(),
    optimizations: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.enum(['parallel', 'reuse', 'simplify', 'automate']),
        description: zod_1.z.string(),
        impact: zod_1.z.string(),
        savings: zod_1.z.number(),
    })),
    riskAdjustments: zod_1.z.array(zod_1.z.object({
        risk: zod_1.z.string(),
        adjustment: zod_1.z.string(),
        impact: zod_1.z.number(),
    })),
});
class TechnicalPlanner {
    /**
     * Create system architecture based on requirements
     */
    createArchitecture(requirements) {
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
        return exports.ArchitectureSchema.parse({
            components,
            patterns,
            technologies,
            constraints,
        });
    }
    /**
     * Estimate effort for tasks
     */
    estimateEffort(tasks) {
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
        const highComplexityTasks = tasks.filter(t => t.estimatedHours > 40 || t.dependencies.length > 3).length;
        const confidence = highComplexityTasks > tasks.length * 0.3
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
        return exports.EffortEstimateSchema.parse({
            totalHours,
            breakdown,
            confidence,
            assumptions,
        });
    }
    /**
     * Identify dependencies between tasks
     */
    identifyDependencies(tasks) {
        const dependencies = [];
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
    createTimeline(phases) {
        const timelinePhases = [];
        let currentDate = new Date();
        let totalDuration = 0;
        const allTaskIds = [];
        phases.forEach((phase, index) => {
            const phaseDuration = phase.duration ??
                Math.ceil(phase.tasks.reduce((sum, task) => sum + task.estimatedHours, 0) / 40); // 40 hours per week
            const startDate = new Date(currentDate);
            const endDate = new Date(currentDate);
            endDate.setDate(endDate.getDate() + phaseDuration * 7); // Convert weeks to days
            const taskIds = phase.tasks.map(t => t.id);
            const milestones = [`Complete ${phase.name} phase`];
            if (index === 0)
                milestones.unshift('Project kickoff');
            if (index === phases.length - 1)
                milestones.push('Project completion');
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
        return exports.TimelineSchema.parse({
            phases: timelinePhases,
            criticalPath,
            totalDuration,
            bufferTime,
        });
    }
    /**
     * Optimize plan for efficiency
     */
    optimizePlan(plan) {
        const optimizations = [];
        let totalSavings = 0;
        const riskAdjustments = [];
        // Identify parallelization opportunities
        const parallelizable = this.identifyParallelTasks(plan.tasks);
        if (parallelizable.length > 0) {
            const savings = parallelizable.length * 8; // 8 hours savings per parallel task
            optimizations.push({
                type: 'parallel',
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
                type: 'reuse',
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
                type: 'automate',
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
                type: 'simplify',
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
        return exports.OptimizedPlanSchema.parse({
            originalEffort: plan.effort.totalHours,
            optimizedEffort,
            savingsHours: totalSavings,
            optimizations,
            riskAdjustments,
        });
    }
    // Private helper methods
    identifyComponents(requirements) {
        const components = [];
        // Always include core components
        components.push({
            name: 'User Interface',
            type: 'frontend',
            description: 'Main user interface for the application',
            dependencies: ['Backend API'],
            complexity: 'medium',
        });
        components.push({
            name: 'Backend API',
            type: 'backend',
            description: 'Core business logic and API endpoints',
            dependencies: ['Database'],
            complexity: 'medium',
        });
        components.push({
            name: 'Database',
            type: 'database',
            description: 'Data storage and persistence layer',
            dependencies: [],
            complexity: 'low',
        });
        // Add components based on requirements (including business request analysis)
        const allGoals = requirements.primaryGoals.join(' ').toLowerCase();
        if (allGoals.includes('auth') || allGoals.includes('login') || allGoals.includes('security')) {
            components.push({
                name: 'Authentication Service',
                type: 'service',
                description: 'User authentication and authorization',
                dependencies: ['Database'],
                complexity: 'medium',
            });
        }
        if (allGoals.includes('report') ||
            allGoals.includes('analytics') ||
            allGoals.includes('dashboard')) {
            components.push({
                name: 'Analytics Engine',
                type: 'service',
                description: 'Real-time analytics and reporting',
                dependencies: ['Database', 'Backend API'],
                complexity: 'high',
            });
        }
        if (allGoals.includes('crm') || allGoals.includes('customer')) {
            components.push({
                name: 'CRM Module',
                type: 'service',
                description: 'Customer relationship management',
                dependencies: ['Database', 'Backend API'],
                complexity: 'high',
            });
        }
        if (allGoals.includes('erp') || allGoals.includes('enterprise')) {
            components.push({
                name: 'ERP System',
                type: 'service',
                description: 'Enterprise resource planning',
                dependencies: ['Database', 'Backend API'],
                complexity: 'high',
            });
        }
        if (allGoals.includes('api') || allGoals.includes('integration')) {
            components.push({
                name: 'Integration Gateway',
                type: 'service',
                description: 'External API integrations',
                dependencies: ['Backend API'],
                complexity: 'medium',
            });
        }
        if (allGoals.includes('mobile') || allGoals.includes('app')) {
            components.push({
                name: 'Mobile API',
                type: 'service',
                description: 'Mobile application backend',
                dependencies: ['Backend API'],
                complexity: 'medium',
            });
        }
        if (allGoals.includes('multi-tenant') || allGoals.includes('tenant')) {
            components.push({
                name: 'Tenant Management',
                type: 'service',
                description: 'Multi-tenant architecture support',
                dependencies: ['Database', 'Backend API'],
                complexity: 'high',
            });
        }
        return components;
    }
    identifyPatterns(requirements) {
        const patterns = ['MVC', 'RESTful API', 'Repository Pattern'];
        if (requirements.targetUsers.length > 1) {
            patterns.push('Multi-tenant Architecture');
        }
        if (requirements.primaryGoals.some(goal => goal.toLowerCase().includes('scale'))) {
            patterns.push('Microservices', 'Load Balancing');
        }
        return patterns;
    }
    selectTechnologies(requirements, components) {
        const technologies = [
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
                category: 'database',
                justification: 'Reliable relational database with good performance',
            });
        }
        if (components.some(c => c.type === 'frontend')) {
            technologies.push({
                name: 'React',
                category: 'framework',
                justification: 'Popular frontend framework with good ecosystem',
            });
        }
        // Add security-focused tech for high security requirements
        if (requirements.constraints.some(c => c.toLowerCase().includes('security'))) {
            technologies.push({
                name: 'Helmet.js',
                category: 'tool',
                justification: 'Enhanced security headers for web applications',
            });
        }
        return technologies;
    }
    identifyConstraints(requirements) {
        return [
            'Must maintain high performance (<500ms response time)',
            'Must ensure security best practices',
            'Must be scalable and maintainable',
            ...requirements.constraints,
        ];
    }
    findCriticalPath(tasks) {
        // Simplified critical path - return IDs of longest dependency chain
        const sortedTasks = tasks
            .filter(t => t.dependencies.length > 0)
            .sort((a, b) => b.estimatedHours - a.estimatedHours);
        return sortedTasks.slice(0, 3).map(t => t.id);
    }
    identifyParallelTasks(tasks) {
        return tasks.filter(task => task.dependencies.length === 0);
    }
    identifyReusableComponents(architecture) {
        return architecture.components.filter(c => c.name.toLowerCase().includes('service') ||
            c.name.toLowerCase().includes('util') ||
            c.name.toLowerCase().includes('common'));
    }
}
exports.TechnicalPlanner = TechnicalPlanner;
//# sourceMappingURL=technical-planner.js.map