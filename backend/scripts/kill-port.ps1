# Kill process on port 5001
param(
    [int]$Port = 5001
)

Write-Host "🔍 Checking for processes on port $Port..." -ForegroundColor Yellow

$connections = netstat -ano | Select-String ":$Port"

if ($connections) {
    Write-Host "Found processes using port $Port" -ForegroundColor Green
    
    $pids = @()
    foreach ($line in $connections) {
        if ($line -match '\s+(\d+)\s*$') {
            $processId = $matches[1]
            if ($processId -and $processId -ne "0" -and $pids -notcontains $processId) {
                $pids += $processId
            }
        }
    }
    
    if ($pids.Count -gt 0) {
        Write-Host "Killing PIDs: $($pids -join ', ')" -ForegroundColor Cyan
        foreach ($processId in $pids) {
            try {
                Stop-Process -Id $processId -Force -ErrorAction Stop
                Write-Host "✅ Killed process $processId" -ForegroundColor Green
            } catch {
                Write-Host "❌ Failed to kill process $processId : $_" -ForegroundColor Red
            }
        }
        Write-Host "`n✅ Port $Port is now free!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  No valid PIDs found" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Port $Port is already free!" -ForegroundColor Green
}
