import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminAuthService } from '../../../api'
import { saveAdmin } from '../../../utils/adminSession.js'
import './Login.css'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@samemess.vn')
  const [password, setPassword] = useState('Abc123!@#')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await adminAuthService.login({ email, password })
      saveAdmin({ ...data.admin, token: data.token })
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <div className="admin-login__brand">
          <span className="admin-login__brand-mark">♥</span>
          <span>SameMess</span>
        </div>
        <h1 className="admin-login__title">Đăng nhập quản trị</h1>
        <p className="admin-login__sub">Vui lòng đăng nhập bằng tài khoản admin được cấp quyền.</p>

        <form className="admin-login__form" onSubmit={handleSubmit}>
          <div className="admin-form-row">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="admin-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="admin-form-row">
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              type="password"
              className="admin-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error ? (
            <div style={{ color: 'var(--admin-danger)', fontSize: 13, marginTop: -4 }}>
              {error}
            </div>
          ) : null}

          <button type="submit" className="admin-btn admin-btn--primary admin-btn--block" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="admin-login__hint">
          Demo: dùng bất kỳ email/password — frontend sẽ giả lập đăng nhập thành công.
        </div>
      </div>
    </div>
  )
}
