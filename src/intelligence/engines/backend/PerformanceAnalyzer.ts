/**
 * Backend Performance Analyzer
 *
 * Specialized analyzer for backend performance optimization including scalability,
 * caching strategies, load balancing, microservices performance, and resource optimization.
 * Extracted from BackendIntelligenceEngine for better modularity.
 */

import { PerformanceAnalysis } from '../../CategoryIntelligenceEngine.js';

/**
 * Performance analysis with backend-specific metrics
 */
interface BackendPerformanceAnalysis extends PerformanceAnalysis {
  scalabilityScore?: number;
  cachingScore?: number;
  resourceUtilization?: number;
  loadBalancingScore?: number;
}

/**
 * Analyze backend code for performance optimization opportunities
 */
export class PerformanceAnalyzer {
  /**
   * Analyze backend performance patterns and optimizations
   */
  async analyzePerformance(
    code: string,
    technology: string,
    _insights: any
  ): Promise<BackendPerformanceAnalysis> {
    const bottlenecks: string[] = [];
    const optimizations: string[] = [];
    let score = 75;

    // 1. Request Processing Performance

    // Synchronous Processing Issues
    if (this.hasSynchronousProcessing(code)) {
      bottlenecks.push('Synchronous processing blocks event loop');
      optimizations.push('Use async/await for I/O operations');
      score -= 15;
    }

    // Heavy Computational Tasks
    if (this.hasHeavyComputation(code)) {
      bottlenecks.push('CPU-intensive operations in main thread');
      optimizations.push('Move heavy computations to worker threads or queues');
      score -= 12;
    }

    // 2. Database Performance Patterns

    // N+1 Query Problem
    if (this.hasNPlusOnePattern(code)) {
      bottlenecks.push('N+1 query problem detected');
      optimizations.push('Use batch queries or eager loading');
      score -= 20;
    }

    // Missing Connection Pooling
    if (this.hasDatabaseAccess(code) && !this.hasConnectionPooling(code)) {
      bottlenecks.push('Database connections without pooling');
      optimizations.push('Implement connection pooling');
      score -= 15;
    }

    // 3. Caching Performance
    const cachingScore = this.analyzeCaching(code, optimizations);
    score += cachingScore;

    // 4. API Performance Patterns

    // Missing Rate Limiting
    if (this.isApiCode(code) && !this.hasRateLimiting(code)) {
      bottlenecks.push('API endpoints without rate limiting');
      optimizations.push('Implement rate limiting to prevent abuse');
      score -= 8;
    }

    // Large Response Payloads
    if (this.hasLargeResponses(code)) {
      bottlenecks.push('Large response payloads without optimization');
      optimizations.push('Implement response compression and pagination');
      score -= 10;
    }

    // 5. Memory Management

    // Memory Leaks
    if (this.hasMemoryLeakRisk(code)) {
      bottlenecks.push('Potential memory leaks from event listeners/timers');
      optimizations.push('Proper cleanup of resources and event listeners');
      score -= 12;
    }

    // Large Object Creation
    if (this.hasLargeObjectCreation(code)) {
      optimizations.push('Optimize object creation and reuse patterns');
      score -= 5;
    }

    // 6. Concurrency and Scaling
    const scalabilityScore = this.analyzeScalability(code, bottlenecks, optimizations);

    // 7. Resource Optimization
    const resourceUtilization = this.analyzeResourceUtilization(code, optimizations);

    // 8. Load Balancing Considerations
    const loadBalancingScore = this.analyzeLoadBalancing(code, optimizations);

    // 9. Technology-specific Performance
    score += this.analyzeTechnologySpecificPerformance(
      code,
      technology,
      bottlenecks,
      optimizations
    );

    // 10. Microservices Performance
    if (this.isMicroservicesArchitecture(code)) {
      this.analyzeMicroservicesPerformance(code, bottlenecks, optimizations);
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      bottlenecks,
      optimizations,
      scalabilityScore,
      cachingScore,
      resourceUtilization,
      loadBalancingScore,
    };
  }

  /**
   * Check for synchronous processing patterns
   */
  private hasSynchronousProcessing(code: string): boolean {
    const syncPatterns = [
      /fs\.readFileSync/g,
      /fs\.writeFileSync/g,
      /crypto\.pbkdf2Sync/g,
      /child_process\.execSync/g,
      /\.join\(\)/g, // Array.join in loops
    ];

    return syncPatterns.some(pattern => pattern.test(code));
  }

  /**
   * Check for heavy computational patterns
   */
  private hasHeavyComputation(code: string): boolean {
    const computationPatterns = [
      /for\s*\([^)]*;\s*i\s*<\s*\d{4,}/g, // Large loops
      /while\s*\([^)]*\.length\s*>\s*\d{3,}/g, // Large while loops
      /\.sort\(\)/g, // Array sorting
      /JSON\.parse\s*\(\s*[^)]+\s*\)/g, // JSON parsing
      /RegExp.*\.test/g, // Complex regex operations
    ];

    return computationPatterns.some(pattern => pattern.test(code));
  }

  /**
   * Check for N+1 query patterns
   */
  private hasNPlusOnePattern(code: string): boolean {
    // Look for loops with database queries
    const nPlusOnePatterns = [
      /for\s*\([^)]*\)\s*{[^}]*\.find/g,
      /for\s*\([^)]*\)\s*{[^}]*\.query/g,
      /\.map\s*\([^)]*=>\s*{[^}]*\.find/g,
      /\.forEach\s*\([^)]*=>\s*{[^}]*\.query/g,
    ];

    return nPlusOnePatterns.some(pattern => pattern.test(code));
  }

  /**
   * Check for database access patterns
   */
  private hasDatabaseAccess(code: string): boolean {
    const dbPatterns = [
      'mongoose',
      'sequelize',
      'typeorm',
      'prisma',
      'mysql',
      'postgres',
      'mongodb',
      'redis',
      '.find(',
      '.query(',
      '.exec(',
      '.save(',
    ];

    return dbPatterns.some(pattern => code.includes(pattern));
  }

  /**
   * Check for connection pooling
   */
  private hasConnectionPooling(code: string): boolean {
    const poolPatterns = [
      'connectionPool',
      'pool',
      'maxConnections',
      'minConnections',
      'poolSize',
      'createPool',
    ];

    return poolPatterns.some(pattern => code.includes(pattern));
  }

  /**
   * Analyze caching implementation
   */
  private analyzeCaching(code: string, optimizations: string[]): number {
    let cachingScore = 0;
    const cachePatterns = [
      'redis',
      'memcached',
      'cache',
      'Cache',
      'getCache',
      'setCache',
      'memoize',
    ];

    if (cachePatterns.some(pattern => code.includes(pattern))) {
      cachingScore += 15;
      optimizations.push('Good caching implementation detected');
    } else {
      optimizations.push('Consider implementing caching for frequently accessed data');
      cachingScore -= 10;
    }

    // Check for cache invalidation
    if (code.includes('invalidate') || code.includes('clearCache')) {
      cachingScore += 5;
    } else if (cachePatterns.some(pattern => code.includes(pattern))) {
      optimizations.push('Implement cache invalidation strategies');
    }

    return cachingScore;
  }

  /**
   * Check if code is API-related
   */
  private isApiCode(code: string): boolean {
    const apiPatterns = [
      'express',
      'fastify',
      'koa',
      'app.get',
      'app.post',
      'router.',
      'res.json',
      'req.body',
      'middleware',
    ];

    return apiPatterns.some(pattern => code.includes(pattern));
  }

  /**
   * Check for rate limiting
   */
  private hasRateLimiting(code: string): boolean {
    const rateLimitPatterns = [
      'rate-limit',
      'rateLimit',
      'throttle',
      'limiter',
      'express-rate-limit',
      'rate_limit',
    ];

    return rateLimitPatterns.some(pattern => code.includes(pattern));
  }

  /**
   * Check for large response patterns
   */
  private hasLargeResponses(code: string): boolean {
    const largeResponsePatterns = [
      /res\.json\s*\(\s*\w+\.map/g, // Mapping large arrays
      /res\.send\s*\(\s*JSON\.stringify/g, // Manual JSON stringify
      /\.find\(\)\s*$/, // Find all without limit
    ];

    return largeResponsePatterns.some(pattern => pattern.test(code));
  }

  /**
   * Check for memory leak risks
   */
  private hasMemoryLeakRisk(code: string): boolean {
    const memoryLeakPatterns = [
      /addEventListener.*without.*removeEventListener/g,
      /setInterval.*without.*clearInterval/g,
      /setTimeout.*without.*clearTimeout/g,
      /new\s+EventEmitter/g, // EventEmitter without cleanup
    ];

    return (
      memoryLeakPatterns.some(pattern => pattern.test(code)) ||
      (code.includes('addEventListener') && !code.includes('removeEventListener')) ||
      (code.includes('setInterval') && !code.includes('clearInterval'))
    );
  }

  /**
   * Check for large object creation patterns
   */
  private hasLargeObjectCreation(code: string): boolean {
    const largeObjectPatterns = [
      /new\s+Array\s*\(\s*\d{4,}/g, // Large array creation
      /Array\.from\s*\(\s*{\s*length:\s*\d{4,}/g, // Large Array.from
      /new\s+Map\s*\(\)/g, // Map creation in loops
    ];

    return largeObjectPatterns.some(pattern => pattern.test(code));
  }

  /**
   * Analyze scalability patterns
   */
  private analyzeScalability(code: string, bottlenecks: string[], optimizations: string[]): number {
    let scalabilityScore = 80;

    // Check for cluster usage
    if (code.includes('cluster') && code.includes('fork')) {
      scalabilityScore += 15;
      optimizations.push('Good use of Node.js clustering');
    } else if (this.isNodeJsCode(code)) {
      optimizations.push('Consider using Node.js cluster module for multi-core utilization');
      scalabilityScore -= 10;
    }

    // Check for worker threads
    if (code.includes('worker_threads') || code.includes('Worker')) {
      scalabilityScore += 10;
    }

    // Check for queue systems
    if (code.includes('bull') || code.includes('queue') || code.includes('job')) {
      scalabilityScore += 12;
      optimizations.push('Queue system implementation detected');
    } else {
      optimizations.push('Consider implementing job queues for background processing');
    }

    // Check for global state issues
    if (this.hasGlobalState(code)) {
      bottlenecks.push('Global state management affects scalability');
      optimizations.push('Use stateless design patterns for better scalability');
      scalabilityScore -= 15;
    }

    return Math.max(0, Math.min(100, scalabilityScore));
  }

  /**
   * Analyze resource utilization
   */
  private analyzeResourceUtilization(code: string, optimizations: string[]): number {
    let resourceScore = 75;

    // Check for resource cleanup
    if (code.includes('close()') || code.includes('destroy()') || code.includes('cleanup')) {
      resourceScore += 10;
    } else {
      optimizations.push('Ensure proper resource cleanup and disposal');
    }

    // Check for stream usage
    if (code.includes('stream') || code.includes('pipe')) {
      resourceScore += 8;
      optimizations.push('Good use of streams for memory efficiency');
    }

    // Check for buffer management
    if (code.includes('Buffer') && code.includes('alloc')) {
      resourceScore += 5;
    }

    return Math.max(0, Math.min(100, resourceScore));
  }

  /**
   * Analyze load balancing considerations
   */
  private analyzeLoadBalancing(code: string, optimizations: string[]): number {
    let loadBalancingScore = 70;

    // Check for session stickiness issues
    if (code.includes('session') && code.includes('memory')) {
      optimizations.push('Consider using external session store for load balancing compatibility');
      loadBalancingScore -= 10;
    }

    // Check for health check endpoints
    if (code.includes('/health') || code.includes('/status')) {
      loadBalancingScore += 15;
      optimizations.push('Health check endpoint detected');
    } else {
      optimizations.push('Implement health check endpoints for load balancers');
    }

    // Check for graceful shutdown
    if (code.includes('SIGTERM') || code.includes('gracefulShutdown')) {
      loadBalancingScore += 10;
    } else {
      optimizations.push('Implement graceful shutdown for smooth deployments');
    }

    return Math.max(0, Math.min(100, loadBalancingScore));
  }

  /**
   * Analyze technology-specific performance patterns
   */
  private analyzeTechnologySpecificPerformance(
    code: string,
    technology: string,
    bottlenecks: string[],
    optimizations: string[]
  ): number {
    let scoreAdjustment = 0;
    const tech = technology.toLowerCase();

    if (tech.includes('node')) {
      scoreAdjustment += this.analyzeNodeJsPerformance(code, bottlenecks, optimizations);
    }

    if (tech.includes('python')) {
      scoreAdjustment += this.analyzePythonPerformance(code, bottlenecks, optimizations);
    }

    if (tech.includes('java')) {
      scoreAdjustment += this.analyzeJavaPerformance(code, bottlenecks, optimizations);
    }

    if (tech.includes('go')) {
      scoreAdjustment += this.analyzeGoPerformance(code, bottlenecks, optimizations);
    }

    return scoreAdjustment;
  }

  /**
   * Analyze Node.js specific performance
   */
  private analyzeNodeJsPerformance(
    code: string,
    _bottlenecks: string[],
    _optimizations: string[]
  ): number {
    let scoreAdjustment = 0;

    // Check for V8 optimizations
    if (code.includes('--max-old-space-size') || code.includes('--optimize-for-size')) {
      scoreAdjustment += 5;
    }

    // Check for Express.js optimizations
    if (code.includes('express') && !code.includes('helmet')) {
      _optimizations.push('Consider using helmet for security headers');
    }

    // Check for async/await usage
    if (code.includes('async') && code.includes('await')) {
      scoreAdjustment += 8;
    } else if (code.includes('.then(') && code.includes('.catch(')) {
      _optimizations.push('Consider migrating from promises to async/await');
    }

    return scoreAdjustment;
  }

  /**
   * Analyze Python specific performance
   */
  private analyzePythonPerformance(
    code: string,
    bottlenecks: string[],
    optimizations: string[]
  ): number {
    let scoreAdjustment = 0;

    // Check for GIL issues
    if (code.includes('threading') && code.includes('cpu_count')) {
      bottlenecks.push('Threading with CPU-bound tasks affected by GIL');
      optimizations.push('Consider using multiprocessing for CPU-bound tasks');
      scoreAdjustment -= 10;
    }

    // Check for Django/Flask optimizations
    if (code.includes('django') || code.includes('flask')) {
      if (code.includes('cache') || code.includes('cached')) {
        scoreAdjustment += 8;
      }
    }

    return scoreAdjustment;
  }

  /**
   * Analyze Java specific performance
   */
  private analyzeJavaPerformance(
    code: string,
    _bottlenecks: string[],
    _optimizations: string[]
  ): number {
    let scoreAdjustment = 0;

    // Check for Spring Boot optimizations
    if (code.includes('SpringBoot') || code.includes('@Component')) {
      if (code.includes('@Cacheable') || code.includes('@Async')) {
        scoreAdjustment += 10;
      }
    }

    // Check for JVM optimizations
    if (code.includes('-Xmx') || code.includes('-XX:')) {
      scoreAdjustment += 5;
    }

    return scoreAdjustment;
  }

  /**
   * Analyze Go specific performance
   */
  private analyzeGoPerformance(
    code: string,
    _bottlenecks: string[],
    optimizations: string[]
  ): number {
    let scoreAdjustment = 0;

    // Check for goroutines
    if (code.includes('go func') || code.includes('goroutine')) {
      scoreAdjustment += 12;
      optimizations.push('Good use of goroutines for concurrency');
    }

    // Check for channels
    if (code.includes('chan ') || code.includes('<-')) {
      scoreAdjustment += 8;
    }

    return scoreAdjustment;
  }

  /**
   * Check if code is Node.js specific
   */
  private isNodeJsCode(code: string): boolean {
    return (
      code.includes('require(') ||
      code.includes('process.') ||
      code.includes('module.exports') ||
      code.includes('__dirname')
    );
  }

  /**
   * Check for global state patterns
   */
  private hasGlobalState(code: string): boolean {
    const globalStatePatterns = [
      /global\./g,
      /window\./g,
      /var\s+\w+\s*=.*(?=\n(?!.*function))/g, // Global variables
    ];

    return (
      globalStatePatterns.some(pattern => pattern.test(code)) ||
      (code.includes('var ') && !code.includes('function'))
    );
  }

  /**
   * Check if code follows microservices patterns
   */
  private isMicroservicesArchitecture(code: string): boolean {
    const microservicesPatterns = [
      'service',
      'microservice',
      'api-gateway',
      'service-discovery',
      'circuit-breaker',
      'kubernetes',
      'docker',
      'container',
      'orchestration',
    ];

    return microservicesPatterns.some(pattern => code.includes(pattern));
  }

  /**
   * Analyze microservices specific performance
   */
  private analyzeMicroservicesPerformance(
    code: string,
    bottlenecks: string[],
    optimizations: string[]
  ): void {
    // Service-to-service communication
    if (code.includes('http://') || code.includes('fetch(')) {
      optimizations.push('Consider service mesh for inter-service communication optimization');
    }

    // Circuit breaker pattern
    if (!code.includes('circuit') && !code.includes('breaker')) {
      optimizations.push('Implement circuit breaker pattern for resilient service calls');
    }

    // Service discovery
    if (code.includes('localhost') || code.includes('127.0.0.1')) {
      bottlenecks.push('Hardcoded service URLs prevent proper scaling');
      optimizations.push('Use service discovery for dynamic service location');
    }

    // Health checks
    if (code.includes('/health') || code.includes('/readiness')) {
      optimizations.push('Health check endpoints detected for microservices monitoring');
    }
  }

  /**
   * Generate performance recommendations based on technology
   */
  getPerformanceRecommendations(technology: string): string[] {
    const baseRecommendations = [
      'Use async/await for I/O operations',
      'Implement proper caching strategies',
      'Use connection pooling for databases',
      'Implement rate limiting for APIs',
      'Use compression for large responses',
      'Implement proper error handling',
      'Monitor application performance metrics',
      'Use CDN for static asset delivery',
      'Implement database query optimization',
      'Use appropriate data structures',
    ];

    const tech = technology.toLowerCase();

    if (tech.includes('node')) {
      baseRecommendations.push(
        'Use Node.js cluster module for multi-core utilization',
        'Implement worker threads for CPU-intensive tasks',
        'Use streams for large data processing',
        'Optimize V8 engine with appropriate flags',
        'Implement graceful shutdown handling'
      );
    }

    if (tech.includes('python')) {
      baseRecommendations.push(
        'Use multiprocessing for CPU-bound tasks',
        'Implement connection pooling with SQLAlchemy',
        'Use Celery for background task processing',
        'Optimize Django ORM queries',
        'Use uvloop for async applications'
      );
    }

    if (tech.includes('java')) {
      baseRecommendations.push(
        'Optimize JVM heap size and garbage collection',
        'Use Spring Boot caching annotations',
        'Implement connection pooling with HikariCP',
        'Use reactive programming with Spring WebFlux',
        'Monitor application with JVM metrics'
      );
    }

    return baseRecommendations;
  }
}
