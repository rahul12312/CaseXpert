# CaseXpert - MySQL Workbench Setup Guide

## 🎯 Complete Setup in 3 Steps

### Step 1: Open MySQL Workbench
1. Launch MySQL Workbench
2. Connect to your MySQL server
3. Click on your connection

### Step 2: Execute SQL Script
1. Open new SQL tab: **File → New Query Tab** (Ctrl+T)
2. Open the file: `casexpert_workbench.sql`
3. Or copy-paste the entire SQL content
4. Click **Execute** button (⚡ icon) or press **Ctrl+Shift+Enter**
5. Wait for execution to complete (should take 5-10 seconds)

### Step 3: Verify Installation
1. Refresh the **Schemas** panel (right-click → Refresh All)
2. Expand `casexpert_db` schema
3. You should see 9 tables created

## ✅ What Gets Created

### Database
- **Name**: `casexpert_db`
- **Charset**: UTF8MB4
- **Collation**: utf8mb4_unicode_ci
- **Engine**: InnoDB

### Tables (9)
1. ✅ **users** - User accounts
2. ✅ **lawyers** - Lawyer profiles
3. ✅ **cases** - Legal cases
4. ✅ **documents** - Case files
5. ✅ **chat** - Messages
6. ✅ **bookings** - Appointments
7. ✅ **payments** - Transactions
8. ✅ **reviews** - Lawyer ratings
9. ✅ **notifications** - User alerts

### Relationships (Foreign Keys)
- ✅ 15 foreign key constraints
- ✅ CASCADE on delete where appropriate
- ✅ SET NULL for optional relationships

### Indexes
- ✅ Primary keys on all tables
- ✅ Unique indexes (email, phone, transaction_id, etc.)
- ✅ Regular indexes on frequently queried columns
- ✅ Composite indexes for performance

### Triggers (3)
- ✅ Auto-generate case numbers
- ✅ Auto-generate booking numbers
- ✅ Auto-update lawyer ratings

### Views (2)
- ✅ `active_cases_view` - Active cases with details
- ✅ `lawyer_stats_view` - Lawyer statistics

### Sample Data
- ✅ 5 sample users (1 admin, 2 clients, 2 lawyers)
- ✅ 2 sample lawyers
- ✅ 3 sample cases
- ✅ 2 sample bookings
- ✅ 2 sample payments
- ✅ 2 sample reviews
- ✅ 4 sample chat messages

## 📊 Database Statistics

After running the script, you'll have:
- **Tables**: 9
- **Foreign Keys**: 15
- **Indexes**: 40+
- **Triggers**: 3
- **Views**: 2
- **Sample Records**: 20+

## 🔑 Default Login Credentials

### Admin Account
- **Email**: `admin@casexpert.com`
- **Password**: `admin123`
- **Type**: admin

### Test Client Accounts
- **Email**: `john.doe@example.com`
- **Password**: `admin123`
- **Type**: client

- **Email**: `jane.smith@example.com`
- **Password**: `admin123`
- **Type**: client

### Test Lawyer Accounts
- **Email**: `rajesh.kumar@example.com`
- **Password**: `admin123`
- **Type**: lawyer
- **Specialization**: Criminal Law

- **Email**: `priya.sharma@example.com`
- **Password**: `admin123`
- **Type**: lawyer
- **Specialization**: Family Law

⚠️ **IMPORTANT**: All passwords are hashed with bcrypt. Change them in production!

## 🧪 Test Queries

After setup, try these queries:

### 1. View all users
```sql
SELECT id, name, email, user_type FROM users;
```

### 2. View all lawyers with details
```sql
SELECT 
    u.name,
    l.specialization,
    l.experience,
    l.rating,
    l.fee_per_hour,
    l.city
FROM lawyers l
JOIN users u ON l.user_id = u.id;
```

### 3. View active cases
```sql
SELECT * FROM active_cases_view;
```

### 4. View lawyer statistics
```sql
SELECT * FROM lawyer_stats_view;
```

### 5. View all bookings
```sql
SELECT 
    b.booking_number,
    u.name AS client,
    lu.name AS lawyer,
    b.booking_time,
    b.status
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN lawyers l ON b.lawyer_id = l.id
JOIN users lu ON l.user_id = lu.id;
```

## 🎨 Create ERD Diagram

### Quick Method:
1. Go to: **Database → Reverse Engineer**
2. Select your connection → Next
3. Select `casexpert_db` → Next
4. Select all tables → Next
5. Execute → Next → Close
6. ERD opens automatically!

### Detailed Instructions:
See `WORKBENCH_ERD_GUIDE.md` for complete ERD creation guide.

## 🔧 Configuration

### Connection Settings
```
Host: localhost
Port: 3306
User: root
Schema: casexpert_db
```

### Recommended Workbench Settings
1. **Edit → Preferences → SQL Editor**
   - Safe Updates: ✅ Enabled
   - SQL Execution: Timeout 30s

2. **Edit → Preferences → Modeling**
   - Default Target MySQL Version: 8.0
   - Default Storage Engine: InnoDB
   - Default Charset: utf8mb4

## 📋 Table Structure Summary

### users
- **Columns**: 11
- **Primary Key**: id
- **Unique Keys**: email, phone
- **Indexes**: 5

### lawyers
- **Columns**: 13
- **Primary Key**: id
- **Foreign Keys**: user_id → users.id
- **Indexes**: 6

### cases
- **Columns**: 12
- **Primary Key**: id
- **Foreign Keys**: user_id → users.id, lawyer_id → lawyers.id
- **Indexes**: 6

### documents
- **Columns**: 9
- **Primary Key**: id
- **Foreign Keys**: case_id → cases.id, uploaded_by → users.id
- **Indexes**: 4

### chat
- **Columns**: 10
- **Primary Key**: id
- **Foreign Keys**: case_id → cases.id, sender_id → users.id, receiver_id → users.id
- **Indexes**: 5

### bookings
- **Columns**: 13
- **Primary Key**: id
- **Foreign Keys**: user_id → users.id, lawyer_id → lawyers.id, case_id → cases.id
- **Indexes**: 6

### payments
- **Columns**: 12
- **Primary Key**: id
- **Foreign Keys**: user_id → users.id, booking_id → bookings.id, case_id → cases.id
- **Indexes**: 7

### reviews
- **Columns**: 7
- **Primary Key**: id
- **Foreign Keys**: lawyer_id → lawyers.id, user_id → users.id, case_id → cases.id
- **Indexes**: 3

### notifications
- **Columns**: 8
- **Primary Key**: id
- **Foreign Keys**: user_id → users.id
- **Indexes**: 3

## 🛠️ Maintenance

### Backup Database
```sql
-- In Workbench: Server → Data Export
-- Or command line:
mysqldump -u root -p casexpert_db > backup.sql
```

### Restore Database
```sql
-- In Workbench: Server → Data Import
-- Or command line:
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

### Optimize Tables
```sql
OPTIMIZE TABLE users, lawyers, cases, documents, chat, bookings, payments, reviews, notifications;
```

## 🐛 Troubleshooting

### Issue: Script execution fails
**Solution**: 
- Check MySQL version (requires 5.7+)
- Ensure you have CREATE DATABASE privileges
- Check if database already exists (script will drop it)

### Issue: Foreign key errors
**Solution**:
- Ensure InnoDB engine is enabled
- Check MySQL configuration
- Verify foreign_key_checks is ON

### Issue: Trigger creation fails
**Solution**:
- Check DELIMITER support
- Ensure you have TRIGGER privileges
- Run triggers separately if needed

### Issue: Can't see tables in Schemas panel
**Solution**:
- Right-click Schemas → Refresh All
- Reconnect to database
- Check if database was created: `SHOW DATABASES;`

## 📊 Performance Tips

1. **Use Indexes**: Already optimized with indexes on frequently queried columns
2. **Connection Pooling**: Configure in your application
3. **Query Optimization**: Use EXPLAIN to analyze queries
4. **Regular Maintenance**: Run OPTIMIZE TABLE monthly
5. **Monitor Slow Queries**: Enable slow query log

## 🔒 Security Checklist

Before production:
- [ ] Change all default passwords
- [ ] Set strong MySQL root password
- [ ] Enable SSL connections
- [ ] Configure firewall rules
- [ ] Limit user privileges
- [ ] Enable binary logging
- [ ] Set up regular backups
- [ ] Review and test all triggers
- [ ] Validate all foreign key constraints

## 📈 Next Steps

1. ✅ Database created
2. ⏭️ Create ERD diagram
3. ⏭️ Connect Node.js backend
4. ⏭️ Test API endpoints
5. ⏭️ Add more sample data
6. ⏭️ Deploy to production

## 📞 Support

### Workbench Help
- **Help → MySQL Workbench Help**
- Online docs: https://dev.mysql.com/doc/workbench/en/

### SQL Reference
- MySQL 8.0 Reference: https://dev.mysql.com/doc/refman/8.0/en/

## 📝 Files Included

1. **casexpert_workbench.sql** - Main SQL script (paste this in Workbench)
2. **WORKBENCH_SETUP.md** - This setup guide
3. **WORKBENCH_ERD_GUIDE.md** - ERD creation guide
4. **README.md** - Complete database documentation
5. **sample_queries.sql** - Common SQL queries

---

## 🎉 You're All Set!

Your CaseXpert database is now ready to use in MySQL Workbench!

**Quick Start:**
1. Open `casexpert_workbench.sql` in Workbench
2. Execute the script (Ctrl+Shift+Enter)
3. Refresh Schemas panel
4. Start building your application!

**Database**: casexpert_db  
**Tables**: 9  
**Ready**: ✅  

---

**Last Updated**: November 28, 2024  
**Version**: 1.0  
**MySQL**: 5.7+  
**Workbench**: 8.0+
