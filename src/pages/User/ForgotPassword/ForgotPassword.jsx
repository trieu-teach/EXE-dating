import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Toast from '../../../components/User/Toast/Toast.jsx'

const MOCK_OTP = '123456'
import { hasErrors, validateEmail } from '../../../utils/validation.js'
import AuthThemeBar from '../../../components/User/AuthThemeBar/AuthThemeBar.jsx'
import LovePageDecor from '../../../components/User/LovePageDecor/LovePageDecor.jsx'
import '../../../styles/auth-form.css'
import './ForgotPassword.css'

function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
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

  function handleBlur() {
    setTouched({ email: true })
    setErrors({ email: validateEmail(email) })
  }

  function handleEmailChange(event) {
    const value = event.target.value
    setEmail(value)
    if (touched.email) {
      setErrors({ email: validateEmail(value) })
    }
  }

  function handleSubmit(event) {
    event.preventDefault()

    const formErrors = { email: validateEmail(email) }
    setErrors(formErrors)
    setTouched({ email: true })

    if (hasErrors(formErrors)) {
      showToast('Vui lòng nhập email hợp lệ.', 'warning')
      return
    }

    showToast(`Mã OTP đã được gửi. Mã demo: ${MOCK_OTP}`, 'info')
    navigate('/verify-otp', {
      state: { email: email.trim().toLowerCase(), purpose: 'reset' },
    })
  }

  return (
    <div className="forgot-page user-page user-page--centered">
      <AuthThemeBar />
      <LovePageDecor />
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      <div className="forgot-card user-card">
        <header className="forgot-header">
          <h1>Quên mật khẩu</h1>
          <p>Nhập email đã đăng ký để nhận mã OTP</p>
        </header>

        <form className="forgot-form" onSubmit={handleSubmit} noValidate>
          <label
            className={`forgot-field auth-field${touched.email && errors.email ? ' auth-field--error' : ''}`}
          >
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleBlur}
              placeholder="email@cua-ban.com"
              autoComplete="email"
              aria-invalid={touched.email && errors.email ? true : undefined}
            />
            {touched.email && errors.email && (
              <p className="auth-field-error">{errors.email}</p>
            )}
          </label>

          <button type="submit" className="forgot-submit">
            Gửi mã OTP
          </button>
        </form>

        <p className="forgot-footer">
          <Link to="/login">Quay lại đăng nhập</Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword
