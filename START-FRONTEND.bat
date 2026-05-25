@echo off
title GSR Homeocare - Frontend (Mobile + PC)
cd /d "%~dp0frontend"

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
  set "IP=%%a"
  goto :found
)
:found
set IP=%IP:~1%

echo ============================================
echo   GSR Homeocare Frontend
echo ============================================
echo.
echo  PC browser:     http://localhost:5500
echo  ANDROID/MOBILE: http://%IP%:5500
echo.
echo  Phone must be on the SAME Wi-Fi as this PC.
echo  Keep START-BACKEND.bat running too.
echo.

where python >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found.
    pause
    exit /b 1
)

python -m http.server 5500 --bind 0.0.0.0
