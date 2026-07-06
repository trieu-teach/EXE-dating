import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { useToast } from '../../../context/ToastContext.jsx'
import { useAuth } from '../../../context/AuthContext.jsx'
import { useInventory } from '../../../context/InventoryContext.jsx'
import { matchesService, chatService } from '../../../api'
import { usePlant } from '../../../hooks/usePlant.js'
import {
  LEVEL_MILESTONES,
  MATERIALS,
  MATERIAL_BONUS,
  MATERIAL_META,
} from '../../../constants/gamification.js'
import { resolveImageUrl } from '../../../utils/format.js'
import MeetupSection from '../../../components/User/MeetupSection/MeetupSection.jsx'
import { HeartBrokenIcon, LeafSeedlingIcon, Tree2Icon, HeartIcon } from '../../../components/ui/CustomIcons.jsx'
import './LoveTree.css'

// ── Tree image mapping ───────────────────────────────────────────────────────
// Ảnh đặt tên theo SỐ: 1.png … 7.png. Level = số ảnh (1→7), tối đa là 7.
const TREE_MAX_LEVEL = 7
const treeImgByNumber = (n) => `/assets/love-tree/${Math.min(TREE_MAX_LEVEL, Math.max(1, n))}.png`

function getTreeImage(level) {
  return treeImgByNumber(level)
}

const TREE_STAGE_NAMES = {
  1: 'Mầm xanh',
  2: 'Cây non',
  3: 'Cây nhỏ',
  4: 'Cây trưởng thành',
  5: 'Cây sai lá',
  6: 'Cây đơm hoa',
  7: 'Cây tình yêu vĩnh cửu',
}
function treeStageName(level) {
  return TREE_STAGE_NAMES[Math.min(TREE_MAX_LEVEL, Math.max(1, level))]
}

// Đọc field match thống nhất (DTO mới: matchId/displayName/avatarUrl/matchedAt)
const mId = (m) => m?.matchId ?? m?.id
const mName = (m) => m?.displayName ?? m?.otherDisplayName ?? 'Người dùng'
const mAvatar = (m) => m?.avatarUrl ?? m?.otherAvatarUrl

// ── Debug helper ─────────────────────────────────────────────────────────────
function DebugPanel({ plant, lastResult, inventory, loading, watering, error }) {
  const [open, setOpen] = useState(false)
  const snapshot = { plant, lastResult, inventory, flags: { loading, watering, error: error || null } }
  return (
    <div className="love-tree-debug">
      <button type="button" className="love-tree-debug-toggle" onClick={() => setOpen((v) => !v)}>
        🐞 {open ? 'Ẩn' : 'Hiện'} debug
      </button>
      {open && <pre className="love-tree-debug-pre">{JSON.stringify(snapshot, null, 2)}</pre>}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function LoveTree() {
  const navigate = useNavigate()
  const toast = useToast()
  const { matchId: paramMatchId } = useParams()
  const [search] = useSearchParams()
  const [matches, setMatches] = useState([])
  const [loadingMatches, setLoadingMatches] = useState(true)
  const [activeMatchId, setActiveMatchId] = useState(paramMatchId || search.get('matchId') || null)
  const [conversationId, setConversationId] = useState(null)
  const [milestone, setMilestone] = useState(null)
  const [emojiAnim, setEmojiAnim] = useState('')
  const [tab, setTab] = useState('tree')
  const [showcase, setShowcase] = useState(false)

  const { user } = useAuth()
  const { inventory, refresh: refreshInventory } = useInventory()
  const { plant, loading, watering, water, lastResult } = usePlant(activeMatchId)

  // Tải lại kho nguyên liệu mỗi khi mở trang Cây. Provider chỉ nạp 1 lần lúc
  // khởi động app (có thể chạy trước khi token sẵn sàng → kho = 0), nên nếu
  // không refresh ở đây thì dock tưới cây sẽ hiện 0 cho tới khi đổi tab.
  useEffect(() => {
    refreshInventory('visible')
  }, [refreshInventory])

  // Load matches once.
  useEffect(() => {
    let cancelled = false
    matchesService.list()
      .then((list) => {
        if (cancelled) return
        const arr = Array.isArray(list) ? list : (list?.items ?? [])
        setMatches(arr)
        setActiveMatchId((cur) => cur || mId(arr[0]) || null)
      })
      .catch((err) => { if (!cancelled) toast.error(err?.message || 'Không tải được danh sách match.') })
      .finally(() => { if (!cancelled) setLoadingMatches(false) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Resolve conversationId for the active match.
  useEffect(() => {
    if (!activeMatchId) return
    let cancelled = false
    chatService.byMatch(activeMatchId)
      .then((conv) => { if (!cancelled) setConversationId(conv.id || conv.conversationId) })
      .catch(() => { if (!cancelled) setConversationId(null) })
    return () => { cancelled = true }
  }, [activeMatchId])

  const active = useMemo(() => matches.find((m) => mId(m) === activeMatchId) || null, [matches, activeMatchId])

  const handleWater = async (material) => {
    if (!activeMatchId || watering) return
    if (loading || !plant) {
      toast.info('Đang tải cây, thử lại trong giây lát…')
      return
    }
    const stockBefore = Number(inventory?.[material] ?? 0)
    if (stockBefore <= 0) {
      toast.warn(`Bạn hết ${MATERIAL_META[material].label.toLowerCase()}, làm nhiệm vụ để nhận thêm.`)
      return
    }
    const growthBefore = Number(plant?.growthPercent ?? 0)
    const levelBefore = Number(plant?.level ?? 1)
    try {
      const res = await water(material)
      setEmojiAnim('bounce')
      setTimeout(() => setEmojiAnim(''), 800)
      const growthAfter = Number(res?.growthPercent ?? plant?.growthPercent ?? 0)
      const levelAfter = Number(res?.level ?? plant?.level ?? 1)
      const added = growthAfter - growthBefore
      if (res?.leveledUp || levelAfter > levelBefore) {
        setTimeout(() => {
          setEmojiAnim('level-up')
          setTimeout(() => setEmojiAnim(''), 1300)
        }, 500)
        toast.success(`Lên cấp ${levelAfter}! 🌳`)
      } else if (added > 0) {
        toast.success(`+${added}% tăng trưởng! ${MATERIAL_META[material].emoji}`)
      } else if (res?.message) {
        toast.info(res.message)
      }
      if (res?.bonusApplied) toast.success('Cả hai cùng tưới hôm nay — nhận x2! 💕')
      if (res?.milestoneReached) setMilestone({ level: res.level, message: res.message })
    } catch (err) {
      const msg = err?.message || 'Không tưới được cây.'
      if (err?.status === 400) toast.warn('Bạn hết nguyên liệu, làm nhiệm vụ để nhận thêm.')
      else if (err?.status === 401) toast.error('Phiên đăng nhập hết hạn — vui lòng đăng nhập lại.')
      else if (err?.status === 403) toast.error('Bạn không thuộc match này.')
      else toast.error(msg)
    }
  }

  if (loadingMatches) return <div className="loading-block"><span className="spinner" /></div>

  if (matches.length === 0) {
    return (
      <div className="love-tree-empty">
        <div className="love-tree-empty-icon"><HeartBrokenIcon size={40} /></div>
        <p>Chưa có match nào.<br />Kết nối trên Discovery để bắt đầu nhé!</p>
      </div>
    )
  }

  const rawLevel = Number(plant?.level ?? 1)
  const level = Math.min(TREE_MAX_LEVEL, rawLevel)         // hiển thị tối đa Cấp 7
  const isMaxed = rawLevel >= TREE_MAX_LEVEL
  const perLevel = Math.max(1, Number(plant?.percentPerLevel ?? 100))
  const growthPct = isMaxed ? perLevel : Math.max(0, Math.min(100, Number(plant?.growthPercent ?? 0)))
  const streak = Number(plant?.streakCount ?? 0)
  const bothWatered = Boolean(plant?.bothWateredToday)
  const myAvatar = resolveImageUrl(user?.avatarUrl)
  const myInitial = (user?.displayName || 'B').charAt(0).toUpperCase()
  const partnerAvatar = resolveImageUrl(mAvatar(active))
  const partnerName = mName(active)
  const treeImg = getTreeImage(level)
  const animCls = emojiAnim ? `is-${emojiAnim}` : ''

  return (
    <div className="lt2-root">
      <header className="lt-hdr ph-header">
        <span className="lt-hdr-glow ph-glow ph-glow-fill" aria-hidden />
        <h1 className="ph-title lt-hdr-title">
          <span className="ph-script lt-hdr-script">Cây</span>{' '}
          <span className="ph-accent lt-hdr-accent">tình yêu <LeafSeedlingIcon size={26} className="ph-icon ph-beat lt-hdr-icon" /></span>
        </h1>
        <p className="ph-subtitle lt-hdr-subtitle">Mỗi ngày chăm sóc là một bước gần nhau hơn.</p>
      </header>
      {active ? (
        <>
          {/* ── Top row: streak card + garden (match switcher) card ── */}
          <div className="lt2-top-row">
            <div className="lt2-streak-card">
              <div className="lt2-streak-head">
                <span className="lt2-streak-icon"><HeartIcon size={44} /></span>
                <div className="lt2-streak-text">
                  <strong>{streak} Ngày Streak 🔥</strong>
                  <span>Hãy chăm cây tình yêu mỗi ngày nhé!</span>
                </div>
              </div>
              <div className="lt2-streak-avatars">
                <span className="lt2-streak-ava" style={myAvatar ? { backgroundImage: `url(${myAvatar})` } : undefined}>
                  {!myAvatar && myInitial}
                </span>
                <span className="lt2-streak-heart"><HeartIcon size={26} /></span>
                <span className="lt2-streak-partner">
                  <span className="lt2-streak-ava" style={partnerAvatar ? { backgroundImage: `url(${partnerAvatar})` } : undefined}>
                    {!partnerAvatar && partnerName.charAt(0).toUpperCase()}
                  </span>
                  <span className="lt2-streak-partner-tag">{partnerName.split(' ')[0]}</span>
                </span>
              </div>
            </div>

            <div className="lt2-garden-card">
              <div className="lt2-garden-head"><HeartIcon size={15} /> Khu vườn của bạn</div>
              <div className="lt2-garden-row">
                {matches.map((m, idx) => {
                  const id = mId(m)
                  const av = resolveImageUrl(mAvatar(m))
                  const name = mName(m)
                  return (
                    <button key={id ? `${id}-${idx}` : `match-${idx}`} type="button"
                      className={`lt2-garden-item${id === activeMatchId ? ' is-active' : ''}`}
                      onClick={() => { setActiveMatchId(id); setTab('tree') }}>
                      <span className="lt2-garden-avatar" style={av ? { backgroundImage: `url(${av})` } : undefined}>
                        {!av && name.charAt(0).toUpperCase()}
                      </span>
                      <span className="lt2-garden-name">{name.split(' ')[0]}</span>
                      <span className="lt2-garden-heart"><HeartIcon size={12} /></span>
                    </button>
                  )
                })}
                <button type="button" className="lt2-garden-item lt2-garden-add" onClick={() => navigate('/discovery')}>
                  <span className="lt2-garden-avatar lt2-garden-avatar-add">+</span>
                  <span className="lt2-garden-name">Gieo hạt</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tab switcher — only show when level >= 4 */}
          {level >= 4 && (
            <div className="lt2-tabs" role="tablist">
              <button type="button" role="tab" aria-selected={tab === 'tree'}
                className={`lt2-tab-btn${tab === 'tree' ? ' is-active' : ''}`}
                onClick={() => setTab('tree')}>
                <Tree2Icon size={15} /> Cây
              </button>
              <button type="button" role="tab" aria-selected={tab === 'meetup'}
                className={`lt2-tab-btn${tab === 'meetup' ? ' is-active' : ''}`}
                onClick={() => setTab('meetup')}>
                <HeartIcon size={15} /> Hẹn hò
              </button>
            </div>
          )}

          {/* Tab content */}
          {tab === 'meetup' ? (
            <MeetupSection
              matchId={activeMatchId}
              conversationId={conversationId}
              plant={plant}
            />
          ) : (
            <div className="lt2-main-row">
              {/* ── Plant card ── */}
              <div className="lt2-plant-card">
                <div className="lt2-plant-tag">🌱 {treeStageName(level)}</div>
                <div className="lt2-plant-sun" aria-hidden>☀️</div>

                <div className="lt2-plant-img-wrap">
                  <span className="lt2-plant-glow" aria-hidden />
                  <span className="lt2-plant-ground" aria-hidden />
                  <img
                    src={treeImg}
                    alt={`Cây tình yêu cấp ${level} — ${treeStageName(level)}`}
                    className={`lt2-plant-img ${animCls}`}
                  />
                </div>

                <div className="lt2-plant-connector">
                  <span className="lt2-connector-ava" style={myAvatar ? { backgroundImage: `url(${myAvatar})` } : undefined}>
                    {!myAvatar && myInitial}
                  </span>
                  <span className="lt2-connector-name">Bạn</span>
                  <span className="lt2-connector-bar">
                    <span className="lt2-connector-track">
                      <span className="lt2-connector-fill" style={{ width: `${isMaxed ? 100 : Math.min(100, (growthPct / perLevel) * 100)}%` }} />
                    </span>
                    <span className="lt2-connector-heart"
                      style={{ left: `${Math.min(90, Math.max(10, isMaxed ? 100 : (growthPct / perLevel) * 100))}%` }}>
                      <HeartIcon size={11} /> {isMaxed ? '100' : growthPct}%
                    </span>
                  </span>
                  <span className="lt2-connector-name">{partnerName.split(' ')[0]}</span>
                  <span className="lt2-connector-ava" style={partnerAvatar ? { backgroundImage: `url(${partnerAvatar})` } : undefined}>
                    {!partnerAvatar && partnerName.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="lt2-plant-bottom-tag">
                  Cấp {level} · {isMaxed ? 'Tình yêu bền chặt 💖' : `${growthPct}/${perLevel} điểm tăng trưởng`}
                </div>
              </div>

              {/* ── Side column: progress + items + actions ── */}
              <div className="lt2-side-col">
                <div className="lt2-progress-card">
                  {isMaxed ? (
                    <>
                      <div className="lt2-progress-top"><span>Cấp tối đa 🎉</span></div>
                      <p className="lt2-progress-hint">Cây đã đạt cấp cao nhất — khoe với mọi người nhé!</p>
                    </>
                  ) : (
                    <>
                      <div className="lt2-progress-top">
                        <span>Tiến độ lên Cấp {level + 1}</span>
                        <strong>{growthPct}/{perLevel}</strong>
                      </div>
                      <div className="lt2-progress-bar">
                        <div className="lt2-progress-bar-fill" style={{ width: `${Math.min(100, (growthPct / perLevel) * 100)}%` }} />
                        <span className="lt2-progress-heart"
                          style={{ left: `${Math.min(96, Math.max(4, (growthPct / perLevel) * 100))}%` }}>
                          <HeartIcon size={12} />
                        </span>
                      </div>
                      <p className="lt2-progress-hint">
                        {bothWatered ? '💞 Cả hai đã tưới hôm nay!' : 'Hoàn thành nhiệm vụ để nhận điểm!'}
                      </p>
                    </>
                  )}
                </div>

                {!isMaxed && (
                  <div className="lt2-items-card">
                    <div className="lt2-items-head">
                      <span>Vật phẩm của bạn</span>
                      <span className="lt2-items-head-heart"><HeartIcon size={22} /></span>
                    </div>
                    {MATERIALS.map((m) => {
                      const meta = MATERIAL_META[m]
                      const stock = inventory?.[m] ?? 0
                      const disabled = watering || loading || !plant || stock <= 0
                      return (
                        <button key={m} type="button" className={`lt2-item-row${stock <= 0 ? ' is-out' : ''}`} data-mat={m}
                          style={{ background: meta.bg }}
                          onClick={() => handleWater(m)} disabled={disabled}
                          title={`${meta.label} · +${MATERIAL_BONUS[m]}%`} aria-label={`Tưới bằng ${meta.label}`}>
                          <span className="lt2-item-icon">{meta.emoji}</span>
                          <span className="lt2-item-meta">
                            <span className="lt2-item-label">{meta.label}</span>
                            <span className="lt2-item-bonus">+{MATERIAL_BONUS[m]}% EXP</span>
                          </span>
                          <span className={`lt2-item-stock${stock <= 0 ? ' is-empty' : ''}`}>
                            {watering ? '…' : stock <= 0 ? 'Hết' : stock}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}

                <div className="lt2-actions-row">
                  <button type="button" className="lt2-action-btn is-mission" onClick={() => navigate('/daily-connection')}>
                    <span className="lt2-action-icon lt2-action-icon-sparkle"><Sparkles size={22} /></span> Nhiệm vụ
                  </button>
                  {isMaxed && (
                    <button type="button" className="lt2-action-btn is-primary" onClick={() => setShowcase(true)}>
                      <span className="lt2-action-icon">🎉</span>
                      Khoe cây
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="love-tree-empty">
          <div className="love-tree-empty-icon"><LeafSeedlingIcon size={40} /></div>
          <p>Chọn một match bên trên để xem cây tình yêu.</p>
        </div>
      )}

      {/* ── Debug ────────────────────────────────────────── */}
      <DebugPanel
        plant={plant}
        lastResult={lastResult}
        inventory={inventory}
        loading={loading}
        watering={watering}
        error={lastResult?.error || null}
      />

      {/* ── Milestone popup ─────────────────────────────── */}
      {milestone && (
        <div className="love-tree-milestone-backdrop" onClick={() => setMilestone(null)} role="dialog" aria-modal="true">
          <div className="love-tree-milestone" onClick={(e) => e.stopPropagation()}>
            <img src={getTreeImage(milestone.level)} alt={`Cấp ${milestone.level}`}
              className="love-tree-milestone-img" />
            <div className="love-tree-milestone-title">Mốc đặc biệt!</div>
            <div className="love-tree-milestone-level-num">Cấp {milestone.level}</div>
            <p>
              {milestone.message || (
                LEVEL_MILESTONES.includes(milestone.level)
                  ? `Bạn và ${mName(active)} đã đạt mốc ${milestone.level} — nhận thưởng cặp đôi nhé!`
                  : `Cây đã lên cấp ${milestone.level}.`
              )}
            </p>
            <button type="button" className="btn btn-primary" onClick={() => setMilestone(null)}>
              Tuyệt vời!
            </button>
          </div>
        </div>
      )}

      {/* ── Khoe cây: showcase full màn hình + hiệu ứng mạnh ───────── */}
      {showcase && (
        <div className="lt-showcase" role="dialog" aria-modal="true">
          <div className="lt-showcase-bg" aria-hidden />
          <div className="lt-showcase-glow" aria-hidden />
          <div className="lt-showcase-rays" aria-hidden />

          {/* Confetti */}
          <div className="lt-showcase-confetti" aria-hidden>
            {Array.from({ length: 60 }).map((_, i) => {
              const colors = ['#ff4f8b', '#e91e63', '#ffd76f', '#ff7eb3', '#7ed7ff', '#7CFC9A', '#ffffff']
              return (
                <span key={i} className="lt-cf" style={{
                  left: `${(i * 17 + 3) % 100}%`,
                  background: colors[i % colors.length],
                  width: `${6 + (i % 3) * 3}px`,
                  height: `${10 + (i % 3) * 5}px`,
                  animationDelay: `${(i % 12) * 0.28}s`,
                  animationDuration: `${3 + (i % 5) * 0.7}s`,
                }} />
              )
            })}
          </div>

          {/* Lấp lánh */}
          <div className="lt-showcase-sparks" aria-hidden>
            {Array.from({ length: 28 }).map((_, i) => (
              <span key={i} className="lt-spark" style={{
                left: `${(i * 53 + 4) % 98}%`,
                top: `${(i * 37 + 6) % 92}%`,
                animationDelay: `${(i % 9) * 0.35}s`,
                animationDuration: `${1.8 + (i % 5) * 0.5}s`,
              }} />
            ))}
          </div>

          {/* Sao băng */}
          <div className="lt-showcase-shoot" aria-hidden>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="lt-shoot" style={{
                top: `${8 + i * 12}%`,
                left: `${50 + i * 9}%`,
                animationDelay: `${i * 1.4 + 0.5}s`,
              }} />
            ))}
          </div>

          <button type="button" className="lt-showcase-close" onClick={() => setShowcase(false)} aria-label="Đóng">✕</button>

          <div className="lt-showcase-content">
            <div className="lt-showcase-eyebrow">🌳 Cây tình yêu vĩnh cửu</div>
            <div className="lt-showcase-tree-wrap">
              <img src={treeImgByNumber(7)} alt="Cây tình yêu vĩnh cửu" className="lt-showcase-tree" />
            </div>
            <h2 className="lt-showcase-names">Bạn <span>&</span> {partnerName}</h2>
            <p className="lt-showcase-tag">Cấp tối đa · Tình yêu bền chặt 💖</p>
            <div className="lt-showcase-actions">
              <button type="button" className="lt-showcase-dismiss" onClick={() => setShowcase(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
