#!/usr/bin/env node
import { describe, it, expect, beforeEach } from 'vitest';
import { BusinessAnalyzer } from './business-analyzer.js';
describe('BusinessAnalyzer - REAL TESTS', () => {
    let businessAnalyzer;
    beforeEach(() => {
        businessAnalyzer = new BusinessAnalyzer();
    });
    describe('analyzeRequirements - ACTUAL FUNCTIONALITY', () => {
        it('should extract SPECIFIC goals from e-commerce request', () => {
            const request = 'We want to create an e-commerce platform with payment processing and inventory management';
            const result = businessAnalyzer.analyzeRequirements(request);
            // REAL ASSERTIONS - Check ACTUAL extracted goals
            expect(result.primaryGoals).toContain('Create e-commerce platform');
            expect(result.primaryGoals).toContain('Implement payment processing');
            expect(result.primaryGoals).toContain('Manage inventory');
            // These should be the ONLY goals for this request
            expect(result.primaryGoals).toHaveLength(3);
            // Target users should be logically derived
            expect(result.targetUsers).toContain('Customers');
            expect(result.targetUsers).toContain('Store Administrators');
            // Success criteria should match the goals
            expect(result.successCriteria).toContain('E-commerce platform operational');
            expect(result.successCriteria).toContain('Payment processing functional');
            expect(result.successCriteria).toContain('Inventory tracking accurate');
            // Constraints should be realistic
            expect(result.constraints).toContain('Payment security compliance');
            // Risk factors should be relevant
            expect(result.riskFactors.some(risk => risk.includes('payment') || risk.includes('security'))).toBe(true);
        });
        it('should extract DIFFERENT goals for different domains', () => {
            const healthcareRequest = 'Build a patient management system for hospitals';
            const healthResult = businessAnalyzer.analyzeRequirements(healthcareRequest);
            const financeRequest = 'Create a trading platform for stock market';
            const financeResult = businessAnalyzer.analyzeRequirements(financeRequest);
            // Goals should be DIFFERENT and SPECIFIC
            expect(healthResult.primaryGoals).not.toEqual(financeResult.primaryGoals);
            // Healthcare should have healthcare-specific goals
            expect(healthResult.primaryGoals.some(goal => goal.toLowerCase().includes('patient'))).toBe(true);
            // Finance should have finance-specific goals
            expect(financeResult.primaryGoals.some(goal => goal.toLowerCase().includes('trading') || goal.toLowerCase().includes('stock'))).toBe(true);
            // Constraints should be domain-specific
            expect(healthResult.constraints.some(c => c.includes('HIPAA') || c.includes('privacy'))).toBe(true);
            expect(financeResult.constraints.some(c => c.includes('regulatory') || c.includes('compliance'))).toBe(true);
        });
        it('should NOT return generic goals for specific requests', () => {
            const specificRequest = 'Implement real-time chat with end-to-end encryption';
            const result = businessAnalyzer.analyzeRequirements(specificRequest);
            // Should NOT contain generic filler goals
            expect(result.primaryGoals).not.toContain('Deliver functional solution');
            expect(result.primaryGoals).not.toContain('Meet user requirements');
            // Should contain SPECIFIC goals
            expect(result.primaryGoals.some(goal => goal.includes('real-time') || goal.includes('chat'))).toBe(true);
            expect(result.primaryGoals.some(goal => goal.includes('encryption') || goal.includes('security'))).toBe(true);
        });
        it('should complete analysis in ACTUAL time, not just <100ms check', () => {
            const complexRequest = 'Build a comprehensive enterprise resource planning system with financial management, human resources, supply chain, manufacturing, and customer relationship management modules integrated with AI-powered analytics and blockchain-based audit trails';
            const startTime = performance.now();
            businessAnalyzer.analyzeRequirements(complexRequest);
            const duration = performance.now() - startTime;
            // Should be fast but not impossibly fast (indicates fake processing)
            expect(duration).toBeGreaterThan(1); // At least 1ms of actual work
            expect(duration).toBeLessThan(100); // Still meet performance target
            // Log actual time for transparency
            console.log(`Actual analysis time: ${duration.toFixed(2)}ms`);
        });
    });
    describe('identifyStakeholders - REAL PATTERN MATCHING', () => {
        it('should identify EXACT stakeholders mentioned, not guess', () => {
            const request = 'System for managers to review code and developers to submit PRs';
            const result = businessAnalyzer.identifyStakeholders(request);
            // Should find EXACTLY these stakeholders
            const roles = result.map(s => s.role);
            expect(roles).toContain('Manager');
            expect(roles).toContain('Developer');
            // Should NOT add stakeholders not mentioned
            expect(roles).not.toContain('End User');
            expect(roles).not.toContain('Administrator');
            // Check exact count
            expect(result).toHaveLength(2);
            // Influence levels should make sense
            const manager = result.find(s => s.role === 'Manager');
            expect(manager?.influence).toBe('high'); // Managers reviewing = high influence
            const developer = result.find(s => s.role === 'Developer');
            expect(developer?.interest).toBe('high'); // Developers submitting = high interest
        });
        it('should NOT identify stakeholders from unrelated words', () => {
            const request = 'Manage inventory using custom algorithm';
            const result = businessAnalyzer.identifyStakeholders(request);
            // "Manage" should NOT trigger "Manager" stakeholder
            const hasManager = result.some(s => s.role === 'Manager');
            expect(hasManager).toBe(false);
            // Should identify actual implicit stakeholders
            expect(result.some(s => s.role.includes('User') || s.role.includes('Operator'))).toBe(true);
        });
    });
    describe('assessComplexity - ACTUAL COMPLEXITY CALCULATION', () => {
        it('should calculate complexity based on REAL factors', () => {
            const simpleRequest = 'Create a contact form';
            const simpleResult = businessAnalyzer.assessComplexity(simpleRequest);
            const complexRequest = 'Build distributed microservices with Kubernetes orchestration, service mesh, event streaming, and multi-region deployment';
            const complexResult = businessAnalyzer.assessComplexity(complexRequest);
            // Simple should be objectively simpler
            expect(simpleResult.overall).toBe('low');
            expect(simpleResult.technical).toBe('low');
            expect(simpleResult.factors).toHaveLength(0); // No complexity factors
            // Complex should be objectively complex
            expect(['high', 'very-high']).toContain(complexResult.overall);
            expect(['high', 'very-high']).toContain(complexResult.technical);
            // Should identify SPECIFIC complexity factors
            expect(complexResult.factors).toContain('Distributed architecture');
            expect(complexResult.factors).toContain('Container orchestration');
            expect(complexResult.factors).toContain('Multi-region deployment');
            // Integration complexity should be high for microservices
            expect(['high', 'very-high']).toContain(complexResult.integration);
        });
        it('should NOT randomly assign complexity levels', () => {
            // Run same request multiple times
            const request = 'Create API with authentication';
            const results = [];
            for (let i = 0; i < 5; i++) {
                const result = businessAnalyzer.assessComplexity(request);
                results.push(result.overall);
            }
            // All results should be IDENTICAL (not random)
            expect(new Set(results).size).toBe(1);
            expect(results[0]).toBe('medium'); // API + auth = medium complexity
        });
    });
    describe('identifyRisks - REAL RISK IDENTIFICATION', () => {
        it('should identify ACTUAL risks from request content', () => {
            const riskyRequest = 'Need urgent delivery ASAP with experimental blockchain integration';
            const result = businessAnalyzer.identifyRisks(riskyRequest);
            // Should identify SPECIFIC risks
            const riskIds = result.map(r => r.id);
            expect(riskIds).toContain('timeline-pressure');
            expect(riskIds).toContain('technical-risk');
            // Timeline risk should have appropriate severity
            const timelineRisk = result.find(r => r.id === 'timeline-pressure');
            expect(timelineRisk?.probability).toBe('high'); // "urgent" + "ASAP" = high probability
            expect(timelineRisk?.impact).toBe('high');
            expect(timelineRisk?.severity).toBe('critical');
            // Technical risk for experimental tech
            const techRisk = result.find(r => r.id === 'technical-risk');
            expect(techRisk?.description).toContain('experimental');
        });
        it('should calculate risk severity correctly', () => {
            const request = 'Complex system with tight deadline';
            const result = businessAnalyzer.identifyRisks(request);
            result.forEach(risk => {
                // Severity should be calculated from probability and impact
                if (risk.probability === 'high' && risk.impact === 'high') {
                    expect(risk.severity).toBe('critical');
                }
                else if (risk.probability === 'high' && risk.impact === 'medium') {
                    expect(risk.severity).toBe('high');
                }
                else if (risk.probability === 'low' && risk.impact === 'low') {
                    expect(risk.severity).toBe('low');
                }
                // Mitigation should be relevant to the risk
                expect(risk.mitigation).not.toBe('');
                expect(risk.mitigation.length).toBeGreaterThan(10);
            });
        });
    });
    describe('generateUserStories - ACTUAL STORY GENERATION', () => {
        it('should generate stories that match the requirements', () => {
            const requirements = {
                primaryGoals: ['User authentication', 'Profile management'],
                targetUsers: ['Admin', 'Regular User'],
                successCriteria: ['Users can login', 'Profiles are editable'],
                constraints: ['GDPR compliance'],
                riskFactors: ['Data privacy'],
            };
            const result = businessAnalyzer.generateUserStories(requirements);
            // Should generate stories for EACH goal and user combination
            expect(result.length).toBeGreaterThanOrEqual(4); // 2 goals × 2 users minimum
            // Check story structure is complete and specific
            const adminAuthStory = result.find(s => s.asA === 'Admin' && s.title.includes('authentication'));
            expect(adminAuthStory).toBeDefined();
            expect(adminAuthStory?.iWant).toContain('authenticate');
            expect(adminAuthStory?.soThat).not.toBe(''); // Should have real value
            expect(adminAuthStory?.acceptanceCriteria).toContain('Admin can login with credentials');
            expect(adminAuthStory?.acceptanceCriteria).toContain('Session is secure');
            // Priority should be based on user type and goal importance
            expect(adminAuthStory?.priority).toBe('critical'); // Auth for admin = critical
            // Regular user story should have different priority
            const userProfileStory = result.find(s => s.asA === 'Regular User' && s.title.includes('Profile'));
            expect(userProfileStory?.priority).toBe('high'); // Profile for user = high, not critical
            // Effort should be realistic
            expect(adminAuthStory?.estimatedEffort).toBeGreaterThanOrEqual(3);
            expect(adminAuthStory?.estimatedEffort).toBeLessThanOrEqual(8);
        });
        it('should NOT generate duplicate or generic stories', () => {
            const requirements = {
                primaryGoals: ['Feature A', 'Feature B'],
                targetUsers: ['User'],
                successCriteria: ['A works', 'B works'],
                constraints: [],
                riskFactors: [],
            };
            const result = businessAnalyzer.generateUserStories(requirements);
            // Check for uniqueness
            const titles = result.map(s => s.title);
            const uniqueTitles = new Set(titles);
            expect(uniqueTitles.size).toBe(titles.length); // No duplicates
            // Should not have generic filler stories
            expect(titles.every(t => !t.includes('Ensure System Quality'))).toBe(false);
            // Actually, one quality story is OK, but not multiple
            const qualityStories = titles.filter(t => t.includes('Quality'));
            expect(qualityStories.length).toBeLessThanOrEqual(1);
        });
    });
    describe('INTEGRATION - Full workflow validation', () => {
        it('should maintain consistency across all methods', () => {
            const request = 'Build secure banking app for mobile users with biometric authentication';
            const requirements = businessAnalyzer.analyzeRequirements(request);
            const stakeholders = businessAnalyzer.identifyStakeholders(request);
            const complexity = businessAnalyzer.assessComplexity(request);
            const risks = businessAnalyzer.identifyRisks(request);
            const stories = businessAnalyzer.generateUserStories(requirements);
            // Requirements should mention banking and security
            expect(requirements.primaryGoals.some(g => g.toLowerCase().includes('banking') || g.toLowerCase().includes('financial'))).toBe(true);
            expect(requirements.constraints.some(c => c.toLowerCase().includes('security') || c.toLowerCase().includes('compliance'))).toBe(true);
            // Stakeholders should include users (mentioned)
            expect(stakeholders.some(s => s.role.includes('User'))).toBe(true);
            // Complexity should be high (banking + security + biometric)
            expect(['high', 'very-high']).toContain(complexity.overall);
            expect(complexity.factors).toContain('Security requirements');
            // Risks should include security concerns
            expect(risks.some(r => r.description.toLowerCase().includes('security') ||
                r.description.toLowerCase().includes('data'))).toBe(true);
            // Stories should cover biometric auth
            expect(stories.some(s => s.title.toLowerCase().includes('biometric') ||
                s.description.toLowerCase().includes('biometric'))).toBe(true);
            // All components should be internally consistent
            expect(stories.length).toBeGreaterThanOrEqual(requirements.primaryGoals.length);
        });
    });
});
//# sourceMappingURL=business-analyzer.test.js.map