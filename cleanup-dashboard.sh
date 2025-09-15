#!/bin/bash

# TappMCP Dashboard Cleanup Script (Linux/macOS)
# This script implements the cleanup plan to organize the project structure

echo "🧹 Starting TappMCP Dashboard Cleanup..."

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p tests/dashboard
mkdir -p tests/integration
mkdir -p docs/phases
mkdir -p docs/archive
mkdir -p docs/api

echo "✅ Directory structure created"

# Phase 1: Move test files
echo "📦 Moving test files..."

# Move test files from root to tests/
test_files=(
    "test-d3-graph-fix.html"
    "test-context7-metrics.html"
    "test-phase1-d3-enhancements.html"
    "test-dashboard-validation.html"
)

for file in "${test_files[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" "tests/dashboard/"
        echo "  ✅ Moved $file to tests/dashboard/"
    fi
done

# Move WebSocket test files
ws_test_files=(
    "public/test-websocket.html"
    "public/websocket-test-simple.html"
    "public/test-ws-direct.html"
)

for file in "${ws_test_files[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" "tests/integration/"
        echo "  ✅ Moved $file to tests/integration/"
    fi
done

# Move other test files from public/
public_test_files=(
    "public/test-dashboard-loading.html"
    "public/test-js-execution.html"
)

for file in "${public_test_files[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" "tests/dashboard/"
        echo "  ✅ Moved $file to tests/dashboard/"
    fi
done

echo "✅ Test files moved"

# Phase 2: Archive phase-specific documentation
echo "📚 Archiving phase-specific documentation..."

# Move phase docs
for file in SMART_VIBE_PHASE*.md D3_PHASE*.md PHASE*.md; do
    if [ -f "$file" ]; then
        mv "$file" "docs/phases/"
        echo "  ✅ Moved $file to docs/phases/"
    fi
done

# Move task docs
for file in *TASK*.md *EXECUTION*.md *COMPLETION*.md; do
    if [ -f "$file" ] && [ "$file" != "README.md" ]; then
        mv "$file" "docs/archive/"
        echo "  ✅ Moved $file to docs/archive/"
    fi
done

echo "✅ Documentation archived"

# Phase 3: Remove redundant files
echo "🗑️ Removing redundant files..."

files_to_delete=(
    "public/working-dashboard.html"
    "public/working-d3.html"
    "public/debug-dashboard.html"
    "simple-html-page.html"
    "simple.html"
    "generated-html-test.html"
    "USER_GUIDE.html"
    "TECHNICAL_GUIDE.html"
)

for file in "${files_to_delete[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        echo "  ❌ Deleted $file"
    fi
done

echo "✅ Redundant files removed"

# Phase 4: Create consolidated documentation
echo "📝 Creating consolidated documentation..."

# Create main dashboard guide
cat > "docs/DASHBOARD_GUIDE.md" << 'EOF'
# 🚀 TappMCP Dashboard Guide

## 📊 Available Dashboards

### Main Dashboards
- **Enhanced Modular Dashboard**: `http://localhost:8080/d3-enhanced-modular.html`
- **Main Dashboard**: `http://localhost:8080/index.html`
- **D3.js Visualizations**: `http://localhost:8080/d3-visualizations.html`

### Test Dashboards
- **D3 Graph Fix Test**: `http://localhost:8080/tests/dashboard/test-d3-graph-fix.html`
- **Context7 Metrics Test**: `http://localhost:8080/tests/dashboard/test-context7-metrics.html`
- **WebSocket Test**: `http://localhost:8080/tests/integration/test-websocket.html`

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
All test files are organized in the `tests/` directory:
- `tests/dashboard/` - Dashboard-specific tests
- `tests/integration/` - Integration tests

### Documentation
- `docs/phases/` - Phase-specific documentation
- `docs/archive/` - Completed task documentation
- `docs/api/` - API reference documentation

## 🚀 Quick Start

1. Start the server: `npm start`
2. Access main dashboard: `http://localhost:8080`
3. Test functionality: `http://localhost:8080/tests/dashboard/test-d3-graph-fix.html`
EOF

echo "  ✅ Created docs/DASHBOARD_GUIDE.md"

# Create deployment guide
cat > "docs/DEPLOYMENT_GUIDE.md" << 'EOF'
# 🚀 TappMCP Deployment Guide

## 📦 Docker Deployment

### Quick Start
```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.core.yml up --build -d

# Access dashboard
open http://localhost:8080
```

### Health Verification
```bash
curl http://localhost:8080/health
curl http://localhost:8080/tools
```

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 3000, mapped to 8080 in Docker)
- `NODE_ENV`: Environment (production/development)

### Port Configuration
- **Docker**: External access via port 8080
- **Local**: Direct access via port 3000

## 📊 Monitoring

### Real-time Dashboard
- **URL**: `http://localhost:8080`
- **Features**: Performance metrics, workflow monitoring, Context7 integration

### Test Endpoints
- **Health**: `http://localhost:8080/health`
- **Metrics**: `http://localhost:8080/metrics`
- **Tools**: `http://localhost:8080/tools`

## 🧪 Testing

### Test Files Location
- `tests/dashboard/` - Dashboard functionality tests
- `tests/integration/` - Integration tests

### Running Tests
1. Start the server
2. Navigate to test files in browser
3. Follow test instructions
EOF

echo "  ✅ Created docs/DEPLOYMENT_GUIDE.md"

echo "✅ Consolidated documentation created"

# Phase 5: Update main README
echo "📖 Updating main README..."

# Append cleanup note to README
cat >> "README.md" << 'EOF'

## 🧹 Project Structure

This project has been cleaned up and organized for better maintainability:

- **`public/`** - Production web files (dashboards, visualizations)
- **`tests/`** - All test files organized by type
- **`docs/`** - Documentation organized by category
- **`src/`** - Source code and core functionality

### Quick Access
- **Main Dashboard**: `http://localhost:8080`
- **Enhanced Dashboard**: `http://localhost:8080/d3-enhanced-modular.html`
- **Test Files**: `http://localhost:8080/tests/`

For detailed information, see the documentation in the `docs/` directory.
EOF

echo "  ✅ Updated README.md with cleanup information"

echo "✅ README updated"

# Summary
echo ""
echo "🎉 Cleanup Complete!"
echo ""
echo "📊 Summary:"
echo "  ✅ Directory structure created"
echo "  ✅ Test files organized"
echo "  ✅ Documentation archived"
echo "  ✅ Redundant files removed"
echo "  ✅ Consolidated docs created"
echo "  ✅ README updated"

echo ""
echo "🚀 Next Steps:"
echo "  1. Test all functionality after cleanup"
echo "  2. Update any hardcoded file paths"
echo "  3. Verify all links work correctly"
echo "  4. Commit changes to version control"

echo ""
echo "📁 New Structure:"
echo "  📁 public/ - Production dashboards"
echo "  📁 tests/ - All test files"
echo "  📁 docs/ - Organized documentation"
echo "  📁 src/ - Source code (unchanged)"

echo ""
echo "✨ Your TappMCP project is now clean and organized!"
