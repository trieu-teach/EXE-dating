import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../../components/User/AppShell/AppShell.jsx'
import PageHeader from '../../../components/User/PageHeader/PageHeader.jsx'
import '../../../styles/flow-card.css'
import './SafetyPinOtp.css'

function SafetyPinOtp() {
  const navigate = useNavigate()
  const [otp, setOtp] = useState('')
  const [countdown, setCountdown] = useState(59)

  useEffect(() => {
    if (countdown <= 0) return undefined
    const t = setInterval(() => setCountdown((c) => c - 1), 1000)
    return () => clearInterval(t)
  }, [countdown])

  function appendDigit(d) {
    if (otp.length >= 6) return
    const next = otp + d
    setOtp(next)
    if (next.length === 6) setTimeout(() => navigate('/safety-pin-setup'), 400)
  }

  function backspace() {
    setOtp((o) => o.slice(0, -1))
  }

  return (
    <AppShell activeNav="safety" focusMode>
      <div className="flow-page">
        <div className="flow-card safety-pin-otp">
          <PageHeader title="Xác thực mã OTP" backTo="/safety-pin-forgot" />

          <span className="flow-card__icon">💌</span>
          <h1>Xác thực mã OTP</h1>
          <p className="flow-card__desc">
            Nhập mã 6 số đã gửi tới email hoặc số điện thoại của bạn.
          </p>

          <div className="safety-pin-otp__slots">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <span key={i} className={otp[i] ? 'safety-pin-otp__slot--filled' : ''}>
                {otp[i] || ''}
              </span>
            ))}
          </div>

          <button
            type="button"
            className="flow-btn-primary"
            disabled={otp.length < 6}
            onClick={() => navigate('/safety-pin-setup')}
          >
            Tiếp tục
          </button>

          <button
            type="button"
            className="safety-pin-otp__resend"
            disabled={countdown > 0}
            onClick={() => setCountdown(59)}
          >
            Gửi lại mã {countdown > 0 ? `(${String(countdown).padStart(2, '0')}:00)` : ''}
          </button>

          <div className="safety-pin-otp__numpad">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((key) => (
              <button
                key={key || 'empty'}
                type="button"
                className={key === '' ? 'safety-pin-otp__key--empty' : ''}
                onClick={() => {
                  if (key === 'del') backspace()
                  else if (key) appendDigit(key)
                }}
                disabled={key === ''}
              >
                {key === 'del' ? '⌫' : key}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}

export default SafetyPinOtp
