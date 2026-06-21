import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { swipesService, subscriptionService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'
import { resolveImageUrl } from '../../../utils/format.js'
import { HeartIcon, StarIcon, CrownIcon, SparkleIcon } from '../../../components/ui/CustomIcons.jsx'
import { motion } from 'framer-motion'
import ProfileDetailModal from '../../../components/User/ProfileDetailModal/ProfileDetailModal.jsx'
import './LikedMe.css'

export default function LikedMe() {
  const navigate = useNavigate()
  const toast = useToast()
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(null)
  const [isGold, setIsGold] = useState(false)
  const [detail, setDetail] = useState(null)

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
      if (res?.isMatch) toast.success(`Match với ${u.displayName}! 🎉`)
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
    if (res?.isMatch) toast.success(`Match với ${u.displayName}! 🎉`)
    else if (action === 'Pass') toast.info('Đã bỏ qua.')
    else toast.success('Đã thích lại 💞')
  }

  if (loading) return <div className="loading-block"><span className="spinner" /></div>

  return (
    <div className="liked-root">
      <div className="liked-hero">
        <div className="liked-hero-eyebrow"><HeartIcon size={12} /> Lượt thích</div>
        <h1>Ai đã thích bạn</h1>
        <p className="liked-hero-sub">
          {people.length} người đã thích bạn.{' '}
          {isGold ? 'Thích lại để tạo match ngay!' : 'Nâng cấp Gold để xem rõ và thích lại.'}
        </p>
        <span className="hero-deco" aria-hidden>💖</span>
      </div>

      {!isGold && people.length > 0 && (
        <button type="button" className="liked-gold-banner" onClick={() => navigate('/premium')}>
          <CrownIcon size={20} />
          <div>
            <strong>Mở khóa ảnh rõ nét với Gold</strong>
            <span>Xem chính xác ai đã thích bạn (kèm ảnh không che).</span>
          </div>
        </button>
      )}

      {people.length === 0 ? (
        <div className="liked-empty">
          <div className="liked-empty-icon"><HeartIcon size={44} /></div>
          <p>Chưa có ai thích bạn. Hãy lướt Khám phá để xuất hiện nhiều hơn nhé!</p>
          <button className="btn btn-primary" onClick={() => navigate('/discovery')}>Khám phá ngay</button>
        </div>
      ) : (
        <div className="liked-grid">
          {people.map((u, i) => {
            const url = resolveImageUrl(u.photos?.[0]?.url)
            const locked = !isGold // Free & Plus: luôn khóa (mờ + không tương tác)
            return (
              <motion.div key={u.userId} className="liked-card"
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <div className={`liked-card-photo${!locked ? ' is-clickable' : ''}`}
                  onClick={() => { if (!locked) setDetail(u) }}
                  role={!locked ? 'button' : undefined}>
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

                {/* Chỉ Gold mới được thích/bỏ qua lại */}
                {isGold && (
                  <div className="liked-card-actions">
                    <button type="button" className="liked-act liked-act-pass" disabled={acting === u.userId}
                      onClick={() => act(u, 'Pass')} aria-label="Bỏ qua">✕</button>
                    <button type="button" className="liked-act liked-act-like" disabled={acting === u.userId}
                      onClick={() => act(u, 'Like')} aria-label="Thích lại">
                      <HeartIcon size={20} />
                    </button>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Gold: xem hồ sơ đầy đủ */}
      <ProfileDetailModal
        profile={detail}
        open={!!detail}
        onClose={() => setDetail(null)}
        onSwipe={onDetailSwipe}
      />
    </div>
  )
}
