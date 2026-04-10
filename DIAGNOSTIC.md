# Health Tracker Diagnostic Guide

## Connection Issues - Troubleshooting

If you see **"Error: Failed to fetch"**, use this guide to identify the problem.

### Step 1: Check Both Servers Are Running

**Windows PowerShell:**
```powershell
netstat -ano | Select-String ":3000" | Select-String "LISTENING"
netstat -ano | Select-String ":5000" | Select-String "LISTENING"
```

You should see:
- ✅ Port 3000 listening (Backend)
- ✅ Port 5000 listening (Frontend)

### Step 2: Restart the Backend

If backend isn't running, restart it:

```powershell
# Kill old processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Start backend
$env:EMAIL_USER="jainma004@gmail.com"
$env:EMAIL_PASS="dfih bvkp ojbn fkoh"
cd "C:\Users\Mayank Jain\Desktop\health-tracker\backend"
node server.js
```

Watch for startup messages:
```
==================================================
🏥 Health Tracker Backend Server
📍 Running on http://localhost:3000
🔌 CORS enabled for all origins
📊 Database: ./health.db
==================================================
✅ Database connected successfully
✅ Database tables initialized
```

### Step 3: Restart the Frontend

In a **separate** PowerShell window:

```powershell
cd "C:\Users\Mayank Jain\Desktop\health-tracker\frontend"
live-server --port=5000 --no-browser
```

Watch for message:
 ```
Ready for changes
```

### Step 4: Test API Directly

If you still get "Failed to fetch", test the API:

**Windows PowerShell:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/test" -UseBasicParsing
```

Expected response:
```json
{"status":"✅ Backend is working!","timestamp":"2026-04-10..."}
```

**If this fails:**
- ❌ Port 3000 is blocked or backend crashed
- Kill and restart backend as shown in Step 2

### Step 5: Check Browser Console

Open **http://localhost:5000** in your browser.

Press `F12` to open **Developer Tools** → **Console** tab.

Look for one of these messages:

**If you see:**
```
✅ Backend connected at http://localhost:3000
```
→ Connection is OK! The app should work. Try refreshing the page.

**If you see:**
```
❌ Backend is not responding after 3 attempts
```
→ Backend is offline. Go to Step 2 to restart it.

**If you see:**
```
Cannot reach backend - is it running on http://localhost:3000?
```
→ CORS or network issue. Restart both servers and try again.

### Step 6: Database Reset (Last Resort)

If the database is corrupted:

```powershell
cd "C:\Users\Mayank Jain\Desktop\health-tracker\backend"
rm health.db -Force -ErrorAction SilentlyContinue
node server.js  # This recreates it
```

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "Failed to fetch" error | Check backend is running (Step 1-2) |
| Backend crashes | Check console output for error, check database file |
| Frontend not loading | Check port 5000 is running, refresh browser |
| Email not working | Verify EMAIL_USER and EMAIL_PASS are set before starting |
| Port already in use | Kill process: `Get-Process -Name node \| Stop-Process -Force` |

## Manual API Test (Command Line)

Test each endpoint:

```powershell
# Test backend connectivity
Invoke-WebRequest http://localhost:3000/test -UseBasicParsing

# Create user
$body = @{name="John"; age=35} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:3000/user" `
  -Method POST `
  -Body $body `
  -ContentType "application/json" `
  -UseBasicParsing
```

## Browser DevTools Guide

Press **F12** in your browser and check:

1. **Console tab**: Look for error messages (red text)
2. **Network tab**: 
   - Click on requests to `localhost:3000`
   - Check **Status** column (should be 200)
   - Check **Response** tab for error details
3. **Application tab**: Check for CORS issues

## Getting Help

If nothing works:
1. Close everything: Ctrl+C in both PowerShell windows
2. Wait 5 seconds
3. Delete `health.db` file if corrupted
4. Restart both servers as shown in Steps 2-3
5. Refresh your browser
