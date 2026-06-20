import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { settingsService } from '../../../../api'
import { useToast } from '../../../../context/ToastContext.jsx'
import { timeAgo } from '../../../../utils/format.js'
import { ShieldCheckIcon } from '../../../../components/ui/CustomIcons.jsx'
import '../SettingsHub.css'
import './Devices.css'

function parseUA(ua = '') {
  let os = 'Thiết bị lạ'
  if (/Windows/.test(ua)) os = 'Windows'
  else if (/Mac OS X|Macintosh/.test(ua)) os = 'macOS'
  else if (/Android/.test(ua)) os = 'Android'
  else if (/iPhone|iPad|iOS/.test(ua)) os = 'iOS'
  else if (/Linux/.test(ua)) os = 'Linux'

  let browser = 'Trình duyệt'
  if (/Edg\//.test(ua)) browser = 'Edge'
  else if (/OPR\/|Opera/.test(ua)) browser = 'Opera'
  else if (/Chrome\//.test(ua)) browser = 'Chrome'
  else if (/Firefox\//.test(ua)) browser = 'Firefox'
  else if (/Safari\//.test(ua)) browser = 'Safari'

  const isMobile = /Android|iPhone|iPad|Mobile/.test(ua)
  return { os, browser, isMobile }
}

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
    <div className="dev-root">
      <header className="dev-hero">
        <button type="button" className="dev-back" onClick={() => navigate('/settings/security')}>← Bảo mật</button>
        <div className="dev-hero-main">
          <div className="dev-hero-icon"><ShieldCheckIcon size={24} /></div>
          <div>
            <h1 className="dev-hero-title">Thiết bị đã đăng nhập</h1>
            <p className="dev-hero-sub">{devices.length} phiên đang hoạt động trên tài khoản của bạn.</p>
          </div>
        </div>
      </header>

      <div className="dev-body">
        {devices.length === 0 ? (
          <div className="empty">Không có thiết bị nào được ghi nhận.</div>
        ) : (
          <div className="settings-section-card">
            {devices.map((d, i) => {
              const { os, browser, isMobile } = parseUA(d.userAgent)
              return (
                <div key={d.id || i} className="settings-item dev-item">
                  <div className="settings-item-icon dev-item-icon">{isMobile ? '📱' : '💻'}</div>
                  <div className="settings-item-text">
                    <div className="settings-item-label">{browser} · {os}</div>
                    <div className="settings-item-desc">
                      {d.ipAddress ? `IP ${d.ipAddress} · ` : ''}Đăng nhập {timeAgo(d.createdAt)}
                    </div>
                  </div>
                  {i === 0 && <span className="dev-current">Gần đây nhất</span>}
                </div>
              )
            })}
          </div>
        )}
        <p className="dev-note">Đổi mật khẩu sẽ đăng xuất tất cả thiết bị ở trên.</p>
      </div>
    </div>
  )
}
