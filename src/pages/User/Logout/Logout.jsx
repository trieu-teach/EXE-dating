import { Link } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext.jsx'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Logout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    let cancelled = false
    logout().finally(() => { if (!cancelled) navigate('/', { replace: true }) })
    return () => { cancelled = true }
  }, [logout, navigate])
  return (
    <main className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <h1>Đang đăng xuất…</h1>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>Về trang chủ</Link>
      </div>
    </main>
  )
}
