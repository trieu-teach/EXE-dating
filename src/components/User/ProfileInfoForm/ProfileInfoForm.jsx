import { useRef } from 'react'
import { profileService } from '../../../api'

/**
 * Form thông tin hồ sơ (displayName, gender, dateOfBirth, bio, height, datingGoal).
 * Submit -> PUT /api/profile.
 */
export default function ProfileInfoForm({ initial, onSaved }) {
  const formRef = useRef(null)
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
    await profileService.update(payload)
    onSaved?.()
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <div className="field" style={{ gridColumn: '1 / -1' }}>
        <label className="field-label">Tên hiển thị</label>
        <input
          name="displayName"
          defaultValue={initial?.displayName ?? ''}
          required
          maxLength={50}
        />
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
        <input
          type="date"
          name="dateOfBirth"
          defaultValue={initial?.dateOfBirth?.slice(0, 10) ?? ''}
          required
        />
      </div>
      <div className="field">
        <label className="field-label">Chiều cao (cm)</label>
        <input
          type="number"
          name="height"
          min={120}
          max={220}
          defaultValue={initial?.height ?? ''}
        />
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
      <div style={{ gridColumn: '1 / -1' }}>
        <button type="submit" className="btn btn-primary btn-block">Lưu thông tin</button>
      </div>
    </form>
  )
}
