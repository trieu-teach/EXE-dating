import { Link, useLocation } from 'react-router-dom'
import { getAvatarUrl } from '../../../utils/profilePhotos.js'
import ThemeToggle from '../ThemeToggle/ThemeToggle.jsx'
import './TopNav.css'

const NAV_ITEMS = [
  { id: 'discovery', to: '/discovery', label: 'Khám phá' },
  { id: 'events', to: '/events', label: 'Sự kiện' },
  { id: 'chat', to: '/chat', label: 'Tin nhắn' },
  { id: 'search', to: '/search', label: 'Tìm kiếm' },
  { id: 'love', to: '/love-tree', label: 'Cây yêu' },
]

function TopNav({ activeNav }) {
  const { pathname } = useLocation()

  function isActive(id) {
    if (activeNav) return activeNav === id
    if (id === 'discovery') return pathname === '/discovery' || pathname === '/match-success'
    if (id === 'search') return pathname === '/search'
    if (id === 'events') return pathname.startsWith('/events')
    if (id === 'chat') return pathname.startsWith('/chat')
    if (id === 'love') return pathname.startsWith('/love-tree')
    return false
  }

  const avatarUrl = getAvatarUrl()

  const profileActive =
    pathname.startsWith('/profile') ||
    pathname.startsWith('/settings') ||
    pathname === '/premium' ||
    pathname.startsWith('/safety') ||
    pathname === '/emergency-alert' ||
    pathname === '/safety-checkin'

  return (
    <header className="top-nav">
      <div className="top-nav__inner">
        <Link to="/discovery" className="top-nav__logo">
          <span className="top-nav__logo-mark" aria-hidden="true">
            ♥
          </span>
          SameMess
        </Link>

        <nav className="top-nav__links" aria-label="Điều hướng chính">
          {NAV_ITEMS.map(({ id, to, label, disabled }) =>
            disabled ? (
              <span key={id} className="top-nav__link top-nav__link--disabled">
                {label}
              </span>
            ) : (
              <Link
                key={id}
                to={to}
                className={`top-nav__link${isActive(id) ? ' top-nav__link--active' : ''}`}
                aria-current={isActive(id) ? 'page' : undefined}
              >
                {label}
              </Link>
            ),
          )}
        </nav>

        <div className="top-nav__actions">
          <ThemeToggle className="theme-toggle--compact top-nav__theme" />
          <Link
            to="/settings/discovery"
            className="top-nav__icon-btn"
            aria-label="Bộ lọc khám phá"
          >
            <FilterIcon />
          </Link>
          <Link
            to="/profile"
            className={`top-nav__avatar${profileActive ? ' top-nav__avatar--active' : ''}`}
            aria-label="Hồ sơ của tôi"
          >
            <img src={avatarUrl} alt="" />
          </Link>
        </div>
      </div>
    </header>
  )
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  )
}

export default TopNav
