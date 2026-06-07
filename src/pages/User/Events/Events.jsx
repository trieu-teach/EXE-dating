import { useState } from 'react'
import { Link } from 'react-router-dom'
import { eventsService } from '../../../api/index.js'
import AppShell from '../../../components/User/AppShell/AppShell.jsx'
import AsyncContent from '../../../components/User/AsyncContent/AsyncContent.jsx'
import { useAsync } from '../../../hooks/useAsync.js'
import '../../../styles/events-shared.css'
import './Events.css'

function Events() {
  const [category, setCategory] = useState('today')
  const { data, loading, error, refetch } = useAsync(() => eventsService.getList(), [])

  const categories = data?.categories ?? []
  const events = data?.events ?? []
  const featuredId = data?.featuredId
  const featured = events.find((e) => e.id === featuredId)
  const upcoming = events.filter((e) => e.id !== featuredId)

  return (
    <AppShell activeNav="events">
      <div className="events-page">
        <header className="events-page-header">
          <div>
            <p className="events-page-header__eyebrow">Sự kiện SameMess</p>
            <h1>Sự kiện cộng đồng</h1>
            <p>Gặp gỡ thật — ngoài vuốt thẻ, trong không gian an toàn</p>
          </div>
          <div className="events-page-header__actions">
            <Link to="/events/history" className="events-header-link">
              Lịch sử
            </Link>
            <button type="button" className="events-notify-btn" aria-label="Thông báo">
              🔔
            </button>
          </div>
        </header>

        <label className="events-search">
          <span aria-hidden="true">🔍</span>
          <input type="search" placeholder="Tìm kết nối tiếp theo của bạn..." />
        </label>

        <AsyncContent loading={loading} error={error} onRetry={refetch}>
        <div className="events-chips" role="tablist">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              className={`events-chip${category === cat.id ? ' events-chip--active' : ''}`}
              onClick={() => setCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <article className="events-schedule-banner">
          <div>
            <strong>Lịch của bạn: 2 sự kiện tuần này</strong>
            <p>Speed dating, workshop &amp; gặp gỡ ngoài trời</p>
          </div>
          <Link to="/events/history" className="events-schedule-banner__btn">
            Xem lịch
          </Link>
        </article>

        {featured && (
          <section className="events-section">
            <div className="events-section__head">
              <h2>Nổi bật</h2>
              <Link to={`/events/${featured.id}`}>Xem tất cả</Link>
            </div>
            <Link to={`/events/${featured.id}`} className="events-featured-card">
              <img src={featured.image} alt="" />
              <div className="events-featured-card__overlay" />
              <div className="events-featured-card__content">
                {featured.premiumOnly && (
                  <span className="events-badge events-badge--premium">Chỉ Premium</span>
                )}
                <h3>{featured.title}</h3>
                <p>
                  {featured.date} · {featured.attendees} người tham gia
                </p>
              </div>
            </Link>
          </section>
        )}

        <section className="events-section">
          <div className="events-section__head">
            <h2>Sắp diễn ra</h2>
          </div>
          <ul className="events-list">
            {upcoming.map((ev) =>
              ev.soldOut ? (
                <li key={ev.id} className="events-list-card events-list-card--disabled">
                  <img src={ev.thumb} alt="" />
                  <div>
                    <h3>{ev.title}</h3>
                    <p>
                      {ev.date} · {ev.time}
                    </p>
                    <p className="events-list-card__loc">{ev.location}</p>
                  </div>
                  <span className="events-list-card__sold">Hết vé</span>
                </li>
              ) : (
                <li key={ev.id}>
                  <Link to={`/events/${ev.id}`} className="events-list-card">
                    <img src={ev.thumb} alt="" />
                    <div>
                      <h3>{ev.title}</h3>
                      <p>
                        {ev.date} · {ev.time}
                      </p>
                      <p className="events-list-card__loc">{ev.location}</p>
                    </div>
                    <span className="events-list-card__join">Tham gia</span>
                  </Link>
                </li>
              ),
            )}
          </ul>
        </section>

        </AsyncContent>

        <Link to="/premium" className="events-premium-teaser">
          <span>✨</span>
          <div>
            <strong>Mở khóa sự kiện Premium</strong>
            <p>Ưu tiên đăng ký &amp; xem ai thích bạn</p>
          </div>
          <span>→</span>
        </Link>

        <Link to="/events/history" className="events-fab" aria-label="Lịch sự kiện">
          📅
        </Link>
      </div>
    </AppShell>
  )
}

export default Events
