import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useToast } from '../../../context/ToastContext.jsx'
import { authService } from '../../../api'
import { validateOtp, validatePassword } from '../../../utils/validation.js'

export default function ResetPassword() {
  const location = useLocation()
  const navigate = useNavigate()
  const toast = useToast()
  const initialEmail = location.state?.email || ''
  const [email, setEmail] = useState(initialEmail)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inputs = useRef([])

  useEffect(() => { inputs.current[0]?.focus() }, [])

  const setDigit = (i, v) => {
    const digit = v.replace(/\D/g, '').slice(0, 1)
    const next = [...otp]
    next[i] = digit
    setOtp(next)
    if (digit && i < 5) inputs.current[i + 1]?.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    const v1 = validateOtp(code)
    const v2 = validatePassword(newPassword)
    if (v1) { setError(v1); return }
    if (v2) { setError(v2); return }
    setError('')
    setSubmitting(true)
    try {
      await authService.resetPassword({ email: email.trim(), otpCode: code, newPassword })
      toast.success('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.')
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err?.message || 'OTP không đúng hoặc đã hết hạn.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Đặt lại mật khẩu</h1>
        <p className="auth-subtitle">Nhập email, mã OTP và mật khẩu mới.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label className="field-label">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label className="field-label">Mã OTP</label>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { inputs.current[i] = el }}
                  value={d}
                  onChange={(e) => setDigit(i, e.target.value)}
                  inputMode="numeric"
                  maxLength={1}
                  style={{ width: 44, textAlign: 'center', fontSize: 20 }}
                />
              ))}
            </div>
          </div>
          <div className="field">
            <label className="field-label">Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="auth-form-error">{error}</div>}
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? <span className="spinner" /> : 'Đổi mật khẩu'}
          </button>
          <Link to="/login" className="auth-form-footer">← Quay lại đăng nhập</Link>
        </form>
      </div>
    </main>
  )
}
