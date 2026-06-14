import { Link, useLocation, useNavigate } from 'react-router-dom'
import { clearAdmin, getAdmin } from '../../../utils/adminSession.js'

const NAV_GROUPS = [
  {
    label: 'Tổng quan',
    items: [
      { to: '/admin', icon: '📊', label: 'Dashboard' },
    ],
  },
  {
    label: 'Người dùng',
    items: [
      { to: '/admin/users', icon: '👥', label: 'Người dùng' },
      { to: '/admin/verifications', icon: '✅', label: 'Xác minh danh tính', badge: 14 },
      { to: '/admin/reports', icon: '🚨', label: 'Báo cáo vi phạm', badge: 5 },
      { to: '/admin/photos', icon: '🖼️', label: 'Duyệt ảnh' },
    ],
  },
  {
    label: 'Nội dung',
    items: [
      { to: '/admin/events', icon: '🎉', label: 'Sự kiện' },
      { to: '/admin/premium', icon: '💎', label: 'Gói Premium' },
      { to: '/admin/interests', icon: '🏷️', label: 'Sở thích' },
    ],
  },
  {
    label: 'Hệ thống',
    items: [
      { to: '/admin/settings', icon: '⚙️', label: 'Cài đặt' },
      { to: '/admin/audit', icon: '🕓', label: 'Audit log' },
    ],
  },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const admin = getAdmin()

  function isActive(to) {
    if (to === '/admin') return location.pathname === '/admin'
    return location.pathname === to || location.pathname.startsWith(to + '/')
  }

  function handleLogout() {
    clearAdmin()
    navigate('/admin/login', { replace: true })
  }

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <span className="admin-sidebar__brand-mark">♥</span>
        <div className="admin-sidebar__brand-text">
          <span>SameMess</span>
          <span className="admin-sidebar__brand-sub">Admin Console</span>
        </div>
      </div>

      <nav className="admin-sidebar__nav" aria-label="Menu quản trị">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="admin-sidebar__group-label">{group.label}</div>
            {group.items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`admin-sidebar__link${isActive(item.to) ? ' admin-sidebar__link--active' : ''}`}
              >
                <span className="admin-sidebar__link-icon" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
                {item.badge ? <span className="admin-sidebar__link-badge">{item.badge}</span> : null}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="admin-sidebar__footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <img
            src={admin?.avatarUrl || 'https://i.pravatar.cc/100?img=68'}
            alt=""
            style={{ width: 32, height: 32, borderRadius: '50%' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {admin?.name || 'Admin'}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{admin?.role || 'super_admin'}</div>
          </div>
        </div>
        <button className="admin-btn admin-btn--sm admin-btn--ghost" onClick={handleLogout} style={{ width: '100%', color: '#cbd5e1' }}>
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}
