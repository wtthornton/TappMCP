#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanGenerator = exports.ComprehensivePlanSchema = exports.PlanPhaseSchema = void 0;
const zod_1 = require("zod");
const business_analyzer_js_1 = require("./business-analyzer.js");
const technical_planner_js_1 = require("./technical-planner.js");
// Plan generation schemas
exports.PlanPhaseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    duration: zod_1.z.number().positive(),
    startDate: zod_1.z.string(),
    endDate: zod_1.z.string(),
    tasks: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string(),
        description: zod_1.z.string(),
        type: zod_1.z.enum(['development', 'testing', 'deployment', 'documentation', 'research']),
        priority: zod_1.z.enum(['low', 'medium', 'high', 'critical']),
        estimatedHours: zod_1.z.number().positive(),
        assignedTo: zod_1.z.string().optional(),
        status: zod_1.z.enum(['pending', 'in_progress', 'completed']).default('pending'),
    })),
    deliverables: zod_1.z.array(zod_1.z.string()),
    risks: zod_1.z.array(zod_1.z.string()),
    milestones: zod_1.z.array(zod_1.z.string()),
});
exports.ComprehensivePlanSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    businessRequirements: business_analyzer_js_1.BusinessRequirementsSchema,
    complexity: business_analyzer_js_1.ComplexityAssessmentSchema,
    architecture: technical_planner_js_1.ArchitectureSchema,
    phases: zod_1.z.array(exports.PlanPhaseSchema),
    userStories: zod_1.z.array(business_analyzer_js_1.UserStorySchema),
    risks: zod_1.z.array(business_analyzer_js_1.RiskSchema),
    timeline: technical_planner_js_1.TimelineSchema,
    effort: technical_planner_js_1.EffortEstimateSchema,
    optimization: technical_planner_js_1.OptimizedPlanSchema,
    businessValue: zod_1.z.object({
        estimatedROI: zod_1.z.number(),
        timeToMarket: zod_1.z.number(),
        riskMitigation: zod_1.z.number(),
        qualityImprovement: zod_1.z.number(),
        costSavings: zod_1.z.number(),
    }),
    qualityGates: zod_1.z.array(zod_1.z.object({
        phase: zod_1.z.string(),
        criteria: zod_1.z.array(zod_1.z.string()),
        threshold: zod_1.z.string(),
    })),
    successMetrics: zod_1.z.array(zod_1.z.string()),
    nextSteps: zod_1.z.array(zod_1.z.string()),
});
class PlanGenerator {
    businessAnalyzer;
    technicalPlanner;
    constructor() {
        this.businessAnalyzer = new business_analyzer_js_1.BusinessAnalyzer();
        this.technicalPlanner = new technical_planner_js_1.TechnicalPlanner();
    }
    /**
     * Generate comprehensive project plan from business request
     */
    async generatePlan(input) {
        const startTime = Date.now();
        try {
            // Step 1: Enhanced Business Analysis with External Knowledge
            const businessRequirements = this.businessAnalyzer.analyzeRequirements(input.businessRequest, input.externalKnowledge?.filter(k => k.type === 'search' || k.type === 'trend'));
            const complexity = this.businessAnalyzer.assessComplexity(input.businessRequest, input.externalKnowledge?.filter(k => k.type === 'lesson' || k.type === 'pattern'));
            const risks = this.businessAnalyzer.identifyRisks(input.businessRequest, input.externalKnowledge?.filter(k => k.type === 'lesson' && k.content.includes('failure')));
            const userStories = this.businessAnalyzer.generateUserStories(businessRequirements, input.externalKnowledge?.filter(k => k.type === 'example' || k.type === 'best-practice'));
            // Step 2: Technical Planning
            const architecture = this.technicalPlanner.createArchitecture(businessRequirements);
            // Generate tasks from user stories and architecture
            const tasks = this.generateTasks(userStories, architecture, complexity);
            const effort = this.technicalPlanner.estimateEffort(tasks);
            const dependencies = this.technicalPlanner.identifyDependencies(tasks);
            // Step 3: Create Plan Structure
            const phases = this.createPhases(tasks, complexity, input.timeConstraint);
            const timeline = this.technicalPlanner.createTimeline(phases.map(phase => ({
                name: phase.name,
                tasks: tasks.filter(t => phase.tasks.some(pt => pt.id === t.id)),
                duration: phase.duration,
            })));
            // Step 4: Optimization
            const basePlan = {
                id: input.projectId,
                name: `Plan for ${input.projectId}`,
                description: input.businessRequest,
                architecture,
                tasks,
                timeline,
                effort,
                dependencies,
            };
            const optimization = this.technicalPlanner.optimizePlan(basePlan);
            // Step 5: Business Value Calculation
            const businessValue = this.calculateBusinessValue(effort, complexity, input.priority, input.qualityRequirements);
            // Step 6: Quality Gates
            const qualityGates = this.defineQualityGates(phases, input.qualityRequirements);
            // Step 7: Success Metrics and Next Steps
            const successMetrics = this.generateSuccessMetrics(businessRequirements, effort);
            const nextSteps = this.generateNextSteps(phases);
            const processingTime = Date.now() - startTime;
            // Ensure performance target is met
            if (processingTime > 300) {
                // eslint-disable-next-line no-console
                console.warn(`Plan generation took ${processingTime}ms - target is <300ms`);
            }
            const plan = {
                id: input.projectId,
                name: `Comprehensive Plan: ${input.projectId}`,
                description: input.businessRequest,
                businessRequirements,
                complexity,
                architecture,
                phases,
                userStories,
                risks,
                timeline,
                effort,
                optimization,
                businessValue,
                qualityGates,
                successMetrics,
                nextSteps,
            };
            return exports.ComprehensivePlanSchema.parse(plan);
        }
        catch (error) {
            const processingTime = Date.now() - startTime;
            // eslint-disable-next-line no-console
            console.error(`Plan generation failed after ${processingTime}ms:`, error);
            // Return minimal fallback plan
            return this.generateFallbackPlan(input);
        }
    }
    /**
     * Validate plan against business requirements
     */
    validatePlan(plan) {
        const issues = [];
        const recommendations = [];
        // Validate timeline feasibility
        if (plan.timeline.totalDuration < 1) {
            issues.push('Timeline too short for realistic completion');
        }
        if (plan.timeline.totalDuration > 52) {
            recommendations.push('Consider breaking project into smaller phases');
        }
        // Validate effort estimates
        if (plan.effort.confidence === 'low') {
            recommendations.push('Consider adding research phase to improve estimate confidence');
        }
        // Validate business value
        if (plan.businessValue.estimatedROI < 1.2) {
            issues.push('Low estimated ROI - consider project scope adjustment');
        }
        // Validate risks
        const criticalRisks = plan.risks.filter(r => r.severity === 'critical');
        if (criticalRisks.length > 0) {
            issues.push(`${criticalRisks.length} critical risks identified - mitigation required`);
        }
        // Validate quality gates
        if (plan.qualityGates.length === 0) {
            issues.push('No quality gates defined - quality assurance may be inadequate');
        }
        return {
            isValid: issues.length === 0,
            issues,
            recommendations,
        };
    }
    // Private helper methods
    generateTasks(userStories, architecture, complexity) {
        const tasks = [];
        let taskCounter = 1;
        // Generate tasks from user stories
        userStories.forEach(story => {
            // Development task
            tasks.push({
                id: `task-dev-${taskCounter}`,
                name: `Develop: ${story.title}`,
                description: `Implement development work for: ${story.description}`,
                type: 'development',
                priority: story.priority,
                estimatedHours: story.estimatedEffort * 8 * this.getComplexityMultiplier(complexity), // Adjust for complexity
                dependencies: [],
                skills: ['Development', 'Architecture'],
                phase: this.getPhaseForStory(story),
            });
            // Testing task
            tasks.push({
                id: `task-test-${taskCounter}`,
                name: `Test: ${story.title}`,
                description: `Test implementation of: ${story.description}`,
                type: 'testing',
                priority: story.priority,
                estimatedHours: story.estimatedEffort * 4, // 50% of dev time for testing
                dependencies: [`task-dev-${taskCounter}`],
                skills: ['Testing', 'Quality Assurance'],
                phase: this.getPhaseForStory(story),
            });
            taskCounter++;
        });
        // Generate architecture tasks
        architecture.components.forEach((component, index) => {
            if (component.complexity === 'high') {
                // Calculate effort based on component complexity and type
                let baseHours = 32;
                if (component.name.includes('ERP') || component.name.includes('CRM')) {
                    baseHours = 80; // Enterprise modules require more effort
                }
                else if (component.name.includes('Analytics') || component.name.includes('Integration')) {
                    baseHours = 60; // Complex integrations and analytics
                }
                else if (component.name.includes('Multi-tenant') || component.name.includes('Tenant')) {
                    baseHours = 50; // Multi-tenancy adds complexity
                }
                tasks.push({
                    id: `task-arch-${index + 1}`,
                    name: `Architecture: ${component.name}`,
                    description: `Design and implement ${component.name}`,
                    type: 'development',
                    priority: 'high',
                    estimatedHours: baseHours,
                    dependencies: component.dependencies
                        .map(dep => tasks.find(t => t.name.includes(dep))?.id)
                        .filter(Boolean),
                    skills: ['Architecture', 'System Design'],
                    phase: 'Architecture',
                });
            }
        });
        // Add documentation tasks
        tasks.push({
            id: 'task-doc-1',
            name: 'Project Documentation',
            description: 'Create comprehensive project documentation',
            type: 'documentation',
            priority: 'medium',
            estimatedHours: 16,
            dependencies: tasks.filter(t => t.type === 'development').map(t => t.id),
            skills: ['Documentation', 'Technical Writing'],
            phase: 'Documentation',
        });
        // Add deployment tasks
        tasks.push({
            id: 'task-deploy-1',
            name: 'Production Deployment',
            description: 'Deploy system to production environment',
            type: 'deployment',
            priority: 'high',
            estimatedHours: 24,
            dependencies: tasks.filter(t => t.type === 'testing').map(t => t.id),
            skills: ['DevOps', 'Deployment'],
            phase: 'Deployment',
        });
        return tasks;
    }
    createPhases(tasks, complexity, timeConstraint) {
        const phases = [];
        const now = new Date();
        // Phase 1: Planning and Research
        const planningTasks = tasks.filter(t => t.type === 'research');
        phases.push({
            id: 'phase-1',
            name: 'Planning and Research',
            description: 'Project initialization, research, and detailed planning',
            duration: complexity.overall === 'high' ? 2 : 1,
            startDate: now.toISOString().split('T')[0],
            endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            tasks: planningTasks.map(t => ({
                id: t.id,
                name: t.name,
                description: t.description,
                type: t.type,
                priority: t.priority,
                estimatedHours: t.estimatedHours,
                status: 'pending',
            })),
            deliverables: ['Project Plan', 'Technical Specifications', 'Risk Assessment'],
            risks: ['Requirements changes', 'Technical unknowns'],
            milestones: ['Plan Approval', 'Team Assembly'],
        });
        // Phase 2: Development
        const devTasks = tasks.filter(t => t.type === 'development');
        const devStartDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        let devDuration = Math.ceil(devTasks.reduce((sum, t) => sum + t.estimatedHours, 0) / 160); // 160 hours per month
        // Apply time constraint adjustments
        if (timeConstraint) {
            const constraintWeeks = this.extractTimeConstraintWeeks(timeConstraint);
            if (constraintWeeks && constraintWeeks < devDuration + 3) {
                // +3 for planning & testing
                devDuration = Math.max(constraintWeeks - 3, 2); // Adjust but keep minimum 2 weeks
            }
        }
        phases.push({
            id: 'phase-2',
            name: 'Development',
            description: 'Core development and implementation',
            duration: devDuration, // Use calculated duration (may be constrained)
            startDate: devStartDate.toISOString().split('T')[0],
            endDate: new Date(devStartDate.getTime() + devDuration * 7 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0],
            tasks: devTasks.map(t => ({
                id: t.id,
                name: t.name,
                description: t.description,
                type: t.type,
                priority: t.priority,
                estimatedHours: t.estimatedHours,
                status: 'pending',
            })),
            deliverables: ['Working Software', 'Unit Tests', 'Code Documentation'],
            risks: ['Technical complexity', 'Integration issues'],
            milestones: ['MVP Complete', 'Alpha Release'],
        });
        // Phase 3: Testing and Quality Assurance
        const testTasks = tasks.filter(t => t.type === 'testing');
        const testStartDate = new Date(devStartDate.getTime() + devDuration * 7 * 24 * 60 * 60 * 1000);
        phases.push({
            id: 'phase-3',
            name: 'Testing and QA',
            description: 'Comprehensive testing and quality assurance',
            duration: 2,
            startDate: testStartDate.toISOString().split('T')[0],
            endDate: new Date(testStartDate.getTime() + 14 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0],
            tasks: testTasks.map(t => ({
                id: t.id,
                name: t.name,
                description: t.description,
                type: t.type,
                priority: t.priority,
                estimatedHours: t.estimatedHours,
                status: 'pending',
            })),
            deliverables: ['Test Results', 'Bug Reports', 'Quality Scorecard'],
            risks: ['Quality issues', 'Performance problems'],
            milestones: ['QA Approval', 'Beta Release'],
        });
        // Phase 4: Deployment
        const deployTasks = tasks.filter(t => t.type === 'deployment');
        const deployStartDate = new Date(testStartDate.getTime() + 14 * 24 * 60 * 60 * 1000);
        phases.push({
            id: 'phase-4',
            name: 'Deployment',
            description: 'Production deployment and go-live',
            duration: 1,
            startDate: deployStartDate.toISOString().split('T')[0],
            endDate: new Date(deployStartDate.getTime() + 7 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0],
            tasks: deployTasks.map(t => ({
                id: t.id,
                name: t.name,
                description: t.description,
                type: t.type,
                priority: t.priority,
                estimatedHours: t.estimatedHours,
                status: 'pending',
            })),
            deliverables: ['Production System', 'Deployment Documentation', 'Monitoring Setup'],
            risks: ['Deployment issues', 'Production problems'],
            milestones: ['Go-Live', 'Project Completion'],
        });
        return phases;
    }
    extractTimeConstraintWeeks(timeConstraint) {
        const weekPatterns = [/(\d+)\s*weeks?/i, /(\d+)\s*w/i, /in\s*(\d+)\s*weeks?/i];
        for (const pattern of weekPatterns) {
            const match = timeConstraint.match(pattern);
            if (match) {
                return parseInt(match[1], 10);
            }
        }
        // Check for month patterns and convert
        const monthPattern = /(\d+)\s*months?/i;
        const monthMatch = timeConstraint.match(monthPattern);
        if (monthMatch) {
            return parseInt(monthMatch[1], 10) * 4; // Convert months to weeks
        }
        return null;
    }
    calculateBusinessValue(effort, complexity, priority, qualityRequirements = {
        security: 'standard',
        performance: 'standard',
        accessibility: false,
    }) {
        const baseROI = priority === 'critical' ? 3.5 : priority === 'high' ? 2.5 : 2.0;
        const complexityMultiplier = complexity.overall === 'low' ? 1.2 : complexity.overall === 'medium' ? 1.0 : 0.8;
        const estimatedROI = baseROI * complexityMultiplier;
        const timeToMarket = effort.totalHours / 160; // Convert hours to months
        const riskMitigation = effort.totalHours * 10; // $10 per hour risk reduction
        const qualityMultiplier = qualityRequirements?.security === 'high' ? 1.3 : 1.0;
        const qualityImprovement = 75 * qualityMultiplier;
        const costSavings = effort.totalHours * 50; // $50 per hour saved through automation
        return {
            estimatedROI: Math.round(estimatedROI * 100) / 100,
            timeToMarket: Math.round(timeToMarket * 100) / 100,
            riskMitigation,
            qualityImprovement,
            costSavings,
        };
    }
    defineQualityGates(phases, qualityRequirements = {
        security: 'standard',
        performance: 'standard',
        accessibility: false,
    }) {
        return phases.map(phase => ({
            phase: phase.name,
            criteria: [
                'All tasks completed successfully',
                'Code review passed',
                'Tests passing with ≥85% coverage',
                qualityRequirements?.security === 'high'
                    ? 'Security audit completed'
                    : 'Basic security checks passed',
                qualityRequirements?.performance === 'high'
                    ? 'Performance targets met'
                    : 'Basic performance validated',
            ],
            threshold: '100% criteria met',
        }));
    }
    generateSuccessMetrics(requirements, effort) {
        return [
            'Project delivered on time and within budget',
            'All primary goals achieved',
            `Development completed in ${Math.ceil(effort.totalHours / 40)} weeks`,
            'Quality gates passed with ≥85% success rate',
            'Stakeholder satisfaction ≥90%',
            ...requirements.successCriteria,
        ];
    }
    generateNextSteps(phases) {
        return [
            'Review and approve comprehensive plan',
            'Assemble project team and assign roles',
            `Begin ${phases[0]?.name || 'first phase'}`,
            'Set up project management and tracking tools',
            'Establish communication channels and meeting schedule',
        ];
    }
    getPhaseForStory(story) {
        if (story.priority === 'critical' || story.priority === 'high') {
            return 'Development';
        }
        return 'Development';
    }
    generateFallbackPlan(input) {
        // Return minimal but valid plan in case of errors
        return {
            id: input.projectId,
            name: `Fallback Plan: ${input.projectId}`,
            description: 'Minimal fallback plan due to generation error',
            businessRequirements: {
                primaryGoals: ['Deliver basic functionality'],
                targetUsers: ['Users'],
                successCriteria: ['Working system delivered'],
                constraints: ['Standard quality requirements'],
                riskFactors: ['Standard project risks'],
            },
            complexity: {
                technical: 'medium',
                business: 'medium',
                integration: 'medium',
                overall: 'medium',
                factors: ['Standard complexity'],
            },
            architecture: {
                components: [
                    {
                        name: 'Basic System',
                        type: 'backend',
                        description: 'Core system functionality',
                        dependencies: [],
                        complexity: 'medium',
                    },
                ],
                patterns: ['MVC'],
                technologies: [
                    {
                        name: 'TypeScript',
                        category: 'language',
                        justification: 'Type safety',
                    },
                ],
                constraints: ['Standard constraints'],
            },
            phases: [],
            userStories: [],
            risks: [],
            timeline: {
                phases: [],
                criticalPath: [],
                totalDuration: 8,
                bufferTime: 2,
            },
            effort: {
                totalHours: 320,
                breakdown: {
                    development: 200,
                    testing: 80,
                    deployment: 20,
                    documentation: 20,
                    research: 0,
                },
                confidence: 'low',
                assumptions: ['Fallback plan - requires refinement'],
            },
            optimization: {
                originalEffort: 320,
                optimizedEffort: 280,
                savingsHours: 40,
                optimizations: [],
                riskAdjustments: [],
            },
            businessValue: {
                estimatedROI: 2.0,
                timeToMarket: 2,
                riskMitigation: 3200,
                qualityImprovement: 75,
                costSavings: 16000,
            },
            qualityGates: [],
            successMetrics: ['Project completion'],
            nextSteps: ['Review and refine plan'],
        };
    }
    getComplexityMultiplier(complexity) {
        switch (complexity.overall) {
            case 'low':
                return 0.8;
            case 'medium':
                return 1.0;
            case 'high':
                return 1.3;
            case 'very-high':
                return 1.6;
            default:
                return 1.0;
        }
    }
}
exports.PlanGenerator = PlanGenerator;
//# sourceMappingURL=plan-generator.js.map