# Cursor MCP Setup Instructions

## 🚀 Quick Setup for New Cursor Agents

To make `smart_vibe` work in new Cursor agents, follow these steps:

### **Method 1: Copy Settings File (Recommended)**

1. **Copy the settings file to Cursor's config directory:**
   ```bash
   # Windows
   copy cursor-settings.json "%APPDATA%\Cursor\User\settings.json"

   # Or manually copy the contents of cursor-settings.json to:
   # C:\Users\[YourUsername]\AppData\Roaming\Cursor\User\settings.json
   ```

2. **Restart Cursor** after copying the settings

### **Method 2: Manual Configuration**

1. **Open Cursor Settings** (Ctrl+,)
2. **Go to Extensions** → **MCP**
3. **Add this configuration:**
   ```json
   {
     "mcp.servers": {
       "tappmcp": {
         "command": "node",
         "args": ["tappmcp-http-server.js"],
         "cwd": "C:\\cursor\\TappMCP",
         "env": {
           "NODE_ENV": "production"
         },
         "stdio": true,
         "description": "TappMCP Smart Vibe - AI-powered development assistant (Direct Node.js)"
       }
     },
     "mcp.enabled": true,
     "mcp.defaultServer": "tappmcp"
   }
   ```

### **Method 3: Command Line Setup**

Run this PowerShell command to automatically set up Cursor:

```powershell
# Ensure Node.js server is running
node tappmcp-http-server.js

# Copy settings to Cursor
$settingsPath = "$env:APPDATA\Cursor\User\settings.json"
$settingsContent = Get-Content "cursor-settings.json" -Raw
$settingsContent | Out-File -FilePath $settingsPath -Encoding UTF8

Write-Host "✅ Cursor MCP configuration updated!"
Write-Host "🔄 Please restart Cursor to activate smart_vibe"
Write-Host "🌐 Dashboard available at: http://localhost:3000"
```

## 🔍 Verification

After setup, test that `smart_vibe` works:

1. **Open a new Cursor agent**
2. **Type:** `smart_vibe "create a hello world html page"`
3. **Should work** if properly configured

## 🛠️ Troubleshooting

### **If smart_vibe doesn't work:**

1. **Check Node.js server is running:**
   ```bash
   # Check if port 3000 is listening
   netstat -an | findstr :3000
   # Or test the dashboard
   curl http://localhost:3000
   ```

2. **Check Cursor settings:**
   - Open Cursor Settings (Ctrl+,)
   - Search for "mcp"
   - Verify tappmcp server is listed

3. **Restart Cursor completely**

4. **Verify server path:**
   ```bash
   # Ensure tappmcp-http-server.js exists
   dir tappmcp-http-server.js
   # Should show the file in C:\cursor\TappMCP\
   ```

## 📋 Required Files

- `cursor-settings.json` - Cursor MCP configuration
- `tappmcp-http-server.js` - Main server file
- `docker-compose.yml` - Docker setup (optional, for production)
- Running Node.js server on port 3000

## ✅ Success Indicators

When properly configured, you should see:
- MCP server listed in Cursor settings
- `smart_vibe` command works in new agents
- No "command not found" errors
- TappMCP tools available in Cursor

---

**Note:** The key is that Cursor needs to know how to connect to your MCP server. The Docker container must be running, and Cursor must be configured to use it.
