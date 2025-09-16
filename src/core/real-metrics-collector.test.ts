/**
 * Tests for Real Metrics Collector
 * Ensures real metrics calculation works correctly
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RealMetricsCollector } from './real-metrics-collector';

describe('RealMetricsCollector', () => {
  let collector: RealMetricsCollector;

  beforeEach(() => {
    collector = new RealMetricsCollector();
  });

  describe('calculateRealQualityMetrics', () => {
    it('should calculate real metrics for simple code', async () => {
      const simpleCode = `
        function add(a: number, b: number): number {
          return a + b;
        }

        function subtract(a: number, b: number): number {
          return a - b;
        }
      `;

      const result = await collector.calculateRealQualityMetrics(
        simpleCode,
        'test-file.ts'
      );

      expect(result).toBeDefined();
      expect(result.source).toBe('real_analysis');
      expect(result.testCoverage).toBeGreaterThanOrEqual(0);
      expect(result.complexity).toBeGreaterThan(0);
      expect(result.securityScore).toBeGreaterThanOrEqual(0);
      expect(result.maintainability).toBeGreaterThanOrEqual(0);
      expect(result.performance).toBeGreaterThanOrEqual(0);
      expect(result.reliability).toBeGreaterThanOrEqual(0);
      expect(result.usability).toBeGreaterThanOrEqual(0);
      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.overall).toBeLessThanOrEqual(100);
    });

    it('should detect security issues in code', async () => {
      const insecureCode = `
        function login(username: string, password: string) {
          const hardcodedPassword = "admin123";
          if (password === hardcodedPassword) {
            eval("console.log('Login successful')");
            return true;
          }
          return false;
        }
      `;

      const result = await collector.calculateRealQualityMetrics(
        insecureCode,
        'insecure-file.ts'
      );

      expect(result.securityScore).toBeLessThan(100);
      expect(result.overall).toBeLessThan(100);
    });

    it('should handle complex code with higher complexity', async () => {
      const complexCode = `
        function processData(data: any[]) {
          let result = [];
          for (let i = 0; i < data.length; i++) {
            if (data[i] && data[i].type === 'user') {
              if (data[i].active) {
                if (data[i].permissions && data[i].permissions.length > 0) {
                  for (let j = 0; j < data[i].permissions.length; j++) {
                    if (data[i].permissions[j] === 'admin') {
                      result.push(data[i]);
                    } else if (data[i].permissions[j] === 'user') {
                      result.push(data[i]);
                    }
                  }
                }
              }
            }
          }
          return result;
        }
      `;

      const result = await collector.calculateRealQualityMetrics(
        complexCode,
        'complex-file.ts'
      );

      expect(result.complexity).toBeGreaterThan(5);
      expect(result.maintainability).toBeLessThan(100);
    });

    it('should handle empty code gracefully', async () => {
      const emptyCode = '';

      const result = await collector.calculateRealQualityMetrics(
        emptyCode,
        'empty-file.ts'
      );

      expect(result).toBeDefined();
      expect(result.source).toBe('real_analysis');
      expect(result.overall).toBeGreaterThanOrEqual(0);
    });

    it('should handle code with good practices', async () => {
      const goodCode = `
        /**
         * User authentication service
         * Handles secure user login and session management
         */
        class AuthService {
          private readonly rateLimiter: RateLimiter;
          private readonly validator: InputValidator;

          constructor(rateLimiter: RateLimiter, validator: InputValidator) {
            this.rateLimiter = rateLimiter;
            this.validator = validator;
          }

          async authenticateUser(username: string, password: string): Promise<AuthResult> {
            // Input validation
            if (!this.validator.isValidUsername(username)) {
              throw new ValidationError('Invalid username');
            }

            // Rate limiting
            if (!this.rateLimiter.allowRequest(username)) {
              throw new RateLimitError('Too many requests');
            }

            // Secure password verification
            const hashedPassword = await this.hashPassword(password);
            const user = await this.findUser(username);

            if (user && await this.verifyPassword(hashedPassword, user.passwordHash)) {
              return this.createSession(user);
            }

            throw new AuthenticationError('Invalid credentials');
          }
        }
      `;

      const result = await collector.calculateRealQualityMetrics(
        goodCode,
        'good-code.ts'
      );

      expect(result.securityScore).toBeGreaterThan(50);
      expect(result.maintainability).toBeGreaterThan(50);
      expect(result.overall).toBeGreaterThan(50);
    });
  });

  describe('error handling', () => {
    it('should handle file system errors gracefully', async () => {
      const result = await collector.calculateRealQualityMetrics(
        'test code',
        '/nonexistent/path/file.ts'
      );

      expect(result).toBeDefined();
      expect(result.source).toBe('real_analysis');
      expect(result.testCoverage).toBe(0); // No test files found
    });

    it('should return error state for invalid input', async () => {
      const result = await collector.calculateRealQualityMetrics(
        null as any,
        'test-file.ts'
      );

      expect(result).toBeDefined();
      expect(result.overall).toBeLessThan(100);
    });
  });

  describe('metrics calculation accuracy', () => {
    it('should calculate complexity correctly', async () => {
      const simpleCode = 'function add(a, b) { return a + b; }';
      const complexCode = `
        function complex(a, b, c) {
          if (a > 0) {
            if (b > 0) {
              if (c > 0) {
                return a + b + c;
              } else {
                return a + b;
              }
            } else {
              return a;
            }
          } else {
            return 0;
          }
        }
      `;

      const simpleResult = await collector.calculateRealQualityMetrics(simpleCode, 'simple.ts');
      const complexResult = await collector.calculateRealQualityMetrics(complexCode, 'complex.ts');

      expect(complexResult.complexity).toBeGreaterThan(simpleResult.complexity);
    });

    it('should calculate security score based on patterns', async () => {
      const secureCode = `
        function secureFunction(input: string) {
          const sanitized = input.replace(/<script>/gi, '');
          return sanitized;
        }
      `;

      const insecureCode = `
        function insecureFunction(input: string) {
          eval(input);
          document.write(input);
          return input;
        }
      `;

      const secureResult = await collector.calculateRealQualityMetrics(secureCode, 'secure.ts');
      const insecureResult = await collector.calculateRealQualityMetrics(insecureCode, 'insecure.ts');

      expect(secureResult.securityScore).toBeGreaterThan(insecureResult.securityScore);
    });
  });
});
