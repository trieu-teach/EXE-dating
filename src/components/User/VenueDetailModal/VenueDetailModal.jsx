/**
 * VenueDetailModal — full venue detail popup.
 *
 * Props:
 *   venue       — VenueDto to display (may be partial, fetches full on open)
 *   venueId     — venue ID to load detail (use when only venueId is available)
 *   open        — boolean
 *   onClose     — fn
 *   onPropose   — fn(venue) — called with the loaded venue
 */
import { useEffect, useState } from 'react'
import { venuesService } from '../../../api'
import { resolveImageUrl, formatDistance } from '../../../utils/format.js'
import { useToast } from '../../../context/ToastContext.jsx'
import Modal from '../Modal/Modal.jsx'

const CATEGORY_ICONS = {
  cafe: '☕',
  restaurant: '🍽️',
  cinema: '🎬',
  park: '🌳',
  bar: '🍸',
  dessert: '🍰',
}

const PRICE_LABELS = {
  1: 'Rẻ (dưới 50k)',
  2: 'Bình thường (50–150k)',
  3: 'Hơi mắc (150–300k)',
  4: 'Sang trọng (300k+)',
}

export default function VenueDetailModal({ venue: initialVenue, venueId, open, onClose, onPropose }) {
  const toast = useToast()
  const [venue, setVenue] = useState(initialVenue || null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    // If we already have a full venue, skip fetch.
    if (initialVenue?.description) {
      setVenue(initialVenue)
      return
    }
    // Otherwise fetch by ID.
    const id = venueId || initialVenue?.id
    if (!id) return
    let cancelled = false
    setLoading(true)
    venuesService.detail(id)
      .then((v) => { if (!cancelled) setVenue(v) })
      .catch(() => toast.error('Không tải được thông tin quán.'))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [open, venueId, initialVenue, toast])

  if (!open) return null

  const icon = CATEGORY_ICONS[venue?.category] ?? '📍'
  const price = venue?.priceRange ? PRICE_LABELS[venue.priceRange] : venue?.priceRange

  return (
    <Modal open={open} onClose={onClose} labelledBy="venue-modal-title">
      <div className="venue-detail">
        {venue?.imageUrl && (
          <div
            className="venue-detail-cover"
            style={{ backgroundImage: `url(${resolveImageUrl(venue.imageUrl)})` }}
          />
        )}
        {loading ? (
          <div className="loading-block" style={{ padding: 24 }}>
            <span className="spinner" />
          </div>
        ) : venue ? (
          <>
            <div className="venue-detail-header">
              <h2 id="venue-modal-title" className="venue-detail-name">
                {icon} {venue.name}
              </h2>
              <div className="venue-detail-badges">
                {venue.category && (
                  <span className="tag">{venue.category}</span>
                )}
                {venue.priceRange && (
                  <span className="tag">{price}</span>
                )}
                {venue.distanceKm != null && (
                  <span className="tag">{formatDistance(venue.distanceKm)}</span>
                )}
              </div>
            </div>

            {venue.address && (
              <div className="venue-detail-row">
                <span className="venue-detail-label">📍 Địa chỉ</span>
                <span>{venue.address}{venue.district || venue.city ? `, ${[venue.district, venue.city].filter(Boolean).join(', ')}` : ''}</span>
              </div>
            )}

            {venue.description && (
              <p className="venue-detail-desc">{venue.description}</p>
            )}

            {venue.latitude && venue.longitude && (
              <div className="venue-detail-row">
                <span className="venue-detail-label">🗺️ Tọa độ</span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${venue.latitude},${venue.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-ghost btn-sm"
                >
                  Mở Google Maps
                </a>
              </div>
            )}

            {onPropose && (
              <button
                type="button"
                className="btn btn-primary"
                style={{ marginTop: 16 }}
                onClick={() => {
                  onClose()
                  setTimeout(() => onPropose(venue), 100)
                }}
              >
                💕 Đề xuất hẹn ở đây
              </button>
            )}
          </>
        ) : (
          <p style={{ color: 'var(--color-text-soft)' }}>Không tìm thấy quán.</p>
        )}

        <button
          type="button"
          className="btn btn-ghost"
          style={{ marginTop: 8, width: '100%' }}
          onClick={onClose}
        >
          Đóng
        </button>
      </div>
    </Modal>
  )
}
