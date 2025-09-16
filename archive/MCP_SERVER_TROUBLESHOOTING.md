# TappMCP MCP Server Troubleshooting Guide

## Critical Configuration Issues Fixed

### Problem: smart_vibe tool not accessible via MCP
**Root Cause**: The `smart_vibe` tool was missing from `src/mcp-only-server.ts`

**Solution**: Added to TOOLS registry:
```typescript
smart_converse: {
  tool: smartConverseTool,
  handler: handleSmartConverse as (input: unknown) => Promise<unknown>,
},
smart_vibe: {
  tool: smartVibeTool,
  handler: handleSmartVibe as (input: unknown) => Promise<unknown>,
},
```

### Server Architecture
- **server.js**: Full server with health (port 3001) + HTTP (port 3000) + MCP
- **mcp-only-server.js**: MCP protocol only (no port conflicts)

### Testing MCP Tools
**Correct way**:
```bash
docker exec -i tappmcp-smart-mcp-1 node dist/mcp-only-server.js
```

**Wrong way** (causes port conflicts):
```bash
docker exec -i tappmcp-smart-mcp-1 node dist/server.js
```

### Deployment Process
1. Make code changes
2. `npm run build` (rebuild TypeScript)
3. `docker-compose down`
4. `docker-compose up -d --build` (rebuild container)

### Port Configuration
- HTTP server: 8080 (external) → 3000 (internal)
- Health server: 8081 (external) → 3001 (internal)
- MCP: via Docker exec (no external port)

### Testing Commands
```bash
# Test HTTP endpoint
curl -X POST http://localhost:8080/tools/smart_vibe \
  -H "Content-Type: application/json" \
  -d '{"command": "create a simple html"}'

# Test MCP protocol
node test-mcp-only.js
```

### Key Files
- `src/mcp-only-server.ts` - MCP protocol server
- `src/server.ts` - Full server with health/HTTP
- `src/tools/smart-vibe.ts` - smart_vibe tool implementation
- `test-mcp-only.js` - MCP testing script

## Time-Saving Tips
1. Always use `mcp-only-server.js` for MCP testing
2. Rebuild container after any code changes
3. Check tool registry includes all tools
4. Use HTTP endpoint for quick testing
5. MCP tools are NOT directly accessible in Cursor chat - use Docker exec
