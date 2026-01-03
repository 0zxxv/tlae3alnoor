# One-command script to set up and start everything
# Run with: .\start-app.ps1

Write-Host "`n[START] Setting up and starting your app...`n" -ForegroundColor Cyan

# Step 1: Find Wi-Fi IP address
Write-Host "[1] Finding your Wi-Fi IP address..." -ForegroundColor Yellow
$wifi = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -like "*Wi-Fi*"}

if (-not $wifi) {
    Write-Host "[X] Wi-Fi adapter not found!" -ForegroundColor Red
    Write-Host "Please check your network connection.`n" -ForegroundColor Yellow
    exit 1
}

$ip = $wifi.IPAddress
Write-Host "   [OK] Found IP: $ip`n" -ForegroundColor Green

# Step 2: Update API configuration file
Write-Host "[2] Updating API configuration..." -ForegroundColor Yellow
$apiFile = "src\services\api.ts"

if (-not (Test-Path $apiFile)) {
    Write-Host "   [X] File not found: $apiFile" -ForegroundColor Red
    exit 1
}

# Read the file
$content = Get-Content $apiFile -Raw

# Check if IP needs updating
if ($content -match "http://(\d+\.\d+\.\d+\.\d+):3001") {
    $oldIp = $matches[1]
    if ($oldIp -ne $ip) {
        Write-Host "   [UPDATE] Updating IP from $oldIp to $ip..." -ForegroundColor Gray
        $content = $content -replace "http://$oldIp:3001", "http://$ip:3001"
        Set-Content -Path $apiFile -Value $content -NoNewline
        Write-Host "   [OK] Updated!`n" -ForegroundColor Green
    } else {
        Write-Host "   [OK] IP is already correct!`n" -ForegroundColor Green
    }
} else {
    Write-Host "   [WARNING] Could not find IP pattern in file. Please check manually.`n" -ForegroundColor Yellow
}

# Step 3: Free port 3001 if needed
Write-Host "[3] Checking port 3001..." -ForegroundColor Yellow
$portCheck = netstat -ano | findstr :3001
if ($portCheck) {
    $processId = ($portCheck -split '\s+')[4]
    Write-Host "   [WARNING] Port 3001 is in use (PID: $processId)" -ForegroundColor Yellow
    Write-Host "   [STOP] Stopping old process..." -ForegroundColor Gray
    taskkill /PID $processId /F 2>$null | Out-Null
    Start-Sleep -Seconds 1
    Write-Host "   [OK] Port is now free!`n" -ForegroundColor Green
} else {
    Write-Host "   [OK] Port 3001 is available!`n" -ForegroundColor Green
}

# Step 4: Start backend server in new window
Write-Host "[4] Starting backend server in new window..." -ForegroundColor Yellow
$backendScript = @"
cd `"$PWD\backend`"
npm start
"@

$backendScript | Out-File -FilePath "$env:TEMP\start-backend.ps1" -Encoding UTF8
Start-Process powershell -ArgumentList "-NoExit", "-File", "$env:TEMP\start-backend.ps1"
Start-Sleep -Seconds 3
Write-Host "   [OK] Backend server starting...`n" -ForegroundColor Green

# Step 5: Start Expo app
Write-Host "[5] Starting Expo app...`n" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Expo will start now. Press Ctrl+C to stop.`n" -ForegroundColor Gray
Write-Host "Backend is running in a separate window.`n" -ForegroundColor Gray

npx expo start

