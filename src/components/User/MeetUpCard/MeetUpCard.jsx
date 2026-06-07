import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MEETUP_TIME_SLOTS, MEETUP_VENUES } from '../../../data/connectionNudges.js'
import './MeetUpCard.css'

function MeetUpCard({
  partnerName,
  venues,
  locationHint,
  onSendInvite,
  onClose,
  sending = false,
}) {
  const venueList = venues?.length ? venues : MEETUP_VENUES
  const [venueId, setVenueId] = useState(venueList[0]?.id)
  const [timeId, setTimeId] = useState(MEETUP_TIME_SLOTS[0].id)

  useEffect(() => {
    if (venueList[0]?.id) setVenueId(venueList[0].id)
  }, [venueList])

  const venue = venueList.find((v) => v.id === venueId) ?? venueList[0]
  const timeSlot = MEETUP_TIME_SLOTS.find((t) => t.id === timeId) ?? MEETUP_TIME_SLOTS[0]

  return (
    <div className="meetup-card">
      <div className="meetup-card__head">
        <div>
          <span className="meetup-card__eyebrow">Hẹn gặp thật</span>
          <h3>Gợi ý buổi hẹn với {partnerName}</h3>
        </div>
        <button type="button" className="meetup-card__close" onClick={onClose} aria-label="Đóng">
          ✕
        </button>
      </div>

      {locationHint && <p className="meetup-card__location-hint">📍 {locationHint}</p>}

      <p className="meetup-card__lead">
        Chọn địa điểm & thời gian — gợi ý theo vị trí hai bạn đang ở.
      </p>

      <div className="meetup-card__section">
        <span className="meetup-card__label">Địa điểm gần đây</span>
        <div className="meetup-card__options">
          {venueList.map((v) => (
            <button
              key={v.id}
              type="button"
              className={`meetup-card__option${venueId === v.id ? ' meetup-card__option--active' : ''}`}
              onClick={() => setVenueId(v.id)}
            >
              <span className="meetup-card__option-icon">{v.icon}</span>
              <span>
                <strong>{v.name}</strong>
                <em>
                  {v.desc}
                  {v.distanceKm != null ? ` · ~${v.distanceKm} km` : ''}
                </em>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="meetup-card__section">
        <span className="meetup-card__label">Thời gian</span>
        <div className="meetup-card__times">
          {MEETUP_TIME_SLOTS.map((slot) => (
            <button
              key={slot.id}
              type="button"
              className={`meetup-card__time${timeId === slot.id ? ' meetup-card__time--active' : ''}`}
              onClick={() => setTimeId(slot.id)}
            >
              <strong>{slot.label}</strong>
              <span>{slot.sub}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="meetup-card__meta">
        <span>⏱ {venue?.duration ?? '60 phút'}</span>
        <Link to="/safety-checkin" className="meetup-card__safety">
          🛡 Check-in an toàn khi gặp
        </Link>
      </div>

      <button
        type="button"
        className="meetup-card__send"
        disabled={sending || !venue}
        onClick={() => onSendInvite?.({ venue, timeSlot })}
      >
        {sending ? 'Đang gửi...' : `Gửi lời mời hẹn ${partnerName}`}
      </button>
    </div>
  )
}

export default MeetUpCard
