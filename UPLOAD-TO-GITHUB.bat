@echo off
title Upload GSR Homeocare to GitHub
echo.
echo  ================================================
echo   UPLOAD TO GITHUB - Method 1: Add file button
echo  ================================================
echo.
echo  1. Open this link in Chrome:
echo     https://github.com/dharanisuresh142-wq/gsr-homeocare/upload/main
echo.
echo  2. Open File Explorer side by side:
echo     c:\Users\dhara\OneDrive\Desktop\mano
echo.
echo  3. Select ALL files inside mano EXCEPT tools and oracleJdk-26
echo     Drag into the GitHub upload box
echo.
echo  4. Click "Commit changes"
echo.
echo  ================================================
echo   Method 2: Git push (after Git installs)
echo  ================================================
echo   Run: UPLOAD-GIT-PUSH.bat
echo.
start https://github.com/dharanisuresh142-wq/gsr-homeocare/upload/main
explorer "c:\Users\dhara\OneDrive\Desktop\mano"
pause
