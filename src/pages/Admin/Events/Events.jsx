import { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout.jsx'
import { adminEventsService } from '../../../api'

const STATUS = {
  draft:     { cls: 'admin-badge--muted',   label: 'Nháp' },
  published: { cls: 'admin-badge--success', label: 'Đã đăng' },
  archived:  { cls: 'admin-badge--warning', label: 'Lưu trữ' },
}

const CATEGORIES = [
  { id: 'dining', label: 'Ăn uống' },
  { id: 'outdoor', label: 'Ngoài trời' },
  { id: 'workshop', label: 'Workshop' },
  { id: 'music', label: 'Âm nhạc' },
  { id: 'sports', label: 'Thể thao' },
]

const EMPTY_FORM = {
  title: '', category: 'dining', premiumOnly: false,
  date: '', time: '', location: '', address: '',
  capacity: 30, description: '', image: '',
  rewardCode: '', trustScoreDelta: 5,
}

export default function Events() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [toast, setToast] = useState(null)

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2400)
  }

  async function load() {
    setLoading(true)
    const data = await adminEventsService.list({ status: statusFilter })
    setItems(data.items)
    setLoading(false)
  }

  useEffect(() => { load() }, [statusFilter])

  async function publish(id) {
    await adminEventsService.publish(id)
    showToast('Đã đăng sự kiện')
    load()
  }

  async function remove(id) {
    if (!window.confirm('Xoá vĩnh viễn sự kiện này?')) return
    await adminEventsService.remove(id)
    showToast('Đã xoá sự kiện', 'error')
    load()
  }

  async function save(payload) {
    if (editing && editing !== 'new') {
      await adminEventsService.update(editing, payload)
      showToast('Đã cập nhật sự kiện')
    } else {
      await adminEventsService.create(payload)
      showToast('Đã tạo sự kiện')
    }
    setEditing(null)
    setCreating(false)
    load()
  }

  return (
    <AdminLayout title="Sự kiện" crumbs="Nội dung / Sự kiện">
      <div className="admin-card">
        <div className="admin-card__head">
          <h3 className="admin-card__title">Danh sách sự kiện</h3>
          <button className="admin-btn admin-btn--primary" onClick={() => { setEditing('new'); setCreating(true) }}>
            + Tạo sự kiện
          </button>
        </div>

        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--admin-border)' }}>
          <div className="admin-toolbar" style={{ margin: 0 }}>
            <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 180 }}>
              <option value="">Tất cả trạng thái</option>
              <option value="draft">Nháp</option>
              <option value="published">Đã đăng</option>
              <option value="archived">Lưu trữ</option>
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
                  <th>Sự kiện</th>
                  <th>Loại</th>
                  <th>Thời gian</th>
                  <th>Đăng ký</th>
                  <th>Premium</th>
                  <th>Trạng thái</th>
                  <th style={{ width: 1 }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((e) => {
                  const s = STATUS[e.status] || STATUS.draft
                  return (
                    <tr key={e.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{e.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{e.location}</div>
                      </td>
                      <td><span className="admin-badge admin-badge--muted">{e.category}</span></td>
                      <td style={{ fontSize: 13 }}>{e.date.slice(0, 10)}</td>
                      <td>{e.registered}/{e.capacity}</td>
                      <td>{e.premiumOnly ? '⭐' : '—'}</td>
                      <td><span className={`admin-badge ${s.cls}`}>{s.label}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {e.status === 'draft' ? (
                            <button className="admin-btn admin-btn--sm admin-btn--primary" onClick={() => publish(e.id)}>Đăng</button>
                          ) : null}
                          <button className="admin-btn admin-btn--sm" onClick={() => setEditing(e.id)}>Sửa</button>
                          <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => remove(e.id)}>Xoá</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing ? (
        <EventForm
          id={editing}
          isNew={creating}
          onClose={() => { setEditing(null); setCreating(false) }}
          onSave={save}
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

function EventForm({ id, isNew, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(!isNew)

  useEffect(() => {
    if (isNew) return
    adminEventsService.detail(id).then((d) => {
      setForm({
        ...EMPTY_FORM,
        ...d,
        date: d.date?.slice(0, 16) || '',
        capacity: d.capacity || 30,
      })
      setLoading(false)
    })
  }, [id, isNew])

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave({ ...form, capacity: Number(form.capacity), trustScoreDelta: Number(form.trustScoreDelta) })
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__head">
          <h3 className="admin-modal__title">{isNew ? 'Tạo sự kiện' : 'Sửa sự kiện'}</h3>
          <button className="admin-btn admin-btn--sm admin-btn--ghost" onClick={onClose}>✕</button>
        </div>
        {loading ? (
          <div className="admin-modal__body">Đang tải...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="admin-modal__body">
              <div className="admin-form-row">
                <label>Tiêu đề *</label>
                <input className="admin-input" value={form.title} onChange={(e) => update('title', e.target.value)} required />
              </div>
              <div className="admin-form-grid">
                <div className="admin-form-row">
                  <label>Danh mục</label>
                  <select className="admin-select" value={form.category} onChange={(e) => update('category', e.target.value)}>
                    {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div className="admin-form-row">
                  <label>Sức chứa</label>
                  <input className="admin-input" type="number" min={1} value={form.capacity} onChange={(e) => update('capacity', e.target.value)} />
                </div>
              </div>
              <div className="admin-form-grid">
                <div className="admin-form-row">
                  <label>Ngày giờ *</label>
                  <input className="admin-input" type="datetime-local" value={form.date} onChange={(e) => update('date', e.target.value)} required />
                </div>
                <div className="admin-form-row">
                  <label>Khung giờ (hiển thị)</label>
                  <input className="admin-input" value={form.time} onChange={(e) => update('time', e.target.value)} placeholder="16:00 – 20:00" />
                </div>
              </div>
              <div className="admin-form-row">
                <label>Địa điểm *</label>
                <input className="admin-input" value={form.location} onChange={(e) => update('location', e.target.value)} required />
              </div>
              <div className="admin-form-row">
                <label>Địa chỉ chi tiết</label>
                <input className="admin-input" value={form.address} onChange={(e) => update('address', e.target.value)} />
              </div>
              <div className="admin-form-row">
                <label>Mô tả</label>
                <textarea className="admin-textarea" value={form.description} onChange={(e) => update('description', e.target.value)} />
              </div>
              <div className="admin-form-row">
                <label>URL ảnh cover</label>
                <input className="admin-input" value={form.image} onChange={(e) => update('image', e.target.value)} placeholder="https://..." />
              </div>
              <div className="admin-form-grid">
                <div className="admin-form-row">
                  <label>Mã thưởng</label>
                  <input className="admin-input" value={form.rewardCode} onChange={(e) => update('rewardCode', e.target.value)} placeholder="VD: SAMEMESS50" />
                </div>
                <div className="admin-form-row">
                  <label>Trust score delta</label>
                  <input className="admin-input" type="number" value={form.trustScoreDelta} onChange={(e) => update('trustScoreDelta', e.target.value)} />
                </div>
              </div>
              <div className="admin-form-row">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.premiumOnly} onChange={(e) => update('premiumOnly', e.target.checked)} />
                  Chỉ dành cho Premium
                </label>
              </div>
            </div>
            <div className="admin-modal__foot">
              <button type="button" className="admin-btn" onClick={onClose}>Huỷ</button>
              <button type="submit" className="admin-btn admin-btn--primary">{isNew ? 'Tạo' : 'Lưu'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
