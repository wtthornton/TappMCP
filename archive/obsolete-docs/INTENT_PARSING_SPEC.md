# Intent Parsing Specification - TappMCP Vibe Coder Interface

## Overview
This document specifies the intent parsing system that converts natural language commands into actionable tool calls, mapping intents to existing tool combinations.

## Intent Classification System

### Primary Intent Categories

#### 1. Project Intent
**Purpose**: Create, initialize, or set up new projects
**Keywords**: make, create, build, start, new, project, app, website, service, initialize
**Confidence Threshold**: 0.8
**Tool Mapping**: smart_begin + smart_orchestrate

**Patterns**:
- "make me a [project type]"
- "create a [project type] with [tech stack]"
- "build a [project type] for [purpose]"
- "start a new [project type]"
- "initialize a [project type] project"

**Examples**:
- "make me a todo app" → Project creation with default settings
- "create a React website with TypeScript" → Project creation with specific tech stack
- "build an API service for user management" → Project creation with specific purpose

#### 2. Code Intent
**Purpose**: Generate, write, or create code
**Keywords**: write, generate, create, code, function, component, class, module, feature
**Confidence Threshold**: 0.8
**Tool Mapping**: smart_write

**Patterns**:
- "write a [code type] for [purpose]"
- "generate a [code type] with [features]"
- "create a [code type] that [functionality]"
- "code a [code type] for [target]"

**Examples**:
- "write a login form" → Generate login form component
- "create a user service" → Generate user service code
- "generate tests for this function" → Generate test code

#### 3. Quality Intent
**Purpose**: Check, validate, or test code quality
**Keywords**: check, validate, test, quality, security, performance, bugs, issues
**Confidence Threshold**: 0.8
**Tool Mapping**: smart_finish

**Patterns**:
- "check [target] for [criteria]"
- "validate [target] [aspect]"
- "test [target] [type]"
- "find [issues] in [target]"

**Examples**:
- "check my code quality" → Run quality validation
- "validate the security" → Run security checks
- "test the functionality" → Run functional tests

#### 4. Planning Intent
**Purpose**: Create plans, roadmaps, or schedules
**Keywords**: plan, roadmap, schedule, timeline, phases, milestones, strategy
**Confidence Threshold**: 0.8
**Tool Mapping**: smart_plan

**Patterns**:
- "plan [project] [aspect]"
- "create a roadmap for [project]"
- "schedule [project] [timeline]"
- "timeline for [project]"

**Examples**:
- "plan my project" → Create project plan
- "create a roadmap" → Generate project roadmap
- "schedule the development" → Create development schedule

#### 5. Explanation Intent
**Purpose**: Explain, describe, or show information
**Keywords**: explain, show, tell, describe, what, how, why, understand
**Confidence Threshold**: 0.8
**Tool Mapping**: smart_thought_process

**Patterns**:
- "explain [target] [aspect]"
- "show me [target] [details]"
- "tell me about [target]"
- "what does [target] do"

**Examples**:
- "explain this code" → Show code explanation
- "what does this function do" → Explain function purpose
- "show me the project status" → Display project information

#### 6. Improvement Intent
**Purpose**: Suggest or implement improvements
**Keywords**: improve, enhance, optimize, better, fix, upgrade, refactor
**Confidence Threshold**: 0.8
**Tool Mapping**: smart_write + smart_finish

**Patterns**:
- "improve [target] [aspect]"
- "enhance [target] with [features]"
- "optimize [target] for [criteria]"
- "make [target] [better]"

**Examples**:
- "improve this code" → Suggest code improvements
- "enhance the performance" → Optimize performance
- "make it more secure" → Add security improvements

#### 7. Deployment Intent
**Purpose**: Deploy, ship, or release code
**Keywords**: deploy, ship, release, publish, launch, go live, production
**Confidence Threshold**: 0.8
**Tool Mapping**: smart_finish + smart_orchestrate

**Patterns**:
- "deploy [target] to [environment]"
- "ship [target] [options]"
- "release [target] [version]"
- "launch [target] [details]"

**Examples**:
- "deploy my app" → Deploy application
- "ship to production" → Deploy to production
- "launch the website" → Deploy website

## Intent Parsing Algorithm

### 1. Preprocessing
```typescript
function preprocessInput(input: string): string {
  // Convert to lowercase
  let processed = input.toLowerCase();

  // Remove extra whitespace
  processed = processed.replace(/\s+/g, ' ').trim();

  // Expand contractions
  processed = expandContractions(processed);

  // Normalize common variations
  processed = normalizeVariations(processed);

  return processed;
}
```

### 2. Keyword Extraction
```typescript
function extractKeywords(input: string): string[] {
  // Remove stop words
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];

  // Tokenize and filter
  const tokens = input.split(' ')
    .filter(token => !stopWords.includes(token))
    .filter(token => token.length > 2);

  return tokens;
}
```

### 3. Intent Classification
```typescript
function classifyIntent(input: string, keywords: string[]): IntentResult {
  const intents = [
    { name: 'project', keywords: ['make', 'create', 'build', 'start', 'new', 'project', 'app', 'website', 'service'], weight: 1.0 },
    { name: 'code', keywords: ['write', 'generate', 'create', 'code', 'function', 'component', 'class', 'module'], weight: 1.0 },
    { name: 'quality', keywords: ['check', 'validate', 'test', 'quality', 'security', 'performance', 'bugs'], weight: 1.0 },
    { name: 'planning', keywords: ['plan', 'roadmap', 'schedule', 'timeline', 'phases', 'milestones'], weight: 1.0 },
    { name: 'explanation', keywords: ['explain', 'show', 'tell', 'describe', 'what', 'how', 'why'], weight: 1.0 },
    { name: 'improvement', keywords: ['improve', 'enhance', 'optimize', 'better', 'fix', 'upgrade'], weight: 1.0 },
    { name: 'deployment', keywords: ['deploy', 'ship', 'release', 'publish', 'launch', 'production'], weight: 1.0 }
  ];

  // Calculate scores for each intent
  const scores = intents.map(intent => {
    const matches = keywords.filter(keyword =>
      intent.keywords.some(intentKeyword =>
        keyword.includes(intentKeyword) || intentKeyword.includes(keyword)
      )
    ).length;

    const score = (matches / intent.keywords.length) * intent.weight;
    return { name: intent.name, score, matches };
  });

  // Find best match
  const bestMatch = scores.reduce((best, current) =>
    current.score > best.score ? current : best
  );

  return {
    intent: bestMatch.name,
    confidence: bestMatch.score,
    matches: bestMatch.matches,
    keywords: keywords
  };
}
```

### 4. Parameter Extraction
```typescript
function extractParameters(input: string, intent: string): ParameterMap {
  const parameters: ParameterMap = {};

  // Extract project type
  const projectTypes = ['app', 'website', 'service', 'api', 'library', 'mobile', 'desktop'];
  const projectTypeMatch = projectTypes.find(type =>
    input.includes(type) || input.includes(type + 's')
  );
  if (projectTypeMatch) {
    parameters.projectType = projectTypeMatch;
  }

  // Extract tech stack
  const techStack = ['react', 'vue', 'angular', 'typescript', 'javascript', 'node', 'python', 'java'];
  const detectedTechStack = techStack.filter(tech =>
    input.includes(tech) || input.includes(tech.toLowerCase())
  );
  if (detectedTechStack.length > 0) {
    parameters.techStack = detectedTechStack;
  }

  // Extract role
  const roles = ['developer', 'designer', 'qa', 'operations', 'product'];
  const roleMatch = roles.find(role => input.includes(role));
  if (roleMatch) {
    parameters.role = roleMatch;
  }

  // Extract quality level
  const qualityLevels = ['basic', 'standard', 'enterprise', 'production'];
  const qualityMatch = qualityLevels.find(level => input.includes(level));
  if (qualityMatch) {
    parameters.qualityLevel = qualityMatch;
  }

  return parameters;
}
```

## Confidence Scoring

### Scoring Algorithm
```typescript
function calculateConfidence(intent: IntentResult, parameters: ParameterMap): number {
  let confidence = intent.confidence;

  // Boost confidence for exact keyword matches
  if (intent.matches > 0) {
    confidence += 0.1 * intent.matches;
  }

  // Boost confidence for parameter completeness
  const parameterCount = Object.keys(parameters).length;
  confidence += 0.05 * parameterCount;

  // Boost confidence for specific patterns
  if (intent.intent === 'project' && parameters.projectType) {
    confidence += 0.2;
  }

  if (intent.intent === 'code' && parameters.techStack) {
    confidence += 0.15;
  }

  // Cap confidence at 1.0
  return Math.min(1.0, confidence);
}
```

### Confidence Thresholds
- **High Confidence**: >= 0.8 - Execute immediately
- **Medium Confidence**: 0.6 - 0.8 - Ask for confirmation
- **Low Confidence**: < 0.6 - Ask for clarification

## Fallback Strategies

### Ambiguous Input
**Strategy**: Ask for clarification
**Example**:
```
Input: "make something"
Response: "I'd be happy to help! What would you like me to make? For example: 'make me a todo app' or 'create a website'"
```

### Multiple Intents
**Strategy**: Ask user to choose
**Example**:
```
Input: "make and check a todo app"
Response: "I can help with both! Would you like me to:
1. Make a todo app first, then check it
2. Just make the todo app
3. Just check existing code"
```

### Unrecognized Intent
**Strategy**: Provide suggestions
**Example**:
```
Input: "do something with my code"
Response: "I can help you with your code! Try one of these:
- 'check my code' - validate quality
- 'improve my code' - suggest improvements
- 'explain my code' - show what it does
- 'vibe help' - see all commands"
```

## Tool Mapping Strategy

### Single Tool Mapping
```typescript
const singleToolMapping = {
  'code': 'smart_write',
  'quality': 'smart_finish',
  'planning': 'smart_plan',
  'explanation': 'smart_thought_process'
};
```

### Multi-Tool Mapping
```typescript
const multiToolMapping = {
  'project': ['smart_begin', 'smart_orchestrate'],
  'improvement': ['smart_write', 'smart_finish'],
  'deployment': ['smart_finish', 'smart_orchestrate']
};
```

### Tool Orchestration
```typescript
function orchestrateTools(intent: string, parameters: ParameterMap): ToolSequence {
  const toolSequence = [];

  switch (intent) {
    case 'project':
      toolSequence.push({
        tool: 'smart_begin',
        parameters: {
          projectName: parameters.projectName || 'new-project',
          techStack: parameters.techStack || ['react', 'typescript'],
          role: parameters.role || 'developer',
          qualityLevel: parameters.qualityLevel || 'standard'
        }
      });
      toolSequence.push({
        tool: 'smart_orchestrate',
        parameters: {
          request: parameters.description || 'Complete project setup',
          workflow: 'project',
          role: parameters.role || 'developer'
        }
      });
      break;

    case 'code':
      toolSequence.push({
        tool: 'smart_write',
        parameters: {
          featureDescription: parameters.description,
          targetRole: parameters.role || 'developer',
          techStack: parameters.techStack || [],
          codeType: parameters.codeType || 'function'
        }
      });
      break;

    // ... other cases
  }

  return toolSequence;
}
```

## Error Handling

### Parsing Errors
```typescript
function handleParsingError(error: Error, input: string): ErrorResponse {
  return {
    type: 'parsing_error',
    message: `I couldn't understand "${input}". Try rephrasing your request.`,
    suggestions: [
      'Use simple, clear language',
      'Be specific about what you want',
      'Try "vibe help" for examples'
    ],
    originalError: error.message
  };
}
```

### Low Confidence Handling
```typescript
function handleLowConfidence(intent: IntentResult, input: string): ClarificationRequest {
  return {
    type: 'clarification_needed',
    message: `I think you want me to ${intent.intent}, but I'm not sure.`,
    confidence: intent.confidence,
    suggestions: generateSuggestions(intent.intent),
    originalInput: input
  };
}
```

## Testing Strategy

### Test Cases
```typescript
const testCases = [
  {
    input: "make me a todo app",
    expectedIntent: "project",
    expectedConfidence: 0.9,
    expectedParameters: { projectType: "app" }
  },
  {
    input: "write a login function",
    expectedIntent: "code",
    expectedConfidence: 0.85,
    expectedParameters: { codeType: "function" }
  },
  {
    input: "check my code quality",
    expectedIntent: "quality",
    expectedConfidence: 0.9,
    expectedParameters: { target: "code" }
  }
  // ... more test cases
];
```

### Validation Metrics
- **Intent Accuracy**: >85% correct intent classification
- **Parameter Extraction**: >80% correct parameter extraction
- **Confidence Calibration**: Confidence scores correlate with actual accuracy
- **Response Time**: <100ms for intent parsing

---

**Last Updated**: 2024-12-19
**Status**: Complete
**Next Action**: Create Response Format Design
