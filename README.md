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
Initialize projects with comprehensive planning and architecture design.

### smart-plan
Generate detailed technical implementation plans.

### smart-write
Write production-ready code with best practices.

### smart-finish
Complete projects with quality assurance and documentation.

### smart-orchestrate
Coordinate complex multi-step workflows.

### smart-converse
Natural language interface for conversational project setup and interaction.

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

```bash
# Run all tests with coverage
npm run test:coverage

# Run specific test file
npx vitest run src/tools/smart-begin.test.ts

# Run quality checks
npm run qa:all
```

## 🐳 Docker

```bash
# Development with Docker
npm run docker:dev

# Production deployment
npm run docker:build
docker-compose up -d
```

## 📖 Documentation

- [API Reference](./docs/API.md) - Complete API documentation
- [Development Guide](./docs/DEVELOPMENT.md) - Developer setup and guidelines
- [Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment instructions

## 📄 License

MIT

## 🤝 Contributing

Please read [DEVELOPMENT.md](./docs/DEVELOPMENT.md) for development guidelines.