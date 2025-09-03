# TappMCP - Smart MCP Project

A Model Context Protocol (MCP) server implementation with AI-assisted development capabilities, featuring role-based AI assistant configuration for both Cursor AI and Claude Code.

## 🚀 Features

- **Role-Based AI Development**: Switch between 5 specialized roles using natural language commands
- **Dual AI Tool Support**: Works seamlessly with both Cursor AI and Claude Code
- **TypeScript/Node.js Foundation**: Modern MCP server implementation
- **Comprehensive Documentation**: Detailed role definitions and setup guides
- **Automated Setup**: Docker-based development environment with Linux runtime

## 🎭 Available Roles

### 1. AI-Augmented Developer (Default)
- Code generation, refactoring, and debugging
- Architecture decisions and system design
- Performance optimization and security
- Testing strategies and implementation

### 2. Product Strategist
- Product vision and roadmap definition
- User story creation and acceptance criteria
- Market research and competitive analysis
- Stakeholder communication

### 3. AI Operations Engineer
- CI/CD pipeline with AI integration
- Security and compliance oversight
- Performance monitoring and optimization
- Production support and incident response

### 4. UX/Product Designer
- User experience design and research
- Design system creation and maintenance
- Accessibility and usability optimization
- AI-assisted prototyping and testing

### 5. AI Quality Assurance Engineer
- AI-generated code quality validation
- Automated testing strategy and implementation
- Performance and security testing
- Test automation and continuous quality monitoring

## 🎯 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/wtthornton/TappMCP.git
cd TappMCP
```

### 2. Setup AI Role Configuration
The AI role configuration is automatically available when you open the project in Cursor AI or start Claude Code with the system prompt.

### 3. Start Development

#### Docker (Recommended - Linux Runtime)
```bash
# Build and start development container
npm run docker:dev

# Or build production container
npm run docker:build
```

#### Local Development (Windows with Bash)
```bash
# Start development server locally
npm run dev

# Build the project
npm run build

# Run tests
npm run test
```

#### AI Tool Integration
Open the project in Cursor AI or start Claude Code with the system prompt:
```bash
claude --system-prompt docs/configuration/claude-system-prompt.md
```

## 🔄 Role Switching Commands

Use these natural language commands to switch between roles:

- **"you are now a developer"** → AI-Augmented Developer
- **"you are now a product strategist"** → Product Strategist
- **"you are now an operations engineer"** → AI Operations Engineer
- **"you are now a designer"** → UX/Product Designer
- **"you are now a qa engineer"** → AI Quality Assurance Engineer

Alternative commands: `switch to [role]`, `[role] mode`, `coding mode`, `strategy mode`, `devops mode`, `ux mode`, `testing mode`

## 📁 Project Structure

```
TappMCP/
├── .cursorrules                    # Cursor AI configuration
├── claude-config.json              # Claude Code configuration
├── docs/configuration/             # Configuration files
│   └── claude-system-prompt.md     # Claude Code system prompt
├── docs/roles/                     # Role definitions
│   ├── ai-augmented-developer.md
│   ├── product-strategist.md
│   ├── ai-operations-engineer.md
│   ├── ux-product-designer.md
│   └── ai-quality-assurance-engineer.md
├── docs/setup/                     # Setup documentation
├── docs/project/                   # Project documentation
├── src/                           # Source code
│   ├── server.ts                  # MCP server implementation
│   └── tools/                     # MCP tools
├── Dockerfile                     # Linux runtime container
├── docker-compose.yml             # Development and production containers
└── project-guidelines.md          # Project standards and guidelines
```

## 🛠️ Development

### Prerequisites
- **Development Environment**: Windows (with bash available via WSL, Git Bash, or similar)
- **Runtime Environment**: Linux (Docker container)
- Node.js (v18 or higher)
- Docker
- TypeScript
- Cursor AI or Claude Code

### Installation
```bash
npm install
```

### Building
```bash
# Local build
npm run build

# Docker build
npm run docker:build
```

### Running
```bash
# Local development
npm run dev

# Docker development
npm run docker:dev

# Production
npm start
```

## 📚 Documentation

- **[AI Role Setup Guide](docs/setup/ai-role-setup.md)** - Comprehensive setup and usage instructions
- **[Role Definitions](docs/roles/)** - Detailed role documentation
- **[Project Vision](docs/project/vision.md)** - Project vision and goals
- **[Tech Stack](docs/project/tech-stack.md)** - Technology choices and rationale

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with both Cursor AI and Claude Code
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with the Model Context Protocol (MCP) specification
- Designed for AI-assisted development workflows
- Optimized for both Cursor AI and Claude Code integration

## 📞 Support

For questions or issues:
1. Check the [AI Role Setup Guide](docs/setup/ai-role-setup.md)
2. Review the [troubleshooting section](docs/setup/ai-role-setup.md#-troubleshooting)
3. Open an issue on GitHub

---

**Ready to start AI-assisted development?** Run the setup script and say "you are now a developer" to begin!
