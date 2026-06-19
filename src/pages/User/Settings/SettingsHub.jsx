import { Link } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext.jsx'
import { useToast } from '../../../context/ToastContext.jsx'
import {
  CompassIcon, StarIcon, ShieldIcon, SmartphoneIcon,
  KeyIcon, HeartIcon, ShieldCheckIcon, CrownIcon, LogOutIcon,
  ChevronRightIcon, UserIcon
} from '../../../components/ui/CustomIcons.jsx'
import { motion } from 'framer-motion'
import { cn } from '../../../lib/utils'
import './SettingsHub.css'

const SECTIONS = [
  {
    title: 'Cá nhân',
    items: [
      { to: '/settings/discovery', label: 'Tiêu chí khám phá', desc: 'Giới tính, tuổi, khoảng cách', Icon: CompassIcon },
      { to: '/settings/interests', label: 'Sở thích', desc: 'Quản lý sở thích của bạn', Icon: StarIcon },
    ],
  },
  {
    title: 'Bảo mật',
    items: [
      { to: '/settings/security', label: 'Bảo mật & đăng nhập', desc: 'Xem phiên đăng nhập, mật khẩu', Icon: ShieldIcon },
      { to: '/settings/devices', label: 'Thiết bị đã đăng nhập', desc: 'Quản lý thiết bị', Icon: SmartphoneIcon },
      { to: '/settings/change-password', label: 'Đổi mật khẩu', desc: 'Cập nhật mật khẩu mới', Icon: KeyIcon },
    ],
  },
  {
    title: 'Tài khoản',
    items: [
      { to: '/safety', label: 'An toàn & PIN', desc: 'Cài đặt PIN, check-in', Icon: HeartIcon },
      { to: '/account-verification', label: 'Xác minh khuôn mặt', desc: 'Xác minh danh tính', Icon: ShieldCheckIcon },
      { to: '/premium', label: 'Gói Premium', desc: 'Mở khóa tính năng cao cấp', Icon: CrownIcon, highlight: true },
    ],
  },
]

export default function SettingsHub() {
  const { user, logout } = useAuth()
  const toast = useToast()

  const initials = user?.displayName
    ? user.displayName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() || '?'

  return (
    <div className="settings-root">
      {/* Avatar header */}
      <div className="settings-avatar-header">
        <div className="settings-avatar-inner">
          <div className="settings-avatar-circle">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.displayName || 'Avatar'} />
            ) : (
              initials
            )}
          </div>
          <div className="settings-avatar-info">
            <div className="settings-avatar-name">
              {user?.displayName || 'Người dùng'}
            </div>
            <div className="settings-avatar-email">{user?.email}</div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="settings-sections">
        {SECTIONS.map((section, si) => (
          <div key={section.title} className="settings-section">
            <div className="settings-section-title">{section.title}</div>
            <div className="settings-section-card">
              {section.items.map((item, ii) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: si * 0.06 + ii * 0.04, duration: 0.25 }}
                >
                  <Link
                    to={item.to}
                    className={cn('settings-item', item.highlight && 'settings-item-highlight')}
                  >
                    <div className="settings-item-icon">
                      <item.Icon size={18} />
                    </div>
                    <div className="settings-item-text">
                      <div className="settings-item-label">
                        {item.label}
                        {item.highlight && (
                          <span className="settings-premium-badge" style={{ marginLeft: 8 }}>
                            PRO
                          </span>
                        )}
                      </div>
                      <div className="settings-item-desc">{item.desc}</div>
                    </div>
                    <ChevronRightIcon size={16} className="settings-item-arrow" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {/* Logout */}
        <motion.button
          type="button"
          className="settings-logout-btn"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onClick={async () => {
            await logout()
            toast.success('Đã đăng xuất.')
          }}
        >
          <LogOutIcon size={16} />
          Đăng xuất
        </motion.button>
      </div>
    </div>
  )
}
