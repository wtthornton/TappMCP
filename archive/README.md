# Vibe Coder Interface

> Natural language interface for TappMCP smart tools that makes complex development tasks accessible to vibe coders.

## 🎯 What is Vibe Coder?

Vibe Coder is a natural language interface that wraps TappMCP's powerful smart tools in an intuitive, user-friendly package. Instead of learning complex tool parameters and workflows, you can simply tell Vibe what you want in plain English.

## 🚀 Quick Start

### Installation

```bash
npm install @tappmcp/vibe-coder
```

### Basic Usage

```bash
# Create a project
vibe "make me a todo app"

# Check code quality
vibe check

# Fix issues
vibe fix

# Deploy to production
vibe ship
```

### Programmatic Usage

```typescript
import { VibeTapp } from '@tappmcp/vibe-coder';

const vibe = new VibeTapp();

// Create a project
const response = await vibe.vibe('make me a React website with TypeScript');
console.log(response.message);

// Check quality
const qualityResponse = await vibe.check('my code');
console.log(qualityResponse.details?.data?.qualityScorecard);
```

## 🎨 Core Commands

### Primary Commands

| Command | Description | Example |
|---------|-------------|---------|
| `vibe "request"` | Natural language interface | `vibe "make me a todo app"` |
| `vibe check` | Check code quality | `vibe check my code` |
| `vibe fix` | Auto-fix issues | `vibe fix TypeScript errors` |
| `vibe ship` | Deploy to production | `vibe ship my app` |
| `vibe explain` | Explain code | `vibe explain this function` |
| `vibe improve` | Suggest improvements | `vibe improve performance` |
| `vibe status` | Show project status | `vibe status` |

### Secondary Commands

| Command | Description | Example |
|---------|-------------|---------|
| `vibe help` | Show help | `vibe help create` |
| `vibe config` | Manage configuration | `vibe config --role developer` |
| `vibe history` | Show command history | `vibe history` |

## 🎯 Natural Language Patterns

### Project Creation
- "make me a [project type]"
- "create a [project type] with [tech stack]"
- "build a [project type] for [purpose]"

**Examples:**
```bash
vibe "make me a todo app"
vibe "create a React website with TypeScript"
vibe "build an API service for user management"
```

### Code Generation
- "write a [code type] for [purpose]"
- "generate a [code type] with [features]"
- "create a [code type] that [functionality]"

**Examples:**
```bash
vibe "write a login form"
vibe "create a user service"
vibe "generate tests for this function"
```

### Quality & Improvement
- "check [target] for [criteria]"
- "improve [target] [aspect]"
- "fix [issues] in [target]"

**Examples:**
```bash
vibe "check my code quality"
vibe "improve this function's performance"
vibe "fix security issues"
```

## ⚙️ Configuration

### Role-based Configuration

```typescript
// Set role for subsequent commands
vibe.setRole('developer');
vibe.setRole('designer');
vibe.setRole('qa-engineer');
vibe.setRole('operations-engineer');
vibe.setRole('product-strategist');
```

### Quality Levels

```typescript
// Set quality level
vibe.setQuality('basic');      // Basic quality checks
vibe.setQuality('standard');   // Standard quality checks
vibe.setQuality('enterprise'); // Enterprise quality checks
vibe.setQuality('production'); // Production-ready quality
```

### Verbosity Levels

```typescript
// Set verbosity
vibe.setVerbosity('minimal');  // Minimal output
vibe.setVerbosity('standard'); // Standard output
vibe.setVerbosity('detailed'); // Detailed output
```

### Modes

```typescript
// Set mode
vibe.setMode('basic');    // Simple interface
vibe.setMode('advanced'); // Advanced features
vibe.setMode('power');    // Full control
```

## 🎨 Response Format

Vibe Coder provides user-friendly responses with:

- **Visual indicators**: Emojis and status symbols
- **Progress tracking**: Real-time progress updates
- **Next steps**: Clear action items
- **Learning content**: Tips and best practices
- **Metrics**: Performance and quality data

### Example Response

```
🎉 Awesome! Your todo app project is ready!

📋 Project Details:
• Name: todo-app
• Type: React web application
• Tech Stack: React, TypeScript, Node.js
• Quality Level: Standard
• Role: Developer

✅ What I've Created:
• Project structure with folders and files
• Package.json with dependencies
• TypeScript configuration
• ESLint and Prettier setup
• Basic test framework
• README with instructions

🚀 Next Steps:
1. Navigate to your project: cd todo-app
2. Install dependencies: npm install
3. Start development: npm run dev
4. Open http://localhost:3000 in your browser

💡 Pro Tip: I've set up everything you need to start building your todo app right away!
```

## 🔧 Advanced Usage

### Custom Configuration

```typescript
import { VibeTapp, VibeConfig } from '@tappmcp/vibe-coder';

const config = new VibeConfig({
  defaultRole: 'developer',
  defaultQuality: 'enterprise',
  enableContext7: true,
  enableWebSearch: true,
  maxResponseTime: 30000
});

const vibe = new VibeTapp(config.getAll());
```

### Context Management

```typescript
// Get current context
const context = vibe.getContext();
console.log(context.projectId);
console.log(context.techStack);

// Clear context
vibe.clearContext();
```

### Error Handling

```typescript
try {
  const response = await vibe.vibe('make me a broken app');
  if (!response.success) {
    console.error('Error:', response.message);
    console.log('Suggestions:', response.nextSteps);
  }
} catch (error) {
  console.error('Unexpected error:', error);
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📚 API Reference

### VibeTapp Class

#### Methods

- `vibe(input: string, options?: VibeOptions): Promise<VibeResponse>`
- `check(target?: string): Promise<VibeResponse>`
- `fix(target?: string): Promise<VibeResponse>`
- `ship(target?: string): Promise<VibeResponse>`
- `explain(target?: string): Promise<VibeResponse>`
- `improve(target?: string): Promise<VibeResponse>`
- `status(): Promise<VibeResponse>`
- `help(topic?: string): Promise<VibeResponse>`
- `config(option?: string, value?: string): Promise<VibeResponse>`

#### Configuration Methods

- `setRole(role: VibeRole): void`
- `setQuality(quality: VibeQualityLevel): void`
- `setVerbosity(verbosity: VibeVerbosity): void`
- `setMode(mode: VibeMode): void`
- `getContext(): VibeContext`
- `clearContext(): void`

### Types

```typescript
interface VibeResponse {
  success: boolean;
  message: string;
  details?: VibeResponseDetails;
  nextSteps: string[];
  learning?: VibeLearningContent;
  metrics?: VibeResponseMetrics;
  timestamp: string;
}

interface VibeOptions {
  role?: VibeRole;
  quality?: VibeQualityLevel;
  verbosity?: VibeVerbosity;
  mode?: VibeMode;
  techStack?: string[];
  projectId?: string;
  showMetrics?: boolean;
  showLearning?: boolean;
  showTips?: boolean;
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📊 Monitoring & Observability

Vibe Coder includes a lightweight monitoring system perfect for local development:

### Monitoring Commands

```bash
# View current metrics and statistics
vibe metrics

# Show recent log entries
vibe logs [count]

# Clear all logs
vibe logs clear

# Check system health
vibe health

# Start web dashboard
vibe dashboard start

# Stop web dashboard
vibe dashboard stop

# Show dashboard URL
vibe dashboard url
```

### What's Monitored

- **Request Metrics**: Total requests, success rates, response times
- **Tool Usage**: Which tools are used most frequently
- **Performance**: Average response times, uptime, memory usage
- **Errors**: Error tracking and diagnostics
- **Health Status**: Service health and availability

### Log Files

- `logs/vibe-coder.log` - Main application logs
- `logs/vibe-errors.log` - Error logs only
- Automatic log rotation (10MB max, 5 files)

### Web Dashboard

Access the real-time dashboard at `http://localhost:3000` when running:
- Live metrics visualization
- Tool usage charts
- Recent activity timeline
- Performance graphs
- Auto-refresh every 5 seconds

### Programmatic Access

```typescript
import { VibeTapp } from '@tappmcp/vibe-coder';

const vibe = new VibeTapp();

// Get metrics
const metrics = vibe.getMetrics();
console.log(`Success rate: ${metrics.successRate * 100}%`);

// Get health status
const health = await vibe.getHealthStatus();
console.log(`Status: ${health.status}`);

// Get recent logs
const logs = await vibe.getRecentLogs(10);
console.log(logs);

// Start dashboard
await vibe.startDashboard(3000);
```

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Documentation**: [docs.tappmcp.com/vibe-coder](https://docs.tappmcp.com/vibe-coder)
- **Issues**: [GitHub Issues](https://github.com/tappmcp/vibe-coder/issues)
- **Discussions**: [GitHub Discussions](https://github.com/tappmcp/vibe-coder/discussions)

## 🎉 Acknowledgments

- Built on top of TappMCP smart tools
- Inspired by the need for accessible development tools
- Designed for vibe coders everywhere

---

**Made with ❤️ by the TappMCP team**
