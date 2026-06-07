import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { chatService, connectionRemindersService } from '../../../api/index.js'
import AppShell from '../../../components/User/AppShell/AppShell.jsx'
import PageHeader from '../../../components/User/PageHeader/PageHeader.jsx'
import { MEETUP_TIME_SLOTS, buildMeetupInviteMessage } from '../../../data/connectionNudges.js'
import {
  markNudgeDismissed,
  saveMeetupProposal,
} from '../../../utils/connectionTracking.js'
import {
  canSuggestDateFromTree,
  getLoveTreeState,
  loveTreeToDisplayState,
} from '../../../utils/loveTreeState.js'
import { getNearbyMeetupVenues, getPartnerLocation } from '../../../utils/nearbyMeetup.js'
import './MeetUpPlan.css'

const STAGE_EMOJI = {
  sprout: '🌱',
  sparse: '🌿',
  seedling: '🪴',
  budding: '🌸',
  young: '🌺',
  blooming: '🌳',
  radiant: '✨',
}

function MeetUpPlan() {
  const { partnerId } = useParams()
  const navigate = useNavigate()
  const partner = getPartnerLocation(partnerId)
  const nearby = getNearbyMeetupVenues(partnerId)
  const venues = nearby.venues
  const treeState = getLoveTreeState(partnerId)
  const treeDisplay = loveTreeToDisplayState(treeState)
  const dateReady = canSuggestDateFromTree(treeState)

  const [venueId, setVenueId] = useState(venues[0]?.id)
  const [timeId, setTimeId] = useState(MEETUP_TIME_SLOTS[0].id)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (venues[0]?.id) setVenueId(venues[0].id)
  }, [venues])

  const venue = venues.find((v) => v.id === venueId) ?? venues[0]
  const timeSlot = MEETUP_TIME_SLOTS.find((t) => t.id === timeId) ?? MEETUP_TIME_SLOTS[0]
  const emoji = STAGE_EMOJI[treeDisplay.stageKey] ?? '🌱'

  async function handleSendInvite() {
    if (!venue || sending) return
    setSending(true)

    const inviteText = buildMeetupInviteMessage({
      partnerName: partner.name,
      venue,
      timeSlot,
    })

    try {
      await connectionRemindersService.proposeMeetup(partnerId, {
        venueId: venue.id,
        timeSlotId: timeSlot.id,
      })
      saveMeetupProposal(partnerId, { venue, timeSlot })
      markNudgeDismissed(partnerId, 'ready_to_meet')
      markNudgeDismissed(partnerId, 'weekend_push')
      markNudgeDismissed(partnerId, 'intimacy_date_invite')

      await chatService.sendMessage(partnerId, inviteText)
      setSent(true)
      setTimeout(() => navigate(`/chat/${partnerId}`), 1400)
    } catch {
      setSending(false)
    }
  }

  if (!dateReady) {
    return (
      <AppShell activeNav="chat" focusMode>
        <div className="meetup-plan-page">
          <PageHeader title="Gợi ý hẹn gặp" backTo={`/chat/${partnerId}`} />
          <div className="meetup-plan-locked surface-glass">
            <span className="meetup-plan-locked__emoji">{emoji}</span>
            <h2>Chưa đủ gắn kết để hẹn gặp</h2>
            <p>
              Cây tình yêu với {partner.name} đang ở cấp {treeDisplay.level} ({treeDisplay.stageLabel}
              ). Chăm cây đến <strong>cấp 4 · Chớm nụ</strong> (≥40% gắn kết) để mở gợi ý địa điểm.
            </p>
            <div className="meetup-plan-locked__bar">
              <span style={{ width: `${treeDisplay.attachmentPercent}%` }} />
            </div>
            <Link to={`/love-tree?partner=${partnerId}`} className="meetup-plan-btn meetup-plan-btn--primary">
              Chăm cây tình yêu
            </Link>
            <Link to={`/chat/${partnerId}`} className="meetup-plan-btn meetup-plan-btn--ghost">
              Quay lại chat
            </Link>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell activeNav="chat" focusMode>
      <div className="meetup-plan-page">
        <PageHeader title="Gợi ý hẹn gặp" backTo={`/chat/${partnerId}`} />

        <section className="meetup-plan-hero surface-glass">
          <div className="meetup-plan-couple">
            {partner.image && (
              <img src={partner.image} alt="" className="meetup-plan-couple__avatar" />
            )}
            <div>
              <p className="meetup-plan-hero__eyebrow">Hẹn gặp thật</p>
              <h1>Với {partner.name}</h1>
              <span className="meetup-plan-hero__tree">
                {emoji} Cây cấp {treeDisplay.level} · {treeDisplay.stageLabel}
              </span>
            </div>
          </div>
          {nearby.locationHint && (
            <p className="meetup-plan-hero__location">📍 {nearby.locationHint}</p>
          )}
        </section>

        <section className="meetup-plan-section">
          <h2>Chọn địa điểm</h2>
          <div className="meetup-plan-venues">
            {venues.map((v) => (
              <button
                key={v.id}
                type="button"
                className={`meetup-plan-venue${venueId === v.id ? ' meetup-plan-venue--active' : ''}`}
                onClick={() => setVenueId(v.id)}
              >
                <span className="meetup-plan-venue__icon">{v.icon}</span>
                <div className="meetup-plan-venue__body">
                  <strong>{v.name}</strong>
                  <p>{v.desc}</p>
                  <span>
                    {v.duration}
                    {v.distanceKm != null ? ` · ~${v.distanceKm} km` : ''}
                  </span>
                </div>
                {venueId === v.id && <span className="meetup-plan-venue__check">✓</span>}
              </button>
            ))}
          </div>
        </section>

        <section className="meetup-plan-section">
          <h2>Chọn thời gian</h2>
          <div className="meetup-plan-times">
            {MEETUP_TIME_SLOTS.map((slot) => (
              <button
                key={slot.id}
                type="button"
                className={`meetup-plan-time${timeId === slot.id ? ' meetup-plan-time--active' : ''}`}
                onClick={() => setTimeId(slot.id)}
              >
                <strong>{slot.label}</strong>
                <span>{slot.sub}</span>
              </button>
            ))}
          </div>
        </section>

        <footer className="meetup-plan-footer surface-glass">
          <Link to="/safety-checkin" className="meetup-plan-footer__safety">
            🛡 Check-in an toàn khi gặp
          </Link>
          <button
            type="button"
            className="meetup-plan-btn meetup-plan-btn--primary meetup-plan-btn--wide"
            disabled={sending || sent || !venue}
            onClick={handleSendInvite}
          >
            {sent ? 'Đã gửi — quay lại chat...' : sending ? 'Đang gửi...' : `Gửi lời mời cho ${partner.name}`}
          </button>
        </footer>
      </div>
    </AppShell>
  )
}

export default MeetUpPlan
