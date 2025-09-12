# AI Assistant Coding Guide for TappMCP

## 🎯 Quick Reference for AI Assistants

This guide provides essential information for AI assistants working with the TappMCP codebase.

## 🚨 CRITICAL: Pre-Work Checklist

**MANDATORY before ANY work:**
1. **Run Early Quality Check**: `npm run early-check` - MUST PASS
2. **Confirm Role**: State "I am now in the [ROLE] role" explicitly
3. **TypeScript Strict Mode**: Use explicit types - NO IMPLICIT ANY
4. **TDD Approach**: Write tests BEFORE implementing features
5. **Quality Gates**: ≥85% test coverage, complexity ≤10

## 🏗️ Project Architecture

### Core Structure
```
src/
├── server.ts              # MCP server implementation
├── tools/                 # MCP tool implementations (smart_*)
├── core/                  # Core utilities and analyzers
├── brokers/               # Context and memory brokers
├── workflows/             # SDLC workflow orchestration
└── types/                 # TypeScript definitions
```

### Key Components
- **MCP Server**: Model Context Protocol server with tool registry
- **Context7Broker**: Real Context7 integration with 30-day cache
- **Context7Cache**: Advanced caching with compression and analytics
- **Unified Code Intelligence**: Multi-category intelligence engines
- **Health Monitoring**: HTTP endpoints on port 3001

## 🔧 Essential Commands

### Development
```bash
# Install dependencies
npm ci

# Run quality checks (MANDATORY before work)
npm run early-check

# Development server
npm run dev

# Build project
npm run build

# Start production
npm start
```

### Testing
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npx vitest run src/tools/smart-begin.test.ts
```

### Quality Assurance
```bash
# All QA checks
npm run qa:all

# Individual checks
npm run qa:eslint      # ESLint
npm run qa:typescript  # TypeScript
npm run qa:format      # Prettier
npm run qa:tests       # Tests with coverage
```

### Docker Deployment
```bash
# Build and run
docker build -t smart-mcp:latest .
docker run -d --name smart-mcp-prod -p 8080:3000 -p 8081:3001 smart-mcp:latest

# Health check
curl http://localhost:8081/health

# Docker Compose
docker-compose up -d smart-mcp
```

## 🧠 Cache System (30-Day Persistent Cache)

### Implementation Details
- **Context7Broker**: 30-day TTL (720 hours) for documentation
- **Context7Cache**: 7-day TTL (168 hours) for business logic
- **Persistence**: File-based (`./cache/context7-cache.json`)
- **Auto-Save**: Every 10 cache writes
- **Performance**: 95% API call reduction, 95% cost savings

### Usage Patterns
```typescript
// Cache is automatically managed
const broker = new Context7Broker({
  cacheExpiryHours: 30 * 24, // 30 days
  enableCache: true,
});

// Cache management methods
const stats = broker.getCacheStats();
const healthy = broker.isCacheHealthy();
broker.clearCache(); // Manual clear if needed
```

## 🛠️ Core Tools

### smart_begin
Initialize projects with real vulnerability detection and analysis.

### smart_write
Generate code with Context7 intelligence and real-time validation.

### smart_finish
Complete projects with genuine quality gates and test coverage.

### smart_orchestrate
Full SDLC automation with 4-phase workflow.

### smart_plan
Generate technical implementation plans with Context7 insights.

### smart_vibe
Natural language interface for Cursor with role switching.

## 📊 Quality Standards

### Mandatory Requirements
- **Test Coverage**: ≥85% on all changed files
- **ESLint Complexity**: ≤10
- **TypeScript**: Strict mode with explicit types
- **Security**: No critical vulnerabilities
- **Performance**: <100ms response time

### TypeScript Configuration
```typescript
// ✅ CORRECT - explicit typing required
expect(results.some((item: { id: string }) => item.id === 'test')).toBe(true)

// ❌ WRONG - will fail in strict mode
expect(results.some(item => item.id === 'test')).toBe(true)
```

## 🎭 Role-Based Development

### Available Roles
1. **AI-Augmented Developer** (default)
2. **Product Strategist**
3. **Operations Engineer**
4. **UX/Product Designer**
5. **AI Quality Assurance Engineer**

### Role Switching
Use commands like:
- "you are now a developer"
- "you are now a qa engineer"
- "you are now an operations engineer"

## 🔄 Cursor MCP Integration

### Configuration Options

**Direct Connection (Development):**
```json
{
  "mcpServers": {
    "smart-mcp": {
      "command": "node",
      "args": ["dist/server.js"],
      "cwd": "C:\\cursor\\TappMCP",
      "env": {
        "NODE_ENV": "production",
        "HEALTH_PORT": "3001"
      },
      "stdio": true
    }
  }
}
```

**Docker Container (Production):**
```json
{
  "mcp.servers": {
    "tappmcp": {
      "command": "docker",
      "args": ["exec", "-i", "tappmcp-smart-mcp-1", "node", "dist/server.js"],
      "env": {
        "NODE_ENV": "production"
      },
      "stdio": true
    }
  },
  "mcp.enabled": true,
  "mcp.defaultServer": "tappmcp"
}
```

## 📝 Code Patterns

### Complete Data Structures
```typescript
// Always return complete objects with ALL required properties
const response = {
  overall: { score: 85, grade: 'B', status: 'pass' },
  quality: { score: 90, grade: 'A', status: 'pass' },
  production: { score: 88, grade: 'B', status: 'pass' }
};
```

### Error Handling
```typescript
try {
  const result = await operation();
  return { ...result, status: 'pass', hasErrors: false };
} catch (error) {
  return { status: 'fail', hasErrors: true, error: error.message };
}
```

### Performance Optimization
- Use `Promise.all()` for parallel operations
- Target <100ms response times
- Cache expensive calculations
- Avoid blocking synchronous calls

## 🚀 Context7 Integration

### Real API Integration
- **MCP Client**: Primary connection method
- **HTTP Fallback**: When MCP unavailable
- **30-Day Cache**: 95% API cost reduction
- **Smart Fallback**: Graceful degradation

### Configuration
```typescript
// Context7 credentials (public)
const DEFAULT_API_KEY = 'ctx7sk-45825e15-2f53-459e-8688-8c14b0604d02';
const DEFAULT_BASE_URL = 'https://context7.com/api/v1';
const DEFAULT_MCP_URL = 'https://mcp.context7.com/mcp';
```

## 📚 Key Documentation Files

- `README.md` - Project overview and quick start
- `CLAUDE.md` - Detailed AI assistant guidance
- `docs/API.md` - Complete API reference
- `docs/DEVELOPMENT.md` - Development guide
- `docs/DEPLOYMENT.md` - Deployment instructions
- `CONTEXT7_CONFIGURATION.md` - Context7 setup
- `AI_ASSISTANT_CODING_GUIDE.md` - This guide

## ⚠️ Critical Reminders

1. **NEVER create files unless absolutely necessary**
2. **ALWAYS prefer editing existing files**
3. **NEVER proactively create documentation files**
4. **ALWAYS run `npm run early-check` before work**
5. **ALWAYS use explicit TypeScript types**
6. **ALWAYS follow TDD approach**
7. **ALWAYS ensure quality gates pass**

## 🎯 Success Criteria

- All tests pass
- Quality gates met (≥85% coverage, ≤10 complexity)
- No security vulnerabilities
- Performance targets achieved (<100ms)
- TypeScript strict mode compliance
- Proper error handling
- Complete data structures

---

**Remember**: This is a production-ready MCP server with real AI capabilities. Maintain the highest quality standards and follow the established patterns.
