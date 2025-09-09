# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL: Before Starting ANY Work

**MANDATORY COMPLIANCE CHECKLIST:**
1. **Run Early Quality Check**: `npm run early-check` - MUST PASS before any work
2. **Confirm Your Role**: State "I am now in the [ROLE] role" explicitly
3. **Validate Environment**: Ensure all tools are installed and configured
4. **Follow TDD Approach**: Write tests BEFORE implementing features
5. **TypeScript Strict Mode**: Always use explicit types, especially in callbacks - NO IMPLICIT ANY

**Process Violations Will Result In:**
- Test failures and quality issues
- Role compliance failure
- Potential project failure

## Essential Commands

### Development
```bash
# Install dependencies (use npm ci for deterministic installs)
npm ci

# Start development server
npm run dev

# Build the project
npm run build

# Start production server
npm start
```

### Testing
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run a single test file
npx vitest run src/tools/smart-begin.test.ts
```

### Quality Checks
```bash
# Early quality check (MUST PASS before any work)
npm run early-check

# Run all QA checks
npm run qa:all

# Individual QA checks
npm run qa:eslint      # ESLint check
npm run qa:typescript  # TypeScript type check
npm run qa:format      # Prettier format check
npm run qa:tests       # Run tests with coverage

# Linting and formatting
npm run lint           # ESLint fix
npm run format         # Prettier fix
npm run type-check     # TypeScript check
```

### Security Scanning
```bash
# Run security scans
npm run security:scan    # Gitleaks detect
npm run security:osv     # OSV vulnerability scanner
npm run security:semgrep # Semgrep OWASP scanning
```

## Architecture Overview

### MCP Server Implementation
This is a Model Context Protocol (MCP) server built with TypeScript and Node.js. The server provides AI-assisted development tools through a schema-locked I/O pattern.

**Core Structure:**
- `src/server.ts` - Main MCP server implementation with tool registry
- `src/tools/` - MCP tool implementations (smart-begin, smart-plan, smart-write, smart-finish, smart-orchestrate)
- `src/core/` - Core utilities and shared logic
- `src/types/` - TypeScript type definitions

**Package Information:**
- **NPM Package Name**: `smart-mcp`
- **Project Directory**: `TappMCP`

**Key Patterns:**
- All tools use JSON Schema validation via Zod
- Comprehensive error handling with structured responses
- Test-Driven Development (TDD) approach
- TypeScript strict mode enabled - explicit typing required for all parameters
- Schema-locked I/O for all tool interactions

## Quality Standards

**Mandatory Requirements:**
- Test coverage ≥85% on all changed files
- ESLint complexity ≤10
- TypeScript strict mode enabled
- All tests must pass before commits
- Security scans must pass (no critical vulnerabilities)

**TypeScript Configuration:**
- Strict null checks enabled
- Exact optional property types
- No implicit any - ALL parameters must be explicitly typed
- No unused locals or parameters

**CRITICAL: TypeScript Callback Typing:**
```typescript
// ✅ CORRECT - explicit typing required
expect(results.some((item: { id: string }) => item.id === 'test')).toBe(true)

// ❌ WRONG - will fail in strict mode
expect(results.some(item => item.id === 'test')).toBe(true)
```

## Role-Based Development

The project implements 6 specialized AI roles. When working on this codebase:

1. **Default Role**: AI-Augmented Developer
   - Focus on code quality, testing, and security
   - Follow TDD approach
   - Ensure all quality gates pass

2. **Switching Roles**: The `.cursorrules` file enables role switching with commands like:
   - "you are now a developer"
   - "you are now a qa engineer"
   - "you are now an operations engineer"

## Critical Process Requirements

**Before starting any work:**
1. Run `npm run early-check` - MUST PASS
2. Explicitly confirm your role (e.g., "I am now in the AI-Augmented Developer role")
3. Ensure all dependencies are installed with `npm ci`
4. Check that pre-commit hooks are installed

**Before committing:**
1. Run `npm run qa:all` to verify ALL quality checks pass
2. Ensure test coverage ≥85% on changed files
3. Verify no security vulnerabilities (run security scans)
4. Check that complexity requirements are met (≤10)
5. Validate performance targets (<100ms response time)

### Testing Strategy

- **Unit Tests**: Vitest framework with coverage enforcement
- **Integration Tests**: Located in `src/integration/`
- **Coverage Thresholds**: 85% for branches, functions, lines, and statements
- **Test Timeout**: 10 seconds default, adjustable per test

### Environment Notes

- **Development**: Windows with Bash (WSL, Git Bash, or similar)
- **Runtime**: Linux (via Docker containers)
- **Node.js**: v18 or higher required
- **Health Check**: Server includes health endpoint on port 3000 for Docker

### Data Structure and Performance Patterns

When writing code, always follow these patterns:

**Complete Data Structures:**
```typescript
// Always return complete objects with ALL required properties
const response = {
  overall: { score: 85, grade: 'B', status: 'pass' },
  quality: { score: 90, grade: 'A', status: 'pass' },
  production: { score: 88, grade: 'B', status: 'pass' }
};
```

**Error Handling:**
```typescript
try {
  const result = await operation();
  return { ...result, status: 'pass', hasErrors: false };
} catch (error) {
  return { status: 'fail', hasErrors: true, error: error.message };
}
```

**Performance Optimization:**
- Use `Promise.all()` for parallel operations
- Target <100ms response times
- Cache expensive calculations
- Avoid blocking synchronous calls

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.