#!/usr/bin/env node

/**
 * Post-install script for TappMCP
 * Detects Windows environment and sets up appropriate configurations
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🔧 Running TappMCP post-install setup...');

// Detect platform
const platform = os.platform();
const isWindows = platform === 'win32';

console.log(`🖥️  Detected platform: ${platform}`);

if (isWindows) {
    console.log('🪟 Windows detected - setting up Windows-specific configurations...');
    
    // Copy Windows environment file if .env doesn't exist
    const envFile = path.join(process.cwd(), '.env');
    const windowsEnvFile = path.join(process.cwd(), 'windows.env');
    
    if (!fs.existsSync(envFile) && fs.existsSync(windowsEnvFile)) {
        try {
            fs.copyFileSync(windowsEnvFile, envFile);
            console.log('✅ Windows environment configuration copied to .env');
        } catch (error) {
            console.log('⚠️  Could not copy Windows environment file:', error.message);
        }
    }
    
    // Set up Windows-specific git configuration
    const { execSync } = require('child_process');
    
    try {
        // Configure git for Windows
        execSync('git config --global core.autocrlf true', { stdio: 'ignore' });
        execSync('git config --global core.safecrlf true', { stdio: 'ignore' });
        console.log('✅ Git configured for Windows line endings');
    } catch (error) {
        console.log('⚠️  Could not configure git:', error.message);
    }
    
    // Create Windows-specific batch files if they don't exist
    const batchFiles = [
        { name: 'build.bat', content: `@echo off
echo Building TappMCP project...
call npm run build
if %ERRORLEVEL% EQU 0 (
    echo ✅ Build successful
) else (
    echo ❌ Build failed
    exit /b 1
)` },
        { name: 'dev.bat', content: `@echo off
echo Starting TappMCP in development mode...
call npm run dev` },
        { name: 'test.bat', content: `@echo off
echo Running tests...
call npm test
if %ERRORLEVEL% EQU 0 (
    echo ✅ All tests passed
) else (
    echo ❌ Some tests failed
    exit /b 1
)` },
        { name: 'lint.bat', content: `@echo off
echo Running linter...
call npm run lint
if %ERRORLEVEL% EQU 0 (
    echo ✅ No linting errors
) else (
    echo ❌ Linting errors found
    exit /b 1
)` },
        { name: 'start.bat', content: `@echo off
echo Starting TappMCP server...
call npm start` }
    ];
    
    batchFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file.name);
        if (!fs.existsSync(filePath)) {
            try {
                fs.writeFileSync(filePath, file.content, 'utf8');
                console.log(`✅ Created ${file.name}`);
            } catch (error) {
                console.log(`⚠️  Could not create ${file.name}:`, error.message);
            }
        }
    });
    
    console.log('🎉 Windows setup complete!');
    console.log('💡 You can now use:');
    console.log('   • npm run windows-setup (for full Windows environment setup)');
    console.log('   • build.bat, dev.bat, test.bat, lint.bat, start.bat (Windows batch files)');
    
} else {
    console.log('🐧 Non-Windows platform detected - using standard configuration');
}

console.log('✅ Post-install setup complete!');
