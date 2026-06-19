import { NavLink } from 'react-router-dom'
import { HeartIcon, MessageIcon, TreeIcon, SparkleIcon, CalendarIcon, SearchIcon, CrownIcon, ShieldIcon, UserIcon, SettingsIcon } from '../../ui/CustomIcons.jsx'

const SIDE_LINKS = [
  { to: '/discovery', label: 'Khám phá', Icon: HeartIcon },
  { to: '/matches', label: 'Matches', Icon: HeartIcon },
  { to: '/chat', label: 'Tin nhắn', Icon: MessageIcon },
  { to: '/love-tree', label: 'Cây tình yêu', Icon: TreeIcon },
  { to: '/daily-connection', label: 'Hằng ngày', Icon: SparkleIcon },
  { to: '/events', label: 'Sự kiện', Icon: CalendarIcon },
  { to: '/search', label: 'Tìm kiếm', Icon: SearchIcon },
  { to: '/premium', label: 'Premium', Icon: CrownIcon },
  { to: '/safety', label: 'An toàn', Icon: ShieldIcon },
  { to: '/profile', label: 'Hồ sơ', Icon: UserIcon },
  { to: '/settings', label: 'Cài đặt', Icon: SettingsIcon },
]

export default function SideNav() {
  return (
    <aside className="sidenav" aria-label="Menu chính">
      {SIDE_LINKS.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          className={({ isActive }) => `sidenav-link${isActive ? ' is-active' : ''}`}
        >
          <l.Icon size={18} />
          <span>{l.label}</span>
        </NavLink>
      ))}
    </aside>
  )
}
