# Seed Test Users

Script PowerShell tạo 5 user test trên SameMess backend
(dùng cho môi trường dev — backend `dating-app-backend-q5gk.onrender.com`).

## Cách chạy

```powershell
cd d:\EXE201\EXE201\scripts
.\seed-test-users.ps1
```

Nếu Windows chặn script lần đầu:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\seed-test-users.ps1
```

## User được tạo

Mỗi lần chạy sinh `RUN_ID` ngẫu nhiên (10000-99999) để email không bị trùng.

| Email mẫu | Password | Giới tính | Độ tuổi | Tọa độ (TP.HCM) |
|-----------|----------|-----------|---------|-----------------|
| `alice.<RUN_ID>@test.com` | Test1234! | Female | 28 | (10.7626, 106.6602) |
| `bob.<RUN_ID>@test.com`   | Test1234! | Male | 30 | (10.7769, 106.7009) |
| `carol.<RUN_ID>@test.com` | Test1234! | Female | 29 | (10.8231, 106.6297) |
| `david.<RUN_ID>@test.com` | Test1234! | Male | 33 | (10.7500, 106.6500) |
| `eva.<RUN_ID>@test.com`   | Test1234! | Female | 26 | (10.7900, 106.6900) |

## Luồng API script gọi (đúng DTO thật)

1. `POST /api/auth/register` — body `{ email, password, displayName }`
2. `POST /api/auth/verify-email` — body `{ email, otpCode: "123456" }` → trả `{ accessToken, user }`
3. `PUT /api/profile` — body `{ displayName, gender, dateOfBirth, bio, height, location, datingGoal }`
4. `PUT /api/profile/location` — body `{ latitude, longitude }`
5. `PUT /api/preferences` — body `{ interestedInGender, minAge, maxAge, maxDistanceKm }`

## Sau khi chạy xong

Mở app FE → đăng nhập 1 trong 5 user trên → vào Discovery sẽ thấy 4 user còn lại.

## Schema quan trọng

- `gender`: `"Male" | "Female" | "Other"` (capitalize chữ cái đầu)
- `interestedInGender`: `"Male" | "Female" | "Everyone"`
- `datingGoal`: string tự do, max 100 chars
- `dateOfBirth`: `"yyyy-MM-dd"`
- `height`: 100-250 cm
- `minAge/maxAge`: 18-99
- `maxDistanceKm`: 1-500
- `OTP dev mặc định`: `123456` (chỉ chạy khi `IsEmailOtpBypass` đang bật ở dev mode)
