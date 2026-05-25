@echo off
title GSR Homeocare - Deploy Guide
color 0B
echo.
echo  ================================================
echo    GSR Homeocare - DEPLOY TO INTERNET
echo  ================================================
echo.
echo  Opening deploy guide and signup pages...
echo.

start "" "DEPLOY-STEP-BY-STEP.md"
timeout /t 2 >nul
start https://www.mongodb.com/atlas
timeout /t 1 >nul
start https://github.com/new
timeout /t 1 >nul
start https://dashboard.render.com/
timeout /t 1 >nul
start https://app.netlify.com/

echo.
echo  Follow DEPLOY-STEP-BY-STEP.md in order:
echo    Step 1 - MongoDB Atlas
echo    Step 2 - GitHub upload
echo    Step 3 - Render backend
echo    Step 4 - Netlify website
echo.
echo  Your Netlify site ID: 01KSCFG9VAXK1QP763YZQJCTWW
echo.
pause
