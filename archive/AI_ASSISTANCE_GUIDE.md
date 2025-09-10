# 🤖 AI Assistance Guide for TappMCP

This guide helps AI assistants understand the current state of TappMCP and work effectively with the codebase.

## 🎯 **Current Project Status**

### ✅ **Fully Operational**
- **Health Check**: All systems operational
- **Test Coverage**: 879/879 tests passing (≥85% coverage)
- **Code Quality**: ESLint, TypeScript, formatting all clean
- **Docker Deployment**: Production-ready container running
- **MCP Server**: All tools available and functional

### 🚀 **Latest Enhancements Completed**
- **Existing Project Analysis**: Analyze and improve existing codebases
- **Enhanced Tool Parameters**: New modes for analysis, improvement, and modification
- **Test Architecture Overhaul**: Proper unit/integration test separation
- **Performance Optimizations**: <100ms response times maintained
- **Security Enhancements**: Zero critical vulnerabilities

## 🛠️ **Available MCP Tools**

### smart-begin
**Purpose**: Initialize new projects or analyze existing projects
**New Features**:
- `mode`: 'new-project' | 'analyze-existing'
- `existingProjectPath`: Path to existing project
- `analysisDepth`: 'quick' | 'standard' | 'deep'
- `externalSources`: Control Context7 and web search usage

### smart-plan
**Purpose**: Generate implementation plans with improvement support
**New Features**:
- `improvementMode`: 'enhancement' | 'refactoring' | 'optimization'
- `targetQualityLevel`: 'basic' | 'standard' | 'enterprise' | 'production'
- `preserveExisting`: Maintain existing functionality

### smart-write
**Purpose**: Write, modify, or enhance code with safety features
**New Features**:
- `writeMode`: 'create' | 'modify' | 'enhance'
- `backupOriginal`: Automatic backup before modification
- `modificationStrategy`: 'in-place' | 'side-by-side' | 'backup-first'

### smart-finish
**Purpose**: Complete projects with quality assurance
**Features**: Quality gates, test coverage, business value calculation

### smart-orchestrate
**Purpose**: Coordinate complex multi-step workflows
**Features**: Role-based orchestration, parallel execution, performance metrics

## 🧪 **Testing Architecture**

### Test Types
- **Unit Tests**: Test individual components in isolation (mocked dependencies)
- **Integration Tests**: Test component interactions (mocked external services)
- **End-to-End Tests**: Test complete workflows (real external services)

### Key Test Files
- `src/brokers/context7-broker.test.ts` - Unit tests for mock behavior
- `src/brokers/context7-broker-integration.test.ts` - Integration tests for real logic
- `src/brokers/context7-broker-real.test.ts` - Legacy tests (backward compatibility)

### Running Tests
```bash
# All tests
npm test

# Specific test types
npm test -- --grep "Unit Tests"
npm test -- --grep "Integration Tests"

# Coverage
npm run test:coverage

# Quality check
npm run early-check
```

## 🐳 **Docker Deployment**

### Current Status
- **Container**: `tappmcp-smart-mcp-1` (healthy)
- **Ports**: 8080 (MCP Server), 8081 (Health Server)
- **Health Endpoint**: http://localhost:8081/health

### Commands
```bash
# Rebuild and deploy
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check status
docker ps
docker logs tappmcp-smart-mcp-1
```

## 📊 **Quality Standards**

### Code Quality
- **TypeScript**: Strict mode enabled
- **ESLint**: Complexity ≤10, all rules enforced
- **Prettier**: Code formatting enforced
- **Coverage**: ≥85% lines and branches

### Performance
- **Response Time**: <100ms for tool execution
- **Memory Usage**: Optimized for large projects
- **Error Rate**: <5% for valid inputs

### Security
- **Vulnerabilities**: Zero critical issues
- **Dependencies**: All up to date
- **Secrets**: No secrets in repository

## 🔧 **Development Workflow**

### Before Starting Work
1. **Run Early Check**: `npm run early-check` - MUST PASS
2. **Confirm Role**: State your role explicitly
3. **Validate Environment**: Ensure all tools are ready
4. **Follow TDD**: Write tests before implementing features

### During Development
1. **Use TypeScript Strict**: Explicit types, no implicit any
2. **Write Tests**: Unit tests for new functionality
3. **Check Quality**: Run linting and formatting
4. **Test Changes**: Ensure all tests still pass

### Before Committing
1. **Run Full QA**: `npm run qa:all`
2. **Format Code**: `npm run format`
3. **Check Coverage**: Ensure ≥85% coverage
4. **Verify Performance**: Response times <100ms

## 🚨 **Common Issues & Solutions**

### Test Failures
- **Context7 Issues**: Use `externalSources: { useContext7: false }` for faster tests
- **Timing Issues**: Increase timeouts for performance tests
- **Mock Issues**: Ensure proper test isolation

### Docker Issues
- **Container Not Starting**: Check logs with `docker logs tappmcp-smart-mcp-1`
- **Port Conflicts**: Ensure ports 8080 and 8081 are available
- **Build Failures**: Use `--no-cache` flag for clean rebuilds

### Code Quality Issues
- **TypeScript Errors**: Ensure strict mode compliance
- **ESLint Errors**: Run `npm run lint:fix`
- **Formatting Issues**: Run `npm run format`

## 📚 **Key Documentation Files**

- **README.md**: Project overview and quick start
- **docs/API.md**: Complete API reference with new parameters
- **docs/DEVELOPMENT.md**: Development guidelines and standards
- **tests/TESTING.md**: Testing architecture and best practices
- **CLAUDE.md**: Role-based AI assistance configuration

## 🎯 **Best Practices for AI Assistance**

### When Working with TappMCP
1. **Always run early-check first** - ensures project is healthy
2. **Use proper test separation** - unit vs integration vs E2E
3. **Leverage existing code** - don't reinvent what's already working
4. **Follow quality standards** - maintain ≥85% coverage and <100ms response times
5. **Test changes thoroughly** - ensure all 879 tests still pass

### When Adding Features
1. **Extend existing tools** rather than creating new ones
2. **Use the new parameters** (mode, analysisDepth, etc.) for enhanced functionality
3. **Maintain backward compatibility** with existing tool usage
4. **Add proper tests** for new functionality
5. **Update documentation** to reflect changes

### When Debugging Issues
1. **Check test output** for specific error messages
2. **Use proper test types** - unit tests for mock behavior, integration for real logic
3. **Verify external sources** - Context7 and web search can be disabled for faster testing
4. **Check Docker logs** for deployment issues
5. **Run health checks** to verify system status

## 🚀 **Next Steps for Enhancement**

### Potential Improvements
- **Additional Analysis Modes**: More sophisticated project analysis
- **Enhanced Quality Metrics**: More detailed quality scoring
- **Better Error Recovery**: Improved fallback mechanisms
- **Performance Optimization**: Further response time improvements
- **Extended Tool Integration**: More seamless tool interactions

### Maintenance Tasks
- **Regular Dependency Updates**: Keep packages current
- **Test Coverage Monitoring**: Maintain ≥85% coverage
- **Performance Monitoring**: Track response times
- **Security Scanning**: Regular vulnerability assessments
- **Documentation Updates**: Keep docs current with changes

---

**Last Updated**: September 2025
**Status**: ✅ Fully Operational
**Test Status**: 879/879 tests passing
**Docker Status**: ✅ Healthy and running
