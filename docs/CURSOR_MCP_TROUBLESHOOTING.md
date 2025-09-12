# Cursor MCP Integration Troubleshooting

## 🚨 Common Issues and Solutions

### Issue 1: Container Name Mismatch

**Problem**: Cursor can't connect to TappMCP because the container name in the configuration doesn't match the actual running container.

**Symptoms**:
- `smart_vibe` command not recognized
- MCP status shows disconnected
- No TappMCP tools available

**Solution**:
1. **Check actual container name**:
   ```bash
   docker ps
   ```

2. **Update Cursor settings** based on deployment method:

   **For Docker Compose** (most common):
   ```json
   {
     "mcp.servers": {
       "tappmcp": {
         "command": "docker",
         "args": ["exec", "-i", "tappmcp-smart-mcp-1", "node", "dist/server.js"],
         "env": {
           "NODE_ENV": "production"
         },
         "stdio": true
       }
     },
     "mcp.enabled": true,
     "mcp.defaultServer": "tappmcp"
   }
   ```

   **For manual Docker run**:
   ```json
   {
     "mcp.servers": {
       "tappmcp": {
         "command": "docker",
         "args": ["exec", "-i", "smart-mcp-prod", "node", "dist/server.js"],
         "env": {
           "NODE_ENV": "production"
         },
         "stdio": true
       }
     },
     "mcp.enabled": true,
     "mcp.defaultServer": "tappmcp"
   }
   ```

3. **Restart Cursor completely** after updating settings

### Issue 2: JSON Syntax Errors

**Problem**: Invalid JSON in `settings.json` prevents MCP from loading.

**Symptoms**:
- Cursor shows JSON errors
- MCP configuration not recognized

**Solution**:
1. **Validate JSON syntax** using an online JSON validator
2. **Check for common errors**:
   - Missing commas between properties
   - Incorrect nesting levels
   - Duplicate property names
   - Unclosed brackets or braces

3. **Use the corrected template** from `cursor-mcp-config.json`

### Issue 3: Container Not Running

**Problem**: TappMCP container is not running or has stopped.

**Symptoms**:
- `docker ps` shows no TappMCP container
- Connection timeouts
- MCP server not responding

**Solution**:
1. **Check container status**:
   ```bash
   docker ps -a
   ```

2. **Start the container**:
   ```bash
   # For Docker Compose
   docker-compose up -d smart-mcp

   # For manual Docker run
   docker start smart-mcp-prod
   ```

3. **Check container logs**:
   ```bash
   docker logs tappmcp-smart-mcp-1
   # or
   docker logs smart-mcp-prod
   ```

### Issue 4: Port Conflicts

**Problem**: Ports 8080 or 8081 are already in use.

**Symptoms**:
- Container fails to start
- "Address already in use" errors

**Solution**:
1. **Check port usage**:
   ```bash
   netstat -ano | findstr :8080
   netstat -ano | findstr :8081
   ```

2. **Stop conflicting services** or change ports in `docker-compose.yml`

3. **Restart the container**:
   ```bash
   docker-compose down
   docker-compose up -d smart-mcp
   ```

### Issue 5: MCP Server Not Responding

**Problem**: Container is running but MCP server inside is not responding.

**Symptoms**:
- Container shows as running but MCP tools don't work
- Health check failures

**Solution**:
1. **Test MCP server directly**:
   ```bash
   echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | docker exec -i tappmcp-smart-mcp-1 node dist/server.js
   ```

2. **Check health endpoints**:
   ```bash
   curl http://localhost:8081/health
   curl http://localhost:8081/ready
   ```

3. **Restart the container** if MCP server is not responding

## 🔍 Debugging Steps

### Step 1: Verify Container Status
```bash
docker ps --filter "name=tappmcp"
```

### Step 2: Check Container Logs
```bash
docker logs tappmcp-smart-mcp-1 --tail 50
```

### Step 3: Test MCP Connection
```bash
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | docker exec -i tappmcp-smart-mcp-1 node dist/server.js
```

### Step 4: Verify Cursor Settings
1. Open `%APPDATA%\Cursor\User\settings.json`
2. Validate JSON syntax
3. Check container name matches `docker ps` output
4. Ensure `mcp.enabled: true`

### Step 5: Restart Cursor
1. Close Cursor completely
2. Wait 10 seconds
3. Reopen Cursor
4. Wait 20 seconds for MCP initialization

## 📋 Container Naming Reference

| Deployment Method | Container Name | Cursor Config |
|------------------|----------------|---------------|
| `docker-compose up` | `tappmcp-smart-mcp-1` | `tappmcp-smart-mcp-1` |
| `docker run --name smart-mcp-prod` | `smart-mcp-prod` | `smart-mcp-prod` |
| `docker-compose -p myproject up` | `myproject-smart-mcp-1` | `myproject-smart-mcp-1` |

## 🆘 Still Having Issues?

1. **Check the logs**: `docker logs tappmcp-smart-mcp-1`
2. **Verify network**: `docker network ls`
3. **Test health endpoints**: `curl http://localhost:8081/health`
4. **Restart everything**: `docker-compose down && docker-compose up -d`

## 📞 Getting Help

If you're still stuck:
1. Run `docker ps` and share the output
2. Run `docker logs tappmcp-smart-mcp-1` and share the last 20 lines
3. Share your `settings.json` MCP configuration
4. Describe what happens when you try `smart_vibe "test"`

