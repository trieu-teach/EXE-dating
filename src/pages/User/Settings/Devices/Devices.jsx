import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { settingsService } from '../../../../api'
import { useToast } from '../../../../context/ToastContext.jsx'
import { timeAgo } from '../../../../utils/format.js'

export default function Devices() {
  const navigate = useNavigate()
  const toast = useToast()
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    settingsService.getDevices()
      .then((list) => setDevices(Array.isArray(list) ? list : (list?.items ?? [])))
      .catch((err) => toast.error(err?.message || 'Không tải được danh sách thiết bị.'))
      .finally(() => setLoading(false))
  }, [toast])

  if (loading) return <div className="loading-block"><span className="spinner" /></div>

  return (
    <div className="settings-page">
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/settings')} style={{ alignSelf: 'flex-start' }}>
        ← Cài đặt
      </button>
      <h1>Thiết bị đã đăng nhập</h1>
      {devices.length === 0 ? (
        <div className="empty">Không có thiết bị nào được ghi nhận.</div>
      ) : (
        <section className="settings-section">
          {devices.map((d, i) => (
            <div key={d.id || i} className="settings-row">
              <div>
                <div className="settings-row-label">{d.deviceName || d.userAgent || 'Thiết bị'}</div>
                <div className="settings-row-desc">
                  {d.ip ? `IP: ${d.ip} · ` : ''}{d.location || ''} · Hoạt động {timeAgo(d.lastActiveAt || d.createdAt)}
                </div>
              </div>
              {d.isCurrent && <span className="tag tag-primary">Hiện tại</span>}
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
