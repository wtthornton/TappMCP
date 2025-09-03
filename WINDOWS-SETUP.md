# Windows Development Setup for TappMCP

This guide provides Windows-specific setup instructions and commands for the TappMCP project.

## 🪟 Windows-Specific Features

### Automatic Detection
The project automatically detects Windows environments and configures:
- Line ending handling (CRLF)
- PowerShell execution policies
- Windows-specific paths and environment variables
- Git configuration for Windows
- VS Code settings optimized for Windows

### Windows Batch Files
Convenient batch files for common operations:
- `build.bat` - Build the project
- `dev.bat` - Start development server
- `test.bat` - Run tests
- `lint.bat` - Run linter
- `start.bat` - Start production server

### PowerShell Aliases
After running the Windows setup, you'll have these PowerShell aliases:
- `tbuild` - Build the project
- `tdev` - Start development server
- `ttest` - Run tests
- `tlint` - Run linter
- `tstart` - Start production server
- `trole [role]` - Switch AI role

## 🚀 Quick Windows Setup

### Option 1: Automatic Setup (Recommended)
```powershell
# Run the comprehensive Windows setup
npm run windows-setup
```

### Option 2: Manual Setup
```powershell
# Install dependencies
npm install

# Copy Windows environment configuration
copy windows.env .env

# Run the Windows setup script
powershell -ExecutionPolicy Bypass -File windows-setup.ps1
```

## 📋 Prerequisites

### Required Software
- **Windows 10/11** (tested on Windows 10.0.26100)
- **PowerShell 5.1+** or **PowerShell Core 7+**
- **Node.js 18+** (will be installed automatically if missing)
- **Git** (will be installed automatically if missing)

### Optional Software
- **Chocolatey** (for package management)
- **VS Code** (recommended IDE)
- **Windows Terminal** (enhanced terminal experience)

## 🔧 Windows-Specific Configuration

### Environment Variables
The project sets up these Windows-specific environment variables:
```env
PLATFORM=windows
OS_VERSION=10.0.26100
NODE_OPTIONS=--max-old-space-size=4096
POWERSHELL_EXECUTION_POLICY=Bypass
```

### Git Configuration
Automatically configures Git for Windows:
```bash
git config --global core.autocrlf true
git config --global core.safecrlf true
```

### VS Code Settings
Creates Windows-optimized VS Code settings:
- Line ending: CRLF
- Terminal: PowerShell default
- TypeScript: Enhanced auto-imports
- ESLint: Auto-fix on save

## 🎯 Windows Commands

### Development Commands
```powershell
# Using npm scripts
npm run windows-build
npm run windows-dev
npm run windows-test
npm run windows-lint
npm run windows-start

# Using batch files directly
.\build.bat
.\dev.bat
.\test.bat
.\lint.bat
.\start.bat

# Using PowerShell aliases (after setup)
tbuild
tdev
ttest
tlint
tstart
```

### Role Switching (Windows)
```powershell
# Using PowerShell script
.\switch-role.ps1 developer
.\switch-role.ps1 product
.\switch-role.ps1 operations
.\switch-role.ps1 designer
.\switch-role.ps1 qa

# Using alias (after setup)
trole developer
trole product
trole operations
trole designer
trole qa
```

## 🛠️ Troubleshooting

### PowerShell Execution Policy
If you get execution policy errors:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Node.js Path Issues
If Node.js is not found:
```powershell
# Refresh environment variables
refreshenv

# Or restart PowerShell
```

### Git Line Ending Issues
If you encounter line ending problems:
```powershell
# Reconfigure git
git config --global core.autocrlf true
git config --global core.safecrlf true

# Refresh the repository
git add --renormalize .
git commit -m "Normalize line endings"
```

### VS Code Terminal Issues
If VS Code terminal doesn't work properly:
1. Open VS Code settings (Ctrl+,)
2. Search for "terminal.integrated.defaultProfile.windows"
3. Set to "PowerShell"

## 📁 Windows File Structure

```
TappMCP/
├── windows-setup.ps1          # Windows environment setup
├── windows.env                # Windows environment template
├── build.bat                  # Windows build script
├── dev.bat                    # Windows dev script
├── test.bat                   # Windows test script
├── lint.bat                   # Windows lint script
├── start.bat                  # Windows start script
├── .vscode/
│   ├── settings.json          # Windows-optimized VS Code settings
│   └── launch.json            # Windows debug configuration
└── scripts/
    └── postinstall.js         # Windows detection and setup
```

## 🔄 Windows-Specific Workflows

### Development Workflow
1. Open PowerShell in project directory
2. Run `tdev` to start development server
3. Use `trole [role]` to switch AI roles
4. Use `ttest` to run tests
5. Use `tbuild` to build for production

### Debugging Workflow
1. Open VS Code
2. Press F5 to start debugging
3. Use integrated PowerShell terminal
4. Set breakpoints in TypeScript files

### Git Workflow
1. Use Windows Git Bash or PowerShell
2. Line endings are automatically handled
3. Use `git add .` and `git commit -m "message"`
4. Use `git push` to push changes

## 🎉 Benefits of Windows Setup

- **Seamless Integration**: Works with Windows development tools
- **Performance Optimized**: Configured for Windows file system
- **PowerShell Integration**: Native PowerShell commands and aliases
- **VS Code Ready**: Pre-configured for optimal Windows development
- **Git Optimized**: Proper line ending handling
- **Batch File Support**: Easy-to-use Windows batch files
- **Environment Detection**: Automatic Windows-specific configuration

## 📞 Windows Support

For Windows-specific issues:
1. Check the troubleshooting section above
2. Ensure all prerequisites are installed
3. Run `npm run windows-setup` to reconfigure
4. Check PowerShell execution policy
5. Verify Node.js and Git installation

---

**Ready for Windows development?** Run `npm run windows-setup` to get started!
