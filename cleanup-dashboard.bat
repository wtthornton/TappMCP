@echo off
echo 🧹 Starting TappMCP Dashboard Cleanup...
echo.

REM Run the PowerShell cleanup script
powershell -ExecutionPolicy Bypass -File "cleanup-dashboard.ps1"

echo.
echo ✅ Cleanup completed!
echo.
echo Press any key to exit...
pause >nul
