# AI-Augmented Developer Role

## 🎯 Purpose
This role defines the **AI-assisted development standards** for Smart MCP, ensuring code quality, security, and efficiency through AI tool integration and adherence to project guidelines.

---

## 📋 Responsibilities
- **Code Generation**: AI-assisted development using Cursor and Claude Code
- **Architecture Decisions**: System design following schema-locked I/O principles
- **Quality Assurance**: Code review and testing strategy implementation
- **Security Implementation**: Secure coding practices and vulnerability prevention
- **Performance Optimization**: Code and system performance tuning
- **AI Prompt Engineering**: Advanced prompt optimization techniques

---

## 🛠️ Skills Required

### Core Development
- **TypeScript/Node.js**: Proficiency with strict typing and modern patterns
- **AI Development Tools**: Advanced usage of Cursor AI and Claude Code
- **System Architecture**: MCP Protocol implementation and design patterns
- **Testing Methodologies**: Vitest, coverage requirements, and test automation

### AI-Specific Skills
- **AI Prompt Engineering**: Advanced prompt optimization techniques
- **MCP Protocol Expertise**: Model Context Protocol implementation
- **Performance Optimization**: Code and system performance tuning
- **Security Best Practices**: Secure coding and vulnerability assessment

---

## 📐 Architectural Standards
Following project-guidelines.md principles:

### Schema-Locked I/O
- All tool calls use JSON Schemas
- Unified diffs only, no full-file rewrites
- Deterministic builds with `npm ci`

### Code Quality Standards
- **Line Budgets**: ≤400 lines per turn, ≤120 lines per file
- **TypeScript Strict**: `tsc --strict`, `strictNullChecks`, `exactOptionalPropertyTypes`
- **Complexity**: ESLint complexity ≤10
- **Coverage**: ≥85% lines and branches on changed files

### Security Standards
- **Secrets**: No secrets in repo, pre-commit scanning mandatory
- **SCA**: OSV-Scanner for vulnerability detection
- **SAST**: Semgrep OWASP + LLM agent rules
- **Commit Authenticity**: Signed commits on protected branches

---

## 🧪 Testing Strategy
- **Pre-commit Tests**: Vitest on changed files with coverage enforcement
- **Coverage Requirements**: ≥85% on changed files, both line & branch
- **Static Scans**: ESLint, tsc required before commit
- **Complexity Checks**: ESLint complexity ≤10, duplication ≤5%

---

## 📊 Success Metrics
Aligned with project-guidelines.md scorecard:

### Security (25% weight)
- **Zero Critical Vulnerabilities**: No new critical/high vulnerabilities
- **No Secret Leaks**: Pre-commit secrets scanning passes
- **Security Score**: A-grade security compliance

### Quality (20% weight)
- **Code Quality**: Focused diffs, tests with changes, readability
- **Line Budgets**: ≤400 lines per turn, ≤120 lines per file
- **Complexity**: ESLint complexity ≤10

### Coverage (20% weight)
- **Test Coverage**: ≥85% on changed files, both line & branch
- **Coverage Enforcement**: PRs blocked if coverage <85%

### Complexity (15% weight)
- **Cyclomatic Complexity**: ≤10
- **Duplication**: ≤5%
- **Maintainability**: High readability scores

### Reproducibility (10% weight)
- **Deterministic Builds**: `npm ci` and frozen lockfiles
- **Parity Runs**: Consistent local and CI results

### Efficiency (10% weight)
- **Single-turn Success**: Low retry count, fast execution
- **AI Tool Effectiveness**: Measure AI-assisted productivity gains

**Grade Thresholds**: A ≥90, B ≥80, C ≥70, D ≥60, F <60

---

## 🤝 Collaboration Points
- **Product Strategist**: Feature requirements and business context
- **AI Operations Engineer**: Deployment readiness and infrastructure
- **UX/Product Designer**: Implementation details and user experience
- **AI Quality Assurance Engineer**: Test strategy and quality validation

---

## 🎯 AI Tool Usage

### Cursor AI
- **Real-time Code Completion**: TypeScript/Node.js development
- **Refactoring**: Code improvement and optimization
- **Debugging**: AI-assisted problem solving

### Claude Code
- **Multi-file Operations**: Complex architecture decisions
- **Code Generation**: AI-assisted development patterns
- **Analysis**: Code quality and security assessment

### Focus Areas
- **Performance**: Code and system optimization
- **Security**: Vulnerability prevention and secure coding
- **Maintainability**: Clean, readable, and well-tested code
- **Best Practices**: Adherence to project-guidelines.md standards

---

## 📁 Project Context
- **Technology Stack**: TypeScript/Node.js MCP server
- **Protocol**: Model Context Protocol implementation
- **Focus Areas**: Reliability, extensibility, and developer experience
- **Standards**: Full compliance with project-guidelines.md

---

## ✅ Deliverables
- **Clean, Maintainable Code**: Following strict TypeScript standards
- **Architecture Documentation**: Schema-locked I/O and design patterns
- **Code Review Reports**: Quality and security assessments
- **Test Coverage Reports**: ≥85% coverage on all changes
- **Performance Optimization**: Benchmarks and recommendations
- **Security Assessments**: Vulnerability-free code delivery
