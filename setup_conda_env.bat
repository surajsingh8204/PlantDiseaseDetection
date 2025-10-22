@echo off
echo Setting up Potato Disease Detection with Conda Environment...
echo.
echo Using conda environment at: S:\mldeeplearningai
echo.

echo Activating conda environment...
call S:\mldeeplearningai\Scripts\activate.bat

echo.
echo Installing backend dependencies...
cd backend
pip install -r requirements.txt

echo.
echo Installing frontend dependencies...
cd ..\frontend
call npm install

echo.
echo Setup complete!
echo.
echo To start the application:
echo   - Backend: Run start_backend.bat
echo   - Frontend: Run start_frontend.bat
echo   - Both: Run start_all.bat
echo.
pause
