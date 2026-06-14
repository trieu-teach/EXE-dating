import { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout.jsx'
import { adminPremiumService } from '../../../api'

const fmtVnd = (n) => new Intl.NumberFormat('vi-VN').format(n) + ' ₫'

const EMPTY = { name: '', priceVnd: '', durationDays: 30, isActive: true }

export default function Premium() {
  const [plans, setPlans] = useState([])
  const [subs, setSubs] = useState([])
  const [tab, setTab] = useState('plans')
  const [editing, setEditing] = useState(null)
  const [toast, setToast] = useState(null)

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2400)
  }

  async function load() {
    const [p, s] = await Promise.all([adminPremiumService.listPlans(), adminPremiumService.listSubscribers()])
    setPlans(p.items); setSubs(s.items)
  }

  useEffect(() => { load() }, [])

  async function savePlan(payload) {
    if (editing.id) {
      await adminPremiumService.updatePlan(editing.id, payload)
      showToast('Đã cập nhật gói')
    } else {
      await adminPremiumService.createPlan(payload)
      showToast('Đã tạo gói mới')
    }
    setEditing(null)
    load()
  }

  async function removePlan(id) {
    if (!window.confirm('Xoá gói premium này?')) return
    await adminPremiumService.removePlan(id)
    showToast('Đã xoá gói', 'error')
    load()
  }

  return (
    <AdminLayout title="Gói Premium" crumbs="Nội dung / Premium">
      <div className="admin-tabs">
        <button className={`admin-tab${tab === 'plans' ? ' admin-tab--active' : ''}`} onClick={() => setTab('plans')}>
          Các gói ({plans.length})
        </button>
        <button className={`admin-tab${tab === 'subs' ? ' admin-tab--active' : ''}`} onClick={() => setTab('subs')}>
          Subscribers ({subs.length})
        </button>
      </div>

      {tab === 'plans' ? (
        <div className="admin-card">
          <div className="admin-card__head">
            <h3 className="admin-card__title">Quản lý gói</h3>
            <button className="admin-btn admin-btn--primary" onClick={() => setEditing(EMPTY)}>+ Tạo gói</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tên gói</th>
                  <th>Giá</th>
                  <th>Thời hạn</th>
                  <th>Trạng thái</th>
                  <th style={{ width: 1 }}></th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>{fmtVnd(p.priceVnd)}</td>
                    <td>{p.durationDays} ngày</td>
                    <td>
                      {p.isActive
                        ? <span className="admin-badge admin-badge--success">Đang bán</span>
                        : <span className="admin-badge admin-badge--muted">Tạm ẩn</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="admin-btn admin-btn--sm" onClick={() => setEditing(p)}>Sửa</button>
                        <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => removePlan(p.id)}>Xoá</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="admin-card">
          <div className="admin-card__head">
            <h3 className="admin-card__title">Danh sách subscribers</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Gói</th>
                  <th>Giá</th>
                  <th>Bắt đầu</th>
                  <th>Hết hạn</th>
                  <th>Trạng thái</th>
                  <th>Tự gia hạn</th>
                </tr>
              </thead>
              <tbody>
                {subs.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="admin-user-cell">
                        <div>
                          <div className="admin-user-cell__name">{s.user.name}</div>
                          <div className="admin-user-cell__sub">{s.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{s.planName}</td>
                    <td>{fmtVnd(s.priceVnd)}</td>
                    <td style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{s.startedAt.slice(0, 10)}</td>
                    <td style={{ fontSize: 12 }}>{s.expiresAt.slice(0, 10)}</td>
                    <td>
                      {s.status === 'active'
                        ? <span className="admin-badge admin-badge--success">Đang dùng</span>
                        : <span className="admin-badge admin-badge--muted">Hết hạn</span>}
                    </td>
                    <td>{s.autoRenew ? '✅' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editing ? (
        <PlanForm initial={editing} onClose={() => setEditing(null)} onSave={savePlan} />
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

function PlanForm({ initial, onClose, onSave }) {
  const [form, setForm] = useState({
    name: initial.name ?? '',
    priceVnd: initial.priceVnd ?? '',
    durationDays: initial.durationDays ?? 30,
    isActive: initial.isActive ?? true,
  })
  function update(k, v) { setForm((f) => ({ ...f, [k]: v })) }
  function handleSubmit(e) {
    e.preventDefault()
    onSave({ ...form, priceVnd: Number(form.priceVnd), durationDays: Number(form.durationDays) })
  }
  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__head">
          <h3 className="admin-modal__title">{initial.id ? 'Sửa gói' : 'Tạo gói'}</h3>
          <button className="admin-btn admin-btn--sm admin-btn--ghost" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="admin-modal__body">
            <div className="admin-form-row">
              <label>Tên gói *</label>
              <input className="admin-input" value={form.name} onChange={(e) => update('name', e.target.value)} required />
            </div>
            <div className="admin-form-grid">
              <div className="admin-form-row">
                <label>Giá (VND) *</label>
                <input className="admin-input" type="number" min={0} value={form.priceVnd} onChange={(e) => update('priceVnd', e.target.value)} required />
              </div>
              <div className="admin-form-row">
                <label>Thời hạn (ngày) *</label>
                <input className="admin-input" type="number" min={1} value={form.durationDays} onChange={(e) => update('durationDays', e.target.value)} required />
              </div>
            </div>
            <div className="admin-form-row">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isActive} onChange={(e) => update('isActive', e.target.checked)} />
                Đang bán
              </label>
            </div>
          </div>
          <div className="admin-modal__foot">
            <button type="button" className="admin-btn" onClick={onClose}>Huỷ</button>
            <button type="submit" className="admin-btn admin-btn--primary">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  )
}
