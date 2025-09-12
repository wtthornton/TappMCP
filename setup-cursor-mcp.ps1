# TappMCP Cursor Setup Script
# This script configures Cursor to use the TappMCP MCP server

Write-Host "🚀 Setting up TappMCP for Cursor..." -ForegroundColor Green

# Check if Docker is running
Write-Host "📋 Checking Docker container..." -ForegroundColor Yellow
$containerStatus = docker ps --filter "name=tappmcp-smart-mcp-1" --format "{{.Status}}"
if ($containerStatus -notlike "*Up*") {
    Write-Host "⚠️  Docker container not running. Starting it..." -ForegroundColor Yellow
    docker-compose up -d
    Start-Sleep -Seconds 5
}

# Verify container is running
$containerRunning = docker ps --filter "name=tappmcp-smart-mcp-1" --format "{{.Names}}"
if ($containerRunning -eq "tappmcp-smart-mcp-1") {
    Write-Host "✅ Docker container is running" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to start Docker container" -ForegroundColor Red
    exit 1
}

# Create Cursor settings directory if it doesn't exist
$cursorSettingsDir = "$env:APPDATA\Cursor\User"
if (!(Test-Path $cursorSettingsDir)) {
    New-Item -ItemType Directory -Path $cursorSettingsDir -Force
    Write-Host "📁 Created Cursor settings directory" -ForegroundColor Yellow
}

# Backup existing settings
$settingsPath = "$cursorSettingsDir\settings.json"
if (Test-Path $settingsPath) {
    $backupPath = "$settingsPath.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item $settingsPath $backupPath
    Write-Host "💾 Backed up existing settings to: $backupPath" -ForegroundColor Yellow
}

# Copy MCP settings
$mcpSettings = @"
{
  "mcp.servers": {
    "tappmcp": {
      "command": "docker",
      "args": ["exec", "-i", "tappmcp-smart-mcp-1", "node", "dist/server.js"],
      "env": {
        "NODE_ENV": "production"
      },
      "stdio": true,
      "description": "TappMCP Smart Vibe - AI-powered development assistant"
    }
  },
  "mcp.enabled": true,
  "mcp.defaultServer": "tappmcp"
}
"@

$mcpSettings | Out-File -FilePath $settingsPath -Encoding UTF8
Write-Host "✅ Cursor MCP configuration updated" -ForegroundColor Green

# Test MCP connection
Write-Host "🧪 Testing MCP connection..." -ForegroundColor Yellow
$testResult = echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | docker exec -i tappmcp-smart-mcp-1 node dist/server.js 2>$null
if ($testResult -like "*smart_vibe*") {
    Write-Host "✅ MCP connection successful - smart_vibe tool available" -ForegroundColor Green
} else {
    Write-Host "⚠️  MCP connection test failed, but configuration is set" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Restart Cursor completely" -ForegroundColor White
Write-Host "   2. Open a new Cursor agent" -ForegroundColor White
Write-Host "   3. Test with: smart_vibe 'create a hello world html page'" -ForegroundColor White
Write-Host ""
Write-Host "🔧 If it doesn't work:" -ForegroundColor Yellow
Write-Host "   - Check Docker container: docker ps" -ForegroundColor White
Write-Host "   - Check Cursor settings: Ctrl+, then search 'mcp'" -ForegroundColor White
Write-Host "   - Restart Cursor again" -ForegroundColor White
