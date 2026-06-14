import { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout.jsx'
import { adminVerificationsService } from '../../../api'

const STATUS_BADGE = {
  pending:  { cls: 'admin-badge--warning', label: 'Chờ duyệt' },
  approved: { cls: 'admin-badge--success', label: 'Đã duyệt' },
  rejected: { cls: 'admin-badge--danger',  label: 'Từ chối' },
}

const REJECT_REASONS = [
  { value: 'FACE_MISMATCH', label: 'Khuôn mặt không khớp' },
  { value: 'BLURRY',        label: 'Ảnh mờ' },
  { value: 'FAKE',          label: 'Nghi ngờ giả mạo' },
  { value: 'other',         label: 'Lý do khác' },
]

export default function Verifications() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState(null)
  const [toast, setToast] = useState(null)

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2400)
  }

  async function load() {
    setLoading(true)
    const data = await adminVerificationsService.list({ status: 'pending' })
    setItems(data.items)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function approve(id) {
    await adminVerificationsService.approve(id, 'Đã duyệt thủ công')
    showToast('Đã duyệt xác minh')
    setActiveId(null)
    load()
  }

  async function reject(id, reason, note) {
    await adminVerificationsService.reject(id, { reason, note })
    showToast('Đã từ chối xác minh', 'error')
    setActiveId(null)
    load()
  }

  return (
    <AdminLayout title="Xác minh danh tính" crumbs="Người dùng / Xác minh">
      <div className="admin-card">
        <div className="admin-card__head">
          <h3 className="admin-card__title">Hàng chờ duyệt ({items.length})</h3>
          <div style={{ fontSize: 13, color: 'var(--admin-text-muted)' }}>
            Quyết định sẽ cập nhật trust score của user (42 → 88 khi duyệt)
          </div>
        </div>
        {loading ? (
          <div className="admin-empty">Đang tải...</div>
        ) : items.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty__icon">✅</div>
            <div>Không có yêu cầu xác minh nào đang chờ</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Người gửi</th>
                  <th>Loại</th>
                  <th>AI score</th>
                  <th>Cờ AI</th>
                  <th>Thời gian</th>
                  <th style={{ width: 1 }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <div className="admin-user-cell">
                        <img className="admin-avatar" src={v.user.avatarUrl} alt="" />
                        <div className="admin-user-cell__name">{v.user.name}</div>
                      </div>
                    </td>
                    <td><span className="admin-badge admin-badge--info">{v.type}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ flex: 1, maxWidth: 80, height: 6, background: 'var(--admin-border)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${(v.aiScore * 100).toFixed(0)}%`, height: '100%', background: 'var(--admin-primary)' }} />
                        </div>
                        <span style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>{(v.aiScore * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td>
                      {v.aiFlags?.length ? v.aiFlags.map((f) => (
                        <span key={f} className="admin-badge admin-badge--warning" style={{ marginRight: 4 }}>{f}</span>
                      )) : <span style={{ color: 'var(--admin-text-muted)', fontSize: 12 }}>—</span>}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{v.submittedAt.slice(0, 16).replace('T', ' ')}</td>
                    <td>
                      <button className="admin-btn admin-btn--sm admin-btn--primary" onClick={() => setActiveId(v.id)}>Duyệt</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {activeId ? (
        <VerifyModal
          id={activeId}
          onClose={() => setActiveId(null)}
          onApprove={approve}
          onReject={reject}
        />
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

function VerifyModal({ id, onClose, onApprove, onReject }) {
  const [detail, setDetail] = useState(null)
  const [reason, setReason] = useState('FACE_MISMATCH')
  const [note, setNote] = useState('')
  const [mode, setMode] = useState('view') // 'view' | 'reject'

  useEffect(() => {
    adminVerificationsService.detail(id).then(setDetail)
  }, [id])

  if (!detail) {
    return (
      <div className="admin-modal-overlay" onClick={onClose}>
        <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
          <div className="admin-modal__body">Đang tải...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__head">
          <h3 className="admin-modal__title">Duyệt xác minh · {detail.user.name}</h3>
          <button className="admin-btn admin-btn--sm admin-btn--ghost" onClick={onClose}>✕</button>
        </div>
        <div className="admin-modal__body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div className="admin-form-row">
                <label>Ảnh xác minh (gốc)</label>
                <img src={detail.photoUrl} alt="" style={{ width: '100%', borderRadius: 8 }} />
              </div>
            </div>
            <div>
              <div className="admin-form-row">
                <label>User</label>
                <div className="admin-user-cell">
                  <img className="admin-avatar" src={detail.user.avatarUrl} alt="" />
                  <div>
                    <div className="admin-user-cell__name">{detail.user.name}</div>
                    <div className="admin-user-cell__sub">ID: {detail.user.id}</div>
                  </div>
                </div>
              </div>

              <div className="admin-form-row">
                <label>AI score</label>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{(detail.aiScore * 100).toFixed(0)}%</div>
              </div>

              <div className="admin-form-row">
                <label>Cờ cảnh báo</label>
                {detail.aiFlags?.length ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {detail.aiFlags.map((f) => <span key={f} className="admin-badge admin-badge--warning">{f}</span>)}
                  </div>
                ) : <span style={{ color: 'var(--admin-text-muted)' }}>Không có</span>}
              </div>

              {mode === 'reject' ? (
                <>
                  <div className="admin-form-row">
                    <label>Lý do từ chối</label>
                    <select className="admin-select" value={reason} onChange={(e) => setReason(e.target.value)}>
                      {REJECT_REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                  <div className="admin-form-row">
                    <label>Ghi chú nội bộ (tuỳ chọn)</label>
                    <textarea className="admin-textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú cho moderator khác..." />
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
        <div className="admin-modal__foot">
          {mode === 'view' ? (
            <>
              <button className="admin-btn" onClick={() => setMode('reject')}>Từ chối</button>
              <button className="admin-btn admin-btn--primary" onClick={() => onApprove(id)}>Duyệt xác minh</button>
            </>
          ) : (
            <>
              <button className="admin-btn" onClick={() => setMode('view')}>← Quay lại</button>
              <button className="admin-btn admin-btn--danger" onClick={() => onReject(id, reason, note)}>Xác nhận từ chối</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
