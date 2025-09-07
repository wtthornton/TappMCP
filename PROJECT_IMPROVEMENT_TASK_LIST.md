# Smart MCP Project Improvement Task List

## Overview
Simple, focused improvements to enhance code quality and performance without over-engineering. Focus on the most critical issues first.

## Success Metrics
- **Week 1**: Zero build errors, reduced console logging
- **Week 2**: Better type safety, cleaner error handling
- **Week 3**: Consolidated duplicate code, smaller files

---

## Week 1: Critical Fixes

### Task 1: Fix Import Issues (Day 1-2)
**Why**: Prevents runtime errors and build issues

- [ ] **1.1** Find all problematic imports
  ```bash
  grep -r "import.*\.js" src/ --include="*.ts"
  ```
- [ ] **1.2** Fix imports in main files
  - `src/server.ts` (9 .js imports)
  - `src/tools/smart-orchestrate-mcp.ts` (4 .js imports)
  - `src/tools/smart-finish-mcp.ts` (4 .js imports)
- [ ] **1.3** Test that everything builds
  ```bash
  npm run type-check
  npm run build
  ```

### Task 2: Clean Up Console Logging (Day 3-4)
**Why**: Improves performance and production readiness

- [ ] **2.1** Remove debug console.log statements
  - `src/server.ts` (3 statements)
  - `src/health-server.ts` (3 statements)
  - `src/core/mcp-coordinator.ts` (10 statements)
- [ ] **2.2** Keep only essential console.error for critical errors
- [ ] **2.3** Test that functionality still works

---

## Week 2: Code Quality

### Task 3: Fix Type Safety (Day 5-7)
**Why**: Prevents runtime errors and improves IDE support

- [ ] **3.1** Replace `any` types with proper types
  - `src/patterns/CodeReusePatternEngine.ts` (1 any)
  - `src/tools/smart-write-mcp.ts` (1 any)
  - `src/tools/smart-write.ts` (2 any)
- [ ] **3.2** Replace `unknown` types where possible
- [ ] **3.3** Test that types are working correctly

### Task 4: Improve Error Handling (Day 8-9)
**Why**: Better debugging and user experience

- [ ] **4.1** Standardize error handling in main files
  - `src/server.ts` (1 catch block)
  - `src/core/orchestration-engine.ts` (2 catch blocks)
- [ ] **4.2** Add proper error messages and context
- [ ] **4.3** Test error scenarios

---

## Week 3: Architecture Cleanup

### Task 5: Consolidate Duplicate Tools (Day 10-12)
**Why**: Reduces maintenance burden and confusion

- [ ] **5.1** Pick one version of each tool to keep
  - Keep `smart-plan-mcp.ts`, remove duplicates
  - Keep `smart-write-mcp.ts`, remove duplicates
  - Keep `smart-orchestrate-mcp.ts`, remove duplicates
- [ ] **5.2** Update imports and remove unused files
- [ ] **5.3** Test that all tools still work

### Task 6: Split Large Files (Day 13-14)
**Why**: Easier to maintain and understand

- [ ] **6.1** Split `PromptOptimizer.ts` (825+ lines)
  - Extract token budget logic
  - Extract template engine logic
- [ ] **6.2** Split `smart-finish-mcp.ts` (647+ lines)
  - Extract quality scorecard logic
  - Extract security scanning logic
- [ ] **6.3** Test that refactored code works

---

## Implementation Notes

### Simple Approach
- Focus on one task at a time
- Test after each change
- Don't over-engineer solutions
- Keep changes small and focused

### Quality Checks
- Run `npm run type-check` after each change
- Run `npm run test` to ensure nothing breaks
- Run `npm run build` to verify builds work

### Success Criteria
- **Week 1**: No build errors, fewer console statements
- **Week 2**: Better types, cleaner error handling
- **Week 3**: Less duplicate code, smaller files

---

## Progress Tracking

### Week 1
- [ ] Task 1: Fix Import Issues
- [ ] Task 2: Clean Up Console Logging

### Week 2
- [ ] Task 3: Fix Type Safety
- [ ] Task 4: Improve Error Handling

### Week 3
- [ ] Task 5: Consolidate Duplicate Tools
- [ ] Task 6: Split Large Files

---

**Total Time**: 3 weeks
**Focus**: Simple, practical improvements
**Goal**: Better code quality without over-engineering
