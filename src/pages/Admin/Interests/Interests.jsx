import { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout.jsx'
import { adminInterestsService } from '../../../api'

export default function Interests() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [newGroupOpen, setNewGroupOpen] = useState(false)
  const [newGroup, setNewGroup] = useState({ label: '', icon: '🏷️' })
  const [newItem, setNewItem] = useState({ groupId: '', label: '' })
  const [toast, setToast] = useState(null)

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2400)
  }

  async function load() {
    setLoading(true)
    const data = await adminInterestsService.list()
    setGroups(data.groups)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleItem(groupId, item) {
    await adminInterestsService.update(item.id, { active: !item.active })
    load()
  }

  async function createItem(e) {
    e.preventDefault()
    if (!newItem.groupId || !newItem.label) return
    await adminInterestsService.create({ groupId: newItem.groupId, label: newItem.label })
    setNewItem({ groupId: '', label: '' })
    showToast('Đã thêm sở thích')
    load()
  }

  async function createGroup(e) {
    e.preventDefault()
    if (!newGroup.label) return
    await adminInterestsService.createGroup(newGroup)
    setNewGroup({ label: '', icon: '🏷️' })
    setNewGroupOpen(false)
    showToast('Đã tạo nhóm')
    load()
  }

  async function removeItem(id) {
    if (!window.confirm('Xoá sở thích này?')) return
    await adminInterestsService.remove(id)
    showToast('Đã xoá', 'error')
    load()
  }

  return (
    <AdminLayout title="Sở thích" crumbs="Nội dung / Sở thích">
      <div className="admin-card">
        <div className="admin-card__head">
          <h3 className="admin-card__title">Danh mục sở thích</h3>
          <button className="admin-btn admin-btn--primary" onClick={() => setNewGroupOpen(true)}>+ Tạo nhóm</button>
        </div>

        <div style={{ padding: 20 }}>
          {loading ? (
            <div className="admin-empty">Đang tải...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {groups.map((g) => (
                <div key={g.id} className="admin-card">
                  <div className="admin-card__head" style={{ background: 'var(--admin-surface-2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{g.icon}</span>
                      <strong>{g.label}</strong>
                      <span className="admin-badge admin-badge--muted">{g.items.length} items</span>
                    </div>
                  </div>
                  <div className="admin-card__body">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {g.items.map((it) => (
                        <div
                          key={it.id}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '6px 12px',
                            border: '1px solid var(--admin-border)',
                            borderRadius: 999,
                            background: it.active ? 'var(--admin-primary-soft)' : 'transparent',
                            opacity: it.active ? 1 : 0.55,
                          }}
                        >
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{it.label}</span>
                          <button
                            onClick={() => toggleItem(g.id, it)}
                            style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--admin-text-muted)', fontSize: 12 }}
                            title={it.active ? 'Tắt' : 'Bật'}
                          >
                            {it.active ? '👁️' : '🚫'}
                          </button>
                          <button
                            onClick={() => removeItem(it.id)}
                            style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--admin-danger)', fontSize: 12 }}
                            title="Xoá"
                          >✕</button>
                        </div>
                      ))}
                      <form
                        onSubmit={(e) => { setNewItem({ groupId: g.id, label: '' }); createItem({ ...e, preventDefault: () => {} }) }}
                        style={{ display: 'flex', gap: 6 }}
                      >
                        <input
                          className="admin-input"
                          placeholder="+ Thêm sở thích"
                          style={{ height: 32, fontSize: 13, padding: '0 12px' }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              if (e.currentTarget.value) {
                                adminInterestsService.create({ groupId: g.id, label: e.currentTarget.value })
                                  .then(() => { showToast('Đã thêm'); load() })
                                e.currentTarget.value = ''
                              }
                            }
                          }}
                        />
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {newGroupOpen ? (
        <div className="admin-modal-overlay" onClick={() => setNewGroupOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__head">
              <h3 className="admin-modal__title">Tạo nhóm sở thích</h3>
              <button className="admin-btn admin-btn--sm admin-btn--ghost" onClick={() => setNewGroupOpen(false)}>✕</button>
            </div>
            <form onSubmit={createGroup}>
              <div className="admin-modal__body">
                <div className="admin-form-row">
                  <label>Tên nhóm *</label>
                  <input className="admin-input" value={newGroup.label} onChange={(e) => setNewGroup({ ...newGroup, label: e.target.value })} required />
                </div>
                <div className="admin-form-row">
                  <label>Icon (emoji)</label>
                  <input className="admin-input" value={newGroup.icon} onChange={(e) => setNewGroup({ ...newGroup, icon: e.target.value })} />
                </div>
              </div>
              <div className="admin-modal__foot">
                <button type="button" className="admin-btn" onClick={() => setNewGroupOpen(false)}>Huỷ</button>
                <button type="submit" className="admin-btn admin-btn--primary">Tạo</button>
              </div>
            </form>
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
