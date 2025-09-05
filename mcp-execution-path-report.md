
# MCP Server Execution Path Analysis - Real Function Call Tree

## 🏗️ Server Architecture

### Entry Point
- **File:** src/server.ts
- **Main Function:** main()
- **Transport:** StdioServerTransport
- **Tool Registration:** Dynamic tool registration via MCP SDK
- **Health Server:** Separate HTTP server on port 3000

## 🛠️ Tool Handlers Analysis


### smart_begin
- **File:** src/tools/smart_begin.ts
- **Functions Called:** generateProjectStructure, generateQualityGates, generateNextSteps, calculateBusinessValue, handleSmartBegin, object, string, min, optional, array, default, enum, number, includes, push, now, parse, toLowerCase, replace, toISOString
- **External Dependencies:** zod, @modelcontextprotocol/sdk/types.js
- **Zod Schemas:** Yes
- **Business Logic:** Business Value Calculation, Schema Validation, Timestamp Generation


### smart_write
- **File:** src/tools/smart_write.ts
- **Functions Called:** generateRealCode, with, for, generated, handleSmartWrite, object, string, min, enum, default, array, optional, number, max, toLowerCase, replace, split, filter, includes, join, trim, toISOString, toBe, toContain, toBeDefined, now, toBeLessThan, parse
- **External Dependencies:** zod, @modelcontextprotocol/sdk/types.js, vitest, ./${featureName}
- **Zod Schemas:** Yes
- **Business Logic:** Code Generation, AI Reasoning, Quality Assessment, Business Value Calculation, Schema Validation, Timestamp Generation


### smart_plan
- **File:** src/tools/smart_plan.ts
- **Functions Called:** handleSmartPlan, object, string, min, enum, default, array, optional, number, max, now, parse, toISOString, split, round, reduce
- **External Dependencies:** zod, @modelcontextprotocol/sdk/types.js
- **Zod Schemas:** Yes
- **Business Logic:** Business Value Calculation, Schema Validation, Timestamp Generation, Mathematical Calculations


### smart_orchestrate
- **File:** src/tools/smart_orchestrate.ts
- **Functions Called:** generateEnhancedWorkflowPhases, generateNextSteps, handleSmartOrchestrate, object, string, min, array, optional, default, number, boolean, enum, record, unknown, includes, push, filter, forEach, join, now, parse, toISOString, setContext, gatherKnowledge, toUpperCase, executeWorkflow, getBusinessValue, generateContextInsights, round
- **External Dependencies:** zod, @modelcontextprotocol/sdk/types.js, ../core/mcp-coordinator.js
- **Zod Schemas:** Yes
- **Business Logic:** Business Value Calculation, Schema Validation, Timestamp Generation, Mathematical Calculations


### smart_finish
- **File:** src/tools/smart_finish.ts
- **Functions Called:** handleSmartFinish, generateNextSteps, object, string, min, array, number, max, default, optional, boolean, now, parse, cwd, fill, map, all, runSecurityScan, resolve, runStaticAnalysis, random, generateScorecard, toISOString, push
- **External Dependencies:** zod, @modelcontextprotocol/sdk/types.js, ../core/security-scanner.js, ../core/static-analyzer.js, ../core/quality-scorecard.js
- **Zod Schemas:** Yes
- **Business Logic:** Business Value Calculation, Schema Validation, Timestamp Generation


## 📦 External Dependencies

### Runtime Dependencies

- **@modelcontextprotocol/sdk:** ^0.4.0

- **zod:** ^3.22.0


### Dev Dependencies

- **@types/node:** ^20.0.0

- **@typescript-eslint/eslint-plugin:** ^8.42.0

- **@typescript-eslint/parser:** ^8.42.0

- **@vitest/coverage-v8:** ^3.2.4

- **eslint:** ^8.0.0

- **eslint-config-prettier:** ^10.1.8

- **eslint-plugin-prettier:** ^5.5.4

- **lint-staged:** ^16.1.6

- **pre-commit:** ^1.0.10

- **prettier:** ^3.6.2

- **retire:** ^5.3.0

- **ts-node:** ^10.9.0

- **typescript:** ^5.0.0

- **vitest:** ^3.2.4


## 🌳 Function Call Tree


### handleSmart_begin
- **Tool:** smart_begin
- **Functions:** generateProjectStructure, generateQualityGates, generateNextSteps, calculateBusinessValue, handleSmartBegin, object, string, min, optional, array, default, enum, number, includes, push, now, parse, toLowerCase, replace, toISOString
- **External Dependencies:** zod, @modelcontextprotocol/sdk/types.js
- **Business Logic:** Business Value Calculation, Schema Validation, Timestamp Generation


### handleSmart_write
- **Tool:** smart_write
- **Functions:** generateRealCode, with, for, generated, handleSmartWrite, object, string, min, enum, default, array, optional, number, max, toLowerCase, replace, split, filter, includes, join, trim, toISOString, toBe, toContain, toBeDefined, now, toBeLessThan, parse
- **External Dependencies:** zod, @modelcontextprotocol/sdk/types.js, vitest, ./${featureName}
- **Business Logic:** Code Generation, AI Reasoning, Quality Assessment, Business Value Calculation, Schema Validation, Timestamp Generation


### handleSmart_plan
- **Tool:** smart_plan
- **Functions:** handleSmartPlan, object, string, min, enum, default, array, optional, number, max, now, parse, toISOString, split, round, reduce
- **External Dependencies:** zod, @modelcontextprotocol/sdk/types.js
- **Business Logic:** Business Value Calculation, Schema Validation, Timestamp Generation, Mathematical Calculations


### handleSmart_orchestrate
- **Tool:** smart_orchestrate
- **Functions:** generateEnhancedWorkflowPhases, generateNextSteps, handleSmartOrchestrate, object, string, min, array, optional, default, number, boolean, enum, record, unknown, includes, push, filter, forEach, join, now, parse, toISOString, setContext, gatherKnowledge, toUpperCase, executeWorkflow, getBusinessValue, generateContextInsights, round
- **External Dependencies:** zod, @modelcontextprotocol/sdk/types.js, ../core/mcp-coordinator.js
- **Business Logic:** Business Value Calculation, Schema Validation, Timestamp Generation, Mathematical Calculations


### handleSmart_finish
- **Tool:** smart_finish
- **Functions:** handleSmartFinish, generateNextSteps, object, string, min, array, number, max, default, optional, boolean, now, parse, cwd, fill, map, all, runSecurityScan, resolve, runStaticAnalysis, random, generateScorecard, toISOString, push
- **External Dependencies:** zod, @modelcontextprotocol/sdk/types.js, ../core/security-scanner.js, ../core/static-analyzer.js, ../core/quality-scorecard.js
- **Business Logic:** Business Value Calculation, Schema Validation, Timestamp Generation


## 🔄 Execution Flow


### step1
MCP Client sends JSON-RPC request via stdio


### step2
Server receives request and validates with Zod schemas


### step3
Tool handler function is called with validated parameters


### step4
Business logic executes (code generation, analysis, etc.)


### step5
External tools and libraries are called as needed


### step6
Response is formatted and returned via stdio


### step7
Health server provides monitoring and status endpoints


## 📊 External Tools Called

### Within Docker Container
- **Node.js Runtime:** JavaScript execution environment
- **Zod Library:** Schema validation
- **MCP SDK:** Model Context Protocol communication
- **File System:** File operations and code generation
- **Date/Time:** Timestamp generation
- **Math Functions:** Quality score calculations
- **JSON Processing:** Request/response formatting

### External Services
- **Health Monitoring:** HTTP health check endpoint
- **Docker Runtime:** Container execution environment
- **File System Mounts:** Volume mounting for data persistence

## 🧠 AI Reasoning Engine

### Code Generation Process
1. **Input Analysis:** Parse user request and detect keywords
2. **Type Detection:** Determine HTML vs TypeScript requirements
3. **Code Structure:** Generate appropriate code structure
4. **Quality Validation:** Verify requirements are met
5. **Response Formatting:** Structure response with metrics

### External Libraries Used
- **Zod:** Input validation and schema checking
- **Node.js Built-ins:** File system, JSON, Date operations
- **Custom Logic:** Business value calculations and quality metrics

## 📈 Performance Characteristics

### Function Call Overhead
- **Schema Validation:** Zod object validation
- **File Operations:** Code generation and saving
- **JSON Processing:** Request/response serialization
- **Mathematical Calculations:** Quality score computation

### External Tool Impact
- **Docker Container:** Minimal overhead for isolation
- **Node.js Runtime:** Efficient JavaScript execution
- **File System I/O:** Direct file operations for code generation
- **Memory Management:** Automatic garbage collection

## 🔍 Debugging and Monitoring

### Logging Points
- **Function Entry:** Tool handler entry points
- **Validation:** Schema validation results
- **Generation:** Code generation process
- **Response:** Final response formatting

### Health Monitoring
- **HTTP Endpoint:** /health for container health
- **Readiness Check:** /readiness for service readiness
- **Memory Usage:** RSS and heap memory tracking
- **Uptime:** Service uptime monitoring
