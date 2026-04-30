-- ============================================================================
-- LAWYER MARKETPLACE DUMMY DATA
-- Sample data for 100 lawyers with Indian names and realistic details
-- ============================================================================

USE casexpert_db;

-- ============================================================================
-- 1. INSERT DUMMY USERS (Lawyers)
-- ============================================================================
INSERT INTO users (name, email, phone, password, user_type, is_verified, is_active, profile_image) VALUES
-- Password for all: hashed 'lawyer123'
('Adv. Rajesh Kumar', 'rajesh.kumar@lawfirm.in', '9876543210', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/rajesh.jpg'),
('Adv. Priya Sharma', 'priya.sharma@legalaid.in', '9876543211', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/priya.jpg'),
('Adv. Amit Patel', 'amit.patel@advocates.in', '9876543212', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/amit.jpg'),
('Adv. Sneha Reddy', 'sneha.reddy@lawchambers.in', '9876543213', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/sneha.jpg'),
('Adv. Vikram Singh', 'vikram.singh@legalexperts.in', '9876543214', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/vikram.jpg'),
('Adv. Anjali Mehta', 'anjali.mehta@lawassociates.in', '9876543215', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/anjali.jpg'),
('Adv. Rahul Verma', 'rahul.verma@advocates.in', '9876543216', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/rahul.jpg'),
('Adv. Kavita Nair', 'kavita.nair@legalservices.in', '9876543217', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/kavita.jpg'),
('Adv. Sanjay Desai', 'sanjay.desai@lawfirm.in', '9876543218', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/sanjay.jpg'),
('Adv. Meera Iyer', 'meera.iyer@advocates.in', '9876543219', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/meera.jpg'),
('Adv. Arjun Kapoor', 'arjun.kapoor@legalaid.in', '9876543220', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/arjun.jpg'),
('Adv. Pooja Gupta', 'pooja.gupta@lawchambers.in', '9876543221', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/pooja.jpg'),
('Adv. Karan Malhotra', 'karan.malhotra@advocates.in', '9876543222', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/karan.jpg'),
('Adv. Divya Krishnan', 'divya.krishnan@legalexperts.in', '9876543223', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/divya.jpg'),
('Adv. Rohit Joshi', 'rohit.joshi@lawassociates.in', '9876543224', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/rohit.jpg'),
('Adv. Neha Agarwal', 'neha.agarwal@advocates.in', '9876543225', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/neha.jpg'),
('Adv. Suresh Rao', 'suresh.rao@legalservices.in', '9876543226', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/suresh.jpg'),
('Adv. Ritu Bansal', 'ritu.bansal@lawfirm.in', '9876543227', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/ritu.jpg'),
('Adv. Manish Tiwari', 'manish.tiwari@advocates.in', '9876543228', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/manish.jpg'),
('Adv. Swati Pillai', 'swati.pillai@legalaid.in', '9876543229', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/swati.jpg'),
('Adv. Anil Bhatt', 'anil.bhatt@lawchambers.in', '9876543230', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/anil.jpg'),
('Adv. Deepika Menon', 'deepika.menon@advocates.in', '9876543231', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/deepika.jpg'),
('Adv. Gaurav Saxena', 'gaurav.saxena@legalexperts.in', '9876543232', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/gaurav.jpg'),
('Adv. Shruti Kulkarni', 'shruti.kulkarni@lawassociates.in', '9876543233', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/shruti.jpg'),
('Adv. Nitin Pandey', 'nitin.pandey@advocates.in', '9876543234', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/nitin.jpg'),
('Adv. Aarti Sinha', 'aarti.sinha@legalservices.in', '9876543235', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/aarti.jpg'),
('Adv. Vishal Chauhan', 'vishal.chauhan@lawfirm.in', '9876543236', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/vishal.jpg'),
('Adv. Lakshmi Venkat', 'lakshmi.venkat@advocates.in', '9876543237', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/lakshmi.jpg'),
('Adv. Prakash Mishra', 'prakash.mishra@legalaid.in', '9876543238', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/prakash.jpg'),
('Adv. Sunita Rane', 'sunita.rane@lawchambers.in', '9876543239', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/sunita.jpg'),
('Adv. Harish Bose', 'harish.bose@advocates.in', '9876543240', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/harish.jpg'),
('Adv. Madhuri Jain', 'madhuri.jain@legalexperts.in', '9876543241', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/madhuri.jpg'),
('Adv. Ashok Dubey', 'ashok.dubey@lawassociates.in', '9876543242', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/ashok.jpg'),
('Adv. Rekha Shetty', 'rekha.shetty@advocates.in', '9876543243', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/rekha.jpg'),
('Adv. Dinesh Yadav', 'dinesh.yadav@legalservices.in', '9876543244', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/dinesh.jpg'),
('Adv. Geeta Chopra', 'geeta.chopra@lawfirm.in', '9876543245', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/geeta.jpg'),
('Adv. Ramesh Naik', 'ramesh.naik@advocates.in', '9876543246', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/ramesh.jpg'),
('Adv. Shilpa Hegde', 'shilpa.hegde@legalaid.in', '9876543247', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/shilpa.jpg'),
('Adv. Mohan Das', 'mohan.das@lawchambers.in', '9876543248', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/mohan.jpg'),
('Adv. Nisha Khanna', 'nisha.khanna@advocates.in', '9876543249', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/nisha.jpg'),
('Adv. Sandeep Bhatia', 'sandeep.bhatia@legalexperts.in', '9876543250', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/sandeep.jpg'),
('Adv. Vaishali Deshpande', 'vaishali.deshpande@lawassociates.in', '9876543251', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/vaishali.jpg'),
('Adv. Alok Tripathi', 'alok.tripathi@advocates.in', '9876543252', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/alok.jpg'),
('Adv. Pallavi Gokhale', 'pallavi.gokhale@legalservices.in', '9876543253', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/pallavi.jpg'),
('Adv. Ravi Shankar', 'ravi.shankar@lawfirm.in', '9876543254', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/ravi.jpg'),
('Adv. Smita Patil', 'smita.patil@advocates.in', '9876543255', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/smita.jpg'),
('Adv. Yogesh Kulkarni', 'yogesh.kulkarni@legalaid.in', '9876543256', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/yogesh.jpg'),
('Adv. Tanvi Shah', 'tanvi.shah@lawchambers.in', '9876543257', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/tanvi.jpg'),
('Adv. Bharat Thakur', 'bharat.thakur@advocates.in', '9876543258', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/bharat.jpg'),
('Adv. Usha Rao', 'usha.rao@legalexperts.in', '9876543259', '$2b$10$YourHashedPasswordHere', 'lawyer', TRUE, TRUE, '/uploads/lawyers/usha.jpg');

-- Note: Add 50 more lawyers to reach 100 total
-- Continue with similar pattern...

-- ============================================================================
-- 2. INSERT LAWYER PROFILES
-- ============================================================================
-- Get user IDs for lawyers (assuming they start from a certain ID)
SET @user_start_id = (SELECT MIN(id) FROM users WHERE user_type = 'lawyer' AND email LIKE '%@lawfirm.in' OR email LIKE '%@advocates.in' OR email LIKE '%@legalaid.in');

-- Insert lawyer profiles with varied data
INSERT INTO lawyers (
    user_id, bar_council_id, bar_council_state, enrollment_year, gender, 
    experience, consultation_fee, bio, city, state, 
    is_verified, average_rating, total_reviews, total_cases, success_rate,
    availability_status, is_available_today, is_available_this_week, is_24_7_support,
    response_time, profile_completion
)
SELECT 
    u.id,
    CONCAT('BAR/', UPPER(LEFT(u.name, 2)), '/', YEAR(CURDATE()) - (5 + (u.id % 20)), '/', LPAD(u.id, 6, '0')),
    CASE (u.id % 10)
        WHEN 0 THEN 'Maharashtra'
        WHEN 1 THEN 'Delhi'
        WHEN 2 THEN 'Karnataka'
        WHEN 3 THEN 'Tamil Nadu'
        WHEN 4 THEN 'Gujarat'
        WHEN 5 THEN 'Rajasthan'
        WHEN 6 THEN 'West Bengal'
        WHEN 7 THEN 'Uttar Pradesh'
        WHEN 8 THEN 'Kerala'
        ELSE 'Punjab'
    END,
    YEAR(CURDATE()) - (5 + (u.id % 20)),
    CASE (u.id % 3) WHEN 0 THEN 'Male' WHEN 1 THEN 'Female' ELSE 'Male' END,
    (u.id % 20) + 1,
    CASE (u.id % 10)
        WHEN 0 THEN 0
        WHEN 1 THEN 300
        WHEN 2 THEN 500
        WHEN 3 THEN 800
        WHEN 4 THEN 1000
        WHEN 5 THEN 1500
        WHEN 6 THEN 2000
        WHEN 7 THEN 3000
        WHEN 8 THEN 4000
        ELSE 5000
    END,
    CONCAT('Experienced lawyer specializing in various legal matters. Committed to providing quality legal services with integrity and professionalism. ', 
           (u.id % 20) + 1, ' years of practice in Indian courts.'),
    CASE (u.id % 15)
        WHEN 0 THEN 'Mumbai'
        WHEN 1 THEN 'Delhi'
        WHEN 2 THEN 'Bangalore'
        WHEN 3 THEN 'Pune'
        WHEN 4 THEN 'Ahmedabad'
        WHEN 5 THEN 'Chennai'
        WHEN 6 THEN 'Hyderabad'
        WHEN 7 THEN 'Kolkata'
        WHEN 8 THEN 'Jaipur'
        WHEN 9 THEN 'Lucknow'
        WHEN 10 THEN 'Kochi'
        WHEN 11 THEN 'Chandigarh'
        WHEN 12 THEN 'Indore'
        WHEN 13 THEN 'Nagpur'
        ELSE 'Surat'
    END,
    CASE (u.id % 10)
        WHEN 0 THEN 'Maharashtra'
        WHEN 1 THEN 'Delhi'
        WHEN 2 THEN 'Karnataka'
        WHEN 3 THEN 'Tamil Nadu'
        WHEN 4 THEN 'Gujarat'
        WHEN 5 THEN 'Rajasthan'
        WHEN 6 THEN 'West Bengal'
        WHEN 7 THEN 'Uttar Pradesh'
        WHEN 8 THEN 'Kerala'
        ELSE 'Punjab'
    END,
    CASE WHEN (u.id % 5) = 0 THEN FALSE ELSE TRUE END,
    3.5 + (RAND() * 1.5),
    FLOOR(10 + (RAND() * 90)),
    FLOOR(20 + (RAND() * 180)),
    75 + (RAND() * 20),
    'Available',
    CASE WHEN (u.id % 3) = 0 THEN TRUE ELSE FALSE END,
    TRUE,
    CASE WHEN (u.id % 10) = 0 THEN TRUE ELSE FALSE END,
    CASE (u.id % 4)
        WHEN 0 THEN 'Within 1 hour'
        WHEN 1 THEN 'Within 6 hours'
        WHEN 2 THEN 'Within 24 hours'
        ELSE 'Within 48 hours'
    END,
    85 + (u.id % 15)
FROM users u
WHERE u.user_type = 'lawyer' 
  AND u.email LIKE '%@%'
  AND NOT EXISTS (SELECT 1 FROM lawyers l WHERE l.user_id = u.id);

-- ============================================================================
-- 3. ASSIGN PRACTICE AREAS TO LAWYERS
-- ============================================================================
INSERT INTO lawyer_practice_areas (lawyer_id, practice_area_id, years_of_experience, is_primary)
SELECT 
    l.id,
    pa.id,
    FLOOR(l.experience * 0.7),
    TRUE
FROM lawyers l
CROSS JOIN practice_areas pa
WHERE pa.id = ((l.id % 12) + 1)
LIMIT 50;

-- Add secondary practice areas
INSERT INTO lawyer_practice_areas (lawyer_id, practice_area_id, years_of_experience, is_primary)
SELECT 
    l.id,
    pa.id,
    FLOOR(l.experience * 0.4),
    FALSE
FROM lawyers l
CROSS JOIN practice_areas pa
WHERE pa.id = (((l.id + 1) % 12) + 1)
  AND NOT EXISTS (
      SELECT 1 FROM lawyer_practice_areas lpa 
      WHERE lpa.lawyer_id = l.id AND lpa.practice_area_id = pa.id
  )
LIMIT 50;

-- ============================================================================
-- 4. ASSIGN LANGUAGES TO LAWYERS
-- ============================================================================
-- All lawyers speak English and Hindi
INSERT INTO lawyer_languages (lawyer_id, language_id, proficiency_level)
SELECT l.id, 1, 'Fluent' FROM lawyers l; -- English

INSERT INTO lawyer_languages (lawyer_id, language_id, proficiency_level)
SELECT l.id, 2, 'Native' FROM lawyers l; -- Hindi

-- Add regional languages based on state
INSERT INTO lawyer_languages (lawyer_id, language_id, proficiency_level)
SELECT 
    l.id,
    CASE 
        WHEN l.state = 'Maharashtra' THEN 3  -- Marathi
        WHEN l.state = 'Gujarat' THEN 4      -- Gujarati
        WHEN l.state = 'Tamil Nadu' THEN 5   -- Tamil
        WHEN l.state = 'Karnataka' THEN 7    -- Kannada
        WHEN l.state = 'West Bengal' THEN 8  -- Bengali
        WHEN l.state = 'Punjab' THEN 9       -- Punjabi
        WHEN l.state = 'Kerala' THEN 10      -- Malayalam
        ELSE 11                               -- Urdu
    END,
    'Native'
FROM lawyers l
WHERE l.state IS NOT NULL;

-- ============================================================================
-- 5. INSERT SAMPLE REVIEWS
-- ============================================================================
-- Note: This requires existing client users. Adjust user_id as needed.
INSERT INTO lawyer_reviews (lawyer_id, user_id, rating, review_title, review_text, is_verified, is_approved)
SELECT 
    l.id,
    (SELECT MIN(id) FROM users WHERE user_type = 'client' LIMIT 1),
    4.0 + (RAND() * 1.0),
    'Excellent legal service',
    'Very professional and knowledgeable. Helped me resolve my case efficiently.',
    TRUE,
    TRUE
FROM lawyers l
WHERE l.id % 3 = 0
LIMIT 30;

-- ============================================================================
-- 6. SET UP AVAILABILITY SCHEDULES
-- ============================================================================
INSERT INTO lawyer_availability (lawyer_id, day_of_week, start_time, end_time, is_available)
SELECT 
    l.id,
    day,
    '09:00:00',
    '18:00:00',
    TRUE
FROM lawyers l
CROSS JOIN (
    SELECT 'Monday' as day UNION ALL
    SELECT 'Tuesday' UNION ALL
    SELECT 'Wednesday' UNION ALL
    SELECT 'Thursday' UNION ALL
    SELECT 'Friday' UNION ALL
    SELECT 'Saturday'
) days
WHERE l.id <= 50;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
SELECT 'Lawyer Marketplace Dummy Data Inserted Successfully!' as Status;
SELECT COUNT(*) as 'Total Lawyers' FROM lawyers;
SELECT COUNT(*) as 'Total Practice Area Assignments' FROM lawyer_practice_areas;
SELECT COUNT(*) as 'Total Language Assignments' FROM lawyer_languages;
SELECT COUNT(*) as 'Total Reviews' FROM lawyer_reviews;
