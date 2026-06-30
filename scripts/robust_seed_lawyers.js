const { getDatabase, createDatabasePool } = require('../config/database');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const lawyersData = [
    { name: 'Adv. Arjun Mehta', email: 'arjun.mehta@gmail.com', phone: '9810012345', specialization: 'Criminal Law', experience: 12, languages: ['English', 'Hindi', 'Marathi'], rating: 4.8, fee: 2500, city: 'Mumbai', state: 'Maharashtra', bio: 'Senior criminal defense attorney with over a decade of experience.' },
    { name: 'Adv. Zara Khan', email: 'zara.khan@gmail.com', phone: '9810012346', specialization: 'Family Law', experience: 8, languages: ['English', 'Hindi', 'Urdu'], rating: 4.6, fee: 1800, city: 'Delhi', state: 'Delhi', bio: 'Compassionate family lawyer specializing in divorce and custody.' },
    { name: 'Adv. Vikram Malhotra', email: 'vikram.malhotra@gmail.com', phone: '9810012347', specialization: 'Corporate Law', experience: 15, languages: ['English', 'Kannada'], rating: 4.9, fee: 5000, city: 'Bangalore', state: 'Karnataka', bio: 'Expert in mergers & acquisitions and startup funding.' },
    { name: 'Adv. Priya Singh', email: 'priya.singh@gmail.com', phone: '9810012348', specialization: 'Real Estate', experience: 7, languages: ['English', 'Telugu', 'Hindi'], rating: 4.3, fee: 1500, city: 'Hyderabad', state: 'Telangana', bio: 'Specializing in property disputes and RERA compliance.' },
    { name: 'Adv. Ananya Das', email: 'ananya.das@gmail.com', phone: '9810012349', specialization: 'Intellectual Property', experience: 9, languages: ['English', 'Bengali'], rating: 4.7, fee: 3000, city: 'Kolkata', state: 'West Bengal', bio: 'Focused on trademark registration and patent filing.' },
    { name: 'Adv. Rahul Verma', email: 'rahul.verma@gmail.com', phone: '9810012350', specialization: 'Civil Law', experience: 11, languages: ['English', 'Hindi', 'Marathi'], rating: 4.4, fee: 1200, city: 'Pune', state: 'Maharashtra', bio: 'Handling civil suits and recovery of money.' },
    { name: 'Adv. Sneha Reddy', email: 'sneha.reddy@gmail.com', phone: '9810012351', specialization: 'Immigration', experience: 6, languages: ['English', 'Tamil'], rating: 4.5, fee: 2200, city: 'Chennai', state: 'Tamil Nadu', bio: 'Immigration expert assisting with visa applications.' },
    { name: 'Adv. Amit Patel', email: 'amit.patel@gmail.com', phone: '9810012352', specialization: 'Tax Law', experience: 18, languages: ['English', 'Gujarati', 'Hindi'], rating: 4.9, fee: 4000, city: 'Ahmedabad', state: 'Gujarat', bio: 'Senior tax consultant dealing with GST and Income Tax.' },
    { name: 'Adv. Kavita Joshi', email: 'kavita.joshi@gmail.com', phone: '9810012353', specialization: 'Labor Law', experience: 13, languages: ['English', 'Hindi', 'Marathi'], rating: 4.2, fee: 1600, city: 'Mumbai', state: 'Maharashtra', bio: 'Representing employees in industrial disputes.' },
    { name: 'Adv. Rohan Gupta', email: 'rohan.gupta@gmail.com', phone: '9810012354', specialization: 'Cyber Law', experience: 5, languages: ['English', 'Hindi'], rating: 4.7, fee: 2800, city: 'Bangalore', state: 'Karnataka', bio: 'Tech-savvy lawyer specializing in data privacy.' },
    { name: 'Adv. Meera Nair', email: 'meera.nair@gmail.com', phone: '9810012355', specialization: 'Family Law', experience: 14, languages: ['English', 'Malayalam'], rating: 4.8, fee: 1900, city: 'Kochi', state: 'Kerala', bio: 'Dedicated to child welfare in custody battles.' },
    { name: 'Adv. Suresh Iyer', email: 'suresh.iyer@gmail.com', phone: '9810012356', specialization: 'Constitutional Law', experience: 25, languages: ['English', 'Hindi', 'Tamil'], rating: 5.0, fee: 6000, city: 'Delhi', state: 'Delhi', bio: 'Supreme Court practitioner.' },
    { name: 'Adv. Fatima Sheikh', email: 'fatima.sheikh@gmail.com', phone: '9810012357', specialization: 'Consumer Law', experience: 8, languages: ['English', 'Hindi', 'Urdu'], rating: 4.4, fee: 1100, city: 'Lucknow', state: 'Uttar Pradesh', bio: 'Fighting for consumer rights.' },
    { name: 'Adv. Rajesh Khanna', email: 'rajesh.khanna@gmail.com', phone: '9810012358', specialization: 'Banking Law', experience: 20, languages: ['English', 'Hindi'], rating: 4.6, fee: 3500, city: 'Mumbai', state: 'Maharashtra', bio: 'Expert in SARFAESI Act and loan recovery.' },
    { name: 'Adv. Divya Sharma', email: 'divya.sharma@gmail.com', phone: '9810012359', specialization: 'Medical Negligence', experience: 10, languages: ['English', 'Hindi'], rating: 4.7, fee: 2100, city: 'Jaipur', state: 'Rajasthan', bio: 'Both a qualified doctor and lawyer.' },
    { name: 'Adv. Karthik Menon', email: 'karthik.menon@gmail.com', phone: '9810012360', specialization: 'Environmental Law', experience: 12, languages: ['English', 'Malayalam'], rating: 4.5, fee: 1700, city: 'Kochi', state: 'Kerala', bio: 'Passionate about environmental protection.' },
    { name: 'Adv. Pooja Hegde', email: 'pooja.hegde@gmail.com', phone: '9810012361', specialization: 'Family Law', experience: 9, languages: ['English', 'Telugu', 'Hindi'], rating: 4.6, fee: 2300, city: 'Hyderabad', state: 'Telangana', bio: 'Empathetic legal support for women in distress.' },
    { name: 'Adv. Alok Nath', email: 'alok.nath@gmail.com', phone: '9810012362', specialization: 'Criminal Law', experience: 22, languages: ['English', 'Gujarati', 'Hindi'], rating: 4.2, fee: 1400, city: 'Surat', state: 'Gujarat', bio: 'Veteran criminal lawyer experienced in session court trials.' },
    { name: 'Adv. Simran Kaur', email: 'simran.kaur@gmail.com', phone: '9810012363', specialization: 'Human Rights', experience: 11, languages: ['English', 'Punjabi', 'Hindi'], rating: 4.9, fee: 1000, city: 'Chandigarh', state: 'Punjab', bio: 'Activist lawyer fighting for social justice.' },
    { name: 'Adv. Varun Dhawan', email: 'varun.dhawan@gmail.com', phone: '9810012364', specialization: 'Corporate Law', experience: 6, languages: ['English', 'Hindi'], rating: 4.5, fee: 3200, city: 'Gurgaon', state: 'Haryana', bio: 'New-age lawyer for the startup ecosystem.' },
    { name: 'Adv. Nishi Gupta', email: 'nishi.gupta@gmail.com', phone: '9810012365', specialization: 'Civil Law', experience: 9, languages: ['English', 'Hindi'], rating: 4.3, fee: 1300, city: 'Noida', state: 'Uttar Pradesh', bio: 'Providing legal consultation for SMBs.' },
    { name: 'Adv. Mohammad Ali', email: 'mohammad.ali@gmail.com', phone: '9810012366', specialization: 'Real Estate', experience: 16, languages: ['English', 'Hindi', 'Urdu'], rating: 4.4, fee: 900, city: 'Bhopal', state: 'Madhya Pradesh', bio: 'Expert in land revenue laws.' },
    { name: 'Adv. Grace Thomas', email: 'grace.thomas@gmail.com', phone: '9810012367', specialization: 'Immigration', experience: 10, languages: ['English', 'Malayalam'], rating: 4.8, fee: 2000, city: 'Trivandrum', state: 'Kerala', bio: 'Specialized in student visas and work permits.' },
    { name: 'Adv. Vivek Oberoi', email: 'vivek.oberoi@gmail.com', phone: '9810012368', specialization: 'Intellectual Property', experience: 13, languages: ['English', 'Hindi'], rating: 4.6, fee: 4500, city: 'Mumbai', state: 'Maharashtra', bio: 'Counsel for production houses and artists.' },
    { name: 'Adv. Sunita Rao', email: 'sunita.rao@gmail.com', phone: '9810012369', specialization: 'Labor Law', experience: 19, languages: ['English', 'Telugu'], rating: 4.3, fee: 1100, city: 'Visakhapatnam', state: 'Andhra Pradesh', bio: 'Representing trade unions and workers.' },
    { name: 'Adv. Balbir Singh', email: 'balbir.singh@gmail.com', phone: '9810012370', specialization: 'Civil Law', experience: 28, languages: ['English', 'Punjabi'], rating: 4.1, fee: 800, city: 'Ludhiana', state: 'Punjab', bio: 'Specialist in land acquisition cases.' },
    { name: 'Adv. Deepa Malik', email: 'deepa.malik@gmail.com', phone: '9810012371', specialization: 'Consumer Law', experience: 5, languages: ['English', 'Hindi'], rating: 4.5, fee: 1800, city: 'Delhi', state: 'Delhi', bio: 'Emerging lawyer in sports and arbitration.' },
    { name: 'Adv. Naveen Patnaik', email: 'naveen.patnaik@gmail.com', phone: '9810012372', specialization: 'Cyber Law', experience: 8, languages: ['English', 'Odia', 'Hindi'], rating: 4.4, fee: 1500, city: 'Bhubaneswar', state: 'Odisha', bio: 'Handling diverse IT related cases.' },
    { name: 'Adv. Hina Rabbani', email: 'hina.rabbani@gmail.com', phone: '9810012373', specialization: 'Civil Law', experience: 12, languages: ['English', 'Urdu', 'Kashmiri'], rating: 4.6, fee: 1600, city: 'Srinagar', state: 'J&K', bio: 'Expert in alternative dispute resolution.' },
    { name: 'Adv. Ishani Malhotra', email: 'ishani.malhotra@gmail.com', phone: '9810012375', specialization: 'Family Law', experience: 10, languages: ['English', 'Hindi', 'Marathi'], rating: 4.7, fee: 2200, city: 'Mumbai', state: 'Maharashtra', bio: 'Expert in matrimonial disputes and domestic violence cases in Mumbai.' },
    { name: 'Adv. James DSouza', email: 'james.dsouza@gmail.com', phone: '9810012374', specialization: 'Corporate Law', experience: 15, languages: ['English', 'Konkani'], rating: 4.7, fee: 2500, city: 'Panaji', state: 'Goa', bio: 'Specializing in shipping and maritime law.' }
];



async function seed() {
    await createDatabasePool();
    const db = getDatabase();
    console.log('🔵 Starting robust seed process...');

    for (const lawyer of lawyersData) {
        try {
            // 1. Insert into users table
            const userSql = `INSERT INTO users (name, email, phone, password, user_type, is_verified, profile_image) 
                             VALUES (?, ?, ?, ?, 'lawyer', 1, ?)`;
            const userPass = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // 'password123'
            const profileImg = `https://ui-avatars.com/api/?name=${encodeURIComponent(lawyer.name)}&background=random&color=fff`;
            
            const [userResult] = await db.execute(userSql, [lawyer.name, lawyer.email, lawyer.phone, userPass, profileImg]);
            const userId = userResult.insertId;

            console.log(`👤 User Created/Found ID: ${userId} for ${lawyer.name}`);

            // Generate realistic random stats
            const totalCases = Math.floor(Math.random() * 500) + 50;
            const totalReviews = Math.floor(Math.random() * (totalCases * 0.4)) + 10;
            const successRate = (Math.random() * 20 + 75).toFixed(2); // 75% to 95%
            const responseTimes = ['Within 1 hour', 'Within 4 hours', 'Within 24 hours', 'Instant'];
            const responseTime = responseTimes[Math.floor(Math.random() * responseTimes.length)];
            const isAvailableToday = Math.random() > 0.3 ? 1 : 0;
            const is24x7 = Math.random() > 0.8 ? 1 : 0;

            // 3. Insert into lawyers table with all new columns
            const lawyerSql = `INSERT INTO lawyers (
                                user_id, specialization, experience, languages, rating, 
                                consultation_fee, bio, city, state, license_verified,
                                total_cases, total_reviews, success_rate, response_time,
                                is_available_today, is_24_7_support
                               ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?)
                               ON DUPLICATE KEY UPDATE 
                                specialization=VALUES(specialization), 
                                experience=VALUES(experience), 
                                languages=VALUES(languages), 
                                rating=VALUES(rating), 
                                consultation_fee=VALUES(consultation_fee), 
                                bio=VALUES(bio), 
                                city=VALUES(city), 
                                state=VALUES(state), 
                                total_cases=VALUES(total_cases),
                                total_reviews=VALUES(total_reviews),
                                success_rate=VALUES(success_rate),
                                response_time=VALUES(response_time),
                                is_available_today=VALUES(is_available_today),
                                is_24_7_support=VALUES(is_24_7_support)`;

            await db.execute(lawyerSql, [
                userId,
                lawyer.specialization,
                lawyer.experience,
                JSON.stringify(lawyer.languages),
                lawyer.rating,
                lawyer.fee,
                lawyer.bio,
                lawyer.city,
                lawyer.state,
                totalCases,
                totalReviews,
                successRate,
                responseTime,
                isAvailableToday,
                is24x7
            ]);

            console.log(`✅ Seeded/Updated: ${lawyer.name}`);
        } catch (err) {
            console.error(`❌ Failed to seed ${lawyer.name}:`, err.message);
        }
    }

    console.log('✨ Seeding complete.');
    process.exit();
}

seed();
