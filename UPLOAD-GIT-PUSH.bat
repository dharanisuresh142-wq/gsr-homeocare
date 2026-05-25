@echo off
title Push GSR Homeocare to GitHub
set "PATH=C:\Program Files\Git\bin;C:\Program Files\Git\cmd;%PATH%"

cd /d "%~dp0"

echo Pushing to GitHub...
echo If a login window opens, sign in with GitHub.
echo.

git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo SUCCESS! Code is on GitHub.
    echo https://github.com/dharanisuresh142-wq/gsr-homeocare
) else (
    echo.
    echo If push failed, use browser upload instead:
    echo Double-click UPLOAD-TO-GITHUB.bat
)

pause
