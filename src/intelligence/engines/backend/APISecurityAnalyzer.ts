/**
 * Backend API Security Analyzer
 *
 * Specialized analyzer for backend API security, OWASP Top 10 compliance,
 * authentication, authorization, and security best practices.
 * Extracted from BackendIntelligenceEngine for better modularity.
 */

import { SecurityAnalysis } from '../../CategoryIntelligenceEngine.js';

/**
 * Analyze backend code for API security vulnerabilities and best practices
 */
export class APISecurityAnalyzer {
  /**
   * Analyze backend code for security compliance (OWASP Top 10 2021)
   */
  async analyzeSecurity(
    code: string,
    technology: string,
    _insights: any
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
      recommendations.push('Use bcrypt or similar for password hashing');
      score -= 25;
    }

    if (code.includes('md5') || code.includes('sha1')) {
      vulnerabilities.push('A02: Use of weak cryptographic algorithms');
      recommendations.push('Use SHA-256 or stronger cryptographic algorithms');
      score -= 20;
    }

    if (!code.includes('https') && code.includes('http')) {
      vulnerabilities.push('A02: Insecure communication protocol');
      recommendations.push('Use HTTPS for all communications');
      score -= 15;
    }

    // 3. A03:2021 – Injection
    if (code.includes('eval(') || code.includes('Function(')) {
      vulnerabilities.push('A03: Code injection vulnerability');
      recommendations.push('Avoid eval() and Function() constructors');
      score -= 30;
    }

    if (code.includes('query') && code.includes('+') && !code.includes('prepare')) {
      vulnerabilities.push('A03: Potential SQL injection');
      recommendations.push('Use parameterized queries or prepared statements');
      score -= 25;
    }

    if (code.includes('exec(') || code.includes('spawn(')) {
      vulnerabilities.push('A03: Command injection risk');
      recommendations.push('Sanitize inputs for system commands');
      score -= 20;
    }

    // 4. A04:2021 – Insecure Design
    if (!code.includes('rate') && (code.includes('login') || code.includes('auth'))) {
      vulnerabilities.push('A04: Missing rate limiting on authentication');
      recommendations.push('Implement rate limiting for login attempts');
      score -= 10;
    }

    // 5. A05:2021 – Security Misconfiguration
    if (code.includes('debug') && code.includes('true')) {
      vulnerabilities.push('A05: Debug mode enabled in production');
      recommendations.push('Disable debug mode in production');
      score -= 12;
    }

    if (!code.includes('helmet') && technology.toLowerCase().includes('node')) {
      vulnerabilities.push('A05: Missing security headers');
      recommendations.push('Use helmet.js for security headers');
      score -= 8;
    }

    // 6. A06:2021 – Vulnerable and Outdated Components
    if (code.includes('require(') || code.includes('import')) {
      // This would need package analysis, simplified check
      recommendations.push('Regularly update dependencies and check for vulnerabilities');
    }

    // 7. A07:2021 – Identification and Authentication Failures
    if (code.includes('session') && !code.includes('secure')) {
      vulnerabilities.push('A07: Insecure session configuration');
      recommendations.push('Configure secure session settings');
      score -= 12;
    }

    if (code.includes('jwt') && !code.includes('verify')) {
      vulnerabilities.push('A07: JWT without proper verification');
      recommendations.push('Always verify JWT tokens');
      score -= 15;
    }

    // 8. A08:2021 – Software and Data Integrity Failures
    if (!code.includes('validate') && (code.includes('req.body') || code.includes('input'))) {
      vulnerabilities.push('A08: Missing input validation');
      recommendations.push('Validate all input data');
      score -= 15;
    }

    // 9. A09:2021 – Security Logging and Monitoring Failures
    if (!code.includes('log') && !code.includes('audit')) {
      vulnerabilities.push('A09: Insufficient security logging');
      recommendations.push('Implement comprehensive security logging');
      score -= 10;
    }

    // 10. A10:2021 – Server-Side Request Forgery (SSRF)
    if (code.includes('http.get') || code.includes('fetch(')) {
      vulnerabilities.push('A10: Potential SSRF vulnerability');
      recommendations.push('Validate and whitelist external URLs');
      score -= 12;
    }

    // Technology-specific security checks
    score += this.analyzeTechnologySpecificSecurity(
      code,
      technology,
      vulnerabilities,
      recommendations
    );

    // Additional backend security patterns
    this.analyzeAdditionalSecurityPatterns(code, vulnerabilities, recommendations);

    return {
      score: Math.max(0, Math.min(100, score)),
      vulnerabilities,
      recommendations: [...recommendations, ...this.getSecurityRecommendations(technology)],
    };
  }

  /**
   * Analyze technology-specific security considerations
   */
  private analyzeTechnologySpecificSecurity(
    code: string,
    technology: string,
    vulnerabilities: string[],
    recommendations: string[]
  ): number {
    let scoreAdjustment = 0;
    const tech = technology.toLowerCase();

    if (tech.includes('node')) {
      // Node.js-specific security
      if (code.includes('require') && code.includes('..')) {
        vulnerabilities.push('Path traversal vulnerability in require()');
        recommendations.push('Sanitize file paths and avoid dynamic requires');
        scoreAdjustment -= 15;
      }

      if (!code.includes('cors') && code.includes('express')) {
        vulnerabilities.push('Missing CORS configuration');
        recommendations.push('Configure CORS properly');
        scoreAdjustment -= 8;
      }

      if (code.includes('helmet')) {
        scoreAdjustment += 8; // Bonus for security headers
      }
    }

    if (tech.includes('python')) {
      // Python-specific security
      if (code.includes('pickle') && code.includes('load')) {
        vulnerabilities.push('Unsafe deserialization with pickle');
        recommendations.push('Avoid pickle for untrusted data');
        scoreAdjustment -= 20;
      }

      if (code.includes('os.system') || code.includes('subprocess.call')) {
        vulnerabilities.push('Command injection risk in system calls');
        recommendations.push('Use subprocess with proper argument handling');
        scoreAdjustment -= 15;
      }
    }

    if (tech.includes('java')) {
      // Java-specific security
      if (code.includes('ObjectInputStream')) {
        vulnerabilities.push('Java deserialization vulnerability');
        recommendations.push('Validate serialized objects or use safer alternatives');
        scoreAdjustment -= 18;
      }

      if (code.includes('Runtime.getRuntime().exec')) {
        vulnerabilities.push('Command injection risk in Runtime.exec');
        recommendations.push('Use ProcessBuilder with proper validation');
        scoreAdjustment -= 15;
      }
    }

    if (tech.includes('php')) {
      // PHP-specific security
      if (code.includes('eval(') || code.includes('system(')) {
        vulnerabilities.push('Code execution vulnerabilities');
        recommendations.push('Avoid eval() and system() functions');
        scoreAdjustment -= 25;
      }

      if (code.includes('$_GET') || code.includes('$_POST')) {
        if (!code.includes('filter_') && !code.includes('validate')) {
          vulnerabilities.push('Unvalidated user input');
          recommendations.push('Use filter_input() for input validation');
          scoreAdjustment -= 12;
        }
      }
    }

    return scoreAdjustment;
  }

  /**
   * Analyze additional security patterns and best practices
   */
  private analyzeAdditionalSecurityPatterns(
    code: string,
    vulnerabilities: string[],
    recommendations: string[]
  ): void {
    // API Key exposure
    if (code.match(/['"](sk_|pk_|api_key_)[a-zA-Z0-9]+['"]/)) {
      vulnerabilities.push('API keys exposed in code');
      recommendations.push('Use environment variables for API keys');
    }

    // Hardcoded credentials
    if (code.match(/password\s*[:=]\s*['"][^'"]+['"]/i)) {
      vulnerabilities.push('Hardcoded passwords detected');
      recommendations.push('Use environment variables for credentials');
    }

    // Missing error handling
    if (!code.includes('try') && !code.includes('catch')) {
      vulnerabilities.push('Missing error handling may expose sensitive information');
      recommendations.push('Implement comprehensive error handling');
    }

    // File upload security
    if (code.includes('upload') || code.includes('multer')) {
      if (!code.includes('limit') && !code.includes('fileSize')) {
        vulnerabilities.push('File upload without size limits');
        recommendations.push('Implement file size and type restrictions');
      }
    }

    // Database connection security
    if (code.includes('mongodb://') || code.includes('mysql://')) {
      if (!code.includes('ssl') && !code.includes('tls')) {
        vulnerabilities.push('Database connection without encryption');
        recommendations.push('Use SSL/TLS for database connections');
      }
    }
  }

  /**
   * Get technology-specific security recommendations
   */
  private getSecurityRecommendations(technology: string): string[] {
    const baseRecommendations = [
      'Implement proper authentication and authorization',
      'Use HTTPS for all communications',
      'Validate and sanitize all inputs',
      'Use parameterized queries to prevent SQL injection',
      'Implement rate limiting and throttling',
      'Use secure headers (CORS, CSP, HSTS, etc.)',
      'Implement comprehensive logging and monitoring',
      'Regular security audits and penetration testing',
      'Keep dependencies up to date',
      'Use environment variables for sensitive configuration',
    ];

    const tech = technology.toLowerCase();

    if (tech.includes('node')) {
      baseRecommendations.push(
        'Use helmet.js for Express.js security headers',
        'Implement CSRF protection',
        'Use bcrypt for password hashing',
        'Configure secure sessions',
        'Avoid eval() and similar functions'
      );
    }

    if (tech.includes('python')) {
      baseRecommendations.push(
        'Use Django/Flask security middleware',
        'Implement proper session management',
        'Use secrets module for cryptographic operations',
        'Validate file uploads properly',
        'Avoid pickle for untrusted data'
      );
    }

    if (tech.includes('java')) {
      baseRecommendations.push(
        'Use Spring Security framework',
        'Implement proper authentication filters',
        'Validate serialized objects',
        'Use secure random number generation',
        'Implement proper exception handling'
      );
    }

    return baseRecommendations;
  }

  /**
   * Add security features to code if missing
   */
  addSecurityFeatures(code: string, technology: string): string {
    let secureCode = code;
    const tech = technology.toLowerCase();

    // Add security headers for Node.js/Express
    if (tech.includes('node') && code.includes('express')) {
      if (!code.includes('helmet')) {
        secureCode = `const helmet = require('helmet');\n${secureCode}`;
        secureCode = secureCode.replace(
          'app.use(express.json())',
          `app.use(helmet());\napp.use(express.json())`
        );
      }

      if (!code.includes('cors')) {
        secureCode = `const cors = require('cors');\n${secureCode}`;
        secureCode = secureCode.replace(
          'app.use(helmet())',
          `app.use(cors({ origin: process.env.ALLOWED_ORIGINS }));\napp.use(helmet())`
        );
      }
    }

    // Add input validation
    if (!code.includes('joi') && !code.includes('zod') && !code.includes('yup')) {
      if (tech.includes('node')) {
        secureCode = `const Joi = require('joi');\n${secureCode}`;
      }
    }

    // Add rate limiting
    if (tech.includes('node') && !code.includes('rate-limit')) {
      secureCode = `const rateLimit = require('express-rate-limit');\n${secureCode}`;
      secureCode = secureCode.replace(
        'app.use(cors',
        `const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });\napp.use(limiter);\napp.use(cors`
      );
    }

    return secureCode;
  }

  /**
   * Generate security checklist for backend applications
   */
  generateSecurityChecklist(technology: string): string[] {
    const checklist = [
      '✓ Authentication and authorization implemented',
      '✓ Input validation on all endpoints',
      '✓ SQL injection protection (parameterized queries)',
      '✓ XSS protection (output encoding)',
      '✓ CSRF protection enabled',
      '✓ Security headers configured (CORS, CSP, HSTS)',
      '✓ Rate limiting implemented',
      '✓ HTTPS enforced',
      '✓ Secure session management',
      '✓ Error handling without information disclosure',
      '✓ Security logging and monitoring',
      '✓ Regular dependency updates',
      '✓ Environment variables for secrets',
      '✓ File upload restrictions',
      '✓ Database connection security',
    ];

    const tech = technology.toLowerCase();

    if (tech.includes('node')) {
      checklist.push(
        '✓ Helmet.js security headers',
        '✓ bcrypt for password hashing',
        '✓ JWT token verification',
        '✓ Express security middleware'
      );
    }

    if (tech.includes('python')) {
      checklist.push(
        '✓ Django/Flask security middleware',
        '✓ Proper serialization handling',
        '✓ Template auto-escaping enabled'
      );
    }

    return checklist;
  }

  /**
   * Analyze API endpoints for security vulnerabilities
   */
  analyzeAPIEndpoints(code: string): {
    endpoints: Array<{
      path: string;
      method: string;
      vulnerabilities: string[];
      recommendations: string[];
    }>;
    overallScore: number;
  } {
    const endpoints: Array<{
      path: string;
      method: string;
      vulnerabilities: string[];
      recommendations: string[];
    }> = [];

    // Extract API endpoints (simplified regex)
    const routeMatches =
      code.match(/(app|router)\.(get|post|put|delete|patch)\s*\(\s*['"][^'"]+['"][^}]*/g) || [];

    let totalScore = 85;

    routeMatches.forEach(route => {
      const methodMatch = route.match(/\.(get|post|put|delete|patch)/);
      const pathMatch = route.match(/['"]([^'"]+)['"]/);

      if (methodMatch && pathMatch) {
        const method = methodMatch[1].toUpperCase();
        const path = pathMatch[1];
        const vulnerabilities: string[] = [];
        const recommendations: string[] = [];

        // Check for authentication
        if (!route.includes('auth') && !route.includes('authenticate')) {
          vulnerabilities.push('Missing authentication check');
          recommendations.push('Add authentication middleware');
          totalScore -= 5;
        }

        // Check for validation
        if ((method === 'POST' || method === 'PUT') && !route.includes('validate')) {
          vulnerabilities.push('Missing input validation');
          recommendations.push('Add input validation');
          totalScore -= 5;
        }

        endpoints.push({ path, method, vulnerabilities, recommendations });
      }
    });

    return {
      endpoints,
      overallScore: Math.max(0, totalScore),
    };
  }
}
