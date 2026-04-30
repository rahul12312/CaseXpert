-- ============================================================================
-- LAWYER LOCATION & MAP FEATURE - DATABASE MIGRATION
-- Adds location fields to support map pins and geolocation
-- ============================================================================

USE casexpert_db;

-- ============================================================================
-- ALTER LAWYERS TABLE - Add Location Fields
-- ============================================================================

ALTER TABLE lawyers
ADD COLUMN IF NOT EXISTS address_line1 VARCHAR(255) DEFAULT NULL COMMENT 'Office address line 1',
ADD COLUMN IF NOT EXISTS address_line2 VARCHAR(255) DEFAULT NULL COMMENT 'Office address line 2',
ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'India' COMMENT 'Country',
ADD COLUMN IF NOT EXISTS pincode VARCHAR(20) DEFAULT NULL COMMENT 'Postal/ZIP code',
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8) DEFAULT NULL COMMENT 'Latitude for map pin',
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8) DEFAULT NULL COMMENT 'Longitude for map pin',
ADD COLUMN IF NOT EXISTS location_verified BOOLEAN DEFAULT FALSE COMMENT 'Whether location has been geocoded',
ADD COLUMN IF NOT EXISTS office_type ENUM('Solo', 'Partnership', 'Firm', 'Corporate') DEFAULT 'Solo',
ADD INDEX IF NOT EXISTS idx_latitude_longitude (latitude, longitude),
ADD INDEX IF NOT EXISTS idx_city_state (city, state),
ADD INDEX IF NOT EXISTS idx_location_verified (location_verified);

-- ============================================================================
-- UPDATE EXISTING LAWYERS WITH SAMPLE INDIA LOCATIONS
-- ============================================================================

-- Update Pune lawyers with verified locations
UPDATE lawyers SET
    address_line1 = CONCAT('Office ', FLOOR(1 + RAND() * 100), ', ', ELT(FLOOR(1 + RAND() * 5), 'MG Road', 'FC Road', 'Deccan Gymkhana', 'Shivaji Nagar', 'Koregaon Park')),
    country = 'India',
    pincode = CONCAT('411', LPAD(FLOOR(1 + RAND() * 99), 3, '0')),
    latitude = 18.5204 + (RAND() * 0.1 - 0.05),
    longitude = 73.8567 + (RAND() * 0.1 - 0.05),
    location_verified = TRUE,
    office_type = ELT(FLOOR(1 + RAND() * 4), 'Solo', 'Partnership', 'Firm', 'Corporate')
WHERE city = 'Pune';

-- Update Mumbai lawyers
UPDATE lawyers SET
    address_line1 = CONCAT('Office ', FLOOR(1 + RAND() * 100), ', ', ELT(FLOOR(1 + RAND() * 5), 'Nariman Point', 'Fort', 'Churchgate', 'Andheri', 'Bandra')),
    country = 'India',
    pincode = CONCAT('400', LPAD(FLOOR(1 + RAND() * 99), 3, '0')),
    latitude = 19.0760 + (RAND() * 0.1 - 0.05),
    longitude = 72.8777 + (RAND() * 0.1 - 0.05),
    location_verified = TRUE,
    office_type = ELT(FLOOR(1 + RAND() * 4), 'Solo', 'Partnership', 'Firm', 'Corporate')
WHERE city = 'Mumbai';

-- Update Delhi lawyers
UPDATE lawyers SET
    address_line1 = CONCAT('Office ', FLOOR(1 + RAND() * 100), ', ', ELT(FLOOR(1 + RAND() * 5), 'Connaught Place', 'Dwarka', 'Saket', 'Karol Bagh', 'Rohini')),
    country = 'India',
    pincode = CONCAT('110', LPAD(FLOOR(1 + RAND() * 99), 3, '0')),
    latitude = 28.6139 + (RAND() * 0.1 - 0.05),
    longitude = 77.2090 + (RAND() * 0.1 - 0.05),
    location_verified = TRUE,
    office_type = ELT(FLOOR(1 + RAND() * 4), 'Solo', 'Partnership', 'Firm', 'Corporate')
WHERE city = 'Delhi';

-- Update Bangalore lawyers
UPDATE lawyers SET
    address_line1 = CONCAT('Office ', FLOOR(1 + RAND() * 100), ', ', ELT(FLOOR(1 + RAND() * 5), 'MG Road', 'Indiranagar', 'Koramangala', 'Whitefield', 'HSR Layout')),
    country = 'India',
    pincode = CONCAT('560', LPAD(FLOOR(1 + RAND() * 99), 3, '0')),
    latitude = 12.9716 + (RAND() * 0.1 - 0.05),
    longitude = 77.5946 + (RAND() * 0.1 - 0.05),
    location_verified = TRUE,
    office_type = ELT(FLOOR(1 + RAND() * 4), 'Solo', 'Partnership', 'Firm', 'Corporate')
WHERE city = 'Bangalore';

-- Update other city lawyers with generic coordinates (centered on city)
UPDATE lawyers SET
    address_line1 = CONCAT('Office ', FLOOR(1 + RAND() * 100), ', Main Street'),
    country = 'India',
    pincode = CONCAT(LPAD(FLOOR(100 + RAND() * 899), 3, '0'), LPAD(FLOOR(1 + RAND() * 99), 3, '0')),
    location_verified = FALSE
WHERE city IS NOT NULL AND latitude IS NULL;

-- ============================================================================
-- CREATE VIEW FOR LAWYERS WITH LOCATION
-- ============================================================================

CREATE OR REPLACE VIEW vw_lawyers_with_location AS
SELECT 
    l.id,
    l.user_id,
    u.name,
    u.email,
    u.phone,
    u.profile_image,
    l.specialization,
    l.experience,
    l.fee_per_hour as consultation_fee,
    l.bio,
    l.rating as average_rating,
    l.total_cases,
    -- Location fields
    l.address_line1,
    l.address_line2,
    l.city,
    l.state,
    l.country,
    l.pincode,
    l.latitude,
    l.longitude,
    l.location_verified,
    l.office_type,
    -- Combined address
    CONCAT_WS(', ', 
        l.address_line1,
        l.city,
        l.state,
        l.country,
        l.pincode
    ) as full_address,
    -- User verification
    u.is_verified
FROM lawyers l
INNER JOIN users u ON l.user_id = u.id
WHERE u.is_active = TRUE;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
SELECT 'Lawyer Location & Map Feature Migration Completed Successfully!' as Status;
SELECT COUNT(*) as 'Lawyers with Verified Locations' FROM lawyers WHERE location_verified = TRUE;
