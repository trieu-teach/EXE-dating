import { ADMIN_ENDPOINTS } from '../config.admin.js'
import { API_BASE_URL, USE_MOCK_API } from '../config.js'
import { withMockFallback } from '../http.js'
import { getAdminToken } from '../../utils/adminSession.js'

const ADMIN_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms))
}

// Tạo fetch riêng cho admin (token lấy từ adminSession)
async function adminFetch(path, options = {}) {
  const { body, headers: customHeaders, ...rest } = options
  const { API_BASE_URL, USE_MOCK_API } = await import('../config.js')
  const headers = {
    Accept: 'application/json',
    ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...customHeaders,
  }
  const token = getAdminToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const url = path.startsWith('http') ? path : `${ADMIN_BASE_URL}${path}`
  if (!ADMIN_BASE_URL) {
    throw new Error('Chưa cấu hình VITE_API_BASE_URL')
  }
  const res = await fetch(url, { ...rest, headers, body: body !== undefined ? JSON.stringify(body) : undefined })
  const text = await res.text()
  let data = null
  if (text) {
    try { data = JSON.parse(text) } catch { data = text }
  }
  if (!res.ok) {
    const message = (data && typeof data === 'object' && (data.message || data.error)) || `HTTP ${res.status}`
    const err = new Error(message)
    err.status = res.status
    err.code = data?.code
    err.details = data
    throw err
  }
  return data
}

export const adminAuthService = {
  async login({ email, password }) {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.auth.login, { method: 'POST', body: { email, password } }),
      async () => {
        await delay()
        const admin = {
          id: 'admin-1',
          email: email.trim().toLowerCase(),
          name: 'Admin Demo',
          role: 'super_admin',
          avatarUrl: 'https://i.pravatar.cc/150?img=68',
        }
        return { admin, token: 'mock-admin-token' }
      },
    )
  },
  async me() {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.auth.me),
      async () => {
        await delay(100)
        return { admin: { id: 'admin-1', name: 'Admin Demo', role: 'super_admin' } }
      },
    )
  },
  async logout() {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.auth.logout, { method: 'POST' }),
      async () => ({ success: true }),
    )
  },
  async permissions() {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.auth.permissions),
      async () => ({
        permissions: [
          'users.read', 'users.write', 'users.ban',
          'verifications.read', 'verifications.decide',
          'reports.read', 'reports.decide',
          'events.read', 'events.write',
          'premium.write', 'interests.write',
          'settings.write', 'audit.read',
        ],
      }),
    )
  },
}

export const adminDashboardService = {
  async overview() {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.dashboard.overview),
      async () => {
        await delay()
        return {
          users: { total: 12450, todayNew: 32, weekNew: 184, monthNew: 612, active24h: 2130, growthPercent: 8.4 },
          verifications: { pending: 14, approvedToday: 6, rejectedToday: 1 },
          matches: { total: 48720, today: 92, mutualToday: 38 },
          conversations: { active: 1240, messagesToday: 5630 },
          events: { upcoming: 4, registrationsToday: 18 },
          revenue: { monthVnd: 12450000, premiumSubscribers: 218 },
        }
      },
    )
  },
  async chart({ metric = 'users', range = '7d' } = {}) {
    return withMockFallback(
      () => adminFetch(`${ADMIN_ENDPOINTS.dashboard.chart}?metric=${metric}&range=${range}`),
      async () => {
        await delay(150)
        const days = range === '90d' ? 90 : range === '30d' ? 30 : 7
        const points = Array.from({ length: days }, (_, i) => {
          const d = new Date()
          d.setDate(d.getDate() - (days - 1 - i))
          const value = metric === 'users' ? 10 + Math.round(Math.random() * 30) : 80 + Math.round(Math.random() * 60)
          return { date: d.toISOString().slice(0, 10), value }
        })
        return { metric, range, points }
      },
    )
  },
}

export const adminUsersService = {
  async list(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return withMockFallback(
      () => adminFetch(`${ADMIN_ENDPOINTS.users.list}?${qs}`),
      async () => {
        await delay()
        const items = Array.from({ length: 12 }, (_, i) => ({
          id: `u-${1000 + i}`,
          name: ['Nguyễn Minh Anh', 'Trần Văn B', 'Lê Hoa', 'Phạm My', 'Đỗ Nam', 'Hoàng Yến', 'Vũ Linh', 'Bùi Đức', 'Đặng Thảo', 'Hồ Phương', 'Mai Khôi', 'Ngô Quỳnh'][i],
          email: `user${i + 1}@gmail.com`,
          username: `user_${1000 + i}`,
          avatarUrl: `https://i.pravatar.cc/150?img=${i + 5}`,
          age: 20 + (i % 15),
          gender: i % 2 ? 'female' : 'male',
          city: ['Hà Nội', 'TP. HCM', 'Đà Nẵng', 'Hải Phòng'][i % 4],
          status: i % 9 === 0 ? 'locked' : 'active',
          identityVerified: i % 3 !== 0,
          trustScore: i % 3 !== 0 ? 88 : 42,
          isPremium: i % 4 === 0,
          createdAt: '2025-04-12T08:00:00Z',
          lastActiveAt: '2025-05-22T10:12:00Z',
        }))
        return { items, total: 12450, page: 1, pageSize: 20 }
      },
    )
  },

  async detail(id) {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.users.detail(id)),
      async () => {
        await delay()
        return {
          id,
          name: 'Nguyễn Minh Anh',
          email: 'minhanh@gmail.com',
          username: 'minhanh_23',
          avatarUrl: 'https://i.pravatar.cc/150?img=47',
          age: 25,
          gender: 'female',
          city: 'Hà Nội',
          district: 'Cầu Giấy',
          bio: 'Thích cà phê và du lịch',
          photos: [
            { id: 'p1', url: 'https://i.pravatar.cc/400?img=47', order: 0 },
            { id: 'p2', url: 'https://i.pravatar.cc/400?img=48', order: 1 },
          ],
          interests: ['Cà phê', 'Du lịch', 'Yoga'],
          status: 'active',
          identityVerified: true,
          trustScore: 88,
          isPremium: true,
          createdAt: '2025-04-12T08:00:00Z',
          lastActiveAt: '2025-05-22T10:12:00Z',
          stats: { matchesCount: 28, conversationsCount: 6, reportsCount: 0, reportsAgainstCount: 1 },
          subscription: { planName: '6 tháng', expiresAt: '2025-11-12T00:00:00Z', status: 'active' },
        }
      },
    )
  },

  async updateStatus(id, payload) {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.users.status(id), { method: 'PATCH', body: payload }),
      async () => ({ success: true, status: payload.status }),
    )
  },

  async addNote(id, content) {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.users.note(id), { method: 'POST', body: { content } }),
      async () => ({ success: true, id: 'note-' + Date.now(), content, createdAt: new Date().toISOString() }),
    )
  },

  async getNotes(id) {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.users.notes(id)),
      async () => ({
        items: [
          { id: 'n1', adminName: 'Minh (super)', content: 'Đã liên hệ qua email hỗ trợ', createdAt: '2025-05-20T08:00:00Z' },
          { id: 'n2', adminName: 'An (mod)', content: 'User gửi ticket khiếu nại trust score', createdAt: '2025-05-18T03:12:00Z' },
        ],
      }),
    )
  },

  async resetPassword(id, newPassword) {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.users.resetPassword(id), { method: 'POST', body: { newPassword } }),
      async () => ({ success: true }),
    )
  },

  async revokeSessions(id) {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.users.revokeSessions(id), { method: 'POST' }),
      async () => ({ success: true }),
    )
  },

  async bulkAction(payload) {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.users.bulkAction, { method: 'POST', body: payload }),
      async () => ({ success: true, affected: payload.userIds.length }),
    )
  },
}

export const adminVerificationsService = {
  async list(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return withMockFallback(
      () => adminFetch(`${ADMIN_ENDPOINTS.verifications.list}?${qs}`),
      async () => {
        await delay()
        const items = Array.from({ length: 8 }, (_, i) => ({
          id: `vr-${1000 + i}`,
          user: {
            id: `u-${2000 + i}`,
            name: ['Trần Văn A', 'Lê B', 'Phạm C', 'Đỗ D', 'Hoàng E', 'Vũ F', 'Bùi G', 'Đặng H'][i],
            avatarUrl: `https://i.pravatar.cc/150?img=${i + 20}`,
          },
          type: 'face',
          photoUrl: `https://i.pravatar.cc/300?img=${i + 30}`,
          submittedAt: '2025-05-22T09:00:00Z',
          status: 'pending',
          aiScore: 0.7 + Math.random() * 0.25,
          aiFlags: i % 4 === 0 ? ['lighting_low'] : [],
        }))
        return { items, total: 14, pending: 14 }
      },
    )
  },
  async detail(id) {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.verifications.detail(id)),
      async () => {
        await delay()
        return {
          id,
          user: { id: 'u-2001', name: 'Trần Văn A', avatarUrl: 'https://i.pravatar.cc/150?img=25' },
          type: 'face',
          photoUrl: 'https://i.pravatar.cc/300?img=33',
          submittedAt: '2025-05-22T09:00:00Z',
          status: 'pending',
          aiScore: 0.88,
          aiFlags: [],
          history: [
            { action: 'submitted', at: '2025-05-22T09:00:00Z', by: 'user' },
          ],
        }
      },
    )
  },
  async approve(id, note = '') {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.verifications.approve(id), { method: 'POST', body: { note } }),
      async () => ({ success: true }),
    )
  },
  async reject(id, { reason, note }) {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.verifications.reject(id), { method: 'POST', body: { reason, note } }),
      async () => ({ success: true }),
    )
  },
}

export const adminReportsService = {
  async list(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return withMockFallback(
      () => adminFetch(`${ADMIN_ENDPOINTS.reports.list}?${qs}`),
      async () => {
        await delay()
        const items = Array.from({ length: 10 }, (_, i) => ({
          id: `rp-${1000 + i}`,
          type: ['user', 'photo', 'message'][i % 3],
          targetUser: {
            id: `u-${3000 + i}`,
            name: ['Lê Hoa', 'Ngô Quỳnh', 'Đặng Thảo', 'Vũ Linh', 'Bùi Đức', 'Phạm My', 'Hồ Phương', 'Mai Khôi', 'Trần Văn B', 'Hoàng Yến'][i],
            avatarUrl: `https://i.pravatar.cc/150?img=${i + 10}`,
          },
          reporter: { id: 'u-999', name: 'Ẩn danh' },
          reason: ['inappropriate', 'fake_profile', 'harassment', 'spam', 'other'][i % 5],
          description: 'Gửi ảnh không phù hợp trong cuộc trò chuyện.',
          status: ['new', 'in_review', 'resolved', 'resolved'][i % 4],
          createdAt: '2025-05-22T10:00:00Z',
          evidence: i % 2 === 0 ? ['https://i.pravatar.cc/300?img=51'] : [],
        }))
        return { items, total: 42 }
      },
    )
  },
  async detail(id) {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.reports.detail(id)),
      async () => ({ id, status: 'new', notes: [] }),
    )
  },
  async assign(id, adminId) {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.reports.assign(id), { method: 'POST', body: { adminId } }),
      async () => ({ success: true }),
    )
  },
  async resolve(id, payload) {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.reports.resolve(id), { method: 'POST', body: payload }),
      async () => ({ success: true }),
    )
  },
  async dismiss(id, note) {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.reports.dismiss(id), { method: 'POST', body: { note } }),
      async () => ({ success: true }),
    )
  },
}

export const adminEventsService = {
  async list(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return withMockFallback(
      () => adminFetch(`${ADMIN_ENDPOINTS.events.list}?${qs}`),
      async () => {
        await delay()
        const items = [
          { id: 'sunset-vineyard', title: 'Thưởng thức rượu vang hoàng hôn', category: 'dining', premiumOnly: true, date: '2025-08-24T16:00:00Z', location: 'Đà Lạt', capacity: 50, registered: 42, status: 'published', rewardCode: 'SAMEMESS50', trustScoreDelta: 10 },
          { id: 'workshop-pottery', title: 'Workshop gốm thủ công tại Quận 3', category: 'workshop', premiumOnly: false, date: '2025-08-30T14:00:00Z', location: 'TP. HCM', capacity: 30, registered: 18, status: 'published', rewardCode: 'POTTERY20', trustScoreDelta: 5 },
          { id: 'sunset-yoga', title: 'Yoga hoàng hôn bãi biển', category: 'outdoor', premiumOnly: false, date: '2025-09-02T17:00:00Z', location: 'Đà Nẵng', capacity: 25, registered: 8, status: 'draft', rewardCode: '', trustScoreDelta: 5 },
        ]
        return { items, total: items.length }
      },
    )
  },
  async detail(id) {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.events.detail(id)),
      async () => {
        await delay()
        return {
          id,
          title: 'Thưởng thức rượu vang hoàng hôn',
          category: 'dining',
          premiumOnly: true,
          date: '2025-08-24T16:00:00Z',
          time: '16:00 – 20:00',
          location: 'Thung lũng rượu vang Đà Lạt',
          address: 'Số 1, Đà Lạt, Lâm Đồng',
          capacity: 50,
          description: 'Workshop thưởng rượu vang cho couple...',
          image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
          status: 'published',
          rewardCode: 'SAMEMESS50',
          trustScoreDelta: 10,
        }
      },
    )
  },
  async create(payload) {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.events.create, { method: 'POST', body: payload }),
      async () => ({ success: true, id: 'evt-' + Date.now() }),
    )
  },
  async update(id, payload) {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.events.update(id), { method: 'PUT', body: payload }),
      async () => ({ success: true }),
    )
  },
  async remove(id) {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.events.remove(id), { method: 'DELETE' }),
      async () => ({ success: true }),
    )
  },
  async publish(id) {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.events.publish(id), { method: 'POST' }),
      async () => ({ success: true }),
    )
  },
  async registrations(id) {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.events.registrations(id)),
      async () => ({
        items: [
          { id: 'u-1', name: 'Lê Hoa', email: 'hoa@gmail.com', registeredAt: '2025-05-21T08:00:00Z' },
          { id: 'u-2', name: 'Phạm My', email: 'my@gmail.com', registeredAt: '2025-05-21T10:12:00Z' },
        ],
        total: 42,
      }),
    )
  },
}

export const adminPremiumService = {
  async listPlans() {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.premium.plans),
      async () => ({
        items: [
          { id: 'monthly', name: '1 tháng', priceVnd: 99000, durationDays: 30, isActive: true },
          { id: '6months', name: '6 tháng', priceVnd: 499000, durationDays: 180, isActive: true },
          { id: 'yearly', name: '12 tháng', priceVnd: 899000, durationDays: 365, isActive: true },
        ],
      }),
    )
  },
  async createPlan(payload) {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.premium.plans, { method: 'POST', body: payload }),
      async () => ({ success: true, id: 'plan-' + Date.now() }),
    )
  },
  async updatePlan(id, payload) {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.premium.plan(id), { method: 'PUT', body: payload }),
      async () => ({ success: true }),
    )
  },
  async removePlan(id) {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.premium.plan(id), { method: 'DELETE' }),
      async () => ({ success: true }),
    )
  },
  async listSubscribers(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return withMockFallback(
      () => adminFetch(`${ADMIN_ENDPOINTS.premium.subscribers}?${qs}`),
      async () => {
        await delay()
        const items = Array.from({ length: 8 }, (_, i) => ({
          id: `sub-${1000 + i}`,
          user: { id: `u-${4000 + i}`, name: `User ${i + 1}`, email: `user${i + 1}@gmail.com` },
          planName: ['1 tháng', '6 tháng', '12 tháng'][i % 3],
          priceVnd: [99000, 499000, 899000][i % 3],
          startedAt: '2025-05-01T00:00:00Z',
          expiresAt: '2025-08-01T00:00:00Z',
          status: i % 5 === 0 ? 'expired' : 'active',
          autoRenew: i % 2 === 0,
        }))
        return { items, total: 218 }
      },
    )
  },
}

export const adminInterestsService = {
  async list() {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.interests.list),
      async () => ({
        groups: [
          { id: 'sports', label: 'Thể thao', icon: '⚽', items: [
            { id: 'football', label: 'Bóng đá', active: true },
            { id: 'yoga', label: 'Yoga', active: true },
            { id: 'gym', label: 'Gym', active: true },
          ]},
          { id: 'food', label: 'Ẩm thực', icon: '🍜', items: [
            { id: 'coffee', label: 'Cà phê', active: true },
            { id: 'streetfood', label: 'Ăn vặt', active: true },
          ]},
          { id: 'travel', label: 'Du lịch', icon: '✈️', items: [
            { id: 'beach', label: 'Biển', active: true },
            { id: 'mountain', label: 'Núi', active: true },
          ]},
        ],
      }),
    )
  },
  async create(payload) {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.interests.create, { method: 'POST', body: payload }),
      async () => ({ success: true, id: 'int-' + Date.now() }),
    )
  },
  async update(id, payload) {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.interests.update(id), { method: 'PATCH', body: payload }),
      async () => ({ success: true }),
    )
  },
  async remove(id) {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.interests.remove(id), { method: 'DELETE' }),
      async () => ({ success: true }),
    )
  },
  async createGroup(payload) {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.interests.createGroup, { method: 'POST', body: payload }),
      async () => ({ success: true, id: 'g-' + Date.now() }),
    )
  },
}

export const adminSettingsService = {
  async getApp() {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.settings.app),
      async () => ({
        verificationRequired: false,
        verifiedOnlyDefault: true,
        globalMode: false,
        aiSuggestionsEnabled: true,
        trustScoreUnverified: 42,
        trustScoreVerified: 88,
        minAge: 18,
        maxDistanceKm: 200,
        featureFlags: {
          newChatThread: true,
          aiAssistant: true,
          safetyCheckin: true,
        },
      }),
    )
  },
  async updateApp(payload) {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.settings.app, { method: 'PUT', body: payload }),
      async () => ({ success: true }),
    )
  },
  async updateFeatureFlag(key, value) {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.settings.featureFlag(key), { method: 'PUT', body: { value } }),
      async () => ({ success: true }),
    )
  },
}

export const adminPhotosService = {
  async list(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return withMockFallback(
      () => adminFetch(`${ADMIN_ENDPOINTS.photos.list}?${qs}`),
      async () => {
        await delay()
        const items = Array.from({ length: 6 }, (_, i) => ({
          id: `ph-${2000 + i}`,
          userId: `u-${5000 + i}`,
          userName: ['Lê Hoa', 'Vũ Linh', 'Đặng Thảo', 'Phạm My', 'Hồ Phương', 'Mai Khôi'][i],
          url: `https://i.pravatar.cc/300?img=${i + 35}`,
          status: ['pending', 'flagged', 'pending', 'flagged', 'pending', 'flagged'][i],
          flagReason: i % 2 ? 'nsfw' : null,
          aiScore: 0.6 + Math.random() * 0.3,
          uploadedAt: '2025-05-22T08:00:00Z',
        }))
        return { items, total: 28 }
      },
    )
  },
  async approve(id) {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.photos.approve(id), { method: 'POST' }),
      async () => ({ success: true }),
    )
  },
  async reject(id, payload) {
    return withMockFallback(
      () => adminFetch(ADMIN_ENDPOINTS.photos.reject(id), { method: 'POST', body: payload }),
      async () => ({ success: true }),
    )
  },
}

export const adminAuditService = {
  async list(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return withMockFallback(
      () => adminFetch(`${ADMIN_ENDPOINTS.audit.log}?${qs}`),
      async () => {
        await delay()
        const items = Array.from({ length: 12 }, (_, i) => ({
          id: `log-${1000 + i}`,
          adminName: ['Minh (super)', 'An (mod)', 'Hà (support)'][i % 3],
          action: ['user.lock', 'user.unlock', 'verification.approve', 'verification.reject', 'report.resolve', 'event.publish', 'settings.update'][i % 7],
          targetType: ['user', 'verification', 'report', 'event', 'settings'][i % 5],
          targetId: `tgt-${i}`,
          ip: '10.0.0.' + (i + 1),
          createdAt: '2025-05-22T08:00:00Z',
        }))
        return { items, total: 1204 }
      },
    )
  },
}
