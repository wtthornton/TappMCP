# Smart MCP — Project Guidelines

## 🎯 Purpose
This document defines the **rules and standards** for building and maintaining Smart MCP.
It provides a single reference for **developers, architects, and testers** to ensure quality, security, and efficiency at every stage.

---

## 🎭 Role-Based Development
Smart MCP implements **6 specialized AI roles** for comprehensive development coverage:

### 1. AI-Augmented Developer (Default)
- Code generation, refactoring, and debugging
- Architecture decisions and system design
- Performance optimization and security
- Testing strategies and implementation

### 2. Product Strategist
- Product vision and roadmap definition
- User story creation and acceptance criteria
- Market research and competitive analysis
- Stakeholder communication

### 3. AI System Architect
- System architecture design and component relationships
- Architecture decision records (ADRs)
- Technology stack decisions and trade-offs
- Cross-cutting architecture and API design

### 4. AI Operations Engineer
- CI/CD pipeline with AI integration
- Security and compliance oversight
- Performance monitoring and optimization
- Production support and incident response

### 5. UX/Product Designer
- User experience design and research
- Design system creation and maintenance
- Accessibility and usability optimization
- AI-assisted prototyping and testing

### 6. AI Quality Assurance Engineer
- AI-generated code quality validation
- Automated testing strategy and implementation
- Performance and security testing
- Test automation and continuous quality monitoring

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
Pre-commit hooks must run automatically inside Cursor/IDE:

- **Secrets scanning**: Gitleaks/TruffleHog.
- **Vulnerability scanning**: OSV-Scanner + pip-audit.
- **Semgrep**: OWASP + LLM rules.
- **Linters**: Ruff, ESLint.
- **Formatters**: Prettier, Ruff format.
- **Type-checks**: mypy, tsc.
- **Unit tests**: Vitest & pytest on changed files.
- **Coverage check**: ≥85% required on changed files.
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
