import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { safetyService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'

const EMPTY_CONTACT = { name: '', phoneNumber: '', relationship: '' }

export default function EmergencyAlert() {
  const navigate = useNavigate()
  const toast = useToast()
  const [alertMessage, setAlertMessage] = useState('Tôi đang gặp nguy hiểm, vui lòng liên lạc giúp.')
  const [contacts, setContacts] = useState([EMPTY_CONTACT])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    safetyService.getEmergency()
      .then((data) => {
        if (data?.alertMessage) setAlertMessage(data.alertMessage)
        if (Array.isArray(data?.contacts) && data.contacts.length) setContacts(data.contacts)
      })
      .catch(() => { /* defaults */ })
      .finally(() => setLoading(false))
  }, [])

  const updateContact = (i, patch) => {
    setContacts((cur) => cur.map((c, idx) => idx === i ? { ...c, ...patch } : c))
  }

  const addContact = () => setContacts((cur) => [...cur, EMPTY_CONTACT])

  const removeContact = (i) => setContacts((cur) => cur.filter((_, idx) => idx !== i))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await safetyService.updateEmergency({
        alertMessage,
        contacts: contacts.filter((c) => c.name && c.phoneNumber),
      })
      toast.success('Đã lưu thông tin khẩn cấp.')
    } catch (err) {
      toast.error(err?.message || 'Không lưu được.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loading-block"><span className="spinner" /></div>

  return (
    <main className="auth-page" style={{ alignItems: 'flex-start' }}>
      <form onSubmit={handleSave} className="auth-card" style={{ maxWidth: 600 }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/safety')} style={{ alignSelf: 'flex-start', marginBottom: 12 }}>
          ← An toàn
        </button>
        <h1>Cảnh báo khẩn cấp</h1>
        <p className="auth-subtitle">Tin nhắn sẽ được gửi đến các liên hệ khi bạn bấm "Cần hỗ trợ".</p>

        <div className="auth-form">
          <div className="field">
            <label className="field-label">Tin nhắn mẫu</label>
            <textarea
              rows={3}
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
              maxLength={300}
              required
            />
          </div>

          <strong>Danh bạ khẩn cấp</strong>
          {contacts.map((c, i) => (
            <div key={i} className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8 }}>
              <input
                placeholder="Tên"
                value={c.name}
                onChange={(e) => updateContact(i, { name: e.target.value })}
              />
              <input
                placeholder="Số điện thoại"
                value={c.phoneNumber}
                onChange={(e) => updateContact(i, { phoneNumber: e.target.value })}
              />
              <input
                placeholder="Quan hệ (mẹ, bạn…)"
                value={c.relationship}
                onChange={(e) => updateContact(i, { relationship: e.target.value })}
              />
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeContact(i)}>
                ✕
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-sm" onClick={addContact}>
            + Thêm liên hệ
          </button>

          <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
            {saving ? <span className="spinner" /> : 'Lưu'}
          </button>
        </div>
      </form>
    </main>
  )
}
