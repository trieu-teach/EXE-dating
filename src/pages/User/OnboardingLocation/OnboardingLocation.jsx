import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../../context/ToastContext.jsx'
import { profileService } from '../../../api'
import { getCurrentPosition } from '../../../utils/imageFile.js'
import OnboardingShell from '../../../components/User/OnboardingShell/OnboardingShell.jsx'

const FALLBACK = { latitude: '', longitude: '', label: '' }

export default function OnboardingLocation() {
  const navigate = useNavigate()
  const toast = useToast()
  const [coord, setCoord] = useState(FALLBACK)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [accuracy, setAccuracy] = useState(null)

  useEffect(() => {
    profileService.me()
      .then((profile) => {
        if (profile?.latitude != null && profile?.longitude != null) {
          setCoord({
            latitude: profile.latitude,
            longitude: profile.longitude,
            label: profile.city || profile.region || '',
          })
        }
      })
      .catch(() => { /* keep empty */ })
      .finally(() => setLoading(false))
  }, [])

  const handleDetect = async () => {
    setDetecting(true)
    try {
      const pos = await getCurrentPosition()
      setCoord({
        latitude: pos.latitude,
        longitude: pos.longitude,
        label: pos.label || '',
      })
      setAccuracy(pos.accuracy ?? null)
      toast.success('Đã lấy vị trí hiện tại.')
    } catch (err) {
      toast.error(err?.message || 'Không lấy được vị trí. Hãy thử nhập toạ độ thủ công.')
    } finally {
      setDetecting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const lat = Number(coord.latitude)
    const lng = Number(coord.longitude)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      toast.error('Vui lòng nhập toạ độ hợp lệ.')
      return
    }
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      toast.error('Toạ độ không hợp lệ (vĩ độ -90..90, kinh độ -180..180).')
      return
    }
    setSaving(true)
    try {
      await profileService.updateLocation({ latitude: lat, longitude: lng })
      toast.success('Đã lưu vị trí.')
      navigate('/create-profile', { replace: true })
    } catch (err) {
      toast.error(err?.message || 'Không lưu được vị trí.')
    } finally {
      setSaving(false)
    }
  }

  const hasCoord = coord.latitude !== '' && coord.longitude !== ''

  return (
    <OnboardingShell
      step="location"
      eyebrow="Bước 2 · Vị trí"
      title="Cho SameMess biết bạn ở đâu"
      subtitle="Vị trí giúp gợi ý người ở gần bạn. Chỉ mình bạn nhìn thấy toạ độ chính xác."
      heroTitle="Khoảng cách tạo nên kết nối 📍"
      heroText="Bật GPS để chúng tôi tìm người phù hợp quanh bạn. Dữ liệu chỉ dùng để gợi ý, không chia sẻ công khai."
      heroEmoji="🌍"
      loading={loading}
      actions={
        <>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate('/onboarding/preferences')}
            disabled={saving}
          >
            ← Quay lại
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={saving || !hasCoord}
          >
            {saving ? <span className="spinner" /> : 'Tiếp tục · Hồ sơ →'}
          </button>
        </>
      }
    >
      <form className="onboarding-form" onSubmit={handleSubmit}>
        <div className="onboarding-map-card">
          <div className="onboarding-map-pin" aria-hidden>📍</div>
          {hasCoord ? (
            <div className="onboarding-map-meta">
              {coord.label && <div><strong>{coord.label}</strong></div>}
              <div>
                {Number(coord.latitude).toFixed(5)}, {Number(coord.longitude).toFixed(5)}
                {accuracy != null && ` · ±${Math.round(accuracy)} m`}
              </div>
            </div>
          ) : (
            <div className="onboarding-map-meta">
              Chưa có vị trí — bấm <strong>Dùng vị trí hiện tại</strong> hoặc nhập tay bên dưới.
            </div>
          )}
          <div className="onboarding-map-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleDetect}
              disabled={detecting}
            >
              {detecting ? <span className="spinner" /> : '🎯 Dùng vị trí hiện tại'}
            </button>
            {hasCoord && (
              <button
                type="button"
                className="btn btn-soft"
                onClick={() => setCoord(FALLBACK)}
                disabled={saving || detecting}
              >
                Xoá
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="field-label">Hoặc nhập toạ độ thủ công</label>
          <div className="onboarding-coord-grid" style={{ marginTop: 8 }}>
            <div className="field">
              <input
                type="number"
                step="any"
                placeholder="Vĩ độ (lat)"
                value={coord.latitude}
                onChange={(e) => setCoord({ ...coord, latitude: e.target.value })}
                aria-label="Vĩ độ"
              />
            </div>
            <div className="field">
              <input
                type="number"
                step="any"
                placeholder="Kinh độ (lng)"
                value={coord.longitude}
                onChange={(e) => setCoord({ ...coord, longitude: e.target.value })}
                aria-label="Kinh độ"
              />
            </div>
          </div>
        </div>

        <div className="onboarding-banner onboarding-banner-info">
          💡 Mẹo: bật GPS trong cài đặt trình duyệt để lấy vị trí chính xác nhất.
        </div>
      </form>
    </OnboardingShell>
  )
}
