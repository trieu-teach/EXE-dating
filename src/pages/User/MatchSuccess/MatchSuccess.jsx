import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../../context/ToastContext.jsx'
import { profileService } from '../../../api'
import { resolveImageUrl } from '../../../utils/format.js'

export default function MatchSuccess() {
  const navigate = useNavigate()
  const toast = useToast()

  const [profile, setProfile] = useState(null)

  useEffect(() => {
    profileService.me().then(setProfile).catch(() => { /* ignore */ })
  }, [])

  const handleBoost = async () => {
    try {
      await profileService.boost()
      toast.success('Đã kích hoạt boost! Hồ sơ của bạn sẽ được ưu tiên hiển thị trong 30 phút.')
    } catch (err) {
      toast.error(err?.message || 'Không boost được.')
    }
  }

  return (
    <div className="match-success">
      <h1>Hoàn tất ✨</h1>
      <p style={{ color: 'var(--color-text-soft)', maxWidth: 480, margin: '0 auto' }}>
        Hồ sơ của bạn đã sẵn sàng. Hãy khám phá và kết nối với mọi người nhé!
      </p>
      <div className="match-success-photos">
        <div className="match-success-photo" style={{ backgroundImage: profile?.photos?.[0]?.url ? `url(${resolveImageUrl(profile.photos[0].url)})` : undefined }} />
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => navigate('/discovery')}>
          💞 Vào Discovery
        </button>
        <button className="btn btn-ghost" onClick={handleBoost}>
          ⚡ Boost hồ sơ
        </button>
        <button className="btn btn-ghost" onClick={() => navigate('/account-verification')}>
          Xác minh khuôn mặt
        </button>
      </div>
    </div>
  )
}
