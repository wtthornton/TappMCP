# Smart MCP - Quick Reference Guide

**For Cursor AI and Claude Code Users**

## 🚀 Quick Start

### 1. Setup
```bash
# Clone and install
git clone https://github.com/wtthornton/TappMCP.git
cd TappMCP
npm install

# Quality check
npm run early-check
```

### 2. Role Switching
```bash
# Cursor AI - Use in chat
"you are now a developer"
"switch to product strategist"
"you are now an operations engineer"

# Claude Code - Load system prompt
claude --system-prompt docs/configuration/claude-system-prompt.md
```

### 3. Project Structure
```
TappMCP/
├── src/                    # Source code
│   ├── tools/             # MCP Tools (kebab-case)
│   ├── resources/         # MCP Resources
│   ├── prompts/           # MCP Prompts
│   └── schemas/           # Zod schemas
├── tests/                 # All test files
├── docs/                  # Documentation
├── config/                # Configuration files
├── scripts/               # Build scripts
├── knowledgebase/         # Project knowledge
└── temp/                  # Temporary files
```

## 🎭 Role Commands

### Developer Role
- **Trigger**: "you are now a developer" or "switch to developer"
- **Focus**: Code generation, architecture, quality assurance
- **Key Tasks**: Fix bugs, optimize performance, write tests

### Product Strategist Role
- **Trigger**: "you are now a product strategist" or "switch to product"
- **Focus**: Product vision, user stories, business analysis
- **Key Tasks**: Requirements analysis, market research, stakeholder communication

### Operations Engineer Role
- **Trigger**: "you are now an operations engineer" or "switch to operations"
- **Focus**: DevOps, security, deployment
- **Key Tasks**: CI/CD setup, security scanning, monitoring

### Designer Role
- **Trigger**: "you are now a designer" or "switch to designer"
- **Focus**: User experience, accessibility, design systems
- **Key Tasks**: UX design, accessibility compliance, design patterns

### QA Engineer Role
- **Trigger**: "you are now a qa engineer" or "switch to qa"
- **Focus**: Testing, quality validation, security testing
- **Key Tasks**: Test generation, quality metrics, security validation

### Architect Role
- **Trigger**: "you are now an architect" or "switch to architect"
- **Focus**: System design, architecture decisions, technology choices
- **Key Tasks**: Architecture patterns, technology evaluation, system design

## 🛠️ Development Commands

### Quality Checks
```bash
# Comprehensive quality check
npm run early-check

# Individual checks
npm run qa:eslint      # ESLint validation
npm run qa:typescript  # TypeScript compilation
npm run qa:format      # Code formatting
npm run qa:tests       # Test execution
```

### Testing
```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run specific tests
npm run test:changed
npm run test:real-world
```

### Building and Running
```bash
# Build project
npm run build

# Development mode
npm run dev

# Docker development
npm run docker:dev

# Production
npm start
```

### Security
```bash
# Security scans
npm run security:scan    # Secret detection
npm run security:osv     # Vulnerability scanning
npm run security:semgrep # Static analysis
```

## 📊 Quality Standards

### Test Coverage
- **Target**: ≥85% on changed files
- **Check**: `npm run test:coverage`
- **Fix**: Add missing tests or fix broken ones

### Performance
- **Target**: <100ms response time
- **Check**: Test output shows response times
- **Fix**: Profile and optimize slow operations

### TypeScript
- **Mode**: Strict mode with `strictNullChecks`
- **Check**: `npm run type-check`
- **Fix**: Add proper type annotations

### Code Quality
- **ESLint**: Complexity ≤10, no unused variables
- **Prettier**: Consistent code formatting
- **Check**: `npm run lint:check`
- **Fix**: `npm run lint` and `npm run format`

## 🚨 Common Issues

### Test Failures
1. **Check**: `npm run test` for specific failures
2. **Fix**: Address failing assertions
3. **Coverage**: Ensure ≥85% coverage

### Performance Issues
1. **Check**: Response times in test output
2. **Profile**: Identify bottlenecks
3. **Optimize**: Reduce response times to <100ms

### TypeScript Errors
1. **Check**: `npm run type-check`
2. **Fix**: Add proper type annotations
3. **Validate**: Ensure strict mode compliance

### ESLint Warnings
1. **Check**: `npm run lint:check`
2. **Fix**: `npm run lint` for auto-fixes
3. **Manual**: Fix remaining warnings

## 🔧 AI Tool Tips

### Cursor AI
- Use `.cursorrules` for role configuration
- Leverage real-time error detection
- Use natural language for role switching
- Take advantage of built-in TypeScript support

### Claude Code
- Load system prompt for full context
- Use role switching commands
- Maintain conversation context
- Follow structured output patterns

## 📁 Project Structure

```
src/
├── server.ts              # Main MCP server
├── tools/                 # Core MCP tools
│   ├── smart-begin.ts (plus variants)
│   ├── smart-plan.ts (plus variants)
│   ├── smart-write.ts (plus variants)
│   ├── smart-finish.ts (plus variants)
│   └── smart-orchestrate.ts (plus variants)
├── core/                  # Core functionality
├── integration/           # Integration tests
└── types/                 # TypeScript definitions

docs/
├── roles/                 # Role definitions
├── configuration/         # AI tool config
├── rules/                 # Coding standards
└── setup/                 # Setup guides
```

## 🎯 Current Status

### ✅ Working
- Core MCP server implementation
- 5 main tools (smart-begin, smart-plan, smart-write, smart-finish, smart-orchestrate) with multiple variants
- Role-based AI assistance
- Docker support
- Quality framework

### ⚠️ Current Issues
- Test failures (5 failed tests, 530 passed)
- Code formatting issues (5 files)
- TypeScript compilation errors
- ESLint code quality issues
- Performance optimizations needed

### 🚀 Next Steps
1. Fix failing tests
2. Optimize response times
3. Improve test coverage
4. Address ESLint warnings

## 📞 Support

### Documentation
- **Setup**: `docs/setup/ai-role-setup.md`
- **Roles**: `docs/roles/`
- **Standards**: `docs/rules/`
- **Guidelines**: `project-guidelines.md`

### Troubleshooting
- **Common Issues**: See `project-guidelines.md` troubleshooting section
- **Test Issues**: See `docs/rules/test_strategy.md`
- **Architecture**: See `docs/rules/arch_guidelines.md`

---

**Last Updated**: January 2025
**Version**: 0.1.0
**Status**: Active Development
