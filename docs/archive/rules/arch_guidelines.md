# Architecture Guidelines

This document defines the architectural principles and guidelines for the Smart MCP project.

## Core Principles

### 1. Schema-Locked I/O
- All tool calls use JSON Schemas for input/output validation
- Non-conformant outputs are rejected automatically
- Ensures consistent and predictable tool behavior

### 2. Diffs Only
- Generate unified diffs, not full-file rewrites
- Minimize changes to reduce review complexity
- Focus on specific, targeted modifications

### 3. Deterministic Builds
- Use `npm ci` for consistent dependency installation
- Frozen dependencies in CI/CD pipelines
- Reproducible builds across environments

### 4. Pre-commit First
- Security scans, linting, type checks, and tests run before commits
- Catch issues early in the development process
- Maintain code quality and security standards

### 5. Living Knowledge
- Documentation evolves with the project
- Lessons learned are captured and applied
- Continuous improvement of processes and practices

## Architecture Patterns

### MCP Server Architecture
- Modular tool handlers with clear separation of concerns
- Event-driven architecture for tool interactions
- Dependency injection for testability and maintainability

### AI Integration
- Role-based AI assistance with clear boundaries
- Natural language role switching
- Consistent behavior across AI tools (Cursor AI, Claude Code)

### Security Architecture
- Defense-in-depth security approach
- No secrets in repository
- Comprehensive vulnerability scanning and management

## Design Decisions

### Technology Choices
- **TypeScript/Node.js**: Type safety and modern JavaScript features
- **Docker**: Consistent Linux runtime environment
- **JSON Schemas**: Structured data validation and contracts

### Quality Standards
- Line budgets: ≤400 lines per turn, ≤120 lines per file
- Test coverage: ≥85% on changed files
- Complexity limits: ESLint complexity ≤10

## Implementation Guidelines

### Code Organization
- Clear separation between core, tools, brokers, memory, and sandbox
- Consistent naming conventions and file structure
- Proper abstraction layers and interfaces
- Modular design with clear dependencies

### Error Handling
- Comprehensive error handling and logging
- Graceful degradation and recovery
- Clear error messages and debugging information
- Structured error responses with proper HTTP status codes

### Performance
- Optimize for <100ms response times
- Efficient resource utilization
- Scalable architecture for growth
- Memory management and garbage collection optimization

## 🔧 AI-Assisted Development

### Cursor AI Integration
- Real-time code analysis and suggestions
- Automatic error detection and fixing
- Intelligent code completion and refactoring
- Performance optimization recommendations

### Claude Code Integration
- Role-based development assistance
- Architecture pattern recommendations
- Code review and quality assessment
- Documentation generation and maintenance

### Development Workflow
1. **Planning**: Use AI to analyze requirements and design solutions
2. **Implementation**: Leverage AI for code generation and optimization
3. **Testing**: AI-assisted test generation and debugging
4. **Review**: AI-powered code review and quality assessment
5. **Deployment**: AI-guided deployment and monitoring

## 📊 Quality Metrics

### Performance Targets
- **Response Time**: <100ms for all MCP tools
- **Throughput**: Handle expected concurrent requests
- **Memory Usage**: <500MB under normal load
- **CPU Usage**: <80% under normal load

### Reliability Targets
- **Uptime**: 99.9% availability
- **Error Rate**: <0.1% of requests
- **Recovery Time**: <30 seconds for failures
- **Data Integrity**: 100% data consistency

### Security Targets
- **Vulnerabilities**: Zero critical vulnerabilities
- **Secrets**: No secrets in repository
- **Access Control**: Proper authentication and authorization
- **Data Protection**: Encryption at rest and in transit
