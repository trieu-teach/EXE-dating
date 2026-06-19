import TopNav from '../TopNav/TopNav.jsx'
import { useAuth } from '../../../context/AuthContext.jsx'
import './AppShell.css'

export default function AppShell({ children, variant = 'constrained' }) {
  return (
    <div className="app-shell">
      <TopNav />
      <div className="app-shell-body">
        <main className={variant === 'full' ? 'app-shell-main full' : 'app-shell-main'}>
          {children}
        </main>
      </div>
    </div>
  )
}
