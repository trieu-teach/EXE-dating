import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { swipesService, subscriptionService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'
import { resolveImageUrl } from '../../../utils/format.js'
import { HeartIcon, StarIcon, CrownIcon, SparkleIcon } from '../../../components/ui/CustomIcons.jsx'
import GlassHeartHero from '../../../components/User/GlassHeartHero/GlassHeartHero.jsx'
import { motion } from 'framer-motion'
import ProfileDetailModal from '../../../components/User/ProfileDetailModal/ProfileDetailModal.jsx'
import MatchCelebration from '../../../components/User/MatchCelebration/MatchCelebration.jsx'
import AdminBadge from '../../../components/User/AdminBadge/AdminBadge.jsx'
import './LikedMe.css'

export default function LikedMe() {
  const navigate = useNavigate()
  const toast = useToast()
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(null)
  const [isGold, setIsGold] = useState(false)
  const [detail, setDetail] = useState(null)
  const [celebrate, setCelebrate] = useState(null) // popup "Đã ghép đôi!"

  const load = async () => {
    setLoading(true)
    try {
      const [liked, superLiked, me] = await Promise.all([
        swipesService.likedMe().catch(() => []),
        swipesService.superLikedMe().catch(() => []),
        subscriptionService.me().catch(() => null),
      ])
      const norm = (x) => (Array.isArray(x) ? x : (x?.items ?? []))
      // SuperLike lên đầu, loại trùng theo userId
      const map = new Map()
      for (const p of [...norm(superLiked), ...norm(liked)]) {
        if (!map.has(p.userId)) map.set(p.userId, p)
      }
      setPeople([...map.values()])
      setIsGold(me?.entitlements?.canSeeLikedMePhotos === true || me?.planCode === 'Gold')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const act = async (u, action) => {
    setActing(u.userId)
    try {
      const res = await swipesService.swipe({ targetUserId: u.userId, action })
      setPeople((cur) => cur.filter((p) => p.userId !== u.userId))
      if (res?.isMatch) setCelebrate({ other: u, matchId: res.matchId })
      else if (action === 'Pass') toast.info('Đã bỏ qua.')
      else toast.success('Đã thích lại 💞')
    } catch (err) {
      toast.error(err?.message || 'Thao tác thất bại.')
    } finally {
      setActing(null)
    }
  }

  // Gold xem hồ sơ đầy đủ → vuốt trong modal
  const onDetailSwipe = (action, res) => {
    const u = detail
    setDetail(null)
    if (!u) return
    setPeople((cur) => cur.filter((p) => p.userId !== u.userId))
    if (res?.isMatch) setCelebrate({ other: u, matchId: res.matchId })
    else if (action === 'Pass') toast.info('Đã bỏ qua.')
    else toast.success('Đã thích lại 💞')
  }

  if (loading) return <div className="loading-block"><span className="spinner" /></div>

  return (
    <div className="liked-root">
      <div className="liked-header-section">
        <div className="liked-header-content">
          <div className="lm-hdr ph-header">
            <span className="lm-hdr-glow ph-glow" aria-hidden />
            <h1 className="ph-title lm-hdr-title">
              <span className="ph-script lm-hdr-script">Có</span>{' '}
              <span className="ph-accent lm-hdr-accent">{people.length} người thích bạn <HeartIcon size={22} className="ph-icon ph-beat lm-hdr-icon" /></span>
            </h1>
          </div>
          <p className="liked-subtitle">
            Ai đó đã dừng lại ở hồ sơ của bạn.<br />
            Có thể đây là khởi đầu của một điều thú vị.
          </p>

          <div className="liked-tabs">
            <button className="liked-tab active">
              <HeartIcon size={16} /> Xem lượt thích
            </button>
            <button className="liked-tab">
              Đã match
            </button>
          </div>

          <div className="liked-stats">
            <div className="stat-badge"><HeartIcon size={14} color="#ff4d8d" /> 2 lượt thích</div>
            <div className="stat-badge"><span style={{color: '#ff4d8d', fontWeight: 'bold'}}>✓</span> 8 match</div>
            <div className="stat-badge"><CrownIcon size={14} /> Thành viên Gold</div>
          </div>
        </div>

        <GlassHeartHero />
      </div>

      {people.length === 0 ? (
        <div className="liked-empty">
          <div className="liked-empty-icon"><HeartIcon size={44} /></div>
          <p>Chưa có ai thích bạn. Hãy lướt Khám phá để xuất hiện nhiều hơn nhé!</p>
          <button className="btn btn-primary" onClick={() => navigate('/discovery')}>Khám phá ngay</button>
        </div>
      ) : (
        <>
          <div className="liked-list-header">
            <div>
              <h2><SparkleIcon size={18} color="#ff4d8d" /> Những người đã thích bạn</h2>
              <p>Hãy chọn một người bạn muốn tìm hiểu hơn</p>
            </div>
            <div className="liked-sort">
              <select>
                <option>Sắp xếp: Mới nhất</option>
              </select>
            </div>
          </div>

          <div className="liked-grid-v2">
            {people.map((u, i) => {
              const url = resolveImageUrl(u.photos?.[0]?.url)
              const locked = !isGold // Free & Plus: luôn khóa (mờ + không tương tác)
              
              // Mock data for UI presentation based on Image 2
              const distance = u.distance || Math.floor(Math.random() * 10) + 1;
              const isOnline = u.isOnline ?? (i % 2 === 0);
              const statusText = isOnline ? "Online" : `Hoạt động ${Math.floor(Math.random() * 30) + 1} phút trước`;
              const badgeType = i === 1 ? 'new' : (isOnline ? 'online' : 'active');
              
              return (
                <motion.div key={u.userId} className="liked-card-v2"
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  
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
                        <button className="btn-like-back" disabled={acting === u.userId} onClick={() => act(u, 'Like')}>
                          <HeartIcon size={14} /> Thích lại
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {locked && (
                    <button type="button" className="liked-card-lock" onClick={() => navigate('/premium')}>
                      <CrownIcon size={32} />
                      <span>Mở khóa với Gold</span>
                    </button>
                  )}

                </motion.div>
              )
            })}
          </div>

          <div className="liked-bottom-banner">
            <div className="banner-icon"><SparkleIcon size={24} /></div>
            <div className="banner-content">
              <strong>Tăng cơ hội nhận thêm lượt thích</strong>
              <span>Hồ sơ đã hoàn thiện 67% — hoàn thiện nốt để thu hút nhiều người phù hợp hơn.</span>
            </div>
            <button className="btn-complete-profile">Hoàn thiện hồ sơ ➔</button>
          </div>
        </>
      )}

      {/* Gold: xem hồ sơ đầy đủ */}
      <ProfileDetailModal
        profile={detail}
        open={!!detail}
        onClose={() => setDetail(null)}
        onSwipe={onDetailSwipe}
      />
      <MatchCelebration match={celebrate} onClose={() => setCelebrate(null)} />
    </div>
  )
}
