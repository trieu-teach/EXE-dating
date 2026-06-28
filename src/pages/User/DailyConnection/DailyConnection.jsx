import { useCallback, useEffect, useMemo, useState } from 'react'
import { gamificationService, connectionRemindersService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'
import { MATERIALS, MATERIAL_META, TASK_TYPE_META, TASK_TYPE_ORDER } from '../../../constants/gamification.js'
import { SparkleIcon, HeartIcon, TrophyIcon } from '../../../components/ui/CustomIcons.jsx'
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

export default function DailyConnection() {
  const toast = useToast()
  const [tasks, setTasks] = useState([])
  const [inventory, setInventory] = useState([])
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  const resetInfo = {
    Daily: `🔄 Làm mới sau ${fmtDur(nextDailyResetMs(now))} · mỗi ngày lúc 07:00`,
    Weekly: `🔄 Làm mới sau ${fmtDur(nextWeeklyResetMs(now))} · đầu tuần (Thứ 2)`,
    Achievement: '🏆 Mốc cố định — không làm mới',
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

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps  (chỉ tải 1 lần, tránh reload khi re-render)

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

  if (loading) return <div className="loading-block"><span className="spinner" /></div>

  const doneCount = tasks.filter((t) => t.completed).length
  const dailyPct = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0

  return (
    <div className="daily-page">
      {/* ── Header sạch + accent thương hiệu ── */}
      <header className="dc-header">
        <span className="dc-glow" aria-hidden />
        <span className="dc-eyebrow"><TrophyIcon size={12} /> Hằng ngày</span>
        <h1 className="dc-title">Nhiệm vụ <span>&amp; Phần thưởng</span></h1>
        <p className="dc-subtitle">Hoàn thành nhiệm vụ để nhận nguyên liệu chăm sóc Cây tình yêu.</p>

        {tasks.length > 0 && (
          <div className="dc-progress">
            <div className="dc-progress-head">
              <span><TrophyIcon size={13} /> Nhiệm vụ hôm nay</span>
              <span className="dc-progress-count">{doneCount}/{tasks.length}</span>
            </div>
            <div className="daily-bar"><div className="daily-bar-fill" style={{ width: `${dailyPct}%` }} /></div>
          </div>
        )}
      </header>

      {/* ── Kho nguyên liệu ── */}
      <section className="daily-section">
        <h2 className="daily-section-title">Kho nguyên liệu</h2>
        <div className="material-row">
          {MATERIALS.map((m) => {
            const meta = MATERIAL_META[m]
            return (
              <div key={m} data-mat={m} className={`material-chip${bumpMat === m ? ' is-bump' : ''}`} style={{ background: meta.bg }}>
                <span className="material-emoji">{meta.emoji}</span>
                <div className="material-info">
                  <span className="material-qty" style={{ color: meta.color }}>{invByMaterial[m] ?? 0}</span>
                  <span className="material-name">{meta.label}</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Nhiệm vụ thưởng nguyên liệu ── */}
      {tasks.length > 0 && (
        <section className="daily-section">
          <h2 className="daily-section-title">Nhiệm vụ thưởng nguyên liệu</h2>
          {TASK_TYPE_ORDER.filter((type) => tasksByType[type]?.length).map((type) => {
            const meta = TASK_TYPE_META[type]
            return (
              <div key={type} className="task-group">
                <div className="task-group-head">
                  <div className="task-group-label" style={{ background: meta.accent }}>
                    <span>{meta.emoji}</span> {meta.label}
                  </div>
                  {resetInfo[type] && <span className="task-group-reset">{resetInfo[type]}</span>}
                </div>
                <div className="task-list">
                  {tasksByType[type].map((t) => {
                    const mat = MATERIAL_META[t.rewardMaterial]
                    const target = t.target || 1
                    const prog = Math.min(t.progress ?? 0, target)
                    const pct = Math.round((prog / target) * 100)
                    return (
                      <div key={t.code || t.id} className={`task-row${t.completed ? ' is-done' : ''}${t.claimed ? ' is-claimed' : ''}`}>
                        <span className={`task-ico${t.claimed ? ' is-claimed' : t.completed ? ' is-ready' : ''}`}
                          style={mat && !t.claimed && !t.completed ? { background: mat.bg, color: mat.color } : undefined}>
                          {t.claimed ? '✓' : t.completed ? '✓' : (mat?.emoji || '🎯')}
                        </span>
                        <div className="task-row-main">
                          <div className="task-row-title">
                            {t.description || t.title}
                            {t.completed && <span className="task-check">✓</span>}
                          </div>
                          <div className="task-progress">
                            <div className="task-progress-bar">
                              <div className="task-progress-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="task-progress-text">{prog}/{target}</span>
                          </div>
                        </div>
                        {mat && (
                          t.claimed ? (
                            <div className="task-reward task-reward-claimed" title="Đã nhận thưởng">
                              <span>{mat.emoji}</span>
                              <span className="task-reward-qty">Đã nhận ✓</span>
                            </div>
                          ) : t.completed ? (
                            <button
                              type="button"
                              className="task-claim-btn"
                              disabled={claiming === t.code}
                              onClick={(e) => handleClaim(t, e.currentTarget)}
                              title={`Nhận ${mat.label} ×${t.rewardQty}`}
                            >
                              {claiming === t.code
                                ? <span className="spinner" />
                                : <>Nhận <span>{mat.emoji}</span> ×{t.rewardQty ?? 1}</>}
                            </button>
                          ) : (
                            <div className="task-reward task-reward-locked" style={{ background: mat.bg, color: mat.color }} title={`Phần thưởng: ${mat.label} ×${t.rewardQty}`}>
                              <span>{mat.emoji}</span>
                              <span className="task-reward-qty">×{t.rewardQty ?? 1}</span>
                            </div>
                          )
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </section>
      )}

      {/* ── Lời nhắc kết nối ── */}
      {reminders.length > 0 && (
        <section className="daily-section">
          <h2 className="daily-section-title">Lời nhắc kết nối</h2>
          <div className="reminder-list">
            {reminders.map((r, i) => (
              <div key={r.matchId || r.id || i} className="reminder-item">
                <HeartIcon size={14} />
                <span>{r.message || r.title || r.body}</span>
              </div>
            ))}
          </div>
        </section>
      )}

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
