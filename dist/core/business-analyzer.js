#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessAnalyzer = exports.UserStorySchema = exports.RiskSchema = exports.ComplexityAssessmentSchema = exports.StakeholderSchema = exports.BusinessRequirementsSchema = void 0;
const zod_1 = require("zod");
// Business analysis schemas
exports.BusinessRequirementsSchema = zod_1.z.object({
    primaryGoals: zod_1.z.array(zod_1.z.string()),
    targetUsers: zod_1.z.array(zod_1.z.string()),
    successCriteria: zod_1.z.array(zod_1.z.string()),
    constraints: zod_1.z.array(zod_1.z.string()),
    riskFactors: zod_1.z.array(zod_1.z.string()),
});
exports.StakeholderSchema = zod_1.z.object({
    name: zod_1.z.string(),
    role: zod_1.z.string(),
    influence: zod_1.z.enum(['high', 'medium', 'low']),
    interest: zod_1.z.enum(['high', 'medium', 'low']),
    requirements: zod_1.z.array(zod_1.z.string()),
});
exports.ComplexityAssessmentSchema = zod_1.z.object({
    technical: zod_1.z.enum(['low', 'medium', 'high', 'very-high']),
    business: zod_1.z.enum(['low', 'medium', 'high', 'very-high']),
    integration: zod_1.z.enum(['low', 'medium', 'high', 'very-high']),
    overall: zod_1.z.enum(['low', 'medium', 'high', 'very-high']),
    factors: zod_1.z.array(zod_1.z.string()),
});
exports.RiskSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    category: zod_1.z.enum(['technical', 'business', 'resource', 'timeline', 'quality']),
    probability: zod_1.z.enum(['low', 'medium', 'high']),
    impact: zod_1.z.enum(['low', 'medium', 'high']),
    severity: zod_1.z.enum(['low', 'medium', 'high', 'critical']),
    mitigation: zod_1.z.array(zod_1.z.string()),
});
exports.UserStorySchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    asA: zod_1.z.string(),
    iWant: zod_1.z.string(),
    soThat: zod_1.z.string(),
    acceptanceCriteria: zod_1.z.array(zod_1.z.string()),
    priority: zod_1.z.enum(['low', 'medium', 'high', 'critical']),
    estimatedEffort: zod_1.z.number().min(1).max(20),
});
class BusinessAnalyzer {
    /**
     * Analyze business requirements from a business request with optional external knowledge
     */
    analyzeRequirements(request, externalKnowledge) {
        const startTime = Date.now();
        // Extract primary goals using keyword analysis and external knowledge
        const primaryGoals = this.extractGoals(request, externalKnowledge);
        // Identify target users from the request and external trends
        const targetUsers = this.extractTargetUsers(request, externalKnowledge);
        // Define success criteria based on goals and external best practices
        const successCriteria = this.generateSuccessCriteria(primaryGoals, externalKnowledge);
        // Identify constraints from the request
        const constraints = this.extractConstraints(request);
        // Identify potential risk factors
        const riskFactors = this.identifyRiskFactors(request);
        const processingTime = Date.now() - startTime;
        if (processingTime > 100) {
            // eslint-disable-next-line no-console
            console.warn(`Business analysis took ${processingTime}ms - target is <100ms`);
        }
        return exports.BusinessRequirementsSchema.parse({
            primaryGoals,
            targetUsers,
            successCriteria,
            constraints,
            riskFactors,
        });
    }
    /**
     * Identify stakeholders from business requirements
     */
    identifyStakeholders(request) {
        const stakeholders = [];
        // Analyze request for stakeholder mentions
        const stakeholderPatterns = [
            {
                pattern: /users?|customers?/gi,
                role: 'End User',
                influence: 'high',
                interest: 'high',
            },
            {
                pattern: /managers?|leadership/gi,
                role: 'Manager',
                influence: 'high',
                interest: 'medium',
            },
            {
                pattern: /developers?|engineers?/gi,
                role: 'Developer',
                influence: 'medium',
                interest: 'high',
            },
            {
                pattern: /stakeholders?/gi,
                role: 'Business Stakeholder',
                influence: 'high',
                interest: 'high',
            },
            {
                pattern: /admins?|administrators?/gi,
                role: 'Administrator',
                influence: 'medium',
                interest: 'medium',
            },
        ];
        stakeholderPatterns.forEach(pattern => {
            if (pattern.pattern.test(request)) {
                stakeholders.push({
                    name: `${pattern.role} Group`,
                    role: pattern.role,
                    influence: pattern.influence,
                    interest: pattern.interest,
                    requirements: this.extractStakeholderRequirements(request, pattern.role),
                });
            }
        });
        // Always include default stakeholders if none found
        if (stakeholders.length === 0) {
            stakeholders.push({
                name: 'Primary Users',
                role: 'End User',
                influence: 'high',
                interest: 'high',
                requirements: ['Functional system', 'Good user experience', 'Reliable performance'],
            });
        }
        return stakeholders;
    }
    /**
     * Assess project complexity with optional external knowledge
     */
    assessComplexity(request, externalKnowledge) {
        const factors = [];
        let technicalScore = 0;
        let businessScore = 0;
        let integrationScore = 0;
        // Consider external knowledge for complexity assessment
        if (externalKnowledge && externalKnowledge.length > 0) {
            const hasPatterns = externalKnowledge.some(k => k.type === 'pattern');
            if (hasPatterns) {
                factors.push('External patterns available');
                technicalScore += 1; // Slightly increase complexity when patterns are available
            }
        }
        // Technical complexity indicators
        const technicalPatterns = [
            { pattern: /api|integration|external/gi, score: 2, factor: 'External API integration' },
            { pattern: /real-time|websocket|streaming/gi, score: 3, factor: 'Real-time processing' },
            { pattern: /database|storage|persistence/gi, score: 2, factor: 'Data persistence' },
            {
                pattern: /authentication|security|encryption/gi,
                score: 2,
                factor: 'Security requirements',
            },
            { pattern: /scalability|performance|load/gi, score: 3, factor: 'Performance requirements' },
        ];
        // Business complexity indicators
        const businessPatterns = [
            { pattern: /workflow|process|approval/gi, score: 2, factor: 'Complex business workflow' },
            { pattern: /multiple users|roles|permissions/gi, score: 2, factor: 'Multi-user system' },
            { pattern: /reporting|analytics|dashboard/gi, score: 2, factor: 'Reporting requirements' },
            { pattern: /compliance|regulation|audit/gi, score: 3, factor: 'Compliance requirements' },
        ];
        // Integration complexity indicators
        const integrationPatterns = [
            { pattern: /third.party|external service/gi, score: 2, factor: 'Third-party integration' },
            { pattern: /legacy|existing system/gi, score: 3, factor: 'Legacy system integration' },
            { pattern: /multiple systems|integration/gi, score: 2, factor: 'Multi-system integration' },
        ];
        // Calculate scores
        [technicalPatterns, businessPatterns, integrationPatterns].forEach((patterns, index) => {
            patterns.forEach(({ pattern, score, factor }) => {
                if (pattern.test(request)) {
                    if (index === 0)
                        technicalScore += score;
                    if (index === 1)
                        businessScore += score;
                    if (index === 2)
                        integrationScore += score;
                    factors.push(factor);
                }
            });
        });
        // Convert scores to complexity levels
        const technical = this.scoreToComplexity(technicalScore);
        const business = this.scoreToComplexity(businessScore);
        const integration = this.scoreToComplexity(integrationScore);
        // Calculate overall complexity
        const overallScore = Math.max(technicalScore, businessScore, integrationScore);
        const overall = this.scoreToComplexity(overallScore);
        return exports.ComplexityAssessmentSchema.parse({
            technical,
            business,
            integration,
            overall,
            factors,
        });
    }
    /**
     * Identify risks from business request with optional external knowledge
     */
    identifyRisks(request, externalKnowledge) {
        const risks = [];
        // Add risks from external knowledge (lessons learned from failures)
        if (externalKnowledge && externalKnowledge.length > 0) {
            const failureLessons = externalKnowledge.filter(k => k.type === 'lesson' && k.content.includes('failure'));
            failureLessons.forEach(lesson => {
                risks.push({
                    id: `external-${lesson.id}`,
                    name: 'External Lesson Risk',
                    description: `Risk identified from external knowledge: ${lesson.title}`,
                    category: 'business', // Use valid category
                    probability: 'medium',
                    impact: 'medium',
                    severity: 'medium', // Add required severity field
                    mitigation: ['Apply lessons learned from external knowledge'], // Array format
                });
            });
        }
        // Define risk patterns
        const riskPatterns = [
            {
                keywords: ['tight deadline', 'urgent', 'asap', 'immediately'],
                risk: {
                    id: 'timeline-pressure',
                    name: 'Timeline Pressure',
                    description: 'Tight deadlines may compromise quality',
                    category: 'timeline',
                    probability: 'high',
                    impact: 'medium',
                    severity: 'medium',
                    mitigation: ['Prioritize features', 'Implement MVP approach', 'Regular progress reviews'],
                },
            },
            {
                keywords: ['complex', 'complicated', 'many features', 'extensive'],
                risk: {
                    id: 'scope-creep',
                    name: 'Scope Creep',
                    description: 'Project scope may expand beyond initial requirements',
                    category: 'business',
                    probability: 'medium',
                    impact: 'high',
                    severity: 'high',
                    mitigation: [
                        'Clear requirements documentation',
                        'Regular stakeholder reviews',
                        'Change control process',
                    ],
                },
            },
            {
                keywords: ['new technology', 'unfamiliar', 'cutting edge', 'experimental'],
                risk: {
                    id: 'technical-risk',
                    name: 'Technical Risk',
                    description: 'New or unfamiliar technology may cause delays',
                    category: 'technical',
                    probability: 'medium',
                    impact: 'high',
                    severity: 'high',
                    mitigation: ['Proof of concept', 'Technical spikes', 'Expert consultation'],
                },
            },
            {
                keywords: ['limited budget', 'cost', 'expensive', 'cheap'],
                risk: {
                    id: 'budget-constraint',
                    name: 'Budget Constraints',
                    description: 'Limited budget may restrict project scope or quality',
                    category: 'resource',
                    probability: 'medium',
                    impact: 'medium',
                    severity: 'medium',
                    mitigation: ['Phased delivery', 'Cost monitoring', 'Regular budget reviews'],
                },
            },
            {
                keywords: ['integration', 'api', 'external system', 'third-party'],
                risk: {
                    id: 'integration-risk',
                    name: 'Integration Complexity',
                    description: 'External integrations may cause delays and compatibility issues',
                    category: 'technical',
                    probability: 'high',
                    impact: 'high',
                    severity: 'high',
                    mitigation: ['API testing', 'Mock services', 'Fallback strategies'],
                },
            },
            {
                keywords: ['security', 'compliance', 'authentication', 'authorization'],
                risk: {
                    id: 'security-compliance',
                    name: 'Security and Compliance',
                    description: 'Security requirements may add complexity and development time',
                    category: 'quality',
                    probability: 'medium',
                    impact: 'high',
                    severity: 'high',
                    mitigation: ['Security audits', 'Compliance reviews', 'Security testing'],
                },
            },
            {
                keywords: ['weeks', 'months', 'deadline', 'deliver'],
                risk: {
                    id: 'tight-schedule',
                    name: 'Aggressive Timeline',
                    description: 'Tight delivery schedule may impact quality and scope',
                    category: 'timeline',
                    probability: 'high',
                    impact: 'high',
                    severity: 'high',
                    mitigation: ['MVP approach', 'Parallel development', 'Resource scaling'],
                },
            },
        ];
        // Check for risk indicators
        const lowerRequest = request.toLowerCase();
        riskPatterns.forEach(({ keywords, risk }) => {
            if (keywords.some(keyword => lowerRequest.includes(keyword))) {
                risks.push(risk);
            }
        });
        // Always include default risks
        if (risks.length === 0) {
            risks.push({
                id: 'general-complexity',
                name: 'General Project Complexity',
                description: 'Standard project risks related to complexity and execution',
                category: 'business',
                probability: 'medium',
                impact: 'medium',
                severity: 'medium',
                mitigation: ['Regular reviews', 'Incremental delivery', 'Quality gates'],
            });
        }
        return risks;
    }
    /**
     * Generate user stories from business requirements with optional external knowledge
     */
    generateUserStories(requirements, externalKnowledge) {
        const stories = [];
        // Enhance user stories with external knowledge (examples and best practices)
        let externalExamples = [];
        if (externalKnowledge && externalKnowledge.length > 0) {
            externalExamples = externalKnowledge
                .filter(k => k.type === 'example' || k.type === 'best-practice')
                .map(k => k.title)
                .slice(0, 3);
        }
        // Generate stories from primary goals
        requirements.primaryGoals.forEach((goal, index) => {
            const story = {
                id: `story-${index + 1}`,
                title: `Implement ${goal}`,
                description: `User story for implementing ${goal}`,
                asA: requirements.targetUsers[0] || 'user',
                iWant: `to ${goal.toLowerCase()}`,
                soThat: 'I can achieve my business objectives',
                acceptanceCriteria: [
                    `System implements ${goal}`,
                    'Solution meets performance requirements',
                    'User experience is intuitive',
                    ...(externalExamples.length > 0 ? [`Consider external examples: ${externalExamples[0]}`] : []),
                ],
                priority: index === 0 ? 'high' : 'medium',
                estimatedEffort: this.estimateStoryEffort(goal),
            };
            stories.push(story);
        });
        // Add quality-focused stories
        stories.push({
            id: 'story-quality',
            title: 'Ensure System Quality',
            description: 'Implement quality assurance and testing',
            asA: 'stakeholder',
            iWant: 'to ensure the system is reliable and secure',
            soThat: 'users have confidence in the solution',
            acceptanceCriteria: [
                'System passes all quality gates',
                'Test coverage ≥85%',
                'Performance targets are met',
                'Security requirements are satisfied',
            ],
            priority: 'high',
            estimatedEffort: 8,
        });
        return stories;
    }
    // Private helper methods
    extractGoals(request, externalKnowledge) {
        const goals = [];
        // Add goals from external knowledge if available
        if (externalKnowledge && externalKnowledge.length > 0) {
            const trendGoals = externalKnowledge
                .filter(k => k.type === 'trend')
                .map(k => `Leverage trend: ${k.content.split(' ')[0]}`)
                .slice(0, 1);
            goals.push(...trendGoals);
        }
        // Primary goal extraction patterns
        const goalPatterns = [
            /(?:want to|need to|should|must|goal is to|objective is to)\s+([^.!?]+)/gi,
            /(?:implement|create|build|develop|design)\s+([^.!?]+)/gi,
        ];
        goalPatterns.forEach(pattern => {
            const matches = request.matchAll(pattern);
            for (const match of matches) {
                if (match[1]) {
                    goals.push(match[1].trim());
                }
            }
        });
        // Extract additional goals from feature mentions
        const featureKeywords = ['with', 'including', 'featuring', 'and'];
        featureKeywords.forEach(keyword => {
            const parts = request.split(keyword);
            if (parts.length > 1) {
                parts.slice(1).forEach(part => {
                    const cleanPart = part.trim().split(/[.!?]/)[0];
                    if (cleanPart.length > 5 && cleanPart.length < 100) {
                        goals.push(`Implement ${cleanPart.trim()}`);
                    }
                });
            }
        });
        // Default goals if none extracted
        if (goals.length === 0) {
            goals.push('Deliver functional solution');
            goals.push('Meet user requirements');
        }
        // Remove duplicates and ensure at least 2 unique goals
        const uniqueGoals = [...new Set(goals)];
        if (uniqueGoals.length === 1 && goals.length === 1) {
            uniqueGoals.push('Ensure high-quality implementation');
            uniqueGoals.push('Meet user requirements and expectations');
        }
        return uniqueGoals.slice(0, 5); // Limit to 5 goals
    }
    extractTargetUsers(request, externalKnowledge) {
        const users = [];
        // Add users from external knowledge if available
        if (externalKnowledge && externalKnowledge.length > 0) {
            const trendUsers = externalKnowledge
                .filter(k => k.type === 'trend' && k.content.includes('user'))
                .map(() => 'trend-aware users')
                .slice(0, 1);
            users.push(...trendUsers);
        }
        const userPatterns = [
            /(?:users?|customers?|clients?|stakeholders?)\s+(?:are|include|such as)?\s*([^.!?]+)/gi,
            /(?:for|targeting|serving)\s+([^.!?]*(?:users?|customers?|clients?)[^.!?]*)/gi,
        ];
        userPatterns.forEach(pattern => {
            const matches = request.matchAll(pattern);
            for (const match of matches) {
                if (match[1]) {
                    users.push(match[1].trim());
                }
            }
        });
        // Default users if none found
        if (users.length === 0) {
            users.push('End users');
            users.push('System administrators');
        }
        return users.slice(0, 3);
    }
    generateSuccessCriteria(goals, externalKnowledge) {
        const criteria = goals.map(goal => `Successfully ${goal.toLowerCase()}`);
        // Add criteria from external best practices
        if (externalKnowledge && externalKnowledge.length > 0) {
            const bestPracticeCriteria = externalKnowledge
                .filter(k => k.type === 'best-practice')
                .map(k => `Apply best practice: ${k.content.split(' ').slice(0, 5).join(' ')}...`)
                .slice(0, 1);
            criteria.push(...bestPracticeCriteria);
        }
        return criteria;
    }
    extractConstraints(request) {
        const constraints = [];
        const constraintPatterns = [
            /(?:budget|cost)\s+(?:is|limited to|maximum)\s+([^.!?]+)/gi,
            /(?:deadline|timeline)\s+(?:is|by)\s+([^.!?]+)/gi,
            /(?:must use|required to use|constraint)\s+([^.!?]+)/gi,
        ];
        constraintPatterns.forEach(pattern => {
            const matches = request.matchAll(pattern);
            for (const match of matches) {
                if (match[1]) {
                    constraints.push(match[1].trim());
                }
            }
        });
        // Default constraints
        if (constraints.length === 0) {
            constraints.push('Quality standards must be met');
            constraints.push('Performance requirements must be satisfied');
        }
        return constraints;
    }
    identifyRiskFactors(request) {
        const riskFactors = [];
        const riskPatterns = [
            'Tight timeline',
            'Complex requirements',
            'Multiple stakeholders',
            'Technical complexity',
            'Integration challenges',
        ];
        // Add basic risk factors based on patterns
        riskPatterns.forEach(pattern => {
            if (request.toLowerCase().includes(pattern.toLowerCase())) {
                riskFactors.push(pattern);
            }
        });
        // Simple risk factor identification
        if (request.includes('urgent') || request.includes('asap')) {
            riskFactors.push('Tight timeline');
        }
        if (request.includes('complex') || request.includes('many')) {
            riskFactors.push('Complex requirements');
        }
        if (request.includes('integrate') || request.includes('external')) {
            riskFactors.push('Integration challenges');
        }
        // Default risk factors if none identified
        if (riskFactors.length === 0) {
            riskFactors.push('Standard project risks');
        }
        return riskFactors;
    }
    extractStakeholderRequirements(request, role) {
        const requirements = ['Functional system', 'Good user experience'];
        // Add role-specific requirements based on request content
        if (request.toLowerCase().includes('security')) {
            requirements.push('Security compliance');
        }
        if (request.toLowerCase().includes('performance')) {
            requirements.push('High performance');
        }
        if (role === 'Manager') {
            requirements.push('Cost-effective solution', 'Timely delivery');
        }
        else if (role === 'Developer') {
            requirements.push('Maintainable code', 'Good documentation');
        }
        else if (role === 'Administrator') {
            requirements.push('System monitoring', 'Easy maintenance');
        }
        return requirements;
    }
    scoreToComplexity(score) {
        if (score >= 8)
            return 'very-high';
        if (score >= 5)
            return 'high';
        if (score >= 2)
            return 'medium';
        return 'low';
    }
    estimateStoryEffort(goal) {
        const complexity = goal.length + goal.split(' ').length * 2;
        return Math.min(Math.max(Math.round(complexity / 10), 3), 13);
    }
}
exports.BusinessAnalyzer = BusinessAnalyzer;
//# sourceMappingURL=business-analyzer.js.map