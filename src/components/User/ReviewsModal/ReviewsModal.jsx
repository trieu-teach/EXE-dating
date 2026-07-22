import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { profileService } from '../../../api'
import { resolveImageUrl } from '../../../utils/format.js'
import './ReviewsModal.css'

function Stars({ value = 0, size = 15 }) {
  const filled = Math.round(value)
  return (
    <span className="rvm-stars" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= filled ? 'rvm-star on' : 'rvm-star'}>★</span>
      ))}
    </span>
  )
}

/**
 * Popup hiển thị đánh giá sau buổi hẹn của một người (fetch hồ sơ đầy đủ theo userId).
 * Điểm sao TB hiện cho mọi người; nội dung chỉ Gold (backend trả reviewsLocked).
 */
export default function ReviewsModal({ userId, name, open, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !userId) return
    setLoading(true); setData(null)
    profileService.byId(userId).then(setData).catch(() => {}).finally(() => setLoading(false))
  }, [open, userId])

  if (!open) return null

  const displayName = data?.displayName || name || 'người ấy'
  const count = data?.ratingCount || 0

  return createPortal(
    <div className="rvm-backdrop" onClick={onClose}>
      <div className="rvm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rvm-head">
          <span className="rvm-head-title">⭐ Đánh giá {displayName}</span>
          <button type="button" className="rvm-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>

        {loading ? (
          <div className="rvm-loading"><span className="spinner" /></div>
        ) : count === 0 ? (
          <div className="rvm-empty">Chưa có đánh giá nào sau buổi hẹn.</div>
        ) : (
          <>
            <div className="rvm-summary">
              <span className="rvm-avg">{(data.ratingAvg || 0).toFixed(1)}</span>
              <span className="rvm-right">
                <Stars value={data.ratingAvg} size={18} />
                <span className="rvm-count">{count} đánh giá</span>
              </span>
            </div>
            {data.reviewsLocked ? (
              <div className="rvm-locked">
                🔒 Chỉ tài khoản <strong>Gold</strong> mới đọc được nội dung {count} đánh giá.
              </div>
            ) : (
              <div className="rvm-list">
                {(data.reviews || []).map((r) => (
                  <div key={r.id} className="rvm-item">
                    <div className={`rvm-item-avatar${r.reviewerAvatarUrl ? '' : ' rvm-anon'}`}
                      style={r.reviewerAvatarUrl ? { backgroundImage: `url(${resolveImageUrl(r.reviewerAvatarUrl)})` } : undefined}>
                      {!r.reviewerAvatarUrl && '💬'}
                    </div>
                    <div className="rvm-item-body">
                      <div className="rvm-item-top">
                        <span className="rvm-item-name">{r.reviewerName}</span>
                        <Stars value={r.rating} size={15} />
                      </div>
                      {r.comment && <p className="rvm-item-comment">{r.comment}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
