import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { profileService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'
import { useAuth } from '../../../context/AuthContext.jsx'
import { resolveImageUrl, formatDate } from '../../../utils/format.js'
import ProfileInfoForm from '../../../components/User/ProfileInfoForm/ProfileInfoForm.jsx'
import ProfilePhotoManager from '../../../components/User/ProfilePhotoManager/ProfilePhotoManager.jsx'
import ProfilePreviewModal from '../../../components/User/ProfilePreviewModal/ProfilePreviewModal.jsx'
import { PinIcon, EyeIcon, ShieldIcon, MessageIcon, ChevronRightIcon, StarIcon, HeartIcon } from '../../../components/ui/CustomIcons.jsx'
import AdminBadge from '../../../components/User/AdminBadge/AdminBadge.jsx'
import AvatarFrame from '../../../components/User/AvatarFrame/AvatarFrame.jsx'
import AvatarFramePicker from '../../../components/User/AvatarFrame/AvatarFramePicker.jsx'
import { motion } from 'framer-motion'
import { cn } from '../../../lib/utils'

import './Profile.css'

export default function Profile() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { user: me, updateProfile } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [previewOpen, setPreviewOpen] = useState(false)

  const targetId = userId || me?.id || me?.userId
  const isMe = !userId || userId === me?.id || userId === me?.userId

  useEffect(() => {
    if (!targetId) return
    setLoading(true)
    const req = isMe ? profileService.me() : profileService.byId(targetId)
    req
      .then((data) => setProfile(data))
      .catch((err) => toast.error(err?.message || 'Không tải được hồ sơ.'))
      .finally(() => setLoading(false))
  }, [targetId, isMe, toast])

  if (loading) return <div className="loading-block"><span className="spinner" /></div>
  if (!profile) return <div className="empty">Không có dữ liệu hồ sơ.</div>

  const photos = profile.photos || []
  const avatarUrl = profile.avatarUrl || photos[0]?.url
  const displayName = profile.displayName || me?.displayName || 'Người dùng'

  return (
    <div className="profile-root">
      {isMe && (
        <div className="profile-topbar">
          <button type="button" className="profile-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>
      )}

      <span className="profile-bg-heart profile-bg-heart-1" aria-hidden="true"><HeartIcon size={40} /></span>
      <span className="profile-bg-heart profile-bg-heart-2" aria-hidden="true"><HeartIcon size={22} /></span>

      {/* Info card */}
      <div className="profile-info-card">
        {/* Header: avatar + name + action */}
        <div className="profile-header">
          <AvatarFrame frame={profile.avatarFrame} size="lg">
            <div
              className="profile-avatar"
              style={avatarUrl ? { backgroundImage: `url(${resolveImageUrl(avatarUrl)})` } : undefined}
            >
              {!avatarUrl && (
                <span className="profile-avatar-fallback">{displayName.charAt(0).toUpperCase()}</span>
              )}
              {profile.isVerified && (
                <div className="profile-verified"><ShieldIcon size={11} /></div>
              )}
            </div>
          </AvatarFrame>

          <div className="profile-header-info">
            <div className="profile-name-row">
              <h1 className="profile-name">
                {displayName}
                {profile.age && <span className="profile-age">, {profile.age}</span>}
                {profile.isAdmin && <AdminBadge />}
              </h1>
              {isMe && (
                <button type="button" className="profile-edit-btn" onClick={() => setPreviewOpen(true)} title="Xem trước hồ sơ">
                  <EyeIcon size={15} />
                  Xem trước
                </button>
              )}
            </div>
            {profile.city && (
              <div className="profile-location">
                <PinIcon size={13} />
                {profile.city}
              </div>
            )}
          </div>

          {!isMe && (
            <button className="profile-msg-btn" onClick={() => navigate('/matches')}>
              <MessageIcon size={15} />
              Nhắn tin
            </button>
          )}
        </div>

        {/* ── Người khác: chỉ xem ── */}
        {!isMe && (
          <>
            {profile.bio && (
              <div className="profile-card">
                <div className="profile-card-label">Giới thiệu</div>
                <p className="profile-bio">{profile.bio}</p>
              </div>
            )}
            <div className="profile-card">
              <div className="profile-card-label">Chi tiết</div>
              <div className="profile-details">
                {profile.gender && (
                  <div className="profile-detail-row">
                    <span className="profile-detail-label">Giới tính</span>
                    <span className="profile-detail-value">
                      {profile.gender === 'Male' ? 'Nam' : profile.gender === 'Female' ? 'Nữ' : profile.gender}
                    </span>
                  </div>
                )}
                {profile.dateOfBirth && (
                  <div className="profile-detail-row">
                    <span className="profile-detail-label">Ngày sinh</span>
                    <span className="profile-detail-value">{formatDate(profile.dateOfBirth)}</span>
                  </div>
                )}
                {profile.height && (
                  <div className="profile-detail-row">
                    <span className="profile-detail-label">Chiều cao</span>
                    <span className="profile-detail-value">{profile.height} cm</span>
                  </div>
                )}
                {profile.datingGoal && (
                  <div className="profile-detail-row">
                    <span className="profile-detail-label">Mục đích</span>
                    <span className="profile-detail-value">{profile.datingGoal}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── Chính chủ: luôn ở chế độ chỉnh sửa (Bumble) ── */}
        {isMe && (
          <motion.div
            className="profile-edit-section"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {/* Ảnh */}
            <ProfilePhotoManager
              photos={photos}
              avatarFrame={profile.avatarFrame}
              onChange={async () => {
                const updated = await profileService.me()
                setProfile(updated)
              }}
            />

            {/* Khung avatar — chỉ Admin */}
            {profile.isAdmin && (
              <>
                <div className="profile-section-label">Khung hiệu ứng avatar</div>
                <AvatarFramePicker
                  value={profile.avatarFrame}
                  avatarUrl={avatarUrl ? resolveImageUrl(avatarUrl) : null}
                  initial={displayName.charAt(0).toUpperCase()}
                  onSelect={async (frame) => {
                    try {
                      const updated = await profileService.setAvatarFrame(frame)
                      setProfile(updated)
                      updateProfile(updated)
                      toast.success(frame ? 'Đã đổi khung avatar.' : 'Đã gỡ khung avatar.')
                    } catch (err) {
                      toast.error(err?.message || 'Đổi khung avatar thất bại.')
                    }
                  }}
                />
              </>
            )}

            {/* Xác minh + Uy tín — 2 cột */}
            <div className="profile-row-grid">
              <div>
                <div className="profile-section-label">Xác minh</div>
                <button type="button" className="profile-row" onClick={() => navigate('/account-verification')}>
                  <span className="profile-row-icon is-blue"><ShieldIcon size={17} /></span>
                  <span className="profile-row-text">
                    <strong>{profile.isVerified ? 'Tài khoản đã xác minh' : 'Xác minh tài khoản'}</strong>
                    <span>Tăng độ tin cậy và bảo vệ tài khoản</span>
                  </span>
                  {profile.isVerified
                    ? <span className="profile-verify-badge">Đã xác minh</span>
                    : <ChevronRightIcon size={16} className="profile-row-chevron" />}
                </button>
              </div>
              <div>
                <div className="profile-section-label">Uy tín</div>
                <button type="button" className="profile-row" onClick={() => navigate('/reputation')}>
                  <span className="profile-row-icon is-pink"><StarIcon size={16} /></span>
                  <span className="profile-row-text">
                    <strong>Xem điểm uy tín của tôi</strong>
                    <span>Theo dõi và cải thiện uy tín</span>
                  </span>
                  <ChevronRightIcon size={16} className="profile-row-chevron" />
                </button>
              </div>
            </div>

            {/* Thông tin */}
            <div className="profile-section-label">Thông tin của tôi</div>
            <ProfileInfoForm
              accordion
              initial={profile}
              onSaved={async () => {
                const updated = await profileService.me()
                setProfile(updated)
                updateProfile(updated)
                toast.success('Đã lưu thông tin.')
              }}
            />
          </motion.div>
        )}
      </div>

      <ProfilePreviewModal profile={profile} open={previewOpen} onClose={() => setPreviewOpen(false)} />
    </div>
  )
}
