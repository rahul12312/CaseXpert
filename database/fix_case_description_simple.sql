-- Fix the cases table to make description optional
-- This resolves the "A required database field is missing" error

USE casexpert_db;

-- Alter the cases table to make description field nullable
ALTER TABLE cases MODIFY COLUMN description TEXT NULL;

SELECT 'Case table schema fix completed - description is now optional!' AS status;
