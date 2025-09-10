# TappMCP - Smart MCP Server

A Model Context Protocol (MCP) server implementation with AI-assisted development tools.

## 🚀 Quick Start

```bash
# Install dependencies
npm ci

# Run tests
npm test

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

## 📦 Installation

```bash
npm install smart-mcp
```

## 🛠️ Core Tools

### smart-begin
Initialize new projects or analyze existing projects with comprehensive planning and architecture design.

**New Features:**
- **Existing Project Analysis**: Analyze existing projects to identify improvement opportunities
- **Project Scanning**: Automatically detect tech stack, quality issues, and improvement areas
- **Quality Assessment**: Evaluate project quality and provide actionable recommendations

### smart-plan
Generate detailed technical implementation plans with support for existing project improvement.

**New Features:**
- **Improvement Modes**: Enhancement, refactoring, and optimization planning
- **Quality Level Targeting**: Plan improvements to reach specific quality levels
- **Preservation Strategies**: Maintain existing functionality while improving code

### smart-write
Write, modify, or enhance production-ready code with best practices.

**New Features:**
- **Modification Modes**: Create new code, modify existing code, or enhance existing functionality
- **Backup Strategies**: Automatic backup of original files before modification
- **Safe Modification**: Multiple strategies for safely modifying existing code

### smart-finish
Complete projects with quality assurance and documentation.

### smart-orchestrate
Coordinate complex multi-step workflows.

### smart-converse
Natural language interface for conversational project setup and interaction.

## 🔍 Existing Project Analysis

TappMCP can now analyze existing projects and provide improvement recommendations:

### Analyzing an Existing Project

```bash
# Use smart_begin with analyze-existing mode
{
  "projectName": "My Existing Project",
  "mode": "analyze-existing",
  "existingProjectPath": "/path/to/your/project",
  "analysisDepth": "standard", // quick, standard, or deep
  "role": "developer"
}
```

### Planning Improvements

```bash
# Use smart_plan with improvement modes
{
  "projectId": "proj_1234567890_my_existing_project",
  "improvementMode": "enhancement", // enhancement, refactoring, or optimization
  "targetQualityLevel": "production",
  "preserveExisting": true
}
```

### Modifying Existing Code

```bash
# Use smart_write with modification modes
{
  "projectId": "proj_1234567890_my_existing_project",
  "featureDescription": "Add error handling to existing API",
  "writeMode": "enhance", // create, modify, or enhance
  "backupOriginal": true,
  "modificationStrategy": "backup-first"
}
```

### Analysis Results

The analysis provides:
- **Project Structure**: Complete file and folder mapping
- **Tech Stack Detection**: Automatically identified technologies
- **Quality Issues**: Specific problems found in the codebase
- **Improvement Opportunities**: Actionable recommendations
- **Quality Scores**: Overall project health metrics

## 💬 Smart Converse Usage

The `smart_converse` tool provides a natural language interface to TappMCP:

```javascript
// Example conversations
"I want to create a React web application called MyApp"
"Build a Python API service with FastAPI"
"Design a mobile application for iOS"
"Create a TypeScript library for data processing"
```

**Supported Project Types:**
- `web-app` - Websites, web applications, frontends
- `api-service` - APIs, backends, REST services
- `mobile-app` - iOS, Android, React Native apps
- `library` - Packages, modules, SDKs, frameworks

**Supported Tech Stacks:**
- **Frontend**: React, Vue, Angular
- **Backend**: Node.js, Python (Django/Flask/FastAPI)
- **Language**: TypeScript, JavaScript
- **Mobile**: React Native

**Supported Roles:**
- `developer` - Code implementation and development
- `designer` - UI/UX design and interfaces
- `qa-engineer` - Testing and quality assurance
- `operations-engineer` - DevOps, deployment, CI/CD
- `product-strategist` - Strategy and planning

### Example Responses

Smart Converse returns formatted responses with:
- ✅ Project initialization confirmation
- 📋 Detected project details and tech stack
- 💰 Business value estimation (cost prevention, time saved)
- 🎯 Next steps and recommendations
- 📊 Workflow phases for implementation

## 📋 Requirements

- Node.js v18+
- TypeScript 5.0+
- npm or yarn

## 🧪 Testing

TappMCP uses a comprehensive testing strategy with proper separation of concerns:

### Test Architecture
- **Unit Tests**: Test individual components in isolation with mocked dependencies
- **Integration Tests**: Test component interactions with mocked external services
- **End-to-End Tests**: Test complete workflows with real external services

### Running Tests

```bash
# Run all tests with coverage
npm run test:coverage

# Run specific test file
npx vitest run src/tools/smart-begin.test.ts

# Run unit tests only
npm test -- --grep "Unit Tests"

# Run integration tests only
npm test -- --grep "Integration Tests"

# Run quality checks
npm run qa:all

# Run early quality check (before development)
npm run early-check
```

### Test Coverage
- **Target Coverage**: ≥85% lines and branches
- **Current Status**: 879 tests passing
- **Test Types**: Unit, Integration, E2E, Performance
- **Framework**: Vitest with TypeScript support

## 🐳 Docker

```bash
# Development with Docker
npm run docker:dev

# Production deployment
npm run docker:build
docker-compose up -d

# Rebuild and deploy latest changes
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 🚀 Latest Improvements

### ✅ **Test Architecture Overhaul**
- **Proper Test Separation**: Unit tests (mock behavior) vs Integration tests (real logic)
- **879 Tests Passing**: All tests now pass with proper separation of concerns
- **Performance Optimized**: Tests run faster with better isolation
- **CI/CD Ready**: Reliable test suite for continuous integration

### ✅ **Enhanced Tool Capabilities**
- **Existing Project Analysis**: Analyze and improve existing codebases
- **Quality Improvement Detection**: Identify and fix code quality issues
- **Enhanced Modification Strategies**: Safe code modification with backup options
- **Better Error Handling**: Improved fallback mechanisms and error recovery

### ✅ **Code Quality Improvements**
- **TypeScript Strict Mode**: Full strict mode compliance
- **ESLint Compliance**: All code quality rules enforced
- **Performance Optimized**: <100ms response times maintained
- **Security Enhanced**: Zero critical vulnerabilities

## 📊 Current Status

- **Health Check**: ✅ All systems operational
- **Test Coverage**: ✅ 879/879 tests passing
- **Code Quality**: ✅ ESLint, TypeScript, formatting all clean
- **Docker Deployment**: ✅ Production-ready container
- **MCP Server**: ✅ All tools available and functional

## 📖 Documentation

- [API Reference](./docs/API.md) - Complete API documentation
- [Development Guide](./docs/DEVELOPMENT.md) - Developer setup and guidelines
- [Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment instructions

## 📄 License

MIT

## 🤝 Contributing

Please read [DEVELOPMENT.md](./docs/DEVELOPMENT.md) for development guidelines.
