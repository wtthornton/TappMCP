# Vibe Coder User Guide

> The complete guide to using Vibe Coder - the natural language interface for TappMCP smart tools.

## 🎯 What is Vibe Coder?

Vibe Coder is a revolutionary natural language interface that makes TappMCP's powerful smart tools accessible to everyone. Instead of learning complex command-line parameters and technical workflows, you can simply tell Vibe what you want in plain English.

### Why Vibe Coder?

- **Natural Language**: Speak to your tools like you would to a colleague
- **Zero Learning Curve**: No need to memorize commands or parameters
- **Smart Defaults**: Intelligent assumptions based on context
- **Visual Feedback**: Clear progress indicators and status updates
- **Learning Integration**: Tips and best practices built-in

## 🚀 Getting Started

### Installation

```bash
# Install Vibe Coder
npm install -g @tappmcp/vibe-coder

# Verify installation
vibe --version
```

### Your First Command

```bash
# Create your first project
vibe "make me a todo app"

# Check what you've created
vibe check

# Deploy it
vibe ship
```

That's it! Vibe handles all the complexity behind the scenes.

## 🎨 Core Commands

### Primary Commands

#### `vibe "request"`
The main command for natural language requests.

```bash
# Project creation
vibe "make me a todo app"
vibe "create a React website with TypeScript"
vibe "build an API service for user management"

# Code generation
vibe "write a login form"
vibe "create a user service"
vibe "generate tests for this function"

# Quality checking
vibe "check my code quality"
vibe "validate the security"
vibe "test the functionality"

# Planning
vibe "plan my project"
vibe "create a roadmap"
vibe "schedule the development"

# Explanation
vibe "explain this code"
vibe "what does this function do"
vibe "show me the project status"

# Improvement
vibe "improve this code"
vibe "enhance the performance"
vibe "make it more secure"

# Deployment
vibe "deploy my app"
vibe "ship to production"
vibe "launch the website"
```

#### `vibe check`
Check code quality and validation.

```bash
vibe check                    # Check current project
vibe check my code           # Check specific code
vibe check for security      # Check security issues
vibe check performance       # Check performance
```

#### `vibe fix`
Automatically fix common issues.

```bash
vibe fix                     # Fix all issues
vibe fix TypeScript errors   # Fix specific errors
vibe fix security issues     # Fix security problems
vibe fix performance         # Fix performance issues
```

#### `vibe ship`
Deploy to production.

```bash
vibe ship                    # Deploy current project
vibe ship my app            # Deploy specific app
vibe ship to production     # Deploy to production
vibe ship with monitoring   # Deploy with monitoring
```

#### `vibe explain`
Explain what code does.

```bash
vibe explain                # Explain current code
vibe explain this function  # Explain specific function
vibe explain the project    # Explain entire project
vibe explain in simple terms # Simple explanation
```

#### `vibe improve`
Suggest improvements.

```bash
vibe improve                # Improve current code
vibe improve performance    # Improve performance
vibe improve this code      # Improve specific code
vibe improve user experience # Improve UX
```

#### `vibe status`
Show project status and metrics.

```bash
vibe status                 # Show current status
vibe status --detailed      # Detailed status
vibe status --business      # Business metrics
vibe status --technical     # Technical metrics
```

### Secondary Commands

#### `vibe help`
Get help and guidance.

```bash
vibe help                   # General help
vibe help create           # Help with creation
vibe help check            # Help with checking
vibe help ship             # Help with deployment
vibe help commands         # List all commands
```

#### `vibe config`
Manage configuration.

```bash
vibe config                 # Show current config
vibe config --role developer # Set role
vibe config --quality enterprise # Set quality
vibe config --show         # Show all settings
```

#### `vibe history`
Show command history.

```bash
vibe history                # Show recent commands
vibe history --last 10     # Show last 10 commands
vibe history --project     # Show project history
vibe history --export      # Export history
```

## 🎯 Natural Language Patterns

### Project Creation Patterns

**Basic Patterns:**
- "make me a [project type]"
- "create a [project type] with [tech stack]"
- "build a [project type] for [purpose]"
- "start a new [project type]"

**Examples:**
```bash
vibe "make me a todo app"
vibe "create a React website with TypeScript"
vibe "build an API service for user management"
vibe "start a new mobile app"
```

### Code Generation Patterns

**Basic Patterns:**
- "write a [code type] for [purpose]"
- "generate a [code type] with [features]"
- "create a [code type] that [functionality]"
- "code a [code type] for [target]"

**Examples:**
```bash
vibe "write a login form"
vibe "create a user service with authentication"
vibe "generate tests for this function"
vibe "code a database model for users"
```

### Quality Patterns

**Basic Patterns:**
- "check [target] for [criteria]"
- "validate [target] [aspect]"
- "test [target] [type]"
- "find [issues] in [target]"

**Examples:**
```bash
vibe "check my code quality"
vibe "validate the security of this app"
vibe "test the functionality of this feature"
vibe "find bugs in my code"
```

### Planning Patterns

**Basic Patterns:**
- "plan [project] [aspect]"
- "create a roadmap for [project]"
- "schedule [project] [timeline]"
- "timeline for [project]"

**Examples:**
```bash
vibe "plan my project development"
vibe "create a roadmap for this app"
vibe "schedule the development phases"
vibe "timeline for the project"
```

## ⚙️ Configuration

### Role-based Configuration

Vibe Coder adapts to different roles with specialized configurations:

#### Developer Role
```bash
vibe config --role developer
```
- Focus on code quality and best practices
- Detailed technical output
- Comprehensive testing recommendations

#### Designer Role
```bash
vibe config --role designer
```
- Emphasis on user experience
- Visual design considerations
- Accessibility guidelines

#### QA Engineer Role
```bash
vibe config --role qa-engineer
```
- Comprehensive testing strategies
- Quality assurance focus
- Bug prevention techniques

#### Operations Engineer Role
```bash
vibe config --role operations-engineer
```
- Production deployment focus
- Monitoring and reliability
- Security and performance

#### Product Strategist Role
```bash
vibe config --role product-strategist
```
- Business value emphasis
- Market considerations
- Strategic planning

### Quality Levels

#### Basic Quality
```bash
vibe config --quality basic
```
- Essential quality checks
- Minimal configuration
- Fast execution

#### Standard Quality
```bash
vibe config --quality standard
```
- Balanced quality and performance
- Recommended for most projects
- Good test coverage

#### Enterprise Quality
```bash
vibe config --quality enterprise
```
- High-quality standards
- Comprehensive validation
- Production-ready code

#### Production Quality
```bash
vibe config --quality production
```
- Highest quality standards
- Full validation suite
- Zero-tolerance for issues

### Verbosity Levels

#### Minimal Output
```bash
vibe config --verbosity minimal
```
- Essential information only
- Quick responses
- Clean interface

#### Standard Output
```bash
vibe config --verbosity standard
```
- Balanced information
- Good for most users
- Includes tips and suggestions

#### Detailed Output
```bash
vibe config --verbosity detailed
```
- Comprehensive information
- Technical details
- Learning content

### Modes

#### Basic Mode
```bash
vibe config --mode basic
```
- Simple interface
- Automatic tool selection
- Smart defaults

#### Advanced Mode
```bash
vibe config --mode advanced
```
- More control options
- Custom configurations
- Detailed output

#### Power Mode
```bash
vibe config --mode power
```
- Full control
- Direct tool access
- Expert features

## 🎨 Response Format

Vibe Coder provides rich, user-friendly responses:

### Success Response Example
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

### Error Response Example
```
❌ Oops! I couldn't create your project.

🔍 What went wrong:
• Invalid project name format
• Missing required parameters

💡 How to fix it:
• Use a simple name like "todo-app" or "my-website"
• Try: "make me a todo app" or "create a React project"

🆘 Need help? Try: vibe help create
```

### Warning Response Example
```
⚠️ I created your component, but there are some things to consider:

✅ What I Built:
• Basic login form component
• Simple validation logic
• Basic styling

⚠️ Areas for Improvement:
• Add password strength validation
• Implement OAuth integration
• Add loading states
• Enhance error messages

🔧 Quick Fixes:
• Run "vibe improve" to enhance the component
• Add more validation rules
• Integrate with your auth system

🚀 Next Steps:
1. Review the generated code
2. Add your specific requirements
3. Test thoroughly before deploying
```

## 🔧 Advanced Usage

### Custom Configuration

Create a custom configuration file:

```json
{
  "defaultRole": "developer",
  "defaultQuality": "enterprise",
  "defaultVerbosity": "detailed",
  "defaultMode": "advanced",
  "enableContext7": true,
  "enableWebSearch": true,
  "enableMemory": true,
  "maxResponseTime": 30000,
  "enableProgressIndicators": true,
  "enableLearningContent": true,
  "enableTips": true,
  "enableMetrics": true
}
```

### Context Management

Vibe remembers context across commands:

```bash
# Set project context
vibe "create a todo app"  # Creates project
vibe "add user authentication"  # Uses project context
vibe "check quality"  # Checks the project
vibe "deploy"  # Deploys the project
```

### Command Chaining

Chain commands for complex workflows:

```bash
# Create and deploy in one go
vibe "create a todo app" && vibe "add authentication" && vibe "check quality" && vibe "deploy"
```

### Programmatic Usage

Use Vibe Coder in your own applications:

```typescript
import { VibeTapp } from '@tappmcp/vibe-coder';

const vibe = new VibeTapp();

// Create a project
const response = await vibe.vibe('make me a todo app');
console.log(response.message);

// Check quality
const qualityResponse = await vibe.check('my code');
console.log(qualityResponse.details?.data?.qualityScorecard);

// Set configuration
vibe.setRole('developer');
vibe.setQuality('enterprise');
vibe.setVerbosity('detailed');
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test VibeCoder.test.ts
```

### Test Structure

Tests are organized by component:

- `VibeCoder.test.ts` - Main VibeTapp tests
- `VibeCLI.test.ts` - CLI interface tests
- `IntentParser.test.ts` - Intent parsing tests
- `VibeFormatter.test.ts` - Response formatting tests
- `VibeConfig.test.ts` - Configuration tests

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest';
import { VibeTapp } from './core/VibeTapp.js';

describe('VibeTapp', () => {
  it('should create a project', async () => {
    const vibe = new VibeTapp();
    const response = await vibe.vibe('make me a todo app');

    expect(response.success).toBe(true);
    expect(response.message).toContain('Awesome');
  });
});
```

## 🐛 Troubleshooting

### Common Issues

#### "Command not found"
```bash
# Install globally
npm install -g @tappmcp/vibe-coder

# Or use npx
npx @tappmcp/vibe-coder "make me a todo app"
```

#### "Permission denied"
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm

# Or use npx
npx @tappmcp/vibe-coder "make me a todo app"
```

#### "Tool not available"
```bash
# Check if TappMCP is installed
npm list @tappmcp/core

# Install TappMCP
npm install @tappmcp/core @tappmcp/tools
```

#### "Low confidence intent"
```bash
# Be more specific
vibe "make me a React todo app with TypeScript"

# Use help for guidance
vibe help create
```

### Debug Mode

Enable debug mode for detailed logging:

```bash
# Set debug environment variable
export DEBUG=vibe:*

# Run with debug output
vibe "make me a todo app"
```

### Log Files

Check log files for detailed error information:

```bash
# View recent logs
tail -f ~/.vibe-coder/logs/vibe.log

# View error logs
tail -f ~/.vibe-coder/logs/error.log
```

## 📚 Learning Resources

### Documentation

- **API Reference**: [docs.tappmcp.com/vibe-coder/api](https://docs.tappmcp.com/vibe-coder/api)
- **Command Reference**: [docs.tappmcp.com/vibe-coder/commands](https://docs.tappmcp.com/vibe-coder/commands)
- **Configuration Guide**: [docs.tappmcp.com/vibe-coder/config](https://docs.tappmcp.com/vibe-coder/config)

### Examples

- **Project Examples**: [github.com/tappmcp/vibe-coder/examples](https://github.com/tappmcp/vibe-coder/examples)
- **Code Examples**: [github.com/tappmcp/vibe-coder/examples/code](https://github.com/tappmcp/vibe-coder/examples/code)
- **Workflow Examples**: [github.com/tappmcp/vibe-coder/examples/workflows](https://github.com/tappmcp/vibe-coder/examples/workflows)

### Community

- **GitHub Discussions**: [github.com/tappmcp/vibe-coder/discussions](https://github.com/tappmcp/vibe-coder/discussions)
- **Discord Server**: [discord.gg/tappmcp](https://discord.gg/tappmcp)
- **Stack Overflow**: Tag questions with `vibe-coder`

## 🤝 Contributing

### Getting Started

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Development Setup

```bash
# Clone the repository
git clone https://github.com/tappmcp/vibe-coder.git
cd vibe-coder

# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build

# Run in development mode
npm run dev
```

### Code Style

- Use TypeScript strict mode
- Follow ESLint rules
- Write comprehensive tests
- Document public APIs
- Use conventional commits

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.tappmcp.com/vibe-coder](https://docs.tappmcp.com/vibe-coder)
- **Issues**: [GitHub Issues](https://github.com/tappmcp/vibe-coder/issues)
- **Discussions**: [GitHub Discussions](https://github.com/tappmcp/vibe-coder/discussions)
- **Email**: support@tappmcp.com

## 🎉 Acknowledgments

- Built on top of TappMCP smart tools
- Inspired by the need for accessible development tools
- Designed for vibe coders everywhere

---

**Made with ❤️ by the TappMCP team**

*Last updated: 2024-12-19*
