import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { datePassService, subscriptionService, reviewService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'
import { resolveImageUrl } from '../../../utils/format.js'
import { brandBg } from '../../../utils/brandBg.js'
import { HeartIcon, CheckIcon } from '../../../components/ui/CustomIcons.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import './DatePass.css'

const vnd = (n) => (n ?? 0).toLocaleString('vi-VN') + 'đ'
const CAT_ICON = { cafe: '☕', restaurant: '🍽️', cinema: '🎬', park: '🌳', bar: '🍸', dessert: '🍰' }

// Màu chủ đạo từng thương hiệu — dùng cho dải nhấn mỏng ở mép trên banner (không phủ
// nguyên banner nữa, để mọi banner logo dùng chung 1 nền trắng ngà đồng nhất).
const BRAND_TINTS = [
  { match: /cgv/i, color: '#e2231a' },
  { match: /gong\s?cha/i, color: '#6b0f2a' },
  { match: /haidilao/i, color: '#c8102e' },
  { match: /highlands/i, color: '#7a2323' },
  { match: /kfc/i, color: '#e4002b' },
  { match: /katinat/i, color: '#173b4c' },
  { match: /ph[uú]c\s?long/i, color: '#1c5c3b' },
  { match: /pizza\s?4p/i, color: '#1c2b4a' },
  { match: /starbucks/i, color: '#00704a' },
  { match: /coffee\s?house/i, color: '#f2681c' },
]
function brandTint(venueName) {
  return BRAND_TINTS.find((b) => b.match.test(venueName || ''))?.color || 'var(--color-primary)'
}

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

  // Đánh giá sau buổi hẹn
  const [pending, setPending] = useState([])          // buổi hẹn chưa đánh giá
  const [reviewFor, setReviewFor] = useState(null)    // pending item đang mở form
  const [rating, setRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const reloadOrders = () =>
    datePassService.my().then((d) => setOrders(Array.isArray(d) ? d : (d?.items ?? []))).catch(() => {})
  const reloadPending = () =>
    reviewService.pending().then((d) => setPending(Array.isArray(d) ? d : (d?.items ?? []))).catch(() => {})

  useEffect(() => {
    Promise.all([
      datePassService.combos().catch(() => []),
      datePassService.my().catch(() => []),
      datePassService.eligibleMatches().catch(() => []),
      reviewService.pending().catch(() => []),
    ]).then(([c, o, m, p]) => {
      const norm = (x) => (Array.isArray(x) ? x : (x?.items ?? []))
      setCombos(norm(c)); setOrders(norm(o)); setMatches(norm(m)); setPending(norm(p))
    }).finally(() => setLoading(false))
  }, [])

  // Tập orderId đang chờ đánh giá (để hiện nút "Đánh giá" trên voucher đã dùng)
  const pendingSet = useMemo(() => new Set(pending.map((p) => p.datePassOrderId)), [pending])

  const openReview = (order) => {
    // tìm thông tin pending khớp order (để lấy tên đối phương)
    const p = pending.find((x) => x.datePassOrderId === order.id)
      || { datePassOrderId: order.id, partnerName: order.partnerName, venueName: order.venueName }
    setReviewFor(p); setRating(0); setReviewComment('')
  }

  const submitReview = async () => {
    if (!reviewFor) return
    if (rating < 1) { toast.warn('Hãy chọn số sao (1–5).'); return }
    setSubmittingReview(true)
    try {
      await reviewService.create({ datePassOrderId: reviewFor.datePassOrderId, rating, comment: reviewComment.trim() || null })
      toast.success(`Đã gửi đánh giá ${rating}★ cho ${reviewFor.partnerName || 'người ấy'} 💖`)
      setReviewFor(null)
      reloadPending()
    } catch (err) {
      if (err?.status === 409) toast.error('Bạn đã đánh giá buổi hẹn này rồi.')
      else toast.error(err?.message || 'Không gửi được đánh giá.')
    } finally {
      setSubmittingReview(false)
    }
  }

  // Quay về từ PayOS: chốt thanh toán (hỏi PayOS trạng thái thật) rồi làm mới voucher
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const payment = params.get('payment')
    if (!payment) return
    const orderCode = params.get('orderCode')
    window.history.replaceState({}, '', '/date-pass')
    if (payment === 'success') {
      ;(async () => {
        // Chốt Paid + phát voucher không phụ thuộc webhook (Render Free hay ngủ → webhook có thể trượt)
        if (orderCode) { try { await subscriptionService.payosVerify(orderCode) } catch { /* vẫn reload bên dưới */ } }
        toast.success('Thanh toán thành công! Voucher đã gửi tới email của cả hai bạn 🎟️')
        setTab('vouchers')
        reloadOrders()
      })()
    } else {
      toast.error('Thanh toán đã bị hủy hoặc không thành công.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // PayOS: tạo đơn → chuyển hướng sang trang thanh toán VietQR (tiền thật)
      const res = await datePassService.payosCreate({ comboId: buyCombo.id, matchId })
      if (res?.checkoutUrl) {
        toast.info('Đang chuyển tới trang thanh toán PayOS…')
        window.location.href = res.checkoutUrl
        return
      }
      toast.error('Không nhận được link thanh toán.')
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
      reloadPending()
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
      {/* Header sạch + accent thương hiệu */}
      <header className="dp-hdr">
        <span className="dp-hdr-glow ph-glow" aria-hidden />
        <h1 className="dp-hdr-title ph-title"><span className="dp-hdr-script ph-script">Combo cho</span> <span className="dp-hdr-accent ph-accent">buổi hẹn <HeartIcon size={22} className="ph-icon ph-beat dp-hdr-heart" /></span></h1>
        <p className="ph-subtitle dp-hdr-subtitle">Đặt combo ưu đãi tại quán đối tác — nhận voucher qua email, ra quán chỉ cần đưa mã QR.</p>
      </header>

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
                const tint = brandTint(v.venueName)
                const bg = brandBg(v.venueName)
                return (
                  <motion.div key={v.venueId} className="dp-combo-card"
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    onClick={() => setVenueModal(v)} role="button" tabIndex={0}
                    onKeyDown={(e) => (e.key === 'Enter') && setVenueModal(v)}>
                    <div className={`dp-combo-inner${bg ? ' has-photo' : ''}`} style={{
                      '--brand-color': tint,
                      ...(bg ? {
                        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.1) 45%, rgba(0,0,0,0.7) 100%), url(${bg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      } : {}),
                    }}>
                      <div className="dp-combo-top">
                        <span className="dp-combo-count-badge">Giảm {v.items.length} ưu đãi</span>
                        {!bg && v.venueImageUrl && (
                          <span className="dp-combo-logo-chip">
                            <span className="dp-combo-logo" style={{ backgroundImage: `url(${resolveImageUrl(v.venueImageUrl)})` }} />
                          </span>
                        )}
                      </div>
                      <div className="dp-combo-bottom">
                        <div className="dp-combo-venue">{CAT_ICON[v.category] || '📍'} {v.category}</div>
                        <div className="dp-combo-title">{v.venueName}</div>
                        {v.venueAddress && <div className="dp-combo-desc">{v.venueAddress}</div>}
                        <div className="dp-combo-foot-row">
                          <div className="dp-combo-price">
                            <span className="dp-price-from">Từ</span>{' '}
                            <span className="dp-price-sale">{vnd(min)}</span>
                          </div>
                          <span className="dp-combo-cta">Xem ưu đãi →</span>
                        </div>
                      </div>
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
                    {o.status === 'Redeemed' && (
                      pendingSet.has(o.id)
                        ? <button className="dp-review-btn" onClick={() => openReview(o)}>⭐ Đánh giá</button>
                        : <span className="dp-voucher-done" title="Đã đánh giá"><CheckIcon size={20} /></span>
                    )}
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
              <div className="dp-detail-img" style={{
                backgroundImage: brandBg(venueModal.venueName)
                  ? `url(${brandBg(venueModal.venueName)})`
                  : venueModal.venueImageUrl ? `url(${resolveImageUrl(venueModal.venueImageUrl)})` : undefined,
              }}>
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
                          {paying ? <span className="spinner" /> : `Thanh toán ${vnd(buyCombo.salePriceVnd)}`}
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

      {/* ── Modal đánh giá sau buổi hẹn ── */}
      <AnimatePresence>
        {reviewFor && (
          <motion.div className="dp-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => !submittingReview && setReviewFor(null)}>
            <motion.div className="dp-modal dp-review-modal" initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }} onClick={(e) => e.stopPropagation()}>
              <div className="dp-review-head">
                <div className="dp-review-title">Đánh giá buổi hẹn</div>
                <div className="dp-review-sub">Bạn thấy <strong>{reviewFor.partnerName || 'người ấy'}</strong> thế nào?</div>
              </div>

              <div className="dp-stars">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button"
                    className={`dp-star${n <= rating ? ' is-on' : ''}`}
                    onClick={() => setRating(n)} aria-label={`${n} sao`}>★</button>
                ))}
              </div>
              <div className="dp-stars-label">
                {['', 'Tệ', 'Không hợp', 'Ổn', 'Tốt', 'Tuyệt vời'][rating]}
              </div>

              <textarea className="dp-review-text" rows={3} maxLength={500}
                placeholder="Nhận xét ngắn (không bắt buộc)…"
                value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} />

              <div className="dp-modal-actions">
                <button className="dp-pay-btn" disabled={submittingReview || rating < 1} onClick={submitReview}>
                  {submittingReview ? <span className="spinner" /> : 'Gửi đánh giá'}
                </button>
                <button className="btn btn-ghost btn-sm" disabled={submittingReview} onClick={() => setReviewFor(null)}>Để sau</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
