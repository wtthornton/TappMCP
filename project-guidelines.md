# Smart MCP — Project Guidelines

## 🎯 Purpose
This document defines the **rules and standards** for building and maintaining Smart MCP.
It provides a single reference for **developers, architects, and testers** to ensure quality, security, and efficiency at every stage.

---

## 🎭 Role-Based Development
Smart MCP implements **6 specialized AI roles** for comprehensive development coverage:

### 🚨 **CRITICAL: Process Compliance Requirements**

**MANDATORY**: Before starting any work, you MUST:
1. **Explicitly confirm your role**: State "I am now in the [ROLE] role"
2. **Read role-specific requirements**: Review the complete role document
3. **Run early quality check**: `npm run early-check` - MUST PASS
4. **Follow process compliance**: Use the process compliance checklist
5. **Validate environment**: Ensure all tools are installed and configured
6. **Check dependencies**: Verify all packages are installed and up-to-date
7. **Review project state**: Understand current implementation status

**WARNING**: Failure to follow process compliance requirements will result in:
- Test failures and quality issues
- Process violations and project delays
- Role compliance failure
- Potential project failure

### 🔧 **AI Tool Integration Requirements**

**For Cursor AI**:
- Ensure `.cursorrules` file is properly configured
- Use natural language role switching commands
- Leverage built-in TypeScript and ESLint integration
- Utilize real-time error detection and fixing

**For Claude Code**:
- Load system prompt: `claude --system-prompt docs/configuration/claude-system-prompt.md`
- Use role-specific context switching
- Follow structured output patterns
- Maintain conversation context across role switches
- Reference knowledge base: `knowledgebase/` for best practices and patterns

### 1. AI-Augmented Developer (Default)
- Code generation, refactoring, and debugging
- Architecture decisions and system design
- Performance optimization and security
- Testing strategies and implementation
- **MANDATORY**: Test-Driven Development (TDD) approach
- **MANDATORY**: Follow all quality gates and security scans

### 2. Product Strategist
- Product vision and roadmap definition
- User story creation and acceptance criteria
- Market research and competitive analysis
- Stakeholder communication
- **MANDATORY**: Align all features with quality standards
- **MANDATORY**: Validate technical feasibility

### 3. AI System Architect
- System architecture design and component relationships
- Architecture decision records (ADRs)
- Technology stack decisions and trade-offs
- Cross-cutting architecture and API design
- **MANDATORY**: Ensure architecture supports quality requirements
- **MANDATORY**: Validate performance and security implications

### 4. AI Operations Engineer
- CI/CD pipeline with AI integration
- Security and compliance oversight
- Performance monitoring and optimization
- Production support and incident response
- **MANDATORY**: Implement security-first operations
- **MANDATORY**: Ensure all tools are properly configured

### 5. UX/Product Designer
- User experience design and research
- Design system creation and maintenance
- Accessibility and usability optimization
- AI-assisted prototyping and testing
- **MANDATORY**: Design for performance (<1s response times)
- **MANDATORY**: Ensure accessibility compliance

### 6. AI Quality Assurance Engineer
- AI-generated code quality validation
- Automated testing strategy and implementation
- Performance and security testing
- Test automation and continuous quality monitoring
- **MANDATORY**: Implement comprehensive test strategy
- **MANDATORY**: Ensure 100% quality gate compliance

---

## 📐 Architectural Principles
- **Schema-locked I/O**: All tool calls use JSON Schemas.
- **Diffs only**: Unified diffs, no full-file rewrites.
- **Deterministic builds**: `npm ci` and `uv --frozen` required in CI.
- **Pre-commit first**: Run secrets scans, linting, type checks, and tests locally before pushing.
- **Living knowledge**: `.md` rule packs evolve, lessons auto-update.
- **Safe automation**: Auto-commit allowed for low-risk paths, PRs required for high-risk (auth, billing, migrations).
- **Measured quality**: Code must meet A–F scorecard thresholds.

---

## 🛡 Security Standards
- **Secrets**: No secrets in repo. Pre-commit secrets scanning mandatory (Gitleaks/TruffleHog).
- **SCA**: OSV-Scanner (Node/TS) and pip-audit (Python) run pre-commit.
- **SAST**: Semgrep OWASP + LLM agent rules pre-commit.
- **Commit authenticity**: Signed commits required on protected branches.
- **Branch protection**: PRs required for high-risk directories.

---

## 🧑‍💻 Coding Standards

### General
- **Line budgets**: ≤400 lines per turn, ≤120 lines per file.
- **Tests with changes**: Every behavior change requires test updates.
- **Coverage on changed files**: ≥85% lines and branches.
- **Commits**: Use Conventional Commits + task metadata.
- **Style**: Enforced by Prettier (JS/TS) and Ruff format (Python).

### TypeScript / Node.js
- **Linting**: ESLint + `eslint-config-prettier`.
- **Typing**: `tsc --strict`, `strictNullChecks`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`.
- **Complexity**: ESLint complexity ≤10.
- **Tests**: Vitest with coverage thresholds on changed files.
- **Snapshots**: Only for stable data; large deltas blocked (>200 lines).

### Python
- **Linting**: Ruff (`E`, `F`, `I` rules).
- **Typing**: mypy with `--strict`.
- **Complexity**: Radon cyclomatic ≤10; maintainability index ≥70.
- **Tests**: pytest with `pytest-cov --cov-branch`; coverage ≥85% on changed files.
- **Randomization**: pytest-randomly with fixed seed.

---

## 🧪 Testing Strategy
- **Pre-commit quick tests**: Vitest (changed files), pytest fast run.
- **Coverage enforcement**: PRs blocked if coverage on changed files <85%.
- **Static scans**: Ruff, ESLint, mypy, tsc required before commit.
- **Snapshots**: Reviewed carefully, brittle or large snapshots not allowed.
- **Complexity & duplication**: ESLint complexity ≤10; Radon MI ≥70; duplication ≤5%.

---

## 📋 Pre-commit Policy
Pre-commit hooks run automatically on every commit using modern pre-commit tool:

- **Basic checks**: File validation, YAML, JSON, merge conflicts, trailing whitespace.
- **Code formatting**: Prettier for JavaScript, JSON, Markdown, YAML files.
- **Code quality**: ESLint with auto-fix for TypeScript files.
- **Type checking**: TypeScript compilation check for all TypeScript files.
- **Unit tests**: Full test suite runs on every commit.
- **Early quality check**: Comprehensive quality validation including coverage.
- **Security**: Gitleaks secrets scanning (when available).
- **Complexity check**: ESLint + Radon budgets enforced.
- **Snapshot guard**: Large deltas blocked.

---

## 🚦 Scorecard Dimensions
Each commit/PR is graded across six weighted dimensions:

- **Security (25%)**: No new critical/high vulns, no secret leaks.
- **Quality (20%)**: Focused diffs, tests with changes, readability.
- **Coverage (20%)**: ≥85% on changed files, both line & branch.
- **Complexity (15%)**: Cyclomatic ≤10, MI ≥70, duplication ≤5%.
- **Reproducibility (10%)**: Deterministic installs, frozen lockfiles.
- **Efficiency (10%)**: Single-turn success, low retry count, fast execution.

Grades: **A ≥90, B ≥80, C ≥70, D ≥60, F <60.**
PR merges are blocked on Security <C or Coverage <85%.

---

## ✅ Benefits
- **Security**: Shifts left with pre-commit scanning.
- **Quality**: Code review rules automated.
- **Efficiency**: Faster dev loop with local blocking of bad commits.
- **Reproducibility**: Frozen installs, parity runs.
- **Scalability**: Knowledge packs and lessons improve MCP itself.

---

## 🚨 Troubleshooting Guide

### Common Issues and Solutions

#### 1. Early Quality Check Failures
```bash
# Check specific quality issues
npm run qa:eslint      # ESLint issues
npm run qa:typescript  # TypeScript errors
npm run qa:format      # Formatting issues
npm run qa:tests       # Test failures
```

#### 2. Test Coverage Issues
- **Issue**: Coverage below 85% threshold
- **Solution**: Add missing tests or fix broken tests
- **Command**: `npm run test:coverage` to see detailed coverage report

#### 3. TypeScript Compilation Errors
- **Issue**: Type errors preventing build
- **Solution**: Fix type issues or add proper type annotations
- **Command**: `npm run type-check` to see specific errors

#### 4. Performance Issues
- **Issue**: Response times exceeding 1s target
- **Solution**: Profile code and optimize bottlenecks
- **Monitoring**: Check performance metrics in test output
- **Status**: ✅ All tools now <1s response time

#### 5. Security Scan Failures
- **Issue**: Critical vulnerabilities detected
- **Solution**: Update dependencies or fix security issues
- **Commands**:
  - `npm run security:scan` - Check for secrets
  - `npm run security:osv` - Check for vulnerabilities
  - `npm run security:semgrep` - Static analysis

### Emergency Procedures

#### Quick Fix Workflow
1. **Assess**: Run `npm run early-check` to identify issues
2. **Fix**: Address critical issues first (TypeScript, ESLint, tests)
3. **Validate**: Re-run quality checks
4. **Commit**: Only commit when all checks pass

#### Rollback Procedure
```bash
# If issues persist after commit
git log --oneline -5  # Check recent commits
git reset --hard HEAD~1  # Rollback last commit (if safe)
npm run early-check  # Verify clean state
```

### Development Environment Issues

#### Windows-Specific Issues
- **Bash not found**: Install Git Bash or WSL
- **Pre-commit hooks fail**: Use `git commit --no-verify` for emergency commits
- **Path issues**: Ensure Node.js and Python are in system PATH

#### Docker Issues
- **Container won't start**: Check Docker Desktop is running
- **Port conflicts**: Change ports in docker-compose.yml
- **Build failures**: Clear Docker cache and rebuild

### AI Tool Integration Issues

#### Cursor AI Not Responding
- Restart Cursor after configuration changes
- Check `.cursorrules` file is in project root
- Verify file is properly formatted

#### Claude Code Issues
- Ensure system prompt is loaded correctly
- Check file paths are correct
- Restart Claude Code session if needed

### Performance Optimization

#### Response Time Issues
- Profile individual tools for bottlenecks
- Check for unnecessary external API calls
- Optimize data processing algorithms
- Monitor memory usage and garbage collection

#### Test Performance
- Use `npm run test:changed` for faster feedback
- Optimize test setup and teardown
- Consider parallel test execution
