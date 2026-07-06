import { useEffect, useState } from 'react'
import { eventsService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'
import { formatDate } from '../../../utils/format.js'
import { useNavigate } from 'react-router-dom'
import { CalendarIcon, PinIcon, UsersIcon, ClockIcon } from '../../../components/ui/CustomIcons.jsx'
import HeroFX from '../../../components/User/HeroFX/HeroFX.jsx'
import { motion } from 'framer-motion'
import { Button } from '../../../components/ui/Button.jsx'
import './Events.css'

export default function Events() {
  const navigate = useNavigate()
  const toast = useToast()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(null)

  useEffect(() => {
    eventsService.list()
      .then((list) => setEvents(Array.isArray(list) ? list : (list?.items ?? [])))
      .catch((err) => toast.error(err?.message || 'Không tải được sự kiện.'))
      .finally(() => setLoading(false))
  }, [toast])

  const handleRegister = async (id, e) => {
    e.stopPropagation()
    setRegistering(id)
    try {
      await eventsService.register(id)
      toast.success('Đã đăng ký tham gia!')
    } catch (err) {
      toast.error(err?.message || 'Không đăng ký được.')
    } finally {
      setRegistering(null)
    }
  }

  const getStatus = (ev) => {
    if (ev.status === 'Ended') return { label: 'Đã kết thúc', cls: 'ended' }
    if (ev.status === 'Full') return { label: 'Đã đầy', cls: 'full' }
    return { label: 'Đang mở', cls: 'open' }
  }

  const formatEventDate = (dateStr) => {
    if (!dateStr) return null
    try {
      const d = new Date(dateStr)
      return {
        month: d.toLocaleDateString('vi-VN', { month: 'short' }).toUpperCase(),
        day: d.getDate(),
        time: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      }
    } catch { return null }
  }

  return (
    <div className="events-root">
      {/* Hero */}
      <div className="events-hero">
        <div className="events-hero-eyebrow">
          <CalendarIcon size={12} />
          Sự kiện
        </div>
        <h1 className="events-hero-title ph-title evt-hdr-title">
          <span className="ph-script evt-hdr-script">Khám phá</span>{' '}
          <span className="ph-accent evt-hdr-accent">sự kiện <CalendarIcon size={22} className="ph-icon ph-beat evt-hdr-icon" /></span>
        </h1>
        <p className="events-hero-subtitle">Gặp gỡ những người cùng sở thích tại các sự kiện độc đáo</p>
        <HeroFX emojis={['🎉', '🎈', '🎊', '✨', '⭐', '🥳', '🎶', '🌟']} />
        <span className="hero-deco" aria-hidden>🎉</span>
      </div>

      <div className="events-content">
        {/* Toolbar */}
        <div className="events-toolbar">
          <div className="events-toolbar-title">
            <span className="text-muted">Sự kiện đang mở</span>
            <span className="events-count">{events.length}</span>
          </div>
          <button
            className="events-history-btn"
            onClick={() => navigate('/events/history')}
          >
            Lịch sử
          </button>
        </div>

        {loading ? (
          <div className="loading-block"><span className="spinner" /></div>
        ) : events.length === 0 ? (
          <div className="empty">Chưa có sự kiện nào đang mở.</div>
        ) : (
          <div className="events-grid">
            {events.map((ev, i) => {
              const status = getStatus(ev)
              const date = formatEventDate(ev.startAt || ev.startsAt)
              return (
                <motion.article
                  key={ev.id}
                  className="event-card"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                  onClick={() => navigate(`/events/${ev.id}`)}
                >
                  <div className="event-cover">
                    <div
                      className="event-cover-img"
                      style={ev.coverUrl ? { backgroundImage: `url(${ev.coverUrl})` } : {}}
                    >
                      <div className="event-cover-gradient" />
                    </div>
                    <div className="event-date-badge">
                      {date && (
                        <>
                          <div className="event-date-month">{date.month}</div>
                          <div className="event-date-day">{date.day}</div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="event-body">
                    <div className="event-title">{ev.title || ev.name}</div>

                    <div className="event-meta-list">
                      {date && (
                        <div className="event-meta-item">
                          <ClockIcon size={12} />
                          {date.time}
                        </div>
                      )}
                      {ev.location && (
                        <div className="event-meta-item">
                          <PinIcon size={12} />
                          {ev.location}
                        </div>
                      )}
                      {ev.capacity && (
                        <div className="event-meta-item">
                          <UsersIcon size={12} />
                          {ev.registeredCount || 0}/{ev.capacity}
                        </div>
                      )}
                    </div>

                    {ev.description && (
                      <p className="event-desc">{ev.description.slice(0, 90)}…</p>
                    )}

                    <div className="event-footer">
                      <span className={`event-status-badge ${status.cls}`}>{status.label}</span>
                      {status.cls === 'open' && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={(e) => handleRegister(ev.id, e)}
                          disabled={registering === ev.id}
                        >
                          {registering === ev.id ? <span className="spinner" /> : 'Đăng ký'}
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
