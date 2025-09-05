# AI Developer Quick Reference Card

## 🚨 CRITICAL: Before Writing Any Code

```
DATA STRUCTURE CHECK:
- Read the expected output schema first
- Identify ALL required properties
- Create complete objects with every property
- No undefined values allowed

PERFORMANCE CHECK:
- Target: <100ms response time
- Use Promise.all for parallel operations
- Avoid blocking synchronous calls
- Cache expensive calculations

ERROR HANDLING CHECK:
- Every operation needs try/catch
- Return status: 'pass' | 'fail' | 'warning'
- Set hasErrors flag when errors occur
- Never silent failures

TYPE SAFETY CHECK:
- Use strict TypeScript typing
- No 'any' types in critical paths
- Validate inputs before processing
- Define proper interfaces
```

## 🔧 Common Patterns

### Complete Data Structure
```typescript
// ✅ GOOD: Complete structure
const response = {
  overall: { score: 85, grade: 'B', status: 'pass' },
  quality: { score: 90, grade: 'A', status: 'pass' },
  production: { score: 88, grade: 'B', status: 'pass' }
};
```

### Error Handling
```typescript
// ✅ GOOD: Explicit error handling
try {
  const result = await operation();
  return { ...result, status: 'pass', hasErrors: false };
} catch (error) {
  return { status: 'fail', hasErrors: true, error: error.message };
}
```

### Performance Optimization
```typescript
// ✅ GOOD: Parallel operations
const [result1, result2] = await Promise.all([
  operation1(),
  operation2()
]);
```

## 🧪 Test Patterns

```typescript
// ✅ GOOD: Complete validation
it('should return complete structure', async () => {
  const result = await functionUnderTest();

  expect(result.overall).toBeDefined();
  expect(result.quality).toBeDefined();
  expect(result.production).toBeDefined();
  expect(result.status).toMatch(/pass|fail|warning/);
});
```

## 🚨 Error Prevention

### AVOID:
- ❌ Incomplete object structures
- ❌ Silent error handling
- ❌ Missing type definitions
- ❌ Synchronous operations in main flow
- ❌ Undefined property access

### ALWAYS:
- ✅ Complete data structures
- ✅ Explicit error handling
- ✅ Strict TypeScript typing
- ✅ Parallel operations
- ✅ Property validation

## 🎯 Current Session Focus

**Fixing smart_finish tool issues:**
1. Missing `quality` and `production` properties
2. Performance >100ms (target: <100ms)
3. Status validation (expect 'pass'/'fail', getting 'warning')

**Action Plan:**
1. Read the QualityScorecard interface
2. Ensure all properties are present
3. Optimize performance with parallel operations
4. Fix status logic to return correct values
5. Write comprehensive tests
