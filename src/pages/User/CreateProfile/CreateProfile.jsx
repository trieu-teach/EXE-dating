import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LovePageDecor from '../../../components/User/LovePageDecor/LovePageDecor.jsx'
import ProfileInfoForm from '../../../components/User/ProfileInfoForm/ProfileInfoForm.jsx'
import ProfilePhotoGrid from '../../../components/User/ProfilePhotoGrid/ProfilePhotoGrid.jsx'
import { EMPTY_PROFILE_FORM } from '../../../data/profileFields.js'
import {
  getProfilePhotos,
  persistProfilePhotos,
  photosToSlotArray,
} from '../../../utils/profilePhotos.js'
import { isVerificationRequired } from '../../../utils/identityVerification.js'
import { markOnboarded, getUser, saveUser } from '../../../utils/session.js'
import { hasErrors, validateProfileForm } from '../../../utils/validation.js'
import './CreateProfile.css'

const MAX_PHOTOS = 6

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function CreateProfile() {
  const navigate = useNavigate()
  const [photoSlots, setPhotoSlots] = useState(() =>
    photosToSlotArray(getProfilePhotos(), MAX_PHOTOS),
  )
  const [formError, setFormError] = useState('')

  const user = getUser()
  const initialForm = useMemo(
    () => ({
      ...EMPTY_PROFILE_FORM,
      displayName: user?.profile?.fullName ?? user?.name ?? '',
      username: user?.username ?? '',
      age: user?.profile?.age ?? '',
      city: user?.profile?.city ?? '',
      occupation: user?.profile?.occupation ?? '',
      bio: user?.profile?.bio ?? '',
      personality: user?.profile?.personality ?? 'Cân bằng',
      shareSexualOrientation: Boolean(user?.profile?.sexualOrientation),
      sexualOrientation: user?.profile?.sexualOrientation ?? '',
    }),
    [user],
  )

  function handleContinue(form) {
    const formErrors = validateProfileForm(form)
    if (hasErrors(formErrors)) {
      setFormError('Vui lòng kiểm tra các trường bắt buộc.')
      return
    }
    setFormError('')

    const filled = photoSlots.filter(Boolean)
    persistProfilePhotos(filled)

    saveUser({
      name: form.displayName,
      username: form.username,
      profile: {
        fullName: form.displayName,
        age: form.age,
        city: form.city,
        occupation: form.occupation,
        bio: form.bio,
        personality: form.personality,
        sexualOrientation: form.shareSexualOrientation ? form.sexualOrientation : '',
      },
      photoCount: filled.length,
    })
    navigate('/account-verification')
  }

  return (
    <div className="create-profile-page user-page">
      <LovePageDecor />
      <div className="create-profile-shell">
        <header className="create-profile-topbar">
          <button
            type="button"
            className="create-profile-back"
            onClick={() => navigate(-1)}
            aria-label="Quay lại"
          >
            <BackIcon />
          </button>
          <h1 className="create-profile-title">Tạo hồ sơ</h1>
          <span className="create-profile-topbar-spacer" aria-hidden="true" />
        </header>

        <div className="create-profile-progress">
          <div className="create-profile-progress-labels">
            <span>Thông tin cá nhân</span>
            <span>Bước 2 / 4</span>
          </div>
          <div className="create-profile-progress-track">
            <div className="create-profile-progress-fill" style={{ width: '50%' }} />
          </div>
        </div>

        <main className="create-profile-main">
          <section className="create-profile-section">
            <h2>Giới thiệu bản thân</h2>
            <p className="create-profile-desc">
              Hãy chia sẻ chút về bạn để SameMess gợi ý những người phù hợp nhất.
            </p>

            {formError && <p className="create-profile-form-error">{formError}</p>}

            <ProfileInfoForm
              initialValues={initialForm}
              onSubmit={handleContinue}
              submitLabel="Tiếp tục"
            />

            <div className="create-profile-photos">
              <h3>Ảnh giao diện / hồ sơ (tối đa {MAX_PHOTOS})</h3>
              <p className="create-profile-photo-tip create-profile-photo-tip--req">
                Chọn từ thư viện máy, thư viện mẫu hoặc tìm trên Google — ảnh đầu tiên là ảnh đại diện.
              </p>
              <ProfilePhotoGrid
                photos={photoSlots}
                maxPhotos={MAX_PHOTOS}
                onChange={setPhotoSlots}
              />
            </div>

            <div className="create-profile-actions">
              {!isVerificationRequired() && (
                <Link
                  to="/discovery"
                  className="create-profile-skip"
                  onClick={() => markOnboarded()}
                >
                  Bỏ qua xác minh (uy tín thấp hơn)
                </Link>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default CreateProfile
