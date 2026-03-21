# ============================================================================
# CaseXpert - Case Tracking System Quick Start Script
# ============================================================================
# This script helps you quickly set up and start the case tracking system
# ============================================================================

Write-Host "`n" -NoNewline
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CaseXpert Case Tracking System" -ForegroundColor Cyan
Write-Host "  Quick Start Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`n"

# Step 1: Check if multer is installed
Write-Host "[1/5] Checking dependencies..." -ForegroundColor Yellow
Set-Location "backend"

$multerInstalled = npm list multer 2>&1 | Select-String "multer@"
if (-not $multerInstalled) {
    Write-Host "   Installing multer..." -ForegroundColor Gray
    npm install multer --save
    Write-Host "   ✅ Multer installed" -ForegroundColor Green
} else {
    Write-Host "   ✅ Multer already installed" -ForegroundColor Green
}

# Step 2: Create uploads directory
Write-Host "`n[2/5] Creating uploads directory..." -ForegroundColor Yellow
$uploadsDir = "uploads/cases"
if (-not (Test-Path $uploadsDir)) {
    New-Item -ItemType Directory -Path $uploadsDir -Force | Out-Null
    Write-Host "   ✅ Created $uploadsDir" -ForegroundColor Green
} else {
    Write-Host "   ✅ Directory already exists" -ForegroundColor Green
}

# Step 3: Kill existing node processes
Write-Host "`n[3/5] Stopping existing servers..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "   ✅ Servers stopped" -ForegroundColor Green

# Step 4: Start backend
Write-Host "`n[4/5] Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm start" -WindowStyle Normal
Start-Sleep -Seconds 5
Write-Host "   ✅ Backend starting on http://localhost:5001" -ForegroundColor Green

# Step 5: Start frontend
Write-Host "`n[5/5] Starting frontend server..." -ForegroundColor Yellow
Set-Location "../frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 3
Write-Host "   ✅ Frontend starting on http://localhost:5173" -ForegroundColor Green

# Final message
Write-Host "`n" -NoNewline
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ Case Tracking System Started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "`n"
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Run database migration (see SETUP_AND_TEST_GUIDE.md)" -ForegroundColor White
Write-Host "   2. Update App.jsx with case routes" -ForegroundColor White
Write-Host "   3. Go to http://localhost:5173/cases" -ForegroundColor White
Write-Host "`n"
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - SETUP_AND_TEST_GUIDE.md - Setup instructions" -ForegroundColor White
Write-Host "   - CASE_TRACKING_SYSTEM_COMPLETE.md - Full guide" -ForegroundColor White
Write-Host "   - CASE_TRACKING_DELIVERY_SUMMARY.md - Summary" -ForegroundColor White
Write-Host "`n"
Write-Host "🚀 Backend: http://localhost:5001" -ForegroundColor Yellow
Write-Host "🌐 Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "`n"

# Return to original directory
Set-Location ".."
