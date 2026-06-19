$ErrorActionPreference = "Stop"
$BASE = "https://dating-app-backend-q5gk.onrender.com"
$RUN_ID = Get-Random -Minimum 10000 -Maximum 99999
$EMAIL = "debug.$RUN_ID@test.com"
$PASS  = "Test1234!"

function Call-Api {
    param([string]$M, [string]$P, $B = $null, [string]$T = $null)
    $h = @{ "Accept" = "application/json" }
    if ($B) { $h["Content-Type"] = "application/json" }
    if ($T) { $h["Authorization"] = "Bearer $T" }
    $pp = @{ Method = $M; Uri = "$BASE$P"; Headers = $h; TimeoutSec = 30 }
    if ($B) { $pp.Body = ($B | ConvertTo-Json -Depth 10) }
    try { return @{ ok = $true; data = (Invoke-RestMethod @pp) } }
    catch {
        $code = $_.Exception.Response.StatusCode.value__
        $errBody = ""
        try { $errBody = $_.ErrorDetails.Message } catch {}
        return @{ ok = $false; status = $code; error = $errBody }
    }
}

Write-Host ">>> Email: $EMAIL" -ForegroundColor Cyan

# Register
$r = Call-Api POST "/api/auth/register" @{ email = $EMAIL; password = $PASS; displayName = "Debug" }
Write-Host "[register] $($r.ok) $($r.error)"

# Verify
$r = Call-Api POST "/api/auth/verify-email" @{ email = $EMAIL; otpCode = "123456" }
Write-Host "[verify]   $($r.ok) $($r.error)"
if (-not $r.ok) { exit 1 }
$token = $r.data.accessToken
Write-Host "Token: $($token.Substring(0,30))..."

# Profile
$r = Call-Api PUT "/api/profile" @{
    displayName = "Debug"
    gender = "Male"
    dateOfBirth = "1995-01-01"
    bio = "Debug"
    height = 170
    location = "HCM"
    datingGoal = "Casual"
} $token
Write-Host "[profile]  $($r.ok) $($r.error)"

# Location
$r = Call-Api PUT "/api/profile/location" @{ latitude = 10.7626; longitude = 106.6602 } $token
Write-Host "[location] $($r.ok) $($r.error)"

# Prefs
$r = Call-Api PUT "/api/preferences" @{
    interestedInGender = "Female"; minAge = 18; maxAge = 35; maxDistanceKm = 50
} $token
Write-Host "[prefs]    $($r.ok) $($r.error)"

# Discovery
$r = Call-Api GET "/api/discovery" $null $token
Write-Host "[discovery] $($r.ok) $($r.error)"

# Tasks
$r = Call-Api GET "/api/tasks" $null $token
Write-Host "`n===== /api/tasks =====" -ForegroundColor Yellow
$r.data | ConvertTo-Json -Depth 5

# Inventory
$r = Call-Api GET "/api/inventory" $null $token
Write-Host "`n===== /api/inventory =====" -ForegroundColor Yellow
$r.data | ConvertTo-Json -Depth 5

# Match list
$r = Call-Api GET "/api/matches" $null $token
Write-Host "`n===== /api/matches =====" -ForegroundColor Yellow
$r.data | ConvertTo-Json -Depth 5

# For each match, get plant
if ($r.ok -and $r.data) {
    $matches = if ($r.data -is [array]) { $r.data } else { $r.data.items }
    foreach ($m in $matches) {
        Write-Host "`n===== /api/plants/$($m.id) =====" -ForegroundColor Yellow
        $p = Call-Api GET "/api/plants/$($m.id)" $null $token
        $p.data | ConvertTo-Json -Depth 5

        Write-Host "`n===== POST /api/plants/$($m.id)/water (Water) =====" -ForegroundColor Yellow
        $w = Call-Api POST "/api/plants/$($m.id)/water" @{ material = "Water" } $token
        $w.data | ConvertTo-Json -Depth 5

        Write-Host "`n===== /api/plants/$($m.id) (after water) =====" -ForegroundColor Yellow
        $p2 = Call-Api GET "/api/plants/$($m.id)" $null $token
        $p2.data | ConvertTo-Json -Depth 5
    }
}