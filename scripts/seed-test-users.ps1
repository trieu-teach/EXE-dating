# Seed test users vào SameMess BE — đúng schema DTO thật
# Mỗi user: register → verify email (OTP = 123456) → update profile → update location → update preferences

$ErrorActionPreference = "Stop"
$BASE = "https://dating-app-backend-q5gk.onrender.com"

# Mỗi lần chạy tạo email mới tránh trùng
$RUN_ID = Get-Random -Minimum 10000 -Maximum 99999
Write-Host "`n>>> RUN_ID = $RUN_ID" -ForegroundColor Cyan
Write-Host ">>> Mật khẩu chung: Test1234!    Email dang: *.$RUN_ID@test.com`n"

# Format: gender dùng enum chuẩn BE: "Male" | "Female" | "Other"
# interestedInGender dùng: "Male" | "Female" | "Everyone"
$USERS = @(
    @{ email = "alice.$RUN_ID@test.com"; name = "Mai Linh";    gender = "Female"; pref = "Male";     dob = "1998-05-15"; h = 162; bio = "Yêu cà phê và sách 📚"; loc = "Hồ Chí Minh"; lat = 10.7626; lng = 106.6602 }
    @{ email = "bob.$RUN_ID@test.com";   name = "Minh Tuấn";   gender = "Male";   pref = "Female";   dob = "1995-08-20"; h = 175; bio = "Đi phượt một mình 🏍️"; loc = "Hồ Chí Minh"; lat = 10.7769; lng = 106.7009 }
    @{ email = "carol.$RUN_ID@test.com"; name = "Thanh Hằng";  gender = "Female"; pref = "Male";     dob = "1996-11-02"; h = 168; bio = "Kiến trúc sư tập sự 🏛️"; loc = "Hồ Chí Minh"; lat = 10.8231; lng = 106.6297 }
    @{ email = "david.$RUN_ID@test.com"; name = "Quốc Bảo";    gender = "Male";   pref = "Female";   dob = "1993-03-10"; h = 180; bio = "Startup founder 🚀";     loc = "Hồ Chí Minh"; lat = 10.7500; lng = 106.6500 }
    @{ email = "eva.$RUN_ID@test.com";   name = "Phương Anh";  gender = "Female"; pref = "Everyone"; dob = "1999-07-25"; h = 158; bio = "Bác sĩ thú y 🐾";       loc = "Hồ Chí Minh"; lat = 10.7900; lng = 106.6900 }
)

function Call-Api {
    param(
        [string]$Method,
        [string]$Path,
        [object]$Body = $null,
        [string]$Token = $null
    )
    $headers = @{ "Accept" = "application/json" }
    if ($Body) { $headers["Content-Type"] = "application/json" }
    if ($Token) { $headers["Authorization"] = "Bearer $Token" }
    $params = @{
        Method      = $Method
        Uri         = "$BASE$Path"
        Headers     = $headers
        TimeoutSec  = 30
    }
    if ($Body) { $params.Body = ($Body | ConvertTo-Json -Depth 10) }
    try {
        $r = Invoke-RestMethod @params
        return @{ ok = $true; data = $r }
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        $errBody = ""
        try { $errBody = $_.ErrorDetails.Message } catch {}
        return @{ ok = $false; status = $code; error = $errBody }
    }
}

$created = @()

foreach ($u in $USERS) {
    Write-Host "────── $($u.name) ($($u.email)) ──────" -ForegroundColor Yellow

    # 1) Register — chỉ cần email, password, displayName
    $r = Call-Api POST "/api/auth/register" @{
        email = $u.email
        password = "Test1234!"
        displayName = $u.name
    }
    Write-Host "  [1/5] register   : $(if ($r.ok) {'OK'} else {"FAIL $($r.status): $($r.error)"})"
    if (-not $r.ok) { continue }

    # 2) Verify email — OTP dev mặc định "123456"
    $r = Call-Api POST "/api/auth/verify-email" @{
        email = $u.email
        otpCode = "123456"
    }
    Write-Host "  [2/5] verify     : $(if ($r.ok) {'OK'} else {"FAIL $($r.status): $($r.error)"})"
    if (-not $r.ok) { continue }
    $token = $r.data.accessToken
    if (-not $token) {
        Write-Host "  ⚠️ response không có accessToken: $($r.data | ConvertTo-Json -Compress)" -ForegroundColor Red
        continue
    }

    # 3) Update profile — dùng đúng field BE yêu cầu
    $r = Call-Api PUT "/api/profile" @{
        displayName = $u.name
        gender = $u.gender              # "Male" | "Female" | "Other"
        dateOfBirth = $u.dob            # "yyyy-MM-dd"
        bio = $u.bio
        height = $u.h                   # cm
        location = $u.loc
        datingGoal = "Casual"           # string tự do, ≤100 chars
    } $token
    Write-Host "  [3/5] profile    : $(if ($r.ok) {'OK'} else {"FAIL $($r.status): $($r.error)"})"
    if (-not $r.ok) {
        Write-Host "  payload gửi: $(@{
            displayName=$u.name; gender=$u.gender; dateOfBirth=$u.dob
            bio=$u.bio; height=$u.h; location=$u.loc; datingGoal='Casual'
        } | ConvertTo-Json -Compress)" -ForegroundColor Gray
    }

    # 4) Update location — BE cần lat/lon để Discovery hoạt động
    $r = Call-Api PUT "/api/profile/location" @{
        latitude = $u.lat
        longitude = $u.lng
    } $token
    Write-Host "  [4/5] location   : $(if ($r.ok) {'OK'} else {"FAIL $($r.status): $($r.error)"})"

    # 5) Update preferences — 4 field bắt buộc
    $r = Call-Api PUT "/api/preferences" @{
        interestedInGender = $u.pref    # "Male" | "Female" | "Everyone"
        minAge = 18
        maxAge = 35
        maxDistanceKm = 50
    } $token
    Write-Host "  [5/5] preferences: $(if ($r.ok) {'OK'} else {"FAIL $($r.status): $($r.error)"})"

    if ($r.ok) {
        $created += $u
        Write-Host "  ✅ DONE — token: $($token.Substring(0, 30))..." -ForegroundColor Green
    }
    Start-Sleep -Milliseconds 200
}

Write-Host "`n═══════ TỔNG KẾT ═══════" -ForegroundColor Cyan
Write-Host "Tạo thành công $($created.Count)/$($USERS.Count) user.`n"
$created | ForEach-Object {
    Write-Host "  • $($_.email)  /  Test1234!   ($($_.name))" -ForegroundColor White
}
Write-Host "`nGiờ mở app → đăng nhập 1 trong các user trên → vào Discovery sẽ thấy các user còn lại."
