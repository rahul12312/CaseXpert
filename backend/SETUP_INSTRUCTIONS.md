# 🚀 CaseXpert Backend - Complete Setup Instructions

## ⚠️ IMPORTANT: Follow These Steps in Order

### Step 1: Create Database in MySQL Workbench

1. **Open MySQL Workbench**
2. **Connect to your MySQL server** (localhost)
3. **Open the SQL file**:
   - File → Open SQL Script
   - Navigate to: `database/casexpert_workbench.sql`
   - Or copy-paste the entire content

4. **Execute the script**:
   - Click the ⚡ Execute button
   - Or press `Ctrl + Shift + Enter`
   - Wait for completion (5-10 seconds)

5. **Verify database created**:
   - Refresh Schemas panel (right-click → Refresh All)
   - Expand `casexpert_db`
   - You should see 9 tables

### Step 2: Install Backend Dependencies

```bash
cd nodejs-backend
npm install
```

**Dependencies installed:**
- express (web framework)
- mysql2 (MySQL driver)
- jsonwebtoken (JWT auth)
- bcryptjs (password hashing)
- cors (CORS middleware)
- dotenv (environment variables)

### Step 3: Configure Environment

The `.env` file is already configured with your MySQL credentials:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Ajsql123
DB_NAME=casexpert_db
PORT=5001
```

✅ **No changes needed!**

### Step 4: Start the Backend Server

```bash
npm start
```

**Expected output:**
```
==================================================
🚀 CaseXpert Backend Server Started
==================================================
📡 Server running on: http://localhost:5001
🌍 Environment: development
🗄️  Database: casexpert_db
==================================================
✅ MySQL Database connected successfully!
   → Database: casexpert_db
   → Host: 127.0.0.1:3306
==================================================
```

### Step 5: Test the API

#### Option 1: Use the HTML Tester (Recommended)
1. Open `test-api.html` in your browser
2. Try registering a user
3. Try logging in
4. Try adding a lawyer profile

#### Option 2: Use Postman or Thunder Client

**Register User:**
```http
POST http://localhost:5001/api/auth/register
Content-Type: application/json

{
  "name": "Amol Sharma",
  "email": "amol@example.com",
  "phone": "+919999999999",
  "password": "123456",
  "user_type": "client"
}
```

**Login User:**
```http
POST http://localhost:5001/api/auth/login
Content-Type: application/json

{
  "email": "amol@example.com",
  "password": "123456"
}
```

**Add Lawyer (needs token):**
```http
POST http://localhost:5001/api/lawyer/add
Authorization: Bearer <your-token-here>
Content-Type: application/json

{
  "user_id": 1,
  "specialization": "Criminal Law",
  "experience": 5,
  "languages": "Hindi, Marathi, English",
  "fee_per_hour": 1200,
  "city": "Mumbai",
  "state": "Maharashtra"
}
```

**Get All Lawyers:**
```http
GET http://localhost:5001/api/lawyer
```

## 📁 Project Structure

```
nodejs-backend/
├── config/
│   └── db.js                  # MySQL connection
├── controllers/
│   ├── authController.js      # Register, Login, Profile
│   └── lawyerController.js    # Lawyer CRUD operations
├── middleware/
│   └── auth.js                # JWT authentication
├── routes/
│   ├── authRoutes.js          # Auth endpoints
│   └── lawyerRoutes.js        # Lawyer endpoints
├── .env                       # Environment variables
├── .gitignore                 # Git ignore
├── package.json               # Dependencies
├── server.js                  # Main server file
├── test-api.html              # API tester
└── README.md                  # Documentation
```

## 🔌 Available API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Lawyers
- `POST /api/lawyer/add` - Add lawyer profile (protected)
- `GET /api/lawyer` - Get all lawyers (public)
- `GET /api/lawyer/:id` - Get lawyer by ID (public)
- `PUT /api/lawyer/:id` - Update lawyer (protected)
- `DELETE /api/lawyer/:id` - Delete lawyer (admin only)

## 🔐 Authentication Flow

1. **Register** → Get token
2. **Login** → Get token
3. **Use token** in Authorization header:
   ```
   Authorization: Bearer <your-token>
   ```

## 🧪 Frontend Integration

### Register User
```javascript
fetch("http://localhost:5001/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Amol",
    email: "amol@example.com",
    phone: "9999999999",
    password: "123456",
    user_type: "client"
  })
})
.then(res => res.json())
.then(data => {
  console.log(data);
  // Save token
  localStorage.setItem("token", data.data.token);
});
```

### Login User
```javascript
fetch("http://localhost:5001/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "amol@example.com",
    password: "123456"
  })
})
.then(res => res.json())
.then(data => {
  console.log(data);
  localStorage.setItem("token", data.data.token);
});
```

### Add Lawyer
```javascript
const token = localStorage.getItem("token");

fetch("http://localhost:5001/api/lawyer/add", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify({
    user_id: 1,
    specialization: "Criminal Lawyer",
    experience: 5,
    languages: "Hindi, Marathi, English",
    rating: 4.9,
    fee_per_hour: 1200,
    city: "Mumbai"
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

### Get All Lawyers
```javascript
fetch("http://localhost:5001/api/lawyer")
  .then(res => res.json())
  .then(data => console.log(data));
```

## 🐛 Troubleshooting

### Database Connection Failed
**Error:** `Unknown database 'casexpert_db'`

**Solution:**
1. Open MySQL Workbench
2. Execute `database/casexpert_workbench.sql`
3. Verify database exists
4. Restart backend server

### Port Already in Use
**Error:** `EADDRINUSE: address already in use :::5001`

**Solution:**
1. Kill process on port 5001
2. Or change PORT in `.env` file
3. Restart server

### Invalid Password
**Error:** `ER_ACCESS_DENIED_ERROR`

**Solution:**
1. Check `DB_PASSWORD` in `.env`
2. Verify MySQL credentials
3. Update `.env` if needed

### Token Expired
**Error:** `Token expired. Please login again.`

**Solution:**
1. Login again to get new token
2. Token expires after 7 days (configurable)

## ✅ Verification Checklist

Before testing:
- [ ] MySQL server is running
- [ ] Database `casexpert_db` exists
- [ ] All 9 tables are created
- [ ] Backend server is running on port 5001
- [ ] No connection errors in console

## 📊 Database Tables

Your database has these tables:
1. users
2. lawyers
3. cases
4. documents
5. chat
6. bookings
7. payments
8. reviews
9. notifications

## 🎯 Next Steps

1. ✅ Database created in MySQL Workbench
2. ✅ Backend server running
3. ⏭️ Test API with `test-api.html`
4. ⏭️ Connect your React frontend
5. ⏭️ Build your application!

## 📞 Support

**Backend URL:** http://localhost:5001  
**Test Page:** Open `test-api.html` in browser  
**Documentation:** See `README.md`

---

**Your backend is ready! 🎉**
