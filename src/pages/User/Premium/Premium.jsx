import { useEffect, useMemo, useState } from 'react'
import { subscriptionService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'
import {
  CrownIcon, CheckIcon, ZapIcon, HeartIcon, EyeIcon, ShieldIcon, SparkleIcon, StarIcon,
} from '../../../components/ui/CustomIcons.jsx'
import { motion } from 'framer-motion'
import './Premium.css'

/**
 * Mô tả từng gói (UI). Giá lấy động từ backend (PlanDto.priceVnd);
 * meta này bổ sung tagline + danh sách tính năng cho phần hiển thị.
 */
const PLAN_META = {
  Free: {
    label: 'Free',
    tagline: 'Bắt đầu hành trình',
    blurb: 'Mọi thứ cần thiết để khám phá và ghép đôi mỗi ngày.',
    icon: HeartIcon,
    accent: '#a78bfa',
    gradient: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
    features: [
      '50 lượt thích mỗi ngày',
      'Ghép đôi & nhắn tin không giới hạn',
      'Gợi ý hồ sơ hằng ngày',
      'Chăm sóc Cây tình yêu 🌳',
    ],
  },
  Plus: {
    label: 'Plus',
    tagline: 'Kết nối không giới hạn',
    blurb: 'Vuốt thoải mái, không bỏ lỡ ai và sửa sai trong tích tắc.',
    icon: ZapIcon,
    accent: '#ff7eb3',
    gradient: 'linear-gradient(135deg, #ff7eb3, #ff4f8b)',
    features: [
      'Thích KHÔNG giới hạn',
      '5 Super Swipe mỗi ngày ⭐',
      'Hoàn tác lượt vuốt (Undo)',
      'Bao gồm toàn bộ gói Free',
    ],
  },
  Gold: {
    label: 'Gold',
    tagline: 'Trải nghiệm cao cấp nhất',
    blurb: 'Biết ngay ai thích bạn và luôn nổi bật trước mọi người.',
    icon: CrownIcon,
    accent: '#ffd76f',
    gradient: 'linear-gradient(135deg, #ffd76f, #f5a623)',
    features: [
      'Xem AI đã thích bạn (kèm ảnh)',
      '10 Super Swipe mỗi ngày ⭐',
      'Boost hồ sơ — nổi bật hơn',
      'Bao gồm toàn bộ gói Plus',
    ],
  },
}

const FEATURE_HIGHLIGHTS = [
  { icon: ZapIcon, name: 'Undo Swipe', desc: 'Lấy lại người vừa lỡ bỏ qua' },
  { icon: EyeIcon, name: 'Xem ai thích bạn', desc: 'Không cần đoán nữa' },
  { icon: HeartIcon, name: 'Tăng lượt hiển thị', desc: 'Hiện lên đầu danh sách' },
  { icon: ShieldIcon, name: 'Không quảng cáo', desc: 'Trải nghiệm liền mạch' },
]

const PLAN_ORDER = ['Free', 'Plus', 'Gold']

export default function Premium() {
  const toast = useToast()
  const [plans, setPlans] = useState([])
  const [current, setCurrent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ordering, setOrdering] = useState(null)

  useEffect(() => {
    Promise.all([subscriptionService.plans(), subscriptionService.me().catch(() => null)])
      .then(([pl, me]) => {
        setPlans(Array.isArray(pl) ? pl : (pl?.items ?? []))
        setCurrent(me)
      })
      .catch((err) => toast.error(err?.message || 'Không tải được gói.'))
      .finally(() => setLoading(false))
  }, [toast])

  // Quay về từ VNPay: hiển thị kết quả + làm mới trạng thái gói
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const payment = params.get('payment')
    if (!payment) return
    if (payment === 'success') {
      toast.success('Thanh toán thành công! Gói của bạn đã được kích hoạt 🎉')
      subscriptionService.me().then(setCurrent).catch(() => {})
    } else {
      toast.error('Thanh toán không thành công hoặc đã bị hủy.')
    }
    // Xoá query param khỏi URL
    window.history.replaceState({}, '', '/premium')
  }, [toast])

  // Ghép giá từ backend vào meta, sắp xếp Free → Plus → Gold
  const cards = useMemo(() => {
    const byCode = {}
    for (const p of plans) byCode[p.code] = p
    const codes = plans.length
      ? [...new Set([...PLAN_ORDER.filter((c) => byCode[c]), ...plans.map((p) => p.code)])]
      : PLAN_ORDER
    return codes.map((code) => {
      const meta = PLAN_META[code] || {
        label: code, features: [], accent: '#ff4f8b', icon: StarIcon,
        gradient: 'linear-gradient(135deg,#ff7eb3,#ff4f8b)',
      }
      const api = byCode[code]
      return {
        code,
        name: api?.name || meta.label,
        priceVnd: api?.priceVnd ?? (code === 'Free' ? 0 : null),
        durationDays: api?.durationDays ?? 30,
        ...meta,
      }
    })
  }, [plans])

  const currentCode = current?.planCode || 'Free'

  const handleOrder = async (planCode) => {
    if (planCode === 'Free') return
    setOrdering(planCode)
    try {
      const res = await subscriptionService.order(planCode)
      if (res?.paymentUrl) {
        window.open(res.paymentUrl, '_blank', 'noopener,noreferrer')
        toast.info('Đã mở trang thanh toán. Sau khi hoàn tất, hãy quay lại.')
      } else if (res?.txnRef) {
        await subscriptionService.mockConfirm(res.txnRef)
        toast.success('Đã kích hoạt gói (mock).')
        const me = await subscriptionService.me()
        setCurrent(me)
      }
    } catch (err) {
      toast.error(err?.message || 'Không tạo được đơn.')
    } finally {
      setOrdering(null)
    }
  }

  if (loading) return <div className="loading-block"><span className="spinner" /></div>

  return (
    <div className="premium-root">
      {/* ── Hero ── */}
      <div className="premium-hero">
        <div className="premium-hero-content">
          <div className="premium-hero-icon"><CrownIcon size={30} /></div>
          <h1 className="premium-hero-title">SameMess <span>Premium</span></h1>
          <p className="premium-hero-subtitle">
            Mở khoá trải nghiệm không giới hạn. Kết nối nhanh hơn, hiệu quả hơn.
          </p>
          <div className="premium-features-strip">
            {['Thích không giới hạn', 'Xem ai thích bạn', 'Tăng lượt hiển thị', 'Không quảng cáo'].map((f) => (
              <span key={f} className="premium-feature-pill"><CheckIcon size={12} /> {f}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="premium-content">
        {/* ── Đang dùng gói trả phí ── */}
        {currentCode !== 'Free' && (
          <div className="premium-current">
            <CrownIcon size={18} />
            <div className="premium-current-info">
              <div className="premium-current-plan">Gói {currentCode} đang hoạt động</div>
              <div className="premium-current-exp">
                Hết hạn: {current?.expiresAt ? new Date(current.expiresAt).toLocaleDateString('vi-VN') : '—'}
              </div>
            </div>
          </div>
        )}

        {/* ── Bảng gói ── */}
        <div className="premium-plans-section">
          <div className="premium-plans-section-title">Chọn gói của bạn</div>
          <div className="premium-plans-grid">
            {cards.map((p, i) => {
              const isPopular = p.code === 'Plus'
              const isCurrent = p.code === currentCode
              const Icon = p.icon
              return (
                <motion.div
                  key={p.code}
                  className={`premium-plan-card${isPopular ? ' popular' : ''}${isCurrent ? ' is-current' : ''}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {isPopular && (
                    <div className="premium-plan-badge"><SparkleIcon size={11} /> Phổ biến nhất</div>
                  )}
                  {isCurrent && <div className="premium-plan-current-tag">Đang dùng</div>}

                  <div className="premium-plan-icon" style={{ background: p.gradient }}>
                    <Icon size={20} />
                  </div>
                  <div className="premium-plan-name">{p.name}</div>
                  <div className="premium-plan-tagline" style={{ color: p.accent }}>{p.tagline}</div>

                  <div className="premium-plan-price">
                    {p.priceVnd === 0 ? (
                      <span className="premium-plan-amount">Miễn phí</span>
                    ) : (
                      <>
                        <span className="premium-plan-amount">
                          {p.priceVnd != null ? p.priceVnd.toLocaleString('vi-VN') : '—'}
                        </span>
                        <span className="premium-plan-currency">đ / {p.durationDays} ngày</span>
                      </>
                    )}
                  </div>

                  {p.blurb && <p className="premium-plan-blurb">{p.blurb}</p>}

                  <ul className="premium-plan-features">
                    {p.features.map((f, fi) => (
                      <li key={fi}>
                        <CheckIcon size={13} className="premium-check-icon" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    className={`premium-plan-btn${isPopular ? '' : ' is-secondary'}`}
                    onClick={() => handleOrder(p.code)}
                    disabled={ordering === p.code || isCurrent || p.code === 'Free'}
                  >
                    {ordering === p.code
                      ? <span className="spinner" />
                      : isCurrent ? 'Gói hiện tại' : p.code === 'Free' ? 'Mặc định' : 'Đăng ký ngay'}
                  </button>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* ── Quyền lợi nổi bật ── */}
        <div className="premium-features-grid">
          {FEATURE_HIGHLIGHTS.map((f) => (
            <div key={f.name} className="premium-feature-card">
              <div className="premium-feature-icon"><f.icon size={18} /></div>
              <div className="premium-feature-name">{f.name}</div>
              <p className="premium-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>

        {import.meta.env.DEV && (
          <div className="premium-dev-card">
            <strong>Dev tools</strong>
            <p>Tạo đơn và mock-confirm để mô phỏng thanh toán thành công.</p>
            <div className="premium-dev-btns">
              {cards.filter((c) => c.code !== 'Free').map((c) => (
                <button
                  key={c.code}
                  type="button"
                  className="premium-plan-btn is-secondary"
                  onClick={async () => {
                    try {
                      const order = await subscriptionService.order(c.code)
                      if (order?.txnRef) {
                        await subscriptionService.mockConfirm(order.txnRef)
                        toast.success(`Mock-confirm ${c.code} thành công.`)
                        const me = await subscriptionService.me()
                        setCurrent(me)
                      }
                    } catch (err) {
                      toast.error(err?.message || 'Lỗi.')
                    }
                  }}
                >
                  Mock {c.code}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
