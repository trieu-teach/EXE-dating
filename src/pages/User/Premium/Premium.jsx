import { useState } from 'react'
import { Link } from 'react-router-dom'
import { premiumService } from '../../../api/index.js'
import AppShell from '../../../components/User/AppShell/AppShell.jsx'
import AsyncContent from '../../../components/User/AsyncContent/AsyncContent.jsx'
import PageHeader from '../../../components/User/PageHeader/PageHeader.jsx'
import { useAsync } from '../../../hooks/useAsync.js'
import { useMutation } from '../../../hooks/useMutation.js'
import '../../../styles/events-shared.css'
import './Premium.css'

function Premium() {
  const [selected, setSelected] = useState('6months')
  const { data, loading, error, refetch } = useAsync(() => premiumService.getPlans(), [])
  const { mutate: subscribe, loading: subscribing } = useMutation((planId) =>
    premiumService.subscribe(planId),
  )
  const plans = data?.plans ?? []
  const features = data?.features ?? []

  return (
    <AppShell activeNav="profile">
      <div className="premium-page">
        <PageHeader title="Nâng cấp Premium" backTo="/profile" />

        <AsyncContent loading={loading} error={error} onRetry={refetch}>
        <div className="premium-layout">
          <section className="premium-hero">
            <img
              src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80&auto=format&fit=crop"
              alt=""
            />
            <div className="premium-hero__overlay">
              <h1>Mở khóa những kết nối sâu sắc hơn</h1>
              <p>Dành cho người nghiêm túc hẹn hò trên SameMess</p>
            </div>
          </section>

          <section className="premium-features">
            <h2>Đặc quyền Premium</h2>
            <ul>
              {features.map((f) => (
                <li key={f.text}>
                  <span>{f.icon}</span>
                  {f.text}
                </li>
              ))}
            </ul>
          </section>

          <section className="premium-plans">
            <h2>Chọn gói</h2>
            <div className="premium-plans__grid">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  className={`premium-plan-card${selected === plan.id ? ' premium-plan-card--active' : ''}${plan.popular ? ' premium-plan-card--popular' : ''}`}
                  onClick={() => setSelected(plan.id)}
                >
                  {plan.badge && <span className="premium-plan-card__badge">{plan.badge}</span>}
                  <strong>{plan.label}</strong>
                  <span className="premium-plan-card__price">
                    {plan.price}
                    <small>{plan.per}</small>
                  </span>
                  <span className="premium-plan-card__choose">Chọn gói</span>
                </button>
              ))}
            </div>
          </section>

          <div className="premium-footer">
            <button
              type="button"
              className="events-btn-pill premium-footer__cta"
              disabled={subscribing}
              onClick={() => subscribe(selected)}
            >
              {subscribing ? 'Đang xử lý...' : 'Nâng cấp ngay'}
            </button>
            <p className="premium-footer__note">
              Hủy bất cứ lúc nào. Thanh toán an toàn qua ví hoặc thẻ.
            </p>
            <Link to="/events" className="premium-footer__events">
              Xem sự kiện Premium →
            </Link>
          </div>
        </div>
        </AsyncContent>
      </div>
    </AppShell>
  )
}

export default Premium
