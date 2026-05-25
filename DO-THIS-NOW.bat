@echo off
title GSR Homeocare - 2 clicks left (you must do)
color 0E
echo.
echo  ============================================================
echo    I prepared everything. YOU only need 2 things:
echo  ============================================================
echo.
echo  [1] MONGODB PASSWORD in Render (1 minute)
echo      This window will open Render Environment page.
echo      Paste your Atlas connection string as MONGODB_URI
echo.
echo  [2] Click MANUAL SYNC on Render blueprint page
echo.
echo  ============================================================
echo.
pause
start https://dashboard.render.com/
start https://cloud.mongodb.com/v2/
start https://app.netlify.com/
echo.
echo  MONGODB_URI value - copy this template to Notepad:
echo  Replace YOUR_PASSWORD with your Atlas password:
echo.
echo  mongodb+srv://dharanisuresh142_db_user:YOUR_PASSWORD@cluster0.nszjrd6.mongodb.net/gsr_homeocare_db?retryWrites=true^&w=majority^&appName=Cluster0
echo.
pause
