import { Link } from 'react-router-dom'
import { useAuth } from '../../../../context/AuthContext.jsx'
import { ShieldIcon, KeyIcon, ShieldCheckIcon, ChevronRightIcon, LogOutIcon } from '../../../../components/ui/CustomIcons.jsx'
import '../SettingsHub.css'
import './SecuritySettings.css'

export default function SecuritySettings() {
  const { logout } = useAuth()

  return (
    <div className="sec-root">
      <header className="sec-hero">
        <div className="sec-hero-icon"><ShieldIcon size={26} /></div>
        <div>
          <h1 className="sec-hero-title">Bảo mật tài khoản</h1>
          <p className="sec-hero-sub">Quản lý mật khẩu và các phiên đăng nhập của bạn.</p>
        </div>
      </header>

      <div className="sec-body">
        <div className="settings-section">
          <div className="settings-section-title">Tài khoản</div>
          <div className="settings-section-card">
            <Link to="/settings/change-password" className="settings-item">
              <div className="settings-item-icon"><KeyIcon size={18} /></div>
              <div className="settings-item-text">
                <div className="settings-item-label">Đổi mật khẩu</div>
                <div className="settings-item-desc">Cập nhật mật khẩu — sẽ thu hồi mọi phiên đăng nhập</div>
              </div>
              <ChevronRightIcon size={16} className="settings-item-arrow" />
            </Link>
            <Link to="/settings/devices" className="settings-item">
              <div className="settings-item-icon"><ShieldCheckIcon size={18} /></div>
              <div className="settings-item-text">
                <div className="settings-item-label">Thiết bị đã đăng nhập</div>
                <div className="settings-item-desc">Xem và thu hồi các phiên trên thiết bị khác</div>
              </div>
              <ChevronRightIcon size={16} className="settings-item-arrow" />
            </Link>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-title">Phiên đăng nhập</div>
          <button type="button" className="settings-logout-btn" onClick={logout}>
            <LogOutIcon size={16} /> Đăng xuất
          </button>
        </div>
      </div>
    </div>
  )
}
