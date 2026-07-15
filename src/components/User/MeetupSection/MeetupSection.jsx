/**
 * MeetupSection — tab "Hẹn hò" trong LoveTree (mở khi cây Level >= 4).
 *
 * Flow tạo cuộc hẹn:
 *   1. Danh sách lịch hẹn + nút "Tạo cuộc hẹn"
 *   2. Bấm nút → chọn quán (lọc theo loại / bán kính)
 *   3. Chọn quán → nhập ngày giờ + lời nhắn → Gửi đề xuất
 *   4. Đối phương: Đồng ý / Từ chối / Đổi giờ (gửi đề xuất ngược)
 *
 * Backend:
 *   GET  /api/meetup/nearby/{matchId}                 — danh sách quán
 *   POST /api/connection/meetup/{conversationId}/propose
 *   GET  /api/connection/meetups/{conversationId}
 *   POST /api/connection/meetup/{meetupId}/respond    — { action: accept|decline }
 *   (Gửi đề xuất mới sẽ TỰ thay thế đề xuất đang chờ — "đổi giờ" = đề xuất lại.)
 */
import { useCallback, useEffect, useState } from 'react'
import { venuesService, meetupService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'
import { resolveImageUrl, formatDistance } from '../../../utils/format.js'
import { brandBg } from '../../../utils/brandBg.js'
import VenueDetailModal from '../VenueDetailModal/VenueDetailModal.jsx'

const CATEGORY_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'cafe', label: '☕ Cà phê' },
  { value: 'restaurant', label: '🍽️ Nhà hàng' },
  { value: 'cinema', label: '🎬 Rạp phim' },
  { value: 'park', label: '🌳 Công viên' },
  { value: 'bar', label: '🍸 Bar' },
  { value: 'dessert', label: '🍰 Tráng miệng' },
]
const PRICE_LABELS = { 1: 'Rẻ', 2: 'Bình thường', 3: 'Hơi mắc', 4: 'Sang trọng' }
const CATEGORY_ICONS = { cafe: '☕', restaurant: '🍽️', cinema: '🎬', park: '🌳', bar: '🍸', dessert: '🍰' }

// Mặc định: 3 ngày sau, làm tròn giờ
function defaultDateTime() {
  const d = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  d.setMinutes(0, 0, 0)
  return toLocalInput(d)
}
function toLocalInput(d) {
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16)
}
const MIN_DATETIME = toLocalInput(new Date(Date.now() + 60 * 60 * 1000)) // tối thiểu +1h

export default function MeetupSection({ matchId, conversationId, plant }) {
  const toast = useToast()
  const isUnlocked = Number(plant?.level ?? 0) >= 4

  // step: 'list' | 'pickVenue' | 'form'
  const [step, setStep] = useState('list')

  // ── Venues ──
  const [venues, setVenues] = useState([])
  const [loadingVenues, setLoadingVenues] = useState(false)
  const [category, setCategory] = useState('')
  const [radiusKm, setRadiusKm] = useState(10)
  const [detailVenue, setDetailVenue] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // ── Propose form ──
  const [chosenVenue, setChosenVenue] = useState(null)
  const [proposedAt, setProposedAt] = useState(defaultDateTime)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // ── Meetups ──
  const [meetups, setMeetups] = useState([])
  const [loadingMeetups, setLoadingMeetups] = useState(false)
  const [responding, setResponding] = useState(null)

  const loadVenues = useCallback(() => {
    if (!matchId) return
    let cancelled = false
    setLoadingVenues(true)
    setVenues([])
    venuesService.nearby(matchId, { category, radiusKm })
      .then((list) => { if (!cancelled) setVenues(Array.isArray(list) ? list : (list?.items ?? [])) })
      .catch(() => { /* 403 — guard ở §lock */ })
      .finally(() => { if (!cancelled) setLoadingVenues(false) })
    return () => { cancelled = true }
  }, [matchId, category, radiusKm])

  const loadMeetups = useCallback(() => {
    if (!conversationId) return
    let cancelled = false
    setLoadingMeetups(true)
    meetupService.list(conversationId)
      .then((list) => { if (!cancelled) setMeetups(Array.isArray(list) ? list : (list?.items ?? [])) })
      .catch(() => { /* ignore */ })
      .finally(() => { if (!cancelled) setLoadingMeetups(false) })
    return () => { cancelled = true }
  }, [conversationId])

  useEffect(() => { if (isUnlocked) return loadMeetups() }, [isUnlocked, loadMeetups])
  // Tải quán khi bước vào màn chọn quán
  useEffect(() => { if (step === 'pickVenue') return loadVenues() }, [step, loadVenues])

  const goCreate = () => {
    setChosenVenue(null)
    setStep('pickVenue')
  }

  const pickVenue = (v) => {
    setChosenVenue(v)
    setProposedAt(defaultDateTime())
    setNote('')
    setStep('form')
  }

  const resetToList = () => {
    setStep('list')
    setChosenVenue(null)
    setNote('')
  }

  const handlePropose = async (e) => {
    e?.preventDefault()
    if (!conversationId || !chosenVenue) return
    if (new Date(proposedAt).getTime() <= Date.now()) {
      toast.warn('Vui lòng chọn thời gian trong tương lai.')
      return
    }
    setSubmitting(true)
    try {
      await meetupService.propose(conversationId, {
        venueId: chosenVenue.id || chosenVenue.venueId,
        proposedAt: new Date(proposedAt).toISOString(),
        note: note.trim() || undefined,
      })
      toast.success('Đã gửi lời mời hẹn! 💕')
      resetToList()
      loadMeetups()
    } catch (err) {
      toast.error(err?.message || 'Gửi đề xuất thất bại.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRespond = async (meetupId, action) => {
    setResponding(meetupId)
    try {
      await meetupService.respond(meetupId, action)
      toast.success(action === 'accept' ? 'Đã đồng ý hẹn! 💕' : 'Đã từ chối.')
      loadMeetups()
    } catch (err) {
      toast.error(err?.message || 'Không thể phản hồi.')
    } finally {
      setResponding(null)
    }
  }

  // "Đổi giờ/quán" → mở form với quán của đề xuất đến, người dùng đặt giờ mới rồi gửi (đề xuất ngược)
  const startCounter = (incoming) => {
    setChosenVenue({ id: incoming.venueId, name: incoming.venueName })
    setProposedAt(defaultDateTime())
    setNote('')
    setStep('form')
  }

  const incomingProposal = meetups.find((m) => m.status === 'Proposed' && !m.isMine)
  const myPending = meetups.find((m) => m.status === 'Proposed' && m.isMine)
  const acceptedMeetups = meetups
    .filter((m) => m.status === 'Accepted')
    .sort((a, b) => new Date(a.proposedAt) - new Date(b.proposedAt))

  // ── Lock ──
  if (!isUnlocked) {
    return (
      <div className="meetup-locked">
        <div className="meetup-locked-icon" style={{ fontSize: 48 }}>🌳</div>
        <h3>Mở khóa hẹn hò ở Level 4</h3>
        <p>Chăm cây tình yêu đạt <strong>Level 4</strong> để cùng nhau lên kế hoạch gặp gỡ.</p>
        <p className="meetup-locked-sub">Cây hiện ở Level {plant?.level ?? 1} — tưới cây mỗi ngày nhé!</p>
      </div>
    )
  }

  // ── Step 2: chọn quán ──
  if (step === 'pickVenue') {
    return (
      <div className="meetup-section">
        <div className="meetup-step-head">
          <button type="button" className="meetup-back" onClick={resetToList}>← Quay lại</button>
          <span className="meetup-step-title">Chọn quán hẹn</span>
        </div>

        <div className="meetup-filter-row">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="meetup-select">
            {CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={radiusKm} onChange={(e) => setRadiusKm(Number(e.target.value))} className="meetup-select">
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={20}>20 km</option>
            <option value={30}>30 km</option>
          </select>
          <button type="button" className="btn btn-ghost btn-sm" onClick={loadVenues} disabled={loadingVenues}>🔄</button>
        </div>

        {loadingVenues ? (
          <div className="loading-block" style={{ padding: 16 }}><span className="spinner" /></div>
        ) : venues.length === 0 ? (
          <p className="empty" style={{ padding: 16 }}>Không tìm thấy quán nào gần đây. Thử mở rộng bán kính.</p>
        ) : (
          <div className="meetup-venues-grid">
            {venues.map((v) => {
              const img = brandBg(v.name) || resolveImageUrl(v.imageUrl)
              return (
                <div key={v.id} className="meetup-venue-card" onClick={() => pickVenue(v)}
                  role="button" tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && pickVenue(v)}>
                  {img ? (
                    <div className="meetup-venue-img" style={{ backgroundImage: `url(${img})` }} />
                  ) : (
                    <div className="meetup-venue-img meetup-venue-img-placeholder">{CATEGORY_ICONS[v.category] ?? '📍'}</div>
                  )}
                  <button type="button" className="meetup-venue-detail-btn"
                    onClick={(e) => { e.stopPropagation(); setDetailVenue(v); setDetailOpen(true) }} title="Xem chi tiết">ℹ️</button>
                  <div className="meetup-venue-info">
                    <div className="meetup-venue-name">{v.name}</div>
                    <div className="meetup-venue-meta">
                      {CATEGORY_ICONS[v.category]} {v.category}
                      {v.priceRange ? ` · ${PRICE_LABELS[v.priceRange] ?? ''}` : ''}
                      {v.distanceKm != null ? ` · ${formatDistance(v.distanceKm)}` : ''}
                    </div>
                    {v.address && <div className="meetup-venue-address">{v.address}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <VenueDetailModal venue={detailVenue} open={detailOpen}
          onClose={() => setDetailOpen(false)}
          onPropose={(v) => { setDetailOpen(false); pickVenue(v) }} />
      </div>
    )
  }

  // ── Step 3: nhập ngày giờ + gửi ──
  if (step === 'form' && chosenVenue) {
    return (
      <div className="meetup-section">
        <div className="meetup-step-head">
          <button type="button" className="meetup-back" onClick={() => setStep('pickVenue')}>← Đổi quán</button>
          <span className="meetup-step-title">Chi tiết cuộc hẹn</span>
        </div>

        <form className="meetup-propose-form" onSubmit={handlePropose}>
          <div className="meetup-propose-venue">📍 <strong>{chosenVenue.name || `Quán #${chosenVenue.id}`}</strong></div>
          <div className="field">
            <label className="field-label">Thời gian</label>
            <input type="datetime-local" className="meetup-datetime" value={proposedAt}
              min={MIN_DATETIME} onChange={(e) => setProposedAt(e.target.value)} required />
          </div>
          <div className="field">
            <label className="field-label">Lời nhắn (tuỳ chọn)</label>
            <textarea rows={2} className="meetup-textarea" value={note}
              onChange={(e) => setNote(e.target.value)} maxLength={300}
              placeholder="Mình rủ bạn đi cà phê chiều cuối tuần nhé ☕" />
          </div>
          <div className="meetup-propose-actions">
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
              {submitting ? <span className="spinner" /> : '💕 Gửi lời mời'}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={resetToList}>Hủy</button>
          </div>
        </form>
      </div>
    )
  }

  // ── Step 1: danh sách lịch hẹn + nút tạo ──
  return (
    <div className="meetup-section">
      <div className="meetup-proposals">
        <h3 className="meetup-section-title">📅 Lịch hẹn</h3>

        {loadingMeetups ? (
          <div style={{ padding: 12 }}><span className="spinner" /></div>
        ) : (
          <>
            {acceptedMeetups.map((mu) => (
              <div key={mu.id} className="meetup-card meetup-card-accepted">
                <div className="meetup-card-icon">✅</div>
                <div className="meetup-card-body">
                  <div className="meetup-card-title">Buổi hẹn đã chốt</div>
                  <div className="meetup-card-venue">{mu.venueName || `Quán #${mu.venueId}`}</div>
                  <div className="meetup-card-time">⏰ {formatMeetupTime(mu.proposedAt)}</div>
                  {mu.note && <p className="meetup-card-note">{mu.note}</p>}
                </div>
              </div>
            ))}

            {incomingProposal && (
              <div className="meetup-card meetup-card-incoming">
                <div className="meetup-card-icon">💌</div>
                <div className="meetup-card-body">
                  <div className="meetup-card-title">{incomingProposal.venueName || `Quán #${incomingProposal.venueId}`}</div>
                  <div className="meetup-card-time">⏰ {formatMeetupTime(incomingProposal.proposedAt)}</div>
                  {incomingProposal.note && <p className="meetup-card-note">{incomingProposal.note}</p>}
                  <div className="meetup-card-actions">
                    <button type="button" className="btn btn-primary btn-sm"
                      disabled={responding === incomingProposal.id}
                      onClick={() => handleRespond(incomingProposal.id, 'accept')}>
                      {responding === incomingProposal.id ? <span className="spinner" /> : '💕 Đồng ý'}
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm"
                      disabled={responding === incomingProposal.id}
                      onClick={() => handleRespond(incomingProposal.id, 'decline')}>Từ chối</button>
                    <button type="button" className="btn btn-ghost btn-sm"
                      onClick={() => startCounter(incomingProposal)}>🔄 Đổi giờ/quán</button>
                  </div>
                </div>
              </div>
            )}

            {myPending && !incomingProposal && (
              <div className="meetup-card meetup-card-pending">
                <div className="meetup-card-icon">⏳</div>
                <div className="meetup-card-body">
                  <div className="meetup-card-title">Đang chờ đối phương phản hồi…</div>
                  <div className="meetup-card-venue">
                    {(myPending.venueName || `Quán #${myPending.venueId}`)} · {formatMeetupTime(myPending.proposedAt)}
                  </div>
                </div>
              </div>
            )}

            {acceptedMeetups.length === 0 && !incomingProposal && !myPending && (
              <div className="meetup-empty">
                <p>Chưa có cuộc hẹn nào.</p>
                <p className="meetup-empty-hint">Tạo lời mời để rủ {plant?.partnerName || 'người ấy'} đi chơi nhé!</p>
              </div>
            )}
          </>
        )}

        {/* Nút tạo cuộc hẹn — luôn hiển thị (gửi mới sẽ thay đề xuất đang chờ) */}
        <button type="button" className="btn btn-primary meetup-cta"
          onClick={goCreate} disabled={!conversationId}>
          ➕ {acceptedMeetups.length > 0 ? 'Đặt lịch hẹn khác' : (myPending || incomingProposal ? 'Đề xuất khác' : 'Tạo cuộc hẹn')}
        </button>
        {!conversationId && (
          <p className="meetup-empty-hint" style={{ textAlign: 'center' }}>Đang chuẩn bị hội thoại…</p>
        )}
      </div>
    </div>
  )
}

function formatMeetupTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('vi-VN', {
      weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return iso }
}
