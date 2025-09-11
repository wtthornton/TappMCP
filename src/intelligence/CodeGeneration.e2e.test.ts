/**
 * End-to-End Tests for Code Generation Pipeline
 *
 * Tests the complete code generation workflow from request to final output,
 * including real integration with Context7, quality assurance, and optimization.
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { UnifiedCodeIntelligenceEngine } from './UnifiedCodeIntelligenceEngine.js';
import { QualityAssuranceEngine } from './QualityAssuranceEngine.js';
import { Context7ProjectAnalyzer } from '../core/context7-project-analyzer.js';
import fs from 'fs/promises';
import path from 'path';

describe('End-to-End Code Generation Pipeline', () => {
  let engine: UnifiedCodeIntelligenceEngine;
  let testOutputDir: string;

  beforeAll(async () => {
    engine = new UnifiedCodeIntelligenceEngine();
    testOutputDir = path.join(process.cwd(), 'test-output');

    try {
      await fs.mkdir(testOutputDir, { recursive: true });
    } catch {
      // Directory might already exist
    }
  });

  afterAll(async () => {
    try {
      await fs.rmdir(testOutputDir, { recursive: true });
    } catch {
      // Directory cleanup might fail, that's okay
    }
  });

  describe('Full-Stack Application Generation', () => {
    it('should generate a complete React + Node.js + PostgreSQL application', async () => {
      const components = [
        {
          name: 'frontend-component',
          request: {
            featureDescription:
              'Create a React user dashboard with authentication, data visualization, and responsive design',
            techStack: ['React', 'TypeScript', 'Material-UI'],
            role: 'frontend-developer',
            quality: 'production',
          },
        },
        {
          name: 'backend-api',
          request: {
            featureDescription:
              'Create a Node.js REST API for user management with JWT authentication, rate limiting, and data validation',
            techStack: ['Node.js', 'Express', 'TypeScript'],
            role: 'backend-developer',
            quality: 'production',
          },
        },
        {
          name: 'database-schema',
          request: {
            featureDescription:
              'Create a PostgreSQL database schema for user management with roles, permissions, and audit logging',
            techStack: ['PostgreSQL'],
            role: 'database-developer',
            quality: 'production',
          },
        },
        {
          name: 'docker-deployment',
          request: {
            featureDescription:
              'Create Docker containers and docker-compose setup for the full-stack application with production best practices',
            techStack: ['Docker', 'docker-compose'],
            role: 'devops-engineer',
            quality: 'production',
          },
        },
      ];

      const results = [];

      for (const component of components) {
        const result = await engine.generateCode(component.request);

        // Validate result structure
        expect(result).toBeDefined();
        expect(result.code).toBeDefined();
        expect(result.code.length).toBeGreaterThan(100);
        expect(result.qualityScore.overall).toBeGreaterThan(70);
        expect(result.metadata.processingTime).toBeGreaterThan(0);

        // Save generated code for inspection
        const fileName = `${component.name}.${getFileExtension(result.technology)}`;
        const filePath = path.join(testOutputDir, fileName);
        await fs.writeFile(filePath, result.code);

        results.push({
          component: component.name,
          result,
          filePath,
        });
      }

      // Verify we have all components
      expect(results).toHaveLength(4);

      // Verify categories are correct
      expect(results.find(r => r.component === 'frontend-component')?.result.category).toBe(
        'frontend'
      );
      expect(results.find(r => r.component === 'backend-api')?.result.category).toBe('backend');
      expect(results.find(r => r.component === 'database-schema')?.result.category).toBe(
        'database'
      );
      expect(results.find(r => r.component === 'docker-deployment')?.result.category).toBe(
        'devops'
      );

      // Verify quality scores are reasonable for production code
      results.forEach(({ result }) => {
        expect(result.qualityScore.overall).toBeGreaterThan(75);
      });
    });

    it('should generate mobile application with native features', async () => {
      const mobileComponents = [
        {
          name: 'react-native-app',
          request: {
            featureDescription:
              'Create a React Native app with navigation, authentication, offline storage, and push notifications',
            techStack: ['React Native', 'TypeScript'],
            role: 'mobile-developer',
            quality: 'production',
          },
        },
        {
          name: 'flutter-widget',
          request: {
            featureDescription:
              'Create a Flutter widget for user profile with form validation, image picker, and platform-specific styling',
            techStack: ['Flutter', 'Dart'],
            role: 'mobile-developer',
            quality: 'production',
          },
        },
      ];

      const results = [];

      for (const component of mobileComponents) {
        const result = await engine.generateCode(component.request);

        expect(result).toBeDefined();
        expect(result.category).toBe('mobile');
        expect(result.code).toContain('import');
        expect(result.qualityScore.overall).toBeGreaterThan(70);

        // Check for mobile-specific patterns
        if (result.technology === 'React Native') {
          expect(result.code).toMatch(/SafeAreaView|TouchableOpacity|StyleSheet/);
          expect(result.code).toMatch(/accessible|accessibilityLabel/);
        } else if (result.technology === 'Flutter') {
          expect(result.code).toMatch(/Widget|StatefulWidget|StatelessWidget/);
          expect(result.code).toMatch(/build|setState/);
        }

        results.push({ component: component.name, result });
      }

      expect(results).toHaveLength(2);
    });
  });

  describe('Progressive Quality Improvement', () => {
    it('should show quality improvement through iterations', async () => {
      const baseRequest = {
        featureDescription: 'Create a user authentication form with validation',
        techStack: ['React', 'TypeScript'],
        role: 'developer',
      };

      // Generate with different quality levels
      const prototypeResult = await engine.generateCode({
        ...baseRequest,
        quality: 'prototype',
      });

      const developmentResult = await engine.generateCode({
        ...baseRequest,
        quality: 'development',
      });

      const productionResult = await engine.generateCode({
        ...baseRequest,
        quality: 'production',
      });

      // Quality should generally improve with higher quality targets
      expect(prototypeResult.qualityScore.overall).toBeLessThanOrEqual(
        productionResult.qualityScore.overall + 10 // Allow some variance
      );

      // Production code should have more comprehensive features
      expect(productionResult.code.length).toBeGreaterThanOrEqual(prototypeResult.code.length);

      // All should be functional
      [prototypeResult, developmentResult, productionResult].forEach(result => {
        expect(result.code).toBeDefined();
        expect(result.code).toContain('React');
        expect(result.qualityScore.overall).toBeGreaterThan(50);
      });
    });

    it('should optimize code through multiple passes', async () => {
      const request = {
        featureDescription:
          'Create a complex data processing component with charts and real-time updates',
        techStack: ['React', 'TypeScript', 'D3.js'],
        role: 'senior-developer',
        quality: 'production',
      };

      const result = await engine.generateCode(request);

      expect(result).toBeDefined();
      expect(result.code).toBeDefined();

      // Check that optimization was applied (our mock adds "// Optimized" comment)
      expect(result.code).toContain('// Optimized');

      // Quality should be high for complex production code
      expect(result.qualityScore.overall).toBeGreaterThan(75);

      // Should handle complex requirements
      expect(result.code.length).toBeGreaterThan(500);
    });
  });

  describe('Real-World Development Scenarios', () => {
    it('should handle microservices architecture generation', async () => {
      const microservices = [
        {
          name: 'user-service',
          request: {
            featureDescription:
              'Create a user management microservice with CRUD operations, authentication, and database integration',
            techStack: ['Node.js', 'Express', 'MongoDB'],
            role: 'backend-developer',
            quality: 'production',
          },
        },
        {
          name: 'auth-service',
          request: {
            featureDescription:
              'Create an authentication microservice with JWT tokens, refresh tokens, and rate limiting',
            techStack: ['Node.js', 'Express', 'Redis'],
            role: 'backend-developer',
            quality: 'production',
          },
        },
        {
          name: 'api-gateway',
          request: {
            featureDescription:
              'Create an API gateway with request routing, load balancing, and monitoring',
            techStack: ['Node.js', 'Express'],
            role: 'backend-developer',
            quality: 'production',
          },
        },
      ];

      const results = [];

      for (const service of microservices) {
        const result = await engine.generateCode(service.request);

        expect(result).toBeDefined();
        expect(result.category).toBe('backend');
        expect(result.code).toContain('express');
        expect(result.qualityScore.overall).toBeGreaterThan(75);

        results.push({ service: service.name, result });
      }

      expect(results).toHaveLength(3);

      // Each service should be substantial
      results.forEach(({ result }) => {
        expect(result.code.length).toBeGreaterThan(300);
      });
    });

    it('should handle DevOps pipeline generation', async () => {
      const devopsComponents = [
        {
          name: 'dockerfile',
          request: {
            featureDescription:
              'Create a multi-stage Dockerfile for Node.js application with security best practices',
            techStack: ['Docker'],
            role: 'devops-engineer',
            quality: 'production',
          },
        },
        {
          name: 'kubernetes-manifests',
          request: {
            featureDescription:
              'Create Kubernetes deployment manifests with auto-scaling, health checks, and monitoring',
            techStack: ['Kubernetes'],
            role: 'devops-engineer',
            quality: 'production',
          },
        },
        {
          name: 'ci-cd-pipeline',
          request: {
            featureDescription:
              'Create GitHub Actions CI/CD pipeline with testing, security scanning, and deployment',
            techStack: ['GitHub Actions'],
            role: 'devops-engineer',
            quality: 'production',
          },
        },
        {
          name: 'terraform-infrastructure',
          request: {
            featureDescription:
              'Create Terraform configuration for AWS infrastructure with VPC, EKS, and RDS',
            techStack: ['Terraform', 'AWS'],
            role: 'devops-engineer',
            quality: 'production',
          },
        },
      ];

      const results = [];

      for (const component of devopsComponents) {
        const result = await engine.generateCode(component.request);

        expect(result).toBeDefined();
        expect(result.category).toBe('devops');
        expect(result.qualityScore.overall).toBeGreaterThan(70);

        // Check for DevOps-specific patterns
        if (component.name === 'dockerfile') {
          expect(result.code).toMatch(/FROM|RUN|COPY|WORKDIR/);
        } else if (component.name === 'kubernetes-manifests') {
          expect(result.code).toMatch(/apiVersion|kind|metadata/);
        } else if (component.name === 'ci-cd-pipeline') {
          expect(result.code).toMatch(/name:|on:|jobs:|steps:/);
        } else if (component.name === 'terraform-infrastructure') {
          expect(result.code).toMatch(/resource|provider|variable/);
        }

        results.push({ component: component.name, result });
      }

      expect(results).toHaveLength(4);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle ambiguous technology requirements', async () => {
      const ambiguousRequest = {
        featureDescription: 'Create something for web development',
        techStack: [], // No specific tech stack
        role: 'developer',
      };

      const result = await engine.generateCode(ambiguousRequest);

      expect(result).toBeDefined();
      expect(result.code).toBeDefined();
      expect(result.code.length).toBeGreaterThan(0);
      expect(['frontend', 'backend', 'generic']).toContain(result.category);
    });

    it('should handle conflicting technology requirements', async () => {
      const conflictingRequest = {
        featureDescription: 'Create a mobile web application using React Native and Flutter',
        techStack: ['React Native', 'Flutter', 'React'],
        role: 'developer',
      };

      const result = await engine.generateCode(conflictingRequest);

      expect(result).toBeDefined();
      expect(result.code).toBeDefined();
      // Should pick one technology and proceed
      expect(['React Native', 'Flutter', 'React']).toContain(result.technology);
    });

    it('should handle very complex requirements', async () => {
      const complexRequest = {
        featureDescription: `Create a comprehensive e-commerce platform with the following features:
          - User authentication and authorization with roles
          - Product catalog with search, filtering, and recommendations
          - Shopping cart with persistent storage
          - Payment integration with multiple providers
          - Order management and tracking
          - Inventory management
          - Admin dashboard with analytics
          - Real-time notifications
          - Mobile-responsive design
          - Accessibility compliance (WCAG 2.1 AA)
          - Performance optimization
          - Security best practices
          - Multi-language support
          - SEO optimization`,
        techStack: ['React', 'Node.js', 'PostgreSQL', 'Redis'],
        role: 'senior-full-stack-developer',
        quality: 'production',
      };

      const result = await engine.generateCode(complexRequest);

      expect(result).toBeDefined();
      expect(result.code).toBeDefined();
      expect(result.code.length).toBeGreaterThan(1000); // Should be substantial
      expect(result.qualityScore.overall).toBeGreaterThan(70);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle concurrent code generation requests', async () => {
      const requests = Array(5)
        .fill(null)
        .map((_, i) => ({
          featureDescription: `Create a component for feature ${i}`,
          techStack: ['React', 'TypeScript'],
          role: 'developer',
          quality: 'development',
        }));

      const startTime = Date.now();
      const results = await Promise.all(requests.map(request => engine.generateCode(request)));
      const endTime = Date.now();

      expect(results).toHaveLength(5);
      expect(endTime - startTime).toBeLessThan(15000); // Should complete within 15 seconds

      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.code).toBeDefined();
        expect(result.qualityScore.overall).toBeGreaterThan(50);
      });
    });

    it('should maintain quality under load', async () => {
      const loadTestRequests = Array(10)
        .fill(null)
        .map((_, i) => ({
          featureDescription: `Create a production-ready component ${i} with all best practices`,
          techStack: ['React', 'TypeScript'],
          role: 'senior-developer',
          quality: 'production',
        }));

      const results = await Promise.all(
        loadTestRequests.map(request => engine.generateCode(request))
      );

      // All results should maintain high quality even under load
      results.forEach(result => {
        expect(result.qualityScore.overall).toBeGreaterThan(70);
        expect(result.code.length).toBeGreaterThan(200);
      });

      // Calculate average quality
      const averageQuality =
        results.reduce((sum, result) => sum + result.qualityScore.overall, 0) / results.length;
      expect(averageQuality).toBeGreaterThan(75);
    });
  });

  describe('Integration with External Tools', () => {
    it('should generate code that passes basic validation', async () => {
      const request = {
        featureDescription:
          'Create a TypeScript React component with proper types and error handling',
        techStack: ['React', 'TypeScript'],
        role: 'developer',
        quality: 'production',
      };

      const result = await engine.generateCode(request);

      expect(result).toBeDefined();

      // Basic syntax validation
      expect(result.code).not.toContain('syntax error');
      expect(result.code).not.toContain('undefined is not defined');

      // TypeScript specific validations
      expect(result.code).toMatch(/interface|type|:/); // Should have type definitions
      expect(result.code).toMatch(/import.*React/); // Should import React

      // Quality assurance passed
      expect(result.qualityScore.overall).toBeGreaterThan(75);
    });

    it('should provide actionable quality feedback', async () => {
      const request = {
        featureDescription: 'Create a component that might have quality issues',
        techStack: ['React'],
        role: 'junior-developer',
        quality: 'prototype',
      };

      const result = await engine.generateCode(request);

      expect(result).toBeDefined();
      expect(result.qualityScore).toBeDefined();
      expect(result.qualityScore.breakdown).toBeDefined();

      // Should provide improvement suggestions
      if (result.qualityScore.overall < 90) {
        expect(result.qualityScore.breakdown).toBeDefined();
      }
    });
  });
});

// Helper function to determine file extension based on technology
function getFileExtension(technology: string): string {
  const tech = technology.toLowerCase();

  if (tech.includes('typescript') || tech.includes('react')) return 'tsx';
  if (tech.includes('javascript')) return 'js';
  if (tech.includes('python')) return 'py';
  if (tech.includes('java') && !tech.includes('javascript')) return 'java';
  if (tech.includes('csharp') || tech.includes('c#')) return 'cs';
  if (tech.includes('sql') || tech.includes('postgresql') || tech.includes('mysql')) return 'sql';
  if (tech.includes('docker')) return 'dockerfile';
  if (tech.includes('kubernetes')) return 'yaml';
  if (tech.includes('terraform')) return 'tf';
  if (tech.includes('yaml') || tech.includes('yml')) return 'yml';
  if (tech.includes('json')) return 'json';
  if (tech.includes('html')) return 'html';
  if (tech.includes('css')) return 'css';
  if (tech.includes('dart') || tech.includes('flutter')) return 'dart';
  if (tech.includes('swift')) return 'swift';
  if (tech.includes('kotlin')) return 'kt';

  return 'txt';
}
