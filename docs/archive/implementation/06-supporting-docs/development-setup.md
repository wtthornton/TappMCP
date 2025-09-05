# Development Environment Setup

**Date**: December 2024
**Status**: Ready for Implementation
**Context**: Complete development environment setup guide for Phase 1 implementation

## 🎯 **Overview**

This guide provides step-by-step instructions for setting up the development environment for Smart MCP Phase 1 implementation, following all quality and coding standards.

## 🖥️ **System Requirements**

### **Operating System**
- **Development**: Windows 10/11 with WSL2 or Git Bash
- **Runtime**: Linux (Docker container)
- **Memory**: 8GB RAM minimum, 16GB recommended
- **Storage**: 10GB free space minimum

### **Required Software**
- **Node.js**: LTS version (18.x or 20.x)
- **npm**: Version 9.x or later
- **Docker**: Desktop with Linux containers
- **Git**: Version 2.30 or later
- **VS Code**: Latest version with recommended extensions

## 📦 **Dependencies Setup**

### **1. Update package.json**
```json
{
  "name": "smart-mcp",
  "version": "0.1.0",
  "description": "AI-assisted MCP server with role-based development",
  "main": "dist/server.js",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "ts-node --esm src/server.ts",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write src/**/*.ts",
    "type-check": "tsc --noEmit",
    "pre-commit": "npm run type-check && npm run lint && npm run test",
    "docker:build": "docker build -t smart-mcp .",
    "docker:dev": "docker-compose up -d",
    "docker:test": "docker-compose exec app npm test"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.4.0",
    "zod": "^3.22.0",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-security": "^1.7.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0",
    "ts-node": "^10.9.0",
    "vitest": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0",
    "pre-commit": "^1.2.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### **2. Install Dependencies**
```bash
# Install all dependencies
npm install

# Install pre-commit hooks
npm run pre-commit install
```

## ⚙️ **TypeScript Configuration**

### **tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "strictNullChecks": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "resolveJsonModule": true,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@/core/*": ["core/*"],
      "@/tools/*": ["tools/*"],
      "@/roles/*": ["roles/*"],
      "@/schemas/*": ["schemas/*"],
      "@/tests/*": ["tests/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
```

## 🔧 **ESLint Configuration**

### **.eslintrc.json**
```json
{
  "env": {
    "node": true,
    "es2022": true
  },
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint", "security"],
  "rules": {
    "complexity": ["error", 10],
    "max-lines-per-function": ["error", 50],
    "max-lines": ["error", 120],
    "max-depth": ["error", 4],
    "max-params": ["error", 4],
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/prefer-const": "error",
    "@typescript-eslint/no-var-requires": "error",
    "security/detect-object-injection": "error",
    "security/detect-non-literal-regexp": "error",
    "security/detect-unsafe-regex": "error"
  },
  "overrides": [
    {
      "files": ["**/*.test.ts", "**/*.spec.ts"],
      "rules": {
        "max-lines-per-function": "off",
        "max-lines": "off"
      }
    }
  ]
}
```

## 🎨 **Prettier Configuration**

### **.prettierrc.json**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

## 🧪 **Vitest Configuration**

### **vitest.config.ts**
```typescript
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85
      },
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/tests/**',
        'dist/**'
      ]
    },
    include: ['src/**/*.{test,spec}.ts'],
    exclude: ['node_modules', 'dist']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/core': resolve(__dirname, './src/core'),
      '@/tools': resolve(__dirname, './src/tools'),
      '@/roles': resolve(__dirname, './src/roles'),
      '@/schemas': resolve(__dirname, './src/schemas'),
      '@/tests': resolve(__dirname, './src/tests')
    }
  }
});
```

## 🔒 **Pre-commit Configuration**

### **.pre-commit-config.yaml**
```yaml
repos:
  - repo: local
    hooks:
      - id: typescript-check
        name: TypeScript Check
        entry: npm run type-check
        language: system
        pass_filenames: false
        always_run: true

      - id: eslint
        name: ESLint
        entry: npm run lint
        language: system
        pass_filenames: false
        always_run: true

      - id: prettier
        name: Prettier
        entry: npm run format
        language: system
        pass_filenames: false
        always_run: true

      - id: vitest
        name: Vitest
        entry: npm run test
        language: system
        pass_filenames: false
        always_run: true

      - id: security-scan
        name: Security Scan
        entry: npx gitleaks detect --source . --verbose
        language: system
        pass_filenames: false
        always_run: true

      - id: vulnerability-scan
        name: Vulnerability Scan
        entry: npx osv-scanner --lockfile package-lock.json
        language: system
        pass_filenames: false
        always_run: true
```

## 🐳 **Docker Configuration**

### **Dockerfile**
```dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S smartmcp -u 1001

# Change ownership
RUN chown -R smartmcp:nodejs /app
USER smartmcp

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/health-check.js

# Start the application
CMD ["npm", "start"]
```

### **docker-compose.yml**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=info
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "dist/health-check.js"]
      interval: 30s
      timeout: 10s
      retries: 3

  dev:
    build: .
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=development
      - LOG_LEVEL=debug
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run dev
    restart: unless-stopped
```

## 📁 **Project Structure Setup**

### **Create Directory Structure**
```bash
# Create all required directories
mkdir -p src/{core,tools,roles,schemas,tests/{unit,integration,fixtures}}
mkdir -p docs/{implementation,api,examples}
mkdir -p logs
mkdir -p dist
```

### **Directory Structure**
```
smart-mcp/
├── src/
│   ├── core/
│   │   ├── context-manager.ts
│   │   ├── quality-validator.ts
│   │   ├── error-handler.ts
│   │   └── logger.ts
│   ├── tools/
│   │   ├── smart_begin.ts
│   │   ├── smart_plan.ts
│   │   ├── smart_write.ts
│   │   └── smart_finish.ts
│   ├── roles/
│   │   ├── ai-developer.ts
│   │   ├── product-strategist.ts
│   │   ├── operations-engineer.ts
│   │   ├── ux-designer.ts
│   │   └── qa-engineer.ts
│   ├── schemas/
│   │   ├── tool-input.schema.json
│   │   ├── tool-output.schema.json
│   │   ├── role-context.schema.json
│   │   └── quality-metrics.schema.json
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── fixtures/
│   └── server.ts
├── docs/
│   ├── implementation/
│   ├── api/
│   └── examples/
├── logs/
├── dist/
├── .env.example
├── .gitignore
├── .eslintrc.json
├── .prettierrc.json
├── .pre-commit-config.yaml
├── vitest.config.ts
├── tsconfig.json
├── package.json
├── Dockerfile
└── docker-compose.yml
```

## 🔐 **Environment Configuration**

### **.env.example**
```bash
# Server Configuration
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# MCP Configuration
MCP_SERVER_NAME=smart-mcp
MCP_SERVER_VERSION=0.1.0

# Quality Configuration
QUALITY_THRESHOLD=85
COMPLEXITY_THRESHOLD=10
SECURITY_THRESHOLD=0

# Business Configuration
COST_PREVENTION_TARGET=10000
TIME_SAVINGS_TARGET=50

# External Services (if needed)
# GITHUB_TOKEN=
# OPENAI_API_KEY=
```

### **.gitignore**
```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
*.tsbuildinfo

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
```

## 🚀 **Development Workflow**

### **1. Initial Setup**
```bash
# Clone repository
git clone <repository-url>
cd smart-mcp

# Install dependencies
npm install

# Set up pre-commit hooks
npm run pre-commit install

# Copy environment file
cp .env.example .env

# Build project
npm run build

# Run tests
npm test
```

### **2. Daily Development**
```bash
# Start development server
npm run dev

# Run tests in watch mode
npm run test -- --watch

# Check code quality
npm run lint
npm run type-check

# Format code
npm run format
```

### **3. Pre-commit Checks**
```bash
# Run all pre-commit checks
npm run pre-commit

# Individual checks
npm run type-check
npm run lint
npm run test
```

### **4. Docker Development**
```bash
# Build Docker image
npm run docker:build

# Start development container
npm run docker:dev

# Run tests in container
npm run docker:test
```

## 🔍 **VS Code Extensions**

### **Recommended Extensions**
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "ms-vscode.vscode-docker",
    "ms-vscode.test-adapter-converter",
    "hbenl.vscode-test-explorer",
    "ms-vscode.vscode-jest"
  ]
}
```

### **VS Code Settings**
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "eslint.validate": ["typescript"],
  "prettier.requireConfig": true,
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.git": true
  }
}
```

## ✅ **Verification Checklist**

### **Environment Setup**
- [ ] Node.js LTS installed
- [ ] npm version 9.x or later
- [ ] Docker Desktop installed
- [ ] Git configured
- [ ] VS Code with extensions

### **Dependencies**
- [ ] All dependencies installed
- [ ] Pre-commit hooks configured
- [ ] TypeScript strict mode enabled
- [ ] ESLint configured
- [ ] Prettier configured
- [ ] Vitest configured

### **Project Structure**
- [ ] All directories created
- [ ] Configuration files in place
- [ ] Environment file configured
- [ ] Git ignore configured

### **Quality Checks**
- [ ] TypeScript compilation successful
- [ ] ESLint passes without errors
- [ ] Prettier formatting applied
- [ ] Tests pass with coverage
- [ ] Pre-commit hooks working

### **Docker Setup**
- [ ] Dockerfile configured
- [ ] Docker Compose working
- [ ] Development container running
- [ ] Tests running in container

---

**Setup Status**: ✅ **READY** - Complete development environment setup guide
