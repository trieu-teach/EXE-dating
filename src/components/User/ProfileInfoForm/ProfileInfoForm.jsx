import { useState } from 'react'
import { profileService } from '../../../api'
import { ChevronRightIcon } from '../../ui/CustomIcons.jsx'

/**
 * Form thông tin hồ sơ (displayName, gender, dateOfBirth, bio, height, datingGoal).
 * Submit -> PUT /api/profile.
 *
 * @param {boolean} accordion  Hiển thị kiểu Bumble (các mục gập/mở). Mặc định: form phẳng.
 */
export default function ProfileInfoForm({ initial, onSaved, accordion = false }) {
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState({ about: true, basics: true })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const payload = {
      displayName: form.get('displayName')?.toString().trim(),
      gender: form.get('gender')?.toString(),
      dateOfBirth: form.get('dateOfBirth')?.toString(),
      bio: form.get('bio')?.toString().trim() || null,
      height: form.get('height') ? Number(form.get('height')) : null,
      datingGoal: form.get('datingGoal')?.toString() || null,
    }
    setSaving(true)
    try {
      await profileService.update(payload)
      await onSaved?.()
    } finally {
      setSaving(false)
    }
  }

  const aboutFields = (
    <div className="field" style={{ gridColumn: '1 / -1' }}>
      <label className="field-label">Giới thiệu ngắn</label>
      <textarea
        name="bio"
        rows={3}
        maxLength={500}
        defaultValue={initial?.bio ?? ''}
        placeholder="Vài dòng về bạn…"
      />
    </div>
  )

  const basicFields = (
    <>
      <div className="field" style={{ gridColumn: '1 / -1' }}>
        <label className="field-label">Tên hiển thị</label>
        <input name="displayName" defaultValue={initial?.displayName ?? ''} required maxLength={50} />
      </div>
      <div className="field">
        <label className="field-label">Giới tính</label>
        <select name="gender" defaultValue={initial?.gender ?? ''} required>
          <option value="" disabled>Chọn</option>
          <option value="Male">Nam</option>
          <option value="Female">Nữ</option>
          <option value="Other">Khác</option>
        </select>
      </div>
      <div className="field">
        <label className="field-label">Ngày sinh</label>
        <input type="date" name="dateOfBirth" defaultValue={initial?.dateOfBirth?.slice(0, 10) ?? ''} required />
      </div>
      <div className="field">
        <label className="field-label">Chiều cao (cm)</label>
        <input type="number" name="height" min={120} max={220} defaultValue={initial?.height ?? ''} />
      </div>
      <div className="field">
        <label className="field-label">Mục đích hẹn hò</label>
        <select name="datingGoal" defaultValue={initial?.datingGoal ?? ''}>
          <option value="">Không tiết lộ</option>
          <option value="LongTerm">Mối quan hệ lâu dài</option>
          <option value="ShortTerm">Kết nối ngắn hạn</option>
          <option value="Friendship">Kết bạn</option>
          <option value="Casual">Hẹn hò thoải mái</option>
        </select>
      </div>
    </>
  )

  // ── Kiểu phẳng (CreateProfile) ──
  if (!accordion) {
    return (
      <form onSubmit={handleSubmit} className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {basicFields}
        {aboutFields}
        <div style={{ gridColumn: '1 / -1' }}>
          <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
            {saving ? <span className="spinner" /> : 'Lưu thông tin'}
          </button>
        </div>
      </form>
    )
  }

  // ── Kiểu accordion (Bumble) ──
  const toggle = (k) => setOpen((o) => ({ ...o, [k]: !o[k] }))
  const Section = ({ id, title, children }) => (
    <div className={`pinfo-acc${open[id] ? ' is-open' : ''}`}>
      <button type="button" className="pinfo-acc-head" onClick={() => toggle(id)}>
        <span>{title}</span>
        <ChevronRightIcon size={16} className="pinfo-acc-chevron" />
      </button>
      {open[id] && <div className="pinfo-acc-body">{children}</div>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="pinfo-form">
      <Section id="about" title="Giới thiệu">
        <div className="pinfo-grid">{aboutFields}</div>
      </Section>
      <Section id="basics" title="Thông tin cơ bản">
        <div className="pinfo-grid">{basicFields}</div>
      </Section>
      <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
        {saving ? <span className="spinner" /> : 'Lưu thông tin'}
      </button>
    </form>
  )
}
