import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext.jsx'
import { useToast } from '../../../context/ToastContext.jsx'

import { validateOtp } from '../../../utils/validation.js'

export default function VerifyOtp() {
  const location = useLocation()
  const navigate = useNavigate()
  const { verifyEmail, register } = useAuth()
  const toast = useToast()
  const email = location.state?.email || ''
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const inputs = useRef([])

  useEffect(() => {
    if (!email) navigate('/register', { replace: true })
  }, [email, navigate])

  useEffect(() => { inputs.current[0]?.focus() }, [])

  const setDigit = (i, v) => {
    const digit = v.replace(/\D/g, '').slice(0, 1)
    const next = [...otp]
    next[i] = digit
    setOtp(next)
    if (digit && i < 5) inputs.current[i + 1]?.focus()
  }

  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus()
  }

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!text) return
    e.preventDefault()
    const next = [...otp]
    for (let i = 0; i < text.length; i++) next[i] = text[i]
    setOtp(next)
    inputs.current[Math.min(5, text.length - 1)]?.focus()
  }

  const handleSubmit = async (e) => {
    e?.preventDefault?.()
    const code = otp.join('')
    const v = validateOtp(code)
    if (v) { setError(v); return }
    setSubmitting(true)
    setError('')
    try {
      await verifyEmail({ email, otpCode: code })
      toast.success('Xác thực thành công!')
      navigate('/onboarding/preferences', { replace: true })
    } catch (err) {
      setError(err?.message || 'OTP không đúng hoặc đã hết hạn.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      // re-call register to trigger another OTP email
      await register({ email, password: '__noop__', displayName: '__noop__' }).catch(() => null)
      toast.info('Đã gửi lại mã OTP (nếu email hợp lệ).')
    } finally {
      setResending(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Nhập mã OTP</h1>
        <p className="auth-subtitle">
          Mã 6 số đã gửi đến <strong>{email}</strong>
        </p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }} onPaste={handlePaste}>
            {otp.map((d, i) => (
              <input
                key={i}
                ref={(el) => { inputs.current[i] = el }}
                value={d}
                onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={(e) => handleKey(i, e)}
                inputMode="numeric"
                maxLength={1}
                style={{ width: 44, textAlign: 'center', fontSize: 22 }}
                aria-label={`OTP digit ${i + 1}`}
              />
            ))}
          </div>
          {error && <div className="auth-form-error">{error}</div>}
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? <span className="spinner" /> : 'Xác nhận'}
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-block"
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? 'Đang gửi lại…' : 'Gửi lại mã'}
          </button>
        </form>
        <p className="auth-form-footer">
          <Link to="/register">← Đăng ký lại</Link>
        </p>
      </div>
    </main>
  )
}
