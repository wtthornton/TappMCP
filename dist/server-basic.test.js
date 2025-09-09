#!/usr/bin/env node
import { describe, it, expect } from 'vitest';
import { SmartMCPServer } from './server.js';
describe('SmartMCP Server Basic Tests', () => {
    it('should create a server instance successfully', () => {
        const server = new SmartMCPServer();
        expect(server).toBeDefined();
        console.log('✅ SmartMCP Server instance created successfully');
    });
    it('should start server without throwing errors', async () => {
        // Since we can't easily test stdio connection in unit tests,
        // let's just verify the server can be instantiated and the tools are registered
        const server = new SmartMCPServer();
        expect(server).toBeDefined();
        // The server auto-starts when created, so we just verify it exists
        console.log('✅ SmartMCP Server created and ready for stdio connection');
    });
});
describe('MCP Protocol Simulation', () => {
    it('should handle smart tool calls directly', async () => {
        // Import and test tools directly to simulate MCP calls
        const { handleSmartBegin } = await import('./tools/smart-begin.js');
        const result = await handleSmartBegin({
            projectName: 'MCP Direct Test',
            techStack: ['TypeScript'],
            targetUsers: ['developers'],
        });
        expect(result.success).toBe(true);
        expect(result.data.projectId).toBeDefined();
        console.log(`✅ smart_begin direct call successful, projectId: ${result.data.projectId}`);
    });
    it('should chain smart tool calls with context', async () => {
        // Test the workflow: smart_begin → smart_plan → smart_write → smart_finish
        const { handleSmartBegin } = await import('./tools/smart-begin.js');
        const { handleSmartPlan } = await import('./tools/smart-plan.js');
        const { handleSmartWrite } = await import('./tools/smart-write.js');
        const { handleSmartFinish } = await import('./tools/smart-finish.js');
        // 1. smart_begin
        const beginResult = await handleSmartBegin({
            projectName: 'MCP Chain Test',
            techStack: ['TypeScript', 'Node.js'],
            targetUsers: ['developers'],
        });
        expect(beginResult.success).toBe(true);
        const projectId = beginResult.data.projectId;
        console.log(`✅ Step 1 - smart_begin: ${projectId}`);
        // 2. smart_plan
        const planResult = await handleSmartPlan({
            projectId: projectId,
            planType: 'development',
            scope: {
                techStack: ['TypeScript', 'Node.js'],
                timeline: { duration: 4, unit: 'weeks' },
            },
        });
        if (!planResult.success) {
            console.log('❌ smart_plan failed:', planResult.error);
            console.log('Full response:', JSON.stringify(planResult, null, 2));
        }
        expect(planResult.success).toBe(true);
        expect(planResult.data.projectId).toBe(projectId);
        console.log(`✅ Step 2 - smart_plan: ${planResult.data.projectPlan.phases.length} phases planned`);
        // 3. smart_write
        const writeResult = await handleSmartWrite({
            projectId: projectId,
            featureDescription: 'Create a TypeScript utility function',
            requirements: {
                language: 'TypeScript',
                framework: 'none',
            },
        });
        if (!writeResult.success) {
            console.log('❌ smart_write failed:', writeResult.error);
            console.log('Full response:', JSON.stringify(writeResult, null, 2));
        }
        expect(writeResult.success).toBe(true);
        console.log('smart_write response projectId:', writeResult.data.projectId);
        console.log('Expected projectId:', projectId);
        expect(writeResult.data.projectId).toBe(projectId);
        const codeId = writeResult.data.codeId;
        console.log(`✅ Step 3 - smart_write: ${codeId}`);
        // 4. smart_finish
        const finishResult = await handleSmartFinish({
            projectId: projectId,
            codeIds: [codeId],
        });
        expect(finishResult.success).toBe(true);
        expect(finishResult.data.projectId).toBe(projectId);
        console.log(`✅ Step 4 - smart_finish: ${finishResult.data.qualityScorecard.overall.score}% quality`);
        console.log(`✅ Complete workflow chain successful with shared projectId: ${projectId}`);
    });
    it('should handle smart_orchestrate workflow', async () => {
        const { handleSmartOrchestrate } = await import('./tools/smart-orchestrate.js');
        const result = await handleSmartOrchestrate({
            request: 'Build a simple web API with authentication',
            options: {
                businessContext: {
                    projectId: 'mcp_orchestrate_test',
                    businessGoals: ['Secure API', 'User authentication'],
                    requirements: ['REST endpoints', 'JWT auth'],
                },
            },
        });
        if (!result.success) {
            console.log('❌ smart_orchestrate failed:', result.error);
            console.log('Full response:', JSON.stringify(result, null, 2));
        }
        expect(result.success).toBe(true);
        expect(result.orchestrationId).toBeDefined();
        expect(result.workflow).toBeDefined();
        console.log(`✅ smart_orchestrate successful: ${result.orchestrationId}`);
        console.log(`  Workflow phases: ${result.workflow?.phases.length}`);
        console.log(`  Business alignment: ${result.technicalMetrics?.businessAlignmentScore}%`);
    });
});
//# sourceMappingURL=server-basic.test.js.map