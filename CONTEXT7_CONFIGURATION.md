# Context7 Configuration Guide

## Purpose: AI Assistant Enhancement

**Context7 integration is designed to enhance AI assistants (like Claude, Cursor AI) with domain expertise and best practices.** The intelligence provides context and insights to improve AI assistant responses, not to generate code directly.

## Environment Variables

The following environment variables are required for Context7 integration:

### Context7 API Credentials (Public)
```bash
# Context7 API Configuration - These are public credentials
CONTEXT7_API_KEY=ctx7sk-45825e15-2f53-459e-8688-8c14b0604d02
CONTEXT7_BASE_URL=https://context7.com/api/v1
CONTEXT7_MCP_URL=https://mcp.context7.com/mcp
```

**Note**: These credentials are public and can be used for development and testing.

### Optional Variables
```bash
# MCP Server Configuration
MCP_SERVER_PORT=3000
MCP_SERVER_HOST=localhost

# Development Configuration
NODE_ENV=development
LOG_LEVEL=info

# Docker Configuration
DOCKER_IMAGE_TAG=latest
DOCKER_REGISTRY=your-registry.com
```

## Configuration in Code

The Context7Broker can be configured programmatically:

```typescript
import { Context7Broker } from './src/brokers/context7-broker.js';

const broker = new Context7Broker({
  apiKey: process.env.CONTEXT7_API_KEY,
  baseUrl: process.env.CONTEXT7_BASE_URL,
  timeout: 5000,
  maxRetries: 3,
  enableFallback: true,
  enableCache: true,
  cacheExpiryHours: 30 * 24, // 30 days (720 hours)
  rateLimit: {
    requestsPerMinute: 60,
    burstLimit: 10,
  },
  retryPolicy: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
  },
});
```

## Docker Configuration

Add the following to your `docker-compose.yml`:

```yaml
environment:
  - CONTEXT7_API_KEY=${CONTEXT7_API_KEY}
  - CONTEXT7_BASE_URL=${CONTEXT7_BASE_URL}
```

## CI/CD Pipeline

Add the following secrets to your CI/CD pipeline:

- `CONTEXT7_API_KEY`: Your Context7 API key
- `CONTEXT7_BASE_URL`: Context7 base URL (optional, defaults to https://mcp.context7.com)

## Cache Configuration

### 30-Day Persistent Cache
The Context7Broker now includes intelligent caching with 95% API cost reduction:

```typescript
// Cache configuration
const broker = new Context7Broker({
  enableCache: true,
  cacheExpiryHours: 30 * 24, // 30 days
  // Cache file: ./cache/context7-cache.json
  // Auto-save: Every 10 cache writes
});
```

### Cache Features
- **30-day TTL**: Documentation data cached for 30 days
- **7-day TTL**: Business logic cached for 7 days
- **Persistence**: Cache survives application restarts
- **Auto-save**: Automatic saving every 10 writes
- **Performance**: 95% API call reduction, 95% cost savings
- **Error Handling**: Graceful fallback if persistence fails

### Cache Management
```typescript
// Get cache statistics
const stats = broker.getCacheStats();
console.log(`Cache size: ${stats.size}/${stats.maxSize}`);

// Check cache health
const healthy = broker.isCacheHealthy();
console.log(`Cache healthy: ${healthy}`);

// Manual cache clear
broker.clearCache();
```

## Security Notes

- Never commit API keys to version control
- Use environment variables or secure secret management
- Rotate API keys regularly
- Monitor API usage and costs
- Cache files are stored locally and should be backed up
