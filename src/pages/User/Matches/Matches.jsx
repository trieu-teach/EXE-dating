import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { matchesService, chatService, swipesService, subscriptionService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'
import { resolveImageUrl, timeAgo } from '../../../utils/format.js'
import { HeartIcon, MessageIcon, SparkleIcon, StarIcon, CrownIcon } from '../../../components/ui/CustomIcons.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import ProfileDetailModal from '../../../components/User/ProfileDetailModal/ProfileDetailModal.jsx'
import './Matches.css'
import '../LikedMe/LikedMe.css'

export default function Matches() {
  const navigate = useNavigate()
  const toast = useToast()
  const [tab, setTab] = useState('likes') // 'likes' | 'matches'
  const [matches, setMatches] = useState([])
  const [likers, setLikers] = useState([])
  const [isGold, setIsGold] = useState(false)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(null)
  const [detail, setDetail] = useState(null)

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
      {/* Hero */}
      <div className="matches-hero">
        <div className="matches-hero-content">
          <div className="matches-hero-eyebrow"><SparkleIcon size={12} /> Kết nối</div>
          <h1>Lượt thích & Match</h1>
          <p className="matches-hero-subtitle">Ai đã thích bạn và những người đã match — tất cả ở đây.</p>
        </div>
      </div>

      {/* Tabs */}
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
                    const locked = !isGold
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
                          </div>
                        </div>
                        {isGold && (
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
                <div className="matches-list">
                  {matches.map((m, i) => {
                    const matchId = m.matchId ?? m.id
                    const avatar = resolveImageUrl(m.avatarUrl)
                    return (
                      <motion.div key={matchId ?? i} className="match-card"
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }} onClick={() => openChat(matchId)}>
                        <div className="match-avatar" style={avatar ? { backgroundImage: `url(${avatar})` } : undefined}>
                          {!avatar && <span className="match-avatar-fallback">{(m.displayName || '?').charAt(0).toUpperCase()}</span>}
                        </div>
                        <div className="match-info">
                          <div className="match-name">{m.displayName || 'Người dùng'}{m.age ? `, ${m.age}` : ''}</div>
                          <div className="match-meta"><HeartIcon size={10} /> Match {timeAgo(m.matchedAt)}</div>
                        </div>
                        <div className="match-action"><MessageIcon size={18} /></div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ProfileDetailModal profile={detail} open={!!detail} onClose={() => setDetail(null)} onSwipe={onDetailSwipe} />
    </div>
  )
}
