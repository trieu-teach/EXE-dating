import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../../components/User/AppShell/AppShell.jsx'
import PageHeader from '../../../components/User/PageHeader/PageHeader.jsx'
import '../../../styles/flow-card.css'
import './SafetyPinForgot.css'

function SafetyPinForgot() {
  const navigate = useNavigate()
  const [channel, setChannel] = useState('email')

  return (
    <AppShell activeNav="safety" focusMode>
      <div className="flow-page">
        <div className="flow-card safety-pin-forgot">
          <PageHeader title="Quên mã PIN an toàn" backTo="/safety-pin-setup" />

          <span className="flow-card__icon">🛡️</span>
          <h1>Quên mã PIN an toàn</h1>
          <p className="flow-card__desc">
            Chọn cách nhận mã xác thực để đặt lại mã PIN an toàn của bạn.
          </p>

          <label className={`flow-option${channel === 'email' ? ' flow-option--active' : ''}`}>
            <input
              type="radio"
              name="channel"
              checked={channel === 'email'}
              onChange={() => setChannel('email')}
            />
            <div>
              <strong>Email</strong>
              <span>t*******@gmail.com</span>
            </div>
          </label>

          <label className={`flow-option${channel === 'phone' ? ' flow-option--active' : ''}`}>
            <input
              type="radio"
              name="channel"
              checked={channel === 'phone'}
              onChange={() => setChannel('phone')}
            />
            <div>
              <strong>Số điện thoại</strong>
              <span>+84 *******89</span>
            </div>
          </label>

          <button
            type="button"
            className="flow-btn-primary"
            onClick={() => navigate('/safety-pin-otp')}
          >
            Gửi mã xác thực
          </button>

          <p className="safety-pin-forgot__note">
            Mã chỉ có hiệu lực trong 10 phút. Không chia sẻ mã với bất kỳ ai.
          </p>
        </div>
      </div>
    </AppShell>
  )
}

export default SafetyPinForgot
