# TappMCP Dashboard Cleanup Script
# This script implements the cleanup plan to organize the project structure

Write-Host "🧹 Starting TappMCP Dashboard Cleanup..." -ForegroundColor Green

# Create directory structure
Write-Host "📁 Creating directory structure..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path "tests\dashboard" -Force | Out-Null
New-Item -ItemType Directory -Path "tests\integration" -Force | Out-Null
New-Item -ItemType Directory -Path "docs\phases" -Force | Out-Null
New-Item -ItemType Directory -Path "docs\archive" -Force | Out-Null
New-Item -ItemType Directory -Path "docs\api" -Force | Out-Null

Write-Host "✅ Directory structure created" -ForegroundColor Green

# Phase 1: Move test files
Write-Host "📦 Moving test files..." -ForegroundColor Yellow

# Move test files from root to tests/
$testFiles = @(
    "test-d3-graph-fix.html",
    "test-context7-metrics.html",
    "test-phase1-d3-enhancements.html",
    "test-dashboard-validation.html"
)

foreach ($file in $testFiles) {
    if (Test-Path $file) {
        Move-Item $file "tests\dashboard\" -Force
        Write-Host "  ✅ Moved $file to tests/dashboard/" -ForegroundColor Cyan
    }
}

# Move WebSocket test files
$wsTestFiles = @(
    "public\test-websocket.html",
    "public\websocket-test-simple.html",
    "public\test-ws-direct.html"
)

foreach ($file in $wsTestFiles) {
    if (Test-Path $file) {
        Move-Item $file "tests\integration\" -Force
        Write-Host "  ✅ Moved $file to tests/integration/" -ForegroundColor Cyan
    }
}

# Move other test files from public/
$publicTestFiles = @(
    "public\test-dashboard-loading.html",
    "public\test-js-execution.html"
)

foreach ($file in $publicTestFiles) {
    if (Test-Path $file) {
        Move-Item $file "tests\dashboard\" -Force
        Write-Host "  ✅ Moved $file to tests/dashboard/" -ForegroundColor Cyan
    }
}

Write-Host "✅ Test files moved" -ForegroundColor Green

# Phase 2: Archive phase-specific documentation
Write-Host "📚 Archiving phase-specific documentation..." -ForegroundColor Yellow

$phaseDocs = @(
    "SMART_VIBE_PHASE*.md",
    "D3_PHASE*.md",
    "PHASE*.md"
)

foreach ($pattern in $phaseDocs) {
    $files = Get-ChildItem -Path . -Name $pattern
    foreach ($file in $files) {
        if ($file -and (Test-Path $file)) {
            Move-Item $file "docs\phases\" -Force
            Write-Host "  ✅ Moved $file to docs/phases/" -ForegroundColor Cyan
        }
    }
}

# Archive completed task documentation
$taskDocs = @(
    "*TASK*.md",
    "*EXECUTION*.md",
    "*COMPLETION*.md"
)

foreach ($pattern in $taskDocs) {
    $files = Get-ChildItem -Path . -Name $pattern
    foreach ($file in $files) {
        if ($file -and (Test-Path $file) -and $file -ne "README.md") {
            Move-Item $file "docs\archive\" -Force
            Write-Host "  ✅ Moved $file to docs/archive/" -ForegroundColor Cyan
        }
    }
}

Write-Host "✅ Documentation archived" -ForegroundColor Green

# Phase 3: Remove redundant files
Write-Host "🗑️ Removing redundant files..." -ForegroundColor Yellow

$filesToDelete = @(
    "public\working-dashboard.html",
    "public\working-d3.html",
    "public\debug-dashboard.html",
    "simple-html-page.html",
    "simple.html",
    "generated-html-test.html",
    "USER_GUIDE.html",
    "TECHNICAL_GUIDE.html"
)

foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ❌ Deleted $file" -ForegroundColor Red
    }
}

Write-Host "✅ Redundant files removed" -ForegroundColor Green

# Phase 4: Create consolidated documentation
Write-Host "📝 Creating consolidated documentation..." -ForegroundColor Yellow

# Create main dashboard guide
$dashboardGuide = @"
# 🚀 TappMCP Dashboard Guide

## 📊 Available Dashboards

### Main Dashboards
- **Enhanced Modular Dashboard**: \`http://localhost:8080/d3-enhanced-modular.html\`
- **Main Dashboard**: \`http://localhost:8080/index.html\`
- **D3.js Visualizations**: \`http://localhost:8080/d3-visualizations.html\`

### Test Dashboards
- **D3 Graph Fix Test**: \`http://localhost:8080/tests/dashboard/test-d3-graph-fix.html\`
- **Context7 Metrics Test**: \`http://localhost:8080/tests/dashboard/test-context7-metrics.html\`
- **WebSocket Test**: \`http://localhost:8080/tests/integration/test-websocket.html\`

## 🎯 Features

### Enhanced Modular Dashboard
- Interactive workflow graphs
- Real-time performance monitoring
- D3.js visualizations with ES6 modules
- WebSocket integration
- Responsive design

### Context7 Integration
- Real-time metrics tracking
- Cost analysis
- Knowledge quality monitoring
- API usage statistics

## 🔧 Development

### Testing
All test files are organized in the \`tests/\` directory:
- \`tests/dashboard/\` - Dashboard-specific tests
- \`tests/integration/\` - Integration tests

### Documentation
- \`docs/phases/\` - Phase-specific documentation
- \`docs/archive/\` - Completed task documentation
- \`docs/api/\` - API reference documentation

## 🚀 Quick Start

1. Start the server: \`npm start\`
2. Access main dashboard: \`http://localhost:8080\`
3. Test functionality: \`http://localhost:8080/tests/dashboard/test-d3-graph-fix.html\`
"@

$dashboardGuide | Out-File -FilePath "docs\DASHBOARD_GUIDE.md" -Encoding UTF8
Write-Host "  ✅ Created docs/DASHBOARD_GUIDE.md" -ForegroundColor Cyan

# Create deployment guide
$deploymentGuide = @"
# 🚀 TappMCP Deployment Guide

## 📦 Docker Deployment

### Quick Start
\`\`\`bash
# Build and run with Docker Compose
docker-compose -f docker-compose.core.yml up --build -d

# Access dashboard
open http://localhost:8080
\`\`\`

### Health Verification
\`\`\`bash
curl http://localhost:8080/health
curl http://localhost:8080/tools
\`\`\`

## 🔧 Configuration

### Environment Variables
- \`PORT\`: Server port (default: 3000, mapped to 8080 in Docker)
- \`NODE_ENV\`: Environment (production/development)

### Port Configuration
- **Docker**: External access via port 8080
- **Local**: Direct access via port 3000

## 📊 Monitoring

### Real-time Dashboard
- **URL**: \`http://localhost:8080\`
- **Features**: Performance metrics, workflow monitoring, Context7 integration

### Test Endpoints
- **Health**: \`http://localhost:8080/health\`
- **Metrics**: \`http://localhost:8080/metrics\`
- **Tools**: \`http://localhost:8080/tools\`

## 🧪 Testing

### Test Files Location
- \`tests/dashboard/\` - Dashboard functionality tests
- \`tests/integration/\` - Integration tests

### Running Tests
1. Start the server
2. Navigate to test files in browser
3. Follow test instructions
"@

$deploymentGuide | Out-File -FilePath "docs\DEPLOYMENT_GUIDE.md" -Encoding UTF8
Write-Host "  ✅ Created docs/DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan

Write-Host "✅ Consolidated documentation created" -ForegroundColor Green

# Phase 5: Update main README
Write-Host "📖 Updating main README..." -ForegroundColor Yellow

# Read current README
$readmeContent = Get-Content "README.md" -Raw

# Add cleanup note
$cleanupNote = @"

## 🧹 Project Structure

This project has been cleaned up and organized for better maintainability:

- **\`public/\`** - Production web files (dashboards, visualizations)
- **\`tests/\`** - All test files organized by type
- **\`docs/\`** - Documentation organized by category
- **\`src/\`** - Source code and core functionality

### Quick Access
- **Main Dashboard**: \`http://localhost:8080\`
- **Enhanced Dashboard**: \`http://localhost:8080/d3-enhanced-modular.html\`
- **Test Files**: \`http://localhost:8080/tests/\`

For detailed information, see the documentation in the \`docs/\` directory.
"@

# Append cleanup note to README
$readmeContent + $cleanupNote | Out-File -FilePath "README.md" -Encoding UTF8
Write-Host "  ✅ Updated README.md with cleanup information" -ForegroundColor Cyan

Write-Host "✅ README updated" -ForegroundColor Green

# Summary
Write-Host "`n🎉 Cleanup Complete!" -ForegroundColor Green
Write-Host "`n📊 Summary:" -ForegroundColor Yellow
Write-Host "  ✅ Directory structure created" -ForegroundColor White
Write-Host "  ✅ Test files organized" -ForegroundColor White
Write-Host "  ✅ Documentation archived" -ForegroundColor White
Write-Host "  ✅ Redundant files removed" -ForegroundColor White
Write-Host "  ✅ Consolidated docs created" -ForegroundColor White
Write-Host "  ✅ README updated" -ForegroundColor White

Write-Host "`n🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Test all functionality after cleanup" -ForegroundColor White
Write-Host "  2. Update any hardcoded file paths" -ForegroundColor White
Write-Host "  3. Verify all links work correctly" -ForegroundColor White
Write-Host "  4. Commit changes to version control" -ForegroundColor White

Write-Host "`n📁 New Structure:" -ForegroundColor Yellow
Write-Host "  📁 public/ - Production dashboards" -ForegroundColor White
Write-Host "  📁 tests/ - All test files" -ForegroundColor White
Write-Host "  📁 docs/ - Organized documentation" -ForegroundColor White
Write-Host "  📁 src/ - Source code (unchanged)" -ForegroundColor White

Write-Host "`n✨ Your TappMCP project is now clean and organized!" -ForegroundColor Green
