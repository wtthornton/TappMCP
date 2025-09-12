# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🧠 AI Assistant Enhancement Purpose

**TappMCP is designed to enhance AI assistants like Claude, not to generate code directly.** The Context7 intelligence provides domain expertise, best practices, and enhanced context to make AI assistants smarter and more helpful to developers. The theater system exposes the difference between template-based responses and genuine AI intelligence to help vibe coders understand and evaluate AI assistant quality.

## 🚨 CRITICAL: Before Starting ANY Work

**MANDATORY COMPLIANCE CHECKLIST:**
1. **Run Early Quality Check**: `npm run early-check` - MUST PASS before any work
2. **Confirm Your Role**: State "I am now in the [ROLE] role" explicitly
3. **Validate Environment**: Ensure all tools are installed and configured
4. **Follow TDD Approach**: Write tests BEFORE implementing features
5. **TypeScript Strict Mode**: Always use explicit types, especially in callbacks - NO IMPLICIT ANY

**Process Violations Will Result In:**
- Test failures and quality issues
- Role compliance failure
- Potential project failure

## Essential Commands

### Development
```bash
# Install dependencies (use npm ci for deterministic installs)
npm ci

# Start development server
npm run dev

# Build the project
npm run build

# Start production server
npm start
```

### Docker Deployment
```bash
# Build and deploy production container
docker build -t smart-mcp:latest .
docker run -d --name smart-mcp -p 3000:3000 -p 3001:3001 -v smart-mcp-data:/app/data smart-mcp:latest

# Health check
curl http://localhost:3001/health

# Run smoke test to verify deployment
NODE_ENV=test npx vitest run src/deployment/smoke-test.test.ts
```

### Testing
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run a single test file
npx vitest run src/tools/smart-begin.test.ts
```

### Quality Checks
```bash
# Early quality check (MUST PASS before any work)
npm run early-check

# Run all QA checks
npm run qa:all

# Individual QA checks
npm run qa:eslint      # ESLint check
npm run qa:typescript  # TypeScript type check
npm run qa:format      # Prettier format check
npm run qa:tests       # Run tests with coverage

# Linting and formatting
npm run lint           # ESLint fix
npm run format         # Prettier fix
npm run type-check     # TypeScript check
```

### Security Scanning
```bash
# Run security scans
npm run security:scan    # Gitleaks detect
npm run security:osv     # OSV vulnerability scanner
npm run security:semgrep # Semgrep OWASP scanning
```

## Architecture Overview

### MCP Server Implementation
This is a Model Context Protocol (MCP) server built with TypeScript and Node.js. The server provides AI-assisted development tools through a schema-locked I/O pattern.

**Core Structure:**
- `src/server.ts` - Main MCP server implementation with tool registry
- `src/tools/` - MCP tool implementations (smart-begin, smart-plan, smart-write, smart-finish, smart-orchestrate, smart-converse)
- `src/core/` - Core utilities and shared logic
- `src/types/` - TypeScript type definitions

**Package Information:**
- **NPM Package Name**: `smart-mcp`
- **Project Directory**: `TappMCP`

**Key Patterns:**
- All tools use JSON Schema validation via Zod
- Comprehensive error handling with structured responses
- Test-Driven Development (TDD) approach
- TypeScript strict mode enabled - explicit typing required for all parameters
- Schema-locked I/O for all tool interactions

**Tools Overview:**
- `smart_converse` - Natural language interface that converts conversations to project setup
- `smart_begin` - Initialize projects with proper structure and quality gates
- `smart_plan` - Generate comprehensive project plans and roadmaps
- `smart_write` - Implement features with Advanced Context7 Cache and Unified Code Intelligence
- `smart_finish` - Complete projects with testing and documentation
- `smart_orchestrate` - Coordinate complex multi-tool workflows
- `smart_vibe` - Full VibeTapp natural language interface for Cursor integration

**Advanced Features:**
- **30-Day Persistent Cache**: 95% API cost reduction with intelligent caching and persistence
- **Advanced Context7 Cache**: Enterprise-grade caching with compression, analytics, and monitoring
- **Unified Code Intelligence**: Multi-category intelligence engines (Frontend, Backend, DevOps, Mobile)
- **Health Monitoring**: HTTP endpoints on port 3001 for Docker health checks
- **Production Ready**: Full containerization with comprehensive smoke testing

## Quality Standards

**Mandatory Requirements:**
- Test coverage ≥85% on all changed files
- ESLint complexity ≤10
- TypeScript strict mode enabled
- All tests must pass before commits
- Security scans must pass (no critical vulnerabilities)

**TypeScript Configuration:**
- Strict null checks enabled
- Exact optional property types
- No implicit any - ALL parameters must be explicitly typed
- No unused locals or parameters

**CRITICAL: TypeScript Callback Typing:**
```typescript
// ✅ CORRECT - explicit typing required
expect(results.some((item: { id: string }) => item.id === 'test')).toBe(true)

// ❌ WRONG - will fail in strict mode
expect(results.some(item => item.id === 'test')).toBe(true)
```

## Role-Based Development

The project implements 6 specialized AI roles. When working on this codebase:

1. **Default Role**: AI-Augmented Developer
   - Focus on code quality, testing, and security
   - Follow TDD approach
   - Ensure all quality gates pass

2. **Switching Roles**: The `.cursorrules` file enables role switching with commands like:
   - "you are now a developer"
   - "you are now a qa engineer"
   - "you are now an operations engineer"

## Critical Process Requirements

**Before starting any work:**
1. Run `npm run early-check` - MUST PASS
2. Explicitly confirm your role (e.g., "I am now in the AI-Augmented Developer role")
3. Ensure all dependencies are installed with `npm ci`
4. Check that pre-commit hooks are installed

**Before committing:**
1. Run `npm run qa:all` to verify ALL quality checks pass
2. Ensure test coverage ≥85% on changed files
3. Verify no security vulnerabilities (run security scans)
4. Check that complexity requirements are met (≤10)
5. Validate performance targets (<100ms response time)

### Testing Strategy

- **Unit Tests**: Vitest framework with coverage enforcement
- **Integration Tests**: Located in `src/integration/`
- **Coverage Thresholds**: 85% for branches, functions, lines, and statements
- **Test Timeout**: 10 seconds default, adjustable per test

### Environment Notes

- **Development**: Windows with Bash (WSL, Git Bash, or similar)
- **Runtime**: Linux (via Docker containers)
- **Node.js**: v18 or higher required
- **Health Check**: Server includes health endpoints on port 3001 for Docker
- **Ports**: 3000 (MCP), 3001 (Health), with proper container networking

### Cursor MCP Integration

**Configuration Options:**

1. **Direct Connection** (Development):
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

2. **Docker Container Connection** (Production):

   **For Docker Compose deployment:**
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

   **For manual Docker run:**
   ```json
   {
     "mcp.servers": {
       "tappmcp": {
         "command": "docker",
         "args": ["exec", "-i", "smart-mcp-prod", "node", "dist/server.js"],
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

   **⚠️ Always verify container name with `docker ps` before configuring Cursor!**
   **Need help?** See [Cursor MCP Troubleshooting Guide](docs/CURSOR_MCP_TROUBLESHOOTING.md)

3. **NPM Package Connection**:
```json
{
  "mcpServers": {
    "smart-mcp-npm": {
      "command": "npx",
      "args": ["smart-mcp"],
      "env": {
        "NODE_ENV": "production"
      },
      "stdio": true
    }
  }
}
```

### Cache Implementation Details

**30-Day Persistent Cache System:**
- **Context7Broker**: 30-day TTL (720 hours) for documentation data
- **Context7Cache**: 7-day TTL (168 hours) for business logic
- **Persistence**: File-based cache (`./cache/context7-cache.json`)
- **Auto-Save**: Every 10 cache writes automatically
- **Performance**: 95% API call reduction, 95% cost savings
- **Error Handling**: Graceful fallback if persistence fails

**Cache Usage Patterns:**
```typescript
// Cache is automatically managed by Context7Broker
const broker = new Context7Broker({
  cacheExpiryHours: 30 * 24, // 30 days
  enableCache: true,
});

// Cache methods available
const stats = broker.getCacheStats();
const healthy = broker.isCacheHealthy();
broker.clearCache(); // Manual cache clear if needed
```

### Data Structure and Performance Patterns

When writing code, always follow these patterns:

**Complete Data Structures:**
```typescript
// Always return complete objects with ALL required properties
const response = {
  overall: { score: 85, grade: 'B', status: 'pass' },
  quality: { score: 90, grade: 'A', status: 'pass' },
  production: { score: 88, grade: 'B', status: 'pass' }
};
```

**Error Handling:**
```typescript
try {
  const result = await operation();
  return { ...result, status: 'pass', hasErrors: false };
} catch (error) {
  return { status: 'fail', hasErrors: true, error: error.message };
}
```

**Performance Optimization:**
- Use `Promise.all()` for parallel operations
- Target <100ms response times
- Cache expensive calculations
- Avoid blocking synchronous calls

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
