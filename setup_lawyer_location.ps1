# ============================================================================
# LAWYER LOCATION FEATURE - QUICK SETUP SCRIPT (Windows PowerShell)
# Run this script to set up the lawyer location and map feature
# ============================================================================

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🗺️  Lawyer Location & Map Feature Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Database Migration
Write-Host "📊 Step 1: Database Migration" -ForegroundColor Yellow
Write-Host "Please run this SQL file in MySQL Workbench or command line:"
Write-Host "   database\lawyer_location_migration.sql" -ForegroundColor Green
Write-Host ""
Write-Host "Command:" -ForegroundColor Gray
Write-Host "   mysql -u root -p casexpert_db < database\lawyer_location_migration.sql" -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter after running the migration"

# Step 2: Install NPM Packages
Write-Host ""
Write-Host "📦 Step 2: Installing required NPM packages..." -ForegroundColor Yellow
Set-Location frontend
npm install @react-google-maps/api
Set-Location ..
Write-Host "✅ Packages installed" -ForegroundColor Green

# Step 3: Configure API Keys
Write-Host ""
Write-Host "🔑 Step 3: Configure Google Maps API Key" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Go to: https://console.cloud.google.com/" -ForegroundColor White
Write-Host "2. Create/Select a project" -ForegroundColor White
Write-Host "3. Enable APIs:" -ForegroundColor White
Write-Host "   - Maps JavaScript API" -ForegroundColor Gray
Write-Host "   - Geocoding API" -ForegroundColor Gray
Write-Host "4. Create API Key" -ForegroundColor White
Write-Host "5. Restrict API Key (Important!):" -ForegroundColor White
Write-Host "   - Application restrictions: HTTP referrers" -ForegroundColor Gray
Write-Host "   - API restrictions: Maps JavaScript API, Geocoding API" -ForegroundColor Gray
Write-Host ""
$MapsKey = Read-Host "Enter your Google Maps API Key"

# Add to backend .env
Write-Host ""
if (Test-Path "backend\.env") {
    $backendEnv = Get-Content "backend\.env"
    if ($backendEnv -match "GOOGLE_MAPS_API_KEY") {
        (Get-Content "backend\.env") -replace "GOOGLE_MAPS_API_KEY=.*", "GOOGLE_MAPS_API_KEY=$MapsKey" | Set-Content "backend\.env"
        Write-Host "✅ Updated backend\.env" -ForegroundColor Green
    } else {
        Add-Content "backend\.env" "`nGOOGLE_MAPS_API_KEY=$MapsKey"
        Write-Host "✅ Added to backend\.env" -ForegroundColor Green
    }
} else {
    Copy-Item "backend\.env.example" "backend\.env"
    (Get-Content "backend\.env") -replace "GOOGLE_MAPS_API_KEY=.*", "GOOGLE_MAPS_API_KEY=$MapsKey" | Set-Content "backend\.env"
    Write-Host "✅ Created backend\.env" -ForegroundColor Green
}

# Add to frontend .env
if (Test-Path "frontend\.env") {
    $frontendEnv = Get-Content "frontend\.env"
    if ($frontendEnv -match "VITE_GOOGLE_MAPS_API_KEY") {
        (Get-Content "frontend\.env") -replace "VITE_GOOGLE_MAPS_API_KEY=.*", "VITE_GOOGLE_MAPS_API_KEY=$MapsKey" | Set-Content "frontend\.env"
        Write-Host "✅ Updated frontend\.env" -ForegroundColor Green
    } else {
        Add-Content "frontend\.env" "`nVITE_GOOGLE_MAPS_API_KEY=$MapsKey"
        Write-Host "✅ Added to frontend\.env" -ForegroundColor Green
    }
} else {
    Copy-Item "frontend\.env.example" "frontend\.env"
    (Get-Content "frontend\.env") -replace "VITE_GOOGLE_MAPS_API_KEY=.*", "VITE_GOOGLE_MAPS_API_KEY=$MapsKey" | Set-Content "frontend\.env"
    Write-Host "✅ Created frontend\.env" -ForegroundColor Green
}

# Summary
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✨ Setup Complete!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Restart your backend server:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Restart your frontend server:" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Visit: http://localhost:5173/marketplace" -ForegroundColor White
Write-Host "4. Toggle to 'Map' view to see lawyers on map" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Test Endpoints:" -ForegroundColor Yellow
Write-Host "   GET http://localhost:5001/api/lawyer-location/map" -ForegroundColor Gray
Write-Host "   GET http://localhost:5001/api/lawyer-location/nearby?lat=18.5204&lng=73.8567" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Full Guide: LAWYER_LOCATION_MAP_IMPLEMENTATION.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Happy coding!" -ForegroundColor Green
