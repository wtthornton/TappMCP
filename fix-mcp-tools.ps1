# Fix MCP Tools for Cursor
# This script ensures the MCP server is properly set up and tools are available

Write-Host "🔧 Fixing MCP Tools for Cursor..." -ForegroundColor Green

# Step 1: Ensure container is running
Write-Host "🐳 Checking Docker container..." -ForegroundColor Yellow
$containerStatus = docker ps --filter "name=tappmcp-tappmcp-1" --format "{{.Status}}"
if ($containerStatus -match "Up") {
    Write-Host "✅ Container is running" -ForegroundColor Green
} else {
    Write-Host "🚀 Starting container..." -ForegroundColor Yellow
    docker-compose -f docker-compose.simple.yml up -d
    Start-Sleep -Seconds 5
}

# Step 2: Build MCP server if needed
Write-Host "📦 Building MCP server..." -ForegroundColor Yellow
npx tsc src/simple-mcp-server.ts --outDir dist --target es2020 --module esnext --moduleResolution node --allowSyntheticDefaultImports --esModuleInterop

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ MCP server built successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to build MCP server" -ForegroundColor Red
    exit 1
}

# Step 3: Copy MCP server to container
Write-Host "📋 Copying MCP server to container..." -ForegroundColor Yellow
docker exec tappmcp-tappmcp-1 mkdir -p /app/dist
docker cp dist/simple-mcp-server.js tappmcp-tappmcp-1:/app/dist/simple-mcp-server.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ MCP server copied to container" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to copy MCP server to container" -ForegroundColor Red
    exit 1
}

# Step 4: Test MCP server
Write-Host "🧪 Testing MCP server..." -ForegroundColor Yellow
$testRequest = '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}'
$testResponse = echo $testRequest | docker exec -i tappmcp-tappmcp-1 node dist/simple-mcp-server.js

if ($testResponse -match '"tools"') {
    Write-Host "✅ MCP server test passed" -ForegroundColor Green
} else {
    Write-Host "❌ MCP server test failed" -ForegroundColor Red
    Write-Host "Response: $testResponse" -ForegroundColor Red
    exit 1
}

# Step 5: Verify Cursor configuration
Write-Host "⚙️ Verifying Cursor configuration..." -ForegroundColor Yellow
$cursorConfigPath = "$env:APPDATA\Cursor\User\mcp.json"
if (Test-Path $cursorConfigPath) {
    $config = Get-Content $cursorConfigPath | ConvertFrom-Json
    if ($config.mcpServers.tappmcp.command -eq "docker") {
        Write-Host "✅ Cursor configuration looks correct" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Cursor configuration may need updating" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Cursor configuration not found at $cursorConfigPath" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 MCP Tools Fix Complete!" -ForegroundColor Green
Write-Host "📋 Available tools:" -ForegroundColor Cyan
Write-Host "  • smart_begin - Begin a new project with intelligent analysis" -ForegroundColor White
Write-Host "  • smart_plan - Create comprehensive project plans" -ForegroundColor White
Write-Host "  • smart_write - Generate code and documentation" -ForegroundColor White
Write-Host "  • smart_finish - Complete and finalize project tasks" -ForegroundColor White
Write-Host "  • smart_orchestrate - Orchestrate complex workflows" -ForegroundColor White
Write-Host "  • smart_converse - Intelligent development conversations" -ForegroundColor White
Write-Host "  • smart_vibe - Get the right vibe for development work" -ForegroundColor White
Write-Host ""
Write-Host "🔄 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Restart Cursor completely" -ForegroundColor White
Write-Host "  2. Go to Cursor Settings → MCP & Integrations" -ForegroundColor White
Write-Host "  3. Verify 'tappmcp' shows as enabled with tools" -ForegroundColor White
Write-Host "  4. If still showing 'No tools or prompts', try toggling the switch off/on" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Dashboard: http://localhost:3000" -ForegroundColor Cyan
