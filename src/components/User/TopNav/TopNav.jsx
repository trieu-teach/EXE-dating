import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext.jsx'
import NotificationBell from '../NotificationBell/NotificationBell.jsx'
import ReputationBadge from '../ReputationBadge/ReputationBadge.jsx'
import { resolveImageUrl } from '../../../utils/format.js'
import { Heart, Flame, Calendar, Search, Shield, Settings, Leaf, Star } from 'lucide-react'

const NAV_LINKS = [
  { to: '/discovery', label: 'Khám phá', Icon: Flame },
  { to: '/matches', label: 'Match', Icon: Heart },
  { to: '/chat', label: 'Tin nhắn', Icon: null },
  { to: '/love-tree', label: 'Cây', Icon: Leaf },
  { to: '/daily-connection', label: 'Hằng ngày', Icon: Star },
  { to: '/events', label: 'Sự kiện', Icon: Calendar },
  { to: '/search', label: 'Tìm kiếm', Icon: Search },
  { to: '/premium', label: 'Premium', Icon: null },
  { to: '/safety', label: 'An toàn', Icon: Shield },
  { to: '/profile', label: 'Hồ sơ', Icon: null },
  { to: '/settings', label: 'Cài đặt', Icon: Settings },
]

export default function TopNav() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const avatar = resolveImageUrl(user?.avatarUrl || user?.photoUrl)

  return (
    <header className="topnav">
      <Link to={isAuthenticated ? '/discovery' : '/login'} className="topnav-brand">
        <div className="topnav-logo">
          <Heart size={16} fill="currentColor" />
        </div>
        <span className="topnav-logo-text">SameMess</span>
      </Link>

      {isAuthenticated && (
        <nav className="topnav-links" aria-label="Menu chính">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `topnav-link${isActive ? ' active' : ''}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}

      <div className="topnav-right">
        {isAuthenticated ? (
          <>
            <NotificationBell />
            <ReputationBadge size="sm" showLabel={false} />
            <div
              className="topnav-avatar"
              style={avatar ? { backgroundImage: `url(${avatar})` } : {}}
              onClick={() => navigate('/profile')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') navigate('/profile') }}
              aria-label="Hồ sơ"
            />
          </>
        ) : (
          <>
            <Link to="/login" className="topnav-auth-link">Đăng nhập</Link>
            <Link to="/register" className="topnav-auth-btn">Đăng ký</Link>
          </>
        )}
      </div>
    </header>
  )
}
