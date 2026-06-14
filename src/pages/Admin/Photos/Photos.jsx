import { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout.jsx'
import { adminPhotosService } from '../../../api'

const STATUS = {
  pending:  { cls: 'admin-badge--warning', label: 'Chờ duyệt' },
  flagged:  { cls: 'admin-badge--danger',  label: 'Bị cờ' },
  approved: { cls: 'admin-badge--success', label: 'Đã duyệt' },
}

export default function Photos() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('flagged')
  const [toast, setToast] = useState(null)

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2400)
  }

  async function load() {
    setLoading(true)
    const data = await adminPhotosService.list({ status })
    setItems(data.items)
    setLoading(false)
  }

  useEffect(() => { load() }, [status])

  async function approve(id) {
    await adminPhotosService.approve(id)
    showToast('Đã duyệt ảnh')
    load()
  }

  async function reject(id) {
    const reason = window.prompt('Lý do từ chối (nsfw / violent / other):', 'nsfw')
    if (!reason) return
    await adminPhotosService.reject(id, { reason, note: 'Admin moderation' })
    showToast('Đã từ chối ảnh', 'error')
    load()
  }

  return (
    <AdminLayout title="Duyệt ảnh" crumbs="Người dùng / Duyệt ảnh">
      <div className="admin-tabs">
        {[
          { v: 'flagged', l: 'Bị cờ' },
          { v: 'pending', l: 'Chờ duyệt' },
          { v: 'approved', l: 'Đã duyệt' },
        ].map((t) => (
          <button
            key={t.v}
            className={`admin-tab${status === t.v ? ' admin-tab--active' : ''}`}
            onClick={() => setStatus(t.v)}
          >{t.l}</button>
        ))}
      </div>

      {loading ? (
        <div className="admin-empty">Đang tải...</div>
      ) : items.length === 0 ? (
        <div className="admin-empty">
          <div className="admin-empty__icon">🖼️</div>
          <div>Không có ảnh nào trong trạng thái này</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {items.map((p) => {
            const s = STATUS[p.status] || STATUS.pending
            return (
              <div key={p.id} className="admin-card" style={{ overflow: 'hidden' }}>
                <img src={p.url} alt="" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
                <div style={{ padding: 12 }}>
                  <div className="admin-user-cell" style={{ marginBottom: 8 }}>
                    <img className="admin-avatar" src={`https://i.pravatar.cc/100?u=${p.userId}`} alt="" />
                    <div className="admin-user-cell__name">{p.userName}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
                    <span className={`admin-badge ${s.cls}`}>{s.label}</span>
                    {p.flagReason ? <span className="admin-badge admin-badge--muted">{p.flagReason}</span> : null}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--admin-text-muted)', marginBottom: 12 }}>
                    AI: {(p.aiScore * 100).toFixed(0)}%
                  </div>
                  {p.status !== 'approved' ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="admin-btn admin-btn--sm admin-btn--primary" style={{ flex: 1 }} onClick={() => approve(p.id)}>Duyệt</button>
                      <button className="admin-btn admin-btn--sm admin-btn--danger" style={{ flex: 1 }} onClick={() => reject(p.id)}>Từ chối</button>
                    </div>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {toast ? (
        <div className={`admin-toast ${toast.type === 'error' ? 'admin-toast--error' : ''}`}>
          <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
          <span>{toast.message}</span>
        </div>
      ) : null}
    </AdminLayout>
  )
}
