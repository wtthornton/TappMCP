# TappMCP Local Setup Script
Write-Host "Setting up TappMCP for Cursor integration..." -ForegroundColor Green

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js not found. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Check if working MCP server exists
if (Test-Path "working-mcp-server.js") {
    Write-Host "Working MCP server found" -ForegroundColor Green
} else {
    Write-Host "working-mcp-server.js not found" -ForegroundColor Red
    exit 1
}

# Create Cursor settings directory if it doesn't exist
$cursorSettingsPath = "$env:APPDATA\Cursor\User"
if (!(Test-Path $cursorSettingsPath)) {
    New-Item -ItemType Directory -Path $cursorSettingsPath -Force
    Write-Host "Created Cursor settings directory" -ForegroundColor Yellow
}

# Backup existing settings
$settingsFile = "$cursorSettingsPath\settings.json"
if (Test-Path $settingsFile) {
    $backupFile = "$settingsFile.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item $settingsFile $backupFile
    Write-Host "Backed up existing settings to: $backupFile" -ForegroundColor Yellow
}

# Copy MCP configuration
$mcpConfig = Get-Content "cursor-mcp-config.json" -Raw
$settings = @{
    "mcp.servers" = (ConvertFrom-Json $mcpConfig)."mcp.servers"
    "mcp.enabled" = $true
    "mcp.defaultServer" = "tappmcp-local"
}

# Write new settings
$settings | ConvertTo-Json -Depth 10 | Out-File -FilePath $settingsFile -Encoding UTF8
Write-Host "Cursor MCP configuration updated" -ForegroundColor Green

Write-Host ""
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart Cursor completely" -ForegroundColor White
Write-Host "2. The TappMCP tools should now appear in Cursor" -ForegroundColor White
Write-Host "3. Try using: smart_vibe test the connection" -ForegroundColor White
Write-Host ""
Write-Host "Available tools:" -ForegroundColor Cyan
Write-Host "- smart_begin - Project initialization" -ForegroundColor White
Write-Host "- smart_plan - Project planning" -ForegroundColor White
Write-Host "- smart_write - Code generation" -ForegroundColor White
Write-Host "- smart_finish - Quality assurance" -ForegroundColor White
Write-Host "- smart_orchestrate - Workflow automation" -ForegroundColor White
Write-Host "- smart_converse - Natural language interface" -ForegroundColor White
Write-Host "- smart_vibe - Full VibeTapp interface" -ForegroundColor White
Write-Host ""
Write-Host "Configuration file: $settingsFile" -ForegroundColor Gray
