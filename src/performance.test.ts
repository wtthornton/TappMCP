#!/usr/bin/env node

import { describe, it, expect } from 'vitest';

// Import all smart tools for performance testing
import { handleSmartBegin } from './tools/smart-begin.js';
import { handleSmartPlan } from './tools/smart-plan.js';
import { handleSmartWrite } from './tools/smart-write.js';
import { handleSmartFinish } from './tools/smart-finish.js';
import { handleSmartOrchestrate } from './tools/smart-orchestrate.js';

describe('Day 4: Performance & Load Testing', () => {
  describe('Response Time Requirements (<100ms for simple calls)', () => {
    it('smart_begin should respond within 100ms', async () => {
      const startTime = Date.now();

      const result = await handleSmartBegin({
        projectName: 'Performance Test Project',
        techStack: ['TypeScript'],
        targetUsers: ['developers'],
      });

      const responseTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(responseTime).toBeLessThan(100);

      console.log(`✅ smart_begin: ${responseTime}ms (target: <100ms)`);
    });

    it('smart_plan should respond within 100ms', async () => {
      const startTime = Date.now();

      const result = await handleSmartPlan({
        projectId: 'perf_test_plan',
        planType: 'development',
        scope: {
          techStack: ['TypeScript'],
          timeline: { duration: 2, unit: 'weeks' },
        },
      });

      const responseTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(responseTime).toBeLessThan(100);

      console.log(`✅ smart_plan: ${responseTime}ms (target: <100ms)`);
    });

    it('smart_write should respond within 100ms', async () => {
      const startTime = Date.now();

      const result = await handleSmartWrite({
        projectId: 'perf_test_write',
        featureDescription: 'Simple utility function',
        requirements: {
          language: 'TypeScript',
          framework: 'none',
        },
      });

      const responseTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(responseTime).toBeLessThan(100);

      console.log(`✅ smart_write: ${responseTime}ms (target: <100ms)`);
    });

    it('smart_finish should respond within 100ms', async () => {
      const startTime = Date.now();

      const result = await handleSmartFinish({
        projectId: 'perf_test_finish',
        codeIds: ['test_code_123'],
      });

      const responseTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(responseTime).toBeLessThan(100);

      console.log(`✅ smart_finish: ${responseTime}ms (target: <100ms)`);
    });

    // Note: smart_orchestrate is expected to take longer due to external services
    it('smart_orchestrate should respond within reasonable time (allow up to 2s for external services)', async () => {
      const startTime = Date.now();

      const result = await handleSmartOrchestrate({
        request: 'Simple performance test workflow',
        options: {
          businessContext: {
            projectId: 'perf_test_orchestrate',
            businessGoals: ['Fast execution'],
            requirements: ['Performance testing'],
          },
        },
      });

      const responseTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(responseTime).toBeLessThan(2000); // Allow 2s for external service calls

      console.log(
        `✅ smart_orchestrate: ${responseTime}ms (target: <2000ms, includes external services)`
      );
    });
  });

  describe('Load Testing - Concurrent Requests', () => {
    it('should handle 5 concurrent smart_begin calls', async () => {
      const concurrentCalls = 5;
      const startTime = Date.now();

      const promises = Array.from({ length: concurrentCalls }, (_, i) =>
        handleSmartBegin({
          projectName: `Concurrent Test ${i + 1}`,
          techStack: ['TypeScript'],
          targetUsers: ['developers'],
        })
      );

      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      const avgTime = totalTime / concurrentCalls;

      // All should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // Average time should still be reasonable
      expect(avgTime).toBeLessThan(200); // Allow higher average for concurrent load

      console.log(
        `✅ Concurrent smart_begin (${concurrentCalls} calls): ${totalTime}ms total, ${avgTime.toFixed(1)}ms average`
      );
    });

    it('should handle 3 concurrent smart_plan calls', async () => {
      const concurrentCalls = 3;
      const startTime = Date.now();

      const promises = Array.from({ length: concurrentCalls }, (_, i) =>
        handleSmartPlan({
          projectId: `concurrent_plan_${i + 1}`,
          planType: 'development',
          scope: {
            techStack: ['TypeScript'],
            timeline: { duration: 2, unit: 'weeks' },
          },
        })
      );

      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      const avgTime = totalTime / concurrentCalls;

      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      expect(avgTime).toBeLessThan(150);

      console.log(
        `✅ Concurrent smart_plan (${concurrentCalls} calls): ${totalTime}ms total, ${avgTime.toFixed(1)}ms average`
      );
    });
  });

  describe('Memory Usage Monitoring', () => {
    it('should not cause memory leaks during multiple tool calls', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Execute multiple tool calls to check for memory leaks
      for (let i = 0; i < 10; i++) {
        await handleSmartBegin({
          projectName: `Memory Test ${i}`,
          techStack: ['TypeScript'],
          targetUsers: ['developers'],
        });

        await handleSmartPlan({
          projectId: `memory_test_${i}`,
          planType: 'development',
          scope: {
            techStack: ['TypeScript'],
            timeline: { duration: 1, unit: 'week' },
          },
        });
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreaseMB = memoryIncrease / (1024 * 1024);

      // Memory increase should be reasonable (less than 50MB for 20 tool calls)
      expect(memoryIncreaseMB).toBeLessThan(50);

      console.log(`✅ Memory usage: ${memoryIncreaseMB.toFixed(2)}MB increase after 20 tool calls`);
      console.log(`   Initial: ${(initialMemory / (1024 * 1024)).toFixed(2)}MB`);
      console.log(`   Final: ${(finalMemory / (1024 * 1024)).toFixed(2)}MB`);
    });
  });

  describe('Error Recovery Testing', () => {
    it('should handle invalid input gracefully without performance degradation', async () => {
      const validCallTime = await timeAsyncCall(async () => {
        return await handleSmartBegin({
          projectName: 'Valid Project',
          techStack: ['TypeScript'],
          targetUsers: ['developers'],
        });
      });

      const invalidCallTime = await timeAsyncCall(async () => {
        return await handleSmartBegin({
          // Missing required projectName
          techStack: ['TypeScript'],
          targetUsers: ['developers'],
        } as any);
      });

      // Invalid calls should not take significantly longer than valid calls
      // Allow for the fact that both might be very fast (0-1ms)
      expect(invalidCallTime).toBeLessThan(Math.max(validCallTime * 2, 10));

      console.log(
        `✅ Error handling performance: valid=${validCallTime}ms, invalid=${invalidCallTime}ms`
      );
    });
  });

  describe('Full Workflow Performance', () => {
    it('should complete full workflow chain within reasonable time', async () => {
      const startTime = Date.now();

      // 1. smart_begin
      const beginResult = await handleSmartBegin({
        projectName: 'Full Workflow Perf Test',
        techStack: ['TypeScript', 'Node.js'],
        targetUsers: ['developers'],
      });

      const beginTime = Date.now();
      expect(beginResult.success).toBe(true);

      // 2. smart_plan
      const planResult = await handleSmartPlan({
        projectId: (beginResult.data as any).projectId,
        planType: 'development',
        scope: {
          techStack: ['TypeScript', 'Node.js'],
          timeline: { duration: 3, unit: 'weeks' },
        },
      });

      const planTime = Date.now();
      expect(planResult.success).toBe(true);

      // 3. smart_write
      const writeResult = await handleSmartWrite({
        projectId: (beginResult.data as any).projectId,
        featureDescription: 'Core application functionality',
        requirements: {
          language: 'TypeScript',
          framework: 'Node.js',
        },
      });

      const writeTime = Date.now();
      expect(writeResult.success).toBe(true);

      // 4. smart_finish
      const finishResult = await handleSmartFinish({
        projectId: (beginResult.data as any).projectId,
        codeIds: [(writeResult.data as any).codeId],
      });

      const finishTime = Date.now();
      expect(finishResult.success).toBe(true);

      const totalTime = finishTime - startTime;

      // Full workflow should complete in under 1 second (excluding orchestrate)
      expect(totalTime).toBeLessThan(1000);

      console.log(`✅ Full workflow performance:`);
      console.log(`   smart_begin: ${beginTime - startTime}ms`);
      console.log(`   smart_plan: ${planTime - beginTime}ms`);
      console.log(`   smart_write: ${writeTime - planTime}ms`);
      console.log(`   smart_finish: ${finishTime - writeTime}ms`);
      console.log(`   TOTAL: ${totalTime}ms (target: <1000ms)`);
    });
  });
});

// Helper function to time async calls
async function timeAsyncCall<T>(fn: () => Promise<T>): Promise<number> {
  const start = Date.now();
  await fn();
  return Date.now() - start;
}
