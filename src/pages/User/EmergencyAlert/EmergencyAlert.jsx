import { Link } from 'react-router-dom'
import AppShell from '../../../components/User/AppShell/AppShell.jsx'
import PageHeader from '../../../components/User/PageHeader/PageHeader.jsx'
import './EmergencyAlert.css'

function EmergencyAlert() {
  return (
    <AppShell activeNav="safety" focusMode>
      <div className="emergency-page">
        <PageHeader title="Thông báo khẩn cấp" backTo="/safety" />

        <div className="emergency-layout">
          <article className="emergency-alert-card">
            <div className="emergency-alert-card__badge">
              <span>📡</span>
              Cảnh báo khẩn cấp
            </div>
            <p>
              <strong>Trần Minh Tuấn</strong> đang yêu cầu hỗ trợ từ buổi hẹn qua SameMess.
            </p>
            <p className="emergency-alert-card__time">Cập nhật 2 phút trước</p>
          </article>

          <article className="emergency-map-card">
            <div className="emergency-map-card__visual">
              <span className="emergency-map-card__pin">📍</span>
            </div>
            <h2>Phố đi bộ Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</h2>
            <p>Vị trí hiện tại của người cần hỗ trợ</p>
          </article>

          <div className="emergency-actions">
            <button type="button" className="emergency-btn emergency-btn--urgent">
              ⭐ Gọi cấp cứu (113/115)
            </button>
            <div className="emergency-actions__row">
              <button type="button" className="emergency-btn emergency-btn--secondary">
                📞 Gọi cho Tuấn
              </button>
              <button type="button" className="emergency-btn emergency-btn--secondary">
                🧭 Chỉ đường
              </button>
            </div>
            <Link to="/safety-checkin" className="emergency-demo-link">
              Demo: màn hình xác nhận an toàn →
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

export default EmergencyAlert
