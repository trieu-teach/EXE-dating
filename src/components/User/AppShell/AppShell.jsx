import { useLocation } from 'react-router-dom'
import TopNav from '../TopNav/TopNav.jsx'
import BannerFX from '../BannerFX/BannerFX.jsx'
import SideHearts from '../../ui/SideHearts.jsx'
import './AppShell.css'

// Cấu hình emoji nền hai bên theo route. Trả về null = không hiện.
// gutter = nửa bề rộng nội dung của trang (px) để chừa đúng khoảng trống.
function sideConfig(pathname) {
  const p = pathname.toLowerCase()
  // Trang full-width không hiện (Chat, Premium) hoặc đã tự xử lý (Discovery)
  if (p.startsWith('/chat') || p.startsWith('/premium') || p.startsWith('/discovery')) return null
  if (p.startsWith('/love-tree')) return null // trang Cây có nền immersive riêng
  // Trang full-width có nội dung rộng -> chừa nhiều hơn
  if (p.startsWith('/date-pass')) return { theme: 'datepass', gutter: 560 }
  // Trang constrained (max-width 720 -> nửa = 360)
  let theme = 'love'
  if (p.startsWith('/matches') || p.startsWith('/liked-me')) theme = 'matches'
  else if (p.startsWith('/profile')) theme = 'profile'
  else if (p.startsWith('/reputation')) theme = 'reputation'
  else if (p.startsWith('/tasks')) theme = 'tasks'
  else if (p.startsWith('/daily-connection')) theme = 'daily'
  else if (p.startsWith('/event')) theme = 'events'
  else if (p.startsWith('/meet-up')) theme = 'meetup'
  else if (p.startsWith('/search')) theme = 'search'
  else if (p.startsWith('/account-verification')) theme = 'verify'
  else if (p.startsWith('/settings')) theme = 'settings'
  else if (p.startsWith('/match-success')) theme = 'celebrate'
  return { theme, gutter: 360 }
}

export default function AppShell({ children, variant = 'constrained' }) {
  const { pathname } = useLocation()
  const cfg = sideConfig(pathname)

  return (
    <div className="app-shell">
      <BannerFX />
      <TopNav />
      <div className="app-shell-body">
        {cfg && <SideHearts theme={cfg.theme} gutter={cfg.gutter} />}
        <main className={variant === 'full' ? 'app-shell-main full' : 'app-shell-main'}>
          {children}
        </main>
      </div>
    </div>
  )
}
