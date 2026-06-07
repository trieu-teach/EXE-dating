import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../../../../context/ThemeContext.jsx'
import {
  isVerificationRequired,
  setVerificationRequired,
  TRUST_SCORE_DELTA,
  TRUST_SCORE_UNVERIFIED,
  TRUST_SCORE_VERIFIED,
} from '../../../../utils/identityVerification.js'
import AppShell from '../../../../components/User/AppShell/AppShell.jsx'
import PageHeader from '../../../../components/User/PageHeader/PageHeader.jsx'
import Toggle from '../../../../components/User/Toggle/Toggle.jsx'
import '../../../../styles/settings-shared.css'
import './SecuritySettings.css'

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

function SecuritySettings() {
  const { isDark, setTheme } = useTheme()
  const [verificationRequired, setVerificationRequiredState] = useState(
    () => isVerificationRequired(),
  )
  const [notifyMessage, setNotifyMessage] = useState(true)
  const [notifyMatch, setNotifyMatch] = useState(true)
  const [notifyEvent, setNotifyEvent] = useState(false)
  const [twoFa, setTwoFa] = useState(false)
  const [incognito, setIncognito] = useState(false)
  const [hideProfile, setHideProfile] = useState(false)

  return (
    <AppShell activeNav="profile">
      <div className="settings-page">
        <PageHeader title="Cài đặt Bảo mật" backTo="/profile" />

        <div className="settings-panel settings-panel--grid">
          <section className="settings-section settings-section--appearance">
            <h2 className="settings-section__title">Giao diện</h2>
            <div className="settings-appearance">
              <div className="settings-appearance__info">
                <strong>Giao diện tối</strong>
                <p>Giảm chói mắt khi dùng ban đêm — áp dụng toàn app.</p>
              </div>
              <Toggle
                label="Bật giao diện tối"
                checked={isDark}
                onChange={(on) => setTheme(on ? 'dark' : 'light')}
              />
            </div>
          </section>

          <section className="settings-section">
            <h2 className="settings-section__title">Thông báo</h2>
            <Toggle
              label="Thông báo tin nhắn"
              checked={notifyMessage}
              onChange={setNotifyMessage}
            />
            <Toggle
              label="Thông báo kết nối mới"
              checked={notifyMatch}
              onChange={setNotifyMatch}
            />
            <Toggle
              label="Thông báo sự kiện"
              checked={notifyEvent}
              onChange={setNotifyEvent}
            />
          </section>

          <section className="settings-section">
            <h2 className="settings-section__title">Bảo mật tài khoản</h2>
            <Toggle label="Xác thực hai yếu tố (2FA)" checked={twoFa} onChange={setTwoFa} />
            <Link to="/settings/change-password" className="settings-row-link">
              Đổi mật khẩu
              <ChevronIcon />
            </Link>
            <Link to="/settings/devices" className="settings-row-link">
              Quản lý thiết bị đăng nhập
              <ChevronIcon />
            </Link>
          </section>

          <section className="settings-section settings-section--span">
            <h2 className="settings-section__title">Xác minh danh tính</h2>
            <div className="settings-appearance">
              <div className="settings-appearance__info">
                <strong>Chế độ xác minh</strong>
                <p>
                  Bắt buộc: phải chụp webcam trước khi khám phá. Tùy chọn: có thể bỏ qua — uy tín{' '}
                  {TRUST_SCORE_UNVERIFIED} thay vì {TRUST_SCORE_VERIFIED} (+{TRUST_SCORE_DELTA}).
                </p>
              </div>
              <Toggle
                label="Xác minh danh tính bắt buộc"
                checked={verificationRequired}
                onChange={(on) => {
                  setVerificationRequiredState(on)
                  setVerificationRequired(on)
                }}
              />
            </div>
          </section>

          <section className="settings-section settings-section--span">
            <h2 className="settings-section__title">Quyền riêng tư</h2>
            <Toggle label="Chế độ ẩn danh" checked={incognito} onChange={setIncognito} />
            <Toggle
              label="Tạm ẩn hồ sơ"
              checked={hideProfile}
              onChange={setHideProfile}
            />
          </section>
        </div>
      </div>
    </AppShell>
  )
}

export default SecuritySettings
