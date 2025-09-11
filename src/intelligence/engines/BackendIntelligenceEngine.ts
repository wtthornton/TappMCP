/**
 * Backend Intelligence Engine
 *
 * Placeholder implementation for Phase 1. Provides basic backend-specific
 * code generation and analysis. Full implementation will be added in Phase 2.
 */

import {
  BaseCategoryIntelligenceEngine,
  CodeAnalysis,
  Context7Data,
  ValidationResult,
  QualityAnalysis,
  MaintainabilityAnalysis,
  PerformanceAnalysis,
  SecurityAnalysis,
  ScalabilityAnalysis,
  ReliabilityAnalysis,
} from '../CategoryIntelligenceEngine.js';
import { CodeGenerationRequest } from '../UnifiedCodeIntelligenceEngine.js';

/**
 * Backend-specific intelligence engine (Phase 1 placeholder)
 */
export class BackendIntelligenceEngine extends BaseCategoryIntelligenceEngine {
  category = 'backend';
  technologies = ['Node.js', 'Python', 'Java', 'C#', 'Go', 'Rust', 'PHP', 'Ruby'];

  /**
   * Analyze backend code with security, performance, and scalability considerations
   * Phase 2 Enhanced Implementation
   */
  async analyzeCode(
    code: string,
    technology: string,
    context: Context7Data
  ): Promise<CodeAnalysis> {
    const insights = await this.getTechnologyInsights(technology, context);

    // Enhanced backend analysis (Phase 2)
    const quality = await this.analyzeBackendQuality(code, technology, insights);
    const maintainability = await this.analyzeMaintainability(code, technology, insights);
    const performance = await this.analyzePerformance(code, technology, insights);
    const security = await this.analyzeSecurity(code, technology, insights);
    const scalability = await this.analyzeScalability(code, technology, insights);
    const reliability = await this.analyzeReliability(code, technology, insights);

    return {
      quality,
      maintainability,
      performance,
      security,
      scalability,
      reliability,
    };
  }

  /**
   * Generate backend code with security and performance best practices
   */
  async generateCode(request: CodeGenerationRequest, context: Context7Data): Promise<string> {
    const { featureDescription, techStack, role, quality } = request;

    // Determine the technology to use
    const technology = techStack?.[0] || 'Node.js';

    // Get technology insights from Context7
    const insights = await this.getTechnologyInsights(technology, context);

    // Generate backend-specific code
    let code = this.generateBackendCode(featureDescription, technology, role);

    // Apply quality standards
    code = await this.applyQualityStandards(code, quality || 'standard');

    // Apply Context7 insights
    code = await this.applyContext7Insights(code, insights);

    // Add security features
    code = this.addSecurityFeatures(code, technology);

    // Add performance optimizations
    code = this.addPerformanceOptimizations(code, technology);

    return code;
  }

  /**
   * Get backend-specific best practices
   */
  async getBestPractices(technology: string, context: Context7Data): Promise<string[]> {
    const practices = [
      'Use HTTPS for all communications',
      'Implement proper authentication and authorization',
      'Validate and sanitize all inputs',
      'Use parameterized queries to prevent SQL injection',
      'Implement rate limiting and throttling',
      'Use secure headers (CORS, CSP, etc.)',
      'Implement proper error handling and logging',
      'Use environment variables for configuration',
      'Implement API versioning',
      'Use caching for performance optimization',
    ];

    // Add technology-specific practices from Context7
    const insights = await this.getTechnologyInsights(technology, context);
    practices.push(...insights.bestPractices);

    return practices;
  }

  /**
   * Get backend-specific anti-patterns
   */
  async getAntiPatterns(technology: string, context: Context7Data): Promise<string[]> {
    const antiPatterns = [
      'Storing passwords in plain text',
      'Using eval() or similar dynamic code execution',
      'Ignoring input validation',
      'Hardcoding secrets and API keys',
      'Using SQL string concatenation',
      'Not implementing rate limiting',
      'Exposing sensitive data in error messages',
      'Using outdated dependencies with vulnerabilities',
      'Not implementing proper session management',
      'Using weak encryption algorithms',
    ];

    // Add technology-specific anti-patterns from Context7
    const insights = await this.getTechnologyInsights(technology, context);
    antiPatterns.push(...insights.antiPatterns);

    return antiPatterns;
  }

  /**
   * Validate backend code
   */
  async validateCode(code: string, technology: string): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Security validation
    if (code.includes('eval(') || code.includes('exec(')) {
      errors.push('Dangerous eval/exec usage detected');
    }

    if (code.match(/password.*=.*["'][^"']+["']/i)) {
      errors.push('Hardcoded password detected');
    }

    if (code.match(/api[_-]?key.*=.*["'][^"']+["']/i)) {
      errors.push('Hardcoded API key detected');
    }

    // SQL injection checks
    if (code.match(/SELECT.*FROM.*WHERE.*\+/gi)) {
      errors.push('Potential SQL injection vulnerability');
    }

    if (code.includes('innerHTML') && !code.includes('sanitize')) {
      warnings.push('Potential XSS vulnerability with innerHTML');
    }

    // Input validation
    if (code.includes('req.body') && !code.includes('validate')) {
      warnings.push('Input validation missing for request body');
    }

    // HTTPS checks
    if (code.includes('http://') && !code.includes('https://')) {
      suggestions.push('Use HTTPS instead of HTTP');
    }

    // Error handling
    if (!code.includes('try') && !code.includes('catch')) {
      suggestions.push('Add error handling with try-catch blocks');
    }

    // Logging
    if (!code.includes('log') && !code.includes('console')) {
      suggestions.push('Add logging for debugging and monitoring');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * Optimize backend code
   */
  async optimizeCode(code: string, technology: string, context: Context7Data): Promise<string> {
    let optimizedCode = code;

    // Apply general optimizations
    optimizedCode = this.optimizePerformance(optimizedCode, technology);
    optimizedCode = this.optimizeSecurity(optimizedCode, technology);
    optimizedCode = this.optimizeScalability(optimizedCode, technology);

    // Apply Context7 insights
    const insights = await this.getTechnologyInsights(technology, context);
    optimizedCode = await this.applyContext7Insights(optimizedCode, insights);

    return optimizedCode;
  }

  /**
   * Private helper methods
   */

  private async analyzeBackendQuality(
    code: string,
    technology: string,
    insights: any
  ): Promise<QualityAnalysis> {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Backend-specific quality checks
    if (!code.includes('async') && !code.includes('await')) {
      suggestions.push('Consider using async/await for better code readability');
      score -= 5;
    }

    if (code.includes('callback') && !code.includes('Promise')) {
      suggestions.push('Consider using Promises instead of callbacks');
      score -= 10;
    }

    if (!code.includes('validate') && code.includes('req.')) {
      issues.push('Missing input validation');
      score -= 15;
    }

    return {
      score: Math.max(0, score),
      issues,
      suggestions,
    };
  }

  private async analyzeMaintainability(
    code: string,
    technology: string,
    insights: any
  ): Promise<MaintainabilityAnalysis> {
    // Basic maintainability analysis (to be expanded in Phase 2)
    return {
      score: 85,
      complexity: 7,
      readability: 80,
      testability: 85,
      suggestions: ['Add unit tests', 'Use dependency injection', 'Follow SOLID principles'],
    };
  }

  private async analyzePerformance(
    code: string,
    technology: string,
    insights: any
  ): Promise<PerformanceAnalysis> {
    const bottlenecks: string[] = [];
    const optimizations: string[] = [];
    let score = 80;

    // Backend performance checks
    if (code.includes('sync') && !code.includes('async')) {
      bottlenecks.push('Synchronous operations blocking event loop');
      optimizations.push('Use asynchronous operations');
      score -= 20;
    }

    if (code.includes('SELECT') && !code.includes('LIMIT')) {
      bottlenecks.push('Unbounded database queries');
      optimizations.push('Add LIMIT clauses to database queries');
      score -= 15;
    }

    if (!code.includes('cache') && code.includes('database')) {
      optimizations.push('Implement caching for database queries');
      score -= 10;
    }

    return {
      score: Math.max(0, score),
      bottlenecks,
      optimizations,
    };
  }

  private async analyzeSecurity(
    code: string,
    technology: string,
    insights: any
  ): Promise<SecurityAnalysis> {
    const vulnerabilities: string[] = [];
    const recommendations: string[] = [];
    let score = 85;

    // OWASP Top 10 2021 Security Analysis

    // 1. A01:2021 – Broken Access Control
    if (
      code.includes('req.user') &&
      !code.includes('authorization') &&
      !code.includes('authenticate')
    ) {
      vulnerabilities.push('A01: Missing access control checks');
      recommendations.push('Implement proper authorization middleware');
      score -= 20;
    }

    if (code.includes('admin') && !code.includes('role') && !code.includes('permission')) {
      vulnerabilities.push('A01: Admin functionality without role-based access');
      recommendations.push('Implement role-based access control (RBAC)');
      score -= 15;
    }

    // 2. A02:2021 – Cryptographic Failures
    if (!code.includes('bcrypt') && code.includes('password')) {
      vulnerabilities.push('A02: Weak password hashing');
      recommendations.push('Use bcrypt, scrypt, or Argon2 for password hashing');
      score -= 20;
    }

    if (code.includes('crypto') && code.includes('md5')) {
      vulnerabilities.push('A02: Weak hashing algorithm (MD5)');
      recommendations.push('Use SHA-256 or stronger algorithms');
      score -= 15;
    }

    if (code.includes('http://') && !code.includes('localhost')) {
      vulnerabilities.push('A02: Unencrypted data transmission');
      recommendations.push('Use HTTPS for all external communications');
      score -= 10;
    }

    // 3. A03:2021 – Injection
    if (code.includes('eval(') || code.includes('exec(') || code.includes('Function(')) {
      vulnerabilities.push('A03: Code injection vulnerability');
      recommendations.push('Avoid dynamic code execution');
      score -= 30;
    }

    if (code.includes('query') && !code.includes('prepared') && !code.includes('parameterized')) {
      vulnerabilities.push('A03: Potential SQL injection');
      recommendations.push('Use parameterized queries or ORM');
      score -= 25;
    }

    if (code.includes('$' + '{') && code.includes('req.')) {
      vulnerabilities.push('A03: Template injection risk');
      recommendations.push('Sanitize user input in template literals');
      score -= 15;
    }

    // 4. A04:2021 – Insecure Design
    if (!code.includes('rate') && !code.includes('limit') && code.includes('api')) {
      vulnerabilities.push('A04: Missing rate limiting');
      recommendations.push('Implement API rate limiting');
      score -= 12;
    }

    if (!code.includes('validate') && code.includes('req.body')) {
      vulnerabilities.push('A04: Missing input validation');
      recommendations.push('Validate all user inputs');
      score -= 15;
    }

    // 5. A05:2021 – Security Misconfiguration
    if (technology.toLowerCase().includes('express') && !code.includes('helmet')) {
      vulnerabilities.push('A05: Missing security headers');
      recommendations.push('Use helmet.js for security headers');
      score -= 10;
    }

    if (code.includes('cors') && code.includes('*')) {
      vulnerabilities.push('A05: Overly permissive CORS');
      recommendations.push('Configure CORS with specific origins');
      score -= 12;
    }

    if (code.includes('.env') && code.includes('git')) {
      vulnerabilities.push('A05: Environment files in version control');
      recommendations.push('Add .env to .gitignore');
      score -= 8;
    }

    // 6. A06:2021 – Vulnerable and Outdated Components
    if (code.includes('npm install') && !code.includes('audit')) {
      recommendations.push('A06: Run npm audit regularly');
      score -= 5;
    }

    // 7. A07:2021 – Identification and Authentication Failures
    if (code.includes('jwt') && !code.includes('expire') && !code.includes('refresh')) {
      vulnerabilities.push('A07: JWT tokens without expiration');
      recommendations.push('Implement JWT expiration and refresh tokens');
      score -= 15;
    }

    if (code.includes('session') && !code.includes('secure') && !code.includes('httpOnly')) {
      vulnerabilities.push('A07: Insecure session configuration');
      recommendations.push('Configure secure session cookies');
      score -= 12;
    }

    // 8. A08:2021 – Software and Data Integrity Failures
    if (code.includes('webhook') && !code.includes('signature') && !code.includes('hmac')) {
      vulnerabilities.push('A08: Unverified webhook data');
      recommendations.push('Verify webhook signatures');
      score -= 10;
    }

    // 9. A09:2021 – Security Logging and Monitoring Failures
    if (!code.includes('logger') && !code.includes('console.log') && code.includes('error')) {
      vulnerabilities.push('A09: Missing security logging');
      recommendations.push('Implement comprehensive logging');
      score -= 8;
    }

    if (code.includes('password') && code.includes('log')) {
      vulnerabilities.push('A09: Sensitive data in logs');
      recommendations.push('Avoid logging sensitive information');
      score -= 15;
    }

    // 10. A10:2021 – Server-Side Request Forgery (SSRF)
    if (code.includes('fetch(') && code.includes('req.body')) {
      vulnerabilities.push('A10: Potential SSRF vulnerability');
      recommendations.push('Validate and whitelist external URLs');
      score -= 20;
    }

    // Technology-specific security enhancements
    if (technology.toLowerCase().includes('node')) {
      // Node.js specific security
      if (!code.includes('express-validator') && code.includes('express')) {
        recommendations.push('Use express-validator for input validation');
        score -= 5;
      }

      if (code.includes('child_process') && !code.includes('spawn')) {
        vulnerabilities.push('Unsafe child process execution');
        recommendations.push('Use spawn() instead of exec() for child processes');
        score -= 15;
      }
    }

    if (technology.toLowerCase().includes('python')) {
      // Python specific security
      if (code.includes('pickle') && code.includes('load')) {
        vulnerabilities.push('Unsafe deserialization with pickle');
        recommendations.push('Use JSON or safer serialization methods');
        score -= 20;
      }

      if (code.includes('os.system') || code.includes('subprocess.call')) {
        vulnerabilities.push('Command injection risk');
        recommendations.push('Use subprocess with shell=False');
        score -= 18;
      }
    }

    // API Security best practices
    if (code.includes('api') || code.includes('endpoint')) {
      if (!code.includes('throttle') && !code.includes('rateLimit')) {
        recommendations.push('Implement API throttling');
        score -= 8;
      }

      if (!code.includes('Content-Type') && code.includes('json')) {
        recommendations.push('Validate Content-Type headers');
        score -= 5;
      }

      if (!code.includes('version') && code.includes('/api/')) {
        recommendations.push('Implement API versioning');
        score -= 3;
      }
    }

    // Modern security features bonus points
    if (code.includes('csp') || code.includes('Content-Security-Policy')) {
      score += 5; // Bonus for CSP
    }

    if (code.includes('2fa') || code.includes('mfa') || code.includes('totp')) {
      score += 8; // Bonus for multi-factor authentication
    }

    if (code.includes('audit') || code.includes('security-scan')) {
      score += 3; // Bonus for security auditing
    }

    return {
      score: Math.max(0, score),
      vulnerabilities,
      recommendations,
      compliance: [
        score >= 80
          ? 'OWASP Top 10 2021 - High'
          : score >= 60
            ? 'OWASP Top 10 2021 - Medium'
            : 'OWASP Top 10 2021 - Low',
      ],
    };
  }

  private async analyzeScalability(
    code: string,
    technology: string,
    insights: any
  ): Promise<ScalabilityAnalysis> {
    const patterns: string[] = [];
    const bottlenecks: string[] = [];
    const recommendations: string[] = [];
    let score = 75;

    // Modern Scalability Patterns Analysis

    // 1. Horizontal Scaling Patterns
    if (code.includes('cluster') || code.includes('worker_processes')) {
      patterns.push('Multi-process architecture (horizontal scaling)');
      score += 12;
    }

    if (code.includes('load') && code.includes('balance')) {
      patterns.push('Load balancing implementation');
      score += 10;
    }

    if (code.includes('microservice') || code.includes('service-mesh')) {
      patterns.push('Microservices architecture');
      score += 15;
    }

    // 2. Caching Strategies
    if (code.includes('redis') || code.includes('memcached')) {
      patterns.push('Distributed caching (Redis/Memcached)');
      score += 12;
    }

    if (code.includes('cache-aside') || code.includes('write-through')) {
      patterns.push('Advanced caching patterns');
      score += 8;
    }

    if (code.includes('cdn') || code.includes('cloudfront')) {
      patterns.push('Content delivery network');
      score += 6;
    }

    // 3. Database Scaling
    if (code.includes('read-replica') || code.includes('master-slave')) {
      patterns.push('Database read replicas');
      score += 10;
    }

    if (code.includes('shard') || code.includes('partition')) {
      patterns.push('Database sharding/partitioning');
      score += 12;
    }

    if (code.includes('connection') && code.includes('pool')) {
      patterns.push('Database connection pooling');
      score += 8;
    } else if (code.includes('database') && !code.includes('pool')) {
      bottlenecks.push('Missing database connection pooling');
      recommendations.push('Implement database connection pooling');
      score -= 10;
    }

    // 4. Asynchronous Processing
    if (code.includes('queue') || code.includes('job')) {
      patterns.push('Message queue processing');
      score += 10;
    }

    if (code.includes('event-driven') || code.includes('event.emit')) {
      patterns.push('Event-driven architecture');
      score += 8;
    }

    if (code.includes('stream') || code.includes('pipeline')) {
      patterns.push('Streaming/pipeline processing');
      score += 7;
    }

    // 5. API and Request Handling
    if (code.includes('rate') && code.includes('limit')) {
      patterns.push('API rate limiting');
      score += 8;
    }

    if (code.includes('pagination') || code.includes('cursor')) {
      patterns.push('Result pagination');
      score += 5;
    } else if (code.includes('SELECT *') || code.includes('find()')) {
      bottlenecks.push('Potential large result sets without pagination');
      recommendations.push('Implement pagination for large datasets');
      score -= 8;
    }

    // 6. Performance Bottlenecks
    if (!code.includes('async') && code.includes('database')) {
      bottlenecks.push('Synchronous database operations');
      recommendations.push('Use async/await for database operations');
      score -= 15;
    }

    if (code.includes('for') && code.includes('await')) {
      bottlenecks.push('Sequential async operations in loops');
      recommendations.push('Use Promise.all() for parallel async operations');
      score -= 10;
    }

    if (code.includes('sync') && (code.includes('fs.') || code.includes('readFile'))) {
      bottlenecks.push('Synchronous file operations');
      recommendations.push('Use async file operations');
      score -= 12;
    }

    // 7. Modern Scaling Technologies
    if (code.includes('docker') || code.includes('container')) {
      patterns.push('Containerization');
      score += 6;
    }

    if (code.includes('kubernetes') || code.includes('k8s')) {
      patterns.push('Container orchestration');
      score += 10;
    }

    if (code.includes('serverless') || code.includes('lambda')) {
      patterns.push('Serverless architecture');
      score += 8;
    }

    // 8. Monitoring and Observability
    if (code.includes('metrics') || code.includes('prometheus')) {
      patterns.push('Performance monitoring');
      score += 5;
    }

    if (code.includes('trace') || code.includes('span')) {
      patterns.push('Distributed tracing');
      score += 7;
    }

    // 9. Data Processing Scalability
    if (code.includes('batch') || code.includes('bulk')) {
      patterns.push('Batch processing');
      score += 5;
    }

    if (code.includes('elasticsearch') || code.includes('search')) {
      patterns.push('Search engine integration');
      score += 6;
    }

    // 10. Technology-specific optimizations
    if (technology.toLowerCase().includes('node')) {
      if (!code.includes('cluster') && code.includes('server')) {
        recommendations.push('Use Node.js cluster module for multi-core utilization');
        score -= 8;
      }

      if (code.includes('express') && !code.includes('compression')) {
        recommendations.push('Enable gzip compression in Express');
        score -= 3;
      }
    }

    if (technology.toLowerCase().includes('python')) {
      if (code.includes('django') && !code.includes('cache')) {
        recommendations.push('Implement Django caching framework');
        score -= 5;
      }

      if (!code.includes('async') && code.includes('requests')) {
        recommendations.push('Use async HTTP libraries (aiohttp, httpx)');
        score -= 7;
      }
    }

    // Bonus for advanced patterns
    if (code.includes('circuit-breaker')) {
      score += 8; // Bonus for circuit breaker pattern
    }

    if (code.includes('blue-green') || code.includes('canary')) {
      score += 6; // Bonus for deployment strategies
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      patterns,
      bottlenecks,
      recommendations,
    };
  }

  private async analyzeReliability(
    code: string,
    technology: string,
    insights: any
  ): Promise<ReliabilityAnalysis> {
    const improvements: string[] = [];
    let score = 80;

    // Reliability checks
    const hasErrorHandling = /try\s*{/.test(code) && /catch\s*\(/.test(code);
    if (!hasErrorHandling) {
      improvements.push('Add comprehensive error handling');
      score -= 20;
    }

    const hasLogging = /log|logger/gi.test(code);
    if (!hasLogging) {
      improvements.push('Add logging for monitoring and debugging');
      score -= 10;
    }

    const hasValidation = /validate|joi|yup|zod/gi.test(code);
    if (!hasValidation) {
      improvements.push('Add input validation');
      score -= 15;
    }

    return {
      score: Math.max(0, score),
      errorHandling: hasErrorHandling ? 85 : 60,
      logging: hasLogging ? 90 : 70,
      monitoring: 75, // Baseline
      improvements,
    };
  }

  private generateBackendCode(description: string, technology: string, role?: string): string {
    const lowerTech = technology.toLowerCase();

    if (lowerTech.includes('node') || lowerTech.includes('javascript')) {
      return this.generateNodeJSCode(description, role);
    } else if (lowerTech.includes('python')) {
      return this.generatePythonCode(description, role);
    } else if (lowerTech.includes('java')) {
      return this.generateJavaCode(description, role);
    } else if (lowerTech.includes('csharp') || lowerTech.includes('c#')) {
      return this.generateCSharpCode(description, role);
    } else if (lowerTech.includes('go')) {
      return this.generateGoCode(description, role);
    } else {
      return this.generateGenericBackendCode(description, role);
    }
  }

  private generateNodeJSCode(description: string, role?: string): string {
    return `/**
 * ${description}
 * Generated by BackendIntelligenceEngine
 * Role: ${role || 'developer'}
 */

'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(\`\${new Date().toISOString()} - \${req.method} \${req.path}\`);
  next();
});

/**
 * Main API endpoint for ${description}
 */
app.post('/api/process', [
  // Input validation
  body('data').notEmpty().withMessage('Data is required'),
  body('options').optional().isObject().withMessage('Options must be an object')
], async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { data, options = {} } = req.body;

    // Process the request
    const result = await processData(data, options);

    // Return success response
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error:', error);

    // Don't expose internal errors to client
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: '${description}'
  });
});

/**
 * Process data with business logic
 * @param {*} data - Input data
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Processing result
 */
async function processData(data, options) {
  // Validate input
  if (!data) {
    throw new Error('Invalid input data');
  }

  try {
    // TODO: Implement main business logic
    const result = {
      processed: true,
      input: data,
      options,
      processingTime: Date.now()
    };

    return result;
  } catch (error) {
    console.error('Data processing error:', error);
    throw new Error('Failed to process data');
  }
}

/**
 * Graceful shutdown handling
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
  console.log(\`Service: \${description}\`);
});

module.exports = app;`;
  }

  private generatePythonCode(description: string, role?: string): string {
    return `"""
${description}
Generated by BackendIntelligenceEngine
Role: ${role || 'developer'}
"""

import asyncio
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
import uvicorn

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="${description}",
    description="Backend service for ${description}",
    version="1.0.0"
)

# Security
security = HTTPBearer()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Configure as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1"]
)

# Request/Response models
class ProcessRequest(BaseModel):
    data: Any = Field(..., description="Data to process")
    options: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Processing options")

class ProcessResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
    timestamp: str

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    service: str

# Dependency for authentication (placeholder)
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # TODO: Implement actual authentication logic
    return {"user_id": "authenticated_user"}

@app.post("/api/process", response_model=ProcessResponse)
async def process_data_endpoint(
    request: ProcessRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Main API endpoint for ${description}
    """
    try:
        # Log the request
        logger.info(f"Processing request from user: {current_user.get('user_id')}")

        # Process the data
        result = await process_data(request.data, request.options)

        return ProcessResponse(
            success=True,
            data=result,
            timestamp=datetime.now().isoformat()
        )

    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint
    """
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now().isoformat(),
        service="${description}"
    )

async def process_data(data: Any, options: Dict[str, Any]) -> Dict[str, Any]:
    """
    Process data with business logic

    Args:
        data: Input data to process
        options: Processing options

    Returns:
        Dict containing processing result

    Raises:
        ValueError: If input data is invalid
    """
    # Validate input
    if data is None:
        raise ValueError("Invalid input data")

    try:
        # TODO: Implement main business logic
        result = {
            "processed": True,
            "input": data,
            "options": options,
            "processing_time": datetime.now().isoformat()
        }

        logger.info("Data processed successfully")
        return result

    except Exception as e:
        logger.error(f"Data processing error: {str(e)}")
        raise ValueError("Failed to process data")

# Application startup
@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting {description} service")

# Application shutdown
@app.on_event("shutdown")
async def shutdown_event():
    logger.info(f"Shutting down {description} service")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )`;
  }

  private generateJavaCode(description: string, role?: string): string {
    return `/**
 * ${description}
 * Generated by BackendIntelligenceEngine
 * Role: ${role || 'developer'}
 */

package com.example.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.validation.annotation.Validated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.stereotype.Controller;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;

@SpringBootApplication
public class BackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}

@RestController
@RequestMapping("/api")
@Validated
public class ProcessController {

    private static final Logger logger = LoggerFactory.getLogger(ProcessController.class);

    @Autowired
    private ProcessService processService;

    @PostMapping("/process")
    public ResponseEntity<ApiResponse> processData(@Valid @RequestBody ProcessRequest request) {
        try {
            logger.info("Processing request for: ${description}");

            Map<String, Object> result = processService.processData(request.getData(), request.getOptions());

            ApiResponse response = new ApiResponse(
                true,
                result,
                null,
                LocalDateTime.now().toString()
            );

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.error("Validation error: {}", e.getMessage());
            ApiResponse response = new ApiResponse(
                false,
                null,
                e.getMessage(),
                LocalDateTime.now().toString()
            );
            return ResponseEntity.badRequest().body(response);

        } catch (Exception e) {
            logger.error("Unexpected error: {}", e.getMessage(), e);
            ApiResponse response = new ApiResponse(
                false,
                null,
                "Internal server error",
                LocalDateTime.now().toString()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "healthy");
        health.put("timestamp", LocalDateTime.now().toString());
        health.put("service", "${description}");

        return ResponseEntity.ok(health);
    }
}

@Service
public class ProcessService {

    private static final Logger logger = LoggerFactory.getLogger(ProcessService.class);

    public Map<String, Object> processData(Object data, Map<String, Object> options) {
        // Validate input
        if (data == null) {
            throw new IllegalArgumentException("Invalid input data");
        }

        try {
            // TODO: Implement main business logic
            Map<String, Object> result = new HashMap<>();
            result.put("processed", true);
            result.put("input", data);
            result.put("options", options != null ? options : new HashMap<>());
            result.put("processingTime", LocalDateTime.now().toString());

            logger.info("Data processed successfully");
            return result;

        } catch (Exception e) {
            logger.error("Data processing error: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process data");
        }
    }
}

// Request/Response classes
class ProcessRequest {
    @NotNull
    private Object data;
    private Map<String, Object> options;

    // Getters and setters
    public Object getData() { return data; }
    public void setData(Object data) { this.data = data; }
    public Map<String, Object> getOptions() { return options; }
    public void setOptions(Map<String, Object> options) { this.options = options; }
}

class ApiResponse {
    private boolean success;
    private Object data;
    private String error;
    private String timestamp;

    public ApiResponse(boolean success, Object data, String error, String timestamp) {
        this.success = success;
        this.data = data;
        this.error = error;
        this.timestamp = timestamp;
    }

    // Getters and setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public Object getData() { return data; }
    public void setData(Object data) { this.data = data; }
    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}

// Security configuration
@EnableWebSecurity
class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .authorizeRequests()
                .antMatchers("/api/health").permitAll()
                .anyRequest().authenticated()
            .and()
            .httpBasic();
    }
}`;
  }

  private generateCSharpCode(description: string, role?: string): string {
    return `/**
 * ${description}
 * Generated by BackendIntelligenceEngine
 * Role: ${role || 'developer'}
 */

using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;

namespace BackendService
{
    [ApiController]
    [Route("api")]
    [Authorize]
    public class ProcessController : ControllerBase
    {
        private readonly ILogger<ProcessController> _logger;
        private readonly IProcessService _processService;

        public ProcessController(ILogger<ProcessController> logger, IProcessService processService)
        {
            _logger = logger;
            _processService = processService;
        }

        [HttpPost("process")]
        public async Task<IActionResult> ProcessData([FromBody] ProcessRequest request)
        {
            try
            {
                _logger.LogInformation("Processing request for: ${description}");

                var result = await _processService.ProcessDataAsync(request.Data, request.Options);

                var response = new ApiResponse
                {
                    Success = true,
                    Data = result,
                    Timestamp = DateTime.UtcNow.ToString("O")
                };

                return Ok(response);
            }
            catch (ArgumentException ex)
            {
                _logger.LogError(ex, "Validation error: {Message}", ex.Message);

                var response = new ApiResponse
                {
                    Success = false,
                    Error = ex.Message,
                    Timestamp = DateTime.UtcNow.ToString("O")
                };

                return BadRequest(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error: {Message}", ex.Message);

                var response = new ApiResponse
                {
                    Success = false,
                    Error = "Internal server error",
                    Timestamp = DateTime.UtcNow.ToString("O")
                };

                return StatusCode(500, response);
            }
        }

        [HttpGet("health")]
        [AllowAnonymous]
        public IActionResult HealthCheck()
        {
            var health = new
            {
                Status = "healthy",
                Timestamp = DateTime.UtcNow.ToString("O"),
                Service = "${description}"
            };

            return Ok(health);
        }
    }

    public interface IProcessService
    {
        Task<object> ProcessDataAsync(object data, object options);
    }

    public class ProcessService : IProcessService
    {
        private readonly ILogger<ProcessService> _logger;

        public ProcessService(ILogger<ProcessService> logger)
        {
            _logger = logger;
        }

        public async Task<object> ProcessDataAsync(object data, object options)
        {
            // Validate input
            if (data == null)
            {
                throw new ArgumentException("Invalid input data");
            }

            try
            {
                // TODO: Implement main business logic
                var result = new
                {
                    Processed = true,
                    Input = data,
                    Options = options ?? new { },
                    ProcessingTime = DateTime.UtcNow.ToString("O")
                };

                _logger.LogInformation("Data processed successfully");
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Data processing error: {Message}", ex.Message);
                throw new InvalidOperationException("Failed to process data");
            }
        }
    }

    // Request/Response models
    public class ProcessRequest
    {
        [Required]
        public object Data { get; set; }
        public object Options { get; set; }
    }

    public class ApiResponse
    {
        public bool Success { get; set; }
        public object Data { get; set; }
        public string Error { get; set; }
        public string Timestamp { get; set; }
    }
}`;
  }

  private generateGoCode(description: string, role?: string): string {
    return `/**
 * ${description}
 * Generated by BackendIntelligenceEngine
 * Role: ${role || 'developer'}
 */

package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "time"

    "github.com/gorilla/mux"
    "github.com/gorilla/handlers"
)

// ProcessRequest represents the request payload
type ProcessRequest struct {
    Data    interface{} \`json:"data"\`
    Options interface{} \`json:"options,omitempty"\`
}

// APIResponse represents the response payload
type APIResponse struct {
    Success   bool        \`json:"success"\`
    Data      interface{} \`json:"data,omitempty"\`
    Error     string      \`json:"error,omitempty"\`
    Timestamp string      \`json:"timestamp"\`
}

// HealthResponse represents the health check response
type HealthResponse struct {
    Status    string \`json:"status"\`
    Timestamp string \`json:"timestamp"\`
    Service   string \`json:"service"\`
}

// ProcessService handles business logic
type ProcessService struct{}

// ProcessData processes the input data
func (s *ProcessService) ProcessData(data interface{}, options interface{}) (interface{}, error) {
    // Validate input
    if data == nil {
        return nil, fmt.Errorf("invalid input data")
    }

    // TODO: Implement main business logic
    result := map[string]interface{}{
        "processed":      true,
        "input":         data,
        "options":       options,
        "processingTime": time.Now().Format(time.RFC3339),
    }

    log.Println("Data processed successfully")
    return result, nil
}

// ProcessController handles HTTP requests
type ProcessController struct {
    service *ProcessService
}

// NewProcessController creates a new controller
func NewProcessController() *ProcessController {
    return &ProcessController{
        service: &ProcessService{},
    }
}

// ProcessDataHandler handles POST /api/process
func (c *ProcessController) ProcessDataHandler(w http.ResponseWriter, r *http.Request) {
    var request ProcessRequest

    // Parse request body
    decoder := json.NewDecoder(r.Body)
    if err := decoder.Decode(&request); err != nil {
        c.sendError(w, http.StatusBadRequest, "Invalid request body")
        return
    }

    // Process data
    result, err := c.service.ProcessData(request.Data, request.Options)
    if err != nil {
        log.Printf("Processing error: %v", err)
        c.sendError(w, http.StatusBadRequest, err.Error())
        return
    }

    // Send success response
    response := APIResponse{
        Success:   true,
        Data:      result,
        Timestamp: time.Now().Format(time.RFC3339),
    }

    c.sendJSON(w, http.StatusOK, response)
}

// HealthHandler handles GET /health
func (c *ProcessController) HealthHandler(w http.ResponseWriter, r *http.Request) {
    response := HealthResponse{
        Status:    "healthy",
        Timestamp: time.Now().Format(time.RFC3339),
        Service:   "${description}",
    }

    c.sendJSON(w, http.StatusOK, response)
}

// Helper methods
func (c *ProcessController) sendJSON(w http.ResponseWriter, status int, data interface{}) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    json.NewEncoder(w).Encode(data)
}

func (c *ProcessController) sendError(w http.ResponseWriter, status int, message string) {
    response := APIResponse{
        Success:   false,
        Error:     message,
        Timestamp: time.Now().Format(time.RFC3339),
    }

    c.sendJSON(w, status, response)
}

// Middleware for logging
func loggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        log.Printf("%s - %s %s", time.Now().Format(time.RFC3339), r.Method, r.URL.Path)
        next.ServeHTTP(w, r)
    })
}

func main() {
    // Create controller
    controller := NewProcessController()

    // Create router
    r := mux.NewRouter()

    // Routes
    r.HandleFunc("/api/process", controller.ProcessDataHandler).Methods("POST")
    r.HandleFunc("/health", controller.HealthHandler).Methods("GET")

    // Middleware
    r.Use(loggingMiddleware)

    // CORS
    corsHandler := handlers.CORS(
        handlers.AllowedOrigins([]string{"http://localhost:3000"}),
        handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE"}),
        handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
    )(r)

    // Start server
    port := ":8080"
    log.Printf("Starting server on port %s", port)
    log.Printf("Service: %s", "${description}")

    if err := http.ListenAndServe(port, corsHandler); err != nil {
        log.Fatal("Server failed to start:", err)
    }
}`;
  }

  private generateGenericBackendCode(description: string, role?: string): string {
    return `# ${description}
# Generated by BackendIntelligenceEngine
# Role: ${role || 'developer'}

"""
Generic backend implementation for: ${description}
This is a basic template that can be adapted for any backend technology.
"""

import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class BackendService:
    """
    Main service class for ${description}
    """

    def __init__(self):
        self.name = "${description}"
        logger.info(f"Initializing {self.name} service")

    async def process_data(self, data: Any, options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Process data with business logic

        Args:
            data: Input data to process
            options: Processing options

        Returns:
            Dict containing processing result
        """
        try:
            # Validate input
            if data is None:
                raise ValueError("Invalid input data")

            # Process data
            result = await self._process_business_logic(data, options or {})

            logger.info("Data processed successfully")
            return {
                "success": True,
                "data": result,
                "timestamp": datetime.now().isoformat()
            }

        except Exception as e:
            logger.error(f"Processing error: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }

    async def _process_business_logic(self, data: Any, options: Dict[str, Any]) -> Dict[str, Any]:
        """
        Internal method for business logic processing
        """
        # TODO: Implement main business logic
        return {
            "processed": True,
            "input": data,
            "options": options,
            "processing_time": datetime.now().isoformat()
        }

    def health_check(self) -> Dict[str, Any]:
        """
        Health check endpoint
        """
        return {
            "status": "healthy",
            "service": self.name,
            "timestamp": datetime.now().isoformat()
        }

# Error handling
class ServiceError(Exception):
    """Custom service error"""
    pass

class ValidationError(ServiceError):
    """Input validation error"""
    pass

# Input validation
def validate_input(data: Any) -> bool:
    """
    Validate input data
    """
    if data is None:
        raise ValidationError("Data cannot be None")

    # Add more validation logic as needed
    return True

# Security helpers
def sanitize_input(data: str) -> str:
    """
    Sanitize string input
    """
    if not isinstance(data, str):
        return data

    # Remove potentially dangerous characters
    dangerous_chars = ['<', '>', '&', '"', "'"]
    for char in dangerous_chars:
        data = data.replace(char, '')

    return data

# Main entry point
async def main():
    """
    Main entry point for the service
    """
    service = BackendService()

    # Example usage
    test_data = {"message": "Hello, World!"}
    result = await service.process_data(test_data)

    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())`;
  }

  private async applyQualityStandards(code: string, quality: string): Promise<string> {
    // Apply quality standards based on level
    switch (quality) {
      case 'enterprise':
        return this.addEnterpriseFeatures(code);
      case 'production':
        return this.addProductionFeatures(code);
      default:
        return code;
    }
  }

  private addSecurityFeatures(code: string, technology: string): string {
    // Add security features if not present
    if (!code.includes('helmet') && technology.toLowerCase().includes('node')) {
      // Security headers already included in Node.js template
    }

    if (!code.includes('CORS') && !code.includes('cors')) {
      // CORS already included in templates
    }

    return code;
  }

  private addPerformanceOptimizations(code: string, technology: string): string {
    // Add performance optimizations
    if (!code.includes('cache') && !code.includes('Cache')) {
      // Could add caching recommendations
    }

    return code;
  }

  private optimizePerformance(code: string, technology: string): string {
    // Performance optimizations
    return code;
  }

  private optimizeSecurity(code: string, technology: string): string {
    // Security optimizations
    return code;
  }

  private optimizeScalability(code: string, technology: string): string {
    // Scalability optimizations
    return code;
  }

  private addEnterpriseFeatures(code: string): string {
    // Add enterprise-level features
    return code;
  }

  private addProductionFeatures(code: string): string {
    // Add production-ready features
    return code;
  }
}
