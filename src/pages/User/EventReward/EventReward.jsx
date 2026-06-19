import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { eventsService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'

export default function EventReward() {
  const [search] = useSearchParams()
  const eventId = search.get('eventId')
  const navigate = useNavigate()
  const toast = useToast()
  const [reward, setReward] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!eventId) return
    eventsService.reward(eventId)
      .then(setReward)
      .catch((err) => toast.error(err?.message || 'Không tải được phần thưởng.'))
      .finally(() => setLoading(false))
  }, [eventId, toast])

  if (loading) return <div className="loading-block"><span className="spinner" /></div>
  if (!reward) return <div className="empty">Không có phần thưởng cho sự kiện này.</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ alignSelf: 'flex-start' }}>
        ← Quay lại
      </button>
      <h1>Phần thưởng</h1>
      <div className="card" style={{ textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: 64 }}>🏆</div>
        <h2 style={{ marginTop: 8 }}>+{reward.xp ?? 0} XP</h2>
        {reward.badge && (
          <p style={{ color: 'var(--color-text-soft)' }}>Huy hiệu: {reward.badge}</p>
        )}
      </div>
    </div>
  )
}
