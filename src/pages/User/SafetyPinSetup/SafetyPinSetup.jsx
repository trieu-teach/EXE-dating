import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppShell from '../../../components/User/AppShell/AppShell.jsx'
import PageHeader from '../../../components/User/PageHeader/PageHeader.jsx'
import './SafetyPinSetup.css'

function SafetyPinSetup() {
  const navigate = useNavigate()
  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [step, setStep] = useState('enter')

  function appendDigit(d) {
    if (step === 'enter') {
      if (pin.length >= 4) return
      const next = pin + d
      setPin(next)
      if (next.length === 4) setStep('confirm')
    } else if (confirm.length < 4) {
      setConfirm((c) => c + d)
    }
  }

  function backspace() {
    if (step === 'confirm') setConfirm((c) => c.slice(0, -1))
    else setPin((p) => p.slice(0, -1))
  }

  const active = step === 'enter' ? pin : confirm

  function handleConfirm() {
    if (pin === confirm && pin.length === 4) navigate('/safety')
  }

  return (
    <AppShell activeNav="safety" focusMode>
      <div className="pin-setup-page">
        <PageHeader title="Thiết lập mã PIN" backTo="/safety" />

        <div className="pin-setup-card">
          <span className="pin-setup-card__icon">🔒</span>
          <h1>Thiết lập mã PIN an toàn</h1>
          <p>
            Mã PIN dùng để xác nhận an toàn và bảo vệ tài khoản khi có báo động.
          </p>

          <p className="pin-setup-card__hint">
            {step === 'enter' ? 'Nhập mã PIN 4 số' : 'Nhập lại mã PIN để xác nhận'}
          </p>
          <div className="pin-setup-dots">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={active.length > i ? 'pin-setup-dots__filled' : ''} />
            ))}
          </div>

          <div className="pin-setup-numpad">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((key) => (
              <button
                key={key || 'empty'}
                type="button"
                className={`pin-setup-numpad__key${key === '' ? ' pin-setup-numpad__key--empty' : ''}`}
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

          <button
            type="button"
            className="pin-setup-submit"
            disabled={confirm.length < 4}
            onClick={handleConfirm}
          >
            Xác nhận
          </button>

          <Link to="/safety-pin-forgot" className="pin-setup-forgot">
            Quên mã PIN an toàn?
          </Link>
        </div>
      </div>
    </AppShell>
  )
}

export default SafetyPinSetup
