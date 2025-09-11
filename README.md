# TappMCP - AI-Powered Development Assistant

AI-powered MCP server with real analysis capabilities, Context7 intelligence, and comprehensive workflow orchestration.

## 🚀 Quick Start

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
docker run -d --name smart-mcp -p 3000:3000 -p 3001:3001 -v smart-mcp-data:/app/data smart-mcp:latest

# Health check
curl http://localhost:3001/health

# Run smoke test to verify deployment
NODE_ENV=test npx vitest run src/deployment/smoke-test.test.ts
```

### Cursor MCP Integration
Add to your Cursor MCP configuration:
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

Or connect to deployed container:
```json
{
  "mcpServers": {
    "smart-mcp": {
      "command": "node",
      "args": ["-e", "require('child_process').spawn('docker', ['exec', '-i', 'smart-mcp', 'node', 'dist/server.js'], {stdio: 'inherit'})"]
    }
  }
}
```

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
- `docs/API.md` - API reference
- `docs/DEVELOPMENT.md` - Development guide
- `docs/DEPLOYMENT.md` - Deployment instructions

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
