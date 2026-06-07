import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import OtpInput from '../../../components/User/OtpInput/OtpInput.jsx'
import Toast from '../../../components/User/Toast/Toast.jsx'
import { validateOtp } from '../../../utils/validation.js'

const MOCK_OTP = '123456'
import AuthThemeBar from '../../../components/User/AuthThemeBar/AuthThemeBar.jsx'
import LovePageDecor from '../../../components/User/LovePageDecor/LovePageDecor.jsx'
import { TRUST_SCORE_UNVERIFIED } from '../../../utils/identityVerification.js'
import { saveUser } from '../../../utils/session.js'
import '../../../styles/auth-form.css'
import './VerifyOtp.css'

const PURPOSE_CONFIG = {
  register: {
    title: 'Xác thực OTP',
    subtitle: 'Nhập mã 6 số để tiếp tục tạo hồ sơ',
    submitLabel: 'Xác nhận',
    backTo: '/register',
    backLabel: 'Quay lại đăng ký',
  },
  reset: {
    title: 'Xác thực OTP',
    subtitle: 'Nhập mã 6 số để đặt lại mật khẩu',
    submitLabel: 'Xác nhận',
    backTo: '/forgot-password',
    backLabel: 'Quay lại',
  },
}

const RESEND_COOLDOWN_SEC = 60

function VerifyOtp() {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    email = 'minhanh@gmail.com',
    purpose = 'register',
    registerData,
  } = location.state ?? {}

  const config = PURPOSE_CONFIG[purpose] ?? PURPOSE_CONFIG.register
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [touched, setTouched] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
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

  useEffect(() => {
    if (resendCooldown <= 0) return undefined

    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [resendCooldown])

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1***$3')

  function handleResend() {
    if (resendCooldown > 0) return
    showToast(`Mã OTP (demo): ${MOCK_OTP}`, 'info')
    setResendCooldown(RESEND_COOLDOWN_SEC)
  }

  function handleSubmit(event) {
    event.preventDefault()
    setTouched(true)

    const otpError = validateOtp(otp)
    setError(otpError)

    if (otpError) {
      showToast('Vui lòng nhập đúng mã OTP 6 chữ số.', 'warning')
      return
    }

    if (otp.trim() !== MOCK_OTP) {
      const message = 'Mã OTP không đúng. Vui lòng thử lại.'
      setError(message)
      showToast(message, 'error')
      return
    }

    if (purpose === 'register') {
      const data = registerData ?? {
        email,
        name: 'Nguyễn Minh Anh',
      }

      saveUser({
        email: data.email,
        name: data.name,
        onboarded: false,
        identityVerified: false,
        trustScore: TRUST_SCORE_UNVERIFIED,
      })
      showToast('Xác thực email thành công! Hãy tạo hồ sơ của bạn.', 'success')
      setTimeout(() => navigate('/create-profile'), 1200)
      return
    }

    showToast('Xác thực OTP thành công!', 'success')
    navigate('/reset-password', { state: { email } })
  }

  return (
    <div className="verify-otp-page user-page user-page--centered">
      <AuthThemeBar />
      <LovePageDecor />
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      <div className="verify-otp-card user-card">
        <header className="verify-otp-header">
          <h1>{config.title}</h1>
          <p>{config.subtitle}</p>
          <p className="verify-otp-email">{maskedEmail}</p>
          <p className="verify-otp-demo">Mã OTP demo: {MOCK_OTP}</p>
        </header>

        <form className="verify-otp-form" onSubmit={handleSubmit} noValidate>
          <div className={`verify-otp-field auth-field${touched && error ? ' auth-field--error' : ''}`}>
            <OtpInput
              value={otp}
              onChange={(value) => {
                setOtp(value)
                if (touched) setError(validateOtp(value))
              }}
              hasError={Boolean(touched && error)}
            />
            {touched && error && <p className="auth-field-error">{error}</p>}
          </div>

          <button type="submit" className="verify-otp-submit">
            {config.submitLabel}
          </button>
        </form>

        <p className="verify-otp-resend">
          Không nhận được mã?{' '}
          <button
            type="button"
            className="verify-otp-resend-btn"
            onClick={handleResend}
            disabled={resendCooldown > 0}
          >
            {resendCooldown > 0 ? `Gửi lại (${resendCooldown}s)` : 'Gửi lại mã OTP'}
          </button>
        </p>

        <p className="verify-otp-footer">
          <Link to={config.backTo}>{config.backLabel}</Link>
        </p>
      </div>
    </div>
  )
}

export default VerifyOtp
