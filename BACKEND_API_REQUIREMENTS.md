# Backend API Requirements — SameMess Frontend

Document này ghi lại các API **chưa có trong config** mà frontend đã sử dụng. Đã/ghép được rồi → bỏ qua.

---

## ⚠️ Config hiện tại thiếu các section sau

### 1. Settings

Config hiện tại: **không có `settings:`**

```javascript
// src/api/config.js — THIẾU
settings: {
  security: '/api/settings/security',
  devices: '/api/settings/devices',
  discovery: '/api/settings/discovery',
  interests: '/api/settings/interests',
  changePassword: '/api/settings/password',
},
```

**Endpoints cần implement:**

| Method | Path | Mô tả |
|--------|------|--------|
| GET | `/api/settings/security` | Lấy cài đặt bảo mật |
| PUT | `/api/settings/security` | Cập nhật bảo mật |
| GET | `/api/settings/devices` | Danh sách thiết bị đã đăng nhập |
| GET | `/api/settings/discovery` | Cài đặt khám phá |
| PUT | `/api/settings/discovery` | Cập nhật cài đặt khám phá |
| GET | `/api/settings/interests` | Lấy interests đã chọn |
| PUT | `/api/settings/interests` | Cập nhật interests |
| PUT | `/api/settings/password` | Đổi mật khẩu |

---

### 2. Safety / PIN

Config hiện tại: **không có `safety:`**

```javascript
// src/api/config.js — THIẾU
safety: {
  settings: '/api/safety/settings',
  pin: '/api/safety/pin/setup',
  pinForgot: '/api/safety/pin/forgot',
  pinVerifyOtp: '/api/safety/pin/verify-otp',
  checkin: '/api/safety/checkin',
  emergency: '/api/safety/emergency',
},
```

**Endpoints cần implement:**

| Method | Path | Request | Response |
|--------|------|---------|----------|
| GET | `/api/safety/settings` | — | `{ pinEnabled, emergencyAlertEnabled, checkinEnabled }` |
| PUT | `/api/safety/settings` | `{ pinEnabled?, emergencyAlertEnabled?, checkinEnabled? }` | updated settings |
| POST | `/api/safety/pin/setup` | `{ pin: "1234" }` | `{ message }` |
| POST | `/api/safety/pin/forgot` | `{ channel: "email" \| "sms" }` | `{ message }` |
| POST | `/api/safety/pin/verify-otp` | `{ otp: "123456" }` | `{ success, tempToken? }` |
| POST | `/api/safety/checkin` | `{ status: "safe" \| "help" }` | `{ confirmed }` |
| GET | `/api/safety/emergency` | — | `{ emergencyContacts[], alertMessage }` |

---

### 3. Daily Connection

Config hiện tại: **không có `daily:`**

```javascript
// src/api/config.js — THIẾU
daily: {
  connection: '/api/daily/connection',
  complete: '/api/daily/complete',
},
```

**Endpoints cần implement:**

| Method | Path | Request | Response |
|--------|------|---------|----------|
| GET | `/api/daily/connection` | — | `{ quests[], totalXp, userXp }` |
| POST | `/api/daily/complete` | `{ questIds: string[] }` | `{ completed[], xpEarned, totalXp }` |

---

### 4. Connection Reminders

Config hiện tại: **không có `connection:`, `meetup:`**

```javascript
// src/api/config.js — THIẾU
connection: {
  reminders: '/api/connection/reminders',
  nudges: (conversationId) => `/api/connection/nudges/${conversationId}`,
  dismissNudge: (conversationId) => `/api/connection/nudges/${conversationId}/dismiss`,
  proposeMeetup: (conversationId) => `/api/connection/meetup/${conversationId}/propose`,
},
meetup: {
  nearby: (partnerId) => `/api/meetup/nearby/${partnerId}`,
},
```

**Endpoints cần implement:**

| Method | Path | Request | Response |
|--------|------|---------|----------|
| GET | `/api/connection/reminders` | — | `ReminderDto[]` |
| GET | `/api/connection/nudges/{conversationId}` | — | `NudgeDto[]` |
| POST | `/api/connection/nudges/{conversationId}/dismiss` | `{ nudgeId }` | `{}` |
| POST | `/api/connection/meetup/{conversationId}/propose` | `{ venueId, proposedAt, note? }` | `{ meetupId, status }` |
| GET | `/api/meetup/nearby/{partnerId}` | — | `VenueDto[]` |

---

### 5. Events

Config hiện tại: **không có `events:`**

```javascript
// src/api/config.js — THIẾU
events: {
  list: '/api/events',
  detail: (eventId) => `/api/events/${eventId}`,
  register: (eventId) => `/api/events/${eventId}/register`,
  history: '/api/events/history',
  reward: '/api/events/reward',
},
```

**Endpoints cần implement:**

| Method | Path | Request | Response |
|--------|------|---------|----------|
| GET | `/api/events` | — | `EventDto[]` |
| GET | `/api/events/{eventId}` | — | `EventDto` (full detail) |
| POST | `/api/events/{eventId}/register` | — | `{ registrationId, status }` |
| GET | `/api/events/history` | — | `EventHistoryDto[]` |
| GET | `/api/events/reward?eventId=` | — | `{ xp, badge }` |

---

### 6. Search

Config hiện tại: **không có `search:`**

```javascript
// src/api/config.js — THIẾU
search: {
  filters: '/api/search/filters',
  results: '/api/search/results',
},
```

**Endpoints cần implement:**

| Method | Path | Query Params | Response |
|--------|------|--------------|----------|
| GET | `/api/search/filters` | — | `{ interests[], cities[], genders[], personalities[] }` |
| GET | `/api/search/results` | `gender, city, minAge, maxAge, interests, distanceKm, sort` | `DiscoveryProfileDto[]` |

---

### 7. Admin — Full Endpoints

Config hiện tại: **chỉ có 4 endpoints, cần thêm ~35 endpoints**

```javascript
// src/api/config.js — HIỆN CÓ (chỉ 4 cái)
admin: {
  reports: '/api/admin/reports',
  reportUpdate: (id) => `/api/admin/reports/${id}`,
  verifications: '/api/admin/verifications',
  verificationReview: (userId) => `/api/admin/verifications/${userId}`,
},

// CẦN THÊM — split thành nhiều sub-keys cho rõ ràng
admin: {
  dashboard: '/api/admin/dashboard',
  chart: '/api/admin/charts',
  users: '/api/admin/users',
  userDetail: (id) => `/api/admin/users/${id}`,
  userStatus: (id) => `/api/admin/users/${id}/status`,
  userNotes: (id) => `/api/admin/users/${id}/notes`,
  userResetPassword: (id) => `/api/admin/users/${id}/reset-password`,
  userRevokeSessions: (id) => `/api/admin/users/${id}/revoke-sessions`,
  usersBulkAction: '/api/admin/users/bulk-action',
  verifications: '/api/admin/verifications',
  verificationDetail: (id) => `/api/admin/verifications/${id}`,
  verificationApprove: (id) => `/api/admin/verifications/${id}/approve`,
  verificationReject: (id) => `/api/admin/verifications/${id}/reject',
  reports: '/api/admin/reports',
  reportDetail: (id) => `/api/admin/reports/${id}`,
  reportAssign: (id) => `/api/admin/reports/${id}/assign`,
  reportResolve: (id) => `/api/admin/reports/${id}/resolve`,
  reportDismiss: (id) => `/api/admin/reports/${id}/dismiss',
  events: '/api/admin/events',
  eventDetail: (id) => `/api/admin/events/${id}`,
  eventPublish: (id) => `/api/admin/events/${id}/publish`,
  eventUnpublish: (id) => `/api/admin/events/${id}/unpublish',
  eventRegistrations: (id) => `/api/admin/events/${id}/registrations`,
  premiumPlans: '/api/admin/plans',
  premiumPlan: (id) => `/api/admin/plans/${id}`,
  premiumSubscribers: '/api/admin/subscribers',
  interests: '/api/admin/interests',
  interest: (id) => `/api/admin/interests/${id}`,
  interestGroups: '/api/admin/interest-groups',
  settings: '/api/admin/settings',
  featureFlag: (key) => `/api/admin/feature-flags/${key}`,
  photos: '/api/admin/photos',
  photoApprove: (id) => `/api/admin/photos/${id}/approve`,
  photoReject: (id) => `/api/admin/photos/${id}/reject`,
  audit: '/api/admin/audit',
},
```

**Admin Endpoints cần implement:**

#### Dashboard
| Method | Path | Response |
|--------|------|----------|
| GET | `/api/admin/dashboard` | overview stats |
| GET | `/api/admin/charts?from=&to=&type=` | chart data |

#### Users
| Method | Path | Request | Response |
|--------|------|---------|----------|
| GET | `/api/admin/users?page=&search=&status=` | — | paginated users |
| GET | `/api/admin/users/{userId}` | — | user detail |
| PATCH | `/api/admin/users/{userId}/status` | `{ status }` | updated |
| POST | `/api/admin/users/{userId}/notes` | `{ content }` | note |
| GET | `/api/admin/users/{userId}/notes` | — | notes[] |
| POST | `/api/admin/users/{userId}/reset-password` | `{ newPassword }` | success |
| POST | `/api/admin/users/{userId}/revoke-sessions` | — | success |
| POST | `/api/admin/users/bulk-action` | `{ action, userIds[] }` | result |

#### Verifications
| Method | Path | Request | Response |
|--------|------|---------|----------|
| GET | `/api/admin/verifications?status=pending` | — | list |
| GET | `/api/admin/verifications/{userId}` | — | detail |
| POST | `/api/admin/verifications/{userId}/approve` | `{ note? }` | success |
| POST | `/api/admin/verifications/{userId}/reject` | `{ reason, note? }` | success |

#### Reports
| Method | Path | Request | Response |
|--------|------|---------|----------|
| GET | `/api/admin/reports?status=pending` | — | list |
| GET | `/api/admin/reports/{reportId}` | — | detail |
| POST | `/api/admin/reports/{reportId}/assign` | `{ adminId }` | success |
| POST | `/api/admin/reports/{reportId}/resolve` | `{ action, note? }` | resolved |
| POST | `/api/admin/reports/{reportId}/dismiss` | `{ note }` | dismissed |

#### Events
| Method | Path | Request | Response |
|--------|------|---------|----------|
| GET | `/api/admin/events` | — | list |
| GET | `/api/admin/events/{eventId}` | — | detail |
| POST | `/api/admin/events` | `EventPayload` | created |
| PUT | `/api/admin/events/{eventId}` | `EventPayload` | updated |
| DELETE | `/api/admin/events/{eventId}` | — | 204 |
| POST | `/api/admin/events/{eventId}/publish` | — | published |
| POST | `/api/admin/events/{eventId}/unpublish` | — | unpublished |
| GET | `/api/admin/events/{eventId}/registrations` | — | registrations[] |

#### Premium Plans
| Method | Path | Request | Response |
|--------|------|---------|----------|
| GET | `/api/admin/plans` | — | plans[] |
| POST | `/api/admin/plans` | `PlanPayload` | created |
| PUT | `/api/admin/plans/{planId}` | `PlanPayload` | updated |
| DELETE | `/api/admin/plans/{planId}` | — | 204 |
| GET | `/api/admin/subscribers?planId=&status=` | — | subscribers[] |

#### Interests
| Method | Path | Request | Response |
|--------|------|---------|----------|
| GET | `/api/admin/interests` | — | list |
| POST | `/api/admin/interests` | payload | created |
| PATCH | `/api/admin/interests/{interestId}` | payload | updated |
| DELETE | `/api/admin/interests/{interestId}` | — | 204 |
| POST | `/api/admin/interest-groups` | payload | created |

#### Settings
| Method | Path | Request | Response |
|--------|------|---------|----------|
| GET | `/api/admin/settings` | — | settings |
| PUT | `/api/admin/settings` | payload | updated |
| PUT | `/api/admin/feature-flags/{key}` | `{ value }` | updated |

#### Photos
| Method | Path | Request | Response |
|--------|------|---------|----------|
| GET | `/api/admin/photos?status=pending` | — | list |
| POST | `/api/admin/photos/{photoId}/approve` | — | approved |
| POST | `/api/admin/photos/{photoId}/reject` | `{ reason }` | rejected |

#### Audit
| Method | Path | Response |
|--------|------|----------|
| GET | `/api/admin/audit?page=&action=&userId=` | audit log |

---

## ✅ Đã có trong config — KHÔNG cần thêm

| Section | Status |
|---------|--------|
| `auth` | ✅ đầy đủ (6 endpoints) |
| `profile` | ✅ đầy đủ (10 endpoints) |
| `preferences` | ✅ đầy đủ (2 endpoints) |
| `swipes` | ✅ đầy đủ (4 endpoints) |
| `discovery` | ✅ đầy đủ (1 endpoint) |
| `matches` | ✅ đầy đủ (2 endpoints) |
| `chat` | ✅ đầy đủ (5 endpoints) |
| `notifications` | ✅ đầy đủ (5 endpoints) |
| `reputation` | ✅ đầy đủ (1 endpoint) |
| `subscription` | ✅ đầy đủ (4 endpoints) |
| `premium` | ✅ chỉ có `subscribe`, thiếu `plans` |
| `dates` | ✅ đầy đủ (1 endpoint) |
| `gamification` | ✅ đầy đủ (2 endpoints) |
| `plants` | ✅ đầy đủ (3 endpoints) |
| `loveTree` | ✅ đầy đủ (3 endpoints) |
| `ai` | ✅ đầy đủ (2 endpoints) |
| `block` | ✅ đầy đủ (3 endpoints) |
| `report` | ✅ đầy đủ (1 endpoint) |

---

## Summary — Cần thêm vào config.js

```javascript
// Thiếu hoàn toàn:
settings: { security, devices, discovery, interests, changePassword }
safety: { settings, pin, pinForgot, pinVerifyOtp, checkin, emergency }
daily: { connection, complete }
connection: { reminders, nudges, dismissNudge, proposeMeetup }
meetup: { nearby }
events: { list, detail, register, history, reward }
search: { filters, results }

// Admin — cần mở rộng từ 4 endpoints lên ~40 endpoints
```
