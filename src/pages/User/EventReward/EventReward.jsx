import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { eventsService } from '../../../api/index.js'
import AppShell from '../../../components/User/AppShell/AppShell.jsx'
import AsyncContent from '../../../components/User/AsyncContent/AsyncContent.jsx'
import PageHeader from '../../../components/User/PageHeader/PageHeader.jsx'
import { useAsync } from '../../../hooks/useAsync.js'
import '../../../styles/events-shared.css'
import './EventReward.css'

const STEPS = [
  'Đến địa điểm trong thời gian voucher còn hiệu lực.',
  'Đưa mã hoặc quét QR cho nhân viên trước khi gọi món.',
  'Tận hưởng buổi hẹn với ưu đãi đặc biệt từ SameMess.',
]

function EventReward() {
  const { state } = useLocation()
  const eventId = state?.eventId ?? 'sunset-vineyard'
  const [copied, setCopied] = useState(false)
  const { data: reward, loading, error, refetch } = useAsync(
    () => eventsService.getReward(eventId),
    [eventId],
  )
  const code = reward?.code ?? 'SAMEMESS50'

  function copyCode() {
    navigator.clipboard?.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AppShell activeNav="events">
      <div className="event-reward-page">
        <PageHeader title="Phần thưởng sự kiện" backTo={`/events/${eventId}`} />

        <AsyncContent loading={loading} error={error} onRetry={refetch}>
        <div className="event-reward-layout">
          <section className="event-reward-hero">
            <span className="event-reward-hero__icon">🎉</span>
            <h1>Chúc mừng! Bạn đã nhận quà từ SameMess</h1>
            <p>Phần thưởng sau khi tham gia sự kiện — dùng cho buổi hẹn đầu tiên.</p>
          </section>

          <article className="event-reward-voucher">
            <span className="event-reward-voucher__tag">Ưu đãi độc quyền</span>
            <div className="event-reward-voucher__head">
              <div>
                <h2>{reward?.title ?? 'Giảm 50% cho buổi hẹn đầu tiên'}</h2>
                <ul>
                  <li>📍 {reward?.venue ?? 'The Blue Note Coffee & Lounge'}</li>
                  <li>☕ Áp dụng cho mọi loại đồ uống</li>
                  <li>📅 Hết hạn: {reward?.expiresAt ?? '31/12/2025'}</li>
                </ul>
              </div>
              <img
                src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&q=80&auto=format&fit=crop"
                alt=""
              />
            </div>
            <div className="event-reward-code">
              <code>{code}</code>
              <button type="button" onClick={copyCode}>
                {copied ? '✓ Đã copy' : '📋 Copy'}
              </button>
            </div>
          </article>

          <div className="event-reward-trust">
            <span>🛡️</span>
            <div>
              <strong>Cộng +{reward?.trustScoreDelta ?? 10} điểm tin cậy</strong>
              <p>Tham gia sự kiện giúp tăng độ tin cậy hồ sơ hẹn hò của bạn.</p>
            </div>
          </div>

          <section className="event-reward-steps">
            <h2>📖 Cách sử dụng</h2>
            <ol>
              {STEPS.map((step, i) => (
                <li key={step}>
                  <span>{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </section>

          <section className="event-reward-qr">
            <p className="event-reward-qr__label">Hoặc quét mã QR tại quầy</p>
            <div className="event-reward-qr__box" aria-hidden="true">
              <div className="event-reward-qr__pattern" />
            </div>
          </section>

          <div className="event-reward-actions">
            <Link to={`/events/${eventId}`} className="events-btn-pill">
              Quay lại chi tiết sự kiện
            </Link>
            <Link to="/events" className="events-btn-pill events-btn-pill--outline">
              Xem thêm sự kiện khác →
            </Link>
            <Link to="/date-suggestions" className="event-reward-actions__dates">
              Gợi ý địa điểm hẹn sau sự kiện →
            </Link>
          </div>
        </div>
        </AsyncContent>
      </div>
    </AppShell>
  )
}

export default EventReward
