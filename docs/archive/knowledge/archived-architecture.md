# Archived Architecture Documentation

## Overview
This document preserves the architectural knowledge from the initial codebase before clean slate implementation.

## Project Structure Analysis
The original project had excellent architectural foundations:

### Core Architecture Principles
- **Schema-locked I/O**: All tools use JSON Schemas for input/output validation
- **Role-based AI assistants**: 6 specialized roles with clear contracts
- **Modular design**: Clear separation between core, tools, brokers, memory, and sandbox
- **MCP Server pattern**: Model Context Protocol server with tool handlers

### Directory Structure
```
/src
  /core           # state, policy management
  /tools          # MCP tool handlers (smart.*, mem.*, ll.*, metrics.*)
  /brokers        # Context7 and external knowledge brokers
  /memory         # knowledge packs & lessons adapters
  /sandbox        # runners/parsers for scanners and tests
```

### Tool Categories
1. **Smart Tools** (smart_*): Core AI-assisted development tools
2. **Memory Tools** (mem_*): Knowledge management and lessons learned
3. **LL Tools** (ll_*): Language-specific tooling
4. **Metrics Tools** (metrics_*): Quality measurement and scoring

## Working Implementation Reference
The `smart_arch.ts` tool was fully implemented and serves as our reference for:
- Proper Zod schema validation
- Comprehensive error handling
- Structured response formats
- Tool input/output contracts
- MCP SDK integration patterns

## Key Learnings
1. **Tool Structure**: Each tool should have clear input schema, handler function, and structured responses
2. **Error Handling**: Comprehensive try-catch with structured error responses
3. **Schema Validation**: Use Zod for runtime validation of inputs and outputs
4. **Response Format**: Consistent success/error response structure with timestamps
5. **Documentation**: Each tool needs clear description and parameter documentation

## Preserved Configuration
- Package.json with proper MCP SDK dependencies
- TypeScript configuration with strict mode
- Docker setup for Linux runtime environment
- Project guidelines and role definitions
- JSON schemas for tool I/O contracts

## Migration Notes
- All stub files were placeholders with minimal implementation
- Only smart_arch.ts had complete functionality
- Server.ts was just a comment placeholder
- No working MCP server implementation existed
- No test coverage or security scanning was implemented

## Next Steps
This architecture foundation will guide the clean slate implementation while ensuring we maintain the excellent structural decisions and build upon the working patterns established in smart_arch.ts.
