# AI Role Configuration Setup

This project is configured with role-based AI assistance that works with both **Cursor AI** and **Claude Code**. You can switch between different roles using natural language commands.

## 🚀 Quick Setup

### Setup AI Role Configuration
The AI role configuration is automatically available when you open the project in Cursor AI or start Claude Code with the system prompt.

### Docker Development (Recommended)
```bash
# Build and start development container
npm run docker:dev

# Or build production container
npm run docker:build
```

## 🎯 Role Switching Commands

Both Cursor AI and Claude Code will respond to these commands:

### Primary Commands
- **"you are now a developer"** → AI-Augmented Developer role
- **"you are now a product strategist"** → Product Strategist role
- **"you are now an operations engineer"** → AI Operations Engineer role
- **"you are now a designer"** → UX/Product Designer role
- **"you are now a qa engineer"** → AI Quality Assurance Engineer role

### Alternative Commands
- **"switch to developer/product/operations/designer/qa"**
- **"developer mode", "product mode", "operations mode", "design mode", "qa mode"**
- **"coding mode", "strategy mode", "devops mode", "ux mode", "testing mode"**

## 📁 Configuration Files

### Cursor AI
- **`.cursorrules`** - Main configuration file with all role definitions
- Automatically loaded when you open the project in Cursor

### Claude Code
- **`docs/configuration/claude-system-prompt.md`** - System prompt with role definitions
- Load this when starting a Claude Code session

## 🔄 How It Works

### Cursor AI
1. Open the project in Cursor
2. The `.cursorrules` file is automatically loaded
3. Use role switching commands in the chat
4. AI responds with role-appropriate assistance

### Claude Code
1. Start Claude Code with the system prompt:
   ```bash
   claude --system-prompt docs/configuration/claude-system-prompt.md
   ```
2. Use role switching commands in the conversation
3. AI responds with role-appropriate assistance

## 🎭 Available Roles

### 1. AI-Augmented Developer (Default)
**Focus**: Code generation, architecture, and quality assurance
- TypeScript/Node.js best practices
- Performance optimization
- Security considerations
- Testing strategies

### 2. Product Strategist
**Focus**: Product vision, roadmap, and business analysis
- User value analysis
- Feature prioritization
- Market research
- Stakeholder communication

### 3. AI Operations Engineer
**Focus**: DevOps, security, and production deployment
- CI/CD pipelines
- Security compliance
- Performance monitoring
- Incident response

### 4. UX/Product Designer
**Focus**: User experience and interface design
- Design systems
- Usability optimization
- Accessibility compliance
- User research

### 5. AI Quality Assurance Engineer
**Focus**: Quality assurance and testing
- Test automation and strategy
- Quality validation and metrics
- Security and performance testing
- AI tool effectiveness assessment

## 💡 Usage Examples

### Development Work
```
You: "you are now a developer"
AI: "✅ Switched to AI-Augmented Developer role. I'm focused on clean code, architecture, and best practices. What would you like to build?"

You: "Create a TypeScript interface for the MCP server"
AI: [Provides TypeScript interface with proper typing, documentation, and best practices]
```

### Product Planning
```
You: "switch to product"
AI: "✅ Switched to Product Strategist role. I'm focused on user value and business impact. What product decisions need analysis?"

You: "Evaluate this feature for user value"
AI: [Provides user value analysis, market positioning, and ROI considerations]
```

### Operations Review
```
You: "you are now an operations engineer"
AI: "✅ Switched to AI Operations Engineer role. I'm focused on deployment, security, and reliability. What operational aspects need attention?"

You: "Review this code for production readiness"
AI: [Provides security analysis, performance considerations, and deployment recommendations]
```

## 📚 Documentation Structure

```
docs/roles/           # Detailed role definitions
├── ai-augmented-developer.md
├── product-strategist.md
├── ai-operations-engineer.md
├── ux-product-designer.md
├── ai-quality-assurance-engineer.md
└── README.md

.cursorrules          # Cursor AI configuration
docs/configuration/claude-system-prompt.md  # Claude Code system prompt
```

## 🔧 Customization

### Adding New Roles
1. Create role definition in `docs/roles/new-role.md`
2. Add role section to `.cursorrules`
3. Add role section to `docs/configuration/claude-system-prompt.md`
4. Update role switching triggers in both files

### Modifying Role Behavior
1. Edit the role definition in `docs/roles/`
2. Update the corresponding section in `.cursorrules`
3. Update the corresponding section in `docs/configuration/claude-system-prompt.md`

## 🎯 Benefits

- **Consistent Experience**: Same role switching works in both tools
- **Context Awareness**: AI understands your current focus area
- **Efficient Workflow**: No need to manually configure different tools
- **Comprehensive Coverage**: All SDLC roles covered with AI assistance
- **Easy Maintenance**: Single source of truth for role definitions

## 🚨 Troubleshooting

### Cursor AI Not Responding to Role Commands
- Ensure `.cursorrules` file is in project root
- Restart Cursor after making changes
- Check that the file is properly formatted

### Claude Code Not Switching Roles
- Ensure you're using the system prompt: `claude --system-prompt docs/configuration/claude-system-prompt.md`
- Check that the system prompt file is properly formatted
- Restart Claude Code session

### Role Definitions Not Loading
- Verify all files are in the correct locations
- Check file permissions
- Ensure markdown files are properly formatted

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all configuration files are present
3. Ensure you're using the correct commands
4. Review the role documentation in `docs/roles/`
