/**
 * MeetupSection — integrated into LoveTree when tree level >= 4.
 *
 * §0  Lock state: shown when level < 4.
 * §1  Venue discovery: GET /api/meetup/nearby/{matchId} — multi-select, category filter.
 * §2  Share venue to chat: POST /api/conversations/{conversationId}/venue.
 * §3  Propose meetup: POST /api/connection/meetup/{conversationId}/propose.
 * §4  Meetup status: GET /api/connection/meetups/{conversationId} — accept/decline/counter.
 *
 * Props:
 *   matchId        — the match UUID
 *   conversationId — the conversation UUID (for sharing + proposing)
 *   plant          — PlantDto from usePlant (to check level)
 *   onProposeVenue — fn(venue) called when user clicks "Đề xuất hẹn ở đây"
 *                   from the venue detail modal (sits inside Chat context)
 */
import { useCallback, useEffect, useState } from 'react'
import { venuesService, meetupService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'
import { resolveImageUrl, formatDistance } from '../../../utils/format.js'
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
const CATEGORY_ICONS = {
  cafe: '☕', restaurant: '🍽️', cinema: '🎬', park: '🌳', bar: '🍸', dessert: '🍰',
}

export default function MeetupSection({ matchId, conversationId, plant, onProposeVenue }) {
  const toast = useToast()

  // ── §0: Lock guard ────────────────────────────────────────────────────────
  const isUnlocked = Number(plant?.level ?? 0) >= 4

  // ── §1: Venues ──────────────────────────────────────────────────────────
  const [venues, setVenues] = useState([])
  const [loadingVenues, setLoadingVenues] = useState(false)
  const [category, setCategory] = useState('')
  const [radiusKm, setRadiusKm] = useState(10)
  const [selected, setSelected] = useState(new Set())
  const [sharing, setSharing] = useState(false)
  const [detailVenue, setDetailVenue] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const loadVenues = useCallback(() => {
    if (!matchId) return
    let cancelled = false
    setLoadingVenues(true)
    setVenues([])
    venuesService.nearby(matchId, { category, radiusKm })
      .then((list) => { if (!cancelled) setVenues(Array.isArray(list) ? list : (list?.items ?? [])) })
      .catch(() => { /* 403 — handled by §0 guard */ })
      .finally(() => { if (!cancelled) setLoadingVenues(false) })
    return () => { cancelled = true }
     
  }, [matchId, category, radiusKm])

  useEffect(() => {
    if (!isUnlocked) return
    return loadVenues()
  }, [isUnlocked, loadVenues])

  const toggleVenue = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleShareSelected = async () => {
    if (!conversationId || selected.size === 0) return
    setSharing(true)
    let shared = 0
    try {
      for (const venueId of selected) {
        await meetupService.shareVenue(conversationId, venueId)
        shared++
      }
      toast.success(`Đã chia sẻ ${shared} quán vào trò chuyện! 💕`)
      setSelected(new Set())
    } catch {
      toast.error('Chia sẻ thất bại. Thử lại.')
    } finally {
      setSharing(false)
    }
  }

  const openVenueDetail = (venue) => {
    setDetailVenue(venue)
    setDetailOpen(true)
  }

  const handleProposeFromDetail = (venue) => {
    // Delegate to parent (Chat) which has the propose form open
    onProposeVenue?.(venue)
  }

  // ── §3+§4: Propose form + meetup status ─────────────────────────────────
  const [meetups, setMeetups] = useState([])
  const [loadingMeetups, setLoadingMeetups] = useState(false)
  const [showProposeForm, setShowProposeForm] = useState(false)
  const [proposeVenue, setProposeVenue] = useState(null)
  const [proposedAt, setProposedAt] = useState(() => {
    const d = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    d.setMinutes(0, 0, 0)
    return d.toISOString().slice(0, 16)
  })
  const [proposeNote, setProposeNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [responding, setResponding] = useState(null) // meetupId being responded to

  const loadMeetups = useCallback(() => {
    if (!conversationId) return
    let cancelled = false
    setLoadingMeetups(true)
    meetupService.list(conversationId)
      .then((list) => {
        if (!cancelled) setMeetups(Array.isArray(list) ? list : (list?.items ?? []))
      })
      .catch(() => { /* ignore — meetup not yet unlocked */ })
      .finally(() => { if (!cancelled) setLoadingMeetups(false) })
    return () => { cancelled = true }
  }, [conversationId])

  useEffect(() => {
    if (!isUnlocked) return
    return loadMeetups()
  }, [isUnlocked, loadMeetups])

  const handlePropose = async (e) => {
    e?.preventDefault()
    if (!conversationId || !proposeVenue) return
    setSubmitting(true)
    try {
      const proposedIso = new Date(proposedAt).toISOString()
      await meetupService.propose(conversationId, {
        venueId: proposeVenue.id || proposeVenue.venueId,
        proposedAt: proposedIso,
        note: proposeNote || undefined,
      })
      toast.success('Đã gửi đề xuất hẹn! 💕')
      setShowProposeForm(false)
      setProposeVenue(null)
      setProposeNote('')
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

  // Active incoming proposal (mine=false, status=Proposed)
  const incomingProposal = meetups.find(
    (m) => m.status === 'Proposed' && !m.isMine,
  )
  // Any accepted meetup
  const acceptedMeetup = meetups.find((m) => m.status === 'Accepted')

  // ── Render ────────────────────────────────────────────────────────────────
  if (!isUnlocked) {
    return (
      <div className="meetup-locked">
        <div className="meetup-locked-icon">🌳</div>
        <p>Chăm cây đạt <strong>Level 4</strong> để mở khóa hẹn hò</p>
        <p className="meetup-locked-hint">Cây hiện đang ở Level {plant?.level ?? 1} — hãy tưới cây thường xuyên nhé!</p>
      </div>
    )
  }

  return (
    <div className="meetup-section">
      {/* ── §2 Share selected venues ───────────────────────────────────── */}
      {selected.size > 0 && (
        <div className="meetup-share-bar">
          <span>Đã chọn {selected.size} quán</span>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={sharing || !conversationId}
            onClick={handleShareSelected}
          >
            {sharing ? <span className="spinner" /> : '💬 Chia sẻ vào trò chuyện'}
          </button>
        </div>
      )}

      {/* ── §1 Venue discovery ─────────────────────────────────────── */}
      <div className="meetup-venues">
        <div className="meetup-venues-toolbar">
          <div className="meetup-filter-row">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="meetup-select"
            >
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="meetup-select"
            >
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={20}>20 km</option>
              <option value={30}>30 km</option>
            </select>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={loadVenues}
              disabled={loadingVenues}
            >
              🔄
            </button>
          </div>
        </div>

        {loadingVenues ? (
          <div className="loading-block" style={{ padding: 16 }}>
            <span className="spinner" />
          </div>
        ) : venues.length === 0 ? (
          <p className="empty" style={{ padding: 16 }}>
            Không tìm thấy quán nào gần đó.
          </p>
        ) : (
          <div className="meetup-venues-grid">
            {venues.map((v) => {
              const img = resolveImageUrl(v.imageUrl)
              const isSel = selected.has(v.id)
              return (
                <div
                  key={v.id}
                  className={`meetup-venue-card${isSel ? ' is-selected' : ''}`}
                  onClick={() => toggleVenue(v.id)}
                  role="checkbox"
                  aria-checked={isSel}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === ' ' && toggleVenue(v.id)}
                >
                  {img ? (
                    <div
                      className="meetup-venue-img"
                      style={{ backgroundImage: `url(${img})` }}
                    />
                  ) : (
                    <div className="meetup-venue-img meetup-venue-img-placeholder">
                      {CATEGORY_ICONS[v.category] ?? '📍'}
                    </div>
                  )}
                  {isSel && (
                    <div className="meetup-venue-check">✓</div>
                  )}
                  <div className="meetup-venue-info">
                    <div className="meetup-venue-name">{v.name}</div>
                    <div className="meetup-venue-meta">
                      {CATEGORY_ICONS[v.category]} {v.category}
                      {v.priceRange ? ` · ${PRICE_LABELS[v.priceRange] ?? ''}` : ''}
                      {v.distanceKm != null ? ` · ${formatDistance(v.distanceKm)}` : ''}
                    </div>
                    {v.address && (
                      <div className="meetup-venue-address">{v.address}</div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm meetup-venue-detail-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      openVenueDetail(v)
                    }}
                    title="Xem chi tiết"
                  >
                    ℹ️
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── §3+§4 Meetup proposals ─────────────────────────────────── */}
      <div className="meetup-proposals">
        <h3 className="meetup-section-title">📅 Lịch hẹn</h3>

        {loadingMeetups ? (
          <div style={{ padding: 12 }}><span className="spinner" /></div>
        ) : (
          <>
            {/* Accepted — always shown */}
            {acceptedMeetup && (
              <div className="meetup-card meetup-card-accepted">
                <div className="meetup-card-icon">✅</div>
                <div className="meetup-card-body">
                  <div className="meetup-card-title">
                    Buổi hẹn đã chốt
                  </div>
                  <div className="meetup-card-venue">
                    {acceptedMeetup.venueName || `Quán #${acceptedMeetup.venueId}`}
                  </div>
                  <div className="meetup-card-time">
                    ⏰ {formatMeetupTime(acceptedMeetup.proposedAt)}
                  </div>
                  {acceptedMeetup.note && (
                    <p className="meetup-card-note">{acceptedMeetup.note}</p>
                  )}
                </div>
              </div>
            )}

            {/* Incoming proposal — I am the RECEIVER */}
            {incomingProposal && (
              <div className="meetup-card meetup-card-incoming">
                <div className="meetup-card-icon">💌</div>
                <div className="meetup-card-body">
                  <div className="meetup-card-title">
                    {incomingProposal.venueName || `Quán #${incomingProposal.venueId}`}
                  </div>
                  <div className="meetup-card-time">
                    ⏰ {formatMeetupTime(incomingProposal.proposedAt)}
                  </div>
                  {incomingProposal.note && (
                    <p className="meetup-card-note">{incomingProposal.note}</p>
                  )}
                  <div className="meetup-card-actions">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={responding === incomingProposal.id}
                      onClick={() => handleRespond(incomingProposal.id, 'accept')}
                    >
                      {responding === incomingProposal.id ? <span className="spinner" /> : '💕 Đồng ý'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      disabled={responding === incomingProposal.id}
                      onClick={() => handleRespond(incomingProposal.id, 'decline')}
                    >
                      Không
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setProposeVenue({ id: incomingProposal.venueId, name: incomingProposal.venueName })
                        setShowProposeForm(true)
                      }}
                    >
                      🔄 Đổi giờ/quán
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* My outgoing proposal — waiting for partner */}
            {meetups.some((m) => m.isMine && m.status === 'Proposed') && !incomingProposal && (
              <div className="meetup-card meetup-card-pending">
                <div className="meetup-card-icon">⏳</div>
                <div className="meetup-card-body">
                  <div className="meetup-card-title">Đang chờ đối phương phản hồi…</div>
                  {meetups
                    .filter((m) => m.isMine && m.status === 'Proposed')
                    .map((m) => (
                      <div key={m.id} className="meetup-card-venue">
                        {m.venueName || `Quán #${m.venueId}`} · {formatMeetupTime(m.proposedAt)}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* §3: Propose form */}
            {showProposeForm && (
              <form className="meetup-propose-form" onSubmit={handlePropose}>
                <div className="meetup-propose-venue">
                  📍 <strong>{proposeVenue?.name || `Quán #${proposeVenue?.id || proposeVenue?.venueId}`}</strong>
                </div>
                <div className="field">
                  <label className="field-label">Thời gian</label>
                  <input
                    type="datetime-local"
                    value={proposedAt}
                    onChange={(e) => setProposedAt(e.target.value)}
                    required
                    className="meetup-datetime"
                  />
                </div>
                <div className="field">
                  <label className="field-label">Lời nhắn (tuỳ chọn)</label>
                  <textarea
                    rows={2}
                    value={proposeNote}
                    onChange={(e) => setProposeNote(e.target.value)}
                    placeholder="Mình rủ bạn đi uống cà phê nhé ☕"
                    maxLength={300}
                    className="meetup-textarea"
                  />
                </div>
                <div className="meetup-propose-actions">
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={submitting}
                  >
                    {submitting ? <span className="spinner" /> : '💕 Gửi đề xuất'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setShowProposeForm(false)
                      setProposeVenue(null)
                    }}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}

            {/* Default state — no proposals, offer to create one */}
            {!showProposeForm && !acceptedMeetup && !incomingProposal && !meetups.some((m) => m.isMine && m.status === 'Proposed') && (
              <div className="meetup-empty">
                <p>Chưa có lời mời hẹn nào.</p>
                <p style={{ fontSize: 13, color: 'var(--color-text-soft)' }}>
                  Chọn một quán ở trên rồi nhấn nút bên dưới để đề xuất!
                </p>
                {!proposeVenue && venues.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: 8 }}
                    onClick={() => {
                      // Auto-select the first venue for proposing
                      if (venues[0]) {
                        setProposeVenue(venues[0])
                        setShowProposeForm(true)
                      }
                    }}
                  >
                    💕 Đề xuất hẹn
                  </button>
                )}
                {proposeVenue && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: 8 }}
                    onClick={() => setShowProposeForm(true)}
                  >
                    💕 Đề xuất hẹn
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Venue detail modal */}
      <VenueDetailModal
        venue={detailVenue}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onPropose={(v) => handleProposeFromDetail(v)}
      />
    </div>
  )
}

function formatMeetupTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}
