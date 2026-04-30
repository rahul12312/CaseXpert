#!/bin/bash

# ============================================
# CaseXpert Database Setup Script
# ============================================

echo "=========================================="
echo "CaseXpert Database Setup"
echo "=========================================="
echo ""

# Database credentials
DB_USER="root"
DB_NAME="casexpert_db"

# Prompt for password
echo "Enter MySQL root password:"
read -s DB_PASS

echo ""
echo "Setting up database..."
echo ""

# Create database and import schema
mysql -u $DB_USER -p$DB_PASS < casexpert_schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Database created successfully!"
    echo ""
    echo "Database Name: $DB_NAME"
    echo "Character Set: UTF8MB4"
    echo ""
    
    # Verify tables
    echo "Verifying tables..."
    mysql -u $DB_USER -p$DB_PASS -e "USE $DB_NAME; SHOW TABLES;"
    
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "Default Admin Credentials:"
    echo "Email: admin@casexpert.com"
    echo "Password: admin123"
    echo ""
    echo "⚠️  IMPORTANT: Change the admin password immediately!"
    echo ""
else
    echo "❌ Error: Database setup failed!"
    exit 1
fi
