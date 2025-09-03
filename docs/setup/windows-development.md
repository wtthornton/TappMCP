# Windows Development Guide for TappMCP

This guide provides detailed Windows development instructions and best practices for the TappMCP project.

## 🪟 Windows Development Environment

### System Requirements
- **Windows 10/11** (Build 1903 or later)
- **PowerShell 5.1+** or **PowerShell Core 7+**
- **Node.js 18+** (LTS recommended)
- **Git for Windows**
- **VS Code** (recommended)

### Recommended Tools
- **Windows Terminal** - Enhanced terminal experience
- **Chocolatey** - Package manager for Windows
- **Git for Windows** - Git with Windows integration
- **PowerShell Core 7+** - Modern PowerShell

## 🚀 Windows Setup Process

### 1. Initial Setup
```powershell
# Clone the repository
git clone https://github.com/wtthornton/TappMCP.git
cd TappMCP

# Run comprehensive Windows setup
npm run windows-setup
```

### 2. Manual Setup (Alternative)
```powershell
# Install Node.js (if not present)
choco install nodejs -y

# Install Git (if not present)
choco install git -y

# Install project dependencies
npm install

# Copy Windows environment configuration
copy windows.env .env

# Run role setup
.\setup-ai-roles.ps1
```

## 🔧 Windows-Specific Configuration

### Environment Variables
The project automatically configures these Windows-specific variables:

```env
# Platform identification
PLATFORM=windows
OS_VERSION=10.0.26100

# Development settings
NODE_ENV=development
DEVELOPMENT_MODE=true

# Windows paths
USERPROFILE=%USERPROFILE%
APPDATA=%APPDATA%
LOCALAPPDATA=%LOCALAPPDATA%

# PowerShell settings
POWERSHELL_EXECUTION_POLICY=Bypass
POWERSHELL_PROFILE=$PROFILE

# Node.js optimization
NODE_OPTIONS=--max-old-space-size=4096
NPM_CONFIG_CACHE=%LOCALAPPDATA%\npm-cache
```

### Git Configuration
Windows-specific Git settings:
```bash
# Line ending handling
git config --global core.autocrlf true
git config --global core.safecrlf true

# Editor configuration
git config --global core.editor "code --wait"

# Pager configuration
git config --global core.pager "less -R"
```

### VS Code Configuration
Windows-optimized VS Code settings:
```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "editor.formatOnSave": true,
  "files.eol": "\r\n",
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true,
  "terminal.integrated.defaultProfile.windows": "PowerShell"
}
```

## 🎯 Windows Development Commands

### PowerShell Aliases
After setup, these aliases are available:
```powershell
# Development commands
tbuild          # Build the project
tdev            # Start development server
ttest           # Run tests
tlint           # Run linter
tstart          # Start production server

# Role switching
trole developer # Switch to developer role
trole product   # Switch to product role
trole operations # Switch to operations role
trole designer  # Switch to designer role
trole qa        # Switch to QA role
```

### Batch Files
Windows batch files for easy execution:
```cmd
build.bat       # Build the project
dev.bat         # Start development server
test.bat        # Run tests
lint.bat        # Run linter
start.bat       # Start production server
```

### NPM Scripts
Windows-specific npm scripts:
```powershell
npm run windows-setup    # Full Windows environment setup
npm run windows-build    # Build using batch file
npm run windows-dev      # Development using batch file
npm run windows-test     # Test using batch file
npm run windows-lint     # Lint using batch file
npm run windows-start    # Start using batch file
```

## 🛠️ Windows Development Workflow

### Daily Development
1. **Open PowerShell** in project directory
2. **Start development**: `tdev` or `.\dev.bat`
3. **Switch roles**: `trole [role]` as needed
4. **Run tests**: `ttest` or `.\test.bat`
5. **Build**: `tbuild` or `.\build.bat`

### Debugging
1. **Open VS Code** in project directory
2. **Press F5** to start debugging
3. **Set breakpoints** in TypeScript files
4. **Use integrated terminal** for commands

### Git Workflow
1. **Use PowerShell** or **Git Bash**
2. **Stage changes**: `git add .`
3. **Commit**: `git commit -m "message"`
4. **Push**: `git push`

## 🔍 Windows-Specific Features

### Line Ending Handling
- **Automatic CRLF** conversion for Windows
- **Git configuration** for proper line endings
- **VS Code settings** for consistent formatting

### Path Handling
- **Windows paths** properly configured
- **Environment variables** for Windows directories
- **Node.js path resolution** optimized

### PowerShell Integration
- **Execution policy** configured
- **Profile setup** with aliases
- **Terminal integration** with VS Code

### Performance Optimization
- **Node.js memory** increased for Windows
- **TypeScript compilation** optimized
- **File watching** configured for Windows

## 🚨 Windows Troubleshooting

### Common Issues

#### PowerShell Execution Policy
```powershell
# Error: Execution policy prevents script execution
# Solution:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### Node.js Not Found
```powershell
# Error: 'node' is not recognized
# Solution:
refreshenv  # Refresh environment variables
# Or restart PowerShell
```

#### Git Line Endings
```powershell
# Error: Line ending issues
# Solution:
git config --global core.autocrlf true
git add --renormalize .
git commit -m "Normalize line endings"
```

#### VS Code Terminal Issues
```powershell
# Error: Terminal not working properly
# Solution:
# 1. Open VS Code settings (Ctrl+,)
# 2. Search for "terminal.integrated.defaultProfile.windows"
# 3. Set to "PowerShell"
```

### Performance Issues

#### Slow File Watching
```powershell
# Solution: Increase file watcher limits
echo fs.inotify.max_user_watches=524288 | Out-File -FilePath C:\temp\wsl.conf -Encoding ASCII
```

#### Memory Issues
```powershell
# Solution: Increase Node.js memory
$env:NODE_OPTIONS = "--max-old-space-size=8192"
```

## 📁 Windows File Structure

```
TappMCP/
├── windows-setup.ps1          # Windows environment setup
├── windows.env                # Windows environment template
├── WINDOWS-SETUP.md           # Windows setup guide
├── build.bat                  # Windows build script
├── dev.bat                    # Windows dev script
├── test.bat                   # Windows test script
├── lint.bat                   # Windows lint script
├── start.bat                  # Windows start script
├── .vscode/
│   ├── settings.json          # Windows-optimized settings
│   └── launch.json            # Windows debug configuration
├── scripts/
│   └── postinstall.js         # Windows detection and setup
└── docs/setup/
    └── windows-development.md # This file
```

## 🎉 Windows Development Benefits

- **Native Integration**: Works seamlessly with Windows tools
- **Performance Optimized**: Configured for Windows file system
- **PowerShell Ready**: Native PowerShell commands and aliases
- **VS Code Optimized**: Pre-configured for Windows development
- **Git Optimized**: Proper line ending and path handling
- **Batch File Support**: Easy-to-use Windows batch files
- **Automatic Detection**: Windows-specific configuration

## 📞 Windows Support

For Windows-specific issues:
1. Check this troubleshooting guide
2. Run `npm run windows-setup` to reconfigure
3. Verify PowerShell execution policy
4. Check Node.js and Git installation
5. Review VS Code terminal settings

---

**Ready for Windows development?** The project is optimized for Windows development with automatic detection and configuration!
