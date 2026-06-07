import { Link, useLocation } from 'react-router-dom'
import './BottomNav.css'

const NAV_ITEMS = [
  { id: 'discovery', to: '/discovery', label: 'Khám phá', Icon: DiscoverIcon },
  { id: 'events', to: '/events', label: 'Sự kiện', Icon: EventsIcon },
  { id: 'chat', to: '/chat', label: 'Chat', Icon: ChatIcon },
  { id: 'love', to: '/love-tree', label: 'Cây yêu', Icon: TreeIcon },
  { id: 'profile', to: '/profile', label: 'Hồ sơ', Icon: ProfileIcon },
]

function DiscoverIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="4" width="14" height="18" rx="2" />
      <rect x="7" y="2" width="14" height="18" rx="2" />
    </svg>
  )
}

function EventsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 15a2 2 0 01-2 2H8l-5 3V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  )
}

function TreeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 22V12M8 12h8M10 8h4M9 4h6" />
      <circle cx="12" cy="4" r="2" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-4 6-6 8-6s6.5 2 8 6" />
    </svg>
  )
}

function BottomNav() {
  const { pathname } = useLocation()

  function isActive(id) {
    if (id === 'profile') {
      return (
        pathname.startsWith('/profile') ||
        pathname.startsWith('/settings') ||
        pathname === '/premium' ||
        pathname.startsWith('/safety') ||
        pathname === '/emergency-alert' ||
        pathname === '/safety-checkin'
      )
    }
    if (id === 'discovery') {
      return pathname === '/discovery' || pathname === '/match-success'
    }
    if (id === 'events') return pathname.startsWith('/events')
    if (id === 'chat') return pathname.startsWith('/chat')
    if (id === 'love') return pathname.startsWith('/love-tree')
    return false
  }

  return (
    <nav className="bottom-nav" aria-label="Điều hướng chính">
      <ul className="bottom-nav__list">
        {NAV_ITEMS.map(({ id, to, label, Icon, disabled }) => (
          <li key={id} className="bottom-nav__item">
            {disabled ? (
              <span className="bottom-nav__link bottom-nav__link--disabled" aria-disabled="true">
                <Icon />
                <span>{label}</span>
              </span>
            ) : (
              <Link
                to={to}
                className={`bottom-nav__link${isActive(id) ? ' bottom-nav__link--active' : ''}`}
                aria-current={isActive(id) ? 'page' : undefined}
              >
                <Icon />
                <span>{label}</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default BottomNav
