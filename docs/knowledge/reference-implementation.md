# Reference Implementation: smart_arch.ts

## Overview
This document preserves the working implementation of `smart_arch.ts` as a reference for building other tools in the clean slate implementation.

## Key Implementation Patterns

### 1. Tool Definition Structure
```typescript
export const smart_arch_tool: Tool = {
  name: "smart_arch",
  description: "AI System Architect tool for system architecture design, ADR creation, API design, and architecture reviews",
  inputSchema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["create_adr", "design_system", "design_api", "review_architecture", "analyze_technology"],
        description: "Architecture action to perform"
      },
      context: {
        type: "string",
        description: "Context and requirements for the architecture work"
      },
      // ... other properties
    },
    required: ["action", "context"]
  }
};
```

### 2. Handler Function Pattern
```typescript
export async function handleSmartArch(input: any): Promise<any> {
  const { action, context, system_name, constraints = [], requirements = [] } = input;

  try {
    switch (action) {
      case "create_adr":
        return await createArchitectureDecisionRecord(context, constraints, requirements);
      // ... other cases
      default:
        throw new Error(`Unknown architecture action: ${action}`);
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: new Date().toISOString()
    };
  }
}
```

### 3. Schema Validation with Zod
```typescript
const ADRSchema = z.object({
  id: z.string().describe("Unique identifier for the ADR"),
  title: z.string().describe("Clear, descriptive title"),
  status: z.enum(["proposed", "accepted", "deprecated", "superseded"]).describe("Current status"),
  date: z.string().describe("Date in YYYY-MM-DD format"),
  // ... other fields
});
```

### 4. Structured Response Format
```typescript
return {
  success: true,
  adr: ADRSchema.parse(adr),
  recommendations: [
    "Review and validate the proposed decision with stakeholders",
    "Update implementation plan based on decision",
    "Document any follow-up decisions needed"
  ],
  timestamp: new Date().toISOString()
};
```

## Implementation Quality Standards
- **Error Handling**: Comprehensive try-catch with structured error responses
- **Input Validation**: Zod schema validation for all inputs
- **Output Validation**: Schema validation for all outputs
- **Documentation**: Clear descriptions for all parameters and actions
- **Consistency**: Standardized response format with success/error states
- **Timestamping**: All responses include ISO timestamp

## Tool Categories Implemented
1. **create_adr**: Architecture Decision Record creation
2. **design_system**: System architecture design
3. **design_api**: API design and specification
4. **review_architecture**: Architecture review and analysis
5. **analyze_technology**: Technology stack analysis

## Lessons Learned
1. **Action-based Design**: Tools should support multiple related actions
2. **Context-driven**: All actions require context and can accept constraints/requirements
3. **Structured Output**: Consistent response format with recommendations
4. **Schema Validation**: Runtime validation ensures data integrity
5. **Error Recovery**: Graceful error handling with meaningful error messages

## Migration to New Implementation
This reference implementation will guide the creation of all new tools, ensuring:
- Consistent tool structure and patterns
- Proper error handling and validation
- Schema-locked I/O compliance
- Project-guidelines.md standards adherence
