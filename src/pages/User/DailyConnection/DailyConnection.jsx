import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gamificationService, connectionRemindersService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'
import { MATERIALS, MATERIAL_META, TASK_TYPE_META, TASK_TYPE_ORDER } from '../../../constants/gamification.js'
import { SparkleIcon, HeartIcon } from '../../../components/ui/CustomIcons.jsx'
import './DailyConnection.css'

// Reset theo UTC: daily 00:00 UTC (07:00 VN), weekly Thứ 2 00:00 UTC, achievement không reset
function nextDailyResetMs(now) {
  const n = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0))
  return n - now
}
function nextWeeklyResetMs(now) {
  const dow = now.getUTCDay() // 0=CN..6=T7
  let days = (1 - dow + 7) % 7 // tới Thứ 2 kế
  if (days === 0) days = 7
  const n = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + days, 0, 0, 0))
  return n - now
}
function fmtDur(ms) {
  if (ms <= 0) return 'sắp tới'
  const totalMin = Math.floor(ms / 60000)
  const d = Math.floor(totalMin / 1440)
  const h = Math.floor((totalMin % 1440) / 60)
  const m = totalMin % 60
  if (d > 0) return `${d} ngày ${h} giờ`
  if (h > 0) return `${h} giờ ${m} phút`
  return `${m} phút`
}

// Suy ra điểm đến hợp lý cho nút "Làm ngay" dựa trên nội dung nhiệm vụ
// (backend chưa trả sẵn deeplink cho từng nhiệm vụ).
function taskActionRoute(t) {
  const text = `${t.title || ''} ${t.description || ''}`.toLowerCase()
  if (text.includes('tin nhắn') || text.includes('chat') || text.includes('nhắn')) return '/chat'
  if (text.includes('cây') || text.includes('tưới')) return '/love-tree'
  if (text.includes('match') || text.includes('quẹt') || text.includes('thích')) return '/discovery'
  return '/discovery'
}

export default function DailyConnection() {
  const navigate = useNavigate()
  const toast = useToast()
  const [tasks, setTasks] = useState([])
  const [inventory, setInventory] = useState([])
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(() => new Date())
  const [activeType, setActiveType] = useState('Daily')

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  const resetInfo = {
    Daily: `Làm mới sau ${fmtDur(nextDailyResetMs(now))} · mỗi ngày lúc 07:00`,
    Weekly: `Làm mới sau ${fmtDur(nextWeeklyResetMs(now))} · đầu tuần (Thứ 2)`,
    Achievement: 'Mốc cố định — không làm mới',
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [t, inv, r] = await Promise.all([
        gamificationService.tasks().catch(() => null),
        gamificationService.inventory().catch(() => null),
        connectionRemindersService.reminders().catch(() => null),
      ])
      setTasks(Array.isArray(t?.tasks) ? t.tasks : (Array.isArray(t) ? t : []))
      setInventory(Array.isArray(inv?.items) ? inv.items : (Array.isArray(inv) ? inv : []))
      setReminders(Array.isArray(r?.items) ? r.items : (Array.isArray(r) ? r : []))
    } catch (err) {
      toast.error(err?.message || 'Không tải được dữ liệu hằng ngày.')
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Chỉ tải 1 lần, tránh reload khi re-render.
  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [claiming, setClaiming] = useState(null) // code nhiệm vụ đang nhận
  const [flyers, setFlyers] = useState([])       // nguyên liệu đang bay vào kho
  const [bumpMat, setBumpMat] = useState(null)   // ô kho đang nảy khi nhận xong

  // Bắn nguyên liệu từ nút Nhận -> bay vào đúng ô kho tương ứng
  const flyToInventory = (startRect, material) => {
    const target = document.querySelector(`.material-chip[data-mat="${material}"]`)
    if (!startRect || !target) return 0
    const end = target.getBoundingClientRect()
    const x0 = startRect.left + startRect.width / 2
    const y0 = startRect.top + startRect.height / 2
    const dx = end.left + end.width / 2 - x0
    const dy = end.top + end.height / 2 - y0
    const emoji = MATERIAL_META[material]?.emoji ?? '🎁'
    const count = 9
    const batch = Array.from({ length: count }).map((_, i) => ({
      id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      emoji, x0, y0, dx, dy,
      bx: Math.random() * 150 - 75,
      by: -(30 + Math.random() * 80),
      delay: i * 55,
      dur: 720 + Math.random() * 260,
    }))
    setFlyers((cur) => [...cur, ...batch])
    const landMs = (count - 1) * 55 + 900
    const ids = new Set(batch.map((b) => b.id))
    setTimeout(() => setFlyers((cur) => cur.filter((f) => !ids.has(f.id))), landMs + 300)
    return landMs
  }

  const handleClaim = async (task, btnEl) => {
    if (!task?.code || claiming) return
    const startRect = btnEl?.getBoundingClientRect()
    setClaiming(task.code)
    try {
      await gamificationService.claim(task.code)
      setTasks((cur) => cur.map((t) => (t.code === task.code ? { ...t, claimed: true } : t)))
      const qty = task.rewardQty ?? 1
      const meta = MATERIAL_META[task.rewardMaterial]
      const landMs = flyToInventory(startRect, task.rewardMaterial)
      // Cộng nguyên liệu + cho ô kho nảy ĐÚNG LÚC nguyên liệu bay tới
      const addToInventory = () => {
        setInventory((cur) => {
          const arr = cur.map((it) => ({ ...it }))
          const idx = arr.findIndex((it) => (it.material ?? it.name) === task.rewardMaterial)
          if (idx >= 0) arr[idx].quantity = (arr[idx].quantity ?? 0) + qty
          else arr.push({ material: task.rewardMaterial, quantity: qty })
          return arr
        })
        setBumpMat(task.rewardMaterial)
        setTimeout(() => setBumpMat(null), 500)
      }
      if (landMs > 0) setTimeout(addToInventory, landMs - 150)
      else addToInventory()
      toast.success(`Đã nhận ${meta?.emoji ?? '🎁'} ×${qty}!`)
    } catch (err) {
      toast.error(err?.message || 'Nhận thưởng thất bại.')
    } finally {
      setClaiming(null)
    }
  }

  // Kho nguyên liệu (luôn hiện đủ 3 loại)
  const invByMaterial = useMemo(() => {
    const map = {}
    for (const it of inventory) map[it.material ?? it.name] = it.quantity ?? 0
    return map
  }, [inventory])

  // Nhóm nhiệm vụ theo loại Daily/Weekly/Achievement
  const tasksByType = useMemo(() => {
    const groups = {}
    for (const t of tasks) {
      const type = t.type || 'Daily'
      ;(groups[type] ??= []).push(t)
    }
    return groups
  }, [tasks])

  const availableTypes = TASK_TYPE_ORDER.filter((type) => tasksByType[type]?.length)

  if (loading) return <div className="loading-block"><span className="spinner" /></div>

  const activeTasks = tasksByType[activeType] || []

  return (
    <div className="daily-page">
      {/* ── Hero ── */}
      <div className="dc-hero-row">
        <div className="dc-hero-left">
          <header className="dc-header ph-header">
            <span className="dc-header-glow ph-glow" aria-hidden />
            <h1 className="dc-title ph-title"><span className="dc-title-script ph-script">Nhiệm</span> <span className="dc-title-accent ph-accent">vụ <SparkleIcon size={26} className="ph-icon ph-beat dc-title-icon" /></span></h1>
            <p className="dc-subtitle ph-subtitle">Hoàn thành thử thách để nhận tài nguyên nuôi cây tình yêu.</p>
          </header>

          {/* ── Tab loại nhiệm vụ ── */}
          {availableTypes.length > 0 && (
            <div className="dc-tabs" role="tablist">
              {availableTypes.map((type) => {
                const meta = TASK_TYPE_META[type]
                return (
                  <button key={type} type="button" role="tab" aria-selected={activeType === type}
                    className={`dc-tab${activeType === type ? ' is-active' : ''}`}
                    onClick={() => setActiveType(type)}>
                    <span>{meta.emoji}</span> {meta.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Lưới nhiệm vụ ── */}
      {activeTasks.length > 0 && (
        <section className="daily-section">
          {resetInfo[activeType] && <p className="dc-reset-info">{resetInfo[activeType]}</p>}
          <div className="dc-task-grid">
            {activeTasks.map((t) => {
              const mat = MATERIAL_META[t.rewardMaterial]
              const target = t.target || 1
              const prog = Math.min(t.progress ?? 0, target)
              const pct = Math.round((prog / target) * 100)
              const status = t.claimed
                ? 'claimed'
                : t.completed
                  ? 'ready'
                  : prog > 0
                    ? 'progress'
                    : 'todo'
              const statusLabel = {
                claimed: 'Đã nhận',
                ready: 'Hoàn thành',
                progress: 'Đang làm',
                todo: 'Chưa bắt đầu',
              }[status]

              return (
                <div key={t.code || t.id} className={`dc-task-card is-${status}`} data-mat={t.rewardMaterial || undefined}>
                  <div className="dc-task-card-top">
                    <span className="dc-task-card-icon" style={mat ? { background: mat.bg, color: mat.color } : undefined}>
                      {mat?.emoji || '🎯'}
                    </span>
                    <span className={`dc-task-card-status is-${status}`}>{statusLabel}</span>
                  </div>

                  <h3 className="dc-task-card-title">{t.title || t.description}</h3>
                  {t.title && t.description && <p className="dc-task-card-desc">{t.description}</p>}

                  <div className="dc-task-card-progress">
                    <div className="dc-task-card-progress-head">
                      <span>Tiến độ</span>
                      <span>{prog}/{target}</span>
                    </div>
                    <div className="dc-task-progress-bar">
                      <div className="dc-task-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  {mat && (
                    <div className="dc-task-card-foot">
                      <div className="dc-task-card-reward">
                        <span className="dc-task-card-reward-label">Phần thưởng</span>
                        <span className="dc-task-card-reward-value">+{t.rewardQty ?? 1} {mat.emoji}</span>
                      </div>
                      {status === 'ready' ? (
                        <button type="button" className="dc-task-card-btn is-primary"
                          disabled={claiming === t.code}
                          onClick={(e) => handleClaim(t, e.currentTarget)}>
                          {claiming === t.code ? <span className="spinner" /> : <>Nhận thưởng <HeartIcon size={13} /></>}
                        </button>
                      ) : status === 'claimed' ? (
                        <button type="button" className="dc-task-card-btn is-claimed" disabled>Đã nhận ✓</button>
                      ) : (
                        <button type="button" className="dc-task-card-btn is-outline" onClick={() => navigate(taskActionRoute(t))}>
                          Làm ngay
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Kho nguyên liệu ── */}
      <section className="daily-section">
        <h2 className="daily-section-title">Kho nguyên liệu</h2>
        <div className="material-row">
          {MATERIALS.map((m) => {
            const meta = MATERIAL_META[m]
            const qty = invByMaterial[m] ?? 0
            return (
              <div key={m} data-mat={m}
                className={`material-chip${bumpMat === m ? ' is-bump' : ''}${qty <= 0 ? ' is-empty' : ''}`}
                style={{ background: meta.bg }}>
                <span className="material-emoji">{meta.emoji}</span>
                <div className="material-info">
                  <span className="material-qty" style={{ color: meta.color }}>{qty}</span>
                  <span className="material-name">{meta.label}</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Lời nhắc kết nối ── */}
      {reminders.length > 0 && (
        <section className="daily-section">
          <h2 className="daily-section-title">Lời nhắc kết nối</h2>
          <div className="reminder-list">
            {reminders.map((r, i) => (
              <div key={r.matchId || r.id || i} className="reminder-item">
                <HeartIcon size={17} />
                <span>{r.message || r.title || r.body}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Banner cây tình yêu ── */}
      <div className="dc-banner">
        <div className="dc-banner-tree" aria-hidden="true">
          <SparkleIcon size={36} />
          <HeartIcon size={64} />
        </div>
        <div className="dc-banner-text">
          <h3>Cây tình yêu sẽ lớn mạnh hơn mỗi ngày</h3>
          <p>Càng hoàn thành nhiều nhiệm vụ, bạn càng nhận được nhiều phần thưởng giá trị!</p>
        </div>
        <div className="dc-banner-hearts" aria-hidden="true">
          <HeartIcon size={26} className="dc-banner-heart dc-banner-heart-1" />
          <HeartIcon size={19} className="dc-banner-heart dc-banner-heart-2" />
          <HeartIcon size={14} className="dc-banner-heart dc-banner-heart-3" />
        </div>
      </div>

      {/* Lớp nguyên liệu bay vào kho */}
      {flyers.length > 0 && (
        <div className="dc-flyers" aria-hidden>
          {flyers.map((f) => (
            <span
              key={f.id}
              className="dc-flyer"
              style={{
                left: `${f.x0}px`,
                top: `${f.y0}px`,
                '--dx': `${f.dx}px`,
                '--dy': `${f.dy}px`,
                '--bx': `${f.bx}px`,
                '--by': `${f.by}px`,
                animationDelay: `${f.delay}ms`,
                animationDuration: `${f.dur}ms`,
              }}
            >
              {f.emoji}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
