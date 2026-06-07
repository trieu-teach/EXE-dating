import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PasswordInput from '../../../components/User/PasswordInput/PasswordInput.jsx'
import Toast from '../../../components/User/Toast/Toast.jsx'
import {
  hasErrors,
  validateEmail,
  validateLoginForm,
  validatePassword,
} from '../../../utils/validation.js'
import AuthThemeBar from '../../../components/User/AuthThemeBar/AuthThemeBar.jsx'
import LovePageDecor from '../../../components/User/LovePageDecor/LovePageDecor.jsx'
import { authService } from '../../../api/index.js'
import { getPostAuthRoute } from '../../../utils/identityVerification.js'
import { saveUser } from '../../../utils/session.js'
import { useMutation } from '../../../hooks/useMutation.js'
import '../../../styles/auth-form.css'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [toast, setToast] = useState(null)
  const { mutate: login, loading: submitting } = useMutation((payload) =>
    authService.login(payload),
  )

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

  function touchField(field) {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  function validateField(field) {
    if (field === 'email') return validateEmail(email)
    if (field === 'password') return validatePassword(password)
    return ''
  }

  function handleBlur(field) {
    touchField(field)
    setErrors((prev) => ({ ...prev, [field]: validateField(field) }))
  }

  function handleEmailChange(event) {
    const value = event.target.value
    setEmail(value)
    if (touched.email) {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }))
    }
  }

  function handlePasswordChange(event) {
    const value = event.target.value
    setPassword(value)
    if (touched.password) {
      setErrors((prev) => ({ ...prev, password: validatePassword(value) }))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const formErrors = validateLoginForm({ email, password })
    setErrors(formErrors)
    setTouched({ email: true, password: true })

    if (hasErrors(formErrors)) {
      showToast('Vui lòng kiểm tra lại thông tin nhập vào.', 'warning')
      return
    }

    try {
      const { user, token } = await login({
        email: email.trim().toLowerCase(),
        password,
      })
      saveUser({ ...user, token })
      showToast('Đăng nhập thành công!', 'success')
      setTimeout(() => {
        navigate(getPostAuthRoute({ ...user, token }))
      }, 900)
    } catch (err) {
      showToast(err.message || 'Đăng nhập thất bại.', 'warning')
    }
  }

  return (
    <div className="login-page user-page user-page--centered">
      <AuthThemeBar />
      <LovePageDecor />
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      <div className="login-card user-card">
        <header className="login-header">
          <h1>Đăng nhập</h1>
          <p>Chào mừng bạn đến với SameMess</p>
        </header>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <label
            className={`login-field auth-field${touched.email && errors.email ? ' auth-field--error' : ''}`}
          >
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={() => handleBlur('email')}
              placeholder="email@cua-ban.com"
              autoComplete="email"
              aria-invalid={touched.email && errors.email ? true : undefined}
            />
            {touched.email && errors.email && (
              <p className="auth-field-error">{errors.email}</p>
            )}
          </label>

          <label
            className={`login-field auth-field${touched.password && errors.password ? ' auth-field--error' : ''}`}
          >
            <span>Mật khẩu</span>
            <PasswordInput
              name="password"
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => handleBlur('password')}
              autoComplete="current-password"
              classPrefix="login"
              hasError={Boolean(touched.password && errors.password)}
            />
            {touched.password && errors.password && (
              <p className="auth-field-error">{errors.password}</p>
            )}
          </label>

          <p className="login-forgot-wrap">
            <Link to="/forgot-password" className="login-forgot">
              Quên mật khẩu?
            </Link>
          </p>

          <button type="submit" className="login-submit" disabled={submitting}>
            {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="login-footer">
          Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
