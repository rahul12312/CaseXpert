-- Fix the cases table to make description optional
-- This resolves the "A required database field is missing" error

USE casexpert_db;

-- Alter the cases table to make description field nullable
ALTER TABLE cases MODIFY COLUMN description TEXT NULL;

-- Also update some other fields that should be flexible
-- Make filing_date use the column name consistent with frontend
ALTER TABLE cases 
  CHANGE COLUMN case_filing_date filing_date DATE NULL;

-- Add opponent_name and opponent_lawyer columns if they don't exist
-- (These are in the code but might not be in the original schema)
-- First check if columns exist, then add if needed
SELECT 'Checking for opponent_name and opponent_lawyer columns...' AS status;

-- Add opponent_name if it doesn't exist
SET @col_exists = (
  SELECT COUNT(*) 
  FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = 'casexpert_db' 
  AND TABLE_NAME = 'cases' 
  AND COLUMN_NAME = 'opponent_name'
);

SET @query = IF(
  @col_exists = 0,
  'ALTER TABLE cases ADD COLUMN opponent_name VARCHAR(255) NULL AFTER filing_date',
  'SELECT "opponent_name column already exists" AS info'
);

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add opponent_lawyer if it doesn't exist
SET @col_exists = (
  SELECT COUNT(*) 
  FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = 'casexpert_db' 
  AND TABLE_NAME = 'cases' 
  AND COLUMN_NAME = 'opponent_lawyer'
);

SET @query = IF(
  @col_exists = 0,
  'ALTER TABLE cases ADD COLUMN opponent_lawyer VARCHAR(255) NULL AFTER opponent_name',
  'SELECT "opponent_lawyer column already exists" AS info'
);

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Case table schema fix completed!' AS status;
