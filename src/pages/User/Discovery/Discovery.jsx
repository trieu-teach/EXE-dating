import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { swipesService, discoveryService, chatService, preferencesService, matchesService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'
import { resolveImageUrl, formatDistance } from '../../../utils/format.js'
import {
  HeartIcon, XIcon, StarIcon, SparkleIcon,
  RefreshIcon, PinIcon, ShieldCheckIcon, CrownIcon,
} from '../../../components/ui/CustomIcons.jsx'
import AdminBadge from '../../../components/User/AdminBadge/AdminBadge.jsx'
import AdminFireName from '../../../components/User/AdminBadge/AdminFireName.jsx'
import AvatarFrame from '../../../components/User/AvatarFrame/AvatarFrame.jsx'
import MatchCelebration from '../../../components/User/MatchCelebration/MatchCelebration.jsx'
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

/**
 * Panel "Bộ lọc" bên phải card — chỉnh độ tuổi + khoảng cách rồi bấm "Áp dụng"
 * để lưu và nạp lại feed. Bộ lọc đầy đủ hơn nằm ở Cài đặt.
 */
function CuratePanel({ onApplied }) {
  const toast = useToast()
  const [prefs, setPrefs] = useState(null)
  const [saved, setSaved] = useState(null)   // bản đã lưu — để biết có thay đổi chưa
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    preferencesService.get()
      .then((p) => {
        const init = {
          interestedInGender: p?.interestedInGender ?? 'Everyone',
          minAge: p?.minAge ?? 18,
          maxAge: p?.maxAge ?? 40,
          maxDistanceKm: p?.maxDistanceKm ?? 50,
        }
        setPrefs(init)
        setSaved(init)
      })
      .catch(() => {
        const init = { interestedInGender: 'Everyone', minAge: 18, maxAge: 40, maxDistanceKm: 50 }
        setPrefs(init)
        setSaved(init)
      })
  }, [])

  const update = (patch) => setPrefs((cur) => ({ ...cur, ...patch }))

  const dirty = prefs && saved && (
    prefs.minAge !== saved.minAge || prefs.maxAge !== saved.maxAge
    || prefs.maxDistanceKm !== saved.maxDistanceKm
    || prefs.interestedInGender !== saved.interestedInGender
  )

  const apply = async () => {
    if (!dirty || saving) return
    setSaving(true)
    try {
      await preferencesService.update(prefs)
      setSaved(prefs)
      toast.success('Đã áp dụng bộ lọc.')
      onApplied?.()
    } catch (err) {
      toast.error(err?.message || 'Không lưu được bộ lọc.')
    } finally {
      setSaving(false)
    }
  }

  if (!prefs) {
    return (
      <aside className="curate">
        <div className="curate-title">Bộ lọc</div>
        <div className="loading-block"><span className="spinner" /></div>
      </aside>
    )
  }

  const AGE_MIN = 18
  const AGE_MAX = 60
  const pct = (v) => ((v - AGE_MIN) / (AGE_MAX - AGE_MIN)) * 100

  const DIST_MIN = 1
  const DIST_MAX = 100
  const distPct = ((prefs.maxDistanceKm - DIST_MIN) / (DIST_MAX - DIST_MIN)) * 100

  return (
    <aside className="curate">
      <div className="curate-title">Bộ lọc</div>

      <div className="curate-row">
        <span className="curate-label">Độ tuổi</span>
        <span className="curate-value">{prefs.minAge} – {prefs.maxAge}</span>
      </div>
      <div className="curate-dual">
        <div className="curate-track" />
        <div className="curate-fill" style={{ left: `${pct(prefs.minAge)}%`, right: `${100 - pct(prefs.maxAge)}%` }} />
        <input type="range" min={AGE_MIN} max={AGE_MAX} value={prefs.minAge} aria-label="Tuổi tối thiểu"
          onChange={(e) => update({ minAge: Math.min(+e.target.value, prefs.maxAge - 1) })} />
        <input type="range" min={AGE_MIN} max={AGE_MAX} value={prefs.maxAge} aria-label="Tuổi tối đa"
          onChange={(e) => update({ maxAge: Math.max(+e.target.value, prefs.minAge + 1) })} />
      </div>

      <div className="curate-row curate-row-gap">
        <span className="curate-label">Khoảng cách</span>
        <span className="curate-value">Tối đa {prefs.maxDistanceKm} km</span>
      </div>
      <div className="curate-dual">
        <div className="curate-track" />
        <div className="curate-fill" style={{ left: '0%', right: `${100 - distPct}%` }} />
        <input className="curate-single" type="range" min={DIST_MIN} max={DIST_MAX} value={prefs.maxDistanceKm}
          aria-label="Khoảng cách tối đa"
          onChange={(e) => update({ maxDistanceKm: +e.target.value })} />
      </div>

      <div className="curate-row curate-row-gap">
        <span className="curate-label">Đang tìm</span>
      </div>
      <div className="curate-gender">
        {[['Female', 'Nữ'], ['Male', 'Nam'], ['Everyone', 'Tất cả']].map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={`curate-gender-btn${prefs.interestedInGender === value ? ' active' : ''}`}
            onClick={() => update({ interestedInGender: value })}
          >
            {label}
          </button>
        ))}
      </div>

      <button type="button" className="curate-apply" onClick={apply} disabled={!dirty || saving}>
        {saving ? <span className="spinner" /> : 'Áp dụng'}
      </button>
    </aside>
  )
}

/** Lưới nhỏ "Ai đã thích bạn" — Free thấy ảnh mờ (backend tự làm mờ), bấm sang tab Lượt thích. */
function LikedMeWidget() {
  const [items, setItems] = useState(null)

  useEffect(() => {
    swipesService.likedMe()
      .then((d) => setItems(Array.isArray(d) ? d : (d?.items ?? [])))
      .catch(() => setItems([]))
  }, [])

  if (items === null) return null

  return (
    <Link to="/matches?tab=likes" className="side-widget side-likedme">
      <div className="side-widget-head">
        <span className="side-widget-title">💗 Ai đã thích bạn</span>
        {items.length > 0 && <span className="side-widget-count">{items.length}</span>}
      </div>
      {items.length === 0 ? (
        <p className="side-widget-empty">Chưa có ai — cứ lướt tiếp nhé!</p>
      ) : (
        <div className="side-likedme-grid">
          {items.slice(0, 4).map((u) => {
            const url = resolveImageUrl(u.photos?.[0]?.url)
            return (
              <div key={u.userId} className={`side-likedme-ph${u.photosLocked ? ' locked' : ''}`}
                style={url ? { backgroundImage: `url(${url})` } : undefined}>
                {u.photosLocked && <span className="side-likedme-lock">🔒</span>}
              </div>
            )
          })}
        </div>
      )}
    </Link>
  )
}

/** Hàng avatar "Match mới" — bấm avatar là mở thẳng đoạn chat. */
function NewMatchesWidget() {
  const navigate = useNavigate()
  const toast = useToast()
  const [items, setItems] = useState(null)

  useEffect(() => {
    matchesService.list()
      .then((d) => setItems(Array.isArray(d) ? d : (d?.items ?? [])))
      .catch(() => setItems([]))
  }, [])

  const openChat = async (matchId) => {
    try {
      const conv = await chatService.byMatch(matchId)
      navigate(`/chat/${conv.id || conv.conversationId}`)
    } catch (err) {
      toast.error(err?.message || 'Không mở được cuộc trò chuyện.')
    }
  }

  if (items === null || items.length === 0) return null

  return (
    <div className="side-widget">
      <div className="side-widget-head">
        <span className="side-widget-title">💞 Match mới</span>
        <Link to="/matches?tab=matches" className="side-widget-more">Tất cả</Link>
      </div>
      <div className="side-matches-row">
        {items.slice(0, 8).map((m) => {
          const url = resolveImageUrl(m.avatarUrl)
          const matchId = m.matchId ?? m.id
          return (
            <button key={matchId} type="button" className="side-match" title={`Nhắn ${m.displayName || ''}`}
              onClick={() => openChat(matchId)}>
              <AvatarFrame frame={m.avatarFrame} size="sm">
                <span className="side-match-ph" style={url ? { backgroundImage: `url(${url})` } : undefined}>
                  {!url && (m.displayName || '?').charAt(0).toUpperCase()}
                </span>
              </AvatarFrame>
              <span className="side-match-name">{(m.displayName || '?').split(' ')[0]}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Nội dung thẻ kiểu tap-through: ảnh phủ kín thẻ, chạm mép trái/phải để lùi/tiến ảnh,
 * thanh tiến trình trên đầu, tên + chip đè dưới đáy, nút i mở hồ sơ đầy đủ.
 */
function CardContent({ profile }) {
  const [idx, setIdx] = useState(0)
  const photos = orderedPhotos(profile)
  const show = (i) => setIdx(Math.max(0, Math.min(photos.length - 1, i)))
  const chips = [
    profile.height && `${profile.height} cm`,
    GENDER_LABEL[profile.gender] || profile.gender,
    profile.datingGoal && (GOAL_LABEL[profile.datingGoal] || profile.datingGoal),
  ].filter(Boolean)
  return (
    <AvatarFrame frame={profile.avatarFrame} size="xl">
      <div className="dtc-body">
        {photos.length > 0
          ? photos.map((url, i) => (
            <div key={i} className={`dtc-photo${i === idx ? ' on' : ''}`} style={{ backgroundImage: `url(${url})` }} />
          ))
          : <div className="dtc-photo on dtc-photo-empty">{(profile.displayName || '?').charAt(0).toUpperCase()}</div>}

        {photos.length > 1 && (
          <div className="dtc-segs">
            {photos.map((_, i) => <span key={i} className={`dtc-seg${i <= idx ? ' on' : ''}`} />)}
          </div>
        )}
        {photos.length > 1 && (
          <>
            <button type="button" className="dtc-tap l" aria-label="Ảnh trước" onClick={() => show(idx - 1)} />
            <button type="button" className="dtc-tap r" aria-label="Ảnh tiếp theo" onClick={() => show(idx + 1)} />
          </>
        )}

        <div className="dtc-grad" />

        <div className="dtc-info">
          <div className="disc-hero-name">
            {profile.isAdmin ? <AdminFireName>{profile.displayName}</AdminFireName> : profile.displayName}
            {profile.age ? `, ${profile.age}` : ''}
            {profile.isPhotoVerified && <span className="disc-verified" title="Đã xác minh"><ShieldCheckIcon size={16} /></span>}
            {profile.isAdmin && <AdminBadge />}
          </div>
          <div className="disc-hero-meta">
            {profile.location && <span><PinIcon size={12} /> {profile.location}</span>}
            {profile.distanceKm != null && <span>• Cách {formatDistance(profile.distanceKm)}</span>}
            {profile.isAdmin ? (
              <span className="disc-tier disc-tier-vip"><CrownIcon size={13} /> VIP</span>
            ) : profile.reputationTier && profile.reputationTier !== 'Standard' && (
              <span className="disc-tier"><StarIcon size={11} /> {profile.reputationTier}</span>
            )}
          </div>
          {chips.length > 0 && (
            <div className="dtc-chips">
              {chips.map((c, i) => <span key={i} className="dtc-chip">{c}</span>)}
            </div>
          )}
        </div>
      </div>
    </AvatarFrame>
  )
}

/**
 * Thẻ vuốt — MỖI thẻ có motion value RIÊNG (mount theo key userId) nên không bị
 * dư góc xoay sang thẻ kế tiếp. Kéo ngang → xoay + hiện nhãn THÍCH/BỎ QUA.
 */
function SwipeCard({ disabled, onDecide, innerRef, children }) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-260, 0, 260], [-13, 0, 13])
  const likeOpacity = useTransform(x, [30, 140], [0, 1])
  const nopeOpacity = useTransform(x, [-140, -30], [1, 0])

  const onDragEnd = (_e, info) => {
    if (disabled) return
    if (info.offset.x > 120 || info.velocity.x > 600) onDecide('Like')
    else if (info.offset.x < -120 || info.velocity.x < -600) onDecide('Pass')
  }

  return (
    <motion.div
      ref={innerRef}
      className="disc-tapcard"
      style={{ x, rotate }}
      drag={disabled ? false : 'x'}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.65}
      onDragEnd={onDragEnd}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <motion.div className="disc-swipe-label disc-like-label" style={{ opacity: likeOpacity }} aria-hidden>THÍCH</motion.div>
      <motion.div className="disc-swipe-label disc-nope-label" style={{ opacity: nopeOpacity }} aria-hidden>BỎ QUA</motion.div>
      {children}
    </motion.div>
  )
}

export default function Discovery() {
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
  const [upgradeOpen, setUpgradeOpen] = useState(false) // popup nâng cấp khi Free dùng Super Swipe
  const [recycled, setRecycled] = useState(false) // chế độ "tải lại" = hiện lại cả người đã vuốt
  const scrollRef = useRef(null)
  const feedRef = useRef([])
  const recycledRef = useRef(false)
  useEffect(() => { feedRef.current = feed }, [feed])
  useEffect(() => { recycledRef.current = recycled }, [recycled])

  const fetchBatch = async (includeSwiped) => {
    const data = await discoveryService.feed({ limit: PAGE_SIZE, includeSwiped })
    return Array.isArray(data) ? data : (data?.items ?? [])
  }

  // Tải feed. includeSwiped=false: chỉ người mới. true (nút "Tải lại gợi ý"): hiện lại tất cả.
  const load = async (includeSwiped = false) => {
    setLoading(true)
    setExhausted(false)
    setRecycled(includeSwiped)
    if (scrollRef.current) scrollRef.current.scrollTop = 0
    try {
      const list = await fetchBatch(includeSwiped)
      setFeed(list)
      setCursor(0)
      setExhausted(list.length === 0)
    } catch (err) {
      toast.error(err?.message || 'Không tải được danh sách.')
    } finally {
      setLoading(false)
    }
  }

  // Tự động lấy thêm khi hết batch hiện tại (loại trùng theo userId), giữ đúng chế độ recycle
  const loadMore = async () => {
    if (loadingMore || exhausted) return
    setLoadingMore(true)
    try {
      const list = await fetchBatch(recycledRef.current)
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

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Hết người trong batch hiện tại → tự gọi thêm cho tới khi có người hoặc hết hẳn
  useEffect(() => {
    if (loading || loadingMore || exhausted) return
    if (cursor >= feed.length) loadMore()
  }, [cursor, feed.length, loading, loadingMore, exhausted]) // eslint-disable-line react-hooks/exhaustive-deps
  const current = feed[cursor]

  const advance = () => {
    setCursor((c) => c + 1)
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }

  const decide = async (action) => {
    if (!current || actionLoading) return
    setActionLoading(true)
    const target = current
    try {
      const res = await swipesService.swipe({ targetUserId: target.userId, action })
      if (res?.isMatch) setMatchModal({ other: target, matchId: res.matchId })
      advance() // thành công → lướt tiếp
    } catch (err) {
      if (err?.status === 403) {
        // Tính năng trả phí (Super Swipe với gói Free…) → CHẶN, KHÔNG lướt qua người này
        setUpgradeOpen(true)
      } else if (err?.status === 409) {
        advance() // đã vuốt người này rồi (khi xem lại từ đầu) → bỏ qua, lướt tiếp
      } else {
        // vd hết lượt thích hôm nay (400) → báo lỗi, giữ nguyên người hiện tại để thử lại
        toast.error(err?.message || 'Thao tác thất bại.')
      }
    } finally {
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

  // Match modal — tách ra để render được ở MỌI nhánh (kể cả khi đã hết người),
  // nếu không, match vào người cuối feed sẽ không hiện popup.
  // Popup "Đã ghép đôi!" — component dùng chung với trang Lượt thích/Match
  const matchModalEl = <MatchCelebration match={matchModal} onClose={() => setMatchModal(null)} />

  // Popup nâng cấp khi tài khoản Free dùng Super Swipe
  const upgradeModalEl = (
    <AnimatePresence>
      {upgradeOpen && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => setUpgradeOpen(false)}>
          <motion.div className="modal upgrade-modal" initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }} onClick={(e) => e.stopPropagation()}>
            <div className="upgrade-icon"><StarIcon size={40} /></div>
            <h2 className="upgrade-title">Super Swipe là tính năng cao cấp</h2>
            <p className="upgrade-text">
              Nâng cấp lên <strong>Plus</strong> hoặc <strong>Gold</strong> để gây ấn tượng mạnh
              bằng Super Swipe — cùng nhiều đặc quyền hẹn hò khác.
            </p>
            <div className="upgrade-actions">
              <button className="btn btn-ghost" onClick={() => setUpgradeOpen(false)}>Để sau</button>
              <button className="btn btn-primary" onClick={() => { setUpgradeOpen(false); navigate('/premium') }}>
                <CrownIcon size={15} /> Mua ngay
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  if (loading && feed.length === 0) {
    return <div className="loading-block"><span className="spinner" /> Đang tải…</div>
  }

  if (!current) {
    // Hết batch nhưng chưa hết hẳn → đang tự lấy thêm
    if (!exhausted) {
      return (
        <div className="disc-root">
              <div className="disc-main">
                  <div className="loading-block"><span className="spinner" /> Đang tìm thêm người…</div>
            {matchModalEl}
          </div>
        </div>
      )
    }
    // Hết người thật sự → user tự bấm tải lại từ đầu
    return (
      <div className="disc-root">
          <div className="disc-main">
              <div className="discovery-empty">
            <div className="discovery-empty-icon"><SparkleIcon size={56} /></div>
            <h2>Hết người mới rồi!</h2>
            <p>Bạn đã xem hết gợi ý hôm nay. Bấm tải lại để xem từ đầu nhé.</p>
            <div className="discovery-empty-actions">
              <button className="btn btn-primary btn-block" onClick={() => load(true)}>
                <RefreshIcon size={15} /> Tải lại gợi ý
              </button>
            </div>
          </div>
          {matchModalEl}
        </div>
      </div>
    )
  }

  return (
    <div className="disc-root">
      <div className="disc-main">
      <div className="disc-col">

      <AnimatePresence mode="wait">
        <SwipeCard key={current.userId} disabled={actionLoading} onDecide={decide} innerRef={scrollRef}>
          <CardContent profile={current} />
        </SwipeCard>
      </AnimatePresence>

      {/* Nút hành động nổi */}
      <div className="disc-actions">
        <motion.button className="disc-action disc-action-undo" aria-label="Hoàn tác"
          onClick={undo} disabled={actionLoading}
          whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.9 }}>
          <RefreshIcon size={24} />
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
      </div>

      <div className="disc-side">
        <CuratePanel onApplied={() => load(false)} />
        <LikedMeWidget />
        <NewMatchesWidget />
      </div>

      {matchModalEl}
      {upgradeModalEl}
      </div>
    </div>
  )
}
