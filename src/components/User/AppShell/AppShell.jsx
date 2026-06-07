import TopNav from '../TopNav/TopNav.jsx'
import BottomNav from '../BottomNav/BottomNav.jsx'
import './AppShell.css'

function AppShell({ children, activeNav, focusMode = false }) {
  return (
    <div className={`app-shell${focusMode ? ' app-shell--focus' : ''}`}>
      <div className="app-shell__bg" aria-hidden="true">
        <div className="app-shell__blob app-shell__blob--1" />
        <div className="app-shell__blob app-shell__blob--2" />
      </div>

      {!focusMode && <TopNav activeNav={activeNav} />}

      <main className="app-shell__content">{children}</main>

      {!focusMode && <BottomNav />}
    </div>
  )
}

export default AppShell
