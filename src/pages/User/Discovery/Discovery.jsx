import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { swipesService, discoveryService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'
import { useAuth } from '../../../context/AuthContext.jsx'
import { resolveImageUrl, formatDistance } from '../../../utils/format.js'
import {
  HeartIcon, XIcon, StarIcon, MatchHeartIcon, SparkleIcon,
  RefreshIcon, PinIcon
} from '../../../components/ui/CustomIcons.jsx'
import ProfileDetailModal from '../../../components/User/ProfileDetailModal/ProfileDetailModal.jsx'
import './Discovery.css'

const cardVariants = {
  initial: { opacity: 0, y: 40, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.22, ease: 'easeIn' }
  }
}

export default function Discovery() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [feed, setFeed] = useState([])
  const [cursor, setCursor] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [matchModal, setMatchModal] = useState(null)
  const [detailModal, setDetailModal] = useState(null)

  const load = async ({ append = false } = {}) => {
    setLoading(true)
    try {
      const data = await discoveryService.feed({ limit: 10 })
      const list = Array.isArray(data) ? data : (data?.items ?? [])
      setFeed(append ? [...feed, ...list] : list)
      setCursor(0)
    } catch (err) {
      toast.error(err?.message || 'Không tải được danh sách.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const current = feed[cursor]

  const handleSwipe = async (action) => {
    if (!current || actionLoading) return
    setActionLoading(true)
    try {
      const res = await swipesService.swipe({ targetUserId: current.userId, action })
      if (res?.isMatch) {
        setMatchModal({ other: current, matchId: res.matchId })
      } else {
        setCursor((c) => c + 1)
      }
    } catch (err) {
      if (err?.status === 403) {
        toast.error('Tính năng bị giới hạn theo gói. Hãy nâng cấp Premium.')
      } else {
        toast.error(err?.message || 'Thao tác thất bại.')
      }
    } finally {
      setActionLoading(false)
    }
  }

  const handleNextBatch = () => load({ append: true })

  const handleDetailSwipe = (action, res) => {
    if (res?.isMatch) {
      setMatchModal({ other: detailModal, matchId: res.matchId })
    }
    setDetailModal(null)
  }

  if (loading && feed.length === 0) {
    return (
      <div className="loading-block">
        <span className="spinner" />
        Đang tải…
      </div>
    )
  }

  if (!current) {
    return (
      <div className="discovery-empty">
        <div className="discovery-empty-icon"><SparkleIcon size={56} /></div>
        <h2>Hết người mới rồi!</h2>
        <p>Bạn đã xem hết gợi ý hôm nay. Hãy quay lại sau hoặc thử lại ngay.</p>
        <div className="discovery-empty-actions">
          <button className="btn btn-primary btn-block" onClick={handleNextBatch}>
            <RefreshIcon size={15} />
            Tải lại gợi ý
          </button>
          <div className="discovery-empty-tip">
            <SparkleIcon size={14} />
            <span>Hoàn thiện profile để có gợi ý chính xác hơn</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="discovery-root">
      <div className="discovery-topbar">
        <div className="discovery-title">Same<span>Mess</span></div>
      </div>

      <div className="discovery-card-wrap">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.userId}
            className="swipe-card"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={() => setDetailModal(current)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setDetailModal(current) }}
            aria-label={`Xem chi tiết ${current.displayName}`}
          >
            <div
              className="swipe-card-photo"
              style={{ backgroundImage: `url(${resolveImageUrl(current.photos?.find(p => p.isPrimary)?.url || current.photos?.[0]?.url)})` }}
            />
            <div className="swipe-card-gradient" />
            <div className="swipe-card-overlay">
              <div className="swipe-card-badges">
                {current.isOnline && (
                  <span className="swipe-card-badge online">
                    <span className="swipe-card-badge-dot" />
                    Đang online
                  </span>
                )}
                {current.isPremium && (
                  <span className="swipe-card-badge premium">
                    <StarIcon size={9} />
                    Premium
                  </span>
                )}
              </div>
              <div className="swipe-card-name">
                {current.displayName}, {current.age ?? ''}
              </div>
              <div className="swipe-card-meta">
                {current.location && (
                  <span>
                    <PinIcon size={11} />
                    {current.location}
                  </span>
                )}
                {current.distanceKm != null && (
                  <span>{formatDistance(current.distanceKm)}</span>
                )}
              </div>
              {current.bio && <p className="swipe-card-bio">{current.bio}</p>}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="swipe-actions">
          <motion.button
            className="swipe-action swipe-action-pass"
            onClick={() => handleSwipe('Pass')}
            aria-label="Bỏ qua"
            whileHover={{ scale: 1.14, y: -3 }}
            whileTap={{ scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <XIcon size={22} />
          </motion.button>

          <motion.button
            className="swipe-action swipe-action-super"
            onClick={() => handleSwipe('SuperLike')}
            aria-label="Thích siêu cấp"
            whileHover={{ scale: 1.16, y: -3 }}
            whileTap={{ scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <StarIcon size={20} />
          </motion.button>

          <motion.button
            className="swipe-action swipe-action-like"
            onClick={() => handleSwipe('Like')}
            aria-label="Thích"
            whileHover={{ scale: 1.14, y: -3 }}
            whileTap={{ scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <HeartIcon size={26} />
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {matchModal && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => { setMatchModal(null); setCursor((c) => c + 1) }}
          >
            <motion.div
              className="modal"
              initial={{ opacity: 0, scale: 0.75, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="match-success">
                <motion.div
                  className="match-success-heart"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 15, delay: 0.1 }}
                >
                  <MatchHeartIcon size={64} />
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.35 }}
                >
                  It's a Match!
                </motion.h1>
                <motion.div
                  className="match-success-photos"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35, duration: 0.4, type: 'spring', stiffness: 200, damping: 18 }}
                >
                  <div
                    className="match-success-photo"
                    style={{ backgroundImage: `url(${resolveImageUrl(user?.photoUrl || user?.avatarUrl)})` }}
                  />
                  <div
                    className="match-success-photo"
                    style={{ backgroundImage: `url(${resolveImageUrl(matchModal.other.photoUrl || matchModal.other.avatarUrl)})` }}
                  />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.48 }}
                  style={{ color: 'var(--color-text-soft)', fontSize: '0.92rem' }}
                >
                  Bạn và <strong>{matchModal.other.displayName}</strong> đã thích nhau.
                </motion.p>
                <motion.div
                  style={{ display: 'flex', gap: 10, justifyContent: 'center', width: '100%', flexWrap: 'wrap' }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.58 }}
                >
                  <button
                    className="btn btn-ghost"
                    onClick={() => { setMatchModal(null); setCursor((c) => c + 1) }}
                  >
                    Tiếp tục lướt
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/chat?matchId=${matchModal.matchId}`)}
                  >
                    <HeartIcon size={14} />
                    Nhắn tin ngay
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ProfileDetailModal
        profile={detailModal}
        open={!!detailModal}
        onClose={() => setDetailModal(null)}
        onSwipe={handleDetailSwipe}
      />
    </div>
  )
}
