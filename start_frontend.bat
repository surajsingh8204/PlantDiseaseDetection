@echo off
echo Starting Potato Disease Detection Frontend...
cd frontend
if not exist node_modules (
    echo Installing npm dependencies...
    call npm install
)
echo Starting React development server...
call npm start
pause
