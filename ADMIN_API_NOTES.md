# SameMess — Admin API Notes (Backend cần bổ sung)

Tài liệu này dành cho **team backend**: liệt kê các API mà **frontend Admin SameMess** (đang được xây) sẽ gọi, kèm request/response và ghi chú thiếu/mới hoàn toàn.

> **Frontend base path:** `VITE_API_BASE_URL=/api`  
> **Auth:** `Authorization: Bearer <admin_token>`  
> **Convention lỗi:** `{ message, code, details }`

---

## 0. Auth riêng cho Admin (MỚI)

Frontend admin dùng **login riêng** để phân quyền với user thường. Cần 1 endpoint mới.

### 0.1 `POST /admin/auth/login`

**Request**
```json
{ "email": "admin@samemess.vn", "password": "Abc123!@#" }
```

**Response 200**
```json
{
  "admin": {
    "id": "uuid",
    "email": "admin@samemess.vn",
    "name": "Admin",
    "role": "super_admin | moderator | support",
    "avatarUrl": "https://..."
  },
  "token": "jwt-admin-token",
  "refreshToken": "optional"
}
```

**Lỗi:** `401 UNAUTHORIZED`, `403 FORBIDDEN` (nếu không phải role admin).

### 0.2 `GET /admin/auth/me`
Lấy thông tin admin đang đăng nhập.

### 0.3 `POST /admin/auth/logout`
Huỷ session.

### 0.4 `GET /admin/auth/permissions`
Trả về permission của role hiện tại (để ẩn menu admin không có quyền).

> **Lưu ý:** Bảng `admins` riêng biệt `users`. Có cột `role`, `is_active`, `last_login_at`. JWT admin có claim `role: admin`.

---

## 1. Dashboard — Thống kê tổng (MỚI)

### 1.1 `GET /admin/dashboard/overview`

**Response**
```json
{
  "users": {
    "total": 12450,
    "todayNew": 32,
    "weekNew": 184,
    "monthNew": 612,
    "active24h": 2130,
    "growthPercent": 8.4
  },
  "verifications": {
    "pending": 14,
    "approvedToday": 6,
    "rejectedToday": 1
  },
  "matches": {
    "total": 48720,
    "today": 92,
    "mutualToday": 38
  },
  "conversations": {
    "active": 1240,
    "messagesToday": 5630
  },
  "events": {
    "upcoming": 4,
    "registrationsToday": 18
  },
  "revenue": {
    "monthVnd": 12450000,
    "premiumSubscribers": 218
  }
}
```

### 1.2 `GET /admin/dashboard/chart?metric=users|matches|messages&range=7d|30d|90d`

**Response**
```json
{
  "metric": "users",
  "range": "30d",
  "points": [
    { "date": "2025-05-01", "value": 12 },
    { "date": "2025-05-02", "value": 18 }
  ]
}
```

---

## 2. Users (MỚI — module admin)

### 2.1 `GET /admin/users` — danh sách

**Query:** `page`, `pageSize`, `search`, `status (active|locked|banned|unverified)`, `identityVerified`, `sortBy (createdAt|trustScore|lastActiveAt)`, `order`

**Response**
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Nguyễn Minh Anh",
      "email": "user@gmail.com",
      "username": "minhanh_23",
      "avatarUrl": "https://...",
      "age": 25,
      "gender": "female",
      "city": "Hà Nội",
      "status": "active",
      "identityVerified": true,
      "trustScore": 88,
      "isPremium": false,
      "createdAt": "2025-04-12T08:00:00Z",
      "lastActiveAt": "2025-05-22T10:12:00Z"
    }
  ],
  "total": 12450,
  "page": 1,
  "pageSize": 20
}
```

### 2.2 `GET /admin/users/:id` — chi tiết

**Response** — bao gồm:
- thông tin cơ bản
- `photos[]`, `interests[]`, `bio`
- thống kê: `matchesCount`, `conversationsCount`, `reportsCount`, `reportsAgainstCount`
- danh sách `verifications[]` (lịch sử xác minh)
- `safetySettings`, `settings`
- `subscription` (gói premium hiện tại)
- audit log gần nhất

### 2.3 `PATCH /admin/users/:id/status`

**Body**
```json
{ "status": "active|locked|banned", "reason": "Vi phạm điều khoản", "durationDays": 7 }
```

**Response:** `{ success: true }`

> Khi `banned` → user không login được. `locked` → khoá tạm thời với `expiresAt`.

### 2.4 `POST /admin/users/:id/note`

Admin ghi chú nội bộ.

**Body** `{ "content": "Đã liên hệ qua email..." }`

### 2.5 `GET /admin/users/:id/notes`

Lấy lịch sử ghi chú.

### 2.6 `DELETE /admin/users/:id` — xoá vĩnh viễn (chỉ super_admin)

**Body** `{ "confirm": true }`

### 2.7 `POST /admin/users/:id/reset-password`

**Body** `{ "newPassword": "Abc123!@#" }`

→ gửi email thông báo cho user.

### 2.8 `POST /admin/users/:id/revoke-sessions`

Thu hồi toàn bộ phiên đăng nhập (cũ + hiện tại).

### 2.9 `POST /admin/users/bulk-action`

**Body**
```json
{
  "userIds": ["id1", "id2"],
  "action": "lock|unlock|delete|verify",
  "reason": "..."
}
```

---

## 3. Identity Verification (MỚI — module admin)

### 3.1 `GET /admin/verifications?status=pending|approved|rejected&page=1`

**Response**
```json
{
  "items": [
    {
      "id": "vr-001",
      "user": {
        "id": "uuid",
        "name": "Trần Văn A",
        "avatarUrl": "..."
      },
      "type": "face",
      "photoUrl": "https://private-bucket.../x.jpg",
      "submittedAt": "2025-05-22T09:00:00Z",
      "status": "pending",
      "aiScore": 0.86,
      "aiFlags": ["lighting_low"]
    }
  ],
  "total": 14,
  "pending": 14
}
```

### 3.2 `GET /admin/verifications/:id`

Trả về ảnh xác minh (signed URL), metadata, lịch sử.

### 3.3 `POST /admin/verifications/:id/approve`

**Body** `{ "note": "OK" }`

→ set `users.identity_verified = true`, `trust_score = 88`, gửi notification.

### 3.4 `POST /admin/verifications/:id/reject`

**Body** `{ "reason": "FACE_MISMATCH|BLURRY|FAKE|other", "note": "..." }`

→ set `status = rejected`, gửi notification cho user.

---

## 4. Photos Moderation (MỚI)

### 4.1 `GET /admin/photos?status=pending|flagged|approved&page=1`

**Response**
```json
{
  "items": [
    {
      "id": "ph-001",
      "userId": "uuid",
      "userName": "Lê Hoa",
      "url": "https://cdn.../x.jpg",
      "status": "flagged",
      "flagReason": "nsfw",
      "aiScore": 0.92,
      "uploadedAt": "..."
    }
  ],
  "total": 28
}
```

### 4.2 `POST /admin/photos/:id/approve`

### 4.3 `POST /admin/photos/:id/reject`

**Body** `{ "reason": "nsfw|violent|other", "note": "..." }`

→ ẩn ảnh khỏi profile.

---

## 5. Reports (MỚI — báo cáo vi phạm)

### 5.1 `GET /admin/reports?status=new|in_review|resolved&page=1&type=user|photo|message`

**Response**
```json
{
  "items": [
    {
      "id": "rp-001",
      "type": "user",
      "targetUser": { "id": "...", "name": "Lê Hoa", "avatarUrl": "..." },
      "reporter": { "id": "...", "name": "Nguyễn B" },
      "reason": "fake_profile|inappropriate|harassment|spam|other",
      "description": "Gửi ảnh nude...",
      "status": "new",
      "createdAt": "...",
      "evidence": ["https://.../img1"]
    }
  ],
  "total": 42
}
```

### 5.2 `GET /admin/reports/:id`

### 5.3 `POST /admin/reports/:id/assign`

Gán cho moderator: `{ "adminId": "uuid" }`

### 5.4 `POST /admin/reports/:id/resolve`

**Body**
```json
{
  "resolution": "no_action|warn|lock|ban|delete_content",
  "note": "Đã cảnh cáo user",
  "lockDays": 7
}
```

### 5.5 `POST /admin/reports/:id/dismiss`

**Body** `{ "note": "Báo cáo sai" }`

---

## 6. Events — CRUD (MỚI module admin — đã có API user phía trên)

### 6.1 `GET /admin/events?status=draft|published|archived&page=1`

**Response**
```json
{
  "items": [
    {
      "id": "sunset-vineyard",
      "title": "Thưởng thức rượu vang hoàng hôn",
      "category": "dining",
      "premiumOnly": true,
      "date": "2025-08-24T16:00:00Z",
      "location": "Đà Lạt",
      "capacity": 50,
      "registered": 42,
      "status": "published",
      "rewardCode": "SAMEMESS50",
      "trustScoreDelta": 10
    }
  ],
  "total": 12
}
```

### 6.2 `POST /admin/events`

Tạo mới.

### 6.3 `GET /admin/events/:id`

### 6.4 `PUT /admin/events/:id`

### 6.5 `DELETE /admin/events/:id`

### 6.6 `POST /admin/events/:id/publish` / `/unpublish`

### 6.7 `GET /admin/events/:id/registrations`

Danh sách user đã đăng ký.

### 6.8 `POST /admin/events/:id/issue-reward`

Cấp mã thưởng cho 1 user: `{ "userId": "uuid", "code": "...", "trustScoreDelta": 10 }`

---

## 7. Premium Plans (MỚI — admin)

### 7.1 `GET /admin/premium/plans`

### 7.2 `POST /admin/premium/plans` — `{ "name", "priceVnd", "durationDays", "features": [] }`

### 7.3 `PUT /admin/premium/plans/:id`

### 7.4 `DELETE /admin/premium/plans/:id`

### 7.5 `GET /admin/premium/subscribers?status=active|expired|cancelled&page=1`

**Response**
```json
{
  "items": [
    {
      "id": "sub-001",
      "user": { "id": "uuid", "name": "...", "email": "..." },
      "planName": "6 tháng",
      "priceVnd": 499000,
      "startedAt": "...",
      "expiresAt": "...",
      "status": "active",
      "autoRenew": true
    }
  ],
  "total": 218
}
```

### 7.6 `POST /admin/premium/subscribers/:id/refund`

### 7.7 `POST /admin/premium/subscribers/:id/cancel`

---

## 8. Interests (MỚI — admin)

### 8.1 `GET /admin/interests`

**Response**
```json
{
  "groups": [
    {
      "id": "sports",
      "label": "Thể thao",
      "icon": "⚽",
      "items": [
        { "id": "football", "label": "Bóng đá", "active": true },
        { "id": "yoga", "label": "Yoga", "active": true }
      ]
    }
  ]
}
```

### 8.2 `POST /admin/interests` — thêm interest mới

**Body** `{ "groupId": "sports", "label": "Leo núi", "icon": "🧗" }`

### 8.3 `PATCH /admin/interests/:id` — đổi label / active

### 8.4 `DELETE /admin/interests/:id` — soft delete (set `active=false`)

### 8.5 `POST /admin/interests/groups` — tạo nhóm mới

---

## 9. Content & Audit (MỚI)

### 9.1 `GET /admin/audit-log?adminId=&action=&from=&to=&page=1`

Lịch sử thao tác của admin.

**Response**
```json
{
  "items": [
    {
      "id": "log-001",
      "adminId": "uuid",
      "adminName": "Minh (super)",
      "action": "user.lock",
      "targetType": "user",
      "targetId": "uuid",
      "meta": { "reason": "spam" },
      "ip": "1.2.3.4",
      "createdAt": "..."
    }
  ],
  "total": 1204
}
```

### 9.2 `GET /admin/notifications` — broadcast queue

### 9.3 `POST /admin/notifications/broadcast`

**Body**
```json
{
  "title": "Bảo trì hệ thống",
  "body": "App sẽ bảo trì từ 02:00 - 04:00",
  "target": "all|premium|free",
  "sendAt": "2025-05-25T02:00:00Z"
}
```

---

## 10. Settings (MỚI — global app config)

### 10.1 `GET /admin/settings/app`

**Response**
```json
{
  "verificationRequired": false,
  "verifiedOnlyDefault": true,
  "globalMode": false,
  "aiSuggestionsEnabled": true,
  "trustScoreUnverified": 42,
  "trustScoreVerified": 88,
  "minAge": 18,
  "maxDistanceKm": 200,
  "premiumPriceList": [...]
}
```

### 10.2 `PUT /admin/settings/app`

Update 1 phần các trường trên.

### 10.3 `GET /admin/settings/feature-flags`

### 10.4 `PUT /admin/settings/feature-flags/:key`

---

## 11. AI Suggestions log (MỚI)

### 11.1 `GET /admin/ai/suggestions?from=&to=&page=1`

**Response**
```json
{
  "items": [
    {
      "id": "ai-001",
      "conversationId": "linh",
      "userId": "uuid",
      "model": "gpt-4o-mini",
      "latencyMs": 820,
      "tokens": 312,
      "createdAt": "..."
    }
  ],
  "total": 5420
}
```

### 11.2 `GET /admin/ai/safety-flags?status=open&page=1`

User bị AI flag nội dung độc hại (khi gửi message có toxicity score > ngưỡng).

---

## 12. Summary Checklist cho backend

| Ưu tiên | Module | Endpoints |
|---------|--------|-----------|
| **P0** | Admin Auth | `POST /admin/auth/login`, `GET /admin/auth/me`, `POST /admin/auth/logout` |
| **P0** | Dashboard | `GET /admin/dashboard/overview` |
| **P0** | Users | `GET /admin/users`, `GET /admin/users/:id`, `PATCH /admin/users/:id/status`, `POST /admin/users/:id/revoke-sessions` |
| **P0** | Verifications | `GET /admin/verifications`, `POST /admin/verifications/:id/approve|reject` |
| **P1** | Reports | `GET /admin/reports`, `POST /admin/reports/:id/resolve|dismiss|assign` |
| **P1** | Events | Full CRUD `/admin/events` |
| **P1** | Photos moderation | `GET /admin/photos`, approve/reject |
| **P2** | Premium | `/admin/premium/plans`, `/admin/premium/subscribers` |
| **P2** | Interests | `/admin/interests` CRUD |
| **P2** | Audit log | `GET /admin/audit-log` |
| **P2** | App settings | `GET/PUT /admin/settings/app` |
| **P3** | AI log | `/admin/ai/suggestions`, `/admin/ai/safety-flags` |
| **P3** | Broadcast | `POST /admin/notifications/broadcast` |

---

## 13. Cấu trúc DB gợi ý

```sql
admins (id, email, password_hash, name, role, is_active, last_login_at, created_at)

audit_logs (id, admin_id, action, target_type, target_id, meta jsonb, ip, created_at)

reports (id, type, target_id, reporter_id, reason, description, status, assigned_to, resolved_by, resolved_at, created_at)

verifications_admin (id, user_id, type, photo_url, status, ai_score, ai_flags, decided_by, decided_at, created_at)

photo_moderation (id, photo_id, user_id, status, ai_score, flag_reason, decided_by, decided_at, created_at)

premium_plans (id, name, price_vnd, duration_days, features jsonb, is_active)

premium_subscribers (id, user_id, plan_id, started_at, expires_at, status, auto_renew)

interests (id, group_id, label, icon, active, created_at)
interest_groups (id, label, icon, order)

app_settings (key, value jsonb, updated_at, updated_by)

broadcast_notifications (id, title, body, target, send_at, status, sent_count, created_by)

ai_suggestion_logs (id, conversation_id, user_id, model, latency_ms, tokens, created_at)
ai_safety_flags (id, message_id, user_id, toxicity_score, status, reviewed_by, created_at)
```

---

*File đồng bộ với frontend Admin SameMess. Cập nhật khi thêm module mới.*
