import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { datePassService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'
import { resolveImageUrl } from '../../../utils/format.js'
import { HeartIcon, SparkleIcon, CheckIcon } from '../../../components/ui/CustomIcons.jsx'
import HeroFX from '../../../components/User/HeroFX/HeroFX.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import './DatePass.css'

const vnd = (n) => (n ?? 0).toLocaleString('vi-VN') + 'đ'
const CAT_ICON = { cafe: '☕', restaurant: '🍽️', cinema: '🎬', park: '🌳', bar: '🍸', dessert: '🍰' }
const STATUS = {
  Pending: { label: 'Chờ thanh toán', cls: 'is-pending' },
  Paid: { label: 'Sẵn sàng dùng', cls: 'is-paid' },
  Redeemed: { label: 'Đã sử dụng', cls: 'is-redeemed' },
  Cancelled: { label: 'Đã huỷ', cls: 'is-cancelled' },
}

export default function DatePass() {
  const navigate = useNavigate()
  const toast = useToast()
  const [tab, setTab] = useState('combos')
  const [combos, setCombos] = useState([])
  const [orders, setOrders] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  // chọn quán → chọn combo → mua
  const [venueModal, setVenueModal] = useState(null) // { venueName, category, venueAddress, venueImageUrl, items[] }
  const [buyCombo, setBuyCombo] = useState(null)
  const [matchId, setMatchId] = useState('')
  const [paying, setPaying] = useState(false)
  const [voucher, setVoucher] = useState(null) // order vừa mua → hiện QR
  const [redeeming, setRedeeming] = useState(null)

  const reloadOrders = () =>
    datePassService.my().then((d) => setOrders(Array.isArray(d) ? d : (d?.items ?? []))).catch(() => {})

  useEffect(() => {
    Promise.all([
      datePassService.combos().catch(() => []),
      datePassService.my().catch(() => []),
      datePassService.eligibleMatches().catch(() => []),
    ]).then(([c, o, m]) => {
      const norm = (x) => (Array.isArray(x) ? x : (x?.items ?? []))
      setCombos(norm(c)); setOrders(norm(o)); setMatches(norm(m))
    }).finally(() => setLoading(false))
  }, [])

  const openBuy = (combo) => {
    setBuyCombo(combo)
    setMatchId(matches[0]?.matchId || '')
    setVoucher(null)
  }

  const pay = async () => {
    if (!buyCombo || !matchId) { toast.warn('Hãy chọn người hẹn.'); return }
    setPaying(true)
    try {
      const created = await datePassService.createOrder({ comboId: buyCombo.id, matchId })
      const paid = await datePassService.confirm(created.id)
      toast.success('Thanh toán thành công! Voucher đã được gửi tới email 🎟️')
      setVoucher(paid)
      reloadOrders()
    } catch (err) {
      if (err?.status === 409) toast.error(err?.message || 'Cặp của bạn đã có voucher cho combo này.')
      else toast.error(err?.message || 'Đặt combo thất bại.')
    } finally {
      setPaying(false)
    }
  }

  const redeem = async (o) => {
    setRedeeming(o.id)
    try {
      await datePassService.redeem(o.id)
      toast.success('Đã xác nhận sử dụng tại quán ✅')
      reloadOrders()
    } catch (err) {
      toast.error(err?.message || 'Không xác nhận được.')
    } finally {
      setRedeeming(null)
    }
  }

  // Gom combo theo quán
  const venues = (() => {
    const g = {}
    for (const c of combos) {
      const k = c.venueId
      if (!g[k]) g[k] = { venueId: k, venueName: c.venueName, category: c.category, venueAddress: c.venueAddress, venueImageUrl: c.venueImageUrl, items: [] }
      g[k].items.push(c)
    }
    return Object.values(g)
  })()

  if (loading) return <div className="loading-block"><span className="spinner" /></div>

  return (
    <div className="dp-root">
      {/* Hero banner */}
      <div className="dp-hero">
        <div className="dp-hero-inner">
          <div className="dp-hero-eyebrow"><SparkleIcon size={12} /> Ưu đãi hẹn hò</div>
          <h1>Combo cho buổi hẹn của bạn 💕</h1>
          <p>Đặt combo ưu đãi tại quán đối tác — nhận voucher qua email, ra quán chỉ cần đưa mã QR.</p>
        </div>
        <HeroFX emojis={['🎟️', '☕', '🍕', '🍷', '💕', '🍰', '🎬', '✨']} />
        <div className="dp-hero-deco" aria-hidden>🎟️</div>
      </div>

      {/* Tabs */}
      <div className="dp-tabs">
        <button className={`dp-tab${tab === 'combos' ? ' is-active' : ''}`} onClick={() => setTab('combos')}>Ưu đãi</button>
        <button className={`dp-tab${tab === 'vouchers' ? ' is-active' : ''}`} onClick={() => setTab('vouchers')}>
          Voucher của tôi{orders.length > 0 && <span className="dp-tab-count">{orders.length}</span>}
        </button>
      </div>

      <div className="dp-body">
        {/* ── TAB: Quán (bấm để xem voucher) ── */}
        {tab === 'combos' && (
          venues.length === 0 ? (
            <div className="dp-empty">Chưa có quán nào. Quay lại sau nhé!</div>
          ) : (
            <div className="dp-combo-grid">
              {venues.map((v) => {
                const min = Math.min(...v.items.map((i) => i.salePriceVnd))
                return (
                  <motion.div key={v.venueId} className="dp-combo-card"
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    onClick={() => setVenueModal(v)} role="button" tabIndex={0}
                    onKeyDown={(e) => (e.key === 'Enter') && setVenueModal(v)}>
                    <div className="dp-combo-img" style={v.venueImageUrl ? { backgroundImage: `url(${resolveImageUrl(v.venueImageUrl)})` } : undefined}>
                      <span className="dp-combo-badge dp-count-badge">{v.items.length} ưu đãi</span>
                    </div>
                    <div className="dp-combo-body">
                      <div className="dp-combo-venue">{CAT_ICON[v.category] || '📍'} {v.category}</div>
                      <div className="dp-combo-title">{v.venueName}</div>
                      {v.venueAddress && <div className="dp-combo-desc">{v.venueAddress}</div>}
                      <div className="dp-combo-price">
                        <span className="dp-price-from">Từ</span>
                        <span className="dp-price-sale">{vnd(min)}</span>
                      </div>
                      <div className="dp-combo-cta">Xem ưu đãi →</div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )
        )}

        {/* ── TAB: Vouchers ── */}
        {tab === 'vouchers' && (
          orders.length === 0 ? (
            <div className="dp-empty">
              <p>Bạn chưa có voucher nào.</p>
              <button className="btn btn-primary" onClick={() => setTab('combos')}>Xem ưu đãi</button>
            </div>
          ) : (
            <div className="dp-voucher-list">
              {orders.map((o) => {
                const st = STATUS[o.status] || STATUS.Pending
                return (
                  <div key={o.id} className={`dp-voucher ${st.cls}`}>
                    <div className="dp-voucher-qr">
                      {(o.status === 'Paid' || o.status === 'Redeemed')
                        ? <img src={o.qrUrl} alt="QR" />
                        : <div className="dp-voucher-qr-lock">⏳</div>}
                    </div>
                    <div className="dp-voucher-info">
                      <div className="dp-voucher-title">{o.comboTitle}</div>
                      <div className="dp-voucher-venue">{o.venueName} · với {o.partnerName}</div>
                      <div className="dp-voucher-code">{o.voucherCode}</div>
                      <div className="dp-voucher-meta">
                        <span className={`dp-voucher-status ${st.cls}`}>{st.label}</span>
                        {o.status === 'Redeemed'
                          ? <span className="dp-voucher-exp">Đã dùng {o.redeemedAt ? new Date(o.redeemedAt).toLocaleDateString('vi-VN') : ''}</span>
                          : (() => {
                              const exp = new Date(o.expiresAt)
                              const expired = exp.getTime() < Date.now()
                              return <span className={`dp-voucher-exp${expired ? ' is-expired' : ''}`}>
                                {expired ? '⛔ Đã hết hạn' : `⏳ HSD: ${exp.toLocaleDateString('vi-VN')}`}
                              </span>
                            })()}
                      </div>
                    </div>
                    {o.status === 'Paid' && (
                      <button className="dp-redeem-btn" disabled={redeeming === o.id} onClick={() => redeem(o)}>
                        {redeeming === o.id ? <span className="spinner" /> : 'Quán xác nhận'}
                      </button>
                    )}
                    {o.status === 'Redeemed' && <span className="dp-voucher-done"><CheckIcon size={20} /></span>}
                  </div>
                )
              })}
            </div>
          )
        )}

      </div>

      {/* ── Popup voucher của quán ── */}
      <AnimatePresence>
        {venueModal && (
          <motion.div className="dp-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setVenueModal(null)}>
            <motion.div className="dp-detail" initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }} onClick={(e) => e.stopPropagation()}>
              <div className="dp-detail-img" style={venueModal.venueImageUrl ? { backgroundImage: `url(${resolveImageUrl(venueModal.venueImageUrl)})` } : undefined}>
                <button className="dp-detail-close" onClick={() => setVenueModal(null)} aria-label="Đóng">✕</button>
                <div className="dp-detail-imgname">
                  <div className="dp-detail-venue-row">{CAT_ICON[venueModal.category] || '📍'} {venueModal.category}</div>
                  <h2>{venueModal.venueName}</h2>
                  {venueModal.venueAddress && <div className="dp-detail-addr">📍 {venueModal.venueAddress}</div>}
                </div>
              </div>
              <div className="dp-vlist">
                <div className="dp-vlist-label">Chọn ưu đãi ({venueModal.items.length})</div>
                {venueModal.items.map((c) => (
                  <div key={c.id} className="dp-vrow">
                    <div className="dp-vrow-main">
                      <div className="dp-vrow-title">{c.title}</div>
                      {c.description && <div className="dp-vrow-desc">{c.description}</div>}
                      <div className="dp-vrow-price">
                        <span className="dp-price-sale">{vnd(c.salePriceVnd)}</span>
                        {c.originalPriceVnd > c.salePriceVnd && <span className="dp-price-orig">{vnd(c.originalPriceVnd)}</span>}
                        {c.discountPercent > 0 && <span className="dp-vrow-off">-{c.discountPercent}%</span>}
                      </div>
                    </div>
                    <button className="dp-vrow-btn" onClick={() => { setVenueModal(null); openBuy(c) }}>Đặt</button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal mua ── */}
      <AnimatePresence>
        {buyCombo && (
          <motion.div className="dp-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => !paying && setBuyCombo(null)}>
            <motion.div className="dp-modal" initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }} onClick={(e) => e.stopPropagation()}>
              {voucher ? (
                // Thành công → hiện voucher + QR
                <div className="dp-success">
                  <div className="dp-success-icon">🎟️</div>
                  <h2>Đặt combo thành công!</h2>
                  <img className="dp-success-qr" src={voucher.qrUrl} alt="QR voucher" />
                  <div className="dp-success-code">{voucher.voucherCode}</div>
                  <p>Đã gửi hóa đơn + voucher (cùng 1 mã) tới <strong>email của cả hai bạn</strong>. Ra quán mở app hoặc email, đưa mã QR cho quán quét.</p>
                  <button className="btn btn-primary btn-block" onClick={() => { setBuyCombo(null); setTab('vouchers') }}>Xem voucher của tôi</button>
                </div>
              ) : (
                <>
                  <div className="dp-modal-title">Đặt combo</div>
                  <div className="dp-modal-combo">
                    <strong>{buyCombo.title}</strong>
                    <span>{buyCombo.venueName} · {vnd(buyCombo.salePriceVnd)}</span>
                  </div>

                  {matches.length === 0 ? (
                    <div className="dp-need-match">
                      <p>Bạn cần một match có <strong>Cây tình yêu đạt Cấp 4</strong> để đặt combo hẹn hò.</p>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/love-tree')}>Tới Cây tình yêu</button>
                    </div>
                  ) : (
                    <>
                      <div className="dp-field-label">Hẹn với ai?</div>
                      <div className="dp-match-list">
                        {matches.map((m) => (
                          <button key={m.matchId} type="button"
                            className={`dp-match-item${matchId === m.matchId ? ' is-sel' : ''}`}
                            onClick={() => setMatchId(m.matchId)}>
                            <div className="dp-match-avatar" style={m.avatarUrl ? { backgroundImage: `url(${resolveImageUrl(m.avatarUrl)})` } : undefined}>
                              {!m.avatarUrl && (m.displayName || '?').charAt(0)}
                            </div>
                            <span className="dp-match-name">{m.displayName}</span>
                            <span className="dp-match-lv">Cấp {m.level}</span>
                            {matchId === m.matchId && <CheckIcon size={16} className="dp-match-check" />}
                          </button>
                        ))}
                      </div>

                      <div className="dp-field-hint">🔒 Voucher (cùng 1 mã) sẽ tự gửi tới <strong>email đăng ký của cả hai bạn</strong> — không cần nhập, đảm bảo đúng người match.</div>

                      <div className="dp-modal-actions">
                        <button className="dp-pay-btn" disabled={paying} onClick={pay}>
                          {paying ? <span className="spinner" /> : `Thanh toán ${vnd(buyCombo.salePriceVnd)} (mock)`}
                        </button>
                        <button className="btn btn-ghost btn-sm" disabled={paying} onClick={() => setBuyCombo(null)}>Hủy</button>
                      </div>
                    </>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
