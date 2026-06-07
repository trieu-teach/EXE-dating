import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import PasswordInput from '../../../components/User/PasswordInput/PasswordInput.jsx'
import Toast from '../../../components/User/Toast/Toast.jsx'
import {
  hasErrors,
  validateConfirmPassword,
  validatePassword,
} from '../../../utils/validation.js'
import AuthThemeBar from '../../../components/User/AuthThemeBar/AuthThemeBar.jsx'
import LovePageDecor from '../../../components/User/LovePageDecor/LovePageDecor.jsx'
import '../../../styles/auth-form.css'
import './ResetPassword.css'

function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const { email = 'minhanh@gmail.com' } = location.state ?? {}

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [toast, setToast] = useState(null)

  function hideToast() {
    setToast(null)
  }

  function showToast(message, type = 'info') {
    setToast({ message, type, id: Date.now() })
  }

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(hideToast, 4200)
    return () => clearTimeout(timer)
  }, [toast])

  const values = { password, confirmPassword }

  function validateField(field, nextValues = values) {
    if (field === 'password') return validatePassword(nextValues.password, { forRegister: true })
    if (field === 'confirmPassword') {
      return validateConfirmPassword(nextValues.password, nextValues.confirmPassword)
    }
    return ''
  }

  function handleBlur(field) {
    setTouched((prev) => ({ ...prev, [field]: true }))
    setErrors((prev) => ({ ...prev, [field]: validateField(field) }))
  }

  function updateField(field, value) {
    const nextValues = { ...values, [field]: value }
    if (field === 'password') setPassword(value)
    if (field === 'confirmPassword') setConfirmPassword(value)

    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, nextValues) }))
    }

    if (field === 'password' && touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateField('confirmPassword', nextValues),
      }))
    }
  }

  function handleSubmit(event) {
    event.preventDefault()

    const formErrors = {
      password: validatePassword(password, { forRegister: true }),
      confirmPassword: validateConfirmPassword(password, confirmPassword),
    }

    setErrors(formErrors)
    setTouched({ password: true, confirmPassword: true })

    if (hasErrors(formErrors)) {
      showToast('Vui lòng kiểm tra lại mật khẩu mới.', 'warning')
      return
    }

    showToast('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.', 'success')
    setTimeout(() => navigate('/login'), 1600)
  }

  return (
    <div className="reset-page user-page user-page--centered">
      <AuthThemeBar />
      <LovePageDecor />
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      <div className="reset-card user-card">
        <header className="reset-header">
          <h1>Đặt lại mật khẩu</h1>
          <p>Nhập mật khẩu mới cho tài khoản của bạn</p>
        </header>

        <form className="reset-form" onSubmit={handleSubmit} noValidate>
          <label
            className={`reset-field auth-field${touched.password && errors.password ? ' auth-field--error' : ''}`}
          >
            <span>Mật khẩu mới</span>
            <PasswordInput
              name="password"
              value={password}
              onChange={(e) => updateField('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              autoComplete="new-password"
              classPrefix="reset"
              hasError={Boolean(touched.password && errors.password)}
            />
            {touched.password && errors.password && (
              <p className="auth-field-error">{errors.password}</p>
            )}
          </label>

          <label
            className={`reset-field auth-field${touched.confirmPassword && errors.confirmPassword ? ' auth-field--error' : ''}`}
          >
            <span>Xác nhận mật khẩu mới</span>
            <PasswordInput
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              autoComplete="new-password"
              classPrefix="reset"
              hasError={Boolean(touched.confirmPassword && errors.confirmPassword)}
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="auth-field-error">{errors.confirmPassword}</p>
            )}
          </label>

          <button type="submit" className="reset-submit">
            Đặt lại mật khẩu
          </button>
        </form>

        <p className="reset-footer">
          <Link to="/login">Quay lại đăng nhập</Link>
        </p>
      </div>
    </div>
  )
}

export default ResetPassword
