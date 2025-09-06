#!/usr/bin/env node
/**
 * Role Orchestrator for Smart Orchestrate Tool
 *
 * Manages automatic role switching and role-based workflow orchestration.
 * Ensures specialized expertise is applied at the right workflow phases.
 */
/**
 * Role Orchestrator for managing AI role switching and workflow orchestration
 */
export class RoleOrchestrator {
    roleCapabilities = new Map();
    transitionRules = [];
    activeRole = 'developer';
    transitionHistory = [];
    constructor() {
        this.initializeRoles();
        this.initializeTransitionRules();
    }
    /**
     * Initialize role capabilities and definitions
     */
    initializeRoles() {
        const roles = [
            {
                name: 'product-strategist',
                description: 'Strategic planning and business analysis expert',
                expertise: [
                    'business analysis',
                    'strategic planning',
                    'market research',
                    'requirements gathering',
                ],
                tools: ['smart_plan', 'smart_begin'],
                phases: ['planning', 'analysis', 'strategy'],
                responsibilities: [
                    'Define business requirements',
                    'Conduct market analysis',
                    'Create strategic roadmaps',
                    'Validate business value',
                ],
                qualityGates: ['business-alignment', 'market-validation', 'strategic-consistency'],
            },
            {
                name: 'developer',
                description: 'Technical development and implementation expert',
                expertise: ['software development', 'architecture', 'coding', 'technical design'],
                tools: ['smart_write', 'smart_begin', 'smart_finish'],
                phases: ['development', 'implementation', 'technical-design'],
                responsibilities: [
                    'Implement technical solutions',
                    'Write production-ready code',
                    'Design system architecture',
                    'Ensure code quality',
                ],
                qualityGates: ['code-quality', 'test-coverage', 'performance', 'maintainability'],
            },
            {
                name: 'qa-engineer',
                description: 'Quality assurance and testing expert',
                expertise: ['testing', 'quality assurance', 'validation', 'defect prevention'],
                tools: ['smart_finish', 'smart_write'],
                phases: ['testing', 'validation', 'quality-assurance'],
                responsibilities: [
                    'Design comprehensive test strategies',
                    'Execute quality validation',
                    'Ensure production readiness',
                    'Validate requirements compliance',
                ],
                qualityGates: ['test-coverage', 'defect-density', 'test-execution', 'quality-metrics'],
            },
            {
                name: 'ux-designer',
                description: 'User experience and design expert',
                expertise: ['user experience', 'interface design', 'usability', 'design systems'],
                tools: ['smart_plan', 'smart_write'],
                phases: ['design', 'user-experience', 'prototyping'],
                responsibilities: [
                    'Design user interfaces',
                    'Ensure usability standards',
                    'Create design systems',
                    'Validate user experience',
                ],
                qualityGates: ['usability', 'accessibility', 'design-consistency', 'user-satisfaction'],
            },
            {
                name: 'operations-engineer',
                description: 'Operations, deployment, and security expert',
                expertise: ['deployment', 'security', 'infrastructure', 'monitoring'],
                tools: ['smart_finish', 'smart_orchestrate'],
                phases: ['deployment', 'security', 'monitoring', 'operations'],
                responsibilities: [
                    'Ensure security compliance',
                    'Design deployment strategies',
                    'Set up monitoring systems',
                    'Manage infrastructure',
                ],
                qualityGates: [
                    'security-compliance',
                    'deployment-readiness',
                    'monitoring-coverage',
                    'scalability',
                ],
            },
        ];
        roles.forEach(role => {
            this.roleCapabilities.set(role.name, role);
        });
    }
    /**
     * Initialize role transition rules
     */
    initializeTransitionRules() {
        this.transitionRules.push(
        // Strategic planning to development
        {
            fromRole: 'product-strategist',
            toRole: 'developer',
            trigger: 'requirements-complete',
            condition: 'business-requirements-validated',
            priority: 1,
        }, {
            fromRole: 'product-strategist',
            toRole: 'ux-designer',
            trigger: 'user-experience-needed',
            condition: 'user-interface-required',
            priority: 2,
        }, 
        // Development transitions
        {
            fromRole: 'developer',
            toRole: 'qa-engineer',
            trigger: 'code-complete',
            condition: 'development-phase-complete',
            priority: 1,
        }, {
            fromRole: 'developer',
            toRole: 'ux-designer',
            trigger: 'ui-development',
            condition: 'frontend-development-needed',
            priority: 2,
        }, {
            fromRole: 'developer',
            toRole: 'operations-engineer',
            trigger: 'deployment-prep',
            condition: 'deployment-ready',
            priority: 3,
        }, 
        // QA transitions
        {
            fromRole: 'qa-engineer',
            toRole: 'operations-engineer',
            trigger: 'tests-passed',
            condition: 'quality-gates-passed',
            priority: 1,
        }, {
            fromRole: 'qa-engineer',
            toRole: 'developer',
            trigger: 'defects-found',
            condition: 'quality-issues-detected',
            priority: 2,
        }, {
            fromRole: 'qa-engineer',
            toRole: 'product-strategist',
            trigger: 'requirements-issues',
            condition: 'business-requirements-unclear',
            priority: 3,
        }, 
        // UX Designer transitions
        {
            fromRole: 'ux-designer',
            toRole: 'developer',
            trigger: 'design-complete',
            condition: 'ui-designs-approved',
            priority: 1,
        }, {
            fromRole: 'ux-designer',
            toRole: 'qa-engineer',
            trigger: 'design-validation',
            condition: 'usability-testing-needed',
            priority: 2,
        }, 
        // Operations transitions
        {
            fromRole: 'operations-engineer',
            toRole: 'qa-engineer',
            trigger: 'deployment-issues',
            condition: 'production-issues-detected',
            priority: 1,
        }, {
            fromRole: 'operations-engineer',
            toRole: 'product-strategist',
            trigger: 'monitoring-insights',
            condition: 'business-optimization-opportunities',
            priority: 2,
        });
    }
    /**
     * Determine the next role based on context and current task
     */
    determineNextRole(_context, task) {
        const currentPhase = this.inferPhaseFromTask(task);
        const taskRequirements = this.analyzeTaskRequirements(task);
        // Find roles that match the current phase and requirements
        const candidateRoles = [];
        this.roleCapabilities.forEach((capabilities, roleName) => {
            let score = 0;
            // Phase matching
            if (capabilities.phases.includes(currentPhase)) {
                score += 30;
            }
            // Expertise matching
            taskRequirements.forEach(requirement => {
                if (capabilities.expertise.some(expertise => expertise.toLowerCase().includes(requirement.toLowerCase()) ||
                    requirement.toLowerCase().includes(expertise.toLowerCase()))) {
                    score += 20;
                }
            });
            // Transition rule matching
            const validTransition = this.transitionRules.find(rule => rule.fromRole === this.activeRole && rule.toRole === roleName);
            if (validTransition) {
                score += validTransition.priority * 10;
            }
            candidateRoles.push({ role: roleName, score });
        });
        // Sort by score and return the best match
        candidateRoles.sort((a, b) => b.score - a.score);
        return candidateRoles.length > 0 && candidateRoles[0].score > 20
            ? candidateRoles[0].role
            : this.activeRole; // Keep current role if no good match
    }
    /**
     * Switch to a new role with context preservation
     */
    async switchRole(fromRole, toRole, context) {
        const startTime = Date.now();
        // Validate role transition
        const validationResult = this.validateRoleTransition({ fromRole, toRole });
        if (!validationResult.isValid) {
            throw new Error(`Invalid role transition: ${validationResult.issues.join(', ')}`);
        }
        // Create transition record
        const transition = {
            fromRole,
            toRole,
            timestamp: new Date().toISOString(),
            context,
            preservedData: {
                previousRole: fromRole,
                transitionReason: this.findTransitionRule(fromRole, toRole)?.trigger ?? 'manual',
                contextVersion: context.version,
                transitionTime: Date.now() - startTime,
            },
            transitionId: `transition_${Date.now()}_${fromRole}_${toRole}`,
        };
        // Update active role
        this.activeRole = toRole;
        this.transitionHistory.push(transition);
        // Simulate role switching time (should be <100ms per Phase 2B requirements)
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50)); // 0-50ms
        return transition;
    }
    /**
     * Preserve context during role transitions
     */
    preserveContext(transition) {
        // Context preservation is handled by BusinessContextBroker
        // This method ensures transition data is properly structured
        transition.preservedData = {
            ...transition.preservedData,
            contextPreserved: true,
            preservationTime: new Date().toISOString(),
        };
    }
    /**
     * Get capabilities for a specific role
     */
    getRoleCapabilities(role) {
        return this.roleCapabilities.get(role) ?? null;
    }
    /**
     * Validate a role transition
     */
    validateRoleTransition(transition) {
        const issues = [];
        const recommendations = [];
        // Check if roles exist
        if (!this.roleCapabilities.has(transition.fromRole)) {
            issues.push(`Unknown source role: ${transition.fromRole}`);
        }
        if (!this.roleCapabilities.has(transition.toRole)) {
            issues.push(`Unknown target role: ${transition.toRole}`);
        }
        // Check if transition rule exists
        const rule = this.findTransitionRule(transition.fromRole, transition.toRole);
        if (!rule) {
            issues.push(`No transition rule defined from ${transition.fromRole} to ${transition.toRole}`);
            recommendations.push('Define explicit transition rules or use manual override');
        }
        // Check for rapid role switching (might indicate confusion)
        const recentTransitions = this.transitionHistory.filter(t => Date.now() - new Date(t.timestamp).getTime() < 60000).length; // Last minute
        if (recentTransitions > 3) {
            issues.push('Rapid role switching detected (>3 transitions in 1 minute)');
            recommendations.push('Review workflow logic to reduce unnecessary role changes');
        }
        return {
            isValid: issues.length === 0,
            issues,
            recommendations,
        };
    }
    /**
     * Generate an orchestration plan for a workflow
     */
    generateOrchestrationPlan(workflowType, businessContext, requirements) {
        const phases = this.determinePhases(workflowType, requirements);
        const roleSequence = this.planRoleSequence(phases, requirements);
        const tasks = this.generateTasks(phases, roleSequence, businessContext);
        const transitions = this.planTransitions(roleSequence);
        return {
            id: `plan_${Date.now()}_${businessContext.projectId}`,
            phases,
            roleSequence,
            tasks,
            transitions,
            estimatedDuration: this.calculateEstimatedDuration(tasks),
        };
    }
    /**
     * Get current active role
     */
    getCurrentRole() {
        return this.activeRole;
    }
    /**
     * Get role transition history
     */
    getTransitionHistory() {
        return [...this.transitionHistory];
    }
    /**
     * Helper methods
     */
    inferPhaseFromTask(task) {
        const taskLower = task.toLowerCase();
        if (taskLower.includes('plan') ||
            taskLower.includes('strategy') ||
            taskLower.includes('requirement')) {
            return 'planning';
        }
        if (taskLower.includes('design') || taskLower.includes('ui') || taskLower.includes('ux')) {
            return 'design';
        }
        if (taskLower.includes('develop') ||
            taskLower.includes('code') ||
            taskLower.includes('implement')) {
            return 'development';
        }
        if (taskLower.includes('test') ||
            taskLower.includes('quality') ||
            taskLower.includes('validate')) {
            return 'testing';
        }
        if (taskLower.includes('deploy') ||
            taskLower.includes('security') ||
            taskLower.includes('monitor')) {
            return 'operations';
        }
        return 'development'; // Default phase
    }
    analyzeTaskRequirements(task) {
        const requirements = [];
        const taskLower = task.toLowerCase();
        // Extract requirements from task description
        if (taskLower.includes('business'))
            requirements.push('business analysis');
        if (taskLower.includes('security'))
            requirements.push('security');
        if (taskLower.includes('performance'))
            requirements.push('performance');
        if (taskLower.includes('test'))
            requirements.push('testing');
        if (taskLower.includes('design'))
            requirements.push('design');
        if (taskLower.includes('code') || taskLower.includes('develop'))
            requirements.push('development');
        if (taskLower.includes('deploy'))
            requirements.push('deployment');
        if (taskLower.includes('quality'))
            requirements.push('quality assurance');
        return requirements.length > 0 ? requirements : ['development'];
    }
    findTransitionRule(fromRole, toRole) {
        return (this.transitionRules.find(rule => rule.fromRole === fromRole && rule.toRole === toRole) ??
            null);
    }
    determinePhases(_workflowType, requirements) {
        const basePhases = ['planning', 'development', 'testing', 'deployment'];
        // Add specialized phases based on requirements
        if (requirements.some(req => req.includes('design') || req.includes('ui'))) {
            basePhases.splice(1, 0, 'design');
        }
        if (requirements.some(req => req.includes('security'))) {
            basePhases.splice(-1, 0, 'security');
        }
        return basePhases;
    }
    planRoleSequence(phases, _requirements) {
        const sequence = [];
        phases.forEach(phase => {
            switch (phase) {
                case 'planning':
                    sequence.push('product-strategist');
                    break;
                case 'design':
                    sequence.push('ux-designer');
                    break;
                case 'development':
                    sequence.push('developer');
                    break;
                case 'testing':
                    sequence.push('qa-engineer');
                    break;
                case 'security':
                case 'deployment':
                    sequence.push('operations-engineer');
                    break;
                default:
                    sequence.push('developer');
            }
        });
        return sequence;
    }
    generateTasks(phases, roleSequence, _context) {
        const tasks = [];
        let taskId = 1;
        phases.forEach((phase, index) => {
            const role = roleSequence[index] ?? 'developer';
            const roleCapabilities = this.getRoleCapabilities(role);
            if (roleCapabilities) {
                roleCapabilities.responsibilities.forEach(responsibility => {
                    tasks.push({
                        id: `task_${taskId++}`,
                        name: `${phase}: ${responsibility}`,
                        description: `Execute ${responsibility} in ${phase} phase`,
                        role,
                        phase,
                        dependencies: index > 0 ? [`task_${taskId - roleCapabilities.responsibilities.length - 1}`] : [],
                        deliverables: [`${responsibility.toLowerCase().replace(/\s+/g, '-')}-deliverable`],
                        estimatedTime: 30 + Math.random() * 60, // 30-90 minutes
                    });
                });
            }
        });
        return tasks;
    }
    planTransitions(roleSequence) {
        const transitions = [];
        for (let i = 0; i < roleSequence.length - 1; i++) {
            const fromRole = roleSequence[i];
            const toRole = roleSequence[i + 1];
            transitions.push({
                fromRole,
                toRole,
                trigger: `${fromRole}-phase-complete`,
                condition: `${fromRole}-deliverables-ready`,
                priority: 1,
            });
        }
        return transitions;
    }
    calculateEstimatedDuration(tasks) {
        return tasks.reduce((total, task) => total + task.estimatedTime, 0);
    }
}
//# sourceMappingURL=role-orchestrator.js.map