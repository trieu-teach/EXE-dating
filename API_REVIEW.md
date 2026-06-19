# SameMess Frontend-Backend API Review

## Tổng quan

Doc này tổng hợp tất cả API endpoints mà **frontend sử dụng**, đối chiếu với BE deployed tại `https://dating-app-backend-q5gk.onrender.com`.

---
## Status (updated 2026-06-18)

| Module | FE Config | FE Service | BE Endpoints | Status |
|--------|-----------|-----------|--------------|--------|
| Auth | ✅ | ✅ | ✅ | Done |
| Profile | ✅ | ✅ | ✅ | Done |
| Preferences | ✅ | ✅ | ✅ | Done |
| Swipes | ✅ | ✅ | ✅ | Done |
| Discovery | ✅ | ✅ | ✅ | Done |
| Matches | ✅ | ✅ | ✅ | Done |
| Chat | ✅ | ✅ | ✅ | Done |
| Admin | ✅ | ✅ | ✅ | Done |
| Settings | ✅ | ✅ | ✅ | Done (verified Swagger) |
| Search | ✅ | ✅ | ✅ | Done (verified Swagger) |
| Safety | ✅ | ✅ | ✅ | Done (verified Swagger) |
| Daily | ✅ | ✅ | ✅ | Done (verified Swagger) |
| Events | ✅ | ✅ | ✅ | Done (verified Swagger) |
| Premium | ✅ | ✅ | ✅ | Done (verified Swagger) |
| LoveTree | ✅ | ✅ | ✅ | Done (verified Swagger) |
| AI | ✅ | ✅ | ✅ | Done (verified Swagger) |
| Notifications | ✅ | ✅ | ✅ | Done (verified Swagger) |
| Connection | ✅ | ✅ | ✅ | Done |
| Block/Report | ✅ | ✅ | ✅ | Done |

---
## Known Mismatches / Fixes Applied

### 1. Admin Verifications — path param name
- **BE Swagger**: `/api/admin/verifications/{userId}` (dùng `userId`)
- **FE config cũ**: dùng `id` làm param name
- **Fix**: Đổi config sang `(userId)` cho `verificationDetail`, `verificationApprove`, `verificationReject` ✅

### 2. Search Interests — UUID mapping
- **BE Swagger**: `Interests` query param là `array<uuid>` (UUIDs từ `/api/search/filters`)
- **FE**: Đang map interest labels → string IDs (`interest-{label}`)
- **Fix (partial)**: Search page đã sửa để:
  - Ưu tiên `interests` từ API (`InterestDto[]` có UUID thật)
  - Fallback localStorage khi API chưa trả data
  - Gửi `activeTagIds` (UUIDs từ API) vào query param `Interests`
  - Local custom interests được merge vào catalog để UI hiển thị đầy đủ

### 3. Search Filters — BE trả về data động
- **BE trả**: `{ interests: InterestDto[], cities: string[], genders: string[] }`
- **FE cũ**: hardcode cities, genders, proximities, moods, wantToGo
- **Fix**: Search page đã đổi sang dùng data từ BE API:
  - `cities`, `genders` lấy trực tiếp từ `filterOptions`
  - `interests` group theo `groupName` từ BE
  - `proximities` giữ hardcode (BE chưa có field này)

### 4. City data — string[] vs {id, label}[]
- **BE Swagger**: `cities: string[]` (chỉ IDs)
- **FE**: cần label để hiển thị
- **Fix**: FE tự map `string[]` → `{id, label}` với label = id

---
## Remaining Items

| Item | Status | Ghi chú |
|------|--------|---------|
| `/api/auth/me` | ⚠️ Chưa gọi đúng chỗ | Login/VerifyOTP chỉ dùng user từ response |
| `reputation/me` | ⚠️ Chưa có service/page | Config có, chưa dùng |
| `gamification (tasks, inventory)` | ⚠️ Chưa có service/page | Config có, chưa dùng |
| `subscription/mockConfirm` | ⚠️ Chưa thấy page dùng | Service có |
| Interests UUID mapping hoàn chỉnh | 🔄 Partial | LocalStorage interests dùng string IDs, cần sync với BE |

---
## Các endpoint cần kiểm tra thêm (BE đã có nhưng chưa test FE)

- `POST /api/profile/boost`
- `POST /api/premium/subscribe` (legacy)
- `POST /api/ai/icebreakers/{matchId}`
- `GET /api/plants/{matchId}/level-up`
- `POST /api/safety/pin/forgot`
- `POST /api/safety/pin/verify-otp`

---
## Phase Summary

### Phase 1: Core Flow ✅ (FE hoàn tất, BE verified)
- [x] Settings endpoints
- [x] Search endpoints
- [x] Safety endpoints
- [x] Daily endpoints
- [x] Admin endpoints

### Phase 2: Payment & Notifications ✅
- [x] VNPay integration
- [x] WebPush notifications
- [x] Photo upload from URL

### Phase 3: Enhancement
- [ ] Token refresh
- [ ] WebSocket Chat
- [ ] Rate limiting
