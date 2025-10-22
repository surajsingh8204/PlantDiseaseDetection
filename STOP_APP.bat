@echo off
title Stopping Potato Disease Detection Servers
color 0C

echo Stopping all servers...
echo.

REM Kill backend processes
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000"') do (
    taskkill /F /PID %%a 2>nul
)

REM Kill frontend processes
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do (
    taskkill /F /PID %%a 2>nul
)

echo.
echo All servers stopped.
timeout /t 2 /nobreak >nul
