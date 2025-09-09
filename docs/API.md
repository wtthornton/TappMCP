# API Reference

## MCP Tools

### smart-begin
Initialize projects with comprehensive planning.

**Input:**
```typescript
{
  request: string;  // Project description (min: 10 chars)
  options?: {
    includeArchitecture?: boolean;
    includeTechnicalSpecs?: boolean;
    includeBusinessContext?: boolean;
  }
}
```

**Output:**
```typescript
{
  success: boolean;
  projectName: string;
  architecture: object;
  technicalSpecs: object;
  businessContext: object;
}
```

### smart-plan
Generate detailed implementation plans.

**Input:**
```typescript
{
  task: string;     // Task description
  context?: object; // Optional context from smart-begin
}
```

**Output:**
```typescript
{
  success: boolean;
  plan: {
    steps: string[];
    timeline: string;
    dependencies: string[];
  }
}
```

### smart-write
Write production-ready code.

**Input:**
```typescript
{
  specification: string;
  language?: string;
  framework?: string;
}
```

**Output:**
```typescript
{
  success: boolean;
  code: string;
  tests: string;
  documentation: string;
}
```

### smart-finish
Complete projects with quality checks.

**Input:**
```typescript
{
  projectPath: string;
  includeTests?: boolean;
  includeDocs?: boolean;
}
```

**Output:**
```typescript
{
  success: boolean;
  qualityScore: number;
  testResults: object;
  documentation: string;
}
```

### smart-orchestrate
Coordinate multi-step workflows.

**Input:**
```typescript
{
  workflow: string;
  steps: string[];
  parallel?: boolean;
}
```

**Output:**
```typescript
{
  success: boolean;
  results: object[];
  executionTime: number;
}
```

## Error Handling

All tools return standardized error responses:

```typescript
{
  success: false;
  error: string;
  code: 'VALIDATION_ERROR' | 'SYSTEM_ERROR' | 'BUSINESS_LOGIC_ERROR';
  context?: object;
}
```

## Response Times

Target performance metrics:
- Tool execution: <100ms
- Workflow completion: <1s
- API response: <50ms