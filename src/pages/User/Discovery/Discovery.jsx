import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { swipesService, discoveryService, profileService, chatService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'
import { useAuth } from '../../../context/AuthContext.jsx'
import { resolveImageUrl, formatDistance } from '../../../utils/format.js'
import {
  HeartIcon, XIcon, StarIcon, MatchHeartIcon, SparkleIcon,
  RefreshIcon, PinIcon, ShieldCheckIcon,
} from '../../../components/ui/CustomIcons.jsx'
import FallingPetals from '../../../components/ui/FallingPetals.jsx'
import MatchesSidebar from '../../../components/User/MatchesSidebar/MatchesSidebar.jsx'
import './Discovery.css'

const GOAL_LABEL = {
  LongTerm: 'Mối quan hệ lâu dài', ShortTerm: 'Mối quan hệ ngắn hạn',
  Friendship: 'Kết bạn', Casual: 'Hẹn hò thoải mái',
}
const GENDER_LABEL = { Male: 'Nam', Female: 'Nữ', Other: 'Khác' }

const orderedPhotos = (p) => {
  const list = Array.isArray(p?.photos) ? [...p.photos] : []
  list.sort((a, b) => (b.isPrimary === true) - (a.isPrimary === true))
  return list.map((x) => resolveImageUrl(x.url)).filter(Boolean)
}

export default function Discovery() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const PAGE_SIZE = 10 // số hồ sơ mỗi lần gọi feed
  const [feed, setFeed] = useState([])
  const [cursor, setCursor] = useState(0)
  const [loading, setLoading] = useState(true)        // lần tải đầu
  const [loadingMore, setLoadingMore] = useState(false) // đang tự lấy thêm
  const [exhausted, setExhausted] = useState(false)   // backend đã hết người thật sự
  const [actionLoading, setActionLoading] = useState(false)
  const [matchModal, setMatchModal] = useState(null)
  const [myPhoto, setMyPhoto] = useState(null)
  const [opening, setOpening] = useState(false)
  const scrollRef = useRef(null)
  const feedRef = useRef([])
  useEffect(() => { feedRef.current = feed }, [feed])

  const fetchBatch = async () => {
    const data = await discoveryService.feed({ limit: PAGE_SIZE })
    return Array.isArray(data) ? data : (data?.items ?? [])
  }

  // Tải lại từ đầu (lần đầu + nút "Tải lại gợi ý")
  const load = async () => {
    setLoading(true)
    setExhausted(false)
    try {
      const list = await fetchBatch()
      setFeed(list)
      setCursor(0)
      setExhausted(list.length === 0)
    } catch (err) {
      toast.error(err?.message || 'Không tải được danh sách.')
    } finally {
      setLoading(false)
    }
  }

  // Tự động lấy thêm khi hết batch hiện tại (loại trùng theo userId)
  const loadMore = async () => {
    if (loadingMore || exhausted) return
    setLoadingMore(true)
    try {
      const list = await fetchBatch()
      const seen = new Set(feedRef.current.map((p) => p.userId))
      const fresh = list.filter((p) => p.userId && !seen.has(p.userId))
      if (fresh.length === 0) setExhausted(true) // không còn người mới → dừng
      else setFeed((prev) => [...prev, ...fresh])
    } catch (err) {
      toast.error(err?.message || 'Không tải được danh sách.')
      setExhausted(true) // tránh gọi lặp vô hạn khi lỗi
    } finally {
      setLoadingMore(false)
    }
  }

  // Nút "Tải lại gợi ý": xem lại TỪ ĐẦU những người đã tải trong phiên (không gọi mạng,
  // vì backend đã loại người đã vuốt nên gọi lại sẽ rỗng). Nếu chưa có ai thì tải mạng.
  const resetFeed = () => {
    if (feedRef.current.length > 0) {
      setExhausted(false)
      setCursor(0)
      if (scrollRef.current) scrollRef.current.scrollTop = 0
    } else {
      load()
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Hết người trong batch hiện tại → tự gọi thêm cho tới khi có người hoặc hết hẳn
  useEffect(() => {
    if (loading || loadingMore || exhausted) return
    if (cursor >= feed.length) loadMore()
  }, [cursor, feed.length, loading, loadingMore, exhausted]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    profileService.me()
      .then((p) => setMyPhoto(p?.avatarUrl || p?.photos?.find((x) => x.isPrimary)?.url || p?.photos?.[0]?.url || null))
      .catch(() => {})
  }, [])

  const current = feed[cursor]

  const decide = async (action) => {
    if (!current || actionLoading) return
    setActionLoading(true)
    const target = current
    try {
      const res = await swipesService.swipe({ targetUserId: target.userId, action })
      if (res?.isMatch) setMatchModal({ other: target, matchId: res.matchId })
    } catch (err) {
      // 409 = đã vuốt người này rồi (khi xem lại từ đầu) → bỏ qua, lướt tiếp
      if (err?.status !== 409) toast.error(err?.message || 'Thao tác thất bại.')
    } finally {
      setCursor((c) => c + 1)
      if (scrollRef.current) scrollRef.current.scrollTop = 0
      setActionLoading(false)
    }
  }

  const undo = async () => {
    if (actionLoading) return
    if (cursor === 0) { toast.info('Không có lượt nào để hoàn tác.'); return }
    setActionLoading(true)
    try {
      await swipesService.undo()
      setCursor((c) => Math.max(0, c - 1))
      if (scrollRef.current) scrollRef.current.scrollTop = 0
      toast.success('Đã hoàn tác lượt vừa rồi.')
    } catch (err) {
      if (err?.status === 403) toast.error('Hoàn tác là tính năng Plus/Gold. Nâng cấp để dùng.')
      else toast.error(err?.message || 'Không hoàn tác được (chỉ hoàn tác được lượt Bỏ qua).')
    } finally {
      setActionLoading(false)
    }
  }

  const openChat = async (matchId) => {
    if (!matchId || opening) return
    setOpening(true)
    try {
      const conv = await chatService.byMatch(matchId)
      setMatchModal(null)
      navigate(`/chat/${conv.id || conv.conversationId}`)
    } catch (err) {
      toast.error(err?.message || 'Không mở được cuộc trò chuyện.')
    } finally {
      setOpening(false)
    }
  }

  if (loading && feed.length === 0) {
    return <div className="loading-block"><span className="spinner" /> Đang tải…</div>
  }

  if (!current) {
    // Hết batch nhưng chưa hết hẳn → đang tự lấy thêm
    if (!exhausted) {
      return (
        <div className="disc-root">
          <MatchesSidebar />
          <div className="disc-main">
            <FallingPetals count={20} />
            <div className="loading-block"><span className="spinner" /> Đang tìm thêm người…</div>
          </div>
        </div>
      )
    }
    // Hết người thật sự → user tự bấm tải lại từ đầu
    return (
      <div className="disc-root">
        <MatchesSidebar />
        <div className="disc-main">
          <FallingPetals count={20} />
          <div className="discovery-empty">
            <div className="discovery-empty-icon"><SparkleIcon size={56} /></div>
            <h2>Hết người mới rồi!</h2>
            <p>Bạn đã xem hết gợi ý hôm nay. Bấm tải lại để xem từ đầu nhé.</p>
            <div className="discovery-empty-actions">
              <button className="btn btn-primary btn-block" onClick={resetFeed}>
                <RefreshIcon size={15} /> Tải lại gợi ý
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const photos = orderedPhotos(current)
  const chips = [
    current.height && `${current.height} cm`,
    GENDER_LABEL[current.gender] || current.gender,
    current.datingGoal && (GOAL_LABEL[current.datingGoal] || current.datingGoal),
    current.distanceKm != null && `Cách ${formatDistance(current.distanceKm)}`,
  ].filter(Boolean)

  return (
    <div className="disc-root">
      <MatchesSidebar />
      <div className="disc-main">
      <FallingPetals count={26} />

      <AnimatePresence mode="wait">
        <motion.div
          key={current.userId}
          ref={scrollRef}
          className="disc-scroll"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* Ảnh chính + tên */}
          <div className="disc-photo disc-photo-hero" style={photos[0] ? { backgroundImage: `url(${photos[0]})` } : undefined}>
            <div className="disc-photo-gradient" />
            <div className="disc-hero-info">
              <div className="disc-hero-name">
                {current.displayName}{current.age ? `, ${current.age}` : ''}
                {current.isPhotoVerified && <span className="disc-verified" title="Đã xác minh"><ShieldCheckIcon size={16} /></span>}
              </div>
              <div className="disc-hero-meta">
                {current.location && <span><PinIcon size={12} /> {current.location}</span>}
                {current.reputationTier && current.reputationTier !== 'Standard' && (
                  <span className="disc-tier"><StarIcon size={11} /> {current.reputationTier}</span>
                )}
              </div>
            </div>
          </div>

          {/* Giới thiệu */}
          {current.bio && (
            <div className="disc-panel">
              <div className="disc-panel-label">Giới thiệu về {current.displayName}</div>
              <p className="disc-panel-bio">{current.bio}</p>
            </div>
          )}

          {/* Ảnh 2 */}
          {photos[1] && <div className="disc-photo" style={{ backgroundImage: `url(${photos[1]})` }} />}

          {/* Thông tin cơ bản */}
          {chips.length > 0 && (
            <div className="disc-panel">
              <div className="disc-panel-label">Thông tin cơ bản</div>
              <div className="disc-chips">
                {chips.map((c, i) => <span key={i} className="disc-chip">{c}</span>)}
              </div>
            </div>
          )}

          {/* Ảnh 3 */}
          {photos[2] && <div className="disc-photo" style={{ backgroundImage: `url(${photos[2]})` }} />}

          {/* Vị trí */}
          {current.location && (
            <div className="disc-panel">
              <div className="disc-panel-label">Vị trí của {current.displayName}</div>
              <div className="disc-panel-big">{current.location}</div>
              {current.distanceKm != null && (
                <span className="disc-chip" style={{ marginTop: 10 }}><PinIcon size={11} /> Cách bạn {formatDistance(current.distanceKm)}</span>
              )}
            </div>
          )}

          {/* Các ảnh còn lại */}
          {photos.slice(3).map((url, i) => (
            <div key={i} className="disc-photo" style={{ backgroundImage: `url(${url})` }} />
          ))}

          <div className="disc-scroll-end">Hết hồ sơ · Bạn nghĩ sao?</div>
        </motion.div>
      </AnimatePresence>

      {/* Nút hành động nổi */}
      <div className="disc-actions">
        <motion.button className="disc-action disc-action-undo" aria-label="Hoàn tác"
          onClick={undo} disabled={actionLoading}
          whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.9 }}>
          <RefreshIcon size={20} />
        </motion.button>
        <motion.button className="disc-action disc-action-pass" aria-label="Bỏ qua"
          onClick={() => decide('Pass')} disabled={actionLoading}
          whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.9 }}>
          <XIcon size={24} />
        </motion.button>
        <motion.button className="disc-action disc-action-super" aria-label="Siêu thích"
          onClick={() => decide('SuperLike')} disabled={actionLoading}
          whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.9 }}>
          <StarIcon size={24} />
        </motion.button>
        <motion.button className="disc-action disc-action-like" aria-label="Thích"
          onClick={() => decide('Like')} disabled={actionLoading}
          whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.9 }}>
          <HeartIcon size={24} />
        </motion.button>
      </div>

      {/* Match modal */}
      <AnimatePresence>
        {matchModal && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMatchModal(null)}>
            <motion.div className="modal" initial={{ opacity: 0, scale: 0.75, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              onClick={(e) => e.stopPropagation()}>
              <div className="match-success">
                <motion.div className="match-success-heart" initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 15, delay: 0.1 }}>
                  <MatchHeartIcon size={64} />
                </motion.div>
                <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                  It's a Match!
                </motion.h1>
                <motion.div className="match-success-photos" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35, type: 'spring', stiffness: 200, damping: 18 }}>
                  <div className="match-success-photo" style={myPhoto ? { backgroundImage: `url(${resolveImageUrl(myPhoto)})` } : undefined}>
                    {!myPhoto && <span className="match-success-initial">{(user?.displayName || 'B').charAt(0).toUpperCase()}</span>}
                  </div>
                  {(() => {
                    const otherUrl = orderedPhotos(matchModal.other)[0]
                    return (
                      <div className="match-success-photo" style={otherUrl ? { backgroundImage: `url(${otherUrl})` } : undefined}>
                        {!otherUrl && <span className="match-success-initial">{(matchModal.other.displayName || '?').charAt(0).toUpperCase()}</span>}
                      </div>
                    )
                  })()}
                </motion.div>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.48 }} style={{ color: 'var(--color-text-soft)', fontSize: '0.92rem' }}>
                  Bạn và <strong>{matchModal.other.displayName}</strong> đã thích nhau.
                </motion.p>
                <motion.div style={{ display: 'flex', gap: 10, justifyContent: 'center', width: '100%', flexWrap: 'wrap' }}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.58 }}>
                  <button className="btn btn-ghost" onClick={() => setMatchModal(null)}>Tiếp tục lướt</button>
                  <button className="btn btn-primary" onClick={() => openChat(matchModal.matchId)} disabled={opening}>
                    {opening ? <span className="spinner" /> : <><HeartIcon size={14} /> Nhắn tin ngay</>}
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  )
}
