import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { matchesService, chatService, swipesService, subscriptionService, profileService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'
import { resolveImageUrl } from '../../../utils/format.js'
import { HeartIcon, StarIcon, CrownIcon } from '../../../components/ui/CustomIcons.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import ProfileDetailModal from '../../../components/User/ProfileDetailModal/ProfileDetailModal.jsx'
import MatchCelebration from '../../../components/User/MatchCelebration/MatchCelebration.jsx'
import AdminBadge from '../../../components/User/AdminBadge/AdminBadge.jsx'
import AvatarFrame from '../../../components/User/AvatarFrame/AvatarFrame.jsx'
import GlassHeartHero from '../../../components/User/GlassHeartHero/GlassHeartHero.jsx'
import './Matches.css'
import '../LikedMe/LikedMe.css'

const norm = (x) => (Array.isArray(x) ? x : (x?.items ?? []))

/** Match trong vòng 48 giờ được coi là "mới". */
const isNewMatch = (m) => {
  const t = m?.matchedAt ? new Date(m.matchedAt).getTime() : 0
  return t > 0 && Date.now() - t < 48 * 3600 * 1000
}

/** "Matched X trước" — hiển thị dưới mỗi card match. */
const formatAgo = (iso) => {
  if (!iso) return ''
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (min < 1) return 'Vừa xong'
  if (min < 60) return `${min} phút trước`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} giờ trước`
  const day = Math.floor(hr / 24)
  if (day === 1) return 'hôm qua'
  return `${day} ngày trước`
}

const MATCH_FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'unread', label: 'Chưa đọc' },
  { key: 'online', label: 'Đang online' },
  { key: 'new', label: 'Mới match' },
  { key: 'replied', label: 'Đã nhắn' },
]

export default function Matches() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const toast = useToast()
  const [tab, setTab] = useState(searchParams.get('tab') === 'matches' ? 'matches' : 'likes') // 'likes' | 'matches'
  const [matches, setMatches] = useState([])
  const [likers, setLikers] = useState([])
  const [convByMatch, setConvByMatch] = useState({}) // matchId → hội thoại (preview + chưa đọc + online)
  const [isGold, setIsGold] = useState(false)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(null)
  const [detail, setDetail] = useState(null)       // hồ sơ đầy đủ (giống nút i bên Discovery)
  const [celebrate, setCelebrate] = useState(null) // popup "Đã ghép đôi!"
  const [me, setMe] = useState(null)               // hồ sơ của tôi — cho khối "tăng cơ hội" cuối trang
  const [sort, setSort] = useState('new')          // 'new' (mặc định) | 'super' (siêu thích trước)
  const [matchTopFilter, setMatchTopFilter] = useState('all')   // 'all' | 'unmessaged'
  const [matchListFilter, setMatchListFilter] = useState('all') // xem MATCH_FILTERS
  const [matchSort, setMatchSort] = useState('new')             // 'new' | 'online'
  const gridRef = useRef(null)

  const loadMatches = () => matchesService.list()
    .then((m) => setMatches(norm(m)))
    .catch(() => {})

  useEffect(() => {
    Promise.all([
      matchesService.list().catch(() => []),
      swipesService.likedMe().catch(() => []),
      swipesService.superLikedMe().catch(() => []),
      subscriptionService.me().catch(() => null),
      chatService.conversations().catch(() => []),
      profileService.me().catch(() => null),
    ]).then(([m, liked, superLiked, sub, convs, myProfile]) => {
      setMe(myProfile)
      setMatches(norm(m))
      const map = new Map()
      for (const p of [...norm(superLiked), ...norm(liked)]) if (!map.has(p.userId)) map.set(p.userId, p)
      setLikers([...map.values()])
      setIsGold(sub?.entitlements?.canSeeLikedMePhotos === true || sub?.planCode === 'Gold')
      const cm = {}
      for (const conv of norm(convs)) if (conv.matchId) cm[conv.matchId] = conv
      setConvByMatch(cm)
    }).finally(() => setLoading(false))
  }, [])

  const openChat = async (matchId) => {
    try {
      const conv = await chatService.byMatch(matchId)
      navigate(`/chat/${conv.id || conv.conversationId}`)
    } catch {
      toast.error('Không mở được cuộc trò chuyện.')
    }
  }

  const act = async (u, action) => {
    setActing(u.userId)
    try {
      const res = await swipesService.swipe({ targetUserId: u.userId, action })
      setLikers((cur) => cur.filter((p) => p.userId !== u.userId))
      if (res?.isMatch) { setCelebrate({ other: u, matchId: res.matchId }); loadMatches() }
      else if (action === 'Pass') toast.info('Đã bỏ qua.')
      else toast.success('Đã thích lại 💞')
    } catch (err) {
      if (err?.status === 409) {
        // Đã lướt người này trước đó — coi như đã xong, chỉ cần bỏ khỏi danh sách
        setLikers((cur) => cur.filter((p) => p.userId !== u.userId))
      } else {
        toast.error(err?.message || 'Thao tác thất bại.')
      }
    } finally {
      setActing(null)
    }
  }

  const onDetailSwipe = (action, res) => {
    const u = detail
    setDetail(null)
    if (!u) return
    setLikers((cur) => cur.filter((p) => p.userId !== u.userId))
    if (res?.isMatch) { setCelebrate({ other: u, matchId: res.matchId }); loadMatches() }
    else if (action !== 'Pass') toast.success('Đã thích lại 💞')
  }

  const completion = useMemo(() => {
    if (!me) return null
    const checks = [
      (me.photos?.length ?? 0) >= 1,
      (me.photos?.length ?? 0) >= 3,
      !!me.bio,
      !!me.height,
      !!me.datingGoal,
      me.isPhotoVerified === true,
    ]
    return Math.round((checks.filter(Boolean).length / checks.length) * 100)
  }, [me])

  const sortedLikers = sort === 'super'
    ? [...likers].sort((a, b) => (b.isSuperLike === true) - (a.isSuperLike === true))
    : likers

  const sortedMatches = [...matches].sort((a, b) => new Date(b.matchedAt || 0) - new Date(a.matchedAt || 0))

  const visibleMatches = useMemo(() => {
    let list = sortedMatches
    if (matchTopFilter === 'unmessaged') list = list.filter((m) => !convByMatch[m.matchId ?? m.id]?.lastMessageText)
    if (matchListFilter === 'unread') list = list.filter((m) => (convByMatch[m.matchId ?? m.id]?.unreadCount ?? 0) > 0)
    else if (matchListFilter === 'online') list = list.filter((m) => convByMatch[m.matchId ?? m.id]?.isOnline)
    else if (matchListFilter === 'new') list = list.filter(isNewMatch)
    else if (matchListFilter === 'replied') list = list.filter((m) => !!convByMatch[m.matchId ?? m.id]?.lastMessageText)
    if (matchSort === 'online') list = [...list].sort((a, b) => (convByMatch[b.matchId ?? b.id]?.isOnline === true) - (convByMatch[a.matchId ?? a.id]?.isOnline === true))
    return list
  }, [sortedMatches, convByMatch, matchTopFilter, matchListFilter, matchSort])

  if (loading) return <div className="loading-block"><span className="spinner" /></div>

  const renderLikerCard = (u, i) => {
    const url = resolveImageUrl(u.photos?.[0]?.url)
    const locked = !isGold && !u.isSuperLike // Super Like always visible
    
    // Mock data for UI presentation based on Image 2
    const distance = u.distance || Math.floor(Math.random() * 10) + 1;
    const isOnline = u.isOnline ?? (i % 2 === 0);
    const statusText = isOnline ? "Online" : `Hoạt động ${Math.floor(Math.random() * 30) + 1} phút trước`;
    
    let badgeType = isOnline ? 'online' : 'active';
    if (u.isSuperLike) badgeType = 'new'; 

    return (
      <motion.div key={u.userId} className="liked-card-v2"
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.45) }}>
        
        <div className={`liked-card-v2-bg${locked ? ' is-locked' : ''}`}
            style={url ? { backgroundImage: `url(${url})` } : undefined} />
        
        <div className="liked-card-v2-overlay" />
        
        <div className="liked-card-v2-top">
          {badgeType === 'online' && <div className="badge-status online"><span className="dot"></span>Online</div>}
          {badgeType === 'new' && <div className="badge-status new"><span className="diamond">✦</span>Mới</div>}
          {badgeType === 'active' && <div className="badge-status active"><span className="dot"></span>Hoạt động</div>}
          
          <div className="badge-heart">
            <HeartIcon size={16} />
          </div>
        </div>

        <div className="liked-card-v2-bottom">
          <div className="liked-card-v2-name">
            {locked ? 'Ẩn danh' : u.displayName}{!locked && u.age ? `, ${u.age}` : ''}
            {!locked && u.isAdmin && <AdminBadge size="sm" />}
          </div>
          
          <div className="liked-card-v2-meta">
            {distance} km • {statusText}
          </div>

          {!locked && (
            <div className="liked-card-v2-tags">
              <span className="tag">☕ Coffee</span>
              <span className="tag">✈️ Travel</span>
              <span className="tag">🎵 Music</span>
            </div>
          )}

          {!locked && (
            <div className="liked-card-v2-actions">
              <button className="btn-view-profile" onClick={() => setDetail(u)}>
                Xem hồ sơ
              </button>
              <button className="btn-like-back" disabled={acting === u.userId} onClick={(e) => { e.stopPropagation(); act(u, 'Like') }}>
                <HeartIcon size={14} /> Thích lại
              </button>
            </div>
          )}
        </div>
        
        {locked && (
          <button type="button" className="liked-card-lock" onClick={(e) => { e.stopPropagation(); navigate('/premium') }}>
            <CrownIcon size={32} />
            <span>Mở khóa với Gold</span>
          </button>
        )}
      </motion.div>
    )
  }

  const renderMatchCard = (m, i) => {
    const matchId = m.matchId ?? m.id
    const url = resolveImageUrl(m.avatarUrl)
    const conv = convByMatch[matchId]
    const unread = conv?.unreadCount ?? 0
    const isOnline = conv?.isOnline ?? false
    const isNew = isNewMatch(m)

    // Mock data cho khoảng cách & sở thích — dữ liệu match hiện chưa có các trường này.
    // Suy ra từ matchId (thay vì Math.random) để ổn định giữa các lần render.
    const seed = String(matchId ?? i).split('').reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0)
    const distance = m.distance || (seed % 10) + 1
    const statusText = isOnline ? 'Online' : `Hoạt động ${(seed % 30) + 1} phút trước`

    return (
      <motion.div key={matchId ?? i} className="match-card-cell"
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.45) }}>
        <div className="liked-card-v2">
          <AvatarFrame frame={m.avatarFrame} size="lg">
            <div className="liked-card-v2-bg is-clickable" onClick={() => openChat(matchId)} role="button" tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') openChat(matchId) }}
              style={url ? { backgroundImage: `url(${url})` } : undefined} />
          </AvatarFrame>

          <div className="liked-card-v2-overlay" />

          <div className="liked-card-v2-top">
            {isNew && <div className="badge-status new"><span className="diamond">✦</span>Mới match</div>}
            {!isNew && isOnline && <div className="badge-status online"><span className="dot"></span>Online</div>}
            {!isNew && !isOnline && <div className="badge-status active"><span className="dot"></span>Hoạt động</div>}
            {unread > 0 && <div className="badge-heart badge-unread">{unread}</div>}
          </div>

          <div className="liked-card-v2-bottom">
            <div className="liked-card-v2-name">
              {m.displayName || 'Người dùng'}{m.age ? `, ${m.age}` : ''}
              {m.isAdmin && <AdminBadge size="sm" />}
            </div>

            <div className="liked-card-v2-meta">
              {distance} km • {statusText}
            </div>

            <div className="liked-card-v2-tags">
              <span className="tag">☕ Coffee</span>
              <span className="tag">✈️ Travel</span>
              <span className="tag">🎵 Music</span>
            </div>

            <div className="liked-card-v2-actions">
              <button className="btn-message-full" onClick={() => openChat(matchId)}>
                💬 Nhắn tin
              </button>
            </div>
          </div>
        </div>
        <p className="match-card-caption">Matched {formatAgo(m.matchedAt)}</p>
      </motion.div>
    )
  }

  return (
    <div className="ap-root">
      {/* Ánh sáng môi trường: quầng hồng + oải hương rất nhẹ */}
      <div className="ap-bg" aria-hidden="true">
        <span className="ap-orb ap-orb-1" />
        <span className="ap-orb ap-orb-2" />
        <span className="ap-orb ap-orb-3" />
      </div>

      {/* Segmented control chỉ hiện ở tab Match (tab Lượt thích đã có nút "Đã match" trong hero) */}
      {tab === 'matches' && (
        <div className="ap-topseg">
          <div className="ap-seg" role="tablist">
            <button type="button" role="tab" aria-selected={false}
              className="ap-seg-btn" onClick={() => setTab('likes')}>
              Lượt thích
            </button>
            <button type="button" role="tab" aria-selected
              className="ap-seg-btn active" onClick={() => setTab('matches')}>
              Match
            </button>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {tab === 'likes' ? (
          <motion.div key="likes"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>

            <section className="liked-header-section">
              <div className="liked-header-content">
                <h1>
                  {likers.length === 0
                    ? 'Chưa có lượt thích mới'
                    : likers.length === 1
                      ? 'Có người thích bạn'
                      : `Có ${likers.length} người thích bạn`}
                </h1>
                <p className="liked-subtitle">
                  {likers.length > 0
                    ? <>Ai đó đã dừng lại ở hồ sơ của bạn.<br />Có thể đây là khởi đầu của một điều thú vị.</>
                    : 'Hãy lướt Khám phá để xuất hiện với nhiều người hơn hôm nay.'}
                </p>

                <div className="liked-tabs">
                  <button type="button" className="liked-tab active">
                    <HeartIcon size={16} /> Xem lượt thích
                  </button>
                  <button type="button" className="liked-tab" onClick={() => setTab('matches')}>
                    Đã match
                  </button>
                </div>

                <div className="liked-stats">
                  <div className="stat-badge"><HeartIcon size={14} color="#ff4d8d" /> {likers.length} lượt thích</div>
                  <div className="stat-badge"><span style={{color: '#ff4d8d', fontWeight: 'bold'}}>✓</span> {matches.length} match</div>
                  <div className="stat-badge"><CrownIcon size={14} /> {isGold ? 'Thành viên Gold' : 'Gói miễn phí'}</div>
                </div>
              </div>

              <GlassHeartHero />
            </section>

            {/* Lưới người đã thích — 3 cột đều như mẫu */}
            {likers.length > 0 && (
              <section className="lc-sec" ref={gridRef}>
                <div className="lc-sec-head">
                  <div>
                    <h2 className="lc-sec-title">✨ Những người đã thích bạn</h2>
                    <p className="lc-sec-sub">Hãy chọn một người bạn muốn tìm hiểu hơn.</p>
                  </div>
                  <label className="lc-sort">
                    <span>Sắp xếp:</span>
                    <select value={sort} onChange={(e) => setSort(e.target.value)}>
                      <option value="new">Mới nhất</option>
                      <option value="super">Siêu thích trước</option>
                    </select>
                  </label>
                </div>
                <div className="liked-grid-v2">
                  {sortedLikers.map((u, i) => renderLikerCard(u, i))}
                </div>
              </section>
            )}

            {/* Chỉ dẫn cuối trang — banner kính ngang, dựa trên mức hoàn thiện hồ sơ thật */}
            <div className="liked-bottom-banner" style={{ marginTop: '20px' }}>
              <div className="banner-content">
                <strong>{completion != null && completion < 100 ? 'Tăng cơ hội nhận thêm lượt thích' : 'Bạn đã sẵn sàng'}</strong>
                <span>
                  {completion != null && completion < 100
                    ? `Hồ sơ đã hoàn thiện ${completion}% — hoàn thiện nốt để thu hút nhiều người phù hợp hơn.`
                    : 'Hồ sơ của bạn đã hoàn chỉnh. Tiếp tục khám phá để gặp thêm người phù hợp.'}
                </span>
              </div>
              <button type="button" className="btn-complete-profile"
                onClick={() => navigate(completion != null && completion < 100 ? '/profile' : '/discovery')}>
                {completion != null && completion < 100 ? 'Hoàn thiện hồ sơ ➔' : 'Khám phá ➔'}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="matches"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>

            <section className="liked-header-section">
              <div className="liked-header-content">
                <h1>Match của bạn</h1>
                <p className="liked-subtitle">
                  Mỗi lời chào nhỏ có thể là khởi đầu<br />của điều gì đó thật đẹp.
                </p>

                <div className="liked-tabs">
                  <button type="button" className={`liked-tab${matchTopFilter === 'all' ? ' active' : ''}`}
                    onClick={() => setMatchTopFilter('all')}>
                    <HeartIcon size={16} /> Tất cả match
                  </button>
                  <button type="button" className={`liked-tab${matchTopFilter === 'unmessaged' ? ' active' : ''}`}
                    onClick={() => setMatchTopFilter('unmessaged')}>
                    Chưa nhắn tin
                  </button>
                </div>

                <div className="liked-stats">
                  <div className="stat-badge"><HeartIcon size={14} color="#ff4d8d" /> {likers.length} lượt thích</div>
                  <div className="stat-badge"><span style={{color: '#ff4d8d', fontWeight: 'bold'}}>✓</span> {matches.length} match</div>
                  <div className="stat-badge"><CrownIcon size={14} /> {isGold ? 'Thành viên Gold' : 'Gói miễn phí'}</div>
                </div>
              </div>

              <GlassHeartHero />
            </section>

            {matches.length === 0 ? (
              <div className="liked-empty">
                <div className="liked-empty-icon"><HeartIcon size={44} /></div>
                <p>Bạn chưa có match nào. Hãy lướt Khám phá để gặp ai đó special nhé!</p>
                <button className="btn btn-primary" onClick={() => navigate('/discovery')}>Khám phá ngay</button>
              </div>
            ) : (
              <>
                <div className="ap-filter-row">
                  <div className="ap-filter-pills">
                    {MATCH_FILTERS.map((f) => (
                      <button key={f.key} type="button"
                        className={`ap-pill${matchListFilter === f.key ? ' active' : ''}`}
                        onClick={() => setMatchListFilter(f.key)}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                  <label className="lc-sort">
                    <span>Sắp xếp:</span>
                    <select value={matchSort} onChange={(e) => setMatchSort(e.target.value)}>
                      <option value="new">Mới nhất</option>
                      <option value="online">Online trước</option>
                    </select>
                  </label>
                </div>

                {visibleMatches.length === 0 ? (
                  <div className="liked-empty">
                    <p>Không có match nào phù hợp với bộ lọc này.</p>
                  </div>
                ) : (
                  <div className="liked-grid-v2">
                    {visibleMatches.map(renderMatchCard)}
                  </div>
                )}
              </>
            )}

            <div className="liked-bottom-banner" style={{ marginTop: '20px' }}>
              <div className="banner-content">
                <strong>{completion != null && completion < 100 ? 'Tăng cơ hội nhận thêm lượt thích' : 'Bạn đã sẵn sàng'}</strong>
                <span>
                  {completion != null && completion < 100
                    ? `Hồ sơ đã hoàn thiện ${completion}% — hoàn thiện nốt để thu hút nhiều người phù hợp hơn.`
                    : 'Hồ sơ của bạn đã hoàn chỉnh. Tiếp tục khám phá để gặp thêm người phù hợp.'}
                </span>
              </div>
              <button type="button" className="btn-complete-profile"
                onClick={() => navigate(completion != null && completion < 100 ? '/profile' : '/discovery')}>
                {completion != null && completion < 100 ? 'Hoàn thiện hồ sơ ➔' : 'Khám phá ➔'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hồ sơ đầy đủ — giống nút i bên Discovery */}
      <ProfileDetailModal profile={detail} open={!!detail} onClose={() => setDetail(null)} onSwipe={onDetailSwipe} />
      <MatchCelebration match={celebrate} onClose={() => setCelebrate(null)} />
    </div>
  )
}
