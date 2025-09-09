# Phase 2: Real Integration - Implementation Guide

## Overview
**Duration:** 3 weeks
**Goal:** Connect to real external services and implement actual integrations
**Priority:** 🔴 CRITICAL - Required for production functionality

---

## Week 4: External Service Integration

### Day 1-2: Fix Context7 Integration

Since the `@context7/mcp-server@latest` package doesn't exist, we need to build a real context management system.

#### Option 1: Build Custom Context Management

**Location:** `src/context/real-context-manager.ts`

```typescript
// NEW FILE: src/context/real-context-manager.ts
import { Redis } from 'ioredis';
import { ElasticsearchClient } from '@elastic/elasticsearch';
import { EventEmitter } from 'events';
import * as crypto from 'crypto';

export interface ContextEntry {
  id: string;
  sessionId: string;
  timestamp: Date;
  content: any;
  metadata: {
    source: string;
    relevance: number;
    tags: string[];
    userLevel?: string;
    toolName?: string;
  };
  embeddings?: number[];
}

export class RealContextManager extends EventEmitter {
  private redis: Redis;
  private elasticsearch: ElasticsearchClient;
  private embeddingCache: Map<string, number[]> = new Map();

  constructor(config: {
    redisUrl: string;
    elasticsearchUrl: string;
    embeddingServiceUrl?: string;
  }) {
    super();

    // Initialize Redis for session management
    this.redis = new Redis(config.redisUrl);

    // Initialize Elasticsearch for context search
    this.elasticsearch = new ElasticsearchClient({
      node: config.elasticsearchUrl
    });

    this.initializeIndices();
  }

  /**
   * Initialize Elasticsearch indices
   */
  private async initializeIndices(): Promise<void> {
    const indexName = 'context-entries';

    const exists = await this.elasticsearch.indices.exists({
      index: indexName
    });

    if (!exists) {
      await this.elasticsearch.indices.create({
        index: indexName,
        body: {
          mappings: {
            properties: {
              sessionId: { type: 'keyword' },
              timestamp: { type: 'date' },
              content: { type: 'text' },
              'metadata.source': { type: 'keyword' },
              'metadata.relevance': { type: 'float' },
              'metadata.tags': { type: 'keyword' },
              'metadata.userLevel': { type: 'keyword' },
              'metadata.toolName': { type: 'keyword' },
              embeddings: {
                type: 'dense_vector',
                dims: 768 // For BERT-like embeddings
              }
            }
          }
        }
      });
    }
  }

  /**
   * Store context with real persistence
   */
  async storeContext(entry: Omit<ContextEntry, 'id'>): Promise<string> {
    const id = crypto.randomBytes(16).toString('hex');
    const contextEntry: ContextEntry = {
      id,
      ...entry,
      timestamp: new Date()
    };

    // Generate embeddings if not provided
    if (!contextEntry.embeddings) {
      contextEntry.embeddings = await this.generateEmbeddings(
        JSON.stringify(entry.content)
      );
    }

    // Store in Elasticsearch for search
    await this.elasticsearch.index({
      index: 'context-entries',
      id,
      body: contextEntry
    });

    // Store in Redis for quick session access
    const sessionKey = `session:${entry.sessionId}:contexts`;
    await this.redis.zadd(
      sessionKey,
      Date.now(),
      JSON.stringify({ id, relevance: entry.metadata.relevance })
    );

    // Set TTL on session data (24 hours)
    await this.redis.expire(sessionKey, 86400);

    // Emit event for real-time updates
    this.emit('context:stored', contextEntry);

    return id;
  }

  /**
   * Retrieve relevant context using semantic search
   */
  async getRelevantContext(params: {
    sessionId: string;
    query: string;
    limit?: number;
    minRelevance?: number;
  }): Promise<ContextEntry[]> {
    const { sessionId, query, limit = 10, minRelevance = 0.5 } = params;

    // Generate query embeddings
    const queryEmbeddings = await this.generateEmbeddings(query);

    // Semantic search using cosine similarity
    const searchResult = await this.elasticsearch.search({
      index: 'context-entries',
      body: {
        size: limit,
        query: {
          bool: {
            must: [
              {
                term: { sessionId }
              },
              {
                range: {
                  'metadata.relevance': { gte: minRelevance }
                }
              }
            ],
            should: [
              {
                script_score: {
                  query: { match_all: {} },
                  script: {
                    source: "cosineSimilarity(params.query_vector, 'embeddings') + 1.0",
                    params: {
                      query_vector: queryEmbeddings
                    }
                  }
                }
              }
            ]
          }
        },
        sort: [
          { _score: { order: 'desc' } },
          { timestamp: { order: 'desc' } }
        ]
      }
    });

    return searchResult.hits.hits.map(hit => hit._source as ContextEntry);
  }

  /**
   * Generate embeddings using a real embedding service
   */
  private async generateEmbeddings(text: string): Promise<number[]> {
    // Check cache first
    const cacheKey = crypto.createHash('md5').update(text).digest('hex');
    if (this.embeddingCache.has(cacheKey)) {
      return this.embeddingCache.get(cacheKey)!;
    }

    try {
      // Use OpenAI, Hugging Face, or local embedding model
      const response = await fetch('http://localhost:8080/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      const { embeddings } = await response.json();

      // Cache the result
      this.embeddingCache.set(cacheKey, embeddings);

      return embeddings;
    } catch (error) {
      // Fallback to simple TF-IDF-like vector
      return this.generateSimpleEmbeddings(text);
    }
  }

  /**
   * Simple embedding fallback
   */
  private generateSimpleEmbeddings(text: string): number[] {
    // Create a simple 768-dimensional vector based on text features
    const vector = new Array(768).fill(0);
    const words = text.toLowerCase().split(/\s+/);

    words.forEach((word, index) => {
      const hash = crypto.createHash('md5').update(word).digest();
      for (let i = 0; i < hash.length && i < vector.length; i++) {
        vector[i] += hash[i] / 255;
      }
    });

    // Normalize
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map(val => val / magnitude);
  }

  /**
   * Update context relevance based on usage
   */
  async updateRelevance(contextId: string, feedback: 'positive' | 'negative'): Promise<void> {
    const adjustment = feedback === 'positive' ? 0.1 : -0.1;

    await this.elasticsearch.update({
      index: 'context-entries',
      id: contextId,
      body: {
        script: {
          source: "ctx._source.metadata.relevance += params.adjustment",
          params: { adjustment }
        }
      }
    });

    this.emit('context:relevance-updated', { contextId, feedback });
  }

  /**
   * Clean up old contexts
   */
  async cleanupOldContexts(daysToKeep: number = 7): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.elasticsearch.deleteByQuery({
      index: 'context-entries',
      body: {
        query: {
          range: {
            timestamp: { lt: cutoffDate.toISOString() }
          }
        }
      }
    });

    return result.deleted || 0;
  }
}
```

#### Option 2: Integrate Existing Context Service (LangChain, Pinecone, etc.)

**Location:** `src/context/external-context-integration.ts`

```typescript
// NEW FILE: src/context/external-context-integration.ts
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAI } from 'openai';
import { LangChain } from 'langchain';

export class ExternalContextIntegration {
  private pinecone: Pinecone;
  private openai: OpenAI;
  private indexName = 'tappmcp-context';

  constructor(config: {
    pineconeApiKey: string;
    pineconeEnvironment: string;
    openaiApiKey: string;
  }) {
    // Initialize Pinecone for vector storage
    this.pinecone = new Pinecone({
      apiKey: config.pineconeApiKey,
      environment: config.pineconeEnvironment
    });

    // Initialize OpenAI for embeddings
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey
    });
  }

  async initialize(): Promise<void> {
    // Create index if it doesn't exist
    const indexes = await this.pinecone.listIndexes();

    if (!indexes.includes(this.indexName)) {
      await this.pinecone.createIndex({
        name: this.indexName,
        dimension: 1536, // OpenAI embeddings dimension
        metric: 'cosine',
        pods: 1,
        replicas: 1
      });
    }
  }

  async storeContext(context: any): Promise<string> {
    const index = this.pinecone.Index(this.indexName);

    // Generate embeddings using OpenAI
    const embedding = await this.openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: JSON.stringify(context)
    });

    const id = crypto.randomUUID();

    // Store in Pinecone
    await index.upsert({
      vectors: [{
        id,
        values: embedding.data[0].embedding,
        metadata: context
      }]
    });

    return id;
  }

  async queryContext(query: string, topK: number = 10): Promise<any[]> {
    const index = this.pinecone.Index(this.indexName);

    // Generate query embedding
    const queryEmbedding = await this.openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: query
    });

    // Query Pinecone
    const results = await index.query({
      vector: queryEmbedding.data[0].embedding,
      topK,
      includeMetadata: true
    });

    return results.matches.map(match => match.metadata);
  }
}
```

### Day 3-4: Verify and Fix MCP Server Connections

#### Step 1: MCP Server Connection Manager

**Location:** `src/external/mcp-connection-manager.ts`

```typescript
// NEW FILE: src/external/mcp-connection-manager.ts
import { Client } from '@modelcontextprotocol/sdk';
import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

interface MCPServer {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  healthCheckEndpoint?: string;
}

export class MCPConnectionManager extends EventEmitter {
  private servers: Map<string, MCPServer> = new Map();
  private connections: Map<string, Client> = new Map();
  private processes: Map<string, ChildProcess> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.initializeServers();
  }

  /**
   * Initialize server configurations
   */
  private initializeServers(): void {
    // FileSystem MCP Server
    this.servers.set('filesystem', {
      name: 'FileSystem MCP',
      command: 'npx',
      args: ['@modelcontextprotocol/server-filesystem@latest'],
      env: {
        FILE_ACCESS_LEVEL: 'full'
      }
    });

    // GitHub MCP Server
    this.servers.set('github', {
      name: 'GitHub MCP',
      command: 'npx',
      args: ['@modelcontextprotocol/server-github@latest'],
      env: {
        GITHUB_TOKEN: process.env.GITHUB_TOKEN || ''
      }
    });

    // TestSprite MCP Server
    this.servers.set('testsprite', {
      name: 'TestSprite MCP',
      command: 'npx',
      args: ['@testsprite/testsprite-mcp@latest'],
      env: {
        TESTSPRITE_API_KEY: process.env.TESTSPRITE_API_KEY || ''
      },
      healthCheckEndpoint: 'http://localhost:3001/health'
    });

    // Playwright MCP Server
    this.servers.set('playwright', {
      name: 'Playwright MCP',
      command: 'npx',
      args: ['@playwright/mcp@latest'],
      env: {
        PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH || './browsers'
      }
    });
  }

  /**
   * Connect to all configured MCP servers
   */
  async connectAll(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    for (const [key, server] of this.servers) {
      try {
        const connected = await this.connectToServer(key, server);
        results.set(key, connected);
      } catch (error) {
        console.error(`Failed to connect to ${server.name}:`, error);
        results.set(key, false);
      }
    }

    // Start health monitoring
    this.startHealthMonitoring();

    return results;
  }

  /**
   * Connect to a specific MCP server
   */
  private async connectToServer(key: string, server: MCPServer): Promise<boolean> {
    return new Promise((resolve) => {
      // Spawn the MCP server process
      const serverProcess = spawn(server.command, server.args, {
        env: { ...process.env, ...server.env },
        stdio: ['pipe', 'pipe', 'pipe']
      });

      this.processes.set(key, serverProcess);

      // Create MCP client
      const client = new Client({
        name: `tappmcp-${key}`,
        version: '1.0.0'
      });

      // Set up event handlers
      serverProcess.stdout.on('data', (data) => {
        console.log(`[${server.name}] ${data}`);
      });

      serverProcess.stderr.on('data', (data) => {
        console.error(`[${server.name}] Error: ${data}`);
      });

      serverProcess.on('exit', (code) => {
        console.log(`[${server.name}] Process exited with code ${code}`);
        this.handleServerDisconnection(key);
      });

      // Connect the client
      client.on('ready', () => {
        console.log(`✅ Connected to ${server.name}`);
        this.connections.set(key, client);
        this.emit('server:connected', { key, server });
        resolve(true);
      });

      client.on('error', (error) => {
        console.error(`❌ Failed to connect to ${server.name}:`, error);
        this.emit('server:error', { key, server, error });
        resolve(false);
      });

      // Attempt connection with timeout
      setTimeout(() => {
        if (!this.connections.has(key)) {
          console.warn(`⚠️ Connection timeout for ${server.name}`);
          resolve(false);
        }
      }, 10000); // 10 second timeout

      // Connect to the spawned process
      client.connect({
        stdin: serverProcess.stdin,
        stdout: serverProcess.stdout
      });
    });
  }

  /**
   * Handle server disconnection
   */
  private handleServerDisconnection(key: string): void {
    this.connections.delete(key);
    this.processes.delete(key);
    this.emit('server:disconnected', { key });

    // Attempt reconnection
    setTimeout(() => {
      const server = this.servers.get(key);
      if (server) {
        console.log(`Attempting to reconnect to ${server.name}...`);
        this.connectToServer(key, server);
      }
    }, 5000); // Retry after 5 seconds
  }

  /**
   * Start health monitoring for all connections
   */
  private startHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      for (const [key, client] of this.connections) {
        try {
          // Send ping or health check
          await client.request('ping', {});
          this.emit('server:healthy', { key });
        } catch (error) {
          console.warn(`Health check failed for ${key}:`, error);
          this.emit('server:unhealthy', { key, error });

          // Attempt to reconnect
          this.handleServerDisconnection(key);
        }
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Execute a command on a specific MCP server
   */
  async execute(serverKey: string, method: string, params: any): Promise<any> {
    const client = this.connections.get(serverKey);

    if (!client) {
      throw new Error(`No connection to ${serverKey} server`);
    }

    try {
      const result = await client.request(method, params);
      this.emit('command:executed', { serverKey, method, params, result });
      return result;
    } catch (error) {
      this.emit('command:failed', { serverKey, method, params, error });
      throw error;
    }
  }

  /**
   * Get connection status
   */
  getStatus(): Map<string, {
    connected: boolean;
    server: MCPServer;
    uptime?: number;
  }> {
    const status = new Map();

    for (const [key, server] of this.servers) {
      const process = this.processes.get(key);
      status.set(key, {
        connected: this.connections.has(key),
        server,
        uptime: process ? Date.now() - (process as any).startTime : 0
      });
    }

    return status;
  }

  /**
   * Disconnect from all servers
   */
  async disconnectAll(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    for (const [key, client] of this.connections) {
      try {
        await client.close();
      } catch (error) {
        console.error(`Error closing connection to ${key}:`, error);
      }
    }

    for (const [key, process] of this.processes) {
      process.kill('SIGTERM');
    }

    this.connections.clear();
    this.processes.clear();
  }
}
```

### Day 5: Real Performance Measurement Integration

#### Step 1: Performance Monitoring Service

**Location:** `src/monitoring/performance-monitor.ts`

```typescript
// NEW FILE: src/monitoring/performance-monitor.ts
import { StatsD } from 'node-statsd';
import * as prometheus from 'prom-client';
import { performance, PerformanceObserver } from 'perf_hooks';

export class PerformanceMonitor {
  private statsd: StatsD;
  private registry: prometheus.Registry;
  private metrics: Map<string, prometheus.Histogram | prometheus.Counter | prometheus.Gauge>;

  constructor(config: {
    statsdHost?: string;
    statsdPort?: number;
    prometheusPrefix?: string;
  } = {}) {
    // Initialize StatsD client
    this.statsd = new StatsD({
      host: config.statsdHost || 'localhost',
      port: config.statsdPort || 8125,
      prefix: 'tappmcp.'
    });

    // Initialize Prometheus registry
    this.registry = new prometheus.Registry();
    this.metrics = new Map();

    // Set up default metrics
    prometheus.collectDefaultMetrics({ register: this.registry });

    // Initialize custom metrics
    this.initializeMetrics();

    // Set up performance observer
    this.setupPerformanceObserver();
  }

  /**
   * Initialize custom metrics
   */
  private initializeMetrics(): void {
    // Request duration histogram
    this.metrics.set('request_duration', new prometheus.Histogram({
      name: 'tappmcp_request_duration_seconds',
      help: 'Request duration in seconds',
      labelNames: ['method', 'status'],
      buckets: [0.1, 0.5, 1, 2, 5]
    }));

    // Active connections gauge
    this.metrics.set('active_connections', new prometheus.Gauge({
      name: 'tappmcp_active_connections',
      help: 'Number of active connections'
    }));

    // Error counter
    this.metrics.set('errors_total', new prometheus.Counter({
      name: 'tappmcp_errors_total',
      help: 'Total number of errors',
      labelNames: ['type', 'severity']
    }));

    // Memory usage gauge
    this.metrics.set('memory_usage', new prometheus.Gauge({
      name: 'tappmcp_memory_usage_bytes',
      help: 'Memory usage in bytes',
      labelNames: ['type']
    }));

    // Register all metrics
    for (const metric of this.metrics.values()) {
      this.registry.registerMetric(metric);
    }
  }

  /**
   * Set up performance observer for automatic measurement
   */
  private setupPerformanceObserver(): void {
    const obs = new PerformanceObserver((items) => {
      items.getEntries().forEach((entry) => {
        // Send to StatsD
        this.statsd.timing(`performance.${entry.name}`, entry.duration);

        // Update Prometheus metrics
        const histogram = this.metrics.get('request_duration') as prometheus.Histogram;
        histogram.observe({ method: entry.name }, entry.duration / 1000);
      });
    });

    obs.observe({ entryTypes: ['measure'] });
  }

  /**
   * Start timing an operation
   */
  startTimer(name: string): () => void {
    const startMark = `${name}-start`;
    performance.mark(startMark);

    return () => {
      const endMark = `${name}-end`;
      performance.mark(endMark);
      performance.measure(name, startMark, endMark);

      // Clean up marks
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
    };
  }

  /**
   * Record a metric value
   */
  recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    // Send to StatsD
    this.statsd.gauge(name, value, tags);

    // Update Prometheus if metric exists
    const metric = this.metrics.get(name);
    if (metric && metric instanceof prometheus.Gauge) {
      metric.set(tags || {}, value);
    }
  }

  /**
   * Increment a counter
   */
  incrementCounter(name: string, tags?: Record<string, string>): void {
    // Send to StatsD
    this.statsd.increment(name, tags);

    // Update Prometheus if metric exists
    const metric = this.metrics.get(name);
    if (metric && metric instanceof prometheus.Counter) {
      metric.inc(tags);
    }
  }

  /**
   * Record memory usage
   */
  recordMemoryUsage(): void {
    const memUsage = process.memoryUsage();

    Object.entries(memUsage).forEach(([type, bytes]) => {
      this.recordMetric('memory_usage', bytes, { type });
    });
  }

  /**
   * Get metrics for Prometheus endpoint
   */
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  /**
   * Profile async function execution
   */
  async profile<T>(
    name: string,
    fn: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    const endTimer = this.startTimer(name);

    try {
      const result = await fn();

      // Record success
      this.incrementCounter('operations_success', { ...tags, operation: name });

      return result;
    } catch (error) {
      // Record failure
      this.incrementCounter('operations_failed', { ...tags, operation: name });
      throw error;
    } finally {
      endTimer();
    }
  }
}
```

---

## Week 5: Testing Infrastructure

### Day 6-7: Real Test Coverage Integration

#### Step 1: Coverage Reporter Integration

**Location:** `src/testing/coverage-reporter.ts`

```typescript
// NEW FILE: src/testing/coverage-reporter.ts
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface CoverageReport {
  summary: {
    lines: { total: number; covered: number; pct: number };
    statements: { total: number; covered: number; pct: number };
    functions: { total: number; covered: number; pct: number };
    branches: { total: number; covered: number; pct: number };
  };
  files: Map<string, FileCoverage>;
  uncoveredLines: Map<string, number[]>;
}

export interface FileCoverage {
  path: string;
  lines: { total: number; covered: number; pct: number };
  functions: { total: number; covered: number; pct: number };
  statements: { total: number; covered: number; pct: number };
  branches: { total: number; covered: number; pct: number };
}

export class CoverageReporter {
  private projectPath: string;
  private coverageThreshold: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };

  constructor(projectPath: string, thresholds = {
    lines: 80,
    functions: 80,
    branches: 80,
    statements: 80
  }) {
    this.projectPath = projectPath;
    this.coverageThreshold = thresholds;
  }

  /**
   * Run tests and collect coverage
   */
  async runCoverage(testPattern?: string): Promise<CoverageReport> {
    const testCommand = testPattern
      ? `npm test -- --coverage ${testPattern}`
      : 'npm test -- --coverage';

    try {
      // Run tests with coverage
      await execAsync(testCommand, { cwd: this.projectPath });
    } catch (error) {
      // Tests might fail but coverage still generated
      console.warn('Some tests failed during coverage run');
    }

    // Parse coverage report
    return this.parseCoverageReport();
  }

  /**
   * Parse Istanbul/NYC coverage report
   */
  private async parseCoverageReport(): Promise<CoverageReport> {
    const coverageFile = path.join(this.projectPath, 'coverage', 'coverage-final.json');

    if (!fs.existsSync(coverageFile)) {
      throw new Error('Coverage file not found. Run tests with coverage first.');
    }

    const coverageData = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
    const report: CoverageReport = {
      summary: {
        lines: { total: 0, covered: 0, pct: 0 },
        statements: { total: 0, covered: 0, pct: 0 },
        functions: { total: 0, covered: 0, pct: 0 },
        branches: { total: 0, covered: 0, pct: 0 }
      },
      files: new Map(),
      uncoveredLines: new Map()
    };

    // Process each file
    for (const [filePath, fileData] of Object.entries(coverageData)) {
      const fileCoverage = this.processFileCoverage(filePath, fileData as any);
      report.files.set(filePath, fileCoverage);

      // Update summary
      report.summary.lines.total += fileCoverage.lines.total;
      report.summary.lines.covered += fileCoverage.lines.covered;
      report.summary.statements.total += fileCoverage.statements.total;
      report.summary.statements.covered += fileCoverage.statements.covered;
      report.summary.functions.total += fileCoverage.functions.total;
      report.summary.functions.covered += fileCoverage.functions.covered;
      report.summary.branches.total += fileCoverage.branches.total;
      report.summary.branches.covered += fileCoverage.branches.covered;

      // Track uncovered lines
      const uncovered = this.findUncoveredLines(fileData as any);
      if (uncovered.length > 0) {
        report.uncoveredLines.set(filePath, uncovered);
      }
    }

    // Calculate percentages
    report.summary.lines.pct = this.calculatePercentage(
      report.summary.lines.covered,
      report.summary.lines.total
    );
    report.summary.statements.pct = this.calculatePercentage(
      report.summary.statements.covered,
      report.summary.statements.total
    );
    report.summary.functions.pct = this.calculatePercentage(
      report.summary.functions.covered,
      report.summary.functions.total
    );
    report.summary.branches.pct = this.calculatePercentage(
      report.summary.branches.covered,
      report.summary.branches.total
    );

    return report;
  }

  /**
   * Process coverage for a single file
   */
  private processFileCoverage(filePath: string, data: any): FileCoverage {
    const linesCovered = Object.values(data.s as Record<string, number>)
      .filter(count => count > 0).length;
    const linesTotal = Object.keys(data.s).length;

    const functionsCovered = Object.values(data.f as Record<string, number>)
      .filter(count => count > 0).length;
    const functionsTotal = Object.keys(data.f).length;

    const branchesCovered = Object.values(data.b as Record<string, number[]>)
      .flat()
      .filter(count => count > 0).length;
    const branchesTotal = Object.values(data.b as Record<string, number[]>)
      .flat().length;

    const statementsCovered = Object.values(data.statementMap as Record<string, any>)
      .filter((_, index) => (data.s[index] || 0) > 0).length;
    const statementsTotal = Object.keys(data.statementMap).length;

    return {
      path: filePath,
      lines: {
        total: linesTotal,
        covered: linesCovered,
        pct: this.calculatePercentage(linesCovered, linesTotal)
      },
      functions: {
        total: functionsTotal,
        covered: functionsCovered,
        pct: this.calculatePercentage(functionsCovered, functionsTotal)
      },
      statements: {
        total: statementsTotal,
        covered: statementsCovered,
        pct: this.calculatePercentage(statementsCovered, statementsTotal)
      },
      branches: {
        total: branchesTotal,
        covered: branchesCovered,
        pct: this.calculatePercentage(branchesCovered, branchesTotal)
      }
    };
  }

  /**
   * Find uncovered lines in a file
   */
  private findUncoveredLines(data: any): number[] {
    const uncoveredLines: number[] = [];

    Object.entries(data.statementMap as Record<string, any>).forEach(([key, statement]) => {
      if ((data.s[key] || 0) === 0) {
        uncoveredLines.push(statement.start.line);
      }
    });

    return uncoveredLines.sort((a, b) => a - b);
  }

  /**
   * Calculate percentage
   */
  private calculatePercentage(covered: number, total: number): number {
    if (total === 0) return 100;
    return Math.round((covered / total) * 10000) / 100;
  }

  /**
   * Check if coverage meets thresholds
   */
  checkThresholds(report: CoverageReport): {
    passed: boolean;
    failures: string[];
  } {
    const failures: string[] = [];

    if (report.summary.lines.pct < this.coverageThreshold.lines) {
      failures.push(
        `Line coverage ${report.summary.lines.pct}% is below threshold ${this.coverageThreshold.lines}%`
      );
    }

    if (report.summary.functions.pct < this.coverageThreshold.functions) {
      failures.push(
        `Function coverage ${report.summary.functions.pct}% is below threshold ${this.coverageThreshold.functions}%`
      );
    }

    if (report.summary.branches.pct < this.coverageThreshold.branches) {
      failures.push(
        `Branch coverage ${report.summary.branches.pct}% is below threshold ${this.coverageThreshold.branches}%`
      );
    }

    if (report.summary.statements.pct < this.coverageThreshold.statements) {
      failures.push(
        `Statement coverage ${report.summary.statements.pct}% is below threshold ${this.coverageThreshold.statements}%`
      );
    }

    return {
      passed: failures.length === 0,
      failures
    };
  }

  /**
   * Generate coverage badge
   */
  generateBadge(coverage: number): string {
    let color = 'red';
    if (coverage >= 80) color = 'green';
    else if (coverage >= 60) color = 'yellow';
    else if (coverage >= 40) color = 'orange';

    return `https://img.shields.io/badge/coverage-${coverage}%25-${color}`;
  }

  /**
   * Generate HTML report
   */
  async generateHTMLReport(): Promise<void> {
    await execAsync('npx nyc report --reporter=html', {
      cwd: this.projectPath
    });

    console.log('HTML coverage report generated in coverage/index.html');
  }
}
```

### Day 8-9: Security Scanning Integration

#### Step 1: Security Scanner Service

**Location:** `src/security/security-scanner-service.ts`

```typescript
// NEW FILE: src/security/security-scanner-service.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

export interface SecurityIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  type: string;
  title: string;
  description: string;
  file?: string;
  line?: number;
  column?: number;
  recommendation: string;
  cve?: string;
  cwe?: string;
  owasp?: string;
}

export class SecurityScannerService {
  private projectPath: string;
  private scanners: Map<string, () => Promise<SecurityIssue[]>> = new Map();

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.initializeScanners();
  }

  /**
   * Initialize all security scanners
   */
  private initializeScanners(): void {
    // Snyk vulnerability scanning
    this.scanners.set('snyk', () => this.runSnyk());

    // OWASP Dependency Check
    this.scanners.set('owasp', () => this.runOWASP());

    // Semgrep SAST
    this.scanners.set('semgrep', () => this.runSemgrep());

    // GitLeaks secret scanning
    this.scanners.set('gitleaks', () => this.runGitleaks());

    // npm audit
    this.scanners.set('npm-audit', () => this.runNpmAudit());
  }

  /**
   * Run all security scans
   */
  async runFullScan(): Promise<{
    issues: SecurityIssue[];
    summary: {
      critical: number;
      high: number;
      medium: number;
      low: number;
      info: number;
      total: number;
    };
    scanners: {
      name: string;
      status: 'success' | 'failed';
      issueCount: number;
    }[];
  }> {
    const allIssues: SecurityIssue[] = [];
    const scannerResults: any[] = [];

    for (const [name, scanner] of this.scanners) {
      try {
        console.log(`Running ${name} scanner...`);
        const issues = await scanner();
        allIssues.push(...issues);

        scannerResults.push({
          name,
          status: 'success',
          issueCount: issues.length
        });
      } catch (error) {
        console.error(`${name} scanner failed:`, error);
        scannerResults.push({
          name,
          status: 'failed',
          issueCount: 0
        });
      }
    }

    // Calculate summary
    const summary = {
      critical: allIssues.filter(i => i.severity === 'critical').length,
      high: allIssues.filter(i => i.severity === 'high').length,
      medium: allIssues.filter(i => i.severity === 'medium').length,
      low: allIssues.filter(i => i.severity === 'low').length,
      info: allIssues.filter(i => i.severity === 'info').length,
      total: allIssues.length
    };

    return {
      issues: allIssues,
      summary,
      scanners: scannerResults
    };
  }

  /**
   * Run Snyk vulnerability scanning
   */
  private async runSnyk(): Promise<SecurityIssue[]> {
    try {
      const { stdout } = await execAsync('snyk test --json', {
        cwd: this.projectPath
      });

      const results = JSON.parse(stdout);
      const issues: SecurityIssue[] = [];

      if (results.vulnerabilities) {
        for (const vuln of results.vulnerabilities) {
          issues.push({
            id: vuln.id,
            severity: this.mapSnykSeverity(vuln.severity),
            type: 'dependency-vulnerability',
            title: vuln.title,
            description: vuln.description || '',
            recommendation: vuln.fixedIn ? `Update to ${vuln.fixedIn[0]}` : 'No fix available',
            cve: vuln.identifiers?.CVE?.[0],
            cwe: vuln.identifiers?.CWE?.[0]
          });
        }
      }

      return issues;
    } catch (error: any) {
      // Snyk returns non-zero exit code when vulnerabilities found
      if (error.stdout) {
        const results = JSON.parse(error.stdout);
        // Process vulnerabilities same as above
        return this.processSnykResults(results);
      }
      throw error;
    }
  }

  /**
   * Run OWASP Dependency Check
   */
  private async runOWASP(): Promise<SecurityIssue[]> {
    const reportPath = path.join(this.projectPath, 'dependency-check-report.json');

    try {
      await execAsync(
        `dependency-check --scan . --format JSON --out ${reportPath}`,
        { cwd: this.projectPath }
      );

      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      const issues: SecurityIssue[] = [];

      for (const dependency of report.dependencies || []) {
        for (const vulnerability of dependency.vulnerabilities || []) {
          issues.push({
            id: vulnerability.name,
            severity: this.mapCVSSSeverity(vulnerability.cvssv3?.baseScore || 0),
            type: 'dependency-vulnerability',
            title: vulnerability.name,
            description: vulnerability.description,
            recommendation: 'Update or patch the affected dependency',
            cve: vulnerability.name,
            cwe: vulnerability.cwes?.[0]
          });
        }
      }

      return issues;
    } finally {
      // Clean up report file
      if (fs.existsSync(reportPath)) {
        fs.unlinkSync(reportPath);
      }
    }
  }

  /**
   * Run Semgrep SAST
   */
  private async runSemgrep(): Promise<SecurityIssue[]> {
    try {
      const { stdout } = await execAsync(
        'semgrep --config=auto --json',
        { cwd: this.projectPath }
      );

      const results = JSON.parse(stdout);
      const issues: SecurityIssue[] = [];

      for (const result of results.results || []) {
        issues.push({
          id: `semgrep-${result.check_id}`,
          severity: this.mapSemgrepSeverity(result.extra?.severity || 'INFO'),
          type: 'code-vulnerability',
          title: result.extra?.message || result.check_id,
          description: result.extra?.metadata?.description || '',
          file: result.path,
          line: result.start?.line,
          column: result.start?.col,
          recommendation: result.extra?.fix || 'Review and fix the security issue',
          owasp: result.extra?.metadata?.owasp
        });
      }

      return issues;
    } catch (error) {
      console.error('Semgrep scan failed:', error);
      return [];
    }
  }

  /**
   * Run GitLeaks secret scanning
   */
  private async runGitleaks(): Promise<SecurityIssue[]> {
    try {
      const { stdout } = await execAsync(
        'gitleaks detect --report-format json --report-path gitleaks.json',
        { cwd: this.projectPath }
      );

      const reportPath = path.join(this.projectPath, 'gitleaks.json');

      if (fs.existsSync(reportPath)) {
        const results = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        const issues: SecurityIssue[] = [];

        for (const finding of results || []) {
          issues.push({
            id: `secret-${finding.RuleID}`,
            severity: 'critical', // Secrets are always critical
            type: 'secret-exposure',
            title: `Potential secret found: ${finding.RuleID}`,
            description: finding.Description,
            file: finding.File,
            line: finding.StartLine,
            column: finding.StartColumn,
            recommendation: 'Remove the secret and rotate credentials immediately'
          });
        }

        // Clean up report
        fs.unlinkSync(reportPath);

        return issues;
      }

      return [];
    } catch (error) {
      console.error('GitLeaks scan failed:', error);
      return [];
    }
  }

  /**
   * Run npm audit
   */
  private async runNpmAudit(): Promise<SecurityIssue[]> {
    try {
      const { stdout } = await execAsync('npm audit --json', {
        cwd: this.projectPath
      });

      const audit = JSON.parse(stdout);
      const issues: SecurityIssue[] = [];

      for (const [id, advisory] of Object.entries(audit.advisories || {})) {
        const adv = advisory as any;

        issues.push({
          id: `npm-${id}`,
          severity: this.mapNpmSeverity(adv.severity),
          type: 'dependency-vulnerability',
          title: adv.title,
          description: adv.overview,
          recommendation: adv.recommendation,
          cve: adv.cves?.[0],
          cwe: adv.cwe
        });
      }

      return issues;
    } catch (error: any) {
      // npm audit returns non-zero when vulnerabilities found
      if (error.stdout) {
        return this.processNpmAudit(JSON.parse(error.stdout));
      }
      return [];
    }
  }

  // Severity mapping functions
  private mapSnykSeverity(severity: string): SecurityIssue['severity'] {
    switch (severity.toLowerCase()) {
      case 'critical': return 'critical';
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'info';
    }
  }

  private mapCVSSSeverity(score: number): SecurityIssue['severity'] {
    if (score >= 9.0) return 'critical';
    if (score >= 7.0) return 'high';
    if (score >= 4.0) return 'medium';
    if (score >= 0.1) return 'low';
    return 'info';
  }

  private mapSemgrepSeverity(severity: string): SecurityIssue['severity'] {
    switch (severity.toUpperCase()) {
      case 'ERROR':
      case 'CRITICAL': return 'critical';
      case 'WARNING':
      case 'HIGH': return 'high';
      case 'MEDIUM': return 'medium';
      case 'LOW': return 'low';
      default: return 'info';
    }
  }

  private mapNpmSeverity(severity: string): SecurityIssue['severity'] {
    switch (severity.toLowerCase()) {
      case 'critical': return 'critical';
      case 'high': return 'high';
      case 'moderate': return 'medium';
      case 'low': return 'low';
      default: return 'info';
    }
  }

  // Helper functions
  private processSnykResults(results: any): SecurityIssue[] {
    // Implementation for processing Snyk results
    return [];
  }

  private processNpmAudit(audit: any): SecurityIssue[] {
    // Implementation for processing npm audit results
    return [];
  }
}
```

---

## Week 6: Data Pipeline Implementation

### Day 10-11: Metrics Collection System

#### Step 1: Metrics Aggregation Service

**Location:** `src/metrics/metrics-aggregation-service.ts`

```typescript
// NEW FILE: src/metrics/metrics-aggregation-service.ts
import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { EventEmitter } from 'events';

export class MetricsAggregationService extends EventEmitter {
  private influx: InfluxDB;
  private writeApi: any;
  private queryApi: any;

  constructor(config: {
    url: string;
    token: string;
    org: string;
    bucket: string;
  }) {
    super();

    this.influx = new InfluxDB({
      url: config.url,
      token: config.token
    });

    this.writeApi = this.influx.getWriteApi(config.org, config.bucket);
    this.queryApi = this.influx.getQueryApi(config.org);
  }

  /**
   * Record a metric point
   */
  async recordMetric(measurement: string, fields: Record<string, any>, tags?: Record<string, string>): Promise<void> {
    const point = new Point(measurement);

    // Add tags
    if (tags) {
      Object.entries(tags).forEach(([key, value]) => {
        point.tag(key, value);
      });
    }

    // Add fields
    Object.entries(fields).forEach(([key, value]) => {
      if (typeof value === 'number') {
        point.floatField(key, value);
      } else if (typeof value === 'boolean') {
        point.booleanField(key, value);
      } else {
        point.stringField(key, String(value));
      }
    });

    this.writeApi.writePoint(point);

    // Emit event for real-time processing
    this.emit('metric:recorded', { measurement, fields, tags });
  }

  /**
   * Query metrics
   */
  async queryMetrics(query: string): Promise<any[]> {
    const results: any[] = [];

    return new Promise((resolve, reject) => {
      this.queryApi.queryRows(query, {
        next(row: any, tableMeta: any) {
          const o = tableMeta.toObject(row);
          results.push(o);
        },
        error(error: Error) {
          reject(error);
        },
        complete() {
          resolve(results);
        }
      });
    });
  }

  /**
   * Flush pending writes
   */
  async flush(): Promise<void> {
    await this.writeApi.flush();
  }
}
```

### Day 12: Caching Layer

#### Step 1: Redis Cache Implementation

**Location:** `src/cache/redis-cache.ts`

```typescript
// NEW FILE: src/cache/redis-cache.ts
import { Redis } from 'ioredis';
import * as crypto from 'crypto';

export class RedisCache {
  private client: Redis;
  private defaultTTL: number;

  constructor(config: {
    host?: string;
    port?: number;
    password?: string;
    defaultTTL?: number;
  } = {}) {
    this.client = new Redis({
      host: config.host || 'localhost',
      port: config.port || 6379,
      password: config.password
    });

    this.defaultTTL = config.defaultTTL || 3600; // 1 hour default
  }

  /**
   * Get or compute cached value
   */
  async getOrCompute<T>(
    key: string,
    compute: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Compute value
    const value = await compute();

    // Store in cache
    await this.set(key, value, ttl);

    return value;
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value);
    } catch {
      return value as any;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const serialized = typeof value === 'string'
      ? value
      : JSON.stringify(value);

    if (ttl || this.defaultTTL) {
      await this.client.setex(key, ttl || this.defaultTTL, serialized);
    } else {
      await this.client.set(key, serialized);
    }
  }

  /**
   * Delete from cache
   */
  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    await this.client.flushdb();
  }

  /**
   * Generate cache key
   */
  generateKey(prefix: string, params: any): string {
    const hash = crypto
      .createHash('md5')
      .update(JSON.stringify(params))
      .digest('hex');

    return `${prefix}:${hash}`;
  }
}
```

---

## Validation Checklist

### Week 4 Validation
- [ ] Context management system operational (custom or external)
- [ ] All MCP servers connected and verified
- [ ] Connection health monitoring active
- [ ] Performance monitoring collecting real metrics

### Week 5 Validation
- [ ] Real test coverage reporting accurate percentages
- [ ] Security scanning identifying real vulnerabilities
- [ ] All scanners integrated and operational
- [ ] Coverage thresholds enforced

### Week 6 Validation
- [ ] Metrics aggregation storing time-series data
- [ ] Caching layer reducing computation time
- [ ] Data pipeline end-to-end tested
- [ ] Performance improvements measurable

---

## Next Steps
Once Phase 2 is complete, proceed to [Phase 3: Enhanced Intelligence](./PHASE_3_ENHANCED_INTELLIGENCE.md)