import SideNav from '../SideNav/SideNav.jsx'
import BannerFX from '../BannerFX/BannerFX.jsx'
import SakuraFall from '../SakuraFall/SakuraFall.jsx'
import './AppShell.css'

export default function AppShell({ children, variant = 'constrained' }) {
  return (
    <div className="app-shell">
      <BannerFX />
      <SakuraFall />
      <SideNav />
      <div className="app-shell-body">
        <main className={variant === 'full' ? 'app-shell-main full' : 'app-shell-main'}>
          {children}
        </main>
      </div>
    </div>
  )
}
