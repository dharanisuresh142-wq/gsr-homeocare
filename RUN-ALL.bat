@echo off
title GSR Homeocare - Full System
color 0A

set "JAVA_HOME=C:\Users\dhara\AppData\Local\Programs\Eclipse Adoptium\jdk-25.0.3.9-hotspot"
set "MAVEN_HOME=%~dp0tools\maven"
set "PATH=%JAVA_HOME%\bin;%MAVEN_HOME%\bin;%PATH%"

echo ============================================
echo   GSR Homeocare - Starting Everything
echo ============================================
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
  set "IP=%%a"
  goto :ipfound
)
:ipfound
set IP=%IP:~1%

if exist "%~dp0mongodb-uri.txt" (
  set /p MONGODB_URI=<"%~dp0mongodb-uri.txt"
  echo Using MongoDB from mongodb-uri.txt
) else (
  echo WARNING: Create mongodb-uri.txt from mongodb-uri.example.txt
)

echo Starting BACKEND (port 8080)...
start "GSR Backend" cmd /k "cd /d %~dp0backend && set MONGODB_URI=%MONGODB_URI% && mvn spring-boot:run -q"

timeout /t 3 >nul

echo Starting FRONTEND (port 5500)...
start "GSR Frontend" cmd /k "cd /d %~dp0frontend && python -m http.server 5500 --bind 0.0.0.0"

timeout /t 5 >nul

echo.
echo ============================================
echo   WEBSITE IS RUNNING
echo ============================================
echo.
echo   Contact:        +91 99480 54618
echo.
echo   WINDOWS (PC):   http://localhost:5500
echo   MOBILE (Wi-Fi): http://%IP%:5500
echo http://%IP%:5500> "%~dp0frontend\mobile-url.txt"
echo.
echo   Backend API:    http://localhost:8080/api/health
echo.
echo   NEW PAGES:
echo   - Products + Cart
echo   - Checkout (payment methods)
echo   - My Orders (order history)
echo.
echo   Keep both black windows OPEN.
echo ============================================
echo.
start http://localhost:5500
pause
