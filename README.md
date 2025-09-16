# TappMCP - AI Assistant Enhancement Platform

AI-powered MCP server designed to **enhance AI assistants** with real analysis capabilities, Context7 intelligence, comprehensive workflow orchestration, and **real-time monitoring dashboard**.

## ✨ VibeTapp Intelligence System

TappMCP features **VibeTapp intelligence integration** designed to make AI assistants smarter:
- ✅ **Natural Language Interface** - Enhanced smart_vibe tool with rich responses
- ✅ **Context7 Intelligence Integration** - Real API calls for up-to-date documentation
- ✅ **Visual Progress Indicators** - Rich formatting with progress bars and metrics
- ✅ **Tool Chain Orchestration** - Intelligent coordination of multiple tools
- ✅ **Quality Analysis** - Confidence scores and quality recommendations
- ✅ **Intelligent Fallback** - Works with or without Context7 integration
- ✅ **30-day Persistent Cache** - 95% API cost reduction with smart caching

**Purpose**: The VibeTapp system enhances AI assistants (like Claude, Cursor AI) to provide better code suggestions, workflow orchestration, and intelligent responses.

## 🚀 Quick Start

### 🌐 Production Dashboard
Access the live monitoring dashboard at: **http://localhost:8080**

**Main Dashboard Features:**
- 📊 **Real-time Performance Metrics** - Memory, CPU, response times
- 🔄 **Active Workflow Monitoring** - Live workflow status with progress bars
- 🔔 **Notification Center** - Real-time alerts and system notifications
- ⚡ **WebSocket Integration** - Live data updates without page refresh
- 📱 **Responsive Design** - Works on desktop and mobile
- 🔗 **Context7 Integration** - Real-time Context7 API metrics and monitoring

**🎯 D3.js Visualizations Dashboard:**
Access advanced visualizations at: **http://localhost:8080/d3-enhanced-modular.html**

- 🕸️ **Interactive Workflow Graph** - Force-directed graph with zoom, pan, drag-and-drop
- 📈 **Performance Monitoring Charts** - Multi-metric CPU, memory, response time charts
- 💰 **Value Dashboard** - Token tracking, cost savings, quality metrics
- ⏰ **Timeline View** - Gantt-style workflow event timeline
- 🔍 **Interactive Filtering** - Time range, status, phase, and layout filters
- 📤 **Export Functionality** - CSV export for all visualizations
- 🎨 **Real-time Updates** - Live data streaming via WebSocket

### Context7 Setup (Optional)
Context7 integration works automatically with fallback. For full functionality:
```bash
# Ensure Node.js and NPX are available
node --version
npx --version

# Context7 will auto-connect when available
# Fallback data provided when Context7 unavailable
```

### Production Deployment (Docker)
```bash
# Deploy with VibeTapp integration and real-time dashboard
docker-compose up --build -d

# Access dashboard
open http://localhost:8080

# Health verification
curl http://localhost:8080/health
curl http://localhost:8080/tools

# Verify production deployment
docker ps
docker logs tappmcp-smart-mcp-1
```

**✅ Current Configuration:**
- **Container Name**: `tappmcp-smart-mcp-1`
- **Server**: TypeScript compiled server (`dist/server.js`) with full VibeTapp integration
- **Ports**: 8080 (HTTP), 8081 (Health)
- **Features**: All 7 MCP tools with enhanced smart_vibe functionality

## 🎯 VibeTapp Intelligence System

TappMCP features the **VibeTapp intelligence system** that provides enhanced responses with visual indicators and rich formatting.

### VibeTapp Response Format
When smart_vibe is active, responses include:
```
🎯 Vibe Coder → TappMCP
────────────────────────────────────────
┌─────────────────────────────────────┐
│ ✅ Perfect! I've created your solution. │
└─────────────────────────────────────┘

🔧 Tool Chain:
   ✍️
   Tools used:
    ✅ ✍️ smart_write (645ms)
   Progress: [████████████████████] 100% (1/1)

📊 Metrics:
   ⚡ Processing time: 645ms
   🎯 Confidence: 85%
   ⭐ Quality score: 8/10
   🔧 Tools used: smart_write

✅ Status: Complete
```

### Smart Vibe Commands
- `smart_vibe "status"` - Show full status dashboard
- `smart_vibe "your request"` - Use enhanced VibeTapp mode
- All MCP tools now include VibeTapp intelligence and visual indicators

### Visual Indicators
- 🎯 **Smart Vibe** - Enhanced natural language interface with quality analysis
- 🔍 **Smart Begin** - Project initialization with comprehensive setup
- ✍️ **Smart Write** - Code generation with best practices
- 📋 **Smart Plan** - Technical planning with architecture insights
- 🎭 **Smart Orchestrate** - Full SDLC automation with workflow management
- ✅ **Smart Finish** - Project completion with quality validation
- 💬 **Smart Converse** - Advanced conversation with context awareness

### Auto Smart Vibe Mode
Configure `.cursorrules` to always use smart_vibe:
```bash
# TappMCP Project Rules - Always Use Smart Vibe
- ALWAYS_USE_SMART_VIBE: true
- DEFAULT_RESPONSE_MODE: enhanced
- PREFERRED_TOOL: smart_vibe
```

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

### 🚀 Core Platform
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

### 🌐 Real-Time Monitoring (NEW!)
- **Live Dashboard**: Beautiful, responsive web interface at http://localhost:8080
- **Performance Metrics**: Real-time memory, CPU, response time monitoring
- **Workflow Tracking**: Live workflow status with progress bars and phase information
- **System Health**: Uptime, version, active connections, error rates
- **WebSocket Integration**: Real-time data streaming without page refresh
- **Notification Center**: Live alerts and system notifications
- **Auto-Reconnection**: Handles connection drops gracefully
- **Mobile Responsive**: Works perfectly on desktop and mobile devices

### 🎨 Visual Status System
- **Contextual Status Icons**: Comprehensive icon library for all status types
- **Color-Coded Indicators**: Success (Green), Warning (Yellow), Error (Red), Info (Blue)
- **Workflow Status Icons**: Pending, Running, Completed, Failed, Cancelled, Paused, Queued
- **Performance Status Icons**: Excellent, Good, Warning, Critical, Unknown
- **Notification Priority Icons**: Critical, High, Medium, Low, Info
- **System Status Icons**: Server, Database, Network, Loading
- **Animation Support**: Pulse, spin, bounce animations for dynamic states

### 🔔 Smart Notifications (NEW!)
- **Multi-Channel Delivery**: WebSocket, Email, Push, In-App notifications
- **Priority Levels**: Critical, High, Medium, Low, Info with proper weighting
- **Template System**: Reusable notification templates with variable substitution
- **User Preferences**: Configurable notification preferences and quiet hours
- **Analytics Support**: Delivery rates, read rates, engagement tracking
- **Intelligent Filtering**: ML-powered notification filtering and prioritization

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
