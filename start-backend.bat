@echo off
cd /d "%~dp0server"
py -3.13 -m pip install -r requirements.txt
py -3.13 -m uvicorn main:app --reload --port 3001
