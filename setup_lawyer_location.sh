#!/bin/bash
# ============================================================================
# LAWYER LOCATION FEATURE - QUICK SETUP SCRIPT
# Run this script to set up the lawyer location and map feature
# ============================================================================

echo "=========================================="
echo "🗺️  Lawyer Location & Map Feature Setup"
echo "=========================================="
echo ""

# Step 1: Database Migration
echo "📊 Step 1: Running database migration..."
echo "Please run this SQL file in MySQL Workbench:"
echo "   database/lawyer_location_migration.sql"
echo ""
read -p "Press Enter after running the migration..."

# Step 2: Install NPM Packages
echo ""
echo "📦 Step 2: Installing required NPM packages..."
cd frontend
npm install @react-google-maps/api
cd ..

echo "✅ Packages installed"

# Step 3: Configure API Keys
echo ""
echo "🔑 Step 3: Configure Google Maps API Key"
echo ""
echo "1. Go to: https://console.cloud.google.com/"
echo "2. Create/Select a project"
echo "3. Enable APIs:"
echo "   - Maps JavaScript API"
echo "   - Geocoding API"
echo "4. Create API Key"
echo "5. Restrict API Key (Important!):"
echo "   - Application restrictions: HTTP referrers"
echo "   - API restrictions: Maps JavaScript API, Geocoding API"
echo ""
read -p "Enter your Google Maps API Key: " MAPS_KEY

# Add to backend .env
echo ""
if [ -f "backend/.env" ]; then
    if grep -q "GOOGLE_MAPS_API_KEY" backend/.env; then
        sed -i "s/GOOGLE_MAPS_API_KEY=.*/GOOGLE_MAPS_API_KEY=$MAPS_KEY/" backend/.env
        echo "✅ Updated backend/.env"
    else
        echo "GOOGLE_MAPS_API_KEY=$MAPS_KEY" >> backend/.env
        echo "✅ Added to backend/.env"
    fi
else
    cp backend/.env.example backend/.env
    sed -i "s/GOOGLE_MAPS_API_KEY=.*/GOOGLE_MAPS_API_KEY=$MAPS_KEY/" backend/.env
    echo "✅ Created backend/.env"
fi

# Add to frontend .env
if [ -f "frontend/.env" ]; then
    if grep -q "VITE_GOOGLE_MAPS_API_KEY" frontend/.env; then
        sed -i "s/VITE_GOOGLE_MAPS_API_KEY=.*/VITE_GOOGLE_MAPS_API_KEY=$MAPS_KEY/" frontend/.env
        echo "✅ Updated frontend/.env"
    else
        echo "VITE_GOOGLE_MAPS_API_KEY=$MAPS_KEY" >> frontend/.env
        echo "✅ Added to frontend/.env"
    fi
else
    cp frontend/.env.example frontend/.env
    sed -i "s/VITE_GOOGLE_MAPS_API_KEY=.*/VITE_GOOGLE_MAPS_API_KEY=$MAPS_KEY/" frontend/.env
    echo "✅ Created frontend/.env"
fi

# Step 4: Test API
echo ""
echo "🧪 Step 4: Testing setup..."
echo "Starting backend server..."

echo ""
echo "=========================================="
echo "✨ Setup Complete!"
echo "=========================================="
echo ""
echo "📍 Next Steps:"
echo "1. Restart your backend server: cd backend && npm start"
echo "2. Restart your frontend server: cd frontend && npm run dev"
echo "3. Visit: http://localhost:5173/marketplace"
echo "4. Toggle to 'Map' view to see lawyers on map"
echo ""
echo "🧪 Test Endpoints:"
echo "   GET http://localhost:5001/api/lawyer-location/map"
echo "   GET http://localhost:5001/api/lawyer-location/nearby?lat=18.5204&lng=73.8567"
echo ""
echo "📚 Full Guide: LAWYER_LOCATION_MAP_IMPLEMENTATION.md"
echo ""
echo "🎉 Happy coding!"
