# Development Guide

## Setup

```bash
# Clone repository
git clone https://github.com/your-org/tappmcp.git
cd tappmcp

# Install dependencies
npm ci

# Run development server
npm run dev
```

## Development Workflow

### 1. Before Starting
```bash
# Run early quality check
npm run early-check

# Install pre-commit hooks
npm run pre-commit:install
```

### 2. Development
```bash
# Start dev server with watch mode
npm run dev

# Run tests in watch mode
npm run test:watch

# Check TypeScript types
npm run type-check
```

### 3. Before Committing
```bash
# Run all quality checks
npm run qa:all

# Format code
npm run format

# Lint and fix
npm run lint
```

## Code Standards

### TypeScript
- Strict mode enabled
- No implicit any
- Explicit return types
- Proper error handling

### Testing
- Minimum 85% coverage
- Unit tests for all functions
- Integration tests for workflows
- Use Vitest framework

### Example Test
```typescript
import { describe, it, expect } from 'vitest';

describe('MyFunction', () => {
  it('should handle valid input', () => {
    const result = myFunction('valid');
    expect(result).toBe(expected);
  });
});
```

## Project Structure

```
src/
├── tools/          # MCP tool implementations
├── core/           # Core business logic
├── framework/      # MCP framework components
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── server.ts       # Main server entry point
```

## Quality Gates

- ESLint complexity ≤10
- Test coverage ≥85%
- TypeScript strict mode
- No security vulnerabilities
- Response time <100ms

## Debugging

```bash
# Run specific test
npx vitest run src/tools/smart-begin.test.ts

# Debug with Node inspector
node --inspect npm run dev

# Check coverage report
npm run test:coverage
open coverage/index.html
```

## Common Issues

### Windows Development
- Use WSL2 or Git Bash
- Line ending issues: configure git with `autocrlf=true`

### Test Failures
- Clear cache: `rm -rf node_modules/.vite`
- Reinstall: `rm -rf node_modules && npm ci`

### TypeScript Errors
- Check tsconfig.json strict settings
- Ensure all callbacks have explicit types