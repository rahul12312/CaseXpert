@echo off
REM ============================================
REM CaseXpert Database Setup Script (Windows)
REM ============================================

echo ==========================================
echo CaseXpert Database Setup
echo ==========================================
echo.

REM Database credentials
set DB_USER=root
set DB_NAME=casexpert_db

REM Prompt for password
set /p DB_PASS="Enter MySQL root password: "

echo.
echo Setting up database...
echo.

REM Create database and import schema
mysql -u %DB_USER% -p%DB_PASS% < casexpert_schema.sql

if %errorlevel% equ 0 (
    echo [SUCCESS] Database created successfully!
    echo.
    echo Database Name: %DB_NAME%
    echo Character Set: UTF8MB4
    echo.
    
    REM Verify tables
    echo Verifying tables...
    mysql -u %DB_USER% -p%DB_PASS% -e "USE %DB_NAME%; SHOW TABLES;"
    
    echo.
    echo [SUCCESS] Setup complete!
    echo.
    echo Default Admin Credentials:
    echo Email: admin@casexpert.com
    echo Password: admin123
    echo.
    echo [WARNING] IMPORTANT: Change the admin password immediately!
    echo.
) else (
    echo [ERROR] Database setup failed!
    exit /b 1
)

pause
