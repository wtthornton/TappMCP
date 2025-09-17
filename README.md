# TappMCP - AI-Powered Development Assistant

**TappMCP** is an advanced AI-powered development assistant built on the Model Context Protocol (MCP) that provides intelligent code analysis, generation, and workflow orchestration through natural language commands. Built with VibeTapp intelligence system and Context7 integration.

## 🎯 Core Features

### **VibeTapp Intelligence System**
- **Natural Language Interface**: Interact with development tools using conversational commands
- **Automatic Verbosity Detection**: Intelligently detects response detail level from natural language
- **Smart Code Analysis**: Advanced code quality analysis with actionable insights
- **Workflow Orchestration**: Intelligent task planning and execution coordination
- **Context-Aware Responses**: Rich, formatted responses with visual indicators and metrics
- **Real-time Quality Monitoring**: Continuous code quality assessment and improvement suggestions
- **Developer-Focused**: Built specifically for developers, by developers

#### **Automatic Verbosity Detection**
TappMCP automatically detects the desired response detail level from your natural language input:

**Minimal Verbosity** (brief, quick, summary, overview, status, check, fast, simple, basic, just, only, minimal, concise, rapid, swift, hurry, asap, urgent, immediate)
```bash
smart_vibe "just show me the status"          # → Minimal response
smart_vibe "quick summary please"             # → Minimal response
smart_vibe "brief overview"                   # → Minimal response
```

**Detailed Verbosity** (detailed, comprehensive, thorough, complete, explain, describe, how, why, understand, learn, teach, deep, extensive, full, everything, all, entire, elaborate, in-depth, step-by-step, walkthrough, tutorial)
```bash
smart_vibe "explain how this works"           # → Detailed response
smart_vibe "describe the architecture"        # → Detailed response
smart_vibe "show me detailed analysis"        # → Detailed response
```

**Standard Verbosity** (create, make, build, generate, write, develop, implement, add, new, setup, configure, install, run, start)
```bash
smart_vibe "create a todo app"                # → Standard response
smart_vibe "build something"                  # → Standard response
smart_vibe "help me with this"                # → Standard response
```

**Intent-Based Detection**: When no explicit verbosity keywords are detected, the system uses intent-based defaults:
- **Status/Health checks** → Minimal verbosity
- **Quality analysis** → Detailed verbosity
- **Explanations** → Detailed verbosity
- **Project creation** → Standard verbosity

### **Context7 Integration**
- **API Intelligence**: Enhanced responses with real API calls and documentation
- **Best Practices**: Access to industry-standard coding patterns and practices
- **Dynamic Toggle**: Enable/disable Context7 integration from the dashboard
- **Optimized Caching**: Advanced caching with deduplication and circuit breaker protection

### **Smart Tools Suite**
- `smart_vibe` - Main natural language interface for development tasks
- `smart_begin` - Project initialization and setup
- `smart_plan` - Intelligent task planning and breakdown
- `smart_write` - Code generation with quality analysis
- `smart_finish` - Code completion and validation
- `smart_orchestrate` - Workflow coordination and management
- `smart_converse` - Interactive development conversations

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+
- Docker (for production deployment)
- Cursor IDE (for MCP integration)

### **Local Development**

```bash
# Clone the repository
git clone https://github.com/your-org/TappMCP.git
cd TappMCP

# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm start
```

### **Docker Deployment (Recommended)**

```bash
# Build and deploy with Docker
docker-compose up --build -d

# Access the enhanced dashboard
open http://localhost:3000/dashboard
```

## 🔧 Configuration

### **Environment Variables**

Create a `.env` file or set these environment variables:

```bash
# Context7 Integration (Optional)
CONTEXT7_API_KEY=your_context7_api_key_here
CONTEXT7_ENABLED=true
CONTEXT7_USE_HTTP_ONLY=true

# Server Configuration
NODE_ENV=production
PORT=3000
HEALTH_PORT=3001
```

### **Context7 Setup (Optional)**

1. Get your API key from [Context7](https://context7.com)
2. Add it to your environment variables
3. Use the dashboard toggle to enable/disable as needed

## 🎯 Automatic Verbosity Detection

TappMCP now automatically detects the appropriate verbosity level from your natural language commands, making interactions more intuitive and natural.

### **How It Works**

The system analyzes your commands for verbosity indicators and intent types to determine the most appropriate response detail level:

- **Minimal**: Quick, essential information only
- **Standard**: Balanced detail level (default)
- **Detailed**: Comprehensive explanations and context

### **Examples**

```typescript
// Automatic verbosity detection examples
smart_vibe("explain this code in detail")     // → Detailed verbosity
smart_vibe("quick status check")             // → Minimal verbosity
smart_vibe("create a todo app")              // → Standard verbosity
smart_vibe("what does this function do")     // → Detailed verbosity (intent-based)
smart_vibe("brief explanation of this")      // → Minimal verbosity (overrides intent)
```

### **Detection Methods**

1. **Keyword Detection**: Detects verbosity keywords in your commands
   - Minimal: "brief", "quick", "short", "summary", "status"
   - Detailed: "explain", "detailed", "comprehensive", "thorough"

2. **Intent-Based Rules**: Uses intent type to suggest verbosity
   - Explanation intents → Detailed
   - Status intents → Minimal
   - Quality intents → Detailed
   - Planning intents → Detailed

3. **Priority System**: Input keywords override intent-based defaults

### **Override Behavior**

You can still explicitly set verbosity if needed:

```typescript
smart_vibe("explain code", { verbosity: "minimal" })  // Override to minimal
smart_vibe("quick check", { verbosity: "detailed" })  // Override to detailed
```

## 📊 Dashboard Access

The TappMCP dashboard provides real-time monitoring and control:

- **Enhanced Dashboard**: `http://localhost:3000/dashboard`
- **Health Check**: `http://localhost:3000/health`
- **Performance Metrics**: `http://localhost:3000/api/metrics`
- **Context7 Toggle**: Available in the dashboard header
- **Real-time Metrics**: Live system performance and usage statistics

## 🎮 Usage

### **In Cursor IDE**

1. **Configure MCP Server** (see Cursor Setup below)
2. **Use Natural Language Commands**:
   ```
   smart_vibe "create a React component with TypeScript"
   smart_plan "break down this feature into tasks"
   smart_write "implement user authentication"
   ```

### **Via Dashboard**

1. **Access Dashboard**: Navigate to `http://localhost:3000/dashboard`
2. **Toggle Context7**: Use the toggle switch in the header
3. **Monitor Performance**: View real-time metrics and system health
4. **Manage Tools**: Test API connections and view tool status

## 🛠️ Cursor IDE Setup

### **Method 1: Quick Setup**

Copy the provided settings to Cursor:

```bash
# Windows
copy cursor-settings.json "%APPDATA%\Cursor\User\settings.json"

# Restart Cursor after copying
```

### **Method 2: Manual Configuration**

1. Open Cursor Settings (Ctrl+,)
2. Go to Extensions → MCP
3. Add this configuration:

```json
{
  "mcp.servers": {
    "tappmcp": {
      "command": "node",
      "args": ["dist/server.js"],
      "cwd": "C:\\cursor\\TappMCP",
      "env": {
        "NODE_ENV": "production",
        "CONTEXT7_ENABLED": "true"
      },
      "stdio": true,
      "description": "TappMCP - AI-powered development assistant"
    }
  },
  "mcp.enabled": true,
  "mcp.defaultServer": "tappmcp"
}
```

### **Verification**

After setup, test in a new Cursor agent:
```
smart_vibe "create a hello world React component"
```

## 🏗️ Architecture

### **Core Components**
- **MCP Server**: TypeScript-based server implementing Model Context Protocol
- **VibeTapp System**: Natural language processing and response generation
- **Context7 Broker**: API integration with caching and error handling
- **Dashboard**: Real-time monitoring and control interface
- **Tool Chain**: Modular development tools for various tasks

### **Project Structure**
```
├── src/                    # TypeScript source code
│   ├── tools/             # Smart tool implementations
│   ├── brokers/           # External API integrations
│   ├── core/              # Core business logic
│   └── mcp-docker-server.ts # Hybrid server implementation
├── dist/                  # Compiled JavaScript
├── dashboard-v2/          # Modern dashboard application
├── docs/                  # Essential documentation
├── archive/               # Historical reference material
└── docker-compose.yml     # Production deployment
```

## 📈 Performance & Monitoring

### **Health Endpoints**
- `GET /health` - Basic health status
- `GET /api/context7/toggle` - Context7 integration control
- `POST /api/context7/toggle` - Toggle Context7 on/off

### **Metrics**
- Real-time response times
- Context7 API usage and costs
- Cache hit rates and performance
- Error rates and system health

## 🔒 Security

- **Environment Variables**: Secure API key management
- **Circuit Breaker**: Protection against API abuse
- **Request Deduplication**: Prevents redundant API calls
- **Input Validation**: Comprehensive input sanitization
- **Error Handling**: Secure error responses without sensitive data

## 🧪 Development

### **Available Scripts**

```bash
# Development
npm run dev              # Start development server
npm run build            # Build TypeScript
npm run start            # Start production server

# Testing
npm test                 # Run test suite
npm run test:watch       # Watch mode testing
npm run test:coverage    # Coverage reports

# Code Quality
npm run lint             # ESLint checking
npm run format           # Prettier formatting
npm run type-check       # TypeScript validation

# Docker
npm run docker:build     # Build Docker image
npm run docker:dev       # Start with Docker Compose
```

### **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Ensure all quality checks pass
5. Submit a pull request

## 📚 Documentation

- **User Guide**: `docs/USER_GUIDE.md`
- **API Documentation**: `docs/API_DOCUMENTATION.md`
- **Deployment Guide**: `docs/DEPLOYMENT_GUIDE.md`
- **Troubleshooting**: `TROUBLESHOOTING.md`

## 🐛 Troubleshooting

### **Common Issues**

1. **Tools not showing in Cursor**
   - Verify MCP server is running
   - Check Cursor settings configuration
   - Restart Cursor completely

2. **Context7 API errors**
   - Verify API key is correct
   - Check network connectivity
   - Use dashboard toggle to disable if needed

3. **Dashboard not accessible**
   - Ensure Docker container is running
   - Check port 8080 is not blocked
   - Verify `docker-compose up` completed successfully

### **Debug Mode**

```bash
# Run with debug logging
NODE_ENV=development npm start

# Check container logs
docker logs tappmcp-smart-mcp-1

# Test health endpoint
curl http://localhost:8080/health
```

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **Model Context Protocol**: For the MCP specification
- **Context7**: For enhanced API intelligence
- **Cursor IDE**: For MCP integration support
- **Community**: For feedback and contributions

---

**Ready to supercharge your development workflow?** 🚀

Start with `smart_vibe "help me understand this codebase"` in Cursor!
