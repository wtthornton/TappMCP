# Smart MCP User Guide

Welcome to Smart MCP - your AI-assisted development platform built on the Model Context Protocol (MCP).

## Table of Contents

- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [Using Smart Tools](#using-smart-tools)
- [Framework Features](#framework-features)
- [Advanced Usage](#advanced-usage)
- [Troubleshooting](#troubleshooting)

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/TappMCP.git
cd TappMCP

# Install dependencies
npm ci

# Run quality check
npm run early-check

# Start development
npm run dev
```

### First Steps

1. **Start the MCP Server**
   ```bash
   npm run dev
   ```

2. **Test Basic Functionality**
   ```bash
   npm test
   ```

3. **Try Your First Tool**
   ```typescript
   import { SmartWriteMCPTool } from './src/tools/smart-write-mcp';

   const tool = new SmartWriteMCPTool();
   const result = await tool.execute({
     projectId: "my-project",
     featureDescription: "Create a simple calculator function",
     techStack: ["typescript", "node"],
     codeType: "function"
   });

   console.log(result.data?.generatedCode);
   ```

## Core Concepts

### MCP Tools

Smart MCP provides 5 core tools for AI-assisted development:

- **smart-begin**: Project initialization and planning
- **smart-write**: Code generation with business context
- **smart-orchestrate**: Workflow orchestration across roles
- **smart-plan**: Enhanced planning with technical analysis
- **smart-finish**: Project completion and quality validation

### Role-Based AI Development

Switch between 6 specialized AI roles:

```bash
# Switch roles using natural language
"you are now a developer"
"switch to qa engineer mode"
"become a system architect"
```

Available roles:
- AI-Augmented Developer (default)
- Product Strategist
- AI System Architect
- AI Operations Engineer
- UX/Product Designer
- AI Quality Assurance Engineer

### Framework Architecture

```
src/
├── framework/          # Core MCP framework
│   ├── mcp-tool.ts    # Base tool implementation
│   ├── mcp-resource.ts # Resource management
│   └── registry.ts    # Tool registration
├── tools/             # Smart tools implementation
├── resources/         # File, API, Database resources
├── prompts/           # AI prompt templates
└── core/             # Business logic and engines
```

## Using Smart Tools

### Smart Begin Tool

Initialize projects with comprehensive planning:

```typescript
import { SmartBeginMCPTool } from './src/tools/smart-begin-mcp';

const beginTool = new SmartBeginMCPTool();
const result = await beginTool.execute({
  request: "Build a task management web application",
  options: {
    includeArchitecture: true,
    includeTechnicalSpecs: true,
    includeBusinessContext: true,
    timeline: "2 weeks",
    teamSize: 3,
    skillLevel: "intermediate"
  }
});

console.log('Project Plan:', result.data?.projectPlan);
console.log('Architecture:', result.data?.architecture);
console.log('Technical Specs:', result.data?.technicalSpecs);
```

### Smart Write Tool

Generate code with business context:

```typescript
import { SmartWriteMCPTool } from './src/tools/smart-write-mcp';

const writeTool = new SmartWriteMCPTool();
const result = await writeTool.execute({
  projectId: "task-manager",
  featureDescription: "User authentication with JWT tokens",
  techStack: ["typescript", "express", "jwt", "bcrypt"],
  codeType: "api",
  role: "developer",
  securityLevel: "high",
  priority: "high",
  qualityRequirements: {
    testCoverage: 90,
    performanceTargets: {
      responseTime: 200
    },
    securityLevel: "high"
  }
});

console.log('Generated Code:', result.data?.generatedCode);
console.log('Dependencies:', result.data?.suggestedDependencies);
console.log('Test Cases:', result.data?.testCases);
```

### Smart Orchestrate Tool

Coordinate complex workflows:

```typescript
import { SmartOrchestrateMCPTool } from './src/tools/smart-orchestrate-mcp';

const orchestrateTool = new SmartOrchestrateMCPTool();
const result = await orchestrateTool.execute({
  request: "Implement complete user management system",
  workflow: "sdlc",
  options: {
    costPrevention: true,
    skipPhases: [],
    focusAreas: ["security", "performance"],
    qualityLevel: "production",
    businessContext: {
      projectId: "user-mgmt",
      businessGoals: ["Secure user authentication", "Scalable user system"],
      requirements: ["JWT authentication", "Role-based access", "User profiles"],
      stakeholders: ["Product Manager", "Security Team", "Frontend Team"],
      constraints: {
        budget: "$50k",
        timeline: "6 weeks",
        compliance: "SOC2"
      },
      success: {
        metrics: ["99.9% uptime", "<200ms response", "Zero security incidents"],
        criteria: ["All tests pass", "Security audit complete", "Performance benchmarks met"]
      }
    }
  },
  externalSources: {
    useContext7: true,
    useWebSearch: true,
    useMemory: true
  }
});

console.log('Workflow Result:', result.data?.workflow);
console.log('Business Value:', result.data?.businessValue);
console.log('Next Steps:', result.data?.nextSteps);
```

## Framework Features

### Resource Management

Smart MCP includes three types of resources:

#### File Resource
```typescript
import { FileResource } from './src/resources/file-resource';

const fileResource = new FileResource();
await fileResource.connect('/path/to/project');

// Read files with security validation
const content = await fileResource.read('src/utils/helper.ts');

// Write files with backup
await fileResource.write('src/new-file.ts', codeContent);

// List files with filtering
const files = await fileResource.list('src/', '*.ts');
```

#### API Resource
```typescript
import { ApiResource } from './src/resources/api-resource';

const apiResource = new ApiResource();
await apiResource.connect('https://api.example.com');

// GET request with retry logic
const data = await apiResource.get('/users/123');

// POST with error handling
const result = await apiResource.post('/users', userData);
```

#### Database Resource
```typescript
import { DatabaseResource } from './src/resources/database-resource';

const dbResource = new DatabaseResource();
await dbResource.connect('postgresql://localhost/mydb');

// Query with parameterized statements
const users = await dbResource.query('SELECT * FROM users WHERE active = $1', [true]);

// Transaction support
await dbResource.transaction(async (tx) => {
  await tx.query('INSERT INTO users...');
  await tx.query('INSERT INTO profiles...');
});
```

### Prompt Templates

Use AI prompt templates for consistent results:

```typescript
import { CodeGenerationPrompt } from './src/prompts/code-generation-prompt';

const prompt = new CodeGenerationPrompt();
const generatedPrompt = prompt.generate({
  context: "E-commerce application",
  task: "Create product search function",
  techStack: ["typescript", "elasticsearch"],
  constraints: ["Type-safe", "Error handling", "Performance optimized"]
});

console.log('AI Prompt:', generatedPrompt);
```

## Advanced Usage

### Custom Tool Development

Create your own MCP tools:

```typescript
import { MCPTool, MCPToolResult } from './src/framework/mcp-tool';
import { z } from 'zod';

// Define input schema
const MyToolInput = z.object({
  projectId: z.string(),
  task: z.string(),
  options: z.object({
    format: z.enum(['json', 'yaml', 'text']).default('json')
  }).optional()
});

// Define output schema
const MyToolOutput = z.object({
  result: z.string(),
  metadata: z.record(z.unknown()).optional()
});

export class MyCustomTool extends MCPTool<
  z.infer<typeof MyToolInput>,
  z.infer<typeof MyToolOutput>
> {
  constructor() {
    super({
      name: 'my_custom_tool',
      description: 'Custom tool for specialized processing',
      inputSchema: MyToolInput,
      outputSchema: MyToolOutput
    });
  }

  protected async executeInternal(
    input: z.infer<typeof MyToolInput>
  ): Promise<z.infer<typeof MyToolOutput>> {
    // Your tool logic here
    return {
      result: `Processed task: ${input.task}`,
      metadata: { projectId: input.projectId }
    };
  }
}
```

### Performance Optimization

Smart MCP is optimized for sub-millisecond performance:

```typescript
// Tools automatically track performance
const startTime = Date.now();
const result = await tool.execute(input);
const executionTime = result.executionTime; // Automatically tracked

// Performance targets
console.log(`Execution time: ${executionTime}ms`); // Target: <50ms
```

### Quality Gates

Built-in quality validation:

```bash
# Run all quality checks
npm run qa:all

# Individual checks
npm run qa:eslint      # Code quality
npm run qa:typescript  # Type checking
npm run qa:tests       # Test suite with coverage
npm run qa:security    # Security scanning
```

## Troubleshooting

### Common Issues

1. **Tests Failing**
   ```bash
   npm run test:coverage
   # Check coverage reports in coverage/ directory
   ```

2. **TypeScript Errors**
   ```bash
   npm run type-check
   # Fix type issues with strict mode compliance
   ```

3. **Performance Issues**
   ```bash
   # Check response times in test output
   npm run test -- src/tools/smart-write-mcp.test.ts
   ```

4. **MCP Server Connection**
   ```bash
   # Restart MCP servers
   npm run dev
   # Check server health
   curl http://localhost:3000/health
   ```

### Getting Help

- **Documentation**: Check `docs/` directory
- **Examples**: Review `src/examples/`
- **Issues**: Report bugs in project repository
- **Claude Code Integration**: See `CLAUDE.md` for setup

### Performance Monitoring

Smart MCP includes comprehensive performance tracking:

```typescript
// All tools automatically log performance metrics
Tool execution successful {
  toolName: 'smart_write',
  executionTime: 0.234, // milliseconds
  timestamp: '2025-09-05T23:44:52.054Z'
}
```

Current performance benchmarks:
- **smart-write**: 0.1-0.5ms average
- **smart-orchestrate**: 0.2-0.8ms average
- **smart-begin**: 1-3ms average
- **Target**: <50ms for all operations

---

**Need more help?** Check the [API Documentation](./API_DOCUMENTATION.md) for detailed technical references.