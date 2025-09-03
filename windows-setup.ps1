# Windows Development Environment Setup for TappMCP
# This script sets up the Windows development environment with all necessary tools

Write-Host "🪟 Setting up Windows development environment for TappMCP..." -ForegroundColor Green

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "⚠️  Some operations may require Administrator privileges" -ForegroundColor Yellow
}

# Check Windows version
$osVersion = [System.Environment]::OSVersion.Version
Write-Host "🖥️  Windows Version: $($osVersion.Major).$($osVersion.Minor)" -ForegroundColor Cyan

# Check if Chocolatey is installed
$chocoInstalled = Get-Command choco -ErrorAction SilentlyContinue
if (-not $chocoInstalled) {
    Write-Host "📦 Installing Chocolatey package manager..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
} else {
    Write-Host "✅ Chocolatey is already installed" -ForegroundColor Green
}

# Install Node.js if not present
$nodeInstalled = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeInstalled) {
    Write-Host "📦 Installing Node.js..." -ForegroundColor Yellow
    choco install nodejs -y
} else {
    $nodeVersion = node --version
    Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
}

# Install Git if not present
$gitInstalled = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitInstalled) {
    Write-Host "📦 Installing Git..." -ForegroundColor Yellow
    choco install git -y
} else {
    $gitVersion = git --version
    Write-Host "✅ Git is installed: $gitVersion" -ForegroundColor Green
}

# Install TypeScript globally
Write-Host "📦 Installing TypeScript globally..." -ForegroundColor Yellow
npm install -g typescript

# Install development tools
Write-Host "📦 Installing development tools..." -ForegroundColor Yellow
npm install -g ts-node
npm install -g eslint
npm install -g @types/node

# Install project dependencies
Write-Host "📦 Installing project dependencies..." -ForegroundColor Yellow
npm install

# Set up Windows-specific environment variables
Write-Host "🔧 Setting up Windows environment variables..." -ForegroundColor Yellow
$env:PLATFORM = "windows"
$env:DEVELOPMENT_MODE = "true"

# Create Windows-specific batch files for common commands
Write-Host "📝 Creating Windows batch files..." -ForegroundColor Yellow

# Create build.bat
@"
@echo off
echo Building TappMCP project...
call npm run build
if %ERRORLEVEL% EQU 0 (
    echo ✅ Build successful
) else (
    echo ❌ Build failed
    exit /b 1
)
"@ | Out-File -FilePath "build.bat" -Encoding ASCII

# Create dev.bat
@"
@echo off
echo Starting TappMCP in development mode...
call npm run dev
"@ | Out-File -FilePath "dev.bat" -Encoding ASCII

# Create test.bat
@"
@echo off
echo Running tests...
call npm test
if %ERRORLEVEL% EQU 0 (
    echo ✅ All tests passed
) else (
    echo ❌ Some tests failed
    exit /b 1
)
"@ | Out-File -FilePath "test.bat" -Encoding ASCII

# Create lint.bat
@"
@echo off
echo Running linter...
call npm run lint
if %ERRORLEVEL% EQU 0 (
    echo ✅ No linting errors
) else (
    echo ❌ Linting errors found
    exit /b 1
)
"@ | Out-File -FilePath "lint.bat" -Encoding ASCII

# Create start.bat
@"
@echo off
echo Starting TappMCP server...
call npm start
"@ | Out-File -FilePath "start.bat" -Encoding ASCII

# Set up Windows-specific PowerShell profile
$profilePath = $PROFILE.CurrentUserAllHosts
$profileDir = Split-Path $profilePath -Parent

if (-not (Test-Path $profileDir)) {
    New-Item -ItemType Directory -Path $profileDir -Force
}

# Add TappMCP aliases to PowerShell profile
$aliases = @"

# TappMCP Project Aliases
function TappMCP-Build { Set-Location `$PSScriptRoot; .\build.bat }
function TappMCP-Dev { Set-Location `$PSScriptRoot; .\dev.bat }
function TappMCP-Test { Set-Location `$PSScriptRoot; .\test.bat }
function TappMCP-Lint { Set-Location `$PSScriptRoot; .\lint.bat }
function TappMCP-Start { Set-Location `$PSScriptRoot; .\start.bat }
function TappMCP-SwitchRole { param(`$role) .\switch-role.ps1 `$role }

Set-Alias -Name tbuild -Value TappMCP-Build
Set-Alias -Name tdev -Value TappMCP-Dev
Set-Alias -Name ttest -Value TappMCP-Test
Set-Alias -Name tlint -Value TappMCP-Lint
Set-Alias -Name tstart -Value TappMCP-Start
Set-Alias -Name trole -Value TappMCP-SwitchRole

"@

if (-not (Test-Path $profilePath)) {
    $aliases | Out-File -FilePath $profilePath -Encoding UTF8
    Write-Host "✅ PowerShell profile created with TappMCP aliases" -ForegroundColor Green
} else {
    $existingContent = Get-Content $profilePath -Raw
    if ($existingContent -notlike "*TappMCP*") {
        $aliases | Add-Content -Path $profilePath -Encoding UTF8
        Write-Host "✅ TappMCP aliases added to existing PowerShell profile" -ForegroundColor Green
    } else {
        Write-Host "✅ TappMCP aliases already exist in PowerShell profile" -ForegroundColor Green
    }
}

# Create Windows-specific VS Code settings
$vscodeSettings = @{
    "typescript.preferences.includePackageJsonAutoImports" = "on"
    "typescript.suggest.autoImports" = true
    "typescript.updateImportsOnFileMove.enabled" = "always"
    "editor.formatOnSave" = true
    "editor.codeActionsOnSave" = @{
        "source.fixAll.eslint" = true
    }
    "files.eol" = "\r\n"
    "files.insertFinalNewline" = true
    "files.trimTrailingWhitespace" = true
    "terminal.integrated.defaultProfile.windows" = "PowerShell"
    "terminal.integrated.profiles.windows" = @{
        "PowerShell" = @{
            "source" = "PowerShell"
            "icon" = "terminal-powershell"
        }
        "Command Prompt" = @{
            "path" = "cmd.exe"
            "args" = @("/k", "chcp 65001")
            "icon" = "terminal-cmd"
        }
    }
}

$vscodeDir = ".vscode"
if (-not (Test-Path $vscodeDir)) {
    New-Item -ItemType Directory -Path $vscodeDir -Force
}

$vscodeSettings | ConvertTo-Json -Depth 10 | Out-File -FilePath "$vscodeDir/settings.json" -Encoding UTF8

# Create Windows-specific launch configuration
$launchConfig = @{
    "version" = "0.2.0"
    "configurations" = @(
        @{
            "name" = "Debug TappMCP Server"
            "type" = "node"
            "request" = "launch"
            "program" = "${workspaceFolder}/src/server.ts"
            "runtimeArgs" = @("-r", "ts-node/register")
            "env" = @{
                "NODE_ENV" = "development"
                "PLATFORM" = "windows"
            }
            "console" = "integratedTerminal"
            "internalConsoleOptions" = "neverOpen"
            "skipFiles" = @("<node_internals>/**")
        }
    )
}

$launchConfig | ConvertTo-Json -Depth 10 | Out-File -FilePath "$vscodeDir/launch.json" -Encoding UTF8

Write-Host "`n🎉 Windows development environment setup complete!" -ForegroundColor Green
Write-Host "`n📋 Available commands:" -ForegroundColor Yellow
Write-Host "• tbuild - Build the project" -ForegroundColor Cyan
Write-Host "• tdev - Start development server" -ForegroundColor Cyan
Write-Host "• ttest - Run tests" -ForegroundColor Cyan
Write-Host "• tlint - Run linter" -ForegroundColor Cyan
Write-Host "• tstart - Start production server" -ForegroundColor Cyan
Write-Host "• trole [role] - Switch AI role" -ForegroundColor Cyan
Write-Host "`n💡 Restart PowerShell to use the new aliases!" -ForegroundColor Yellow
