# Quick Start Guide - Getting Your App Running

## 🚀 One-Command Start (Easiest Way!)

After restarting your laptop, just run:

```powershell
.\start-app.ps1
```

**That's it!** This single command will:
1. ✅ Find your Wi-Fi IP address automatically
2. ✅ Update `src/services/api.ts` with the correct IP
3. ✅ Free port 3001 if it's in use
4. ✅ Start the backend server

---

## Manual Method (If You Prefer)

### Step 1: Find Your Current IP Address

Open PowerShell and type: `ipconfig`
- Look for "Wireless LAN adapter Wi-Fi" section
- Find "IPv4 Address" - that's your IP (e.g., `192.168.100.12`)

### Step 2: Update IP in App (If It Changed)

1. Open `src/services/api.ts`
2. Find lines 5 and 6 and update the IP address
3. Save the file

### Step 3: Start Backend Server

```bash
cd backend
npm start
```

You should see:
```
✅ Database initialized successfully
🚀 Server running on http://localhost:3001
```

### Step 4: Start Your React Native App

In another terminal:
```bash
npx expo start
```
Or just reload the app on your device

## Troubleshooting

### "Port 3001 already in use" Error

If you see this error, run:
```powershell
netstat -ano | findstr :3001
```

Then kill the process:
```powershell
taskkill /PID [PROCESS_ID] /F
```

Replace `[PROCESS_ID]` with the number from the netstat output.

### IP Address Changed?

Your IP might change when you:
- Reconnect to Wi-Fi
- Restart your router
- Connect to a different network

Just update it in `src/services/api.ts` and reload the app.

### Quick IP Check Script

Save this as `find-ip.ps1` in your project root:

```powershell
$wifi = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -like "*Wi-Fi*"}
if ($wifi) {
    Write-Host "Your Wi-Fi IP Address: $($wifi.IPAddress)" -ForegroundColor Green
    Write-Host "Update this in src/services/api.ts" -ForegroundColor Yellow
} else {
    Write-Host "Wi-Fi adapter not found" -ForegroundColor Red
}
```

Run it with: `.\find-ip.ps1`

## Summary

**Every time you restart:**
1. ✅ Find your IP: `ipconfig` → Look for Wi-Fi IPv4 Address
2. ✅ Update `src/services/api.ts` if IP changed
3. ✅ Start backend: `cd backend && npm start`
4. ✅ Start app: `npx expo start` (or reload on device)

That's it! 🎉

