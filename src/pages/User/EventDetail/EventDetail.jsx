import { Link, useNavigate, useParams } from 'react-router-dom'
import { eventsService } from '../../../api/index.js'
import AppShell from '../../../components/User/AppShell/AppShell.jsx'
import AsyncContent from '../../../components/User/AsyncContent/AsyncContent.jsx'
import PageHeader from '../../../components/User/PageHeader/PageHeader.jsx'
import { useAsync } from '../../../hooks/useAsync.js'
import { useMutation } from '../../../hooks/useMutation.js'
import { personImage } from '../../../data/portraitPhotos.js'
import '../../../styles/events-shared.css'
import './EventDetail.css'

const AVATARS = [personImage('linh', 80), personImage('duc', 80), personImage('thao', 80)]

function EventDetail() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { data, loading, error, refetch } = useAsync(
    () => eventsService.getById(eventId),
    [eventId],
  )
  const { mutate: register, loading: registering } = useMutation(() =>
    eventsService.register(eventId),
  )

  const event = data?.event

  async function handleRegister() {
    await register()
    navigate('/events/reward', { state: { eventId, eventTitle: event?.title } })
  }

  if (!loading && !event && !error) {
    return (
      <AppShell activeNav="events">
        <div className="event-detail-page">
          <PageHeader title="Chi tiết sự kiện" backTo="/events" />
          <p className="event-detail-empty">Không tìm thấy sự kiện.</p>
          <Link to="/events" className="events-btn-pill">
            Quay lại danh sách
          </Link>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell activeNav="events">
      <div className="event-detail-page">
        <PageHeader title="Chi tiết sự kiện" backTo="/events" />

        <AsyncContent loading={loading} error={error} onRetry={refetch}>
        {event && (
        <div className="event-detail-layout">
          <div className="event-detail-main">
            <div className="event-detail-hero">
              <img src={event.image} alt="" />
              {event.almostSoldOut && (
                <span className="events-badge events-badge--fire event-detail-hero__badge">
                  🔥 Sắp cháy vé
                </span>
              )}
            </div>

            <div className="event-detail-head">
              {event.premiumOnly && (
                <Link to="/premium" className="events-badge events-badge--premium">
                  Chỉ Premium
                </Link>
              )}
              <h1>{event.title}</h1>
              <p>
                <span>📅 {event.date}</span>
                <span>🕐 {event.time}</span>
              </p>
              <p className="event-detail-head__loc">📍 {event.location}</p>
            </div>

            {event.about && (
              <section className="event-detail-block">
                <h2>Về sự kiện</h2>
                <p>{event.about}</p>
              </section>
            )}

            {event.schedule && (
              <section className="event-detail-block">
                <h2>Lịch trình</h2>
                <ul className="event-detail-timeline">
                  {event.schedule.map((item) => (
                    <li key={item.time}>
                      <span className="event-detail-timeline__icon">{item.icon}</span>
                      <div>
                        <strong>{item.time}</strong>
                        <span>{item.label}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="event-detail-block">
              <h2>Ai sẽ tham gia?</h2>
              <p className="event-detail-attendees-count">{event.attendees} người đã đăng ký</p>
              <div className="event-detail-avatars">
                {AVATARS.map((src) => (
                  <img key={src} src={src} alt="" />
                ))}
                <span>+{Math.max(0, event.attendees - 3)}</span>
              </div>
            </section>
          </div>

          <aside className="event-detail-sidebar">
            <div className="event-detail-map">
              <div className="event-detail-map__visual">
                <span>📍</span>
              </div>
              <p>{event.address || event.location}</p>
            </div>

            {event.spotsLeft != null && (
              <p className="event-detail-spots">Còn {event.spotsLeft} chỗ trống</p>
            )}

            {event.premiumOnly ? (
              <>
                <Link to="/premium" className="events-btn-pill event-detail-sidebar__cta">
                  Nâng cấp Premium để đăng ký
                </Link>
                <button
                  type="button"
                  className="events-btn-pill events-btn-pill--outline"
                  onClick={handleRegister}
                  disabled={registering}
                >
                  {registering ? 'Đang đăng ký...' : 'Đăng ký thử (demo)'}
                </button>
              </>
            ) : (
              <button
                type="button"
                className="events-btn-pill event-detail-sidebar__cta"
                onClick={handleRegister}
                disabled={registering}
              >
                {registering ? 'Đang đăng ký...' : 'Đăng ký ngay'}
              </button>
            )}
            <Link to="/chat" className="events-btn-pill events-btn-pill--outline event-detail-sidebar__secondary">
              Mời bạn cùng đôi
            </Link>
            <Link to="/date-suggestions" className="event-detail-sidebar__hint">
              Gợi ý địa điểm hẹn sau sự kiện →
            </Link>
          </aside>
        </div>
        )}
        </AsyncContent>
      </div>
    </AppShell>
  )
}

export default EventDetail
