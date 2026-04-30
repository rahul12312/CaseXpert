@echo off
echo ============================================
echo CaseXpert Project Cleanup Script
echo ============================================
echo.
echo This script will:
echo 1. Stop all Node.js processes
echo 2. Delete old backend folders
echo 3. Rename nodejs-backend to backend
echo 4. Keep only: frontend, backend, database
echo.
echo Press Ctrl+C to cancel, or
pause

echo.
echo Step 1: Stopping all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
echo Done!

echo.
echo Step 2: Waiting 2 seconds...
timeout /t 2 /nobreak >nul

echo.
echo Step 3: Deleting old backend folder...
if exist "backend" (
    rmdir /S /Q "backend"
    echo Old backend folder deleted!
) else (
    echo Old backend folder not found.
)

echo.
echo Step 4: Deleting PHP backend folder...
if exist "casexpert-backend" (
    rmdir /S /Q "casexpert-backend"
    echo PHP backend folder deleted!
) else (
    echo PHP backend folder not found.
)

echo.
echo Step 5: Renaming nodejs-backend to backend...
if exist "nodejs-backend" (
    rename "nodejs-backend" "backend"
    echo Renamed nodejs-backend to backend!
) else (
    echo nodejs-backend folder not found.
)

echo.
echo ============================================
echo Cleanup Complete!
echo ============================================
echo.
echo Your project now has 3 folders:
echo   - frontend/  (React app)
echo   - backend/   (Node.js + Express + MySQL)
echo   - database/  (MySQL schema files)
echo.
echo Next steps:
echo 1. cd backend
echo 2. npm start
echo.
pause
