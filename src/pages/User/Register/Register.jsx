import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PasswordInput from '../../../components/User/PasswordInput/PasswordInput.jsx'
import Toast from '../../../components/User/Toast/Toast.jsx'

const MOCK_OTP = '123456'
import { PROFILE_FIELD_NOTES } from '../../../data/profileFields.js'
import FieldNote from '../../../components/User/FieldNote/FieldNote.jsx'
import {
  hasErrors,
  validateConfirmPassword,
  validateDisplayName,
  validateEmail,
  validatePassword,
  validateRegisterForm,
} from '../../../utils/validation.js'
import AuthThemeBar from '../../../components/User/AuthThemeBar/AuthThemeBar.jsx'
import LovePageDecor from '../../../components/User/LovePageDecor/LovePageDecor.jsx'
import '../../../styles/auth-form.css'
import './Register.css'

const FIELD_VALIDATORS = {
  name: (values) => validateDisplayName(values.name),
  email: (values) => validateEmail(values.email),
  password: (values) => validatePassword(values.password, { forRegister: true }),
  confirmPassword: (values) =>
    validateConfirmPassword(values.password, values.confirmPassword),
}

function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
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

  const values = { name, email, password, confirmPassword }

  function touchField(field) {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  function validateField(field, nextValues = values) {
    return FIELD_VALIDATORS[field]?.(nextValues) ?? ''
  }

  function handleBlur(field) {
    touchField(field)
    setErrors((prev) => ({ ...prev, [field]: validateField(field) }))
  }

  function updateField(field, value) {
    const nextValues = { ...values, [field]: value }

    if (field === 'name') setName(value)
    if (field === 'email') setEmail(value)
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

    const formErrors = validateRegisterForm(values)
    setErrors(formErrors)
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    })

    if (hasErrors(formErrors)) {
      showToast('Vui lòng kiểm tra lại thông tin nhập vào.', 'warning')
      return
    }

    showToast(`Mã OTP đã được gửi. Mã demo: ${MOCK_OTP}`, 'info')
    navigate('/verify-otp', {
      state: {
        email: email.trim().toLowerCase(),
        purpose: 'register',
        registerData: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        },
      },
    })
  }

  return (
    <div className="register-page user-page user-page--centered">
      <AuthThemeBar />
      <LovePageDecor />
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      <div className="register-card user-card">
        <header className="register-header">
          <h1>Đăng ký</h1>
          <p>Chào mừng bạn đến với SameMess</p>
        </header>

        <form className="register-form" onSubmit={handleSubmit} noValidate>
          <label
            className={`register-field auth-field${touched.name && errors.name ? ' auth-field--error' : ''}`}
          >
            <span>Tên hiển thị</span>
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => updateField('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              placeholder="Nguyễn Minh Anh"
              autoComplete="name"
              aria-invalid={touched.name && errors.name ? true : undefined}
            />
            <FieldNote>{PROFILE_FIELD_NOTES.displayName}</FieldNote>
            {touched.name && errors.name && (
              <p className="auth-field-error">{errors.name}</p>
            )}
          </label>

          <label
            className={`register-field auth-field${touched.email && errors.email ? ' auth-field--error' : ''}`}
          >
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => updateField('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="email@cua-ban.com"
              autoComplete="email"
              aria-invalid={touched.email && errors.email ? true : undefined}
            />
            <FieldNote>{PROFILE_FIELD_NOTES.email}</FieldNote>
            {touched.email && errors.email && (
              <p className="auth-field-error">{errors.email}</p>
            )}
          </label>

          <label
            className={`register-field auth-field${touched.password && errors.password ? ' auth-field--error' : ''}`}
          >
            <span>Mật khẩu</span>
            <PasswordInput
              name="password"
              value={password}
              onChange={(e) => updateField('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              autoComplete="new-password"
              classPrefix="register"
              hasError={Boolean(touched.password && errors.password)}
            />
            <FieldNote>{PROFILE_FIELD_NOTES.password}</FieldNote>
            {touched.password && errors.password && (
              <p className="auth-field-error">{errors.password}</p>
            )}
          </label>

          <label
            className={`register-field auth-field${touched.confirmPassword && errors.confirmPassword ? ' auth-field--error' : ''}`}
          >
            <span>Xác nhận mật khẩu</span>
            <PasswordInput
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              autoComplete="new-password"
              classPrefix="register"
              hasError={Boolean(touched.confirmPassword && errors.confirmPassword)}
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="auth-field-error">{errors.confirmPassword}</p>
            )}
          </label>

          <button type="submit" className="register-submit">
            Đăng ký
          </button>
        </form>

        <p className="register-footer">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
