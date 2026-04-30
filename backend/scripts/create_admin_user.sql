-- ============================================================================
-- Admin User Setup Script for CaseXpert
-- This script creates an admin user with predefined credentials
-- 
-- Admin Credentials:
-- Email: tipteajay@gmail.com
-- Password: demo12345
-- ============================================================================

-- First, delete any existing admin user (to avoid duplicates)
DELETE FROM users WHERE email = 'tipteajay@gmail.com';

-- Insert admin user
-- Password hash for 'demo12345' using bcrypt with salt rounds = 10
-- Generated using: bcrypt.hashSync('demo12345', 10)
INSERT INTO users (name, email, password, user_type, is_active, is_verified, created_at)
VALUES (
    'Admin',
    'tipteajay@gmail.com',
    '$2a$10$YX5P3YhDQm6hZKvYqJ6Hv.8DvwZfNt5xSr5aX8tW3Yr7P1qRmKJO6',
    'admin',
    1,
    1,
    NOW()
);

-- Verify the insertion
SELECT id, name, email, user_type, is_active, created_at 
FROM users 
WHERE email = 'tipteajay@gmail.com';

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. The password 'demo12345' has been hashed using bcrypt
-- 2. The user_type is set to 'admin' for full administrative access
-- 3. is_active = 1 ensures the account is active
-- 4. is_verified = 1 bypasses email verification
-- 
-- To run this script:
--   mysql -u root -p casexpert < backend/scripts/create_admin_user.sql
-- 
-- Or in MySQL Workbench:
--   - Open the file
--   - Click Execute (lightning bolt icon)
-- ============================================================================
