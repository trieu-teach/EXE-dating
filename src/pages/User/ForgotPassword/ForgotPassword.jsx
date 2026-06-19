import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../../../context/ToastContext.jsx'
import { authService } from '../../../api'
import { validateEmail } from '../../../utils/validation.js'
import ThemeToggle from '../../../components/User/ThemeToggle/ThemeToggle.jsx'

export default function ForgotPassword() {
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const v = validateEmail(email)
    if (v) { setError(v); return }
    setError('')
    setSubmitting(true)
    try {
      await authService.forgotPassword({ email: email.trim() })
      setSent(true)
      toast.success('Đã gửi OTP đến email.')
    } catch (err) {
      toast.error(err?.message || 'Không gửi được OTP.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-theme-row">
          <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>💗 SameMess</span>
          <ThemeToggle />
        </div>
        <h1>Quên mật khẩu</h1>
        <p className="auth-subtitle">Nhập email để nhận mã OTP đặt lại mật khẩu.</p>
        {sent ? (
          <div className="auth-form">
            <div className="auth-form-error" style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}>
              Đã gửi mã đến <strong>{email}</strong>. Kiểm tra hộp thư (kể cả spam).
            </div>
            <Link to="/reset-password" state={{ email }} className="btn btn-primary btn-block" style={{ textAlign: 'center' }}>
              Tiếp tục đặt lại mật khẩu
            </Link>
            <Link to="/login" className="btn btn-ghost btn-block" style={{ textAlign: 'center' }}>← Quay lại đăng nhập</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field">
              <label className="field-label">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              {error && <div className="field-error">{error}</div>}
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? <span className="spinner" /> : 'Gửi mã OTP'}
            </button>
            <Link to="/login" className="auth-form-footer">← Quay lại đăng nhập</Link>
          </form>
        )}
      </div>
    </main>
  )
}
