# TappMCP - AI-Powered Development Assistant

AI-powered MCP server with real analysis capabilities, Context7 intelligence, and comprehensive workflow orchestration.

## ✨ Real Context7 Integration

TappMCP now features **real Context7 integration** with:
- ✅ **Real API calls** to Context7 for up-to-date documentation
- ✅ **MCP client** with HTTP fallback for robust connectivity
- ✅ **Live code examples** and best practices from Context7
- ✅ **Intelligent fallback** when Context7 is unavailable
- ✅ **30-day persistent cache** for 95% API cost reduction
- ✅ **Smart caching** with automatic persistence across restarts

## 🚀 Quick Start

### Context7 Setup (Optional)
Context7 integration works automatically with fallback. For full functionality:
```bash
# Ensure Node.js and NPX are available
node --version
npx --version

# Context7 will auto-connect when available
# Fallback data provided when Context7 unavailable
```

### Development
```bash
# Install dependencies
npm ci

# Run quality checks (required before any work)
npm run early-check

# Run tests
npm test

# Start development
npm run dev

# Build for production
npm run build && npm start
```

### Docker Production Deployment
```bash
# Build and deploy production container
docker build -t smart-mcp:latest .
docker run -d --name smart-mcp-prod -p 8080:3000 -p 8081:3001 smart-mcp:latest

# Or use Docker Compose (recommended)
docker-compose up -d smart-mcp

# Health verification
curl http://localhost:8081/health
curl http://localhost:8081/ready

# Verify production deployment
docker ps
docker logs smart-mcp-prod
```

**⚠️ Important Container Naming:**
- **Docker Compose**: Creates container named `tappmcp-smart-mcp-1` (project prefix + service name)
- **Manual Docker run**: Creates container named `smart-mcp-prod` (as specified with --name)
- **Always check actual container name**: `docker ps` to see the real container name

### Cursor MCP Integration

**Option 1: Local Development**
```json
{
  "mcpServers": {
    "smart-mcp": {
      "command": "node",
      "args": ["dist/server.js"],
      "cwd": "/path/to/TappMCP",
      "env": {
        "NODE_ENV": "production",
        "HEALTH_PORT": "3001"
      }
    }
  }
}
```

**Option 2: NPM Package**
```json
{
  "mcpServers": {
    "smart-mcp": {
      "command": "npx",
      "args": ["smart-mcp"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

**Option 3: Docker Container**

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

### Quick Container Name Reference
| Deployment Method | Container Name | Use in Cursor Config |
|------------------|----------------|---------------------|
| `docker-compose up` | `tappmcp-smart-mcp-1` | `tappmcp-smart-mcp-1` |
| `docker run --name smart-mcp-prod` | `smart-mcp-prod` | `smart-mcp-prod` |

**Need help?** See [Cursor MCP Troubleshooting Guide](docs/CURSOR_MCP_TROUBLESHOOTING.md)

## 🎵 Vibe Coder Experience

### In Cursor (MCP Integration)
```typescript
// Natural language commands in Cursor
smart_vibe "make me a todo app with React and TypeScript"
smart_vibe "check my code quality" { role: "qa-engineer" }
smart_vibe "improve this function" { quality: "enterprise" }
smart_vibe "ship my app" { role: "operations-engineer" }
```

### CLI (Terminal)
```bash
# Install vibe CLI globally
npm install -g @tappmcp/vibe-coder

# Use vibe commands in terminal
vibe "make me a todo app"
vibe check
vibe ship
```

## 📦 NPM Package

```bash
npm install smart-mcp
```

## 🛠️ Core Tools

### smart_begin
Initialize projects with real vulnerability detection, complexity analysis, and project scanning.

### smart_write
Generate code with Context7 intelligence, Advanced Context7 Cache, and real-time validation.

### smart_finish
Complete projects with genuine quality gates and test coverage analysis.

### smart_orchestrate
Full SDLC automation with 4-phase workflow (Analysis → Context7 → Generation → Validation).

### smart_plan
Generate technical implementation plans with Context7 insights.

### smart_vibe 🎵
Natural language interface for Cursor - full vibe coder experience with context management, role switching, and rich responses.

## 🎯 Key Features

- **30-Day Persistent Cache**: 95% API cost reduction with intelligent caching
- **Advanced Context7 Cache**: Enterprise-grade caching with compression, analytics, and monitoring
- **Unified Code Intelligence**: Multi-category intelligence engines (Frontend, Backend, DevOps, Mobile)
- **Real Analysis**: SecurityScanner, StaticAnalyzer, ProjectScanner integration
- **Context7 Intelligence**: Project-aware dynamic insights with quality metrics
- **Schema-locked I/O**: All tools use JSON Schema validation
- **Quality Gates**: ≥85% test coverage, complexity ≤10
- **Security First**: Real vulnerability detection and prevention
- **Performance**: <100ms response time, <2s analysis
- **Docker Ready**: Production containerization with health checks

## 📊 Quality Standards

- Test coverage ≥85% on changed files
- ESLint complexity ≤10
- TypeScript strict mode
- Zero critical vulnerabilities
- All tests must pass before commits

## 🔧 Development Commands

```bash
# Quality checks
npm run qa:all          # Run all quality checks
npm run qa:eslint       # ESLint check
npm run qa:typescript   # TypeScript check
npm run qa:tests        # Tests with coverage

# Security scanning
npm run security:scan   # Gitleaks detect
npm run security:osv    # OSV vulnerability scanner
npm run security:semgrep # OWASP scanning

# Formatting
npm run lint            # ESLint fix
npm run format          # Prettier fix
npm run type-check      # TypeScript check
```

## 📚 Documentation

- `CLAUDE.md` - AI assistant guidance and standards
- `.cursorrules` - Role configuration and switching
- `docs/API.md` - Complete API reference with all tools
- `docs/DEVELOPMENT.md` - Development guide
- `docs/DEPLOYMENT.md` - Deployment instructions
- `docs/CURSOR_MCP_TROUBLESHOOTING.md` - **Cursor MCP connection troubleshooting**
- `PRODUCTION_DEPLOYMENT.md` - Production deployment guide with Docker
- `cursor-mcp-config.json` - Cursor MCP configuration examples
- `archived-tasks/` - Completed implementation task archives

## 🏗️ Architecture

```
src/
├── server.ts           # MCP server implementation
├── tools/              # Tool implementations (smart_*)
├── core/               # Core utilities and analyzers
├── brokers/            # Context and memory brokers
├── workflows/          # SDLC workflow orchestration
└── types/              # TypeScript definitions
```

## 📄 License

MIT

## 🤝 Contributing

1. Run `npm run early-check` before any work
2. Follow TDD approach - write tests first
3. Ensure all quality gates pass
4. Use TypeScript strict mode with explicit typing
5. Maintain ≥85% test coverage on changes

For detailed implementation guidance, see `CLAUDE.md`.
