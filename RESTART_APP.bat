@echo off
title Restart Application
color 0E

echo Restarting Potato Disease Detection Application...
echo.

call STOP_APP.bat
timeout /t 2 /nobreak >nul
call START_APP.bat
