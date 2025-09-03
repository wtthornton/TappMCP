# Role Switching Script for Smart MCP Project
# Usage: .\switch-role.ps1 [developer|product|operations|designer]

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("developer", "product", "operations", "designer")]
    [string]$Role
)

$roleMap = @{
    "developer" = "developer.cursorrules"
    "product" = "product.cursorrules"
    "operations" = "operations.cursorrules"
    "designer" = "designer.cursorrules"
}

$sourceFile = $roleMap[$Role]
$targetFile = ".cursorrules"

if (Test-Path $sourceFile) {
    Copy-Item $sourceFile $targetFile -Force
    Write-Host "✅ Switched to $Role role" -ForegroundColor Green
    Write-Host "📋 Role documentation: docs/roles/$Role.md" -ForegroundColor Cyan
} else {
    Write-Host "❌ Role file not found: $sourceFile" -ForegroundColor Red
    Write-Host "Available roles: developer, product, operations, designer" -ForegroundColor Yellow
}
