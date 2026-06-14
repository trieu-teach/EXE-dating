import { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout.jsx'
import { adminReportsService } from '../../../api'

const STATUS_BADGE = {
  new:        { cls: 'admin-badge--warning', label: 'Mới' },
  in_review:  { cls: 'admin-badge--info',    label: 'Đang xử lý' },
  resolved:   { cls: 'admin-badge--success', label: 'Đã xử lý' },
}

const REASON_LABEL = {
  fake_profile: 'Giả mạo',
  inappropriate: 'Không phù hợp',
  harassment: 'Quấy rối',
  spam: 'Spam',
  other: 'Khác',
}

const RESOLUTIONS = [
  { value: 'no_action',  label: 'Không xử lý' },
  { value: 'warn',       label: 'Cảnh cáo' },
  { value: 'lock',       label: 'Khoá tài khoản' },
  { value: 'ban',        label: 'Cấm vĩnh viễn' },
  { value: 'delete_content', label: 'Xoá nội dung' },
]

export default function Reports() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('new')
  const [activeId, setActiveId] = useState(null)
  const [toast, setToast] = useState(null)

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2400)
  }

  async function load() {
    setLoading(true)
    const data = await adminReportsService.list({ status: statusFilter })
    setItems(data.items)
    setLoading(false)
  }

  useEffect(() => { load() }, [statusFilter])

  async function resolve(id, payload) {
    await adminReportsService.resolve(id, payload)
    showToast('Đã xử lý báo cáo')
    setActiveId(null)
    load()
  }

  async function dismiss(id) {
    await adminReportsService.dismiss(id, 'Báo cáo không hợp lệ')
    showToast('Đã bỏ qua báo cáo')
    setActiveId(null)
    load()
  }

  return (
    <AdminLayout title="Báo cáo vi phạm" crumbs="Người dùng / Báo cáo">
      <div className="admin-tabs">
        {[
          { v: 'new', l: 'Mới' },
          { v: 'in_review', l: 'Đang xử lý' },
          { v: 'resolved', l: 'Đã đóng' },
          { v: '', l: 'Tất cả' },
        ].map((t) => (
          <button
            key={t.v}
            className={`admin-tab${statusFilter === t.v ? ' admin-tab--active' : ''}`}
            onClick={() => setStatusFilter(t.v)}
          >
            {t.l}
          </button>
        ))}
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="admin-empty">Đang tải...</div>
        ) : items.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty__icon">📭</div>
            <div>Không có báo cáo nào</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Loại</th>
                  <th>Đối tượng</th>
                  <th>Lý do</th>
                  <th>Trạng thái</th>
                  <th>Thời gian</th>
                  <th style={{ width: 1 }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => {
                  const s = STATUS_BADGE[r.status] || STATUS_BADGE.new
                  return (
                    <tr key={r.id}>
                      <td><span className="admin-badge admin-badge--muted">{r.type}</span></td>
                      <td>
                        <div className="admin-user-cell">
                          <img className="admin-avatar" src={r.targetUser.avatarUrl} alt="" />
                          <div className="admin-user-cell__name">{r.targetUser.name}</div>
                        </div>
                      </td>
                      <td>{REASON_LABEL[r.reason] || r.reason}</td>
                      <td><span className={`admin-badge ${s.cls}`}>{s.label}</span></td>
                      <td style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{r.createdAt.slice(0, 16).replace('T', ' ')}</td>
                      <td>
                        <button className="admin-btn admin-btn--sm" onClick={() => setActiveId(r.id)}>Xử lý</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {activeId ? (
        <ReportModal
          id={activeId}
          onClose={() => setActiveId(null)}
          onResolve={resolve}
          onDismiss={dismiss}
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

function ReportModal({ id, onClose, onResolve, onDismiss }) {
  const [item, setItem] = useState(null)
  const [resolution, setResolution] = useState('warn')
  const [note, setNote] = useState('')
  const [lockDays, setLockDays] = useState(7)

  useEffect(() => {
    adminReportsService.list({}).then((d) => {
      setItem(d.items.find((x) => x.id === id) || null)
    })
  }, [id])

  if (!item) {
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
      <div className="admin-modal" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__head">
          <h3 className="admin-modal__title">Xử lý báo cáo · {item.id}</h3>
          <button className="admin-btn admin-btn--sm admin-btn--ghost" onClick={onClose}>✕</button>
        </div>
        <div className="admin-modal__body">
          <div className="admin-form-row">
            <label>Đối tượng bị báo cáo</label>
            <div className="admin-user-cell">
              <img className="admin-avatar" src={item.targetUser.avatarUrl} alt="" />
              <div>
                <div className="admin-user-cell__name">{item.targetUser.name}</div>
                <div className="admin-user-cell__sub">ID: {item.targetUser.id}</div>
              </div>
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="admin-form-row">
              <label>Loại</label>
              <input className="admin-input" value={item.type} readOnly />
            </div>
            <div className="admin-form-row">
              <label>Lý do</label>
              <input className="admin-input" value={REASON_LABEL[item.reason] || item.reason} readOnly />
            </div>
          </div>

          <div className="admin-form-row">
            <label>Mô tả của người báo cáo</label>
            <textarea className="admin-textarea" value={item.description} readOnly />
          </div>

          {item.evidence?.length ? (
            <div className="admin-form-row">
              <label>Bằng chứng đính kèm</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {item.evidence.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer">
                    <img src={url} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6 }} />
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          <hr className="ui-divider" />

          <div className="admin-form-row">
            <label>Quyết định</label>
            <select className="admin-select" value={resolution} onChange={(e) => setResolution(e.target.value)}>
              {RESOLUTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          {resolution === 'lock' ? (
            <div className="admin-form-row">
              <label>Số ngày khoá</label>
              <input
                className="admin-input"
                type="number"
                min={1}
                max={365}
                value={lockDays}
                onChange={(e) => setLockDays(Number(e.target.value))}
              />
            </div>
          ) : null}

          <div className="admin-form-row">
            <label>Ghi chú nội bộ</label>
            <textarea className="admin-textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú xử lý..." />
          </div>
        </div>
        <div className="admin-modal__foot">
          <button className="admin-btn" onClick={() => onDismiss(id)}>Bỏ qua</button>
          <button className="admin-btn admin-btn--primary" onClick={() => onResolve(id, { resolution, note, lockDays: resolution === 'lock' ? lockDays : undefined })}>
            Xác nhận xử lý
          </button>
        </div>
      </div>
    </div>
  )
}
