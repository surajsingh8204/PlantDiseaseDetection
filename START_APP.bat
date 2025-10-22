@echo off
title Potato Disease Detection - Main Controller
color 0A

echo ============================================
echo   POTATO DISEASE DETECTION APPLICATION
echo ============================================
echo.

REM Check if backend is running
netstat -ano | findstr ":8000" >nul
if %errorlevel% equ 0 (
    echo [OK] Backend is already running on port 8000
) else (
    echo [STARTING] Backend Server...
    start "Backend - FastAPI" cmd /k "cd /d %~dp0backend && call S:\mldeeplearningai\Scripts\activate.bat && S:\mldeeplearningai\python.exe -m uvicorn main:app --host localhost --port 8000 --reload"
    timeout /t 3 /nobreak >nul
)

REM Check if frontend is running
netstat -ano | findstr ":3000" >nul
if %errorlevel% equ 0 (
    echo [OK] Frontend is already running on port 3000
) else (
    echo [STARTING] Frontend Server...
    start "Frontend - React" cmd /k "cd /d %~dp0frontend && npm start"
    timeout /t 3 /nobreak >nul
)

echo.
echo ============================================
echo   APPLICATION STATUS
echo ============================================
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:3000
echo ============================================
echo.
echo Both servers are running in separate windows.
echo Keep those windows open while using the app.
echo.
echo Opening application in browser...
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
echo Press any key to close this window...
echo (The servers will continue running)
pause >nul
