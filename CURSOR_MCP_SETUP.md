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
         "args": ["dist/mcp-docker-server.js", "--stdio"],
         "cwd": "C:\\cursor\\TappMCP",
         "env": {
           "NODE_ENV": "production",
           "CONTEXT7_ENABLED": "true",
           "CONTEXT7_API_KEY": "your_context7_api_key_here"
         },
         "stdio": true,
         "description": "TappMCP - AI-powered development assistant with Context7 integration"
       }
     },
     "mcp.enabled": true,
     "mcp.defaultServer": "tappmcp"
   }
   ```

### **Method 3: Command Line Setup**

Run this PowerShell command to automatically set up Cursor:

```powershell
# Build the project first
npm run build

# Copy settings to Cursor
$settingsPath = "$env:APPDATA\Cursor\User\settings.json"
$settingsContent = Get-Content "cursor-settings.json" -Raw
$settingsContent | Out-File -FilePath $settingsPath -Encoding UTF8

Write-Host "✅ Cursor MCP configuration updated!"
Write-Host "🔄 Please restart Cursor to activate smart_vibe"
Write-Host "🌐 Dashboard available at: http://localhost:8080"
Write-Host "📊 Use docker-compose up --build -d for full deployment"
```

## 🔍 Verification

After setup, test that `smart_vibe` works:

1. **Open a new Cursor agent**
2. **Type:** `smart_vibe "create a hello world html page"`
3. **Should work** if properly configured

## 🛠️ Troubleshooting

### **If smart_vibe doesn't work:**

1. **Check Docker container is running:**
   ```bash
   # Check if container is running
   docker ps | findstr tappmcp-smart-mcp-1
   # Or test the dashboard
   curl http://localhost:8080/health
   ```

2. **Check Cursor settings:**
   - Open Cursor Settings (Ctrl+,)
   - Search for "mcp"
   - Verify tappmcp server is listed

3. **Restart Cursor completely**

4. **Verify server path:**
   ```bash
   # Ensure dist/mcp-docker-server.js exists
   dir dist\mcp-docker-server.js
   # Should show the file in C:\cursor\TappMCP\dist\
   ```

## 📋 Required Files

- `cursor-settings.json` - Cursor MCP configuration
- `dist/mcp-docker-server.js` - Main server file (after build)
- `docker-compose.yml` - Docker setup (recommended for production)
- Running Docker container on port 8080

## ✅ Success Indicators

When properly configured, you should see:
- MCP server listed in Cursor settings
- `smart_vibe` command works in new agents
- No "command not found" errors
- TappMCP tools available in Cursor

---

**Note:** The key is that Cursor needs to know how to connect to your MCP server. Either build and run locally with `npm run build` or use Docker with `docker-compose up --build -d`. Cursor must be configured to use the correct server path.
