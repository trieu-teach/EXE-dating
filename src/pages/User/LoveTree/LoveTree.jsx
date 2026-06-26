import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
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
import { resolveImageUrl, timeAgo } from '../../../utils/format.js'
import MeetupSection from '../../../components/User/MeetupSection/MeetupSection.jsx'
import { HeartBrokenIcon, LeafSeedlingIcon, SparkleIcon, Tree2Icon, HeartIcon, MessageIcon, FireIcon, CheckIcon, DuoIcon } from '../../../components/ui/CustomIcons.jsx'
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
const mWhen = (m) => m?.matchedAt ?? m?.createdAt

// Bậc cấp độ cây + phần thưởng khi đạt
const TREE_LEVELS = [
  { lv: 1, img: 1, name: 'Mầm xanh', desc: 'Cây vừa nảy mầm — bắt đầu hành trình cùng nhau.' },
  { lv: 2, img: 2, name: 'Cây non', desc: 'Đâm chồi nảy lộc khi hai bạn trò chuyện đều đặn.' },
  { lv: 3, img: 3, name: 'Cây nhỏ', desc: 'Cây lớn dần theo từng lần tưới.' },
  { lv: 4, img: 4, name: 'Mở khóa Hẹn hò', desc: 'Đề xuất gặp mặt & gợi ý địa điểm hẹn hò gần nhau.', unlock: true },
  { lv: 5, img: 5, name: 'Cây trưởng thành', desc: 'Tình cảm vững vàng, cây xanh tốt.' },
  { lv: 6, img: 6, name: 'Cây đơm hoa', desc: 'Cây bắt đầu nở hoa rực rỡ.' },
  { lv: 7, img: 7, name: 'Cây tình yêu vĩnh cửu', desc: 'Cấp tối đa — biểu tượng tình yêu bền chặt.' },
]

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
  const [levelsOpen, setLevelsOpen] = useState(false)

  const { user } = useAuth()
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
  const iWatered = Boolean(plant?.iWateredToday)
  const partnerWatered = bothWatered || Boolean(plant?.partnerWateredToday)
  const myAvatar = resolveImageUrl(user?.avatarUrl)
  const myInitial = (user?.displayName || 'B').charAt(0).toUpperCase()
  const partnerAvatar = resolveImageUrl(mAvatar(active))
  const partnerName = mName(active)
  const treeImg = getTreeImage(level)
  const animCls = emojiAnim ? `is-${emojiAnim}` : ''

  return (
    <div className="love-tree-page" data-stage={Math.min(TREE_MAX_LEVEL, Math.max(1, level))}>
      {/* Nền immersive: gradient + tia sáng toả + lấp lánh + confetti */}
      <div className="lt-page-bg" aria-hidden />
      <div className="lt-page-rays" aria-hidden />
      <div className="lt-page-spark" aria-hidden>
        {Array.from({ length: 22 }).map((_, i) => (
          <span key={i} style={{
            left: `${(i * 47 + 5) % 98}%`,
            top: `${(i * 31 + 7) % 94}%`,
            animationDelay: `${(i % 8) * 0.4}s`,
            animationDuration: `${2 + (i % 5) * 0.5}s`,
          }} />
        ))}
      </div>
      <div className="lt-page-confetti" aria-hidden>
        {Array.from({ length: 40 }).map((_, i) => {
          const colors = ['#ff4f8b', '#b14bff', '#ffd76f', '#ff7eb3', '#7ed7ff', '#7CFC9A', '#ffffff']
          return (
            <span key={i} style={{
              left: `${(i * 23 + 3) % 100}%`,
              background: colors[i % colors.length],
              width: `${5 + (i % 3) * 3}px`,
              height: `${9 + (i % 3) * 4}px`,
              animationDelay: `${(i % 14) * 0.5}s`,
              animationDuration: `${5 + (i % 6) * 0.8}s`,
            }} />
          )
        })}
      </div>

      {/* ── Left: tree card ─────────────────────────────── */}
      <section className={`love-tree-card${active && tab === 'tree' ? ' is-hud' : ''}`}>
        {active ? (
          <>
            {/* Co-op stat — streak + hôm nay cùng chăm cây (kiểu Duolingo/Snapchat) */}
            <div className="lt-coop">
              <div className="lt-coop-streak" title="Số ngày liên tiếp cùng chăm cây">
                <span className="lt-coop-flame">🔥</span>
                <span className="lt-coop-streak-num">{streak}</span>
                <span className="lt-coop-streak-lbl">ngày<br />streak</span>
              </div>
              <div className="lt-coop-today">
                <div className="lt-coop-today-lbl">
                  {bothWatered ? '💞 Cả hai đã tưới hôm nay!' : 'Hôm nay cùng chăm cây'}
                </div>
                <div className="lt-coop-avatars">
                  <div className={`lt-coop-person${iWatered ? ' is-done' : ''}`}>
                    <span className="lt-coop-ava" style={myAvatar ? { backgroundImage: `url(${myAvatar})` } : undefined}>
                      {!myAvatar && myInitial}
                      <span className="lt-coop-badge">{iWatered ? <CheckIcon size={11} /> : '·'}</span>
                    </span>
                    <span className="lt-coop-name">Bạn</span>
                  </div>
                  <span className="lt-coop-amp"><HeartIcon size={16} /></span>
                  <div className={`lt-coop-person${partnerWatered ? ' is-done' : ''}`}>
                    <span className="lt-coop-ava" style={partnerAvatar ? { backgroundImage: `url(${partnerAvatar})` } : undefined}>
                      {!partnerAvatar && partnerName.charAt(0).toUpperCase()}
                      <span className="lt-coop-badge">{partnerWatered ? <CheckIcon size={11} /> : '·'}</span>
                    </span>
                    <span className="lt-coop-name">{partnerName.split(' ')[0]}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab switcher — only show when level >= 4 */}
            {level >= 4 && (
              <div className="love-tree-tab-bar" role="tablist">
                <button type="button" role="tab" aria-selected={tab === 'tree'}
                  className={`love-tree-tab-btn${tab === 'tree' ? ' is-active' : ''}`}
                  onClick={() => setTab('tree')}>
                  <Tree2Icon size={15} /> Cây
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
                {/* Tree scene — nền cảnh đổi theo cấp */}
                <div className="love-tree-scene" data-stage={Math.min(TREE_MAX_LEVEL, Math.max(1, level))}>
                  <div className="love-tree-sky" />
                  <div className="lt-orb" aria-hidden />
                  <div className="lt-rays" aria-hidden />
                  <div className="lt-bokeh" aria-hidden>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <span key={i} className="lt-bokeh-dot" style={{
                        left: `${(i * 41 + 8) % 92}%`,
                        bottom: `${-20 - (i % 4) * 10}px`,
                        width: `${22 + (i % 4) * 14}px`,
                        height: `${22 + (i % 4) * 14}px`,
                        animationDelay: `${i * 0.9}s`,
                        animationDuration: `${7 + (i % 5)}s`,
                      }} />
                    ))}
                  </div>
                  <div className="lt-sparkles" aria-hidden>
                    {Array.from({ length: 18 }).map((_, i) => (
                      <span key={i} className="lt-sparkle" style={{
                        left: `${(i * 37 + 6) % 96}%`,
                        top: `${(i * 53 + 8) % 78}%`,
                        animationDelay: `${(i % 7) * 0.4}s`,
                        animationDuration: `${2.2 + (i % 5) * 0.5}s`,
                      }} />
                    ))}
                  </div>
                  {animCls && (
                    <div className="lt-drops" aria-hidden>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <span key={i} className="lt-drop" style={{ left: `${20 + i * 12}%`, animationDelay: `${i * 0.12}s` }} />
                      ))}
                    </div>
                  )}
                  <div className="love-tree-glow" />
                  <div className="lt-stage-eyebrow">🌳 {treeStageName(level)}</div>
                  <div className="love-tree-img-wrap">
                    <img
                      src={treeImg}
                      alt={`Cây tình yêu cấp ${level} — ${treeStageName(level)}`}
                      className={`love-tree-img ${animCls}`}
                    />
                  </div>
                  <h2 className="lt-stage-names">Bạn <span>&</span> {partnerName.split(' ')[0]}</h2>
                  <div className="lt-stage-tag">
                    Cấp {level} · {isMaxed ? 'Tình yêu bền chặt 💖' : `${growthPct}/${perLevel} điểm tăng trưởng`}
                  </div>
                  <div className="love-tree-ground" />
                </div>

                {/* ── Dock điều khiển cố định dưới đáy ── */}
                <div className="lt-dock">
                  {!isMaxed && (
                    <div className="lt-dock-progress">
                      <div className="lt-dock-progress-top">
                        <span>Tiến độ lên Cấp {level + 1}</span>
                        <span>{growthPct}/{perLevel}</span>
                      </div>
                      <div className="lt-dock-bar">
                        <div className="lt-dock-bar-fill" style={{ width: `${Math.min(100, (growthPct / perLevel) * 100)}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="lt-dock-main">
                    {isMaxed ? (
                      <button type="button" className="lt-dock-maxed" onClick={() => setShowcase(true)}>
                        <span className="lt-dock-maxed-shine" aria-hidden />
                        🎉 Khoe cây tình yêu vĩnh cửu
                      </button>
                    ) : (
                      <div className="lt-dock-water">
                        {MATERIALS.map((m) => {
                          const meta = MATERIAL_META[m]
                          const stock = inventory?.[m] ?? 0
                          const disabled = watering || loading || !plant || stock <= 0
                          return (
                            <button key={m} type="button" className="lt-water-btn" data-mat={m}
                              onClick={() => handleWater(m)} disabled={disabled}
                              title={`${meta.label} · +${MATERIAL_BONUS[m]}%`} aria-label={`Tưới bằng ${meta.label}`}>
                              <span className="lt-water-emoji">{meta.emoji}</span>
                              <span className="lt-water-meta">
                                <span className="lt-water-label">{meta.label}</span>
                                <span className="lt-water-bonus">+{MATERIAL_BONUS[m]}%</span>
                              </span>
                              <span className={`lt-water-stock${stock <= 0 ? ' is-empty' : ''}`}>
                                {watering ? '…' : stock}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    )}

                    <div className="lt-dock-side">
                      <button type="button" className="lt-dock-btn" onClick={() => navigate('/daily-connection')}>
                        <SparkleIcon size={18} /> <span>Nhiệm vụ</span>
                      </button>
                      <button type="button" className="lt-dock-btn" onClick={() => setLevelsOpen(true)}>
                        <span className="lt-dock-btn-emoji">🗺️</span> <span>Hành trình</span>
                      </button>
                    </div>
                  </div>
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
          {matches.map((m, idx) => {
            const id = mId(m)
            const av = resolveImageUrl(mAvatar(m))
            const name = mName(m)
            return (
              <div key={id ? `${id}-${idx}` : `match-${idx}`}
                className={`love-tree-match-item${id === activeMatchId ? ' is-active' : ''}`}
                onClick={() => { setActiveMatchId(id); setTab('tree') }}
                role="button" tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setActiveMatchId(id); setTab('tree') } }}>
                <div className="avatar" style={av ? { backgroundImage: `url(${av})` } : undefined}>
                  {!av && <span className="love-tree-match-initial">{name.charAt(0).toUpperCase()}</span>}
                </div>
                <div className="love-tree-match-meta">
                  <div className="love-tree-match-name">{name}</div>
                  <div className="love-tree-match-sub">Match {timeAgo(mWhen(m))}</div>
                </div>
              </div>
            )
          })}
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

      {/* ── Overlay lộ trình (mở bằng nút Hành trình) ───────── */}
      {levelsOpen && (
        <div className="lt-levels-overlay" onClick={() => setLevelsOpen(false)} role="dialog" aria-modal="true">
          <div className="lt-levels-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="lt-levels-sheet-head">
              <h3>Hành trình lớn lên cùng nhau</h3>
              <button type="button" className="lt-levels-close" onClick={() => setLevelsOpen(false)} aria-label="Đóng">✕</button>
            </div>
            <div className="love-tree-levels-list is-journey">
              {TREE_LEVELS.map((t) => {
                const reached = level >= t.lv
                const current = level >= t.lv && level < (TREE_LEVELS.find((x) => x.lv > t.lv)?.lv ?? 999)
                return (
                  <div key={t.lv} className={`love-tree-level-row${reached ? ' is-reached' : ''}${current ? ' is-current' : ''}${t.unlock ? ' is-unlock' : ''}`}>
                    <img src={treeImgByNumber(t.img)} alt="" className="love-tree-level-img" />
                    <div className="love-tree-level-info">
                      <div className="love-tree-level-head">
                        <span className="love-tree-level-lv">Cấp {t.lv}</span>
                        <span className="love-tree-level-name">{t.name}</span>
                        {t.unlock && <span className="love-tree-level-tag">🔓 Mở khóa</span>}
                        {current && <span className="love-tree-level-now">Hiện tại</span>}
                      </div>
                      <div className="love-tree-level-desc">{t.desc}</div>
                    </div>
                    {reached && <span className="love-tree-level-check">✓</span>}
                  </div>
                )
              })}
            </div>
            <div className="love-tree-levels-note">
              🎁 Đạt các mốc <strong>{LEVEL_MILESTONES.join(', ')}</strong> sẽ nhận thưởng nguyên liệu cho cả hai. Lên Cấp tối đa để có <strong>Cây tình yêu vĩnh cửu</strong>!
            </div>
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
              const colors = ['#ff4f8b', '#b14bff', '#ffd76f', '#ff7eb3', '#7ed7ff', '#7CFC9A', '#ffffff']
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
