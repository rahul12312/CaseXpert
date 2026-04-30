-- ============================================
-- CaseXpert - Sample SQL Queries
-- Common queries for the application
-- ============================================

USE casexpert_db;

-- ============================================
-- USER QUERIES
-- ============================================

-- Get user by email
SELECT * FROM users WHERE email = 'user@example.com';

-- Get all lawyers
SELECT u.*, l.* 
FROM users u
JOIN lawyers l ON u.id = l.user_id
WHERE u.user_type = 'lawyer' AND u.is_active = TRUE;

-- Search lawyers by specialization and location
SELECT 
    u.name,
    u.email,
    l.specialization,
    l.experience,
    l.rating,
    l.consultation_fee,
    l.city,
    l.state
FROM lawyers l
JOIN users u ON l.user_id = u.id
WHERE l.specialization LIKE '%criminal%'
AND l.city = 'Mumbai'
AND l.availability_status = 'available'
AND u.is_active = TRUE
ORDER BY l.rating DESC, l.experience DESC
LIMIT 10;

-- Get top-rated lawyers
SELECT 
    u.name,
    l.specialization,
    l.rating,
    l.total_reviews,
    l.experience,
    l.city
FROM lawyers l
JOIN users u ON l.user_id = u.id
WHERE l.rating >= 4.0
AND l.total_reviews >= 5
ORDER BY l.rating DESC, l.total_reviews DESC
LIMIT 20;

-- ============================================
-- CASE QUERIES
-- ============================================

-- Get all cases for a user
SELECT 
    c.*,
    u.name as client_name,
    lu.name as lawyer_name,
    l.specialization
FROM cases c
JOIN users u ON c.user_id = u.id
LEFT JOIN lawyers l ON c.lawyer_id = l.id
LEFT JOIN users lu ON l.user_id = lu.id
WHERE c.user_id = 1
ORDER BY c.created_at DESC;

-- Get active cases
SELECT * FROM active_cases
WHERE status IN ('assigned', 'in_progress')
ORDER BY priority DESC, next_hearing_date ASC;

-- Get cases by status
SELECT 
    c.case_number,
    c.title,
    c.status,
    c.priority,
    u.name as client_name,
    lu.name as lawyer_name
FROM cases c
JOIN users u ON c.user_id = u.id
LEFT JOIN lawyers l ON c.lawyer_id = l.id
LEFT JOIN users lu ON l.user_id = lu.id
WHERE c.status = 'pending'
ORDER BY c.created_at DESC;

-- Get cases with upcoming hearings
SELECT 
    c.case_number,
    c.title,
    c.next_hearing_date,
    u.name as client_name,
    lu.name as lawyer_name
FROM cases c
JOIN users u ON c.user_id = u.id
LEFT JOIN lawyers l ON c.lawyer_id = l.id
LEFT JOIN users lu ON l.user_id = lu.id
WHERE c.next_hearing_date > NOW()
AND c.next_hearing_date <= DATE_ADD(NOW(), INTERVAL 7 DAY)
ORDER BY c.next_hearing_date ASC;

-- Search cases by keyword
SELECT 
    c.case_number,
    c.title,
    c.description,
    c.status,
    u.name as client_name
FROM cases c
JOIN users u ON c.user_id = u.id
WHERE MATCH(c.title, c.description) AGAINST('property dispute' IN NATURAL LANGUAGE MODE)
ORDER BY c.created_at DESC;

-- ============================================
-- BOOKING QUERIES
-- ============================================

-- Get upcoming bookings for a user
SELECT 
    b.*,
    u.name as lawyer_name,
    l.specialization,
    l.consultation_fee
FROM bookings b
JOIN lawyers l ON b.lawyer_id = l.id
JOIN users u ON l.user_id = u.id
WHERE b.user_id = 1
AND b.booking_time > NOW()
AND b.status = 'confirmed'
ORDER BY b.booking_time ASC;

-- Get lawyer's schedule for a specific date
SELECT 
    b.booking_time,
    b.duration,
    b.end_time,
    b.status,
    u.name as client_name,
    b.booking_type
FROM bookings b
JOIN users u ON b.user_id = u.id
WHERE b.lawyer_id = 1
AND DATE(b.booking_time) = '2024-12-01'
ORDER BY b.booking_time ASC;

-- Check lawyer availability
CALL get_lawyer_availability(1, '2024-12-01');

-- Get booking statistics
SELECT 
    lawyer_id,
    COUNT(*) as total_bookings,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
    AVG(rating) as avg_rating
FROM bookings
WHERE lawyer_id = 1
GROUP BY lawyer_id;

-- ============================================
-- PAYMENT QUERIES
-- ============================================

-- Get payment history for a user
SELECT 
    p.*,
    b.booking_number,
    c.case_number,
    l.id as lawyer_id,
    u.name as lawyer_name
FROM payments p
LEFT JOIN bookings b ON p.booking_id = b.id
LEFT JOIN cases c ON p.case_id = c.id
LEFT JOIN lawyers l ON p.lawyer_id = l.id
LEFT JOIN users u ON l.user_id = u.id
WHERE p.user_id = 1
ORDER BY p.created_at DESC;

-- Get successful payments
SELECT * FROM payments
WHERE status = 'completed'
AND payment_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY payment_date DESC;

-- Calculate total earnings for a lawyer
SELECT 
    lawyer_id,
    COUNT(*) as total_transactions,
    SUM(final_amount) as total_earnings,
    AVG(final_amount) as avg_transaction
FROM payments
WHERE lawyer_id = 1
AND status = 'completed'
GROUP BY lawyer_id;

-- Get monthly revenue
SELECT 
    DATE_FORMAT(payment_date, '%Y-%m') as month,
    COUNT(*) as transactions,
    SUM(final_amount) as revenue
FROM payments
WHERE status = 'completed'
GROUP BY DATE_FORMAT(payment_date, '%Y-%m')
ORDER BY month DESC;

-- ============================================
-- DOCUMENT QUERIES
-- ============================================

-- Get all documents for a case
SELECT 
    d.*,
    u.name as uploaded_by_name
FROM documents d
JOIN users u ON d.uploaded_by = u.id
WHERE d.case_id = 1
ORDER BY d.uploaded_at DESC;

-- Get documents by type
SELECT 
    d.*,
    c.case_number,
    c.title as case_title
FROM documents d
JOIN cases c ON d.case_id = c.id
WHERE d.document_type = 'evidence'
AND d.access_level = 'private'
ORDER BY d.uploaded_at DESC;

-- Get recent documents
SELECT 
    d.document_title,
    d.file_name,
    d.uploaded_at,
    c.case_number,
    u.name as uploaded_by
FROM documents d
JOIN cases c ON d.case_id = c.id
JOIN users u ON d.uploaded_by = u.id
WHERE d.uploaded_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY d.uploaded_at DESC;

-- ============================================
-- CHAT/MESSAGE QUERIES
-- ============================================

-- Get chat messages for a case
SELECT 
    ch.*,
    u.name as sender_name
FROM chat ch
JOIN users u ON ch.sender_id = u.id
WHERE ch.case_id = 1
ORDER BY ch.created_at ASC;

-- Get unread messages for a user
SELECT 
    ch.*,
    u.name as sender_name,
    c.case_number
FROM chat ch
JOIN users u ON ch.sender_id = u.id
JOIN cases c ON ch.case_id = c.id
WHERE ch.receiver_id = 1
AND ch.is_read = FALSE
ORDER BY ch.created_at DESC;

-- Mark messages as read
UPDATE chat
SET is_read = TRUE, read_at = NOW()
WHERE receiver_id = 1
AND case_id = 1
AND is_read = FALSE;

-- Get chat statistics
SELECT 
    case_id,
    COUNT(*) as total_messages,
    SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END) as unread_count,
    MAX(created_at) as last_message_time
FROM chat
WHERE receiver_id = 1
GROUP BY case_id
ORDER BY last_message_time DESC;

-- ============================================
-- REVIEW QUERIES
-- ============================================

-- Get reviews for a lawyer
SELECT 
    r.*,
    u.name as reviewer_name,
    c.case_number
FROM reviews r
JOIN users u ON r.user_id = u.id
LEFT JOIN cases c ON r.case_id = c.id
WHERE r.lawyer_id = 1
AND r.is_published = TRUE
ORDER BY r.created_at DESC;

-- Get average rating for a lawyer
SELECT 
    lawyer_id,
    AVG(rating) as avg_rating,
    COUNT(*) as total_reviews,
    SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
    SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
    SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
    SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
    SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
FROM reviews
WHERE lawyer_id = 1
AND is_published = TRUE
GROUP BY lawyer_id;

-- ============================================
-- NOTIFICATION QUERIES
-- ============================================

-- Get unread notifications
SELECT * FROM notifications
WHERE user_id = 1
AND is_read = FALSE
ORDER BY priority DESC, created_at DESC;

-- Mark notifications as read
UPDATE notifications
SET is_read = TRUE, read_at = NOW()
WHERE user_id = 1
AND is_read = FALSE;

-- ============================================
-- STATISTICS & ANALYTICS
-- ============================================

-- Dashboard statistics for a user
SELECT 
    (SELECT COUNT(*) FROM cases WHERE user_id = 1) as total_cases,
    (SELECT COUNT(*) FROM cases WHERE user_id = 1 AND status IN ('assigned', 'in_progress')) as active_cases,
    (SELECT COUNT(*) FROM bookings WHERE user_id = 1 AND status = 'confirmed') as upcoming_bookings,
    (SELECT SUM(final_amount) FROM payments WHERE user_id = 1 AND status = 'completed') as total_spent;

-- Lawyer statistics
SELECT * FROM lawyer_stats WHERE user_id = 5;

-- Platform statistics (Admin)
SELECT 
    (SELECT COUNT(*) FROM users WHERE user_type = 'client') as total_clients,
    (SELECT COUNT(*) FROM users WHERE user_type = 'lawyer') as total_lawyers,
    (SELECT COUNT(*) FROM cases) as total_cases,
    (SELECT COUNT(*) FROM bookings WHERE status = 'completed') as completed_bookings,
    (SELECT SUM(final_amount) FROM payments WHERE status = 'completed') as total_revenue;

-- Monthly statistics
SELECT 
    DATE_FORMAT(created_at, '%Y-%m') as month,
    COUNT(*) as new_cases,
    SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_cases
FROM cases
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
GROUP BY DATE_FORMAT(created_at, '%Y-%m')
ORDER BY month DESC;

-- ============================================
-- COMPLEX QUERIES
-- ============================================

-- Get lawyer performance report
SELECT 
    l.id,
    u.name,
    l.specialization,
    l.rating,
    l.total_reviews,
    COUNT(DISTINCT c.id) as total_cases,
    COUNT(DISTINCT CASE WHEN c.status = 'resolved' THEN c.id END) as resolved_cases,
    COUNT(DISTINCT b.id) as total_bookings,
    AVG(b.rating) as avg_booking_rating,
    SUM(p.final_amount) as total_earnings
FROM lawyers l
JOIN users u ON l.user_id = u.id
LEFT JOIN cases c ON l.id = c.lawyer_id
LEFT JOIN bookings b ON l.id = b.lawyer_id AND b.status = 'completed'
LEFT JOIN payments p ON l.id = p.lawyer_id AND p.status = 'completed'
WHERE l.id = 1
GROUP BY l.id;

-- Get case timeline
SELECT 
    'Case Created' as event,
    created_at as event_time,
    NULL as details
FROM cases WHERE id = 1
UNION ALL
SELECT 
    'Document Uploaded' as event,
    uploaded_at as event_time,
    document_title as details
FROM documents WHERE case_id = 1
UNION ALL
SELECT 
    'Message Sent' as event,
    created_at as event_time,
    LEFT(message, 50) as details
FROM chat WHERE case_id = 1
ORDER BY event_time DESC;

-- ============================================
-- MAINTENANCE QUERIES
-- ============================================

-- Clean up old password reset tokens
DELETE FROM password_resets
WHERE expires_at < NOW()
OR (used = TRUE AND used_at < DATE_SUB(NOW(), INTERVAL 30 DAY));

-- Clean up old notifications
DELETE FROM notifications
WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY)
AND is_read = TRUE;

-- Archive old activity logs
-- (Move to archive table or delete)
DELETE FROM activity_logs
WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- ============================================
-- BACKUP QUERIES
-- ============================================

-- Export user data
SELECT * FROM users
INTO OUTFILE '/tmp/users_backup.csv'
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n';

-- ============================================
-- END OF SAMPLE QUERIES
-- ============================================
