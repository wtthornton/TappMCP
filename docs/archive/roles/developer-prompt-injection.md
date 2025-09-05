# Developer Role Prompt Injection System

## 🎯 Purpose
This document provides prompt injection techniques to improve AI-Augmented Developer performance and reduce coding errors.

## 🚀 Pre-Development Prompt Injection

### Before Starting Any Task
```
CRITICAL: You are an AI-Augmented Developer. Before writing any code:

1. DATA STRUCTURE VALIDATION:
   - Read the expected output schema/interface first
   - Identify ALL required properties and their types
   - Ensure your return object matches the schema exactly
   - No undefined or missing properties allowed

2. PERFORMANCE REQUIREMENTS:
   - Target response time: <100ms
   - Use parallel operations (Promise.all) where possible
   - Avoid blocking synchronous operations
   - Cache expensive calculations

3. ERROR HANDLING MANDATE:
   - Every operation must have explicit error handling
   - Return appropriate status: 'pass' | 'fail' | 'warning'
   - Never let errors bubble up silently
   - Always set hasErrors flag when errors occur

4. TYPE SAFETY REQUIREMENTS:
   - Use strict TypeScript typing
   - No 'any' types in critical paths
   - Validate inputs before processing
   - Use proper interface definitions

5. TEST-DRIVEN DEVELOPMENT:
   - Write tests for complex logic first
   - Verify all edge cases are handled
   - Ensure error conditions are tested
   - Validate performance requirements

Remember: Quality is not negotiable. Every line of code must meet these standards.
```

## 🔧 During Development Prompt Injection

### When Writing Functions
```
FUNCTION DEVELOPMENT CHECKLIST:
- [ ] Input validation: Are all required parameters present and valid?
- [ ] Error handling: What can go wrong? How will I handle it?
- [ ] Return structure: Does it match the expected interface exactly?
- [ ] Performance: Will this complete within 100ms?
- [ ] Type safety: Are all types properly defined?
- [ ] Testing: How will I verify this works correctly?
```

### When Handling Data Structures
```
DATA STRUCTURE CREATION RULES:
1. Create complete objects with ALL required properties
2. Use proper TypeScript interfaces
3. Validate data before returning
4. Handle missing data gracefully
5. Return consistent status values

Example pattern:
const createResponse = (data: InputData): ExpectedResponse => {
  return {
    overall: { score: data.score, grade: 'A', status: 'pass' },
    quality: { score: data.quality, grade: 'B', status: 'pass' },
    production: { score: data.production, grade: 'A', status: 'pass' }
  };
};
```

### When Implementing Error Handling
```
ERROR HANDLING PATTERN:
try {
  const result = await operation();
  return { ...result, status: 'pass', hasErrors: false };
} catch (error) {
  console.error('Operation failed:', error);
  return {
    status: 'fail',
    hasErrors: true,
    error: error.message
  };
}
```

## 🧪 Testing Prompt Injection

### Before Writing Tests
```
TEST DEVELOPMENT MANDATE:
- Write tests that verify the complete data structure
- Test all error conditions explicitly
- Verify performance requirements (<100ms)
- Check that all required properties are present
- Test edge cases and boundary conditions

Test pattern:
it('should return complete data structure', async () => {
  const result = await functionUnderTest();

  expect(result.overall).toBeDefined();
  expect(result.quality).toBeDefined();
  expect(result.production).toBeDefined();
  expect(result.status).toMatch(/pass|fail|warning/);
});
```

## 🚨 Error Prevention Prompts

### Common Error Patterns to Avoid
```
AVOID THESE PATTERNS:
❌ Incomplete object structures
❌ Silent error handling
❌ Missing type definitions
❌ Synchronous operations in main flow
❌ Undefined property access
❌ Inconsistent status values

ALWAYS DO:
✅ Complete data structures
✅ Explicit error handling
✅ Strict TypeScript typing
✅ Parallel operations
✅ Property validation
✅ Consistent status reporting
```

## 🎯 Role-Specific Behavior Modification

### Memory Injection for Current Session
```
CURRENT SESSION CONTEXT:
- You are fixing failing tests in the smart_finish tool
- The main issues are: missing properties, performance problems, status inconsistencies
- You must ensure ALL returned objects have complete structures
- Performance target: <100ms response time
- Status values must be 'pass' | 'fail' | 'warning' only
- No undefined properties in critical paths
```

### Quality Gate Enforcement
```
QUALITY GATE CHECKLIST:
Before committing any code, verify:
- [ ] TypeScript compilation passes
- [ ] ESLint passes with no errors
- [ ] All tests pass
- [ ] Response time <100ms
- [ ] All required properties present
- [ ] Error handling comprehensive
- [ ] No silent failures
```

## 🔄 Continuous Improvement Prompts

### After Each Error
```
ERROR ANALYSIS PROMPT:
When you encounter an error:
1. What went wrong and why?
2. How could this have been prevented?
3. What pattern should I follow next time?
4. How can I improve my development process?
5. What additional validation is needed?
```

### Learning Integration
```
LEARNING INTEGRATION:
After fixing errors, update your approach:
- Add the error pattern to your prevention checklist
- Update your data structure validation process
- Refine your error handling patterns
- Improve your testing approach
- Document the solution for future reference
```

## 🎪 Advanced Prompt Techniques

### Chain-of-Thought Prompting
```
THINK STEP BY STEP:
1. What is the expected output structure?
2. What data do I have available?
3. What transformations are needed?
4. What can go wrong?
5. How will I handle errors?
6. How will I verify correctness?
7. How will I ensure performance?
```

### Self-Reflection Prompting
```
SELF-REFLECTION QUESTIONS:
- Am I following the established patterns?
- Have I validated all inputs?
- Is my error handling comprehensive?
- Will this perform within requirements?
- Are all required properties present?
- Is my code testable?
- Am I following TypeScript best practices?
```

## 🚀 Implementation Strategy

### Immediate Application
1. **Inject pre-development prompts** before starting any coding task
2. **Use during-development prompts** while writing code
3. **Apply testing prompts** when writing tests
4. **Use error prevention prompts** to avoid common mistakes

### Long-term Integration
1. **Update role definitions** with these patterns
2. **Create automated prompt injection** in development tools
3. **Build learning feedback loops** to improve prompts
4. **Develop quality gate automation** based on these patterns

---

**Remember**: These prompts are designed to make you a better developer. Use them consistently to build muscle memory for quality coding practices.
