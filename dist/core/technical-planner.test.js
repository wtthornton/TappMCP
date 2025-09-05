#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const technical_planner_js_1 = require("./technical-planner.js");
(0, vitest_1.describe)('TechnicalPlanner', () => {
    let technicalPlanner;
    (0, vitest_1.beforeEach)(() => {
        technicalPlanner = new technical_planner_js_1.TechnicalPlanner();
    });
    (0, vitest_1.describe)('createArchitecture', () => {
        (0, vitest_1.it)('should create architecture from business requirements', () => {
            const requirements = {
                primaryGoals: ['User management', 'Authentication'],
                targetUsers: ['Admin', 'User'],
                successCriteria: ['Secure login', 'User management'],
                constraints: ['High security'],
                riskFactors: ['Integration complexity'],
            };
            const result = technicalPlanner.createArchitecture(requirements);
            (0, vitest_1.expect)(result.components).toBeDefined();
            (0, vitest_1.expect)(result.components.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(result.patterns).toBeDefined();
            (0, vitest_1.expect)(result.technologies).toBeDefined();
            (0, vitest_1.expect)(result.constraints).toBeDefined();
        });
        (0, vitest_1.it)('should include core components in architecture', () => {
            const requirements = {
                primaryGoals: ['Basic functionality'],
                targetUsers: ['User'],
                successCriteria: ['Working system'],
                constraints: [],
                riskFactors: [],
            };
            const result = technicalPlanner.createArchitecture(requirements);
            const componentNames = result.components.map((c) => c.name);
            (0, vitest_1.expect)(componentNames).toContain('User Interface');
            (0, vitest_1.expect)(componentNames).toContain('Backend API');
            (0, vitest_1.expect)(componentNames).toContain('Database');
        });
        (0, vitest_1.it)('should add authentication service for auth requirements', () => {
            const requirements = {
                primaryGoals: ['Authentication system'],
                targetUsers: ['User'],
                successCriteria: ['Secure login'],
                constraints: [],
                riskFactors: [],
            };
            const result = technicalPlanner.createArchitecture(requirements);
            const hasAuthService = result.components.some((c) => c.name === 'Authentication Service');
            (0, vitest_1.expect)(hasAuthService).toBe(true);
        });
        (0, vitest_1.it)('should add reporting engine for reporting requirements', () => {
            const requirements = {
                primaryGoals: ['Generate reports'],
                targetUsers: ['Admin'],
                successCriteria: ['Reports available'],
                constraints: [],
                riskFactors: [],
            };
            const result = technicalPlanner.createArchitecture(requirements);
            const hasReportingEngine = result.components.some((c) => c.name === 'Analytics Engine');
            (0, vitest_1.expect)(hasReportingEngine).toBe(true);
        });
        (0, vitest_1.it)('should complete within performance target', () => {
            const requirements = {
                primaryGoals: ['Test performance'],
                targetUsers: ['User'],
                successCriteria: ['Fast response'],
                constraints: [],
                riskFactors: [],
            };
            const startTime = Date.now();
            technicalPlanner.createArchitecture(requirements);
            const duration = Date.now() - startTime;
            (0, vitest_1.expect)(duration).toBeLessThan(100); // <100ms target
        });
    });
    (0, vitest_1.describe)('estimateEffort', () => {
        (0, vitest_1.it)('should estimate effort for tasks', () => {
            const tasks = [
                {
                    id: 'task-1',
                    name: 'Development Task',
                    description: 'Test task',
                    type: 'development',
                    priority: 'high',
                    estimatedHours: 40,
                    dependencies: [],
                    skills: ['Development'],
                    phase: 'Development',
                },
                {
                    id: 'task-2',
                    name: 'Testing Task',
                    description: 'Test task',
                    type: 'testing',
                    priority: 'medium',
                    estimatedHours: 20,
                    dependencies: ['task-1'],
                    skills: ['Testing'],
                    phase: 'Testing',
                },
            ];
            const result = technicalPlanner.estimateEffort(tasks);
            (0, vitest_1.expect)(result.totalHours).toBe(60);
            (0, vitest_1.expect)(result.breakdown.development).toBe(40);
            (0, vitest_1.expect)(result.breakdown.testing).toBe(20);
            (0, vitest_1.expect)(['low', 'medium', 'high']).toContain(result.confidence);
            (0, vitest_1.expect)(Array.isArray(result.assumptions)).toBe(true);
        });
        (0, vitest_1.it)('should set low confidence for complex tasks', () => {
            const tasks = [
                {
                    id: 'task-1',
                    name: 'Complex Task',
                    description: 'Very complex task',
                    type: 'development',
                    priority: 'high',
                    estimatedHours: 80, // High complexity
                    dependencies: ['dep1', 'dep2', 'dep3', 'dep4'], // Many dependencies
                    skills: ['Development'],
                    phase: 'Development',
                },
                {
                    id: 'task-2',
                    name: 'Another Complex Task',
                    description: 'Another complex task',
                    type: 'development',
                    priority: 'high',
                    estimatedHours: 60,
                    dependencies: ['dep1', 'dep2', 'dep3'],
                    skills: ['Development'],
                    phase: 'Development',
                },
            ];
            const result = technicalPlanner.estimateEffort(tasks);
            (0, vitest_1.expect)(result.confidence).toBe('low');
        });
    });
    (0, vitest_1.describe)('identifyDependencies', () => {
        (0, vitest_1.it)('should identify dependencies between tasks', () => {
            const tasks = [
                {
                    id: 'task-1',
                    name: 'Foundation',
                    description: 'Base task',
                    type: 'development',
                    priority: 'high',
                    estimatedHours: 20,
                    dependencies: [],
                    skills: ['Development'],
                    phase: 'Development',
                },
                {
                    id: 'task-2',
                    name: 'Dependent Task',
                    description: 'Depends on task-1',
                    type: 'testing',
                    priority: 'medium',
                    estimatedHours: 10,
                    dependencies: ['task-1'],
                    skills: ['Testing'],
                    phase: 'Testing',
                },
            ];
            const result = technicalPlanner.identifyDependencies(tasks);
            (0, vitest_1.expect)(result.length).toBeGreaterThan(0);
            const dependency = result.find((d) => d.from === 'task-1' && d.to === 'task-2');
            (0, vitest_1.expect)(dependency).toBeDefined();
        });
        (0, vitest_1.it)('should create logical phase dependencies', () => {
            const tasks = [
                {
                    id: 'dev-task',
                    name: 'Development',
                    description: 'Dev task',
                    type: 'development',
                    priority: 'high',
                    estimatedHours: 20,
                    dependencies: [],
                    skills: ['Development'],
                    phase: 'Development',
                },
                {
                    id: 'test-task',
                    name: 'Testing',
                    description: 'Test task',
                    type: 'testing',
                    priority: 'medium',
                    estimatedHours: 10,
                    dependencies: [],
                    skills: ['Testing'],
                    phase: 'Testing',
                },
            ];
            const result = technicalPlanner.identifyDependencies(tasks);
            const phaseDependency = result.find((d) => d.type === 'enables' && d.description.includes('development enables testing'));
            (0, vitest_1.expect)(phaseDependency).toBeDefined();
        });
    });
    (0, vitest_1.describe)('createTimeline', () => {
        (0, vitest_1.it)('should create timeline with phases', () => {
            const phases = [
                {
                    name: 'Development',
                    tasks: [
                        {
                            id: 'task-1',
                            name: 'Dev Task',
                            description: 'Development task',
                            type: 'development',
                            priority: 'high',
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
                            type: 'testing',
                            priority: 'medium',
                            estimatedHours: 20,
                            dependencies: ['task-1'],
                            skills: ['Testing'],
                            phase: 'Testing',
                        },
                    ],
                },
            ];
            const result = technicalPlanner.createTimeline(phases);
            (0, vitest_1.expect)(result.phases.length).toBe(2);
            (0, vitest_1.expect)(result.totalDuration).toBeGreaterThan(0);
            (0, vitest_1.expect)(result.bufferTime).toBeGreaterThan(0);
            (0, vitest_1.expect)(Array.isArray(result.criticalPath)).toBe(true);
        });
        (0, vitest_1.it)('should calculate buffer time as 15% of total duration', () => {
            const phases = [
                {
                    name: 'Test Phase',
                    tasks: [
                        {
                            id: 'task-1',
                            name: 'Task',
                            description: 'Test task',
                            type: 'development',
                            priority: 'medium',
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
            (0, vitest_1.expect)(result.bufferTime).toBe(expectedBuffer);
        });
    });
    (0, vitest_1.describe)('optimizePlan', () => {
        (0, vitest_1.it)('should optimize plan and identify savings', () => {
            const plan = {
                id: 'test-plan',
                name: 'Test Plan',
                description: 'Test plan for optimization',
                architecture: {
                    components: [
                        {
                            name: 'Common Service',
                            type: 'service',
                            description: 'Reusable service',
                            dependencies: [],
                            complexity: 'medium',
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
                        type: 'development',
                        priority: 'medium',
                        estimatedHours: 20,
                        dependencies: [],
                        skills: ['Development'],
                        phase: 'Development',
                    },
                    {
                        id: 'task-2',
                        name: 'Testing Task',
                        description: 'Can be automated',
                        type: 'testing',
                        priority: 'medium',
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
                    confidence: 'medium',
                    assumptions: [],
                },
                dependencies: [],
            };
            const result = technicalPlanner.optimizePlan(plan);
            (0, vitest_1.expect)(result.originalEffort).toBe(100);
            (0, vitest_1.expect)(result.optimizedEffort).toBeLessThan(100);
            (0, vitest_1.expect)(result.savingsHours).toBeGreaterThan(0);
            (0, vitest_1.expect)(Array.isArray(result.optimizations)).toBe(true);
            (0, vitest_1.expect)(result.optimizations.length).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should identify parallelization opportunities', () => {
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
                        type: 'development',
                        priority: 'medium',
                        estimatedHours: 20,
                        dependencies: [], // No dependencies - can be parallelized
                        skills: ['Development'],
                        phase: 'Development',
                    },
                    {
                        id: 'task-2',
                        name: 'Independent Task 2',
                        description: 'No dependencies',
                        type: 'development',
                        priority: 'medium',
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
                    confidence: 'medium',
                    assumptions: [],
                },
                dependencies: [],
            };
            const result = technicalPlanner.optimizePlan(plan);
            const parallelOptimization = result.optimizations.find((opt) => opt.type === 'parallel');
            (0, vitest_1.expect)(parallelOptimization).toBeDefined();
        });
    });
    (0, vitest_1.describe)('performance', () => {
        (0, vitest_1.it)('should maintain performance targets', () => {
            const requirements = {
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
                    type: 'development',
                    priority: 'high',
                    estimatedHours: 40,
                    dependencies: [],
                    skills: ['Development'],
                    phase: 'Development',
                },
            ];
            technicalPlanner.estimateEffort(tasks);
            technicalPlanner.identifyDependencies(tasks);
            const totalTime = Date.now() - startTime;
            (0, vitest_1.expect)(totalTime).toBeLessThan(200); // All operations under 200ms
        });
    });
});
//# sourceMappingURL=technical-planner.test.js.map