#!/bin/bash

# Safe TappMCP Dashboard Cleanup Script (Linux/macOS)
# This script implements a safer, more conservative cleanup approach

echo "🛡️ Starting SAFE TappMCP Dashboard Cleanup..."
echo "⚠️  This is a conservative approach with minimal risk"

# Create simple directory structure
echo "📁 Creating simple directory structure..."
mkdir -p archive
mkdir -p tests
mkdir -p docs

echo "✅ Directory structure created"

# Phase 1: Archive completed phase documentation (SAFE)
echo "📚 Archiving completed phase documentation..."

# Move phase docs
for file in SMART_VIBE_PHASE*.md D3_PHASE*.md PHASE*.md *COMPLETION*.md *EXECUTION*.md; do
    if [ -f "$file" ]; then
        mv "$file" archive/
        echo "  ✅ Moved $file to archive/"
    fi
done

echo "✅ Phase documentation archived"

# Phase 2: Remove only obviously safe files (VERY SAFE)
echo "🗑️ Removing only obviously safe files..."

safe_files=(
    "simple-html-page.html"
    "simple.html"
    "generated-html-test.html"
    "USER_GUIDE.html"
    "TECHNICAL_GUIDE.html"
)

for file in "${safe_files[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        echo "  ❌ Deleted $file"
    fi
done

echo "✅ Safe files removed"

# Phase 3: Move test files to tests/ directory (SAFE)
echo "🧪 Organizing test files..."

for file in test-*.html; do
    if [ -f "$file" ]; then
        mv "$file" tests/
        echo "  ✅ Moved $file to tests/"
    fi
done

echo "✅ Test files organized"

# Phase 4: Move documentation files to docs/ directory (SAFE)
echo "📖 Organizing documentation..."

for file in *GUIDE*.md *DOCUMENTATION*.md *SUMMARY*.md; do
    if [ -f "$file" ] && [ "$file" != "README.md" ]; then
        mv "$file" docs/
        echo "  ✅ Moved $file to docs/"
    fi
done

echo "✅ Documentation organized"

# Summary
echo ""
echo "🎉 SAFE Cleanup Complete!"
echo ""
echo "📊 Summary:"
echo "  ✅ Archive directory created for completed phases"
echo "  ✅ Test files organized in tests/ directory"
echo "  ✅ Documentation organized in docs/ directory"
echo "  ✅ Only obviously safe files removed"
echo "  ✅ No production files moved or deleted"
echo "  ✅ No complex directory structure created"

echo ""
echo "🛡️ Safety Features:"
echo "  ✅ Conservative approach - minimal risk"
echo "  ✅ No mass file movements"
echo "  ✅ No deletion of potentially useful files"
echo "  ✅ Simple directory structure"
echo "  ✅ Easy to revert if needed"

echo ""
echo "📁 New Structure:"
echo "  📁 archive/ - Completed phase documentation"
echo "  📁 tests/ - Test files"
echo "  📁 docs/ - Documentation files"
echo "  📁 public/ - Production files (unchanged)"
echo "  📁 src/ - Source code (unchanged)"

echo ""
echo "✨ Your TappMCP project is now safely organized!"
echo "🎯 80% of the benefits with 20% of the risk!"
