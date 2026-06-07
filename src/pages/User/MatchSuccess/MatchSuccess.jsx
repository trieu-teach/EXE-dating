import { Link } from 'react-router-dom'
import AppShell from '../../../components/User/AppShell/AppShell.jsx'
import { DEFAULT_USER_AVATAR, personImage } from '../../../data/portraitPhotos.js'
import './MatchSuccess.css'

const ME_AVATAR = DEFAULT_USER_AVATAR
const MATCH_AVATAR = personImage('minh', 200)

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )
}

function MatchSuccess() {
  return (
    <AppShell activeNav="discovery" focusMode>
      <div className="match-success-page">
        <Link to="/discovery" className="match-success-close" aria-label="Đóng">
          <CloseIcon />
        </Link>

        <div className="match-success-card">
          <div className="match-success-avatars">
            <img className="match-success-avatar match-success-avatar--left" src={ME_AVATAR} alt="" />
            <span className="match-success-heart">
              <HeartIcon />
            </span>
            <img className="match-success-avatar match-success-avatar--right" src={MATCH_AVATAR} alt="" />
          </div>

          <h1>Trùng khớp rồi!</h1>
          <p className="match-success-desc">
            Bạn và <strong>Minh</strong> đã thích nhau. Gửi lời chào đầu tiên để bắt đầu cuộc trò chuyện nhé!
          </p>

          <div className="match-success-actions">
            <Link to="/chat" className="match-success-btn match-success-btn--primary">
              Nhắn tin ngay
            </Link>
            <Link to="/discovery" className="match-success-btn match-success-btn--outline">
              Tiếp tục khám phá
            </Link>
          </div>

          <div className="match-success-icebreaker">
            <p className="match-success-icebreaker__label">Gợi ý mở lời</p>
            <blockquote>
              &ldquo;Chào Minh! Cuối tuần này bạn thích đi cà phê hay dạo phố hơn?&rdquo;
            </blockquote>
            <Link to="/date-suggestions" className="match-success-icebreaker__link">
              Xem gợi ý hẹn hò →
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

export default MatchSuccess
