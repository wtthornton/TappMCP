# Archive Completed Files Script
# This script moves completed .md files to the archive directory

Write-Host "Starting Archive Process for Completed Files..." -ForegroundColor Green

# Create archive directory if it doesn't exist
if (!(Test-Path "archive")) {
    New-Item -ItemType Directory -Name "archive" | Out-Null
    Write-Host "Created archive directory" -ForegroundColor Green
}

# Define completed files to archive
$completedFiles = @(
    # Completed Reports
    "PHASE2_COMPLETION_REPORT.md",
    "PORT_DOCUMENTATION_UPDATE_SUMMARY.md",
    "QA_REPORT_COMPLETE.md",
    "VALIDATION_REPORT.md",

    # Completed Task Lists
    "HIGH_PRIORITY_TASKS.md",
    "QUALITY_IMPROVEMENT_TASK_LIST.md",
    "SMART_VIBE_TASK_LIST.md",
    "SMART_VIBE_TASK_LIST_ANALYSIS.md",

    # Completed Summaries
    "SMART_VIBE_ENHANCEMENT_ARCHITECTURE_ANALYSIS.md",
    "SMART_VIBE_FULL_CHANGE_SUMMARY.md",
    "SMART_VIBE_TASK_MANAGEMENT_SYSTEM.md"
)

# Move completed files to archive
$movedCount = 0
foreach ($file in $completedFiles) {
    if (Test-Path $file) {
        Move-Item $file "archive/$file"
        Write-Host "Moved $file to archive/" -ForegroundColor Green
        $movedCount++
    } else {
        Write-Host "File not found: $file" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Archive Summary:" -ForegroundColor Cyan
Write-Host "Files moved to archive: $movedCount" -ForegroundColor Green
Write-Host "Archive location: archive/" -ForegroundColor Blue

Write-Host ""
Write-Host "Archive process completed!" -ForegroundColor Green
