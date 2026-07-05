import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext.jsx'
import NotificationBell from '../NotificationBell/NotificationBell.jsx'
import AvatarFrame from '../AvatarFrame/AvatarFrame.jsx'
import { subscriptionService } from '../../../api'
import { resolveImageUrl } from '../../../utils/format.js'
import { Ticket } from 'lucide-react'
import {
  FireIcon, HeartIcon, MessageIcon, LeafIcon, StarIcon, CrownIcon,
  UserIcon, TrophyIcon, SettingsIcon, LogOutIcon, ShieldCheckIcon,
} from '../../ui/CustomIcons.jsx'
import './SideNav.css'

const NAV = [
  { to: '/discovery', label: 'Khám phá', Icon: FireIcon },
  { to: '/matches', label: 'Match', Icon: HeartIcon },
  { to: '/chat', label: 'Tin nhắn', Icon: MessageIcon },
  { to: '/love-tree', label: 'Cây tình yêu', Icon: LeafIcon },
  { to: '/daily-connection', label: 'Hằng ngày', Icon: StarIcon },
  { to: '/date-pass', label: 'Ưu đãi', Icon: Ticket },
  { to: '/premium', label: 'Premium', Icon: CrownIcon },
  { to: '/profile', label: 'Hồ sơ', Icon: UserIcon },
  { to: '/reputation', label: 'Uy tín', Icon: TrophyIcon },
]

const PLAN_LABEL = { Gold: 'Thành viên Gold', Plus: 'Thành viên Plus', Free: 'Gói miễn phí' }

/** Sidebar điều hướng bên trái — thay thế header ngang cũ. */
export default function SideNav() {
  const { user } = useAuth()
  const [plan, setPlan] = useState(null)
  const avatar = resolveImageUrl(user?.avatarUrl || user?.photoUrl)
  const isAdmin = user?.role === 'Admin'

  useEffect(() => {
    subscriptionService.me()
      .then((s) => setPlan(s?.planCode || 'Free'))
      .catch(() => setPlan('Free'))
  }, [])

  return (
    <aside className="sidenav">
      <Link to="/discovery" className="sidenav-brand">
        <span className="sidenav-brand-text">SameMess</span>
      </Link>

      {/* Khối người dùng: avatar + tên + chuông (dòng 1), badge gói (dòng 2) */}
      <div className="sidenav-user">
        <div className="sidenav-user-row1">
          <AvatarFrame frame={user?.avatarFrame} size="sm">
            <Link
              to="/profile"
              className="sidenav-avatar"
              style={avatar ? { backgroundImage: `url(${avatar})` } : undefined}
              aria-label="Hồ sơ của tôi"
            />
          </AvatarFrame>
          <div className="sidenav-user-name">{user?.displayName || 'Bạn'}</div>
          <div className="sidenav-user-actions">
            <NotificationBell />
          </div>
        </div>
        <div className="sidenav-user-row2">
          <span className="sidenav-user-plan">
            <CrownIcon size={12} />
            {isAdmin ? 'Quản trị viên' : (plan ? PLAN_LABEL[plan] ?? plan : '…')}
          </span>
        </div>
      </div>

      <nav className="sidenav-links" aria-label="Menu chính">
        {NAV.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `sidenav-link${isActive ? ' active' : ''}`}>
            <Icon size={20} />
            <span className="sidenav-link-label">{label}</span>
          </NavLink>
        ))}
        {isAdmin && (
          <NavLink to="/admin" className="sidenav-link">
            <ShieldCheckIcon size={20} />
            <span className="sidenav-link-label">Trang quản trị</span>
          </NavLink>
        )}
      </nav>

      {/* CTA nâng cấp — ẩn với admin và người đã có Gold */}
      {!isAdmin && plan && plan !== 'Gold' && (
        <Link to="/premium" className="sidenav-upgrade">
          <CrownIcon size={17} />
          <span className="sidenav-link-label">Nâng cấp Premium</span>
        </Link>
      )}

      <div className="sidenav-foot">
        <NavLink to="/settings" className={({ isActive }) => `sidenav-link${isActive ? ' active' : ''}`}>
          <SettingsIcon size={20} />
          <span className="sidenav-link-label">Cài đặt</span>
        </NavLink>
        <Link to="/logout" className="sidenav-link">
          <LogOutIcon size={20} />
          <span className="sidenav-link-label">Đăng xuất</span>
        </Link>
      </div>
    </aside>
  )
}
