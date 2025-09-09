# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL: Before Starting ANY Work

**MANDATORY COMPLIANCE CHECKLIST:**
1. **Run Early Quality Check**: `npm run early-check` - MUST PASS before any work
2. **Confirm Your Role**: State "I am now in the [ROLE] role" explicitly
3. **Review Role Requirements**: Check role-specific documentation and guidelines
4. **Validate Environment**: Ensure all tools are installed and configured
5. **Follow TDD Approach**: Write tests BEFORE implementing features
6. **TypeScript Strict Mode**: Always use explicit types, especially in callbacks - NO IMPLICIT ANY

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

# Run tests on changed files only
npm run test:changed

# Run a single test file
npx vitest run src/tools/smart_begin.test.ts
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
npm run lint:check     # ESLint check only
npm run format         # Prettier fix
npm run format:check   # Prettier check only
npm run type-check     # TypeScript check
```

### Security Scanning
```bash
# Run security scans
npm run security:scan    # Gitleaks detect
npm run security:osv     # OSV vulnerability scanner
npm run security:semgrep # Semgrep OWASP scanning
```

### Docker Operations
```bash
# Development with Docker (Linux runtime)
npm run docker:dev

# Build Docker container
npm run docker:build

# Run tests in Docker
npm run docker:test

# Deploy with Docker
npm run deploy:docker
npm run deploy:stop
npm run deploy:logs
npm run deploy:health
```

### Pre-commit Hooks
```bash
# Install pre-commit hooks
npm run pre-commit:install

# Run pre-commit on all files
npm run pre-commit:run

# Update pre-commit hooks
npm run pre-commit:update
```

**Pre-commit Configuration:**
- Generated files (`dist/`, `node_modules/`, `coverage/`) are excluded from end-of-file-fixer hook
- VS Code settings automatically add final newlines to prevent formatting issues
- Hooks include: large file checks, YAML validation, trailing whitespace removal, ESLint, TypeScript checking, and unit tests

## Architecture Overview

### MCP Server Implementation
This is a Model Context Protocol (MCP) server built with TypeScript and Node.js. The server provides AI-assisted development tools through a schema-locked I/O pattern.

**Core Structure:**
- `src/server.ts` - Main MCP server implementation with tool registry
- `src/tools/` - MCP tool implementations (smart-begin, smart-plan, smart-write, smart-finish, smart-orchestrate with variants)
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

### Quality Standards

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

### Role-Based Development

The project implements 6 specialized AI roles. When working on this codebase:

1. **Default Role**: AI-Augmented Developer
   - Focus on code quality, testing, and security
   - Follow TDD approach
   - Ensure all quality gates pass

2. **Switching Roles**: The `.cursorrules` file enables role switching with commands like:
   - "you are now a developer"
   - "you are now a qa engineer"
   - "you are now an operations engineer"

### Critical Process Requirements

**Current Status (September 2025)**: 🚀 Major improvements achieved, final cleanup in progress
- 4 failing tests out of 546 (99.3% pass rate) - **Improved from 85.5% pass rate**
- 44 TypeScript compilation errors remaining (down from 122 errors)
- ESLint configuration updated to exclude archived files
- Code formatting issues resolved (0 files with formatting problems)

**Before starting any work:**
1. Run `npm run early-check` - ⚠️ CURRENTLY FAILING (TypeScript errors remain)
2. Explicitly confirm your role (e.g., "I am now in the AI-Augmented Developer role")
3. Review the Process Compliance Checklist (archived in docs/archive/)
4. Ensure all dependencies are installed with `npm ci`
5. Verify Docker is available for Linux runtime testing
6. Check that pre-commit hooks are installed

**Phase 1 Recovery Progress (September 2025):**
- ✅ Test failures: Fixed 75 test failures (79→4 remaining, 94.3%→99.3% pass rate)
- ✅ Code formatting: All formatting issues resolved
- ✅ Legacy file cleanup: Old files archived to exclude from builds
- ⚠️ TypeScript errors: 78 errors fixed (122→44 remaining) - **FINAL TASK**

**Before committing:**
1. Run `npm run qa:all` to verify ALL quality checks pass
2. Ensure test coverage ≥85% on changed files
3. Verify no security vulnerabilities (run security scans)
4. Check that complexity requirements are met (≤10)
5. Validate performance targets (<100ms response time)
6. Run `npm run pre-commit:run` for final validation

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

### Common Troubleshooting

- For Windows-specific issues, see `docs/implementation/06-supporting-docs/windows-troubleshooting.md`
- For test debugging, check `docs/implementation/06-supporting-docs/test-debugging-lessons.md`
- Role compliance guide: `docs/implementation/06-supporting-docs/role-specific-prevention-guide.md`
- Process compliance checklist: `docs/implementation/06-supporting-docs/process-compliance-checklist.md`
- Role switching guide: `docs/implementation/06-supporting-docs/role-switching-guide.md`
- Lessons from failures: `docs/lessons/project/phase-1c-role-compliance-failure.md`

### MCP Server Troubleshooting

If MCP servers (Context7, TestSprite, Playwright, GitHub, FileSystem) aren't connecting:

**Quick Fixes:**
1. **Restart Cursor completely** - MCP connections initialize at startup
2. **Install MCP packages globally:**
   ```bash
   npm install -g @modelcontextprotocol/server-filesystem@latest
   npm install -g @modelcontextprotocol/server-github@latest
   npm install -g @testsprite/testsprite-mcp@latest
   npm install -g @playwright/mcp@latest
   ```
3. **Check MCP status** - Go to Cursor Settings > MCP to verify connection status
4. **Verify tokens** - Ensure GitHub token and API keys are valid

**Common Issues:**
- MCP packages not globally installed
- Windows path issues with filesystem server
- Network connectivity for remote servers (Context7)
- Invalid or expired API tokens
- Cursor needs restart after MCP configuration changes

**Verification:**
- Test GitHub token: `curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user`
- Test Context7: Server responds at https://mcp.context7.com/mcp (requires MCP protocol)

### Training Resources

- Role training index: `docs/roles/training-index.md`
- Developer quick reference: `docs/roles/developer-quick-reference.md`
- Developer prompt injection: `docs/roles/developer-prompt-injection.md`

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
