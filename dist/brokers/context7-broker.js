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
/**
 * Context7 Broker for external knowledge integration
 */
export class Context7Broker {
    config;
    httpClient;
    mcpClient;
    isAvailable = false;
    cache;
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
        // Load cache on startup
        this.loadCache();
        // Check if Context7 MCP tools are available (async)
        this.checkMCPAvailability()
            .then(available => {
            this.isAvailable = available;
        })
            .catch(() => {
            this.isAvailable = false;
        });
    }
    /**
     * Check if Context7 MCP tools are available
     */
    async checkMCPAvailability() {
        try {
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
                return cachedData;
            }
            if (!this.isAvailable) {
                if (this.config.enableFallback) {
                    return this.getFallbackDocumentation(topic, version);
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
            this.validateResponseTime(startTime, 'getDocumentation');
            return docs;
        }
        catch (error) {
            console.error(`Context7 documentation error for ${topic}:`, error);
            if (this.config.enableFallback) {
                return this.getFallbackDocumentation(topic, version);
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
     * Resolve library ID using Context7 search API
     */
    async resolveLibraryId(topic) {
        try {
            // If HTTP-only mode is enabled, skip MCP and go straight to HTTP
            if (this.config.useHttpOnly) {
                const response = await this.httpClient.get('/search', {
                    query: topic,
                });
                if (!response.success || !response.data?.results || response.data.results.length === 0) {
                    console.warn(`No libraries found for topic: ${topic}`);
                    return null;
                }
                // Return the first result's ID (most relevant)
                const firstResult = response.data.results[0];
                return firstResult.id || null;
            }
            // Try MCP client first
            if (this.mcpClient.isClientConnected()) {
                const libraryId = await this.mcpClient.resolveLibraryId(topic);
                if (libraryId) {
                    return libraryId;
                }
            }
            // Fallback to HTTP client using search API
            const response = await this.httpClient.get('/search', {
                query: topic,
            });
            if (!response.success || !response.data?.results || response.data.results.length === 0) {
                console.warn(`No libraries found for topic: ${topic}`);
                return null;
            }
            // Return the first result's ID (most relevant)
            const firstResult = response.data.results[0];
            return firstResult.id || null;
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
                // Convert libraryId from "/owner/repo" to "owner/repo"
                const cleanLibraryId = libraryId.startsWith('/') ? libraryId.slice(1) : libraryId;
                const response = await this.httpClient.get(`/${cleanLibraryId}`, {
                    type: 'json',
                    topic: topic,
                    tokens: 4000,
                });
                if (!response.success || !response.data) {
                    throw new Error(response.error || 'Failed to fetch library documentation');
                }
                // Transform Context7 API response to our format
                const snippets = response.data.snippets || [];
                const qaItems = response.data.qaItems || [];
                // Combine snippets and QA items
                const docs = [
                    ...snippets.map((snippet) => ({
                        id: snippet.id || `snippet-${Date.now()}`,
                        title: snippet.title || `${topic} Code Example`,
                        content: snippet.content || snippet.code || '',
                        url: snippet.url || snippet.link,
                        version: version ?? 'latest',
                        lastUpdated: snippet.lastUpdated ? new Date(snippet.lastUpdated) : new Date(),
                        relevanceScore: snippet.relevanceScore || snippet.score || 0.8,
                    })),
                    ...qaItems.map((qa) => ({
                        id: qa.id || `qa-${Date.now()}`,
                        title: qa.question || `${topic} Q&A`,
                        content: qa.answer || qa.content || '',
                        url: qa.url || qa.link,
                        version: version ?? 'latest',
                        lastUpdated: qa.lastUpdated ? new Date(qa.lastUpdated) : new Date(),
                        relevanceScore: qa.relevanceScore || qa.score || 0.7,
                    })),
                ];
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
            const response = await this.httpClient.get(`/${cleanLibraryId}`, {
                type: 'json',
                topic: topic,
                tokens: 4000,
            });
            if (!response.success || !response.data) {
                throw new Error(response.error || 'Failed to fetch library documentation');
            }
            // Transform Context7 API response to our format
            const snippets = response.data.snippets || [];
            const qaItems = response.data.qaItems || [];
            // Combine snippets and QA items
            const docs = [
                ...snippets.map((snippet) => ({
                    id: snippet.codeId || `snippet-${Date.now()}`,
                    title: snippet.codeTitle || 'Code Example',
                    content: snippet.codeDescription || '',
                    code: snippet.codeList?.[0]?.code || '',
                    language: snippet.codeLanguage || 'javascript',
                    url: snippet.codeId,
                    version: version ?? 'latest',
                    lastUpdated: new Date(),
                    relevanceScore: snippet.relevance || 0.8,
                })),
                ...qaItems.map((qa, index) => ({
                    id: `qa-${index}-${Date.now()}`,
                    title: qa.question || 'Q&A Item',
                    content: qa.answer || '',
                    url: qa.url,
                    version: version ?? 'latest',
                    lastUpdated: new Date(),
                    relevanceScore: 0.7,
                })),
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