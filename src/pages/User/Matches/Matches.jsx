import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { matchesService, chatService, swipesService, subscriptionService, profileService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'
import { resolveImageUrl, timeAgo } from '../../../utils/format.js'
import { HeartIcon, MessageIcon, SparkleIcon, StarIcon, CrownIcon } from '../../../components/ui/CustomIcons.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import ProfileDetailModal from '../../../components/User/ProfileDetailModal/ProfileDetailModal.jsx'
import ProfilePreviewModal from '../../../components/User/ProfilePreviewModal/ProfilePreviewModal.jsx'
import AdminBadge from '../../../components/User/AdminBadge/AdminBadge.jsx'
import AvatarFrame from '../../../components/User/AvatarFrame/AvatarFrame.jsx'
import './Matches.css'
import '../LikedMe/LikedMe.css'

export default function Matches() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const toast = useToast()
  const [tab, setTab] = useState(searchParams.get('tab') === 'matches' ? 'matches' : 'likes') // 'likes' | 'matches'
  const [matches, setMatches] = useState([])
  const [likers, setLikers] = useState([])
  const [isGold, setIsGold] = useState(false)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(null)
  const [detail, setDetail] = useState(null)
  const [profile, setProfile] = useState(null) // hồ sơ người match (bấm avatar)

  const loadMatches = () => matchesService.list()
    .then((m) => setMatches(Array.isArray(m) ? m : (m?.items ?? [])))
    .catch(() => {})

  useEffect(() => {
    Promise.all([
      matchesService.list().catch(() => []),
      swipesService.likedMe().catch(() => []),
      swipesService.superLikedMe().catch(() => []),
      subscriptionService.me().catch(() => null),
    ]).then(([m, liked, superLiked, me]) => {
      const norm = (x) => (Array.isArray(x) ? x : (x?.items ?? []))
      setMatches(norm(m))
      const map = new Map()
      for (const p of [...norm(superLiked), ...norm(liked)]) if (!map.has(p.userId)) map.set(p.userId, p)
      setLikers([...map.values()])
      setIsGold(me?.entitlements?.canSeeLikedMePhotos === true || me?.planCode === 'Gold')
    }).finally(() => setLoading(false))
  }, [])

  const openProfile = async (userId) => {
    if (!userId) return
    try {
      const p = await profileService.byId(userId)
      setProfile(p)
    } catch (err) {
      toast.error(err?.message || 'Không tải được hồ sơ.')
    }
  }

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
      if (res?.isMatch) { toast.success(`Match với ${u.displayName}! 🎉`); loadMatches() }
      else if (action === 'Pass') toast.info('Đã bỏ qua.')
      else toast.success('Đã thích lại 💞')
    } catch (err) {
      toast.error(err?.message || 'Thao tác thất bại.')
    } finally {
      setActing(null)
    }
  }

  const onDetailSwipe = (action, res) => {
    const u = detail
    setDetail(null)
    if (!u) return
    setLikers((cur) => cur.filter((p) => p.userId !== u.userId))
    if (res?.isMatch) { toast.success(`Match với ${u.displayName}! 🎉`); loadMatches() }
    else if (action !== 'Pass') toast.success('Đã thích lại 💞')
  }

  if (loading) return <div className="loading-block"><span className="spinner" /></div>

  return (
    <div className="matches-root">
      {/* Header sạch + accent thương hiệu (kiểu Hinge) */}
      <header className="mt-header">
        <span className="mt-glow" aria-hidden />
        <span className="mt-eyebrow"><HeartIcon size={12} /> Kết nối</span>
        <h1 className="mt-title">Lượt thích <span>&amp; Match</span></h1>
        <p className="mt-subtitle">Ai đã thích bạn và những người đã match.</p>
        <div className="mt-stats">
          <button type="button" className="mt-stat" onClick={() => setTab('likes')}>
            <span className="mt-stat-ico mt-ico-pink"><HeartIcon size={18} /></span>
            <span className="mt-stat-body">
              <span className="mt-stat-num">{likers.length}</span>
              <span className="mt-stat-lbl">Lượt thích bạn</span>
            </span>
          </button>
          <button type="button" className="mt-stat" onClick={() => setTab('matches')}>
            <span className="mt-stat-ico mt-ico-purple"><SparkleIcon size={18} /></span>
            <span className="mt-stat-body">
              <span className="mt-stat-num">{matches.length}</span>
              <span className="mt-stat-lbl">Đã match</span>
            </span>
          </button>
        </div>
      </header>

      {/* Tabs — segmented control */}
      <div className="mt-tabs-wrap">
        <div className="mt-tabs">
          <button className={`mt-tab${tab === 'likes' ? ' is-active' : ''}`} onClick={() => setTab('likes')}>
            <HeartIcon size={15} /> Đã thích bạn
            {likers.length > 0 && <span className="mt-tab-count">{likers.length}</span>}
          </button>
          <button className={`mt-tab${tab === 'matches' ? ' is-active' : ''}`} onClick={() => setTab('matches')}>
            <MessageIcon size={15} /> Match
            {matches.length > 0 && <span className="mt-tab-count">{matches.length}</span>}
          </button>
        </div>
      </div>

      <div className="mt-body">
        <AnimatePresence mode="wait">
          {tab === 'likes' ? (
            <motion.div key="likes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {!isGold && likers.length > 0 && (
                <button type="button" className="liked-gold-banner" onClick={() => navigate('/premium')}>
                  <CrownIcon size={20} />
                  <div>
                    <strong>Mở khóa với Gold</strong>
                    <span>Xem rõ ai đã thích bạn và thích lại để match ngay.</span>
                  </div>
                </button>
              )}

              {likers.length === 0 ? (
                <div className="liked-empty">
                  <div className="liked-empty-icon"><HeartIcon size={44} /></div>
                  <p>Chưa có ai thích bạn. Hãy lướt Khám phá để xuất hiện nhiều hơn nhé!</p>
                  <button className="btn btn-primary" onClick={() => navigate('/discovery')}>Khám phá ngay</button>
                </div>
              ) : (
                <div className="liked-grid">
                  {likers.map((u, i) => {
                    const url = resolveImageUrl(u.photos?.[0]?.url)
                    // Super Swipe luôn lộ rõ (kể cả Free/Plus); like thường mới cần Gold
                    const locked = !isGold && !u.isSuperLike
                    const canAct = isGold || u.isSuperLike
                    return (
                      <motion.div key={u.userId} className="liked-card"
                        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                        <div className={`liked-card-photo${!locked ? ' is-clickable' : ''}`}
                          onClick={() => { if (!locked) setDetail(u) }} role={!locked ? 'button' : undefined}>
                          <div className={`liked-card-bg${locked ? ' is-locked' : ''}`}
                            style={url ? { backgroundImage: `url(${url})` } : undefined} />
                          {!url && <span className="liked-card-initial">{(u.displayName || '?').charAt(0).toUpperCase()}</span>}
                          {u.isSuperLike && <span className="liked-card-super"><StarIcon size={11} /> Siêu thích</span>}
                          {locked && (
                            <button type="button" className="liked-card-lock" onClick={() => navigate('/premium')}>
                              <CrownIcon size={18} />
                              <span>Mở khóa với Gold</span>
                            </button>
                          )}
                          <div className="liked-card-grad" />
                          <div className="liked-card-name">
                            {locked ? 'Ẩn danh' : u.displayName}{!locked && u.age ? `, ${u.age}` : ''}
                            {!locked && u.isAdmin && <AdminBadge size="sm" />}
                          </div>
                        </div>
                        {canAct && (
                          <div className="liked-card-actions">
                            <button type="button" className="liked-act liked-act-pass" disabled={acting === u.userId}
                              onClick={() => act(u, 'Pass')} aria-label="Bỏ qua">✕</button>
                            <button type="button" className="liked-act liked-act-like" disabled={acting === u.userId}
                              onClick={() => act(u, 'Like')} aria-label="Thích lại"><HeartIcon size={20} /></button>
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="matches" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {matches.length === 0 ? (
                <div className="liked-empty">
                  <div className="liked-empty-icon"><HeartIcon size={44} /></div>
                  <p>Bạn chưa có match nào. Hãy lướt Discovery để gặp ai đó special nhé!</p>
                  <button className="btn btn-primary" onClick={() => navigate('/discovery')}>Khám phá ngay</button>
                </div>
              ) : (
                <>
                  {/* Hàng match mới — avatar viền gradient (kiểu Bumble) */}
                  <div className="mt-new-row">
                    <div className="mt-new-track">
                      {matches.slice(0, 14).map((m, i) => {
                        const matchId = m.matchId ?? m.id
                        const avatar = resolveImageUrl(m.avatarUrl)
                        const name = (m.displayName || 'Người dùng').split(' ')[0]
                        return (
                          <button key={matchId ?? `n${i}`} type="button" className="mt-new" onClick={() => openChat(matchId)} title={`Nhắn ${name}`}>
                            <span className="mt-new-ring">
                              <span className="mt-new-photo" style={avatar ? { backgroundImage: `url(${avatar})` } : undefined}>
                                {!avatar && <span className="mt-new-initial">{(m.displayName || '?').charAt(0).toUpperCase()}</span>}
                              </span>
                            </span>
                            <span className="mt-new-name">{name}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="mt-list-label">Tất cả match</div>
                <div className="matches-list">
                  {matches.map((m, i) => {
                    const matchId = m.matchId ?? m.id
                    const avatar = resolveImageUrl(m.avatarUrl)
                    return (
                      <motion.div key={matchId ?? i} className="match-card"
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }} onClick={() => openChat(matchId)}>
                        <AvatarFrame frame={m.avatarFrame} size="md">
                          <button type="button" className="match-avatar" title="Xem hồ sơ"
                            style={avatar ? { backgroundImage: `url(${avatar})` } : undefined}
                            onClick={(e) => { e.stopPropagation(); openProfile(m.userId) }}>
                            {!avatar && <span className="match-avatar-fallback">{(m.displayName || '?').charAt(0).toUpperCase()}</span>}
                          </button>
                        </AvatarFrame>
                        <div className="match-info">
                          <div className="match-name">
                            {m.displayName || 'Người dùng'}{m.age ? `, ${m.age}` : ''}
                            {m.isAdmin && <AdminBadge size="sm" />}
                          </div>
                          <div className="match-meta"><HeartIcon size={10} /> Match {timeAgo(m.matchedAt)}</div>
                        </div>
                        <button type="button" className="match-action" title="Nhắn tin"
                          onClick={(e) => { e.stopPropagation(); openChat(matchId) }}>
                          <MessageIcon size={18} />
                        </button>
                      </motion.div>
                    )
                  })}
                </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {((tab === 'likes' && likers.length > 0) || (tab === 'matches' && matches.length > 0)) && (
          <div className="mt-cta">
            <div className="mt-cta-icon"><SparkleIcon size={22} /></div>
            <div className="mt-cta-text">
              <strong>Muốn nhiều kết nối hơn?</strong>
              <span>Lướt Khám phá để xuất hiện với nhiều người và nhận thêm lượt thích mỗi ngày.</span>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/discovery')}>Khám phá ngay</button>
          </div>
        )}
      </div>

      <ProfileDetailModal profile={detail} open={!!detail} onClose={() => setDetail(null)} onSwipe={onDetailSwipe} />

      {/* Hồ sơ đầy đủ người match (bấm avatar) */}
      <ProfilePreviewModal profile={profile} open={!!profile} onClose={() => setProfile(null)} ownerView={false} />
    </div>
  )
}
