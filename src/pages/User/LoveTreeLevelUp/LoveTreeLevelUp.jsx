import { Link } from 'react-router-dom'
import AppShell from '../../../components/User/AppShell/AppShell.jsx'
import './LoveTreeLevelUp.css'

function LoveTreeLevelUp() {
  return (
    <AppShell activeNav="love" focusMode>
      <div className="level-up-page">
        <div className="level-up-card">
          <div className="level-up-card__visual">
            <span className="level-up-card__sprout">🌱</span>
            <span className="level-up-card__badge">Cấp 6</span>
          </div>

          <h1>Chúc mừng! Cây tình yêu đã lên cấp 6</h1>
          <p>Sự gắn kết của hai bạn đã giúp mầm xanh vươn cao hơn.</p>

          <div className="level-up-rewards">
            <h2>Phần thưởng của bạn</h2>
            <ul>
              <li>
                <span>🔥</span>
                <div>
                  <strong>+50 điểm lửa</strong>
                </div>
              </li>
              <li>
                <span>☀️</span>
                <div>
                  <strong>Mở khóa &quot;Gửi lời chúc sáng mai&quot;</strong>
                  <span>Tính năng mới cho cặp đôi</span>
                </div>
              </li>
            </ul>
          </div>

          <Link to="/love-tree" className="level-up-btn">
            Xem cây ngay
          </Link>
          <button type="button" className="level-up-share">
            📤 Chia sẻ với đối phương
          </button>
        </div>
      </div>
    </AppShell>
  )
}

export default LoveTreeLevelUp
