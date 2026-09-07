# Resets a student's CLICK password to whatever password they ask you to set.
# Run this whenever a student contacts you and tells you the password they
# want.
#
# Usage:
#   .\reset-student-password.ps1
# then follow the prompts.

$ErrorActionPreference = "Stop"

$BackendUrl = "https://jnxevalckgitxuunjcvv.supabase.co/functions/v1/click-backend"
$AnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpueGV2YWxja2dpdHh1dW5qY3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0OTg2OTYsImV4cCI6MjEwNDA3NDY5Nn0.AtbnOxi8sDI-jTQ1gYJy4_e5tXuHr2yG6OrJ5uYcANo"

$KeyFile = Join-Path $PSScriptRoot ".admin-key"

if (Test-Path $KeyFile) {
    $AdminKey = (Get-Content $KeyFile -Raw).Trim()
} else {
    $AdminKey = Read-Host "Enter the ADMIN_RESET_KEY (ask whoever set this up if you don't have it)"
    $save = Read-Host "Save it locally so you don't have to re-enter it each time? (y/n)"
    if ($save -eq "y") {
        Set-Content -Path $KeyFile -Value $AdminKey -NoNewline -Encoding utf8
        Write-Host "Saved to $KeyFile (this file is gitignored, never commit it)."
    }
}

$identifier = Read-Host "Student's roll number or email"

$securePassword = Read-Host "Password the student wants to set" -AsSecureString
$newPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
)

$confirmSecure = Read-Host "Confirm password" -AsSecureString
$confirm = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($confirmSecure)
)

if ($newPassword -ne $confirm) {
    Write-Host "Passwords don't match. Nothing was changed." -ForegroundColor Red
    exit 1
}

$body = @{
    action       = "adminResetPassword"
    admin_key    = $AdminKey
    identifier   = $identifier
    new_password = $newPassword
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $BackendUrl -Method Post -ContentType "application/json" -Headers @{
        "apikey"        = $AnonKey
        "Authorization" = "Bearer $AnonKey"
    } -Body $body

    if ($response.ok) {
        Write-Host ""
        Write-Host "Password set successfully." -ForegroundColor Green
        Write-Host "Student: $($response.user.name) ($($response.user.roll_no))"
        Write-Host "They can now log in with the password they gave you."
    } else {
        Write-Host "Failed: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "Request failed: $_" -ForegroundColor Red
}
