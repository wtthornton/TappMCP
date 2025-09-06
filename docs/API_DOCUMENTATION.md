# Smart MCP API Documentation

Complete API reference for Smart MCP tools, resources, and framework components.

## Table of Contents

- [MCP Tools API](#mcp-tools-api)
- [Resources API](#resources-api)
- [Framework API](#framework-api)
- [Response Formats](#response-formats)
- [Error Handling](#error-handling)
- [Performance Metrics](#performance-metrics)

## MCP Tools API

### Smart Begin Tool

**Purpose**: Initialize projects with comprehensive planning and architecture design.

#### Input Schema
```typescript
interface SmartBeginInput {
  request: string;                    // Project description (min: 10 chars)
  options?: {
    includeArchitecture?: boolean;    // Include architecture design (default: true)
    includeTechnicalSpecs?: boolean;  // Include technical specifications (default: true)
    includeBusinessContext?: boolean; // Include business analysis (default: true)
    timeline?: string;                // Project timeline (e.g., "2 weeks")
    teamSize?: number;                // Team size (1-20)
    skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  };
}
```

#### Output Schema
```typescript
interface SmartBeginOutput {
  projectPlan: {
    phases: ProjectPhase[];
    timeline: string;
    milestones: Milestone[];
    risks: Risk[];
  };
  architecture?: {
    components: ArchitectureComponent[];
    dataFlow: DataFlowDiagram;
    technologies: TechnologyStack;
  };
  technicalSpecs?: {
    requirements: Requirement[];
    constraints: Constraint[];
    assumptions: Assumption[];
  };
  businessContext?: {
    goals: string[];
    success_criteria: string[];
    stakeholders: Stakeholder[];
  };
}
```

#### Example Usage
```typescript
const tool = new SmartBeginMCPTool();
const result = await tool.execute({
  request: "Build a real-time chat application with file sharing",
  options: {
    includeArchitecture: true,
    timeline: "4 weeks",
    teamSize: 4,
    skillLevel: "intermediate"
  }
});

// Access results
console.log('Project phases:', result.data?.projectPlan.phases);
console.log('Architecture:', result.data?.architecture?.components);
```

#### Performance
- **Target Response Time**: <1s
- **Average Response Time**: 15-25ms
- **Timeout**: 30 seconds

---

### Smart Write Tool

**Purpose**: Generate code with business context, quality requirements, and comprehensive analysis.

#### Input Schema
```typescript
interface SmartWriteInput {
  projectId: string;                  // Project identifier (required)
  featureDescription: string;         // Feature description (min: 1 char)
  techStack: string[];               // Technology stack (required)
  codeType?: 'function' | 'component' | 'api' | 'test' | 'config' | 'documentation';
  role?: 'developer' | 'product-strategist' | 'designer' | 'qa-engineer' | 'operations-engineer';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  securityLevel?: 'low' | 'medium' | 'high';
  qualityRequirements?: {
    testCoverage?: number;            // Percentage (0-100)
    performanceTargets?: {
      responseTime?: number;          // Milliseconds
    };
    securityLevel?: 'low' | 'medium' | 'high';
  };
}
```

#### Output Schema
```typescript
interface SmartWriteOutput {
  generatedCode: string;              // Generated source code
  codeId: string;                     // Unique identifier
  language: string;                   // Programming language detected
  businessValue: {
    estimatedHours: number;
    costPrevention: number;
    riskMitigation: string[];
  };
  qualityMetrics: {
    complexity: number;               // Cyclomatic complexity
    maintainability: number;         // 0-100 score
    testability: number;             // 0-100 score
  };
  suggestedDependencies?: string[];   // NPM packages/dependencies
  testCases?: TestCase[];            // Generated test cases
  securityConsiderations?: string[]; // Security recommendations
  roleSpecificInsights?: string[];   // Role-based recommendations
}
```

#### Example Usage
```typescript
const tool = new SmartWriteMCPTool();
const result = await tool.execute({
  projectId: "ecommerce-api",
  featureDescription: "Product search with filters and pagination",
  techStack: ["typescript", "express", "elasticsearch"],
  codeType: "api",
  role: "developer",
  priority: "high",
  securityLevel: "high",
  qualityRequirements: {
    testCoverage: 85,
    performanceTargets: {
      responseTime: 200
    },
    securityLevel: "high"
  }
});

// Access generated content
console.log('Code:', result.data?.generatedCode);
console.log('Dependencies:', result.data?.suggestedDependencies);
console.log('Security notes:', result.data?.securityConsiderations);
```

#### Performance
- **Target Response Time**: <1s
- **Average Response Time**: 0.1-0.5ms
- **Timeout**: 10 seconds

---

### Smart Orchestrate Tool

**Purpose**: Coordinate complex workflows across multiple roles and phases with business context integration.

#### Input Schema
```typescript
interface SmartOrchestrateInput {
  request: string;                    // Orchestration request (min: 10 chars)
  workflow: 'sdlc' | 'project' | 'quality' | 'custom';
  options: {
    costPrevention: boolean;
    skipPhases: string[];
    focusAreas: string[];
    qualityLevel: 'basic' | 'standard' | 'production';
    businessContext: {
      projectId: string;              // Required, min: 1 char
      businessGoals: string[];
      requirements: string[];
      stakeholders: string[];
      constraints: Record<string, any>;
      success: {
        metrics: string[];
        criteria: string[];
      };
      marketContext?: {
        industry?: string;
        targetMarket?: string;
        competitors?: string[];
      };
    };
  };
  externalSources: {
    useContext7: boolean;
    useWebSearch: boolean;
    useMemory: boolean;
  };
}
```

#### Output Schema
```typescript
interface SmartOrchestrateOutput {
  workflow: {
    id: string;
    name: string;
    phases: WorkflowPhase[];
    currentPhase: string;
    overallProgress: number;          // 0-100 percentage
  };
  businessContext: BusinessContext;   // Processed business context
  externalIntegration: {
    context7Status: 'active' | 'disabled' | 'error';
    webSearchStatus: 'active' | 'disabled' | 'error';
    memoryStatus: 'active' | 'disabled' | 'error';
    integrationTime: number;          // Milliseconds
  };
  businessValue: {
    costPrevention: number;
    timeToMarket: number;
    qualityImprovement: number;
    riskMitigation: number;
    strategicAlignment: number;
  };
  technicalMetrics: {
    responseTime: number;
    orchestrationTime: number;
    roleTransitionTime: number;
    contextPreservationAccuracy: number;
    phaseSuccessRate: number;
    businessAlignmentScore: number;
    performanceScore: number;
  };
  nextSteps: {
    immediate: string[];
    short_term: string[];
    long_term: string[];
    dependencies: string[];
    risks: string[];
  };
}
```

#### Example Usage
```typescript
const tool = new SmartOrchestrateMCPTool();
const result = await tool.execute({
  request: "Implement secure user authentication system",
  workflow: "sdlc",
  options: {
    costPrevention: true,
    skipPhases: [],
    focusAreas: ["security", "performance"],
    qualityLevel: "production",
    businessContext: {
      projectId: "auth-system",
      businessGoals: ["Secure user login", "SSO integration"],
      requirements: ["JWT tokens", "2FA support", "OAuth providers"],
      stakeholders: ["Security Team", "Product Manager", "Frontend Team"],
      constraints: {
        compliance: "SOC2",
        budget: "$25k",
        timeline: "4 weeks"
      },
      success: {
        metrics: ["Zero security breaches", "99.9% uptime"],
        criteria: ["Penetration test pass", "Performance benchmarks met"]
      }
    }
  },
  externalSources: {
    useContext7: true,
    useWebSearch: false,
    useMemory: true
  }
});

// Access workflow results
console.log('Workflow phases:', result.data?.workflow.phases);
console.log('Business value:', result.data?.businessValue);
console.log('Next steps:', result.data?.nextSteps);
```

#### Performance
- **Target Response Time**: <1s
- **Average Response Time**: 0.2-0.8ms
- **Timeout**: 30 seconds

---

### Smart Plan Enhanced Tool

**Purpose**: Advanced project planning with technical analysis, risk assessment, and stakeholder management.

#### Input Schema
```typescript
interface SmartPlanEnhancedInput {
  projectRequest: string;
  options?: {
    includeRiskAssessment?: boolean;
    includeStakeholderAnalysis?: boolean;
    includeTechnicalSpecs?: boolean;
    includeResourcePlanning?: boolean;
    timeframe?: string;
    complexity?: 'low' | 'medium' | 'high' | 'enterprise';
  };
}
```

#### Output Schema
```typescript
interface SmartPlanEnhancedOutput {
  projectPlan: {
    overview: string;
    phases: PlanPhase[];
    timeline: Timeline;
    deliverables: Deliverable[];
  };
  technicalSpecs?: TechnicalSpecification[];
  riskAssessment?: {
    risks: Risk[];
    mitigationStrategies: MitigationStrategy[];
    contingencyPlans: ContingencyPlan[];
  };
  stakeholderAnalysis?: StakeholderAnalysis;
  resourcePlanning?: ResourcePlan;
}
```

---

### Smart Finish Tool

**Purpose**: Project completion validation, quality assessment, and deliverable verification.

#### Input Schema
```typescript
interface SmartFinishInput {
  projectId: string;
  options?: {
    validateQuality?: boolean;
    generateSummary?: boolean;
    includeMetrics?: boolean;
    performanceAnalysis?: boolean;
  };
}
```

#### Output Schema
```typescript
interface SmartFinishOutput {
  completionStatus: {
    overall: QualityScore;
    quality: QualityScore;
    performance: QualityScore;
    security: QualityScore;
  };
  projectSummary?: ProjectSummary;
  qualityMetrics?: QualityMetrics;
  performanceAnalysis?: PerformanceAnalysis;
  recommendations: string[];
  nextSteps: string[];
}
```

## Resources API

### File Resource

**Purpose**: Secure file operations with validation and backup capabilities.

#### Methods

##### connect(basePath: string): Promise<void>
Initialize file resource with base directory.

```typescript
const fileResource = new FileResource();
await fileResource.connect('/project/root');
```

##### read(filePath: string): Promise<string>
Read file content with security validation.

```typescript
const content = await fileResource.read('src/utils/helper.ts');
```

##### write(filePath: string, content: string): Promise<void>
Write file with automatic backup.

```typescript
await fileResource.write('src/new-component.tsx', componentCode);
```

##### list(directory: string, pattern?: string): Promise<FileInfo[]>
List files with optional filtering.

```typescript
const files = await fileResource.list('src/', '*.ts');
```

##### exists(filePath: string): Promise<boolean>
Check if file exists.

##### delete(filePath: string): Promise<void>
Delete file with backup retention.

---

### API Resource

**Purpose**: HTTP client with retry logic, error handling, and mock support.

#### Methods

##### connect(baseUrl: string, options?: ApiOptions): Promise<void>
Initialize API connection.

```typescript
const apiResource = new ApiResource();
await apiResource.connect('https://api.example.com', {
  timeout: 5000,
  retries: 3,
  headers: { 'Authorization': 'Bearer token' }
});
```

##### get<T>(endpoint: string, options?: RequestOptions): Promise<T>
GET request with retry logic.

##### post<T>(endpoint: string, data: any, options?: RequestOptions): Promise<T>
POST request with validation.

##### put<T>(endpoint: string, data: any, options?: RequestOptions): Promise<T>
PUT request for updates.

##### delete<T>(endpoint: string, options?: RequestOptions): Promise<T>
DELETE request.

---

### Database Resource

**Purpose**: Database operations with connection pooling and transaction support.

#### Methods

##### connect(connectionString: string, options?: DbOptions): Promise<void>
Initialize database connection.

```typescript
const dbResource = new DatabaseResource();
await dbResource.connect('postgresql://localhost/mydb', {
  pool: { min: 2, max: 10 },
  ssl: { rejectUnauthorized: false }
});
```

##### query<T>(sql: string, params?: any[]): Promise<T[]>
Execute parameterized query.

##### transaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T>
Execute transaction with rollback support.

##### migrate(migrationsPath: string): Promise<void>
Run database migrations.

## Framework API

### MCPTool Base Class

**Purpose**: Base class for creating custom MCP tools with validation and error handling.

#### Constructor
```typescript
constructor(config: {
  name: string;
  description: string;
  inputSchema: z.ZodSchema;
  outputSchema: z.ZodSchema;
})
```

#### Methods

##### execute<T, R>(input: T, context?: MCPToolContext): Promise<MCPToolResult<R>>
Execute tool with validation and error handling.

##### validate(input: unknown): ValidationResult
Validate input against schema.

---

### Registry

**Purpose**: Tool registration and discovery system.

#### Methods

##### register(tool: MCPTool): void
Register a new tool.

##### get(name: string): MCPTool | undefined
Retrieve registered tool.

##### list(): ToolInfo[]
List all registered tools.

## Response Formats

### Standard Response
```typescript
interface MCPToolResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata: {
    executionTime: number;       // milliseconds
    timestamp: string;
    requestId: string;
    toolName: string;
  };
}
```

### Quality Score Format
```typescript
interface QualityScore {
  score: number;                 // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  status: 'pass' | 'fail' | 'warning';
  details?: string[];
}
```

## Error Handling

### Error Types

#### ValidationError
```typescript
{
  code: 'VALIDATION_ERROR',
  message: 'Input validation failed',
  details: {
    field: string;
    expected: string;
    received: string;
  }
}
```

#### ExecutionError
```typescript
{
  code: 'EXECUTION_ERROR',
  message: 'Tool execution failed',
  details: {
    phase: string;
    originalError: string;
  }
}
```

#### TimeoutError
```typescript
{
  code: 'TIMEOUT_ERROR',
  message: 'Operation timed out',
  details: {
    timeout: number;
    elapsed: number;
  }
}
```

## Performance Metrics

### Response Time Targets

| Tool | Target | Average | 95th Percentile |
|------|--------|---------|----------------|
| smart-write | <1s | 0.1-0.5ms | <2ms |
| smart-orchestrate | <1s | 0.2-0.8ms | <3ms |
| smart-begin | <1s | 15-25ms | <50ms |
| smart-plan | <1s | 20-30ms | <60ms |
| smart-plan-enhanced | <1s | 1-2s | <3s |
| smart-finish | <1s | 10-20ms | <40ms |

### Performance Monitoring

All tools automatically track and report:
- Execution time (milliseconds)
- Memory usage
- Error rates
- Success rates
- Request/response sizes

Example performance log:
```typescript
Tool execution successful {
  toolName: 'smart_write',
  requestId: 'req_1757115892052_ysi9xoog5',
  executionTime: 0.234,
  timestamp: '2025-09-05T23:44:52.054Z'
}
```

---

**For more examples and advanced usage, see the [User Guide](./USER_GUIDE.md).**