import { useCallback, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { loveTreeService } from '../../../api/index.js'
import { DEFAULT_USER_AVATAR } from '../../../data/portraitPhotos.js'
import { getPartnerLocation } from '../../../utils/nearbyMeetup.js'
import AppShell from '../../../components/User/AppShell/AppShell.jsx'
import LoveTreeScene, {
  LOVE_TREE_STAGE_LABELS,
  getDisplayStage,
  isRadiantComplete,
  MAX_LOVE_LEVEL,
} from '../../../components/User/LoveTreeScene/LoveTreeScene.jsx'
import AsyncContent from '../../../components/User/AsyncContent/AsyncContent.jsx'
import PageHeader from '../../../components/User/PageHeader/PageHeader.jsx'
import { useAsync } from '../../../hooks/useAsync.js'
import './LoveTree.css'

const DEFAULT_CARE_POINTS = 3

function getCarePoints(careActions, actionId) {
  const action = careActions?.find((c) => c.id === actionId)
  return action?.points ?? DEFAULT_CARE_POINTS
}

function LoveTree() {
  const [searchParams] = useSearchParams()
  const partnerId = searchParams.get('partner') ?? 'linh'
  const partner = getPartnerLocation(partnerId)

  const { data, loading, error, refetch } = useAsync(
    () => loveTreeService.getState(partnerId),
    [partnerId],
  )
  const [careBurst, setCareBurst] = useState(0)
  const [careBurstPoints, setCareBurstPoints] = useState(3)
  const [activeCare, setActiveCare] = useState(null)
  const [localLevel, setLocalLevel] = useState(null)
  const [localXp, setLocalXp] = useState(null)
  const [evolving, setEvolving] = useState(false)
  const [celebrating, setCelebrating] = useState(false)

  const level = localLevel ?? data?.level ?? 1
  const attachment = localXp ?? data?.attachmentPercent ?? 0
  const maxLevel = data?.maxLevel ?? MAX_LOVE_LEVEL
  const stage = getDisplayStage(level, attachment, evolving)
  const stageLabel = LOVE_TREE_STAGE_LABELS[stage]
  const isComplete = isRadiantComplete(level, attachment)

  const handleCare = useCallback(
    async (actionId) => {
      if (evolving || celebrating || isComplete) return

      setActiveCare(actionId)
      setCareBurstPoints(getCarePoints(data?.careActions, actionId))

      try {
        const result = await loveTreeService.care(actionId, partnerId)
        if (result?.state) {
          setLocalLevel(result.state.level)
          setLocalXp(result.state.attachmentPercent)
          setCareBurst(Date.now())
          if (result.evolved) {
            setEvolving(true)
            setTimeout(() => setEvolving(false), 700)
          }
          if (result.complete) setCelebrating(true)
        }
      } catch {
        /* mock */
      }

      setTimeout(() => setActiveCare(null), 600)
    },
    [
      data?.careActions,
      data?.attachmentPercent,
      evolving,
      celebrating,
      isComplete,
      localXp,
      level,
      maxLevel,
      partnerId,
    ],
  )

  return (
    <AppShell activeNav="love">
      <div className="love-tree-page">
        <PageHeader title="Cây Tình Yêu" backTo="/profile" />

        <AsyncContent loading={loading} error={error} onRetry={refetch}>
          {data && (
            <div className="love-tree-layout">
              <section className="love-tree-main surface-glass">
                <div className="love-tree-hero">
                  <div className="love-tree-couple">
                    <div className="love-tree-couple__avatar love-tree-couple__avatar--a">
                      <img src={DEFAULT_USER_AVATAR} alt="" />
                      <em>Bạn</em>
                    </div>
                    <div className="love-tree-couple__bond">
                      <span className="love-tree-couple__line" />
                      <span className="love-tree-couple__heart">💕</span>
                      <span className="love-tree-couple__pulse" />
                    </div>
                    <div className="love-tree-couple__avatar love-tree-couple__avatar--b">
                      <img src={partner.image ?? DEFAULT_USER_AVATAR} alt="" />
                      <em>{partner.name}</em>
                    </div>
                  </div>

                  <LoveTreeScene
                    level={level}
                    levelLabel={data.levelLabel}
                    attachmentPercent={attachment}
                    careBurst={careBurst}
                    careBurstPoints={careBurstPoints}
                    evolving={evolving}
                    celebrating={celebrating}
                  />
                </div>

                <div className="love-tree-stats">
                  <div className="love-tree-stat">
                    <strong>{level}</strong>
                    <span>Cấp / {maxLevel}</span>
                  </div>
                  <div className="love-tree-stat love-tree-stat--accent">
                    <strong>{Math.min(100, attachment)}%</strong>
                    <span>Gắn kết</span>
                  </div>
                  <div className="love-tree-stat love-tree-stat--stage">
                    <strong className="love-tree-stat__emoji">
                      {stage === 'sprout'
                        ? '🌱'
                        : stage === 'sparse'
                          ? '🌿'
                          : stage === 'seedling'
                            ? '🪴'
                            : stage === 'budding'
                              ? '🌸'
                              : stage === 'young'
                                ? '💗'
                                : stage === 'blooming'
                                  ? '🌺'
                                  : '✨'}
                    </strong>
                    <span>{stageLabel}</span>
                  </div>
                </div>

                <div className="love-tree-progress">
                  <div className="love-tree-progress__head">
                    <span>Mức độ gắn kết</span>
                    <strong>{Math.min(100, attachment)}%</strong>
                  </div>
                  <div className="love-tree-progress__bar">
                    <span
                      className="love-tree-progress__fill"
                      style={{ width: `${Math.min(100, attachment)}%` }}
                    />
                    <span className="love-tree-progress__shimmer" aria-hidden="true" />
                  </div>
                  <p>
                    {isComplete || celebrating
                      ? '🎉 Chúc mừng! Cây tình yêu đã tỏa sáng trọn vẹn'
                      : attachment >= 100
                        ? 'Đang tiến hóa sang dạng cây mới...'
                        : `Còn ${Math.max(0, 100 - attachment)}% gắn kết để tiến hóa (đủ 100% là lên dạng ngay)`}
                  </p>
                </div>

                <div className="love-tree-care">
                  <h3>Chăm sóc cùng nhau</h3>
                  <p className="love-tree-care__hint">
                    Mỗi hành động +3% hoặc +5% gắn kết. Đủ 100% sẽ tiến hóa lên dạng cây kế tiếp ngay.
                  </p>
                  <div className="love-tree-care__actions">
                    {data.careActions.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className={`love-tree-care__btn${activeCare === c.id ? ' love-tree-care__btn--active' : ''}`}
                        onClick={() => handleCare(c.id)}
                        disabled={evolving || celebrating || isComplete}
                      >
                        <span className="love-tree-care__icon">{c.icon}</span>
                        <span className="love-tree-care__label">{c.label}</span>
                        <span className="love-tree-care__pts">+{c.points ?? 3}%</span>
                        <span className="love-tree-care__ripple" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="love-tree-links">
                  <Link to={`/chat/${partnerId}`} className="love-tree-link love-tree-link--primary">
                    Trò chuyện với {partner.name} →
                  </Link>
                  <Link to="/daily-connection" className="love-tree-link">
                    Nhiệm vụ hôm nay →
                  </Link>
                  <Link to="/love-tree/level-up" className="love-tree-link">
                    Xem màn hình lên cấp →
                  </Link>
                </div>
              </section>

              <aside className="love-tree-milestones surface-glass">
                <h3>Kỷ niệm đáng nhớ</h3>
                <ul className="love-tree-timeline">
                  {data.milestones.map((m, i) => (
                    <li
                      key={m.id}
                      className={`love-tree-milestone${m.unlocked ? ' love-tree-milestone--unlocked' : ' love-tree-milestone--locked'}`}
                      style={{ animationDelay: `${i * 0.12}s` }}
                    >
                      <span className="love-tree-milestone__dot">{m.unlocked ? '🍃' : '🔒'}</span>
                      <div className="love-tree-milestone__body">
                        <strong>{m.title}</strong>
                        <span>{m.unlocked ? m.date : `Cần đạt ${m.need}`}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          )}
        </AsyncContent>
      </div>
    </AppShell>
  )
}

export default LoveTree
