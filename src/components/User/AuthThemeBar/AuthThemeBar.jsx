import ThemeToggle from '../ThemeToggle/ThemeToggle.jsx'
import './AuthThemeBar.css'

/** Thanh theme trên trang auth (không có TopNav) */
export default function AuthThemeBar() {
  return (
    <div className="auth-theme-bar">
      <ThemeToggle className="theme-toggle--compact" />
    </div>
  )
}
