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
         "command": "docker",
         "args": ["exec", "-i", "tappmcp-smart-mcp-1", "node", "dist/mcp-only-server.js"],
         "env": {
           "NODE_ENV": "production"
         },
         "stdio": true,
         "description": "TappMCP Smart Vibe - AI-powered development assistant (Docker)"
       }
     },
     "mcp.enabled": true,
     "mcp.defaultServer": "tappmcp"
   }
   ```

### **Method 3: Command Line Setup**

Run this PowerShell command to automatically set up Cursor:

```powershell
# Ensure Docker container is running
docker-compose up -d

# Copy settings to Cursor
$settingsPath = "$env:APPDATA\Cursor\User\settings.json"
$settingsContent = Get-Content "cursor-settings.json" -Raw
$settingsContent | Out-File -FilePath $settingsPath -Encoding UTF8

Write-Host "✅ Cursor MCP configuration updated!"
Write-Host "🔄 Please restart Cursor to activate smart_vibe"
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
   docker ps
   # Should show tappmcp-smart-mcp-1
   ```

2. **Check Cursor settings:**
   - Open Cursor Settings (Ctrl+,)
   - Search for "mcp"
   - Verify tappmcp server is listed

3. **Restart Cursor completely**

4. **Check container name:**
   ```bash
   docker ps --format "table {{.Names}}\t{{.Status}}"
   # Container name must be: tappmcp-smart-mcp-1
   ```

## 📋 Required Files

- `cursor-settings.json` - Cursor MCP configuration
- `docker-compose.yml` - Docker setup (already exists)
- Running Docker container: `tappmcp-smart-mcp-1`

## ✅ Success Indicators

When properly configured, you should see:
- MCP server listed in Cursor settings
- `smart_vibe` command works in new agents
- No "command not found" errors
- TappMCP tools available in Cursor

---

**Note:** The key is that Cursor needs to know how to connect to your MCP server. The Docker container must be running, and Cursor must be configured to use it.
