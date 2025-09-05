#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const business_analyzer_js_1 = require("./business-analyzer.js");
(0, vitest_1.describe)('BusinessAnalyzer', () => {
    let businessAnalyzer;
    (0, vitest_1.beforeEach)(() => {
        businessAnalyzer = new business_analyzer_js_1.BusinessAnalyzer();
    });
    (0, vitest_1.describe)('analyzeRequirements', () => {
        (0, vitest_1.it)('should extract primary goals from business request', () => {
            const request = 'We want to create a user management system to handle authentication and user profiles';
            const result = businessAnalyzer.analyzeRequirements(request);
            (0, vitest_1.expect)(result.primaryGoals).toBeDefined();
            (0, vitest_1.expect)(result.primaryGoals.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(result.targetUsers).toBeDefined();
            (0, vitest_1.expect)(result.successCriteria).toBeDefined();
            (0, vitest_1.expect)(result.constraints).toBeDefined();
            (0, vitest_1.expect)(result.riskFactors).toBeDefined();
        });
        (0, vitest_1.it)('should handle complex business requests with multiple goals', () => {
            const request = 'Need to implement an e-commerce platform with payment processing, inventory management, and customer support features for online retailers';
            const result = businessAnalyzer.analyzeRequirements(request);
            (0, vitest_1.expect)(result.primaryGoals.length).toBeGreaterThan(1);
            (0, vitest_1.expect)(result.targetUsers.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(result.successCriteria.length).toEqual(result.primaryGoals.length);
        });
        (0, vitest_1.it)('should complete analysis within performance target', () => {
            const request = 'Build a reporting dashboard for business analytics';
            const startTime = Date.now();
            businessAnalyzer.analyzeRequirements(request);
            const duration = Date.now() - startTime;
            (0, vitest_1.expect)(duration).toBeLessThan(100); // <100ms target
        });
        (0, vitest_1.it)('should provide default goals when none can be extracted', () => {
            const request = 'A simple project task';
            const result = businessAnalyzer.analyzeRequirements(request);
            (0, vitest_1.expect)(result.primaryGoals).toContain('Deliver functional solution');
            (0, vitest_1.expect)(result.primaryGoals).toContain('Meet user requirements');
        });
    });
    (0, vitest_1.describe)('identifyStakeholders', () => {
        (0, vitest_1.it)('should identify stakeholders from business request', () => {
            const request = 'Create a system for managers to track employee performance and for developers to maintain code quality';
            const result = businessAnalyzer.identifyStakeholders(request);
            (0, vitest_1.expect)(result.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(result.some((s) => s.role === 'Manager')).toBe(true);
            (0, vitest_1.expect)(result.some((s) => s.role === 'Developer')).toBe(true);
        });
        (0, vitest_1.it)('should provide default stakeholders when none identified', () => {
            const request = 'Simple system request';
            const result = businessAnalyzer.identifyStakeholders(request);
            (0, vitest_1.expect)(result.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(result[0].name).toBe('Primary Users');
            (0, vitest_1.expect)(result[0].role).toBe('End User');
        });
        (0, vitest_1.it)('should assign appropriate influence and interest levels', () => {
            const request = 'System for users and administrators';
            const result = businessAnalyzer.identifyStakeholders(request);
            result.forEach((stakeholder) => {
                (0, vitest_1.expect)(['high', 'medium', 'low']).toContain(stakeholder.influence);
                (0, vitest_1.expect)(['high', 'medium', 'low']).toContain(stakeholder.interest);
            });
        });
    });
    (0, vitest_1.describe)('assessComplexity', () => {
        (0, vitest_1.it)('should assess low complexity for simple requests', () => {
            const request = 'Create a basic contact form';
            const result = businessAnalyzer.assessComplexity(request);
            (0, vitest_1.expect)(result.overall).toBe('low');
            (0, vitest_1.expect)(result.technical).toBeDefined();
            (0, vitest_1.expect)(result.business).toBeDefined();
            (0, vitest_1.expect)(result.integration).toBeDefined();
            (0, vitest_1.expect)(Array.isArray(result.factors)).toBe(true);
        });
        (0, vitest_1.it)('should assess high complexity for complex requests', () => {
            const request = 'Build a real-time scalable API with multiple external integrations, advanced security, and compliance requirements';
            const result = businessAnalyzer.assessComplexity(request);
            (0, vitest_1.expect)(['high', 'very-high']).toContain(result.overall);
            (0, vitest_1.expect)(result.factors.length).toBeGreaterThan(2);
        });
        (0, vitest_1.it)('should identify technical complexity factors', () => {
            const request = 'System with real-time processing, API integrations, and advanced security';
            const result = businessAnalyzer.assessComplexity(request);
            (0, vitest_1.expect)(result.factors.some((factor) => factor.includes('Real-time'))).toBe(true);
            (0, vitest_1.expect)(result.factors.some((factor) => factor.includes('API'))).toBe(true);
            (0, vitest_1.expect)(result.factors.some((factor) => factor.includes('Security'))).toBe(true);
        });
    });
    (0, vitest_1.describe)('identifyRisks', () => {
        (0, vitest_1.it)('should identify timeline risks from urgent requests', () => {
            const request = 'We need this system urgently, ASAP delivery required';
            const result = businessAnalyzer.identifyRisks(request);
            (0, vitest_1.expect)(result.some((risk) => risk.id === 'timeline-pressure')).toBe(true);
        });
        (0, vitest_1.it)('should identify scope creep risks from complex requests', () => {
            const request = 'Complex system with many extensive features and complicated workflows';
            const result = businessAnalyzer.identifyRisks(request);
            (0, vitest_1.expect)(result.some((risk) => risk.id === 'scope-creep')).toBe(true);
        });
        (0, vitest_1.it)('should identify technical risks from new technology mentions', () => {
            const request = 'Use cutting edge experimental technology for this new approach';
            const result = businessAnalyzer.identifyRisks(request);
            (0, vitest_1.expect)(result.some((risk) => risk.id === 'technical-risk')).toBe(true);
        });
        (0, vitest_1.it)('should provide default risk when none identified', () => {
            const request = 'Standard system request';
            const result = businessAnalyzer.identifyRisks(request);
            (0, vitest_1.expect)(result.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(result[0].id).toBe('general-complexity');
        });
        (0, vitest_1.it)('should assign appropriate risk levels', () => {
            const request = 'System with tight deadlines and complex requirements';
            const result = businessAnalyzer.identifyRisks(request);
            result.forEach((risk) => {
                (0, vitest_1.expect)(['low', 'medium', 'high']).toContain(risk.probability);
                (0, vitest_1.expect)(['low', 'medium', 'high']).toContain(risk.impact);
                (0, vitest_1.expect)(['low', 'medium', 'high', 'critical']).toContain(risk.severity);
            });
        });
    });
    (0, vitest_1.describe)('generateUserStories', () => {
        (0, vitest_1.it)('should generate user stories from business requirements', () => {
            const requirements = {
                primaryGoals: ['Manage users', 'Handle authentication'],
                targetUsers: ['Admin', 'End User'],
                successCriteria: ['Users can login', 'Admins can manage accounts'],
                constraints: ['Security compliance required'],
                riskFactors: ['Integration complexity'],
            };
            const result = businessAnalyzer.generateUserStories(requirements);
            (0, vitest_1.expect)(result.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(result[0].asA).toBeDefined();
            (0, vitest_1.expect)(result[0].iWant).toBeDefined();
            (0, vitest_1.expect)(result[0].soThat).toBeDefined();
            (0, vitest_1.expect)(result[0].acceptanceCriteria).toBeDefined();
            (0, vitest_1.expect)(Array.isArray(result[0].acceptanceCriteria)).toBe(true);
        });
        (0, vitest_1.it)('should include quality-focused user story', () => {
            const requirements = {
                primaryGoals: ['Basic functionality'],
                targetUsers: ['User'],
                successCriteria: ['Working system'],
                constraints: [],
                riskFactors: [],
            };
            const result = businessAnalyzer.generateUserStories(requirements);
            (0, vitest_1.expect)(result.some((story) => story.title === 'Ensure System Quality')).toBe(true);
        });
        (0, vitest_1.it)('should assign appropriate priorities and effort estimates', () => {
            const requirements = {
                primaryGoals: ['Primary goal', 'Secondary goal'],
                targetUsers: ['User'],
                successCriteria: ['Success'],
                constraints: [],
                riskFactors: [],
            };
            const result = businessAnalyzer.generateUserStories(requirements);
            result.forEach((story) => {
                (0, vitest_1.expect)(['low', 'medium', 'high', 'critical']).toContain(story.priority);
                (0, vitest_1.expect)(story.estimatedEffort).toBeGreaterThan(0);
                (0, vitest_1.expect)(story.estimatedEffort).toBeLessThanOrEqual(20);
            });
        });
        (0, vitest_1.it)('should generate stories with proper structure', () => {
            const requirements = {
                primaryGoals: ['Test goal'],
                targetUsers: ['Test user'],
                successCriteria: ['Test success'],
                constraints: [],
                riskFactors: [],
            };
            const result = businessAnalyzer.generateUserStories(requirements);
            result.forEach((story) => {
                (0, vitest_1.expect)(story.id).toBeDefined();
                (0, vitest_1.expect)(story.title).toBeDefined();
                (0, vitest_1.expect)(story.description).toBeDefined();
                (0, vitest_1.expect)(story.asA).toBeDefined();
                (0, vitest_1.expect)(story.iWant).toBeDefined();
                (0, vitest_1.expect)(story.soThat).toBeDefined();
                (0, vitest_1.expect)(Array.isArray(story.acceptanceCriteria)).toBe(true);
                (0, vitest_1.expect)(story.acceptanceCriteria.length).toBeGreaterThan(0);
            });
        });
    });
    (0, vitest_1.describe)('performance', () => {
        (0, vitest_1.it)('should maintain performance targets across all methods', () => {
            const request = 'Complex business request with multiple goals, stakeholders, and requirements for performance testing';
            const startTime = Date.now();
            businessAnalyzer.analyzeRequirements(request);
            businessAnalyzer.identifyStakeholders(request);
            businessAnalyzer.assessComplexity(request);
            businessAnalyzer.identifyRisks(request);
            const totalTime = Date.now() - startTime;
            (0, vitest_1.expect)(totalTime).toBeLessThan(200); // All operations under 200ms
        });
    });
});
//# sourceMappingURL=business-analyzer.test.js.map