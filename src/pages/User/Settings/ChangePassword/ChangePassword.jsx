import { useState } from 'react'
import AppShell from '../../../../components/User/AppShell/AppShell.jsx'
import PageHeader from '../../../../components/User/PageHeader/PageHeader.jsx'
import PasswordInput from '../../../../components/User/PasswordInput/PasswordInput.jsx'
import Toast from '../../../../components/User/Toast/Toast.jsx'
import FieldNote from '../../../../components/User/FieldNote/FieldNote.jsx'
import { PROFILE_FIELD_NOTES } from '../../../../data/profileFields.js'
import {
  hasErrors,
  validateConfirmPassword,
  validatePassword,
} from '../../../../utils/validation.js'
import '../../../../styles/settings-shared.css'
import './ChangePassword.css'

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 118 0v3" />
    </svg>
  )
}

function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [toast, setToast] = useState(null)

  function showToast(message, type = 'info') {
    setToast({ message, type, id: Date.now() })
  }

  function touch(field) {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  function validateAll() {
    return {
      currentPassword: validatePassword(currentPassword),
      newPassword: validatePassword(newPassword, { forRegister: true }),
      confirmPassword: validateConfirmPassword(newPassword, confirmPassword),
    }
  }

  function handleBlur(field) {
    touch(field)
    setErrors(validateAll())
  }

  function handleSubmit(event) {
    event.preventDefault()
    const formErrors = validateAll()
    setErrors(formErrors)
    setTouched({ currentPassword: true, newPassword: true, confirmPassword: true })

    if (hasErrors(formErrors)) {
      showToast('Vui lòng kiểm tra lại mật khẩu.', 'warning')
      return
    }

    showToast('Đã cập nhật mật khẩu (demo)', 'success')
  }

  return (
    <AppShell activeNav="profile">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="settings-page">
        <PageHeader title="Cài đặt bảo mật" backTo="/settings" />

        <div className="settings-panel change-password-panel">
          <h2 className="change-password-panel__title">Đổi mật khẩu</h2>

          <form onSubmit={handleSubmit} noValidate>
            <label
              className={`settings-field${touched.currentPassword && errors.currentPassword ? ' settings-field--error' : ''}`}
            >
              <span>Mật khẩu hiện tại</span>
              <PasswordInput
                name="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                onBlur={() => handleBlur('currentPassword')}
                classPrefix="settings"
                autoComplete="current-password"
              />
              {touched.currentPassword && errors.currentPassword && (
                <p className="settings-field-error">{errors.currentPassword}</p>
              )}
            </label>

            <label
              className={`settings-field${touched.newPassword && errors.newPassword ? ' settings-field--error' : ''}`}
            >
              <span>Mật khẩu mới</span>
              <PasswordInput
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onBlur={() => handleBlur('newPassword')}
                classPrefix="settings"
                autoComplete="new-password"
              />
              <FieldNote>{PROFILE_FIELD_NOTES.password}</FieldNote>
              {touched.newPassword && errors.newPassword && (
                <p className="settings-field-error">{errors.newPassword}</p>
              )}
            </label>

            <label
              className={`settings-field${touched.confirmPassword && errors.confirmPassword ? ' settings-field--error' : ''}`}
            >
              <span>Xác nhận mật khẩu mới</span>
              <PasswordInput
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                classPrefix="settings"
                autoComplete="new-password"
              />
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="settings-field-error">{errors.confirmPassword}</p>
              )}
            </label>

            <button type="submit" className="settings-btn-primary">
              <LockIcon />
              Lưu mật khẩu
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  )
}

export default ChangePassword
