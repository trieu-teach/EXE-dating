import { Link, useLocation } from 'react-router-dom'
import './SideNav.css'

const NAV_ITEMS = [
  { id: 'home', to: '/discovery', label: 'Trang chủ', Icon: HomeIcon },
  { id: 'discovery', to: '/discovery', label: 'Khám phá', Icon: DiscoverIcon },
  { id: 'events', to: '/discovery', label: 'Sự kiện', Icon: EventsIcon, disabled: true },
  { id: 'messages', to: '/discovery', label: 'Tin nhắn', Icon: MessagesIcon, disabled: true },
  { id: 'profile', to: '/profile', label: 'Hồ sơ', Icon: ProfileIcon },
]

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z" />
    </svg>
  )
}

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
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" />
    </svg>
  )
}

function MessagesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 12a8 8 0 01-8 8H7l-4 3V12a8 8 0 018-8h4a8 8 0 018 8z" />
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

function SideNav({ activeNav }) {
  const { pathname } = useLocation()

  function isActive(id) {
    if (activeNav) return activeNav === id
    if (id === 'profile') return pathname.startsWith('/profile') || pathname.startsWith('/settings')
    if (id === 'discovery' || id === 'home') {
      return pathname === '/discovery' || pathname.startsWith('/settings/discovery')
    }
    return false
  }

  return (
    <aside className="side-nav" aria-label="Điều hướng chính">
      <Link to="/discovery" className="side-nav__brand">
        SameMess
      </Link>

      <ul className="side-nav__list">
        {NAV_ITEMS.map(({ id, to, label, Icon, disabled }) => (
          <li key={id}>
            {disabled ? (
              <span className="side-nav__link side-nav__link--disabled" aria-disabled="true">
                <Icon />
                <span>{label}</span>
              </span>
            ) : (
              <Link
                to={to}
                className={`side-nav__link${isActive(id) ? ' side-nav__link--active' : ''}`}
                aria-current={isActive(id) ? 'page' : undefined}
              >
                <Icon />
                <span>{label}</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default SideNav
