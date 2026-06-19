import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { safetyService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'

export default function SafetyPinForgot() {
  const navigate = useNavigate()
  const toast = useToast()
  const [submitting, setSubmitting] = useState(false)

  const handleSend = async () => {
    setSubmitting(true)
    try {
      await safetyService.forgotPin({ channel: 'email' })
      toast.success('Đã gửi OTP đến email của bạn.')
      navigate('/safety-pin-otp')
    } catch (err) {
      toast.error(err?.message || 'Không gửi được OTP.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page" style={{ alignItems: 'flex-start' }}>
      <div className="auth-card" style={{ maxWidth: 420 }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/safety')} style={{ alignSelf: 'flex-start', marginBottom: 12 }}>
          ← An toàn
        </button>
        <h1>Quên PIN?</h1>
        <p className="auth-subtitle">
          Hệ thống sẽ gửi mã OTP đến email đăng ký. Sau khi xác minh, bạn có thể đặt PIN mới.
        </p>
        <button type="button" className="btn btn-primary btn-block" onClick={handleSend} disabled={submitting}>
          {submitting ? <span className="spinner" /> : 'Gửi mã OTP'}
        </button>
      </div>
    </main>
  )
}
