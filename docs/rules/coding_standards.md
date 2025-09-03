# Coding Standards

This document defines the coding standards and best practices for the Smart MCP project.

## TypeScript Standards

### Strict Mode Configuration
- Use `tsc --strict` for maximum type safety
- Enable `strictNullChecks` and `exactOptionalPropertyTypes`
- No implicit any types allowed

### Code Style
- Use meaningful variable and function names
- Prefer const over let, avoid var
- Use arrow functions for callbacks and short functions
- Use template literals for string interpolation

### Type Definitions
- Define explicit interfaces for all data structures
- Use union types for controlled variations
- Avoid any type, use unknown when necessary
- Use generic types for reusable components

## Node.js Standards

### Module System
- Use ES modules (import/export) syntax
- Prefer named exports over default exports
- Use barrel exports for clean imports

### Error Handling
- Use try-catch blocks for async operations
- Create custom error classes for specific error types
- Always handle promise rejections
- Log errors with appropriate context

### Async/Await
- Prefer async/await over Promise chains
- Use Promise.all() for parallel operations
- Handle errors appropriately in async functions

## Code Organization

### File Structure
- One main export per file
- Group related functionality together
- Use clear, descriptive file names
- Follow consistent directory structure

### Function Design
- Keep functions small and focused (≤50 lines)
- Use pure functions when possible
- Avoid side effects in utility functions
- Document complex algorithms

### Class Design
- Use composition over inheritance
- Keep classes focused on single responsibility
- Use dependency injection for testability
- Implement proper encapsulation

## Documentation Standards

### Code Comments
- Document public APIs with JSDoc
- Explain complex business logic
- Use TODO comments for temporary workarounds
- Remove commented-out code

### README Files
- Include setup and usage instructions
- Document configuration options
- Provide examples and use cases
- Keep documentation up-to-date

## Testing Standards

### Test Structure
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Test both success and failure cases
- Mock external dependencies

### Coverage Requirements
- Maintain ≥85% test coverage on changed files
- Test all public methods and functions
- Include integration tests for critical paths
- Use deterministic test data

## Security Standards

### Input Validation
- Validate all inputs against schemas
- Sanitize user inputs
- Use parameterized queries
- Implement rate limiting

### Secret Management
- Never commit secrets to repository
- Use environment variables for configuration
- Implement proper secret rotation
- Audit secret usage regularly

## Performance Standards

### Optimization Guidelines
- Profile code before optimizing
- Use efficient algorithms and data structures
- Minimize memory allocations
- Cache expensive operations

### Monitoring
- Implement performance metrics
- Use structured logging
- Monitor resource usage
- Set up alerting for performance issues