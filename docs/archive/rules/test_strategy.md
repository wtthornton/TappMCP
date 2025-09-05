# Test Strategy

This document defines the testing strategy and standards for the Smart MCP project.

## Testing Philosophy

### Quality First
- Tests are written alongside code, not after
- All changes must include appropriate tests
- Test coverage requirements: ≥85% on changed files
- Focus on testing behavior, not implementation

### Test Pyramid
- **Unit Tests**: Fast, isolated tests for individual functions
- **Integration Tests**: Test component interactions
- **End-to-End Tests**: Test complete workflows
- **Performance Tests**: Validate performance requirements

## Testing Framework

### Primary Tools
- **Vitest**: Unit and integration testing with V8 coverage
- **TypeScript**: Type checking and validation with strict mode
- **ESLint**: Code quality and style checking with complexity limits
- **Pre-commit hooks**: Automated quality gates and security scanning
- **OSV-Scanner**: Dependency vulnerability scanning
- **Semgrep**: Static analysis security testing

### AI-Assisted Testing
- **Cursor AI**: Real-time test generation and debugging
- **Claude Code**: Test case analysis and optimization
- **Role-Based Testing**: Different roles focus on different test aspects
- **Automated Test Generation**: AI-assisted test case creation

### Test Structure
```
tests/
├── unit/           # Unit tests for individual functions
├── integration/    # Integration tests for components
├── e2e/           # End-to-end workflow tests
├── fixtures/      # Test data and fixtures
└── helpers/       # Test utilities and helpers
```

## Unit Testing

### Coverage Requirements
- **Line Coverage**: ≥85% on changed files
- **Branch Coverage**: ≥85% on changed files
- **Function Coverage**: 100% for public APIs
- **Statement Coverage**: ≥85% on changed files

### Test Standards
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Test both success and failure cases
- Use deterministic test data
- Mock external dependencies

### Example Structure
```typescript
describe('MCP Tool Handler', () => {
  describe('processRequest', () => {
    it('should process valid request successfully', () => {
      // Arrange
      const request = createValidRequest();

      // Act
      const result = processRequest(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe('success');
    });

    it('should reject invalid request', () => {
      // Arrange
      const request = createInvalidRequest();

      // Act & Assert
      expect(() => processRequest(request)).toThrow();
    });
  });
});
```

## Integration Testing

### Scope
- Test MCP tool interactions
- Validate schema compliance
- Test error handling and recovery
- Verify logging and monitoring

### Test Data
- Use realistic test data
- Include edge cases and boundary conditions
- Test with various input sizes and types
- Validate output schemas

## Security Testing

### Vulnerability Scanning
- **OSV-Scanner**: Dependency vulnerability scanning
- **Semgrep**: Static analysis security testing
- **Gitleaks**: Secret detection and prevention
- **SAST**: Source code security analysis

### Security Test Cases
- Input validation and sanitization
- Authentication and authorization
- Data encryption and protection
- Error handling and information disclosure

## Performance Testing

### Metrics
- Response time: <100ms for typical operations
- Throughput: Handle expected load
- Memory usage: Monitor for leaks
- CPU utilization: Efficient resource usage

### Test Scenarios
- Load testing with expected traffic
- Stress testing beyond normal limits
- Endurance testing for stability
- Spike testing for traffic variations

## Test Automation

### Pre-commit Hooks
- Run unit tests on changed files
- Execute linting and type checking
- Perform security scans
- Validate test coverage

### CI/CD Pipeline
- Full test suite on all changes
- Performance regression testing
- Security vulnerability scanning
- Test coverage reporting

## Test Data Management

### Fixtures
- Use consistent test data
- Include various scenarios and edge cases
- Maintain test data separately from code
- Version control test data changes

### Mocking
- Mock external services and APIs
- Use deterministic mock responses
- Test error conditions with mocks
- Avoid mocking internal dependencies

## Quality Gates

### Pre-commit Requirements
- All tests must pass
- Coverage requirements met
- No linting errors
- No security vulnerabilities

### CI/CD Requirements
- Full test suite passes
- Performance benchmarks met
- Security scans clean
- Documentation updated

## Test Maintenance

### Regular Tasks
- Update tests when requirements change
- Refactor tests for better maintainability
- Remove obsolete tests
- Add tests for new features

### Best Practices
- Keep tests simple and focused
- Use meaningful test names
- Avoid test interdependencies
- Document complex test scenarios

## 🚨 Test Troubleshooting

### Common Test Issues

#### 1. Test Failures
```bash
# Run specific test file
npm run test src/tools/smart_write.test.ts

# Run with verbose output
npm run test -- --reporter=verbose

# Run with coverage
npm run test:coverage
```

#### 2. Coverage Issues
- **Issue**: Coverage below 85% threshold
- **Solution**: Add missing tests or fix broken tests
- **Command**: `npm run test:coverage` to see detailed report

#### 3. Performance Test Failures
- **Issue**: Response times exceeding 100ms
- **Solution**: Profile and optimize slow operations
- **Monitoring**: Check performance metrics in test output

#### 4. Integration Test Issues
- **Issue**: MCP service timeouts
- **Solution**: Check external service availability
- **Fallback**: Use mock services for testing

### AI-Assisted Test Debugging

#### Cursor AI
- Use "you are now a qa engineer" for test-focused assistance
- Leverage real-time error detection and fixing
- Generate test cases for new functionality

#### Claude Code
- Load with system prompt for test analysis
- Use role switching for different test aspects
- Analyze test coverage and suggest improvements

### Test Generation Patterns

#### Unit Test Generation
```typescript
// AI can generate comprehensive unit tests
describe('Function Name', () => {
  it('should handle valid input', () => {
    // AI-generated test case
  });
  
  it('should handle invalid input', () => {
    // AI-generated error case
  });
  
  it('should handle edge cases', () => {
    // AI-generated edge case
  });
});
```

#### Integration Test Generation
```typescript
// AI can generate integration test workflows
describe('Tool Integration', () => {
  it('should complete full workflow', async () => {
    // AI-generated end-to-end test
  });
});
```

### Quality Metrics

#### Test Coverage Targets
- **Line Coverage**: ≥85% on changed files
- **Branch Coverage**: ≥85% on changed files
- **Function Coverage**: 100% for public APIs
- **Statement Coverage**: ≥85% on changed files

#### Performance Targets
- **Response Time**: <100ms for all tools
- **Test Execution**: <30 seconds for full suite
- **Memory Usage**: <500MB during testing
- **CPU Usage**: <80% during testing
