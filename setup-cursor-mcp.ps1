# TappMCP Cursor Setup Script
# This script sets up the MCP server for Cursor integration

Write-Host "Setting up TappMCP for Cursor..." -ForegroundColor Green

# Build the MCP server
Write-Host "Building MCP server..." -ForegroundColor Yellow
npx tsc src/simple-mcp-server.ts --outDir dist --target es2020 --module esnext --moduleResolution node --allowSyntheticDefaultImports --esModuleInterop

if ($LASTEXITCODE -eq 0) {
    Write-Host "MCP server built successfully" -ForegroundColor Green
} else {
    Write-Host "Failed to build MCP server" -ForegroundColor Red
    exit 1
}

# Test the MCP server
Write-Host "Testing MCP server..." -ForegroundColor Yellow
$testRequest = '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}'
$testResponse = echo $testRequest | node dist/simple-mcp-server.js

if ($testResponse -match '"tools"') {
    Write-Host "MCP server test passed" -ForegroundColor Green
} else {
    Write-Host "MCP server test failed" -ForegroundColor Red
    Write-Host "Response: $testResponse" -ForegroundColor Red
    exit 1
}

# Copy settings to Cursor
Write-Host "Configuring Cursor settings..." -ForegroundColor Yellow
$cursorSettingsPath = "$env:APPDATA\Cursor\User\settings.json"

# Backup existing settings if they exist
if (Test-Path $cursorSettingsPath) {
    Copy-Item $cursorSettingsPath "$cursorSettingsPath.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')" -Force
    Write-Host "Backed up existing Cursor settings" -ForegroundColor Yellow
}

# Copy new settings
Copy-Item "cursor-settings.json" $cursorSettingsPath -Force

if (Test-Path $cursorSettingsPath) {
    Write-Host "Cursor settings updated successfully" -ForegroundColor Green
} else {
    Write-Host "Failed to update Cursor settings" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "TappMCP setup complete!" -ForegroundColor Green
Write-Host "Available tools:" -ForegroundColor Cyan
Write-Host "  - smart_begin - Begin a new project with intelligent analysis" -ForegroundColor White
Write-Host "  - smart_plan - Create comprehensive project plans" -ForegroundColor White
Write-Host "  - smart_write - Generate code and documentation" -ForegroundColor White
Write-Host "  - smart_finish - Complete and finalize project tasks" -ForegroundColor White
Write-Host "  - smart_orchestrate - Orchestrate complex workflows" -ForegroundColor White
Write-Host "  - smart_converse - Intelligent development conversations" -ForegroundColor White
Write-Host "  - smart_vibe - Get the right vibe for development work" -ForegroundColor White
Write-Host ""
Write-Host "Please restart Cursor to load the new MCP configuration" -ForegroundColor Yellow
Write-Host "Dashboard available at: http://localhost:3000" -ForegroundColor Cyan
