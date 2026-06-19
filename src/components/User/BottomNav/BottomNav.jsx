import { NavLink } from 'react-router-dom'
import { Flame, Heart, MessageCircle, User } from 'lucide-react'

const ITEMS = [
  { to: '/discovery', label: 'Khám phá', Icon: Flame },
  { to: '/matches', label: 'Match', Icon: Heart },
  { to: '/chat', label: 'Tin nhắn', Icon: MessageCircle },
  { to: '/profile', label: 'Cá nhân', Icon: User },
]

export default function BottomNav() {
  return (
    <nav className="bottomnav" aria-label="Menu dưới">
      <div className="bottomnav-list">
        {ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `bottomnav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={22} strokeWidth={2} className="bottomnav-icon-svg" />
            <span className="bottomnav-label">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
