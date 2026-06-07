import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { profileService } from '../../../api/index.js'
import AppShell from '../../../components/User/AppShell/AppShell.jsx'
import AsyncContent from '../../../components/User/AsyncContent/AsyncContent.jsx'
import ProfileInfoForm, {
  profileFormFromUser,
} from '../../../components/User/ProfileInfoForm/ProfileInfoForm.jsx'
import ProfilePhotoGrid from '../../../components/User/ProfilePhotoGrid/ProfilePhotoGrid.jsx'
import VerificationBadge from '../../../components/User/VerificationBadge/VerificationBadge.jsx'
import Toast from '../../../components/User/Toast/Toast.jsx'
import { SEXUAL_ORIENTATION_OPTIONS } from '../../../data/profileFields.js'
import { useAsync } from '../../../hooks/useAsync.js'
import {
  getAvatarUrl,
  getProfilePhotos,
  persistProfilePhotos,
  photosToSlotArray,
} from '../../../utils/profilePhotos.js'
import { getUser, saveUser } from '../../../utils/session.js'
import './Profile.css'

const MAX_PHOTOS = 6

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}

function orientationLabel(value) {
  return SEXUAL_ORIENTATION_OPTIONS.find((o) => o.value === value)?.label ?? ''
}

function Profile() {
  const { data, loading, error, refetch } = useAsync(() => profileService.getMe(), [])
  const [toast, setToast] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editingPhotos, setEditingPhotos] = useState(false)
  const [photoSlots, setPhotoSlots] = useState(() =>
    photosToSlotArray(getProfilePhotos(), MAX_PHOTOS),
  )
  const [avatarUrl, setAvatarUrl] = useState(() => getAvatarUrl())

  const initialForm = useMemo(
    () => (data ? profileFormFromUser(getUser(), data) : null),
    [data],
  )

  async function handleSave(form) {
    const profilePayload = {
      fullName: form.displayName,
      age: form.age,
      city: form.city,
      occupation: form.occupation,
      bio: form.bio,
      personality: form.personality,
      sexualOrientation: form.shareSexualOrientation ? form.sexualOrientation : '',
    }

    saveUser({
      name: form.displayName,
      username: form.username,
      profile: profilePayload,
    })

    try {
      await profileService.updateProfile({
        displayName: form.displayName,
        username: form.username,
        ...profilePayload,
        shareSexualOrientation: form.shareSexualOrientation,
        sexualOrientation: profilePayload.sexualOrientation,
        location: form.city,
      })
    } catch {
      /* mock */
    }

    setToast({ message: 'Đã lưu thông tin hồ sơ', type: 'success', id: Date.now() })
    setEditing(false)
    refetch()
  }

  function handlePhotosChange(slots) {
    setPhotoSlots(slots)
    const filled = slots.filter(Boolean)
    persistProfilePhotos(filled)
    setAvatarUrl(getAvatarUrl())
    refetch()
  }

  function handleSavePhotos() {
    setEditingPhotos(false)
    setToast({ message: 'Đã cập nhật ảnh hồ sơ', type: 'success', id: Date.now() })
  }

  const xhtdText =
    data?.shareSexualOrientation && data?.sexualOrientation
      ? orientationLabel(data.sexualOrientation)
      : data?.shareSexualOrientation
        ? 'Đã bật chia sẻ — chưa chọn cụ thể'
        : 'Không hiển thị'

  return (
    <AppShell activeNav="profile">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
      <AsyncContent loading={loading} error={error} onRetry={refetch}>
        {data && (
          <div className="profile-page">
            <div className="profile-stats">
              <div className="profile-stat">
                <strong>{data.stats.likes}</strong>
                <span>Lượt thích</span>
              </div>
              <div className="profile-stat">
                <strong>{data.stats.connections}</strong>
                <span>Kết nối</span>
              </div>
              <div className="profile-stat">
                <strong>{data.stats.completion}%</strong>
                <span>Hoàn thiện</span>
              </div>
              <div className="profile-stat">
                <strong>{data.photoCount}</strong>
                <span>Ảnh</span>
              </div>
              <div className="profile-stat profile-stat--trust">
                <strong>{data.trustScore ?? 42}</strong>
                <span>Uy tín</span>
              </div>
            </div>

            <div className="profile-hero">
              <div className="profile-hero__avatar">
                <img src={data.avatarUrl ?? avatarUrl} alt="" />
              </div>
              <div className="profile-hero__info">
                <div className="profile-hero__title-row">
                  <h1>{data.displayName ?? data.name}</h1>
                  <VerificationBadge
                    verified={data.identityVerified}
                    trustScore={data.trustScore}
                    showTrust
                    size="sm"
                  />
                </div>
                {data.username && (
                  <p className="profile-hero__username">@{data.username}</p>
                )}
                <p>{data.email}</p>
                <p className="profile-hero__meta">
                  {data.photoCount > 0 ? `${data.photoCount} ảnh hồ sơ` : 'Chưa tải ảnh'} •{' '}
                  {data.location}
                  {data.age ? ` • ${data.age} tuổi` : ''}
                </p>
                <div className="profile-hero__actions">
                  <Link to="/settings" className="profile-btn profile-btn--primary">
                    <SettingsIcon />
                    Cài đặt
                  </Link>
                  <button
                    type="button"
                    className="profile-btn profile-btn--outline"
                    onClick={() => setEditing((v) => !v)}
                  >
                    {editing ? 'Đóng chỉnh sửa' : 'Chỉnh sửa hồ sơ'}
                  </button>
                  <button
                    type="button"
                    className="profile-btn profile-btn--ghost"
                    onClick={() => setEditingPhotos((v) => !v)}
                  >
                    {editingPhotos ? 'Đóng ảnh' : 'Chỉnh ảnh giao diện'}
                  </button>
                  <Link to="/account-verification" className="profile-btn profile-btn--ghost">
                    Xác minh
                  </Link>
                </div>
              </div>
            </div>

            {editingPhotos && (
              <section className="profile-photos-panel surface-glass">
                <h2>Ảnh giao diện</h2>
                <p>
                  Chọn từ thư viện thiết bị, thư viện mẫu SameMess hoặc tìm trên Google. Ảnh đầu tiên
                  là ảnh đại diện.
                </p>
                <ProfilePhotoGrid
                  photos={photoSlots}
                  maxPhotos={MAX_PHOTOS}
                  onChange={handlePhotosChange}
                />
                <button
                  type="button"
                  className="profile-photos-panel__done"
                  onClick={handleSavePhotos}
                >
                  Xong
                </button>
              </section>
            )}

            {!editing ? (
              <section className="profile-summary" aria-label="Tóm tắt hồ sơ">
                <div className="profile-summary__block profile-summary__block--required">
                  <h2>Thông tin bắt buộc</h2>
                  <dl>
                    <div>
                      <dt>Tên hiển thị</dt>
                      <dd>{data.displayName ?? data.name}</dd>
                    </div>
                    <div>
                      <dt>Username</dt>
                      <dd>@{data.username ?? '—'}</dd>
                    </div>
                    <div>
                      <dt>Tuổi</dt>
                      <dd>{data.age ?? '—'}</dd>
                    </div>
                    <div>
                      <dt>Thành phố</dt>
                      <dd>{data.location ?? '—'}</dd>
                    </div>
                  </dl>
                </div>
                <div className="profile-summary__block profile-summary__block--optional">
                  <h2>Thông tin không bắt buộc</h2>
                  <dl>
                    <div>
                      <dt>Nghề nghiệp</dt>
                      <dd>{data.occupation || '—'}</dd>
                    </div>
                    <div>
                      <dt>Tính cách</dt>
                      <dd>{data.personality || '—'}</dd>
                    </div>
                    <div>
                      <dt>Giới thiệu</dt>
                      <dd>{data.bio || '—'}</dd>
                    </div>
                    <div>
                      <dt>Xu hướng tính dục</dt>
                      <dd>{xhtdText}</dd>
                    </div>
                  </dl>
                </div>
              </section>
            ) : (
              initialForm && (
                <section className="profile-edit">
                  <ProfileInfoForm
                    key={JSON.stringify(initialForm)}
                    initialValues={initialForm}
                    onSubmit={handleSave}
                    submitLabel="Lưu thông tin hồ sơ"
                  />
                </section>
              )
            )}

            <div className="profile-grid">
              <section className="profile-card profile-card--highlight">
                <h2>🎟️ Sự kiện hẹn hò</h2>
                <p>Gặp gỡ thật — workshop, tasting &amp; speed dating an toàn.</p>
                <Link to="/events" className="profile-card__link">
                  Khám phá sự kiện →
                </Link>
              </section>
              <section className="profile-card">
                <h2>✨ Premium</h2>
                <p>Match ưu tiên, xem ai thích bạn &amp; sự kiện độc quyền.</p>
                <Link to="/premium" className="profile-card__link">
                  Nâng cấp →
                </Link>
              </section>
              <section className="profile-card">
                <h2>🔍 Tìm kiếm</h2>
                <p>Khám phá người phù hợp theo sở thích và bộ lọc.</p>
                <Link to="/search" className="profile-card__link">
                  Xem kết quả →
                </Link>
              </section>
              <section className="profile-card">
                <h2>💕 Gợi ý hẹn hò</h2>
                <p>Địa điểm và hoạt động AI gợi ý cho buổi hẹn.</p>
                <Link to="/date-suggestions" className="profile-card__link">
                  Xem gợi ý →
                </Link>
              </section>
              <section className="profile-card">
                <h2>🔥 Nhiệm vụ hàng ngày</h2>
                <p>Chuỗi ngày, thử thách gắn kết và phần thưởng.</p>
                <Link to="/daily-connection" className="profile-card__link">
                  Xem nhiệm vụ →
                </Link>
              </section>
              <section className="profile-card">
                <h2>💬 Trò chuyện</h2>
                <p>Chat 1-1, gợi ý AI và daily quest trong hội thoại.</p>
                <Link to="/chat" className="profile-card__link">
                  Mở tin nhắn →
                </Link>
              </section>
              <section className="profile-card">
                <h2>🪴 Cây Tình Yêu</h2>
                <p>Chăm sóc cây cùng đối phương và mở khóa kỷ niệm.</p>
                <Link to="/love-tree" className="profile-card__link">
                  Vào vườn yêu →
                </Link>
              </section>
              <section className="profile-card">
                <h2>🛡️ An toàn</h2>
                <p>Người thân tin cậy, vùng an toàn và hẹn giờ khẩn cấp.</p>
                <Link to="/safety" className="profile-card__link">
                  Cài đặt an toàn →
                </Link>
              </section>
              <section className="profile-card">
                <h2>Khám phá</h2>
                <p>Tùy chỉnh bộ lọc, khoảng cách và sở thích khi tìm người phù hợp.</p>
                <Link to="/settings/discovery" className="profile-card__link">
                  Cài đặt khám phá →
                </Link>
              </section>
              <section className="profile-card">
                <h2>Bảo mật</h2>
                <p>Quản lý mật khẩu, thiết bị đăng nhập và quyền riêng tư.</p>
                <Link to="/settings" className="profile-card__link">
                  Cài đặt bảo mật →
                </Link>
              </section>
            </div>
          </div>
        )}
      </AsyncContent>
    </AppShell>
  )
}

export default Profile
