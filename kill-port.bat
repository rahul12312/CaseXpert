@echo off
echo Killing processes on port 5001...

FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :5001') DO (
    echo Killing PID %%P
    taskkill /PID %%P /F
)

echo.
echo Done! Port 5001 is now free.
pause
