import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../../components/User/AppShell/AppShell.jsx'
import './SafetyCheckin.css'

function SafetyCheckin() {
  const [seconds, setSeconds] = useState(24)
  const [pin, setPin] = useState('')

  useEffect(() => {
    if (seconds <= 0) return undefined
    const t = setInterval(() => setSeconds((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [seconds])

  function appendDigit(d) {
    if (pin.length >= 4) return
    setPin((p) => p + d)
  }

  function backspace() {
    setPin((p) => p.slice(0, -1))
  }

  return (
    <AppShell activeNav="safety" focusMode>
      <div className="checkin-page">
        <div className="checkin-card">
          <span className="checkin-card__heart">💗</span>
          <h1>Bạn vẫn ổn chứ?</h1>
          <p className="checkin-card__desc">
            Hệ thống nhận tín hiệu khẩn cấp. Xác nhận nếu đây chỉ là nhầm lẫn.
          </p>

          <div className="checkin-timer">
            <svg viewBox="0 0 120 120" className="checkin-timer__ring">
              <circle cx="60" cy="60" r="52" className="checkin-timer__bg" />
              <circle
                cx="60"
                cy="60"
                r="52"
                className="checkin-timer__progress"
                style={{ strokeDashoffset: 326 - (seconds / 30) * 326 }}
              />
            </svg>
            <div className="checkin-timer__text">
              <strong>{seconds}</strong>
              <span>giây còn lại</span>
            </div>
          </div>

          <p className="checkin-pin-label">Nhập mã PIN để hủy</p>
          <div className="checkin-pin-dots">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={pin.length > i ? 'checkin-pin-dots__filled' : ''} />
            ))}
          </div>

          <div className="checkin-numpad">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((key) => (
              <button
                key={key || 'empty'}
                type="button"
                className={`checkin-numpad__key${key === '' ? ' checkin-numpad__key--empty' : ''}`}
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

          <button type="button" className="checkin-btn checkin-btn--primary">
            ✓ Tôi ổn, hãy hủy báo động
          </button>
          <button type="button" className="checkin-btn checkin-btn--outline">
            🔐 Xác thực Face ID / Vân tay
          </button>

          <p className="checkin-footer">
            Sau khi hết giờ, vị trí và thông tin khẩn cấp sẽ gửi tới người thân.
            <Link to="/emergency-alert"> Xem thông báo khẩn cấp</Link>
          </p>
        </div>
      </div>
    </AppShell>
  )
}

export default SafetyCheckin
