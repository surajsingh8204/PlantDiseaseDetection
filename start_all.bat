@echo off
echo Starting Potato Disease Detection Application...
echo.
echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d %~dp0backend && call S:\mldeeplearningai\Scripts\activate.bat && pip install -r requirements.txt && python main.py"

timeout /t 5 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d %~dp0frontend && if not exist node_modules (npm install) && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
pause
