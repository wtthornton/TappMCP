# Setup script for Cursor MCP integration
Write-Host "🎯 Setting up TappMCP for Cursor..." -ForegroundColor Green

# Check if Cursor settings directory exists
$cursorSettingsPath = "$env:APPDATA\Cursor\User\settings.json"
$cursorDir = Split-Path $cursorSettingsPath -Parent

if (-not (Test-Path $cursorDir)) {
    Write-Host "❌ Cursor settings directory not found at: $cursorDir" -ForegroundColor Red
    Write-Host "Please ensure Cursor is installed and run this script again." -ForegroundColor Yellow
    exit 1
}

# Backup existing settings
if (Test-Path $cursorSettingsPath) {
    $backupPath = "$cursorSettingsPath.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item $cursorSettingsPath $backupPath
    Write-Host "📋 Backed up existing settings to: $backupPath" -ForegroundColor Yellow
}

# Read existing settings or create new
if (Test-Path $cursorSettingsPath) {
    $settings = Get-Content $cursorSettingsPath | ConvertFrom-Json
} else {
    $settings = @{}
}

# Add MCP configuration
$mcpServers = @{
    "tappmcp" = @{
        "command" = "docker"
        "args" = @("exec", "-i", "tappmcp-smart-mcp-1", "node", "dist/server.js")
        "cwd" = "C:\cursor\TappMCP"
        "env" = @{
            "NODE_ENV" = "production"
        }
    }
}

$settings | Add-Member -NotePropertyName "mcp.servers" -NotePropertyValue $mcpServers -Force
$settings | Add-Member -NotePropertyName "mcp.enabled" -NotePropertyValue $true -Force

# Save settings
$settings | ConvertTo-Json -Depth 10 | Set-Content $cursorSettingsPath -Encoding UTF8

Write-Host "✅ Cursor MCP configuration updated!" -ForegroundColor Green
Write-Host "📍 Settings saved to: $cursorSettingsPath" -ForegroundColor Cyan

Write-Host "`n🎵 Next Steps:" -ForegroundColor Magenta
Write-Host "1. Restart Cursor" -ForegroundColor White
Write-Host "2. Open a new chat in Cursor" -ForegroundColor White
Write-Host "3. Try: smart_vibe 'make me a React todo app'" -ForegroundColor White
Write-Host "4. Try: smart_vibe 'check my code quality'" -ForegroundColor White

Write-Host "`n🚀 TappMCP is ready for vibe coding!" -ForegroundColor Green
