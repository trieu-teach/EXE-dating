import { useState } from 'react'
import { Link } from 'react-router-dom'
import { eventsService } from '../../../api/index.js'
import AppShell from '../../../components/User/AppShell/AppShell.jsx'
import AsyncContent from '../../../components/User/AsyncContent/AsyncContent.jsx'
import PageHeader from '../../../components/User/PageHeader/PageHeader.jsx'
import { useAsync } from '../../../hooks/useAsync.js'
import '../../../styles/events-shared.css'
import './EventHistory.css'

const TABS = [
  { id: 'attended', label: 'Đã tham gia' },
  { id: 'saved', label: 'Đã lưu' },
  { id: 'upcoming', label: 'Sắp tới' },
]

function EventHistory() {
  const [tab, setTab] = useState('attended')
  const { data, loading, error, refetch } = useAsync(() => eventsService.getHistory(), [])
  const historyEvents = data?.events ?? []

  return (
    <AppShell activeNav="events">
      <div className="event-history-page">
        <PageHeader title="Lịch sử sự kiện" backTo="/events" />

        <AsyncContent loading={loading} error={error} onRetry={refetch}>
        <article className="event-history-stats">
          <div>
            <strong className="event-history-stats__num">{data?.totalAttended ?? '—'}</strong>
            <span className="event-history-stats__badge">+{data?.monthDelta ?? 0} tháng này</span>
          </div>
          <p>
            Điểm tin cậy của bạn đang tăng — tham gia sự kiện giúp hồ sơ hẹn hò đáng tin hơn.
          </p>
          <Link to="/events/reward" className="event-history-stats__link">
            Xem phần thưởng gần nhất →
          </Link>
        </article>

        <div className="event-history-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              className={`event-history-tabs__btn${tab === t.id ? ' event-history-tabs__btn--active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'attended' && (
          <ul className="event-history-list">
            {historyEvents.map((ev) => (
              <li key={ev.id} className="event-history-card">
                <img src={ev.image} alt="" />
                <div className="event-history-card__body">
                  <h3>{ev.title}</h3>
                  <p>{ev.date}</p>
                  {ev.rated && (
                    <span className="event-history-card__rated">★ Đã đánh giá</span>
                  )}
                  <div className="event-history-card__actions">
                    <Link to={`/events/${ev.id}`} className="event-history-card__btn">
                      Xem lại chi tiết
                    </Link>
                    {ev.canRebook ? (
                      <Link to="/events/sunset-vineyard" className="event-history-card__btn event-history-card__btn--primary">
                        Đặt lại chỗ
                      </Link>
                    ) : (
                      <button type="button" className="event-history-card__btn">
                        Viết đánh giá
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {tab === 'saved' && (
          <p className="event-history-empty">
            Chưa có sự kiện đã lưu.{' '}
            <Link to="/events">Khám phá sự kiện →</Link>
          </p>
        )}

        {tab === 'upcoming' && (
          <p className="event-history-empty">
            Xem lịch tuần này tại{' '}
            <Link to="/events">trang sự kiện →</Link>
          </p>
        )}
        </AsyncContent>
      </div>
    </AppShell>
  )
}

export default EventHistory
