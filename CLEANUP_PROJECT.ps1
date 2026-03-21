# CaseXpert Project Cleanup Script
# This will organize your project into 3 clean folders

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "CaseXpert Project Cleanup Script" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Current folder structure:" -ForegroundColor Yellow
Get-ChildItem -Directory | Select-Object Name | Format-Table -AutoSize

Write-Host ""
Write-Host "This script will:" -ForegroundColor Yellow
Write-Host "  1. Stop all Node.js processes" -ForegroundColor White
Write-Host "  2. Delete 'backend' folder (old MongoDB backend)" -ForegroundColor White
Write-Host "  3. Delete 'casexpert-backend' folder (old PHP backend)" -ForegroundColor White
Write-Host "  4. Rename 'nodejs-backend' to 'backend'" -ForegroundColor White
Write-Host "  5. Keep only: frontend, backend, database" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Do you want to continue? (Y/N)"
if ($confirm -ne 'Y' -and $confirm -ne 'y') {
    Write-Host "Cleanup cancelled." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Step 1: Stopping all Node.js processes..." -ForegroundColor Green
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Host "  ✓ Stopped $($nodeProcesses.Count) Node.js process(es)" -ForegroundColor Green
} else {
    Write-Host "  ✓ No Node.js processes running" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 2: Waiting 2 seconds for processes to close..." -ForegroundColor Green
Start-Sleep -Seconds 2
Write-Host "  ✓ Done" -ForegroundColor Green

Write-Host ""
Write-Host "Step 3: Deleting old 'backend' folder (MongoDB)..." -ForegroundColor Green
if (Test-Path "backend") {
    try {
        Remove-Item -Path "backend" -Recurse -Force -ErrorAction Stop
        Write-Host "  ✓ Old backend folder deleted!" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Error deleting backend folder: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "  → Please manually delete the 'backend' folder" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✓ Old backend folder not found (already deleted)" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 4: Deleting 'casexpert-backend' folder (PHP)..." -ForegroundColor Green
if (Test-Path "casexpert-backend") {
    try {
        Remove-Item -Path "casexpert-backend" -Recurse -Force -ErrorAction Stop
        Write-Host "  ✓ PHP backend folder deleted!" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Error deleting casexpert-backend folder: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "  → Please manually delete the 'casexpert-backend' folder" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✓ PHP backend folder not found (already deleted)" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 5: Renaming 'nodejs-backend' to 'backend'..." -ForegroundColor Green
if (Test-Path "nodejs-backend") {
    try {
        Rename-Item -Path "nodejs-backend" -NewName "backend" -ErrorAction Stop
        Write-Host "  ✓ Renamed nodejs-backend to backend!" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Error renaming folder: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "  → Please manually rename 'nodejs-backend' to 'backend'" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✓ nodejs-backend folder not found (already renamed)" -ForegroundColor Green
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Cleanup Complete!" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Final folder structure:" -ForegroundColor Yellow
Get-ChildItem -Directory | Select-Object Name | Format-Table -AutoSize

Write-Host ""
Write-Host "Your project now has 3 clean folders:" -ForegroundColor Green
Write-Host "  ✓ frontend/  - React frontend application" -ForegroundColor White
Write-Host "  ✓ backend/   - Node.js + Express + MySQL backend" -ForegroundColor White
Write-Host "  ✓ database/  - MySQL schema and setup files" -ForegroundColor White
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. cd backend" -ForegroundColor White
Write-Host "  2. npm start" -ForegroundColor White
Write-Host "  3. Backend will run on http://localhost:5001" -ForegroundColor White
Write-Host ""

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
