# TappMCP - Smart MCP Project

A Model Context Protocol (MCP) server implementation with AI-assisted development capabilities, featuring role-based AI assistant configuration for both Cursor AI and Claude Code.

## 🚀 Features

- **Role-Based AI Development**: Switch between 4 specialized roles using natural language commands
- **Dual AI Tool Support**: Works seamlessly with both Cursor AI and Claude Code
- **TypeScript/Node.js Foundation**: Modern MCP server implementation
- **Comprehensive Documentation**: Detailed role definitions and setup guides
- **Automated Setup**: One-click configuration scripts for Windows and Unix systems

## 🎭 Available Roles

### 1. AI-Augmented Developer (Default)
- Code generation, refactoring, and debugging
- Architecture decisions and system design
- Performance optimization and security
- Testing strategies and implementation

### 2. Product Strategist
- Product vision and roadmap definition
- User story creation and acceptance criteria
- Market research and competitive analysis
- Stakeholder communication

### 3. AI Operations Engineer
- CI/CD pipeline with AI integration
- Security and compliance oversight
- Performance monitoring and optimization
- Production support and incident response

### 4. UX/Product Designer
- User experience design and research
- Design system creation and maintenance
- Accessibility and usability optimization
- AI-assisted prototyping and testing

## 🎯 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/wtthornton/TappMCP.git
cd TappMCP
```

### 2. Setup AI Role Configuration
```bash
# Windows
.\setup-ai-roles.ps1

# Unix/Linux/Mac
chmod +x setup-ai-roles.sh
./setup-ai-roles.sh
```

### 3. Start Development
Open the project in Cursor AI or start Claude Code with the system prompt:
```bash
claude --system-prompt claude-system-prompt.md
```

## 🔄 Role Switching Commands

Use these natural language commands to switch between roles:

- **"you are now a developer"** → AI-Augmented Developer
- **"you are now a product strategist"** → Product Strategist
- **"you are now an operations engineer"** → AI Operations Engineer
- **"you are now a designer"** → UX/Product Designer

Alternative commands: `switch to [role]`, `[role] mode`, `coding mode`, `strategy mode`, `devops mode`, `ux mode`

## 📁 Project Structure

```
TappMCP/
├── .cursorrules                    # Cursor AI configuration
├── claude-system-prompt.md         # Claude Code system prompt
├── claude-config.json              # Claude Code configuration
├── docs/roles/                     # Role definitions
│   ├── ai-augmented-developer.md
│   ├── product-strategist.md
│   ├── ai-operations-engineer.md
│   └── ux-product-designer.md
├── src/                           # Source code
│   ├── server.ts                  # MCP server implementation
│   └── tools/                     # MCP tools
├── setup-ai-roles.ps1             # Windows setup script
├── setup-ai-roles.sh              # Unix setup script
└── AI-ROLE-SETUP.md               # Detailed setup guide
```

## 🛠️ Development

### Prerequisites
- Node.js (v18 or higher)
- TypeScript
- Cursor AI or Claude Code

### Installation
```bash
npm install
```

### Building
```bash
npm run build
```

### Running
```bash
npm start
```

## 📚 Documentation

- **[AI Role Setup Guide](AI-ROLE-SETUP.md)** - Comprehensive setup and usage instructions
- **[Role Definitions](docs/roles/)** - Detailed role documentation
- **[Vision](VISION.md)** - Project vision and goals
- **[Tech Stack](TECHSTACK.md)** - Technology choices and rationale

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with both Cursor AI and Claude Code
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with the Model Context Protocol (MCP) specification
- Designed for AI-assisted development workflows
- Optimized for both Cursor AI and Claude Code integration

## 📞 Support

For questions or issues:
1. Check the [AI Role Setup Guide](AI-ROLE-SETUP.md)
2. Review the [troubleshooting section](AI-ROLE-SETUP.md#-troubleshooting)
3. Open an issue on GitHub

---

**Ready to start AI-assisted development?** Run the setup script and say "you are now a developer" to begin!
