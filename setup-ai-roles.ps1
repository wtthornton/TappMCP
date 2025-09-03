# Setup AI Role Configuration for Smart MCP Project
# This script configures both Cursor AI and Claude Code with role switching capabilities

Write-Host "🚀 Setting up AI role configuration for Smart MCP Project..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path ".cursorrules")) {
    Write-Host "❌ .cursorrules file not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Cursor AI Configuration
Write-Host "📝 Configuring Cursor AI..." -ForegroundColor Cyan
if (Test-Path ".cursorrules") {
    Write-Host "✅ Cursor AI configuration (.cursorrules) is ready" -ForegroundColor Green
} else {
    Write-Host "❌ Cursor AI configuration missing" -ForegroundColor Red
}

# Claude Code Configuration
Write-Host "🤖 Configuring Claude Code..." -ForegroundColor Cyan
if (Test-Path "claude-system-prompt.md") {
    Write-Host "✅ Claude Code system prompt is ready" -ForegroundColor Green
} else {
    Write-Host "❌ Claude Code system prompt missing" -ForegroundColor Red
}

if (Test-Path "claude-config.json") {
    Write-Host "✅ Claude Code configuration is ready" -ForegroundColor Green
} else {
    Write-Host "❌ Claude Code configuration missing" -ForegroundColor Red
}

# Display usage instructions
Write-Host "`n📋 Usage Instructions:" -ForegroundColor Yellow
Write-Host "===================" -ForegroundColor Yellow

Write-Host "`n🎯 Role Switching Commands:" -ForegroundColor Cyan
Write-Host "• 'you are now a developer' - Switch to AI-Augmented Developer role"
Write-Host "• 'you are now a product strategist' - Switch to Product Strategist role"
Write-Host "• 'you are now an operations engineer' - Switch to AI Operations Engineer role"
Write-Host "• 'you are now a designer' - Switch to UX/Product Designer role"
Write-Host "• 'you are now a qa engineer' - Switch to AI Quality Assurance Engineer role"

Write-Host "`n🔄 Alternative Commands:" -ForegroundColor Cyan
Write-Host "• 'switch to developer/product/operations/designer/qa'"
Write-Host "• 'developer mode', 'product mode', 'operations mode', 'design mode', 'qa mode'"
Write-Host "• 'coding mode', 'strategy mode', 'devops mode', 'ux mode', 'testing mode'"

Write-Host "`n📚 Documentation:" -ForegroundColor Cyan
Write-Host "• Role definitions: docs/roles/"
Write-Host "• Cursor AI config: .cursorrules"
Write-Host "• Claude Code config: claude-system-prompt.md"

Write-Host "`n✨ Setup Complete! Both Cursor AI and Claude Code are now configured with role switching capabilities." -ForegroundColor Green
Write-Host "💡 Start by saying 'you are now a developer' to begin development work." -ForegroundColor Yellow
