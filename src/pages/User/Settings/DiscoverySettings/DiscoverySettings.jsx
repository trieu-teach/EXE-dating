import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { preferencesService } from '../../../../api'
import { useToast } from '../../../../context/ToastContext.jsx'
import './DiscoverySettings.css'

export default function DiscoverySettings() {
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
      .then((data) => setForm((f) => ({
        ...f,
        ...(data || {}),
        minAge: data?.minAge ?? f.minAge,
        maxAge: data?.maxAge ?? f.maxAge,
        maxDistanceKm: data?.maxDistanceKm ?? f.maxDistanceKm,
        interestedInGender: data?.interestedInGender ?? f.interestedInGender,
      })))
      .catch(() => { /* defaults are fine */ })
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await preferencesService.update({
        interestedInGender: form.interestedInGender,
        minAge: Number(form.minAge),
        maxAge: Number(form.maxAge),
        maxDistanceKm: Number(form.maxDistanceKm),
      })
      toast.success('Đã cập nhật tiêu chí.')
    } catch (err) {
      toast.error(err?.message || 'Không lưu được.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loading-block"><span className="spinner" /></div>

  return (
    <div className="settings-page">
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/settings')} style={{ alignSelf: 'flex-start' }}>
        ← Cài đặt
      </button>
      <h1>Tiêu chí khám phá</h1>
      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="field">
          <label className="field-label">Đang tìm</label>
          <select
            value={form.interestedInGender}
            onChange={(e) => setForm({ ...form, interestedInGender: e.target.value })}
          >
            <option value="Everyone">Tất cả</option>
            <option value="Male">Nam</option>
            <option value="Female">Nữ</option>
          </select>
        </div>
        <div className="form-grid">
          <div className="field">
            <label className="field-label">Tuổi tối thiểu</label>
            <input
              type="number"
              min={18}
              max={99}
              value={form.minAge}
              onChange={(e) => setForm({ ...form, minAge: e.target.value })}
            />
          </div>
          <div className="field">
            <label className="field-label">Tuổi tối đa</label>
            <input
              type="number"
              min={18}
              max={99}
              value={form.maxAge}
              onChange={(e) => setForm({ ...form, maxAge: e.target.value })}
            />
          </div>
        </div>
        <div className="field">
          <label className="field-label">Khoảng cách tối đa (km)</label>
          <input
            type="number"
            min={1}
            max={500}
            value={form.maxDistanceKm}
            onChange={(e) => setForm({ ...form, maxDistanceKm: e.target.value })}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? <span className="spinner" /> : 'Lưu'}
        </button>
      </form>
    </div>
  )
}
