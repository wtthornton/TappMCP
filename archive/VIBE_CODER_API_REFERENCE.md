# Vibe Coder API Reference

> Complete API reference for the Vibe Coder natural language interface.

## 📚 Table of Contents

- [VibeTapp Class](#vibetapp-class)
- [VibeCLI Class](#vibecli-class)
- [IntentParser Class](#intentparser-class)
- [ActionOrchestrator Class](#actionorchestrator-class)
- [VibeFormatter Class](#vibeformatter-class)
- [ErrorHandler Class](#errorhandler-class)
- [ContextManager Class](#contextmanager-class)
- [VibeConfig Class](#vibeconfig-class)
- [Types](#types)
- [Adapters](#adapters)
- [Utilities](#utilities)

## VibeTapp Class

The main class for the Vibe Coder interface.

### Constructor

```typescript
constructor(config?: Partial<VibeConfiguration>)
```

**Parameters:**
- `config` (optional): Partial configuration object

**Example:**
```typescript
import { VibeTapp } from '@tappmcp/vibe-coder';

const vibe = new VibeTapp({
  defaultRole: 'developer',
  defaultQuality: 'enterprise'
});
```

### Methods

#### `vibe(input: string, options?: VibeOptions): Promise<VibeResponse>`

Main method for processing natural language commands.

**Parameters:**
- `input`: Natural language command string
- `options` (optional): Command options

**Returns:** Promise<VibeResponse>

**Example:**
```typescript
const response = await vibe.vibe('make me a todo app');
console.log(response.message);
```

#### `check(target?: string): Promise<VibeResponse>`

Check code quality and validation.

**Parameters:**
- `target` (optional): Target to check

**Returns:** Promise<VibeResponse>

**Example:**
```typescript
const response = await vibe.check('my code');
```

#### `fix(target?: string): Promise<VibeResponse>`

Automatically fix common issues.

**Parameters:**
- `target` (optional): Target to fix

**Returns:** Promise<VibeResponse>

**Example:**
```typescript
const response = await vibe.fix('TypeScript errors');
```

#### `ship(target?: string): Promise<VibeResponse>`

Deploy to production.

**Parameters:**
- `target` (optional): Target to deploy

**Returns:** Promise<VibeResponse>

**Example:**
```typescript
const response = await vibe.ship('my app');
```

#### `explain(target?: string): Promise<VibeResponse>`

Explain what code does.

**Parameters:**
- `target` (optional): Target to explain

**Returns:** Promise<VibeResponse>

**Example:**
```typescript
const response = await vibe.explain('this function');
```

#### `improve(target?: string): Promise<VibeResponse>`

Suggest improvements.

**Parameters:**
- `target` (optional): Target to improve

**Returns:** Promise<VibeResponse>

**Example:**
```typescript
const response = await vibe.improve('performance');
```

#### `status(): Promise<VibeResponse>`

Show project status and metrics.

**Returns:** Promise<VibeResponse>

**Example:**
```typescript
const response = await vibe.status();
```

#### `help(topic?: string): Promise<VibeResponse>`

Show help information.

**Parameters:**
- `topic` (optional): Specific help topic

**Returns:** Promise<VibeResponse>

**Example:**
```typescript
const response = await vibe.help('create');
```

#### `config(option?: string, value?: string): Promise<VibeResponse>`

Manage configuration.

**Parameters:**
- `option` (optional): Configuration option
- `value` (optional): Configuration value

**Returns:** Promise<VibeResponse>

**Example:**
```typescript
const response = await vibe.config('role', 'developer');
```

#### `setRole(role: VibeRole): void`

Set role for subsequent commands.

**Parameters:**
- `role`: Role to set

**Example:**
```typescript
vibe.setRole('developer');
```

#### `setQuality(quality: VibeQualityLevel): void`

Set quality level for subsequent commands.

**Parameters:**
- `quality`: Quality level to set

**Example:**
```typescript
vibe.setQuality('enterprise');
```

#### `setVerbosity(verbosity: VibeVerbosity): void`

Set verbosity level.

**Parameters:**
- `verbosity`: Verbosity level to set

**Example:**
```typescript
vibe.setVerbosity('detailed');
```

#### `setMode(mode: VibeMode): void`

Set mode (basic, advanced, power).

**Parameters:**
- `mode`: Mode to set

**Example:**
```typescript
vibe.setMode('advanced');
```

#### `getContext(): VibeContext`

Get current context.

**Returns:** VibeContext

**Example:**
```typescript
const context = vibe.getContext();
console.log(context.projectId);
```

#### `clearContext(): void`

Clear context.

**Example:**
```typescript
vibe.clearContext();
```

#### `getConfiguration(): VibeConfiguration`

Get current configuration.

**Returns:** VibeConfiguration

**Example:**
```typescript
const config = vibe.getConfiguration();
console.log(config.defaultRole);
```

#### `updateConfiguration(updates: Partial<VibeConfiguration>): void`

Update configuration.

**Parameters:**
- `updates`: Configuration updates

**Example:**
```typescript
vibe.updateConfiguration({
  defaultRole: 'designer',
  enableContext7: false
});
```

## VibeCLI Class

Command-line interface for Vibe Coder.

### Constructor

```typescript
constructor()
```

**Example:**
```typescript
import { VibeCLI } from '@tappmcp/vibe-coder';

const cli = new VibeCLI();
```

### Methods

#### `run(args: string[]): Promise<void>`

Run CLI with command line arguments.

**Parameters:**
- `args`: Command line arguments

**Example:**
```typescript
await cli.run(['make', 'me', 'a', 'todo', 'app']);
```

## IntentParser Class

Natural language intent classification.

### Constructor

```typescript
constructor()
```

**Example:**
```typescript
import { IntentParser } from '@tappmcp/vibe-coder';

const parser = new IntentParser();
```

### Methods

#### `parseIntent(input: string, context?: VibeContext): Promise<VibeIntent>`

Parse natural language input into structured intent.

**Parameters:**
- `input`: Natural language input
- `context` (optional): Current context

**Returns:** Promise<VibeIntent>

**Example:**
```typescript
const intent = await parser.parseIntent('make me a todo app');
console.log(intent.type); // 'project'
console.log(intent.confidence); // 0.9
```

## ActionOrchestrator Class

Tool execution orchestration.

### Constructor

```typescript
constructor()
```

**Example:**
```typescript
import { ActionOrchestrator } from '@tappmcp/vibe-coder';

const orchestrator = new ActionOrchestrator();
```

### Methods

#### `planActions(intent: VibeIntent, request: VibeRequest): Promise<VibeToolCall[]>`

Plan actions based on intent and request.

**Parameters:**
- `intent`: Parsed intent
- `request`: Vibe request

**Returns:** Promise<VibeToolCall[]>

**Example:**
```typescript
const toolCalls = await orchestrator.planActions(intent, request);
```

#### `executeTool(toolCall: VibeToolCall): Promise<VibeToolResult>`

Execute a single tool call.

**Parameters:**
- `toolCall`: Tool call to execute

**Returns:** Promise<VibeToolResult>

**Example:**
```typescript
const result = await orchestrator.executeTool(toolCall);
```

#### `executeToolsParallel(toolCalls: VibeToolCall[]): Promise<VibeToolResult[]>`

Execute multiple tool calls in parallel.

**Parameters:**
- `toolCalls`: Array of tool calls

**Returns:** Promise<VibeToolResult[]>

**Example:**
```typescript
const results = await orchestrator.executeToolsParallel(toolCalls);
```

## VibeFormatter Class

Response formatting for user-friendly output.

### Constructor

```typescript
constructor(config: VibeConfiguration)
```

**Parameters:**
- `config`: Vibe configuration

**Example:**
```typescript
import { VibeFormatter } from '@tappmcp/vibe-coder';

const formatter = new VibeFormatter(config);
```

### Methods

#### `formatResponse(intent: VibeIntent, results: VibeToolResult[], request: VibeRequest, responseTime: number): Promise<VibeResponse>`

Format response based on intent and tool results.

**Parameters:**
- `intent`: Parsed intent
- `results`: Tool execution results
- `request`: Original request
- `responseTime`: Response time in milliseconds

**Returns:** Promise<VibeResponse>

**Example:**
```typescript
const response = await formatter.formatResponse(intent, results, request, 1500);
```

## ErrorHandler Class

Error handling and user-friendly error messages.

### Constructor

```typescript
constructor()
```

**Example:**
```typescript
import { ErrorHandler } from '@tappmcp/vibe-coder';

const errorHandler = new ErrorHandler();
```

### Methods

#### `handleError(error: unknown, input: string, responseTime: number): VibeResponse`

Handle errors and convert to user-friendly responses.

**Parameters:**
- `error`: Error object
- `input`: Original input
- `responseTime`: Response time

**Returns:** VibeResponse

**Example:**
```typescript
const response = errorHandler.handleError(error, input, 1000);
```

#### `handleLowConfidence(intent: VibeIntent, input: string): VibeResponse`

Handle low confidence intents.

**Parameters:**
- `intent`: Parsed intent
- `input`: Original input

**Returns:** VibeResponse

**Example:**
```typescript
const response = errorHandler.handleLowConfidence(intent, input);
```

## ContextManager Class

Context management for seamless experience.

### Constructor

```typescript
constructor()
```

**Example:**
```typescript
import { ContextManager } from '@tappmcp/vibe-coder';

const contextManager = new ContextManager();
```

### Methods

#### `getCurrentContext(): VibeContext`

Get current context.

**Returns:** VibeContext

**Example:**
```typescript
const context = contextManager.getCurrentContext();
```

#### `updateContext(request: VibeRequest, response: VibeResponse): void`

Update context based on request and response.

**Parameters:**
- `request`: Vibe request
- `response`: Vibe response

**Example:**
```typescript
contextManager.updateContext(request, response);
```

#### `setRole(role: VibeRole): void`

Set role for subsequent commands.

**Parameters:**
- `role`: Role to set

**Example:**
```typescript
contextManager.setRole('developer');
```

#### `setQuality(quality: VibeQualityLevel): void`

Set quality level for subsequent commands.

**Parameters:**
- `quality`: Quality level to set

**Example:**
```typescript
contextManager.setQuality('enterprise');
```

#### `setVerbosity(verbosity: VibeVerbosity): void`

Set verbosity level.

**Parameters:**
- `verbosity`: Verbosity level to set

**Example:**
```typescript
contextManager.setVerbosity('detailed');
```

#### `setMode(mode: VibeMode): void`

Set mode (basic, advanced, power).

**Parameters:**
- `mode`: Mode to set

**Example:**
```typescript
contextManager.setMode('advanced');
```

#### `clearContext(): void`

Clear context.

**Example:**
```typescript
contextManager.clearContext();
```

## VibeConfig Class

Configuration management.

### Constructor

```typescript
constructor(initialConfig?: Partial<VibeConfiguration>)
```

**Parameters:**
- `initialConfig` (optional): Initial configuration

**Example:**
```typescript
import { VibeConfig } from '@tappmcp/vibe-coder';

const config = new VibeConfig({
  defaultRole: 'developer',
  defaultQuality: 'standard'
});
```

### Methods

#### `get<K extends keyof VibeConfiguration>(key: K): VibeConfiguration[K]`

Get configuration value.

**Parameters:**
- `key`: Configuration key

**Returns:** Configuration value

**Example:**
```typescript
const role = config.get('defaultRole');
```

#### `set<K extends keyof VibeConfiguration>(key: K, value: VibeConfiguration[K]): void`

Set configuration value.

**Parameters:**
- `key`: Configuration key
- `value`: Configuration value

**Example:**
```typescript
config.set('defaultRole', 'designer');
```

#### `update(updates: Partial<VibeConfiguration>): void`

Update multiple configuration values.

**Parameters:**
- `updates`: Configuration updates

**Example:**
```typescript
config.update({
  defaultRole: 'developer',
  defaultQuality: 'enterprise'
});
```

#### `getAll(): VibeConfiguration`

Get all configuration.

**Returns:** VibeConfiguration

**Example:**
```typescript
const allConfig = config.getAll();
```

#### `reset(): void`

Reset to defaults.

**Example:**
```typescript
config.reset();
```

#### `validate(): { valid: boolean; errors: string[] }`

Validate configuration.

**Returns:** Validation result

**Example:**
```typescript
const validation = config.validate();
if (!validation.valid) {
  console.error('Configuration errors:', validation.errors);
}
```

#### `export(): string`

Export configuration to JSON.

**Returns:** JSON string

**Example:**
```typescript
const configJson = config.export();
```

#### `import(configJson: string): { success: boolean; errors?: string[] }`

Import configuration from JSON.

**Parameters:**
- `configJson`: JSON configuration string

**Returns:** Import result

**Example:**
```typescript
const result = config.import(configJson);
if (!result.success) {
  console.error('Import errors:', result.errors);
}
```

## Types

### VibeRequest

```typescript
interface VibeRequest {
  command: string;
  input: string;
  options?: VibeOptions;
  context?: VibeContext;
}
```

### VibeResponse

```typescript
interface VibeResponse {
  success: boolean;
  message: string;
  details?: VibeResponseDetails;
  nextSteps: string[];
  learning?: VibeLearningContent;
  metrics?: VibeResponseMetrics;
  timestamp: string;
  command?: string;
  context?: VibeContext;
}
```

### VibeOptions

```typescript
interface VibeOptions {
  role?: VibeRole;
  quality?: VibeQualityLevel;
  verbosity?: VibeVerbosity;
  mode?: VibeMode;
  techStack?: string[];
  projectId?: string;
  showMetrics?: boolean;
  showLearning?: boolean;
  showTips?: boolean;
  emojiLevel?: VibeEmojiLevel;
  technicalLevel?: VibeTechnicalLevel;
}
```

### VibeContext

```typescript
interface VibeContext {
  projectId?: string;
  projectName?: string;
  techStack?: string[];
  role?: VibeRole;
  qualityLevel?: VibeQualityLevel;
  previousCommands?: string[];
  userPreferences?: VibeUserPreferences;
}
```

### VibeIntent

```typescript
interface VibeIntent {
  type: VibeIntentType;
  confidence: number;
  parameters: VibeIntentParameters;
  keywords: string[];
  suggestions?: string[];
}
```

### VibeToolCall

```typescript
interface VibeToolCall {
  tool: string;
  parameters: any;
  priority: number;
  dependencies?: string[];
  timeout?: number;
}
```

### VibeToolResult

```typescript
interface VibeToolResult {
  tool: string;
  success: boolean;
  data?: any;
  error?: string;
  executionTime: number;
  metrics?: any;
}
```

### VibeConfiguration

```typescript
interface VibeConfiguration {
  defaultRole: VibeRole;
  defaultQuality: VibeQualityLevel;
  defaultVerbosity: VibeVerbosity;
  defaultMode: VibeMode;
  enableContext7: boolean;
  enableWebSearch: boolean;
  enableMemory: boolean;
  maxResponseTime: number;
  enableProgressIndicators: boolean;
  enableLearningContent: boolean;
  enableTips: boolean;
  enableMetrics: boolean;
}
```

### Enums

```typescript
type VibeRole =
  | 'developer'
  | 'product-strategist'
  | 'operations-engineer'
  | 'designer'
  | 'qa-engineer';

type VibeQualityLevel =
  | 'basic'
  | 'standard'
  | 'enterprise'
  | 'production';

type VibeVerbosity =
  | 'minimal'
  | 'standard'
  | 'detailed';

type VibeMode =
  | 'basic'
  | 'advanced'
  | 'power';

type VibeIntentType =
  | 'project'
  | 'code'
  | 'quality'
  | 'planning'
  | 'explanation'
  | 'improvement'
  | 'deployment'
  | 'help'
  | 'config'
  | 'status';
```

## Adapters

### SmartToolAdapter

Base class for smart tool adapters.

```typescript
abstract class SmartToolAdapter {
  protected toolName: string;

  constructor(toolName: string);

  abstract execute(parameters: any): Promise<VibeToolResult>;
  abstract isAvailable(): Promise<boolean>;
  abstract getCapabilities(): string[];
  abstract getDescription(): string;
}
```

### Available Adapters

- `SmartBeginAdapter` - Project creation
- `SmartWriteAdapter` - Code generation
- `SmartFinishAdapter` - Quality validation
- `SmartOrchestrateAdapter` - Workflow orchestration
- `SmartPlanAdapter` - Project planning
- `SmartThoughtProcessAdapter` - Code explanation

## Utilities

### Logger

```typescript
class Logger {
  constructor(context: string, level: LogLevel);

  debug(message: string, context?: any): void;
  info(message: string, context?: any): void;
  warn(message: string, context?: any): void;
  error(message: string, error?: Error, context?: any): void;

  setLevel(level: LogLevel): void;
  getLevel(): LogLevel;
}
```

### ProgressIndicator

```typescript
class ProgressIndicator {
  constructor(options: ProgressOptions);

  update(current: number, message?: string): void;
  increment(amount?: number, message?: string): void;
  complete(message?: string): void;

  static createSpinner(message: string): () => void;
  static createProgressBar(total: number, message?: string): ProgressIndicator;
  static createCounter(total: number, message?: string): ProgressIndicator;
}
```

## Examples

### Basic Usage

```typescript
import { VibeTapp } from '@tappmcp/vibe-coder';

const vibe = new VibeTapp();

// Create a project
const response = await vibe.vibe('make me a todo app');
console.log(response.message);

// Check quality
const qualityResponse = await vibe.check();
console.log(qualityResponse.details?.data?.qualityScorecard);

// Deploy
const deployResponse = await vibe.ship();
console.log(deployResponse.message);
```

### Advanced Usage

```typescript
import { VibeTapp, VibeConfig } from '@tappmcp/vibe-coder';

// Custom configuration
const config = new VibeConfig({
  defaultRole: 'developer',
  defaultQuality: 'enterprise',
  enableContext7: true,
  enableWebSearch: true,
  maxResponseTime: 30000
});

const vibe = new VibeTapp(config.getAll());

// Set role
vibe.setRole('developer');

// Set quality level
vibe.setQuality('enterprise');

// Set verbosity
vibe.setVerbosity('detailed');

// Create project with specific options
const response = await vibe.vibe('make me a React app with TypeScript', {
  techStack: ['react', 'typescript', 'node'],
  showMetrics: true,
  showLearning: true
});

console.log(response.message);
console.log(response.nextSteps);
console.log(response.learning?.tips);
```

### Error Handling

```typescript
import { VibeTapp } from '@tappmcp/vibe-coder';

const vibe = new VibeTapp();

try {
  const response = await vibe.vibe('make me a broken app');

  if (!response.success) {
    console.error('Error:', response.message);
    console.log('Suggestions:', response.nextSteps);

    if (response.learning?.tips) {
      console.log('Tips:', response.learning.tips);
    }
  }
} catch (error) {
  console.error('Unexpected error:', error);
}
```

### Context Management

```typescript
import { VibeTapp } from '@tappmcp/vibe-coder';

const vibe = new VibeTapp();

// Create project
await vibe.vibe('make me a todo app');

// Get context
const context = vibe.getContext();
console.log('Project ID:', context.projectId);
console.log('Tech Stack:', context.techStack);

// Add authentication (uses project context)
await vibe.vibe('add user authentication');

// Check quality (uses project context)
await vibe.check();

// Deploy (uses project context)
await vibe.ship();
```

---

**For more examples, see the [User Guide](VIBE_CODER_USER_GUIDE.md) and [Migration Guide](VIBE_CODER_MIGRATION_GUIDE.md).**

*Last updated: 2024-12-19*
