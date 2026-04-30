# Add Gemini API Key to .env
$envFile = "c:\Users\tipte\OneDrive\Desktop\New folder (2) - Copy\backend\.env"
$apiKey = "AIzaSyAYwuW_A8KG1uzLM2Vb7uQrqqCiuNlgRLU"

# Read current .env content
$content = Get-Content $envFile -Raw

# Check if GEMINI_API_KEY already exists
if ($content -match "GEMINI_API_KEY") {
    Write-Host "✅ GEMINI_API_KEY already exists in .env file"
    Write-Host "Updating the value..."
    $content = $content -replace "GEMINI_API_KEY=.*", "GEMINI_API_KEY=$apiKey"
} else {
    Write-Host "Adding GEMINI_API_KEY to .env file..."
    $content = $content.TrimEnd() + "`n`n# AI Configuration`nGEMINI_API_KEY=$apiKey`n"
}

# Write back to file
Set-Content -Path $envFile -Value $content -NoNewline

Write-Host "`n✅ Gemini API key added successfully!"
Write-Host "Key: $apiKey"
Write-Host "`nBackend will auto-reload with nodemon."
Write-Host "`nNext: Test with 'node backend/test-gemini.js'"
