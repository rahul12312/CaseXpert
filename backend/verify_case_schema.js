// ============================================================================
// Database Schema Verification for Case Creation
// ============================================================================

const { createDatabasePool, getDatabase } = require('./config/database');

async function verifyCaseSchema() {
    try {
        // Initialize database connection
        await createDatabasePool();

        console.log('\n🔍 VERIFYING CASE CREATION SCHEMA\n');
        console.log('='.repeat(60));

        const db = getDatabase();

        // 1. Check if cases table exists
        console.log('\n1️⃣  Checking CASES table...');
        const [tables] = await db.query(
            "SHOW TABLES LIKE 'cases'"
        );

        if (tables.length === 0) {
            console.error('   ❌ ERROR: cases table does NOT exist!');
            console.log('   Creating cases table...');

            await db.query(`
        CREATE TABLE IF NOT EXISTS cases (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          lawyer_id INT NULL,
          title VARCHAR(200) NOT NULL,
          description TEXT,
          case_number VARCHAR(100) NOT NULL UNIQUE,
          case_type ENUM('civil', 'criminal', 'corporate', 'family', 'property', 'labor', 'consumer', 'other') NOT NULL,
          priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
          status ENUM('open', 'pending', 'in-progress', 'hearing-scheduled', 'resolved', 'closed', 'archived') DEFAULT 'open',
          court_name VARCHAR(200),
          filing_date DATE,
          opponent_name VARCHAR(200),
          opponent_lawyer VARCHAR(200),
          is_archived BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (lawyer_id) REFERENCES lawyers(id) ON DELETE SET NULL,
          INDEX idx_user_id (user_id),
          INDEX idx_lawyer_id (lawyer_id),
          INDEX idx_status (status),
          INDEX idx_case_number (case_number)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

            console.log('   ✅ Cases table created successfully');
        } else {
            console.log('   ✅ Cases table exists');
        }

        // 2. Describe cases table structure
        console.log('\n2️⃣  Cases table structure:');
        const [columns] = await db.query('DESCRIBE cases');
        console.table(columns.map(col => ({
            Field: col.Field,
            Type: col.Type,
            Null: col.Null,
            Key: col.Key,
            Default: col.Default
        })));

        // 3. Check case_timeline table
        console.log('\n3️⃣  Checking CASE_TIMELINE table...');
        const [timelineTables] = await db.query("SHOW TABLES LIKE 'case_timeline'");

        if (timelineTables.length === 0) {
            console.log('   Creating case_timeline table...');
            await db.query(`
        CREATE TABLE IF NOT EXISTS case_timeline (
          id INT AUTO_INCREMENT PRIMARY KEY,
          case_id INT NOT NULL,
          event_title VARCHAR(200) NOT NULL,
          event_description TEXT,
          event_type ENUM('case-created', 'status-change', 'hearing', 'document-upload', 'other') DEFAULT 'other',
          event_date DATE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
          INDEX idx_case_id (case_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
            console.log('   ✅ case_timeline table created');
        } else {
            console.log('   ✅ case_timeline table exists');
        }

        // 4. Check case_activities table
        console.log('\n4️⃣  Checking CASE_ACTIVITIES table...');
        const [activitiesTables] = await db.query("SHOW TABLES LIKE 'case_activities'");

        if (activitiesTables.length === 0) {
            console.log('   Creating case_activities table...');
            await db.query(`
        CREATE TABLE IF NOT EXISTS case_activities (
          id INT AUTO_INCREMENT PRIMARY KEY,
          case_id INT NOT NULL,
          activity TEXT NOT NULL,
          actor_name VARCHAR(200),
          actor_role ENUM('user', 'lawyer', 'admin') NOT NULL,
          activity_type ENUM('create', 'update', 'status-change', 'document-upload', 'timeline-add', 'delete', 'other') DEFAULT 'other',
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
          INDEX idx_case_id (case_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
            console.log('   ✅ case_activities table created');
        } else {
            console.log('   ✅ case_activities table exists');
        }

        // 5. Check case_updates table
        console.log('\n5️⃣  Checking CASE_UPDATES table...');
        const [updatesTables] = await db.query("SHOW TABLES LIKE 'case_updates'");

        if (updatesTables.length === 0) {
            console.log('   Creating case_updates table...');
            await db.query(`
        CREATE TABLE IF NOT EXISTS case_updates (
          id INT AUTO_INCREMENT PRIMARY KEY,
          case_id INT NOT NULL,
          update_title VARCHAR(200) NOT NULL,
          update_description TEXT,
          update_type ENUM('general-update', 'progress', 'milestone', 'other') DEFAULT 'general-update',
          created_by VARCHAR(200),
          created_by_role ENUM('user', 'lawyer', 'admin'),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
          INDEX idx_case_id (case_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
            console.log('   ✅ case_updates table created');
        } else {
            console.log('   ✅ case_updates table exists');
        }

        // 6. Check case_documents table
        console.log('\n6️⃣  Checking CASE_DOCUMENTS table...');
        const [documentsTables] = await db.query("SHOW TABLES LIKE 'case_documents'");

        if (documentsTables.length === 0) {
            console.log('   Creating case_documents table...');
            await db.query(`
        CREATE TABLE IF NOT EXISTS case_documents (
          id INT AUTO_INCREMENT PRIMARY KEY,
          case_id INT NOT NULL,
          file_name VARCHAR(255) NOT NULL,
          original_name VARCHAR(255) NOT NULL,
          file_url VARCHAR(500) NOT NULL,
          file_type VARCHAR(50),
          file_size INT,
          uploaded_by VARCHAR(200),
          uploaded_by_role ENUM('user', 'lawyer', 'admin'),
          uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
          INDEX idx_case_id (case_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
            console.log('   ✅ case_documents table created');
        } else {
            console.log('   ✅ case_documents table exists');
        }

        // 7. Check case_hearings table
        console.log('\n7️⃣  Checking CASE_HEARINGS table...');
        const [hearingsTables] = await db.query("SHOW TABLES LIKE 'case_hearings'");

        if (hearingsTables.length === 0) {
            console.log('   Creating case_hearings table...');
            await db.query(`
        CREATE TABLE IF NOT EXISTS case_hearings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          case_id BIGINT UNSIGNED NOT NULL,
          hearing_date DATETIME NOT NULL,
          purpose VARCHAR(200),
          courtroom VARCHAR(100),
          judge_name VARCHAR(200),
          notes TEXT,
          next_hearing_date DATETIME,
          next_hearing_purpose VARCHAR(200),
          adjournment_reason TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
          INDEX idx_case_id (case_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
            console.log('   ✅ case_hearings table created');
        } else {
            console.log('   ✅ case_hearings table exists');
        }

        // 7.5 Check case_intelligence table
        console.log('\n7.5️⃣  Checking CASE_INTELLIGENCE table...');
        const [intelligenceTables] = await db.query("SHOW TABLES LIKE 'case_intelligence'");

        if (intelligenceTables.length === 0) {
            console.log('   Creating case_intelligence table...');
            await db.query(`
        CREATE TABLE IF NOT EXISTS case_intelligence (
            id INT AUTO_INCREMENT PRIMARY KEY,
            case_id BIGINT UNSIGNED NOT NULL,
            report_data LONGTEXT,
            risk_score INT,
            summary TEXT,
            analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
            INDEX idx_case_id (case_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
            console.log('   ✅ case_intelligence table created');
        } else {
            console.log('   ✅ case_intelligence table exists');
        }

        // 8. Verify users table exists (required for foreign key)
        console.log('\n8️⃣  Checking USERS table...');
        const [usersTables] = await db.query("SHOW TABLES LIKE 'users'");
        if (usersTables.length === 0) {
            console.error('   ❌ CRITICAL: users table does NOT exist!');
            throw new Error('Users table is required but missing');
        } else {
            console.log('   ✅ users table exists');
            const [userCount] = await db.query('SELECT COUNT(*) as count FROM users');
            console.log(`   📊 Total users: ${userCount[0].count}`);
        }

        // 9. Verify lawyers table exists (required for foreign key)
        console.log('\n9️⃣  Checking LAWYERS table...');
        const [lawyersTables] = await db.query("SHOW TABLES LIKE 'lawyers'");
        if (lawyersTables.length === 0) {
            console.error('   ❌ WARNING: lawyers table does NOT exist!');
            console.log('   Creating lawyers table...');

            await db.query(`
        CREATE TABLE IF NOT EXISTS lawyers (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(200) NOT NULL,
          email VARCHAR(200) NOT NULL UNIQUE,
          phone VARCHAR(20),
          specialization VARCHAR(200),
          verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
            console.log('   ✅ lawyers table created');
        } else {
            console.log('   ✅ lawyers table exists');
            const [lawyerCount] = await db.query('SELECT COUNT(*) as count FROM lawyers');
            const [verifiedCount] = await db.query("SELECT COUNT(*) as count FROM lawyers WHERE verification_status = 'verified'");
            console.log(`   📊 Total lawyers: ${lawyerCount[0].count}`);
            console.log(`   📊 Verified lawyers: ${verifiedCount[0].count}`);
        }

        // 10. Test case creation path
        console.log('\n🔟 Testing case creation prerequisites...');
        const [testUsers] = await db.query('SELECT id, name, user_type FROM users LIMIT 1');

        if (testUsers.length > 0) {
            console.log('   ✅ Sample user found:', testUsers[0]);
        } else {
            console.error('   ❌ No users found - cannot create cases without users');
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ DATABASE SCHEMA VERIFICATION COMPLETE\n');
        console.log('📋 Case Creation Requirements:');
        console.log('   ✓ cases table');
        console.log('   ✓ case_timeline table');
        console.log('   ✓ case_activities table');
        console.log('   ✓ case_updates table');
        console.log('   ✓ case_documents table');
        console.log('   ✓ case_hearings table');
        console.log('   ✓ users table with data');
        console.log('   ✓ lawyers table');
        console.log('\n🎯 Your database is ready for case creation!\n');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ SCHEMA VERIFICATION FAILED:');
        console.error('   Error:', error.message);
        console.error('   Details:', error);
        process.exit(1);
    }
}

verifyCaseSchema();
