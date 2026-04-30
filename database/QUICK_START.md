# CaseXpert Database - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Install MySQL
Ensure MySQL 5.7+ is installed and running.

### Step 2: Run Setup Script

**Windows:**
```bash
cd database
setup.bat
```

**Linux/Mac:**
```bash
cd database
chmod +x setup.sh
./setup.sh
```

**Manual Setup:**
```bash
mysql -u root -p < casexpert_schema.sql
```

### Step 3: Verify Installation
```sql
mysql -u root -p
USE casexpert_db;
SHOW TABLES;
```

You should see 12 tables created.

## 📊 Database Created

✅ **Database**: `casexpert_db`  
✅ **Tables**: 12 tables  
✅ **Triggers**: 3 automated triggers  
✅ **Views**: 2 pre-built views  
✅ **Procedures**: 1 stored procedure  

## 🔑 Default Credentials

**Admin User:**
- Email: `admin@casexpert.com`
- Password: `admin123`

⚠️ **IMPORTANT**: Change this password immediately!

## 📋 Tables Overview

### Core Tables (7)
1. **users** - All user accounts
2. **lawyers** - Lawyer profiles
3. **cases** - Legal cases
4. **documents** - Case documents
5. **chat** - Messages
6. **bookings** - Consultations
7. **payments** - Transactions

### Supporting Tables (5)
8. **reviews** - Lawyer reviews
9. **notifications** - User notifications
10. **activity_logs** - Audit trail
11. **password_resets** - Password recovery
12. **email_verifications** - Email verification

## 🔗 Key Relationships

```
users → lawyers (1:1)
users → cases (1:N as client)
lawyers → cases (1:N as assigned lawyer)
cases → documents (1:N)
cases → chat (1:N)
users → bookings (1:N as client)
lawyers → bookings (1:N)
users → payments (1:N)
```

## 📝 Quick Test Queries

### Create a test user
```sql
INSERT INTO users (name, email, phone, password, user_type) 
VALUES ('Test User', 'test@example.com', '+919999999999', 
        '$2y$10$hashedpassword', 'client');
```

### View all users
```sql
SELECT id, name, email, user_type, created_at FROM users;
```

### Search lawyers
```sql
SELECT u.name, l.specialization, l.rating, l.city
FROM lawyers l
JOIN users u ON l.user_id = u.id
WHERE l.city = 'Mumbai'
ORDER BY l.rating DESC;
```

## 🔒 Security Features

✅ Password hashing required  
✅ Email verification system  
✅ Foreign key constraints  
✅ Indexed columns for performance  
✅ Audit trail (activity_logs)  
✅ Soft delete capability  
✅ Access control levels  

## 📚 Documentation Files

- **casexpert_schema.sql** - Complete database schema
- **README.md** - Detailed documentation
- **ER_DIAGRAM.md** - Entity relationship diagram
- **sample_queries.sql** - Common SQL queries
- **QUICK_START.md** - This file

## 🛠️ Configuration for Node.js

### Install MySQL driver
```bash
npm install mysql2
```

### Connection example
```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'casexpert_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
```

## 🔄 Common Operations

### Backup Database
```bash
mysqldump -u root -p casexpert_db > backup.sql
```

### Restore Database
```bash
mysql -u root -p casexpert_db < backup.sql
```

### Check Database Size
```sql
SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'casexpert_db'
GROUP BY table_schema;
```

## 📊 Performance Tips

1. **Use Indexes**: All critical columns are already indexed
2. **Limit Results**: Always use `LIMIT` for large datasets
3. **Use Views**: Pre-built views for complex queries
4. **Connection Pooling**: Use connection pools in your app
5. **Regular Maintenance**: Run `OPTIMIZE TABLE` periodically

## 🆘 Troubleshooting

### Can't connect to MySQL
```bash
# Check if MySQL is running
sudo systemctl status mysql  # Linux
net start MySQL80            # Windows
```

### Foreign key errors
```sql
-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS=0;
-- Your query here
SET FOREIGN_KEY_CHECKS=1;
```

### Reset admin password
```sql
UPDATE users 
SET password = '$2y$10$newhashedpassword'
WHERE email = 'admin@casexpert.com';
```

## 📞 Next Steps

1. ✅ Database created
2. ⏭️ Connect your Node.js backend
3. ⏭️ Test API endpoints
4. ⏭️ Create sample data
5. ⏭️ Deploy to production

## 🎯 Production Checklist

Before deploying to production:

- [ ] Change default admin password
- [ ] Set strong MySQL root password
- [ ] Enable SSL for MySQL connections
- [ ] Set up regular backups
- [ ] Configure firewall rules
- [ ] Enable query logging
- [ ] Set up monitoring
- [ ] Test all triggers and procedures
- [ ] Review and optimize indexes
- [ ] Set up replication (if needed)

## 📈 Monitoring

### Check table sizes
```sql
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'casexpert_db'
ORDER BY (data_length + index_length) DESC;
```

### Check slow queries
```sql
SHOW VARIABLES LIKE 'slow_query_log';
SET GLOBAL slow_query_log = 'ON';
```

---

**Database Version**: 1.0  
**Last Updated**: November 28, 2024  
**MySQL Version**: 5.7+  
**Character Set**: UTF8MB4

**Ready to go! 🚀**
