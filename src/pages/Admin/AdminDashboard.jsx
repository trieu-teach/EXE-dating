import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminService } from '../../api'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { resolveImageUrl, toDate } from '../../utils/format.js'
import './AdminDashboard.css'

const vnd = (n) => (n ?? 0).toLocaleString('vi-VN') + 'đ'

// Khoảng offline đọc được từ lastActiveAt (UTC). Trả về chuỗi "x phút/giờ/ngày".
function offlineFor(lastActiveAt) {
  if (!lastActiveAt) return 'chưa từng hoạt động'
  const diff = Date.now() - toDate(lastActiveAt).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'vừa xong'
  if (m < 60) return `${m} phút`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} giờ ${m % 60} phút`
  const d = Math.floor(h / 24)
  return `${d} ngày`
}
const CATEGORIES = ['cafe', 'restaurant', 'cinema', 'park', 'bar', 'dessert']

const NAV = [
  { key: 'overview', label: '📊 Tổng quan' },
  { key: 'users', label: '👥 Người dùng' },
  { key: 'verify', label: '🛡️ Xác minh ảnh' },
  { key: 'venues', label: '📍 Quán gợi ý' },
  { key: 'combos', label: '🎟️ Combo / Voucher' },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const toast = useToast()
  const [section, setSection] = useState('overview')

  const [stats, setStats] = useState(null)
  const [chart, setChart] = useState([])
  const [chartType, setChartType] = useState('signups')
  const [verifs, setVerifs] = useState([])
  const [venues, setVenues] = useState([])
  const [combos, setCombos] = useState([])
  const [users, setUsers] = useState([])
  const [userSearch, setUserSearch] = useState('')
  const [banTarget, setBanTarget] = useState(null)
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(null)

  const isAdmin = user?.role === 'Admin'

  const loadOverview = useCallback(() => {
    setLoading(true)
    adminService.dashboard().then(setStats).catch((e) => toast.error(e?.message || 'Lỗi tải dashboard')).finally(() => setLoading(false))
  }, [toast])

  // Biểu đồ theo loại
  useEffect(() => {
    if (!isAdmin || section !== 'overview') return
    adminService.charts(chartType)
      .then((d) => setChart(Array.isArray(d) ? d : (d?.items ?? [])))
      .catch(() => setChart([]))
  }, [chartType, section, isAdmin]) // eslint-disable-line
  const loadVerifs = useCallback(() => {
    setLoading(true)
    adminService.verifications().then((d) => setVerifs(Array.isArray(d) ? d : (d?.items ?? []))).catch(() => {}).finally(() => setLoading(false))
  }, [])
  const loadVenues = useCallback(() => {
    setLoading(true)
    adminService.venues().then((d) => setVenues(Array.isArray(d) ? d : (d?.items ?? []))).catch(() => {}).finally(() => setLoading(false))
  }, [])
  const loadCombos = useCallback(() => {
    setLoading(true)
    adminService.combos().then((d) => setCombos(Array.isArray(d) ? d : (d?.items ?? []))).catch(() => {}).finally(() => setLoading(false))
  }, [])
  const loadUsers = useCallback((search = '') => {
    setLoading(true)
    adminService.users({ search })
      .then((d) => setUsers(Array.isArray(d) ? d : (d?.items ?? [])))
      .catch((e) => toast.error(e?.message || 'Lỗi tải người dùng'))
      .finally(() => setLoading(false))
  }, [toast])

  const confirmBan = async () => {
    const u = banTarget
    if (!u) return
    setBusy(u.id)
    try {
      await adminService.banUser(u.id)
      setUsers((cur) => cur.map((x) => (x.id === u.id ? { ...x, status: 'Banned' } : x)))
      toast.success('Đã cấm người dùng.')
      setBanTarget(null)
    } catch (e) { toast.error(e?.message || 'Cấm thất bại.') }
    finally { setBusy(null) }
  }

  useEffect(() => {
    if (!isAdmin) return
    if (section === 'overview') loadOverview()
    if (section === 'users') loadUsers()
    if (section === 'verify') loadVerifs()
    if (section === 'venues') loadVenues()
    if (section === 'combos') { loadCombos(); if (venues.length === 0) adminService.venues().then((d) => setVenues(Array.isArray(d) ? d : (d?.items ?? []))).catch(() => {}) }
  }, [section, isAdmin]) // eslint-disable-line

  if (!isAdmin) {
    return (
      <div className="admin-denied">
        <h2>⛔ Không có quyền truy cập</h2>
        <p>Trang này chỉ dành cho quản trị viên.</p>
        <button className="btn btn-primary" onClick={() => navigate('/discovery')}>Về trang chính</button>
      </div>
    )
  }

  // ── Verify actions ──
  const review = async (uid, approve) => {
    setBusy(uid)
    try {
      await (approve ? adminService.approveVerification(uid) : adminService.rejectVerification(uid))
      toast.success(approve ? 'Đã duyệt xác minh ✅' : 'Đã từ chối.')
      setVerifs((cur) => cur.filter((v) => v.userId !== uid))
    } catch (e) { toast.error(e?.message || 'Lỗi') } finally { setBusy(null) }
  }

  return (
    <div className="admin-root">
      <aside className="admin-sidebar">
        <div className="admin-brand">SameMess <span>Admin</span></div>
        {NAV.map((n) => (
          <button key={n.key} className={`admin-nav${section === n.key ? ' is-active' : ''}`} onClick={() => setSection(n.key)}>
            {n.label}
          </button>
        ))}
        <button className="admin-nav admin-nav-exit" onClick={async () => { await logout(); navigate('/login', { replace: true }) }}>⎋ Đăng xuất</button>
      </aside>

      <main className="admin-main">
        {/* Header bar */}
        <header className="admin-topbar">
          <div>
            <div className="admin-topbar-title">{NAV.find((n) => n.key === section)?.label.replace(/^\S+\s/, '') || 'Tổng quan'}</div>
            <div className="admin-topbar-sub">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
          </div>
          <div className="admin-topbar-user">
            <div className="admin-topbar-avatar">{(user?.displayName || 'A').charAt(0).toUpperCase()}</div>
            <div>
              <div className="admin-topbar-name">{user?.displayName || 'Admin'}</div>
              <div className="admin-topbar-role">Quản trị viên</div>
            </div>
          </div>
        </header>

        {loading && <div className="admin-loading"><span className="spinner" /></div>}

        {/* ── TỔNG QUAN ── */}
        {section === 'overview' && stats && (
          <>
            <div className="admin-kpi-row">
              <KpiCard icon="💰" accent="pink" label="Tổng doanh thu" value={vnd(stats.totalRevenueVnd)} sub="Gói + hoa hồng voucher" />
              <KpiCard icon="💎" accent="purple" label="Doanh thu bán gói" value={vnd(stats.revenueVnd)} sub={`${stats.activeSubscriptions} gói đang hoạt động`} />
              <KpiCard icon="🎟️" accent="gold" label="Hoa hồng voucher" value={vnd(stats.voucherCommissionVnd)} sub={`GMV ${vnd(stats.voucherGmvVnd)} · ${stats.voucherOrders} đơn`} />
              <KpiCard icon="👥" accent="blue" label="Tổng người dùng" value={stats.totalUsers} sub={`+${stats.newUsersToday} hôm nay`} />
            </div>

            <div className="admin-row2">
              {/* Chart */}
              <div className="admin-card admin-chart-card">
                <div className="admin-card-head">
                  <h3>Xu hướng 30 ngày</h3>
                  <div className="admin-chart-tabs">
                    {[['signups', 'Đăng ký'], ['matches', 'Match'], ['revenue', 'Doanh thu']].map(([k, l]) => (
                      <button key={k} className={`admin-chart-tab${chartType === k ? ' is-active' : ''}`} onClick={() => setChartType(k)}>{l}</button>
                    ))}
                  </div>
                </div>
                <AreaChart points={chart} money={chartType === 'revenue'} />
              </div>

              {/* Revenue breakdown */}
              <div className="admin-card">
                <div className="admin-card-head"><h3>Cơ cấu doanh thu</h3></div>
                <RevenueBreakdown subscription={stats.revenueVnd} commission={stats.voucherCommissionVnd} />
              </div>
            </div>

            <h2 className="admin-h2">Người dùng & hoạt động</h2>
            <div className="admin-grid">
              <StatCard icon="👤" label="Tổng user" value={stats.totalUsers} />
              <StatCard icon="🟢" label="Đang hoạt động" value={stats.activeUsers} />
              <StatCard icon="🚫" label="Bị khoá" value={stats.bannedUsers} />
              <StatCard icon="🆕" label="Mới hôm nay" value={stats.newUsersToday} />
              <StatCard icon="📅" label="Mới 7 ngày" value={stats.newUsers7Days} />
              <StatCard icon="💞" label="Tổng match" value={stats.totalMatches} />
              <StatCard icon="🛡️" label="Chờ xác minh" value={stats.pendingVerifications} warn={stats.pendingVerifications > 0} />
              <StatCard icon="🚩" label="Báo cáo chờ" value={stats.pendingReports} warn={stats.pendingReports > 0} />
            </div>
          </>
        )}

        {/* ── XÁC MINH ── */}
        {section === 'users' && (
          <>
            <h1 className="admin-h1">Quản lý người dùng</h1>
            <p className="admin-note">Cấm người vi phạm. Lần đăng nhập tới họ sẽ thấy thông báo bị cấm và bị xoá vĩnh viễn khi bấm Thoát.</p>
            <form className="admin-user-search" onSubmit={(e) => { e.preventDefault(); loadUsers(userSearch) }}>
              <input placeholder="Tìm theo tên / email…" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
              <button type="submit" className="btn btn-ghost btn-sm">Tìm</button>
            </form>
            {users.length === 0 ? (
              <div className="admin-empty">Không có người dùng.</div>
            ) : (
              <div className="admin-user-table">
                {users.map((u) => (
                  <div key={u.id} className={`admin-user-row${u.status === 'Banned' ? ' is-banned' : ''}`}>
                    <div className="admin-user-info">
                      <div className="admin-user-name">
                        {u.displayName || '(chưa đặt tên)'}
                        {u.role === 'Admin' && <span className="admin-user-tag admin-tag-role">Admin</span>}
                        <span className={`admin-user-tag ${u.status === 'Banned' ? 'admin-tag-banned' : 'admin-tag-active'}`}>
                          {u.status === 'Banned' ? 'Đã cấm' : u.status === 'Active' ? 'Hoạt động' : u.status}
                        </span>
                      </div>
                      <div className="admin-user-email">{u.email}</div>
                      <div className={`admin-user-presence${u.isOnline ? ' is-online' : ''}`}>
                        <span className="admin-presence-dot" />
                        {u.isOnline ? 'Đang hoạt động' : `Offline ${offlineFor(u.lastActiveAt)}`}
                      </div>
                    </div>
                    <div className="admin-user-actions">
                      {u.role !== 'Admin' && u.status !== 'Banned' && (
                        <button className="btn btn-danger btn-sm" disabled={busy === u.id} onClick={() => setBanTarget(u)}>
                          {busy === u.id ? <span className="spinner" /> : 'Cấm'}
                        </button>
                      )}
                      {u.status === 'Banned' && <span className="admin-user-banned-note">Chờ xoá vĩnh viễn</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {section === 'verify' && (
          <>
            <h1 className="admin-h1">Duyệt xác minh khuôn mặt</h1>
            <p className="admin-note">So sánh ảnh selfie với ảnh hồ sơ. Duyệt nếu là cùng một người.</p>
            {verifs.length === 0 ? (
              <div className="admin-empty">Không có hồ sơ nào chờ duyệt 🎉</div>
            ) : (
              <div className="admin-verify-grid">
                {verifs.map((v) => (
                  <div key={v.userId} className="admin-verify-card">
                    <div className="admin-verify-imgs">
                      <figure>
                        <div className="admin-verify-img" style={v.selfieUrl ? { backgroundImage: `url(${resolveImageUrl(v.selfieUrl)})` } : undefined} />
                        <figcaption>Selfie xác minh</figcaption>
                      </figure>
                      <figure>
                        <div className="admin-verify-img" style={v.profilePhotoUrl ? { backgroundImage: `url(${resolveImageUrl(v.profilePhotoUrl)})` } : undefined} />
                        <figcaption>Ảnh hồ sơ</figcaption>
                      </figure>
                    </div>
                    <div className="admin-verify-name">{v.displayName}</div>
                    <div className="admin-verify-actions">
                      <button className="btn btn-primary btn-sm" disabled={busy === v.userId} onClick={() => review(v.userId, true)}>✓ Duyệt</button>
                      <button className="btn btn-ghost btn-sm" disabled={busy === v.userId} onClick={() => review(v.userId, false)}>✕ Từ chối</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── QUÁN ── */}
        {section === 'venues' && (
          <VenuesSection venues={venues} onReload={loadVenues} toast={toast} busy={busy} setBusy={setBusy} />
        )}

        {/* ── COMBO ── */}
        {section === 'combos' && (
          <CombosSection combos={combos} venues={venues} onReload={loadCombos} toast={toast} busy={busy} setBusy={setBusy} />
        )}
      </main>

      {/* Popup xác nhận cấm */}
      {banTarget && (
        <div className="admin-modal-backdrop" onClick={() => busy !== banTarget.id && setBanTarget(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-icon">🚫</div>
            <div className="admin-modal-title">Cấm {banTarget.displayName || banTarget.email}?</div>
            <p className="admin-modal-text">
              Lần đăng nhập tới, người này sẽ thấy thông báo bị cấm và bị
              {' '}<strong>xoá vĩnh viễn toàn bộ dữ liệu</strong> khi bấm Thoát. Không thể hoàn tác.
            </p>
            <div className="admin-modal-actions">
              <button className="btn btn-ghost btn-sm" disabled={busy === banTarget.id} onClick={() => setBanTarget(null)}>Huỷ</button>
              <button className="btn btn-danger btn-sm" disabled={busy === banTarget.id} onClick={confirmBan}>
                {busy === banTarget.id ? <span className="spinner" /> : 'Cấm người dùng'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, sub, accent, warn, icon }) {
  return (
    <div className={`admin-stat${accent ? ` accent-${accent}` : ''}${warn ? ' is-warn' : ''}`}>
      {icon && <span className="admin-stat-icon">{icon}</span>}
      <div className="admin-stat-value">{value}</div>
      <div className="admin-stat-label">{label}</div>
      {sub && <div className="admin-stat-sub">{sub}</div>}
    </div>
  )
}

function KpiCard({ icon, label, value, sub, accent }) {
  return (
    <div className={`admin-kpi accent-${accent}`}>
      <div className="admin-kpi-icon">{icon}</div>
      <div className="admin-kpi-body">
        <div className="admin-kpi-label">{label}</div>
        <div className="admin-kpi-value">{value}</div>
        {sub && <div className="admin-kpi-sub">{sub}</div>}
      </div>
    </div>
  )
}

// Biểu đồ vùng (SVG, không cần thư viện)
function AreaChart({ points, money }) {
  const data = points || []
  if (data.length === 0) return <div className="admin-chart-empty">Chưa có dữ liệu</div>
  const W = 640, H = 200, P = 8
  const vals = data.map((d) => Number(d.value) || 0)
  const max = Math.max(1, ...vals)
  const stepX = (W - P * 2) / Math.max(1, data.length - 1)
  const x = (i) => P + i * stepX
  const y = (v) => H - P - (v / max) * (H - P * 2)
  const line = vals.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const area = `${line} L${x(vals.length - 1).toFixed(1)},${H - P} L${x(0).toFixed(1)},${H - P} Z`
  const total = vals.reduce((a, b) => a + b, 0)
  return (
    <div className="admin-chart">
      <div className="admin-chart-total">{money ? total.toLocaleString('vi-VN') + 'đ' : total} <span>tổng 30 ngày</span></div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="admin-chart-svg">
        <defs>
          <linearGradient id="adgrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,79,139,0.35)" />
            <stop offset="100%" stopColor="rgba(255,79,139,0)" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#adgrad)" />
        <path d={line} fill="none" stroke="#ff4f8b" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </div>
  )
}

function RevenueBreakdown({ subscription, commission }) {
  const total = (subscription || 0) + (commission || 0)
  const pct = (v) => total > 0 ? Math.round((v / total) * 100) : 0
  return (
    <div className="admin-breakdown">
      <div className="admin-bd-donut" style={{ background: `conic-gradient(var(--color-accent) 0 ${pct(subscription)}%, #f5a623 ${pct(subscription)}% 100%)` }}>
        <div className="admin-bd-center"><span>{vnd(total)}</span><small>tổng</small></div>
      </div>
      <div className="admin-bd-legend">
        <div className="admin-bd-item"><span className="admin-bd-dot" style={{ background: 'var(--color-accent)' }} /> Bán gói · <b>{pct(subscription)}%</b> · {vnd(subscription)}</div>
        <div className="admin-bd-item"><span className="admin-bd-dot" style={{ background: '#f5a623' }} /> Hoa hồng voucher · <b>{pct(commission)}%</b> · {vnd(commission)}</div>
      </div>
    </div>
  )
}

function VenuesSection({ venues, onReload, toast, busy, setBusy }) {
  const [form, setForm] = useState({ name: '', category: 'cafe', address: '', latitude: 10.7769, longitude: 106.7009, imageUrl: '', priceRange: '$$', description: '' })
  const [adding, setAdding] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setAdding(true)
    try {
      await adminService.createVenue({ ...form, latitude: Number(form.latitude), longitude: Number(form.longitude), city: 'TP.HCM', isActive: true })
      toast.success('Đã thêm quán.')
      setForm({ ...form, name: '', address: '', imageUrl: '', description: '' })
      onReload()
    } catch (err) { toast.error(err?.message || 'Lỗi thêm quán.') } finally { setAdding(false) }
  }
  const remove = async (id) => {
    if (!confirm('Xoá quán này?')) return
    setBusy(id)
    try { await adminService.deleteVenue(id); toast.success('Đã xoá.'); onReload() }
    catch (err) { toast.error(err?.message || 'Lỗi') } finally { setBusy(null) }
  }
  return (
    <>
      <h1 className="admin-h1">Quán gợi ý hẹn hò</h1>
      <form className="admin-form" onSubmit={submit}>
        <div className="admin-form-title">+ Thêm quán</div>
        <div className="admin-form-grid">
          <input required placeholder="Tên quán" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input placeholder="Địa chỉ" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <select value={form.priceRange} onChange={(e) => setForm({ ...form, priceRange: e.target.value })}>
            <option value="$">$</option><option value="$$">$$</option><option value="$$$">$$$</option>
          </select>
          <input type="number" step="0.0001" placeholder="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
          <input type="number" step="0.0001" placeholder="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
          <input placeholder="Link ảnh (URL)" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} style={{ gridColumn: '1 / -1' }} />
          <input placeholder="Mô tả" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ gridColumn: '1 / -1' }} />
        </div>
        <button className="btn btn-primary" disabled={adding}>{adding ? <span className="spinner" /> : 'Thêm quán'}</button>
      </form>

      <div className="admin-list">
        {venues.map((v) => (
          <div key={v.id} className="admin-row">
            <div className="admin-row-img" style={v.imageUrl ? { backgroundImage: `url(${resolveImageUrl(v.imageUrl)})` } : undefined} />
            <div className="admin-row-main">
              <div className="admin-row-title">{v.name} <span className="admin-tag">{v.category}</span></div>
              <div className="admin-row-sub">{v.address || '—'} · {v.priceRange || ''}</div>
            </div>
            <button className="admin-del" disabled={busy === v.id} onClick={() => remove(v.id)}>Xoá</button>
          </div>
        ))}
      </div>
    </>
  )
}

function CombosSection({ combos, venues, onReload, toast, busy, setBusy }) {
  const [form, setForm] = useState({ venueId: '', title: '', description: '', originalPriceVnd: 150000, salePriceVnd: 99000, commissionPercent: 15 })
  const [adding, setAdding] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    if (!form.venueId) { toast.warn('Chọn quán.'); return }
    setAdding(true)
    try {
      await adminService.createCombo({
        venueId: form.venueId, title: form.title, description: form.description,
        originalPriceVnd: Number(form.originalPriceVnd), salePriceVnd: Number(form.salePriceVnd),
        commissionPercent: Number(form.commissionPercent), isActive: true,
      })
      toast.success('Đã thêm combo.')
      setForm({ ...form, title: '', description: '' })
      onReload()
    } catch (err) { toast.error(err?.message || 'Lỗi thêm combo.') } finally { setAdding(false) }
  }
  const remove = async (id) => {
    if (!confirm('Xoá combo này?')) return
    setBusy(id)
    try { await adminService.deleteCombo(id); toast.success('Đã xoá.'); onReload() }
    catch (err) { toast.error(err?.message || 'Lỗi') } finally { setBusy(null) }
  }
  return (
    <>
      <h1 className="admin-h1">Combo / Voucher</h1>
      <form className="admin-form" onSubmit={submit}>
        <div className="admin-form-title">+ Thêm combo</div>
        <div className="admin-form-grid">
          <select required value={form.venueId} onChange={(e) => setForm({ ...form, venueId: e.target.value })} style={{ gridColumn: '1 / -1' }}>
            <option value="">— Chọn quán —</option>
            {venues.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          <input required placeholder="Tên combo" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ gridColumn: '1 / -1' }} />
          <input placeholder="Mô tả (gồm những gì)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ gridColumn: '1 / -1' }} />
          <input type="number" placeholder="Giá gốc (đ)" value={form.originalPriceVnd} onChange={(e) => setForm({ ...form, originalPriceVnd: e.target.value })} />
          <input type="number" placeholder="Giá ưu đãi (đ)" value={form.salePriceVnd} onChange={(e) => setForm({ ...form, salePriceVnd: e.target.value })} />
          <input type="number" placeholder="Hoa hồng %" value={form.commissionPercent} onChange={(e) => setForm({ ...form, commissionPercent: e.target.value })} />
        </div>
        <button className="btn btn-primary" disabled={adding}>{adding ? <span className="spinner" /> : 'Thêm combo'}</button>
      </form>

      <div className="admin-list">
        {combos.map((c) => (
          <div key={c.id} className="admin-row">
            <div className="admin-row-img" style={c.venueImageUrl ? { backgroundImage: `url(${resolveImageUrl(c.venueImageUrl)})` } : undefined} />
            <div className="admin-row-main">
              <div className="admin-row-title">{c.title} <span className="admin-tag">{c.venueName}</span></div>
              <div className="admin-row-sub">{vnd(c.salePriceVnd)} <s>{vnd(c.originalPriceVnd)}</s> · HH {c.commissionPercent}%</div>
            </div>
            <button className="admin-del" disabled={busy === c.id} onClick={() => remove(c.id)}>Xoá</button>
          </div>
        ))}
      </div>
    </>
  )
}
