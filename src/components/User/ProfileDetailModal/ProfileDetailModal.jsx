/**
 * ProfileDetailModal — full profile view when user taps a Discovery card.
 *
 * Props:
 *   profile    — DiscoveryProfileDto (already fetched in Discovery feed, no extra API call needed)
 *   open       — boolean
 *   onClose    — fn
 *   onSwipe    — fn(action: 'Like' | 'Pass' | 'SuperLike') — calls swipesService internally
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { swipesService } from '../../../api'
import { resolveImageUrl, formatDistance } from '../../../utils/format.js'
import { useToast } from '../../../context/ToastContext.jsx'
import {
  HeartIcon, XIcon, PinIcon, ShieldCheckIcon, TrophyIcon, FireIcon
} from '../../../components/ui/CustomIcons.jsx'
import AdminBadge from '../AdminBadge/AdminBadge.jsx'
import AdminFireName from '../AdminBadge/AdminFireName.jsx'
import './ProfileDetailModal.css'

const BADGE_LABELS = {
  New: 'New',
  Active: 'Active',
  Trusted: 'Trusted',
  Elite: 'Elite',
  'Rising Star': 'Rising Star',
}

const GOAL_LABELS = {
  LongTerm: 'Mối quan hệ lâu dài',
  ShortTerm: 'Mối quan hệ ngắn hạn',
  Friendship: 'Kết bạn',
  Casual: 'Hẹn hò thoải mái',
}
const GENDER_LABELS = { Male: 'Nam', Female: 'Nữ', Other: 'Khác' }

function Stars({ value = 0 }) {
  const filled = Math.round(value)
  return (
    <span className="pdm-rv-stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= filled ? 'pdm-rv-star on' : 'pdm-rv-star'}>★</span>
      ))}
    </span>
  )
}

export default function ProfileDetailModal({ profile, open, onClose, onSwipe }) {
  const toast = useToast()
  const [swiping, setSwiping] = useState(false)
  const [activePhoto, setActivePhoto] = useState(0)

  if (!open || !profile) return null

  const photos = profile.photos ?? []
  const hasMultiple = photos.length > 1
  const allPhotos = photos.length > 0 ? photos : []

  const handleSwipe = async (action) => {
    if (swiping) return
    setSwiping(true)
    try {
      const res = await swipesService.swipe({ targetUserId: profile.userId, action })
      onClose()
      setTimeout(() => onSwipe?.(action, res), 150)
    } catch (err) {
      if (err?.status === 403) {
        toast.error('Tính năng bị giới hạn theo gói. Hãy nâng cấp Premium.')
      } else if (err?.status === 409) {
        // Đã lướt người này trước đó (vd. mở lại hồ sơ từ danh sách cũ) — coi như đã xong, đóng nhẹ nhàng
        onClose()
        setTimeout(() => onSwipe?.(action, null), 150)
      } else {
        toast.error(err?.message || 'Thao tác thất bại.')
      }
    } finally {
      setSwiping(false)
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        className="pdm-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={handleBackdropClick}
        role="presentation"
      >
        <motion.div
          className="pdm-container"
          initial={{ opacity: 0, scale: 0.88, y: 32 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={`Hồ sơ của ${profile.displayName}`}
        >
          {/* ── Photo Carousel ─────────────────────────────── */}
          <div className="pdm-photo-wrap">
            <div
              className="pdm-photo"
              style={{ backgroundImage: `url(${resolveImageUrl(allPhotos[activePhoto]?.url)})` }}
            />

            {/* Gradient overlay */}
            <div className="pdm-photo-gradient" />

            {/* Close button */}
            <button
              className="pdm-close"
              onClick={onClose}
              aria-label="Đóng"
            >
              <XIcon size={18} />
            </button>

            {/* Badges on photo */}
            <div className="pdm-photo-badges">
              {profile.isPhotoVerified && (
                <span className="pdm-badge pdm-badge-verified">
                  <ShieldCheckIcon size={11} />
                  Đã xác minh
                </span>
              )}
              {profile.isBoosted && (
                <span className="pdm-badge pdm-badge-boosted">
                  <FireIcon size={11} />
                  Boosted
                </span>
              )}
              {profile.reputationTier && (
                <span className="pdm-badge pdm-badge-rep">
                  <TrophyIcon size={11} />
                  {BADGE_LABELS[profile.reputationTier] ?? profile.reputationTier}
                </span>
              )}
            </div>

            {/* Photo dots / counter */}
            {hasMultiple && (
              <div className="pdm-photo-dots">
                {allPhotos.map((_, i) => (
                  <button
                    key={i}
                    className={`pdm-dot ${i === activePhoto ? 'active' : ''}`}
                    onClick={() => setActivePhoto(i)}
                    aria-label={`Ảnh ${i + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Swipe nav arrows */}
            {hasMultiple && (
              <>
                <button
                  className="pdm-arrow pdm-arrow-left"
                  onClick={() => setActivePhoto((a) => (a - 1 + allPhotos.length) % allPhotos.length)}
                  aria-label="Ảnh trước"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  className="pdm-arrow pdm-arrow-right"
                  onClick={() => setActivePhoto((a) => (a + 1) % allPhotos.length)}
                  aria-label="Ảnh sau"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* ── Profile Info ──────────────────────────────── */}
          <div className="pdm-info">
            <div className="pdm-name-row">
              <h2 className="pdm-name" id="pdm-title">
                {profile.isAdmin ? <AdminFireName>{profile.displayName}</AdminFireName> : profile.displayName}
                {profile.age != null && <span className="pdm-age">, {profile.age}</span>}
                {profile.isAdmin && <AdminBadge />}
              </h2>
            </div>

            {/* Meta: location + distance */}
            <div className="pdm-meta">
            {profile.location && (
              <span className="pdm-meta-item">
                <PinIcon size={13} />
                {profile.location}
              </span>
            )}
              {profile.distanceKm != null && (
                <span className="pdm-meta-item">
                  {formatDistance(profile.distanceKm)} từ bạn
                </span>
              )}
            </div>

            {/* Thông tin cơ bản — chip đồng bộ với thẻ Discovery */}
            {(profile.datingGoal || profile.height || profile.gender) && (
              <div className="pdm-chips">
                {profile.datingGoal && (
                  <span className="pdm-chip pdm-chip-goal">💘 {GOAL_LABELS[profile.datingGoal] ?? profile.datingGoal}</span>
                )}
                {profile.height && <span className="pdm-chip">📏 {profile.height} cm</span>}
                {profile.gender && (
                  <span className="pdm-chip">{profile.gender === 'Female' ? '👩' : profile.gender === 'Male' ? '👨' : '🧑'} {GENDER_LABELS[profile.gender] ?? profile.gender}</span>
                )}
              </div>
            )}

            {/* Bio — hồ sơ trống thì có lời nhắn thân thiện thay vì bỏ trống */}
            <div className="pdm-bio">
              <div className="pdm-bio-label">Giới thiệu</div>
              {profile.bio
                ? <p>{profile.bio}</p>
                : <p className="pdm-bio-empty">{profile.displayName || 'Người ấy'} chưa viết giới thiệu — hãy bắt chuyện để hiểu họ hơn nhé 💬</p>}
            </div>

            {/* Đánh giá sau buổi hẹn (điểm TB cho mọi người; nội dung chỉ Gold) */}
            {profile.ratingCount > 0 && (
              <div className="pdm-reviews">
                <div className="pdm-bio-label">Đánh giá sau buổi hẹn</div>
                <div className="pdm-rv-summary">
                  <span className="pdm-rv-avg">{(profile.ratingAvg || 0).toFixed(1)}</span>
                  <span className="pdm-rv-right">
                    <Stars value={profile.ratingAvg} />
                    <span className="pdm-rv-count">{profile.ratingCount} đánh giá</span>
                  </span>
                </div>
                {profile.reviewsLocked ? (
                  <div className="pdm-rv-locked">
                    🔒 Chỉ tài khoản <strong>Gold</strong> mới đọc được {profile.ratingCount} đánh giá về {profile.displayName || 'người ấy'}.
                  </div>
                ) : (
                  <div className="pdm-rv-list">
                    {(profile.reviews || []).map((r) => (
                      <div key={r.id} className="pdm-rv-item">
                        <div className="pdm-rv-item-top">
                          <span className="pdm-rv-item-name">{r.reviewerName}</span>
                          <Stars value={r.rating} />
                        </div>
                        {r.comment && <p className="pdm-rv-item-comment">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Interests */}
            {profile.interests?.length > 0 && (
              <div className="pdm-interests">
                {profile.interests.map((tag) => (
                  <span key={tag} className="pdm-interest-tag">{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* ── Swipe Actions ────────────────────────────── */}
          <div className="pdm-actions">
            <motion.button
              className="pdm-action pdm-action-pass"
              onClick={() => handleSwipe('Pass')}
              disabled={swiping}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Bỏ qua"
            >
              <XIcon size={22} />
            </motion.button>

            <motion.button
              className="pdm-action pdm-action-like"
              onClick={() => handleSwipe('Like')}
              disabled={swiping}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Thích"
            >
              <HeartIcon size={26} />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
