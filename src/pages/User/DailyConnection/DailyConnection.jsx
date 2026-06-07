import { Link } from 'react-router-dom'
import { chatService, dailyService } from '../../../api/index.js'
import AppShell from '../../../components/User/AppShell/AppShell.jsx'
import AsyncContent from '../../../components/User/AsyncContent/AsyncContent.jsx'
import PageHeader from '../../../components/User/PageHeader/PageHeader.jsx'
import { DEFAULT_USER_AVATAR } from '../../../data/portraitPhotos.js'
import { useAsync } from '../../../hooks/useAsync.js'
import './DailyConnection.css'

function DailyConnection() {
  const { data, loading, error, refetch } = useAsync(() => dailyService.getConnection(), [])

  const { data: convData } = useAsync(() => chatService.getConversations(), [])
  const primaryMatch = convData?.conversations?.[0]

  const quests = data?.quests ?? []

  return (
    <AppShell activeNav="love">
      <div className="daily-page dating-page">
        <PageHeader title="Kết nối hằng ngày" backTo="/love-tree" />

        <AsyncContent loading={loading} error={error} onRetry={refetch}>
        <div className="daily-layout">
          <section className="daily-hero dating-panel">
            <div className="daily-couple">
              <div className="daily-couple__avatar daily-couple__avatar--a">
                <img src={DEFAULT_USER_AVATAR} alt="" />
              </div>
              <span className="daily-couple__line" />
              <span className="daily-couple__heart">💕</span>
              <span className="daily-couple__line" />
              <div className="daily-couple__avatar daily-couple__avatar--b">
                {primaryMatch?.partnerImage ? (
                  <img src={primaryMatch.partnerImage} alt="" />
                ) : (
                  <span>👤</span>
                )}
              </div>
            </div>

            {primaryMatch && (
              <p className="daily-partner-note">
                Hôm nay hãy nhớ đến <strong>{primaryMatch.partnerName}</strong> — mỗi tin nhắn là
                bước gần hơn tới buổi hẹn thật.
              </p>
            )}

            <div className="daily-streak">
              <span className="daily-streak__flame">🔥</span>
              <div>
                <strong>
                  Chuỗi ngày: {data?.streakDay ?? '—'} / {data?.streakTotal ?? 7}
                </strong>
                <p>Hoàn thành nhiệm vụ hôm nay để giữ lửa yêu thương!</p>
              </div>
            </div>

            <div className="daily-reward">
              <div className="daily-reward__head">
                <span>🎁 Gói câu hỏi sâu + voucher hẹn hò</span>
                <strong>{data?.rewardProgress ?? 0}%</strong>
              </div>
              <div className="daily-reward__bar">
                <span style={{ width: `${data?.rewardProgress ?? 0}%` }} />
              </div>
              <p>Hoàn thành nhiệm vụ &quot;Nhớ nhau&quot; + &quot;Lên kế hoạch gặp mặt&quot; để mở khóa</p>
            </div>
          </section>

          <section className="daily-quests">
            <h2>Nhiệm vụ hôm nay</h2>
            <ul>
              {quests.map((q) => (
                <li key={q.id} className="daily-quest-card dating-card">
                  <span className="daily-quest-card__icon">{q.icon}</span>
                  <div>
                    {q.type === 'joint' && <span className="daily-quest-card__tag">Cùng nhau</span>}
                    <h3>{q.title}</h3>
                    <p>{q.desc}</p>
                    {q.cta && (
                      <Link
                        to={primaryMatch ? `/chat/${primaryMatch.id}` : q.cta}
                        className="daily-quest-card__link"
                      >
                        {q.id === 'meetup-plan' ? '🤝 Đặt lịch hẹn' : '💬 Nhắn tin ngay'}
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <Link
              to={primaryMatch ? `/chat/${primaryMatch.id}` : '/chat'}
              className="daily-complete-btn"
            >
              🤝 Hoàn thành cùng nhau
            </Link>
          </section>
        </div>
        </AsyncContent>
      </div>
    </AppShell>
  )
}

export default DailyConnection
