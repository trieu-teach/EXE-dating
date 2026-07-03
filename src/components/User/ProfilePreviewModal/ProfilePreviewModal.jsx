import { motion, AnimatePresence } from 'framer-motion'
import { resolveImageUrl } from '../../../utils/format.js'
import { PinIcon, ShieldCheckIcon, XIcon, HeartIcon, StarIcon } from '../../ui/CustomIcons.jsx'
import AdminBadge from '../AdminBadge/AdminBadge.jsx'
import AdminFireName from '../AdminBadge/AdminFireName.jsx'
import AvatarFrame from '../AvatarFrame/AvatarFrame.jsx'
import './ProfilePreviewModal.css'

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
 * Xem trước hồ sơ của chính mình đúng như người khác thấy trong Discovery.
 */
export default function ProfilePreviewModal({ profile, open, onClose, ownerView = true }) {
  if (!profile) return null
  const photos = orderedPhotos(profile)
  const name = profile.displayName || 'Bạn'
  const location = profile.city || profile.location
  const chips = [
    profile.height && `${profile.height} cm`,
    GENDER_LABEL[profile.gender] || profile.gender,
    profile.datingGoal && (GOAL_LABEL[profile.datingGoal] || profile.datingGoal),
  ].filter(Boolean)

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="pv-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="pv-sheet"
            initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            onClick={(e) => e.stopPropagation()}>
            <div className="pv-topbar">
              <span className="pv-topbar-title">{ownerView ? 'Xem trước hồ sơ' : `Hồ sơ của ${name}`}</span>
              <button type="button" className="pv-close" onClick={onClose} aria-label="Đóng"><XIcon size={20} /></button>
            </div>

            <div className="pv-scroll">
              {ownerView && <div className="pv-hint">👀 Đây là hồ sơ của bạn khi người khác nhìn thấy</div>}

              {photos[0] ? (
                <AvatarFrame frame={profile.avatarFrame} shape="square" size="xl" className="avatar-frame-block pv-photo-hero-frame-slot">
                  <div className="pv-photo pv-photo-hero" style={{ backgroundImage: `url(${photos[0]})` }}>
                    <div className="pv-photo-gradient" />
                    <div className="pv-hero-info">
                      <div className="pv-hero-name">
                        {profile.isAdmin ? <AdminFireName>{name}</AdminFireName> : name}
                        {profile.age ? `, ${profile.age}` : ''}
                        {profile.isPhotoVerified && <span className="pv-verified"><ShieldCheckIcon size={16} /></span>}
                        {profile.isAdmin && <AdminBadge />}
                      </div>
                      {location && <div className="pv-hero-meta"><PinIcon size={12} /> {location}</div>}
                    </div>
                  </div>
                </AvatarFrame>
              ) : (
                <div className="pv-photo pv-photo-empty">Chưa có ảnh nào — thêm ảnh để hồ sơ hấp dẫn hơn 📸</div>
              )}

              {profile.bio && (
                <div className="pv-panel">
                  <div className="pv-panel-label"><HeartIcon size={13} /> Giới thiệu về {name}</div>
                  <p className="pv-panel-bio">{profile.bio}</p>
                </div>
              )}

              {photos[1] && <div className="pv-photo" style={{ backgroundImage: `url(${photos[1]})` }} />}

              {chips.length > 0 && (
                <div className="pv-panel">
                  <div className="pv-panel-label"><StarIcon size={12} /> Thông tin cơ bản</div>
                  <div className="pv-chips">{chips.map((c, i) => <span key={i} className="pv-chip">{c}</span>)}</div>
                </div>
              )}

              {photos[2] && <div className="pv-photo" style={{ backgroundImage: `url(${photos[2]})` }} />}

              {location && (
                <div className="pv-panel">
                  <div className="pv-panel-label"><PinIcon size={12} /> Vị trí</div>
                  <div className="pv-panel-big">{location}</div>
                </div>
              )}

              {photos.slice(3).map((url, i) => (
                <div key={i} className="pv-photo" style={{ backgroundImage: `url(${url})` }} />
              ))}

              <div className="pv-end">Hết hồ sơ</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
