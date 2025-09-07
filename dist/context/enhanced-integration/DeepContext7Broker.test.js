#!/usr/bin/env node
/**
 * Deep Context7 Broker Tests - Week 2 Enhanced
 *
 * Comprehensive test suite for the enhanced Deep Context7 Broker
 * with advanced context management, intelligent injection, and learning capabilities.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DeepContext7Broker, createDeepContext7Broker, ContextEntrySchema, } from './DeepContext7Broker';
describe('DeepContext7Broker - Week 2 Enhanced', () => {
    let broker;
    beforeEach(() => {
        broker = createDeepContext7Broker({
            maxContextLength: 2000,
            relevanceThreshold: 0.3,
            compressionEnabled: true,
            adaptiveInjection: true,
            crossSessionEnabled: true,
            learningEnabled: true,
        });
    });
    afterEach(() => {
        // Cleanup after each test
    });
    describe('Context Storage and Retrieval', () => {
        it('should store and retrieve context entries', async () => {
            const contextEntry = {
                sessionId: 'test_session_001',
                toolName: 'smart_begin',
                contextType: 'user_query',
                content: 'Create a React component for user authentication',
                relevanceScore: 0.8,
                metadata: {
                    userLevel: 'intermediate',
                    projectId: 'proj_001',
                },
            };
            const contextId = await broker.storeContext(contextEntry);
            expect(contextId).toBeTruthy();
            expect(contextId).toMatch(/^ctx_\d+_[a-z0-9]+$/);
            const relevantContexts = await broker.getRelevantContext('test_session_001', 'authentication component', 'smart_begin');
            expect(relevantContexts).toHaveLength(1);
            expect(relevantContexts[0].content).toContain('authentication');
        });
        it('should apply compression when enabled', async () => {
            const longContent = 'This is a very long context entry that should be compressed. '.repeat(50);
            const contextEntry = {
                sessionId: 'test_session_002',
                toolName: 'smart_write',
                contextType: 'tool_output',
                content: longContent,
                relevanceScore: 0.7,
            };
            const contextId = await broker.storeContext(contextEntry);
            const contexts = await broker.getRelevantContext('test_session_002', 'long context', 'smart_write');
            expect(contexts).toHaveLength(1);
            expect(contexts[0].compressionInfo).toBeDefined();
            expect(contexts[0].compressionInfo.compressedLength).toBeLessThan(contexts[0].compressionInfo.originalLength);
        });
        it('should find cross-session relevant contexts', async () => {
            // Store context in session 1
            await broker.storeContext({
                sessionId: 'session_001',
                toolName: 'smart_plan',
                contextType: 'tool_output',
                content: 'E-commerce website development plan with user authentication',
                relevanceScore: 0.8,
                persistenceLevel: 'project',
            });
            // Store context in session 2
            await broker.storeContext({
                sessionId: 'session_002',
                toolName: 'smart_write',
                contextType: 'user_query',
                content: 'Implement shopping cart functionality',
                relevanceScore: 0.7,
                persistenceLevel: 'session',
            });
            // Query from session 2 should find relevant context from session 1
            const relevantContexts = await broker.getRelevantContext('session_002', 'e-commerce authentication', 'smart_plan', { crossSession: true });
            expect(relevantContexts.length).toBeGreaterThan(0);
            expect(relevantContexts.some(ctx => ctx.sessionId === 'session_001')).toBe(true);
        });
    });
    describe('Context Suggestions', () => {
        beforeEach(async () => {
            // Set up test contexts
            await broker.storeContext({
                sessionId: 'suggest_session',
                toolName: 'smart_begin',
                contextType: 'tool_output',
                content: 'Successfully created React login component with validation',
                relevanceScore: 0.9,
                metadata: { userLevel: 'intermediate' },
            });
            await broker.storeContext({
                sessionId: 'suggest_session',
                toolName: 'smart_write',
                contextType: 'error_context',
                content: 'Authentication error: Invalid credentials format',
                relevanceScore: 0.6,
                metadata: { toolName: 'smart_write' },
            });
        });
        it('should generate relevant context suggestions', async () => {
            const suggestions = await broker.generateContextSuggestions('suggest_session', 'smart_begin', 'Create a signup form component', 'implementation');
            expect(suggestions.length).toBeGreaterThan(0);
            const relevantSuggestion = suggestions.find(s => s.type === 'relevant_context');
            expect(relevantSuggestion).toBeDefined();
            expect(relevantSuggestion.relevanceScore).toBeGreaterThan(0.5);
        });
        it('should generate error prevention suggestions', async () => {
            const suggestions = await broker.generateContextSuggestions('suggest_session', 'smart_write', 'Implement user authentication logic', 'implementation');
            const errorPreventionSuggestion = suggestions.find(s => s.type === 'error_prevention');
            expect(errorPreventionSuggestion).toBeDefined();
            expect(errorPreventionSuggestion.reasoning).toContain('Error contexts found');
        });
        it('should generate workflow continuation suggestions', async () => {
            const suggestions = await broker.generateContextSuggestions('suggest_session', 'smart_plan', 'Plan the next development phase', 'planning');
            const workflowSuggestion = suggestions.find(s => s.type === 'workflow_continuation');
            expect(workflowSuggestion).toBeDefined();
            expect(workflowSuggestion.content).toContain('planning');
        });
    });
    describe('Context Injection', () => {
        beforeEach(async () => {
            // Set up contexts for injection testing
            await broker.storeContext({
                sessionId: 'inject_session',
                toolName: 'smart_write',
                contextType: 'tool_output',
                content: 'React component best practices: Use functional components with hooks',
                relevanceScore: 0.8,
            });
            await broker.storeContext({
                sessionId: 'inject_session',
                toolName: 'smart_write',
                contextType: 'user_query',
                content: 'Previous implementation used class components',
                relevanceScore: 0.7,
            });
        });
        it('should inject context adaptively', async () => {
            const result = await broker.injectContext('inject_session', 'smart_write', 'Create a new React component for user profile', 'adaptive');
            expect(result.enhancedInput).toContain('Create a new React component');
            expect(result.injectedContexts.length).toBeGreaterThan(0);
            expect(result.injectionMetadata.totalContexts).toBeGreaterThan(0);
            expect(result.injectionMetadata.adaptationReason).toContain('Adaptive mode');
        });
        it('should apply minimal injection mode', async () => {
            const result = await broker.injectContext('inject_session', 'smart_write', 'Simple component creation task', 'minimal');
            expect(result.injectedContexts.length).toBeLessThanOrEqual(2);
            expect(result.injectionMetadata.adaptationReason).toContain('Minimal mode');
        });
        it('should apply comprehensive injection mode', async () => {
            const result = await broker.injectContext('inject_session', 'smart_write', 'Complex component with multiple features', 'comprehensive');
            expect(result.injectionMetadata.adaptationReason).toContain('Comprehensive mode');
            expect(result.injectedContexts.length).toBeGreaterThanOrEqual(1);
        });
        it('should track injection metadata correctly', async () => {
            const result = await broker.injectContext('inject_session', 'smart_write', 'Test injection metadata tracking');
            expect(result.injectionMetadata.totalContexts).toBeDefined();
            expect(result.injectionMetadata.totalTokens).toBeGreaterThan(0);
            expect(result.injectionMetadata.compressionApplied).toBeDefined();
            expect(result.injectionMetadata.adaptationReason).toBeTruthy();
        });
    });
    describe('Context Cleanup and Management', () => {
        beforeEach(async () => {
            // Create contexts with different ages and relevance scores
            const oldDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
            await broker.storeContext({
                sessionId: 'cleanup_session',
                toolName: 'smart_begin',
                contextType: 'user_query',
                content: 'Old low-relevance content',
                relevanceScore: 0.1,
                timestamp: oldDate,
            });
            await broker.storeContext({
                sessionId: 'cleanup_session',
                toolName: 'smart_begin',
                contextType: 'tool_output',
                content: 'Old high-relevance content',
                relevanceScore: 0.9,
                timestamp: oldDate,
                persistenceLevel: 'project',
            });
            await broker.storeContext({
                sessionId: 'cleanup_session',
                toolName: 'smart_write',
                contextType: 'workflow_state',
                content: 'Recent context content',
                relevanceScore: 0.6,
            });
        });
        it('should cleanup old low-relevance contexts', async () => {
            const result = await broker.cleanupContexts({
                maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days
                minRelevance: 0.3,
                preserveHighValue: true,
                sessionId: 'cleanup_session',
            });
            expect(result.removed).toBeGreaterThan(0);
            expect(result.preserved).toBeGreaterThan(0);
            expect(result.preservedHighValue).toBeGreaterThan(0);
        });
        it('should preserve high-value contexts during cleanup', async () => {
            await broker.cleanupContexts({
                maxAge: 1000, // Very short age to force cleanup
                minRelevance: 0.8,
                preserveHighValue: true,
                sessionId: 'cleanup_session',
            });
            const remainingContexts = await broker.getRelevantContext('cleanup_session', 'high-relevance', 'smart_begin');
            // Should still have the high-relevance, high-value context
            expect(remainingContexts.some(ctx => ctx.relevanceScore > 0.8)).toBe(true);
        });
    });
    describe('Performance and Statistics', () => {
        beforeEach(async () => {
            // Create multiple contexts for statistics testing
            for (let i = 0; i < 10; i++) {
                await broker.storeContext({
                    sessionId: `stats_session_${i % 3}`,
                    toolName: `tool_${i % 4}`,
                    contextType: 'tool_output',
                    content: `Test content ${i} with varying length and complexity`,
                    relevanceScore: 0.5 + (i % 5) * 0.1,
                    metadata: { iteration: i },
                });
            }
        });
        it('should provide comprehensive context statistics', () => {
            const stats = broker.getContextStatistics();
            expect(stats.totalContexts).toBeGreaterThan(0);
            expect(stats.sessionCount).toBeGreaterThan(0);
            expect(stats.avgContextsPerSession).toBeGreaterThan(0);
            expect(stats.avgRelevanceScore).toBeGreaterThan(0);
            expect(stats.persistenceStats).toBeDefined();
            expect(stats.compressionStats).toBeDefined();
        });
        it('should track compression statistics', () => {
            const stats = broker.getContextStatistics();
            expect(stats.compressionStats.compressedContexts).toBeGreaterThanOrEqual(0);
            expect(stats.compressionStats.avgCompressionRatio).toBeGreaterThanOrEqual(0);
            expect(stats.compressionStats.totalSpaceSaved).toBeGreaterThanOrEqual(0);
        });
        it('should track persistence level statistics', () => {
            const stats = broker.getContextStatistics();
            expect(stats.persistenceStats.session).toBeGreaterThanOrEqual(0);
            expect(stats.persistenceStats.project).toBeGreaterThanOrEqual(0);
            expect(stats.persistenceStats.user).toBeGreaterThanOrEqual(0);
            expect(stats.persistenceStats.global).toBeGreaterThanOrEqual(0);
        });
    });
    describe('Advanced Context Features', () => {
        it('should handle context relationships', async () => {
            const context1Id = await broker.storeContext({
                sessionId: 'relationship_session',
                toolName: 'smart_plan',
                contextType: 'tool_output',
                content: 'Initial project planning completed',
                relevanceScore: 0.8,
            });
            const context2Id = await broker.storeContext({
                sessionId: 'relationship_session',
                toolName: 'smart_write',
                contextType: 'tool_output',
                content: 'Implementation started based on the plan',
                relevanceScore: 0.7,
                relationships: [
                    {
                        type: 'follows',
                        targetContextId: context1Id,
                        strength: 0.9,
                    },
                ],
            });
            expect(context1Id).toBeTruthy();
            expect(context2Id).toBeTruthy();
            expect(context2Id).not.toBe(context1Id);
        });
        it('should validate context entry schema', () => {
            const validEntry = {
                id: 'test_id',
                sessionId: 'test_session',
                toolName: 'smart_begin',
                contextType: 'user_query',
                content: 'Test content',
                relevanceScore: 0.7,
                timestamp: new Date(),
            };
            expect(() => ContextEntrySchema.parse(validEntry)).not.toThrow();
            const invalidEntry = {
                id: 'test_id',
                sessionId: 'test_session',
                // Missing required fields
                content: 'Test content',
                timestamp: new Date(),
            };
            expect(() => ContextEntrySchema.parse(invalidEntry)).toThrow();
        });
        it('should handle different persistence levels', async () => {
            const sessionContext = await broker.storeContext({
                sessionId: 'persistence_test',
                toolName: 'smart_begin',
                contextType: 'user_query',
                content: 'Session-level context',
                relevanceScore: 0.6,
                persistenceLevel: 'session',
            });
            const projectContext = await broker.storeContext({
                sessionId: 'persistence_test',
                toolName: 'smart_plan',
                contextType: 'workflow_state',
                content: 'Project-level context',
                relevanceScore: 0.8,
                persistenceLevel: 'project',
            });
            expect(sessionContext).toBeTruthy();
            expect(projectContext).toBeTruthy();
            // Project-level contexts should be available for cross-session queries
            const crossSessionResults = await broker.getRelevantContext('different_session', 'project context', 'smart_plan', { crossSession: true });
            expect(crossSessionResults.some(ctx => ctx.persistenceLevel === 'project')).toBe(true);
        });
    });
    describe('Error Handling and Edge Cases', () => {
        it('should handle empty context queries gracefully', async () => {
            const results = await broker.getRelevantContext('empty_session', '', 'smart_begin');
            expect(results).toHaveLength(0);
        });
        it('should handle very short content', async () => {
            const contextId = await broker.storeContext({
                sessionId: 'short_session',
                toolName: 'smart_write',
                contextType: 'user_query',
                content: 'Hi',
                relevanceScore: 0.5,
            });
            expect(contextId).toBeTruthy();
            const results = await broker.getRelevantContext('short_session', 'greeting', 'smart_write');
            expect(results).toHaveLength(1);
        });
        it('should handle large context content', async () => {
            const largeContent = 'Large context content. '.repeat(1000);
            const contextId = await broker.storeContext({
                sessionId: 'large_session',
                toolName: 'smart_orchestrate',
                contextType: 'tool_output',
                content: largeContent,
                relevanceScore: 0.7,
            });
            expect(contextId).toBeTruthy();
            const results = await broker.getRelevantContext('large_session', 'large content', 'smart_orchestrate');
            expect(results).toHaveLength(1);
            // Should be compressed
            expect(results[0].compressionInfo).toBeDefined();
        });
    });
});
describe('DeepContext7Broker Factory', () => {
    it('should create broker with default configuration', () => {
        const broker = createDeepContext7Broker();
        expect(broker).toBeInstanceOf(DeepContext7Broker);
    });
    it('should create broker with custom configuration', () => {
        const config = {
            maxContextLength: 5000,
            relevanceThreshold: 0.5,
            compressionEnabled: false,
            adaptiveInjection: false,
        };
        const broker = createDeepContext7Broker(config);
        expect(broker).toBeInstanceOf(DeepContext7Broker);
    });
    it('should validate configuration schema', () => {
        expect(() => createDeepContext7Broker({
            maxContextLength: -100, // Invalid
        })).toThrow();
    });
});
describe('Context Entry Schema Validation', () => {
    it('should validate required fields', () => {
        const entry = {
            id: 'test_001',
            sessionId: 'session_001',
            toolName: 'smart_begin',
            contextType: 'user_query',
            content: 'Test context content',
            relevanceScore: 0.8,
            timestamp: new Date(),
        };
        expect(() => ContextEntrySchema.parse(entry)).not.toThrow();
    });
    it('should validate optional fields with defaults', () => {
        const minimalEntry = {
            id: 'test_002',
            sessionId: 'session_002',
            toolName: 'smart_write',
            contextType: 'tool_output',
            content: 'Minimal context',
            relevanceScore: 0.6,
            timestamp: new Date(),
        };
        const parsed = ContextEntrySchema.parse(minimalEntry);
        expect(parsed.persistenceLevel).toBe('session');
        expect(parsed.relationships).toBeUndefined();
    });
    it('should validate contextType enum', () => {
        const invalidEntry = {
            id: 'test_003',
            sessionId: 'session_003',
            toolName: 'smart_plan',
            contextType: 'invalid_type',
            content: 'Test content',
            relevanceScore: 0.5,
            timestamp: new Date(),
        };
        expect(() => ContextEntrySchema.parse(invalidEntry)).toThrow();
    });
    it('should validate relevanceScore range', () => {
        const invalidEntry = {
            id: 'test_004',
            sessionId: 'session_004',
            toolName: 'smart_finish',
            contextType: 'user_query',
            content: 'Test content',
            relevanceScore: 1.5, // Invalid - should be 0-1
            timestamp: new Date(),
        };
        expect(() => ContextEntrySchema.parse(invalidEntry)).toThrow();
    });
});
//# sourceMappingURL=DeepContext7Broker.test.js.map