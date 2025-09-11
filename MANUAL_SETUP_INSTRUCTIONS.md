# 🎯 Manual Setup Instructions for Cursor MCP Integration

## 📋 **Step-by-Step Guide:**

### **Step 1: Open Cursor Settings**
1. Open Cursor
2. Press `Ctrl + ,` (or `Cmd + ,` on Mac) to open Settings
3. Click on "Open Settings (JSON)" in the top right

### **Step 2: Add MCP Configuration**
Add this configuration to your `settings.json` file:

```json
{
  "mcp.servers": {
    "tappmcp": {
      "command": "node",
      "args": ["dist/server.js"],
      "cwd": "C:\\cursor\\TappMCP",
      "env": {
        "NODE_ENV": "production"
      }
    }
  },
  "mcp.enabled": true
}
```

### **Step 3: Save and Restart**
1. Save the settings file (`Ctrl + S`)
2. Close and restart Cursor completely

### **Step 4: Test the Integration**
1. Open a new chat in Cursor
2. Try these commands:
   ```
   smart_vibe "make me a React todo app"
   smart_vibe "check my code quality"
   smart_vibe "improve this function" { role: "developer" }
   ```

## 🎵 **What You'll Get:**

- **Natural language commands** in Cursor
- **Full VibeTapp functionality** through MCP
- **Rich formatted responses** with emojis and metrics
- **Context management** and role switching
- **All existing MCP tools** still available

## 🚀 **Current Status:**
- ✅ TappMCP server is running
- ✅ smart_vibe tool is integrated
- ✅ Ready for Cursor configuration

## 🔧 **Alternative: Copy Configuration**
You can also copy the contents of `cursor-settings-example.json` and merge it with your existing Cursor settings.
