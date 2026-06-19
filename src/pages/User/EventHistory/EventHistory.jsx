import { useEffect, useState } from 'react'
import { eventsService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'
import { formatDate } from '../../../utils/format.js'
import { useNavigate } from 'react-router-dom'

export default function EventHistory() {
  const navigate = useNavigate()
  const toast = useToast()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    eventsService.history()
      .then((list) => setHistory(Array.isArray(list) ? list : (list?.items ?? [])))
      .catch((err) => toast.error(err?.message || 'Không tải được lịch sử.'))
      .finally(() => setLoading(false))
  }, [toast])

  if (loading) return <div className="loading-block"><span className="spinner" /></div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/events')} style={{ alignSelf: 'flex-start' }}>
        ← Quay lại
      </button>
      <h1>Sự kiện đã đăng ký</h1>
      {history.length === 0 ? (
        <div className="empty">Bạn chưa đăng ký sự kiện nào.</div>
      ) : (
        <div className="match-list">
          {history.map((h, i) => (
            <div key={h.id || h.eventId || i} className="match-item">
              <div
                className="avatar avatar-lg"
                style={{ backgroundImage: h.coverUrl ? `url(${h.coverUrl})` : undefined }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{h.title || h.eventTitle}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-soft)' }}>
                  📅 {formatDate(h.startAt || h.eventStartAt)} · {h.status || 'Đã đăng ký'}
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/events/${h.eventId || h.id}`)}>
                Mở
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
