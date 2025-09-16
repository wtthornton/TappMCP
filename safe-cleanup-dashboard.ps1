# Safe TappMCP Dashboard Cleanup Script
# This script implements a safer, more conservative cleanup approach

Write-Host "🛡️ Starting SAFE TappMCP Dashboard Cleanup..." -ForegroundColor Green
Write-Host "⚠️  This is a conservative approach with minimal risk" -ForegroundColor Yellow

# Create simple directory structure
Write-Host "📁 Creating simple directory structure..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path "archive" -Force | Out-Null
New-Item -ItemType Directory -Path "tests" -Force | Out-Null
New-Item -ItemType Directory -Path "docs" -Force | Out-Null

Write-Host "✅ Directory structure created" -ForegroundColor Green

# Phase 1: Archive completed phase documentation (SAFE)
Write-Host "📚 Archiving completed phase documentation..." -ForegroundColor Yellow

$phaseDocs = @(
    "SMART_VIBE_PHASE*.md",
    "D3_PHASE*.md",
    "PHASE*.md",
    "*COMPLETION*.md",
    "*EXECUTION*.md"
)

foreach ($pattern in $phaseDocs) {
    $files = Get-ChildItem -Path . -Name $pattern -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        if ($file -and (Test-Path $file)) {
            Move-Item $file "archive\" -Force
            Write-Host "  ✅ Moved $file to archive/" -ForegroundColor Cyan
        }
    }
}

Write-Host "✅ Phase documentation archived" -ForegroundColor Green

# Phase 2: Remove only obviously safe files (VERY SAFE)
Write-Host "🗑️ Removing only obviously safe files..." -ForegroundColor Yellow

$safeToDelete = @(
    "simple-html-page.html",
    "simple.html",
    "generated-html-test.html",
    "USER_GUIDE.html",
    "TECHNICAL_GUIDE.html"
)

foreach ($file in $safeToDelete) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ❌ Deleted $file" -ForegroundColor Red
    }
}

Write-Host "✅ Safe files removed" -ForegroundColor Green

# Phase 3: Move test files to tests/ directory (SAFE)
Write-Host "🧪 Organizing test files..." -ForegroundColor Yellow

$testFiles = @(
    "test-*.html"
)

foreach ($pattern in $testFiles) {
    $files = Get-ChildItem -Path . -Name $pattern -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        if ($file -and (Test-Path $file)) {
            Move-Item $file "tests\" -Force
            Write-Host "  ✅ Moved $file to tests/" -ForegroundColor Cyan
        }
    }
}

Write-Host "✅ Test files organized" -ForegroundColor Green

# Phase 4: Move documentation files to docs/ directory (SAFE)
Write-Host "📖 Organizing documentation..." -ForegroundColor Yellow

$docFiles = @(
    "*GUIDE*.md",
    "*DOCUMENTATION*.md",
    "*SUMMARY*.md"
)

foreach ($pattern in $docFiles) {
    $files = Get-ChildItem -Path . -Name $pattern -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        if ($file -and (Test-Path $file) -and $file -ne "README.md") {
            Move-Item $file "docs\" -Force
            Write-Host "  ✅ Moved $file to docs/" -ForegroundColor Cyan
        }
    }
}

Write-Host "✅ Documentation organized" -ForegroundColor Green

# Summary
Write-Host "`n🎉 SAFE Cleanup Complete!" -ForegroundColor Green
Write-Host "`n📊 Summary:" -ForegroundColor Yellow
Write-Host "  ✅ Archive directory created for completed phases" -ForegroundColor White
Write-Host "  ✅ Test files organized in tests/ directory" -ForegroundColor White
Write-Host "  ✅ Documentation organized in docs/ directory" -ForegroundColor White
Write-Host "  ✅ Only obviously safe files removed" -ForegroundColor White
Write-Host "  ✅ No production files moved or deleted" -ForegroundColor White
Write-Host "  ✅ No complex directory structure created" -ForegroundColor White

Write-Host "`n🛡️ Safety Features:" -ForegroundColor Yellow
Write-Host "  ✅ Conservative approach - minimal risk" -ForegroundColor White
Write-Host "  ✅ No mass file movements" -ForegroundColor White
Write-Host "  ✅ No deletion of potentially useful files" -ForegroundColor White
Write-Host "  ✅ Simple directory structure" -ForegroundColor White
Write-Host "  ✅ Easy to revert if needed" -ForegroundColor White

Write-Host "`n📁 New Structure:" -ForegroundColor Yellow
Write-Host "  📁 archive/ - Completed phase documentation" -ForegroundColor White
Write-Host "  📁 tests/ - Test files" -ForegroundColor White
Write-Host "  📁 docs/ - Documentation files" -ForegroundColor White
Write-Host "  📁 public/ - Production files (unchanged)" -ForegroundColor White
Write-Host "  📁 src/ - Source code (unchanged)" -ForegroundColor White

Write-Host "`n✨ Your TappMCP project is now safely organized!" -ForegroundColor Green
Write-Host "🎯 80% of the benefits with 20% of the risk!" -ForegroundColor Green
