import { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { settingsService } from '../../../../api'
import { useToast } from '../../../../context/ToastContext.jsx'
import './ChangePassword.css'

export default function ChangePassword() {
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Mật khẩu nhập lại không khớp.')
      return
    }
    setSubmitting(true)
    try {
      await settingsService.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      toast.success('Đã đổi mật khẩu. Vui lòng đăng nhập lại.')
      // Server sẽ thu hồi mọi session → đăng xuất ngay
      navigate('/login', { replace: true })
    } catch (err) {
      toast.error(err?.message || 'Không đổi được mật khẩu.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page cp-page" style={{ alignItems: 'flex-start' }}>
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/settings')} style={{ alignSelf: 'flex-start', marginBottom: 12 }}>
          ← Cài đặt
        </button>
        <h1>Đổi mật khẩu</h1>
        <p className="auth-subtitle">Sau khi đổi, bạn sẽ được đăng xuất khỏi mọi thiết bị.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label className="field-label">Mật khẩu hiện tại</label>
            <input
              type="password"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              required
              autoComplete="current-password"
            />
          </div>
          <div className="field">
            <label className="field-label">Mật khẩu mới</label>
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <div className="field">
            <label className="field-label">Nhập lại mật khẩu mới</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? <span className="spinner" /> : 'Đổi mật khẩu'}
          </button>
        </form>
      </div>
    </main>
  )
}
