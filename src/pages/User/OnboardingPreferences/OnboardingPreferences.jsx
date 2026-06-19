import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../../context/ToastContext.jsx'
import { preferencesService } from '../../../api'
import OnboardingShell from '../../../components/User/OnboardingShell/OnboardingShell.jsx'

const GENDER_OPTIONS = [
  { value: 'Female', label: 'Nữ', emoji: '👩' },
  { value: 'Male', label: 'Nam', emoji: '👨' },
  { value: 'Everyone', label: 'Tất cả', emoji: '🌈' },
]

export default function OnboardingPreferences() {
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState({
    interestedInGender: 'Everyone',
    minAge: 18,
    maxAge: 35,
    maxDistanceKm: 50,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    preferencesService.get()
      .then((data) => {
        if (data) {
          setForm((cur) => ({
            interestedInGender: data.interestedInGender ?? cur.interestedInGender,
            minAge: data.minAge ?? cur.minAge,
            maxAge: data.maxAge ?? cur.maxAge,
            maxDistanceKm: data.maxDistanceKm ?? cur.maxDistanceKm,
          }))
        }
      })
      .catch(() => { /* keep defaults */ })
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e?.preventDefault?.()
    if (Number(form.minAge) > Number(form.maxAge)) {
      toast.error('Tuổi tối thiểu phải nhỏ hơn tuổi tối đa.')
      return
    }
    if (Number(form.maxDistanceKm) < 1) {
      toast.error('Khoảng cách tối thiểu là 1 km.')
      return
    }
    setSaving(true)
    try {
      await preferencesService.update({
        interestedInGender: form.interestedInGender,
        minAge: Number(form.minAge),
        maxAge: Number(form.maxAge),
        maxDistanceKm: Number(form.maxDistanceKm),
      })
      toast.success('Đã lưu tiêu chí.')
      navigate('/onboarding/location', { replace: true })
    } catch (err) {
      toast.error(err?.message || 'Không lưu được tiêu chí.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <OnboardingShell
      step="preferences"
      eyebrow="Bước 1 · Tiêu chí"
      title="Bạn muốn match với ai?"
      subtitle="Chọn tiêu chí để chúng tôi gợi ý người phù hợp nhất với bạn."
      heroTitle="Bắt đầu hành trình 💞"
      heroText="Hãy cho SameMess biết bạn đang tìm kiếm điều gì — chỉ trong vài giây."
      heroEmoji="💘"
      loading={loading}
      actions={
        <>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate(-1)}
            disabled={saving}
          >
            ← Quay lại
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? <span className="spinner" /> : 'Tiếp tục · Vị trí →'}
          </button>
        </>
      }
    >
      <form className="onboarding-form" onSubmit={handleSubmit}>
        <div>
          <label className="field-label">Đang tìm</label>
          <div className="onboarding-choice-grid" style={{ marginTop: 8 }}>
            {GENDER_OPTIONS.map((opt) => {
              const active = form.interestedInGender === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={`onboarding-choice${active ? ' is-selected' : ''}`}
                  onClick={() => setForm({ ...form, interestedInGender: opt.value })}
                >
                  <span className="onboarding-choice-emoji" aria-hidden>{opt.emoji}</span>
                  <span className="onboarding-choice-label">{opt.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="field-label">Khoảng tuổi mong muốn</label>
          <div className="onboarding-age-row" style={{ marginTop: 8 }}>
            <div className="field">
              <input
                type="number"
                min={18}
                max={99}
                value={form.minAge}
                onChange={(e) => setForm({ ...form, minAge: e.target.value })}
                aria-label="Tuổi tối thiểu"
                required
              />
            </div>
            <div className="field">
              <input
                type="number"
                min={18}
                max={99}
                value={form.maxAge}
                onChange={(e) => setForm({ ...form, maxAge: e.target.value })}
                aria-label="Tuổi tối đa"
                required
              />
            </div>
          </div>
        </div>

        <div className="onboarding-range">
          <div className="onboarding-range-meta">
            <span>Khoảng cách tối đa</span>
            <strong>{form.maxDistanceKm} km</strong>
          </div>
          <input
            type="range"
            min={1}
            max={200}
            step={1}
            value={form.maxDistanceKm}
            onChange={(e) => setForm({ ...form, maxDistanceKm: e.target.value })}
            aria-label="Khoảng cách tối đa"
          />
          <small style={{ color: 'var(--color-text-muted)' }}>
            Bán kính tìm kiếm quanh vị trí của bạn.
          </small>
        </div>
      </form>
    </OnboardingShell>
  )
}
