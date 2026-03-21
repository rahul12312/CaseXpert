-- ========================================================
-- SAMPLE DATA: 30 LAWYERS FOR LAWYER MARKETPLACE
-- ========================================================
-- Usage: Run this script in MySQL Workbench or via command line.
-- It inserts users first, then links them to the lawyers table.
-- Password for all users: 'password123'
-- ========================================================

START TRANSACTION;

-- 1. Adv. Arjun Mehta (Criminal Law - Mumbai)
INSERT INTO users (name, email, phone, password, user_type, is_verified, profile_image) 
VALUES ('Adv. Arjun Mehta', 'arjun.mehta@example.com', '9810012345', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', TRUE, 'https://ui-avatars.com/api/?name=Arjun+Mehta&background=0D8ABC&color=fff');
INSERT INTO lawyers (user_id, specialization, experience, languages, rating, fee_per_hour, bio, city, state, availability_status, total_cases)
VALUES (LAST_INSERT_ID(), 'Criminal Law', 12, 'English, Hindi, Marathi', 4.8, 2500.00, 'Senior criminal defense attorney with over a decade of experience in high-profile cases. Proven track record in bail matters and trials.', 'Mumbai', 'Maharashtra', 'available', 145);

-- 2. Adv. Zara Khan (Family Law - Delhi)
INSERT INTO users (name, email, phone, password, user_type, is_verified, profile_image) 
VALUES ('Adv. Zara Khan', 'zara.khan@example.com', '9810012346', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', TRUE, 'https://ui-avatars.com/api/?name=Zara+Khan&background=FF5722&color=fff');
INSERT INTO lawyers (user_id, specialization, experience, languages, rating, fee_per_hour, bio, city, state, availability_status, total_cases)
VALUES (LAST_INSERT_ID(), 'Family Law', 8, 'English, Hindi, Urdu', 4.6, 1800.00, 'Compassionate family lawyer specializing in divorce, child custody, and domestic violence cases. dedicated to finding peaceful resolutions.', 'Delhi', 'Delhi', 'available', 89);

-- 3. Adv. Vikram Malhotra (Corporate Law - Bangalore)
INSERT INTO users (name, email, phone, password, user_type, is_verified, profile_image) 
VALUES ('Adv. Vikram Malhotra', 'vikram.malhotra@example.com', '9810012347', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', TRUE, 'https://ui-avatars.com/api/?name=Vikram+Malhotra&background=4CAF50&color=fff');
INSERT INTO lawyers (user_id, specialization, experience, languages, rating, fee_per_hour, bio, city, state, availability_status, total_cases)
VALUES (LAST_INSERT_ID(), 'Corporate Law', 15, 'English, Kannada', 4.9, 5000.00, 'Expert in mergers & acquisitions, startup funding, and contract law. Advising over 50 technology startups in Bangalore.', 'Bangalore', 'Karnataka', 'busy', 210);

-- 4. Adv. Priya Singh (Real Estate - Hyderabad)
INSERT INTO users (name, email, phone, password, user_type, is_verified, profile_image) 
VALUES ('Adv. Priya Singh', 'priya.singh@example.com', '9810012348', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', TRUE, 'https://ui-avatars.com/api/?name=Priya+Singh&background=9C27B0&color=fff');
INSERT INTO lawyers (user_id, specialization, experience, languages, rating, fee_per_hour, bio, city, state, availability_status, total_cases)
VALUES (LAST_INSERT_ID(), 'Real Estate', 7, 'English, Telugu, Hindi', 4.3, 1500.00, 'Specializing in property disputes, RERA compliance, and documentation. Helping clients secure their property rights.', 'Hyderabad', 'Telangana', 'available', 65);

-- 5. Adv. Ananya Das (Intellectual Property - Kolkata)
INSERT INTO users (name, email, phone, password, user_type, is_verified, profile_image) 
VALUES ('Adv. Ananya Das', 'ananya.das@example.com', '9810012349', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', TRUE, 'https://ui-avatars.com/api/?name=Ananya+Das&background=E91E63&color=fff');
INSERT INTO lawyers (user_id, specialization, experience, languages, rating, fee_per_hour, bio, city, state, availability_status, total_cases)
VALUES (LAST_INSERT_ID(), 'Intellectual Property', 9, 'English, Bengali', 4.7, 3000.00, 'Focused on trademark registration, patent filing, and copyright infringement. Protecting creative and industrial assets.', 'Kolkata', 'West Bengal', 'available', 78);

-- 6. Adv. Rahul Verma (Civil Law - Pune)
INSERT INTO users (name, email, phone, password, user_type, is_verified, profile_image) 
VALUES ('Adv. Rahul Verma', 'rahul.verma@example.com', '9810012350', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', TRUE, 'https://ui-avatars.com/api/?name=Rahul+Verma&background=3F51B5&color=fff');
INSERT INTO lawyers (user_id, specialization, experience, languages, rating, fee_per_hour, bio, city, state, availability_status, total_cases)
VALUES (LAST_INSERT_ID(), 'Civil Law', 11, 'English, Hindi, Marathi', 4.4, 1200.00, 'Handling civil suits, recovery of money, and injunctions. Known for strategic litigation and out-of-court settlements.', 'Pune', 'Maharashtra', 'available', 112);

-- 7. Adv. Sneha Reddy (Immigration - Chennai)
INSERT INTO users (name, email, phone, password, user_type, is_verified, profile_image) 
VALUES ('Adv. Sneha Reddy', 'sneha.reddy@example.com', '9810012351', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', TRUE, 'https://ui-avatars.com/api/?name=Sneha+Reddy&background=009688&color=fff');
INSERT INTO lawyers (user_id, specialization, experience, languages, rating, fee_per_hour, bio, city, state, availability_status, total_cases)
VALUES (LAST_INSERT_ID(), 'Immigration', 6, 'English, Tamil', 4.5, 2200.00, 'Immigration expert assisting with visa applications, green cards, and PR for Canada, Australia, and USA.', 'Chennai', 'Tamil Nadu', 'available', 54);

-- 8. Adv. Amit Patel (Tax Law - Ahmedabad)
INSERT INTO users (name, email, phone, password, user_type, is_verified, profile_image) 
VALUES ('Adv. Amit Patel', 'amit.patel@example.com', '9810012352', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', TRUE, 'https://ui-avatars.com/api/?name=Amit+Patel&background=FF9800&color=fff');
INSERT INTO lawyers (user_id, specialization, experience, languages, rating, fee_per_hour, bio, city, state, availability_status, total_cases)
VALUES (LAST_INSERT_ID(), 'Tax Law', 18, 'English, Gujarati, Hindi', 4.9, 4000.00, 'Senior tax consultant dealing with GST, Income Tax audits, and tribunal appeals. Litigation support for corporate tax.', 'Ahmedabad', 'Gujarat', 'available', 230);

-- 9. Adv. Kavita Joshi (Labor Law - Mumbai)
INSERT INTO users (name, email, phone, password, user_type, is_verified, profile_image) 
VALUES ('Adv. Kavita Joshi', 'kavita.joshi@example.com', '9810012353', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', TRUE, 'https://ui-avatars.com/api/?name=Kavita+Joshi&background=795548&color=fff');
INSERT INTO lawyers (user_id, specialization, experience, languages, rating, fee_per_hour, bio, city, state, availability_status, total_cases)
VALUES (LAST_INSERT_ID(), 'Labor Law', 13, 'English, Hindi, Marathi', 4.2, 1600.00, 'Representing employees and employers in industrial disputes, wrongful termination, and workplace harassment cases.', 'Mumbai', 'Maharashtra', 'offline', 98);

-- 10. Adv. Rohan Gupta (Cyber Law - Bangalore)
INSERT INTO users (name, email, phone, password, user_type, is_verified, profile_image) 
VALUES ('Adv. Rohan Gupta', 'rohan.gupta@example.com', '9810012354', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', TRUE, 'https://ui-avatars.com/api/?name=Rohan+Gupta&background=607D8B&color=fff');
INSERT INTO lawyers (user_id, specialization, experience, languages, rating, fee_per_hour, bio, city, state, availability_status, total_cases)
VALUES (LAST_INSERT_ID(), 'Cyber Law', 5, 'English, Hindi', 4.7, 2800.00, 'Tech-savvy lawyer specializing in data privacy, cyber crime, and IT Act compliance. Assisting victims of online fraud.', 'Bangalore', 'Karnataka', 'available', 42);

-- 11. Adv. Meera Nair (Child Custody - Kochi)
INSERT INTO users (name, email, phone, password, user_type, is_verified, profile_image) 
VALUES ('Adv. Meera Nair', 'meera.nair@example.com', '9810012355', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', TRUE, 'https://ui-avatars.com/api/?name=Meera+Nair&background=F06292&color=fff');
INSERT INTO lawyers (user_id, specialization, experience, languages, rating, fee_per_hour, bio, city, state, availability_status, total_cases)
VALUES (LAST_INSERT_ID(), 'Family Law', 14, 'English, Malayalam', 4.8, 1900.00, 'Dedicated to child welfare in custody battles. Ensuring the best interests of the child are prioritized in legal proceedings.', 'Kochi', 'Kerala', 'available', 130);

-- 12. Adv. Suresh Iyer (Constitutional Law - Delhi)
INSERT INTO users (name, email, phone, password, user_type, is_verified, profile_image) 
VALUES ('Adv. Suresh Iyer', 'suresh.iyer@example.com', '9810012356', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', TRUE, 'https://ui-avatars.com/api/?name=Suresh+Iyer&background=FFEB3B&color=000');
INSERT INTO lawyers (user_id, specialization, experience, languages, rating, fee_per_hour, bio, city, state, availability_status, total_cases)
VALUES (LAST_INSERT_ID(), 'Constitutional Law', 25, 'English, Hindi, Tamil', 5.0, 6000.00, 'Supreme Court practitioner specializing in writ petitions, PILs, and constitutional matters. Decades of legal expertise.', 'Delhi', 'Delhi', 'busy', 350);

-- 13. Adv. Fatima Sheikh (Consumer Law - Lucknow)
INSERT INTO users (name, email, phone, password, user_type, is_verified, profile_image) 
VALUES ('Adv. Fatima Sheikh', 'fatima.sheikh@example.com', '9810012357', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', TRUE, 'https://ui-avatars.com/api/?name=Fatima+Sheikh&background=8BC34A&color=fff');
INSERT INTO lawyers (user_id, specialization, experience, languages, rating, fee_per_hour, bio, city, state, availability_status, total_cases)
VALUES (LAST_INSERT_ID(), 'Consumer Law', 8, 'English, Hindi, Urdu', 4.4, 1100.00, 'Fighting for consumer rights against unfair trade practices. Representing clients in District and State Consumer Forums.', 'Lucknow', 'Uttar Pradesh', 'available', 76);

-- 14. Adv. Rajesh Khanna (Banking Law - Mumbai)
INSERT INTO users (name, email, phone, password, user_type, is_verified, profile_image) 
VALUES ('Adv. Rajesh Khanna', 'rajesh.khanna@example.com', '9810012358', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', TRUE, 'https://ui-avatars.com/api/?name=Rajesh+Khanna&background=2196F3&color=fff');
INSERT INTO lawyers (user_id, specialization, experience, languages, rating, fee_per_hour, bio, city, state, availability_status, total_cases)
VALUES (LAST_INSERT_ID(), 'Banking Law', 20, 'English, Hindi', 4.6, 3500.00, 'Expert in SARFAESI Act, DRT matters, and loan recovery disputes. Advisor to major nationalized banks.', 'Mumbai', 'Maharashtra', 'available', 280);

-- 15. Adv. Divya Sharma (Medical Negligence - Jaipur)
INSERT INTO users (name, email, phone, password, user_type, is_verified, profile_image) 
VALUES ('Adv. Divya Sharma', 'divya.sharma@example.com', '9810012359', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', TRUE, 'https://ui-avatars.com/api/?name=Divya+Sharma&background=E040FB&color=fff');
INSERT INTO lawyers (user_id, specialization, experience, languages, rating, fee_per_hour, bio, city, state, availability_status, total_cases)
VALUES (LAST_INSERT_ID(), 'Medical Negligence', 10, 'English, Hindi', 4.7, 2100.00, 'Both a qualified doctor and lawyer. Specializing in medical malpractice suits and healthcare regulations.', 'Jaipur', 'Rajasthan', 'available', 60);

-- 16. Adv. Karthik Menon (Environmental Law - Kochi)
INSERT INTO users (name, email, phone, password, user_type, is_verified, profile_image) 
VALUES ('Adv. Karthik Menon', 'karthik.menon@example.com', '9810012360', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', TRUE, 'https://ui-avatars.com/api/?name=Karthik+Menon&background=00BCD4&color=fff');
INSERT INTO lawyers (user_id, specialization, experience, languages, rating, fee_per_hour, bio, city, state, availability_status, total_cases)
VALUES (LAST_INSERT_ID(), 'Environmental Law', 12, 'English, Malayalam', 4.5, 1700.00, 'Passionate about environmental protection. Dealing with NGT cases, pollution control, and wildlife conservation laws.', 'Kochi', 'Kerala', 'available', 95);

-- 17. Adv. Pooja Hegde (Divorce Specialist - Hyderabad)
INSERT INTO users (name, email, phone, password, user_type, is_verified, profile_image) 
VALUES ('Adv. Pooja Hegde', 'pooja.hegde@example.com', '9810012361', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', TRUE, 'https://ui-avatars.com/api/?name=Pooja+Hegde&background=FF4081&color=fff');
INSERT INTO lawyers (user_id, specialization, experience, languages, rating, fee_per_hour, bio, city, state, availability_status, total_cases)
VALUES (LAST_INSERT_ID(), 'Family Law', 9, 'English, Telugu, Hindi', 4.6, 2300.00, 'Empathetic legal support for women in distress. Specializing in alimony, section 498A, and mutual consent divorce.', 'Hyderabad', 'Telangana', 'available', 105);

-- 18. Adv. Alok Nath (Criminal Defense - Surat)
INSERT INTO users (name, email, phone, password, user_type, is_verified, profile_image) 
VALUES ('Adv. Alok Nath', 'alok.nath@example.com', '9810012362', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', TRUE, 'https://ui-avatars.com/api/?name=Alok+Nath&background=607D8B&color=fff');
INSERT INTO lawyers (user_id, specialization, experience, languages, rating, fee_per_hour, bio, city, state, availability_status, total_cases)
VALUES (LAST_INSERT_ID(), 'Criminal Law', 22, 'English, Gujarati, Hindi', 4.2, 1400.00, 'Veteran criminal lawyer experienced in session court trials. Handling cases related to checque bounce, fraud, and assault.', 'Surat', 'Gujarat', 'available', 410);

-- 19. Adv. Simran Kaur (Human Rights - Chandigarh)
INSERT INTO users (name, email, phone, password, user_type, is_verified, profile_image) 
VALUES ('Adv. Simran Kaur', 'simran.kaur@example.com', '9810012363', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', TRUE, 'https://ui-avatars.com/api/?name=Simran+Kaur&background=9C27B0&color=fff');
INSERT INTO lawyers (user_id, specialization, experience, languages, rating, fee_per_hour, bio, city, state, availability_status, total_cases)
VALUES (LAST_INSERT_ID(), 'Human Rights', 11, 'English, Punjabi, Hindi', 4.9, 1000.00, 'Activist lawyer fighting for civil liberties and social justice. Working with NGOs to provide legal aid to the underprivileged.', 'Chandigarh', 'Punjab', 'available', 150);

-- 20. Adv. Varun Dhawan (Startups & VC - Gurgaon)
INSERT INTO users (name, email, phone, password, user_type, is_verified, profile_image) 
VALUES ('Adv. Varun Dhawan', 'varun.dhawan@example.com', '9810012364', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', TRUE, 'https://ui-avatars.com/api/?name=Varun+Dhawan&background=3F51B5&color=fff');
INSERT INTO lawyers (user_id, specialization, experience, languages, rating, fee_per_hour, bio, city, state, availability_status, total_cases)
VALUES (LAST_INSERT_ID(), 'Corporate Law', 6, 'English, Hindi', 4.5, 3200.00, 'New-age lawyer for the startup ecosystem. Handling term sheets, shareholder agreements, and ESOP pools.', 'Gurgaon', 'Haryana', 'busy', 55);

-- 21. Adv. Nishi Gupta (Legal Consultant - Noida)
INSERT INTO users (name, email, phone, password, user_type, is_verified, profile_image) 
VALUES ('Adv. Nishi Gupta', 'nishi.gupta@example.com', '9810012365', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', TRUE, 'https://ui-avatars.com/api/?name=Nishi+Gupta&background=FFC107&color=000');
INSERT INTO lawyers (user_id, specialization, experience, languages, rating, fee_per_hour, bio, city, state, availability_status, total_cases)
VALUES (LAST_INSERT_ID(), 'Civil Law', 9, 'English, Hindi', 4.3, 1300.00, 'Providing legal consultation for SMBs. Contract drafting, vetting, and statutory compliance management.', 'Noida', 'Uttar Pradesh', 'available', 82);

-- 22. Adv. Mohammad Ali (Property Law - Bhopal)
INSERT INTO users (name, email, phone, password, user_type, is_verified, profile_image) 
VALUES ('Adv. Mohammad Ali', 'mohammad.ali@example.com', '9810012366', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', TRUE, 'https://ui-avatars.com/api/?name=Mohammad+Ali&background=009688&color=fff');
INSERT INTO lawyers (user_id, specialization, experience, languages, rating, fee_per_hour, bio, city, state, availability_status, total_cases)
VALUES (LAST_INSERT_ID(), 'Real Estate', 16, 'English, Hindi, Urdu', 4.4, 900.00, 'Expert in land revenue laws and tenant-landlord disputes. Assisting in property registration and mutation.', 'Bhopal', 'Madhya Pradesh', 'available', 190);

-- 23. Adv. Grace Thomas (Immigration - Trivandrum)
INSERT INTO users (name, email, phone, password, user_type, is_verified, profile_image) 
VALUES ('Adv. Grace Thomas', 'grace.thomas@example.com', '9810012367', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', TRUE, 'https://ui-avatars.com/api/?name=Grace+Thomas&background=673AB7&color=fff');
INSERT INTO lawyers (user_id, specialization, experience, languages, rating, fee_per_hour, bio, city, state, availability_status, total_cases)
VALUES (LAST_INSERT_ID(), 'Immigration', 10, 'English, Malayalam', 4.8, 2000.00, 'Specialized in student visas and work permits for UK and Europe. 98% success rate in visa applications.', 'Trivandrum', 'Kerala', 'available', 120);

-- 24. Adv. Vivek Oberoi (Media & Entertainment - Mumbai)
INSERT INTO users (name, email, phone, password, user_type, is_verified, profile_image) 
VALUES ('Adv. Vivek Oberoi', 'vivek.oberoi@example.com', '9810012368', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', TRUE, 'https://ui-avatars.com/api/?name=Vivek+Oberoi&background=3F51B5&color=fff');
INSERT INTO lawyers (user_id, specialization, experience, languages, rating, fee_per_hour, bio, city, state, availability_status, total_cases)
VALUES (LAST_INSERT_ID(), 'Intellectual Property', 13, 'English, Hindi', 4.6, 4500.00, 'Counsel for production houses and artists. Handling copyright, licensing, and talent management contracts.', 'Mumbai', 'Maharashtra', 'available', 140);

-- 25. Adv. Sunita Rao (Labour Law - Visakhapatnam)
INSERT INTO users (name, email, phone, password, user_type, is_verified, profile_image) 
VALUES ('Adv. Sunita Rao', 'sunita.rao@example.com', '9810012369', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', TRUE, 'https://ui-avatars.com/api/?name=Sunita+Rao&background=FF5722&color=fff');
INSERT INTO lawyers (user_id, specialization, experience, languages, rating, fee_per_hour, bio, city, state, availability_status, total_cases)
VALUES (LAST_INSERT_ID(), 'Labor Law', 19, 'English, Telugu', 4.3, 1100.00, 'Representing trade unions and workers in industrial tribunals. Focused on fair wages and safe working conditions.', 'Visakhapatnam', 'Andhra Pradesh', 'available', 260);

-- 26. Adv. Balbir Singh (Agricultural Law - Ludhiana)
INSERT INTO users (name, email, phone, password, user_type, is_verified, profile_image) 
VALUES ('Adv. Balbir Singh', 'balbir.singh@example.com', '9810012370', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', TRUE, 'https://ui-avatars.com/api/?name=Balbir+Singh&background=4CAF50&color=fff');
INSERT INTO lawyers (user_id, specialization, experience, languages, rating, fee_per_hour, bio, city, state, availability_status, total_cases)
VALUES (LAST_INSERT_ID(), 'Civil Law', 28, 'English, Punjabi', 4.1, 800.00, 'Specialist in land acquisition cases and farming disputes. Deep understanding of local land laws in Punjab.', 'Ludhiana', 'Punjab', 'available', 500);

-- 27. Adv. Deepa Malik (Sports Law - Delhi)
INSERT INTO users (name, email, phone, password, user_type, is_verified, profile_image) 
VALUES ('Adv. Deepa Malik', 'deepa.malik@example.com', '9810012371', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', TRUE, 'https://ui-avatars.com/api/?name=Deepa+Malik&background=E91E63&color=fff');
INSERT INTO lawyers (user_id, specialization, experience, languages, rating, fee_per_hour, bio, city, state, availability_status, total_cases)
VALUES (LAST_INSERT_ID(), 'Consumer Law', 5, 'English, Hindi', 4.5, 1800.00, 'Emerging lawyer in the field of sports and arbitration. Representing athletes in contract disputes.', 'Delhi', 'Delhi', 'available', 30);

-- 28. Adv. Naveen Patnaik (IT Law - Bhubaneswar)
INSERT INTO users (name, email, phone, password, user_type, is_verified, profile_image) 
VALUES ('Adv. Naveen Patnaik', 'naveen.patnaik@example.com', '9810012372', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', TRUE, 'https://ui-avatars.com/api/?name=Naveen+Patnaik&background=9C27B0&color=fff');
INSERT INTO lawyers (user_id, specialization, experience, languages, rating, fee_per_hour, bio, city, state, availability_status, total_cases)
VALUES (LAST_INSERT_ID(), 'Cyber Law', 8, 'English, Odia, Hindi', 4.4, 1500.00, 'Handling diverse IT related cases including software licensing and e-commerce regulations.', 'Bhubaneswar', 'Odisha', 'available', 68);

-- 29. Adv. Hina Rabbani (Arbitration - Srinagar)
INSERT INTO users (name, email, phone, password, user_type, is_verified, profile_image) 
VALUES ('Adv. Hina Rabbani', 'hina.rabbani@example.com', '9810012373', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', TRUE, 'https://ui-avatars.com/api/?name=Hina+Rabbani&background=00BCD4&color=fff');
INSERT INTO lawyers (user_id, specialization, experience, languages, rating, fee_per_hour, bio, city, state, availability_status, total_cases)
VALUES (LAST_INSERT_ID(), 'Civil Law', 12, 'English, Urdu, Kashmiri', 4.6, 1600.00, 'Expert in alternative dispute resolution and arbitration. Helping clients resolve commercial disputes efficiently.', 'Srinagar', 'J&K', 'available', 110);

-- 30. Adv. James D''Souza (Maritime Law - Goa)
INSERT INTO users (name, email, phone, password, user_type, is_verified, profile_image) 
VALUES ('Adv. James D''Souza', 'james.dsouza@example.com', '9810012374', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', TRUE, 'https://ui-avatars.com/api/?name=James+D%27Souza&background=FF9800&color=fff');
INSERT INTO lawyers (user_id, specialization, experience, languages, rating, fee_per_hour, bio, city, state, availability_status, total_cases)
VALUES (LAST_INSERT_ID(), 'Corporate Law', 15, 'English, Konkani', 4.7, 2500.00, 'Specializing in shipping and maritime law. Dealing with cargo claims, insurance, and international trade.', 'Panaji', 'Goa', 'available', 180);

COMMIT;

SELECT 'Successfully created 30 sample lawyers' AS status;
