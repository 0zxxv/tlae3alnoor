# Troubleshooting Guide - Backend Connection Issues

## Quick Fixes

### 1. Check if Backend is Running
Open a terminal in the `backend` folder and run:
```bash
cd backend
npm start
```

You should see:
```
🚀 Server running on http://localhost:3001
```

**If you see errors**, make sure you've installed dependencies:
```bash
cd backend
npm install
```

### 2. Find Your Computer's IP Address

**Windows:**
1. Open Command Prompt (cmd)
2. Type: `ipconfig`
3. Look for "IPv4 Address" under your network adapter
4. It will look like: `192.168.1.xxx` or `172.20.10.xx`

**Mac/Linux:**
1. Open Terminal
2. Type: `ifconfig` or `ip addr`
3. Look for your network interface (usually `en0` or `wlan0`)
4. Find the `inet` address

### 3. Update IP Address in App

1. Open `src/services/api.ts`
2. Find line 5: `const API_BASE_URL = 'http://172.20.10.11:3001/api';`
3. Replace `172.20.10.11` with your current IP address
4. Also update line 6: `export const SERVER_BASE_URL = 'http://172.20.10.11:3001';`
5. Save and reload the app

### 4. Test Connection from Phone

1. Make sure your phone is on the **same Wi-Fi network** as your computer
2. Open a browser on your phone
3. Go to: `http://YOUR_IP:3001/api/health`
   - Replace `YOUR_IP` with your computer's IP
   - Example: `http://192.168.1.100:3001/api/health`
4. You should see: `{"status":"ok","message":"Tlae3 Alnoor API is running"}`

**If this doesn't work:**
- Your IP address is wrong
- Your phone and computer are on different networks
- Windows Firewall is blocking the connection (see below)

### 5. Fix Windows Firewall

If the browser test fails, Windows Firewall might be blocking port 3001:

1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → Next
5. Select "TCP" and enter port `3001`
6. Select "Allow the connection"
7. Apply to all profiles
8. Name it "Node.js Backend"

### 6. Common Issues

**Issue: "Cannot connect to server"**
- ✅ Backend is not running → Start it with `npm start`
- ✅ Wrong IP address → Update `src/services/api.ts`
- ✅ Different networks → Connect phone and computer to same Wi-Fi
- ✅ Firewall blocking → Fix Windows Firewall (see above)

**Issue: "Request timeout"**
- ✅ Backend crashed → Restart it
- ✅ Network is slow → Wait longer or check Wi-Fi connection
- ✅ IP address changed → Update `src/services/api.ts`

**Issue: "404 Not Found"**
- ✅ Backend is running but on wrong port → Check backend console
- ✅ API endpoint is wrong → Should be `/api/auth/demo-login`

### 7. Test with Guest Login

The "Guest" (زائر) login button should work without the backend. If it works, the app is fine - the issue is just the backend connection.

### 8. Check Console Logs

When you try to login, check:
- **React Native Metro bundler console** - Shows `[API]` logs
- **Backend terminal** - Shows incoming requests

You should see:
```
[API] POST http://YOUR_IP:3001/api/auth/demo-login
```

If you don't see this, the app isn't making the request (check IP address).

### 9. Still Not Working?

1. **Try using Android Emulator:**
   - Use IP: `10.0.2.2` (special IP for Android emulator)
   - Update `src/services/api.ts` line 5 to: `const API_BASE_URL = 'http://10.0.2.2:3001/api';`

2. **Try using iOS Simulator:**
   - Use IP: `localhost`
   - Update `src/services/api.ts` line 5 to: `const API_BASE_URL = 'http://localhost:3001/api';`

3. **Check backend logs:**
   - Look at the terminal where backend is running
   - You should see requests coming in when you try to login
   - If you don't see anything, the request isn't reaching the server

## Need More Help?

Check the console logs for specific error messages. The app now shows detailed error messages that will help identify the exact problem.

