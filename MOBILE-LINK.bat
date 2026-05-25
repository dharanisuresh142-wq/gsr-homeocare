@echo off
title GSR Homeocare - Access Links
cd /d "%~dp0"

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
  set "IP=%%a"
  goto :found
)
:found
set IP=%IP:~1%

echo http://%IP%:5500> "%~dp0frontend\mobile-url.txt"

echo.
echo ==========================================
echo   GSR Homeocare - ACCESS LINKS
echo ==========================================
echo.
echo  Contact: +91 99480 54618
echo.
echo  WINDOWS (this PC):
echo    http://localhost:5500
echo.
echo  MOBILE (same Wi-Fi):
echo    http://%IP%:5500
echo.
echo  1. Run RUN-ALL.bat (keep windows open)
echo  2. Phone: same Wi-Fi, open link above in Chrome
echo.
echo ==========================================
echo.
pause
