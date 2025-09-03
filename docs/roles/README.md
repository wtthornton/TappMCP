# Role-Based Development with AI Tools

This directory contains comprehensive role definitions for AI-assisted development with the Smart MCP project, all aligned with project-guidelines.md standards.

## 🎯 Role Structure

### Core Roles (5-Role Structure)
1. **AI-Augmented Developer** (`ai-augmented-developer.md`)
   - Primary development role with AI tool integration
   - Code generation, architecture, and quality assurance
   - Full compliance with project-guidelines.md standards

2. **Product Strategist** (`product-strategist.md`)
   - Product vision, roadmap, and stakeholder management
   - Business analysis and market research
   - Quality-aligned product decisions

3. **AI Operations Engineer** (`ai-operations-engineer.md`)
   - DevOps, security, and production deployment
   - CI/CD and infrastructure management
   - Security-first operations approach

4. **UX/Product Designer** (`ux-product-designer.md`)
   - User experience and interface design
   - Design system and accessibility compliance
   - Developer experience optimization

5. **AI Quality Assurance Engineer** (`ai-quality-assurance-engineer.md`)
   - Comprehensive quality assurance and testing
   - AI tool validation and effectiveness assessment
   - Security and performance testing

## 🚀 Usage Instructions

### Natural Language Role Switching
Use natural language commands to switch between roles in both Cursor AI and Claude Code:

```bash
# Developer role triggers
"you are now a developer" or "switch to developer"

# Product role triggers  
"you are now a product strategist" or "switch to product"

# Operations role triggers
"you are now an operations engineer" or "switch to operations"

# Designer role triggers
"you are now a designer" or "switch to designer"

# QA role triggers
"you are now a qa engineer" or "switch to qa"
```

### Unified Configuration
- **Single `.cursorrules` file**: Contains all role definitions and switching logic
- **Claude Code integration**: System prompt enables role switching
- **No file copying**: Natural language switching eliminates manual file management

### Role-Specific AI Behavior
Each role configures AI tools to:
- **Focus on role priorities**: Aligned with project-guidelines.md standards
- **Use appropriate context**: Role-specific terminology and approaches
- **Provide relevant assistance**: Tailored to role responsibilities
- **Maintain quality standards**: Consistent adherence to project guidelines

## 📐 project-guidelines.md Alignment

All roles are fully aligned with project-guidelines.md standards:

### Architectural Principles
- **Schema-locked I/O**: All tool calls use JSON Schemas
- **Diffs only**: Unified diffs, no full-file rewrites
- **Deterministic builds**: `npm ci` and frozen dependencies
- **Pre-commit first**: Security scans, linting, type checks, and tests

### Security Standards
- **Secrets management**: No secrets in repo, mandatory scanning
- **Vulnerability scanning**: OSV-Scanner and pip-audit integration
- **SAST integration**: Semgrep OWASP + LLM agent rules
- **Commit authenticity**: Signed commits on protected branches

### Quality Standards
- **Line budgets**: ≤400 lines per turn, ≤120 lines per file
- **Test coverage**: ≥85% lines and branches on changed files
- **Complexity limits**: ESLint complexity ≤10, duplication ≤5%
- **Performance targets**: <100ms response time

### Scorecard Alignment
All roles use the same 6-dimensional scorecard:
- **Security (25%)**: Zero critical vulnerabilities, no secret leaks
- **Quality (20%)**: Focused diffs, tests with changes, readability
- **Coverage (20%)**: ≥85% on changed files, both line & branch
- **Complexity (15%)**: Cyclomatic ≤10, MI ≥70, duplication ≤5%
- **Reproducibility (10%)**: Deterministic installs, frozen lockfiles
- **Efficiency (10%)**: Single-turn success, low retry count

**Grade Thresholds**: A ≥90, B ≥80, C ≥70, D ≥60, F <60

## 📁 File Structure
```
docs/roles/
├── README.md (this file)
├── ai-augmented-developer.md
├── product-strategist.md
├── ai-operations-engineer.md
├── ux-product-designer.md
└── ai-quality-assurance-engineer.md

Project root:
├── .cursorrules (unified role configuration)
├── claude-system-prompt.md (Claude Code integration)
└── project-guidelines.md (project standards)
```

## ✅ Benefits
- **Unified Standards**: All roles aligned with project-guidelines.md
- **Natural Language Switching**: Easy role transitions without file management
- **Comprehensive Coverage**: 5-role structure covers all SDLC aspects
- **Quality Integration**: Every role supports technical excellence
- **AI Tool Optimization**: Roles designed for AI-assisted development
- **Consistent Behavior**: AI tools understand role context and standards

## 🎯 Best Practices
1. **Start each session** by setting the appropriate role context
2. **Follow project-guidelines.md** standards in all role activities
3. **Use natural language** for role switching
4. **Maintain quality standards** across all role responsibilities
5. **Leverage AI tools** effectively for role-specific tasks
6. **Collaborate across roles** to ensure comprehensive coverage
