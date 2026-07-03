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
  HeartIcon, XIcon, StarIcon, PinIcon, ShieldCheckIcon, TrophyIcon, FireIcon
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
  date: 'Hẹn hò nghiêm túc',
  chat: 'Trò chuyện',
  fun: 'Vui vẻ',
  friendship: 'Kết bạn',
  long_term: 'Mối quan hệ dài hạn',
  short_term: 'Quan hệ ngắn hạn',
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

            {/* Dating goal */}
            {profile.datingGoal && (
              <div className="pdm-goal">
                <span className="pdm-goal-label">Mục tiêu hẹn hò:</span>
                <span className="pdm-goal-value">
                  {GOAL_LABELS[profile.datingGoal] ?? profile.datingGoal}
                </span>
              </div>
            )}

            {/* Height */}
            {profile.height && (
              <div className="pdm-row">
                <span className="pdm-row-label">Chiều cao</span>
                <span className="pdm-row-value">{profile.height} cm</span>
              </div>
            )}

            {/* Gender */}
            {profile.gender && (
              <div className="pdm-row">
                <span className="pdm-row-label">Giới tính</span>
                <span className="pdm-row-value">{profile.gender}</span>
              </div>
            )}

            {/* Bio */}
            {profile.bio && (
              <div className="pdm-bio">
                <p>{profile.bio}</p>
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
              className="pdm-action pdm-action-super"
              onClick={() => handleSwipe('SuperLike')}
              disabled={swiping}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Thích siêu cấp"
            >
              <StarIcon size={20} />
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
