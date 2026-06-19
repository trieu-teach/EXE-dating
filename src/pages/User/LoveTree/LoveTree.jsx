import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useToast } from '../../../context/ToastContext.jsx'
import { useInventory } from '../../../context/InventoryContext.jsx'
import { matchesService, chatService } from '../../../api'
import { usePlant } from '../../../hooks/usePlant.js'
import {
  LEVEL_MILESTONES,
  MATERIALS,
  MATERIAL_BONUS,
  MATERIAL_META,
} from '../../../constants/gamification.js'
import { resolveImageUrl, timeAgo } from '../../../utils/format.js'
import MeetupSection from '../../../components/User/MeetupSection/MeetupSection.jsx'
import { HeartBrokenIcon, LeafSeedlingIcon, SparkleIcon, Tree2Icon, HeartIcon, MessageIcon, FireIcon, CheckIcon, DuoIcon } from '../../../components/ui/CustomIcons.jsx'
import './LoveTree.css'

// ── Tree image mapping ───────────────────────────────────────────────────────
const TREE_IMAGES = {
  seedling: '/assets/love-tree/tree-stage-seedling.png',
  sprout:  '/assets/love-tree/tree-stage-sprout.png',
  budding: '/assets/love-tree/tree-stage-budding.png',
  sparse:  '/assets/love-tree/tree-stage-sparse.png',
  young:   '/assets/love-tree/tree-stage-young.png',
  blooming:'/assets/love-tree/tree-stage-blooming.png',
  premium: '/assets/love-tree/cherry-tree-premium.png',
}

function getTreeImage(level) {
  if (level >= 21) return TREE_IMAGES.premium
  if (level >= 11) return TREE_IMAGES.blooming
  if (level >= 6)  return TREE_IMAGES.young
  if (level >= 4)  return TREE_IMAGES.sparse
  if (level >= 3)  return TREE_IMAGES.budding
  if (level >= 2)  return TREE_IMAGES.sprout
  return TREE_IMAGES.seedling
}

function treeStageName(level) {
  if (level >= 21) return 'Cây tình yêu vĩnh cửu'
  if (level >= 11) return 'Cây đơm hoa'
  if (level >= 6)  return 'Cây trưởng thành'
  if (level >= 3)  return 'Cây non'
  return 'Mầm xanh'
}

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

  const { inventory } = useInventory()
  const { plant, loading, watering, water, lastResult } = usePlant(activeMatchId)

  // Load matches once.
  useEffect(() => {
    let cancelled = false
    matchesService.list()
      .then((list) => {
        if (cancelled) return
        const arr = Array.isArray(list) ? list : (list?.items ?? [])
        setMatches(arr)
        setActiveMatchId((cur) => cur || arr[0]?.id || null)
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

  const active = useMemo(() => matches.find((m) => m.id === activeMatchId) || null, [matches, activeMatchId])

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

  const level = Number(plant?.level ?? 1)
  const growthPct = Math.max(0, Math.min(100, Number(plant?.growthPercent ?? 0)))
  const perLevel = Math.max(1, Number(plant?.percentPerLevel ?? 100))
  const streak = Number(plant?.streakCount ?? 0)
  const bothWatered = Boolean(plant?.bothWateredToday)
  const iWatered = Boolean(plant?.iWateredToday)
  const treeImg = getTreeImage(level)
  const animCls = emojiAnim ? `is-${emojiAnim}` : ''

  return (
    <div className="love-tree-page">
      {/* ── Left: tree card ─────────────────────────────── */}
      <section className="love-tree-card">
        {active ? (
          <>
            {/* Hero header */}
            <div className="love-tree-hero">
              <div className="love-tree-hero-float" aria-hidden>
                <span>✨</span><span>💫</span><span>⭐</span><span>🌟</span><span>💫</span>
              </div>
              <div className="love-tree-hero-content">
                <div className="love-tree-hero-label">Cây tình yêu</div>
                <div className="love-tree-hero-name">{active.otherDisplayName}</div>
                <div className="love-tree-hero-sub">Match {timeAgo(active.createdAt)}</div>
                <div className="love-tree-hero-badges">
                  {streak > 0 && (
                    <span className="love-tree-hero-badge is-fire"><FireIcon size={14} /> {streak} ngày streak</span>
                  )}
                  {bothWatered && (
                    <span className="love-tree-hero-badge is-duo"><DuoIcon size={14} /> Cả hai đã tưới hôm nay</span>
                  )}
                  {iWatered && !bothWatered && (
                    <span className="love-tree-hero-badge"><CheckIcon size={12} /> Bạn đã tưới</span>
                  )}
                </div>
              </div>
            </div>

            {/* Tab switcher — only show when level >= 4 */}
            {level >= 4 && (
              <div className="love-tree-tab-bar" role="tablist">
                <button type="button" role="tab" aria-selected={tab === 'tree'}
                  className={`love-tree-tab-btn${tab === 'tree' ? ' is-active' : ''}`}
                  onClick={() => setTab('tree')}>
                  <TreeIcon size={15} /> Cây
                </button>
                <button type="button" role="tab" aria-selected={tab === 'meetup'}
                  className={`love-tree-tab-btn${tab === 'meetup' ? ' is-active' : ''}`}
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
              <>
                {/* Tree scene */}
                <div className="love-tree-scene">
                  <div className="love-tree-glow" />
                  <div className="love-tree-img-wrap">
                    <img
                      src={treeImg}
                      alt={`Cây tình yêu cấp ${level} — ${treeStageName(level)}`}
                      className={`love-tree-img ${animCls}`}
                    />
                    <div className="love-tree-level-badge">
                      <span>Cấp</span>
                      <span className="level-num">{level}</span>
                      <span>·</span>
                      <span>{treeStageName(level)}</span>
                    </div>
                  </div>
                  <div className="love-tree-ground" />
                </div>

                {/* Growth progress */}
                <div className="love-tree-growth-section">
                  <div className="love-tree-growth-header">
                    <span className="love-tree-growth-title">Tiến độ lên cấp {level + 1}</span>
                    <span className="love-tree-growth-pct">{growthPct}% / {perLevel}%</span>
                  </div>
                  <div className="love-tree-growth-bar" role="progressbar"
                    aria-valuenow={growthPct} aria-valuemin={0} aria-valuemax={perLevel}>
                    <div className="love-tree-growth-fill"
                      style={{ width: `${Math.min(100, (growthPct / perLevel) * 100)}%` }} />
                  </div>
                  <div className="love-tree-growth-detail">
                    <span>{growthPct} / {perLevel} XP</span>
                    <span>Cấp {level + 1} khi đạt {perLevel}%</span>
                  </div>
                </div>

                {/* Water buttons */}
                <div className="love-tree-water-section">
                  <div className="love-tree-water-title">Tưới cây</div>
                  <div className="love-tree-water-grid">
                    {MATERIALS.map((m) => {
                      const meta = MATERIAL_META[m]
                      const stock = inventory?.[m] ?? 0
                      const disabled = watering || loading || !plant || stock <= 0
                      return (
                        <button key={m} type="button" className="love-tree-water-btn"
                          data-mat={m} onClick={() => handleWater(m)} disabled={disabled}
                          aria-label={`Tưới bằng ${meta.label}`}>
                          <span className="love-tree-water-emoji" aria-hidden>{meta.emoji}</span>
                          <span className="love-tree-water-label">{meta.label}</span>
                          <span className="love-tree-water-bonus">+{MATERIAL_BONUS[m]}%</span>
                          <span className={`love-tree-water-stock${stock <= 0 ? ' is-empty' : ''}`}>
                            {watering ? '…' : stock}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Inventory bar */}
                <div className="love-tree-inventory">
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700, marginRight: 4 }}>Kho:</span>
                  {MATERIALS.map((m) => (
                    <span key={m} className="love-tree-inv-chip" data-mat={m}>
                      {MATERIAL_META[m].emoji} {inventory?.[m] ?? 0}
                    </span>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="love-tree-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => navigate(`/chat/${active.id}`)}>
                    <MessageIcon size={14} /> Nhắn tin
                  </button>
                  <button type="button" className="btn btn-soft" onClick={() => navigate('/tasks')}>
                    <SparkleIcon size={14} /> Nhiệm vụ
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="love-tree-empty">
            <div className="love-tree-empty-icon"><LeafSeedlingIcon size={40} /></div>
            <p>Chọn một match bên phải để xem cây tình yêu.</p>
          </div>
        )}
      </section>

      {/* ── Right: match list ────────────────────────────── */}
      <aside className="love-tree-match-list">
        <div className="love-tree-match-list-header">
          <Tree2Icon size={16} />
          <h3>Cây của bạn</h3>
          <span className="love-tree-match-count">{matches.length}</span>
        </div>
        <div className="love-tree-match-items">
          {matches.map((m, idx) => (
            <div key={m?.id ? `${m.id}-${idx}` : `match-${idx}`}
              className={`love-tree-match-item${m.id === activeMatchId ? ' is-active' : ''}`}
              onClick={() => { setActiveMatchId(m.id); setTab('tree') }}
              role="button" tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setActiveMatchId(m.id); setTab('tree') } }}>
              <div className="avatar"
                style={{ backgroundImage: m.otherAvatarUrl ? `url(${resolveImageUrl(m.otherAvatarUrl)})` : undefined }} />
              <div className="love-tree-match-meta">
                <div className="love-tree-match-name">{m.otherDisplayName}</div>
                <div className="love-tree-match-sub">{timeAgo(m.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      </aside>

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
                  ? `Bạn và ${active?.otherDisplayName || 'người ấy'} đã đạt mốc ${milestone.level} — nhận thưởng cặp đôi nhé!`
                  : `Cây đã lên cấp ${milestone.level}.`
              )}
            </p>
            <button type="button" className="btn btn-primary" onClick={() => setMilestone(null)}>
              Tuyệt vời!
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
