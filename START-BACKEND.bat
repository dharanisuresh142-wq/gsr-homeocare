@echo off
title GSR Homeocare - Backend Server
cd /d "%~dp0backend"

echo ============================================
echo   GSR Homeocare Backend
echo ============================================
echo.

where java >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Java not found!
    echo Add JAVA_HOME and %%JAVA_HOME%%\bin to Windows Path, then open a NEW terminal.
    pause
    exit /b 1
)

set "JAR=target\homeocare-1.0.0.jar"
set "MVN=%~dp0tools\maven\bin\mvn.cmd"

if not exist "%JAR%" (
    echo Building backend first time - please wait...
    if exist "%MVN%" (
        set "PATH=%~dp0tools\maven\bin;%PATH%"
        call mvn package -DskipTests -q
    ) else (
        echo [ERROR] JAR missing and Maven not found at tools\maven
        echo Run from project folder after full setup, or use backend\run-backend.bat
        pause
        exit /b 1
    )
)

if not exist "%JAR%" (
    echo [ERROR] Build failed. JAR not created: %JAR%
    pause
    exit /b 1
)

echo Starting server...
echo   API:    http://localhost:8080/api/health
echo   Keep this window OPEN while using the website.
echo.

java -jar "%JAR%"

echo.
echo Server stopped.
pause
