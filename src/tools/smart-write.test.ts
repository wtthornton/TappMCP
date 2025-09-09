#!/usr/bin/env node

import { describe, it, expect } from 'vitest';
import { handleSmartWrite, smartWriteTool } from './smart-write';
import type { SmartWriteResponse } from '../types/tool-responses';

describe('SmartWrite - REAL TESTS (Expose Code Generation Theater)', () => {
  describe('tool definition', () => {
    it('should have correct name and description', () => {
      expect(smartWriteTool.name).toBe('smart_write');
      expect(smartWriteTool.description).toContain('Generate code with role-based expertise');
    });

    it('should have proper input schema', () => {
      expect(smartWriteTool.inputSchema).toBeDefined();
      expect(smartWriteTool.inputSchema.type).toBe('object');
      expect(smartWriteTool.inputSchema.properties).toBeDefined();
    });
  });

  describe('EXPOSE CODE GENERATION TEMPLATES - Not Real Intelligence', () => {
    it('should return IDENTICAL quality metrics for ALL projects regardless of complexity', async () => {
      const simpleInput = {
        projectId: 'proj_simple',
        featureDescription: 'create hello world function',
        codeType: 'function',
        qualityRequirements: { testCoverage: 50, complexity: 1, securityLevel: 'low' },
      };

      const complexInput = {
        projectId: 'proj_complex',
        featureDescription:
          'create distributed microservices authentication system with OAuth2, JWT tokens, rate limiting, audit logging, and multi-factor authentication',
        codeType: 'api',
        qualityRequirements: { testCoverage: 99, complexity: 10, securityLevel: 'high' },
        businessContext: { priority: 'high' },
      };

      const simpleResult = (await handleSmartWrite(simpleInput)) as SmartWriteResponse;
      const complexResult = (await handleSmartWrite(complexInput)) as SmartWriteResponse;

      // EXPOSE THE TRUTH: Same hardcoded metrics regardless of complexity
      expect(simpleResult.data?.qualityMetrics.testCoverage).toBe(
        complexResult.data?.qualityMetrics.testCoverage
      ); // Both 80
      expect(simpleResult.data?.qualityMetrics.complexity).toBe(
        complexResult.data?.qualityMetrics.complexity
      ); // Both 4
      expect(simpleResult.data?.qualityMetrics.securityScore).toBe(
        complexResult.data?.qualityMetrics.securityScore
      ); // Both 75
      expect(simpleResult.data?.qualityMetrics.maintainability).toBe(
        complexResult.data?.qualityMetrics.maintainability
      ); // Both 85

      // User requirements completely ignored
      expect(simpleResult.data?.qualityMetrics.testCoverage).toBe(80); // Not 50 as requested
      expect(complexResult.data?.qualityMetrics.testCoverage).toBe(80); // Not 99 as requested

      console.log('EXPOSED: Hello world and complex microservices get identical quality metrics');
    });

    it('should return HARDCODED business values regardless of actual business impact', async () => {
      const lowValueInput = {
        projectId: 'proj_low_value',
        featureDescription: 'fix typo in comment',
        businessContext: { priority: 'low' },
      };

      const highValueInput = {
        projectId: 'proj_high_value',
        featureDescription: 'implement automated fraud detection system saving millions in losses',
        businessContext: {
          priority: 'high',
          goals: ['prevent fraud', 'save money', 'protect users'],
        },
      };

      const lowResult = (await handleSmartWrite(lowValueInput)) as SmartWriteResponse;
      const highResult = (await handleSmartWrite(highValueInput)) as SmartWriteResponse;

      // EXPOSE THE TRUTH: Business value is hardcoded, not calculated
      expect(lowResult.data?.businessValue.timeSaved).toBe(
        highResult.data?.businessValue.timeSaved
      ); // Both 2.0
      expect(lowResult.data?.businessValue.qualityImprovement).toBe(
        highResult.data?.businessValue.qualityImprovement
      ); // Both 75
      expect(lowResult.data?.businessValue.costPrevention).toBe(
        highResult.data?.businessValue.costPrevention
      ); // Both 4000

      // Typo fix = fraud prevention system in terms of "value"
      expect(lowResult.data?.businessValue.costPrevention).toBe(4000);
      expect(highResult.data?.businessValue.costPrevention).toBe(4000);

      console.log(
        `EXPOSED: Typo fix and fraud detection both claim $${lowResult.data?.businessValue.costPrevention} cost prevention`
      );
    });

    it('should generate ROLE-BASED TEMPLATES, not intelligent code analysis', async () => {
      const roles = [
        'developer',
        'product-strategist',
        'designer',
        'qa-engineer',
        'operations-engineer',
      ];
      const results = [];

      for (const role of roles) {
        const input = {
          projectId: `proj_${role}`,
          featureDescription: 'process user authentication',
          targetRole: role as any,
          codeType: 'function',
        };

        const result = (await handleSmartWrite(input)) as SmartWriteResponse;
        results.push({ role, result });
      }

      // EXPOSE: Role-specific code is just template insertion based on role keywords
      const devResult = results.find(r => r.role === 'developer')?.result;
      const strategistResult = results.find(r => r.role === 'product-strategist')?.result;
      const designerResult = results.find(r => r.role === 'designer')?.result;

      // Check specific role template markers
      expect(devResult?.data?.generatedCode.files[0].content).toContain(
        'Developer Role Implementation'
      );
      expect(strategistResult?.data?.generatedCode.files[0].content).toContain(
        'Product Strategist Role Implementation'
      );
      expect(designerResult?.data?.generatedCode.files[0].content).toContain(
        'Designer Role Implementation'
      );

      // All get same hardcoded business value regardless of role perspective
      expect(devResult?.data?.businessValue.timeSaved).toBe(2.0);
      expect(strategistResult?.data?.businessValue.timeSaved).toBe(2.0);
      expect(designerResult?.data?.businessValue.timeSaved).toBe(2.0);

      console.log('EXPOSED: Role customization is template insertion + role keyword matching');
    });

    it('should generate IDENTICAL code structure for DIFFERENT feature descriptions', async () => {
      const features = [
        'create payment processing system',
        'build user authentication',
        'implement data validation',
        'develop API endpoints',
        'setup monitoring dashboard',
      ];

      const results = [];
      for (const feature of features) {
        const input = {
          projectId: `proj_${feature.replace(/\s+/g, '_')}`,
          featureDescription: feature,
          targetRole: 'developer',
          codeType: 'function',
        };

        const result = (await handleSmartWrite(input)) as SmartWriteResponse;
        results.push({ feature, result });
      }

      // EXPOSE: All features get same basic function template structure
      for (let i = 1; i < results.length; i++) {
        const prev = results[i - 1].result;
        const curr = results[i].result;

        // Same hardcoded technical metrics
        expect(curr.data?.technicalMetrics.linesGenerated).toBe(
          prev.data?.technicalMetrics.linesGenerated
        ); // Always 50

        // Same file structure (just function name changes)
        expect(curr.data?.generatedCode.files.length).toBe(prev.data?.generatedCode.files.length); // Same count

        // Same business value for all features
        expect(curr.data?.businessValue).toEqual(prev.data?.businessValue);
      }

      console.log(
        'EXPOSED: Payment processing, authentication, validation, etc. all get identical templates'
      );
    });

    it('should have HARDCODED technical metrics, not real code analysis', async () => {
      const codeTypes = ['function', 'api', 'test', 'config', 'documentation'];
      const results = [];

      for (const codeType of codeTypes) {
        const input = {
          projectId: `proj_${codeType}`,
          featureDescription: `create ${codeType} for data processing`,
          codeType: codeType as any,
        };

        const result = (await handleSmartWrite(input)) as SmartWriteResponse;
        results.push({ codeType, result });
      }

      // EXPOSE: All code types get same hardcoded technical metrics
      results.forEach(({ codeType, result }) => {
        expect(result.data?.technicalMetrics.linesGenerated).toBe(50); // Hardcoded
        expect(result.data?.technicalMetrics.generationTime).toBeGreaterThan(0);
        expect(result.data?.technicalMetrics.filesCreated).toBeGreaterThan(0);

        // Files created is just template count, not intelligent analysis
        if (codeType === 'function') {
          expect(result.data?.technicalMetrics.filesCreated).toBe(2); // .ts + .test.ts
        }
      });

      console.log('EXPOSED: Lines generated is hardcoded to 50 for all code types');
    });

    it('should be DETERMINISTIC - same input produces identical output', async () => {
      const input = {
        projectId: 'proj_consistency_test',
        featureDescription: 'create data validation service',
        targetRole: 'developer',
        codeType: 'function',
        techStack: ['typescript'],
      };

      // Run the same input 5 times
      const results = [];
      for (let i = 0; i < 5; i++) {
        const result = (await handleSmartWrite(input)) as SmartWriteResponse;
        results.push(result);
      }

      // All results should be identical (except timestamps and IDs)
      for (let i = 1; i < results.length; i++) {
        expect(results[i].data?.qualityMetrics).toEqual(results[0].data?.qualityMetrics);
        expect(results[i].data?.businessValue).toEqual(results[0].data?.businessValue);
        expect(results[i].data?.generatedCode.files[0].content).toEqual(
          results[0].data?.generatedCode.files[0].content
        );
        expect(results[i].data?.technicalMetrics.linesGenerated).toBe(
          results[0].data?.technicalMetrics.linesGenerated
        );
      }

      console.log(
        'EXPOSED: SmartWrite is deterministic template generator, not AI code generation'
      );
    });

    it('should ignore COMPLEX tech stack and return generic templates', async () => {
      const noTechStackInput = {
        projectId: 'proj_no_tech',
        featureDescription: 'create API endpoint',
        techStack: [],
      };

      const complexTechStackInput = {
        projectId: 'proj_complex_tech',
        featureDescription: 'create API endpoint',
        techStack: [
          'typescript',
          'nestjs',
          'graphql',
          'postgresql',
          'redis',
          'docker',
          'kubernetes',
          'prometheus',
          'grafana',
          'elasticsearch',
          'kafka',
        ],
      };

      const noTechResult = (await handleSmartWrite(noTechStackInput)) as SmartWriteResponse;
      const complexTechResult = (await handleSmartWrite(
        complexTechStackInput
      )) as SmartWriteResponse;

      // EXPOSE THE TRUTH: Tech stack is ignored - same generic template
      expect(noTechResult.data?.generatedCode.files[0].content).toEqual(
        complexTechResult.data?.generatedCode.files[0].content
      );
      expect(noTechResult.data?.qualityMetrics).toEqual(complexTechResult.data?.qualityMetrics);
      expect(noTechResult.data?.businessValue).toEqual(complexTechResult.data?.businessValue);

      // No NestJS, GraphQL, or Kubernetes-specific code generated
      const generatedCode = complexTechResult.data?.generatedCode.files[0].content || '';
      expect(generatedCode.toLowerCase()).not.toContain('nestjs');
      expect(generatedCode.toLowerCase()).not.toContain('graphql');
      expect(generatedCode.toLowerCase()).not.toContain('kubernetes');

      console.log('EXPOSED: Complex tech stack ignored - same generic TypeScript template');
    });
  });

  describe('PERFORMANCE ANALYSIS - Template Generation Speed', () => {
    it('should complete in <5ms because its just template string replacement', async () => {
      const complexInput = {
        projectId: 'proj_performance_test',
        featureDescription:
          'create comprehensive microservices architecture with authentication, authorization, rate limiting, caching, monitoring, logging, error handling, data validation, API versioning, and load balancing',
        targetRole: 'developer',
        codeType: 'api',
        techStack: ['typescript', 'nestjs', 'postgresql', 'redis', 'docker', 'kubernetes'],
        qualityRequirements: { testCoverage: 95, complexity: 8, securityLevel: 'high' },
      };

      const startTime = performance.now();
      const result = (await handleSmartWrite(complexInput)) as SmartWriteResponse;
      const duration = performance.now() - startTime;

      expect(result.success).toBe(true);

      // Should be extremely fast because it's just template generation
      expect(duration).toBeLessThan(5); // <5ms indicates no real code analysis

      // Response time in result should match actual duration
      expect(Math.abs(result.data?.technicalMetrics.responseTime! - duration)).toBeLessThan(10);

      console.log(
        `EXPOSED: "Smart" code generation completed in ${duration.toFixed(2)}ms - too fast for real analysis`
      );
    });

    it('should have consistent performance regardless of code complexity', async () => {
      const simpleInput = {
        projectId: 'simple',
        featureDescription: 'return hello',
        codeType: 'function',
      };

      const complexInput = {
        projectId: 'complex',
        featureDescription:
          'implement distributed consensus algorithm with Byzantine fault tolerance, leader election, log replication, and dynamic membership changes',
        codeType: 'api',
        techStack: ['typescript', 'raft', 'grpc', 'protobuf', 'etcd'],
        qualityRequirements: { testCoverage: 99, complexity: 10, securityLevel: 'high' },
      };

      const simpleTimes = [];
      const complexTimes = [];

      // Test multiple times for consistency
      for (let i = 0; i < 3; i++) {
        const simpleStart = performance.now();
        await handleSmartWrite(simpleInput);
        simpleTimes.push(performance.now() - simpleStart);

        const complexStart = performance.now();
        await handleSmartWrite(complexInput);
        complexTimes.push(performance.now() - complexStart);
      }

      const avgSimple = simpleTimes.reduce((sum, time) => sum + time, 0) / simpleTimes.length;
      const avgComplex = complexTimes.reduce((sum, time) => sum + time, 0) / complexTimes.length;

      // Should have similar performance (no real code generation complexity)
      expect(Math.abs(avgSimple - avgComplex)).toBeLessThan(2); // Within 2ms

      console.log(
        `EXPOSED: Simple (${avgSimple.toFixed(2)}ms) vs Complex (${avgComplex.toFixed(2)}ms) - no code complexity scaling`
      );
    });
  });

  describe('TEMPLATE STRING ANALYSIS - Expose The Patterns', () => {
    it('should use function name derived from description in ALL generated code', async () => {
      const tests = [
        {
          description: 'create user authentication system',
          expectedFunctionName: 'createuserauthenticationsystem',
        },
        { description: 'process payment data', expectedFunctionName: 'processpaymentdata' },
        { description: 'validate API request', expectedFunctionName: 'validateAPIrequest' },
      ];

      for (const test of tests) {
        const input = {
          projectId: 'proj_function_name_test',
          featureDescription: test.description,
          targetRole: 'developer',
        };

        const result = (await handleSmartWrite(input)) as SmartWriteResponse;
        const generatedCode = result.data?.generatedCode.files[0].content || '';

        // EXPOSE: Function name is just description with spaces removed
        expect(generatedCode).toContain(`function ${test.expectedFunctionName}(`);
        expect(generatedCode).toContain(
          `${test.expectedFunctionName} - Developer Role Implementation`
        );
      }

      console.log("EXPOSED: Function names are just description.replace(/\\s+/g, '')");
    });

    it('should use same base template structure for all TypeScript code', async () => {
      const inputs = [
        { description: 'authentication service', role: 'developer' },
        { description: 'data processing', role: 'developer' },
        { description: 'API gateway', role: 'developer' },
      ];

      const results = [];
      for (const input of inputs) {
        const result = (await handleSmartWrite({
          projectId: 'proj_template_structure',
          featureDescription: input.description,
          targetRole: input.role,
        })) as SmartWriteResponse;
        results.push(result);
      }

      // EXPOSE: All use same TypeScript function template structure
      results.forEach(result => {
        const code = result.data?.generatedCode.files[0].content || '';
        expect(code).toContain('export function');
        expect(code).toContain('input: string');
        expect(code).toContain('result: string; success: boolean');
        expect(code).toContain('performance.now()'); // Developer role always adds metrics
        expect(code).toContain('Developer Role Implementation');
      });

      console.log('EXPOSED: All TypeScript code uses identical base template structure');
    });
  });

  describe('ERROR HANDLING - Basic Validation Only', () => {
    it('should handle errors gracefully', async () => {
      const input = {
        projectId: 'proj_error_test',
        featureDescription: '', // Invalid empty description
      };

      const result = (await handleSmartWrite(input)) as SmartWriteResponse;

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should validate input schema', async () => {
      const invalidInput = {
        invalidField: 'test',
      };

      const result = (await handleSmartWrite(invalidInput)) as SmartWriteResponse;

      expect(result.success).toBe(false);
      expect(result.error).toContain('Required');
    });
  });

  describe('INTEGRATION - Full SmartWrite Code Generation Theater', () => {
    it('should provide complete template-based code generation', async () => {
      const input = {
        projectId: 'proj_integration_test',
        featureDescription:
          'implement secure user registration with email verification and password hashing',
        targetRole: 'developer',
        codeType: 'api',
        techStack: ['typescript', 'bcrypt', 'nodemailer', 'jsonwebtoken'],
        businessContext: {
          goals: ['user security', 'email verification', 'compliance'],
          priority: 'high',
        },
        qualityRequirements: {
          testCoverage: 95,
          complexity: 3,
          securityLevel: 'high',
        },
      };

      const result = (await handleSmartWrite(input)) as SmartWriteResponse;

      expect(result.success).toBe(true);
      expect(result.data?.codeId).toContain('secure_user_registration');

      // Should have generated files (templates)
      expect(result.data?.generatedCode.files.length).toBeGreaterThan(0);
      expect(result.data?.generatedCode.files[0].path).toContain('secure_user_registration');
      expect(result.data?.generatedCode.files[0].content).toContain(
        'Developer Role Implementation'
      );

      // Quality metrics should be hardcoded (not based on actual requirements)
      expect(result.data?.qualityMetrics.testCoverage).toBe(80); // Not 95 as requested
      expect(result.data?.qualityMetrics.complexity).toBe(4); // Not 3 as requested
      expect(result.data?.qualityMetrics.securityScore).toBe(75); // Static value
      expect(result.data?.qualityMetrics.maintainability).toBe(85); // Static value

      // Business value should be hardcoded template values
      expect(result.data?.businessValue.timeSaved).toBe(2.0); // Always 2.0
      expect(result.data?.businessValue.qualityImprovement).toBe(75); // Always 75
      expect(result.data?.businessValue.costPrevention).toBe(4000); // Always 4000

      // Technical metrics should show template generation characteristics
      expect(result.data?.technicalMetrics.responseTime).toBeLessThan(10); // Fast template gen
      expect(result.data?.technicalMetrics.linesGenerated).toBe(50); // Hardcoded
      expect(result.data?.technicalMetrics.filesCreated).toBe(2); // .ts + .test.ts

      console.log('SmartWrite Summary:', {
        isIntelligent: false,
        isTemplateGenerator: true,
        qualityMetricsFormula: 'hardcoded: coverage=80, complexity=4, security=75',
        businessValueFormula: 'hardcoded: time=2.0, quality=75, cost=4000',
        linesGenerated: 50, // always 50
        processingTime: result.data?.technicalMetrics.responseTime,
        verdict:
          'Most sophisticated template system yet - generates actual code, but zero intelligence',
      });
    });
  });
});
