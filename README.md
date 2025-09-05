# TappMCP - Smart MCP Project

A Model Context Protocol (MCP) server implementation with AI-assisted development capabilities, featuring role-based AI assistant configuration for both Cursor AI and Claude Code.

## 🚀 Features

- **Role-Based AI Development**: Switch between 6 specialized roles using natural language commands
- **Dual AI Tool Support**: Works seamlessly with both Cursor AI and Claude Code
- **TypeScript/Node.js Foundation**: Modern MCP server implementation with strict type safety
- **Comprehensive Documentation**: Detailed role definitions and setup guides
- **Automated Setup**: Docker-based development environment with Linux runtime
- **Quality-First Development**: Built-in quality gates, security scanning, and test coverage
- **Schema-Locked I/O**: All tool calls use JSON Schemas for reliability
- **Performance Optimized**: <100ms response times with comprehensive monitoring

## 🎭 Available Roles

### 1. AI-Augmented Developer (Default)
- **Primary Focus**: Code generation, refactoring, and debugging
- **Key Responsibilities**: Architecture decisions, system design, performance optimization
- **Quality Standards**: TypeScript strict mode, ≥85% test coverage, <100ms response times
- **AI Integration**: Cursor AI and Claude Code with role-specific prompts

### 2. Product Strategist
- **Primary Focus**: Product vision, roadmap definition, and business alignment
- **Key Responsibilities**: User story creation, market research, stakeholder communication
- **Quality Standards**: Business value validation, technical feasibility assessment
- **AI Integration**: Strategic analysis and business impact evaluation

### 3. AI System Architect
- **Primary Focus**: System architecture design and component relationships
- **Key Responsibilities**: Architecture decision records (ADRs), technology stack decisions
- **Quality Standards**: Schema-locked I/O, modular design, performance architecture
- **AI Integration**: Architecture pattern recommendations and system design

### 4. AI Operations Engineer
- **Primary Focus**: DevOps, security, and production deployment
- **Key Responsibilities**: CI/CD pipeline configuration, security compliance, monitoring
- **Quality Standards**: Security-first operations, automated deployment, incident response
- **AI Integration**: Infrastructure as code and operational automation

### 5. UX/Product Designer
- **Primary Focus**: User experience design and research
- **Key Responsibilities**: Design system creation, accessibility compliance, usability optimization
- **Quality Standards**: WCAG 2.1 AA compliance, performance-aware design
- **AI Integration**: Design system generation and user research analysis

### 6. AI Quality Assurance Engineer
- **Primary Focus**: Quality assurance and testing
- **Key Responsibilities**: Test automation, quality validation, security testing
- **Quality Standards**: ≥85% test coverage, comprehensive quality reporting
- **AI Integration**: Test case generation and quality metrics analysis

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
- **"you are now an architect"** → AI System Architect
- **"you are now an operations engineer"** → AI Operations Engineer
- **"you are now a designer"** → UX/Product Designer
- **"you are now a qa engineer"** → AI Quality Assurance Engineer

Alternative commands: `switch to [role]`, `[role] mode`, `coding mode`, `strategy mode`, `architecture mode`, `devops mode`, `ux mode`, `testing mode`

## 📁 Project Structure

```
TappMCP/
├── src/                           # Source code
│   ├── server.ts                  # MCP server implementation
│   ├── tools/                     # MCP Tools (kebab-case naming)
│   │   ├── smart-begin.ts
│   │   ├── smart-plan.ts
│   │   ├── smart-write.ts
│   │   ├── smart-finish.ts
│   │   └── smart-orchestrate.ts
│   ├── resources/                 # MCP Resources
│   ├── prompts/                   # MCP Prompts
│   ├── schemas/                   # Zod schemas for validation
│   ├── types/                     # TypeScript type definitions
│   ├── utils/                     # Utility functions
│   └── config/                    # Server configuration
├── tests/                         # All test files
│   ├── unit/                      # Unit tests
│   ├── integration/               # Integration tests
│   ├── e2e/                       # End-to-end tests
│   ├── reports/                   # Test reports
│   └── fixtures/                  # Test data
├── docs/                          # Documentation
│   ├── configuration/             # Configuration files
│   │   └── claude-system-prompt.md
│   ├── roles/                     # Role definitions
│   ├── rules/                     # Development rules
│   └── [other documentation]
├── config/                        # Configuration files
│   ├── claude-config.json
│   ├── mcp.config.json
│   └── production.json
├── scripts/                       # Build/deployment scripts
├── temp/                          # Temporary files
├── knowledgebase/                 # Project knowledge and research
│   ├── README.md
│   ├── mcp-server-folder-structure.md
│   └── phase1-migration-summary.md
├── dist/                          # Build output
├── Dockerfile                     # Linux runtime container
├── docker-compose.yml             # Development and production containers
├── package.json
├── tsconfig.json
├── README.md
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

### Development Workflow

#### 1. Quality Check (MANDATORY)
```bash
# Run comprehensive quality check
npm run early-check

# Individual quality checks
npm run qa:all
```

#### 2. Building
```bash
# Local build
npm run build

# Docker build
npm run docker:build
```

#### 3. Testing
```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:changed
npm run test:real-world
```

#### 4. Running
```bash
# Local development
npm run dev

# Docker development
npm run docker:dev

# Production
npm start
```

### Quality Standards
- **TypeScript**: Strict mode with `strictNullChecks` and `exactOptionalPropertyTypes`
- **Test Coverage**: ≥85% on changed files (both line and branch coverage)
- **Performance**: <100ms response time for all tools
- **Security**: Zero critical vulnerabilities, no secrets in repository
- **Code Quality**: ESLint complexity ≤10, duplication ≤5%

### Pre-commit Requirements
All commits must pass:
- TypeScript compilation (`tsc --noEmit`)
- ESLint validation (`eslint src/**/*.ts`)
- Code formatting (`prettier --check`)
- Unit tests with coverage (`vitest run --coverage`)
- Security scans (OSV-Scanner, Semgrep)

## 📚 Documentation

- **[AI Role Setup Guide](docs/setup/ai-role-setup.md)** - Comprehensive setup and usage instructions
- **[Role Definitions](docs/roles/)** - Detailed role documentation
- **[Project Vision](docs/project/vision.md)** - Project vision and goals
- **[Tech Stack](docs/project/tech-stack.md)** - Technology choices and rationale
- **[Key Decisions](docs/knowledge/decisions-summary.md)** - Strategic decisions and rationale
- **[MCP Integration](docs/knowledge/mcp-integration-decisions.md)** - External MCP integration strategy

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
