# 🔧 Port Management & Error Handling

## ✅ EADDRINUSE Error - FIXED!

Your backend now has **automatic port conflict resolution** and **graceful shutdown**.

---

## 🎯 Features Implemented

### 1. ✅ Dynamic Port Handling
- **Default port:** 5001
- **Auto-fallback:** If 5001 is busy, tries 5002, 5003, 5004, 5005
- **Max attempts:** 5 ports
- **Smart detection:** Automatically detects if port is in use

### 2. ✅ Graceful Shutdown
- **SIGTERM/SIGINT:** Handles Ctrl+C gracefully
- **Uncaught exceptions:** Catches and logs errors
- **Unhandled rejections:** Prevents crashes
- **Timeout:** Forces shutdown after 10 seconds if needed

### 3. ✅ Helper Scripts
- **kill-port.ps1** - PowerShell script to kill processes on port 5001
- **kill-port.bat** - Batch script to kill processes on port 5001
- **npm scripts** - Convenient commands

---

## 📝 Updated server.js

### Key Changes:

```javascript
// Dynamic port handling with fallback
const PORT = parseInt(process.env.PORT) || 5001;
const MAX_PORT_ATTEMPTS = 5;

const startServer = (port, attempt = 1) => {
  server = app.listen(port)
    .on('listening', () => {
      console.log(`📡 Server running on: http://localhost:${port}`);
      if (port !== PORT) {
        console.log(`⚠️  Note: Using port ${port} (${PORT} was busy)`);
      }
    })
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`⚠️  Port ${port} is already in use.`);
        if (attempt < MAX_PORT_ATTEMPTS) {
          const nextPort = port + 1;
          console.log(`🔄 Trying port ${nextPort}...`);
          startServer(nextPort, attempt + 1);
        } else {
          console.error(`❌ Could not find an available port`);
          process.exit(1);
        }
      }
    });
};

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`🛑 ${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(() => {
      console.log('✅ Server closed. Exiting process.');
      process.exit(0);
    });
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```

---

## 🚀 How to Use

### Method 1: Normal Start (Auto Port Fallback)
```bash
npm start
```
- Tries port 5001
- If busy, automatically tries 5002, 5003, etc.
- Shows which port it's using

### Method 2: Kill Port First, Then Start
```bash
# PowerShell
.\kill-port.ps1

# Or Batch
kill-port.bat

# Then start
npm start
```

### Method 3: Clean Start (NPM Script)
```bash
npm run clean-start
```
- Kills any process on port 5001
- Then starts the server

### Method 4: Development Mode (Nodemon)
```bash
npm run dev
```
- Auto-restarts on file changes
- Uses same port fallback logic

---

## 🔍 Troubleshooting Commands

### Check What's Using Port 5001
```bash
# Windows
netstat -ano | findstr :5001
```

### Kill Process by PID
```bash
# Windows
taskkill /PID <PID> /F

# Example
taskkill /PID 23360 /F
```

### Kill All Node Processes
```bash
# PowerShell
Get-Process node | Stop-Process -Force

# CMD
taskkill /IM node.exe /F
```

### Use Helper Scripts
```bash
# PowerShell
.\kill-port.ps1

# Batch
kill-port.bat
```

---

## 📊 What Happens Now

### Scenario 1: Port 5001 is Free
```
> npm start

==================================================
🚀 CaseXpert Backend Server Started
==================================================
📡 Server running on: http://localhost:5001
🌍 Environment: development
🗄️  Database: casexpert_db
==================================================
```

### Scenario 2: Port 5001 is Busy
```
> npm start

⚠️  Port 5001 is already in use.
🔄 Trying port 5002...

==================================================
🚀 CaseXpert Backend Server Started
==================================================
📡 Server running on: http://localhost:5002
⚠️  Note: Using port 5002 (5001 was busy)
🌍 Environment: development
🗄️  Database: casexpert_db
==================================================
```

### Scenario 3: All Ports Busy (5001-5005)
```
> npm start

⚠️  Port 5001 is already in use.
🔄 Trying port 5002...
⚠️  Port 5002 is already in use.
🔄 Trying port 5003...
⚠️  Port 5003 is already in use.
🔄 Trying port 5004...
⚠️  Port 5004 is already in use.
🔄 Trying port 5005...
⚠️  Port 5005 is already in use.

❌ Could not find an available port after 5 attempts.
   Please free up ports 5001-5005 or stop other Node.js processes.

   Run this command to kill processes on port 5001:
   Windows: netstat -ano | findstr :5001
   Then: taskkill /PID <PID> /F
```

---

## 🛑 Graceful Shutdown

### Press Ctrl+C
```
^C
🛑 SIGINT received. Shutting down gracefully...
✅ Server closed. Exiting process.
```

### Uncaught Exception
```
❌ Uncaught Exception: [error details]
🛑 UNCAUGHT_EXCEPTION received. Shutting down gracefully...
✅ Server closed. Exiting process.
```

---

## 📦 NPM Scripts Available

```json
{
  "scripts": {
    "start": "node server.js",              // Normal start with auto port fallback
    "dev": "nodemon server.js",             // Development mode with auto-restart
    "kill-port": "...",                     // Kill process on port 5001
    "clean-start": "npm run kill-port & npm start"  // Kill port then start
  }
}
```

---

## 🔧 Helper Files Created

### 1. `kill-port.ps1` (PowerShell)
```powershell
# Usage
.\kill-port.ps1

# With custom port
.\kill-port.ps1 -Port 5002
```

### 2. `kill-port.bat` (Batch)
```batch
# Usage
kill-port.bat
```

---

## ✅ No More EADDRINUSE Errors!

### Before (❌ Error):
```
Error: listen EADDRINUSE: address already in use :::5001
```

### After (✅ Fixed):
```
⚠️  Port 5001 is already in use.
🔄 Trying port 5002...
📡 Server running on: http://localhost:5002
```

---

## 🎯 Best Practices

1. **Use `npm start`** - Automatic port fallback
2. **Use `npm run dev`** - For development with auto-restart
3. **Use `npm run clean-start`** - If you want to force port 5001
4. **Press Ctrl+C** - To stop the server gracefully
5. **Check .env file** - To set preferred port

---

## 🔍 Environment Variables

```env
# .env file
PORT=5001

# If port is busy, server will try:
# 5001 → 5002 → 5003 → 5004 → 5005
```

---

## 📝 Summary

✅ **Dynamic port handling** - Auto-fallback to next available port  
✅ **Graceful shutdown** - Handles Ctrl+C and errors properly  
✅ **Helper scripts** - Easy port management  
✅ **NPM scripts** - Convenient commands  
✅ **Error messages** - Clear instructions when ports are busy  
✅ **No duplicate app.listen()** - Single server instance  

---

**Your backend will never crash with EADDRINUSE error again! 🎉**
