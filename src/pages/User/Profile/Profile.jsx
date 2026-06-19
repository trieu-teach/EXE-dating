import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { profileService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'
import { useAuth } from '../../../context/AuthContext.jsx'
import { resolveImageUrl, formatDate } from '../../../utils/format.js'
import ProfileInfoForm from '../../../components/User/ProfileInfoForm/ProfileInfoForm.jsx'
import ProfilePhotoManager from '../../../components/User/ProfilePhotoManager/ProfilePhotoManager.jsx'
import { EditIcon, PinIcon, CalendarIcon2, HeartIcon, EyeIcon, ShieldIcon, MessageIcon, CameraIcon } from '../../../components/ui/CustomIcons.jsx'
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
  const [editing, setEditing] = useState(false)

  const targetId = userId || me?.id || me?.userId

  useEffect(() => {
    if (!targetId) return
    setLoading(true)
    profileService.me()
      .then((data) => setProfile(data))
      .catch((err) => toast.error(err?.message || 'Không tải được hồ sơ.'))
      .finally(() => setLoading(false))
  }, [targetId, toast])

  if (loading) return <div className="loading-block"><span className="spinner" /></div>
  if (!profile) return <div className="empty">Không có dữ liệu hồ sơ.</div>

  const isMe = !userId || userId === me?.id || userId === me?.userId

  const photos = profile.photos || []
  const coverUrl = photos[0]?.url || profile.coverUrl
  const avatarUrl = profile.avatarUrl || photos[0]?.url

  return (
    <div className="profile-root">
      {/* Cinematic Hero */}
      <div className="profile-hero">
        <div
          className="profile-cover"
          style={coverUrl ? { backgroundImage: `url(${resolveImageUrl(coverUrl)})` } : {}}
        >
          <div className="profile-cover-gradient" />
        </div>

        {/* Avatar overlapping cover */}
        <div className="profile-avatar-wrap">
          <div
            className="profile-avatar"
            style={avatarUrl ? { backgroundImage: `url(${resolveImageUrl(avatarUrl)})` } : {}}
          />
          {isMe && (
            <button
              className="profile-avatar-edit-btn"
              onClick={() => setEditing((e) => !e)}
              title={editing ? 'Đóng chỉnh sửa' : 'Chỉnh sửa ảnh'}
            >
              <CameraIcon size={14} />
            </button>
          )}
          {profile.isVerified && (
            <div className="profile-verified">
              <ShieldIcon size={12} />
            </div>
          )}
        </div>
      </div>

      {/* Info card */}
      <div className="profile-info-card">
        <div className="profile-name-row">
          <div>
            <h1 className="profile-name">
              {profile.displayName || me?.displayName}
              {profile.age && <span className="profile-age">, {profile.age}</span>}
            </h1>
            {profile.city && (
              <div className="profile-location">
                <PinIcon size={13} />
                {profile.city}
              </div>
            )}
          </div>

          {isMe ? (
            <button
              className="profile-edit-btn"
              onClick={() => setEditing((e) => !e)}
            >
              <EditIcon size={15} />
              {editing ? 'Đóng' : 'Sửa'}
            </button>
          ) : (
            <button
              className="profile-msg-btn"
              onClick={() => navigate('/matches')}
            >
              <MessageIcon size={15} />
              Nhắn tin
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div className="profile-stat">
            <div className="profile-stat-value">{profile.matchCount ?? '—'}</div>
            <div className="profile-stat-label">Match</div>
          </div>
          <div className="profile-stat-divider" />
          <div className="profile-stat">
            <div className="profile-stat-value">{profile.profileViews ?? '—'}</div>
            <div className="profile-stat-label">Lượt xem</div>
          </div>
          <div className="profile-stat-divider" />
          <div className="profile-stat">
            <div className="profile-stat-value">
              {profile.reputationScore ?? profile.reputation ?? '—'}
            </div>
            <div className="profile-stat-label">Reputation</div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="profile-card">
            <div className="profile-card-label">Giới thiệu</div>
            <p className="profile-bio">{profile.bio}</p>
          </div>
        )}

        {/* Interest tags */}
        {profile.interests?.length > 0 && (
          <div className="profile-card">
            <div className="profile-card-label">Sở thích</div>
            <div className="profile-tags">
              {profile.interests.map((tag) => (
                <span key={tag.id || tag} className="profile-tag">
                  {tag.emoji || ''} {tag.name || tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Info rows */}
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
            <div className="profile-detail-row">
              <span className="profile-detail-label">Trạng thái</span>
              <span className={cn('profile-badge', profile.isProfileCompleted ? 'is-complete' : 'is-incomplete')}>
                {profile.isProfileCompleted ? 'Đã hoàn tất' : 'Chưa đủ'}
              </span>
            </div>
          </div>
        </div>

        {/* Edit forms */}
        {editing && isMe && (
          <motion.div
            className="profile-edit-section"
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <ProfileInfoForm
              initial={profile}
              onSaved={async () => {
                const updated = await profileService.me()
                setProfile(updated)
                updateProfile(updated)
                toast.success('Đã lưu thông tin.')
              }}
            />
            <ProfilePhotoManager
              photos={photos}
              onChange={async () => {
                const updated = await profileService.me()
                setProfile(updated)
              }}
            />
          </motion.div>
        )}
      </div>
    </div>
  )
}
