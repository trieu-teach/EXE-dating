import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../../context/ToastContext.jsx'
import { profileService } from '../../../api'
import ProfileInfoForm from '../../../components/User/ProfileInfoForm/ProfileInfoForm.jsx'
import ProfilePhotoManager from '../../../components/User/ProfilePhotoManager/ProfilePhotoManager.jsx'
import OnboardingShell from '../../../components/User/OnboardingShell/OnboardingShell.jsx'

export default function CreateProfile() {
  const navigate = useNavigate()
  const toast = useToast()
  const [profile, setProfile] = useState(null)
  const [step, setStep] = useState(1) // 1=info, 2=location, 3=photos
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    profileService.me()
      .then((data) => setProfile(data))
      .catch(() => navigate('/login', { replace: true }))
      .finally(() => setLoading(false))
  }, [navigate])

  const handleInfoSaved = async () => {
    const updated = await profileService.me()
    setProfile(updated)
    setStep(2)
  }

  const handleSaveLocation = async (e) => {
    e.preventDefault()
    const lat = Number(profile?.latitude)
    const lng = Number(profile?.longitude)
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat === 0 || lng === 0) {
      toast.error('Vui lòng quay lại bước Vị trí để cập nhật toạ độ trước.')
      return
    }
    setStep(3)
  }

  const handleFinish = async () => {
    setCompleting(true)
    try {
      const updated = await profileService.me()
      setProfile(updated)
      if (updated?.isProfileCompleted) {
        toast.success('Hồ sơ đã hoàn tất!')
        navigate('/onboarding/verify-face', { replace: true })
      } else {
        toast.warn('Hồ sơ chưa đủ: cần thêm ảnh chính và các trường bắt buộc.')
      }
    } finally {
      setCompleting(false)
    }
  }

  return (
    <OnboardingShell
      step="profile"
      eyebrow="Bước 3 · Hồ sơ"
      title={step === 1 ? 'Giới thiệu về bạn' : step === 2 ? 'Xác nhận vị trí' : 'Thêm ảnh của bạn'}
      subtitle={
        step === 1
          ? 'Một vài thông tin cơ bản để mọi người biết bạn là ai.'
          : step === 2
            ? 'Chúng tôi đã lưu vị trí ở bước trước. Bạn có thể tiếp tục.'
            : 'Thêm ít nhất 2 ảnh rõ mặt để tăng độ tin cậy.'
      }
      heroTitle="Hồ sơ của bạn 🪪"
      heroText="Càng chi tiết, càng dễ gây ấn tượng. Mọi thông tin đều có thể chỉnh sửa sau."
      heroEmoji="🪞"
      loading={loading}
      progress={50 + Math.round((step / 3) * 25)}
      actions={
        <>
          {step > 1 ? (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setStep(step - 1)}
              disabled={completing}
            >
              ← Quay lại
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate('/onboarding/location')}
              disabled={completing}
            >
              ← Vị trí
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => (step === 2 ? document.getElementById('cp-form-loc')?.requestSubmit() : setStep(step + 1))}
              disabled={completing}
            >
              Tiếp tục · Ảnh →
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleFinish}
              disabled={completing}
            >
              {completing ? <span className="spinner" /> : 'Hoàn tất · Xác minh khuôn mặt →'}
            </button>
          )}
        </>
      }
    >
      {step === 1 && (
        <ProfileInfoForm initial={profile} onSaved={handleInfoSaved} />
      )}

      {step === 2 && (
        <form id="cp-form-loc" onSubmit={handleSaveLocation} className="onboarding-form">
          <div className="onboarding-banner onboarding-banner-info">
            📍 Vị trí của bạn đã được lưu ở bước trước. Bạn có thể thay đổi trong Cài đặt sau.
          </div>
          <div className="onboarding-map-card">
            <div className="onboarding-map-pin" aria-hidden>📍</div>
            <div className="onboarding-map-meta">
              {profile?.latitude != null && profile?.longitude != null ? (
                <>
                  {profile?.city && <div><strong>{profile.city}</strong></div>}
                  <div>
                    {Number(profile.latitude).toFixed(5)}, {Number(profile.longitude).toFixed(5)}
                  </div>
                </>
              ) : (
                <div>Chưa có vị trí. Vui lòng quay lại bước trước.</div>
              )}
            </div>
            <div className="onboarding-map-actions">
              <button
                type="button"
                className="btn btn-soft"
                onClick={() => navigate('/onboarding/location')}
              >
                Cập nhật vị trí
              </button>
            </div>
          </div>
        </form>
      )}

      {step === 3 && (
        <div className="onboarding-form">
          <ProfilePhotoManager
            photos={profile?.photos}
            onChange={async () => {
              const updated = await profileService.me()
              setProfile(updated)
            }}
          />
        </div>
      )}
    </OnboardingShell>
  )
}
