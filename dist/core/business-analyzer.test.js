#!/usr/bin/env node
import { describe, it, expect, beforeEach } from 'vitest';
import { BusinessAnalyzer } from './business-analyzer.js';
describe('BusinessAnalyzer', () => {
    let businessAnalyzer;
    beforeEach(() => {
        businessAnalyzer = new BusinessAnalyzer();
    });
    describe('analyzeRequirements', () => {
        it('should extract primary goals from business request', () => {
            const request = 'We want to create a user management system to handle authentication and user profiles';
            const result = businessAnalyzer.analyzeRequirements(request);
            expect(result.primaryGoals).toBeDefined();
            expect(result.primaryGoals.length).toBeGreaterThan(0);
            expect(result.targetUsers).toBeDefined();
            expect(result.successCriteria).toBeDefined();
            expect(result.constraints).toBeDefined();
            expect(result.riskFactors).toBeDefined();
        });
        it('should handle complex business requests with multiple goals', () => {
            const request = 'Need to implement an e-commerce platform with payment processing, inventory management, and customer support features for online retailers';
            const result = businessAnalyzer.analyzeRequirements(request);
            expect(result.primaryGoals.length).toBeGreaterThan(1);
            expect(result.targetUsers.length).toBeGreaterThan(0);
            expect(result.successCriteria.length).toEqual(result.primaryGoals.length);
        });
        it('should complete analysis within performance target', () => {
            const request = 'Build a reporting dashboard for business analytics';
            const startTime = Date.now();
            businessAnalyzer.analyzeRequirements(request);
            const duration = Date.now() - startTime;
            expect(duration).toBeLessThan(100); // <100ms target
        });
        it('should provide default goals when none can be extracted', () => {
            const request = 'A simple project task';
            const result = businessAnalyzer.analyzeRequirements(request);
            expect(result.primaryGoals).toContain('Deliver functional solution');
            expect(result.primaryGoals).toContain('Meet user requirements');
        });
    });
    describe('identifyStakeholders', () => {
        it('should identify stakeholders from business request', () => {
            const request = 'Create a system for managers to track employee performance and for developers to maintain code quality';
            const result = businessAnalyzer.identifyStakeholders(request);
            expect(result.length).toBeGreaterThan(0);
            expect(result.some((s) => s.role === 'Manager')).toBe(true);
            expect(result.some((s) => s.role === 'Developer')).toBe(true);
        });
        it('should provide default stakeholders when none identified', () => {
            const request = 'Simple system request';
            const result = businessAnalyzer.identifyStakeholders(request);
            expect(result.length).toBeGreaterThan(0);
            expect(result[0].name).toBe('Primary Users');
            expect(result[0].role).toBe('End User');
        });
        it('should assign appropriate influence and interest levels', () => {
            const request = 'System for users and administrators';
            const result = businessAnalyzer.identifyStakeholders(request);
            result.forEach((stakeholder) => {
                expect(['high', 'medium', 'low']).toContain(stakeholder.influence);
                expect(['high', 'medium', 'low']).toContain(stakeholder.interest);
            });
        });
    });
    describe('assessComplexity', () => {
        it('should assess low complexity for simple requests', () => {
            const request = 'Create a basic contact form';
            const result = businessAnalyzer.assessComplexity(request);
            expect(result.overall).toBe('low');
            expect(result.technical).toBeDefined();
            expect(result.business).toBeDefined();
            expect(result.integration).toBeDefined();
            expect(Array.isArray(result.factors)).toBe(true);
        });
        it('should assess high complexity for complex requests', () => {
            const request = 'Build a real-time scalable API with multiple external integrations, advanced security, and compliance requirements';
            const result = businessAnalyzer.assessComplexity(request);
            expect(['high', 'very-high']).toContain(result.overall);
            expect(result.factors.length).toBeGreaterThan(2);
        });
        it('should identify technical complexity factors', () => {
            const request = 'System with real-time processing, API integrations, and advanced security';
            const result = businessAnalyzer.assessComplexity(request);
            expect(result.factors.some((factor) => factor.includes('Real-time'))).toBe(true);
            expect(result.factors.some((factor) => factor.includes('API'))).toBe(true);
            expect(result.factors.some((factor) => factor.includes('Security'))).toBe(true);
        });
    });
    describe('identifyRisks', () => {
        it('should identify timeline risks from urgent requests', () => {
            const request = 'We need this system urgently, ASAP delivery required';
            const result = businessAnalyzer.identifyRisks(request);
            expect(result.some((risk) => risk.id === 'timeline-pressure')).toBe(true);
        });
        it('should identify scope creep risks from complex requests', () => {
            const request = 'Complex system with many extensive features and complicated workflows';
            const result = businessAnalyzer.identifyRisks(request);
            expect(result.some((risk) => risk.id === 'scope-creep')).toBe(true);
        });
        it('should identify technical risks from new technology mentions', () => {
            const request = 'Use cutting edge experimental technology for this new approach';
            const result = businessAnalyzer.identifyRisks(request);
            expect(result.some((risk) => risk.id === 'technical-risk')).toBe(true);
        });
        it('should provide default risk when none identified', () => {
            const request = 'Standard system request';
            const result = businessAnalyzer.identifyRisks(request);
            expect(result.length).toBeGreaterThan(0);
            expect(result[0].id).toBe('general-complexity');
        });
        it('should assign appropriate risk levels', () => {
            const request = 'System with tight deadlines and complex requirements';
            const result = businessAnalyzer.identifyRisks(request);
            result.forEach((risk) => {
                expect(['low', 'medium', 'high']).toContain(risk.probability);
                expect(['low', 'medium', 'high']).toContain(risk.impact);
                expect(['low', 'medium', 'high', 'critical']).toContain(risk.severity);
            });
        });
    });
    describe('generateUserStories', () => {
        it('should generate user stories from business requirements', () => {
            const requirements = {
                primaryGoals: ['Manage users', 'Handle authentication'],
                targetUsers: ['Admin', 'End User'],
                successCriteria: ['Users can login', 'Admins can manage accounts'],
                constraints: ['Security compliance required'],
                riskFactors: ['Integration complexity'],
            };
            const result = businessAnalyzer.generateUserStories(requirements);
            expect(result.length).toBeGreaterThan(0);
            expect(result[0].asA).toBeDefined();
            expect(result[0].iWant).toBeDefined();
            expect(result[0].soThat).toBeDefined();
            expect(result[0].acceptanceCriteria).toBeDefined();
            expect(Array.isArray(result[0].acceptanceCriteria)).toBe(true);
        });
        it('should include quality-focused user story', () => {
            const requirements = {
                primaryGoals: ['Basic functionality'],
                targetUsers: ['User'],
                successCriteria: ['Working system'],
                constraints: [],
                riskFactors: [],
            };
            const result = businessAnalyzer.generateUserStories(requirements);
            expect(result.some((story) => story.title === 'Ensure System Quality')).toBe(true);
        });
        it('should assign appropriate priorities and effort estimates', () => {
            const requirements = {
                primaryGoals: ['Primary goal', 'Secondary goal'],
                targetUsers: ['User'],
                successCriteria: ['Success'],
                constraints: [],
                riskFactors: [],
            };
            const result = businessAnalyzer.generateUserStories(requirements);
            result.forEach((story) => {
                expect(['low', 'medium', 'high', 'critical']).toContain(story.priority);
                expect(story.estimatedEffort).toBeGreaterThan(0);
                expect(story.estimatedEffort).toBeLessThanOrEqual(20);
            });
        });
        it('should generate stories with proper structure', () => {
            const requirements = {
                primaryGoals: ['Test goal'],
                targetUsers: ['Test user'],
                successCriteria: ['Test success'],
                constraints: [],
                riskFactors: [],
            };
            const result = businessAnalyzer.generateUserStories(requirements);
            result.forEach((story) => {
                expect(story.id).toBeDefined();
                expect(story.title).toBeDefined();
                expect(story.description).toBeDefined();
                expect(story.asA).toBeDefined();
                expect(story.iWant).toBeDefined();
                expect(story.soThat).toBeDefined();
                expect(Array.isArray(story.acceptanceCriteria)).toBe(true);
                expect(story.acceptanceCriteria.length).toBeGreaterThan(0);
            });
        });
    });
    describe('performance', () => {
        it('should maintain performance targets across all methods', () => {
            const request = 'Complex business request with multiple goals, stakeholders, and requirements for performance testing';
            const startTime = Date.now();
            businessAnalyzer.analyzeRequirements(request);
            businessAnalyzer.identifyStakeholders(request);
            businessAnalyzer.assessComplexity(request);
            businessAnalyzer.identifyRisks(request);
            const totalTime = Date.now() - startTime;
            expect(totalTime).toBeLessThan(200); // All operations under 200ms
        });
    });
});
//# sourceMappingURL=business-analyzer.test.js.map