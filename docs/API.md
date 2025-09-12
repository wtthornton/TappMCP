# TappMCP API Reference - Enhanced with Real AI Intelligence

## 🎯 Overview
TappMCP provides a complete set of AI-powered development tools with **real analysis capabilities**, **Advanced Context7 Cache**, **Unified Code Intelligence**, and **comprehensive workflow orchestration**. All tools have been enhanced with genuine AI intelligence replacing hardcoded templates.

## 🔄 Docker Health Endpoints

For containerized deployments, TappMCP provides health monitoring endpoints:

### Health Check Endpoint
```bash
GET http://localhost:3001/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-09-11T05:52:55.374Z",
  "uptime": 14.170468918,
  "memory": {
    "rss": 59060224,
    "heapTotal": 11780096,
    "heapUsed": 10283744,
    "external": 2321801,
    "arrayBuffers": 106619
  },
  "version": "0.1.0"
}
```

### Readiness Check Endpoint
```bash
GET http://localhost:3001/ready
```

**Response:**
```json
{
  "status": "ready",
  "timestamp": "2025-09-11T05:52:59.704Z"
}
```

## 🧠 Core AI Components

### 30-Day Persistent Cache System
Intelligent caching system with 95% API cost reduction and automatic persistence.

**Features:**
- **30-day TTL** for Context7Broker (documentation data)
- **7-day TTL** for Context7Cache (business logic)
- **File-based persistence** (`./cache/context7-cache.json`)
- **Auto-save** every 10 cache writes
- **95% API call reduction** and cost savings
- **Graceful error handling** with fallback

**Usage:**
```typescript
const broker = new Context7Broker({
  cacheExpiryHours: 30 * 24, // 30 days
  enableCache: true,
});

// Cache management
const stats = broker.getCacheStats();
const healthy = broker.isCacheHealthy();
broker.clearCache(); // Manual clear if needed
```

### AdvancedContext7Cache
Enterprise-grade caching system with compression, analytics, and monitoring.

```typescript
interface AdvancedCacheOptions {
  enableCompression?: boolean;
  enableAnalytics?: boolean;
  enableMonitoring?: boolean;
  enableCacheSharing?: boolean;
  maxCacheSize?: number;
  cacheWarmupStrategy?: 'eager' | 'lazy' | 'intelligent';
}

// Enterprise caching with advanced features
const cachedResult = await advancedContext7Cache.getOrGenerateCodeCache(
  cacheKey,
  generator,
  codeType,
  technology
);
```

### UnifiedCodeIntelligenceEngine
Multi-category intelligence engine with specialized processors.

```typescript
interface CodeIntelligenceResult {
  code: string;
  category: string;
  technology: string;
  qualityScore: number;
  insights: Context7Insights;
  metadata: {
    processingTime: number;
    engineUsed: string;
    context7Insights: number;
    cacheStats: CacheStats;
  };
}

// Multi-category code intelligence
const result = await unifiedEngine.generateIntelligentCode({
  featureDescription: "React login component",
  targetRole: "developer",
  techStack: ["react", "typescript"],
  quality: "enterprise"
});
```

### SimpleAnalyzer
Unified analysis engine coordinating SecurityScanner, StaticAnalyzer, and ProjectScanner.

```typescript
interface BasicAnalysis {
  projectPath: string;
  analysisTime: number;
  overallScore: number;
  security: SecurityAnalysisResult;
  quality: StaticAnalysisResult;
  project: ProjectScanResult;
}

// Real analysis with parallel execution
const analysis = await simpleAnalyzer.runBasicAnalysis(projectPath, 'standard');
```

### Context7ProjectAnalyzer
Project-aware Context7 integration with dynamic topic generation and quality metrics.

```typescript
interface Context7Data {
  insights: {
    patterns: string[];
    recommendations: string[];
    qualityMetrics: {
      overall: number;
      [key: string]: any;
    };
  };
  projectContext?: any;
  technologyInsights?: any;
}

// Project-aware Context7 intelligence with quality metrics
const context7Data = await context7ProjectAnalyzer.getProjectAwareContext(analysis);
```

### CodeValidator
Real-time code validation with security pattern detection.

```typescript
interface CodeValidationResult {
  isValid: boolean;
  overallScore: number;
  security: ValidationSecurityResult;
  quality: ValidationQualityResult;
  recommendations: string[];
}

// Real-time validation
const validation = await codeValidator.validateGeneratedCode(generatedCode, projectPath);
```

### SimpleSDLCWorkflow
Complete SDLC orchestration with 4-phase automation.

```typescript
interface WorkflowResult {
  success: boolean;
  phases: WorkflowPhases;
  generatedCode?: GeneratedCode;
  validation?: CodeValidationResult;
  businessValue: BusinessValueMetrics;
}

// End-to-end workflow
const result = await workflow.executeWorkflow(projectPath, request, options);
```

## 🛠️ Enhanced MCP Tools

### smart-begin ✨ Enhanced with Real Analysis
Initialize new projects or analyze existing projects with **genuine AI intelligence** using SecurityScanner, StaticAnalyzer, and ProjectScanner integration.

**Input:**
```typescript
{
  projectName: string;  // Project name (min: 3 chars)
  techStack: string[];  // Technology stack (e.g., ['TypeScript', 'React'])
  role: 'developer' | 'designer' | 'qa-engineer' | 'operations-engineer' | 'product-strategist';
  mode?: 'new-project' | 'analyze-existing';  // Default: 'new-project'
  existingProjectPath?: string;  // Path to existing project (for analyze-existing mode)
  analysisDepth?: 'quick' | 'standard' | 'deep';  // Default: 'standard'
  externalSources?: {
    useContext7?: boolean;  // Default: true
    useWebSearch?: boolean; // Default: true
  };
}
```

**Output:**
```typescript
{
  success: boolean;
  projectId: string;
  projectName: string;
  architecture: {
    components: object[];
    relationships: object[];
    qualityGates: object[];
  };
  technicalSpecs: {
    techStack: string[];
    dependencies: object[];
    configuration: object;
  };
  businessContext: {
    goals: string[];
    targetUsers: string[];
    valueProposition: string;
    estimatedValue: number;
  };
  analysis?: {  // Only for analyze-existing mode
    projectStructure: object;
    qualityIssues: object[];
    improvementOpportunities: object[];
    qualityScores: object;
  };
}
```

### smart-plan
Generate detailed technical implementation plans with support for existing project improvement.

**Input:**
```typescript
{
  projectId: string;  // Project ID from smart-begin
  task: string;       // Task description
  improvementMode?: 'enhancement' | 'refactoring' | 'optimization';  // Default: 'enhancement'
  targetQualityLevel?: 'basic' | 'standard' | 'enterprise' | 'production';  // Default: 'standard'
  preserveExisting?: boolean;  // Default: true
  context?: object;   // Optional context from smart-begin
  externalSources?: {
    useContext7?: boolean;  // Default: true
    useWebSearch?: boolean; // Default: true
  };
}
```

**Output:**
```typescript
{
  success: boolean;
  projectId: string;
  plan: {
    phases: object[];
    timeline: string;
    dependencies: string[];
    qualityGates: object[];
    riskAssessment: object;
  };
  improvementPlan?: {  // Only for improvement modes
    currentQuality: object;
    targetQuality: object;
    improvementSteps: object[];
    preservationStrategy: object;
  };
}
```

### smart-write
Write, modify, or enhance production-ready code with best practices and safe modification strategies.

**Input:**
```typescript
{
  projectId: string;  // Project ID from smart-begin
  featureDescription: string;  // Description of what to implement
  writeMode?: 'create' | 'modify' | 'enhance';  // Default: 'create'
  backupOriginal?: boolean;  // Default: true
  modificationStrategy?: 'in-place' | 'side-by-side' | 'backup-first';  // Default: 'backup-first'
  language?: string;  // Programming language
  framework?: string; // Framework or library
  externalSources?: {
    useContext7?: boolean;  // Default: true
    useWebSearch?: boolean; // Default: true
  };
}
```

**Output:**
```typescript
{
  success: boolean;
  projectId: string;
  code: {
    files: object[];
    tests: object[];
    documentation: object[];
  };
  modification?: {  // Only for modify/enhance modes
    originalFiles: object[];
    backupLocation: string;
    changes: object[];
    safetyChecks: object[];
  };
  qualityMetrics: {
    testCoverage: number;
    securityScore: number;
    performanceScore: number;
    maintainabilityScore: number;
  };
}
```

### smart-finish
Complete projects with comprehensive quality assurance and documentation.

**Input:**
```typescript
{
  projectId: string;  // Project ID from smart-begin
  codeIds: string[];  // Array of code IDs to finalize
  qualityGates: {
    testCoverage?: number;  // Minimum test coverage (default: 85)
    securityScore?: number; // Minimum security score (default: 95)
    performanceScore?: number; // Minimum performance score (default: 90)
  };
  businessRequirements: {
    goals: string[];
    targetUsers: string[];
    valueProposition: string;
  };
  externalSources?: {
    useContext7?: boolean;  // Default: true
    useWebSearch?: boolean; // Default: true
  };
}
```

**Output:**
```typescript
{
  success: boolean;
  projectId: string;
  qualityScore: number;
  testResults: {
    coverage: number;
    passed: number;
    failed: number;
    total: number;
  };
  documentation: {
    apiDocs: string;
    userGuide: string;
    deploymentGuide: string;
  };
  businessValue: {
    costPrevention: number;
    timeSaved: number;
    estimatedROI: number;
  };
}
```

### smart-orchestrate
Coordinate complex multi-step workflows with role-based orchestration.

**Input:**
```typescript
{
  projectId: string;  // Project ID from smart-begin
  workflow: string;   // Workflow description
  steps: string[];    // Array of workflow steps
  parallel?: boolean; // Whether to run steps in parallel
  role?: 'developer' | 'designer' | 'qa-engineer' | 'operations-engineer' | 'product-strategist';
  externalSources?: {
    useContext7?: boolean;  // Default: true
    useWebSearch?: boolean; // Default: true
  };
}
```

**Output:**
```typescript
{
  success: boolean;
  projectId: string;
  results: object[];
  executionTime: number;
  technicalMetrics: {
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  businessMetrics: {
    valueDelivered: number;
    qualityAchieved: number;
    efficiencyGained: number;
  };
}
```

### smart-vibe 🎵 Natural Language Interface
Full VibeTapp natural language interface for Cursor integration with context management, role switching, and rich responses.

**Input:**
```typescript
{
  command: string;  // Natural language command (e.g., "make me a todo app", "check my code")
  options?: {
    role?: 'developer' | 'designer' | 'qa-engineer' | 'operations-engineer' | 'product-strategist';
    quality?: 'basic' | 'standard' | 'enterprise' | 'production';
    verbosity?: 'minimal' | 'standard' | 'detailed';
    mode?: 'basic' | 'advanced' | 'power';
  };
}
```

**Output:**
```typescript
{
  content: Array<{
    type: 'text';
    text: string; // Formatted response with emojis, markdown, and rich content
  }>;
  isError?: boolean;
}
```

**Examples:**
```typescript
// Project creation
smart_vibe "make me a React todo app with TypeScript"

// Code generation
smart_vibe "write a login function" { role: "developer", quality: "enterprise" }

// Quality checking
smart_vibe "check my code quality" { role: "qa-engineer", verbosity: "detailed" }

// Code improvement
smart_vibe "improve this function" { role: "developer", quality: "production" }

// Deployment
smart_vibe "ship my app" { role: "operations-engineer" }
```

**Features:**
- **Natural Language Processing**: Converts plain English to tool calls
- **Context Management**: Maintains state across multiple calls
- **Role Switching**: Automatically applies role-based configurations
- **Rich Responses**: Formatted with emojis, markdown, and next steps
- **Error Handling**: User-friendly error messages with suggestions
- **Tool Orchestration**: Automatically calls appropriate smart tools
- **Learning Content**: Provides tips and best practices

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

## Testing Architecture

TappMCP uses a comprehensive testing strategy with proper separation of concerns:

### Test Types
- **Unit Tests**: Test individual components in isolation with mocked dependencies
- **Integration Tests**: Test component interactions with mocked external services
- **End-to-End Tests**: Test complete workflows with real external services

### Test Files
- `src/brokers/context7-broker.test.ts` - Unit tests for Context7 broker mock behavior
- `src/brokers/context7-broker-integration.test.ts` - Integration tests for real error handling
- `src/brokers/context7-broker-real.test.ts` - Legacy tests (kept for backward compatibility)

### Best Practices
- **Unit Tests**: Fast, isolated, test mock behavior only
- **Integration Tests**: Test real business logic with mocked external dependencies
- **E2E Tests**: Test complete workflows with real external services
- **Coverage**: ≥85% lines and branches on changed files
- **Performance**: Tests complete within reasonable time limits

## 🚀 Core Enhancement Features

### Real Analysis Integration
All tools now use **genuine analysis** instead of hardcoded values:

- **SecurityScanner**: Real vulnerability detection (credentials, eval, XSS patterns)
- **StaticAnalyzer**: Real complexity and quality analysis
- **ProjectScanner**: Advanced tech stack detection and project insights
- **SimpleAnalyzer**: Unified coordination with parallel execution (<2s analysis time)

### Context7 Intelligence Enhancement
**Context7ProjectAnalyzer** provides project-aware insights:

- **Dynamic Topic Generation**: Based on real project analysis results
- **Tech Stack Specific**: Patterns and recommendations for detected technologies
- **Quality-driven Insights**: Solutions based on actual code quality issues
- **Security-focused**: Recommendations based on detected vulnerabilities

### Real-Time Code Validation
**CodeValidator** provides genuine validation:

- **Security Pattern Detection**: Hardcoded credentials, eval usage, XSS vulnerabilities
- **Quality Metrics**: Real complexity, maintainability, and testability scoring
- **Performance**: <500ms validation time for generated code
- **Recommendations**: Actionable improvement suggestions

### Complete SDLC Workflow
**SimpleSDLCWorkflow** orchestrates the entire development cycle:

1. **Analysis Phase**: Real project analysis with all tools
2. **Context7 Phase**: Project-aware intelligence gathering
3. **Generation Phase**: Role-optimized code generation with Context7 patterns
4. **Validation Phase**: Real-time code validation and quality assurance

### Performance Benchmarks
- **Analysis Time**: <2s for standard projects, <5s for large projects
- **Code Generation**: <1s for standard features with Context7 enhancement
- **Validation**: <500ms for real-time code validation
- **Workflow**: <10s end-to-end for complete SDLC automation

## External Sources

Enhanced external source integration:

### Enhanced Context7 Integration
- **Project-Aware Intelligence**: Dynamic topics based on real analysis
- **Pattern Application**: Context7 patterns applied during code generation
- **Quality Enhancement**: Context7 insights improve code quality
- **Fallback**: Graceful degradation with enhanced local patterns

### Web Search Integration
- **Purpose**: Real-time information and best practices
- **Usage**: `externalSources.useWebSearch: true/false`
- **Fallback**: Graceful degradation when service unavailable
