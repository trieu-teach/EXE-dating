import { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout.jsx'
import { adminSettingsService } from '../../../api'

export default function Settings() {
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2400)
  }

  useEffect(() => {
    adminSettingsService.getApp().then((data) => {
      setForm(data)
      setLoading(false)
    })
  }, [])

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function updateFlag(key, value) {
    setForm((f) => ({ ...f, featureFlags: { ...f.featureFlags, [key]: value } }))
  }

  async function handleSave() {
    await adminSettingsService.updateApp(form)
    showToast('Đã lưu cài đặt')
  }

  async function toggleFlag(key) {
    const next = !form.featureFlags[key]
    updateFlag(key, next)
    await adminSettingsService.updateFeatureFlag(key, next)
  }

  if (loading || !form) {
    return (
      <AdminLayout title="Cài đặt" crumbs="Hệ thống / Cài đặt">
        <div className="admin-empty">Đang tải...</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Cài đặt" crumbs="Hệ thống / Cài đặt">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
        <div className="admin-card">
          <div className="admin-card__head">
            <h3 className="admin-card__title">Quy tắc khám phá</h3>
          </div>
          <div className="admin-card__body">
            <div style={{ display: 'grid', gap: 14 }}>
              <Toggle
                label="Xác minh danh tính bắt buộc"
                desc="User mới phải xác minh khuôn mặt trước khi dùng Discovery"
                checked={form.verificationRequired}
                onChange={(v) => update('verificationRequired', v)}
              />
              <Toggle
                label="Mặc định chỉ hiện hồ sơ đã xác minh"
                desc="Áp dụng cho user mới chưa tự chỉnh"
                checked={form.verifiedOnlyDefault}
                onChange={(v) => update('verifiedOnlyDefault', v)}
              />
              <Toggle
                label="Chế độ toàn cầu (Global Mode)"
                desc="Mở rộng match ra ngoài khu vực"
                checked={form.globalMode}
                onChange={(v) => update('globalMode', v)}
              />
              <Toggle
                label="Bật gợi ý trả lời AI trong chat"
                checked={form.aiSuggestionsEnabled}
                onChange={(v) => update('aiSuggestionsEnabled', v)}
              />
              <div className="admin-form-grid">
                <div className="admin-form-row">
                  <label>Điểm uy tín (chưa xác minh)</label>
                  <input className="admin-input" type="number" min={0} max={100} value={form.trustScoreUnverified} onChange={(e) => update('trustScoreUnverified', Number(e.target.value))} />
                </div>
                <div className="admin-form-row">
                  <label>Điểm uy tín (đã xác minh)</label>
                  <input className="admin-input" type="number" min={0} max={100} value={form.trustScoreVerified} onChange={(e) => update('trustScoreVerified', Number(e.target.value))} />
                </div>
                <div className="admin-form-row">
                  <label>Tuổi tối thiểu</label>
                  <input className="admin-input" type="number" min={13} max={25} value={form.minAge} onChange={(e) => update('minAge', Number(e.target.value))} />
                </div>
                <div className="admin-form-row">
                  <label>Khoảng cách tối đa (km)</label>
                  <input className="admin-input" type="number" min={1} max={1000} value={form.maxDistanceKm} onChange={(e) => update('maxDistanceKm', Number(e.target.value))} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card__head">
            <h3 className="admin-card__title">Feature flags</h3>
          </div>
          <div className="admin-card__body">
            <div style={{ display: 'grid', gap: 14 }}>
              {Object.entries(form.featureFlags).map(([key, val]) => (
                <Toggle
                  key={key}
                  label={key}
                  checked={val}
                  onChange={() => toggleFlag(key)}
                />
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="admin-btn admin-btn--primary" onClick={handleSave}>💾 Lưu tất cả thay đổi</button>
        </div>
      </div>

      {toast ? (
        <div className={`admin-toast ${toast.type === 'error' ? 'admin-toast--error' : ''}`}>
          <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
          <span>{toast.message}</span>
        </div>
      ) : null}
    </AdminLayout>
  )
}

function Toggle({ label, desc, checked, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
        {desc ? <div style={{ fontSize: 12, color: 'var(--admin-text-muted)', marginTop: 2 }}>{desc}</div> : null}
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: 40, height: 24, borderRadius: 999,
          background: checked ? 'var(--admin-primary)' : 'var(--admin-border)',
          position: 'relative', border: 0, cursor: 'pointer', transition: 'background 0.18s',
        }}
      >
        <span style={{
          position: 'absolute', top: 3, left: checked ? 19 : 3,
          width: 18, height: 18, borderRadius: '50%', background: '#fff',
          transition: 'left 0.18s',
        }} />
      </button>
    </div>
  )
}
