@echo off
echo ========================================
echo  GSR Homeocare System - Frontend
echo ========================================
echo.

cd /d "%~dp0"

where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Open in browser: http://localhost:5500
    echo Press Ctrl+C to stop the server.
    echo.
    python -m http.server 5500
    pause
    exit /b 0
)

echo Python not found.
echo.
echo Option 1 - VS Code Live Server:
echo   Install "Live Server" extension, right-click index.html - Open with Live Server
echo.
echo Option 2 - Install Python and run this script again.
echo.
pause
