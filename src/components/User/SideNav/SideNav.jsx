import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext.jsx'
import NotificationBell from '../NotificationBell/NotificationBell.jsx'
import AvatarFrame from '../AvatarFrame/AvatarFrame.jsx'
import { subscriptionService } from '../../../api'
import { resolveImageUrl } from '../../../utils/format.js'
import {
  Flame, Heart, MessageCircle, Leaf, Star, Ticket,
  Crown, User, Trophy, Settings, LogOut, ShieldCheck,
} from 'lucide-react'
import './SideNav.css'

const NAV = [
  { to: '/discovery', label: 'Khám phá', Icon: Flame },
  { to: '/matches', label: 'Match', Icon: Heart },
  { to: '/chat', label: 'Tin nhắn', Icon: MessageCircle },
  { to: '/love-tree', label: 'Cây tình yêu', Icon: Leaf },
  { to: '/daily-connection', label: 'Hằng ngày', Icon: Star },
  { to: '/date-pass', label: 'Ưu đãi', Icon: Ticket },
  { to: '/premium', label: 'Premium', Icon: Crown },
  { to: '/profile', label: 'Hồ sơ', Icon: User },
  { to: '/reputation', label: 'Uy tín', Icon: Trophy },
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
            <Crown size={12} />
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
            <ShieldCheck size={20} />
            <span className="sidenav-link-label">Trang quản trị</span>
          </NavLink>
        )}
      </nav>

      {/* CTA nâng cấp — ẩn với admin và người đã có Gold */}
      {!isAdmin && plan && plan !== 'Gold' && (
        <Link to="/premium" className="sidenav-upgrade">
          <Crown size={17} />
          <span className="sidenav-link-label">Nâng cấp Premium</span>
        </Link>
      )}

      <div className="sidenav-foot">
        <NavLink to="/settings" className={({ isActive }) => `sidenav-link${isActive ? ' active' : ''}`}>
          <Settings size={20} />
          <span className="sidenav-link-label">Cài đặt</span>
        </NavLink>
        <Link to="/logout" className="sidenav-link">
          <LogOut size={20} />
          <span className="sidenav-link-label">Đăng xuất</span>
        </Link>
      </div>
    </aside>
  )
}
