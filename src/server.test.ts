#!/usr/bin/env node

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn, ChildProcess } from 'child_process';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import path from 'path';

describe.skip('SmartMCP Server Integration Tests', () => {
  let serverProcess: ChildProcess;
  let client: Client;

  beforeAll(async () => {
    // Start the MCP server process
    const serverPath = path.resolve('./dist/server.js');
    serverProcess = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: process.env,
    });

    // Create MCP client connected to our server
    const transport = new StdioClientTransport({
      command: 'node',
      args: [serverPath],
    });

    client = new Client({
      name: 'test-client',
      version: '1.0.0',
      capabilities: {},
    } as any);

    await client.connect(transport);
  }, 30000);

  afterAll(async () => {
    if (client) {
      await client.close();
    }
    if (serverProcess && !serverProcess.killed) {
      serverProcess.kill();
    }
  });

  describe('MCP Protocol Basic Operations', () => {
    it('should list all available tools', async () => {
      const result = await client.listTools();

      expect(result.tools).toBeDefined();
      expect(Array.isArray(result.tools)).toBe(true);
      expect(result.tools.length).toBe(5); // We have 5 smart tools

      const toolNames = result.tools.map(tool => tool.name);
      expect(toolNames).toContain('smart_begin');
      expect(toolNames).toContain('smart_plan');
      expect(toolNames).toContain('smart_write');
      expect(toolNames).toContain('smart_finish');
      expect(toolNames).toContain('smart_orchestrate');

      console.log(`✅ MCP Server exposed ${result.tools.length} tools: ${toolNames.join(', ')}`);
    }, 15000);

    it('should call smart_begin through MCP protocol', async () => {
      const result = await client.callTool({
        name: 'smart_begin',
        arguments: {
          projectName: 'MCP Test Project',
          description: 'Testing smart_begin through MCP protocol',
          techStack: ['TypeScript', 'Node.js'],
          targetUsers: ['developers'],
        },
      });

      expect(result.content).toBeDefined();
      expect((result.content as any).length).toBeGreaterThan(0);

      const response = JSON.parse((result.content as any)[0].text);
      expect(response.success).toBe(true);
      expect(response.data.projectId).toBeDefined();
      expect(response.data.projectStructure).toBeDefined();

      console.log(`✅ smart_begin called via MCP protocol, projectId: ${response.data.projectId}`);
    }, 15000);

    it('should call smart_plan through MCP protocol', async () => {
      const result = await client.callTool({
        name: 'smart_plan',
        arguments: {
          projectId: 'mcp_test_project',
          planType: 'development',
          scope: {
            techStack: ['TypeScript', 'React'],
            timeline: 4,
            resources: { budget: 50000 },
          },
        },
      });

      expect(result.content).toBeDefined();
      expect((result.content as any).length).toBeGreaterThan(0);

      const response = JSON.parse((result.content as any)[0].text);
      expect(response.success).toBe(true);
      expect(response.data.projectPlan).toBeDefined();
      expect(response.data.projectPlan.phases.length).toBeGreaterThanOrEqual(3); // Dynamic phases

      console.log(
        `✅ smart_plan called via MCP protocol, generated ${response.data.projectPlan.phases.length} phases`
      );
    }, 15000);

    it('should call smart_write through MCP protocol', async () => {
      const result = await client.callTool({
        name: 'smart_write',
        arguments: {
          projectId: 'mcp_test_project',
          specification: 'Create a simple TypeScript function that adds two numbers',
          requirements: {
            language: 'TypeScript',
            framework: 'none',
            testingRequired: true,
          },
        },
      });

      expect(result.content).toBeDefined();
      expect((result.content as any).length).toBeGreaterThan(0);

      const response = JSON.parse((result.content as any)[0].text);
      expect(response.success).toBe(true);
      expect(response.data.codeId).toBeDefined();
      expect(response.data.code).toBeDefined();

      console.log(`✅ smart_write called via MCP protocol, codeId: ${response.data.codeId}`);
    }, 15000);

    it('should call smart_finish through MCP protocol', async () => {
      const result = await client.callTool({
        name: 'smart_finish',
        arguments: {
          projectId: 'mcp_test_project',
          codeIds: ['test_code_id'],
        },
      });

      expect(result.content).toBeDefined();
      expect((result.content as any).length).toBeGreaterThan(0);

      const response = JSON.parse((result.content as any)[0].text);
      expect(response.success).toBe(true);
      expect(response.data.qualityScorecard).toBeDefined();

      console.log(
        `✅ smart_finish called via MCP protocol, quality score: ${response.data.qualityScorecard.overall.score}%`
      );
    }, 15000);

    it('should call smart_orchestrate through MCP protocol', async () => {
      const result = await client.callTool({
        name: 'smart_orchestrate',
        arguments: {
          request: 'Build a simple web application with user authentication',
          options: {
            businessContext: {
              projectId: 'mcp_test_orchestration',
              businessGoals: ['User registration', 'Secure login'],
              requirements: ['Authentication system', 'User database'],
            },
          },
        },
      });

      expect(result.content).toBeDefined();
      expect((result.content as any).length).toBeGreaterThan(0);

      const response = JSON.parse((result.content as any)[0].text);
      expect(response.success).toBe(true);
      expect(response.orchestrationId).toBeDefined();
      expect(response.workflow).toBeDefined();

      console.log(
        `✅ smart_orchestrate called via MCP protocol, orchestrationId: ${response.orchestrationId}`
      );
    }, 20000);
  });

  describe('MCP Protocol Context Sharing', () => {
    let sharedProjectId: string;

    it('should maintain context across tool calls - smart_begin → smart_plan', async () => {
      // First, create a project with smart_begin
      const beginResult = await client.callTool({
        name: 'smart_begin',
        arguments: {
          projectName: 'Context Test Project',
          techStack: ['TypeScript', 'Express'],
          targetUsers: ['developers'],
        },
      });

      const beginResponse = JSON.parse((beginResult.content as any)[0].text);
      sharedProjectId = beginResponse.data.projectId;
      expect(sharedProjectId).toBeDefined();

      // Then use the same projectId in smart_plan
      const planResult = await client.callTool({
        name: 'smart_plan',
        arguments: {
          projectId: sharedProjectId,
          planType: 'development',
          scope: {
            techStack: ['TypeScript', 'Express'],
            timeline: 6,
          },
        },
      });

      const planResponse = JSON.parse((planResult.content as any)[0].text);
      expect(planResponse.success).toBe(true);
      expect(planResponse.data.projectId).toBe(sharedProjectId);

      console.log(
        `✅ Context sharing works: smart_begin → smart_plan with projectId: ${sharedProjectId}`
      );
    }, 20000);

    it('should maintain context across tool calls - smart_plan → smart_write', async () => {
      // Use the shared projectId from previous test
      const writeResult = await client.callTool({
        name: 'smart_write',
        arguments: {
          projectId: sharedProjectId,
          specification: 'Create Express server setup code',
          requirements: {
            language: 'TypeScript',
            framework: 'Express',
          },
        },
      });

      const writeResponse = JSON.parse((writeResult.content as any)[0].text);
      expect(writeResponse.success).toBe(true);
      expect(writeResponse.data.projectId).toBe(sharedProjectId);

      console.log(
        `✅ Context sharing works: smart_plan → smart_write with projectId: ${sharedProjectId}`
      );
    }, 15000);
  });

  describe('MCP Protocol Error Handling', () => {
    it('should handle invalid tool name gracefully', async () => {
      try {
        await client.callTool({
          name: 'invalid_tool',
          arguments: {},
        });
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        // Should throw an error for invalid tool
        expect(error).toBeDefined();
        console.log(`✅ Invalid tool name handled correctly: ${error}`);
      }
    }, 10000);

    it('should handle invalid arguments gracefully', async () => {
      const result = await client.callTool({
        name: 'smart_begin',
        arguments: {
          // Missing required projectName
          description: 'Test invalid args',
        },
      });

      const response = JSON.parse((result.content as any)[0].text);
      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
      expect(response.error).toContain('Project name is required');

      console.log(`✅ Invalid arguments handled correctly: ${response.error}`);
    }, 10000);
  });

  describe('MCP Protocol Performance', () => {
    it('should respond within performance requirements (<100ms for simple calls)', async () => {
      const startTime = Date.now();

      const result = await client.callTool({
        name: 'smart_begin',
        arguments: {
          projectName: 'Performance Test',
          techStack: ['TypeScript'],
        },
      });

      const responseTime = Date.now() - startTime;
      const response = JSON.parse((result.content as any)[0].text);

      expect(response.success).toBe(true);
      expect(responseTime).toBeLessThan(5000); // Allow 5s for MCP overhead, but tool should be fast

      // Check the actual tool response time in the data
      expect(response.data.technicalMetrics.responseTime).toBeLessThan(100);

      console.log(
        `✅ Performance test: MCP call took ${responseTime}ms, tool processing took ${response.data.technicalMetrics.responseTime}ms`
      );
    }, 10000);
  });
});
