import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchService, settingsService } from '../../../../api'
import { useToast } from '../../../../context/ToastContext.jsx'
import { writeCachedInterestIds, readCachedInterestIds } from '../../../../utils/interestsStorage.js'

const MAX = 10

export default function Interests() {
  const navigate = useNavigate()
  const toast = useToast()
  const [all, setAll] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      searchService.filters().catch(() => ({ interests: [] })),
      settingsService.getInterests().catch(() => []),
    ]).then(([f, mine]) => {
      const list = Array.isArray(f?.interests) ? f.interests : []
      setAll(list)
      const mineIds = Array.isArray(mine) ? mine : (mine?.interestIds ?? [])
      const cached = new Set(readCachedInterestIds())
      const initial = new Set([...mineIds, ...cached])
      setSelected(initial)
    }).finally(() => setLoading(false))
  }, [])

  const toggle = (id) => {
    setSelected((cur) => {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id)
      else if (next.size < MAX) next.add(id)
      return next
    })
  }

  const handleSave = async () => {
    if (selected.size > MAX) {
      toast.error(`Chỉ được chọn tối đa ${MAX} sở thích.`)
      return
    }
    setSaving(true)
    try {
      await settingsService.updateInterests({ interestIds: Array.from(selected) })
      writeCachedInterestIds(Array.from(selected))
      toast.success('Đã lưu sở thích.')
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
      <h1>Sở thích của bạn</h1>
      <p style={{ color: 'var(--color-text-soft)' }}>
        Chọn tối đa {MAX} sở thích giúp chúng tôi gợi ý người phù hợp hơn.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {all.map((i) => {
          const active = selected.has(i.id)
          return (
            <button
              key={i.id}
              type="button"
              className={`tag ${active ? 'tag-primary' : ''}`}
              onClick={() => toggle(i.id)}
              style={{
                cursor: 'pointer',
                padding: '8px 14px',
                fontSize: 14,
                border: active ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
              }}
            >
              {i.name || i.label}
            </button>
          )
        })}
      </div>
      <div style={{ marginTop: 16 }}>
        <span style={{ fontSize: 13, color: 'var(--color-text-soft)' }}>
          Đã chọn {selected.size}/{MAX}
        </span>
      </div>
      <button
        type="button"
        className="btn btn-primary"
        style={{ marginTop: 16, alignSelf: 'flex-start' }}
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? <span className="spinner" /> : 'Lưu'}
      </button>
    </div>
  )
}
