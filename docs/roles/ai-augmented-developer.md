# AI-Augmented Developer Role
## Role Reference: docs/roles/ai-augmented-developer.md

### 🎯 Purpose
AI-assisted development ensuring code quality, security, and efficiency through adherence to project-guidelines.md standards.

### 📋 Responsibilities
- **Code Generation**: AI-assisted development using Cursor and Claude Code
- **Architecture Decisions**: System design following schema-locked I/O principles
- **Quality Assurance**: Code review and testing strategy implementation
- **Security Implementation**: Secure coding practices and vulnerability prevention
- **Performance Optimization**: Code and system performance tuning

### 📐 project-guidelines.md Standards
- **Line Budgets**: ≤400 lines per turn, ≤120 lines per file
- **TypeScript Strict**: `tsc --strict`, `strictNullChecks`, `exactOptionalPropertyTypes`
- **Complexity**: ESLint complexity ≤10
- **Coverage**: ≥85% lines and branches on changed files
- **Security**: No secrets in repo, pre-commit scanning mandatory
- **Performance**: <100ms response time targets

### 🧪 Testing Requirements
- **Pre-commit Tests**: Vitest on changed files with coverage enforcement
- **Coverage Requirements**: ≥85% on changed files, both line & branch
- **Static Scans**: ESLint, tsc required before commit
- **Security Scans**: OSV-Scanner and Semgrep integration

### 🎯 AI Assistance Priorities
1. **Code Generation**: TypeScript/Node.js with proper error handling
2. **Security**: Vulnerability identification and secure coding practices
3. **Performance**: Optimization recommendations and benchmarking
4. **Quality**: Test case generation and coverage analysis
5. **Architecture**: Schema-locked I/O and modular design patterns

### 🧠 Critical Thinking Framework
Before writing any code, ask:
- **Data Structure**: What is the complete expected output structure?
- **Error Handling**: What can go wrong and how should it be handled?
- **Performance**: Will this operation complete within 100ms?
- **Type Safety**: Are all types properly defined and validated?
- **Testing**: How can I verify this works correctly?

### 📚 Mandatory Pre-Development Checklist
1. **Read schemas first**: Understand expected data structures
2. **Plan data flow**: Input → Processing → Output mapping
3. **Identify bottlenecks**: Look for performance-critical operations
4. **Define error conditions**: What failures are possible?
5. **Write tests first**: TDD for complex logic

### 🎓 Training Resources
- **Comprehensive Training**: [AI-Augmented Developer Training Guide](ai-augmented-developer-training.md)
- **Quick Reference**: [Developer Quick Reference Card](developer-quick-reference.md)
- **Prompt Injection**: [Developer Prompt Injection System](developer-prompt-injection.md)

### 📊 Success Metrics
- **Security (25%)**: Zero critical vulnerabilities, no secret leaks
- **Quality (20%)**: Focused diffs, tests with changes, readability
- **Coverage (20%)**: ≥85% on changed files, both line & branch
- **Complexity (15%)**: Cyclomatic ≤10, duplication ≤5%
- **Reproducibility (10%)**: Deterministic builds with `npm ci`
- **Efficiency (10%)**: Single-turn success, low retry count

### 🛠️ Code Standards
- **TypeScript Strict**: Full strict mode compliance
- **Error Handling**: Comprehensive error handling and logging
- **Testing**: Unit tests for all functions with ≥85% coverage
- **Documentation**: All public APIs documented
- **Security**: Secure coding practices and vulnerability prevention

### 🏗️ Architecture Guidelines
- **Schema-locked I/O**: All tool calls use JSON Schemas
- **Modular Design**: Clear separation of concerns
- **Dependency Injection**: Testability and maintainability
- **Event-driven**: Where appropriate for MCP server patterns
- **Configuration**: Secure configuration management

---

## 🚨 **CRITICAL: Process Compliance Requirements**

### **MANDATORY: Before Starting Any Development Work:**
1. **Role Validation**: Explicitly confirm you are in the AI-Augmented Developer role
2. **Run Early Quality Check**: `npm run early-check` - MUST PASS
3. **Verify Clean State**: No TypeScript errors, ESLint warnings, or test failures
4. **Check Dependencies**: Ensure all packages are installed and up-to-date
5. **Review Project Guidelines**: Understand current standards and requirements
6. **Read Role Requirements**: Review this entire document and role-specific requirements
7. **Tool Validation**: Ensure all quality tools are installed and configured

### **MANDATORY: During Development:**
1. **Test-Driven Development**: Write tests BEFORE implementing features (TDD)
2. **TypeScript First**: Always use strict typing, avoid `any` types
3. **ESLint Integration**: Run `npm run lint:check` frequently
4. **Incremental Commits**: Small, focused commits with quality checks
5. **Real-time Validation**: Use IDE extensions for immediate feedback
6. **Quality Gates**: Validate all changes meet quality thresholds
7. **Security Scans**: Run security scans before committing changes
8. **Performance Validation**: Ensure <100ms response time targets

### **MANDATORY: Before Committing:**
1. **TypeScript Compilation**: `npm run type-check` must pass
2. **ESLint Validation**: `npm run lint:check` must pass
3. **Formatting Check**: `npm run format:check` must pass
4. **Unit Tests**: `npm run test` must pass
5. **Pre-commit Hooks**: `npm run pre-commit:run` must pass
6. **Security Scans**: OSV-Scanner and Semgrep must pass
7. **Performance Check**: Response times must be <100ms
8. **Coverage Check**: Test coverage must be ≥85%

### **Common Pitfalls to Avoid:**
- ❌ **TypeScript `any` types**: Use `unknown` or proper typing
- ❌ **Large functions**: Keep functions ≤150 lines, complexity ≤15
- ❌ **Unused variables**: Prefix with `_` or remove
- ❌ **Logical OR for defaults**: Use nullish coalescing `??` instead of `||`
- ❌ **Skipping tests**: Always write tests for new functionality
- ❌ **Ignoring ESLint warnings**: Fix all warnings before committing

### **Quality Gates (Non-negotiable):**
- **TypeScript Errors**: 0 (blocking)
- **ESLint Errors**: 0 (blocking)
- **Test Coverage**: ≥85% (blocking)
- **Performance**: <100ms response time (blocking)
- **Security**: 0 critical vulnerabilities (blocking)

### **Emergency Fixes:**
If issues are found after commit:
1. **Immediate**: Run `npm run early-check` to assess damage
2. **Quick Fix**: Use `npm run format` and `npm run lint` for auto-fixes
3. **TypeScript**: Fix type errors with proper typing
4. **Tests**: Add missing tests or fix broken ones
5. **Commit**: Create fix commit with clear message

### **Tool Configuration:**
- **IDE**: Enable ESLint, Prettier, TypeScript extensions
- **Git Hooks**: Pre-commit validation enabled
- **CI/CD**: Automated quality checks configured
- **Monitoring**: Real-time quality feedback

### **Escalation Path:**
1. **Self-fix**: Use provided tools and guidelines
2. **Team Review**: Request code review for complex issues
3. **Architecture Review**: For design pattern violations
4. **Security Review**: For security-related concerns

---

## 📚 **Reference Materials**
- [project-guidelines.md](../../project-guidelines.md)
- [coding-standards.md](../../rules/coding_standards.md)
- [test-strategy.md](../../rules/test_strategy.md)
- [early-quality-gates.md](../../implementation/06-supporting-docs/early-quality-gates.md)
