/**
 * Backend Scalability Analyzer
 *
 * Specialized analyzer for backend scalability patterns including horizontal scaling,
 * load balancing, microservices architecture, distributed systems, and cloud-native patterns.
 * Extracted from BackendIntelligenceEngine for better modularity.
 */

import { PerformanceAnalysis } from '../../CategoryIntelligenceEngine.js';

/**
 * Scalability analysis with backend-specific metrics
 */
interface ScalabilityAnalysis extends PerformanceAnalysis {
  horizontalScaling?: number;
  loadBalancing?: number;
  microservicesReadiness?: number;
  cloudNativeScore?: number;
  distributedSystemsScore?: number;
}

/**
 * Analyze backend code for scalability patterns and opportunities
 */
export class ScalabilityAnalyzer {
  /**
   * Analyze backend scalability patterns and recommendations
   */
  async analyzeScalability(
    code: string,
    technology: string,
    _insights: any
  ): Promise<ScalabilityAnalysis> {
    const bottlenecks: string[] = [];
    const optimizations: string[] = [];
    let score = 70;

    // 1. Horizontal Scaling Analysis
    const horizontalScaling = this.analyzeHorizontalScaling(code, bottlenecks, optimizations);

    // 2. Load Balancing Readiness
    const loadBalancing = this.analyzeLoadBalancing(code, bottlenecks, optimizations);

    // 3. Microservices Architecture
    const microservicesReadiness = this.analyzeMicroservicesReadiness(code, optimizations);

    // 4. Cloud-Native Patterns
    const cloudNativeScore = this.analyzeCloudNativePatterns(code, optimizations);

    // 5. Distributed Systems Patterns
    const distributedSystemsScore = this.analyzeDistributedSystems(
      code,
      bottlenecks,
      optimizations
    );

    // 6. State Management for Scalability
    this.analyzeStateManagement(code, bottlenecks, optimizations);

    // 7. Database Scalability
    this.analyzeDatabaseScalability(code, bottlenecks, optimizations);

    // 8. Caching Strategy for Scale
    this.analyzeCachingStrategy(code, optimizations);

    // 9. Message Queue Integration
    this.analyzeMessageQueues(code, optimizations);

    // 10. Container and Orchestration Readiness
    this.analyzeContainerization(code, optimizations);

    // 11. Technology-specific Scalability
    score += this.analyzeTechnologySpecificScalability(
      code,
      technology,
      bottlenecks,
      optimizations
    );

    // Calculate overall score
    const avgSpecificScore =
      (horizontalScaling +
        loadBalancing +
        microservicesReadiness +
        cloudNativeScore +
        distributedSystemsScore) /
      5;
    score = Math.max(0, Math.min(100, (score + avgSpecificScore) / 2));

    return {
      score,
      bottlenecks,
      optimizations,
      horizontalScaling,
      loadBalancing,
      microservicesReadiness,
      cloudNativeScore,
      distributedSystemsScore,
    };
  }

  /**
   * Analyze horizontal scaling patterns
   */
  private analyzeHorizontalScaling(
    code: string,
    bottlenecks: string[],
    optimizations: string[]
  ): number {
    let score = 65;

    // Check for stateless design
    if (this.isStateless(code)) {
      score += 20;
      optimizations.push('Stateless design enables horizontal scaling');
    } else {
      bottlenecks.push('Stateful design limits horizontal scaling');
      optimizations.push('Refactor to stateless architecture');
      score -= 20;
    }

    // Check for cluster support
    if (code.includes('cluster') && code.includes('fork')) {
      score += 15;
      optimizations.push('Node.js clustering implemented');
    } else if (this.isNodeJsCode(code)) {
      optimizations.push('Consider implementing Node.js clustering');
      score -= 10;
    }

    // Check for process management
    if (code.includes('PM2') || code.includes('forever') || code.includes('nodemon')) {
      score += 10;
      optimizations.push('Process management solution detected');
    }

    // Check for session externalization
    if (code.includes('session') && code.includes('store')) {
      score += 12;
    } else if (code.includes('session') && code.includes('memory')) {
      bottlenecks.push('In-memory sessions prevent horizontal scaling');
      optimizations.push('Use external session store (Redis, database)');
      score -= 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Analyze load balancing readiness
   */
  private analyzeLoadBalancing(
    code: string,
    bottlenecks: string[],
    optimizations: string[]
  ): number {
    let score = 70;

    // Health check endpoints
    if (code.includes('/health') || code.includes('/status') || code.includes('/ping')) {
      score += 20;
      optimizations.push('Health check endpoints for load balancer');
    } else {
      bottlenecks.push('Missing health check endpoints');
      optimizations.push('Add health check endpoints');
      score -= 15;
    }

    // Graceful shutdown
    if (code.includes('SIGTERM') || code.includes('gracefulShutdown')) {
      score += 15;
      optimizations.push('Graceful shutdown handling implemented');
    } else {
      bottlenecks.push('No graceful shutdown handling');
      optimizations.push('Implement graceful shutdown for zero-downtime deployments');
      score -= 10;
    }

    // Request ID tracking
    if (code.includes('requestId') || code.includes('correlation') || code.includes('traceId')) {
      score += 8;
      optimizations.push('Request tracking for distributed debugging');
    }

    // Load balancer configuration hints
    if (code.includes('nginx') || code.includes('haproxy') || code.includes('traefik')) {
      score += 7;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Analyze microservices architecture readiness
   */
  private analyzeMicroservicesReadiness(code: string, optimizations: string[]): number {
    let score = 60;

    // Service boundaries
    if (this.hasServiceBoundaries(code)) {
      score += 15;
      optimizations.push('Clear service boundaries defined');
    } else {
      optimizations.push('Define clear service boundaries');
    }

    // API versioning
    if (code.includes('/v1/') || code.includes('/api/v') || code.includes('version')) {
      score += 10;
      optimizations.push('API versioning strategy in place');
    } else {
      optimizations.push('Implement API versioning for backward compatibility');
    }

    // Circuit breaker pattern
    if (code.includes('circuit') && code.includes('breaker')) {
      score += 12;
      optimizations.push('Circuit breaker pattern implemented');
    } else {
      optimizations.push('Consider circuit breaker pattern for resilience');
    }

    // Service discovery
    if (code.includes('consul') || code.includes('etcd') || code.includes('eureka')) {
      score += 8;
      optimizations.push('Service discovery mechanism detected');
    }

    // Configuration management
    if (code.includes('config') && (code.includes('env') || code.includes('consul'))) {
      score += 5;
      optimizations.push('External configuration management');
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Analyze cloud-native patterns
   */
  private analyzeCloudNativePatterns(code: string, optimizations: string[]): number {
    let score = 55;

    // Container readiness
    if (code.includes('Dockerfile') || code.includes('docker') || code.includes('container')) {
      score += 20;
      optimizations.push('Containerization ready');
    } else {
      optimizations.push('Consider containerization with Docker');
    }

    // Environment-based configuration
    if (code.includes('process.env') || code.includes('ENV') || code.includes('configmap')) {
      score += 15;
      optimizations.push('Environment-based configuration');
    }

    // Kubernetes patterns
    if (code.includes('kubernetes') || code.includes('k8s') || code.includes('kubectl')) {
      score += 12;
      optimizations.push('Kubernetes orchestration ready');
    }

    // Cloud provider integration
    if (this.hasCloudProviderIntegration(code)) {
      score += 10;
      optimizations.push('Cloud provider services integration');
    }

    // Observability
    if (code.includes('prometheus') || code.includes('metrics') || code.includes('telemetry')) {
      score += 8;
      optimizations.push('Observability patterns implemented');
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Analyze distributed systems patterns
   */
  private analyzeDistributedSystems(
    code: string,
    bottlenecks: string[],
    optimizations: string[]
  ): number {
    let score = 50;

    // Event-driven architecture
    if (code.includes('event') && (code.includes('publish') || code.includes('emit'))) {
      score += 15;
      optimizations.push('Event-driven architecture patterns');
    }

    // Idempotency
    if (code.includes('idempotent') || code.includes('idempotency')) {
      score += 12;
      optimizations.push('Idempotency patterns implemented');
    } else {
      optimizations.push('Implement idempotency for reliable distributed operations');
    }

    // Distributed transactions
    if (code.includes('saga') || code.includes('2pc') || code.includes('compensation')) {
      score += 10;
      optimizations.push('Distributed transaction patterns');
    }

    // CAP theorem considerations
    if (code.includes('consistency') && code.includes('partition')) {
      score += 8;
    }

    // Data consistency patterns
    if (code.includes('eventual') && code.includes('consistency')) {
      score += 7;
      optimizations.push('Eventual consistency model');
    }

    // Distributed locks
    if (code.includes('lock') && (code.includes('redis') || code.includes('etcd'))) {
      score += 6;
    } else if (code.includes('synchronized') || code.includes('mutex')) {
      bottlenecks.push('Local locks not suitable for distributed systems');
      optimizations.push('Use distributed locking mechanisms');
      score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Analyze state management for scalability
   */
  private analyzeStateManagement(
    code: string,
    bottlenecks: string[],
    optimizations: string[]
  ): void {
    // In-memory state
    if (code.includes('global.') || code.includes('cache = {}') || code.includes('Map()')) {
      if (!code.includes('redis') && !code.includes('memcached')) {
        bottlenecks.push('In-memory state limits scalability');
        optimizations.push('Move state to external store (Redis, database)');
      }
    }

    // File-based state
    if (code.includes('fs.write') || code.includes('fs.read')) {
      bottlenecks.push('File-based state not suitable for distributed deployment');
      optimizations.push('Use distributed storage solutions');
    }

    // Shared state across requests
    if (code.includes('static') || code.includes('singleton')) {
      bottlenecks.push('Shared state patterns affect horizontal scaling');
      optimizations.push('Design for stateless request handling');
    }
  }

  /**
   * Analyze database scalability patterns
   */
  private analyzeDatabaseScalability(
    code: string,
    bottlenecks: string[],
    optimizations: string[]
  ): void {
    // Database connection pooling
    if (code.includes('pool') && code.includes('connection')) {
      optimizations.push('Database connection pooling implemented');
    } else if (this.hasDatabaseAccess(code)) {
      bottlenecks.push('No database connection pooling');
      optimizations.push('Implement connection pooling for database scalability');
    }

    // Read replicas
    if (code.includes('readonly') || code.includes('slave') || code.includes('replica')) {
      optimizations.push('Read replica usage detected');
    } else if (this.hasDatabaseAccess(code)) {
      optimizations.push('Consider read replicas for read scalability');
    }

    // Database sharding
    if (code.includes('shard') || code.includes('partition')) {
      optimizations.push('Database sharding/partitioning patterns');
    }

    // CQRS pattern
    if (code.includes('command') && code.includes('query') && code.includes('separate')) {
      optimizations.push('CQRS pattern for read/write scalability');
    }
  }

  /**
   * Analyze caching strategy for scale
   */
  private analyzeCachingStrategy(code: string, optimizations: string[]): void {
    // Distributed caching
    if (code.includes('redis') || code.includes('memcached')) {
      optimizations.push('Distributed caching solution in place');
    } else {
      optimizations.push('Implement distributed caching for better scalability');
    }

    // CDN usage
    if (code.includes('cdn') || code.includes('cloudflare') || code.includes('cloudfront')) {
      optimizations.push('CDN integration for static content scaling');
    }

    // Cache-aside pattern
    if (code.includes('cache.get') && code.includes('cache.set')) {
      optimizations.push('Cache-aside pattern implementation');
    }
  }

  /**
   * Analyze message queue integration
   */
  private analyzeMessageQueues(code: string, optimizations: string[]): void {
    const queueSystems = ['rabbitmq', 'kafka', 'sqs', 'pubsub', 'redis', 'bull', 'agenda'];

    if (queueSystems.some(queue => code.includes(queue))) {
      optimizations.push('Message queue system for async processing');
    } else {
      optimizations.push('Consider message queues for background processing and decoupling');
    }

    // Event streaming
    if (code.includes('kafka') || code.includes('kinesis')) {
      optimizations.push('Event streaming platform for real-time processing');
    }
  }

  /**
   * Analyze containerization readiness
   */
  private analyzeContainerization(code: string, optimizations: string[]): void {
    // Docker support
    if (code.includes('Dockerfile') || code.includes('docker-compose')) {
      optimizations.push('Docker containerization ready');
    } else {
      optimizations.push('Add Docker support for consistent deployments');
    }

    // Multi-stage builds
    if (code.includes('FROM') && code.includes('as ')) {
      optimizations.push('Multi-stage Docker builds for optimization');
    }

    // Security scanning
    if (code.includes('scan') && code.includes('vulnerabilities')) {
      optimizations.push('Container security scanning in place');
    }
  }

  /**
   * Analyze technology-specific scalability patterns
   */
  private analyzeTechnologySpecificScalability(
    code: string,
    technology: string,
    bottlenecks: string[],
    optimizations: string[]
  ): number {
    let scoreAdjustment = 0;
    const tech = technology.toLowerCase();

    if (tech.includes('node')) {
      scoreAdjustment += this.analyzeNodeJsScalability(code, bottlenecks, optimizations);
    }

    if (tech.includes('python')) {
      scoreAdjustment += this.analyzePythonScalability(code, bottlenecks, optimizations);
    }

    if (tech.includes('java')) {
      scoreAdjustment += this.analyzeJavaScalability(code, optimizations);
    }

    if (tech.includes('go')) {
      scoreAdjustment += this.analyzeGoScalability(code, optimizations);
    }

    return scoreAdjustment;
  }

  /**
   * Analyze Node.js specific scalability
   */
  private analyzeNodeJsScalability(
    code: string,
    bottlenecks: string[],
    optimizations: string[]
  ): number {
    let scoreAdjustment = 0;

    // Worker threads
    if (code.includes('worker_threads')) {
      scoreAdjustment += 10;
      optimizations.push('Worker threads for CPU-intensive tasks');
    } else if (this.hasCpuIntensiveOperations(code)) {
      bottlenecks.push('CPU-intensive operations in main thread');
      optimizations.push('Use worker threads for CPU-bound tasks');
      scoreAdjustment -= 10;
    }

    // Event loop monitoring
    if (code.includes('eventloop') || code.includes('lag')) {
      scoreAdjustment += 5;
      optimizations.push('Event loop monitoring implemented');
    }

    return scoreAdjustment;
  }

  /**
   * Analyze Python specific scalability
   */
  private analyzePythonScalability(
    code: string,
    bottlenecks: string[],
    optimizations: string[]
  ): number {
    let scoreAdjustment = 0;

    // GIL considerations
    if (code.includes('multiprocessing')) {
      scoreAdjustment += 10;
      optimizations.push('Multiprocessing for CPU-bound scalability');
    } else if (code.includes('threading') && this.hasCpuIntensiveOperations(code)) {
      bottlenecks.push('Threading with CPU-bound tasks limited by GIL');
      optimizations.push('Use multiprocessing for CPU-intensive tasks');
      scoreAdjustment -= 8;
    }

    // Async support
    if (code.includes('asyncio') || code.includes('async def')) {
      scoreAdjustment += 8;
      optimizations.push('Async programming for I/O scalability');
    }

    return scoreAdjustment;
  }

  /**
   * Analyze Java specific scalability
   */
  private analyzeJavaScalability(code: string, optimizations: string[]): number {
    let scoreAdjustment = 0;

    // Spring Boot features
    if (code.includes('SpringBoot') || code.includes('@Service')) {
      if (code.includes('@Async') || code.includes('CompletableFuture')) {
        scoreAdjustment += 10;
        optimizations.push('Async processing with Spring Boot');
      }
    }

    // JVM tuning
    if (code.includes('-Xmx') || code.includes('-XX:')) {
      scoreAdjustment += 5;
      optimizations.push('JVM tuning parameters configured');
    }

    return scoreAdjustment;
  }

  /**
   * Analyze Go specific scalability
   */
  private analyzeGoScalability(code: string, optimizations: string[]): number {
    let scoreAdjustment = 0;

    // Goroutines and channels
    if (code.includes('goroutine') || code.includes('go func')) {
      scoreAdjustment += 15;
      optimizations.push('Excellent goroutine-based concurrency');
    }

    // Channel communication
    if (code.includes('chan ') || code.includes('<-')) {
      scoreAdjustment += 8;
      optimizations.push('Channel-based communication for scalability');
    }

    return scoreAdjustment;
  }

  /**
   * Helper methods for pattern detection
   */
  private isStateless(code: string): boolean {
    // Check for stateless patterns vs stateful patterns
    const statefulPatterns = [
      'global.',
      'this.cache',
      'static',
      'singleton',
      'session.*memory',
      'state =',
      'cache = {}',
    ];

    const statelessIndicators = [
      'req, res',
      'request, response',
      'ctx',
      'context',
      'pure function',
      'functional',
    ];

    const hasStatefulPatterns = statefulPatterns.some(pattern => new RegExp(pattern).test(code));

    const hasStatelessIndicators = statelessIndicators.some(pattern =>
      new RegExp(pattern).test(code)
    );

    return !hasStatefulPatterns && hasStatelessIndicators;
  }

  private isNodeJsCode(code: string): boolean {
    return (
      code.includes('require(') ||
      code.includes('process.') ||
      code.includes('module.exports') ||
      code.includes('__dirname')
    );
  }

  private hasServiceBoundaries(code: string): boolean {
    const boundaryPatterns = [
      'service',
      'domain',
      'bounded-context',
      'microservice',
      'api',
      'endpoint',
    ];

    return boundaryPatterns.some(pattern => code.includes(pattern));
  }

  private hasCloudProviderIntegration(code: string): boolean {
    const cloudProviders = [
      'aws',
      'azure',
      'gcp',
      'google-cloud',
      's3',
      'ec2',
      'lambda',
      'functions',
      'blob',
      'storage',
      'cloud',
    ];

    return cloudProviders.some(provider => code.includes(provider));
  }

  private hasDatabaseAccess(code: string): boolean {
    const dbPatterns = [
      'database',
      'db.',
      'query',
      'find(',
      'mysql',
      'postgres',
      'mongodb',
      'redis',
    ];

    return dbPatterns.some(pattern => code.includes(pattern));
  }

  private hasCpuIntensiveOperations(code: string): boolean {
    const cpuIntensivePatterns = [
      /for\s*\([^)]*;\s*i\s*<\s*\d{4,}/g, // Large loops
      /while\s*\([^)]*\.length\s*>\s*\d{3,}/g, // Large while loops
      'sort()',
      'JSON.parse',
      'crypto.',
      'hash',
    ];

    return cpuIntensivePatterns.some(pattern => {
      if (typeof pattern === 'string') {
        return code.includes(pattern);
      }
      return pattern.test(code);
    });
  }

  /**
   * Generate scalability recommendations based on technology
   */
  getScalabilityRecommendations(technology: string): string[] {
    const baseRecommendations = [
      'Design stateless services for horizontal scaling',
      'Implement external session storage',
      'Use load balancers with health checks',
      'Implement graceful shutdown handling',
      'Use distributed caching solutions',
      'Implement message queues for async processing',
      'Use database connection pooling',
      'Consider read replicas for database scaling',
      'Implement API versioning for backward compatibility',
      'Use containerization for consistent deployments',
      'Implement circuit breaker patterns',
      'Use distributed configuration management',
      'Monitor application metrics and performance',
      'Implement request tracing and logging',
      'Use CDN for static content delivery',
    ];

    const tech = technology.toLowerCase();

    if (tech.includes('node')) {
      baseRecommendations.push(
        'Use Node.js cluster module for multi-core utilization',
        'Implement worker threads for CPU-intensive tasks',
        'Monitor event loop lag',
        'Use PM2 or similar for process management',
        'Implement proper error handling to prevent crashes'
      );
    }

    if (tech.includes('python')) {
      baseRecommendations.push(
        'Use multiprocessing for CPU-bound tasks',
        'Implement async/await for I/O-bound operations',
        'Use Gunicorn with multiple workers',
        'Consider Celery for background task processing',
        'Implement proper connection pooling'
      );
    }

    if (tech.includes('java')) {
      baseRecommendations.push(
        'Optimize JVM heap size and garbage collection',
        'Use Spring Boot async features',
        'Implement connection pooling with HikariCP',
        'Use reactive programming with Spring WebFlux',
        'Monitor JVM metrics and performance'
      );
    }

    return baseRecommendations;
  }
}
