import { useEffect, useState } from 'react'
import { subscriptionService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'
import { CrownIcon, CheckIcon, ZapIcon, HeartIcon, EyeIcon, ShieldIcon } from '../../../components/ui/CustomIcons.jsx'
import { motion } from 'framer-motion'
import './Premium.css'

const FEATURE_HIGHLIGHTS = [
  { icon: ZapIcon, name: 'Undo Swipe', desc: 'Lấy lại người vừa bỏ lỡ' },
  { icon: EyeIcon, name: 'Xem ai thích bạn', desc: 'Không cần đoán nữa' },
  { icon: HeartIcon, name: 'Tăng lượt hiển thị', desc: 'Hiện lên đầu danh sách' },
  { icon: ShieldIcon, name: 'Không quảng cáo', desc: 'Trải nghiệm không gián đoạn' },
]

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

  const handleOrder = async (planCode) => {
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
      {/* Hero */}
      <div className="premium-hero">
        <div className="premium-hero-content">
          <div className="premium-hero-icon">
            <CrownIcon size={30} />
          </div>
          <h1 className="premium-hero-title">
            SameMess <span>Premium</span>
          </h1>
          <p className="premium-hero-subtitle">
            Mở khoá trải nghiệm không giới hạn. Kết nối nhanh hơn, hiệu quả hơn.
          </p>
          <div className="premium-features-strip">
            {['Undo swipe', 'Xem ai thích bạn', 'Tăng lượt hiển thị', 'Không quảng cáo'].map((f) => (
              <span key={f} className="premium-feature-pill">
                <CheckIcon size={12} />
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="premium-content">
        {/* Feature highlights */}
        <div className="premium-features-grid">
          {FEATURE_HIGHLIGHTS.map((f) => (
            <div key={f.name} className="premium-feature-card">
              <div className="premium-feature-icon">
                <f.icon size={18} />
              </div>
              <div className="premium-feature-name">{f.name}</div>
              <p className="premium-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Current plan */}
        {current?.planCode && current.planCode !== 'Free' && (
          <div className="premium-current">
            <CrownIcon size={18} />
            <div className="premium-current-info">
              <div className="premium-current-plan">Gói {current.planCode} đang hoạt động</div>
              <div className="premium-current-exp">
                Hết hạn: {current.expiresAt ? new Date(current.expiresAt).toLocaleDateString('vi-VN') : '—'}
              </div>
            </div>
          </div>
        )}

        {/* Plans */}
        <div className="premium-plans-section">
          <div className="premium-plans-section-title">Chọn gói của bạn</div>
          <div className="premium-plans-grid">
            {plans.map((p, i) => {
              const isPopular = i === 1
              return (
                <motion.div
                  key={p.code}
                  className={`premium-plan-card${isPopular ? ' popular' : ''}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {isPopular && (
                    <div className="premium-plan-badge">
                      <Zap size={10} /> Phổ biến nhất
                    </div>
                  )}
                  <div className="premium-plan-header">
                    <div className="premium-plan-name">{p.name || p.code}</div>
                    <div className="premium-plan-price">
                      <span className="premium-plan-amount">
                        {p.priceVnd ? `${p.priceVnd.toLocaleString('vi-VN')}` : '—'}
                      </span>
                      {p.priceVnd && <span className="premium-plan-currency">đ</span>}
                    </div>
                  </div>
                  {p.duration && (
                    <div className="premium-plan-duration">/{p.duration} ngày</div>
                  )}
                  {Array.isArray(p.features) && p.features.length > 0 && (
                    <ul className="premium-plan-features">
                      {p.features.map((f, fi) => (
                        <li key={fi}>
                          <CheckIcon size={13} className="premium-check-icon" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                  <button
                    type="button"
                    className={`premium-plan-btn${isPopular ? '' : ' is-secondary'}`}
                    onClick={() => handleOrder(p.code)}
                    disabled={ordering === p.code}
                  >
                    {ordering === p.code ? <span className="spinner" /> : 'Đăng ký ngay'}
                  </button>
                </motion.div>
              )
            })}
          </div>
        </div>

        {import.meta.env.DEV && (
          <div className="premium-dev-card">
            <strong>Dev tools</strong>
            <p>Tạo đơn và mock-confirm để mô phỏng thanh toán thành công.</p>
            <button
              type="button"
              className="premium-plan-btn is-secondary"
              onClick={async () => {
                try {
                  const plan = plans[0]
                  if (!plan) return
                  const order = await subscriptionService.order(plan.code)
                  if (order?.txnRef) {
                    await subscriptionService.mockConfirm(order.txnRef)
                    toast.success('Mock-confirm thành công.')
                    const me = await subscriptionService.me()
                    setCurrent(me)
                  }
                } catch (err) {
                  toast.error(err?.message || 'Lỗi.')
                }
              }}
            >
              Mock confirm
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
