# Quick script to find your Wi-Fi IP address
# Run with: .\find-ip.ps1

Write-Host "`nFinding your Wi-Fi IP address...`n" -ForegroundColor Cyan

$wifi = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -like "*Wi-Fi*"}

if ($wifi) {
    $ip = $wifi.IPAddress
    Write-Host "✅ Your Wi-Fi IP Address: " -NoNewline
    Write-Host "$ip" -ForegroundColor Green
    Write-Host "`n📝 Update this in src/services/api.ts (lines 5 and 6)`n" -ForegroundColor Yellow
    
    Write-Host "Current API_BASE_URL should be:" -ForegroundColor Gray
    Write-Host "  const API_BASE_URL = 'http://$ip:3001/api';" -ForegroundColor White
    Write-Host "  export const SERVER_BASE_URL = 'http://$ip:3001';`n" -ForegroundColor White
} else {
    Write-Host "❌ Wi-Fi adapter not found" -ForegroundColor Red
    Write-Host "Try running: ipconfig`n" -ForegroundColor Yellow
}

