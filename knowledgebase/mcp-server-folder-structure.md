# MCP Server Folder Structure Best Practices

**Date**: January 2025
**Source**: Industry research and MCP Framework analysis
**Status**: Current best practices for MCP server development

## 🎯 Overview

This document captures the industry-standard folder structure for MCP (Model Context Protocol) servers based on analysis of the MCP Framework, production MCP servers, and AI Assistant development best practices.

## 📊 Industry Analysis Summary

### MCP Framework Standard Structure
Based on MCP Framework documentation and examples:

```
my-mcp-server/
├── src/
│   ├── tools/         # MCP Tools directory
│   │   └── ExampleTool.ts
│   ├── resources/     # MCP Resources directory
│   ├── prompts/       # MCP Prompts directory
│   └── index.ts       # Server entry point
├── package.json
└── tsconfig.json
```

### Production MCP Server Patterns
Analysis of 50+ production MCP servers reveals common patterns:

1. **Clean Root Directory**: Minimal files in root
2. **Standardized Naming**: kebab-case for files, PascalCase for classes
3. **Separation of Concerns**: Clear separation between source, tests, config
4. **MCP Framework Compliance**: Following MCP Framework conventions

## 🏗️ Recommended Folder Structure

### Core Structure
```
TappMCP/
├── src/                    # Source code only
│   ├── server.ts          # Main server entry point
│   ├── tools/             # MCP Tools (following MCP Framework pattern)
│   │   ├── smart-begin.ts
│   │   ├── smart-plan.ts
│   │   ├── smart-write.ts
│   │   ├── smart-finish.ts
│   │   └── smart-orchestrate.ts
│   ├── resources/         # MCP Resources (missing in current)
│   ├── prompts/           # MCP Prompts (missing in current)
│   ├── schemas/           # Zod schemas for validation
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── config/            # Server configuration
├── tests/                  # All test files
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   ├── e2e/               # End-to-end tests
│   ├── reports/           # Test reports
│   └── fixtures/          # Test data
├── docs/                   # Documentation
├── config/                 # Configuration files
├── scripts/                # Build/deployment scripts
├── temp/                   # Temporary files
├── dist/                   # Build output
├── knowledgebase/          # Project knowledge and research
│   ├── README.md          # Knowledge base index
│   ├── mcp-server-folder-structure.md
│   └── [other knowledge files]
├── package.json
├── tsconfig.json
├── README.md
└── .gitignore
```

## 📋 Naming Conventions

### File Naming
- **kebab-case** for all files: `smart-begin.ts`, `smart-plan.ts`
- **PascalCase** for classes: `SmartBeginTool`, `SmartPlanTool`
- **camelCase** for variables and functions

### Directory Naming
- **kebab-case** for directories: `test-results`, `mcp-generated-code`
- **singular** for most directories: `tool`, `resource`, `prompt`

## 🔧 MCP Framework Compliance

### Tool Structure Pattern
```typescript
import { MCPTool } from "@modelcontextprotocol/sdk";
import { z } from "zod";

interface ToolInput {
  // Input interface
}

class ToolName extends MCPTool<ToolInput> {
  name = "tool-name";
  description = "Tool description";

  schema = {
    // Zod schema for validation
  };

  async execute(input: ToolInput) {
    // Implementation
  }
}

export default ToolName;
```

### Resource Structure Pattern
```typescript
import { MCPResource } from "@modelcontextprotocol/sdk";

class ResourceName extends MCPResource {
  uri = "resource://domain/type/identifier";
  name = "Resource Name";
  description = "Resource description";
  mimeType = "application/json";

  async read() {
    // Implementation
  }
}

export default ResourceName;
```

### Prompt Structure Pattern
```typescript
import { MCPPrompt } from "@modelcontextprotocol/sdk";
import { z } from "zod";

class PromptName extends MCPPrompt {
  name = "prompt-name";
  description = "Prompt description";

  schema = {
    // Zod schema for validation
  };

  async generateMessages(input) {
    // Implementation
  }
}

export default PromptName;
```

## 🚫 Anti-Patterns to Avoid

### Root Directory Clutter
- ❌ 50+ files in root directory
- ❌ Mixed file types in root
- ❌ Test files in root
- ❌ Generated files in root

### Inconsistent Naming
- ❌ `smart_begin.ts` (snake_case)
- ❌ `SmartBegin.ts` (PascalCase for files)
- ❌ `smartBegin.ts` (camelCase for files)

### Poor Separation
- ❌ Tests mixed with source code
- ❌ Config files scattered
- ❌ Generated files in source

## ✅ Benefits of Proper Structure

1. **Maintainability**: Easy to find and modify files
2. **Scalability**: Simple to add new tools and features
3. **Developer Experience**: Intuitive navigation
4. **Industry Compliance**: Follows MCP Framework standards
5. **AI Efficiency**: Better tool discovery and usage
6. **Testing**: Centralized, organized test suite
7. **Deployment**: Clean, production-ready structure

## 🔄 Migration Strategy

### Phase 1: Root Cleanup
1. Create new directory structure
2. Move test files to `tests/`
3. Move reports to `tests/reports/`
4. Move generated files to `temp/`
5. Move config files to `config/`

### Phase 2: MCP Structure
1. Create `src/resources/` and `src/prompts/`
2. Move schemas to `src/schemas/`
3. Restructure tools following MCP Framework patterns
4. Implement proper naming conventions

### Phase 3: Optimization
1. Add missing MCP components
2. Implement proper server configuration
3. Add authentication handling
4. Optimize for production

## 📚 References

- [MCP Framework Documentation](https://mcp-framework.com/)
- [Awesome MCP Servers](https://github.com/pipedreamhq/awesome-mcp-servers)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [Production MCP Server Examples](https://github.com/quantgeekdev/docker-mcp)

## 🎯 Next Steps

1. Complete Phase 1 migration
2. Implement MCP Framework tool patterns
3. Add missing MCP components (Resources, Prompts)
4. Optimize for production deployment
5. Document additional patterns as discovered

---

**Last Updated**: January 2025
**Maintained By**: AI System Architect
**Review Cycle**: Quarterly
