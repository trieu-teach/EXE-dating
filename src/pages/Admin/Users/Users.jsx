import { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout.jsx'
import { adminUsersService } from '../../../api'

const STATUS_BADGE = {
  active: { cls: 'admin-badge--success', label: 'Hoạt động' },
  locked: { cls: 'admin-badge--warning', label: 'Bị khoá' },
  banned: { cls: 'admin-badge--danger', label: 'Bị cấm' },
}

export default function Users() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState(new Set())
  const [detailId, setDetailId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    let cancel = false
    async function load() {
      setLoading(true)
      const data = await adminUsersService.list({ status: statusFilter })
      if (!cancel) {
        setItems(data.items)
        setTotal(data.total)
        setLoading(false)
      }
    }
    load()
    return () => { cancel = true }
  }, [statusFilter])

  useEffect(() => {
    if (!detailId) { setDetail(null); return }
    adminUsersService.detail(detailId).then(setDetail)
  }, [detailId])

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2400)
  }

  const filtered = items.filter((u) => {
    if (!search) return true
    const q = search.toLowerCase()
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)
  })

  function toggleSelect(id) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelected(next)
  }

  async function changeStatus(id, status) {
    await adminUsersService.updateStatus(id, { status, reason: 'Admin action' })
    showToast(`Đã chuyển trạng thái: ${status}`)
    const data = await adminUsersService.list({ status: statusFilter })
    setItems(data.items)
  }

  async function bulkLock() {
    if (!selected.size) return
    await adminUsersService.bulkAction({ userIds: [...selected], action: 'lock', reason: 'Bulk' })
    showToast(`Đã khoá ${selected.size} người dùng`)
    setSelected(new Set())
    const data = await adminUsersService.list({ status: statusFilter })
    setItems(data.items)
  }

  async function resetPassword(id) {
    const np = window.prompt('Nhập mật khẩu mới (tối thiểu 8 ký tự):')
    if (!np || np.length < 8) return
    await adminUsersService.resetPassword(id, np)
    showToast('Đã reset mật khẩu & gửi email')
  }

  async function revokeSessions(id) {
    if (!window.confirm('Thu hồi tất cả phiên đăng nhập của user này?')) return
    await adminUsersService.revokeSessions(id)
    showToast('Đã thu hồi tất cả phiên')
  }

  return (
    <AdminLayout title="Người dùng" crumbs="Quản lý người dùng">
      <div className="admin-card">
        <div className="admin-card__head">
          <h3 className="admin-card__title">Danh sách ({total.toLocaleString('vi-VN')} tổng)</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            {selected.size > 0 ? (
              <>
                <span style={{ alignSelf: 'center', fontSize: 13, color: 'var(--admin-text-muted)' }}>
                  Đã chọn {selected.size}
                </span>
                <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={bulkLock}>
                  Khoá hàng loạt
                </button>
              </>
            ) : null}
          </div>
        </div>

        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--admin-border)' }}>
          <div className="admin-toolbar" style={{ margin: 0 }}>
            <div className="admin-toolbar__search">
              <span className="admin-toolbar__search-icon" aria-hidden="true">🔍</span>
              <input
                placeholder="Tìm theo tên, email, username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 160 }}>
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="locked">Bị khoá</option>
              <option value="banned">Bị cấm</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="admin-empty">Đang tải...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 36 }}>
                    <input
                      type="checkbox"
                      checked={selected.size === filtered.length && filtered.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) setSelected(new Set(filtered.map((u) => u.id)))
                        else setSelected(new Set())
                      }}
                    />
                  </th>
                  <th>Người dùng</th>
                  <th>Trạng thái</th>
                  <th>Xác minh</th>
                  <th>Premium</th>
                  <th>Hoạt động</th>
                  <th style={{ width: 1 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const s = STATUS_BADGE[u.status] || STATUS_BADGE.active
                  return (
                    <tr key={u.id} onClick={() => setDetailId(u.id)} style={{ cursor: 'pointer' }}>
                      <td onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selected.has(u.id)}
                          onChange={() => toggleSelect(u.id)}
                        />
                      </td>
                      <td>
                        <div className="admin-user-cell">
                          <img className="admin-avatar" src={u.avatarUrl} alt="" />
                          <div>
                            <div className="admin-user-cell__name">{u.name}</div>
                            <div className="admin-user-cell__sub">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`admin-badge ${s.cls}`}>{s.label}</span>
                      </td>
                      <td>
                        {u.identityVerified ? (
                          <span className="admin-badge admin-badge--success">✓ {u.trustScore}</span>
                        ) : (
                          <span className="admin-badge admin-badge--muted">○ {u.trustScore}</span>
                        )}
                      </td>
                      <td>
                        {u.isPremium ? <span className="admin-badge admin-badge--info">Premium</span> : '—'}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{u.lastActiveAt.slice(0, 10)}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button className="admin-btn admin-btn--sm">Xem</button>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7}><div className="admin-empty">Không có kết quả</div></td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}

        <div className="admin-pagination">
          <span>Hiển thị {filtered.length} / {total.toLocaleString('vi-VN')}</span>
          <div className="admin-pagination__buttons">
            <button className="admin-pagination__btn" disabled>‹</button>
            <button className="admin-pagination__btn admin-pagination__btn--active">1</button>
            <button className="admin-pagination__btn">2</button>
            <button className="admin-pagination__btn">3</button>
            <button className="admin-pagination__btn">›</button>
          </div>
        </div>
      </div>

      {detailId && detail ? (
        <div className="admin-modal-overlay" onClick={() => setDetailId(null)}>
          <div className="admin-modal" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__head">
              <h3 className="admin-modal__title">Chi tiết người dùng</h3>
              <button className="admin-btn admin-btn--sm admin-btn--ghost" onClick={() => setDetailId(null)}>✕</button>
            </div>
            <div className="admin-modal__body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <img src={detail.avatarUrl} alt="" style={{ width: 64, height: 64, borderRadius: '50%' }} />
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{detail.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--admin-text-muted)' }}>{detail.email} · @{detail.username}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    {detail.identityVerified ? (
                      <span className="admin-badge admin-badge--success">✓ Đã xác minh · {detail.trustScore}</span>
                    ) : (
                      <span className="admin-badge admin-badge--muted">○ Chưa xác minh · {detail.trustScore}</span>
                    )}
                    {detail.isPremium ? <span className="admin-badge admin-badge--info">Premium</span> : null}
                  </div>
                </div>
              </div>

              <div className="admin-form-grid">
                <div className="admin-form-row">
                  <label>Tuổi</label>
                  <input className="admin-input" value={detail.age} readOnly />
                </div>
                <div className="admin-form-row">
                  <label>Giới tính</label>
                  <input className="admin-input" value={detail.gender} readOnly />
                </div>
                <div className="admin-form-row">
                  <label>Thành phố</label>
                  <input className="admin-input" value={detail.city} readOnly />
                </div>
                <div className="admin-form-row">
                  <label>Quận / huyện</label>
                  <input className="admin-input" value={detail.district} readOnly />
                </div>
              </div>

              <div className="admin-form-row">
                <label>Bio</label>
                <textarea className="admin-textarea" value={detail.bio} readOnly />
              </div>

              {detail.photos?.length ? (
                <div className="admin-form-row">
                  <label>Ảnh hồ sơ</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {detail.photos.map((p) => (
                      <img key={p.id} src={p.url} alt="" style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 8 }} />
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="admin-form-row">
                <label>Thống kê</label>
                <div style={{ display: 'flex', gap: 12, fontSize: 13 }}>
                  <span>💞 {detail.stats?.matchesCount} match</span>
                  <span>💬 {detail.stats?.conversationsCount} cuộc thoại</span>
                  <span>🚨 {detail.stats?.reportsAgainstCount} báo cáo</span>
                </div>
              </div>
            </div>
            <div className="admin-modal__foot">
              <button className="admin-btn" onClick={() => resetPassword(detail.id)}>Reset mật khẩu</button>
              <button className="admin-btn" onClick={() => revokeSessions(detail.id)}>Thu hồi phiên</button>
              {detail.status === 'active' ? (
                <button className="admin-btn admin-btn--danger" onClick={() => changeStatus(detail.id, 'locked')}>Khoá tài khoản</button>
              ) : (
                <button className="admin-btn admin-btn--primary" onClick={() => changeStatus(detail.id, 'active')}>Mở khoá</button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className={`admin-toast ${toast.type === 'error' ? 'admin-toast--error' : ''}`}>
          <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
          <span>{toast.message}</span>
        </div>
      ) : null}
    </AdminLayout>
  )
}
