@echo off
title GSR Homeocare Backend
cd /d "%~dp0"

echo ========================================
echo  GSR Homeocare System - Backend
echo ========================================
echo.

where java >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java not found. Set JAVA_HOME and add %%JAVA_HOME%%\bin to Path.
    echo Then close and reopen this window.
    pause
    exit /b 1
)

set "JAR=target\homeocare-1.0.0.jar"

if not exist "%JAR%" (
    echo Building JAR first time...
    set "MAVEN_HOME=%~dp0..\tools\maven"
    if exist "%MAVEN_HOME%\bin\mvn.cmd" (
        set "PATH=%MAVEN_HOME%\bin;%PATH%"
        call mvn package -DskipTests -q
    ) else (
        echo [ERROR] Maven not found. Use START-BACKEND.bat from project root.
        pause
        exit /b 1
    )
)

echo API:    http://localhost:8080/api/health
echo IMPORTANT: Keep this window open!
echo.

java -jar "%JAR%"

pause
