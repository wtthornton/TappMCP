/**
 * Backend Analyzer - Core Module
 *
 * Refactored core backend analysis engine that coordinates specialized analyzers.
 * This replaces the monolithic BackendIntelligenceEngine with a modular approach.
 */

import {
  BaseCategoryIntelligenceEngine,
  CodeAnalysis,
  Context7Data,
  ValidationResult,
  QualityAnalysis,
  MaintainabilityAnalysis,
  SecurityAnalysis,
  PerformanceAnalysis,
} from '../../CategoryIntelligenceEngine.js';
import { CodeGenerationRequest } from '../../UnifiedCodeIntelligenceEngine.js';
import { APISecurityAnalyzer } from './APISecurityAnalyzer.js';
import { PerformanceAnalyzer } from './PerformanceAnalyzer.js';
import { ScalabilityAnalyzer } from './ScalabilityAnalyzer.js';

/**
 * Extended CodeAnalysis interface for backend-specific analysis
 */
interface BackendCodeAnalysis extends CodeAnalysis {
  scalability?: any; // From ScalabilityAnalyzer
  apiSecurity?: SecurityAnalysis; // From APISecurityAnalyzer
}

/**
 * Refactored Backend Intelligence Engine with modular architecture
 */
export class BackendAnalyzer extends BaseCategoryIntelligenceEngine {
  category = 'backend';
  technologies = ['Node.js', 'Python', 'Java', 'Go', 'PHP', 'Ruby', '.NET', 'Rust'];

  // Specialized analyzers
  private apiSecurityAnalyzer = new APISecurityAnalyzer();
  private performanceAnalyzer = new PerformanceAnalyzer();
  private scalabilityAnalyzer = new ScalabilityAnalyzer();

  /**
   * Analyze backend code with security, performance, and scalability considerations
   */
  async analyzeCode(
    code: string,
    technology: string,
    context: Context7Data
  ): Promise<BackendCodeAnalysis> {
    const insights = await this.getTechnologyInsights(technology, context);

    // Use specialized analyzers
    const quality = await this.analyzeBackendQuality(code, technology, insights);
    const maintainability = await this.analyzeMaintainability(code, technology, insights);
    const performance = await this.performanceAnalyzer.analyzePerformance(
      code,
      technology,
      insights
    );
    const security = await this.apiSecurityAnalyzer.analyzeSecurity(code, technology, insights);
    const scalability = await this.scalabilityAnalyzer.analyzeScalability(
      code,
      technology,
      insights
    );

    return {
      quality,
      maintainability,
      performance,
      security,
      scalability,
      apiSecurity: security, // Additional security analysis reference
    };
  }

  /**
   * Generate backend code with security, performance, and scalability best practices
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

    // Add security features using specialized analyzers
    code = this.apiSecurityAnalyzer.addSecurityFeatures(code, technology);

    // Add scalability considerations
    code = this.addScalabilityFeatures(code, technology);

    return code;
  }

  /**
   * Get backend-specific best practices
   */
  async getBestPractices(technology: string, context: Context7Data): Promise<string[]> {
    const practices = [
      'Use async/await for I/O operations',
      'Implement proper error handling and logging',
      'Use environment variables for configuration',
      'Implement input validation and sanitization',
      'Use HTTPS for all communications',
      'Implement rate limiting and throttling',
      'Use connection pooling for databases',
      'Implement proper authentication and authorization',
      'Follow REST API design principles',
      'Use caching strategies for performance',
      'Implement health check endpoints',
      'Use structured logging with correlation IDs',
      'Implement graceful shutdown handling',
      'Use database migrations for schema changes',
      'Follow security best practices (OWASP guidelines)',
    ];

    // Add technology-specific practices from Context7
    const insights = await this.getTechnologyInsights(technology, context);
    practices.push(...insights.bestPractices);

    // Add analyzer-specific recommendations
    practices.push(...this.performanceAnalyzer.getPerformanceRecommendations(technology));
    practices.push(...this.scalabilityAnalyzer.getScalabilityRecommendations(technology));

    return practices;
  }

  /**
   * Get backend-specific anti-patterns
   */
  async getAntiPatterns(technology: string, context: Context7Data): Promise<string[]> {
    const antiPatterns = [
      'Synchronous I/O operations in request handlers',
      'Storing sensitive data in code or logs',
      'Using string concatenation for SQL queries',
      'Missing error handling for async operations',
      'Hardcoded configuration values',
      'Global state in stateless services',
      'Missing input validation',
      'Exposing stack traces to clients',
      'Not using HTTPS in production',
      'Missing rate limiting on public APIs',
      'Large payloads without pagination',
      'Not implementing graceful shutdown',
      'Missing health check endpoints',
      'Using session state in horizontally scaled services',
      'Ignoring security headers',
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
    if (!code.includes('https') && code.includes('http://')) {
      errors.push('Insecure HTTP protocol used instead of HTTPS');
    }

    // API validation
    if (code.includes('app.get') || code.includes('app.post')) {
      if (!code.includes('authentication') && !code.includes('auth')) {
        warnings.push('API endpoints may lack authentication');
      }
    }

    // Error handling validation
    if (code.includes('async') && !code.includes('try') && !code.includes('catch')) {
      warnings.push('Async operations without proper error handling');
    }

    // Use specialized analyzers for detailed validation
    const analysis = await this.analyzeCode(code, technology, {
      insights: { patterns: [], recommendations: [], qualityMetrics: { overall: 0 } },
    });

    // Add security suggestions
    if (analysis.security) {
      suggestions.push(...analysis.security.recommendations);
    }

    // Add performance suggestions
    if (analysis.performance) {
      suggestions.push(...analysis.performance.optimizations);
    }

    // Add scalability suggestions
    if (analysis.scalability) {
      suggestions.push(...analysis.scalability.optimizations);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * Optimize backend code for performance, security, and scalability
   */
  async optimizeCode(code: string, technology: string, context: Context7Data): Promise<string> {
    let optimizedCode = code;

    // Apply security features
    optimizedCode = this.apiSecurityAnalyzer.addSecurityFeatures(optimizedCode, technology);

    // Apply scalability features
    optimizedCode = this.addScalabilityFeatures(optimizedCode, technology);

    // Apply Context7 insights
    const insights = await this.getTechnologyInsights(technology, context);
    optimizedCode = await this.applyContext7Insights(optimizedCode, insights);

    return optimizedCode;
  }

  /**
   * Private helper methods (core functionality)
   */
  private async analyzeBackendQuality(
    code: string,
    technology: string,
    _insights: any
  ): Promise<QualityAnalysis> {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 85;

    // Backend-specific quality checks

    // Error handling
    if (code.includes('async') && !code.includes('try')) {
      issues.push('Async operations without error handling');
      score -= 15;
    }

    // Input validation
    if (code.includes('req.body') && !code.includes('validate')) {
      issues.push('Missing input validation');
      score -= 12;
    }

    // Environment variables
    if (code.includes('localhost') || code.includes('127.0.0.1')) {
      suggestions.push('Use environment variables for configuration');
      score -= 8;
    }

    // Logging
    if (!code.includes('log') && !code.includes('console.')) {
      suggestions.push('Add proper logging for debugging and monitoring');
      score -= 5;
    }

    // Security patterns (boost score for good practices)
    if (code.includes('bcrypt')) {
      score += 8; // Good password hashing
    }

    if (code.includes('jwt') && code.includes('sign')) {
      score += 6; // JWT token implementation
    }

    if (code.includes('helmet') || code.includes('cors')) {
      score += 5; // Security middleware
    }

    if (code.includes('rateLimit') || code.includes('rate-limit')) {
      score += 7; // Rate limiting implementation
    }

    // Technology-specific quality checks
    score += this.analyzeTechnologySpecificQuality(code, technology, issues, suggestions);

    return {
      score: Math.max(0, score),
      issues,
      suggestions,
    };
  }

  private async analyzeMaintainability(
    code: string,
    _technology: string,
    _insights: any
  ): Promise<MaintainabilityAnalysis> {
    let score = 80;
    const suggestions: string[] = [];

    // Function length analysis
    const functions = code.match(/function\s+\w+\s*\([^)]*\)\s*{[^}]*}/g) || [];
    const longFunctions = functions.filter(fn => fn.split('\n').length > 50);

    if (longFunctions.length > 0) {
      suggestions.push('Break down large functions into smaller, focused functions');
      score -= 10;
    }

    // Code organization
    const codeLines = code.split('\n').filter(line => line.trim().length > 0).length;
    if (codeLines > 500 && !code.includes('class') && !code.includes('module')) {
      suggestions.push('Consider organizing code into classes or modules');
      score -= 8;
    }

    // Comments and documentation
    const commentCount = (code.match(/\/\//g) || []).length + (code.match(/\/\*/g) || []).length;
    const commentRatio = commentCount / codeLines;

    if (commentRatio < 0.1) {
      suggestions.push('Add more comments to explain complex business logic');
      score -= 7;
    }

    // Complexity indicators
    const complexityIndicators = [
      (code.match(/if\s*\(/g) || []).length,
      (code.match(/for\s*\(/g) || []).length,
      (code.match(/while\s*\(/g) || []).length,
      (code.match(/switch\s*\(/g) || []).length,
    ];
    const totalComplexity = complexityIndicators.reduce((a, b) => a + b, 0);

    return {
      score: Math.max(0, score),
      complexity: totalComplexity,
      readability: commentRatio * 100,
      testability: this.calculateTestability(code),
      suggestions,
    };
  }

  private analyzeTechnologySpecificQuality(
    code: string,
    technology: string,
    issues: string[],
    suggestions: string[]
  ): number {
    let scoreAdjustment = 0;
    const tech = technology.toLowerCase();

    if (tech.includes('node')) {
      // Node.js specific checks
      if (code.includes('require(') && code.includes('import ')) {
        issues.push('Mixed module systems (require and import)');
        scoreAdjustment -= 5;
      }

      if (!code.includes('express') && code.includes('http.createServer')) {
        suggestions.push('Consider using Express.js for better structure');
        scoreAdjustment -= 3;
      }

      if (code.includes('process.exit')) {
        issues.push('Using process.exit() can prevent graceful shutdown');
        scoreAdjustment -= 8;
      }
    }

    if (tech.includes('python')) {
      // Python specific checks
      if (code.includes('import *')) {
        issues.push('Wildcard imports reduce code clarity');
        scoreAdjustment -= 5;
      }

      if (!code.includes('if __name__ == "__main__":')) {
        suggestions.push('Use main guard for executable scripts');
        scoreAdjustment -= 3;
      }
    }

    if (tech.includes('java')) {
      // Java specific checks
      if (code.includes('System.out.println') && !code.includes('logger')) {
        suggestions.push('Use logging framework instead of System.out');
        scoreAdjustment -= 5;
      }
    }

    return scoreAdjustment;
  }

  private calculateTestability(code: string): number {
    let testability = 70;

    // Pure functions are more testable
    if (code.includes('return') && !code.includes('global') && !code.includes('this.')) {
      testability += 15;
    }

    // Dependency injection improves testability
    if (code.includes('inject') || code.includes('dependency')) {
      testability += 10;
    }

    // Large functions are harder to test
    const functions = code.match(/function\s+\w+\s*\([^)]*\)\s*{[^}]*}/g) || [];
    const largeFunctions = functions.filter(fn => fn.split('\n').length > 30);
    testability -= largeFunctions.length * 5;

    return Math.max(0, Math.min(100, testability));
  }

  private generateBackendCode(description: string, technology: string, role?: string): string {
    const tech = technology.toLowerCase();

    if (tech.includes('node')) {
      return this.generateNodeJsCode(description, role);
    } else if (tech.includes('python')) {
      return this.generatePythonCode(description, role);
    } else if (tech.includes('java')) {
      return this.generateJavaCode(description, role);
    } else if (tech.includes('go')) {
      return this.generateGoCode(description, role);
    }

    return this.generateGenericBackendCode(description, technology, role);
  }

  private generateNodeJsCode(description: string, role?: string): string {
    return `// ${description}
// Generated by BackendAnalyzer
// Technology: Node.js
// Role: ${role || 'developer'}

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

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
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Main API routes
app.get('/api/data', async (req, res) => {
  try {
    // TODO: Implement business logic here
    const data = await fetchData();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

const server = app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});

async function fetchData() {
  // TODO: Implement data fetching logic
  return { message: 'Hello World' };
}

module.exports = app;`;
  }

  private generatePythonCode(description: string, role?: string): string {
    return `# ${description}
# Generated by BackendAnalyzer
# Technology: Python
# Role: ${role || 'developer'}

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
import logging
from typing import Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Security configuration
CORS(app, origins=os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000').split(','))

# Rate limiting
limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["100 per hour"]
)

@app.route('/health', methods=['GET'])
def health_check() -> Dict[str, Any]:
    """Health check endpoint for load balancers."""
    return {
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat()
    }, 200

@app.route('/api/data', methods=['GET'])
@limiter.limit("10 per minute")
def get_data() -> Dict[str, Any]:
    """Main API endpoint."""
    try:
        # TODO: Implement business logic here
        data = fetch_data()
        logger.info("Data fetched successfully")
        return {'success': True, 'data': data}
    except Exception as e:
        logger.error(f"Error fetching data: {e}")
        return {'error': 'Internal server error'}, 500

def fetch_data() -> Dict[str, str]:
    """Fetch data from data source."""
    # TODO: Implement data fetching logic
    return {'message': 'Hello World'}

@app.errorhandler(500)
def internal_error(error):
    """Global error handler."""
    logger.error(f"Internal error: {error}")
    return {'error': 'Internal server error'}, 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)`;
  }

  private generateJavaCode(description: string, role?: string): string {
    return `// ${description}
// Generated by BackendAnalyzer
// Technology: Java Spring Boot
// Role: ${role || 'developer'}

package com.example.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

@SpringBootApplication
@RestController
@RequestMapping("/api")
public class BackendApplication {

    private static final Logger logger = LoggerFactory.getLogger(BackendApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("timestamp", java.time.Instant.now().toString());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/data")
    public ResponseEntity<Map<String, Object>> getData() {
        try {
            Map<String, Object> data = fetchData();
            logger.info("Data fetched successfully");

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", data);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching data", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal server error");

            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    private Map<String, Object> fetchData() {
        // TODO: Implement business logic here
        Map<String, Object> data = new HashMap<>();
        data.put("message", "Hello World");
        return data;
    }
}`;
  }

  private generateGoCode(description: string, role?: string): string {
    return `// ${description}
// Generated by BackendAnalyzer
// Technology: Go
// Role: ${role || 'developer'}

package main

import (
    "context"
    "encoding/json"
    "log"
    "net/http"
    "os"
    "os/signal"
    "time"
    "syscall"
)

type HealthResponse struct {
    Status    string \`json:"status"\`
    Timestamp string \`json:"timestamp"\`
}

type DataResponse struct {
    Success bool        \`json:"success"\`
    Data    interface{} \`json:"data,omitempty"\`
    Error   string      \`json:"error,omitempty"\`
}

func main() {
    mux := http.NewServeMux()

    // Health check endpoint
    mux.HandleFunc("/health", healthHandler)

    // API endpoints
    mux.HandleFunc("/api/data", dataHandler)

    // Create server
    server := &http.Server{
        Addr:    ":8080",
        Handler: mux,
    }

    // Start server in goroutine
    go func() {
        log.Println("Server starting on :8080")
        if err := server.ListenAndServe(); err != http.ErrServerClosed {
            log.Fatalf("Server failed to start: %v", err)
        }
    }()

    // Graceful shutdown
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    log.Println("Shutting down server...")
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    if err := server.Shutdown(ctx); err != nil {
        log.Fatalf("Server forced to shutdown: %v", err)
    }

    log.Println("Server exited")
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")

    response := HealthResponse{
        Status:    "healthy",
        Timestamp: time.Now().UTC().Format(time.RFC3339),
    }

    json.NewEncoder(w).Encode(response)
}

func dataHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")

    if r.Method != http.MethodGet {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    data, err := fetchData()
    if err != nil {
        log.Printf("Error fetching data: %v", err)
        response := DataResponse{
            Success: false,
            Error:   "Internal server error",
        }
        w.WriteHeader(http.StatusInternalServerError)
        json.NewEncoder(w).Encode(response)
        return
    }

    response := DataResponse{
        Success: true,
        Data:    data,
    }

    json.NewEncoder(w).Encode(response)
}

func fetchData() (map[string]interface{}, error) {
    // TODO: Implement business logic here
    data := map[string]interface{}{
        "message": "Hello World",
    }
    return data, nil
}`;
  }

  private generateGenericBackendCode(
    description: string,
    technology: string,
    role?: string
  ): string {
    return `// ${description}
// Generated by BackendAnalyzer
// Technology: ${technology}
// Role: ${role || 'developer'}

// TODO: Implement backend service

// Key considerations for ${technology}:
// 1. Security - Authentication, authorization, input validation
// 2. Performance - Async operations, caching, connection pooling
// 3. Scalability - Stateless design, horizontal scaling
// 4. Reliability - Error handling, graceful shutdown, health checks
// 5. Observability - Logging, metrics, tracing

// Recommended patterns:
// - Use environment variables for configuration
// - Implement proper error handling
// - Add health check endpoints
// - Use structured logging
// - Implement rate limiting
// - Follow REST API best practices
// - Use HTTPS in production
// - Implement graceful shutdown`;
  }

  private async applyQualityStandards(code: string, quality: string): Promise<string> {
    // Apply quality-specific enhancements
    if (quality === 'enterprise' || quality === 'production') {
      // Add comprehensive error handling, logging, and monitoring
      if (!code.includes('logger') && !code.includes('console.log')) {
        code = `// Enhanced with enterprise logging\nconst logger = require('./logger');\n\n${code}`;
      }
    }
    return code;
  }

  private addScalabilityFeatures(code: string, technology: string): string {
    const tech = technology.toLowerCase();

    // Add clustering for Node.js
    if (tech.includes('node') && !code.includes('cluster')) {
      code = `// Enhanced with clustering support\nconst cluster = require('cluster');\nconst numCPUs = require('os').cpus().length;\n\nif (cluster.isMaster) {\n  for (let i = 0; i < numCPUs; i++) {\n    cluster.fork();\n  }\n} else {\n${code}\n}`;
    }

    // Add health checks if missing
    if (!code.includes('/health') && !code.includes('/status')) {
      code += `\n\n// Health check endpoint for load balancers\n// GET /health - Returns service health status`;
    }

    return code;
  }
}
