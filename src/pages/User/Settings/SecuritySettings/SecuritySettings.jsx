import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../../context/AuthContext.jsx'
import { useToast } from '../../../../context/ToastContext.jsx'
import { settingsService } from '../../../../api'

export default function SecuritySettings() {
  const { logout } = useAuth()
  const toast = useToast()
  const [security, setSecurity] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    settingsService.getSecurity()
      .then(setSecurity)
      .catch((err) => toast.error(err?.message || 'Không tải được cài đặt bảo mật.'))
  }, [toast])

  const update = async (patch) => {
    setSaving(true)
    try {
      const updated = await settingsService.updateSecurity(patch)
      setSecurity(updated)
      toast.success('Đã lưu.')
    } catch (err) {
      toast.error(err?.message || 'Không lưu được.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="settings-page">
      <h1>Cài đặt bảo mật</h1>

      <section className="settings-section">
        <h2>Bảo mật đăng nhập</h2>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">Xác thực 2 yếu tố</div>
            <div className="settings-row-desc">Yêu cầu mã OTP khi đăng nhập.</div>
          </div>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={Boolean(security?.twoFactorEnabled)}
              onChange={(e) => update({ twoFactorEnabled: e.target.checked })}
              disabled={saving}
            />
          </label>
        </div>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">Cảnh báo đăng nhập</div>
            <div className="settings-row-desc">Gửi thông báo khi có đăng nhập mới.</div>
          </div>
          <input
            type="checkbox"
            checked={Boolean(security?.loginAlertsEnabled)}
            onChange={(e) => update({ loginAlertsEnabled: e.target.checked })}
            disabled={saving}
          />
        </div>
      </section>

      <section className="settings-section">
        <h2>Mật khẩu</h2>
        <Link to="/settings/change-password" className="btn btn-ghost">Đổi mật khẩu</Link>
        <p style={{ fontSize: 13, color: 'var(--color-text-soft)', marginTop: 8 }}>
          ⚠️ Đổi mật khẩu sẽ thu hồi mọi phiên đăng nhập — bạn sẽ cần đăng nhập lại.
        </p>
      </section>

      <section className="settings-section">
        <h2>Thiết bị</h2>
        <Link to="/settings/devices" className="btn btn-ghost">Xem các thiết bị đã đăng nhập</Link>
      </section>

      <section className="settings-section">
        <h2>An toàn</h2>
        <Link to="/safety" className="btn btn-ghost">Cài đặt an toàn & PIN</Link>
      </section>

      <section className="settings-section">
        <h2>Phiên đăng nhập</h2>
        <button type="button" className="btn btn-danger" onClick={logout}>
          Đăng xuất
        </button>
      </section>
    </div>
  )
}
