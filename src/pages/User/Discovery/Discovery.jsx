import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { chatService, connectionRemindersService, discoveryService } from '../../../api/index.js'
import AppShell from '../../../components/User/AppShell/AppShell.jsx'
import AsyncContent from '../../../components/User/AsyncContent/AsyncContent.jsx'
import VerificationBadge from '../../../components/User/VerificationBadge/VerificationBadge.jsx'
import Toast from '../../../components/User/Toast/Toast.jsx'
import { useAsync } from '../../../hooks/useAsync.js'
import { MATCHING_STEPS } from '../../../utils/matching.js'
import { DEFAULT_USER_AVATAR } from '../../../data/portraitPhotos.js'
import { getUser } from '../../../utils/session.js'
import './Discovery.css'

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 12a8 8 0 01-8 8H7l-4 3V12a8 8 0 018-8h4a8 8 0 018 8z" />
    </svg>
  )
}

function PassIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.2 22 12 18.27 5.8 22 7 14.14l-5-4.87 7.1-1.01L12 2z" />
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

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  )
}

function MatchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4.5 9.5c0-2.5 2-4.5 4.5-4.5s4 1.5 4.5 3.5c.5-2 2.5-3.5 4.5-3.5s4.5 2 4.5 4.5c0 6-9 11-9 11s-9-5-9-11z" />
    </svg>
  )
}

function Discovery() {
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const [toast, setToast] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [profiles, setProfiles] = useState([])
  const [picks, setPicks] = useState([])
  const [matchOpen, setMatchOpen] = useState(false)
  const [matchPhase, setMatchPhase] = useState('idle')
  const [matchStep, setMatchStep] = useState(0)
  const [matchResults, setMatchResults] = useState(null)
  const [matchLoading, setMatchLoading] = useState(false)
  const [connectTarget, setConnectTarget] = useState(null)

  const user = getUser()
  const displayName = user?.name ?? user?.profile?.fullName?.split(' ')?.slice(-1)[0] ?? 'bạn'
  const meAvatar = user?.profile?.photo ?? DEFAULT_USER_AVATAR

  const { data, loading, error, refetch } = useAsync(() => discoveryService.getFeed(), [])

  const { data: reminderData } = useAsync(async () => {
    const { conversations } = await chatService.getConversations()
    return connectionRemindersService.getReminders(conversations ?? [])
  }, [])

  const connectionReminders = reminderData?.reminders ?? []

  useEffect(() => {
    if (data?.profiles) {
      setProfiles(data.profiles)
      setPicks(data.picks ?? [])
    }
  }, [data])

  const profile = profiles[index % profiles.length]

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
    if (matchPhase !== 'scanning') return undefined
    const timer = setInterval(() => {
      setMatchStep((prev) => (prev >= MATCHING_STEPS.length - 1 ? prev : prev + 1))
    }, 700)
    return () => clearInterval(timer)
  }, [matchPhase])

  function nextProfile() {
    if (profiles.length) setIndex((prev) => (prev + 1) % profiles.length)
  }

  function jumpToProfile(profileId) {
    const idx = profiles.findIndex((p) => p.id === profileId)
    if (idx >= 0) setIndex(idx)
  }

  async function runAction(fn, successMsg) {
    if (!profile || actionLoading) return
    setActionLoading(true)
    try {
      await fn(profile.id)
      showToast(successMsg, 'success')
      nextProfile()
    } catch (err) {
      showToast(err.message, 'warning')
    } finally {
      setActionLoading(false)
    }
  }

  function handlePass() {
    runAction(discoveryService.pass, `Đã bỏ qua ${profile?.name}`)
  }

  async function handleConnect(target = profile) {
    if (!target || actionLoading) return
    setActionLoading(true)
    try {
      const res = await discoveryService.connectMatch(target.id)
      if (res.matched) {
        setConnectTarget(target)
        setMatchOpen(false)
        setMatchPhase('idle')
      }
    } catch (err) {
      showToast(err.message, 'warning')
    } finally {
      setActionLoading(false)
    }
  }

  function handleSuperLike() {
    runAction(discoveryService.superLike, `Super Like gửi tới ${profile?.name}! ⭐`)
  }

  function handleIcebreaker() {
    runAction(discoveryService.sendIcebreaker, `Đã gửi lời mở đầu tới ${profile?.name}`)
  }

  async function handleStartMatching() {
    setMatchOpen(true)
    setMatchPhase('scanning')
    setMatchStep(0)
    setMatchResults(null)
    setMatchLoading(true)

    try {
      const result = await discoveryService.runMatching()
      setMatchResults(result)

      const ranked = [result.bestMatch, ...result.suggestions]
      const rankedIds = new Set(ranked.map((p) => p.id))
      const rest = profiles.filter((p) => !rankedIds.has(p.id))
      setProfiles([...ranked, ...rest])
      setPicks(
        ranked.slice(0, 3).map((p) => ({
          id: p.id,
          name: p.name,
          image: p.image,
          match: p.match,
        })),
      )
      setIndex(0)
      setMatchPhase('done')
      showToast(`Tìm thấy người phù hợp nhất: ${result.bestMatch.name}!`, 'success')
    } catch (err) {
      showToast(err.message || 'Matching thất bại', 'warning')
      setMatchOpen(false)
      setMatchPhase('idle')
    } finally {
      setMatchLoading(false)
    }
  }

  function closeMatching() {
    setMatchOpen(false)
    setMatchPhase('idle')
  }

  function goToChat() {
    if (!connectTarget) return
    navigate(`/chat/${connectTarget.id}`, {
      state: {
        newMatch: true,
        partnerName: connectTarget.name,
        partnerImage: connectTarget.image,
        matchPercent: connectTarget.match,
      },
    })
  }


  return (
    <AppShell activeNav="discovery">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div className="discovery-page">
        <div className="discovery-page__intro">
          <div>
            <h1 className="discovery-page__title">Xin chào, {displayName} 👋</h1>
            <p className="discovery-page__subtitle">
              {loading
                ? 'Đang tải gợi ý...'
                : `Hôm nay có ${profiles.length} gợi ý phù hợp với bạn`}
            </p>
          </div>
          <div className="discovery-page__intro-actions">
            <button
              type="button"
              className="discovery-page__match-btn"
              onClick={handleStartMatching}
              disabled={matchLoading}
            >
              <MatchIcon />
              <span>Bắt đầu Matching</span>
            </button>
            <Link to="/settings/discovery" className="discovery-page__filter-chip">
              Tùy chỉnh bộ lọc
            </Link>
          </div>
        </div>

        {connectionReminders.length > 0 && (
          <div className="discovery-connection-banner">
            <div className="discovery-connection-banner__text">
              <strong>💕 Nhớ đến nhau hôm nay</strong>
              <p>
                {connectionReminders[0].partnerName} và {connectionReminders.length > 1 ? `${connectionReminders.length - 1} người khác` : 'người bạn match'} đang chờ bạn — hãy nhắn tin hoặc đặt lịch hẹn gặp thật.
              </p>
            </div>
            <Link
              to={`/chat/${connectionReminders[0].conversationId}`}
              className="discovery-connection-banner__btn"
            >
              Nhắn ngay
            </Link>
          </div>
        )}

        <AsyncContent loading={loading} error={error} onRetry={refetch}>
          {profile && (
            <div className="discovery-layout">
              <section className="discovery-main-col" aria-label="Hồ sơ gợi ý">
                <article className="discovery-card" key={profile.id}>
                  <img
                    className="discovery-card__image"
                    src={profile.image}
                    alt={`${profile.name}, ${profile.age}`}
                  />
                  <div className="discovery-card__overlay" />
                  <div className="discovery-card__badge">
                    <BoltIcon />
                    <span>{profile.match}% phù hợp</span>
                  </div>
                  <div className="discovery-card__info">
                    <div className="discovery-card__name-row">
                      <h2 className="discovery-card__name">
                        {profile.name}, {profile.age}
                      </h2>
                      <VerificationBadge
                        verified={profile.identityVerified}
                        trustScore={profile.trustScore}
                        size="sm"
                      />
                    </div>
                    <p className="discovery-card__meta">
                      {profile.job} • {profile.location}
                    </p>
                    <ul className="discovery-card__tags">
                      {profile.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                  </div>
                </article>

                <div className="discovery-actions">
                  <button
                    type="button"
                    className="discovery-icebreaker"
                    onClick={handleIcebreaker}
                    disabled={actionLoading}
                  >
                    <ChatIcon />
                    <span>Gửi lời mở đầu</span>
                  </button>

                  <div className="discovery-actions__row">
                    <button
                      type="button"
                      className="discovery-action discovery-action--pass"
                      aria-label="Bỏ qua"
                      onClick={handlePass}
                      disabled={actionLoading}
                    >
                      <PassIcon />
                    </button>
                    <button
                      type="button"
                      className="discovery-action discovery-action--star"
                      aria-label="Super like"
                      onClick={handleSuperLike}
                      disabled={actionLoading}
                    >
                      <StarIcon />
                    </button>
                    <button
                      type="button"
                      className="discovery-action discovery-action--like"
                      aria-label="Thích và kết nối"
                      onClick={() => handleConnect(profile)}
                      disabled={actionLoading}
                    >
                      <HeartIcon />
                    </button>
                  </div>
                </div>
              </section>

              <aside className="discovery-side-col">
                <div className="discovery-widget discovery-widget--match">
                  <p className="discovery-widget__label">Độ tương thích</p>
                  <p className="discovery-widget__match-value">{profile.match}%</p>
                  <div className="discovery-widget__bar">
                    <span style={{ width: `${profile.match}%` }} />
                  </div>
                  <ul className="discovery-widget__reasons">
                    {(profile.reasons ?? []).map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </div>

                <div className="discovery-widget">
                  <h3 className="discovery-widget__title">Gợi ý hôm nay</h3>
                  <ul className="discovery-picks">
                    {picks.map((pick) => (
                      <li key={pick.id}>
                        <button type="button" onClick={() => jumpToProfile(pick.id)}>
                          <img src={pick.image} alt="" />
                          <div>
                            <strong>{pick.name}</strong>
                            <span>{pick.match}% phù hợp</span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="discovery-widget discovery-widget--tip">
                  <h3 className="discovery-widget__title">Mẹo nhỏ</h3>
                  <p>
                    Bấm <strong>Matching</strong> để hệ thống đề xuất người phù hợp nhất, kết nối
                    rồi nhắn tin ngay.
                  </p>
                  <Link to="/date-suggestions">Gợi ý hẹn hò →</Link>
                </div>
              </aside>
            </div>
          )}
        </AsyncContent>
      </div>

      {matchOpen && (
        <div className="discovery-match-modal" role="dialog" aria-modal="true" aria-labelledby="match-title">
          <div className="discovery-match-modal__backdrop" onClick={closeMatching} aria-hidden="true" />
          <div className="discovery-match-modal__panel">
            <button type="button" className="discovery-match-modal__close" onClick={closeMatching} aria-label="Đóng">
              ×
            </button>

            {matchPhase === 'scanning' && (
              <div className="discovery-match-scan">
                <div className="discovery-match-scan__orb" aria-hidden="true">
                  <MatchIcon />
                </div>
                <h2 id="match-title">Đang tìm người phù hợp...</h2>
                <ul className="discovery-match-scan__steps">
                  {MATCHING_STEPS.map((step, i) => (
                    <li key={step} className={i <= matchStep ? 'discovery-match-scan__step--on' : ''}>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {matchPhase === 'done' && matchResults && (
              <div className="discovery-match-results">
                <h2 id="match-title">Kết quả Matching</h2>
                <p className="discovery-match-results__criteria">
                  Dựa trên:{' '}
                  {matchResults.userCriteria.interests.length
                    ? matchResults.userCriteria.interests.join(', ')
                    : 'sở thích từ bio'}
                  {' · '}
                  {matchResults.userCriteria.location}
                  {' · '}
                  {matchResults.userCriteria.ageRange} tuổi
                  {' · '}
                  {matchResults.userCriteria.personality}
                </p>
                <p className="discovery-match-results__meta">
                  Đã quét {matchResults.totalScanned} hồ sơ
                </p>

                <article className="discovery-match-results__hero">
                  <img src={matchResults.bestMatch.image} alt="" />
                  <div>
                    <strong>
                      {matchResults.bestMatch.name}, {matchResults.bestMatch.age}
                    </strong>
                    <span className="discovery-match-results__pct">
                      {matchResults.bestMatch.match}% phù hợp — đề xuất số 1
                    </span>
                    <p>{matchResults.bestMatch.reasons[0]}</p>
                  </div>
                  <button type="button" onClick={() => handleConnect(matchResults.bestMatch)}>
                    Kết nối
                  </button>
                </article>

                {matchResults.suggestions.length > 0 && (
                  <>
                    <p className="discovery-match-results__sub">Cũng khá phù hợp</p>
                    <ul className="discovery-match-results__list">
                      {matchResults.suggestions.map((m) => (
                        <li key={m.id}>
                          <img src={m.image} alt="" />
                          <div className="discovery-match-results__body">
                            <strong>
                              {m.name}, {m.age}
                            </strong>
                            <span className="discovery-match-results__pct">{m.match}% phù hợp</span>
                            <p>{m.reasons[0]}</p>
                          </div>
                          <button type="button" onClick={() => handleConnect(m)}>
                            Kết nối
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                <button type="button" className="discovery-match-results__primary" onClick={closeMatching}>
                  Xem gợi ý ngay
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {connectTarget && (
        <div className="discovery-connect-modal" role="dialog" aria-modal="true">
          <div className="discovery-connect-modal__panel">
            <div className="discovery-connect-modal__confetti" aria-hidden="true">
              {Array.from({ length: 12 }).map((_, i) => (
                <span key={i} style={{ left: `${(i * 17) % 100}%`, animationDelay: `${i * 0.15}s` }}>
                  {i % 2 === 0 ? '💕' : '✨'}
                </span>
              ))}
            </div>

            <p className="discovery-connect-modal__label">Match thành công!</p>

            <div className="discovery-connect-modal__avatars">
              <img src={meAvatar} alt="" className="discovery-connect-modal__avatar discovery-connect-modal__avatar--me" />
              <span className="discovery-connect-modal__heart">
                <HeartIcon />
              </span>
              <img
                src={connectTarget.image}
                alt=""
                className="discovery-connect-modal__avatar discovery-connect-modal__avatar--them"
              />
            </div>

            <h2>Bạn &amp; {connectTarget.name} đã match!</h2>
            <p>
              Độ phù hợp <strong>{connectTarget.match}%</strong>. Bạn có muốn nhắn tin ngay không?
            </p>

            <div className="discovery-connect-modal__actions">
              <button type="button" className="discovery-connect-modal__yes" onClick={goToChat}>
                Có, bắt đầu trò chuyện
              </button>
              <button type="button" className="discovery-connect-modal__no" onClick={() => setConnectTarget(null)}>
                Để sau
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}

export default Discovery
