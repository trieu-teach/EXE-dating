import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { eventsService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'
import { formatDate } from '../../../utils/format.js'

export default function EventDetail() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)

  useEffect(() => {
    eventsService.detail(eventId)
      .then(setEvent)
      .catch((err) => toast.error(err?.message || 'Không tải được sự kiện.'))
      .finally(() => setLoading(false))
  }, [eventId, toast])

  const handleRegister = async () => {
    setRegistering(true)
    try {
      await eventsService.register(eventId)
      toast.success('Đã đăng ký!')
    } catch (err) {
      toast.error(err?.message || 'Không đăng ký được.')
    } finally {
      setRegistering(false)
    }
  }

  if (loading) return <div className="loading-block"><span className="spinner" /></div>
  if (!event) return <div className="empty">Sự kiện không tồn tại.</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ alignSelf: 'flex-start' }}>
        ← Quay lại
      </button>
      {event.coverUrl && (
        <div
          style={{
            aspectRatio: '16/9',
            background: `url(${event.coverUrl}) center/cover`,
            borderRadius: 16,
          }}
        />
      )}
      <h1>{event.title || event.name}</h1>
      <p style={{ color: 'var(--color-text-soft)' }}>
        📅 {formatDate(event.startAt || event.startsAt)} · 📍 {event.location || event.venue}
      </p>
      <p style={{ whiteSpace: 'pre-line' }}>{event.description}</p>
      <button type="button" className="btn btn-primary" onClick={handleRegister} disabled={registering}>
        {registering ? <span className="spinner" /> : 'Đăng ký tham gia'}
      </button>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => navigate(`/events/reward?eventId=${event.id}`)}
      >
        Xem phần thưởng
      </button>
    </div>
  )
}
