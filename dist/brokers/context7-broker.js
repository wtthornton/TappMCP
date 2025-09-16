#!/usr/bin/env node
/**
 * Context7 Broker for MCP Integration
 *
 * Provides integration with Context7 service for:
 * - Documentation retrieval
 * - Code examples
 * - Best practices
 * - Troubleshooting guides
 */
import { Context7HttpClient } from './context7-http-client.js';
import { Context7MCPClient } from './context7-mcp-client.js';
import { LRUCache } from 'lru-cache';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { createHash } from 'crypto';
import { CircuitBreaker } from '../intelligence/ErrorHandling.js';
/**
 * Context7 Broker for external knowledge integration
 */
export class Context7Broker {
    config;
    httpClient;
    mcpClient;
    isAvailable = false;
    cache;
    libraryIdCache;
    circuitBreaker;
    pendingRequests = new Map();
    cacheFile = './cache/context7-cache.json';
    constructor(config = {}) {
        // Public Context7 API credentials - not secret
        const DEFAULT_API_KEY = 'ctx7sk-45825e15-2f53-459e-8688-8c14b0604d02';
        const DEFAULT_BASE_URL = 'https://context7.com/api/v1';
        const DEFAULT_MCP_URL = 'https://mcp.context7.com/mcp';
        // Check for HTTP-only mode from environment
        const useHttpOnly = process.env.CONTEXT7_USE_HTTP_ONLY === 'true' ||
            process.env.NODE_ENV === 'production' ||
            config.useHttpOnly === true ||
            true; // Force HTTP-only mode to bypass MCP issues
        this.config = {
            apiUrl: config.apiUrl ?? DEFAULT_MCP_URL,
            apiKey: config.apiKey ?? process.env.CONTEXT7_API_KEY ?? DEFAULT_API_KEY,
            baseUrl: config.baseUrl ?? process.env.CONTEXT7_BASE_URL ?? DEFAULT_BASE_URL,
            timeout: config.timeout ?? 5000,
            maxRetries: config.maxRetries ?? 2,
            enableFallback: config.enableFallback ?? true,
            enableCache: config.enableCache ?? true,
            cacheExpiryHours: config.cacheExpiryHours ?? 30 * 24, // 30 DAYS
            useHttpOnly: useHttpOnly,
            rateLimit: config.rateLimit ?? {
                requestsPerMinute: 60,
                burstLimit: 10,
            },
            retryPolicy: config.retryPolicy ?? {
                maxRetries: 3,
                baseDelay: 1000,
                maxDelay: 10000,
                backoffMultiplier: 2,
            },
        };
        // Initialize HTTP client
        const httpConfig = {
            baseURL: this.config.baseUrl || this.config.apiUrl || 'https://mcp.context7.com',
            apiKey: this.config.apiKey,
            timeout: this.config.timeout,
            rateLimit: {
                ...this.config.rateLimit,
                currentRequests: 0,
                lastResetTime: Date.now(),
            },
            retryPolicy: this.config.retryPolicy,
        };
        this.httpClient = new Context7HttpClient(httpConfig);
        // Initialize MCP client
        const mcpConfig = {
            apiKey: this.config.apiKey || DEFAULT_API_KEY,
            mcpUrl: this.config.apiUrl || DEFAULT_MCP_URL,
            timeout: this.config.timeout,
        };
        this.mcpClient = new Context7MCPClient(mcpConfig);
        // Initialize LRU cache (prevents memory leaks)
        this.cache = new LRUCache({
            max: 1000, // Max 1000 entries
            ttl: Math.max(1, Math.floor(this.config.cacheExpiryHours * 60 * 60 * 1000)), // TTL in milliseconds, minimum 1ms
            updateAgeOnGet: true, // Update access time on get
            allowStale: false, // Don't return stale entries
        });
        // Initialize library ID cache (7-day expiry for library mappings)
        this.libraryIdCache = new LRUCache({
            max: 500, // Max 500 library ID mappings
            ttl: 7 * 24 * 60 * 60 * 1000, // 7 days TTL
            updateAgeOnGet: true,
            allowStale: false,
        });
        // Initialize circuit breaker for Context7 API calls
        this.circuitBreaker = new CircuitBreaker('Context7Broker', {
            failureThreshold: 3, // Open after 3 failures
            recoveryTimeout: 30000, // 30 seconds recovery time
            monitoringPeriod: 10000, // 10 seconds monitoring
        });
        // Load cache on startup
        this.loadCache();
        // Check if Context7 is enabled
        const isEnabled = process.env.CONTEXT7_ENABLED !== 'false';
        // Check if Context7 MCP tools are available (async)
        if (isEnabled) {
            this.checkMCPAvailability()
                .then(available => {
                this.isAvailable = available;
            })
                .catch(() => {
                this.isAvailable = false;
            });
        }
        else {
            console.log('Context7 disabled via CONTEXT7_ENABLED=false');
            this.isAvailable = false;
        }
    }
    /**
     * Check if Context7 MCP tools are available
     */
    async checkMCPAvailability() {
        try {
            // Check if Context7 is disabled
            if (process.env.CONTEXT7_ENABLED === 'false') {
                console.log('Context7 disabled via CONTEXT7_ENABLED=false');
                return false;
            }
            // If HTTP-only mode is enabled, skip MCP and go straight to HTTP
            if (this.config.useHttpOnly) {
                console.log('Context7 HTTP-only mode enabled, using HTTP client');
                return await this.httpClient.healthCheck();
            }
            // Try to connect to MCP server first
            if (!this.mcpClient.isClientConnected()) {
                await this.mcpClient.connect();
            }
            // Check MCP health
            const mcpHealthy = await this.mcpClient.healthCheck();
            if (mcpHealthy) {
                return true;
            }
            // Fallback to HTTP health check
            return await this.httpClient.healthCheck();
        }
        catch (error) {
            console.warn('Context7 service health check failed:', error);
            return false;
        }
    }
    /**
     * Get cached data if available and not expired
     */
    getCachedData(key) {
        if (!this.config.enableCache)
            return null;
        const cached = this.cache.get(key);
        if (!cached)
            return null;
        // LRU cache handles expiry automatically, but keep manual check for compatibility
        const now = Date.now();
        if (now > cached.expiry) {
            this.cache.delete(key);
            return null;
        }
        return cached.data;
    }
    /**
     * Cache data with expiry
     */
    setCachedData(key, data) {
        if (!this.config.enableCache)
            return;
        const now = Date.now();
        const expiry = now + this.config.cacheExpiryHours * 60 * 60 * 1000;
        // LRU cache handles size limits automatically
        this.cache.set(key, {
            data,
            timestamp: now,
            expiry,
        });
        // Auto-save every 10 cache writes
        if (this.cache.size % 10 === 0) {
            this.saveCache();
        }
    }
    /**
     * Save cache to file
     */
    async saveCache() {
        try {
            if (!existsSync('./cache')) {
                await mkdir('./cache', { recursive: true });
            }
            const cacheData = Array.from(this.cache.entries());
            await writeFile(this.cacheFile, JSON.stringify(cacheData, null, 2));
        }
        catch (error) {
            console.warn('Failed to save cache:', error);
        }
    }
    /**
     * Load cache from file
     */
    async loadCache() {
        try {
            if (!existsSync(this.cacheFile))
                return;
            const data = await readFile(this.cacheFile, 'utf8');
            const cacheData = JSON.parse(data);
            for (const [key, value] of cacheData) {
                this.cache.set(key, value);
            }
        }
        catch (error) {
            console.warn('Failed to load cache:', error);
        }
    }
    /**
     * Get documentation for a specific topic
     */
    async getDocumentation(topic, version) {
        const startTime = Date.now();
        const cacheKey = `doc:${topic}:${version ?? 'latest'}`;
        try {
            // Check cache first
            const cachedData = this.getCachedData(cacheKey);
            if (cachedData) {
                // Using cached Context7 docs
                this.recordMetrics('documentation', topic, true, Date.now() - startTime, 0, 0, 'cache');
                return cachedData;
            }
            if (!this.isAvailable) {
                if (this.config.enableFallback) {
                    const fallbackDocs = this.getFallbackDocumentation(topic, version);
                    this.recordMetrics('documentation', topic, true, Date.now() - startTime, 0, 0, 'fallback');
                    return fallbackDocs;
                }
                else {
                    throw new Error('Context7 service unavailable and fallback disabled');
                }
            }
            // Make real Context7 MCP call
            // Fetching real Context7 docs
            const docs = await this.fetchRealDocumentation(topic, version);
            // Cache the results
            this.setCachedData(cacheKey, docs);
            const responseTime = Date.now() - startTime;
            this.validateResponseTime(startTime, 'getDocumentation');
            // Record metrics for successful request
            this.recordMetrics('documentation', topic, true, responseTime, this.estimateTokenUsage(docs), this.estimateCost(docs), 'context7');
            return docs;
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            console.error(`Context7 documentation error for ${topic}:`, error);
            // Record metrics for failed request
            this.recordMetrics('documentation', topic, false, responseTime, 0, 0, 'error');
            if (this.config.enableFallback) {
                const fallbackDocs = this.getFallbackDocumentation(topic, version);
                this.recordMetrics('documentation', topic, true, responseTime, 0, 0, 'fallback');
                return fallbackDocs;
            }
            throw new Error(`Context7 documentation retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Fetch real documentation from Context7 MCP
     */
    async fetchRealDocumentation(topic, version) {
        try {
            // First resolve the library ID using Context7 MCP tool
            const libraryId = await this.resolveLibraryId(topic);
            if (!libraryId) {
                throw new Error(`No Context7 library found for topic: ${topic}`);
            }
            // Get documentation using Context7 MCP tool
            const docs = await this.getLibraryDocs(libraryId, topic, version);
            // Transform the response to match our interface
            return docs.map((doc) => ({
                id: doc.id || `doc-${topic}-${Date.now()}`,
                title: doc.title || `${topic} Documentation`,
                content: doc.content || doc.description || '',
                url: doc.url || doc.link,
                version: doc.version || (version ?? 'latest'),
                lastUpdated: doc.lastUpdated ? new Date(doc.lastUpdated) : new Date(),
                relevanceScore: doc.relevanceScore || doc.score || 0.8,
            }));
        }
        catch (error) {
            console.error('Error fetching real documentation from Context7:', error);
            throw new Error(`Context7 documentation fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Generate stable ID based on content hash
     */
    generateStableId(type, content, url) {
        const hash = createHash('md5');
        hash.update(`${type}:${content}:${url || ''}`);
        return `${type}-${hash.digest('hex').substring(0, 8)}`;
    }
    /**
     * Execute request with deduplication to prevent multiple identical requests
     */
    async executeWithDeduplication(requestKey, operation) {
        // Check if there's already a pending request for this key
        const existingRequest = this.pendingRequests.get(requestKey);
        if (existingRequest) {
            console.log(`Deduplicating request for key: ${requestKey}`);
            return existingRequest;
        }
        // Create new request and store it
        const requestPromise = operation().finally(() => {
            // Clean up the pending request when done
            this.pendingRequests.delete(requestKey);
        });
        this.pendingRequests.set(requestKey, requestPromise);
        return requestPromise;
    }
    /**
     * Resolve library ID using Context7 search API with caching
     */
    async resolveLibraryId(topic) {
        const cacheKey = `libid:${topic.toLowerCase()}`;
        try {
            // Check cache first
            const cachedData = this.libraryIdCache.get(cacheKey);
            if (cachedData) {
                console.log(`Using cached library ID for topic: ${topic}`);
                return cachedData.libraryId;
            }
            // Check fallback mapping first
            const fallbackId = this.mapTopicToLibraryId(topic);
            if (fallbackId) {
                // Cache the fallback mapping
                this.libraryIdCache.set(cacheKey, {
                    libraryId: fallbackId,
                    timestamp: Date.now(),
                    expiry: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
                });
                console.log(`Using fallback library ID for topic: ${topic} -> ${fallbackId}`);
                return fallbackId;
            }
            // If HTTP-only mode is enabled, skip MCP and go straight to HTTP
            if (this.config.useHttpOnly) {
                const response = await this.executeWithDeduplication(`search:${topic}`, async () => {
                    return this.circuitBreaker.execute(async () => {
                        return this.httpClient.get('/search', {
                            query: topic,
                        });
                    });
                });
                if (!response.success || !response.data?.results || response.data.results.length === 0) {
                    console.warn(`No libraries found for topic: ${topic}`);
                    return null;
                }
                // Return the first result's ID (most relevant)
                const firstResult = response.data.results[0];
                const libraryId = firstResult.id || null;
                // Cache the result
                if (libraryId) {
                    this.libraryIdCache.set(cacheKey, {
                        libraryId,
                        timestamp: Date.now(),
                        expiry: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
                    });
                }
                return libraryId;
            }
            // Try MCP client first
            if (this.mcpClient.isClientConnected()) {
                const libraryId = await this.mcpClient.resolveLibraryId(topic);
                if (libraryId) {
                    // Cache the result
                    this.libraryIdCache.set(cacheKey, {
                        libraryId,
                        timestamp: Date.now(),
                        expiry: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
                    });
                    return libraryId;
                }
            }
            // Fallback to HTTP client using search API
            const response = await this.executeWithDeduplication(`search:${topic}`, async () => {
                return this.circuitBreaker.execute(async () => {
                    return this.httpClient.get('/search', {
                        query: topic,
                    });
                });
            });
            if (!response.success || !response.data?.results || response.data.results.length === 0) {
                console.warn(`No libraries found for topic: ${topic}`);
                return null;
            }
            // Return the first result's ID (most relevant)
            const firstResult = response.data.results[0];
            const libraryId = firstResult.id || null;
            // Cache the result
            if (libraryId) {
                this.libraryIdCache.set(cacheKey, {
                    libraryId,
                    timestamp: Date.now(),
                    expiry: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
                });
            }
            return libraryId;
        }
        catch (error) {
            console.warn(`Error resolving library ID for ${topic}:`, error);
            return null;
        }
    }
    /**
     * Get library documentation using Context7 library API
     */
    async getLibraryDocs(libraryId, topic, version) {
        try {
            // If HTTP-only mode is enabled, skip MCP and go straight to HTTP
            if (this.config.useHttpOnly) {
                // Use the working search endpoint instead of non-existent library endpoint
                const searchQuery = `${libraryId} ${topic}`;
                const response = await this.executeWithDeduplication(`docs:${libraryId}:${topic}`, async () => {
                    return this.circuitBreaker.execute(async () => {
                        return this.httpClient.get('/search', {
                            query: searchQuery,
                        });
                    });
                });
                if (!response.success || !response.data) {
                    throw new Error(response.error || 'Failed to fetch library documentation');
                }
                // Transform Context7 search API response to our format
                const results = response.data.results || [];
                // Transform search results into documentation format
                const docs = results.map((result) => {
                    const content = result.description || '';
                    const title = result.title || `${topic} Documentation`;
                    return {
                        id: result.id || this.generateStableId('doc', content, result.id),
                        title,
                        content,
                        url: `https://context7.com/library/${result.id}`,
                        version: version ?? 'latest',
                        lastUpdated: result.lastUpdateDate ? new Date(result.lastUpdateDate) : new Date(),
                        relevanceScore: result.trustScore ? result.trustScore / 10 : 0.8, // Convert trust score to 0-1 scale
                    };
                });
                return docs;
            }
            // Try MCP client first
            if (this.mcpClient.isClientConnected()) {
                const docs = await this.mcpClient.getLibraryDocs(libraryId, topic, version ?? 'latest');
                if (docs.length > 0) {
                    return docs;
                }
            }
            // Fallback to HTTP client using library-specific endpoint
            // Convert libraryId from "/owner/repo" to "owner/repo"
            const cleanLibraryId = libraryId.startsWith('/') ? libraryId.slice(1) : libraryId;
            const response = await this.executeWithDeduplication(`docs:${cleanLibraryId}:${topic}`, async () => {
                return this.circuitBreaker.execute(async () => {
                    return this.httpClient.get(`/${cleanLibraryId}`, {
                        type: 'json',
                        topic: topic,
                        tokens: 4000,
                    });
                });
            });
            if (!response.success || !response.data) {
                throw new Error(response.error || 'Failed to fetch library documentation');
            }
            // Transform Context7 API response to our format
            const snippets = response.data.snippets || [];
            const qaItems = response.data.qaItems || [];
            // Combine snippets and QA items
            const docs = [
                ...snippets.map((snippet) => {
                    const content = snippet.codeDescription || '';
                    const code = snippet.codeList?.[0]?.code || '';
                    const url = snippet.codeId;
                    return {
                        id: snippet.codeId || this.generateStableId('snippet', `${content}:${code}`, url),
                        title: snippet.codeTitle || 'Code Example',
                        content,
                        code,
                        language: snippet.codeLanguage || 'javascript',
                        url,
                        version: version ?? 'latest',
                        lastUpdated: new Date(),
                        relevanceScore: snippet.relevance || 0.8,
                    };
                }),
                ...qaItems.map((qa) => {
                    const content = qa.answer || '';
                    const url = qa.url;
                    return {
                        id: this.generateStableId('qa', content, url),
                        title: qa.question || 'Q&A Item',
                        content,
                        url,
                        version: version ?? 'latest',
                        lastUpdated: new Date(),
                        relevanceScore: 0.7,
                    };
                }),
            ];
            return docs;
        }
        catch (error) {
            console.error('Error fetching library docs:', error);
            throw error;
        }
    }
    /**
     * Map topic to Context7 library ID (fallback method)
     */
    mapTopicToLibraryId(topic) {
        const topicMap = {
            react: '/websites/react_dev',
            typescript: '/microsoft/TypeScript',
            nodejs: '/nodejs/node',
            javascript: '/websites/javascript_info',
            python: '/python/cpython',
            nextjs: '/vercel/next.js',
            vue: '/vuejs/core',
            angular: '/angular/angular',
            web: '/websites/react_dev', // Map 'web' to React for now
            // Add more generic mappings
            'project initialization': '/websites/react_dev',
            'best practices': '/websites/react_dev',
            development: '/websites/react_dev',
            planning: '/websites/react_dev',
            testing: '/websites/react_dev',
            deployment: '/websites/react_dev',
            maintenance: '/websites/react_dev',
            migration: '/websites/react_dev',
        };
        // Try exact match first
        if (topicMap[topic.toLowerCase()]) {
            return topicMap[topic.toLowerCase()];
        }
        // Try partial matches for compound topics
        const lowerTopic = topic.toLowerCase();
        for (const [key, value] of Object.entries(topicMap)) {
            if (lowerTopic.includes(key)) {
                return value;
            }
        }
        // Default fallback for unknown topics
        return '/websites/react_dev';
    }
    /**
     * Get code examples for a technology and pattern
     */
    async getCodeExamples(technology, pattern) {
        const startTime = Date.now();
        const cacheKey = `examples:${technology}:${pattern}`;
        try {
            // Check cache first
            const cachedData = this.getCachedData(cacheKey);
            if (cachedData) {
                // Using cached Context7 examples
                return cachedData;
            }
            if (!this.isAvailable) {
                if (this.config.enableFallback) {
                    return this.getFallbackCodeExamples(technology, pattern);
                }
                else {
                    throw new Error('Context7 service unavailable and fallback disabled');
                }
            }
            // Make real Context7 MCP call
            // Fetching real Context7 examples
            const examples = await this.fetchRealCodeExamples(technology, pattern);
            // Cache the results
            this.setCachedData(cacheKey, examples);
            this.validateResponseTime(startTime, 'getCodeExamples');
            return examples;
        }
        catch (error) {
            console.error(`Context7 code examples error for ${technology} ${pattern}:`, error);
            if (this.config.enableFallback) {
                return this.getFallbackCodeExamples(technology, pattern);
            }
            throw new Error(`Context7 code examples retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Fetch real code examples from Context7 MCP
     */
    async fetchRealCodeExamples(technology, pattern) {
        try {
            // First resolve the library ID using Context7 MCP tool
            const libraryId = await this.resolveLibraryId(technology);
            if (!libraryId) {
                throw new Error(`No Context7 library found for technology: ${technology}`);
            }
            // Get documentation with pattern-specific topic
            const docs = await this.getLibraryDocs(libraryId, `${technology} ${pattern}`, 'latest');
            // Transform documentation into code examples
            return docs.map((doc, index) => ({
                id: `example-${technology}-${pattern}-${Date.now()}-${index}`,
                title: doc.title || `${pattern} Example in ${technology}`,
                code: doc.content || doc.code || '',
                language: technology.toLowerCase(),
                description: doc.description || doc.summary || '',
                tags: [technology.toLowerCase(), pattern.toLowerCase()],
                difficulty: 'intermediate',
                relevanceScore: 0.8,
            }));
        }
        catch (error) {
            console.error('Error fetching real Context7 code examples:', error);
            throw new Error(`Context7 code examples fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get best practices for a domain
     */
    async getBestPractices(domain) {
        const startTime = Date.now();
        const cacheKey = `best-practices:${domain}`;
        try {
            // Check cache first
            const cachedData = this.getCachedData(cacheKey);
            if (cachedData) {
                // Using cached Context7 best practices
                return cachedData;
            }
            if (!this.isAvailable) {
                if (this.config.enableFallback) {
                    return this.getFallbackBestPractices(domain);
                }
                else {
                    throw new Error('Context7 service unavailable and fallback disabled');
                }
            }
            // Make real Context7 MCP call
            // Fetching real Context7 best practices
            const practices = await this.fetchRealBestPractices(domain);
            // Cache the results
            this.setCachedData(cacheKey, practices);
            this.validateResponseTime(startTime, 'getBestPractices');
            return practices;
        }
        catch (error) {
            console.error(`Context7 best practices error for ${domain}:`, error);
            if (this.config.enableFallback) {
                return this.getFallbackBestPractices(domain);
            }
            throw new Error(`Context7 best practices retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Fetch real best practices from Context7 MCP
     */
    async fetchRealBestPractices(domain) {
        try {
            // First resolve the library ID using Context7 MCP tool
            const libraryId = await this.resolveLibraryId(domain);
            if (!libraryId) {
                throw new Error(`No Context7 library found for domain: ${domain}`);
            }
            // Get documentation with best practices topic
            const docs = await this.getLibraryDocs(libraryId, `${domain} best practices`, 'latest');
            // Transform documentation into best practices
            return docs.map((doc, index) => ({
                id: `bp-${domain}-${Date.now()}-${index}`,
                title: doc.title || `${domain} Best Practice`,
                description: doc.content || doc.description || '',
                category: 'general',
                priority: 'medium',
                applicableScenarios: ['general development'],
                benefits: ['improved code quality'],
                relevanceScore: 0.8,
            }));
        }
        catch (error) {
            console.error('Error fetching real Context7 best practices:', error);
            throw new Error(`Context7 best practices fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get troubleshooting guides for a problem
     */
    async getTroubleshootingGuides(problem) {
        const startTime = Date.now();
        const cacheKey = `troubleshooting:${problem}`;
        try {
            // Check cache first
            const cachedData = this.getCachedData(cacheKey);
            if (cachedData) {
                // Using cached Context7 troubleshooting
                return cachedData;
            }
            if (!this.isAvailable) {
                if (this.config.enableFallback) {
                    return this.getFallbackTroubleshootingGuides(problem);
                }
                else {
                    throw new Error('Context7 service unavailable and fallback disabled');
                }
            }
            // Make real Context7 MCP call
            // Fetching real Context7 troubleshooting
            const guides = await this.fetchRealTroubleshootingGuides(problem);
            // Cache the results
            this.setCachedData(cacheKey, guides);
            this.validateResponseTime(startTime, 'getTroubleshootingGuides');
            return guides;
        }
        catch (error) {
            console.error(`Context7 troubleshooting error for ${problem}:`, error);
            if (this.config.enableFallback) {
                return this.getFallbackTroubleshootingGuides(problem);
            }
            throw new Error(`Context7 troubleshooting guides retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Fetch real troubleshooting guides from Context7 MCP
     */
    async fetchRealTroubleshootingGuides(problem) {
        try {
            // Extract technology from problem for library resolution
            const techKeywords = ['react', 'typescript', 'javascript', 'node', 'next', 'vue', 'angular'];
            const technology = techKeywords.find(tech => problem.toLowerCase().includes(tech)) || 'javascript';
            // First resolve the library ID using Context7 MCP tool
            const libraryId = await this.resolveLibraryId(technology);
            if (!libraryId) {
                throw new Error(`No Context7 library found for technology: ${technology}`);
            }
            // Get documentation with troubleshooting topic
            const docs = await this.getLibraryDocs(libraryId, `troubleshooting ${problem}`, 'latest');
            // Transform documentation into troubleshooting guides
            return docs.map((doc, index) => ({
                id: `guide-${problem.replace(/\s+/g, '-')}-${Date.now()}-${index}`,
                problem: problem,
                solutions: [
                    {
                        description: doc.title || `Solution for ${problem}`,
                        steps: doc.content ? doc.content.split('\n').filter((line) => line.trim()) : [],
                        difficulty: 'medium',
                        successRate: 0.8,
                    },
                ],
                relatedIssues: [],
                relevanceScore: 0.8,
            }));
        }
        catch (error) {
            console.error('Error fetching real Context7 troubleshooting guides:', error);
            throw new Error(`Context7 troubleshooting guides fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get knowledge for a specific topic (general method that combines all knowledge types)
     */
    async getKnowledge(params) {
        const startTime = Date.now();
        const { topic, priority } = params;
        try {
            // Get all types of knowledge in parallel
            const [documentation, codeExamples, bestPractices, troubleshootingGuides] = await Promise.all([
                this.getDocumentation(topic),
                this.getCodeExamples(topic, 'best-practices'),
                this.getBestPractices(topic),
                this.getTroubleshootingGuides(topic),
            ]);
            // Generate summary based on priority and knowledge gathered
            const summary = this.generateKnowledgeSummary(topic, priority, {
                documentation: documentation.length,
                codeExamples: codeExamples.length,
                bestPractices: bestPractices.length,
                troubleshootingGuides: troubleshootingGuides.length,
            });
            this.validateResponseTime(startTime, 'getKnowledge');
            return {
                documentation,
                codeExamples,
                bestPractices,
                troubleshootingGuides,
                summary,
            };
        }
        catch (error) {
            console.error(`Context7 knowledge error for ${topic}:`, error);
            throw new Error(`Context7 knowledge retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Generate a summary of the knowledge gathered
     */
    generateKnowledgeSummary(topic, priority, counts) {
        const totalItems = counts.documentation +
            counts.codeExamples +
            counts.bestPractices +
            counts.troubleshootingGuides;
        return `Context7 knowledge gathered for ${topic} (${priority} priority): ${totalItems} total items including ${counts.documentation} documentation entries, ${counts.codeExamples} code examples, ${counts.bestPractices} best practices, and ${counts.troubleshootingGuides} troubleshooting guides.`;
    }
    /**
     * Check if Context7 service is available
     */
    async checkAvailability() {
        try {
            // Check if MCP tools are available
            return await this.httpClient.healthCheck();
        }
        catch {
            return false;
        }
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            maxSize: this.cache.max,
            hitRate: 'N/A', // LRU doesn't track hits by default
            memoryUsage: 'N/A', // Would need custom tracking
        };
    }
    /**
     * Check if cache is healthy
     */
    isCacheHealthy() {
        return this.cache.size < this.cache.max * 0.9; // Healthy if under 90% capacity
    }
    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }
    /**
     * Validate response time meets performance requirements
     */
    validateResponseTime(startTime, operation) {
        const duration = Date.now() - startTime;
        if (duration > this.config.timeout) {
            console.warn(`Context7 ${operation} took ${duration}ms, exceeding ${this.config.timeout}ms limit`);
        }
    }
    /**
     * Record metrics for Context7 requests
     */
    recordMetrics(endpoint, topic, success, responseTime, tokenUsage, cost, knowledgeSource) {
        // This would integrate with VibeMetrics if available
        // For now, we'll log the metrics
        console.log(`Context7 Metrics: ${endpoint} - ${topic} - ${success ? 'SUCCESS' : 'FAILED'} - ${responseTime}ms - ${tokenUsage} tokens - $${cost.toFixed(6)}`);
    }
    /**
     * Estimate token usage for documentation
     */
    estimateTokenUsage(docs) {
        // Rough estimation: 1 token per 4 characters
        const totalContent = docs.reduce((sum, doc) => sum + doc.content.length, 0);
        return Math.ceil(totalContent / 4);
    }
    /**
     * Estimate cost for documentation
     */
    estimateCost(docs) {
        // Rough estimation based on Context7 pricing
        const tokenUsage = this.estimateTokenUsage(docs);
        const costPerToken = 0.0001; // Example pricing
        return tokenUsage * costPerToken;
    }
    // Fallback methods for when Context7 is not available
    getFallbackDocumentation(topic, version) {
        return [
            {
                id: `fallback-doc-${topic}`,
                title: `${topic} Documentation (Fallback)`,
                content: `Basic documentation for ${topic}. External Context7 service unavailable.`,
                version: version ?? 'unknown',
                lastUpdated: new Date(),
                relevanceScore: 0.6,
            },
        ];
    }
    getFallbackCodeExamples(technology, pattern) {
        return [
            {
                id: `fallback-example-${technology}-${pattern}`,
                title: `${pattern} Example (Fallback)`,
                code: `// Basic ${pattern} example\n// Context7 service unavailable\nconsole.log('${pattern} example');`,
                language: technology.toLowerCase(),
                description: `Basic ${pattern} example. External Context7 service unavailable.`,
                tags: [technology.toLowerCase(), pattern.toLowerCase(), 'fallback'],
                difficulty: 'beginner',
                relevanceScore: 0.5,
            },
        ];
    }
    getFallbackBestPractices(domain) {
        return [
            {
                id: `fallback-bp-${domain}`,
                title: `${domain} Best Practices (Fallback)`,
                description: `Basic best practices for ${domain}. External Context7 service unavailable.`,
                category: 'general',
                priority: 'medium',
                applicableScenarios: ['general development'],
                benefits: ['basic improvements'],
                relevanceScore: 0.5,
            },
        ];
    }
    getFallbackTroubleshootingGuides(problem) {
        return [
            {
                id: `fallback-guide-${problem.replace(/\s+/g, '-')}`,
                problem: `${problem} (Fallback)`,
                solutions: [
                    {
                        description: 'Basic troubleshooting approach',
                        steps: ['Check logs', 'Restart service', 'Contact support'],
                        difficulty: 'easy',
                        successRate: 0.6,
                    },
                ],
                relatedIssues: ['general issues'],
                relevanceScore: 0.5,
            },
        ];
    }
}
//# sourceMappingURL=context7-broker.js.map