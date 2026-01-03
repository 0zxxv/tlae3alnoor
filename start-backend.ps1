# Script to start the backend server
# Run with: .\start-backend.ps1

Write-Host "`n🚀 Starting Backend Server...`n" -ForegroundColor Cyan

# Check if port 3001 is in use
$portCheck = netstat -ano | findstr :3001
if ($portCheck) {
    Write-Host "⚠️  Port 3001 is already in use!" -ForegroundColor Yellow
    Write-Host "Finding process...`n" -ForegroundColor Gray
    
    $processId = ($portCheck -split '\s+')[4]
    Write-Host "Process ID: $processId" -ForegroundColor Gray
    Write-Host "Killing process...`n" -ForegroundColor Yellow
    
    taskkill /PID $processId /F | Out-Null
    Start-Sleep -Seconds 1
    Write-Host "✅ Port 3001 is now free`n" -ForegroundColor Green
}

# Navigate to backend and start
Set-Location backend
Write-Host "Starting server...`n" -ForegroundColor Cyan
npm start

