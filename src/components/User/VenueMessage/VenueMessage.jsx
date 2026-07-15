/**
 * VenueMessage — renders a venue shared into a chat thread.
 *
 * Props:
 *   venue  — VenueDto (from message.venue*) or VenueDto from nearby API
 *   meta   — optional short text like "vừa được chia sẻ"
 *   compact — if true, shows only image + name (for preview chips)
 *   onPropose — fn(venue) called when "Đề xuất hẹn ở đây" is clicked
 */
import { resolveImageUrl, formatDistance } from '../../../utils/format.js'
import { brandBg } from '../../../utils/brandBg.js'

const CATEGORY_ICONS = {
  cafe: '☕',
  restaurant: '🍽️',
  cinema: '🎬',
  park: '🌳',
  bar: '🍸',
  dessert: '🍰',
}

const PRICE_LABELS = {
  1: 'Rẻ',
  2: 'Bình thường',
  3: 'Hơi mắc',
  4: 'Sang trọng',
}

export default function VenueMessage({
  venue,
  meta,
  compact = false,
  onPropose,
  onClick,
}) {
  if (!venue) return null

  const img = brandBg(venue.name) || resolveImageUrl(venue.imageUrl || venue.venueImageUrl)
  const icon = CATEGORY_ICONS[venue.category] ?? '📍'
  const price = PRICE_LABELS[venue.priceRange] ?? venue.priceRange

  if (compact) {
    return (
      <div
        className="venue-msg-compact"
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      >
        {img && (
          <div
            className="venue-msg-compact-img"
            style={{ backgroundImage: `url(${img})` }}
          />
        )}
        <span className="venue-msg-compact-name">
          {icon} {venue.name}
        </span>
      </div>
    )
  }

  return (
    <article
      className="venue-msg-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      {img && (
        <div
          className="venue-msg-card-img"
          style={{ backgroundImage: `url(${img})` }}
        />
      )}
      <div className="venue-msg-card-body">
        <div className="venue-msg-card-name">{venue.name}</div>
        <div className="venue-msg-card-meta">
          {icon}
          {venue.category && (
            <span className="venue-msg-category">{venue.category}</span>
          )}
          {venue.priceRange && (
            <span className="venue-msg-price">{price}</span>
          )}
          {venue.distanceKm != null && (
            <span className="venue-msg-distance">
              · {formatDistance(venue.distanceKm)}
            </span>
          )}
        </div>
        {venue.address && (
          <div className="venue-msg-address">{venue.address}</div>
        )}
        {venue.district && venue.city && (
          <div className="venue-msg-location">
            {venue.district} · {venue.city}
          </div>
        )}
        {meta && <div className="venue-msg-meta">{meta}</div>}
        {onPropose && (
          <button
            type="button"
            className="btn btn-sm venue-msg-propose-btn"
            onClick={(e) => {
              e.stopPropagation()
              onPropose(venue)
            }}
          >
            💕 Đề xuất hẹn ở đây
          </button>
        )}
      </div>
    </article>
  )
}
