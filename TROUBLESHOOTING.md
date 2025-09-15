# TappMCP Troubleshooting Guide

## Issue: No Tools Showing in Cursor

### Step 1: Verify MCP Server is Working
```bash
# Test the MCP server locally
node test-mcp-connection.js
```

**Expected Output:**
```
✅ MCP server is working correctly!
📋 Found 7 tools:
  • smart_begin - 🔍 Begin a new project with intelligent analysis and setup
  • smart_plan - 📋 Create a comprehensive project plan with tasks and milestones
  • smart_write - ✍️ Generate code, documentation, and other project artifacts
  • smart_finish - ✅ Complete and finalize project tasks with quality checks
  • smart_orchestrate - 🎭 Orchestrate complex workflows and coordinate multiple tools
  • smart_converse - 💬 Engage in intelligent conversation about development topics
  • smart_vibe - 🎯 Get the right vibe for your development work with intelligent suggestions
```

### Step 2: Check Cursor Configuration
The MCP configuration should be in: `%APPDATA%\Cursor\User\settings.json`

**Expected Configuration:**
```json
{
    "mcp.enabled": true,
    "mcp.defaultServer": "tappmcp-local",
    "mcp.servers": {
        "tappmcp-local": {
            "command": "node",
            "args": ["working-mcp-server.js"],
            "cwd": "C:\\cursor\\TappMCP",
            "env": {
                "NODE_ENV": "production",
                "CONTEXT7_API_KEY": "ctx7sk-45825e15-2f53-459e-8688-8c14b0604d02",
                "CONTEXT7_USE_HTTP_ONLY": "true"
            },
            "stdio": true,
            "description": "TappMCP Local Server - All 7 tools available"
        }
    }
}
```

### Step 3: Restart Cursor Completely
1. **Close Cursor entirely** (not just the window)
2. **Wait 10 seconds**
3. **Restart Cursor**
4. **Check MCP status** in Cursor settings (Ctrl+, → search "mcp")

### Step 4: Verify MCP in Cursor
1. Open Cursor Settings (Ctrl+,)
2. Search for "mcp"
3. Check if "MCP" section appears
4. Verify "Enable MCP" is checked
5. Check if "tappmcp-local" appears in the server list

### Step 5: Test MCP Connection in Cursor
Try these commands in Cursor:
- `smart_vibe test connection`
- `smart_begin analyze project`
- `smart_plan create roadmap`

### Step 6: Check Cursor Logs
1. Open Command Palette (Ctrl+Shift+P)
2. Type "Developer: Show Logs"
3. Look for MCP-related errors

### Step 7: Alternative Configuration
If the above doesn't work, try this simpler configuration:

```json
{
    "mcp.enabled": true,
    "mcp.servers": {
        "tappmcp": {
            "command": "node",
            "args": ["working-mcp-server.js"],
            "cwd": "C:\\cursor\\TappMCP",
            "stdio": true
        }
    },
    "mcp.defaultServer": "tappmcp"
}
```

### Step 8: Manual MCP Test
Create a test file `test-mcp-manual.js`:
```javascript
const { spawn } = require('child_process');

const server = spawn('node', ['working-mcp-server.js'], {
    cwd: 'C:\\cursor\\TappMCP',
    stdio: ['pipe', 'pipe', 'pipe']
});

// Send list tools request
const request = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list'
};

server.stdin.write(JSON.stringify(request) + '\n');

server.stdout.on('data', (data) => {
    console.log('Response:', data.toString());
});

server.stderr.on('data', (data) => {
    console.error('Error:', data.toString());
});

setTimeout(() => {
    server.kill();
}, 5000);
```

Run: `node test-mcp-manual.js`

### Common Issues and Solutions

#### Issue: "Command not found"
**Solution:** Ensure Node.js is in PATH and `working-mcp-server.js` exists

#### Issue: "Permission denied"
**Solution:** Run as administrator or check file permissions

#### Issue: "MCP not enabled"
**Solution:** Check Cursor settings and restart Cursor

#### Issue: "Server not responding"
**Solution:** Check if port is in use or firewall blocking

### Contact Support
If none of the above steps work:
1. Check Cursor version (should be latest)
2. Try with a fresh Cursor installation
3. Check Windows version compatibility
4. Verify Node.js version (should be 18+)

