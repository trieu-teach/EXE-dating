import { Link } from 'react-router-dom'
import { datesService } from '../../../api/index.js'
import AppShell from '../../../components/User/AppShell/AppShell.jsx'
import AsyncContent from '../../../components/User/AsyncContent/AsyncContent.jsx'
import { useAsync } from '../../../hooks/useAsync.js'
import './DateSuggestions.css'

function DateSuggestions() {
  const { data, loading, error, refetch } = useAsync(() => datesService.getSuggestions(), [])
  const categories = data?.categories ?? []
  const featured = data?.featured
  const forBoth = data?.forBoth ?? []

  return (
    <AppShell activeNav="dates">
      <div className="date-suggestions-page">
        <header className="date-page-header">
          <div>
            <h1>Gợi ý hẹn hò</h1>
            <p>AI gợi ý cho bạn & Minh</p>
          </div>
          <div className="date-page-header__links">
            <Link to="/events" className="date-page-header__pill date-page-header__pill--outline">
              🎟️ Sự kiện
            </Link>
            <Link to="/match-success" className="date-page-header__pill">
              ♥ Trùng khớp mới
            </Link>
          </div>
        </header>

        <AsyncContent loading={loading} error={error} onRetry={refetch}>
        {featured && (
        <article className="date-featured">
          <img
            src={featured.image}
            alt=""
          />
          <div className="date-featured__overlay" />
          <div className="date-featured__content">
            <span className="date-featured__badge">{featured.match}% phù hợp</span>
            <h2>{featured.title}</h2>
            <p>Trải nghiệm sáng tạo cùng nhau — phù hợp buổi hẹn đầu tiên</p>
            <button type="button" className="date-btn-pill">Chọn địa điểm</button>
          </div>
        </article>
        )}

        <div className="date-categories">
          {categories.map((cat) => (
            <button key={cat.id} type="button" className="date-category-chip">
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        <section className="date-section">
          <h2 className="date-section__title">Dành cho hai bên</h2>
          <div className="date-for-both-grid">
            {forBoth.map((item, index) => (
              <article
                key={item.id}
                className={`date-spot-card${index === 0 ? ' date-spot-card--large' : ''}`}
              >
                <img src={item.image} alt="" />
                <div className="date-spot-card__body">
                  <span className="date-spot-card__match">{item.match}% phù hợp</span>
                  <h3>{item.title}</h3>
                  <button type="button" className="date-btn-pill date-btn-pill--sm">
                    {index === 0 ? 'Lên kế hoạch' : 'Xem chi tiết'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="date-challenge">
          <div>
            <p className="date-challenge__label">Thử thách tuần này</p>
            <h3>Hẹn hò bí mật</h3>
            <p>Tham gia sự kiện hẹn hò bí mật tại TP.HCM cùng SameMess</p>
          </div>
          <button type="button" className="date-btn-pill date-btn-pill--outline">
            Tìm hiểu thêm
          </button>
        </aside>
        </AsyncContent>
      </div>
    </AppShell>
  )
}

export default DateSuggestions
