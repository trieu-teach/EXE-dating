import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { safetyService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'
import { validatePin } from '../../../utils/validation.js'

export default function SafetyPinSetup() {
  const navigate = useNavigate()
  const toast = useToast()
  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const v1 = validatePin(pin)
    if (v1) { setError(v1); return }
    if (pin !== confirm) { setError('Mã PIN nhập lại không khớp.'); return }
    setSubmitting(true)
    setError('')
    try {
      await safetyService.setupPin({ pin })
      toast.success('Đã đặt PIN an toàn.')
      navigate('/safety')
    } catch (err) {
      setError(err?.message || 'Không đặt được PIN.')
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
        <h1>Đặt mã PIN</h1>
        <p className="auth-subtitle">PIN 4–6 chữ số dùng để mở khoá app và xác nhận khẩn cấp.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label className="field-label">PIN</label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
            />
          </div>
          <div className="field">
            <label className="field-label">Nhập lại PIN</label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
            />
          </div>
          {error && <div className="auth-form-error">{error}</div>}
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? <span className="spinner" /> : 'Lưu PIN'}
          </button>
        </form>
      </div>
    </main>
  )
}
