import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { reputationService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'
import { ShieldCheckIcon, SparkleIcon, ChevronRightIcon } from '../../../components/ui/CustomIcons.jsx'
import './Reputation.css'

const EVENT_META = {
  ProfileCompleted: { label: 'Hoàn thiện hồ sơ', icon: '📝' },
  FaceVerified: { label: 'Xác minh khuôn mặt', icon: '🛡️' },
  GotMatch: { label: 'Có match mới', icon: '💞' },
  Blocked: { label: 'Bị người khác chặn', icon: '🚫' },
  MessageFlagged: { label: 'Tin nhắn bị gắn cờ', icon: '⚠️' },
  ReportUpheld: { label: 'Bị báo cáo (đã xử lý)', icon: '⛔' },
}

const TIERS = [
  { key: 'New', label: 'Mới', range: '0 – 39', emoji: '⚠️', color: '#f59e0b', desc: 'Tài khoản mới hoặc cần xác minh.' },
  { key: 'Normal', label: 'Bình thường', range: '40 – 69', emoji: '🙂', color: '#3b82f6', desc: 'Hoạt động ổn định, đáng tin cơ bản.' },
  { key: 'Good', label: 'Uy tín tốt', range: '70 – 89', emoji: '✅', color: '#16a34a', desc: 'Hồ sơ đáng tin, tương tác tích cực.' },
  { key: 'High', label: 'Uy tín cao', range: '90 – 100', emoji: '⭐', color: '#f5a623', desc: 'Thành viên mẫu mực, được ưu tiên hiển thị.' },
]

const EARN = [
  { d: '+15', label: 'Xác minh khuôn mặt', note: '1 lần · gỡ trần 65 điểm' },
  { d: '+5', label: 'Hoàn thiện hồ sơ', note: '1 lần' },
  { d: '+2', label: 'Mỗi match mới', note: 'không giới hạn' },
]
const LOSE = [
  { d: '−6', label: 'Bị người khác chặn', note: 'mức nhẹ · phai dần theo thời gian' },
  { d: '−8', label: 'Tin nhắn bị AI gắn cờ', note: 'mức nhẹ · phai dần' },
  { d: '−20', label: 'Bị báo cáo & admin xử lý', note: 'mức nặng' },
]

const SEG_W = [40, 30, 20, 10] // bề rộng % mỗi mức trên dải (0-39 · 40-69 · 70-89 · 90-100)
const SEG_SHORT = ['Mới', 'Bình thường', 'Tốt', 'Cao'] // nhãn ngắn cho dải
const tierColor = (tier) => (TIERS.find((t) => t.key === tier)?.color || '#3b82f6')
const tierEmojiOf = (tier) => (TIERS.find((t) => t.key === tier)?.emoji || '🙂')

export default function Reputation() {
  const navigate = useNavigate()
  const toast = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    reputationService.me()
      .then(setData)
      .catch((err) => toast.error(err?.message || 'Không tải được điểm uy tín.'))
      .finally(() => setLoading(false))
  }, [toast])

  if (loading) return <div className="loading-block"><span className="spinner" /></div>
  if (!data) return <div className="empty" style={{ margin: 24 }}>Không có dữ liệu uy tín.</div>

  const score = Math.max(0, Math.min(100, data.score ?? 0))
  const color = tierColor(data.tier)
  const tierEmoji = tierEmojiOf(data.tier)

  return (
    <div className="rep-root">
      {/* Hero — điểm + dải mức (kiểu app credit score) */}
      <div className="rep-hero">
        <span className="rep-hero-glow" aria-hidden />
        <div className="rep-hero-eyebrow">Điểm uy tín của bạn</div>
        <div className="rep-hero-row">
          <div className="rep-score" style={{ color }}>
            {score}<span className="rep-score-max">/100</span>
          </div>
          <div className="rep-tier-pill" style={{ '--tc': color }}>
            <span className="rep-tier-pill-emoji">{tierEmoji}</span>
            {data.tierLabel || data.tier}
          </div>
        </div>

        <div className="rep-band" role="img" aria-label={`Điểm ${score} trên 100`}>
          {TIERS.map((t, i) => (
            <div key={t.key} className="rep-band-seg" style={{ flexBasis: `${SEG_W[i]}%`, background: t.color }}>
              <span className="rep-band-seg-label">{SEG_SHORT[i]}</span>
            </div>
          ))}
          <span className="rep-band-marker" style={{ left: `${score}%`, '--tc': color }} />
        </div>

        <p className="rep-hero-sub">
          Điểm thể hiện mức độ đáng tin của bạn. Người khác chỉ thấy <strong>mức</strong>, không thấy con số.
        </p>
      </div>

      {/* Cap warning */}
      {data.isCapped && (
        <button type="button" className="rep-cap" onClick={() => navigate('/account-verification')}>
          <ShieldCheckIcon size={20} />
          <div className="rep-cap-text">
            <strong>Điểm đang bị giới hạn ở {data.cap}</strong>
            <span>Xác minh khuôn mặt để mở khóa tối đa 100 điểm (+15 điểm ngay).</span>
          </div>
          <ChevronRightIcon size={18} />
        </button>
      )}

      {/* What is it */}
      <section className="rep-section">
        <h2 className="rep-section-title">Điểm uy tín là gì?</h2>
        <p className="rep-text">
          Mỗi người bắt đầu ở <strong>50 điểm</strong>. Điểm tăng khi bạn xác minh, hoàn thiện hồ sơ và
          kết nối tích cực; giảm khi có hành vi khiến người khác khó chịu. Người khác <strong>chỉ thấy “mức”</strong>
          {' '}(Mới / Bình thường / Tốt / Cao) trên thẻ Khám phá — <strong>không thấy con số</strong> của bạn.
          Mức càng cao, hồ sơ càng được ưu tiên hiển thị.
        </p>
      </section>

      {/* Tiers */}
      <section className="rep-section">
        <h2 className="rep-section-title">Các mức uy tín</h2>
        <div className="rep-tiers">
          {TIERS.map((t) => (
            <div key={t.key} className={`rep-tier-row${t.key === data.tier ? ' is-current' : ''}`}>
              <span className="rep-tier-emoji">{t.emoji}</span>
              <div className="rep-tier-info">
                <div className="rep-tier-name" style={{ color: t.color }}>{t.label} <span className="rep-tier-range">{t.range}</span></div>
                <div className="rep-tier-desc">{t.desc}</div>
              </div>
              {t.key === data.tier && <span className="rep-tier-you">Bạn</span>}
            </div>
          ))}
        </div>
      </section>

      {/* How it changes */}
      <section className="rep-section">
        <h2 className="rep-section-title">Cách điểm thay đổi</h2>
        <div className="rep-rules">
          <div className="rep-rules-col">
            <div className="rep-rules-head is-up"><SparkleIcon size={13} /> Tăng điểm</div>
            {EARN.map((r) => (
              <div key={r.label} className="rep-rule">
                <span className="rep-rule-delta is-up">{r.d}</span>
                <div><div className="rep-rule-label">{r.label}</div><div className="rep-rule-note">{r.note}</div></div>
              </div>
            ))}
          </div>
          <div className="rep-rules-col">
            <div className="rep-rules-head is-down">Giảm điểm</div>
            {LOSE.map((r) => (
              <div key={r.label} className="rep-rule">
                <span className="rep-rule-delta is-down">{r.d}</span>
                <div><div className="rep-rule-label">{r.label}</div><div className="rep-rule-note">{r.note}</div></div>
              </div>
            ))}
          </div>
        </div>
        <p className="rep-note">Vi phạm nhẹ (bị chặn, gắn cờ) sẽ <strong>phai dần</strong> nếu bạn cư xử tốt — sau ~90 ngày không tái phạm thì hết ảnh hưởng.</p>
      </section>

      {/* Tips */}
      {data.howToImprove?.length > 0 && (
        <section className="rep-section">
          <h2 className="rep-section-title">Gợi ý cải thiện</h2>
          <ul className="rep-tips">
            {data.howToImprove.map((tip, i) => <li key={i}>{tip}</li>)}
          </ul>
        </section>
      )}

      {/* Recent events */}
      {data.recentEvents?.length > 0 && (
        <section className="rep-section">
          <h2 className="rep-section-title">Hoạt động gần đây</h2>
          <div className="rep-events">
            {data.recentEvents.map((e, i) => {
              const meta = EVENT_META[e.type] || { label: e.type, icon: '•' }
              const up = e.delta > 0
              return (
                <div key={i} className="rep-event">
                  <span className="rep-event-icon">{meta.icon}</span>
                  <div className="rep-event-main">
                    <div className="rep-event-label">{meta.label}</div>
                    <div className="rep-event-date">{e.createdAt ? new Date(e.createdAt).toLocaleDateString('vi-VN') : ''}</div>
                  </div>
                  <span className={`rep-event-delta${up ? ' is-up' : ' is-down'}`}>{up ? `+${e.delta}` : e.delta}</span>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
