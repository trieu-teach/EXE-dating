import { resolveImageUrl, formatDistance, timeAgo } from '../../../utils/format.js'

/**
 * Card hiển thị 1 lời mời gặp mặt (meet-up) từ đối phương.
 *
 * Props:
 *  - meetup: { id, proposerId, venueId, venueName?, venueAddress?, proposedAt, note, status }
 */
export default function MeetUpCard({ meetup, onAccept, onDecline, loading }) {
  const cover = resolveImageUrl(meetup?.venuePhotoUrl)
  return (
    <article className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        style={{
          height: 120,
          borderRadius: 12,
          background: cover ? `url(${cover}) center/cover` : 'var(--color-surface-2)',
        }}
      />
      <div>
        <div style={{ fontWeight: 700 }}>
          {meetup?.venueName || `Địa điểm #${meetup?.venueId}`}
        </div>
        {meetup?.venueAddress && (
          <div style={{ fontSize: 13, color: 'var(--color-text-soft)' }}>
            {meetup.venueAddress} · {formatDistance(meetup?.distanceKm)}
          </div>
        )}
        <div style={{ fontSize: 13, color: 'var(--color-text-soft)', marginTop: 4 }}>
          ⏰ {meetup?.proposedAt ? new Date(meetup.proposedAt).toLocaleString('vi-VN') : '—'}
        </div>
        {meetup?.note && (
          <p style={{ marginTop: 8, fontSize: 14 }}>{meetup.note}</p>
        )}
        {meetup?.status && (
          <div className="tag" style={{ marginTop: 8 }}>Trạng thái: {meetup.status}</div>
        )}
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
          Gửi {timeAgo(meetup?.createdAt || meetup?.proposedAt)}
        </div>
      </div>
      {(onAccept || onDecline) && (
        <div style={{ display: 'flex', gap: 8 }}>
          {onDecline && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onDecline}
              disabled={loading}
            >
              Từ chối
            </button>
          )}
          {onAccept && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={onAccept}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : 'Đồng ý gặp'}
            </button>
          )}
        </div>
      )}
    </article>
  )
}
