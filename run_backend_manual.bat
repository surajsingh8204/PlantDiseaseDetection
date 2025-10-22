@echo off
echo Activating conda environment from S:\mldeeplearningai...
call S:\mldeeplearningai\Scripts\activate.bat

cd /d %~dp0backend

echo Starting FastAPI server...
python main.py
