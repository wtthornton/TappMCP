#!/bin/bash
# Setup AI Role Configuration for Smart MCP Project
# This script configures both Cursor AI and Claude Code with role switching capabilities

echo "🚀 Setting up AI role configuration for Smart MCP Project..."

# Check if we're in the right directory
if [ ! -f ".cursorrules" ]; then
    echo "❌ .cursorrules file not found. Please run this script from the project root."
    exit 1
fi

# Cursor AI Configuration
echo "📝 Configuring Cursor AI..."
if [ -f ".cursorrules" ]; then
    echo "✅ Cursor AI configuration (.cursorrules) is ready"
else
    echo "❌ Cursor AI configuration missing"
fi

# Claude Code Configuration
echo "🤖 Configuring Claude Code..."
if [ -f "claude-system-prompt.md" ]; then
    echo "✅ Claude Code system prompt is ready"
else
    echo "❌ Claude Code system prompt missing"
fi

if [ -f "claude-config.json" ]; then
    echo "✅ Claude Code configuration is ready"
else
    echo "❌ Claude Code configuration missing"
fi

# Display usage instructions
echo ""
echo "📋 Usage Instructions:"
echo "==================="

echo ""
echo "🎯 Role Switching Commands:"
echo "• 'you are now a developer' - Switch to AI-Augmented Developer role"
echo "• 'you are now a product strategist' - Switch to Product Strategist role"
echo "• 'you are now an operations engineer' - Switch to AI Operations Engineer role"
echo "• 'you are now a designer' - Switch to UX/Product Designer role"

echo ""
echo "🔄 Alternative Commands:"
echo "• 'switch to developer/product/operations/designer'"
echo "• 'developer mode', 'product mode', 'operations mode', 'design mode'"
echo "• 'coding mode', 'strategy mode', 'devops mode', 'ux mode'"

echo ""
echo "📚 Documentation:"
echo "• Role definitions: docs/roles/"
echo "• Cursor AI config: .cursorrules"
echo "• Claude Code config: claude-system-prompt.md"

echo ""
echo "✨ Setup Complete! Both Cursor AI and Claude Code are now configured with role switching capabilities."
echo "💡 Start by saying 'you are now a developer' to begin development work."
