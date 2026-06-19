import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { safetyService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'
import { validateOtp } from '../../../utils/validation.js'

export default function SafetyPinOtp() {
  const navigate = useNavigate()
  const toast = useToast()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
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
    const v = validateOtp(code)
    if (v) { setError(v); return }
    setSubmitting(true)
    setError('')
    try {
      await safetyService.verifyPinOtp({ otp: code })
      toast.success('Xác minh thành công. Hãy đặt PIN mới.')
      navigate('/safety-pin-setup')
    } catch (err) {
      setError(err?.message || 'OTP không đúng.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page" style={{ alignItems: 'flex-start' }}>
      <div className="auth-card" style={{ maxWidth: 420 }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ alignSelf: 'flex-start', marginBottom: 12 }}>
          ← Quay lại
        </button>
        <h1>Nhập mã OTP</h1>
        <p className="auth-subtitle">Mã đã được gửi đến email của bạn.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {otp.map((d, i) => (
              <input
                key={i}
                ref={(el) => { inputs.current[i] = el }}
                value={d}
                onChange={(e) => setDigit(i, e.target.value)}
                inputMode="numeric"
                maxLength={1}
                style={{ width: 44, textAlign: 'center', fontSize: 22 }}
              />
            ))}
          </div>
          {error && <div className="auth-form-error">{error}</div>}
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? <span className="spinner" /> : 'Xác nhận'}
          </button>
        </form>
      </div>
    </main>
  )
}
