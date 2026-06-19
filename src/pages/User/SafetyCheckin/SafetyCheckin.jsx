import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { safetyService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'

export default function SafetyCheckin() {
  const navigate = useNavigate()
  const toast = useToast()
  const [submitting, setSubmitting] = useState(null)

  const handle = async (status) => {
    setSubmitting(status)
    try {
      await safetyService.checkin({ status })
      if (status === 'safe') {
        toast.success('Đã ghi nhận: Bạn an toàn 💚')
      } else {
        toast.warn('Đã ghi nhận: cần hỗ trợ. Đang thông báo danh bạ khẩn cấp…')
      }
    } catch (err) {
      toast.error(err?.message || 'Không check-in được.')
    } finally {
      setSubmitting(null)
    }
  }

  return (
    <main className="auth-page" style={{ alignItems: 'flex-start' }}>
      <div className="auth-card" style={{ maxWidth: 460 }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/safety')} style={{ alignSelf: 'flex-start', marginBottom: 12 }}>
          ← An toàn
        </button>
        <h1>Check-in an toàn</h1>
        <p className="auth-subtitle">Hãy cho SameMess biết bạn đang ổn sau cuộc hẹn.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => handle('safe')}
            disabled={submitting !== null}
            style={{ padding: '14px 0', fontSize: 16 }}
          >
            {submitting === 'safe' ? <span className="spinner" /> : '🟢 Tôi an toàn'}
          </button>
          <button
            type="button"
            className="btn btn-danger btn-block"
            onClick={() => handle('help')}
            disabled={submitting !== null}
            style={{ padding: '14px 0', fontSize: 16 }}
          >
            {submitting === 'help' ? <span className="spinner" /> : '🚨 Cần hỗ trợ ngay'}
          </button>
        </div>
      </div>
    </main>
  )
}
